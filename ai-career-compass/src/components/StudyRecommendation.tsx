import { useState } from 'react';
import { motion } from 'framer-motion';
import { Sparkles, Loader2, AlertCircle, ExternalLink, Clock, Zap } from 'lucide-react';
import { StudyRecommendationService } from '@/services/studyRecommendation';
import type { StudyPlanRequest, StudyPlanResponse } from '@/types/studyPlan';

interface StudyRecommendationProps {
  career?: string;
  onClose?: () => void;
}

const StudyRecommendation = ({ career, onClose }: StudyRecommendationProps) => {
  const [selectedCareer, setSelectedCareer] = useState(career || '');
  const [skillLevel, setSkillLevel] = useState<'beginner' | 'intermediate' | 'advanced'>('beginner');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<StudyPlanResponse | null>(() => {
    // Load from localStorage on mount
    const saved = localStorage.getItem('lastStudyPlan');
    return saved ? JSON.parse(saved) : null;
  });
  const [error, setError] = useState<string | null>(null);

  const service = new StudyRecommendationService();

  const handleGenerate = async () => {
    if (!selectedCareer.trim()) {
      setError('Please enter a career path');
      return;
    }

    setLoading(true);
    setError(null);
    setResult(null);

    const request: StudyPlanRequest = {
      career: selectedCareer,
      skill_level: skillLevel,
      preferences: {
        learning_style: 'mixed',
        available_hours_per_week: 10,
      },
    };

    const response = await service.generateStudyPlan(request);
    setResult(response);
    setLoading(false);

    // Save to localStorage
    localStorage.setItem('lastStudyPlan', JSON.stringify(response));

    if (!response.success) {
      setError(response.error || 'Failed to generate study plan');
    }
  };

  if (result?.success && result.data) {
    const plan = result.data;
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-4xl mx-auto"
      >
        <div className="glass-card rounded-xl p-6 mb-6">
          <div className="flex items-start justify-between mb-4">
            <div>
              <h2 className="text-2xl font-bold mb-1">{plan.career}</h2>
              <p className="text-sm text-muted-foreground">
                Skill Level: <span className="capitalize font-medium text-foreground">{plan.skill_level}</span>
              </p>
              {result.cached && (
                <p className="text-xs text-accent mt-1">📦 Cached result (generated earlier)</p>
              )}
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => {
                  setResult(null);
                  localStorage.removeItem('lastStudyPlan');
                }}
                className="text-muted-foreground hover:text-foreground transition-colors text-sm px-3 py-1 rounded hover:bg-secondary"
              >
                ✕ New Plan
              </button>
              {onClose && (
                <button
                  onClick={onClose}
                  className="text-muted-foreground hover:text-foreground transition-colors"
                >
                  ✕
                </button>
              )}
            </div>
          </div>

          {plan.total_estimated_hours && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Clock className="h-4 w-4" />
              <span>Total estimated time: <strong>{plan.total_estimated_hours} hours</strong></span>
            </div>
          )}
        </div>

        <div className="space-y-4">
          {plan.study_plan.map((topic, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              className="glass-card rounded-lg p-5 hover:border-primary/30 transition-all"
            >
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-sm font-bold text-primary">
                  {index + 1}
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-lg mb-1">{topic.topic}</h3>
                  <p className="text-sm text-muted-foreground mb-3">{topic.description}</p>

                  <div className="flex flex-wrap gap-3 mb-3">
                    {topic.difficulty && (
                      <span className={`text-xs px-2 py-1 rounded-full font-medium ${
                        topic.difficulty === 'beginner'
                          ? 'bg-green-500/20 text-green-700 dark:text-green-400'
                          : topic.difficulty === 'intermediate'
                          ? 'bg-yellow-500/20 text-yellow-700 dark:text-yellow-400'
                          : 'bg-red-500/20 text-red-700 dark:text-red-400'
                      }`}>
                        {topic.difficulty.charAt(0).toUpperCase() + topic.difficulty.slice(1)}
                      </span>
                    )}
                    {topic.estimated_hours && (
                      <span className="text-xs px-2 py-1 rounded-full bg-secondary text-muted-foreground flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {topic.estimated_hours}h
                      </span>
                    )}
                  </div>

                  {topic.prerequisites && topic.prerequisites.length > 0 && (
                    <div className="mb-3 text-xs">
                      <p className="text-muted-foreground font-medium mb-1">Prerequisites:</p>
                      <div className="flex flex-wrap gap-1">
                        {topic.prerequisites.map((prereq, i) => (
                          <span key={i} className="bg-secondary/50 text-muted-foreground px-2 py-1 rounded">
                            {prereq}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  <a
                    href={topic.youtube_link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 text-sm text-primary hover:text-primary/80 font-medium transition-colors"
                  >
                    <ExternalLink className="h-4 w-4" />
                    Find Learning Resources
                  </a>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        <div className="mt-6 p-4 bg-secondary/50 rounded-lg text-sm text-muted-foreground">
          <p>💡 <strong>Tip:</strong> Start with the first topic and work your way down. Each topic builds on the previous one.</p>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="w-full max-w-2xl mx-auto"
    >
      <div className="glass-card rounded-xl p-6">
        <h2 className="text-2xl font-bold mb-2">AI Study Plan Generator</h2>
        <p className="text-muted-foreground text-sm mb-6">
          Get a personalized study roadmap for any career path
        </p>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">Career Path</label>
            <input
              type="text"
              value={selectedCareer}
              onChange={(e) => {
                setSelectedCareer(e.target.value);
                setError(null);
              }}
              onKeyDown={(e) => e.key === 'Enter' && handleGenerate()}
              placeholder="e.g., Machine Learning Engineer, Data Scientist, Full Stack Developer"
              className="w-full bg-secondary rounded-lg px-4 py-2.5 text-sm border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Your Skill Level</label>
            <div className="grid grid-cols-3 gap-3">
              {(['beginner', 'intermediate', 'advanced'] as const).map((level) => (
                <button
                  key={level}
                  onClick={() => setSkillLevel(level)}
                  className={`py-2 px-3 rounded-lg font-medium text-sm transition-all ${
                    skillLevel === level
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-secondary text-muted-foreground hover:bg-secondary/80'
                  }`}
                >
                  {level.charAt(0).toUpperCase() + level.slice(1)}
                </button>
              ))}
            </div>
          </div>

          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex items-center gap-3 p-3 bg-destructive/10 text-destructive rounded-lg text-sm"
            >
              <AlertCircle className="h-4 w-4 flex-shrink-0" />
              <span>{error}</span>
            </motion.div>
          )}

          <button
            onClick={handleGenerate}
            disabled={loading || !selectedCareer.trim()}
            className="w-full gradient-bg-primary text-primary-foreground py-2.5 rounded-lg font-medium text-sm hover:opacity-90 disabled:opacity-50 flex items-center justify-center gap-2 transition-all"
          >
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Generating your study plan...
              </>
            ) : (
              <>
                <Sparkles className="h-4 w-4" />
                Generate Study Plan
              </>
            )}
          </button>

          <div className="p-4 bg-secondary/50 rounded-lg text-xs text-muted-foreground space-y-2">
            <p className="flex items-center gap-2">
              <Zap className="h-3 w-3" />
              <strong>Powered by AI:</strong> Uses Gemini, Claude, or OpenAI
            </p>
            <p>Your study plan will include topics, descriptions, learning resources, and time estimates.</p>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default StudyRecommendation;
