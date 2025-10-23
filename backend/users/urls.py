from django.urls import path
from .views import UserProfileView, RegistrationView, VerificationView, UserListView

urlpatterns = [
    # Paths for your new registration system
    path('register/', RegistrationView.as_view(), name='register'),
    path('register/verify/', VerificationView.as_view(), name='register-verify'),
    
    # Path for the user search/list functionality
    path('users/', UserListView.as_view(), name='user-list'),
    
    # Path for viewing a specific user's profile
    path('users/<str:username>/', UserProfileView.as_view(), name='user-profile'),
]