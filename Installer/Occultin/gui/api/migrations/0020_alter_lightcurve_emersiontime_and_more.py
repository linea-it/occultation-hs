# Generated by Django 4.0.4 on 2022-05-03 20:27

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('api', '0019_lightcurve_taskguidtask_and_more'),
    ]

    operations = [
        migrations.AlterField(
            model_name='lightcurve',
            name='emersionTime',
            field=models.FloatField(null=True, verbose_name='EmersionTime'),
        ),
        migrations.AlterField(
            model_name='lightcurve',
            name='immersionTime',
            field=models.FloatField(null=True, verbose_name='ImmersionTime'),
        ),
    ]
