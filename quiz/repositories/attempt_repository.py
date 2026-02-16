from ..models import QuizAttempt, AttemptAnswer


class AttemptRepository:
    def create_attempt(self, user, quiz, total_questions):
        return QuizAttempt.objects.create(
            user=user,
            quiz=quiz,
            total_questions=total_questions,
        )

    def get_by_id(self, attempt_id):
        return QuizAttempt.objects.select_related('quiz', 'quiz__category').filter(id=attempt_id).first()

    def get_for_update(self, attempt_id):
        return QuizAttempt.objects.select_for_update().get(id=attempt_id)

    def save_attempt(self, attempt):
        attempt.save()
        return attempt

    def save_answer(self, attempt, question, choice):
        return AttemptAnswer.objects.update_or_create(
            attempt=attempt,
            question=question,
            defaults={'choice': choice, 'is_correct': choice.is_correct},
        )

    def list_answers(self, attempt):
        return AttemptAnswer.objects.filter(attempt=attempt).select_related('choice')
