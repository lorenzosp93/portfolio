from unittest.mock import patch

from django.test import TestCase

# Create your tests here.


class PostDeepLinkAndFeedTests(TestCase):
    def setUp(self):
        from django.contrib.auth import get_user_model
        from .models import Post
        author = get_user_model().objects.create_user(username='author')
        self.post = Post.objects.create(
            name='Hello World', content='Some *markdown* body.', created_by=author, modified_by=author,
        )

    def test_list_filters_by_slug(self):
        response = self.client.get('/api/blog/post/?slug=hello-world')
        self.assertEqual(response.status_code, 200)
        results = response.json()['results'] if isinstance(response.json(), dict) else response.json()
        self.assertEqual([item['slug'] for item in results], ['hello-world'])

    def test_atom_feed_lists_posts_with_deep_links(self):
        response = self.client.get('/api/blog/feed/')
        self.assertEqual(response.status_code, 200)
        self.assertIn(b'Hello World', response.content)
        self.assertIn(b'?post=hello-world', response.content)

    @patch('shared.advanced_models.send_notifications_for_subscriptions')
    def test_submit_notifies_after_save_with_deep_link(self, send):
        self.post.submit = True
        self.post.save()
        payload = send.call_args.args[1]
        self.assertTrue(payload['url'].endswith('?post=hello-world'))
        self.assertIn('Hello World', payload['title'])
        self.post.refresh_from_db()
        self.assertFalse(self.post.submit)
