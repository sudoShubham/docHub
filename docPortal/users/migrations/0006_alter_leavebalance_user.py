# Generated by Django 5.0.1 on 2024-11-27 15:15

import django.db.models.deletion
from django.conf import settings
from django.db import migrations, models


class Migration(migrations.Migration):
    dependencies = [
        ("users", "0005_leavebalance_leaverequest"),
    ]

    operations = [
        migrations.AlterField(
            model_name="leavebalance",
            name="user",
            field=models.OneToOneField(
                on_delete=django.db.models.deletion.CASCADE, to=settings.AUTH_USER_MODEL
            ),
        ),
    ]