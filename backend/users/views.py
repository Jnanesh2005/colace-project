# backend/users/views.py
import random
from django.core.mail import send_mail
from django.conf import settings
from django.contrib.auth import get_user_model
from rest_framework import generics, status, views, filters
from rest_framework.response import Response
from rest_framework.permissions import AllowAny
# ***** CHANGE IMPORT HERE *****
from .serializers import UserSerializer # Use the correct serializer name
User = get_user_model()

# --- Custom JWT Classes (Keep these from previous step) ---
from rest_framework_simplejwt.views import TokenObtainPairView
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from django.contrib.auth import authenticate

class CustomTokenObtainPairSerializer(TokenObtainPairSerializer):
    username_field = User.EMAIL_FIELD
    def validate(self, attrs):
        password = attrs.get("password")
        user = authenticate(
            request=self.context.get("request"),
            username=attrs.get(self.username_field),
            password=password,
        )
        if not user:
             raise serializers.ValidationError("No active account found with the given credentials")
        data = super().validate(attrs)
        return data

class CustomTokenObtainPairView(TokenObtainPairView):
    serializer_class = CustomTokenObtainPairSerializer

# --- Existing functions/classes below (is_indian_college_email, RegistrationView, VerificationView) ---
# --- Make sure they remain as they were ---
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
            # It's good practice to log the actual error for debugging
            print(f"Error sending email: {e}") # Log to console/Render logs
            return Response({'error': f'Failed to send verification email.'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

        return Response({'message': 'OTP sent to your email. Please verify to complete registration.'}, status=status.HTTP_200_OK)


class VerificationView(views.APIView):
    """
    Handles the second step of registration: verifying the OTP
    and creating the user account.
    """
    permission_classes = [AllowAny] # Allow public access

    def post(self, request, *args, **kwargs):
        user_otp_str = request.data.get('otp') # Get OTP as string
        registration_data = request.session.get('registration_data')

        if not registration_data:
            return Response({'error': 'Registration session expired or not found. Please register again.'}, status=status.HTTP_400_BAD_REQUEST)

        # Safely convert user input OTP to integer for comparison
        try:
            user_otp_int = int(user_otp_str) if user_otp_str else -1 # Handle empty input
        except (ValueError, TypeError):
             return Response({'error': 'Invalid OTP format.'}, status=status.HTTP_400_BAD_REQUEST)


        if user_otp_int != registration_data.get('otp'): # Use .get() for safety
            return Response({'error': 'Invalid OTP.'}, status=status.HTTP_400_BAD_REQUEST)

        # Ensure required data exists before creating user
        email = registration_data.get('email')
        password = registration_data.get('password')
        if not email or not password:
             return Response({'error': 'Session data incomplete. Please register again.'}, status=status.HTTP_400_BAD_REQUEST)


        try:
            user = User.objects.create_user(
                # Generate a unique username if needed, or handle potential conflicts
                username=email.split('@')[0] + str(random.randint(100,999)), # Example: add random digits
                email=email,
                password=password
            )
        except Exception as e:
             # Log the error for debugging
             print(f"Error creating user: {e}")
             return Response({'error': 'Failed to create user account.'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


        # Clear session data only on success
        if 'registration_data' in request.session:
            del request.session['registration_data']

        return Response({'message': 'Account created successfully!'}, status=status.HTTP_201_CREATED)


# ***** CHANGE SERIALIZER CLASS HERE *****
class UserProfileView(generics.RetrieveAPIView):
    queryset = User.objects.all()
    serializer_class = UserSerializer # Use the correct serializer name
    lookup_field = 'username'

    def get_serializer_context(self):
        context = super().get_serializer_context()
        context.update({"request": self.request})
        return context

# ***** CHANGE SERIALIZER CLASS HERE *****
class UserListView(generics.ListAPIView):
    queryset = User.objects.all()
    serializer_class = UserSerializer # Use the correct serializer name
    filter_backends = [filters.SearchFilter]
    search_fields = ['username', 'email'] # Allow searching by email too