from django.shortcuts import render, HttpResponse, redirect, get_object_or_404
from django.contrib.auth.models import User
from account.models import Profile
from quiz.models import Question,Quiz,QuizSubmission,UserRank
from django.contrib.auth.decorators import login_required,user_passes_test
import datetime,math
from .models import Message,Blog
from django.contrib import messages
from django.db.models import Count
from django.db.models.functions import ExtractYear
from django.db.models import Q 
# Create your views here.

def home(request):
    context = {}  # Initialize context at the beginning

    if request.user.is_authenticated:
        try:
            # Use request.user directly
            user_profile = Profile.objects.get(user=request.user)
            context = {"user_profile": user_profile}
        except Profile.DoesNotExist:
            # Handle the case where the Profile does not exist
            context = {"error": "Profile does not exist."}
    else:
        # If not authenticated, just pass empty context
        context = {}

    return render(request, 'welcome.html', context)

# @login_required(login_url="login")
# def leaderboard_view(request):
#     leaderboard_users = UserRank.objects.order_by('rank')
#     user_profile = Profile.objects.get(user=request.user)
#     context = {"user_profile": user_profile, "leaderboard_users": leaderboard_users}

#     return render(request, "leaderboard.html", context)
def leaderboard_view(request):
    leaderboard_users = UserRank.objects.order_by('rank')
    context = {"leaderboard_users": leaderboard_users}

    if request.user.is_authenticated:
        try:
            user_profile = Profile.objects.get(user=request.user)
            context["user_profile"] = user_profile
        except Profile.DoesNotExist:
            context["error"] = "Profile does not exist."

    return render(request, "leaderboard.html", context)


def is_superuser(user):
    return user.is_superuser

@user_passes_test(is_superuser)
@login_required(login_url="login")
def dashboard_view(request):
    user_profile = get_object_or_404(Profile, user=request.user)
    

    #total numbers 
    total_users=User.objects.all().count()
    total_quizzes=Quiz.objects.all().count()
    total_quiz_submit=QuizSubmission.objects.all().count()
    total_questions=Question.objects.all().count()

    #today numbers
    today_users=User.objects.filter(date_joined__date=datetime.date.today()).count()
    today_quizzes_objs=Quiz.objects.filter(created_at__date=datetime.date.today())
    today_quizzes=Quiz.objects.filter(created_at__date=datetime.date.today()).count()
    today_quiz_submit=QuizSubmission.objects.filter(submitted_at__date=datetime.date.today()).count()
    today_questions=0
    for quiz in today_quizzes_objs:
        today_questions+= quiz.question_set.count()
   # today_questions=Question.objects.filter(date_joined__date=datetime.date.today()).count()

    gain_users= gain_percentage(total_users,today_users)
    gain_quizzes=gain_percentage(total_quizzes,today_quizzes)
    gain_questions=gain_percentage(total_questions,today_questions)
    gain_quiz_submit=gain_percentage(total_quiz_submit,today_quiz_submit)

    #inbox messages 
    messages=Message.objects.filter(created_at__date=datetime.date.today()).order_by('-created_at')




    context = {"user_profile": user_profile,
               "total_users":total_users,
               "total_quizzes":total_quizzes,
               "total_quiz_submit":total_quiz_submit,
               "total_questions":total_questions,
               "today_users":today_users,
               "today_quizzes":today_quizzes,
               "today_quiz_submit":today_quiz_submit,
               "today_questions":today_questions,
               "gain_users":gain_users,
               "gain_quizzes":gain_quizzes,
               "gain_quiz_submit":gain_quiz_submit,
               "gain_questions":gain_questions,
               "messages":messages
               }

    return render(request,"dashboard.html",context)

def gain_percentage(total,today):
    if total> 0 and today > 0:
        gain = math.floor((today *100 )/total)
        return gain


def about_view(request):
    context = {}
    if request.user.is_authenticated:
        try:
            # Use request.user directly
            user_profile = Profile.objects.get(user=request.user)
            context = {"user_profile": user_profile}
        except Profile.DoesNotExist:
            # Handle the case where the Profile does not exist
            context = {"error": "Profile does not exist."}
    return render(request, "about.html", context)


# def blogs_view(request):
#     context = {}

