from django.middleware.csrf import get_token
from django.db import OperationalError
from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from rest_framework.views import APIView

from .admission import AdmissionLimited, enqueue_contact
from .serializers import ContactSerializer


@api_view(('GET',))
@permission_classes((AllowAny,))
def get_csrf_token(request):
    token = get_token(request)
    return Response({"token": token}, status=status.HTTP_200_OK)


class ContactView(APIView):
    """
    Persist a valid contact form for asynchronous email delivery.
    """
    permission_classes = [AllowAny]

    def post(self, request, *args, **kwargs):
        serializer_class = ContactSerializer(data=request.data)
        if not serializer_class.is_valid():
            return Response(
                {
                    "success": False,
                    "message": "Invalid contact form submission.",
                    "errors": serializer_class.errors,
                },
                status=status.HTTP_400_BAD_REQUEST,
            )

        try:
            enqueue_contact(serializer_class.validated_data, request.META.get('REMOTE_ADDR', ''))
        except AdmissionLimited:
            return Response(
                {'success': False, 'message': 'Too many messages. Please try again later.'},
                status=status.HTTP_429_TOO_MANY_REQUESTS,
                headers={'Retry-After': '60'},
            )
        except OperationalError:
            # A busy/unavailable database must never bypass admission checks.
            return Response(
                {'success': False, 'message': 'Messages are temporarily unavailable. Please try again later.'},
                status=status.HTTP_503_SERVICE_UNAVAILABLE,
                headers={'Retry-After': '60'},
            )

        return Response(
            {
                "success": True,
                "message": "Message received successfully.",
            },
            status=status.HTTP_202_ACCEPTED,
        )
