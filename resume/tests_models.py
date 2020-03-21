"Testing the models defined for the resume app"
from django.test import TestCase
from django.utils import timezone
from django.core.exceptions import ValidationError
from . import models
# Create your tests here.

class TestModels(TestCase):
    "Class to test the models module"
    def setUp(self):
        "Provide values to all tests"
        self.company = models.Company.objects.create(
            name='Test Company'
        )
        self.exp = models.Experience.objects.create(
            name='Test Experience 4!',
            start_date=timezone.datetime(2019, 1, 1),
            company=self.company,
            current=True,
        )

    def test_experience_creation(self):
        "Test the creation of an Experience instance"
        self.assertIsInstance(self.exp, models.Experience)

    def test_dates_validation(self):
        "Test the validation provided by the Datable model"
        with self.assertRaises(ValidationError):
            models.Experience.objects.create(
                name='Test Experience 1',
                start_date=timezone.datetime(2020, 2, 1),
                end_date=timezone.datetime(2020, 1, 1),
                company=self.company
            )
        with self.assertRaises(ValidationError):
            models.Experience.objects.create(
                name='Test Experience 2',
                start_date=timezone.datetime(2020, 2, 1),
                end_date=timezone.now()+timezone.timedelta(1),
                company=self.company
            )
        with self.assertRaises(ValidationError):
            models.Experience.objects.create(
                name='Test Experience 3',
                start_date=timezone.now()+timezone.timedelta(1),
                company=self.company
            )

    def test_end_date_display(self):
        "Test the property to display the end date correctly"
        exp = self.exp
        self.assertEqual(exp.end_date_display, "Present")
        exp.current = False
        self.assertEqual(exp.end_date_display, "No end date")
        exp.end_date = timezone.now()
        self.assertEqual(exp.end_date_display, exp.end_date)

    def test_name_to_slug(self):
        "Test the custom save function in the Named model"
        self.assertEqual(self.exp.slug, 'test-experience-4')

    def test_name_to_str(self):
        "Test the __str__ method of Named models"
        self.assertEqual(str(self.exp), 'Test Experience 4!')
