// Supabase Configuration and Client
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { getIdToken } from './firebase';

// Supabase configuration from environment variables
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

// Create Supabase client
export const supabase: SupabaseClient = createClient(supabaseUrl, supabaseAnonKey);

// ============================================
// Database Types
// ============================================

export interface UserProfile {
  id: string;
  firebase_uid: string;
  email: string;
  display_name: string | null;
  created_at: string;
  updated_at: string;
  points: number;
  level: number;
  streak: number;
  tasks_completed: number;
  study_hours: number;
  avatar_url: string | null;
  bio: string | null;
  location: string | null;
}

export interface Assessment {
  id: string;
  user_id: string;
  created_at: string;
  activities: string;
  subjects: string;
  work_environment: string;
  motivation: string;
  skills: string;
  work_style: string;
  pace: string;
  education: string;
  interests: any[];
  strengths: any[];
  personality_traits: any;
  completed: boolean;
  score: number | null;
}

export interface Recommendation {
  id: string;
  user_id: string;
  assessment_id: string;
  created_at: string;
  career_title: string;
  career_category: string | null;
  match_score: number;
  description: string | null;
  salary_range: string | null;
  growth_outlook: string | null;
  required_education: string | null;
  key_skills: any[];
  work_environment: string | null;
  is_saved: boolean;
  is_favorite: boolean;
  notes: string | null;
  viewed_at: string | null;
}

export interface Roadmap {
  id: string;
  user_id: string;
  career_title: string;
  created_at: string;
  updated_at: string;
  milestones: any[];
  resources: any[];
  timeline_months: number | null;
  progress: number;
  current_milestone: number;
  status: 'active' | 'completed' | 'paused';
}

export interface DailyTask {
  id: string;
  user_id: string;
  roadmap_id: string | null;
  created_at: string;
  due_date: string | null;
  title: string;
  description: string | null;
  category: 'learning' | 'practice' | 'networking' | 'application' | 'other' | null;
  priority: 'low' | 'medium' | 'high';
  duration: number | null;
  completed: boolean;
  completed_at: string | null;
  points_reward: number;
}

export interface StudySession {
  id: string;
  user_id: string;
  started_at: string;
  ended_at: string | null;
  topic: string | null;
  duration_minutes: number | null;
  notes: string | null;
  resources_used: any[];
  effectiveness_rating: number | null;
}

export interface SavedCareer {
  id: string;
  user_id: string;
  career_title: string;
  saved_at: string;
  notes: string | null;
  tags: any[];
}

// ============================================
// Helper Functions
// ============================================

/**
 * Set Firebase auth token for Supabase requests
 */
export const setSupabaseAuth = async () => {
  const token = await getIdToken();
  if (token) {
    supabase.auth.setSession({
      access_token: token,
      refresh_token: token,
    });
  }
};

/**
 * Create or get user profile
 */
export const createUserProfile = async (firebaseUid: string, email: string, displayName: string | null) => {
  try {
    // Check if profile exists
    const { data: existing, error: fetchError } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('firebase_uid', firebaseUid)
      .single();

    if (existing) {
      return { data: existing, error: null };
    }

    // Create new profile
    const { data, error } = await supabase
      .from('user_profiles')
      .insert([
        {
          firebase_uid: firebaseUid,
          email,
          display_name: displayName,
        },
      ])
      .select()
      .single();

    return { data, error };
  } catch (error: any) {
    return { data: null, error: error.message };
  }
};

/**
 * Get user profile by Firebase UID
 */
export const getUserProfile = async (firebaseUid: string) => {
  try {
    const { data, error } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('firebase_uid', firebaseUid)
      .single();

    return { data, error };
  } catch (error: any) {
    return { data: null, error: error.message };
  }
};

/**
 * Update user profile
 */
export const updateUserProfile = async (firebaseUid: string, updates: Partial<UserProfile>) => {
  try {
    const { data, error } = await supabase
      .from('user_profiles')
      .update(updates)
      .eq('firebase_uid', firebaseUid)
      .select()
      .single();

    return { data, error };
  } catch (error: any) {
    return { data: null, error: error.message };
  }
};

