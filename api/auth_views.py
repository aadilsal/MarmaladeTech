import logging
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework.response import Response
from rest_framework import status
from django.conf import settings
from rest_framework.permissions import AllowAny


logger = logging.getLogger(__name__)


def _get_cookie_options():
    return {
        "secure": settings.AUTH_COOKIE_SECURE,
        "samesite": settings.AUTH_COOKIE_SAMESITE,
        "domain": settings.AUTH_COOKIE_DOMAIN,
    }


class CookieTokenObtainPairView(TokenObtainPairView):
    """
    POST /api/auth/login/
    
    Authenticates user with username and password.
    Sets both access and refresh tokens in httpOnly cookies.
    
    Request: { "username": "...", "password": "..." }
    Response: 200 OK (tokens in cookies)
    Response: 401 Unauthorized (invalid credentials)
    """
    permission_classes = [AllowAny]

    def post(self, request, *args, **kwargs):
        # Call parent to validate credentials and get tokens
        response = super().post(request, *args, **kwargs)
        
        if response.status_code == 200:
            refresh = response.data.get('refresh')
            access = response.data.get('access')
            cookie_options = _get_cookie_options()
            
            # Set HttpOnly refresh token cookie (long expiry, allows refresh)
            response.set_cookie(
                key='refresh_token',
                value=refresh,
                httponly=True,
                secure=cookie_options["secure"],
                samesite=cookie_options["samesite"],
                domain=cookie_options["domain"],
                path='/',
                max_age=30 * 24 * 60 * 60,  # 30 days
            )
            
            # Set HttpOnly access token cookie (short expiry, used for requests)
            response.set_cookie(
                key='access_token',
                value=access,
                httponly=True,
                secure=cookie_options["secure"],
                samesite=cookie_options["samesite"],
                domain=cookie_options["domain"],
                path='/',
                max_age=15 * 60,  # 15 minutes
            )
            
            # Return minimal response (tokens in cookies, not body)
            return Response({'detail': 'Authenticated successfully'}, status=status.HTTP_200_OK)
        
        return response


class CookieTokenRefreshView(TokenRefreshView):
    """
    POST /api/auth/refresh/
    
    Refreshes the access token using the refresh token from httpOnly cookie.
    This keeps both tokens synced and secure.
    
    Request: Empty body (refresh token comes from cookie)
    Response: 200 OK (tokens are set in cookies, not returned)
    Response: 401 Unauthorized (invalid/expired refresh token)
    """
    permission_classes = [AllowAny]

    def post(self, request, *args, **kwargs):
        data = request.data.copy()
        
        # Try to get refresh token from cookie if not in body
        if 'refresh' not in data:
            refresh_cookie = request.COOKIES.get('refresh_token')
            if refresh_cookie:
                data['refresh'] = refresh_cookie
        
        # Use parent serializer to validate
        serializer = self.get_serializer(data=data)
        
        try:
            serializer.is_valid(raise_exception=True)
        except Exception as e:
            # 401 for invalid token - unambiguous
            return Response({'detail': 'Invalid or expired refresh token'}, status=status.HTTP_401_UNAUTHORIZED)
        
        response_data = serializer.validated_data
        cookie_options = _get_cookie_options()
        
        # Set new tokens in httpOnly cookies
        response = Response({'detail': 'Token refreshed successfully'}, status=status.HTTP_200_OK)
        
        # Always set new refresh token (token rotation)
        if 'refresh' in response_data:
            response.set_cookie(
                key='refresh_token',
                value=response_data['refresh'],
                httponly=True,
                secure=cookie_options["secure"],
                samesite=cookie_options["samesite"],
                domain=cookie_options["domain"],
                path='/',
            )
        
        # Set access token cookie
        if 'access' in response_data:
            response.set_cookie(
                key='access_token',
                value=response_data['access'],
                httponly=True,
                secure=cookie_options["secure"],
                samesite=cookie_options["samesite"],
                domain=cookie_options["domain"],
                path='/',
            )
        
        return response


class CookieLogoutView:
    """Provide a function to clear the refresh token cookie and optionally blacklist the token."""


from rest_framework.views import APIView
from rest_framework.permissions import IsAuthenticated, AllowAny
from .serializers import UserSerializer, ProfileSerializer
from account.models import Profile


