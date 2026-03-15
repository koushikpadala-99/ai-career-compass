from django.urls import path
from .views import (CareerListView, AnalyzeInterestsView, SavedCareersView,
                    GenerateRoadmapView, UserAnalysisHistoryView, GenerateStudyPlanView,
                    StudyPlanDetailView, MatchCareersFromQuizView)

urlpatterns = [
    path('list/', CareerListView.as_view(), name='career-list'),
    path('analyze/', AnalyzeInterestsView.as_view(), name='analyze-interests'),
    path('saved/', SavedCareersView.as_view(), name='saved-careers'),
    path('roadmap/generate/', GenerateRoadmapView.as_view(), name='generate-roadmap'),
    path('history/', UserAnalysisHistoryView.as_view(), name='analysis-history'),
    path('study-plan/', GenerateStudyPlanView.as_view(), name='generate-study-plan'),
    path('study-plan/<int:pk>/', StudyPlanDetailView.as_view(), name='study-plan-detail'),
    path('match-quiz/', MatchCareersFromQuizView.as_view(), name='match-quiz'),
]
