import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ChevronLeft, Zap } from 'lucide-react';
import Navbar from '@/components/Navbar';
import { useAuth } from '@/contexts/AuthContext';
import StudyRecommendation from '@/components/StudyRecommendation';

const StudyTools = () => {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const [showStudyPlan, setShowStudyPlan] = useState(false);

  useEffect(() => {
    if (!isAuthenticated) navigate('/auth');
  }, [isAuthenticated, navigate]);

  if (showStudyPlan) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <div className="flex-1 container mx-auto px-4 py-10">
          <button
            onClick={() => setShowStudyPlan(false)}
            className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-6"
          >
            <ChevronLeft className="h-4 w-4" /> Back to tools
          </button>
          <StudyRecommendation onClose={() => setShowStudyPlan(false)} />
        </div>
      </div>
    );
  }



  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <div className="flex-1 container mx-auto px-4 py-10">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="text-4xl font-bold mb-2">AI <span className="gradient-text">Study Tools</span></h1>
          <p className="text-muted-foreground text-lg mb-12">Master any career with personalized AI-powered study plans</p>

          {/* Main CTA */}
          <motion.button
            onClick={() => setShowStudyPlan(true)}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="w-full glass-card rounded-xl p-8 border-2 border-primary/50 hover:border-primary transition-all text-left mb-12 bg-gradient-to-r from-primary/10 to-transparent"
          >
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-3xl font-bold mb-2 flex items-center gap-3">
                  <Zap className="h-8 w-8 text-primary" />
                  AI Study Plan Generator
                </h2>
                <p className="text-muted-foreground text-lg">Generate a personalized study roadmap for any career with AI-powered topics, descriptions, and learning resources</p>
              </div>
              <ChevronLeft className="h-10 w-10 text-primary flex-shrink-0" />
            </div>
          </motion.button>
        </motion.div>
      </div>
    </div>
  );
};

export default StudyTools;
