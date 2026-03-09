import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Home, Map, ClipboardList, BookOpen, Medal, FileText, User, Bot, Trophy, Flame, Clock, Zap, Sparkles, ChevronDown, ChevronUp } from 'lucide-react';
import Navbar from '@/components/Navbar';
import TaskItem from '@/components/TaskItem';
import Timer from '@/components/Timer';
import Chatbot from '@/components/Chatbot';
import { useAuth } from '@/contexts/AuthContext';
import { useUserData } from '@/contexts/UserDataContext';

const tips = [
  "Focus on foundational skills first – they make everything else easier.",
  "Try to dedicate at least 30 minutes daily to your career development.",
  "Networking is just as important as technical skills – reach out to professionals.",
  "Document your learning journey – it becomes your portfolio.",
  "Set small, achievable goals to maintain momentum.",
];

const sidebarNav = [
  { icon: Home, label: 'Dashboard', section: 'dashboard' },
  { icon: Map, label: 'Career Roadmap', section: 'roadmap' },
  { icon: ClipboardList, label: 'Daily Tasks', section: 'tasks' },
  { icon: BookOpen, label: 'Study Tools', path: '/study-tools' },
  { icon: Medal, label: 'Skills & Badges', path: '/profile' },
  { icon: FileText, label: 'Portfolio Builder', path: '/documents' },
  { icon: User, label: 'Profile', path: '/profile' },
  { icon: Bot, label: 'AI Assistant', action: 'chatbot' },
];

