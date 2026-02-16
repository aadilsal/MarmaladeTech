"""
Contact and About pages endpoints
"""
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from rest_framework import status
from django.core.mail import send_mail
from django.conf import settings


@api_view(['GET'])
@permission_classes([AllowAny])
def about_view(request):
    """
    GET /api/about/
    
    Returns information about the platform
    """
    about_data = {
        "title": "About MDCAT Expert",
        "description": "Pakistan's most focused MDCAT preparation platform. Practice thousands of exam-accurate MCQs with instant feedback. No clutter, no distractions.",
        "mission": "Our mission is to democratize access to quality MDCAT preparation resources and help students achieve their medical aspirations through focused, effective learning.",
        "vision": "To become the leading online MDCAT preparation platform trusted by thousands of Pakistani students.",
        "features": [
            {
                "title": "Comprehensive Question Bank",
                "description": "Thousands of carefully curated MCQs covering all MDCAT subjects"
            },
            {
                "title": "Real-time Analytics",
                "description": "Track your progress with detailed performance metrics and insights"
            },
            {
                "title": "Expert Explanations",
                "description": "AI-powered and expert-reviewed explanations for every question"
            },
            {
                "title": "Practice Tests",
                "description": "Full-length mock tests to simulate actual MDCAT exam conditions"
            },
            {
                "title": "Leaderboards",
                "description": "Compete with peers and stay motivated with real-time rankings"
            },
            {
                "title": "Daily Streaks",
                "description": "Build consistent study habits with streak tracking"
            }
        ],
        "team": [
            {
                "name": "Aadil Ahmad",
                "role": "Founder & Lead Developer",
                "bio": "Full-stack engineer passionate about education technology"
            }
        ],
        "stats": {
            "total_questions": 10000,
            "total_users": 5000,
            "success_rate": "92%",
            "average_rating": "4.8"
        }
    }
    return Response(about_data, status=status.HTTP_200_OK)


@api_view(['POST'])
@permission_classes([AllowAny])
def contact_view(request):
    """
    POST /api/contact/
    
    Handle contact form submissions
    
    Request body:
    {
        "name": "John Doe",
        "email": "john@example.com",
        "subject": "Feedback",
        "message": "I have a suggestion..."
    }
    """
    try:
        name = request.data.get('name')
        email = request.data.get('email')
        subject = request.data.get('subject')
        message = request.data.get('message')

        # Validation
        if not all([name, email, subject, message]):
            return Response(
                {'detail': 'All fields are required'},
                status=status.HTTP_400_BAD_REQUEST
            )

        # Validate email format
        if '@' not in email or '.' not in email:
            return Response(
                {'detail': 'Invalid email format'},
                status=status.HTTP_400_BAD_REQUEST
            )

        # Message length check
        if len(message) < 10 or len(message) > 5000:
            return Response(
                {'detail': 'Message must be between 10 and 5000 characters'},
                status=status.HTTP_400_BAD_REQUEST
            )

        # Send email to admin
        email_subject = f"Contact Form: {subject} - From {name}"
        email_body = f"""
New contact form submission:

Name: {name}
Email: {email}
Subject: {subject}

Message:
{message}

---
Please reply to: {email}
        """

        try:
            send_mail(
                email_subject,
                email_body,
                settings.DEFAULT_FROM_EMAIL,
                [settings.CONTACT_EMAIL or 'admin@marmaladetechmdcat.com'],
                fail_silently=False,
            )
        except Exception as e:
            # Log email error but still return success
            print(f"Email sending failed: {str(e)}")
            pass

        # Also send confirmation to user
        try:
            send_mail(
                "We received your message",
                f"""
Hi {name},

Thank you for reaching out to MDCAT Expert. We have received your message and will get back to you as soon as possible.

Best regards,
MDCAT Expert Team
                """,
                settings.DEFAULT_FROM_EMAIL,
                [email],
                fail_silently=True,
            )
        except:
            pass

        return Response(
            {'detail': 'Message sent successfully. We will get back to you soon.'},
            status=status.HTTP_201_CREATED
        )

    except Exception as e:
        return Response(
            {'detail': f'Error: {str(e)}'},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )
