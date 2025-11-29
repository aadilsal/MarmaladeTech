from django.core.cache import cache
from django.db.models import Count, Avg, Sum, Q
from django.utils import timezone
from datetime import timedelta
from quiz.models import Quiz, Question, QuizSubmission, Category
from account.models import Profile
from django.contrib.auth.models import User
from .models import AdminActionLog


def get_dashboard_stats():
    """Get cached dashboard statistics"""
    cache_key = 'admin_dashboard_stats'
    stats = cache.get(cache_key)

    if stats is None:
        # Calculate statistics
        now = timezone.now()
        last_7_days = now - timedelta(days=7)
        last_30_days = now - timedelta(days=30)

        stats = {
            'total_users': User.objects.count(),
            'active_users_7d': User.objects.filter(last_login__gte=last_7_days).count(),
            'total_questions': Question.objects.count(),
            'total_quizzes': Quiz.objects.count(),
            'total_attempts': QuizSubmission.objects.count(),
            'avg_score': QuizSubmission.objects.aggregate(avg=Avg('score'))['avg'] or 0,
            'most_popular_quiz': Quiz.objects.annotate(
                attempt_count=Count('quizsubmission')
            ).order_by('-attempt_count').first(),
            'most_difficult_question': Question.objects.annotate(
                attempt_count=Count('choice__quizsubmission'),
                correct_count=Count('choice__quizsubmission', filter=Q(choice__is_correct=True))
            ).filter(attempt_count__gt=0).annotate(
                correct_percentage=100.0 * Sum('correct_count') / Sum('attempt_count')
            ).order_by('correct_percentage').first(),
            'user_growth_30d': User.objects.filter(date_joined__gte=last_30_days).count(),
            'recent_registrations': User.objects.order_by('-date_joined')[:5],
            'recent_attempts': QuizSubmission.objects.select_related('user', 'quiz').order_by('-submitted_at')[:5],
            'recent_questions': Question.objects.order_by('-id')[:5],
        }

        # Cache for 5 minutes
        cache.set(cache_key, stats, 300)

    return stats


def log_admin_action(user, action, obj, description, request=None):
    """Log admin actions for audit purposes"""
    from django.contrib.contenttypes.models import ContentType

    content_type = ContentType.objects.get_for_model(obj)

    log_entry = AdminActionLog.objects.create(
        user=user,
        action=action,
        content_type=content_type,
        object_id=obj.pk,
        description=description,
        ip_address=get_client_ip(request) if request else None,
        user_agent=request.META.get('HTTP_USER_AGENT') if request else None
    )

    return log_entry


def get_client_ip(request):
    """Get client IP address from request"""
    x_forwarded_for = request.META.get('HTTP_X_FORWARDED_FOR')
    if x_forwarded_for:
        ip = x_forwarded_for.split(',')[0]
    else:
        ip = request.META.get('REMOTE_ADDR')
    return ip


def calculate_user_performance(user):
    """Calculate detailed user performance metrics"""
    submissions = QuizSubmission.objects.filter(user=user)

    if not submissions.exists():
        return {
            'total_quizzes': 0,
            'avg_score': 0,
            'total_score': 0,
            'best_score': 0,
            'worst_score': 0,
            'pass_rate': 0,
        }

    total_quizzes = submissions.count()
    avg_score = submissions.aggregate(avg=Avg('score'))['avg']
    total_score = submissions.aggregate(sum=Sum('score'))['sum']
    best_score = submissions.order_by('-score').first().score
    worst_score = submissions.order_by('score').first().score

    # Assuming passing score is 50%
    passed_quizzes = submissions.filter(score__gte=50).count()
    pass_rate = (passed_quizzes / total_quizzes) * 100 if total_quizzes > 0 else 0

    return {
        'total_quizzes': total_quizzes,
        'avg_score': round(avg_score, 2),
        'total_score': total_score,
        'best_score': best_score,
        'worst_score': worst_score,
        'pass_rate': round(pass_rate, 2),
    }


def get_topic_analytics():
    """Get analytics data for topics/categories"""
    topics = Category.objects.annotate(
        question_count=Count('quiz__question'),
        quiz_count=Count('quiz'),
        attempt_count=Count('quiz__quizsubmission'),
        avg_score=Avg('quiz__quizsubmission__score')
    ).order_by('-attempt_count')

    return topics


def get_quiz_analytics():
    """Get detailed quiz analytics"""
    quizzes = Quiz.objects.annotate(
        attempt_count=Count('quizsubmission'),
        avg_score=Avg('quizsubmission__score'),
        question_count=Count('question'),
        pass_rate=Count('quizsubmission', filter=Q(quizsubmission__score__gte=50)) * 100.0 / Count('quizsubmission')
    ).order_by('-attempt_count')

    return quizzes


def export_data_to_csv(queryset, fields):
    """Export queryset data to CSV format"""
    import csv
    from io import StringIO

    output = StringIO()
    writer = csv.writer(output)

    # Write headers
    writer.writerow(fields)

    # Write data
    for obj in queryset:
        row = []
        for field in fields:
            value = getattr(obj, field, '')
            if callable(value):
                value = value()
            row.append(str(value))
        writer.writerow(row)

    return output.getvalue()