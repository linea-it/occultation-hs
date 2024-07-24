# Generated by Django 4.0.4 on 2022-07-18 22:57

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('api', '0051_ellipse_legendlocation_ellipse_maxx_ellipse_maxy_and_more'),
    ]

    operations = [
        migrations.RemoveField(
            model_name='lightcurve',
            name='taskId',
        ),
        migrations.RemoveField(
            model_name='prediction',
            name='taskId',
        ),
        migrations.AddField(
            model_name='job',
            name='modelId',
            field=models.IntegerField(default=0, verbose_name='Model Id'),
            preserve_default=False,
        ),
        migrations.AlterField(
            model_name='job',
            name='status',
            field=models.CharField(choices=[('waiting', 'Waiting'), ('running', 'Running'), ('success', 'Success'), ('error', 'Error'), ('canceled', 'Canceled')], default='waiting', max_length=8, verbose_name='Status'),
        ),
    ]
