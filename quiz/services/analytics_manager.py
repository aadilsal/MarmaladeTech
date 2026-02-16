from django.conf import settings
from django.core.cache import cache
from django.db.models import Sum, Avg, Count
from django.db.models.functions import TruncDate
from django.contrib.auth import get_user_model

from ..models import QuizAttempt, Quiz, Question
from .score_calculator import ScoreCalculator


class AnalyticsManager:
    def __init__(self, score_calculator=None):
        self.score_calculator = score_calculator or ScoreCalculator()
        self.cache_ttl = getattr(settings, 'ANALYTICS_CACHE_TTL', 60)
        self.admin_cache_ttl = getattr(settings, 'ADMIN_ANALYTICS_CACHE_TTL', 300)

    def _cache_key(self, base, user_id=None, suffix=None):
        parts = ["analytics", base]
        if user_id is not None:
            parts.append(str(user_id))
        if suffix:
            parts.append(str(suffix))
        return ":".join(parts)

    def _cache_get_or_set(self, key, ttl, compute_fn):
        cached = cache.get(key)
        if cached is not None:
            return cached
        data = compute_fn()
        cache.set(key, data, ttl)
        return data

    def dashboard_summary(self, user):
        cache_key = self._cache_key("dashboard", user_id=user.id)
        def compute():
            attempts = QuizAttempt.objects.filter(user=user, status='SUBMITTED').select_related('quiz')
            totals = attempts.aggregate(total_score=Sum('score'), total_questions=Sum('total_questions'))
            total_score = totals.get('total_score') or 0
            total_questions = totals.get('total_questions') or 0
            accuracy = self.score_calculator.calculate_accuracy(total_score, total_questions)

            last_attempt = attempts.order_by('-submitted_at').first()
            return {
                'total_attempts': attempts.count(),
                'total_questions': total_questions,
                'total_score': total_score,
                'accuracy': accuracy,
                'last_attempt': {
                    'attempt_id': last_attempt.id,
                    'quiz_id': last_attempt.quiz_id,
                    'quiz_title': last_attempt.quiz.title,
                    'score': last_attempt.score,
                    'total_questions': last_attempt.total_questions,
                    'submitted_at': last_attempt.submitted_at,
                } if last_attempt else None,
            }

        return self._cache_get_or_set(cache_key, self.cache_ttl, compute)

    def recent_attempts(self, user, limit=5):
        cache_key = self._cache_key("recent", user_id=user.id, suffix=limit)
        def compute():
            attempts = (
                QuizAttempt.objects.filter(user=user, status='SUBMITTED')
                .select_related('quiz')
                .order_by('-submitted_at')[:limit]
            )
            return [
                {
                    'attempt_id': attempt.id,
                    'quiz_id': attempt.quiz_id,
                    'quiz_title': attempt.quiz.title,
                    'score': attempt.score,
                    'total_questions': attempt.total_questions,
                    'submitted_at': attempt.submitted_at,
                }
                for attempt in attempts
            ]

        return self._cache_get_or_set(cache_key, self.cache_ttl, compute)

    def subject_performance(self, user):
        cache_key = self._cache_key("subject", user_id=user.id)
        def compute():
            attempts = QuizAttempt.objects.filter(user=user, status='SUBMITTED').select_related('quiz__category')
            summary = {}
            for attempt in attempts:
                subject = str(attempt.quiz.category)
                summary.setdefault(subject, {'subject': subject, 'correct': 0, 'total': 0})
                summary[subject]['correct'] += attempt.score or 0
                summary[subject]['total'] += attempt.total_questions or 0

            return [
                {
                    'subject': item['subject'],
                    'correct': item['correct'],
                    'total': item['total'],
                    'accuracy': self.score_calculator.calculate_accuracy(item['correct'], item['total']),
                }
                for item in summary.values()
            ]

        return self._cache_get_or_set(cache_key, self.cache_ttl, compute)

    def progress_trend(self, user):
        cache_key = self._cache_key("trend", user_id=user.id)
        def compute():
            attempts = (
                QuizAttempt.objects.filter(user=user, status='SUBMITTED', submitted_at__isnull=False)
                .annotate(day=TruncDate('submitted_at'))
                .values('day')
                .annotate(total_score=Sum('score'), total_questions=Sum('total_questions'))
                .order_by('day')
            )

            return [
                {
                    'date': str(row['day']),
                    'correct': row['total_score'] or 0,
                    'total': row['total_questions'] or 0,
                    'accuracy': self.score_calculator.calculate_accuracy(row['total_score'] or 0, row['total_questions'] or 0),
                }
                for row in attempts
            ]

        return self._cache_get_or_set(cache_key, self.cache_ttl, compute)

    def admin_summary(self):
        cache_key = self._cache_key("admin-summary")
        def compute():
            User = get_user_model()
            attempts = QuizAttempt.objects.filter(status='SUBMITTED')
            totals = attempts.aggregate(
                total_score=Sum('score'),
                total_questions=Sum('total_questions'),
                avg_score=Avg('score'),
            )
            return {
                'total_users': User.objects.count(),
                'total_quizzes': Quiz.objects.count(),
                'total_questions': Question.objects.count(),
                'total_attempts': attempts.count(),
                'total_score': totals.get('total_score') or 0,
                'total_questions_answered': totals.get('total_questions') or 0,
                'average_score': float(totals.get('avg_score') or 0),
            }

        return self._cache_get_or_set(cache_key, self.admin_cache_ttl, compute)

    def admin_subject_performance(self):
        cache_key = self._cache_key("admin-subject")
        def compute():
            attempts = QuizAttempt.objects.filter(status='SUBMITTED').select_related('quiz__category')
            summary = {}
            for attempt in attempts:
                subject = str(attempt.quiz.category)
                summary.setdefault(subject, {'subject': subject, 'correct': 0, 'total': 0})
                summary[subject]['correct'] += attempt.score or 0
                summary[subject]['total'] += attempt.total_questions or 0
            return [
                {
                    'subject': item['subject'],
                    'correct': item['correct'],
                    'total': item['total'],
                    'accuracy': self.score_calculator.calculate_accuracy(item['correct'], item['total']),
                }
                for item in summary.values()
            ]

        return self._cache_get_or_set(cache_key, self.admin_cache_ttl, compute)

    def admin_progress_trend(self):
        cache_key = self._cache_key("admin-trend")
        def compute():
            attempts = (
                QuizAttempt.objects.filter(status='SUBMITTED', submitted_at__isnull=False)
                .annotate(day=TruncDate('submitted_at'))
                .values('day')
                .annotate(total_score=Sum('score'), total_questions=Sum('total_questions'), total_attempts=Count('id'))
                .order_by('day')
            )
            return [
                {
                    'date': str(row['day']),
                    'correct': row['total_score'] or 0,
                    'total': row['total_questions'] or 0,
                    'attempts': row['total_attempts'] or 0,
                    'accuracy': self.score_calculator.calculate_accuracy(row['total_score'] or 0, row['total_questions'] or 0),
                }
                for row in attempts
            ]

        return self._cache_get_or_set(cache_key, self.admin_cache_ttl, compute)
