import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Loader2, AlertCircle, CheckCircle2, MapPin, Save } from 'lucide-react';
import { roadmapService, RoadmapData } from '@/services/roadmapService';

interface AIRoadmapProps {
  career: string;
  level?: 'beginner' | 'intermediate' | 'advanced';
}

const AIRoadmap = ({ career, level = 'beginner' }: AIRoadmapProps) => {
  const [roadmap, setRoadmap] = useState<RoadmapData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [completedSteps, setCompletedSteps] = useState<Set<number>>(new Set());
  const [saving, setSaving] = useState(false);

  // Load roadmap and saved progress
  useEffect(() => {
    const loadRoadmap = async () => {
      setLoading(true);
      setError(null);
      const result = await roadmapService.generateRoadmap(career, level);
      
      if (result.success && result.data) {
        setRoadmap(result.data);
        // Load saved progress from localStorage
        const savedProgress = localStorage.getItem(`roadmap_progress_${career}_${level}`);
        if (savedProgress) {
          try {
            const completed = JSON.parse(savedProgress);
            setCompletedSteps(new Set(completed));
          } catch (e) {
            console.error('Failed to load saved progress:', e);
          }
        }
      } else {
        setError(result.error || 'Failed to generate roadmap');
      }
      setLoading(false);
    };

    loadRoadmap();
  }, [career, level]);

  const toggleStep = async (stepNumber: number) => {
    const newCompleted = new Set(completedSteps);
    if (newCompleted.has(stepNumber)) {
      newCompleted.delete(stepNumber);
    } else {
      newCompleted.add(stepNumber);
    }
    setCompletedSteps(newCompleted);
    
    // Save progress to localStorage
    setSaving(true);
    try {
      localStorage.setItem(
        `roadmap_progress_${career}_${level}`,
        JSON.stringify(Array.from(newCompleted))
      );
    } catch (e) {
      console.error('Failed to save progress:', e);
    }
    setSaving(false);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center gap-3 p-4 bg-destructive/10 text-destructive rounded-lg">
        <AlertCircle className="h-5 w-5 flex-shrink-0" />
        <span>{error}</span>
      </div>
    );
  }

  if (!roadmap) return null;

  const progress = Math.round((completedSteps.size / roadmap.roadmap.length) * 100);
  const totalSteps = roadmap.roadmap.length;
  const completedCount = completedSteps.size;

  return (
    <div className="w-full">
      {/* Goal Tracking Header */}
      <div className="mb-8 glass-card rounded-lg p-6 border border-primary/20">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-xl font-bold mb-1">Your Progress</h2>
            <p className="text-sm text-muted-foreground">Track your journey through this roadmap</p>
          </div>
          {saving && <Save className="h-5 w-5 text-primary animate-spin" />}
        </div>
        
        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          <div className="bg-secondary/50 rounded-lg p-3">
            <div className="text-2xl font-bold text-primary">{completedCount}</div>
            <div className="text-xs text-muted-foreground">Completed</div>
          </div>
          <div className="bg-secondary/50 rounded-lg p-3">
            <div className="text-2xl font-bold text-primary">{totalSteps - completedCount}</div>
            <div className="text-xs text-muted-foreground">Remaining</div>
          </div>
          <div className="bg-secondary/50 rounded-lg p-3">
            <div className="text-2xl font-bold text-primary">{progress}%</div>
            <div className="text-xs text-muted-foreground">Overall</div>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="flex justify-between text-sm mb-2">
          <span className="text-muted-foreground">{completedCount} of {totalSteps} milestones</span>
          <span className="font-bold text-primary">{progress}%</span>
        </div>
        <div className="h-3 rounded-full bg-secondary overflow-hidden">
          <motion.div
            className="h-full gradient-bg-primary"
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.5 }}
          />
        </div>
      </div>

      {/* Visual Roadmap */}
      <div className="relative">
        {/* Curved Path SVG */}
        <svg className="absolute inset-0 w-full h-full pointer-events-none" style={{ zIndex: 0 }}>
          <defs>
            <linearGradient id="pathGradient" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity="0.3" />
              <stop offset="100%" stopColor="hsl(var(--primary))" stopOpacity="0.1" />
            </linearGradient>
          </defs>
          <path
            d={`M 100 80 Q 200 60, 300 100 T 500 80 T 700 100 T 900 80 T 1100 100`}
            stroke="url(#pathGradient)"
            strokeWidth="4"
            fill="none"
            strokeDasharray="8 4"
          />
        </svg>

        {/* Milestones */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 relative" style={{ zIndex: 1 }}>
          {roadmap.roadmap.map((step, index) => {
            const isCompleted = completedSteps.has(step.step_number);
            const colors = [
              'from-blue-500 to-blue-600',
              'from-purple-500 to-purple-600',
              'from-pink-500 to-pink-600',
              'from-orange-500 to-orange-600',
              'from-green-500 to-green-600',
              'from-teal-500 to-teal-600',
            ];

            return (
              <motion.div
                key={step.step_number}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="relative"
              >
                <button
                  onClick={() => toggleStep(step.step_number)}
                  className={`w-full glass-card rounded-xl p-6 text-left transition-all hover:scale-105 border-2 ${
                    isCompleted 
                      ? 'opacity-60 border-primary/50 bg-primary/5' 
                      : 'border-transparent hover:border-primary/30'
                  }`}
                >
                  {/* Milestone Icon */}
                  <div className="flex items-start gap-4 mb-3">
                    <div className={`flex-shrink-0 h-12 w-12 rounded-full bg-gradient-to-br ${colors[index % colors.length]} flex items-center justify-center text-white font-bold shadow-lg`}>
                      {isCompleted ? (
                        <CheckCircle2 className="h-6 w-6" />
                      ) : (
                        <MapPin className="h-6 w-6" />
                      )}
                    </div>
                    <div className="flex-1">
                      <div className="text-xs text-muted-foreground mb-1">Step {step.step_number} of {totalSteps}</div>
                      <h3 className={`font-bold text-lg mb-2 ${isCompleted ? 'line-through' : ''}`}>
                        {step.title}
                      </h3>
                    </div>
                  </div>

                  {/* Description */}
                  <p className="text-sm text-muted-foreground leading-relaxed mb-3">
                    {step.description}
                  </p>

                  {/* Completion Badge */}
                  {isCompleted && (
                    <div className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-medium">
                      <CheckCircle2 className="h-3 w-3" />
                      Completed
                    </div>
                  )}
                  {!isCompleted && (
                    <div className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-secondary text-muted-foreground text-xs font-medium">
                      <MapPin className="h-3 w-3" />
                      In Progress
                    </div>
                  )}
                </button>
              </motion.div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default AIRoadmap;
