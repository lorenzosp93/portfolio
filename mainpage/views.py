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
    template_name = 'mainpage/resume/experience.html'

class EducationListView(ListView):
    context_object_name = 'educations'
    model = models.Education
    template_name = 'mainpage/resume/education.html'


