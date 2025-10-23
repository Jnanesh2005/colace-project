from django.shortcuts import get_object_or_404
from rest_framework import viewsets, generics
from rest_framework.permissions import IsAuthenticatedOrReadOnly, IsAuthenticated
from .models import Post, Comment
from .serializers import PostSerializer, CommentSerializer
from .permissions import IsAuthorOrReadOnly

class PostViewSet(viewsets.ModelViewSet):
    serializer_class = PostSerializer
    permission_classes = [IsAuthenticatedOrReadOnly, IsAuthorOrReadOnly]

    def get_queryset(self):
        queryset = Post.objects.all()
        author_username = self.request.query_params.get('author_username')
        group_id = self.request.query_params.get('group')

        if author_username is not None:
            # This now gets ALL posts by the author for their profile page
            queryset = queryset.filter(author__username=author_username)
        
        if group_id is not None:
            # This gets posts for a specific group page
            queryset = queryset.filter(group__id=group_id)
        
        return queryset

    def perform_create(self, serializer):
        serializer.save(author=self.request.user)

class FeedView(generics.ListAPIView):
    """
    Returns a feed of posts from users the current user is following.
    """
    serializer_class = PostSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        # Get the users that the current user is following
        following_users = self.request.user.following.values_list('following', flat=True)

        # Filter to only get personal posts (group is null) from followed users
        return Post.objects.filter(
            author__in=following_users,
            group__isnull=True
        )
    
class CommentViewSet(viewsets.ModelViewSet):
    queryset = Comment.objects.all()
    serializer_class = CommentSerializer
    permission_classes = [IsAuthenticatedOrReadOnly]

    def perform_create(self, serializer):
        post = get_object_or_404(Post, pk=self.kwargs['post_pk'])
        serializer.save(author=self.request.user, post=post)