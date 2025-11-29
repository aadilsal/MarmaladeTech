from django.shortcuts import render, get_object_or_404, redirect
from django.contrib import messages
from django.contrib.auth.decorators import login_required
from django.contrib.auth.models import User
from django.http import JsonResponse, HttpResponse
from django.core.paginator import Paginator
from django.db.models import Count, Avg, Sum, Q
from django.utils import timezone
from datetime import timedelta
from django.views.decorators.http import require_POST
from django.views.decorators.csrf import csrf_exempt
import json
import csv

from .decorators import superuser_required
from .utils import get_dashboard_stats, log_admin_action, calculate_user_performance, export_data_to_csv
from .forms import (
    UserForm, CreateUserForm, QuestionForm, QuizForm, CategoryForm,
    BulkActionForm, SearchForm, DateRangeForm, ExportForm, ExcelUploadForm
)
from quiz.models import Question, Quiz, QuizSubmission, Category, Choice
from account.models import Profile
from .models import AdminActionLog, AdminSettings


@superuser_required
def dashboard(request):
    """Main dashboard view with statistics and recent activity"""
    stats = get_dashboard_stats()

    context = {
        'stats': stats,
        'title': 'Admin Dashboard',
        'active_page': 'dashboard',
    }

    return render(request, 'admin_dashboard/dashboard.html', context)


@superuser_required
def users_list(request):
    """List all users with filtering and pagination"""
    users = User.objects.select_related('profile').all()

    # Search functionality
    search_query = request.GET.get('q', '')
    if search_query:
        users = users.filter(
            Q(username__icontains=search_query) |
            Q(email__icontains=search_query) |
            Q(first_name__icontains=search_query) |
            Q(last_name__icontains=search_query)
        )

    # Filters
    status_filter = request.GET.get('status', '')
    if status_filter == 'active':
        users = users.filter(is_active=True)
    elif status_filter == 'inactive':
        users = users.filter(is_active=False)

    role_filter = request.GET.get('role', '')
    if role_filter == 'superuser':
        users = users.filter(is_superuser=True)
    elif role_filter == 'regular':
        users = users.filter(is_superuser=False)

    # Sorting
    sort_by = request.GET.get('sort', '-date_joined')
    users = users.order_by(sort_by)

    # Pagination
    paginator = Paginator(users, 25)
    page_number = request.GET.get('page')
    page_obj = paginator.get_page(page_number)

    # Add quiz statistics to users
    for user in page_obj:
        user.quiz_count = QuizSubmission.objects.filter(user=user).count()
        user.avg_score = QuizSubmission.objects.filter(user=user).aggregate(
            avg=Avg('score')
        )['avg'] or 0

    context = {
        'page_obj': page_obj,
        'search_query': search_query,
        'status_filter': status_filter,
        'role_filter': role_filter,
        'sort_by': sort_by,
        'title': 'Users Management',
        'active_page': 'users',
    }

    return render(request, 'admin_dashboard/users_list.html', context)


@superuser_required
def user_detail(request, user_id):
    """Detailed view of a specific user"""
    user = get_object_or_404(User.objects.select_related('profile'), pk=user_id)

    # Get user's quiz history
    submissions = QuizSubmission.objects.filter(user=user).select_related('quiz').order_by('-submitted_at')

    # Calculate performance metrics
    performance = calculate_user_performance(user)

    context = {
        'user_obj': user,
        'submissions': submissions,
        'performance': performance,
        'title': f'User: {user.username}',
        'active_page': 'users',
    }

    return render(request, 'admin_dashboard/user_detail.html', context)


@superuser_required
def user_create(request):
    """Create a new user"""
    if request.method == 'POST':
        form = CreateUserForm(request.POST)
        if form.is_valid():
            user = User.objects.create_user(
                username=form.cleaned_data['username'],
                email=form.cleaned_data['email'],
                password=form.cleaned_data['password'],
                first_name=form.cleaned_data['first_name'],
                last_name=form.cleaned_data['last_name'],
                is_superuser=form.cleaned_data['is_superuser']
            )

            # Create profile
            Profile.objects.create(user=user)

            log_admin_action(
                request.user, 'create', user,
                f"Created new user: {user.username}",
                request
            )

            messages.success(request, f'User {user.username} created successfully.')
            return redirect('admin_dashboard:user_detail', user_id=user.id)
    else:
        form = CreateUserForm()

    context = {
        'form': form,
        'title': 'Create User',
        'active_page': 'users',
    }

    return render(request, 'admin_dashboard/user_form.html', context)


@superuser_required
def user_edit(request, user_id):
    """Edit an existing user"""
    user = get_object_or_404(User, pk=user_id)

    if request.method == 'POST':
        form = UserForm(request.POST, instance=user)
        if form.is_valid():
            old_superuser = user.is_superuser
            user = form.save()

            # Handle password change
            password = form.cleaned_data.get('password')
            if password:
                user.set_password(password)
                user.save()

            # Log superuser privilege changes
            if old_superuser != user.is_superuser:
                action = "granted superuser" if user.is_superuser else "revoked superuser"
                log_admin_action(
                    request.user, 'update', user,
                    f"{action} privileges for user: {user.username}",
                    request
                )

            messages.success(request, f'User {user.username} updated successfully.')
            return redirect('admin_dashboard:user_detail', user_id=user.id)
    else:
        form = UserForm(instance=user)

    context = {
        'form': form,
        'user_obj': user,
        'title': f'Edit User: {user.username}',
        'active_page': 'users',
    }

    return render(request, 'admin_dashboard/user_form.html', context)


@superuser_required
@require_POST
def user_delete(request, user_id):
    """Delete a user"""
    user = get_object_or_404(User, pk=user_id)

    if request.POST.get('confirm') == 'yes':
        username = user.username
        log_admin_action(
            request.user, 'delete', user,
            f"Deleted user: {username}",
            request
        )

        user.delete()
        messages.success(request, f'User {username} deleted successfully.')
        return redirect('admin_dashboard:users_list')

    context = {
        'user_obj': user,
        'title': f'Delete User: {user.username}',
        'active_page': 'users',
    }

    return render(request, 'admin_dashboard/user_confirm_delete.html', context)


@superuser_required
@require_POST
def users_bulk_action(request):
    """Handle bulk actions on users"""
    form = BulkActionForm(request.POST)
    if form.is_valid():
        action = form.cleaned_data['action']
        selected_ids = form.cleaned_data['selected_items'].split(',')

        users = User.objects.filter(id__in=selected_ids)
        count = users.count()

        if action == 'activate':
            users.update(is_active=True)
            messages.success(request, f'Activated {count} users.')
        elif action == 'deactivate':
            users.update(is_active=False)
            messages.success(request, f'Deactivated {count} users.')
        elif action == 'delete':
            for user in users:
                log_admin_action(
                    request.user, 'delete', user,
                    f"Bulk deleted user: {user.username}",
                    request
                )
            users.delete()
            messages.success(request, f'Deleted {count} users.')

        log_admin_action(
            request.user, 'bulk_update', User.objects.first(),
            f"Bulk {action} on {count} users",
            request
        )

    return redirect('admin_dashboard:users_list')


