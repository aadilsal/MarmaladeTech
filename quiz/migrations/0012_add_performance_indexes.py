# Manual migration to add performance indexes

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('quiz', '0011_explanationtask_and_more'),
    ]

    operations = [
        # Add index on QuizSubmission for user (for aggregations/leaderboard)
        migrations.AddIndex(
            model_name='quizsubmission',
            index=models.Index(fields=['user'], name='quiz_sub_user_perf_idx'),
        ),
        
        # Add index on QuizSubmission for user + submitted_at (for dashboard queries)
        migrations.AddIndex(
            model_name='quizsubmission',
            index=models.Index(fields=['user', '-submitted_at'], name='quiz_sub_user_time_perf_idx'),
        ),
        
        # Add index on UserRank for total_score (for leaderboard sorting)
        migrations.AddIndex(
            model_name='userrank',
            index=models.Index(fields=['-total_score'], name='userrank_score_perf_idx'),
        ),
        
        # Add index on UserRank for rank (for lookups)
        migrations.AddIndex(
            model_name='userrank',
            index=models.Index(fields=['rank'], name='userrank_rank_perf_idx'),
        ),
    ]
