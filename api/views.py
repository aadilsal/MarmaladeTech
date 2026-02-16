from rest_framework import viewsets, status, mixins
from rest_framework.decorators import action, api_view, permission_classes
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticatedOrReadOnly, IsAuthenticated, IsAdminUser
from rest_framework.pagination import PageNumberPagination
from rest_framework.exceptions import NotFound, PermissionDenied, ValidationError
from django.shortcuts import get_object_or_404
from django_ratelimit.decorators import ratelimit
from django.db.models import Q
from django.conf import settings
from django.contrib.auth import get_user_model
from quiz.models import Quiz, Question, Choice, QuizSubmission, QuizAttempt, AttemptAnswer
from account.models import Profile
from base.models import Blog
from .serializers import (
    QuizListSerializer,
    QuizDetailSerializer,
    QuestionSerializer,
    ChoiceSerializer,
    QuizSubmissionSerializer,
    ProfileSerializer,
    BlogSerializer,
    ExplanationTaskSerializer,
    QuizAttemptSerializer,
    AttemptAnswerSerializer,
    AttemptQuestionSerializer,
    AttemptReviewQuestionSerializer,
    AttemptSubmitSerializer,
    AttemptQuestionsResponseSerializer,
    AttemptSubmitResponseSerializer,
    AttemptResultSerializer,
    AttemptAnalysisSerializer,
    AttemptReviewResponseSerializer,
    DashboardSummarySerializer,
    RecentAttemptSerializer,
    SubjectPerformanceSerializer,
    ProgressTrendSerializer,
    AdminAnalyticsSummarySerializer,
    AdminProgressTrendSerializer,
)
from quiz.tasks import generate_explanation_task
from quiz.models import ExplanationTask
from celery.result import AsyncResult
from quiz.repositories import QuizRepository, QuestionRepository, AttemptRepository, SubmissionRepository
from quiz.services import QuizManager, AttemptManager, ScoreCalculator, AnalyticsManager
from quiz.services.exceptions import NotFoundError, PermissionError as ServicePermissionError, ConflictError, ValidationError as ServiceValidationError


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def task_status(request, task_id):
    """Return Celery task status and result for a given task id."""
    task = ExplanationTask.objects.filter(task_id=task_id).select_related('user').first()
    if task and not (request.user.is_staff or task.user_id == request.user.id):
        return Response({'detail': 'Not found'}, status=status.HTTP_404_NOT_FOUND)
    if not task:
        return Response({'detail': 'Task not found'}, status=status.HTTP_404_NOT_FOUND)

    state_map = {
        'PENDING': 'QUEUED',
        'RECEIVED': 'QUEUED',
        'STARTED': 'RUNNING',
        'RETRY': 'RUNNING',
        'SUCCESS': 'SUCCESS',
        'FAILURE': 'FAILURE',
    }
    try:
        res = AsyncResult(task_id)
        state = state_map.get(res.state, 'QUEUED')
        return Response({'task_id': task_id, 'state': state, 'result': res.result}, status=status.HTTP_200_OK)
    except Exception as e:
        return Response({'detail': 'Invalid task id or not available', 'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)


class QuizViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = Quiz.objects.all()
    permission_classes = [IsAuthenticatedOrReadOnly]

    @property
    def quiz_manager(self):
        if not hasattr(self, '_quiz_manager'):
            self._quiz_manager = QuizManager(
                quiz_repo=QuizRepository(),
                question_repo=QuestionRepository(),
            )
        return self._quiz_manager

    @property
    def attempt_manager(self):
        if not hasattr(self, '_attempt_manager'):
            self._attempt_manager = AttemptManager(
                attempt_repo=AttemptRepository(),
                question_repo=QuestionRepository(),
                quiz_repo=QuizRepository(),
                submission_repo=SubmissionRepository(),
                score_calculator=ScoreCalculator(),
            )
        return self._attempt_manager

    def get_queryset(self):
        subject = self.request.query_params.get('subject') or self.request.query_params.get('category')
        chapter = self.request.query_params.get('chapter') or self.request.query_params.get('q')
        difficulty = self.request.query_params.get('difficulty')
        return self.quiz_manager.list_quizzes(
            subject=subject,
            chapter=chapter,
            difficulty=difficulty,
            for_list=self.action == 'list',
        )

    def get_serializer_class(self):
        if self.action == 'list':
            return QuizListSerializer
        return QuizDetailSerializer

    @action(detail=True, methods=['post'], permission_classes=[IsAuthenticated])
    @ratelimit(key='user', rate='10/h', method='POST', block=True)
    def start(self, request, pk=None):
        quiz = self.get_object()
        attempt = self.attempt_manager.start_attempt(request.user, quiz)
        serializer = QuizAttemptSerializer(attempt)
        return Response(serializer.data, status=status.HTTP_201_CREATED)


class QuestionViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = Question.objects.all()
    serializer_class = QuestionSerializer
    permission_classes = [IsAuthenticatedOrReadOnly]

    @action(detail=True, methods=['post'], permission_classes=[IsAuthenticated])
    @ratelimit(key='user', rate='10/h', method='POST', block=True)
    def generate_explanation(self, request, pk=None):
        """Enqueue AI explanation generation for this question and return task id."""
        question = get_object_or_404(Question, pk=pk)

        # Check permission: staff or has taken the quiz
        if not request.user.is_staff:
            if not QuizSubmission.objects.filter(user=request.user, quiz=question.quiz).exists():
                return Response({'detail': 'You must complete the quiz before requesting explanations.'}, status=status.HTTP_403_FORBIDDEN)

        # Enqueue the task and create a DB record for tracking
        task = generate_explanation_task.delay(question.id, request.user.id)
        ExplanationTask.objects.create(question=question, user=request.user, task_id=task.id, status='QUEUED')

        return Response({'task_id': task.id, 'status': 'queued'}, status=status.HTTP_202_ACCEPTED)


class ChoiceViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = Choice.objects.all()
    serializer_class = ChoiceSerializer
    permission_classes = [IsAuthenticatedOrReadOnly]


class QuizSubmissionViewSet(viewsets.ModelViewSet):
    queryset = QuizSubmission.objects.all().order_by('-submitted_at')
    serializer_class = QuizSubmissionSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        qs = QuizSubmission.objects.select_related('quiz', 'user').order_by('-submitted_at')
        if user.is_staff:
            return qs
        return qs.filter(user=user)

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)


class ProfileViewSet(mixins.ListModelMixin, mixins.RetrieveModelMixin, mixins.UpdateModelMixin, viewsets.GenericViewSet):
    queryset = Profile.objects.select_related('user').all()
    serializer_class = ProfileSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        if self.request.user.is_staff:
            return self.queryset
        return self.queryset.filter(user=self.request.user)

    def _get_profile_for_user(self, user):
        profile, _ = Profile.objects.get_or_create(user=user)
        return profile

    @action(detail=False, methods=['get', 'patch'], url_path='me')
    def me(self, request):
        profile = self._get_profile_for_user(request.user)
        if request.method.lower() == 'patch':
            serializer = self.get_serializer(profile, data=request.data, partial=True)
            serializer.is_valid(raise_exception=True)
            serializer.save()
            return Response(serializer.data, status=status.HTTP_200_OK)
        serializer = self.get_serializer(profile)
        return Response(serializer.data, status=status.HTTP_200_OK)

    @action(detail=False, methods=['get'], url_path='by-user/(?P<user_id>\\d+)')
    def by_user(self, request, user_id=None):
        if not request.user.is_staff and str(request.user.id) != str(user_id):
            return Response({'detail': 'Not allowed'}, status=status.HTTP_403_FORBIDDEN)
        user = get_object_or_404(get_user_model(), pk=user_id)
        profile = self._get_profile_for_user(user)
        serializer = self.get_serializer(profile)
        return Response(serializer.data, status=status.HTTP_200_OK)

    def partial_update(self, request, *args, **kwargs):
        profile = self.get_object()
        if request.user != profile.user and not request.user.is_staff:
            return Response({'detail': 'Not allowed'}, status=status.HTTP_403_FORBIDDEN)
        return super().partial_update(request, *args, **kwargs)

    def update(self, request, *args, **kwargs):
        profile = self.get_object()
        if request.user != profile.user and not request.user.is_staff:
            return Response({'detail': 'Not allowed'}, status=status.HTTP_403_FORBIDDEN)
        return super().update(request, *args, **kwargs)


class BlogViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = Blog.objects.order_by('-created_at')
    serializer_class = BlogSerializer
    permission_classes = [IsAuthenticatedOrReadOnly]


from quiz.models import UserRank

@api_view(['GET'])
def leaderboard(request):
    """Return top users and ranks"""
    ranks = UserRank.objects.select_related('user').order_by('-total_score')[:50]
    data = [{'username': r.user.username, 'rank': r.rank, 'total_score': r.total_score} for r in ranks]
    return Response(data)


class ExplanationTaskViewSet(viewsets.ReadOnlyModelViewSet):
    """Viewset for tracking AI explanation tasks. Users can list their tasks; admins can list all."""
    queryset = ExplanationTask.objects.order_by('-created_at')
    serializer_class = ExplanationTaskSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        if user.is_staff:
            return self.queryset
        return self.queryset.filter(user=user)

    def retrieve(self, request, *args, **kwargs):
        return super().retrieve(request, *args, **kwargs)

    @action(detail=True, methods=['post'], permission_classes=[IsAuthenticated])
    def requeue(self, request, pk=None):
        """Allow admin or owner to requeue a failed task."""
        task = self.get_object()
        if task.status == 'RUNNING':
            return Response({'detail': 'Task already running'}, status=status.HTTP_400_BAD_REQUEST)
        if request.user != task.user and not request.user.is_staff:
            return Response({'detail': 'Not allowed'}, status=status.HTTP_403_FORBIDDEN)

        new_task = generate_explanation_task.delay(task.question.id, request.user.id)
        task.task_id = new_task.id
        task.status = 'QUEUED'
        task.save()
        return Response({'task_id': new_task.id, 'status': 'queued'}, status=status.HTTP_202_ACCEPTED)


class QuizAttemptViewSet(viewsets.GenericViewSet):
    queryset = QuizAttempt.objects.select_related('quiz', 'quiz__category')
    serializer_class = QuizAttemptSerializer
    permission_classes = [IsAuthenticated]

    @property
    def attempt_manager(self):
        if not hasattr(self, '_attempt_manager'):
            self._attempt_manager = AttemptManager(
                attempt_repo=AttemptRepository(),
                question_repo=QuestionRepository(),
                quiz_repo=QuizRepository(),
                submission_repo=SubmissionRepository(),
                score_calculator=ScoreCalculator(),
            )
        return self._attempt_manager

    def _handle_service_error(self, exc):
        if isinstance(exc, NotFoundError):
            raise NotFound(str(exc))
        if isinstance(exc, ServicePermissionError):
            raise PermissionDenied(str(exc))
        if isinstance(exc, ConflictError):
            raise ValidationError({'detail': str(exc)})
        if isinstance(exc, ServiceValidationError):
            raise ValidationError({'detail': str(exc)})
        raise exc

    def get_queryset(self):
        user = self.request.user
        qs = super().get_queryset()
        if user.is_staff:
            return qs
        return qs.filter(user=user)

    def _get_attempt(self, pk):
        """Get attempt with explicit IDOR check."""
        try:
            return self.attempt_manager.get_attempt_for_user(pk, self.request.user)
        except Exception as exc:
            self._handle_service_error(exc)

    @action(detail=True, methods=['get'])
    def questions(self, request, pk=None):
        attempt = self._get_attempt(pk)
        questions = self.attempt_manager.get_questions(attempt)
        questions_serializer = AttemptQuestionSerializer(questions, many=True)
        response_serializer = AttemptQuestionsResponseSerializer({
            'attempt_id': attempt.id,
            'quiz_id': attempt.quiz_id,
            'questions': questions_serializer.data,
        })
        return Response(response_serializer.data)

    @action(detail=True, methods=['post'])
    @ratelimit(key='user', rate='30/m', method='POST', block=True)
    def answer(self, request, pk=None):
        attempt = self._get_attempt(pk)
        if attempt.status == 'SUBMITTED':
            return Response({'detail': 'Attempt already submitted'}, status=status.HTTP_400_BAD_REQUEST)

        serializer = AttemptAnswerSerializer(data=request.data, context={'attempt': attempt})
        serializer.is_valid(raise_exception=True)
        question = serializer.validated_data['question']
        choice = serializer.validated_data['choice']

        self.attempt_manager.save_answer(attempt, question, choice)

        return Response({'detail': 'Answer saved'}, status=status.HTTP_200_OK)

    @action(detail=True, methods=['post'])
    @ratelimit(key='user', rate='2/m', method='POST', block=True)
    def submit(self, request, pk=None):
        serializer = AttemptSubmitSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        time_taken_seconds = serializer.validated_data.get('time_taken_seconds')

        try:
            payload = self.attempt_manager.submit_attempt(
                attempt_id=pk,
                user=request.user,
                time_taken_seconds=time_taken_seconds,
            )
        except Exception as exc:
            self._handle_service_error(exc)

        response_serializer = AttemptSubmitResponseSerializer(payload)
        return Response(response_serializer.data, status=status.HTTP_200_OK)

    @action(detail=True, methods=['get'])
    def results(self, request, pk=None):
        attempt = self._get_attempt(pk)
        try:
            payload = self.attempt_manager.get_results(attempt)
        except Exception as exc:
            self._handle_service_error(exc)
        response_serializer = AttemptResultSerializer(payload)
        return Response(response_serializer.data)

    @action(detail=True, methods=['get'])
    def review(self, request, pk=None):
        attempt = self._get_attempt(pk)
        try:
            review_payload = self.attempt_manager.get_review_payload(attempt)
        except Exception as exc:
            self._handle_service_error(exc)

        question_serializer = AttemptReviewQuestionSerializer(review_payload, many=True)
        response_serializer = AttemptReviewResponseSerializer({
            'attempt_id': attempt.id,
            'quiz_id': attempt.quiz_id,
            'questions': question_serializer.data,
        })
        return Response(response_serializer.data)

    @action(detail=True, methods=['get'])
    def analysis(self, request, pk=None):
        attempt = self._get_attempt(pk)
        try:
            payload = self.attempt_manager.get_analysis(attempt)
        except Exception as exc:
            self._handle_service_error(exc)
        response_serializer = AttemptAnalysisSerializer(payload)
        return Response(response_serializer.data)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def dashboard_summary(request):
    analytics_manager = AnalyticsManager()
    payload = analytics_manager.dashboard_summary(request.user)
    serializer = DashboardSummarySerializer(payload)
    return Response(serializer.data)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def dashboard_recent_attempts(request):
    analytics_manager = AnalyticsManager()
    payload = analytics_manager.recent_attempts(request.user)
    serializer = RecentAttemptSerializer(payload, many=True)
    return Response(serializer.data)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def analytics_subject_performance(request):
    analytics_manager = AnalyticsManager()
    payload = analytics_manager.subject_performance(request.user)
    serializer = SubjectPerformanceSerializer(payload, many=True)
    return Response(serializer.data)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def analytics_progress_trend(request):
    analytics_manager = AnalyticsManager()
    payload = analytics_manager.progress_trend(request.user)
    serializer = ProgressTrendSerializer(payload, many=True)
    return Response(serializer.data)


@api_view(['GET'])
@permission_classes([IsAdminUser])
def admin_analytics_summary(request):
    analytics_manager = AnalyticsManager()
    payload = analytics_manager.admin_summary()
    serializer = AdminAnalyticsSummarySerializer(payload)
    return Response(serializer.data)


@api_view(['GET'])
@permission_classes([IsAdminUser])
def admin_analytics_subject_performance(request):
    analytics_manager = AnalyticsManager()
    payload = analytics_manager.admin_subject_performance()
    serializer = SubjectPerformanceSerializer(payload, many=True)
    return Response(serializer.data)


@api_view(['GET'])
@permission_classes([IsAdminUser])
def admin_analytics_progress_trend(request):
    analytics_manager = AnalyticsManager()
    payload = analytics_manager.admin_progress_trend()
    serializer = AdminProgressTrendSerializer(payload, many=True)
    return Response(serializer.data)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def search_users(request):
    query = (request.query_params.get('q') or '').strip()
    if not query:
        return Response({'results': []}, status=status.HTTP_200_OK)

    User = get_user_model()
    users = User.objects.filter(
        Q(username__icontains=query) |
        Q(first_name__icontains=query) |
        Q(last_name__icontains=query)
    ).order_by('date_joined')

    paginator = PageNumberPagination()
    paginator.page_size = min(int(request.query_params.get('page_size', 20)), 50)
    page = paginator.paginate_queryset(users, request)
    data = UserSerializer(page, many=True).data
    return paginator.get_paginated_response(data)


@api_view(['DELETE'])
@permission_classes([IsAuthenticated])
def delete_account(request):
    user = request.user
    user.delete()

    response = Response(status=status.HTTP_204_NO_CONTENT)
    cookie_domain = settings.AUTH_COOKIE_DOMAIN or None
    response.delete_cookie('refresh_token', path='/', domain=cookie_domain)
    response.delete_cookie('access_token', path='/', domain=cookie_domain)
    return response
