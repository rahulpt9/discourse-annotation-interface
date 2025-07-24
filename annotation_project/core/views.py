# core/views.py
from django.utils import timezone
from django.contrib.auth import get_user_model
from rest_framework import viewsets, generics, permissions, status
from rest_framework.decorators import action, api_view, permission_classes
from rest_framework.response import Response

from .models import Domain, Heading, Sentence, Particle
from .serializers import (
    DomainSerializer,
    HeadingSerializer,
    SentenceSerializer,
    ParticleSerializer,
    SignupSerializer,
)

# ---------------- AUTH ----------------
class SignupView(generics.CreateAPIView):
    queryset = get_user_model().objects.all()
    serializer_class = SignupSerializer
    permission_classes = (permissions.AllowAny,)


# ---------------- READ-ONLY LISTS ----------------
class DomainView(viewsets.ReadOnlyModelViewSet):
    queryset = Domain.objects.all()
    serializer_class = DomainSerializer
    permission_classes = (permissions.IsAuthenticated,)


class HeadingView(generics.ListAPIView):
    serializer_class = HeadingSerializer
    permission_classes = (permissions.IsAuthenticated,)

    def get_queryset(self):
        return Heading.objects.filter(domain_id=self.kwargs['domain_pk'])


class SentenceListByHeading(generics.ListAPIView):
    """
    GET /headings/<heading_pk>/sentences/
    """
    serializer_class = SentenceSerializer
    permission_classes = (permissions.IsAuthenticated,)

    def get_queryset(self):
        return (
            Sentence.objects
                    .filter(heading_id=self.kwargs['heading_pk'])
                    .order_by('sentence_id', 'id')
        )

    def get_serializer_context(self):
        ctx = super().get_serializer_context()
        ctx['request'] = self.request
        return ctx


class ParticleView(viewsets.ReadOnlyModelViewSet):
    queryset = Particle.objects.all()
    serializer_class = ParticleSerializer
    permission_classes = (permissions.IsAuthenticated,)


# ---------------- CRUD / CLAIM / RELEASE ----------------
class SentenceViewSet(viewsets.ModelViewSet):
    """
    /sentences/ (GET, PATCH)
    /sentences/<pk>/claim/   (POST)
    /sentences/<pk>/release/ (POST)
    Optionally list with ?heading=<id>
    """
    serializer_class = SentenceSerializer
    permission_classes = (permissions.IsAuthenticated,)

    def get_queryset(self):
        qs = Sentence.objects.select_related('heading', 'heading__domain')
        heading_pk = self.request.query_params.get('heading')
        if heading_pk:
            qs = qs.filter(heading_id=heading_pk)
        return qs.order_by('sentence_id', 'id')

    def get_serializer_context(self):
        ctx = super().get_serializer_context()
        ctx['request'] = self.request
        return ctx

    @action(detail=True, methods=['post'])
    def claim(self, request, pk=None):
        sent = self.get_object()
        if sent.locked_by and sent.locked_by != request.user:
            return Response({'detail': 'Already locked by someone else.'},
                            status=status.HTTP_409_CONFLICT)
        sent.locked_by = request.user
        sent.locked_at = timezone.now()
        sent.save(update_fields=['locked_by', 'locked_at'])
        return Response({'ok': True}, status=status.HTTP_200_OK)

    @action(detail=True, methods=['post'])
    def release(self, request, pk=None):
        sent = self.get_object()
        if sent.locked_by != request.user:
            return Response({'detail': 'Not your lock.'},
                            status=status.HTTP_403_FORBIDDEN)
        sent.locked_by = None
        sent.locked_at = None
        sent.save(update_fields=['locked_by', 'locked_at'])
        return Response({'ok': True}, status=status.HTTP_200_OK)
