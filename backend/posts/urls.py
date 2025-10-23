from django.urls import path, include
from rest_framework_nested import routers
from .views import PostViewSet, FeedView, CommentViewSet

router = routers.DefaultRouter()
router.register(r'posts', PostViewSet, basename='post')

# Create a nested router for comments under posts
posts_router = routers.NestedDefaultRouter(router, r'posts', lookup='post')
posts_router.register(r'comments', CommentViewSet, basename='post-comments')

urlpatterns = [
    path('', include(router.urls)),
    path('', include(posts_router.urls)),
    path('feed/', FeedView.as_view(), name='user-feed'),
]