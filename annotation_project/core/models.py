from django.db import models
from django.contrib.auth.models import AbstractUser
from django.utils import timezone
from django.conf import settings
# ...

class User(AbstractUser):
    is_active = models.BooleanField(default=False)

class Domain(models.Model):
    name = models.CharField(max_length=50)

    def __str__(self):
        return self.name

class Heading(models.Model):
    # was File
    domain    = models.ForeignKey(Domain, on_delete=models.CASCADE)
    title     = models.CharField(max_length=255)   # e.g. “shatranj”
    
    def __str__(self):
        return self.title

class Sentence(models.Model):
    heading      = models.ForeignKey(Heading, on_delete=models.CASCADE)
    text         = models.TextField()
    sentence_id  = models.CharField(max_length=32, null=True, blank=True, unique=True)
    newsentence  = models.TextField(null=True, blank=True)

    # NEW
    locked_by  = models.ForeignKey(User, null=True, blank=True,
                               on_delete=models.SET_NULL,
                               related_name='locked_sentences')
    locked_at  = models.DateTimeField(null=True, blank=True)

    def lock(self, user):
        self.locked_by = user
        self.locked_at = timezone.now()
        self.save(update_fields=['locked_by', 'locked_at'])

    def unlock(self):
        self.locked_by = None
        self.locked_at = None
        self.save(update_fields=['locked_by', 'locked_at'])

class Particle(models.Model):
    code    = models.CharField(max_length=50)
    english = models.CharField(max_length=100, null=True, blank=True)

    def __str__(self):
        return f"{self.code} – {self.english}"


