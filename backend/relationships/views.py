from rest_framework import generics, status
from rest_framework.response import Response
from django.shortcuts import get_object_or_404
from django.contrib.auth import get_user_model
from .models import Follow

User = get_user_model()

class FollowView(generics.GenericAPIView):
    queryset = Follow.objects.all()

    def post(self, request, username, *args, **kwargs):
        """Follow a user."""
        user_to_follow = get_object_or_404(User, username=username)
        if user_to_follow == request.user:
            return Response({"detail": "You cannot follow yourself."}, status=status.HTTP_400_BAD_REQUEST)

        follow, created = Follow.objects.get_or_create(follower=request.user, following=user_to_follow)
        if not created:
            return Response({"detail": "You are already following this user."}, status=status.HTTP_400_BAD_REQUEST)

        return Response({"detail": f"You are now following {username}."}, status=status.HTTP_201_CREATED)

    def delete(self, request, username, *args, **kwargs):
        """Unfollow a user."""
        user_to_unfollow = get_object_or_404(User, username=username)
        follow = get_object_or_404(Follow, follower=request.user, following=user_to_unfollow)
        follow.delete()
        return Response({"detail": f"You have unfollowed {username}."}, status=status.HTTP_204_NO_CONTENT)