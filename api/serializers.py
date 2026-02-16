from rest_framework import serializers
from django.contrib.auth.models import User
from quiz.models import Quiz, Question, Choice, QuizSubmission, ExplanationTask, QuizAttempt, AttemptAnswer
from account.models import Profile
from base.models import Blog


class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ('id', 'username', 'first_name', 'last_name', 'email')


class ProfileSerializer(serializers.ModelSerializer):
    user = UserSerializer(read_only=True)
    first_name = serializers.CharField(write_only=True, required=False, allow_blank=True)
    last_name = serializers.CharField(write_only=True, required=False, allow_blank=True)
    username = serializers.CharField(write_only=True, required=False, allow_blank=True)
    email = serializers.EmailField(write_only=True, required=False, allow_blank=True)

    class Meta:
        model = Profile
        fields = ('user', 'bio', 'profile_img', 'location', 'gender', 'first_name', 'last_name', 'username', 'email')

    def validate(self, attrs):
        user = self.instance.user if self.instance else None
        username = attrs.get('username')
        email = attrs.get('email')

        if username and User.objects.filter(username=username).exclude(id=user.id if user else None).exists():
            raise serializers.ValidationError({'username': 'Username already in use'})
        if email and User.objects.filter(email=email).exclude(id=user.id if user else None).exists():
            raise serializers.ValidationError({'email': 'Email already in use'})

        return attrs

    def update(self, instance, validated_data):
        user = instance.user
        for field in ['first_name', 'last_name', 'username', 'email']:
            if field in validated_data:
                setattr(user, field, validated_data.pop(field))
        user.save()
        return super().update(instance, validated_data)


class ChoiceSerializer(serializers.ModelSerializer):
    class Meta:
        model = Choice
        fields = ('id', 'text')


class ChoiceReviewSerializer(serializers.ModelSerializer):
    class Meta:
        model = Choice
        fields = ('id', 'text', 'is_correct')


class QuestionSerializer(serializers.ModelSerializer):
    choices = ChoiceSerializer(source='choice_set', many=True, read_only=True)

    class Meta:
        model = Question
        fields = ('id', 'text', 'image', 'choices')


class QuestionReviewSerializer(serializers.ModelSerializer):
    choices = ChoiceReviewSerializer(source='choice_set', many=True, read_only=True)

    class Meta:
        model = Question
        fields = ('id', 'text', 'explanation', 'ai_explanation', 'ai_generated_at', 'ai_cost', 'ai_model', 'ai_error', 'image', 'choices')


class QuizListSerializer(serializers.ModelSerializer):
    category = serializers.StringRelatedField()
    question_count = serializers.IntegerField(read_only=True)

    class Meta:
        model = Quiz
        fields = ('id', 'title', 'description', 'category', 'created_at', 'question_count')


class QuizDetailSerializer(serializers.ModelSerializer):
    questions = QuestionSerializer(source='question_set', many=True, read_only=True)
    category = serializers.StringRelatedField()

    class Meta:
        model = Quiz
        fields = ('id', 'title', 'description', 'category', 'created_at', 'questions')


class QuizSubmissionSerializer(serializers.ModelSerializer):
    user = UserSerializer(read_only=True)
    total_questions = serializers.SerializerMethodField()

    class Meta:
        model = QuizSubmission
        fields = ('id', 'user', 'quiz', 'score', 'submitted_at', 'total_questions')
        read_only_fields = ('id', 'user', 'submitted_at')

    def create(self, validated_data):
        request = self.context.get('request')
        if request and request.user and request.user.is_authenticated:
            validated_data['user'] = request.user
        return super().create(validated_data)

    def get_total_questions(self, obj):
        return obj.quiz.question_set.count()


class BlogSerializer(serializers.ModelSerializer):
    author = UserSerializer(read_only=True)

    class Meta:
        model = Blog
        fields = ('id', 'title', 'content', 'author', 'status', 'created_at')


class ExplanationTaskSerializer(serializers.ModelSerializer):
    question = serializers.PrimaryKeyRelatedField(read_only=True)
    user = UserSerializer(read_only=True)

    class Meta:
        model = ExplanationTask
        fields = ('id', 'task_id', 'question', 'user', 'status', 'result', 'error', 'success', 'cost', 'generated_at', 'created_at', 'updated_at')


class QuizAttemptSerializer(serializers.ModelSerializer):
    class Meta:
        model = QuizAttempt
        fields = ('id', 'quiz', 'status', 'started_at', 'submitted_at', 'score', 'total_questions', 'time_taken_seconds')


class AttemptAnswerSerializer(serializers.Serializer):
    question_id = serializers.IntegerField()
    choice_id = serializers.IntegerField()

    def validate(self, data):
        attempt = self.context.get('attempt')
        if not attempt:
            raise serializers.ValidationError('Attempt not found')

        try:
            question = Question.objects.get(id=data['question_id'], quiz=attempt.quiz)
        except Question.DoesNotExist:
            raise serializers.ValidationError('Question does not belong to this quiz')

        try:
            choice = Choice.objects.get(id=data['choice_id'], question=question)
        except Choice.DoesNotExist:
            raise serializers.ValidationError('Choice does not belong to this question')

        data['question'] = question
        data['choice'] = choice
        return data


