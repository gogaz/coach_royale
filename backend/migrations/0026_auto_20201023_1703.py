# Generated by Django 3.0.7 on 2020-10-23 17:03

from django.db import migrations

from backend.models import PlayerCube


class Migration(migrations.Migration):

    dependencies = [
        ('backend', '0025_auto_20201016_1132'),
    ]

    operations = [
        PlayerCube.migrate()
    ]
