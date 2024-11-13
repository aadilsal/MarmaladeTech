# Generated by Django 5.1.2 on 2024-10-21 16:23

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('account', '0002_remove_profile_email_address_alter_profile_gender_and_more'),
    ]

    operations = [
        migrations.AddField(
            model_name='profile',
            name='email_address',
            field=models.CharField(max_length=55, null=True, unique=True, verbose_name='Email Address'),
        ),
        migrations.AlterField(
            model_name='profile',
            name='gender',
            field=models.CharField(blank=True, choices=[('Female', 'Female'), ('Male', 'Male'), ('Other', 'Other')], max_length=6, null=True),
        ),
    ]
