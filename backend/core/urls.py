from django.contrib import admin
from django.urls import path, include
from django.conf import settings # 1. Import settings
from django.conf.urls.static import static # 2. Import static

urlpatterns = [
    path('admin/', admin.site.urls),
    
    path('api/', include('posts.urls')),
    path('api/', include('users.urls')),
    path('api/', include('relationships.urls')),
    path('api/', include('groups.urls')),
    
    path('api/auth/', include('djoser.urls')),
    path('api/auth/', include('djoser.urls.authtoken')),
]

# 3. Add this line to serve media files during development
if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)