# Questions Management Views
@superuser_required
def questions_list(request):
    """List all questions with filtering and pagination"""
    questions = Question.objects.select_related('quiz__category').all()

    # Search functionality
    search_query = request.GET.get('q', '')
    if search_query:
        questions = questions.filter(
            Q(text__icontains=search_query) |
            Q(quiz__title__icontains=search_query)
        )

    # Filters
    topic_filter = request.GET.get('topic', '')
    if topic_filter:
        questions = questions.filter(quiz__category_id=topic_filter)

    difficulty_filter = request.GET.get('difficulty', '')
    if difficulty_filter:
        questions = questions.filter(difficulty=difficulty_filter)

    explanation_filter = request.GET.get('explanation', '')
    if explanation_filter == 'ai':
        questions = questions.filter(ai_explanation__isnull=False)
    elif explanation_filter == 'manual':
        questions = questions.filter(ai_explanation__isnull=True, explanation__isnull=False)
    elif explanation_filter == 'none':
        questions = questions.filter(ai_explanation__isnull=True, explanation__isnull=True)

    status_filter = request.GET.get('status', '')
    if status_filter == 'active':
        questions = questions.filter(quiz__isnull=False)
    elif status_filter == 'inactive':
        questions = questions.filter(quiz__isnull=True)

    # Sorting
    sort_by = request.GET.get('sort', '-id')
    questions = questions.order_by(sort_by)

    # Pagination
    paginator = Paginator(questions, 25)
    page_number = request.GET.get('page')
    page_obj = paginator.get_page(page_number)

    # Add statistics to questions
    for question in page_obj:
        attempts = Choice.objects.filter(question=question).aggregate(
            total_attempts=Count('quizsubmission'),
            correct_attempts=Count('quizsubmission', filter=Q(is_correct=True))
        )
        question.total_attempts = attempts['total_attempts'] or 0
        question.correct_percentage = (
            (attempts['correct_attempts'] / attempts['total_attempts'] * 100)
            if attempts['total_attempts'] > 0 else 0
        )

    categories = Category.objects.all()

    context = {
        'page_obj': page_obj,
        'categories': categories,
        'search_query': search_query,
        'topic_filter': topic_filter,
        'difficulty_filter': difficulty_filter,
        'explanation_filter': explanation_filter,
        'status_filter': status_filter,
        'sort_by': sort_by,
        'title': 'Questions Management',
        'active_page': 'questions',
    }

    return render(request, 'admin_dashboard/questions_list.html', context)


@superuser_required
def question_detail(request, question_id):
    """Detailed view of a specific question"""
    question = get_object_or_404(Question.objects.select_related('quiz__category'), pk=question_id)
    choices = Choice.objects.filter(question=question)

    # Get question statistics
    attempts = Choice.objects.filter(question=question).aggregate(
        total_attempts=Count('quizsubmission'),
        correct_attempts=Count('quizsubmission', filter=Q(is_correct=True))
    )
    total_attempts = attempts['total_attempts'] or 0
    correct_percentage = (
        (attempts['correct_attempts'] / total_attempts * 100)
        if total_attempts > 0 else 0
    )

    context = {
        'question': question,
        'choices': choices,
        'total_attempts': total_attempts,
        'correct_percentage': correct_percentage,
        'title': f'Question: {question.text[:50]}...',
        'active_page': 'questions',
    }

    return render(request, 'admin_dashboard/question_detail.html', context)


@superuser_required
def question_create(request):
    """Create a new question"""
    if request.method == 'POST':
        form = QuestionForm(request.POST, request.FILES)
        if form.is_valid():
            question = form.save()

            # Create choices if provided
            for i in range(1, 5):
                choice_text = request.POST.get(f'choice_{i}')
                is_correct = request.POST.get(f'correct_choice') == str(i)

                if choice_text:
                    Choice.objects.create(
                        question=question,
                        text=choice_text,
                        is_correct=is_correct
                    )

            log_admin_action(
                request.user, 'create', question,
                f"Created new question: {question.text[:50]}...",
                request
            )

            messages.success(request, 'Question created successfully.')
            return redirect('admin_dashboard:question_detail', question_id=question.id)
    else:
        form = QuestionForm()

    context = {
        'form': form,
        'title': 'Create Question',
        'active_page': 'questions',
    }

    return render(request, 'admin_dashboard/question_form.html', context)


@superuser_required
def question_edit(request, question_id):
    """Edit an existing question"""
    question = get_object_or_404(Question, pk=question_id)

    if request.method == 'POST':
        form = QuestionForm(request.POST, request.FILES, instance=question)
        if form.is_valid():
            question = form.save()

            # Update choices
            Choice.objects.filter(question=question).delete()  # Clear existing
            for i in range(1, 5):
                choice_text = request.POST.get(f'choice_{i}')
                is_correct = request.POST.get(f'correct_choice') == str(i)

                if choice_text:
                    Choice.objects.create(
                        question=question,
                        text=choice_text,
                        is_correct=is_correct
                    )

            log_admin_action(
                request.user, 'update', question,
                f"Updated question: {question.text[:50]}...",
                request
            )

            messages.success(request, 'Question updated successfully.')
            return redirect('admin_dashboard:question_detail', question_id=question.id)
    else:
        form = QuestionForm(instance=question)

    choices = Choice.objects.filter(question=question)

    context = {
        'form': form,
        'question': question,
        'choices': choices,
        'title': f'Edit Question: {question.text[:50]}...',
        'active_page': 'questions',
    }

    return render(request, 'admin_dashboard/question_form.html', context)


@superuser_required
@require_POST
def question_delete(request, question_id):
    """Delete a question"""
    question = get_object_or_404(Question, pk=question_id)

    if request.POST.get('confirm') == 'yes':
        text_preview = question.text[:50]
        log_admin_action(
            request.user, 'delete', question,
            f"Deleted question: {text_preview}...",
            request
        )

        question.delete()
        messages.success(request, 'Question deleted successfully.')
        return redirect('admin_dashboard:questions_list')

    context = {
        'question': question,
        'title': f'Delete Question: {question.text[:50]}...',
        'active_page': 'questions',
    }

    return render(request, 'admin_dashboard/question_confirm_delete.html', context)


