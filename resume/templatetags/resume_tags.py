from django import template
from django.shortcuts import reverse

register = template.Library()

@register.filter()
def verbose_name(instance):
    return instance._meta.verbose_name
