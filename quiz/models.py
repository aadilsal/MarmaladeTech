from django.db import models
import pandas as pd
from django.contrib.auth.models import User 
from django.db.models import Sum
from django.db.models.signals import post_save
from django.dispatch import receiver
from django.core.cache import cache
from django.conf import settings


# Create your models here.
class Category(models.Model):
    name=models.CharField(max_length=15)

    class Meta:
        verbose_name_plural='Categories'

    def __str__(self):
        return self.name

class Quiz(models.Model):
    title=models.CharField(max_length=255)
    description=models.TextField(blank=True)
    category=models.ForeignKey(Category,on_delete=models.CASCADE)
    quiz_file=models.FileField(upload_to='quiz/', blank=True, null=True)
    created_at=models.DateTimeField(auto_now_add=True)
    updated_at=models.DateTimeField(auto_now=True)

    def save(self, *args, **kwargs):
        """Save the quiz and import questions from the uploaded file when present."""
        created = self.pk is None
        super().save(*args, **kwargs)
        # Import only when a file was uploaded
        if self.quiz_file:
            try:
                self.import_quiz_from_file()
            except Exception as e:
                # Re-raise so callers (admin/upload handler) can catch and report
                raise

    def import_quiz_from_file(self):
        """Import questions from an XLSX/XLS or CSV file attached to this quiz."""
        import os
        file_path = self.quiz_file.path
        _, ext = os.path.splitext(file_path)
        ext = ext.lower()

        try:
            if ext in ('.xls', '.xlsx'):
                df = pd.read_excel(file_path)
            elif ext == '.csv':
                df = pd.read_csv(file_path)
            else:
                raise ValueError('Unsupported file type for import')

            for index, row in df.iterrows():
                question_text = row.get('Question') or row.get('question')
                if not question_text or str(question_text).strip() == '':
                    continue

                img_path = row.get('Image') if 'Image' in row else row.get('image') if 'image' in row else None
                choice1 = row.get('A') or row.get('a')
                choice2 = row.get('B') or row.get('b')
                choice3 = row.get('C') or row.get('c')
                choice4 = row.get('D') or row.get('d')
                correct_answer = str(row.get('Answer') or row.get('answer') or '').strip()
                explanation = row.get('Explanation') or row.get('explanation') or ''

                question_obj, created = Question.objects.get_or_create(
                    quiz=self, text=question_text, defaults={'explanation': explanation}
                )

                if img_path and isinstance(img_path, str) and img_path.strip():
                    question_obj.image = img_path
                    question_obj.save()

                # Create or update choices; ensure only one is_correct per question
                existing_choices = list(Choice.objects.filter(question=question_obj).order_by('id'))
                # Create missing choices or update existing ones
                choices_texts = [choice1, choice2, choice3, choice4]
                for i, text in enumerate(choices_texts):
                    if text is None:
                        continue
                    if i < len(existing_choices):
                        c = existing_choices[i]
                        c.text = text
                        c.is_correct = (correct_answer == chr(65 + i))
                        c.save()
                    else:
                        Choice.objects.create(question=question_obj, text=text, is_correct=(correct_answer == chr(65 + i)))

        except Exception:
            # Bubble up exception for the view/admin to report and handle
            raise


class AdminDailyMetric(models.Model):
    date = models.DateField(unique=True)
    total_users = models.IntegerField()
    total_quizzes = models.IntegerField()
    total_questions = models.IntegerField()
    total_submissions = models.IntegerField()
    submissions_today = models.IntegerField()
    avg_score = models.DecimalField(max_digits=8, decimal_places=2, null=True, blank=True)

    class Meta:
        verbose_name = 'Admin Daily Metric'
        verbose_name_plural = 'Admin Daily Metrics'

    def __str__(self):
        return str(self.date)


class Question(models.Model):
    quiz=models.ForeignKey(Quiz,on_delete=models.CASCADE)
    text=models.TextField()
    explanation=models.TextField(blank=True,null=True)
    image=models.ImageField(upload_to='questions/',blank=True,null=True)
    
    # AI-generated explanation fields
    ai_explanation=models.TextField(blank=True,null=True)
    ai_generated_at=models.DateTimeField(blank=True,null=True)
    ai_cost=models.DecimalField(max_digits=10, decimal_places=6, blank=True, null=True)  # Cost in USD
    ai_model=models.CharField(max_length=100, blank=True, null=True)
    ai_error=models.TextField(blank=True, null=True)  # Store error messages if generation fails

    def __str__(self):
        return self.text[:50]
    
    def get_explanation(self):
        """Get the best available explanation, preferring AI-generated if available."""
        if self.ai_explanation:
            return self.ai_explanation
        return self.explanation or ""
    
    def is_ai_generated(self):
        """Check if explanation is AI-generated."""
        return bool(self.ai_explanation)
    
    def generate_ai_explanation(self, force=False):
        """Generate AI explanation using Gemini API."""
        from .services import ExplanationGenerator
        
        if not force and self.ai_explanation:
            return self.ai_explanation
        
        generator = ExplanationGenerator()
        return generator.generate_explanation(self)
    
    def get_cache_key(self):
        """Generate cache key for this question's explanation."""
        return f"question_explanation_{self.id}"


class Choice(models.Model):
    question=models.ForeignKey(Question,on_delete=models.CASCADE)
    text=models.CharField(max_length=255)
    is_correct=models.BooleanField(default=False)


    def __str__(self):
        return f"{self.question.text[:50]},{self.text[:20]}"
    
    def get_choice_letter(self):
        """Get the choice letter (A, B, C, D) based on position."""
        choices = list(self.question.choice_set.order_by('id'))
        try:
            index = choices.index(self)
            return chr(65 + index)  # 65 is ASCII for 'A'
        except ValueError:
            return "?"
    

class QuizSubmission(models.Model):
    user=models.ForeignKey(User,on_delete=models.CASCADE)
    quiz=models.ForeignKey(Quiz,on_delete=models.CASCADE)
    score=models.IntegerField()
    submitted_at=models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.user},{self.quiz.title}"


class UserRank(models.Model):
    user=models.OneToOneField(User,on_delete=models.CASCADE)
    rank=models.IntegerField(null=True,blank=True)
    total_score=models.IntegerField(null=True,blank=True)

    def __str__(self):
        return f"{self.rank},{self.user.username}"
    
@receiver(post_save,sender=QuizSubmission)
def update_leaderboard(sender,instance,created,**kwargs):
    if created:
        calculate_leaderboard()



def calculate_leaderboard():
    # count sum of scores of all users
    user_scores= (QuizSubmission.objects.values('user').annotate(total_score=Sum('score')).order_by('-total_score'))

    #update reank based on sorted list
    rank=1
    for entry in user_scores:
        user_id=entry['user']
        total_score=entry['total_score']

        user_rank,created=UserRank.objects.get_or_create(user_id=user_id)
        user_rank.rank=rank
        user_rank.total_score=total_score

        user_rank.save()


        rank+=1



