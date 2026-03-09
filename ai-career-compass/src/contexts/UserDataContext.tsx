import React, { createContext, useContext, useState, ReactNode, useCallback } from 'react';
import { AnalysisResult, Career } from '@/utils/careerData';

interface RoadmapTask {
  id: string;
  title: string;
  xp: number;
  time: string;
  completed: boolean;
  priority: 'high' | 'medium' | 'low';
}

interface Milestone {
  id: string;
  title: string;
  description: string;
  tasks: RoadmapTask[];
}

interface BadgeData {
  id: string;
  name: string;
  icon: string;
  description: string;
  earned: boolean;
  progress: number;
  requirement: number;
}

interface UserDataContextType {
  points: number;
  level: number;
  streak: number;
  tasksCompleted: number;
  studyHours: number;
  selectedCareer: Career | null;
  setSelectedCareer: (c: Career | null) => void;
  analysisResult: AnalysisResult | null;
  setAnalysisResult: (r: AnalysisResult | null) => void;
  savedCareers: string[];
  toggleSavedCareer: (id: string) => void;
  roadmap: Milestone[];
  toggleTask: (milestoneId: string, taskId: string) => void;
  badges: BadgeData[];
  generateRoadmap: (career: Career) => void;
  focusTimeToday: number;
  addFocusTime: (mins: number) => void;
}

const UserDataContext = createContext<UserDataContextType | undefined>(undefined);

const generateRoadmapForCareer = (career: Career): Milestone[] => {
  const templates: Record<string, Milestone[]> = {};
  
  // Generate based on career category
  const baseMilestones = [
    {
      id: 'm1',
      title: `${career.category} Foundations`,
      description: `Build core knowledge in ${career.title.toLowerCase()} fundamentals`,
      tasks: [
        { id: 't1', title: `Research ${career.title} career path`, xp: 50, time: '1 hour', completed: false, priority: 'high' as const },
        { id: 't2', title: `Learn basic ${career.skills[0] || 'concepts'}`, xp: 75, time: '2 hours', completed: false, priority: 'high' as const },
        { id: 't3', title: `Study ${career.skills[1] || 'theory'}`, xp: 60, time: '1.5 hours', completed: false, priority: 'medium' as const },
        { id: 't4', title: 'Create a study plan', xp: 40, time: '30 min', completed: false, priority: 'medium' as const },
      ],
    },
    {
      id: 'm2',
      title: `${career.education} Preparation`,
      description: `Prepare for formal education in ${career.title.toLowerCase()}`,
      tasks: [
        { id: 't5', title: 'Research educational programs', xp: 50, time: '1 hour', completed: false, priority: 'high' as const },
        { id: 't6', title: `Practice ${career.skills[2] || 'core skills'}`, xp: 80, time: '2 hours', completed: false, priority: 'high' as const },
        { id: 't7', title: 'Connect with professionals', xp: 60, time: '1 hour', completed: false, priority: 'medium' as const },
        { id: 't8', title: 'Build a portfolio outline', xp: 70, time: '1.5 hours', completed: false, priority: 'low' as const },
      ],
    },
    {
      id: 'm3',
      title: 'Skill Development',
      description: `Develop practical ${career.title.toLowerCase()} skills`,
      tasks: [
        { id: 't9', title: `Master ${career.skills[0] || 'fundamentals'}`, xp: 100, time: '3 hours', completed: false, priority: 'high' as const },
        { id: 't10', title: `Complete a ${career.title} project`, xp: 120, time: '4 hours', completed: false, priority: 'high' as const },
        { id: 't11', title: 'Get peer feedback', xp: 50, time: '1 hour', completed: false, priority: 'medium' as const },
        { id: 't12', title: 'Earn a certification', xp: 150, time: '5 hours', completed: false, priority: 'low' as const },
      ],
    },
    {
      id: 'm4',
      title: 'Career Launch',
      description: 'Prepare for your career entry',
      tasks: [
        { id: 't13', title: 'Build professional resume', xp: 80, time: '2 hours', completed: false, priority: 'high' as const },
        { id: 't14', title: 'Practice interview skills', xp: 90, time: '2 hours', completed: false, priority: 'high' as const },
        { id: 't15', title: 'Apply to positions', xp: 60, time: '1.5 hours', completed: false, priority: 'medium' as const },
        { id: 't16', title: 'Network with industry peers', xp: 70, time: '1 hour', completed: false, priority: 'medium' as const },
      ],
    },
  ];

  return baseMilestones;
};

const defaultBadges: BadgeData[] = [
  { id: 'b1', name: 'First Steps', icon: '🚀', description: 'Complete your first task', earned: false, progress: 0, requirement: 1 },
  { id: 'b2', name: 'Quick Learner', icon: '📚', description: 'Complete 5 tasks', earned: false, progress: 0, requirement: 5 },
  { id: 'b3', name: 'Dedicated', icon: '🔥', description: 'Complete 10 tasks', earned: false, progress: 0, requirement: 10 },
  { id: 'b4', name: 'Knowledge Seeker', icon: '🧠', description: 'Study for 5 hours', earned: false, progress: 0, requirement: 5 },
  { id: 'b5', name: 'Career Explorer', icon: '🧭', description: 'Save 3 careers', earned: false, progress: 0, requirement: 3 },
  { id: 'b6', name: 'Milestone Master', icon: '🏆', description: 'Complete a full milestone', earned: false, progress: 0, requirement: 4 },
  { id: 'b7', name: 'Focus Champion', icon: '⏱️', description: '5 Pomodoro sessions', earned: false, progress: 0, requirement: 5 },
  { id: 'b8', name: 'Path Finder', icon: '🗺️', description: 'Complete career analysis', earned: false, progress: 0, requirement: 1 },
];

