from django.db import migrations, models
import django.db.models.deletion
from django.conf import settings


class Migration(migrations.Migration):

    dependencies = [
        ('quiz', '0009_alter_admindailymetric_options_and_more'),
    ]

    operations = [
        migrations.CreateModel(
            name='QuizAttempt',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('status', models.CharField(choices=[('IN_PROGRESS', 'In Progress'), ('SUBMITTED', 'Submitted')], default='IN_PROGRESS', max_length=20)),
                ('started_at', models.DateTimeField(auto_now_add=True)),
                ('submitted_at', models.DateTimeField(blank=True, null=True)),
                ('score', models.IntegerField(blank=True, null=True)),
                ('total_questions', models.IntegerField(blank=True, null=True)),
                ('time_taken_seconds', models.IntegerField(blank=True, null=True)),
                ('updated_at', models.DateTimeField(auto_now=True)),
                ('quiz', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='attempts', to='quiz.quiz')),
                ('user', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='quiz_attempts', to=settings.AUTH_USER_MODEL)),
            ],
        ),
        migrations.CreateModel(
            name='AttemptAnswer',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('is_correct', models.BooleanField(default=False)),
                ('answered_at', models.DateTimeField(auto_now=True)),
                ('attempt', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='answers', to='quiz.quizattempt')),
                ('choice', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to='quiz.choice')),
                ('question', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to='quiz.question')),
            ],
            options={
                'unique_together': {('attempt', 'question')},
            },
        ),
        migrations.AddIndex(
            model_name='quizattempt',
            index=models.Index(fields=['user', 'status'], name='quiz_quizat_user_id_4a6a8c_idx'),
        ),
        migrations.AddIndex(
            model_name='quizattempt',
            index=models.Index(fields=['user', 'quiz'], name='quiz_quizat_user_id_7c5128_idx'),
        ),
        migrations.AddIndex(
            model_name='quizattempt',
            index=models.Index(fields=['submitted_at'], name='quiz_quizat_submitt_b6ff0e_idx'),
        ),
        migrations.AddIndex(
            model_name='attemptanswer',
            index=models.Index(fields=['attempt', 'question'], name='quiz_attempt_attempt_1a1f68_idx'),
        ),
    ]
