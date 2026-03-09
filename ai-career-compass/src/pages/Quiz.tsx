import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronRight, ChevronLeft, Sparkles, Loader2, Check } from 'lucide-react';
import Navbar from '@/components/Navbar';
import { analyzeInterests, AnalysisResult } from '@/utils/careerData';
import { useUserData } from '@/contexts/UserDataContext';
import { useAuth } from '@/contexts/AuthContext';

// Quiz Questions
const quizQuestions = [
  {
    id: 1,
    question: "What type of activities do you enjoy most?",
    options: [
      { id: 'helping', label: 'Helping and caring for others', keywords: ['help', 'care', 'support', 'people', 'community', 'compassion'] },
      { id: 'creating', label: 'Creating and designing things', keywords: ['create', 'design', 'art', 'build', 'innovate', 'aesthetic'] },
      { id: 'analyzing', label: 'Analyzing data and solving problems', keywords: ['analyze', 'data', 'solve', 'problem', 'logic', 'math'] },
      { id: 'building', label: 'Building and fixing things with my hands', keywords: ['build', 'fix', 'hands', 'craft', 'tools', 'construct'] },
    ]
  },
  {
    id: 2,
    question: "Which subjects interest you the most?",
    options: [
      { id: 'stem', label: 'Science, Technology, Engineering, Math', keywords: ['science', 'technology', 'engineering', 'math', 'computer', 'code', 'programming'] },
      { id: 'arts', label: 'Arts, Design, and Creative Writing', keywords: ['art', 'design', 'creative', 'write', 'visual', 'aesthetic', 'draw'] },
      { id: 'health', label: 'Biology, Health, and Medicine', keywords: ['biology', 'health', 'medicine', 'medical', 'anatomy', 'care', 'patient'] },
      { id: 'business', label: 'Business, Economics, and Finance', keywords: ['business', 'economics', 'finance', 'money', 'market', 'entrepreneur'] },
      { id: 'social', label: 'Psychology, Sociology, and Education', keywords: ['psychology', 'sociology', 'education', 'teach', 'people', 'behavior'] },
    ]
  },
  {
    id: 3,
    question: "What kind of work environment appeals to you?",
    options: [
      { id: 'office', label: 'Office or corporate setting', keywords: ['office', 'corporate', 'professional', 'business', 'indoor'] },
      { id: 'remote', label: 'Remote or flexible workspace', keywords: ['remote', 'flexible', 'home', 'digital', 'online'] },
      { id: 'outdoor', label: 'Outdoor or field work', keywords: ['outdoor', 'field', 'nature', 'environment', 'physical'] },
      { id: 'clinical', label: 'Hospital, clinic, or lab', keywords: ['hospital', 'clinic', 'lab', 'medical', 'clinical', 'research'] },
      { id: 'creative', label: 'Studio or creative space', keywords: ['studio', 'creative', 'workshop', 'artistic', 'design'] },
    ]
  },
  {
    id: 4,
    question: "What motivates you in your career?",
    options: [
      { id: 'impact', label: 'Making a positive impact on society', keywords: ['impact', 'society', 'help', 'change', 'community', 'social'] },
      { id: 'innovation', label: 'Innovation and creating new things', keywords: ['innovation', 'create', 'new', 'invent', 'pioneer', 'technology'] },
      { id: 'income', label: 'High income and financial stability', keywords: ['income', 'money', 'financial', 'salary', 'wealth', 'security'] },
      { id: 'growth', label: 'Personal growth and learning', keywords: ['growth', 'learn', 'develop', 'skill', 'knowledge', 'education'] },
      { id: 'independence', label: 'Independence and flexibility', keywords: ['independence', 'flexible', 'freedom', 'autonomous', 'self'] },
    ]
  },
  {
    id: 5,
    question: "Which skills do you want to use most?",
    options: [
      { id: 'technical', label: 'Technical and analytical skills', keywords: ['technical', 'analytical', 'logic', 'systems', 'engineering', 'data'] },
      { id: 'creative', label: 'Creative and artistic skills', keywords: ['creative', 'artistic', 'design', 'imagination', 'visual', 'aesthetic'] },
      { id: 'interpersonal', label: 'Communication and people skills', keywords: ['communication', 'people', 'social', 'interpersonal', 'teamwork'] },
      { id: 'leadership', label: 'Leadership and management skills', keywords: ['leadership', 'management', 'lead', 'organize', 'coordinate', 'team'] },
      { id: 'practical', label: 'Hands-on and practical skills', keywords: ['hands', 'practical', 'manual', 'physical', 'craft', 'build'] },
    ]
  },
  {
    id: 6,
    question: "How do you prefer to work?",
    options: [
      { id: 'team', label: 'In a team with others', keywords: ['team', 'collaborate', 'group', 'together', 'cooperative'] },
      { id: 'independent', label: 'Independently on my own', keywords: ['independent', 'alone', 'solo', 'self', 'autonomous'] },
      { id: 'mix', label: 'A mix of both', keywords: ['mix', 'both', 'flexible', 'varied', 'balanced'] },
    ]
  },
  {
    id: 7,
    question: "What's your ideal work pace?",
    options: [
      { id: 'fast', label: 'Fast-paced and dynamic', keywords: ['fast', 'dynamic', 'energetic', 'active', 'quick'] },
      { id: 'steady', label: 'Steady and consistent', keywords: ['steady', 'consistent', 'stable', 'regular', 'routine'] },
      { id: 'varied', label: 'Varied with different challenges', keywords: ['varied', 'diverse', 'different', 'changing', 'flexible'] },
    ]
  },
  {
    id: 8,
    question: "What level of education are you willing to pursue?",
    options: [
      { id: 'doctorate', label: 'Doctorate or professional degree (8+ years)', keywords: ['doctorate', 'phd', 'medical', 'law', 'advanced'] },
      { id: 'masters', label: 'Master\'s degree (6-7 years)', keywords: ['masters', 'graduate', 'advanced', 'specialized'] },
      { id: 'bachelors', label: 'Bachelor\'s degree (4 years)', keywords: ['bachelors', 'university', 'college', 'degree'] },
      { id: 'associate', label: 'Associate degree or certification (2 years)', keywords: ['associate', 'certification', 'diploma', 'technical'] },
      { id: 'selftaught', label: 'Self-taught or on-the-job training', keywords: ['selftaught', 'self', 'training', 'experience', 'learn'] },
    ]
  },
];

