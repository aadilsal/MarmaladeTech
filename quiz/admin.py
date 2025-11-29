from django.contrib import admin
from .models import Category, Quiz, Question, Choice, QuizSubmission, UserRank
from django.utils.html import format_html
from django.urls import reverse
from django.utils import timezone
from django.contrib import messages
from django.http import HttpResponseRedirect
from django.template.response import TemplateResponse
import json


@admin.register(Category)
class CategoryAdmin(admin.ModelAdmin):
    list_display = ['name']
    search_fields = ['name']


@admin.register(Quiz)
class QuizAdmin(admin.ModelAdmin):
    list_display = ['title', 'category', 'created_at', 'question_count']
    list_filter = ['category', 'created_at']
    search_fields = ['title', 'description']
    readonly_fields = ['created_at', 'updated_at']

    def question_count(self, obj):
        return obj.question_set.count()
    question_count.short_description = "Questions"


class ChoiceInline(admin.TabularInline):
    model = Choice
    extra = 0
    readonly_fields = ['is_correct']


@admin.register(Question)
class QuestionAdmin(admin.ModelAdmin):
    list_display = ['id', 'quiz', 'short_text', 'has_explanation', 'ai_status', 'ai_cost_display']
    list_filter = ['quiz', 'ai_generated_at', 'ai_model']
    search_fields = ['text', 'explanation', 'ai_explanation']
    readonly_fields = ['ai_generated_at', 'ai_cost', 'ai_model', 'ai_error']
    inlines = [ChoiceInline]
    actions = ['generate_ai_explanations', 'regenerate_ai_explanations']

    fieldsets = (
        ('Basic Information', {
            'fields': ('quiz', 'text', 'image')
        }),
        ('Explanations', {
            'fields': ('explanation', 'ai_explanation', 'ai_generated_at', 'ai_model', 'ai_cost', 'ai_error')
        }),
    )

    def short_text(self, obj):
        return obj.text[:50] + "..." if len(obj.text) > 50 else obj.text
    short_text.short_description = "Question"

    def has_explanation(self, obj):
        return bool(obj.explanation or obj.ai_explanation)
    has_explanation.boolean = True
    has_explanation.short_description = "Has Explanation"

    def ai_status(self, obj):
        if obj.ai_explanation:
            return format_html('<span style="color: green;">✓ AI Generated</span>')
        elif obj.ai_error:
            return format_html('<span style="color: red;">✗ Failed</span>')
        else:
            return format_html('<span style="color: orange;">○ Not Generated</span>')
    ai_status.short_description = "AI Status"

    def ai_cost_display(self, obj):
        if obj.ai_cost:
            return f"${obj.ai_cost:.4f}"
        return "-"
    ai_cost_display.short_description = "AI Cost"

    def generate_ai_explanations(self, request, queryset):
        """Admin action to generate AI explanations for selected questions."""
        from .services import ExplanationGenerator

        try:
            generator = ExplanationGenerator()
            successful = 0
            failed = 0

            for question in queryset:
                try:
                    explanation = generator.generate_explanation(question)
                    if explanation:
                        successful += 1
                    else:
                        failed += 1
                except Exception as e:
                    failed += 1
                    self.message_user(
                        request,
                        f"Error generating explanation for question {question.id}: {e}",
                        level=messages.ERROR
                    )

            if successful > 0:
                self.message_user(
                    request,
                    f"Successfully generated {successful} AI explanations.",
                    level=messages.SUCCESS
                )
            if failed > 0:
                self.message_user(
                    request,
                    f"Failed to generate {failed} explanations.",
                    level=messages.ERROR
                )

        except Exception as e:
            self.message_user(
                request,
                f"Error initializing AI service: {e}",
                level=messages.ERROR
            )

    generate_ai_explanations.short_description = "Generate AI explanations for selected questions"

    def regenerate_ai_explanations(self, request, queryset):
        """Admin action to regenerate AI explanations for selected questions."""
        from .services import ExplanationGenerator

        try:
            generator = ExplanationGenerator()
            successful = 0
            failed = 0

            for question in queryset:
                try:
                    explanation = generator.regenerate_explanation(question)
                    if explanation:
                        successful += 1
                    else:
                        failed += 1
                except Exception as e:
                    failed += 1
                    self.message_user(
                        request,
                        f"Error regenerating explanation for question {question.id}: {e}",
                        level=messages.ERROR
                    )

            if successful > 0:
                self.message_user(
                    request,
                    f"Successfully regenerated {successful} AI explanations.",
                    level=messages.SUCCESS
                )
            if failed > 0:
                self.message_user(
                    request,
                    f"Failed to regenerate {failed} explanations.",
                    level=messages.ERROR
                )

        except Exception as e:
            self.message_user(
                request,
                f"Error initializing AI service: {e}",
                level=messages.ERROR
            )

    regenerate_ai_explanations.short_description = "Regenerate AI explanations for selected questions"


@admin.register(Choice)
class ChoiceAdmin(admin.ModelAdmin):
    list_display = ['question', 'short_text', 'is_correct']
    list_filter = ['is_correct', 'question__quiz']
    search_fields = ['text', 'question__text']

    def short_text(self, obj):
        return obj.text[:30] + "..." if len(obj.text) > 30 else obj.text
    short_text.short_description = "Choice"


@admin.register(QuizSubmission)
class QuizSubmissionAdmin(admin.ModelAdmin):
    list_display = ['user', 'quiz', 'score', 'submitted_at']
    list_filter = ['submitted_at', 'quiz']
    search_fields = ['user__username', 'quiz__title']
    readonly_fields = ['submitted_at']


@admin.register(UserRank)
class UserRankAdmin(admin.ModelAdmin):
    list_display = ['rank', 'user', 'total_score']
    list_filter = ['rank']
    search_fields = ['user__username']
    readonly_fields = ['rank', 'total_score']