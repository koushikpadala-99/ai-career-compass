import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Upload, FileText, MessageSquare, Search, Sparkles, Bot, User as UserIcon } from 'lucide-react';
import Navbar from '@/components/Navbar';
import { useAuth } from '@/contexts/AuthContext';

const mockSummary = {
  summary: {
    title: 'Document Summary',
    points: [
      'Key finding: The document covers essential concepts and frameworks',
      'Important methodology: A structured approach is recommended',
      'Results indicate positive outcomes when following best practices',
      'Conclusion: Further study and practical application are advised',
    ],
    terms: ['Framework', 'Methodology', 'Best Practices', 'Analysis', 'Implementation'],
    actions: ['Review core concepts', 'Practice with real examples', 'Create a study schedule', 'Discuss with peers'],
  },
  studyGuide: {
    title: 'Study Guide',
    points: [
      'Chapter 1: Foundational concepts and terminology',
      'Chapter 2: Practical applications and case studies',
      'Chapter 3: Advanced techniques and methodologies',
      'Review: Practice questions and self-assessment',
    ],
    terms: ['Definitions', 'Case Studies', 'Techniques', 'Assessment', 'Review'],
    actions: ['Summarize each chapter', 'Complete practice exercises', 'Create flashcards for key terms'],
  },
  keyTerms: {
    title: 'Key Terms Extracted',
    points: [
      'Core terminology identified from the document',
      'Technical vocabulary organized by topic',
      'Related concepts and cross-references noted',
    ],
    terms: ['Term 1', 'Term 2', 'Term 3', 'Term 4', 'Term 5', 'Term 6'],
    actions: ['Create a glossary', 'Study terms in context', 'Use in practice writing'],
  },
};

const mockChat = [
  { role: 'user' as const, text: 'What are the main topics covered in this document?' },
  { role: 'ai' as const, text: 'The document covers three main areas: foundational theory, practical applications, and current research trends. Would you like me to elaborate on any of these?' },
  { role: 'user' as const, text: 'Can you explain the practical applications section?' },
  { role: 'ai' as const, text: 'The practical applications section discusses real-world implementations, including case studies from industry leaders, step-by-step guides for common scenarios, and best practices for deployment.' },
];

