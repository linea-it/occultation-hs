# Generated by Django 4.0.2 on 2022-06-14 20:25

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('api', '0036_remove_star_vanbelletype_star_startype'),
    ]

    operations = [
        migrations.AddField(
            model_name='lightcurve',
            name='file1Result',
            field=models.TextField(default=None, null=True, verbose_name='file1Result'),
        ),
        migrations.AddField(
            model_name='lightcurve',
            name='file2Result',
            field=models.TextField(default=None, null=True, verbose_name='file2Result'),
        ),
        migrations.AddField(
            model_name='lightcurve',
            name='file3Result',
            field=models.TextField(default=None, null=True, verbose_name='file3Result'),
        ),
        migrations.AddField(
            model_name='lightcurve',
            name='file4Result',
            field=models.TextField(default=None, null=True, verbose_name='file4Result'),
        ),
        migrations.AddField(
            model_name='lightcurve',
            name='txtResult',
            field=models.TextField(default=None, null=True, verbose_name='txtResult'),
        ),
    ]
