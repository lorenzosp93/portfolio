from unittest.mock import patch

from django.test import TestCase, override_settings

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
        self.assertIn(b'/writing/hello-world/', response.content)

    @patch('shared.advanced_models.send_notifications_for_subscriptions')
    def test_submit_notifies_after_save_with_deep_link(self, send):
        self.post.submit = True
        self.post.save()
        payload = send.call_args.args[1]
        self.assertTrue(payload['url'].endswith('?post=hello-world'))
        self.assertIn('Hello World', payload['title'])
        self.post.refresh_from_db()
        self.assertFalse(self.post.submit)


@override_settings(FRONTEND_ASSET_ORIGIN="")
class ArticlePageTests(PostDeepLinkAndFeedTests):
    def test_article_has_server_rendered_content_and_specific_metadata(self):
        response = self.client.get('/writing/hello-world/')
        self.assertEqual(response.status_code, 200)
        self.assertContains(response, '<title>Hello World — Lorenzo Spinelli</title>', html=True)
        self.assertContains(response, '<em>markdown</em>')
        self.assertContains(response, 'rel="canonical"')
        self.assertContains(response, 'property="og:title" content="Hello World"')
        self.assertContains(response, '?post=hello-world')
        data = self.client.get('/api/blog/post/?slug=hello-world').json()
        rows = data['results'] if isinstance(data, dict) else data
        self.assertEqual(rows[0]['canonical_url'], self.post.get_article_url())

    def test_unpublished_article_is_not_readable_or_indexed(self):
        self.post.active = False
        self.post.save()
        self.assertEqual(self.client.get('/writing/hello-world/').status_code, 404)
        self.assertNotContains(self.client.get('/sitemap.xml'), 'hello-world')

    def test_cms_markup_cannot_inject_scripts_or_unsafe_links(self):
        self.post.content = '<script>alert(1)</script> [bad](javascript:alert(1)) ![bad](data:text/html,x)\n\n# Heading'
        self.post.save()
        response = self.client.get('/writing/hello-world/')
        self.assertNotContains(response, '<script>')
        self.assertNotContains(response, 'href="javascript:')
        self.assertNotContains(response, 'src="data:')
        self.assertContains(response, '<h1>Heading</h1>')

    def test_sitemap_exposes_published_canonical_url(self):
        response = self.client.get('/sitemap.xml')
        self.assertEqual(response.status_code, 200)
        self.assertContains(response, self.post.get_article_url())


class FrontendAssetTests(TestCase):
    @override_settings(FRONTEND_ASSET_ORIGIN='https://portfolio.example')
    @patch('blog.frontend_assets.requests.get')
    def test_production_manifest_connects_article_to_frontend_entry(self, get):
        from .frontend_assets import _manifest_assets, frontend_assets
        _manifest_assets.cache_clear()
        get.return_value.json.return_value = {
            'index.html': {'isEntry': True, 'file': 'assets/main.js', 'css': ['assets/main.css']},
        }
        self.assertEqual(frontend_assets(), (['https://portfolio.example/assets/main.js'], ['https://portfolio.example/assets/main.css']))
        get.assert_called_once_with('https://portfolio.example/asset-manifest.json', timeout=2)
        _manifest_assets.cache_clear()
