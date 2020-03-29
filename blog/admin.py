"Define blog models within admin interface"
from django.contrib import admin
from .models import Post

class AuditAdmin(admin.ModelAdmin):
    def save_model(self, request, instance, form, change):
        user = request.user 
        if not instance:
            instance = form.save(commit=False)
        if not change or not instance.created_by:
            instance.created_by = user
        instance.modified_by = user
        super().save_model(request, instance, form, change)

# Register your models here.
admin.site.register(Post, AuditAdmin)
