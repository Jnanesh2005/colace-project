import random
from django.core.mail import send_mail
from django.conf import settings
from django.contrib.auth import get_user_model
from rest_framework import generics, status, views, filters
from rest_framework.response import Response
from rest_framework.permissions import AllowAny
from .serializers import UserProfileSerializer # 1. Use the new serializer name
User = get_user_model()

def is_indian_college_email(email):
    """
    A simple check for common Indian academic domains.
    """
    return email.endswith('.ac.in') or email.endswith('.edu.in')

class RegistrationView(views.APIView):
    """
    Handles the first step of registration: validating email,
    sending OTP, and storing data in the session.
    """
    permission_classes = [AllowAny] # Allow public access

    def post(self, request, *args, **kwargs):
        email = request.data.get('email')
        password = request.data.get('password')

        if not email or not password:
            return Response({'error': 'Email and password are required.'}, status=status.HTTP_400_BAD_REQUEST)

        if not is_indian_college_email(email):
            return Response({'error': 'Please use a valid Indian college email address (.ac.in or .edu.in).'}, status=status.HTTP_400_BAD_REQUEST)

        if User.objects.filter(email=email).exists():
            return Response({'error': 'A user with this email already exists.'}, status=status.HTTP_400_BAD_REQUEST)

        otp = random.randint(100000, 999999)
        request.session['registration_data'] = {'email': email, 'password': password, 'otp': otp}
        
        try:
            send_mail(
                'Your Colace Account Verification Code',
                f'Your OTP for creating a Colace account is: {otp}',
                settings.EMAIL_HOST_USER,
                [email],
                fail_silently=False,
            )
        except Exception as e:
            return Response({'error': f'Failed to send verification email. Error: {e}'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

        return Response({'message': 'OTP sent to your email. Please verify to complete registration.'}, status=status.HTTP_200_OK)

class VerificationView(views.APIView):
    """
    Handles the second step of registration: verifying the OTP
    and creating the user account.
    """
    permission_classes = [AllowAny] # Allow public access

    def post(self, request, *args, **kwargs):
        user_otp = request.data.get('otp')
        registration_data = request.session.get('registration_data')

        if not registration_data:
            return Response({'error': 'Registration session expired or not found. Please register again.'}, status=status.HTTP_400_BAD_REQUEST)

        if not user_otp or int(user_otp) != registration_data['otp']:
            return Response({'error': 'Invalid OTP.'}, status=status.HTTP_400_BAD_REQUEST)

        user = User.objects.create_user(
            username=registration_data['email'].split('@')[0],
            email=registration_data['email'],
            password=registration_data['password']
        )
        
        del request.session['registration_data']

        return Response({'message': 'Account created successfully!'}, status=status.HTTP_201_CREATED)

class UserProfileView(generics.RetrieveAPIView):
    queryset = User.objects.all()
    serializer_class = UserProfileSerializer
    lookup_field = 'username'

    def get_serializer_context(self):
        context = super().get_serializer_context()
        context.update({"request": self.request})
        return context

class UserListView(generics.ListAPIView):
    queryset = User.objects.all()
    serializer_class = UserProfileSerializer
    filter_backends = [filters.SearchFilter]
    search_fields = ['username']