@superuser_required
@require_POST
def questions_bulk_action(request):
    """Handle bulk actions on questions"""
    form = BulkActionForm(request.POST)
    if form.is_valid():
        action = form.cleaned_data['action']
        selected_ids = form.cleaned_data['selected_items'].split(',')

        questions = Question.objects.filter(id__in=selected_ids)
        count = questions.count()

        if action == 'activate':
            # Logic to activate questions
            messages.success(request, f'Activated {count} questions.')
        elif action == 'deactivate':
            # Logic to deactivate questions
            messages.success(request, f'Deactivated {count} questions.')
        elif action == 'delete':
            for question in questions:
                log_admin_action(
                    request.user, 'delete', question,
                    f"Bulk deleted question: {question.text[:50]}...",
                    request
                )
            questions.delete()
            messages.success(request, f'Deleted {count} questions.')

        log_admin_action(
            request.user, 'bulk_update', Question.objects.first(),
            f"Bulk {action} on {count} questions",
            request
        )

    return redirect('admin_dashboard:questions_list')


@superuser_required
@require_POST
def generate_explanations_bulk(request):
    """Generate AI explanations for multiple questions"""
    selected_ids = request.POST.get('selected_items', '').split(',')
    questions = Question.objects.filter(id__in=selected_ids)

    generated_count = 0
    for question in questions:
        try:
            if question.generate_ai_explanation(force=True):
                generated_count += 1
        except Exception as e:
            messages.warning(request, f'Failed to generate explanation for question {question.id}: {str(e)}')

    messages.success(request, f'Generated explanations for {generated_count} questions.')
    return redirect('admin_dashboard:questions_list')


# Quizzes Management Views
@superuser_required
def quizzes_list(request):
    """List all quizzes with filtering and pagination"""
    quizzes = Quiz.objects.select_related('category').annotate(
        attempt_count=Count('quizsubmission'),
        avg_score=Avg('quizsubmission__score'),
        question_count=Count('question')
    )

    # Search functionality
    search_query = request.GET.get('q', '')
    if search_query:
        quizzes = quizzes.filter(
            Q(title__icontains=search_query) |
            Q(description__icontains=search_query)
        )

    # Filters
    topic_filter = request.GET.get('topic', '')
    if topic_filter:
        quizzes = quizzes.filter(category_id=topic_filter)

    status_filter = request.GET.get('status', '')
    # Add status filtering logic if needed

    # Sorting
    sort_by = request.GET.get('sort', '-created_at')
    quizzes = quizzes.order_by(sort_by)

    # Pagination
    paginator = Paginator(quizzes, 25)
    page_number = request.GET.get('page')
    page_obj = paginator.get_page(page_number)

    categories = Category.objects.all()

    context = {
        'page_obj': page_obj,
        'categories': categories,
        'search_query': search_query,
        'topic_filter': topic_filter,
        'status_filter': status_filter,
        'sort_by': sort_by,
        'title': 'Quizzes Management',
        'active_page': 'quizzes',
    }

    return render(request, 'admin_dashboard/quizzes_list.html', context)


@superuser_required
def quiz_detail(request, quiz_id):
    """Detailed view of a specific quiz"""
    quiz = get_object_or_404(Quiz.objects.select_related('category'), pk=quiz_id)
    questions = Question.objects.filter(quiz=quiz)
    submissions = QuizSubmission.objects.filter(quiz=quiz).select_related('user')

    # Quiz statistics
    stats = submissions.aggregate(
        total_attempts=Count('id'),
        avg_score=Avg('score'),
        max_score=Sum('score'),  # This might need adjustment
        pass_rate=Count('id', filter=Q(score__gte=50)) * 100.0 / Count('id')
    )

    context = {
        'quiz': quiz,
        'questions': questions,
        'submissions': submissions,
        'stats': stats,
        'title': f'Quiz: {quiz.title}',
        'active_page': 'quizzes',
    }

    return render(request, 'admin_dashboard/quiz_detail.html', context)


@superuser_required
def quiz_create(request):
    """Create a new quiz"""
    if request.method == 'POST':
        form = QuizForm(request.POST, request.FILES)
        if form.is_valid():
            quiz = form.save()

            log_admin_action(
                request.user, 'create', quiz,
                f"Created new quiz: {quiz.title}",
                request
            )

            messages.success(request, f'Quiz "{quiz.title}" created successfully.')
            return redirect('admin_dashboard:quiz_detail', quiz_id=quiz.id)
    else:
        form = QuizForm()

    context = {
        'form': form,
        'title': 'Create Quiz',
        'active_page': 'quizzes',
    }

    return render(request, 'admin_dashboard/quiz_form.html', context)


@superuser_required
def quiz_edit(request, quiz_id):
    """Edit an existing quiz"""
    quiz = get_object_or_404(Quiz, pk=quiz_id)

    if request.method == 'POST':
        form = QuizForm(request.POST, request.FILES, instance=quiz)
        if form.is_valid():
            quiz = form.save()

            log_admin_action(
                request.user, 'update', quiz,
                f"Updated quiz: {quiz.title}",
                request
            )

            messages.success(request, f'Quiz "{quiz.title}" updated successfully.')
            return redirect('admin_dashboard:quiz_detail', quiz_id=quiz.id)
    else:
        form = QuizForm(instance=quiz)

    context = {
        'form': form,
        'quiz': quiz,
        'title': f'Edit Quiz: {quiz.title}',
        'active_page': 'quizzes',
    }

    return render(request, 'admin_dashboard/quiz_form.html', context)


@superuser_required
@require_POST
def quiz_delete(request, quiz_id):
    """Delete a quiz"""
    quiz = get_object_or_404(Quiz, pk=quiz_id)

    if request.POST.get('confirm') == 'yes':
        title = quiz.title
        log_admin_action(
            request.user, 'delete', quiz,
            f"Deleted quiz: {title}",
            request
        )

        quiz.delete()
        messages.success(request, f'Quiz "{title}" deleted successfully.')
        return redirect('admin_dashboard:quizzes_list')

    context = {
        'quiz': quiz,
        'title': f'Delete Quiz: {quiz.title}',
        'active_page': 'quizzes',
    }

    return render(request, 'admin_dashboard/quiz_confirm_delete.html', context)


@superuser_required
@require_POST
def quizzes_bulk_action(request):
    """Handle bulk actions on quizzes"""
    form = BulkActionForm(request.POST)
    if form.is_valid():
        action = form.cleaned_data['action']
        selected_ids = form.cleaned_data['selected_items'].split(',')

        quizzes = Quiz.objects.filter(id__in=selected_ids)
        count = quizzes.count()

        if action == 'activate':
            messages.success(request, f'Activated {count} quizzes.')
        elif action == 'deactivate':
            messages.success(request, f'Deactivated {count} quizzes.')
        elif action == 'delete':
            for quiz in quizzes:
                log_admin_action(
                    request.user, 'delete', quiz,
                    f"Bulk deleted quiz: {quiz.title}",
                    request
                )
            quizzes.delete()
            messages.success(request, f'Deleted {count} quizzes.')

        log_admin_action(
            request.user, 'bulk_update', Quiz.objects.first(),
            f"Bulk {action} on {count} quizzes",
            request
        )

    return redirect('admin_dashboard:quizzes_list')


