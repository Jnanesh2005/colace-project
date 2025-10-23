from djoser.serializers import UserSerializer
from .models import User

class UserProfileSerializer(UserSerializer):
    class Meta(UserSerializer.Meta):
        model = User
        # Define the fields a user can update
        fields = ('id', 'username', 'email', 'bio', 'profile_photo')
        read_only_fields = ('email',) # Don't allow email changes for now