const Quiz = () => {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const { setAnalysisResult } = useUserData();
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [loading, setLoading] = useState(false);
  const [showResults, setShowResults] = useState(false);

  useEffect(() => {
    if (!isAuthenticated) navigate('/auth');
  }, [isAuthenticated, navigate]);

  const handleAnswer = (optionId: string) => {
    setAnswers(prev => ({ ...prev, [currentQuestion]: optionId }));
  };

  const handleNext = () => {
    if (currentQuestion < quizQuestions.length - 1) {
      setCurrentQuestion(prev => prev + 1);
    } else {
      handleSubmit();
    }
  };

  const handleBack = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(prev => prev - 1);
    }
  };

  const handleSubmit = () => {
    setLoading(true);
    
    // Build interest text from answers
    let interestText = '';
    const allKeywords: string[] = [];
    
    quizQuestions.forEach((question, index) => {
      const answerId = answers[index];
      if (answerId) {
        const option = question.options.find(opt => opt.id === answerId);
        if (option) {
          interestText += option.label + '. ';
          allKeywords.push(...option.keywords);
        }
      }
    });
    
    // Add keywords to enhance matching
    interestText += ' ' + allKeywords.join(' ');
    
    setTimeout(() => {
      const result = analyzeInterests(interestText, {});
      setAnalysisResult(result);
      setLoading(false);
      setShowResults(true);
      
      // Navigate to results after a brief delay
      setTimeout(() => {
        navigate('/results', { state: { fromAnalysis: true } });
      }, 1500);
    }, 1500);
  };

  const progress = ((currentQuestion + 1) / quizQuestions.length) * 100;
  const currentQ = quizQuestions[currentQuestion];
  const isAnswered = answers[currentQuestion] !== undefined;

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-background to-secondary/20">
      <Navbar />
      
      <div className="flex-1 container mx-auto px-4 py-10">
        <div className="max-w-3xl mx-auto">
          {/* Header */}
          <motion.div 
            initial={{ opacity: 0, y: -20 }} 
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-8"
          >
            <h1 className="text-3xl md:text-4xl font-bold mb-3">
              Career Discovery <span className="gradient-text">Quiz</span>
            </h1>
            <p className="text-muted-foreground">
              Answer {quizQuestions.length} questions to find your perfect career match
            </p>
          </motion.div>

          {/* Progress Bar */}
          <div className="mb-8">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm text-muted-foreground">
                Question {currentQuestion + 1} of {quizQuestions.length}
              </span>
              <span className="text-sm font-medium text-primary">
                {Math.round(progress)}% Complete
              </span>
            </div>
            <div className="h-2 bg-secondary rounded-full overflow-hidden">
              <motion.div
                className="h-full gradient-bg-primary"
                initial={{ width: 0 }}
                animate={{ width: `${progress}%` }}
                transition={{ duration: 0.3 }}
              />
            </div>
          </div>

          {/* Question Card */}
          <AnimatePresence mode="wait">
            {!showResults ? (
              <motion.div
                key={currentQuestion}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
                className="glass-card rounded-2xl p-8 mb-6"
              >
                <h2 className="text-xl md:text-2xl font-semibold mb-6">
                  {currentQ.question}
                </h2>

                <div className="space-y-3">
                  {currentQ.options.map((option, index) => {
                    const isSelected = answers[currentQuestion] === option.id;
                    
                    return (
                      <motion.button
                        key={option.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.05 }}
                        onClick={() => handleAnswer(option.id)}
                        className={`w-full text-left p-4 rounded-xl border-2 transition-all ${
                          isSelected
                            ? 'border-primary bg-primary/10 shadow-lg'
                            : 'border-border hover:border-primary/50 hover:bg-secondary/50'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all ${
                            isSelected 
                              ? 'border-primary bg-primary' 
                              : 'border-muted-foreground'
                          }`}>
                            {isSelected && <Check className="h-4 w-4 text-primary-foreground" />}
                          </div>
                          <span className={`font-medium ${isSelected ? 'text-primary' : ''}`}>
                            {option.label}
                          </span>
                        </div>
                      </motion.button>
                    );
                  })}
                </div>
              </motion.div>
            ) : (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="glass-card rounded-2xl p-8 text-center"
              >
                <div className="mb-6">
                  <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-primary/20 flex items-center justify-center">
                    <Sparkles className="h-10 w-10 text-primary" />
                  </div>
                  <h2 className="text-2xl font-bold mb-2">Analyzing Your Answers...</h2>
                  <p className="text-muted-foreground">
                    Finding the perfect career matches for you
                  </p>
                </div>
                <Loader2 className="h-8 w-8 animate-spin mx-auto text-primary" />
              </motion.div>
            )}
          </AnimatePresence>

          {/* Navigation Buttons */}
          {!showResults && (
            <div className="flex gap-4">
              <button
                onClick={handleBack}
                disabled={currentQuestion === 0}
                className="px-6 py-3 rounded-xl border border-border hover:bg-secondary transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                <ChevronLeft className="h-5 w-5" />
                Back
              </button>
              
              <button
                onClick={handleNext}
                disabled={!isAnswered || loading}
                className="flex-1 px-6 py-3 rounded-xl gradient-bg-primary text-primary-foreground font-semibold hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <Loader2 className="h-5 w-5 animate-spin" />
                    Analyzing...
                  </>
                ) : currentQuestion === quizQuestions.length - 1 ? (
                  <>
                    <Sparkles className="h-5 w-5" />
                    See My Results
                  </>
                ) : (
                  <>
                    Next
                    <ChevronRight className="h-5 w-5" />
                  </>
                )}
              </button>
            </div>
          )}

          {/* Answer Summary */}
          {!showResults && Object.keys(answers).length > 0 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="mt-6 text-center"
            >
              <p className="text-sm text-muted-foreground">
                {Object.keys(answers).length} of {quizQuestions.length} questions answered
              </p>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Quiz;