export const UserDataProvider = ({ children }: { children: ReactNode }) => {
  const [points, setPoints] = useState(() => Number(localStorage.getItem('points') || '0'));
  const [tasksCompleted, setTasksCompleted] = useState(() => Number(localStorage.getItem('tasksCompleted') || '0'));
  const [studyHours, setStudyHours] = useState(() => Number(localStorage.getItem('studyHours') || '0'));
  const [focusTimeToday, setFocusTimeToday] = useState(0);
  const [streak, setStreak] = useState(() => Number(localStorage.getItem('streak') || '1'));
  const [selectedCareer, setSelectedCareer] = useState<Career | null>(() => {
    const saved = localStorage.getItem('selectedCareer');
    return saved ? JSON.parse(saved) : null;
  });
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(() => {
    const saved = localStorage.getItem('analysisResult');
    return saved ? JSON.parse(saved) : null;
  });
  const [savedCareers, setSavedCareers] = useState<string[]>(() => {
    const saved = localStorage.getItem('savedCareers');
    return saved ? JSON.parse(saved) : [];
  });
  const [roadmap, setRoadmap] = useState<Milestone[]>(() => {
    const saved = localStorage.getItem('roadmap');
    return saved ? JSON.parse(saved) : [];
  });
  const [badges, setBadges] = useState<BadgeData[]>(() => {
    const saved = localStorage.getItem('badges');
    return saved ? JSON.parse(saved) : defaultBadges;
  });

  const persist = useCallback((key: string, val: any) => {
    localStorage.setItem(key, JSON.stringify(val));
  }, []);

  const level = Math.floor(points / 200) + 1;

  const updateBadges = useCallback((tc: number, sh: number, sc: string[]) => {
    setBadges(prev => {
      const updated = prev.map(b => {
        let progress = b.progress;
        if (b.id === 'b1' || b.id === 'b2' || b.id === 'b3') progress = tc;
        if (b.id === 'b4') progress = sh;
        if (b.id === 'b5') progress = sc.length;
        return { ...b, progress, earned: progress >= b.requirement };
      });
      persist('badges', updated);
      return updated;
    });
  }, [persist]);

  const toggleTask = (milestoneId: string, taskId: string) => {
    setRoadmap(prev => {
      const updated = prev.map(m => {
        if (m.id !== milestoneId) return m;
        return {
          ...m,
          tasks: m.tasks.map(t => {
            if (t.id !== taskId) return t;
            const newCompleted = !t.completed;
            if (newCompleted) {
              setPoints(p => { const np = p + t.xp; persist('points', np); return np; });
              setTasksCompleted(tc => { const ntc = tc + 1; persist('tasksCompleted', ntc); updateBadges(ntc, studyHours, savedCareers); return ntc; });
            } else {
              setPoints(p => { const np = Math.max(0, p - t.xp); persist('points', np); return np; });
              setTasksCompleted(tc => { const ntc = Math.max(0, tc - 1); persist('tasksCompleted', ntc); return ntc; });
            }
            return { ...t, completed: newCompleted };
          }),
        };
      });
      persist('roadmap', updated);
      return updated;
    });
  };

  const toggleSavedCareer = (id: string) => {
    setSavedCareers(prev => {
      const updated = prev.includes(id) ? prev.filter(c => c !== id) : [...prev, id];
      persist('savedCareers', updated);
      updateBadges(tasksCompleted, studyHours, updated);
      return updated;
    });
  };

  const generateRoadmap = (career: Career) => {
    const rm = generateRoadmapForCareer(career);
    setRoadmap(rm);
    persist('roadmap', rm);
    setSelectedCareer(career);
    persist('selectedCareer', career);
  };

  const addFocusTime = (mins: number) => {
    setFocusTimeToday(p => p + mins);
    setStudyHours(p => { const np = p + mins / 60; persist('studyHours', np); return np; });
  };

  const wrappedSetAnalysis = (r: AnalysisResult | null) => {
    setAnalysisResult(r);
    persist('analysisResult', r);
    if (r) {
      setBadges(prev => {
        const updated = prev.map(b => b.id === 'b8' ? { ...b, progress: 1, earned: true } : b);
        persist('badges', updated);
        return updated;
      });
    }
  };

  return (
    <UserDataContext.Provider value={{
      points, level, streak, tasksCompleted, studyHours,
      selectedCareer, setSelectedCareer: (c) => { setSelectedCareer(c); persist('selectedCareer', c); },
      analysisResult, setAnalysisResult: wrappedSetAnalysis,
      savedCareers, toggleSavedCareer,
      roadmap, toggleTask, badges,
      generateRoadmap, focusTimeToday, addFocusTime,
    }}>
      {children}
    </UserDataContext.Provider>
  );
};

export const useUserData = () => {
  const ctx = useContext(UserDataContext);
  if (!ctx) throw new Error('useUserData must be used within UserDataProvider');
  return ctx;
};
