from django.urls import path
from . import views

urlpatterns=[
    path('all_quiz',views.all_quiz_view,name='all_quiz'),
    path('search/<str:category>',views.search_view,name='search'),
    path('<int:quiz_id>',views.quiz_view,name='quiz'),
    
    # API endpoints for AI explanations
    path('api/question/<int:question_id>/generate-explanation/', views.generate_explanation_api, name='generate_explanation_api'),
    path('api/question/<int:question_id>/regenerate-explanation/', views.regenerate_explanation_api, name='regenerate_explanation_api'),
    path('api/explanation-stats/', views.explanation_stats_api, name='explanation_stats_api'),
]