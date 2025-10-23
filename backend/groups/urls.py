from django.urls import path # Make sure path is imported
from rest_framework.routers import DefaultRouter
from .views import GroupViewSet, UserGroupsView # Import the new view

router = DefaultRouter()
router.register(r'groups', GroupViewSet, basename='group')

urlpatterns = router.urls + [
    path('my-groups/', UserGroupsView.as_view(), name='user-groups'), # Add this line
]