class AttemptSubmitSerializer(serializers.Serializer):
    time_taken_seconds = serializers.IntegerField(required=False, allow_null=True, min_value=0)


class AttemptQuestionSerializer(serializers.ModelSerializer):
    choices = ChoiceSerializer(source='choice_set', many=True, read_only=True)

    class Meta:
        model = Question
        fields = ('id', 'text', 'image', 'choices')


class AttemptReviewQuestionSerializer(serializers.Serializer):
    id = serializers.IntegerField()
    text = serializers.CharField()
    image = serializers.CharField(allow_null=True, required=False)
    choices = ChoiceReviewSerializer(many=True)
    selected_choice_id = serializers.IntegerField(allow_null=True)
    correct_choice_id = serializers.IntegerField(allow_null=True)
    explanation = serializers.CharField(allow_null=True, required=False)
    ai_explanation = serializers.CharField(allow_null=True, required=False)
    ai_generated_at = serializers.DateTimeField(allow_null=True, required=False)
    ai_cost = serializers.DecimalField(max_digits=10, decimal_places=6, allow_null=True, required=False)
    ai_model = serializers.CharField(allow_null=True, required=False)
    ai_error = serializers.CharField(allow_null=True, required=False)


class AttemptQuestionsResponseSerializer(serializers.Serializer):
    attempt_id = serializers.IntegerField()
    quiz_id = serializers.IntegerField()
    questions = AttemptQuestionSerializer(many=True)


class AttemptSubmitResponseSerializer(serializers.Serializer):
    attempt_id = serializers.IntegerField()
    quiz_id = serializers.IntegerField()
    score = serializers.IntegerField()
    total_questions = serializers.IntegerField()
    submitted_at = serializers.DateTimeField()


class AttemptResultSerializer(serializers.Serializer):
    attempt_id = serializers.IntegerField()
    quiz_id = serializers.IntegerField()
    quiz_title = serializers.CharField()
    category = serializers.CharField(allow_null=True, required=False)
    score = serializers.IntegerField()
    total_questions = serializers.IntegerField()
    accuracy = serializers.FloatField()
    submitted_at = serializers.DateTimeField(allow_null=True, required=False)
    time_taken_seconds = serializers.IntegerField(allow_null=True, required=False)


class AttemptAnalysisSerializer(serializers.Serializer):
    attempt_id = serializers.IntegerField()
    quiz_id = serializers.IntegerField()
    correct = serializers.IntegerField()
    incorrect = serializers.IntegerField()
    total_questions = serializers.IntegerField()
    accuracy = serializers.FloatField()


class AttemptReviewResponseSerializer(serializers.Serializer):
    attempt_id = serializers.IntegerField()
    quiz_id = serializers.IntegerField()
    questions = AttemptReviewQuestionSerializer(many=True)


class LastAttemptSerializer(serializers.Serializer):
    attempt_id = serializers.IntegerField()
    quiz_id = serializers.IntegerField()
    quiz_title = serializers.CharField()
    score = serializers.IntegerField(allow_null=True, required=False)
    total_questions = serializers.IntegerField(allow_null=True, required=False)
    submitted_at = serializers.DateTimeField(allow_null=True, required=False)


class DashboardSummarySerializer(serializers.Serializer):
    total_attempts = serializers.IntegerField()
    total_questions = serializers.IntegerField()
    total_score = serializers.IntegerField()
    accuracy = serializers.FloatField()
    last_attempt = LastAttemptSerializer(allow_null=True, required=False)


class RecentAttemptSerializer(serializers.Serializer):
    attempt_id = serializers.IntegerField()
    quiz_id = serializers.IntegerField()
    quiz_title = serializers.CharField()
    score = serializers.IntegerField(allow_null=True, required=False)
    total_questions = serializers.IntegerField(allow_null=True, required=False)
    submitted_at = serializers.DateTimeField(allow_null=True, required=False)


class SubjectPerformanceSerializer(serializers.Serializer):
    subject = serializers.CharField()
    correct = serializers.IntegerField()
    total = serializers.IntegerField()
    accuracy = serializers.FloatField()


class ProgressTrendSerializer(serializers.Serializer):
    date = serializers.CharField()
    correct = serializers.IntegerField()
    total = serializers.IntegerField()
    accuracy = serializers.FloatField()


class AdminAnalyticsSummarySerializer(serializers.Serializer):
    total_users = serializers.IntegerField()
    total_quizzes = serializers.IntegerField()
    total_questions = serializers.IntegerField()
    total_attempts = serializers.IntegerField()
    total_score = serializers.IntegerField()
    total_questions_answered = serializers.IntegerField()
    average_score = serializers.FloatField()


class AdminProgressTrendSerializer(serializers.Serializer):
    date = serializers.CharField()
    correct = serializers.IntegerField()
    total = serializers.IntegerField()
    attempts = serializers.IntegerField()
    accuracy = serializers.FloatField()
