# Generated by Django 2.1.1 on 2018-10-04 23:35

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('react_api', '0001_initial'),
    ]

    operations = [
        migrations.AddField(
            model_name='clanwar',
            name='total_trophies',
            field=models.IntegerField(null=True),
        ),
    ]
