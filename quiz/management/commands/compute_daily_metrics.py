from django.core.management.base import BaseCommand
from django.utils import timezone
from quiz.models import AdminDailyMetric, Quiz, Question, QuizSubmission
from django.contrib.auth import get_user_model
from django.db.models import Avg

User = get_user_model()

class Command(BaseCommand):
    help = 'Compute and persist daily admin metrics'

    def handle(self, *args, **options):
        today = timezone.now().date()

        total_users = User.objects.count()
        total_quizzes = Quiz.objects.count()
        total_questions = Question.objects.count()
        total_submissions = QuizSubmission.objects.count()
        submissions_today = QuizSubmission.objects.filter(submitted_at__date=today).count()

        avg_score = None
        if total_submissions > 0:
            avg_score = QuizSubmission.objects.aggregate(avg=Avg('score'))['avg']

        metric, created = AdminDailyMetric.objects.update_or_create(
            date=today,
            defaults={
                'total_users': total_users,
                'total_quizzes': total_quizzes,
                'total_questions': total_questions,
                'total_submissions': total_submissions,
                'submissions_today': submissions_today,
                'avg_score': avg_score or None,
            }
        )

        self.stdout.write(self.style.SUCCESS(f"Saved daily metric for {today}"))