"Define views for main app"
from django.views.generic import TemplateView

class About(TemplateView):
    "Template view for About page"
    template_name = 'mainpage/about.html'

class Contact(TemplateView):
    "Template view for Contact page"
    template_name = 'mainpage/contact.html'
