"Define blog models within admin interface"
from django.contrib import admin
from .models import Post, Comment

class AuditAdmin(admin.ModelAdmin):
    "Model to audit the created_by and modified_by users"
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
admin.site.register(Comment, AuditAdmin)
