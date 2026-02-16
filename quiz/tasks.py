from celery import shared_task
from django.utils import timezone
from django.db import transaction
from django.db.models import Sum
import logging

logger = logging.getLogger(__name__)

@shared_task(bind=True, autoretry_for=(Exception,), retry_backoff=True, max_retries=3)
def generate_explanation_task(self, question_id, user_id=None):
    """Celery task to generate AI explanation for a question and record progress in ExplanationTask."""
    try:
        from .models import Question, ExplanationTask
        from .services import ExplanationGenerator
        from django.contrib.auth import get_user_model

        User = get_user_model()
        question = Question.objects.get(id=question_id)

        # Attempt to get or create the ExplanationTask record (use worker task id)
        task_record, _ = ExplanationTask.objects.get_or_create(
            task_id=self.request.id,
            defaults={
                'question': question,
                'user': User.objects.filter(id=user_id).first() if user_id else None,
                'status': 'RUNNING'
            }
        )
        # Ensure status is RUNNING
        task_record.status = 'RUNNING'
        task_record.save()

        generator = ExplanationGenerator()
        explanation = generator.generate_explanation(question)

        if explanation:
            task_record.status = 'SUCCESS'
            task_record.success = True
            task_record.result = {'explanation': explanation}
            task_record.cost = question.ai_cost
            task_record.generated_at = question.ai_generated_at
            task_record.save()
            return {
                'question_id': question_id,
                'success': True,
                'generated_at': question.ai_generated_at.isoformat() if question.ai_generated_at else None,
                'cost': float(question.ai_cost) if question.ai_cost else None,
            }
        else:
            task_record.status = 'FAILURE'
            task_record.success = False
            task_record.error = question.ai_error or 'Unknown error'
            task_record.save()
            return {'question_id': question_id, 'success': False, 'error': question.ai_error or 'Failed to generate explanation'}

    except Exception as e:
        logger.exception(f"Error in generate_explanation_task for question {question_id}: {e}")
        # Update task record if available
        try:
            from .models import ExplanationTask
            task = ExplanationTask.objects.filter(task_id=self.request.id).first()
            if task:
                task.status = 'FAILURE'
                task.success = False
                task.error = str(e)
                task.save()
        except Exception:
            logger.exception('Failed to update ExplanationTask record after exception')

        raise


@shared_task(bind=True)
def regenerate_explanation_task(self, question_id):
    """Celery task to force-regenerate AI explanation for a question."""
    try:
        from .models import Question, ExplanationTask
        from .services import ExplanationGenerator

        question = Question.objects.get(id=question_id)
        generator = ExplanationGenerator()
        explanation = generator.regenerate_explanation(question)

        # Update task record if present
        if getattr(self, 'request', None):
            task = ExplanationTask.objects.filter(task_id=self.request.id).first()
            if task:
                task.status = 'SUCCESS' if explanation else 'FAILURE'
                task.success = bool(explanation)
                task.result = {'explanation': explanation} if explanation else None
                task.cost = question.ai_cost
                task.generated_at = question.ai_generated_at
                task.save()

        return {
            'question_id': question_id,
            'success': bool(explanation),
            'generated_at': question.ai_generated_at.isoformat() if question.ai_generated_at else None,
            'cost': float(question.ai_cost) if question.ai_cost else None,
        }
    except Exception as e:
        logger.exception(f"Error in regenerate_explanation_task for question {question_id}: {e}")
        # Try to record failure
        try:
            from .models import ExplanationTask
            task = ExplanationTask.objects.filter(task_id=self.request.id).first()
            if task:
                task.status = 'FAILURE'
                task.success = False
                task.error = str(e)
                task.save()
        except Exception:
            logger.exception('Failed to update ExplanationTask record after exception')
        raise


@shared_task(bind=True, autoretry_for=(Exception,), retry_backoff=True, max_retries=3)
def update_leaderboard_async(self, user_id):
    """
    Async task to update leaderboard incrementally for a single user.
    Avoids O(n²) recalculation by only updating affected user's rank.
    """
    try:
        from .models import QuizSubmission, UserRank
        from django.contrib.auth import get_user_model
        
        User = get_user_model()
        
        # Get user's total score
        user_score_agg = QuizSubmission.objects.filter(user_id=user_id).aggregate(
            total_score=Sum('score')
        )
        total_score = user_score_agg['total_score'] or 0
        
        # Get rank: count users with higher scores
        rank = QuizSubmission.objects.values('user_id').distinct().annotate(
            total=Sum('score')
        ).filter(total__gt=total_score).count() + 1
        
        # Update or create user rank
        user_rank, _ = UserRank.objects.get_or_create(user_id=user_id)
        user_rank.rank = rank
        user_rank.total_score = total_score
        user_rank.save()
        
        logger.info(f"Updated leaderboard for user {user_id}: rank={rank}, score={total_score}")
        return {'user_id': user_id, 'rank': rank, 'total_score': total_score}
        
    except Exception as e:
        logger.exception(f"Error updating leaderboard for user {user_id}: {e}")
        raise
        return {'question_id': question_id, 'success': False, 'error': str(e)}