# Quiz Attempts Views
@superuser_required
def attempts_list(request):
    """List all quiz attempts"""
    attempts = QuizSubmission.objects.select_related('user', 'quiz').all()

    # Search functionality
    search_query = request.GET.get('q', '')
    if search_query:
        attempts = attempts.filter(
            Q(user__username__icontains=search_query) |
            Q(quiz__title__icontains=search_query)
        )

    # Filters
    date_from = request.GET.get('date_from')
    date_to = request.GET.get('date_to')
    if date_from:
        attempts = attempts.filter(submitted_at__date__gte=date_from)
    if date_to:
        attempts = attempts.filter(submitted_at__date__lte=date_to)

    status_filter = request.GET.get('status')
    if status_filter == 'passed':
        attempts = attempts.filter(score__gte=50)
    elif status_filter == 'failed':
        attempts = attempts.filter(score__lt=50)

    # Sorting
    sort_by = request.GET.get('sort', '-submitted_at')
    attempts = attempts.order_by(sort_by)

    # Pagination
    paginator = Paginator(attempts, 25)
    page_number = request.GET.get('page')
    page_obj = paginator.get_page(page_number)

    context = {
        'page_obj': page_obj,
        'search_query': search_query,
        'date_from': date_from,
        'date_to': date_to,
        'status_filter': status_filter,
        'sort_by': sort_by,
        'title': 'Quiz Attempts',
        'active_page': 'attempts',
    }

    return render(request, 'admin_dashboard/attempts_list.html', context)


@superuser_required
def attempt_detail(request, attempt_id):
    """Detailed view of a specific quiz attempt"""
    attempt = get_object_or_404(
        QuizSubmission.objects.select_related('user', 'quiz'),
        pk=attempt_id
    )

    # Get question-by-question breakdown
    # This would require additional model relationships or calculations
    # For now, we'll show basic attempt info

    context = {
        'attempt': attempt,
        'title': f'Attempt: {attempt.user.username} - {attempt.quiz.title}',
        'active_page': 'attempts',
    }

    return render(request, 'admin_dashboard/attempt_detail.html', context)


@superuser_required
@require_POST
def attempt_delete(request, attempt_id):
    """Delete a quiz attempt"""
    attempt = get_object_or_404(QuizSubmission, pk=attempt_id)

    if request.POST.get('confirm') == 'yes':
        description = f"Deleted attempt: {attempt.user.username} - {attempt.quiz.title}"
        log_admin_action(
            request.user, 'delete', attempt,
            description,
            request
        )

        attempt.delete()
        messages.success(request, 'Quiz attempt deleted successfully.')
        return redirect('admin_dashboard:attempts_list')

    context = {
        'attempt': attempt,
        'title': f'Delete Attempt: {attempt.user.username} - {attempt.quiz.title}',
        'active_page': 'attempts',
    }

    return render(request, 'admin_dashboard/attempt_confirm_delete.html', context)


# Topics/Categories Views
@superuser_required
def topics_list(request):
    """List all topics/categories"""
    topics = Category.objects.annotate(
        question_count=Count('quiz__question'),
        quiz_count=Count('quiz'),
        attempt_count=Count('quiz__quizsubmission'),
        avg_score=Avg('quiz__quizsubmission__score')
    ).order_by('-attempt_count')

    # Search functionality
    search_query = request.GET.get('q', '')
    if search_query:
        topics = topics.filter(name__icontains=search_query)

    # Sorting
    sort_by = request.GET.get('sort', '-attempt_count')
    topics = topics.order_by(sort_by)

    # Pagination
    paginator = Paginator(topics, 25)
    page_number = request.GET.get('page')
    page_obj = paginator.get_page(page_number)

    context = {
        'page_obj': page_obj,
        'search_query': search_query,
        'sort_by': sort_by,
        'title': 'Topics Management',
        'active_page': 'topics',
    }

    return render(request, 'admin_dashboard/topics_list.html', context)


@superuser_required
def topic_detail(request, topic_id):
    """Detailed view of a specific topic"""
    topic = get_object_or_404(Category, pk=topic_id)
    quizzes = Quiz.objects.filter(category=topic).annotate(
        attempt_count=Count('quizsubmission'),
        avg_score=Avg('quizsubmission__score')
    )
    questions = Question.objects.filter(quiz__category=topic)

    context = {
        'topic': topic,
        'quizzes': quizzes,
        'questions': questions,
        'title': f'Topic: {topic.name}',
        'active_page': 'topics',
    }

    return render(request, 'admin_dashboard/topic_detail.html', context)


@superuser_required
def topic_create(request):
    """Create a new topic"""
    if request.method == 'POST':
        form = CategoryForm(request.POST)
        if form.is_valid():
            topic = form.save()

            log_admin_action(
                request.user, 'create', topic,
                f"Created new topic: {topic.name}",
                request
            )

            messages.success(request, f'Topic "{topic.name}" created successfully.')
            return redirect('admin_dashboard:topic_detail', topic_id=topic.id)
    else:
        form = CategoryForm()

    context = {
        'form': form,
        'title': 'Create Topic',
        'active_page': 'topics',
    }

    return render(request, 'admin_dashboard/topic_form.html', context)


@superuser_required
def topic_edit(request, topic_id):
    """Edit an existing topic"""
    topic = get_object_or_404(Category, pk=topic_id)

    if request.method == 'POST':
        form = CategoryForm(request.POST, instance=topic)
        if form.is_valid():
            topic = form.save()

            log_admin_action(
                request.user, 'update', topic,
                f"Updated topic: {topic.name}",
                request
            )

            messages.success(request, f'Topic "{topic.name}" updated successfully.')
            return redirect('admin_dashboard:topic_detail', topic_id=topic.id)
    else:
        form = CategoryForm(instance=topic)

    context = {
        'form': form,
        'topic': topic,
        'title': f'Edit Topic: {topic.name}',
        'active_page': 'topics',
    }

    return render(request, 'admin_dashboard/topic_form.html', context)


@superuser_required
@require_POST
def topic_delete(request, topic_id):
    """Delete a topic"""
    topic = get_object_or_404(Category, pk=topic_id)

    if request.POST.get('confirm') == 'yes':
        name = topic.name
        log_admin_action(
            request.user, 'delete', topic,
            f"Deleted topic: {name}",
            request
        )

        topic.delete()
        messages.success(request, f'Topic "{name}" deleted successfully.')
        return redirect('admin_dashboard:topics_list')

    context = {
        'topic': topic,
        'title': f'Delete Topic: {topic.name}',
        'active_page': 'topics',
    }

    return render(request, 'admin_dashboard/topic_confirm_delete.html', context)


