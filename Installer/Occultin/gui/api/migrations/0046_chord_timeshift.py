# Generated by Django 4.0.4 on 2022-07-01 18:09

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('api', '0045_alter_ellipse_allellipses_alter_ellipse_dcenterf_and_more'),
    ]

    operations = [
        migrations.AddField(
            model_name='chord',
            name='timeShift',
            field=models.FloatField(null=True, verbose_name='Time Shift'),
        ),
    ]