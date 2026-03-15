// Study Plan Types

export interface StudyTopic {
  topic: string;
  description: string;
  youtube_link: string;
  estimated_hours?: number;
  difficulty?: 'beginner' | 'intermediate' | 'advanced';
  prerequisites?: string[];
}

export interface StudyPlan {
  id?: string;
  career: string;
  skill_level: 'beginner' | 'intermediate' | 'advanced';
  study_plan: StudyTopic[];
  total_estimated_hours?: number;
  created_at?: string;
  user_id?: string;
}

export interface StudyPlanRequest {
  career: string;
  skill_level: 'beginner' | 'intermediate' | 'advanced';
  user_id?: string;
  preferences?: {
    learning_style?: string;
    available_hours_per_week?: number;
    focus_areas?: string[];
  };
}

export interface StudyPlanResponse {
  success: boolean;
  data?: StudyPlan;
  error?: string;
  cached?: boolean;
}
