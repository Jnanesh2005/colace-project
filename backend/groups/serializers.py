from rest_framework import serializers
from .models import Group

class GroupSerializer(serializers.ModelSerializer):
    owner_username = serializers.ReadOnlyField(source='owner.username')
    member_count = serializers.SerializerMethodField()
    is_member = serializers.SerializerMethodField() # Add this

    class Meta:
        model = Group
        # Add 'is_member' to the fields list
        fields = ['id', 'name', 'description', 'owner', 'owner_username', 'members', 'member_count', 'is_member', 'created_at']
        read_only_fields = ['owner', 'members']

    def get_member_count(self, obj):
        return obj.members.count()

    def get_is_member(self, obj):
        request = self.context.get('request', None)
        if request is None or not request.user.is_authenticated:
            return False
        # Check if the current user is in the group's members list
        return obj.members.filter(id=request.user.id).exists()