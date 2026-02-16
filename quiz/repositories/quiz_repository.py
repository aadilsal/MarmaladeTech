from django.db.models import Count, Q

from ..models import Quiz


class QuizRepository:
    def list_quizzes(self, subject=None, chapter=None, difficulty=None, annotate_counts=False, include_questions=False):
        qs = Quiz.objects.select_related('category').order_by('-created_at')

        if subject:
            qs = qs.filter(category__name__iexact=subject)
        if chapter:
            qs = qs.filter(Q(title__icontains=chapter) | Q(description__icontains=chapter))

        if difficulty:
            difficulty = difficulty.lower()
            qs = qs.annotate(question_count=Count('question'))
            if difficulty == 'easy':
                qs = qs.filter(question_count__lte=20)
            elif difficulty == 'medium':
                qs = qs.filter(question_count__gt=20, question_count__lte=50)
            elif difficulty == 'hard':
                qs = qs.filter(question_count__gt=50)

        if annotate_counts and 'question_count' not in qs.query.annotations:
            qs = qs.annotate(question_count=Count('question'))

        if include_questions:
            qs = qs.prefetch_related('question_set__choice_set')

        return qs

    def get_by_id(self, quiz_id):
        return Quiz.objects.filter(id=quiz_id).first()

    def get_with_questions(self, quiz_id):
        return Quiz.objects.select_related('category').prefetch_related('question_set__choice_set').filter(id=quiz_id).first()

    def count_questions(self, quiz):
        return quiz.question_set.count()
