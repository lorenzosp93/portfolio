from django.contrib import admin
from .models import SiteSettings, Attachment

# Register your models here.
admin.site.register(SiteSettings)
admin.site.register(Attachment)
