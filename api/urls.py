from django.urls import path, include
from rest_framework import routers
from .views import (
    QuizViewSet,
    QuestionViewSet,
    ChoiceViewSet,
    QuizSubmissionViewSet,
    ProfileViewSet,
    BlogViewSet,
    ExplanationTaskViewSet,
    QuizAttemptViewSet,
    leaderboard,
    task_status,
    search_users,
    delete_account,
    dashboard_summary,
    dashboard_recent_attempts,
    analytics_subject_performance,
    analytics_progress_trend,
    admin_analytics_summary,
    admin_analytics_subject_performance,
    admin_analytics_progress_trend,
)
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView
from .auth_views import CookieTokenObtainPairView, CookieTokenRefreshView, LogoutView, RegisterView, MeView
from .password_reset_views import PasswordResetRequestView, PasswordResetConfirmView
from .cloudinary_views import CloudinarySignView
from .pages_views import about_view, contact_view

router = routers.DefaultRouter()
router.register(r'quizzes', QuizViewSet)
router.register(r'questions', QuestionViewSet)
router.register(r'choices', ChoiceViewSet)
router.register(r'submissions', QuizSubmissionViewSet, basename='submissions')
router.register(r'attempts', QuizAttemptViewSet, basename='attempts')
router.register(r'profiles', ProfileViewSet)
router.register(r'blogs', BlogViewSet)
router.register(r'tasks', ExplanationTaskViewSet, basename='tasks')

urlpatterns = [
    path('token/', TokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('auth/login/', CookieTokenObtainPairView.as_view(), name='auth_login'),
    path('auth/register/', RegisterView.as_view(), name='auth_register'),
    path('auth/refresh/', CookieTokenRefreshView.as_view(), name='auth_refresh'),
    path('auth/logout/', LogoutView.as_view(), name='auth_logout'),
    path('auth/me/', MeView.as_view(), name='auth_me'),
    path('auth/password-reset/', PasswordResetRequestView.as_view(), name='password_reset_request'),
    path('auth/password-reset/confirm/', PasswordResetConfirmView.as_view(), name='password_reset_confirm'),
    path('about/', about_view, name='about'),
    path('contact/', contact_view, name='contact'),
    path('', include(router.urls)),
    path('tasks/status/<str:task_id>/', task_status, name='task-status'),
    path('users/search/', search_users, name='users-search'),
    path('users/me/', delete_account, name='users-me-delete'),
    path('cloudinary/sign/', CloudinarySignView.as_view(), name='cloudinary-sign'),
    path('leaderboard/', leaderboard, name='leaderboard'),
    path('dashboard/summary/', dashboard_summary, name='dashboard-summary'),
    path('dashboard/recent-attempts/', dashboard_recent_attempts, name='dashboard-recent-attempts'),
    path('analytics/subject-performance/', analytics_subject_performance, name='analytics-subject-performance'),
    path('analytics/progress-trend/', analytics_progress_trend, name='analytics-progress-trend'),
    path('admin/analytics/summary/', admin_analytics_summary, name='admin-analytics-summary'),
    path('admin/analytics/subject-performance/', admin_analytics_subject_performance, name='admin-analytics-subject-performance'),
    path('admin/analytics/progress-trend/', admin_analytics_progress_trend, name='admin-analytics-progress-trend'),
]