# Analytics & Reports Views
@superuser_required
def analytics(request):
    """Analytics and reports dashboard"""
    # Get various analytics data
    user_analytics = {
        'total_users': User.objects.count(),
        'active_users': User.objects.filter(last_login__gte=timezone.now() - timedelta(days=30)).count(),
        'new_users_30d': User.objects.filter(date_joined__gte=timezone.now() - timedelta(days=30)).count(),
    }

    quiz_analytics = {
        'total_quizzes': Quiz.objects.count(),
        'total_attempts': QuizSubmission.objects.count(),
        'avg_score': QuizSubmission.objects.aggregate(avg=Avg('score'))['avg'] or 0,
    }

    context = {
        'user_analytics': user_analytics,
        'quiz_analytics': quiz_analytics,
        'title': 'Analytics & Reports',
        'active_page': 'analytics',
    }

    return render(request, 'admin_dashboard/analytics.html', context)


@superuser_required
def export_data(request, data_type):
    """Export data in various formats"""
    form = ExportForm(request.GET)
    if form.is_valid():
        format_type = form.cleaned_data['format']
        date_range = form.cleaned_data['date_range']
        start_date = form.cleaned_data.get('start_date')
        end_date = form.cleaned_data.get('end_date')

        if data_type == 'users':
            queryset = User.objects.all()
            fields = ['id', 'username', 'email', 'first_name', 'last_name', 'date_joined', 'last_login', 'is_active', 'is_superuser']
        elif data_type == 'questions':
            queryset = Question.objects.select_related('quiz')
            fields = ['id', 'text', 'quiz__title', 'ai_explanation', 'created_at']
        elif data_type == 'quizzes':
            queryset = Quiz.objects.all()
            fields = ['id', 'title', 'category__name', 'created_at', 'updated_at']
        elif data_type == 'attempts':
            queryset = QuizSubmission.objects.select_related('user', 'quiz')
            fields = ['id', 'user__username', 'quiz__title', 'score', 'submitted_at']
        else:
            return HttpResponse("Invalid data type", status=400)

        # Apply date filtering if specified
        if date_range and start_date and end_date:
            date_field = 'date_joined' if data_type == 'users' else 'submitted_at' if data_type == 'attempts' else 'created_at'
            queryset = queryset.filter(**{f'{date_field}__date__gte': start_date, f'{date_field}__date__lte': end_date})

        if format_type == 'csv':
            csv_data = export_data_to_csv(queryset, fields)
            response = HttpResponse(csv_data, content_type='text/csv')
            response['Content-Disposition'] = f'attachment; filename="{data_type}_export.csv"'
            return response
        elif format_type == 'json':
            data = list(queryset.values(*fields))
            response = HttpResponse(json.dumps(data, default=str), content_type='application/json')
            response['Content-Disposition'] = f'attachment; filename="{data_type}_export.json"'
            return response

    return HttpResponse("Invalid request", status=400)


# Settings Views
@superuser_required
def settings_view(request):
    """Admin settings page"""
    settings = AdminSettings.objects.all().order_by('key')

    context = {
        'settings': settings,
        'title': 'Settings',
        'active_page': 'settings',
    }

    return render(request, 'admin_dashboard/settings.html', context)


@superuser_required
@require_POST
def settings_update(request):
    """Update admin settings"""
    for key, value in request.POST.items():
        if key.startswith('setting_'):
            setting_key = key[8:]  # Remove 'setting_' prefix
            AdminSettings.objects.update_or_create(
                key=setting_key,
                defaults={
                    'value': value,
                    'updated_by': request.user
                }
            )

    messages.success(request, 'Settings updated successfully.')
    return redirect('admin_dashboard:settings')


# API Views
@superuser_required
def api_dashboard_stats(request):
    """API endpoint for dashboard statistics"""
    stats = get_dashboard_stats()
    return JsonResponse(stats)


@superuser_required
def api_user_growth_chart(request):
    """API endpoint for user growth chart data"""
    # Generate last 30 days of user registration data
    data = []
    for i in range(30, -1, -1):
        date = timezone.now().date() - timedelta(days=i)
        count = User.objects.filter(date_joined__date=date).count()
        data.append({
            'date': date.strftime('%Y-%m-%d'),
            'count': count
        })

    return JsonResponse({'data': data})


@superuser_required
def api_quiz_trends_chart(request):
    """API endpoint for quiz trends chart data"""
    # Generate last 30 days of quiz attempt data
    data = []
    for i in range(30, -1, -1):
        date = timezone.now().date() - timedelta(days=i)
        count = QuizSubmission.objects.filter(submitted_at__date=date).count()
        data.append({
            'date': date.strftime('%Y-%m-%d'),
            'count': count
        })

    return JsonResponse({'data': data})


# Logout View
@superuser_required
def admin_logout(request):
    """Admin logout view"""
    log_admin_action(
        request.user, 'logout', request.user,
        "Admin logout",
        request
    )

    from django.contrib.auth import logout
    logout(request)
    messages.success(request, 'Logged out successfully.')
    return redirect('login')


# Questions Management Views
@superuser_required
def questions_list(request):
    """List all questions with filtering and pagination"""
    questions = Question.objects.select_related('quiz', 'quiz__category').prefetch_related('choice_set').all()

    # Search functionality
    search_query = request.GET.get('q', '')
    if search_query:
        questions = questions.filter(
            Q(text__icontains=search_query) |
            Q(explanation__icontains=search_query) |
            Q(ai_explanation__icontains=search_query)
        )

    # Filters
    quiz_filter = request.GET.get('quiz', '')
    if quiz_filter:
        questions = questions.filter(quiz_id=quiz_filter)

    category_filter = request.GET.get('category', '')
    if category_filter:
        questions = questions.filter(quiz__category_id=category_filter)

    ai_status_filter = request.GET.get('ai_status', '')
    if ai_status_filter == 'generated':
        questions = questions.filter(ai_explanation__isnull=False)
    elif ai_status_filter == 'not_generated':
        questions = questions.filter(ai_explanation__isnull=True)
    elif ai_status_filter == 'failed':
        questions = questions.filter(ai_error__isnull=False)

    # Sorting
    sort_by = request.GET.get('sort', '-id')
    questions = questions.order_by(sort_by)

    # Pagination
    paginator = Paginator(questions, 25)
    page_number = request.GET.get('page')
    page_obj = paginator.get_page(page_number)

    context = {
        'page_obj': page_obj,
        'search_query': search_query,
        'quiz_filter': quiz_filter,
        'category_filter': category_filter,
        'ai_status_filter': ai_status_filter,
        'sort_by': sort_by,
        'quizzes': Quiz.objects.all(),
        'categories': Category.objects.all(),
        'title': 'Questions Management',
        'active_page': 'questions',
    }

    return render(request, 'admin_dashboard/questions_list.html', context)


@superuser_required
def question_detail(request, question_id):
    """Detailed view of a specific question"""
    question = get_object_or_404(
        Question.objects.select_related('quiz', 'quiz__category').prefetch_related('choice_set'),
        pk=question_id
    )

    context = {
        'question': question,
        'choices': question.choice_set.all(),
        'title': f'Question: {question.text[:50]}...',
        'active_page': 'questions',
    }

    return render(request, 'admin_dashboard/question_detail.html', context)


