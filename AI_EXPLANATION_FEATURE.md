# AI Explanation Generation Feature

This document describes the AI-powered explanation generation feature for the MDCAT Expert quiz application.

## Overview

The AI Explanation Generation feature uses Google's Gemini API to automatically generate detailed, medically accurate explanations for quiz questions. This helps students understand complex medical concepts and learn from their quiz attempts.

## Features

- **Automatic AI Generation**: Generate explanations using Google's Gemini 1.5 Flash model
- **Caching**: Cache generated explanations to reduce API costs and improve performance
- **Rate Limiting**: Limit API calls per user to prevent abuse
- **Admin Controls**: Admin interface for bulk generation and regeneration
- **Cost Tracking**: Track API usage costs
- **Security**: Proper authentication and input validation
- **Fallback**: Graceful fallback to manually created explanations

## Setup

### Environment Variables

Add the following environment variables to your `.env` file:

```bash
# Gemini AI Configuration
GEMINI_API_KEY=your_gemini_api_key_here
GEMINI_MODEL=gemini-1.5-flash
GEMINI_MAX_TOKENS=1000
GEMINI_TEMPERATURE=0.7

# Caching Configuration
EXPLANATION_CACHE_TIMEOUT=86400  # 24 hours

# Rate Limiting
EXPLANATION_RATE_LIMIT=10  # requests per hour per user
```

### Installation

1. Install required packages:
```bash
pip install google-generativeai==0.8.3 django-ratelimit==4.1.0
```

2. Run migrations:
```bash
python manage.py migrate
```

3. Get a Gemini API key from [Google AI Studio](https://makersuite.google.com/app/apikey)

## Usage

### For Students

After completing a quiz, students can click "Generate AI Explanation" buttons to get AI-generated explanations for questions.

### For Administrators

#### Management Command

Generate explanations for all questions without AI explanations:

```bash
python manage.py generate_explanations
```

Generate explanations for a specific quiz:

```bash
python manage.py generate_explanations --quiz-id 1
```

Generate explanation for a specific question:

```bash
python manage.py generate_explanations --question-id 123
```

Force regeneration of existing explanations:

```bash
python manage.py generate_explanations --force
```

#### Admin Interface

In the Django admin, you can:

- View AI explanation status for each question
- Bulk generate explanations using admin actions
- View cost estimates and generation timestamps
- Regenerate individual explanations

## API Endpoints

### Generate Explanation

**POST** `/quiz/api/question/{question_id}/generate-explanation/`

Generates an AI explanation for a question. Requires user authentication and quiz completion.

**Response:**
```json
{
  "success": true,
  "explanation": "AI-generated explanation text...",
  "is_ai_generated": true,
  "generated_at": "2024-01-15T10:30:00Z",
  "cost": 0.0012
}
```

### Regenerate Explanation (Admin Only)

**POST** `/quiz/api/question/{question_id}/regenerate-explanation/`

Forces regeneration of an AI explanation. Requires staff status.

### Get Statistics (Admin Only)

**GET** `/quiz/api/explanation-stats/`

Returns statistics about explanation generation.

**Response:**
```json
{
  "success": true,
  "stats": {
    "total_questions": 150,
    "ai_generated_count": 45,
    "total_cost": 0.0567,
    "average_cost": 0.0013,
    "cache_timeout": 86400
  }
}
```

## Database Schema

New fields added to the `Question` model:

- `ai_explanation`: Text field for AI-generated explanations
- `ai_generated_at`: Timestamp of generation
- `ai_cost`: Decimal field for API cost tracking
- `ai_model`: Model name used for generation
- `ai_error`: Error messages if generation fails

## Security Considerations

- API keys are never exposed to the frontend
- All user inputs are validated and sanitized
- Rate limiting prevents API abuse
- Authentication checks for explanation generation
- All API requests are logged securely
- Sensitive medical data is handled appropriately

## Caching Strategy

Explanations are cached using Django's cache framework with the following key format:
```
question_explanation_{question_id}
```

Cache timeout is configurable via `EXPLANATION_CACHE_TIMEOUT` setting.

## Cost Estimation

The system estimates costs based on token usage:
- Input tokens: ~1.3x character count
- Output tokens: ~1.3x character count
- Rate: $0.15 per million tokens for Gemini 1.5 Flash

## Error Handling

The system handles various error scenarios:

- API failures: Logged and stored in `ai_error` field
- Rate limiting: User-friendly error messages
- Network issues: Retry logic and fallback
- Invalid responses: Validation and sanitization

## Testing

Run the test suite:

```bash
python manage.py test quiz.tests
```

Test coverage includes:
- Successful explanation generation
- API failure scenarios
- Cache hit/miss behavior
- Invalid response handling
- Prompt formatting validation
- Authentication and authorization
- Rate limiting

## Monitoring

Monitor the following metrics:

- API usage and costs
- Cache hit rates
- Error rates
- User engagement with explanations
- Generation success rates

## Troubleshooting

### Common Issues

1. **API Key Not Configured**: Ensure `GEMINI_API_KEY` is set in environment variables
2. **Rate Limiting**: Users may hit rate limits; implement exponential backoff
3. **Cache Issues**: Clear cache if explanations seem stale
4. **Database Errors**: Check migrations are applied correctly

### Logs

Check Django logs for detailed error information:
- API request/response logs
- Generation errors
- Authentication failures
- Rate limiting events

## Future Enhancements

- Support for multiple AI models
- Batch explanation generation
- Explanation quality scoring
- User feedback on explanations
- Integration with learning analytics
- Multi-language support