/**
 * Create assessment
 */
export const createAssessment = async (userId: string, assessmentData: Partial<Assessment>) => {
  try {
    const { data, error } = await supabase
      .from('assessments')
      .insert([{ user_id: userId, ...assessmentData }])
      .select()
      .single();

    return { data, error };
  } catch (error: any) {
    return { data: null, error: error.message };
  }
};

/**
 * Get user assessments
 */
export const getUserAssessments = async (userId: string) => {
  try {
    const { data, error } = await supabase
      .from('assessments')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    return { data, error };
  } catch (error: any) {
    return { data: null, error: error.message };
  }
};

/**
 * Create recommendations
 */
export const createRecommendations = async (recommendations: Partial<Recommendation>[]) => {
  try {
    const { data, error } = await supabase
      .from('recommendations')
      .insert(recommendations)
      .select();

    return { data, error };
  } catch (error: any) {
    return { data: null, error: error.message };
  }
};

/**
 * Get user recommendations
 */
export const getUserRecommendations = async (userId: string, assessmentId?: string) => {
  try {
    let query = supabase
      .from('recommendations')
      .select('*')
      .eq('user_id', userId);

    if (assessmentId) {
      query = query.eq('assessment_id', assessmentId);
    }

    const { data, error } = await query.order('match_score', { ascending: false });

    return { data, error };
  } catch (error: any) {
    return { data: null, error: error.message };
  }
};

/**
 * Save/unsave recommendation
 */
export const toggleSaveRecommendation = async (recommendationId: string, isSaved: boolean) => {
  try {
    const { data, error } = await supabase
      .from('recommendations')
      .update({ is_saved: isSaved })
      .eq('id', recommendationId)
      .select()
      .single();

    return { data, error };
  } catch (error: any) {
    return { data: null, error: error.message };
  }
};

/**
 * Create roadmap
 */
export const createRoadmap = async (roadmapData: Partial<Roadmap>) => {
  try {
    const { data, error } = await supabase
      .from('roadmaps')
      .insert([roadmapData])
      .select()
      .single();

    return { data, error };
  } catch (error: any) {
    return { data: null, error: error.message };
  }
};

/**
 * Get user roadmaps
 */
export const getUserRoadmaps = async (userId: string) => {
  try {
    const { data, error } = await supabase
      .from('roadmaps')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    return { data, error };
  } catch (error: any) {
    return { data: null, error: error.message };
  }
};

/**
 * Update roadmap progress
 */
export const updateRoadmapProgress = async (roadmapId: string, progress: number) => {
  try {
    const { data, error } = await supabase
      .from('roadmaps')
      .update({ progress })
      .eq('id', roadmapId)
      .select()
      .single();

    return { data, error };
  } catch (error: any) {
    return { data: null, error: error.message };
  }
};

/**
 * Create daily task
 */
export const createDailyTask = async (taskData: Partial<DailyTask>) => {
  try {
    const { data, error } = await supabase
      .from('daily_tasks')
      .insert([taskData])
      .select()
      .single();

    return { data, error };
  } catch (error: any) {
    return { data: null, error: error.message };
  }
};

/**
 * Get user daily tasks
 */
export const getUserDailyTasks = async (userId: string, date?: string) => {
  try {
    let query = supabase
      .from('daily_tasks')
      .select('*')
      .eq('user_id', userId);

    if (date) {
      query = query.eq('due_date', date);
    }

    const { data, error } = await query.order('created_at', { ascending: false });

    return { data, error };
  } catch (error: any) {
    return { data: null, error: error.message };
  }
};

/**
 * Toggle task completion
 */
export const toggleTaskCompletion = async (taskId: string, completed: boolean) => {
  try {
    const { data, error } = await supabase
      .from('daily_tasks')
      .update({ 
        completed,
        completed_at: completed ? new Date().toISOString() : null
      })
      .eq('id', taskId)
      .select()
      .single();

    return { data, error };
  } catch (error: any) {
    return { data: null, error: error.message };
  }
};

export default supabase;
