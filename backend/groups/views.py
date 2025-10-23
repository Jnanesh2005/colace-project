from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from django.contrib.auth import get_user_model
from django.shortcuts import get_object_or_404
from .models import Group
from .serializers import GroupSerializer
from .permissions import IsOwnerOrReadOnly # Import the new permission
from rest_framework import generics # Make sure generics is imported
from rest_framework.permissions import IsAuthenticated # Make sure IsAuthenticated is imported

User = get_user_model()

class GroupViewSet(viewsets.ModelViewSet):
    queryset = Group.objects.all()
    serializer_class = GroupSerializer
    permission_classes = [IsOwnerOrReadOnly] # Use the new permission

    def get_serializer_context(self):
        context = super().get_serializer_context()
        context.update({"request": self.request})
        return context

    def perform_create(self, serializer):
        group = serializer.save(owner=self.request.user)
        group.members.add(self.request.user)

    @action(detail=True, methods=['post'])
    def toggle_membership(self, request, pk=None):
        group = self.get_object()
        user = request.user

        if user in group.members.all():
            group.members.remove(user)
            message = 'You have left the group.'
            is_member = False
        else:
            group.members.add(user)
            message = 'You have joined the group.'
            is_member = True
        
        return Response({'detail': message, 'is_member': is_member}, status=status.HTTP_200_OK)

    # --- Add this new action for adding members ---
    @action(detail=True, methods=['post'], permission_classes=[IsOwnerOrReadOnly])
    def add_member(self, request, pk=None):
        group = self.get_object()
        username = request.data.get('username')

        if not username:
            return Response({'error': 'Username is required.'}, status=status.HTTP_400_BAD_REQUEST)

        user_to_add = get_object_or_404(User, username=username)

        if user_to_add in group.members.all():
            return Response({'detail': 'User is already a member.'}, status=status.HTTP_400_BAD_REQUEST)

        group.members.add(user_to_add)
        return Response({'detail': f'{username} has been added to the group.'}, status=status.HTTP_200_OK)
    
class UserGroupsView(generics.ListAPIView):
    """
    Returns a list of groups that the current user is a member of.
    """
    serializer_class = GroupSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return self.request.user.joined_groups.all()