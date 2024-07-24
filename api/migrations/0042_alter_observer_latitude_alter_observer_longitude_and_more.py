# Generated by Django 4.0.2 on 2022-06-23 14:50

from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        ('api', '0041_observer'),
    ]

    operations = [
        migrations.AlterField(
            model_name='observer',
            name='latitude',
            field=models.CharField(max_length=50, verbose_name='Latitude'),
        ),
        migrations.AlterField(
            model_name='observer',
            name='longitude',
            field=models.CharField(max_length=50, verbose_name='Longitude'),
        ),
        migrations.AlterField(
            model_name='observer',
            name='name',
            field=models.CharField(max_length=50, verbose_name='Name'),
        ),
        migrations.CreateModel(
            name='Chord',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('name', models.CharField(max_length=50, verbose_name='Name')),
                ('color', models.CharField(max_length=7, verbose_name='Color')),
                ('lightCurve', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to='api.lightcurve')),
                ('observer', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to='api.observer')),
                ('prediction', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to='api.prediction')),
            ],
        ),
    ]