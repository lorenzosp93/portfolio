from django.shortcuts import render
from django.views.generic import ListView, DetailView, TemplateView
from . import models

# Create your views here.
class resume(TemplateView):
    template_name = 'mainpage/resume.html'

class about(TemplateView):
    template_name = 'mainpage/about.html'
    
class contact(TemplateView):
    template_name = 'mainpage/contact.html'

class ExperienceListView(ListView):
    context_object_name = 'experiences'
    model = models.Experience
    section_name = "Experience"
    template_name = 'mainpage/resume/experience.html'

class ExperienceDetailView(DetailView):
    model = models.Experience
    template_name = 'mainpage/resume/experience_detail.html'
    slug_field = 'role'

class EducationListView(ListView):
    context_object_name = 'educations'
    model = models.Education
    template_name = 'mainpage/resume/education.html'

class EducationDetailView(DetailView):
    model = models.Education
    template_name = 'mainpage/resume/education_detail.html'
    slug_field = 'role'

class SkillCategoryListView(ListView):
    context_object_name = 'skillcategory'
    model = models.SkillCategory
    template_name = 'mainpage/resume/skill.html'

