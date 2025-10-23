from django.db import models
from django.conf import settings
from groups.models import Group # 1. Import the Group model

class Post(models.Model):
    author = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='posts')
    content = models.TextField()
    # 2. Add the new group field
    group = models.ForeignKey(Group, on_delete=models.CASCADE, related_name='posts', null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        if self.group:
            return f'Post by {self.author.username} in {self.group.name}'
        return f'Post by {self.author.username}'
    
class Comment(models.Model):
    author = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='comments')
    post = models.ForeignKey(Post, on_delete=models.CASCADE, related_name='comments')
    content = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['created_at'] # Show oldest comments first

    def __str__(self):
        return f'Comment by {self.author.username} on {self.post}'