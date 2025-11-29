from django.test import TestCase, override_settings
from django.contrib.auth.models import User
from django.urls import reverse
from django.core.cache import cache
from unittest.mock import patch, MagicMock
from .models import Quiz, Question, Choice, Category
from .services import ExplanationGenerator
import json


class ExplanationGeneratorTestCase(TestCase):
    def setUp(self):
        self.category = Category.objects.create(name="Test Category")
        self.quiz = Quiz.objects.create(
            title="Test Quiz",
            description="Test Description",
            category=self.category
        )
        self.question = Question.objects.create(
            quiz=self.quiz,
            text="What is the capital of France?",
            explanation="Paris is the capital of France."
        )
        Choice.objects.create(question=self.question, text="Paris", is_correct=True)
        Choice.objects.create(question=self.question, text="London", is_correct=False)
        Choice.objects.create(question=self.question, text="Berlin", is_correct=False)
        Choice.objects.create(question=self.question, text="Madrid", is_correct=False)

    @override_settings(GEMINI_API_KEY='test_key', GEMINI_MODEL='gemini-1.5-flash', GEMINI_MAX_TOKENS=1000, GEMINI_TEMPERATURE=0.7, EXPLANATION_CACHE_TIMEOUT=86400)
    @patch('quiz.services.genai.GenerativeModel')
    def test_generate_explanation_success(self, mock_model_class):
        """Test successful explanation generation."""
        mock_model = MagicMock()
        mock_response = MagicMock()
        mock_response.text = "Paris is the capital and most populous city of France."
        mock_model.generate_content.return_value = mock_response
        mock_model_class.return_value = mock_model

        generator = ExplanationGenerator()
        result = generator.generate_explanation(self.question)

        self.assertIsNotNone(result)
        self.assertEqual(result, "Paris is the capital and most populous city of France.")
        self.question.refresh_from_db()
        self.assertIsNotNone(self.question.ai_explanation)
        self.assertIsNotNone(self.question.ai_generated_at)
        self.assertEqual(self.question.ai_model, 'gemini-1.5-flash')

    @override_settings(GEMINI_API_KEY='test_key', GEMINI_MODEL='gemini-1.5-flash', GEMINI_MAX_TOKENS=1000, GEMINI_TEMPERATURE=0.7, EXPLANATION_CACHE_TIMEOUT=86400)
    @patch('quiz.services.genai.GenerativeModel')
    def test_generate_explanation_api_failure(self, mock_model_class):
        """Test handling of API failure."""
        mock_model = MagicMock()
        mock_model.generate_content.side_effect = Exception("API Error")
        mock_model_class.return_value = mock_model

        generator = ExplanationGenerator()
        result = generator.generate_explanation(self.question)

        self.assertIsNone(result)
        self.question.refresh_from_db()
        self.assertIsNotNone(self.question.ai_error)
        self.assertIn("API Error", self.question.ai_error)

    @override_settings(GEMINI_API_KEY=None)
    def test_generate_explanation_no_api_key(self):
        """Test behavior when API key is not configured."""
        with self.assertRaises(Exception):
            generator = ExplanationGenerator()

    @override_settings(GEMINI_API_KEY='test_key', GEMINI_MODEL='gemini-1.5-flash', GEMINI_MAX_TOKENS=1000, GEMINI_TEMPERATURE=0.7, EXPLANATION_CACHE_TIMEOUT=86400)
    def test_cache_hit(self):
        """Test that cached explanations are returned."""
        cache_key = self.question.get_cache_key()
        cached_explanation = "Cached explanation"
        cache.set(cache_key, cached_explanation, 3600)

        with patch('quiz.services.genai') as mock_genai:
            generator = ExplanationGenerator()
            result = generator.generate_explanation(self.question)

        self.assertEqual(result, cached_explanation)
        # Ensure API was not called
        mock_genai.GenerativeModel.assert_not_called()

    @override_settings(GEMINI_API_KEY='test_key', GEMINI_MODEL='gemini-1.5-flash', GEMINI_MAX_TOKENS=1000, GEMINI_TEMPERATURE=0.7, EXPLANATION_CACHE_TIMEOUT=86400)
    def test_prompt_building(self):
        """Test that prompts are built correctly."""
        generator = ExplanationGenerator()
        prompt = generator._build_prompt(self.question)

        self.assertIn("What is the capital of France?", prompt)
        self.assertIn("Paris", prompt)
        self.assertIn("London", prompt)
        self.assertIn("Correct Answer: A", prompt)

    @override_settings(GEMINI_API_KEY='test_key', GEMINI_MODEL='gemini-1.5-flash', GEMINI_MAX_TOKENS=1000, GEMINI_TEMPERATURE=0.7, EXPLANATION_CACHE_TIMEOUT=86400)
    def test_clean_explanation(self):
        """Test explanation cleaning."""
        generator = ExplanationGenerator()
        dirty_text = "```markdown\nThis is a test explanation.\n```"
        clean_text = generator._clean_explanation(dirty_text)

        self.assertEqual(clean_text, "This is a test explanation.")


