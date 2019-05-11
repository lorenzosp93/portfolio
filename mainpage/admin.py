from django.contrib import admin
from mainpage.models import Education, Experience, Company, Project, Skill

# Register your models here.
admin.site.register(Education)
admin.site.register(Experience)
admin.site.register(Company)
admin.site.register(Project)
admin.site.register(Skill)