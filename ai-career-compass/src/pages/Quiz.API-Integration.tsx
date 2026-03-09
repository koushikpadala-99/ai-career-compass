// Quiz.tsx with API Integration
// This shows how to integrate the backend API
// Key changes marked with // 🔥 API INTEGRATION

import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Sparkles, Users, BarChart3, Wrench, Lightbulb, Building2, Trees, MonitorSmartphone, GraduationCap, BookOpen, Hammer, Brain, Loader2 } from 'lucide-react';
import Navbar from '@/components/Navbar';
import AIAnalysisBox from '@/components/AIAnalysisBox';
import { AnalysisResult } from '@/utils/careerData';
import { useUserData } from '@/contexts/UserDataContext';
import { useAuth } from '@/contexts/AuthContext';
// 🔥 API INTEGRATION: Import API service
import { careerAPI } from '@/services/api';

const hints = [
  '"I love helping people and I\'m fascinated by the human body..."',
  '"I enjoy building things with code and solving complex puzzles..."',
  '"I\'m passionate about art, design, and creating visual experiences..."',
];

const Quiz = () => {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const { setAnalysisResult } = useUserData();
  const [text, setText] = useState('');
  const [hintIndex, setHintIndex] = useState(0);
  const [analysisResult, setLocalResult] = useState<AnalysisResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState(1);
  const [quizAnswers, setQuizAnswers] = useState<{ 
    interestAreas?: string[]; 
    careerGoal?: string; 
    skillPreference?: string;
  }>({ interestAreas: [] });
  const section2Ref = useRef<HTMLDivElement>(null);

  // 🔥 API INTEGRATION: Check if LLM should be used
  const useLLM = import.meta.env.VITE_USE_LLM === 'true';

  useEffect(() => {
    if (!isAuthenticated) navigate('/auth');
  }, [isAuthenticated, navigate]);

  useEffect(() => {
    const interval = setInterval(() => setHintIndex(i => (i + 1) % hints.length), 3000);
    return () => clearInterval(interval);
  }, []);

  // 🔥 API INTEGRATION: Call backend API instead of local analysis
  const handleAnalyze = async () => {
    if (!text.trim()) return;
    setLoading(true);
    
    try {
      // Call backend API
      const response = await careerAPI.analyzeInterests(text, {}, useLLM);
      
      // Transform API response to match frontend format
      const result: AnalysisResult = {
        careers: response.careers,
        keywordsDetected: response.keywords_detected,
        categories: response.categories,
        personality: response.personality,
        inputText: response.input_text,
      };
      
      setLocalResult(result);
      setAnalysisResult(result);
    } catch (error) {
      console.error('Analysis failed:', error);
      alert('Failed to analyze interests. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // 🔥 API INTEGRATION: Enhanced analysis with quiz answers
  const handleRefine = async () => {
    if (!text.trim()) return;
    setLoading(true);
    
    try {
      // Enhance text with quiz answers
      let enhancedText = text;
      
      if (quizAnswers.interestAreas && quizAnswers.interestAreas.length > 0) {
        const selectedAreas = interestAreas.filter(area => quizAnswers.interestAreas?.includes(area.id));
        const areaKeywords = selectedAreas.flatMap(area => area.keywords).join(' ');
        enhancedText += ' ' + areaKeywords;
      }
      
      if (quizAnswers.careerGoal) {
        const selectedGoal = careerGoals.find(goal => goal.id === quizAnswers.careerGoal);
        if (selectedGoal) enhancedText += ' ' + selectedGoal.keywords.join(' ');
      }
      
      if (quizAnswers.skillPreference) {
        const selectedSkill = skillPreferences.find(skill => skill.id === quizAnswers.skillPreference);
        if (selectedSkill) enhancedText += ' ' + selectedSkill.keywords.join(' ');
      }
      
      // 🔥 API INTEGRATION: Call backend with enhanced text and quiz data
      const response = await careerAPI.analyzeInterests(
        enhancedText, 
        quizAnswers,
        useLLM
      );
      
      const result: AnalysisResult = {
        careers: response.careers,
        keywordsDetected: response.keywords_detected,
        categories: response.categories,
        personality: response.personality,
        inputText: response.input_text,
      };
      
      setLocalResult(result);
      setAnalysisResult(result);
      navigate('/results', { state: { fromAnalysis: true } });
    } catch (error) {
      console.error('Analysis failed:', error);
      alert('Failed to analyze interests. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const scrollToQuiz = () => {
    setStep(2);
    setTimeout(() => section2Ref.current?.scrollIntoView({ behavior: 'smooth' }), 100);
  };

  const interestAreas = [
    { id: 'technology', icon: MonitorSmartphone, label: 'Technology & Coding', keywords: ['code', 'programming', 'software', 'tech', 'computer', 'data', 'ai'] },
    { id: 'healthcare', icon: Sparkles, label: 'Healthcare & Medicine', keywords: ['health', 'medicine', 'care', 'patient', 'hospital', 'medical'] },
    { id: 'creative', icon: Lightbulb, label: 'Arts & Design', keywords: ['art', 'design', 'creative', 'visual', 'draw', 'aesthetic'] },
    { id: 'business', icon: BarChart3, label: 'Business & Finance', keywords: ['business', 'money', 'finance', 'market', 'entrepreneur', 'manage'] },
    { id: 'science', icon: Brain, label: 'Science & Research', keywords: ['science', 'research', 'experiment', 'nature', 'environment', 'lab'] },
    { id: 'education', icon: GraduationCap, label: 'Education & Teaching', keywords: ['teach', 'education', 'learn', 'mentor', 'school', 'children'] },
    { id: 'trades', icon: Hammer, label: 'Trades & Crafts', keywords: ['build', 'fix', 'hands', 'craft', 'tools', 'construct'] },
    { id: 'legal', icon: BookOpen, label: 'Law & Justice', keywords: ['law', 'legal', 'justice', 'rights', 'court', 'policy'] },
  ];

  const careerGoals = [
    { id: 'help-people', icon: Users, label: 'Help people directly', keywords: ['help', 'people', 'care', 'support', 'community'] },
    { id: 'solve-problems', icon: Brain, label: 'Solve complex problems', keywords: ['solve', 'problem', 'analyze', 'logic', 'challenge'] },
    { id: 'create-things', icon: Lightbulb, label: 'Create & innovate', keywords: ['create', 'build', 'innovate', 'design', 'invent'] },
    { id: 'lead-teams', icon: Users, label: 'Lead & manage teams', keywords: ['lead', 'manage', 'organize', 'team', 'coordinate'] },
  ];

  const skillPreferences = [
    { id: 'analytical', icon: BarChart3, label: 'Analytical thinking', keywords: ['data', 'numbers', 'analysis', 'math', 'statistics'] },
    { id: 'creative', icon: Lightbulb, label: 'Creative expression', keywords: ['creative', 'art', 'design', 'imagination', 'aesthetic'] },
    { id: 'technical', icon: Wrench, label: 'Technical skills', keywords: ['technical', 'engineering', 'mechanical', 'systems', 'tools'] },
    { id: 'communication', icon: Users, label: 'Communication', keywords: ['communicate', 'write', 'speak', 'present', 'express'] },
  ];

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <div className="flex-1 container mx-auto px-4 py-10">
        {/* Section 1: Interest Input */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="max-w-3xl mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-3xl md:text-4xl font-bold mb-3">Discover Your <span className="gradient-text">Ideal Career</span></h1>
            <p className="text-muted-foreground">Tell us about your interests and we'll match you with careers</p>
            {/* 🔥 API INTEGRATION: Show LLM status */}
            {useLLM && (
              <p className="text-xs text-primary mt-2">✨ AI-powered analysis enabled</p>
            )}
          </div>

          <div className="glass-card rounded-2xl p-6">
            <textarea
              value={text}
              onChange={e => setText(e.target.value)}
              placeholder="Describe what you're passionate about, what you enjoy doing, your hobbies, subjects you love, or what you imagine yourself doing in the future..."
              className="w-full h-40 bg-secondary rounded-xl p-4 text-foreground placeholder:text-muted-foreground text-sm resize-none focus:outline-none focus:ring-2 focus:ring-primary/50 border border-border"
            />
            <p className="text-xs text-muted-foreground mt-2 h-5 italic transition-all">
              Example: {hints[hintIndex]}
            </p>
            <button onClick={handleAnalyze} disabled={loading || !text.trim()} className="mt-4 w-full gradient-bg-primary text-primary-foreground py-3 rounded-xl font-semibold hover:opacity-90 transition-opacity disabled:opacity-50 flex items-center justify-center gap-2">
              {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : <Sparkles className="h-5 w-5" />}
              {loading ? 'Analyzing...' : 'Analyze My Interests'}
            </button>
          </div>

          {/* Analysis Results */}
          {analysisResult && (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mt-8 space-y-4">
              <AIAnalysisBox result={analysisResult} />
              <div className="flex flex-wrap gap-3">
                <button onClick={scrollToQuiz} className="flex-1 py-3 rounded-xl font-semibold border border-border hover:bg-secondary transition-colors text-sm">
                  Continue to Detailed Quiz
                </button>
                <button onClick={() => navigate('/results', { state: { fromAnalysis: true } })} className="flex-1 gradient-bg-primary text-primary-foreground py-3 rounded-xl font-semibold hover:opacity-90 transition-opacity text-sm">
                  Skip to Results
                </button>
              </div>
            </motion.div>
          )}
        </motion.div>

        {/* Rest of the component remains the same... */}
      </div>
    </div>
  );
};

export default Quiz;
