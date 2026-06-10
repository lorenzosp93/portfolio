import logging

from django.conf import settings
from django.core.mail import EmailMessage, get_connection
from django.middleware.csrf import get_token
from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from rest_framework.views import APIView

from .serializers import ContactSerializer

logger = logging.getLogger(__name__)


@api_view(('GET',))
@permission_classes((AllowAny,))
def get_csrf_token(request):
    token = get_token(request)
    return Response({"token": token}, status=status.HTTP_200_OK)


class ContactView(APIView):
    """
    View to post a contact form and submit an email upon valid content.
    """
    permission_classes = [AllowAny]

    def post(self, request, *args, **kwargs):
        serializer_class = ContactSerializer(data=request.data)
        if serializer_class.is_valid():
            data = serializer_class.validated_data
            try:
                self.send_mail(
                    subject="Contact from {first} {last} - {email}".format(
                        first=data.get('first_name'),
                        last=data.get('last_name'),
                        email=data.get('email'),
                    ),
                    body=data.get('content'),
                )
            except Exception:
                logger.exception("Failed to send contact form email")
                return Response({"success": "Failed"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
            return Response({"success": "Sent"}, status=status.HTTP_200_OK)
        return Response({'success': "Failed"}, status=status.HTTP_400_BAD_REQUEST)

    @staticmethod
    def send_mail(subject, body):
        with get_connection() as connection:
            EmailMessage(
                subject=subject,
                body=body,
                from_email=settings.EMAIL_TO,
                to=[settings.EMAIL_TO],
                connection=connection
            ).send()
