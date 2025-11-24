# from django.shortcuts import render,redirect
# from django.contrib.auth.decorators import login_required
# from django.contrib.auth.models import User
# from account.models import Profile
# from .models import Quiz,Category
# from django.db.models import Q
# from quiz.models import QuizSubmission
# from django.contrib import messages
# # Create your views here.
# @login_required(login_url='login')
# def all_quiz_view(request):

#     user_object=User.objects.get(username=request.user)
#     user_profile=Profile.objects.get(user=user_object)

#     quizzes=Quiz.objects.order_by('-created_at')
#     categories=Category.objects.all()

#     context={"user_profile": user_profile,"quizzes":quizzes,"categories":categories}

#     return render(request,'all-quiz.html',context)

# @login_required(login_url='login')
# def search_view(request,category):
    
#     user_object=User.objects.get(username=request.user)
#     user_profile=Profile.objects.get(user=user_object)
    
#      #search by search by
#     if request.GET.get('q') !=None:
#         q=request.GET.get('q')
#         query= Q(title__icontains=q) | Q(description__icontains=q)
#         quizzes=Quiz.objects.filter(query).distinct().order_by('-created_at')
#     #search by category
#     elif category !=" ":
#         quizzes=Quiz.objects.filter(category__name=category).order_by('-created_at')

#     else:
#         quizzes=Quiz.objects.order_by('-created_at')
    
#     categories=Category.objects.all()
#     context={"user_profile": user_profile,"quizzes":quizzes,"categories":categories}
#     return render(request,'all-quiz.html',context)

# @login_required(login_url='login')
# def quiz_view(request,quiz_id):

#     user_object=User.objects.get(username=request.user)
#     user_profile=Profile.objects.get(user=user_object)

#     quiz=Quiz.objects.filter(id=quiz_id).first()
#     total_questions=quiz.question_set.all().count()
#     if request.method =="POST":
#         # get scre
#         score=int(request.POST.get('score',0))

#         #check if user has already submitted
#         if QuizSubmission.objects.filter(user=request.user,quiz=quiz).exists():
#             messages.success(request,f"This time you got {score} out of {total_questions}")
#             return redirect('quiz',quiz_id)
        
#         submission=QuizSubmission(user=request.user,quiz=quiz,score=score)
#         submission.save()

#         #show result and explanations
#         questions=quiz.question_set.all()

#         context={
#             "user_profile": user_profile,
#             "quiz": quiz,
#             "questions": questions,
#             "score": score,
#             "total_questions": total_questions,
#             "show_explanation": True  
#         }



#         #show result 
#         messages.success(request,f"Quiz submitted! Score:{score}/{total_questions}")
#         return render(request, 'quiz_results.html', context) 
#         # return redirect('quiz',quiz_id)

#     if quiz is not None:
#         # context={"user_profile": user_profile, "quiz":quiz}
#         questions = quiz.question_set.all()
#         context = {
#             "user_profile": user_profile,
#             "quiz": quiz,
#             "questions": questions,
#             "show_explanation": False  # Explanations should not be shown yet
#         }
#     else:
#         return redirect('all_quiz')
    
    
#     return render(request,'quiz.html',context)

from django.shortcuts import render, redirect, get_object_or_404
from django.contrib.auth.decorators import login_required
from django.contrib.auth.models import User
from account.models import Profile
from .models import Quiz, Category
from django.db.models import Q
from quiz.models import QuizSubmission
from django.contrib import messages

@login_required(login_url='login')
def all_quiz_view(request):
    user_object = get_object_or_404(User, username=request.user)
    user_profile = get_object_or_404(Profile, user=user_object)

    quizzes = Quiz.objects.order_by('-created_at')
    categories = Category.objects.all()

    context = {"user_profile": user_profile, "quizzes": quizzes, "categories": categories}

    return render(request, 'all-quiz.html', context)

@login_required(login_url='login')
def search_view(request, category):
    user_object = get_object_or_404(User, username=request.user)
    user_profile = get_object_or_404(Profile, user=user_object)

    # Search by query
    if request.GET.get('q') is not None:
        q = request.GET.get('q')
        query = Q(title__icontains=q) | Q(description__icontains=q)
        quizzes = Quiz.objects.filter(query).distinct().order_by('-created_at')
    # Search by category
    elif category != " ":
        quizzes = Quiz.objects.filter(category__name=category).order_by('-created_at')
    else:
        quizzes = Quiz.objects.order_by('-created_at')

    categories = Category.objects.all()
    context = {"user_profile": user_profile, "quizzes": quizzes, "categories": categories}
    return render(request, 'all-quiz.html', context)

@login_required(login_url='login')
def quiz_view(request, quiz_id):
    user_object = get_object_or_404(User, username=request.user)
    user_profile = get_object_or_404(Profile, user=user_object)

    quiz = Quiz.objects.filter(id=quiz_id).first()
    if quiz is None:
        return redirect('all_quiz')

    total_questions = quiz.question_set.all().count()
    questions = quiz.question_set.all()

    if request.method == "POST":
        # Get the score
        score = int(request.POST.get('score', 0))

        # Check if the user has already submitted
        if QuizSubmission.objects.filter(user=request.user, quiz=quiz).exists():
            messages.success(request, f"This time you got {score} out of {total_questions}")
            context = {
                "user_profile": user_profile,
                "quiz": quiz,
                "questions": questions,
                "score": score,
                "total_questions": total_questions,
                "show_explanation": True  # Show explanations
            }
            return render(request, 'quiz.html', context)

        # Save the submission
        submission = QuizSubmission(user=request.user, quiz=quiz, score=score)
        submission.save()

        # Display results and explanations
        messages.success(request, f"Quiz submitted! Score: {score}/{total_questions}")
        context = {
            "user_profile": user_profile,
            "quiz": quiz,
            "questions": questions,
            "score": score,
            "total_questions": total_questions,
            "show_explanation": True  # Show explanations
        }
        return render(request, 'quiz.html', context)

    # For GET request, display the quiz without explanations
    context = {
        "user_profile": user_profile,
        "quiz": quiz,
        "questions": questions,
        "show_explanation": False  # Do not show explanations initially
    }
    return render(request, 'quiz.html', context)
