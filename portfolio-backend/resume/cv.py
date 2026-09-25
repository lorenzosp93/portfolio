"""Public, printable CV rendered from résumé data (no phone or email)."""
from django.conf import settings
from django.utils.cache import patch_cache_control
from django.views.generic import TemplateView

from shared.models import SiteSettings

from .models import Education, Experience, Language, Skill


class CVView(TemplateView):
    template_name = 'resume/cv.html'

    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)
        site = SiteSettings.objects.filter(pk=1).first() or SiteSettings()
        picture = site.cv_picture or site.hero_picture
        website = settings.FRONTEND_HOST.rstrip('/')
        context.update(
            site=site,
            picture_url=picture.url if picture else '',
            website=website,
            website_label=website.split('://', 1)[-1],
            experiences=Experience.objects.select_related('entity').order_by('-start_date'),
            educations=Education.objects.select_related('entity').order_by('-start_date'),
            skills=Skill.objects.filter(cv_proficiency__isnull=False).order_by('-cv_proficiency', 'name'),
            languages=Language.objects.all(),
        )
        return context

    def render_to_response(self, context, **response_kwargs):
        response = super().render_to_response(context, **response_kwargs)
        patch_cache_control(response, public=True, max_age=300)
        return response
