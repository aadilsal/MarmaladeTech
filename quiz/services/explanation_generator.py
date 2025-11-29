import google.generativeai as genai
from django.conf import settings
from django.core.cache import cache
from django.utils import timezone
from django.core.exceptions import ValidationError
import logging
import re
from typing import Optional, Dict, Any

logger = logging.getLogger(__name__)


class ExplanationGenerator:
    """
    Service class for generating AI explanations using Google's Gemini API.
    Handles caching, rate limiting, error handling, and cost tracking.
    """

    def __init__(self):
        self.api_key = settings.GEMINI_API_KEY
        self.model_name = settings.GEMINI_MODEL
        self.max_tokens = settings.GEMINI_MAX_TOKENS
        self.temperature = settings.GEMINI_TEMPERATURE
        self.cache_timeout = settings.EXPLANATION_CACHE_TIMEOUT

        if not self.api_key:
            raise ValidationError("GEMINI_API_KEY is not configured")

        genai.configure(api_key=self.api_key)
        self.model = genai.GenerativeModel(self.model_name)

    def generate_explanation(self, question) -> Optional[str]:
        """
        Generate an AI explanation for a question.
        Returns the explanation text or None if generation fails.
        """
        from ..models import Question

        if not isinstance(question, Question):
            raise ValueError("Invalid question object")

        # Check cache first
        cache_key = question.get_cache_key()
        cached_explanation = cache.get(cache_key)
        if cached_explanation:
            logger.info(f"Cache hit for question {question.id}")
            return cached_explanation

        try:
            # Generate prompt
            prompt = self._build_prompt(question)

            # Generate response
            response = self.model.generate_content(
                prompt,
                generation_config=genai.types.GenerationConfig(
                    max_output_tokens=self.max_tokens,
                    temperature=self.temperature,
                )
            )

            if not response or not response.text:
                raise ValueError("Empty response from Gemini API")

            explanation = self._clean_explanation(response.text)

            # Update question model
            question.ai_explanation = explanation
            question.ai_generated_at = timezone.now()
            question.ai_model = self.model_name
            question.ai_error = None

            # Estimate cost (rough approximation for Gemini 1.5 Flash)
            # Input tokens + output tokens * rate
            input_tokens = len(prompt.split()) * 1.3  # rough estimate
            output_tokens = len(explanation.split()) * 1.3
            estimated_cost = (input_tokens + output_tokens) * 0.00000015  # $0.15 per million tokens
            question.ai_cost = estimated_cost

            question.save()

            # Cache the result
            cache.set(cache_key, explanation, self.cache_timeout)

            logger.info(f"Successfully generated explanation for question {question.id}")
            return explanation

        except Exception as e:
            error_msg = f"Failed to generate explanation: {str(e)}"
            logger.error(error_msg)

            # Store error in question model
            question.ai_error = error_msg
            question.save()

            return None

    def _build_prompt(self, question) -> str:
        """
        Build the prompt for the AI model based on the question.
        """
        choices_text = "\n".join([
            f"{chr(65 + i)}. {choice.text}"
            for i, choice in enumerate(question.choice_set.all())
        ])

        correct_choice = question.choice_set.filter(is_correct=True).first()
        correct_answer = chr(65 + list(question.choice_set.all()).index(correct_choice)) if correct_choice else "Unknown"

        # Check if this appears to be a medical question
        medical_keywords = ['medical', 'clinical', 'anatomy', 'physiology', 'pathology', 'pharmacology', 
                           'biochemistry', 'microbiology', 'histology', 'embryology', 'genetics',
                           'cardiology', 'neurology', 'oncology', 'endocrinology', 'gastroenterology',
                           'hematology', 'immunology', 'nephrology', 'pulmonology', 'rheumatology',
                           'dermatology', 'ophthalmology', 'otolaryngology', 'urology', 'gynecology',
                           'obstetrics', 'pediatrics', 'psychiatry', 'surgery', 'radiology']
        
        question_text_lower = question.text.lower()
        is_medical = any(keyword in question_text_lower for keyword in medical_keywords)
        
        if is_medical:
            prompt = f"""
You are an expert medical educator creating explanations for MDCAT (Medical and Dental College Admission Test) questions.

Question: {question.text}

Options:
{choices_text}

Correct Answer: {correct_answer}

Please provide a clear, concise, and medically accurate explanation for why the correct answer is right and why the other options are incorrect. Focus on:

1. Key medical concepts and principles
2. Clinical reasoning
3. Why incorrect options are wrong (common misconceptions)
4. Relevant anatomical/physiological facts

Keep the explanation educational and suitable for medical students preparing for entrance exams.

Explanation:
"""
        else:
            prompt = f"""
You are an expert educator creating explanations for quiz questions.

Question: {question.text}

Options:
{choices_text}

Correct Answer: {correct_answer}

Please provide a clear, concise, and accurate explanation for why the correct answer is right and why the other options are incorrect. Focus on:

1. Key concepts and principles
2. Logical reasoning
3. Why incorrect options are wrong (common misconceptions)
4. Relevant facts and context

Keep the explanation educational and helpful for students.

Explanation:
"""

        return prompt.strip()

    def _clean_explanation(self, text: str) -> str:
        """
        Clean and format the generated explanation.
        """
        # Remove any markdown code blocks if present
        text = re.sub(r'```\w*\n?', '', text)
        text = text.strip()

        # Ensure proper formatting
        return text

    def get_generation_stats(self) -> Dict[str, Any]:
        """
        Get statistics about explanation generation.
        """
        from ..models import Question
        from django.db.models import Count, Sum, Avg, Q

        stats = Question.objects.aggregate(
            total_questions=Count('id'),
            ai_generated=Count('ai_explanation', filter=~Q(ai_explanation='')),
            total_cost=Sum('ai_cost'),
            avg_cost=Avg('ai_cost'),
        )

        return {
            'total_questions': stats['total_questions'],
            'ai_generated_count': stats['ai_generated'],
            'total_cost': float(stats['total_cost'] or 0),
            'average_cost': float(stats['avg_cost'] or 0),
            'cache_timeout': self.cache_timeout,
        }

    def clear_cache_for_question(self, question):
        """
        Clear cache for a specific question.
        """
        cache_key = question.get_cache_key()
        cache.delete(cache_key)

    def regenerate_explanation(self, question) -> Optional[str]:
        """
        Force regenerate explanation, clearing cache and existing data.
        """
        # Clear cache
        self.clear_cache_for_question(question)

        # Clear existing AI data
        question.ai_explanation = None
        question.ai_generated_at = None
        question.ai_cost = None
        question.ai_error = None
        question.save()

        # Generate new explanation
        return self.generate_explanation(question)