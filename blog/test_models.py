"Testing the models defined for the blog app"
from time import sleep
from django.test import TestCase
from django.contrib.auth.models import User
from django.utils import timezone
from . import models
# Create your tests here.

class TestBlogModels(TestCase):
    "Test the models in the Blog app"
    def setUp(self):
        self.user = User.objects.create(
            username='testuser',
            password='testpass1',
        )
        self.post = models.Post.objects.create(
            name="Test Blog Post 1",
            created_by=self.user,
            modified_by=self.user,
        )

    def test_post_creation(self):
        "Testing creation of Post object"
        self.assertIsInstance(self.post, models.Post)

    def test_post_audit(self):
        "Testing auditing fields for Post object"
        self.assertEqual(self.post.created_by, self.user)

    def test_post_timestamps(self):
        "Test the modified_at functionality on save"
        newpost = models.Post.objects.create(
            name='Test Blog Post 2',
            created_by=self.user,
            modified_by=self.user,
        )
        sleep(0.01) # sleep 10 milliseconds
        newpost.save()
        self.assertNotAlmostEqual(
            newpost.created_at,
            timezone.now(),
            delta=timezone.timedelta(milliseconds=10)
        )
        self.assertAlmostEqual(
            newpost.modified_at,
            timezone.now(),
            delta=timezone.timedelta(milliseconds=10)
        )
