from django.urls import path
from .views import FollowView

urlpatterns = [
    path('follow/<str:username>/', FollowView.as_view(), name='follow-user'),
]