class LogoutView(APIView):
    """
    POST /api/auth/logout/
    
    Logs out the user by:
    1. Blacklisting the refresh token
    2. Clearing auth cookies
    
    Request: Optional refresh token in body
    Response: 200 OK (always succeeds, even if token invalid)
    """
    permission_classes = [AllowAny]
    
    def post(self, request):
        # Get refresh token from cookie or body
        refresh_token = request.COOKIES.get('refresh_token') or request.data.get('refresh')
        
        if refresh_token:
            try:
                # Blacklist the token to prevent reuse
                token = RefreshToken(refresh_token)
                token.blacklist()
            except Exception:
                # Token already invalid or expired - OK
                pass
        
        # Clear auth cookies
        response = Response({'detail': 'Logged out successfully'}, status=status.HTTP_200_OK)
        cookie_domain = settings.AUTH_COOKIE_DOMAIN
        response.delete_cookie('refresh_token', path='/api/auth/', domain=cookie_domain)
        response.delete_cookie('refresh_token', path='/', domain=cookie_domain)
        response.delete_cookie('access_token', path='/', domain=cookie_domain)
        
        return response


from rest_framework import serializers, status as drf_status
from django.contrib.auth import get_user_model


class RegisterSerializer(serializers.Serializer):
    username = serializers.CharField()
    password = serializers.CharField(write_only=True)
    email = serializers.EmailField(required=False)


class RegisterView(APIView):
    """
    POST /api/auth/register/
    
    Creates a new user account and authenticates them.
    Sets tokens in httpOnly cookies.
    
    Request: { "username": "...", "password": "...", "email": "..." (optional) }
    Response: 201 Created (tokens in cookies)
    Response: 400 Bad Request (validation errors, username taken)
    """
    permission_classes = [AllowAny]
    
    def post(self, request):
        logger.info("Register request received", extra={
            "username": request.data.get("username"),
            "email": request.data.get("email"),
        })
        serializer = RegisterSerializer(data=request.data)
        try:
            serializer.is_valid(raise_exception=True)
        except serializers.ValidationError:
            logger.warning("Register validation failed", extra={
                "errors": serializer.errors,
                "username": request.data.get("username"),
                "email": request.data.get("email"),
            })
            raise
        
        User = get_user_model()
        username = serializer.validated_data['username']
        password = serializer.validated_data['password']
        email = serializer.validated_data.get('email', '')

        # Check if username already exists
        if User.objects.filter(username=username).exists():
            logger.info("Register rejected: username taken", extra={"username": username})
            return Response(
                {'detail': 'Username already taken'},
                status=status.HTTP_400_BAD_REQUEST
            )

        # Create user
        user = User.objects.create_user(
            username=username,
            password=password,
            email=email
        )
        logger.info("Register succeeded", extra={"user_id": user.id, "username": username})
        
        # Generate tokens
        refresh = RefreshToken.for_user(user)
        access = str(refresh.access_token)
        cookie_options = _get_cookie_options()
        
        # Create response
        response = Response(
            {'detail': 'User created and authenticated successfully'},
            status=status.HTTP_201_CREATED
        )
        
        # Set cookies
        response.set_cookie(
            key='refresh_token',
            value=str(refresh),
            httponly=True,
            secure=cookie_options["secure"],
            samesite=cookie_options["samesite"],
            domain=cookie_options["domain"],
            path='/',
            max_age=30 * 24 * 60 * 60,  # 30 days
        )
        
        response.set_cookie(
            key='access_token',
            value=access,
            httponly=True,
            secure=cookie_options["secure"],
            samesite=cookie_options["samesite"],
            domain=cookie_options["domain"],
            path='/',
            max_age=15 * 60,  # 15 minutes
        )
        
        return response


class MeView(APIView):
    """
    GET /api/auth/me/
    
    Returns the authenticated user's identity.
    This is the AUTHORITATIVE SOURCE OF TRUTH for auth state.
    
    Response: 200 OK with user data (authenticated)
    Response: 401 Unauthorized (not authenticated - clear and unambiguous)
    
    Frontend behavior:
    - 200 → user is authenticated, extract user data
    - 401 → user is NOT authenticated, redirect to login
    - Any other error → backend issue, show error
    """
    permission_classes = [IsAuthenticated]

    def get(self, request):
        # Return only essential user identity information
        # Profile is optional and can be fetched separately
        user_data = UserSerializer(request.user).data
        return Response({'user': user_data}, status=status.HTTP_200_OK)