@superuser_required
def question_create(request):
    """Create a new question"""
    quiz_id = request.GET.get('quiz')

    if request.method == 'POST':
        form = QuestionForm(request.POST, request.FILES)
        if form.is_valid():
            question = form.save(commit=False)
            if quiz_id:
                question.quiz_id = quiz_id
            question.save()

            # Create default choices if not provided
            if not question.choice_set.exists():
                Choice.objects.create(question=question, text="Option A", is_correct=False)
                Choice.objects.create(question=question, text="Option B", is_correct=False)
                Choice.objects.create(question=question, text="Option C", is_correct=False)
                Choice.objects.create(question=question, text="Option D", is_correct=True)  # Default correct answer

            log_admin_action(
                request.user, 'create', question,
                f"Created question: {question.text[:50]}...",
                request
            )
            messages.success(request, f'Question created successfully.')
            return redirect('admin_dashboard:question_detail', question_id=question.id)
    else:
        form = QuestionForm()
        if quiz_id:
            form.fields['quiz'].initial = quiz_id

    context = {
        'form': form,
        'quiz_id': quiz_id,
        'title': 'Create Question',
        'active_page': 'questions',
    }

    return render(request, 'admin_dashboard/question_form.html', context)


@superuser_required
def question_edit(request, question_id):
    """Edit an existing question"""
    question = get_object_or_404(Question, pk=question_id)

    if request.method == 'POST':
        form = QuestionForm(request.POST, request.FILES, instance=question)
        if form.is_valid():
            question = form.save()
            log_admin_action(
                request.user, 'update', question,
                f"Updated question: {question.text[:50]}...",
                request
            )
            messages.success(request, f'Question updated successfully.')
            return redirect('admin_dashboard:question_detail', question_id=question.id)
    else:
        form = QuestionForm(instance=question)

    context = {
        'form': form,
        'question': question,
        'title': f'Edit Question: {question.text[:30]}...',
        'active_page': 'questions',
    }

    return render(request, 'admin_dashboard/question_form.html', context)


@superuser_required
@require_POST
def question_delete(request, question_id):
    """Delete a question"""
    question = get_object_or_404(Question, pk=question_id)

    question_text = question.text[:50] + "..." if len(question.text) > 50 else question.text
    question.delete()

    log_admin_action(
        request.user, 'delete', None,
        f"Deleted question: {question_text}",
        request
    )

    messages.success(request, f'Question "{question_text}" deleted successfully.')
    return redirect('admin_dashboard:questions_list')


@superuser_required
@require_POST
def questions_bulk_action(request):
    """Handle bulk actions for questions"""
    form = BulkActionForm(request.POST)
    if form.is_valid():
        action = form.cleaned_data['action']
        selected_ids = json.loads(form.cleaned_data['selected_items'])

        questions = Question.objects.filter(id__in=selected_ids)
        count = questions.count()

        if action == 'delete':
            for question in questions:
                log_admin_action(
                    request.user, 'delete', None,
                    f"Deleted question: {question.text[:50]}...",
                    request
                )
            questions.delete()
            messages.success(request, f'Successfully deleted {count} questions.')
        else:
            messages.error(request, 'Invalid bulk action.')

    return redirect('admin_dashboard:questions_list')


@superuser_required
@require_POST
def generate_explanations_bulk(request):
    """Generate AI explanations for selected questions"""
    selected_ids = request.POST.getlist('selected_questions')

    if not selected_ids:
        messages.error(request, 'No questions selected.')
        return redirect('admin_dashboard:questions_list')

    try:
        from quiz.services import ExplanationGenerator
        generator = ExplanationGenerator()
        successful = 0
        failed = 0

        for question_id in selected_ids:
            try:
                question = Question.objects.get(id=question_id)
                explanation = generator.generate_explanation(question)
                if explanation:
                    successful += 1
                else:
                    failed += 1
            except Exception as e:
                failed += 1
                messages.error(request, f"Error generating explanation for question {question_id}: {e}")

        if successful > 0:
            messages.success(request, f"Successfully generated {successful} AI explanations.")
        if failed > 0:
            messages.error(request, f"Failed to generate {failed} explanations.")

    except Exception as e:
        messages.error(request, f"Error initializing AI service: {e}")

    return redirect('admin_dashboard:questions_list')


# Topics/Categories Management Views
@superuser_required
def topics_list(request):
    """List all categories/topics with filtering and pagination"""
    categories = Category.objects.all()

    # Search functionality
    search_query = request.GET.get('q', '')
    if search_query:
        categories = categories.filter(name__icontains=search_query)

    # Sorting
    sort_by = request.GET.get('sort', 'name')
    categories = categories.order_by(sort_by)

    # Pagination
    paginator = Paginator(categories, 25)
    page_number = request.GET.get('page')
    page_obj = paginator.get_page(page_number)

    # Add statistics to categories
    for category in page_obj:
        category.quiz_count = Quiz.objects.filter(category=category).count()
        category.question_count = Question.objects.filter(quiz__category=category).count()

    context = {
        'page_obj': page_obj,
        'search_query': search_query,
        'sort_by': sort_by,
        'title': 'Topics/Categories Management',
        'active_page': 'topics',
    }

    return render(request, 'admin_dashboard/topics_list.html', context)


@superuser_required
def topic_detail(request, topic_id):
    """Detailed view of a specific category/topic"""
    category = get_object_or_404(Category, pk=topic_id)

    # Get related quizzes and questions
    quizzes = Quiz.objects.filter(category=category).prefetch_related('question_set')
    questions = Question.objects.filter(quiz__category=category).select_related('quiz')

    context = {
        'category': category,
        'quizzes': quizzes,
        'questions': questions,
        'title': f'Topic: {category.name}',
        'active_page': 'topics',
    }

    return render(request, 'admin_dashboard/topic_detail.html', context)


@superuser_required
def topic_create(request):
    """Create a new category/topic"""
    if request.method == 'POST':
        form = CategoryForm(request.POST)
        if form.is_valid():
            category = form.save()
            log_admin_action(
                request.user, 'create', category,
                f"Created category: {category.name}",
                request
            )
            messages.success(request, f'Category "{category.name}" created successfully.')
            return redirect('admin_dashboard:topic_detail', topic_id=category.id)
    else:
        form = CategoryForm()

    context = {
        'form': form,
        'title': 'Create Category',
        'active_page': 'topics',
    }

    return render(request, 'admin_dashboard/topic_form.html', context)