class APIViewTestCase(TestCase):
    def setUp(self):
        self.user = User.objects.create_user(username='testuser', password='testpass')
        self.staff_user = User.objects.create_user(username='staffuser', password='staffpass', is_staff=True)
        self.category = Category.objects.create(name="Test Category")
        self.quiz = Quiz.objects.create(
            title="Test Quiz",
            description="Test Description",
            category=self.category
        )
        self.question = Question.objects.create(
            quiz=self.quiz,
            text="Test question?",
            explanation="Test explanation"
        )

    def test_generate_explanation_api_unauthenticated(self):
        """Test that unauthenticated users cannot access the API."""
        url = reverse('generate_explanation_api', kwargs={'question_id': self.question.id})
        response = self.client.post(url)
        self.assertEqual(response.status_code, 302)  # Redirect to login

    def test_generate_explanation_api_non_staff_no_submission(self):
        """Test that non-staff users must have quiz submission."""
        self.client.login(username='testuser', password='testpass')
        url = reverse('generate_explanation_api', kwargs={'question_id': self.question.id})
        response = self.client.post(url)
        self.assertEqual(response.status_code, 403)

    @patch('quiz.services.genai.GenerativeModel')
    def test_generate_explanation_api_success(self, mock_model_class):
        """Test successful API explanation generation."""
        # Create quiz submission for user
        from .models import QuizSubmission
        QuizSubmission.objects.create(user=self.user, quiz=self.quiz, score=1)

        mock_model = MagicMock()
        mock_response = MagicMock()
        mock_response.text = "AI generated explanation"
        mock_model.generate_content.return_value = mock_response
        mock_model_class.return_value = mock_model

        self.client.login(username='testuser', password='testpass')
        url = reverse('generate_explanation_api', kwargs={'question_id': self.question.id})
        response = self.client.post(url, HTTP_X_CSRFTOKEN='dummy')

        self.assertEqual(response.status_code, 200)
        data = json.loads(response.content)
        self.assertTrue(data['success'])
        self.assertEqual(data['explanation'], "AI generated explanation")

    def test_regenerate_explanation_api_non_staff(self):
        """Test that non-staff users cannot regenerate explanations."""
        self.client.login(username='testuser', password='testpass')
        url = reverse('regenerate_explanation_api', kwargs={'question_id': self.question.id})
        response = self.client.post(url)
        self.assertEqual(response.status_code, 403)

    def test_explanation_stats_api_non_staff(self):
        """Test that non-staff users cannot access stats."""
        self.client.login(username='testuser', password='testpass')
        url = reverse('explanation_stats_api')
        response = self.client.get(url)
        self.assertEqual(response.status_code, 403)


class ModelTestCase(TestCase):
    def setUp(self):
        self.category = Category.objects.create(name="Test Category")
        self.quiz = Quiz.objects.create(
            title="Test Quiz",
            description="Test Description",
            category=self.category
        )
        self.question = Question.objects.create(
            quiz=self.quiz,
            text="Test question?",
            explanation="Manual explanation"
        )

    def test_get_explanation_prefers_ai(self):
        """Test that get_explanation prefers AI-generated explanations."""
        self.question.ai_explanation = "AI explanation"
        self.question.save()

        self.assertEqual(self.question.get_explanation(), "AI explanation")

    def test_get_explanation_falls_back_to_manual(self):
        """Test fallback to manual explanation."""
        self.assertEqual(self.question.get_explanation(), "Manual explanation")

    def test_is_ai_generated(self):
        """Test AI generation detection."""
        self.assertFalse(self.question.is_ai_generated())
        self.question.ai_explanation = "AI content"
        self.assertTrue(self.question.is_ai_generated())

    def test_get_cache_key(self):
        """Test cache key generation."""
        expected_key = f"question_explanation_{self.question.id}"
        self.assertEqual(self.question.get_cache_key(), expected_key)
