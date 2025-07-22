# core/admin.py
from django.contrib import admin
from django.contrib.auth import get_user_model
from django.contrib.auth.admin import UserAdmin

User = get_user_model()

@admin.register(User)
class CustomUserAdmin(UserAdmin):
    list_display  = ('username', 'email', 'is_active', 'is_staff', 'is_superuser')
    list_filter   = ('is_active', 'is_staff', 'is_superuser')
    search_fields = ('username', 'email')
