# Generated by Django 3.0.10 on 2020-10-16 11:32

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('backend', '0024_auto_20201016_1116'),
    ]

    operations = [
        migrations.AlterField(
            model_name='clanwar',
            name='finish_time',
            field=models.DateTimeField(null=True),
        ),
    ]
