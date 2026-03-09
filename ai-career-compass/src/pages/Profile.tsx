import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { User, Mail, Phone, MapPin, Calendar, Target, Edit2, Download, Award, FileText, Briefcase, GraduationCap, Star, Trophy, Zap, CheckCircle, Clock, TrendingUp } from 'lucide-react';
import Navbar from '@/components/Navbar';
import { useAuth } from '@/contexts/AuthContext';
import { useUserData } from '@/contexts/UserDataContext';

const Profile = () => {
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();
  const { points, level, tasksCompleted, studyHours, selectedCareer, analysisResult, badges, savedCareers } = useUserData();
  const [editMode, setEditMode] = useState(false);

  useEffect(() => {
    if (!isAuthenticated) navigate('/auth');
  }, [isAuthenticated, navigate]);

  if (!user) return null;

  const skills = selectedCareer?.skills || ['Critical Thinking', 'Communication', 'Problem Solving', 'Research', 'Teamwork'];
  const skillProgress = skills.map((s, i) => ({
    name: s,
    percentage: Math.min(100, Math.round((tasksCompleted / (i + 2)) * 25)),
  }));

  const profileCompletion = Math.min(100, Math.round(
    ((user.name ? 20 : 0) + 
     (user.email ? 20 : 0) + 
     (selectedCareer ? 30 : 0) + 
     (tasksCompleted > 0 ? 30 : 0))
  ));

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />
      
      <div className="flex-1 container mx-auto px-4 py-8 max-w-7xl">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Sidebar */}
          <div className="lg:col-span-1 space-y-6">
            {/* Profile Card */}
            <motion.div 
              className="glass-card rounded-xl p-6"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
            >
              <div className="flex items-start justify-between mb-4">
                <div className="h-20 w-20 rounded-full gradient-bg-primary flex items-center justify-center text-primary-foreground text-3xl font-bold">
                  {user.name[0]}
                </div>
                <button 
                  onClick={() => setEditMode(!editMode)}
                  className="p-2 rounded-lg hover:bg-secondary transition-colors"
                >
                  <Edit2 className="h-4 w-4 text-muted-foreground" />
                </button>
              </div>

              <h1 className="text-xl font-bold mb-1">{user.name}</h1>
              <p className="text-sm text-muted-foreground mb-4">@{user.name.toLowerCase().replace(/\s+/g, '')}</p>

              {selectedCareer && (
                <div className="flex items-center gap-2 text-sm text-primary mb-4">
                  <Target className="h-4 w-4" />
                  <span>{selectedCareer.title}</span>
                </div>
              )}

              <div className="space-y-3 text-sm">
                <div className="flex items-center gap-3 text-muted-foreground">
                  <Mail className="h-4 w-4" />
                  <span>{user.email}</span>
                </div>
                <div className="flex items-center gap-3 text-muted-foreground">
                  <Calendar className="h-4 w-4" />
                  <span>Joined {user.joinDate}</span>
                </div>
              </div>
            </motion.div>

            {/* Personal Information */}
            <motion.div 
              className="glass-card rounded-xl p-6"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 }}
            >
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-bold text-lg">Personal Information</h2>
                <button className="p-1 rounded-lg hover:bg-secondary">
                  <Edit2 className="h-4 w-4 text-muted-foreground" />
                </button>
              </div>

              <div className="space-y-3 text-sm">
                <div>
                  <label className="text-muted-foreground flex items-center gap-2 mb-1">
                    <Mail className="h-4 w-4" />
                    Email
                  </label>
                  <p className="font-medium">{user.email}</p>
                </div>
                
                <div>
                  <label className="text-muted-foreground flex items-center gap-2 mb-1">
                    <Phone className="h-4 w-4" />
                    Mobile Number
                  </label>
                  <p className="text-muted-foreground text-xs">Add your mobile number</p>
                </div>
                
                <div>
                  <label className="text-muted-foreground flex items-center gap-2 mb-1">
                    <MapPin className="h-4 w-4" />
                    Location
                  </label>
                  <p className="font-medium">Not specified</p>
                </div>
              </div>
            </motion.div>

            {/* Stats */}
            <motion.div 
              className="glass-card rounded-xl p-6"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
            >
              <h2 className="font-bold text-lg mb-4">Statistics</h2>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Zap className="h-4 w-4 text-accent" />
                    <span className="text-sm">Total XP</span>
                  </div>
                  <span className="font-bold">{points}</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-primary" />
                    <span className="text-sm">Tasks Completed</span>
                  </div>
                  <span className="font-bold">{tasksCompleted}</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-primary" />
                    <span className="text-sm">Study Hours</span>
                  </div>
                  <span className="font-bold">{Math.round(studyHours * 10) / 10}</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <TrendingUp className="h-4 w-4 text-accent" />
                    <span className="text-sm">Level</span>
                  </div>
                  <span className="font-bold">{level}</span>
                </div>
              </div>
            </motion.div>
          </div>

          {/* Right Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Profile Completion */}
            <motion.div 
              className="glass-card rounded-xl p-6"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <h3 className="font-bold mb-1">Complete your profile</h3>
                  <p className="text-sm text-muted-foreground">This data will be helpful to evaluate your job applications</p>
                </div>
                <div className="flex items-center justify-center h-16 w-16 rounded-full border-4 border-primary/20 relative">
                  <svg className="absolute inset-0 -rotate-90" viewBox="0 0 64 64">
                    <circle
                      cx="32"
                      cy="32"
                      r="28"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="4"
                      className="text-primary"
                      strokeDasharray={`${profileCompletion * 1.76} 176`}
                    />
                  </svg>
                  <span className="text-sm font-bold">{profileCompletion}%</span>
                </div>
              </div>
            </motion.div>

            {/* My Badges */}
            <motion.div 
              className="glass-card rounded-xl p-6"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
            >
              <div className="flex items-center gap-2 mb-4">
                <Trophy className="h-5 w-5 text-accent" />
                <h2 className="font-bold text-lg">My Badges</h2>
              </div>

              <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-4">
                {badges.map((badge) => (
                  <motion.div
                    key={badge.id}
                    whileHover={{ scale: 1.1 }}
                    className={`relative group cursor-pointer ${!badge.earned && 'opacity-40'}`}
                    title={badge.description}
                  >
                    <div className={`aspect-square rounded-lg flex items-center justify-center text-4xl ${
                      badge.earned ? 'bg-gradient-to-br from-primary/20 to-accent/20' : 'bg-secondary'
                    }`}>
                      {badge.icon}
                    </div>
                    <p className="text-xs text-center mt-1 font-medium">{badge.name}</p>
                    {badge.earned && (
                      <div className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-primary flex items-center justify-center">
                        <CheckCircle className="h-3 w-3 text-primary-foreground" />
                      </div>
                    )}
                  </motion.div>
                ))}
              </div>
            </motion.div>

            {/* Skills */}
            <motion.div 
              className="glass-card rounded-xl p-6"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <Star className="h-5 w-5 text-primary" />
                  <h2 className="font-bold text-lg">Skills Development</h2>
                </div>
                <button className="text-sm text-primary hover:underline">View All</button>
              </div>

              <div className="space-y-4">
                {skillProgress.slice(0, 5).map(({ name, percentage }) => (
                  <div key={name}>
                    <div className="flex justify-between text-sm mb-2">
                      <span className="font-medium">{name}</span>
                      <span className="text-muted-foreground">{percentage}%</span>
                    </div>
                    <div className="h-2 rounded-full bg-secondary overflow-hidden">
                      <motion.div 
                        className="h-full gradient-bg-primary"
                        initial={{ width: 0 }}
                        animate={{ width: `${percentage}%` }}
                        transition={{ duration: 1, ease: "easeOut" }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>

            {/* My Resume */}
            <motion.div 
              className="glass-card rounded-xl p-6"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <FileText className="h-5 w-5 text-primary" />
                  <h2 className="font-bold text-lg">My Resume</h2>
                </div>
                <button className="p-1 rounded-lg hover:bg-secondary">
                  <Edit2 className="h-4 w-4 text-muted-foreground" />
                </button>
              </div>

              <div className="border-2 border-dashed border-border rounded-lg p-8 text-center">
                <FileText className="h-12 w-12 mx-auto mb-3 text-muted-foreground" />
                <p className="text-sm font-medium mb-1">AI-Generated Resume</p>
                <p className="text-xs text-muted-foreground mb-4">
                  Based on your career path: {selectedCareer?.title || 'Not selected'}
                </p>
                <button className="gradient-bg-primary text-primary-foreground px-6 py-2 rounded-lg text-sm font-medium hover:opacity-90 flex items-center gap-2 mx-auto">
                  <Download className="h-4 w-4" />
                  Download Resume
                </button>
              </div>
            </motion.div>

            {/* My Certifications */}
            <motion.div 
              className="glass-card rounded-xl p-6"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
            >
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <Award className="h-5 w-5 text-primary" />
                  <h2 className="font-bold text-lg">My Certifications</h2>
                </div>
              </div>

              <div className="border-2 border-dashed border-border rounded-lg p-8 text-center">
                <Award className="h-12 w-12 mx-auto mb-3 text-muted-foreground" />
                <p className="text-sm font-medium mb-1">No certifications yet</p>
                <p className="text-xs text-muted-foreground mb-4">
                  Complete courses and earn certifications to showcase your skills
                </p>
                <Link to="/study-tools">
                  <button className="border border-border px-6 py-2 rounded-lg text-sm font-medium hover:bg-secondary">
                    Explore Courses
                  </button>
                </Link>
              </div>
            </motion.div>

            {/* Career Path */}
            {selectedCareer && (
              <motion.div 
                className="glass-card rounded-xl p-6"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
              >
                <div className="flex items-center gap-2 mb-4">
                  <Briefcase className="h-5 w-5 text-primary" />
                  <h2 className="font-bold text-lg">Career Path</h2>
                </div>

                <div className="bg-secondary rounded-lg p-4">
                  <div className="flex items-start gap-4">
                    <div className="h-12 w-12 rounded-lg gradient-bg-primary flex items-center justify-center text-primary-foreground">
                      <GraduationCap className="h-6 w-6" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-bold mb-1">{selectedCareer.title}</h3>
                      <p className="text-sm text-muted-foreground mb-2">{selectedCareer.category}</p>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <span>Level {level}</span>
                        <span>•</span>
                        <span>{tasksCompleted} tasks completed</span>
                      </div>
                    </div>
                    <Link to="/roadmap">
                      <button className="px-4 py-2 rounded-lg border border-border hover:bg-background text-sm font-medium">
                        View Roadmap
                      </button>
                    </Link>
                  </div>
                </div>
              </motion.div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
