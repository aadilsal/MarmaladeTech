# Generated by Django 5.1.2 on 2024-11-13 17:09

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('account', '0016_alter_profile_gender'),
    ]

    operations = [
        migrations.AlterField(
            model_name='profile',
            name='gender',
            field=models.CharField(blank=True, choices=[('Male', 'Male'), ('Female', 'Female'), ('Other', 'Other')], max_length=6, null=True),
        ),
    ]
