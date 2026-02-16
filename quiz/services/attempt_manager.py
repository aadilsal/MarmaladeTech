from django.db import transaction
from django.utils import timezone

from .exceptions import ConflictError, NotFoundError, PermissionError


class AttemptManager:
    def __init__(self, attempt_repo, question_repo, quiz_repo, submission_repo, score_calculator):
        self.attempt_repo = attempt_repo
        self.question_repo = question_repo
        self.quiz_repo = quiz_repo
        self.submission_repo = submission_repo
        self.score_calculator = score_calculator

    def get_attempt_for_user(self, attempt_id, user):
        attempt = self.attempt_repo.get_by_id(attempt_id)
        if not attempt:
            raise NotFoundError('Attempt not found')
        if not user.is_staff and attempt.user_id != user.id:
            raise PermissionError('You do not have permission to access this attempt.')
        return attempt

    def start_attempt(self, user, quiz):
        total_questions = self.quiz_repo.count_questions(quiz)
        return self.attempt_repo.create_attempt(user=user, quiz=quiz, total_questions=total_questions)

    def get_questions(self, attempt):
        return self.question_repo.list_for_quiz(attempt.quiz, include_choices=True)

    def save_answer(self, attempt, question, choice):
        self.attempt_repo.save_answer(attempt, question, choice)

    def submit_attempt(self, attempt_id, user, time_taken_seconds=None):
        attempt = self.get_attempt_for_user(attempt_id, user)

        if attempt.status == 'SUBMITTED':
            raise ConflictError('Attempt already submitted')

        with transaction.atomic():
            locked_attempt = self.attempt_repo.get_for_update(attempt.id)
            if locked_attempt.status == 'SUBMITTED':
                raise ConflictError('Attempt already submitted')

            questions = self.question_repo.list_for_quiz(locked_attempt.quiz, include_choices=True)
            self.score_calculator.validate_quiz_integrity(questions)

            answers = self.attempt_repo.list_answers(locked_attempt)
            total_questions = locked_attempt.total_questions or self.quiz_repo.count_questions(locked_attempt.quiz)
            score = self.score_calculator.evaluate(answers, total_questions)

            locked_attempt.status = 'SUBMITTED'
            locked_attempt.submitted_at = timezone.now()
            locked_attempt.score = score['correct']
            locked_attempt.total_questions = total_questions

            if time_taken_seconds is not None:
                try:
                    locked_attempt.time_taken_seconds = int(time_taken_seconds)
                except (TypeError, ValueError):
                    pass

            self.attempt_repo.save_attempt(locked_attempt)
            self.submission_repo.create_submission(
                user=locked_attempt.user,
                quiz=locked_attempt.quiz,
                score=score['correct'],
            )

            from quiz.tasks import update_leaderboard_async
            transaction.on_commit(lambda: update_leaderboard_async.delay(locked_attempt.user_id))

        return {
            'attempt_id': locked_attempt.id,
            'quiz_id': locked_attempt.quiz_id,
            'score': locked_attempt.score,
            'total_questions': locked_attempt.total_questions,
            'submitted_at': locked_attempt.submitted_at,
        }

    def get_results(self, attempt):
        if attempt.status != 'SUBMITTED':
            raise PermissionError('Attempt not submitted')
        total_questions = attempt.total_questions or self.quiz_repo.count_questions(attempt.quiz)
        accuracy = self.score_calculator.calculate_accuracy(attempt.score, total_questions)
        return {
            'attempt_id': attempt.id,
            'quiz_id': attempt.quiz_id,
            'quiz_title': attempt.quiz.title,
            'category': str(attempt.quiz.category),
            'score': attempt.score,
            'total_questions': total_questions,
            'accuracy': accuracy,
            'submitted_at': attempt.submitted_at,
            'time_taken_seconds': attempt.time_taken_seconds,
        }

    def get_review_payload(self, attempt):
        if attempt.status != 'SUBMITTED':
            raise PermissionError('Attempt not submitted')

        questions = self.question_repo.list_for_quiz(attempt.quiz, include_choices=True)
        answers = self.attempt_repo.list_answers(attempt)
        answer_map = {a.question_id: a.choice_id for a in answers}

        payload = []
        for question in questions:
            correct_choice = question.choice_set.filter(is_correct=True).first()
            payload.append({
                'id': question.id,
                'text': question.text,
                'image': question.image.url if question.image else None,
                'choices': list(question.choice_set.all()),
                'selected_choice_id': answer_map.get(question.id),
                'correct_choice_id': correct_choice.id if correct_choice else None,
                'explanation': question.explanation,
                'ai_explanation': question.ai_explanation,
                'ai_generated_at': question.ai_generated_at,
                'ai_cost': question.ai_cost,
                'ai_model': question.ai_model,
                'ai_error': question.ai_error,
            })

        return payload

    def get_analysis(self, attempt):
        if attempt.status != 'SUBMITTED':
            raise PermissionError('Attempt not submitted')

        answers = self.attempt_repo.list_answers(attempt)
        total = attempt.total_questions or self.quiz_repo.count_questions(attempt.quiz)
        score = self.score_calculator.evaluate(answers, total)

        return {
            'attempt_id': attempt.id,
            'quiz_id': attempt.quiz_id,
            'correct': score['correct'],
            'incorrect': score['incorrect'],
            'total_questions': total,
            'accuracy': score['accuracy'],
        }
