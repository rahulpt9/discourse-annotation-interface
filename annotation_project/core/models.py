from django.db import models
from django.contrib.auth.models import AbstractUser

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

    def __str__(self):
        # show the provided sentence_id if present, otherwise the PK
        return f"{self.sentence_id or self.id}: {self.text[:30]}…"

class Particle(models.Model):
    code    = models.CharField(max_length=50)
    english = models.CharField(max_length=100, null=True, blank=True)

    def __str__(self):
        return f"{self.code} – {self.english}"


