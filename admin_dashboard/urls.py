from django.urls import path
from . import views

app_name = 'admin_dashboard'

urlpatterns = [
    # Dashboard
    path('', views.dashboard, name='dashboard'),
    path('dashboard/', views.dashboard, name='dashboard_home'),

    # Users Management
    path('users/', views.users_list, name='users_list'),
    path('users/<int:user_id>/', views.user_detail, name='user_detail'),
    path('users/<int:user_id>/edit/', views.user_edit, name='user_edit'),
    path('users/add/', views.user_create, name='user_create'),
    path('users/<int:user_id>/delete/', views.user_delete, name='user_delete'),
    path('users/bulk-action/', views.users_bulk_action, name='users_bulk_action'),

    # Questions Management
    path('questions/', views.questions_list, name='questions_list'),
    path('questions/<int:question_id>/', views.question_detail, name='question_detail'),
    path('questions/<int:question_id>/edit/', views.question_edit, name='question_edit'),
    path('questions/add/', views.question_create, name='question_create'),
    path('questions/<int:question_id>/delete/', views.question_delete, name='question_delete'),
    path('questions/bulk-action/', views.questions_bulk_action, name='questions_bulk_action'),
    path('questions/generate-explanations/', views.generate_explanations_bulk, name='generate_explanations_bulk'),

    # Quizzes Management
    path('quizzes/', views.quizzes_list, name='quizzes_list'),
    path('quizzes/<int:quiz_id>/', views.quiz_detail, name='quiz_detail'),
    path('quizzes/<int:quiz_id>/edit/', views.quiz_edit, name='quiz_edit'),
    path('quizzes/add/', views.quiz_create, name='quiz_create'),
    path('quizzes/upload-excel/', views.quiz_excel_upload, name='quiz_excel_upload'),
    path('quizzes/<int:quiz_id>/delete/', views.quiz_delete, name='quiz_delete'),
    path('quizzes/bulk-action/', views.quizzes_bulk_action, name='quizzes_bulk_action'),

    # Quiz Attempts
    path('attempts/', views.attempts_list, name='attempts_list'),
    path('attempts/<int:attempt_id>/', views.attempt_detail, name='attempt_detail'),
    path('attempts/<int:attempt_id>/delete/', views.attempt_delete, name='attempt_delete'),

    # Topics/Categories
    path('topics/', views.topics_list, name='topics_list'),
    path('topics/<int:topic_id>/', views.topic_detail, name='topic_detail'),
    path('topics/<int:topic_id>/edit/', views.topic_edit, name='topic_edit'),
    path('topics/add/', views.topic_create, name='topic_create'),
    path('topics/<int:topic_id>/delete/', views.topic_delete, name='topic_delete'),

    # Analytics & Reports
    path('analytics/', views.analytics, name='analytics'),
    path('analytics/export/<str:data_type>/', views.export_data, name='export_data'),

    # Settings
    path('settings/', views.settings_view, name='settings'),
    path('settings/update/', views.settings_update, name='settings_update'),

    # API endpoints
    path('api/stats/', views.api_dashboard_stats, name='api_stats'),
    path('api/charts/user-growth/', views.api_user_growth_chart, name='api_user_growth_chart'),
    path('api/charts/quiz-trends/', views.api_quiz_trends_chart, name='api_quiz_trends_chart'),

    # Logout
    path('logout/', views.admin_logout, name='admin_logout'),
]