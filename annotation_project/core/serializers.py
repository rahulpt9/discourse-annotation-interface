from rest_framework import serializers
from .models import Domain, Heading, Sentence, Particle
from django.contrib.auth import get_user_model


class SignupSerializer(serializers.ModelSerializer):
    class Meta:
        model  = get_user_model()
        fields = ('username', 'email', 'password')
        extra_kwargs = {'password': {'write_only': True}}

    def create(self, validated_data):
        user = super().create(validated_data)
        user.set_password(validated_data['password'])
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
    locked_by_me = serializers.SerializerMethodField()

    class Meta:
        model  = Sentence
        fields = ('id', 'sentence_id', 'text', 'newsentence',
                  'locked_by', 'locked_by_me')  # include locked_by if you want

    def get_locked_by_me(self, obj):
        req = self.context.get('request')
        if not req or req.user.is_anonymous:
            return False
        return obj.locked_by_id == req.user.id


class ParticleSerializer(serializers.ModelSerializer):
    class Meta:
        model  = Particle
        fields = ('code', 'english')


