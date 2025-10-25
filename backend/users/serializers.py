# backend/users/serializers.py

from django.contrib.auth import get_user_model
from djoser.serializers import UserCreateSerializer as BaseUserCreateSerializer, UserSerializer as BaseUserSerializer

User = get_user_model()

class UserCreateSerializer(BaseUserCreateSerializer):
    class Meta(BaseUserCreateSerializer.Meta):
        model = User
        # Ensure 'email' and 'password' are included, add others as needed
        fields = ('id', 'email', 'username', 'password', 'bio', 'profile_photo', 'date_of_birth')

class UserSerializer(BaseUserSerializer):
    class Meta(BaseUserSerializer.Meta):
        model = User
        # Fields visible when viewing/editing profile
        fields = ('id', 'email', 'username', 'bio', 'profile_photo', 'date_of_birth')
        # Prevent changing email via this serializer (optional, good practice)
        read_only_fields = ('email',)

# This was your previous serializer, ensure it matches or adapt UserSerializer above
# class UserProfileSerializer(BaseUserSerializer):
#     class Meta(BaseUserSerializer.Meta):
#         model = User
#         fields = ('id', 'username', 'email', 'bio', 'profile_photo')
#         read_only_fields = ('email',)