# Generated by Django 4.0.2 on 2022-05-31 20:38

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('api', '0031_alter_job_status_alter_prediction_status'),
    ]

    operations = [
        migrations.AlterField(
            model_name='lightcurve',
            name='endTime',
            field=models.FloatField(null=True, verbose_name='EndTime'),
        ),
        migrations.AlterField(
            model_name='lightcurve',
            name='initialTime',
            field=models.FloatField(null=True, verbose_name='InitialTime'),
        ),
    ]
