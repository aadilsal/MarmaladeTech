from django.core.management.base import BaseCommand, CommandError
from django.db.models import Q
from quiz.models import Question
from quiz.services import ExplanationGenerator
import logging
import time

logger = logging.getLogger(__name__)


class Command(BaseCommand):
    help = 'Generate AI explanations for questions using Gemini API'

    def add_arguments(self, parser):
        parser.add_argument(
            '--quiz-id',
            type=int,
            help='Generate explanations only for questions in this quiz',
        )
        parser.add_argument(
            '--question-id',
            type=int,
            help='Generate explanation for a specific question',
        )
        parser.add_argument(
            '--force',
            action='store_true',
            help='Force regeneration of existing explanations',
        )
        parser.add_argument(
            '--batch-size',
            type=int,
            default=10,
            help='Number of questions to process in each batch',
        )
        parser.add_argument(
            '--delay',
            type=float,
            default=1.0,
            help='Delay between API calls in seconds',
        )
        parser.add_argument(
            '--dry-run',
            action='store_true',
            help='Show what would be done without making changes',
        )

    def handle(self, *args, **options):
        try:
            generator = ExplanationGenerator()
        except Exception as e:
            raise CommandError(f"Failed to initialize ExplanationGenerator: {e}")

        # Build queryset
        queryset = Question.objects.all()

        if options['quiz_id']:
            queryset = queryset.filter(quiz_id=options['quiz_id'])
            self.stdout.write(f"Filtering by quiz ID: {options['quiz_id']}")

        if options['question_id']:
            queryset = queryset.filter(id=options['question_id'])
            self.stdout.write(f"Processing specific question ID: {options['question_id']}")

        if not options['force']:
            queryset = queryset.filter(
                Q(ai_explanation__isnull=True) | Q(ai_explanation='')
            )
            self.stdout.write("Only processing questions without AI explanations")

        total_questions = queryset.count()
        if total_questions == 0:
            self.stdout.write(self.style.WARNING("No questions found matching criteria"))
            return

        self.stdout.write(f"Found {total_questions} questions to process")

        if options['dry_run']:
            self.stdout.write("DRY RUN - Would process the following questions:")
            for question in queryset[:10]:  # Show first 10
                self.stdout.write(f"  - Question {question.id}: {question.text[:50]}...")
            if total_questions > 10:
                self.stdout.write(f"  ... and {total_questions - 10} more")
            return

        # Process questions in batches
        processed = 0
        successful = 0
        failed = 0

        batch_size = options['batch_size']
        delay = options['delay']

        self.stdout.write(f"Processing in batches of {batch_size} with {delay}s delay...")

        for i in range(0, total_questions, batch_size):
            batch = queryset[i:i + batch_size]

            for question in batch:
                processed += 1
                self.stdout.write(f"Processing question {question.id} ({processed}/{total_questions})...")

                try:
                    explanation = generator.generate_explanation(question)

                    if explanation:
                        successful += 1
                        self.stdout.write(
                            self.style.SUCCESS(f"✓ Generated explanation for question {question.id}")
                        )
                    else:
                        failed += 1
                        self.stdout.write(
                            self.style.ERROR(f"✗ Failed to generate explanation for question {question.id}")
                        )

                except Exception as e:
                    failed += 1
                    logger.error(f"Error processing question {question.id}: {e}")
                    self.stdout.write(
                        self.style.ERROR(f"✗ Error processing question {question.id}: {e}")
                    )

                # Delay between requests to avoid rate limiting
                if delay > 0 and processed < total_questions:
                    time.sleep(delay)

        # Summary
        self.stdout.write("\n" + "="*50)
        self.stdout.write("PROCESSING COMPLETE")
        self.stdout.write("="*50)
        self.stdout.write(f"Total questions processed: {processed}")
        self.stdout.write(self.style.SUCCESS(f"Successful: {successful}"))
        self.stdout.write(self.style.ERROR(f"Failed: {failed}"))

        if successful > 0:
            success_rate = (successful / processed) * 100
            self.stdout.write(f"Success rate: {success_rate:.1f}%")

        # Show cost estimate
        try:
            stats = generator.get_generation_stats()
            if stats['total_cost'] > 0:
                self.stdout.write(f"Estimated total cost: ${stats['total_cost']:.4f}")
        except Exception as e:
            self.stdout.write(self.style.WARNING(f"Could not retrieve cost stats: {e}"))