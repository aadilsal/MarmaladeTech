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
from django.http import JsonResponse
from django.views.decorators.http import require_POST
from django.views.decorators.csrf import csrf_exempt
from django.contrib.admin.views.decorators import staff_member_required
from django.core.exceptions import PermissionDenied
from django_ratelimit.decorators import ratelimit
from django.utils import timezone
from datetime import timedelta
import json
import logging

logger = logging.getLogger(__name__)

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

        # Capture user answers
        user_answers = {q.id: request.POST.get(str(q.id)) for q in questions}

        # Check if the user has already submitted
        if QuizSubmission.objects.filter(user=request.user, quiz=quiz).exists():
            messages.success(request, f"This time you got {score} out of {total_questions}")
            context = {
                "user_profile": user_profile,
                "quiz": quiz,
                "questions": questions,
                "score": score,
                "total_questions": total_questions,
                "show_explanation": True,  # Show explanations
                "user_answers": user_answers
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
            "show_explanation": True,  # Show explanations
            "user_answers": user_answers
        }
        return render(request, 'quiz.html', context)

    # For GET request, display the quiz without explanations
    # For GET request, display the quiz without explanations
    # Default context for GET (no explanations)
    context = {
        "user_profile": user_profile,
        "quiz": quiz,
        "questions": questions,
        "show_explanation": False,  # Do not show explanations initially
        "user_answers": {}  # Empty dict for GET
    }

    # If user requested a review or has a previous submission for this quiz,
    # render the quiz with explanations visible. This allows the "Review" button
    # to link back to the quiz page and show explanations for past attempts.
    review_flag = request.GET.get('review')
    if review_flag == '1' or QuizSubmission.objects.filter(user=request.user, quiz=quiz).exists():
        latest_submission = QuizSubmission.objects.filter(user=request.user, quiz=quiz).order_by('-submitted_at').first()
        context.update({
            "show_explanation": True,
            "score": latest_submission.score if latest_submission else None,
            "total_questions": total_questions,
            "user_answers": {}  # we don't store per-question answers for past submissions
        })
    logger.debug(f"Quiz view context: {context.keys()}")
    return render(request, 'quiz.html', context)


# API Views for AI Explanations

@require_POST
@login_required
@ratelimit(key='user', rate='10/h', method='POST', block=True)
def generate_explanation_api(request, question_id):
    """
    API endpoint to generate AI explanation for a question.
    Rate limited to 10 requests per hour per user.
    """
    try:
        from .models import Question
        from .services import ExplanationGenerator

        question = get_object_or_404(Question, id=question_id)

        # Check if user has permission (must be staff or have taken the quiz)
        if not request.user.is_staff:
            quiz = question.quiz
            if not QuizSubmission.objects.filter(user=request.user, quiz=quiz).exists():
                raise PermissionDenied("You must complete the quiz before requesting explanations.")

        # Generate explanation
        generator = ExplanationGenerator()
        explanation = generator.generate_explanation(question)

        if explanation:
            response_data = {
                'success': True,
                'explanation': explanation,
                'is_ai_generated': True,
                'generated_at': question.ai_generated_at.isoformat() if question.ai_generated_at else None,
                'cost': float(question.ai_cost) if question.ai_cost else None,
            }
        else:
            response_data = {
                'success': False,
                'error': question.ai_error or 'Failed to generate explanation',
            }

        # Log the request
        logger.info(f"Explanation request for question {question_id} by user {request.user.username}: {'success' if explanation else 'failed'}")

        return JsonResponse(response_data)

    except PermissionDenied as e:
        logger.warning(f"Permission denied for explanation request: question {question_id}, user {request.user.username}")
        return JsonResponse({'success': False, 'error': str(e)}, status=403)
    except Exception as e:
        logger.error(f"Error generating explanation for question {question_id}: {e}")
        return JsonResponse({'success': False, 'error': 'Internal server error'}, status=500)


@staff_member_required
@require_POST
def regenerate_explanation_api(request, question_id):
    """
    Admin-only endpoint to force regenerate an AI explanation.
    """
    try:
        from .models import Question
        from .services import ExplanationGenerator

        question = get_object_or_404(Question, id=question_id)

        generator = ExplanationGenerator()
        explanation = generator.regenerate_explanation(question)

        if explanation:
            response_data = {
                'success': True,
                'explanation': explanation,
                'generated_at': question.ai_generated_at.isoformat() if question.ai_generated_at else None,
                'cost': float(question.ai_cost) if question.ai_cost else None,
            }
        else:
            response_data = {
                'success': False,
                'error': question.ai_error or 'Failed to regenerate explanation',
            }

        logger.info(f"Admin regeneration for question {question_id} by {request.user.username}: {'success' if explanation else 'failed'}")

        return JsonResponse(response_data)

    except Exception as e:
        logger.error(f"Error regenerating explanation for question {question_id}: {e}")
        return JsonResponse({'success': False, 'error': 'Internal server error'}, status=500)


@staff_member_required
def explanation_stats_api(request):
    """
    Admin-only endpoint to get explanation generation statistics.
    """
    try:
        from .services import ExplanationGenerator

        generator = ExplanationGenerator()
        stats = generator.get_generation_stats()

        return JsonResponse({
            'success': True,
            'stats': stats
        })

    except Exception as e:
        logger.error(f"Error getting explanation stats: {e}")
        return JsonResponse({'success': False, 'error': 'Internal server error'}, status=500)
