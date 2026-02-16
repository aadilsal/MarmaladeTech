from ..models import QuizSubmission


class SubmissionRepository:
    def create_submission(self, user, quiz, score):
        return QuizSubmission.objects.create(user=user, quiz=quiz, score=score)
