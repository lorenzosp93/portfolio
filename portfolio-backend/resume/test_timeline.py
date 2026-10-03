from datetime import date
from uuid import UUID
from django.contrib.auth import get_user_model
from django.test import TestCase
from django.urls import reverse
from shared.models import Attachment, SiteSettings
from .models import Education, Entity, Experience, Keyword


class TimelineTests(TestCase):
    def setUp(self):
        self.company = Entity.objects.create(name='Company', type=0)
        Entity.objects.filter(pk=self.company.pk).update(picture='logos/example.png')
        self.school = Entity.objects.create(name='University', type=1)
        self.role = Experience.objects.create(
            name='Current role', entity=self.company, start_date=date(2020, 1, 1),
            current=True, location='Amsterdam', description='Full original description',
            key_achievements='- Achievement', timeline_summary='Short preview',
            narrative_heading='A new chapter', narrative_body='A wider scope.',
            transition_motif='detour', uuid=UUID(int=3),
        )
        self.degree = Education.objects.create(
            name='Degree', entity=self.school, start_date=date(2012, 1, 1),
            end_date=date(2015, 1, 1), location='Milan', uuid=UUID(int=1),
        )
        self.role.keywords.add(Keyword.objects.create(name='Product'))
        self.role.attachments.add(Attachment.objects.create(name='Reference', file='attachments/reference.pdf'))
        SiteSettings.load()

    def test_complete_feed_ignores_pagination_and_keeps_details(self):
        response = self.client.get('/api/resume/timeline/?limit=1&offset=999')
        self.assertEqual(response.status_code, 200)
        data = response.json()
        self.assertNotIn('next', data)
        self.assertEqual([entry['uuid'] for entry in data['entries']], [str(self.degree.uuid), str(self.role.uuid)])
        entry = data['entries'][1]
        for key, value in {'kind': 'experience', 'description': 'Full original description',
                           'timeline_summary': 'Short preview', 'key_achievements': '- Achievement',
                           'transition_motif': 'detour', 'narrative_heading': 'A new chapter',
                           'keywords': [{'name': 'Product'}], 'projects': [], 'end_date': None,
                           'current': True}.items():
            self.assertEqual(entry[key], value)
        self.assertEqual(len(entry['attachments']), 1)
        self.assertTrue(entry['entity']['picture'].endswith('/logos/example.png'))

    def test_equal_dates_have_stable_kind_and_uuid_order(self):
        Education.objects.create(name='Later study', entity=self.school, start_date=self.role.start_date,
                                 location='Milan', uuid=UUID(int=8))
        Experience.objects.create(name='Parallel role', entity=self.company, start_date=self.role.start_date,
                                  location='Milan', uuid=UUID(int=2))
        entries = self.client.get('/api/resume/timeline/').json()['entries']
        self.assertEqual([entry['uuid'] for entry in entries], [str(UUID(int=i)) for i in (1, 8, 2, 3)])

    def test_copy_is_live_and_empty_feed_is_valid(self):
        site = SiteSettings.load()
        site.timeline_heading = 'My journey'
        site.timeline_closing_body = 'Onward.'
        site.save()
        Education.objects.all().delete()
        Experience.objects.all().delete()
        data = self.client.get('/api/resume/timeline/').json()
        self.assertEqual(data['entries'], [])
        self.assertEqual(data['copy']['heading'], 'My journey')
        self.assertEqual(data['copy']['closing_body'], 'Onward.')

    def test_read_only_for_admin_and_old_lists_remain_paginated(self):
        self.client.force_login(get_user_model().objects.create_superuser('admin', password='test-only-password'))
        for method in ('post', 'put', 'patch', 'delete'):
            self.assertEqual(getattr(self.client, method)('/api/resume/timeline/').status_code, 405)
        old = self.client.get('/api/resume/experience/?limit=1').json()
        self.assertEqual(old['count'], 1)
        self.assertIn('next', old)
        self.assertNotIn('timeline_summary', old['results'][0])

    def test_admin_exposes_editorial_fields_separately(self):
        self.client.force_login(get_user_model().objects.create_superuser('editor', password='test-only-password'))
        for path in (reverse('admin:resume_experience_change', args=[self.role.pk]), reverse('admin:shared_sitesettings_change', args=[1])):
            response = self.client.get(path)
            self.assertEqual(response.status_code, 200)
            self.assertContains(response, 'Timeline presentation')
