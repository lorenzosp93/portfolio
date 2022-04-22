from rest_framework import serializers

class ContactSerializer(serializers.Serializer):
    """
    Class to serialize contact form data
    """
    first_name = serializers.CharField(max_length=50)
    last_name = serializers.CharField(max_length=50)
    email = serializers.EmailField()
    content = serializers.CharField(max_length=280)