@superuser_required
def topic_edit(request, topic_id):
    """Edit an existing category/topic"""
    category = get_object_or_404(Category, pk=topic_id)

    if request.method == 'POST':
        form = CategoryForm(request.POST, instance=category)
        if form.is_valid():
            category = form.save()
            log_admin_action(
                request.user, 'update', category,
                f"Updated category: {category.name}",
                request
            )
            messages.success(request, f'Category "{category.name}" updated successfully.')
            return redirect('admin_dashboard:topic_detail', topic_id=category.id)
    else:
        form = CategoryForm(instance=category)

    context = {
        'form': form,
        'category': category,
        'title': f'Edit Category: {category.name}',
        'active_page': 'topics',
    }

    return render(request, 'admin_dashboard/topic_form.html', context)


@superuser_required
@require_POST
def topic_delete(request, topic_id):
    """Delete a category/topic"""
    category = get_object_or_404(Category, pk=topic_id)

    # Check if category has associated quizzes
    quiz_count = Quiz.objects.filter(category=category).count()
    if quiz_count > 0:
        messages.error(request, f'Cannot delete category "{category.name}" because it has {quiz_count} associated quiz(es).')
        return redirect('admin_dashboard:topic_detail', topic_id=topic_id)

    category_name = category.name
    category.delete()

    log_admin_action(
        request.user, 'delete', None,
        f"Deleted category: {category_name}",
        request
    )

    messages.success(request, f'Category "{category_name}" deleted successfully.')
    return redirect('admin_dashboard:topics_list')


# Quiz Attempts Management Views
@superuser_required
def attempts_list(request):
    """List all quiz attempts with filtering and pagination"""
    attempts = QuizSubmission.objects.select_related('user', 'quiz', 'quiz__category').all()

    # Search functionality
    search_query = request.GET.get('q', '')
    if search_query:
        attempts = attempts.filter(
            Q(user__username__icontains=search_query) |
            Q(user__email__icontains=search_query) |
            Q(quiz__title__icontains=search_query)
        )

    # Filters
    quiz_filter = request.GET.get('quiz', '')
    if quiz_filter:
        attempts = attempts.filter(quiz_id=quiz_filter)

    user_filter = request.GET.get('user', '')
    if user_filter:
        attempts = attempts.filter(user_id=user_filter)

    date_from = request.GET.get('date_from', '')
    if date_from:
        attempts = attempts.filter(submitted_at__date__gte=date_from)

    date_to = request.GET.get('date_to', '')
    if date_to:
        attempts = attempts.filter(submitted_at__date__lte=date_to)

    # Sorting
    sort_by = request.GET.get('sort', '-submitted_at')
    attempts = attempts.order_by(sort_by)

    # Pagination
    paginator = Paginator(attempts, 25)
    page_number = request.GET.get('page')
    page_obj = paginator.get_page(page_number)

    context = {
        'page_obj': page_obj,
        'search_query': search_query,
        'quiz_filter': quiz_filter,
        'user_filter': user_filter,
        'date_from': date_from,
        'date_to': date_to,
        'sort_by': sort_by,
        'quizzes': Quiz.objects.all(),
        'users': User.objects.all(),
        'title': 'Quiz Attempts Management',
        'active_page': 'attempts',
    }

    return render(request, 'admin_dashboard/attempts_list.html', context)


@superuser_required
def attempt_detail(request, attempt_id):
    """Detailed view of a specific quiz attempt"""
    attempt = get_object_or_404(
        QuizSubmission.objects.select_related('user', 'quiz', 'quiz__category'),
        pk=attempt_id
    )

    context = {
        'attempt': attempt,
        'title': f'Attempt: {attempt.user.username} - {attempt.quiz.title}',
        'active_page': 'attempts',
    }

    return render(request, 'admin_dashboard/attempt_detail.html', context)


@superuser_required
@require_POST
def attempt_delete(request, attempt_id):
    """Delete a quiz attempt"""
    attempt = get_object_or_404(QuizSubmission, pk=attempt_id)

    attempt_info = f"{attempt.user.username} - {attempt.quiz.title} ({attempt.score} points)"
    attempt.delete()

    log_admin_action(
        request.user, 'delete', None,
        f"Deleted quiz attempt: {attempt_info}",
        request
    )

    messages.success(request, f'Quiz attempt deleted successfully.')
    return redirect('admin_dashboard:attempts_list')


# Analytics & Reports Views
@superuser_required
def analytics(request):
    """Analytics dashboard with charts and reports"""
    # Get date range
    days = int(request.GET.get('days', 30))
    end_date = timezone.now().date()
    start_date = end_date - timedelta(days=days)

    # Basic statistics
    stats = get_dashboard_stats()

    # Additional analytics data
    analytics_data = {
        'total_questions': Question.objects.count(),
        'total_categories': Category.objects.count(),
        'avg_score': QuizSubmission.objects.aggregate(avg=Avg('score'))['avg'] or 0,
        'top_performers': UserRank.objects.select_related('user').order_by('-total_score')[:10],
        'recent_attempts': QuizSubmission.objects.select_related('user', 'quiz').order_by('-submitted_at')[:20],
        'quiz_popularity': Quiz.objects.annotate(
            attempt_count=Count('quizsubmission')
        ).order_by('-attempt_count')[:10],
    }

    context = {
        'stats': stats,
        'analytics_data': analytics_data,
        'days': days,
        'start_date': start_date,
        'end_date': end_date,
        'title': 'Analytics & Reports',
        'active_page': 'analytics',
    }

    return render(request, 'admin_dashboard/analytics.html', context)


@superuser_required
def export_data(request, data_type):
    """Export data in various formats"""
    format_type = request.GET.get('format', 'csv')

    if data_type == 'users':
        queryset = User.objects.select_related('profile').all()
    elif data_type == 'quizzes':
        queryset = Quiz.objects.select_related('category').all()
    elif data_type == 'questions':
        queryset = Question.objects.select_related('quiz').all()
    elif data_type == 'attempts':
        queryset = QuizSubmission.objects.select_related('user', 'quiz').all()
    else:
        messages.error(request, 'Invalid data type for export.')
        return redirect('admin_dashboard:analytics')

    if format_type == 'csv':
        return export_data_to_csv(queryset, data_type)
    elif format_type == 'json':
        data = list(queryset.values())
        response = HttpResponse(
            json.dumps(data, indent=2, default=str),
            content_type='application/json'
        )
        response['Content-Disposition'] = f'attachment; filename="{data_type}_export.json"'
        return response
    else:
        messages.error(request, 'Invalid export format.')
        return redirect('admin_dashboard:analytics')


# Settings Views
@superuser_required
def settings_view(request):
    """Admin dashboard settings"""
    if request.method == 'POST':
        form = AdminSettingsForm(request.POST)
        if form.is_valid():
            setting = form.save()
            log_admin_action(
                request.user, 'create', setting,
                f"Created setting: {setting.key}",
                request
            )
            messages.success(request, f'Setting "{setting.key}" created successfully.')
            return redirect('admin_dashboard:settings')
    else:
        form = AdminSettingsForm()

    # Get all existing settings
    settings = AdminSettings.objects.all().order_by('key')

    context = {
        'form': form,
        'settings': settings,
        'title': 'Admin Settings',
        'active_page': 'settings',
    }

    return render(request, 'admin_dashboard/settings.html', context)


