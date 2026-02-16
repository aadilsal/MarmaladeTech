from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django.conf import settings
import time
import cloudinary
from cloudinary.utils import api_sign_request


class CloudinarySignView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        timestamp = int(time.time())
        params_to_sign = {'timestamp': timestamp}
        api_secret = cloudinary.config().api_secret
        if not api_secret:
            return Response({'detail': 'Cloudinary not configured'}, status=500)
        signature = api_sign_request(params_to_sign, api_secret)
        return Response({
            'signature': signature,
            'timestamp': timestamp,
            'api_key': cloudinary.config().api_key,
            'cloud_name': cloudinary.config().cloud_name
        })