from django.views.generic import TemplateView

class about(TemplateView):
    template_name = 'mainpage/about.html'
    
class contact(TemplateView):
    template_name = 'mainpage/contact.html'