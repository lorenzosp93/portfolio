"Define views for resume app"
from django.views.generic import ListView, DetailView, TemplateView
from . import models

# Create your views here.
class Resume(TemplateView):
    "Main page view for resume app"
    template_name = 'mainpage/resume.html'

class ExperienceListView(ListView):
    "List view for Experience objects"
    context_object_name = 'experiences'
    model = models.Experience
    section_name = "Experience"
    template_name = 'mainpage/resume/experience.html'

class ExperienceDetailView(DetailView):
    "Detail view for Experience objects"
    model = models.Experience
    template_name = 'mainpage/resume/experience_detail.html'

class EducationListView(ListView):
    "List view for Education objects"
    context_object_name = 'educations'
    model = models.Education
    template_name = 'mainpage/resume/education.html'

class EducationDetailView(DetailView):
    "Detail view for Eductaion objects"
    model = models.Education
    template_name = 'mainpage/resume/education_detail.html'

class SkillCategoryListView(ListView):
    "List view for skills within skill category"
    context_object_name = 'skillcategories'
    model = models.SkillCategory
    template_name = 'mainpage/resume/skill.html'

class ProjectDetailView(DetailView):
    "Detail view for Project objects"
    model = models.Project
    template_name = 'mainpage/resume/project_detail.html'