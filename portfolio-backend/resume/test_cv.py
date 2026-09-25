import datetime
import os

from django.contrib.auth import get_user_model
from django.test import TestCase

from shared.models import SiteSettings

from .models import Education, Entity, Experience, Language, Skill, SkillCategory
from .templatetags.resume_tags import cv_markdown


def seed_cv():
    SiteSettings.objects.create(
        about_text='About',
        cv_headline='Head of Product | Engineer',
        cv_summary=(
            'A Product leader mixing tech knowledge and business acumen, rooted in software '
            'and energy engineering, thriving in both scrappy and established environments. '
            'Acting as Head of Product in the domain of fintech, compliance and automation.\n\n'
            'Approaching challenges with a constant drive for innovation and an ability to '
            'simplify complex problems through first principle thinking.'
        ),
        cv_location='Amsterdam, NL',
        linkedin_url='https://linkedin.com/in/lorenzosp',
    )
    category = SkillCategory.objects.create(name='Tech')
    for name, level in (('Python', 4), ('Typescript', 3), ('Kubernetes', 3), ('SQL / NoSQL', 4)):
        Skill.objects.create(name=name, category=category, level=level, show_on_cv=True)
    Skill.objects.create(name='Hidden skill', category=category, level=1)
    for order, (name, pct) in enumerate((('English', 96), ('Spanish', 90), ('Dutch', 50), ('Italian', 100))):
        Language.objects.create(name=name, proficiency=pct, order=order)
    tesla = Entity.objects.create(name='Tesla International BV', type=0)
    Experience.objects.create(
        name='Manager, Software Product Engineering', entity=tesla, location='Amsterdam, NL',
        start_date=datetime.date(2023, 3, 1), current=True,
        key_achievements=(
            '- Recruited, mentored, and set strategic and technical direction for a team of '
            '5+ senior Product Managers.\n'
            '- Designed and built a vehicle registration platform, saving upwards of **34 FTE**.'
        ),
        description='Until Nov 2025, Staff Product Manager',
    )
    Experience.objects.create(
        name='Senior Product Manager', entity=tesla, location='Amsterdam, NL',
        start_date=datetime.date(2021, 2, 1), end_date=datetime.date(2023, 3, 1),
        key_achievements='- Overhauled e-Invoicing system, from < 60% to ~100% compliance.',
    )
    polimi = Entity.objects.create(name='Politecnico di Milano', type=1)
    Education.objects.create(
        name='M.Sc. in Energy Engineering', entity=polimi, location='Milan, IT',
        start_date=datetime.date(2015, 10, 1), end_date=datetime.date(2017, 12, 1),
        description=(
            '- Production and conversion of Energy track. Final grade 110/110.\n'
            '- [Thesis article published on MDPI Energies](https://www.mdpi.com/1996-1073/15/3/1037).'
        ),
    )


class CVPageTests(TestCase):
    def setUp(self):
        seed_cv()

    def test_renders_cv_from_resume_data(self):
        response = self.client.get('/api/resume/cv/')
        self.assertEqual(response.status_code, 200)
        html = response.content.decode()
        for text in (
            'Head of Product | Engineer', 'Amsterdam, NL', 'linkedin.com/in/lorenzosp',
            'Manager, Software Product Engineering | Tesla International BV',
            'Mar 2023', 'Present', 'Feb 2021', '<strong>34 FTE</strong>',
            'Until Nov 2025, Staff Product Manager', 'width: 100%', 'width: 80%',
            'title="Expert"', 'Italian',
            'href="https://www.mdpi.com/1996-1073/15/3/1037"',
        ):
            self.assertIn(text, html)
        self.assertNotIn('Hidden skill', html)
        self.assertIn('max-age=300', response['Cache-Control'])
        if path := os.environ.get('CV_PREVIEW_PATH'):
            with open(path, 'w', encoding='utf-8') as handle:
                handle.write(html)

    def test_never_exposes_private_contact_details(self):
        get_user_model().objects.create_user(username='x', email='me@lorenzosp.com')
        html = self.client.get('/api/resume/cv/').content.decode()
        self.assertNotIn('mailto:', html)
        self.assertNotIn('@lorenzosp.com', html)
        self.assertNotIn('tel:', html)

    def test_renders_without_settings_or_entries(self):
        SiteSettings.objects.all().delete()
        Experience.objects.all().delete()
        self.assertEqual(self.client.get('/api/resume/cv/').status_code, 200)


class CVMarkdownTests(TestCase):
    def test_escapes_html_and_unsafe_links(self):
        html = cv_markdown('<script>x</script> [a](javascript:alert(1)) [b](https://ok.test)')
        self.assertNotIn('<script>', html)
        self.assertNotIn('javascript:', html)
        self.assertIn('<a href="https://ok.test">b</a>', html)

    def test_paragraphs_bullets_and_continuations(self):
        html = cv_markdown('Intro line\nsecond\n\n- one\n  continued\n- *two*')
        self.assertEqual(
            html,
            '<p>Intro line second</p><ul><li>one continued</li><li><em>two</em></li></ul>',
        )
