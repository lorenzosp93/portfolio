from django.contrib import admin
from resume.models import (Education, Experience, Company, 
                             Project, Skill, Attachment, SkillCategory)

# Register your models here.
admin.site.register(Education)
admin.site.register(Experience)
admin.site.register(Company)
admin.site.register(Project)
admin.site.register(Attachment)
admin.site.register(Skill)
admin.site.register(SkillCategory)