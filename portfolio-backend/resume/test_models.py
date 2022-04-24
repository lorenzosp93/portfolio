"Testing the models defined for the resume app"
from time import sleep
from django.test import TestCase
from django.utils import timezone
from django.core.exceptions import ValidationError
from . import models
# Create your tests here.

class TestResumeModels(TestCase):
    "Class to test the models module"
    def setUp(self):
        "Provide values to all tests"
        self.entity = models.Entity.objects.create(
            name='Test Entity',
            type=0,
        )
        self.exp = models.Experience.objects.create(
            name='Test Experience 4!',
            start_date=timezone.datetime(2019, 1, 1).date(),
            entity=self.entity,
            current=True,
        )
        self.edu = models.Education.objects.create(
            name='Test Education 1!',
            start_date=timezone.datetime(2018, 1, 1).date(),
            entity=self.entity,
            current=True,
        )

    def test_experience_creation(self):
        "Test the creation of an Experience instance"
        self.assertIsInstance(self.exp, models.Experience)

    def test_education_creation(self):
        "Test the creation of an Experience instance"
        self.assertIsInstance(self.edu, models.Education)

    def test_dates_validation(self):
        "Test the validation provided by the Datable model"
        with self.assertRaises(ValidationError):
            models.Experience.objects.create(
                name='Test Experience 1',
                start_date=timezone.datetime(2020, 2, 1).date(),
                end_date=timezone.datetime(2020, 1, 1).date(),
                entity=self.entity
            )
        with self.assertRaises(ValidationError):
            models.Experience.objects.create(
                name='Test Experience 2',
                start_date=timezone.datetime(2020, 2, 1).date(),
                end_date=timezone.now().date()+timezone.timedelta(1),
                entity=self.entity
            )
        with self.assertRaises(ValidationError):
            models.Experience.objects.create(
                name='Test Experience 3',
                start_date=timezone.now().date()+timezone.timedelta(1),
                entity=self.entity
            )

    def test_experience_timestamps(self):
        "Test the modified_at functionality on save"
        exp = models.Experience.objects.create(
            name='Test Experience',
            start_date=timezone.datetime(2020, 1, 1).date(),
            entity=self.entity,
            modified_at=timezone.now()-timezone.timedelta(1),
        )
        sleep(0.01) # sleep 10 milliseconds
        exp.save()
        self.assertNotAlmostEqual(
            exp.created_at,
            timezone.now(),
            delta=timezone.timedelta(milliseconds=10)
        )
        self.assertAlmostEqual(
            exp.modified_at,
            timezone.now(),
            delta=timezone.timedelta(milliseconds=10)
        )

    def test_end_date_display(self):
        "Test the property to display the end date correctly"
        exp = self.exp
        self.assertEqual(exp.end_date_display, "Present")
        exp.current = False
        self.assertEqual(exp.end_date_display, "No end date")
        exp.end_date = timezone.now().date()
        self.assertEqual(exp.end_date_display, exp.end_date)

    def test_name_to_slug(self):
        "Test the custom save function in the Named model"
        self.assertEqual(self.exp.slug, 'test-experience-4')

    def test_name_to_str(self):
        "Test the __str__ method of Named models"
        self.assertEqual(str(self.exp), 'Test Experience 4!')
