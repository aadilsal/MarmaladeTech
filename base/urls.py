from django.urls import path
from . import views
from django.conf.urls import handler404

handler=views.custom_404

urlpatterns=[
    path('',views.home,name='home'),
    path('index.html',views.home),
    path('leaderboard',views.leaderboard_view,name='leaderboard'),
    path('dashboard',views.dashboard_view,name='dashboard'),
    path('message/<int:id>',views.message_view,name='message'),
    path('about',views.about_view,name='about'),
    path('blogs',views.blogs_view,name='blogs'),
    path('blogs/<str:blog_id>',views.blog_view,name='blog'),
    path('contact',views.contact_view,name='contact'),
    path('terms_conditions',views. terms_conditions_view,name='terms_conditions'),
    path('notes',views.notes_view,name='notes'),
    path('search-users',views.search_users_view,name='search-users'),
]