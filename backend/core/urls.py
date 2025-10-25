# backend/core/urls.py

from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static

# Import your custom view
from users.views import CustomTokenObtainPairView
# Import standard Simple JWT views for refresh (optional but recommended)
from rest_framework_simplejwt.views import TokenRefreshView

urlpatterns = [
    path('admin/', admin.site.urls),

    path('api/', include('posts.urls')),
    path('api/', include('users.urls')), # Includes /register/, /register/verify/, /users/, /users/{username}/
    path('api/', include('relationships.urls')),
    path('api/', include('groups.urls')),

    # Djoser core URLs (for user management like /users/me/, password reset, etc.)
    path('api/auth/', include('djoser.urls')),

    # Use OUR custom view for obtaining the JWT token (login)
    path('api/auth/token/', CustomTokenObtainPairView.as_view(), name='token_obtain_pair'),

    # Use standard Simple JWT view for refreshing the token
    path('api/auth/token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),

    # REMOVE Djoser's authtoken/jwt includes if they were present
    # path('api/auth/', include('djoser.urls.authtoken')), # Remove this
    # path('api/auth/', include('djoser.urls.jwt')), # Remove this
]

if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)