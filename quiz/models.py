from django.db import models
import pandas as pd
from django.contrib.auth.models import User 
from django.db.models import Sum
from django.db.models.signals import post_save
from django.dispatch import receiver


# Create your models here.
class Category(models.Model):
    name=models.CharField(max_length=15)

    class Meta:
        verbose_name_plural='Categories'

    def __str__(self):
        return self.name

class Quiz(models.Model):
    title=models.CharField(max_length=255)
    description=models.TextField()
    category=models.ForeignKey(Category,on_delete=models.CASCADE)
    quiz_file=models.FileField(upload_to='quiz/')
    created_at=models.DateTimeField(auto_now_add=True)
    updated_at=models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name_plural='Quizzes'
    def __str__(self):
        return self.title

    #call function when quiz is saved
    def save(self,*args, **kwargs):
        super().save(*args,**kwargs)
        if self.quiz_file:
            self.import_quiz_from_excel()

    #function to extract excel file 
    def import_quiz_from_excel(self):
    # Read the Excel file
        df = pd.read_excel(self.quiz_file.path)

    # Iterate over each row
        for index, row in df.iterrows():
        # Extract question, choices, and correct answer
            question_text = row['Question']
            img_path = row.get('Image', None)  # None if not provided
            choice1 = row['A']
            choice2 = row['B']
            choice3 = row['C']
            choice4 = row['D']
            correct_answer = row['Answer']
            explanation = row.get('Explanation', '')  # Empty if not provided

        # Create or get the question object
            question_obj, created = Question.objects.get_or_create(
                quiz=self, text=question_text, defaults={'explanation': explanation}
            )
            if img_path and isinstance(img_path,str):
                question_obj.image = img_path
                question_obj.save()

        # Create or get the choice objects
            Choice.objects.get_or_create(question=question_obj, text=choice1, is_correct=correct_answer == 'A')
            Choice.objects.get_or_create(question=question_obj, text=choice2, is_correct=correct_answer == 'B')
            Choice.objects.get_or_create(question=question_obj, text=choice3, is_correct=correct_answer == 'C')
            Choice.objects.get_or_create(question=question_obj, text=choice4, is_correct=correct_answer == 'D')


class Question(models.Model):
    quiz=models.ForeignKey(Quiz,on_delete=models.CASCADE)
    text=models.TextField()
    explanation=models.TextField(blank=True,null=True)
    image=models.ImageField(upload_to='questions/',blank=True,null=True)


    def __str__(self):
        return self.text[:50]

class Choice(models.Model):
    question=models.ForeignKey(Question,on_delete=models.CASCADE)
    text=models.CharField(max_length=255)
    is_correct=models.BooleanField(default=False)


    def _str__(self):
        return f"{self.question.text[:50]},{self.text[:20]}"
    

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
        calculate_leaderbaord()



def calculate_leaderbaord():
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



