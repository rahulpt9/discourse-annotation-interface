# core/urls.py
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    DomainView, HeadingView, SentenceListByHeading,
    ParticleView, SentenceViewSet, SignupView
)
from rest_framework_simplejwt.views import TokenObtainPairView

router = DefaultRouter()
router.register(r'domains',   DomainView,      basename='domain')
router.register(r'particles', ParticleView,    basename='particle')
router.register(r'sentences', SentenceViewSet, basename='sentence')

urlpatterns = [
    path('signup/', SignupView.as_view(), name='signup'),
    path('login/',  TokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('', include(router.urls)),
    path('domains/<int:domain_pk>/headings/',   HeadingView.as_view()),
    path('headings/<int:heading_pk>/sentences/', SentenceListByHeading.as_view()),
]
