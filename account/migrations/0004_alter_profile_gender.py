# Generated by Django 5.1.2 on 2024-10-21 16:27

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('account', '0003_profile_email_address_alter_profile_gender'),
    ]

    operations = [
        migrations.AlterField(
            model_name='profile',
            name='gender',
            field=models.CharField(blank=True, choices=[('Female', 'Female'), ('Other', 'Other'), ('Male', 'Male')], max_length=6, null=True),
        ),
    ]