#     year_blog_count=Blog.objects.annotate(year=ExtractYear('created_at')).values('year').annotate(count=Count('id')).order_by('-year').filter(status='public')
#     print(year_blog_count)
#     blogs=Blog.objects.filter(status='public').order_by('-created_at')
#     print(blogs)


#     if request.user.is_authenticated:
#         try:
#             # Use request.user directly
#             user_profile = Profile.objects.get(user=request.user)
#             context = {"user_profile": user_profile,"year_blog_count":year_blog_count,"blogs":blogs}
#         except Profile.DoesNotExist:
#             # Handle the case where the Profile does not exist
#             context = {"year_blog_count":year_blog_count,"blogs":blogs}
#     return render(request, "blogs.html", context)
def blogs_view(request):
    context = {}

    # Get year-wise blog count
    year_blog_count = Blog.objects.annotate(
        year=ExtractYear('created_at')
    ).values('year').annotate(
        count=Count('id')
    ).order_by('-year').filter(status='public')
    
    # Get all public blogs, ordered by creation date
    blogs = Blog.objects.filter(status='public').order_by('-created_at')
    
    # If the user is authenticated, add the user profile to the context
    if request.user.is_authenticated:
        try:
            user_profile = Profile.objects.get(user=request.user)
            context = {
                "user_profile": user_profile,
                "year_blog_count": year_blog_count,
                "blogs": blogs
            }
        except Profile.DoesNotExist:
            context = {
                "year_blog_count": year_blog_count,
                "blogs": blogs
            }
    else:
        # For non-authenticated users, still show the blogs, but without user profile
        context = {
            "year_blog_count": year_blog_count,
            "blogs": blogs
        }

    return render(request, "blogs.html", context)

@login_required(login_url="login")
def blog_view(request,blog_id):
    context = {}

    user_profile = Profile.objects.get(user=request.user)
    blog=Blog.objects.filter(id=blog_id).first()

    context = {"user_profile": user_profile,"blog":blog}
        
    return render(request, "blog.html", context)


@login_required(login_url="login")
def contact_view(request):
    context = {}

    user_profile = get_object_or_404(Profile, user=request.user)
    context = {"user_profile": user_profile}

    if request.method == "POST":
        subject=request.POST.get('subject')
        message=request.POST.get('message')

        if subject is not None and message is not None:
            form=Message.objects.create(user=request.user,subject=subject,message=message)
            form.save()
            messages.success(request,"Your message has been sent!")
            return redirect('profile',request.user.username)
        else:
            return redirect('contact')


    return render(request, "contact.html", context)
@user_passes_test(is_superuser)
@login_required(login_url='login')
def message_view(request,id):
    user_profile = get_object_or_404(Profile, user=request.user)
    message=Message.objects.filter(id=int(id)).first()
    if not message.is_read:
        message.is_read=True
        message.save()


    context = {"user_profile": user_profile,"message":message}
    
    return render(request,"message.html",context)

def terms_conditions_view(request):
    context = {}  # Initialize context at the beginning

    if request.user.is_authenticated:
        try:
            # Use request.user directly
            user_profile = Profile.objects.get(user=request.user)
            
            context = {"user_profile": user_profile}
        except Profile.DoesNotExist:
            # Handle the case where the Profile does not exist
            context = {"error": "Profile does not exist."}

    return render(request, 'terms-conditions.html', context)


@login_required(login_url="login")
def notes_view(request):
    context = {}

    user_profile = get_object_or_404(Profile, user=request.user)
    context = {"user_profile": user_profile}
        
    return render(request, "notes.html", context)

def search_users_view(request):
    context = {}  
    query=request.GET.get('q')
    print(query)
    if query:
        users = User.objects.filter(
            Q(username__icontains=query) | 
            Q(first_name__icontains=query) | 
            Q(last_name__icontains=query)
        ).order_by('date_joined')
        print(users)
    else:
        users=[]
        print(users)
    
    if request.user.is_authenticated:
        try:
            
            user_profile = Profile.objects.get(user=request.user)
            context = {"user_profile": user_profile,"query":query,"users":users}
            print(context)
        except Profile.DoesNotExist:
            context = {"query":query,"users":users}
            print(context)

    return render(request, "search-users.html", context)

def custom_404(request,exception): 
    return render(request,'404.html',status=404)