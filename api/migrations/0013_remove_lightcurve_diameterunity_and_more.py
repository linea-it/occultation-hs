# Generated by Django 4.0.2 on 2022-04-13 22:22

from django.db import migrations


class Migration(migrations.Migration):

    dependencies = [
        ('api', '0012_lightcurve_name'),
    ]

    operations = [
        migrations.RemoveField(
            model_name='lightcurve',
            name='diameterUnity',
        ),
        migrations.RemoveField(
            model_name='lightcurve',
            name='distanceUnity',
        ),
        migrations.RemoveField(
            model_name='lightcurve',
            name='velocityUnity',
        ),
    ]