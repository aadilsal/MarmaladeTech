from django.contrib import admin
from .models import Category, Quiz, Question, Choice, QuizSubmission, UserRank
from django.utils.html import format_html
from django.urls import reverse
from django.utils import timezone
from django.contrib import messages
from django.http import HttpResponseRedirect
from django.template.response import TemplateResponse
import json
from django.db import models
from django.contrib.auth import get_user_model

# Use get_user_model so custom user models are supported
User = get_user_model()


@admin.register(Category)
class CategoryAdmin(admin.ModelAdmin):
    list_display = ['name']
    search_fields = ['name']


from django import forms


class QuizAdminForm(forms.ModelForm):
    class Meta:
        model = Quiz
        fields = '__all__'

    def clean_quiz_file(self):
        f = self.cleaned_data.get('quiz_file')
        if not f:
            return f
        allowed_types = [
            'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
            'application/vnd.ms-excel',
            'text/csv'
        ]
        max_size = 5 * 1024 * 1024
        # content_type may not be present for already-saved files
        content_type = getattr(f, 'content_type', None)
        if content_type and content_type not in allowed_types:
            raise forms.ValidationError('Invalid file type. Please upload XLSX, XLS or CSV.')
        if f.size > max_size:
            raise forms.ValidationError('File too large. Maximum allowed size is 5MB.')
        return f


class QuestionInline(admin.TabularInline):
    model = Question
    extra = 0
    fields = ('text', 'explanation', 'image')


@admin.register(Quiz)
class QuizAdmin(admin.ModelAdmin):
    form = QuizAdminForm
    inlines = [QuestionInline]
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




# Wrap default index to include dashboard context
_orig_admin_index = admin.site.index

def index_with_dashboard(request, extra_context=None):
    # Handle upload POST from the dashboard panel
    if request.method == 'POST' and request.POST.get('action') == 'upload_quiz':
        uploaded = request.FILES.get('quiz_file')
        title = request.POST.get('title')
        description = request.POST.get('description', '')
        category_id = request.POST.get('category')

        # Basic validation
        if not title or not uploaded or not category_id:
            messages.error(request, 'Title, category, and file are required to upload a quiz.')
            return HttpResponseRedirect(request.path)

        allowed_types = [
            'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
            'application/vnd.ms-excel',
            'text/csv'
        ]
        max_size = 5 * 1024 * 1024  # 5MB

        if uploaded.content_type not in allowed_types:
            messages.error(request, 'Invalid file type. Please upload XLSX, XLS or CSV.')
            return HttpResponseRedirect(request.path)

        if uploaded.size > max_size:
            messages.error(request, 'File too large. Maximum allowed size is 5MB.')
            return HttpResponseRedirect(request.path)

        try:
            category = Category.objects.get(id=category_id)
        except Category.DoesNotExist:
            messages.error(request, 'Selected category does not exist.')
            return HttpResponseRedirect(request.path)

        try:
            quiz = Quiz(title=title, description=description, category=category)
            quiz.quiz_file = uploaded
            quiz.save()
            messages.success(request, f'Quiz "{title}" uploaded and imported successfully.')
        except Exception as e:
            messages.error(request, f'Error importing quiz: {e}')
            return HttpResponseRedirect(request.path)

        return HttpResponseRedirect(request.path)

    # Compute metrics (same as custom dashboard)
    total_users = User.objects.count()
    total_quizzes = Quiz.objects.count()
    total_questions = Question.objects.count()
    total_submissions = QuizSubmission.objects.count()
    submissions_today = QuizSubmission.objects.filter(submitted_at__date=timezone.now().date()).count()

    # Average score across all submissions
    avg_score = None
    if total_submissions > 0:
        from django.db.models import Avg
        avg_score = QuizSubmission.objects.aggregate(avg=Avg('score'))['avg']

    extra = {
        'total_users': total_users,
        'total_quizzes': total_quizzes,
        'total_questions': total_questions,
        'total_submissions': total_submissions,
        'submissions_today': submissions_today,
        'avg_score': avg_score,
        'quizzes_with_no_questions': Quiz.objects.annotate(q_count=models.Count('question')).filter(q_count=0).count(),
        'pending_ai_errors': Question.objects.filter(ai_error__isnull=False).exclude(ai_error__exact='').count(),
        'top_users': User.objects.annotate(total_score=models.Sum('userrank__total_score')).order_by('-total_score')[:5],
        'categories': Category.objects.all()
    }

    if extra_context:
        extra_context.update(extra)
    else:
        extra_context = extra

    return _orig_admin_index(request, extra_context=extra_context)

admin.site.index = index_with_dashboard

# Add a link to the admin index (simple template override could be used but we'll add a short message hook)
admin.site.site_header = 'MDCAT Expert Admin'
admin.site.index_title = 'Site Administration'
admin.site.site_title = 'MDCAT Expert'