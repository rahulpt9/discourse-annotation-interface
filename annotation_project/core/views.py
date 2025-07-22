from collections import defaultdict

from django.contrib.auth import get_user_model
from rest_framework import mixins, viewsets, generics, permissions, status
from rest_framework.views import APIView
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

from .models import Domain, Heading, Sentence, Particle
from .serializers import (
    DomainSerializer,
    HeadingSerializer,
    SentenceSerializer,
    ParticleSerializer,
    SignupSerializer,
)

# Signup endpoint
class SignupView(generics.CreateAPIView):
    """
    POST /signup/ — creates a new user (inactive by default).
    """
    queryset = get_user_model().objects.all()
    serializer_class = SignupSerializer
    permission_classes = (permissions.AllowAny,)

# Domains list
class DomainView(viewsets.ReadOnlyModelViewSet):
    queryset = Domain.objects.all()
    serializer_class = DomainSerializer
    permission_classes = (permissions.IsAuthenticated,)

# Headings for a domain
class HeadingView(generics.ListAPIView):
    serializer_class = HeadingSerializer
    permission_classes = (permissions.IsAuthenticated,)

    def get_queryset(self):
        return Heading.objects.filter(domain_id=self.kwargs['domain_pk'])

# Sentences for a heading
class SentenceView(generics.ListAPIView):
    serializer_class   = SentenceSerializer
    permission_classes = (permissions.IsAuthenticated,)

    def get_queryset(self):
        return (
            Sentence.objects
                    .filter(heading_id=self.kwargs['heading_pk'])
                    .order_by('sentence_id')    # ← sort by sentence_id
        )

# Particles list
class ParticleView(viewsets.ReadOnlyModelViewSet):
    queryset = Particle.objects.all()
    serializer_class = ParticleSerializer
    permission_classes = (permissions.IsAuthenticated,)

# Single‐annotation endpoint (if you need it)
class SentenceViewSet(mixins.RetrieveModelMixin,
                      mixins.UpdateModelMixin,
                      viewsets.GenericViewSet):
    """
    GET  /sentences/{pk}/       — retrieve
    PATCH/PUT /sentences/{pk}/  — update newsentence (and/or text)
    """
    queryset = Sentence.objects.all()
    serializer_class = SentenceSerializer
    permission_classes = (permissions.IsAuthenticated,)