const DocumentTools = () => {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const [tab, setTab] = useState<'summarize' | 'ask'>('summarize');
  const [option, setOption] = useState<'summary' | 'keyTerms' | 'studyGuide'>('summary');
  const [showResult, setShowResult] = useState(false);
  const [chatInput, setChatInput] = useState('');

  useEffect(() => {
    if (!isAuthenticated) navigate('/auth');
  }, [isAuthenticated, navigate]);

  const currentResult = mockSummary[option];

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <div className="flex-1 container mx-auto px-4 py-10">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="text-3xl font-bold mb-2">Document <span className="gradient-text">Tools</span></h1>
          <p className="text-muted-foreground text-sm mb-8">AI-powered document analysis and Q&A</p>

          {/* Tabs */}
          <div className="flex rounded-lg bg-secondary p-1 mb-8 max-w-md">
            <button onClick={() => setTab('summarize')} className={`flex-1 py-2 text-sm font-medium rounded-md transition-all flex items-center justify-center gap-2 ${tab === 'summarize' ? 'bg-background shadow-sm' : 'text-muted-foreground'}`}>
              <FileText className="h-4 w-4" /> Summarize
            </button>
            <button onClick={() => setTab('ask')} className={`flex-1 py-2 text-sm font-medium rounded-md transition-all flex items-center justify-center gap-2 ${tab === 'ask' ? 'bg-background shadow-sm' : 'text-muted-foreground'}`}>
              <MessageSquare className="h-4 w-4" /> Ask AI
            </button>
          </div>

          {tab === 'summarize' ? (
            <div className="max-w-3xl">
              {/* Dropzone */}
              <div className="glass-card rounded-2xl p-10 text-center border-dashed border-2 border-border hover:border-primary/30 transition-colors cursor-pointer mb-6">
                <Upload className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="font-semibold mb-1">Drop your document here</p>
                <p className="text-sm text-muted-foreground">PDF, DOCX, or TXT – up to 10MB</p>
                <button className="mt-4 gradient-bg-primary text-primary-foreground px-6 py-2 rounded-lg text-sm font-medium hover:opacity-90">Browse Files</button>
              </div>

              {/* Options */}
              <div className="flex flex-wrap gap-3 mb-6">
                {[
                  { key: 'summary' as const, label: 'Summarize for my career path' },
                  { key: 'keyTerms' as const, label: 'Extract key terms' },
                  { key: 'studyGuide' as const, label: 'Create study guide' },
                ].map(o => (
                  <button key={o.key} onClick={() => setOption(o.key)} className={`px-4 py-2 rounded-lg text-sm transition-all ${option === o.key ? 'gradient-bg-primary text-primary-foreground' : 'bg-secondary text-secondary-foreground hover:bg-secondary/80'}`}>
                    {o.label}
                  </button>
                ))}
              </div>

              <button onClick={() => setShowResult(true)} className="gradient-bg-primary text-primary-foreground px-8 py-3 rounded-xl font-semibold hover:opacity-90 flex items-center gap-2">
                <Sparkles className="h-5 w-5" /> Summarize
              </button>

              {/* Result */}
              {showResult && (
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="glass-card rounded-xl p-6 mt-6">
                  <h3 className="font-bold text-lg mb-4">{currentResult.title}</h3>
                  <div className="space-y-4">
                    <div>
                      <h4 className="text-sm font-semibold mb-2">Key Points</h4>
                      <ul className="space-y-2">
                        {currentResult.points.map((p, i) => (
                          <li key={i} className="text-sm text-muted-foreground flex items-start gap-2">
                            <span className="text-primary mt-1">•</span> {p}
                          </li>
                        ))}
                      </ul>
                    </div>
                    <div>
                      <h4 className="text-sm font-semibold mb-2">Key Terms</h4>
                      <div className="flex flex-wrap gap-1.5">
                        {currentResult.terms.map(t => (
                          <span key={t} className="text-xs px-2.5 py-1 rounded-full bg-primary/10 text-primary">{t}</span>
                        ))}
                      </div>
                    </div>
                    <div>
                      <h4 className="text-sm font-semibold mb-2">Action Items</h4>
                      <ul className="space-y-1">
                        {currentResult.actions.map((a, i) => (
                          <li key={i} className="text-sm text-muted-foreground flex items-center gap-2">
                            <span className="text-accent">✓</span> {a}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </motion.div>
              )}
            </div>
          ) : (
            <div className="max-w-3xl">
              {/* Chat */}
              <div className="glass-card rounded-xl p-6 mb-4 min-h-[300px] max-h-[500px] overflow-y-auto space-y-4">
                {mockChat.map((msg, i) => (
                  <div key={i} className={`flex items-start gap-3 ${msg.role === 'user' ? 'justify-end' : ''}`}>
                    {msg.role === 'ai' && <div className="h-8 w-8 rounded-full gradient-bg-primary flex items-center justify-center flex-shrink-0"><Bot className="h-4 w-4 text-primary-foreground" /></div>}
                    <div className={`max-w-[80%] p-3 rounded-xl text-sm ${msg.role === 'user' ? 'bg-primary/10 text-foreground' : 'bg-secondary text-foreground'}`}>
                      {msg.text}
                    </div>
                    {msg.role === 'user' && <div className="h-8 w-8 rounded-full bg-secondary flex items-center justify-center flex-shrink-0"><UserIcon className="h-4 w-4" /></div>}
                  </div>
                ))}
              </div>
              <div className="flex gap-3">
                <input value={chatInput} onChange={e => setChatInput(e.target.value)} placeholder="Ask about your documents..." className="flex-1 bg-secondary rounded-lg px-4 py-2.5 text-sm border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50" />
                <button className="gradient-bg-primary text-primary-foreground px-5 py-2.5 rounded-lg font-medium text-sm hover:opacity-90">
                  <Search className="h-4 w-4" />
                </button>
              </div>
              <p className="text-xs text-muted-foreground mt-2">Sample questions: "What are the key takeaways?", "Explain the methodology", "Create a quiz from this document"</p>
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
};

export default DocumentTools;
