"Define views for resume app"
from django.views.generic import ListView, DetailView, TemplateView
from .models import (
    Experience, Education, Project,
    Skill, SkillCategory, 
)


# Create your views here.
class Resume(TemplateView):
    "Main page view for resume app"
    template_name = 'mainpage/resume.html'

class ExperienceListView(ListView):
    "List view for Experience objects"
    context_object_name = 'entries'
    model = Experience
    section_name = "Experience"
    template_name = 'mainpage/resume/cv_entries.html'

class ExperienceDetailView(DetailView):
    "Detail view for Experience objects"
    model = Experience
    template_name = 'mainpage/resume/cv_entry.html'
    context_object_name = 'entry'

class EducationListView(ListView):
    "List view for Education objects"
    context_object_name = 'entries'
    model = Education
    template_name = 'mainpage/resume/cv_entries.html'

class EducationDetailView(DetailView):
    "Detail view for Eductaion objects"
    model = Education
    template_name = 'mainpage/resume/cv_entry.html'
    context_object_name = 'entry'

class SkillCategoryListView(ListView):
    "List view for skills within skill category"
    context_object_name = 'skillcategories'
    model = SkillCategory
    template_name = 'mainpage/resume/skill.html'

class ProjectListView(ListView):
    "List view for Project objects"
    model = Project
    template_name = 'mainpage/resume/projects.html'
    context_object_name = 'projects'

class ProjectDetailView(DetailView):
    "Detail view for Project objects"
    model = Project
    template_name = 'mainpage/resume/project.html'