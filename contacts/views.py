from django.core.mail import EmailMessage, get_connection
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import AllowAny
from rest_framework import status
from .serializers import ContactSerializer
from django.conf import settings

# Create your views here.

class ContactView(APIView):
    """
    View to post a contact form and submit an email upon valid content.
    """
    permission_classes = [AllowAny]

    def post(self, request, *args, **kwargs):
        serializer_class = ContactSerializer(data=request.data)
        if serializer_class.is_valid():
            data = serializer_class.validated_data
            self.send_mail(
                subject=f"Contact from {data.get('first_name')} {data.get('last_name')}: {data.get('subject')}",
                body=data.get('content'),
                from_email=data.get('email')
            )
            return Response({"success": "Sent"}, status=status.HTTP_200_OK)
        return Response({'success': "Failed"}, status=status.HTTP_400_BAD_REQUEST)

    @staticmethod
    def send_mail(subject, body, from_email):
        with get_connection() as connection:
            EmailMessage(
                subject=subject,
                body=body,
                from_email=from_email,
                to=[settings.EMAIL_TO],
                connection=connection
            ).send()
