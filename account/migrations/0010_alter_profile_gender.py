# Generated by Django 5.1.2 on 2024-10-25 16:36

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('account', '0009_alter_profile_gender'),
    ]

    operations = [
        migrations.AlterField(
            model_name='profile',
            name='gender',
            field=models.CharField(blank=True, choices=[('Female', 'Female'), ('Male', 'Male'), ('Other', 'Other')], max_length=6, null=True),
        ),
    ]