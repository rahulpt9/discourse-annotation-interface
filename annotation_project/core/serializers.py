from rest_framework import serializers
from .models import Domain, Heading, Sentence, Particle
from django.contrib.auth import get_user_model


class SignupSerializer(serializers.ModelSerializer):
    class Meta:
        model  = get_user_model()
        fields = ('username', 'email', 'password')
        extra_kwargs = {'password': {'write_only': True}}

    def create(self, validated):
        user = super().create(validated)
        user.set_password(validated['password'])
        user.is_active = False
        user.save()
        return user


class DomainSerializer(serializers.ModelSerializer):
    class Meta:
        model  = Domain
        fields = ('id', 'name')


class HeadingSerializer(serializers.ModelSerializer):
    class Meta:
        model  = Heading
        fields = ('id', 'title')


class SentenceSerializer(serializers.ModelSerializer):
    class Meta:
        model  = Sentence
        fields = ('id', 'sentence_id', 'text', 'newsentence')


class ParticleSerializer(serializers.ModelSerializer):
    class Meta:
        model  = Particle
        fields = ('code', 'english')


