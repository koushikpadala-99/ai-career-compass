import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Loader2, AlertCircle, CheckCircle2, Eye, ClipboardList, BarChart2, Clock, Puzzle, Link2, Monitor } from 'lucide-react';
import { roadmapService, RoadmapData } from '@/services/roadmapService';

interface AIRoadmapProps {
  career: string;
  level?: 'beginner' | 'intermediate' | 'advanced';
}

const STEP_ICONS = [Eye, ClipboardList, BarChart2, Puzzle, Clock, Puzzle, Link2, Monitor];

const AIRoadmap = ({ career, level = 'beginner' }: AIRoadmapProps) => {
  const [roadmap, setRoadmap] = useState<RoadmapData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [completedSteps, setCompletedSteps] = useState<Set<number>>(new Set());

  useEffect(() => {
    const loadRoadmap = async () => {
      setLoading(true);
      setError(null);
      const result = await roadmapService.generateRoadmap(career, level);
      if (result.success && result.data) {
        setRoadmap(result.data);
        const savedProgress = localStorage.getItem(`roadmap_progress_${career}_${level}`);
        if (savedProgress) {
          try { setCompletedSteps(new Set(JSON.parse(savedProgress))); } catch {}
        }
      } else {
        setError(result.error || 'Failed to generate roadmap');
      }
      setLoading(false);
    };
    loadRoadmap();
  }, [career, level]);

  const toggleStep = (stepNumber: number) => {
    const newCompleted = new Set(completedSteps);
    newCompleted.has(stepNumber) ? newCompleted.delete(stepNumber) : newCompleted.add(stepNumber);
    setCompletedSteps(newCompleted);
    localStorage.setItem(`roadmap_progress_${career}_${level}`, JSON.stringify(Array.from(newCompleted)));
  };

  if (loading) return (
    <div className="flex items-center justify-center py-12">
      <Loader2 className="h-8 w-8 animate-spin text-primary" />
    </div>
  );

  if (error) return (
    <div className="flex items-center gap-3 p-4 bg-destructive/10 text-destructive rounded-lg">
      <AlertCircle className="h-5 w-5 flex-shrink-0" /><span>{error}</span>
    </div>
  );

  if (!roadmap) return null;

  const totalSteps = roadmap.roadmap.length;
  const completedCount = completedSteps.size;
  const progress = Math.round((completedCount / totalSteps) * 100);

  return (
    <div className="w-full">
      {/* Progress Header */}
      <div className="mb-10 glass-card rounded-xl p-6 border border-primary/20">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-xl font-bold mb-1">Your Progress</h2>
            <p className="text-sm text-muted-foreground">Track your journey through this roadmap</p>
          </div>
          <span className="text-3xl font-bold text-primary">{progress}%</span>
        </div>
        <div className="grid grid-cols-3 gap-4 mb-4">
          {[
            { label: 'Completed', value: completedCount },
            { label: 'Remaining', value: totalSteps - completedCount },
            { label: 'Total Steps', value: totalSteps },
          ].map(s => (
            <div key={s.label} className="bg-secondary/50 rounded-lg p-3 text-center">
              <div className="text-2xl font-bold text-primary">{s.value}</div>
              <div className="text-xs text-muted-foreground">{s.label}</div>
            </div>
          ))}
        </div>
        <div className="h-3 rounded-full bg-secondary overflow-hidden">
          <motion.div className="h-full gradient-bg-primary" initial={{ width: 0 }} animate={{ width: `${progress}%` }} transition={{ duration: 0.6 }} />
        </div>
      </div>

      {/* Winding Road */}
      <div className="relative w-full overflow-hidden">
        {/* SVG winding road background */}
        <svg
          viewBox="0 0 800 120"
          preserveAspectRatio="none"
          className="absolute left-0 right-0 mx-auto"
          style={{ top: '50%', transform: 'translateY(-50%)', width: '100%', height: '100%', zIndex: 0, opacity: 0.18 }}
        >
          <path
            d="M0,60 C100,20 200,100 300,60 S500,20 600,60 S750,100 800,60"
            stroke="hsl(var(--primary))"
            strokeWidth="38"
            fill="none"
            strokeLinecap="round"
          />
          <path
            d="M0,60 C100,20 200,100 300,60 S500,20 600,60 S750,100 800,60"
            stroke="hsl(var(--muted))"
            strokeWidth="34"
            fill="none"
            strokeLinecap="round"
            strokeDasharray="12 8"
          />
        </svg>

        {/* Milestone nodes */}
        <div className="relative z-10 flex flex-col gap-0">
          {roadmap.roadmap.map((step, index) => {
            const isLeft = index % 2 === 0;
            const isCompleted = completedSteps.has(step.step_number);
            const Icon = STEP_ICONS[index % STEP_ICONS.length];

            // Vertical offset to simulate winding — alternates up/down
            const verticalClass = index % 4 < 2 ? 'mt-0' : 'mt-6';

            return (
              <motion.div
                key={step.step_number}
                initial={{ opacity: 0, x: isLeft ? -40 : 40 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1, duration: 0.4 }}
                className={`flex items-center gap-4 ${isLeft ? 'flex-row' : 'flex-row-reverse'} ${verticalClass} mb-2`}
              >
                {/* Card */}
                <button
                  onClick={() => toggleStep(step.step_number)}
                  className={`flex-1 max-w-xs glass-card rounded-xl p-4 text-left transition-all hover:scale-105 border-2 ${
                    isCompleted ? 'border-primary/60 bg-primary/5 opacity-70' : 'border-transparent hover:border-primary/40'
                  } ${isLeft ? 'text-right' : 'text-left'}`}
                >
                  <div className="text-xs text-muted-foreground mb-1">Step {step.step_number} of {totalSteps}</div>
                  <h3 className={`font-bold text-sm mb-1 ${isCompleted ? 'line-through text-muted-foreground' : ''}`}>
                    {step.title}
                  </h3>
                  <p className="text-xs text-muted-foreground leading-relaxed line-clamp-2">{step.description}</p>
                  {isCompleted && (
                    <div className={`mt-2 inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-primary/10 text-primary text-xs ${isLeft ? 'float-right' : ''}`}>
                      <CheckCircle2 className="h-3 w-3" /> Done
                    </div>
                  )}
                </button>

                {/* Connector line */}
                <div className={`flex flex-col items-center ${isLeft ? 'items-end' : 'items-start'}`} style={{ minWidth: 60 }}>
                  <div className="w-8 h-0.5 bg-primary/40" />
                </div>

                {/* Circle node */}
                <button
                  onClick={() => toggleStep(step.step_number)}
                  className={`flex-shrink-0 h-16 w-16 rounded-full flex flex-col items-center justify-center shadow-lg border-4 transition-all hover:scale-110 ${
                    isCompleted
                      ? 'bg-primary border-primary text-primary-foreground'
                      : 'bg-yellow-400 border-yellow-500 text-yellow-900'
                  }`}
                >
                  <Icon className="h-5 w-5 mb-0.5" />
                  <span className="text-xs font-bold leading-none">
                    {String(step.step_number).padStart(2, '0')}
                  </span>
                </button>

                {/* Right side spacer to balance layout */}
                <div className="flex-1 max-w-xs" />
              </motion.div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default AIRoadmap;