@superuser_required
@require_POST
def settings_update(request):
    """Update admin settings"""
    key = request.POST.get('key')
    value = request.POST.get('value')

    if not key:
        messages.error(request, 'Setting key is required.')
        return redirect('admin_dashboard:settings')

    setting, created = AdminSettings.objects.get_or_create(
        key=key,
        defaults={'value': value or ''}
    )

    if not created:
        setting.value = value or ''
        setting.save()

    action = 'create' if created else 'update'
    log_admin_action(
        request.user, action, setting,
        f"{action.title()}d setting: {key}",
        request
    )

    messages.success(request, f'Setting "{key}" updated successfully.')
    return redirect('admin_dashboard:settings')


# Quiz Management Views
@superuser_required
def quizzes_list(request):
    """List all quizzes with filtering and pagination"""
    quizzes = Quiz.objects.select_related('category').prefetch_related('question_set').all()

    # Search functionality
    search_query = request.GET.get('q', '')
    if search_query:
        quizzes = quizzes.filter(
            Q(title__icontains=search_query) |
            Q(description__icontains=search_query)
        )

    # Category filter
    category_filter = request.GET.get('category', '')
    if category_filter:
        quizzes = quizzes.filter(category_id=category_filter)

    # Sorting
    sort_by = request.GET.get('sort', '-created_at')
    quizzes = quizzes.order_by(sort_by)

    # Pagination
    paginator = Paginator(quizzes, 25)
    page_number = request.GET.get('page')
    page_obj = paginator.get_page(page_number)

    # Add question count to quizzes
    for quiz in page_obj:
        quiz.question_count = quiz.question_set.count()

    context = {
        'page_obj': page_obj,
        'search_query': search_query,
        'category_filter': category_filter,
        'sort_by': sort_by,
        'categories': Category.objects.all(),
        'title': 'Quizzes Management',
        'active_page': 'quizzes',
    }

    return render(request, 'admin_dashboard/quizzes_list.html', context)


@superuser_required
def quiz_create(request):
    """Create a new quiz"""
    if request.method == 'POST':
        form = QuizForm(request.POST, request.FILES)
        if form.is_valid():
            quiz = form.save()
            log_admin_action(
                request.user, 'create', quiz,
                f"Created quiz: {quiz.title}",
                request
            )
            messages.success(request, f'Quiz "{quiz.title}" created successfully.')
            return redirect('admin_dashboard:quiz_detail', quiz_id=quiz.id)
    else:
        form = QuizForm()

    context = {
        'form': form,
        'title': 'Create Quiz',
        'active_page': 'quizzes',
    }

    return render(request, 'admin_dashboard/quiz_form.html', context)


@superuser_required
def quiz_excel_upload(request):
    """Upload Excel file and create quiz from it"""
    if request.method == 'POST':
        form = ExcelUploadForm(request.POST, request.FILES)
        if form.is_valid():
            try:
                # Get form data
                title = form.cleaned_data['title']
                description = form.cleaned_data['description']
                category = form.cleaned_data['category']
                excel_file = form.cleaned_data['excel_file']

                # Create quiz instance without saving file initially
                quiz = Quiz.objects.create(
                    title=title,
                    description=description or '',
                    category=category,
                    quiz_file=excel_file  # This will trigger the import_quiz_from_excel method
                )

                log_admin_action(
                    request.user, 'create', quiz,
                    f"Created quiz from Excel: {quiz.title}",
                    request
                )

                messages.success(request, f'Quiz "{quiz.title}" created successfully from Excel file.')
                return redirect('admin_dashboard:quiz_detail', quiz_id=quiz.id)

            except Exception as e:
                messages.error(request, f'Error creating quiz from Excel: {str(e)}')
                # Clean up if quiz was created but import failed
                if 'quiz' in locals():
                    quiz.delete()
    else:
        form = ExcelUploadForm()

    context = {
        'form': form,
        'title': 'Upload Quiz from Excel',
        'active_page': 'quizzes',
    }

    return render(request, 'admin_dashboard/quiz_excel_upload.html', context)


@superuser_required
def quiz_detail(request, quiz_id):
    """Detailed view of a specific quiz"""
    quiz = get_object_or_404(Quiz.objects.select_related('category').prefetch_related('question_set__choice_set'), pk=quiz_id)

    # Get questions with their choices
    questions = quiz.question_set.all().prefetch_related('choice_set')

    context = {
        'quiz': quiz,
        'questions': questions,
        'title': f'Quiz: {quiz.title}',
        'active_page': 'quizzes',
    }

    return render(request, 'admin_dashboard/quiz_detail.html', context)


@superuser_required
def quiz_edit(request, quiz_id):
    """Edit an existing quiz"""
    quiz = get_object_or_404(Quiz, pk=quiz_id)

    if request.method == 'POST':
        form = QuizForm(request.POST, request.FILES, instance=quiz)
        if form.is_valid():
            quiz = form.save()
            log_admin_action(
                request.user, 'update', quiz,
                f"Updated quiz: {quiz.title}",
                request
            )
            messages.success(request, f'Quiz "{quiz.title}" updated successfully.')
            return redirect('admin_dashboard:quiz_detail', quiz_id=quiz.id)
    else:
        form = QuizForm(instance=quiz)

    context = {
        'form': form,
        'quiz': quiz,
        'title': f'Edit Quiz: {quiz.title}',
        'active_page': 'quizzes',
    }

    return render(request, 'admin_dashboard/quiz_form.html', context)


@superuser_required
@require_POST
def quiz_delete(request, quiz_id):
    """Delete a quiz"""
    quiz = get_object_or_404(Quiz, pk=quiz_id)

    quiz_title = quiz.title
    quiz.delete()

    log_admin_action(
        request.user, 'delete', None,
        f"Deleted quiz: {quiz_title}",
        request
    )

    messages.success(request, f'Quiz "{quiz_title}" deleted successfully.')
    return redirect('admin_dashboard:quizzes_list')


@superuser_required
@require_POST
def quizzes_bulk_action(request):
    """Handle bulk actions for quizzes"""
    form = BulkActionForm(request.POST)
    if form.is_valid():
        action = form.cleaned_data['action']
        selected_ids = json.loads(form.cleaned_data['selected_items'])

        quizzes = Quiz.objects.filter(id__in=selected_ids)
        count = quizzes.count()

        if action == 'delete':
            for quiz in quizzes:
                log_admin_action(
                    request.user, 'delete', None,
                    f"Deleted quiz: {quiz.title}",
                    request
                )
            quizzes.delete()
            messages.success(request, f'Successfully deleted {count} quizzes.')
        else:
            messages.error(request, 'Invalid bulk action.')

    return redirect('admin_dashboard:quizzes_list')