const Roadmap = () => {
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();
  const { points, level, streak, tasksCompleted, selectedCareer, roadmap, toggleTask, badges, focusTimeToday, addFocusTime } = useUserData();
  const [tip] = useState(tips[Math.floor(Math.random() * tips.length)]);
  const [expandedMilestone, setExpandedMilestone] = useState<string | null>('m1');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeSection, setActiveSection] = useState('dashboard');
  const [chatbotOpen, setChatbotOpen] = useState(false);

  useEffect(() => {
    if (!isAuthenticated) navigate('/auth');
    if (!selectedCareer) navigate('/results');
  }, [isAuthenticated, selectedCareer, navigate]);

  if (!selectedCareer) return null;

  const totalTasks = roadmap.reduce((acc, m) => acc + m.tasks.length, 0);
  const completedTasks = roadmap.reduce((acc, m) => acc + m.tasks.filter(t => t.completed).length, 0);
  const overallProgress = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;
  const earnedBadges = badges.filter(b => b.earned).length;

  const todayTasks = roadmap.flatMap(m => m.tasks).filter(t => !t.completed).slice(0, 3);

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />

      {/* Top bar */}
      <div className="border-b border-border bg-card">
        <div className="container mx-auto px-4 py-3 flex items-center justify-between flex-wrap gap-3">
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-full gradient-bg-primary flex items-center justify-center text-primary-foreground font-bold text-sm">
              {user?.name?.[0] || 'U'}
            </div>
            <div>
              <p className="text-sm font-semibold">{user?.name}</p>
              <p className="text-xs text-muted-foreground">Level {level}</p>
            </div>
          </div>
          <div className="flex items-center gap-4 text-sm">
            <span className="flex items-center gap-1"><Zap className="h-4 w-4 text-accent" /> {points} XP</span>
            <span className="flex items-center gap-1"><Trophy className="h-4 w-4 text-primary" /> Lv.{level}</span>
            <span className="flex items-center gap-1"><Flame className="h-4 w-4 text-destructive" /> {streak} day</span>
            <span className="px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-medium">{selectedCareer.title}</span>
          </div>
        </div>
      </div>

      <div className="flex-1 flex">
        {/* Mobile sidebar toggle */}
        <button onClick={() => setSidebarOpen(!sidebarOpen)} className="lg:hidden fixed bottom-4 right-4 z-50 gradient-bg-primary text-primary-foreground p-3 rounded-full shadow-lg">
          <Map className="h-5 w-5" />
        </button>

        {/* Left Sidebar */}
        <aside className={`${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0 fixed lg:sticky top-0 lg:top-auto left-0 h-full lg:h-auto w-64 bg-card border-r border-border z-40 lg:z-auto transition-transform overflow-y-auto pt-4 lg:pt-0`}>
          {/* User stats */}
          <div className="p-4 border-b border-border">
            <h3 className="text-sm font-semibold mb-3">Your Stats</h3>
            <div className="space-y-3">
              <div>
                <div className="flex justify-between text-xs mb-1"><span>Overall Progress</span><span>{overallProgress}%</span></div>
                <div className="h-2 rounded-full bg-secondary overflow-hidden"><div className="h-full gradient-bg-primary rounded-full" style={{ width: `${overallProgress}%` }} /></div>
              </div>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="p-2 rounded-lg bg-secondary"><Clock className="h-3 w-3 mb-1 text-primary" /><span className="font-semibold">~2 years</span><p className="text-muted-foreground">Estimate</p></div>
                <div className="p-2 rounded-lg bg-secondary"><Medal className="h-3 w-3 mb-1 text-accent" /><span className="font-semibold">{earnedBadges}</span><p className="text-muted-foreground">Badges</p></div>
              </div>
            </div>
          </div>

          {/* Nav */}
          <nav className="p-4 space-y-1">
            {sidebarNav.map(({ icon: Icon, label, path, section, action }) => {
              if (action === 'chatbot') {
                // Chatbot action
                return (
                  <button
                    key={label}
                    onClick={() => {
                      setChatbotOpen(true);
                      setSidebarOpen(false);
                    }}
                    className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
                  >
                    <Icon className="h-4 w-4" /> {label}
                  </button>
                );
              } else if (path) {
                // External navigation
                return (
                  <Link 
                    key={label} 
                    to={path} 
                    onClick={() => setSidebarOpen(false)} 
                    className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
                  >
                    <Icon className="h-4 w-4" /> {label}
                  </Link>
                );
              } else {
                // Section navigation within page
                return (
                  <button
                    key={label}
                    onClick={() => {
                      setActiveSection(section!);
                      setSidebarOpen(false);
                    }}
                    className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors ${
                      activeSection === section
                        ? 'bg-primary/10 text-primary font-medium'
                        : 'text-muted-foreground hover:text-foreground hover:bg-secondary'
                    }`}
                  >
                    <Icon className="h-4 w-4" /> {label}
                  </button>
                );
              }
            })}
          </nav>
        </aside>

        {/* Main */}
        <main className="flex-1 p-4 md:p-8 overflow-x-hidden">
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
            <h1 className="text-2xl font-bold mb-1">Welcome back, {user?.name}!</h1>
            <p className="text-muted-foreground text-sm mb-6">Your journey to becoming <span className="text-primary font-medium">{selectedCareer.title}</span></p>

            {/* AI tip */}
            <div className="glass-card rounded-xl p-4 mb-8 border-primary/20 flex items-start gap-3">
              <Sparkles className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-semibold mb-1">AI Recommendation</p>
                <p className="text-sm text-muted-foreground">{tip}</p>
              </div>
            </div>

            {/* Dashboard Section */}
            {activeSection === 'dashboard' && (
              <div className="space-y-6">
                <h2 className="text-xl font-bold">Dashboard <span className="gradient-text">Overview</span></h2>
                
                {/* Stats Grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="glass-card rounded-xl p-4">
                    <div className="flex items-center gap-3 mb-2">
                      <Trophy className="h-5 w-5 text-primary" />
                      <h3 className="font-semibold">Progress</h3>
                    </div>
                    <p className="text-2xl font-bold">{overallProgress}%</p>
                    <p className="text-xs text-muted-foreground">{completedTasks} of {totalTasks} tasks</p>
                  </div>
                  
                  <div className="glass-card rounded-xl p-4">
                    <div className="flex items-center gap-3 mb-2">
                      <Flame className="h-5 w-5 text-destructive" />
                      <h3 className="font-semibold">Streak</h3>
                    </div>
                    <p className="text-2xl font-bold">{streak} days</p>
                    <p className="text-xs text-muted-foreground">Keep it going!</p>
                  </div>
                  
                  <div className="glass-card rounded-xl p-4">
                    <div className="flex items-center gap-3 mb-2">
                      <Medal className="h-5 w-5 text-accent" />
                      <h3 className="font-semibold">Badges</h3>
                    </div>
                    <p className="text-2xl font-bold">{earnedBadges}</p>
                    <p className="text-xs text-muted-foreground">Achievements earned</p>
                  </div>
                </div>

                {/* Today's Tasks Preview */}
                <div className="glass-card rounded-xl p-6">
                  <h3 className="font-semibold mb-4">Today's Focus</h3>
                  <div className="space-y-3">
                    {todayTasks.slice(0, 3).map(task => (
                      <div key={task.id} className="flex items-center gap-3 p-3 rounded-lg bg-secondary">
                        <input
                          type="checkbox"
                          checked={task.completed}
                          onChange={() => {
                            const milestone = roadmap.find(m => m.tasks.some(t => t.id === task.id));
                            if (milestone) toggleTask(milestone.id, task.id);
                          }}
                          className="h-4 w-4"
                        />
                        <div className="flex-1">
                          <p className="text-sm font-medium">{task.title}</p>
                          <p className="text-xs text-muted-foreground">{task.time} • {task.xp} XP</p>
                        </div>
                      </div>
                    ))}
                  </div>
                  <button
                    onClick={() => setActiveSection('tasks')}
                    className="mt-4 w-full py-2 rounded-lg border border-border hover:bg-secondary text-sm transition-colors"
                  >
                    View All Tasks
                  </button>
                </div>
              </div>
            )}

            {/* Daily Tasks Section */}
            {activeSection === 'tasks' && (
              <div className="space-y-6">
                <h2 className="text-xl font-bold">Daily <span className="gradient-text">Tasks</span></h2>
                
                <div className="glass-card rounded-xl p-6">
                  <h3 className="font-semibold mb-4">Priority Tasks</h3>
                  <div className="space-y-3">
                    {roadmap.flatMap(m => m.tasks.filter(t => !t.completed && t.priority === 'high')).slice(0, 5).map(task => {
                      const milestone = roadmap.find(m => m.tasks.some(t => t.id === task.id));
                      return (
                        <TaskItem 
                          key={task.id} 
                          {...task} 
                          onToggle={() => milestone && toggleTask(milestone.id, task.id)} 
                        />
                      );
                    })}
                  </div>
                </div>

                <div className="glass-card rounded-xl p-6">
                  <h3 className="font-semibold mb-4">All Pending Tasks</h3>
                  <div className="space-y-3">
                    {roadmap.flatMap(m => m.tasks.filter(t => !t.completed)).map(task => {
                      const milestone = roadmap.find(m => m.tasks.some(t => t.id === task.id));
                      return (
                        <TaskItem 
                          key={task.id} 
                          {...task} 
                          onToggle={() => milestone && toggleTask(milestone.id, task.id)} 
                        />
                      );
                    })}
                  </div>
                </div>
              </div>
            )}

            {/* Roadmap Section */}
            {activeSection === 'roadmap' && (
              <div className="space-y-4">
                <h2 className="text-xl font-bold">Career <span className="gradient-text">Roadmap</span></h2>
                {roadmap.map((milestone, i) => {
                  const mCompleted = milestone.tasks.filter(t => t.completed).length;
                  const mProgress = Math.round((mCompleted / milestone.tasks.length) * 100);
                  const isExpanded = expandedMilestone === milestone.id;

                  return (
                    <div key={milestone.id} className="glass-card rounded-xl overflow-hidden">
                      <button onClick={() => setExpandedMilestone(isExpanded ? null : milestone.id)} className="w-full p-4 flex items-center justify-between hover:bg-secondary/50 transition-colors">
                        <div className="flex items-center gap-3">
                          <div className={`h-8 w-8 rounded-full flex items-center justify-center text-sm font-bold ${mProgress === 100 ? 'gradient-bg-primary text-primary-foreground' : 'bg-secondary text-foreground'}`}>
                            {i + 1}
                          </div>
                          <div className="text-left">
                            <h3 className="font-semibold text-sm">{milestone.title}</h3>
                            <p className="text-xs text-muted-foreground">{milestone.description}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className="text-xs text-muted-foreground">{mCompleted}/{milestone.tasks.length}</span>
                          <div className="w-16 h-1.5 rounded-full bg-secondary hidden sm:block"><div className="h-full gradient-bg-primary rounded-full" style={{ width: `${mProgress}%` }} /></div>
                          {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                        </div>
                      </button>
                      {isExpanded && (
                        <div className="px-4 pb-4 space-y-2">
                          {milestone.tasks.map(task => (
                            <TaskItem key={task.id} {...task} onToggle={() => toggleTask(milestone.id, task.id)} />
                          ))}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </motion.div>
        </main>

        {/* Right Sidebar */}
        <aside className="hidden xl:block w-72 border-l border-border p-4 space-y-4">
          <div className="glass-card rounded-xl p-4">
            <h4 className="text-sm font-semibold mb-3">📋 Today's Tasks</h4>
            <div className="space-y-2">
              {todayTasks.map(task => (
                <div key={task.id} className="text-xs p-2 rounded-lg bg-secondary flex items-center justify-between">
                  <span>{task.title}</span>
                  <span className={`px-1.5 py-0.5 rounded text-xs ${task.priority === 'high' ? 'bg-destructive/10 text-destructive' : 'bg-primary/10 text-primary'}`}>{task.priority}</span>
                </div>
              ))}
              {todayTasks.length === 0 && <p className="text-xs text-muted-foreground">All caught up! 🎉</p>}
            </div>
          </div>

          <Timer onComplete={() => addFocusTime(25)} />

          <div className="glass-card rounded-xl p-4">
            <h4 className="text-sm font-semibold mb-3">📊 Quick Stats</h4>
            <div className="space-y-2 text-xs">
              <div className="flex justify-between"><span className="text-muted-foreground">Focus Time</span><span>{Math.round(focusTimeToday)} min</span></div>
              <div className="flex justify-between"><span className="text-muted-foreground">Tasks Done</span><span>{tasksCompleted}</span></div>
              <div className="flex justify-between"><span className="text-muted-foreground">XP Today</span><span className="text-accent">{points}</span></div>
            </div>
          </div>
        </aside>
      </div>

      {/* Chatbot */}
      <Chatbot isOpen={chatbotOpen} onClose={() => setChatbotOpen(false)} />
    </div>
  );
};

export default Roadmap;
