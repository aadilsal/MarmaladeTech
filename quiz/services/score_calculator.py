from .exceptions import ValidationError


class ScoreCalculator:
    def calculate_correct(self, answers):
        return sum(1 for answer in answers if answer.choice.is_correct)

    def calculate_accuracy(self, correct, total):
        if not total:
            return 0
        return round((correct / total) * 100, 2)

    def validate_quiz_integrity(self, questions):
        for question in questions:
            correct_count = question.choice_set.filter(is_correct=True).count()
            if correct_count != 1:
                raise ValidationError(
                    f"Question {question.id} must have exactly one correct choice."
                )

    def validate_answers(self, answers, total_questions):
        if total_questions is None:
            raise ValidationError("Total questions is required for scoring.")
        if answers.count() > total_questions:
            raise ValidationError("Answer count exceeds total questions.")

    def evaluate(self, answers, total_questions):
        self.validate_answers(answers, total_questions)
        correct = self.calculate_correct(answers)
        incorrect = max(total_questions - correct, 0)
        accuracy = self.calculate_accuracy(correct, total_questions)
        return {
            'correct': correct,
            'incorrect': incorrect,
            'accuracy': accuracy,
        }
