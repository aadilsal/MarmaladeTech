from .exceptions import NotFoundError


class QuizManager:
    def __init__(self, quiz_repo, question_repo):
        self.quiz_repo = quiz_repo
        self.question_repo = question_repo

    def list_quizzes(self, subject=None, chapter=None, difficulty=None, for_list=True):
        return self.quiz_repo.list_quizzes(
            subject=subject,
            chapter=chapter,
            difficulty=difficulty,
            annotate_counts=for_list,
            include_questions=not for_list,
        )

    def get_quiz_detail(self, quiz_id):
        quiz = self.quiz_repo.get_with_questions(quiz_id)
        if not quiz:
            raise NotFoundError('Quiz not found')
        return quiz
