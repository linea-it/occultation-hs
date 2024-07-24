# Generated by Django 4.0.2 on 2022-04-20 12:51

from django.db import migrations


class Migration(migrations.Migration):

    dependencies = [
        ('api', '0015_lightcurve_centralbandpass_lightcurve_deltabandpass_and_more'),
    ]

    operations = [
        migrations.RenameField(
            model_name='lightcurve',
            old_name='CentralBandpass',
            new_name='centralBandpass',
        ),
        migrations.RenameField(
            model_name='lightcurve',
            old_name='DeltaBandpass',
            new_name='deltaBandpass',
        ),
        migrations.RenameField(
            model_name='lightcurve',
            old_name='Detection',
            new_name='detection',
        ),
        migrations.RenameField(
            model_name='lightcurve',
            old_name='EmersionError',
            new_name='emersionError',
        ),
        migrations.RenameField(
            model_name='lightcurve',
            old_name='EmersionTime',
            new_name='emersionTime',
        ),
        migrations.RenameField(
            model_name='lightcurve',
            old_name='EndTime',
            new_name='endTime',
        ),
        migrations.RenameField(
            model_name='lightcurve',
            old_name='ExposureTime',
            new_name='exposureTime',
        ),
        migrations.RenameField(
            model_name='lightcurve',
            old_name='ImmersionError',
            new_name='immersionError',
        ),
        migrations.RenameField(
            model_name='lightcurve',
            old_name='ImmersionTime',
            new_name='immersionTime',
        ),
        migrations.RenameField(
            model_name='lightcurve',
            old_name='InitialTime',
            new_name='initialTime',
        ),
        migrations.RenameField(
            model_name='lightcurve',
            old_name='TimeRef',
            new_name='timeRef',
        ),
    ]