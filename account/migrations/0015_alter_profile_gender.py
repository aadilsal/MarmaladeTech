# Generated by Django 5.1.2 on 2024-11-10 10:08

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('account', '0014_alter_profile_gender'),
    ]

    operations = [
        migrations.AlterField(
            model_name='profile',
            name='gender',
            field=models.CharField(blank=True, choices=[('Other', 'Other'), ('Male', 'Male'), ('Female', 'Female')], max_length=6, null=True),
        ),
    ]
