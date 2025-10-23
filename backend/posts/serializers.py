from rest_framework import serializers
from .models import Post, Comment # Add Comment

class CommentSerializer(serializers.ModelSerializer):
    author_username = serializers.ReadOnlyField(source='author.username')

    class Meta:
        model = Comment
        fields = ['id', 'author', 'author_username', 'post', 'content', 'created_at']
        read_only_fields = ['author', 'post']


class PostSerializer(serializers.ModelSerializer):
    author_username = serializers.ReadOnlyField(source='author.username')
    # Add this line to get the author's profile photo
    author_profile_photo = serializers.ImageField(source='author.profile_photo', read_only=True)
    comments = CommentSerializer(many=True, read_only=True)

    class Meta:
        model = Post
        # Add 'author_profile_photo' to the fields list
        fields = ['id', 'author', 'author_username', 'author_profile_photo', 'content', 'group', 'comments', 'created_at', 'updated_at']
        read_only_fields = ['author']