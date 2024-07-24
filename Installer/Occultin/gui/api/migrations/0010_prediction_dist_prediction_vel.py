# Generated by Django 4.0.2 on 2022-03-30 19:54

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('api', '0009_prediction_epoch'),
    ]

    operations = [
        migrations.AddField(
            model_name='prediction',
            name='dist',
            field=models.FloatField(default=0, verbose_name='dist'),
        ),
        migrations.AddField(
            model_name='prediction',
            name='vel',
            field=models.FloatField(default=0, verbose_name='vel'),
        ),
    ]
