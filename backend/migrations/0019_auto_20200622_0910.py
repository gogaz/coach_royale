# Generated by Django 3.0.5 on 2020-06-22 09:10

import backend.models.fields
import django.contrib.postgres.fields.jsonb
from django.db import migrations, models
import django.utils.timezone


class Migration(migrations.Migration):

    dependencies = [
        ('backend', '0018_auto_20200417_2232'),
    ]

    operations = [
        migrations.CreateModel(
            name='Arena',
            fields=[
                ('id', models.AutoField(primary_key=True, serialize=False)),
                ('created_at', models.DateTimeField(default=django.utils.timezone.now)),
                ('updated_at', backend.models.fields.AutoDateTimeField(default=django.utils.timezone.now)),
                ('name', models.CharField(max_length=256)),
                ('key', models.CharField(max_length=256)),
                ('arena', models.IntegerField()),
                ('arena_id', models.IntegerField(unique=True)),
                ('min_trophy_limit', models.IntegerField()),
                ('max_trophy_limit', models.IntegerField()),
                ('is_in_use', models.IntegerField(default=False)),
                ('blob', django.contrib.postgres.fields.jsonb.JSONField()),
            ],
            options={
                'abstract': False,
            },
        ),
        migrations.AddField(
            model_name='card',
            name='blob',
            field=django.contrib.postgres.fields.jsonb.JSONField(null=True),
        ),
        migrations.AlterField(
            model_name='card',
            name='card_id',
            field=models.IntegerField(null=True, unique=True),
        ),
        migrations.AlterField(
            model_name='card',
            name='key',
            field=models.CharField(max_length=64, unique=True),
        ),
    ]
