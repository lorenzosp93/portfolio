from django import template
from django.shortcuts import reverse

register = template.Library()

@register.filter()
def verbose_name(instance):
    return instance._meta.verbose_name


# --- Printable CV helpers -------------------------------------------------
import re

from django.utils.html import escape
from django.utils.safestring import mark_safe

_LINK = re.compile(r'\[([^\]]+)\]\(([^)\s]+)\)')
_BOLD = re.compile(r'\*\*(.+?)\*\*')
_ITALIC = re.compile(r'(?<![\*\w])\*(?!\s)(.+?)(?<!\s)\*(?!\*)')
_SAFE_URL = re.compile(r'^(https?:|mailto:|/|#)', re.IGNORECASE)
_BULLET = re.compile(r'^\s*[-*+]\s+')


def _inline(text):
    text = escape(text)

    def link(match):
        label, url = match.group(1), match.group(2)
        if not _SAFE_URL.match(url):
            return label
        return f'<a href="{url}">{label}</a>'

    text = _LINK.sub(link, text)
    text = _BOLD.sub(r'<strong>\1</strong>', text)
    return _ITALIC.sub(r'<em>\1</em>', text)


@register.filter(name='cv_markdown')
def cv_markdown(value):
    """Small, safe Markdown subset for CV text: paragraphs, bullets, bold,
    italics and links. Everything else is escaped."""
    if not value:
        return ''
    blocks, paragraph, items = [], [], []

    def flush():
        if paragraph:
            blocks.append('<p>' + ' '.join(paragraph) + '</p>')
            paragraph.clear()
        if items:
            blocks.append('<ul>' + ''.join(f'<li>{item}</li>' for item in items) + '</ul>')
            items.clear()

    for raw in str(value).replace('\r\n', '\n').split('\n'):
        line = raw.strip()
        if not line:
            flush()
        elif _BULLET.match(raw):
            if paragraph:
                flush()
            items.append(_inline(_BULLET.sub('', raw).strip()))
        elif items and raw[:1].isspace():
            items[-1] += ' ' + _inline(line)  # wrapped bullet continuation
        else:
            if items:
                flush()
            paragraph.append(_inline(line))
    flush()
    return mark_safe(''.join(blocks))


@register.filter(name='cv_month')
def cv_month(value):
    return value.strftime('%b %Y') if value else ''
