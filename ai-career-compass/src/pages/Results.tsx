import { useState, useEffect } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import Navbar from '@/components/Navbar';
import CareerCard from '@/components/CareerCard';
import FilterTabs from '@/components/FilterTabs';
import { useUserData } from '@/contexts/UserDataContext';
import { useAuth } from '@/contexts/AuthContext';
import { getDefaultCareers, getAllCategories, Career } from '@/utils/careerData';

const Results = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { isAuthenticated } = useAuth();
  const { analysisResult, savedCareers, toggleSavedCareer, generateRoadmap } = useUserData();
  const [activeTab, setActiveTab] = useState('All');
  const fromAnalysis = location.state?.fromAnalysis;

  useEffect(() => {
    if (!isAuthenticated) navigate('/auth');
  }, [isAuthenticated, navigate]);

  const careers: Career[] = analysisResult?.careers || getDefaultCareers();
  
  // Only show category filters if user is browsing default careers (not from analysis)
  const showFilters = !fromAnalysis && !analysisResult;
  const tabs = showFilters ? ['All', ...getAllCategories()] : [];
  const filtered = showFilters && activeTab !== 'All' 
    ? careers.filter(c => c.category === activeTab) 
    : careers;

  const handleViewRoadmap = (career: Career) => {
    generateRoadmap(career);
    navigate('/roadmap');
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <div className="flex-1 container mx-auto px-4 py-10">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="text-3xl md:text-4xl font-bold mb-2">Your AI-Powered <span className="gradient-text">Career Matches</span></h1>
          <p className="text-muted-foreground mb-6">Careers ranked by compatibility with your interests</p>

          {fromAnalysis && analysisResult && (
            <div className="glass-card rounded-xl p-4 mb-6 border-primary/20">
              <p className="text-sm text-muted-foreground">Based on: <span className="text-foreground italic">"{analysisResult.inputText.slice(0, 100)}{analysisResult.inputText.length > 100 ? '...' : ''}"</span></p>
              <p className="text-xs text-muted-foreground mt-2">Showing {careers.length} career{careers.length !== 1 ? 's' : ''} matched to your interests</p>
            </div>
          )}

          {showFilters && <FilterTabs tabs={tabs} active={activeTab} onSelect={setActiveTab} />}

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-8">
            {filtered.map((career, i) => (
              <motion.div key={career.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
                <CareerCard
                  career={career}
                  isSaved={savedCareers.includes(career.id)}
                  onSave={() => toggleSavedCareer(career.id)}
                  onViewRoadmap={() => handleViewRoadmap(career)}
                />
              </motion.div>
            ))}
          </div>

          <div className="flex flex-wrap gap-4 mt-10 justify-center">
            <Link to="/quiz" className="px-6 py-3 rounded-xl border border-border hover:bg-secondary text-sm font-medium transition-colors">Retake Quiz</Link>
            {showFilters && (
              <button onClick={() => { setActiveTab('All'); }} className="px-6 py-3 rounded-xl border border-border hover:bg-secondary text-sm font-medium transition-colors">Browse All Careers</button>
            )}
            <Link to="/quiz" className="px-6 py-3 rounded-xl gradient-bg-primary text-primary-foreground text-sm font-medium hover:opacity-90 transition-opacity">Refine Interests</Link>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default Results;
