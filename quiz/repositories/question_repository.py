from ..models import Question, Choice


class QuestionRepository:
    def list_for_quiz(self, quiz, include_choices=False):
        qs = Question.objects.filter(quiz=quiz)
        if include_choices:
            qs = qs.prefetch_related('choice_set')
        return qs

    def get_for_quiz(self, quiz, question_id):
        return Question.objects.filter(id=question_id, quiz=quiz).first()

    def get_choice(self, question, choice_id):
        return Choice.objects.filter(id=choice_id, question=question).first()
