# Generated by Django 4.0.4 on 2022-05-11 22:01

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('api', '0020_alter_lightcurve_emersiontime_and_more'),
    ]

    operations = [
        migrations.RemoveField(
            model_name='lightcurve',
            name='centralBandpass',
        ),
        migrations.RemoveField(
            model_name='lightcurve',
            name='deltaBandpass',
        ),
        migrations.RemoveField(
            model_name='lightcurve',
            name='emersionError',
        ),
        migrations.RemoveField(
            model_name='lightcurve',
            name='immersionError',
        ),
        migrations.AddField(
            model_name='lightcurve',
            name='deltaT',
            field=models.FloatField(null=True, verbose_name='DeltaT'),
        ),
        migrations.AddField(
            model_name='lightcurve',
            name='dopacity',
            field=models.FloatField(default=0, verbose_name='Dopacity'),
        ),
        migrations.AddField(
            model_name='lightcurve',
            name='fluxMax',
            field=models.FloatField(default=1, verbose_name='FluxMax'),
        ),
        migrations.AddField(
            model_name='lightcurve',
            name='fluxMin',
            field=models.FloatField(default=0, verbose_name='FluxMin'),
        ),
        migrations.AddField(
            model_name='lightcurve',
            name='loop',
            field=models.IntegerField(default=2000, verbose_name='Loop'),
        ),
        migrations.AddField(
            model_name='lightcurve',
            name='opacity',
            field=models.FloatField(default=1, verbose_name='Opacity'),
        ),
        migrations.AddField(
            model_name='lightcurve',
            name='sigma',
            field=models.TextField(null=True, verbose_name='Sigma'),
        ),
        migrations.AddField(
            model_name='lightcurve',
            name='sigmaResult',
            field=models.FloatField(null=True, verbose_name='SigmaResult'),
        ),
    ]