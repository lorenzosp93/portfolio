"Define custom storage settings for AWS S3"
from django.conf import settings
from storages.backends.s3boto3 import S3Boto3Storage

class StaticStorage(S3Boto3Storage):
    "Define a Static storage class to save static files in the /static/ directory"
    location = settings.STATIC_LOCATION

class MediaStorage(S3Boto3Storage):
    "Define a Media storage class to save media files in the /media/ directory"
    location = settings.MEDIA_LOCATION
    file_overwrite = False
