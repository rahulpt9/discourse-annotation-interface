# core/admin.py
from django.contrib import admin
from django.contrib.auth import get_user_model
from django.contrib.auth.admin import UserAdmin
from .models import Sentence

User = get_user_model()

@admin.action(description="Force release selected sentences")
def force_release(modeladmin, request, queryset):
    queryset.update(locked_by=None, locked_at=None)

@admin.register(Sentence)
class SentenceAdmin(admin.ModelAdmin):
    list_display = ('id', 'sentence_id', 'heading', 'locked_by', 'short_text')

    def short_text(self, obj):
        return obj.text[:60] + ('…' if len(obj.text) > 60 else '')
    short_text.short_description = 'Text'


@admin.register(User)
class CustomUserAdmin(UserAdmin):
    list_display  = ('username', 'email', 'is_active', 'is_staff', 'is_superuser')
    list_filter   = ('is_active', 'is_staff', 'is_superuser')
    search_fields = ('username', 'email')
