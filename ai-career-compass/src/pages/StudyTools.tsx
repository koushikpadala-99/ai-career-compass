import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Sparkles, RotateCcw, ChevronLeft, ChevronRight, Shuffle, Loader2, BookOpen } from 'lucide-react';
import Navbar from '@/components/Navbar';
import { useAuth } from '@/contexts/AuthContext';
import { generateFlashcards, FlashcardDeck, Flashcard } from '@/utils/flashcardGenerator';

const StudyTools = () => {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const [topic, setTopic] = useState('');
  const [decks, setDecks] = useState<FlashcardDeck[]>(() => {
    const saved = localStorage.getItem('flashcardDecks');
    return saved ? JSON.parse(saved) : [];
  });
  const [activeDeck, setActiveDeck] = useState<FlashcardDeck | null>(null);
  const [cardIndex, setCardIndex] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!isAuthenticated) navigate('/auth');
  }, [isAuthenticated, navigate]);

  const handleGenerate = () => {
    if (!topic.trim()) return;
    setLoading(true);
    setTimeout(() => {
      const deck = generateFlashcards(topic);
      const updated = [deck, ...decks];
      setDecks(updated);
      localStorage.setItem('flashcardDecks', JSON.stringify(updated));
      setTopic('');
      setLoading(false);
    }, 1000);
  };

  const openDeck = (deck: FlashcardDeck) => {
    setActiveDeck(deck);
    setCardIndex(0);
    setFlipped(false);
  };

  const setConfidence = (confidence: 'hard' | 'medium' | 'easy') => {
    if (!activeDeck) return;
    const updated = {
      ...activeDeck,
      cards: activeDeck.cards.map((c, i) => i === cardIndex ? { ...c, confidence } : c),
    };
    setActiveDeck(updated);
    setDecks(prev => {
      const newDecks = prev.map(d => d.id === updated.id ? updated : d);
      localStorage.setItem('flashcardDecks', JSON.stringify(newDecks));
      return newDecks;
    });
    // Auto-advance
    if (cardIndex < activeDeck.cards.length - 1) {
      setFlipped(false);
      setTimeout(() => setCardIndex(i => i + 1), 300);
    }
  };

  const shuffleCards = () => {
    if (!activeDeck) return;
    const shuffled = { ...activeDeck, cards: [...activeDeck.cards].sort(() => Math.random() - 0.5) };
    setActiveDeck(shuffled);
    setCardIndex(0);
    setFlipped(false);
  };

  const getDeckProgress = (deck: FlashcardDeck) => {
    const rated = deck.cards.filter(c => c.confidence !== 'none').length;
    return Math.round((rated / deck.cards.length) * 100);
  };

  if (activeDeck) {
    const card = activeDeck.cards[cardIndex];
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <div className="flex-1 container mx-auto px-4 py-10 max-w-2xl">
          <button onClick={() => setActiveDeck(null)} className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-6">
            <ChevronLeft className="h-4 w-4" /> Back to decks
          </button>
          <h2 className="text-2xl font-bold mb-6">{activeDeck.topic}</h2>

          {/* Flashcard */}
          <div onClick={() => setFlipped(!flipped)} className="glass-card rounded-2xl p-8 min-h-[250px] flex items-center justify-center cursor-pointer hover:border-primary/30 transition-all relative">
            <div className="absolute top-3 right-3 text-xs text-muted-foreground">{cardIndex + 1}/{activeDeck.cards.length}</div>
            <p className="text-center text-lg">{flipped ? card.back : card.front}</p>
            <span className="absolute bottom-3 text-xs text-muted-foreground">{flipped ? 'Answer' : 'Click to flip'}</span>
          </div>

          {/* Confidence */}
          {flipped && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="flex justify-center gap-3 mt-4">
              <button onClick={() => setConfidence('hard')} className="px-6 py-2 rounded-lg bg-destructive/10 text-destructive font-medium text-sm hover:bg-destructive/20">🔴 Hard</button>
              <button onClick={() => setConfidence('medium')} className="px-6 py-2 rounded-lg bg-accent/10 text-accent font-medium text-sm hover:bg-accent/20">🟡 Medium</button>
              <button onClick={() => setConfidence('easy')} className="px-6 py-2 rounded-lg bg-primary/10 text-primary font-medium text-sm hover:bg-primary/20">🟢 Easy</button>
            </motion.div>
          )}

          {/* Nav */}
          <div className="flex items-center justify-center gap-4 mt-6">
            <button onClick={() => { setCardIndex(i => Math.max(0, i - 1)); setFlipped(false); }} disabled={cardIndex === 0} className="p-2 rounded-lg border border-border hover:bg-secondary disabled:opacity-30">
              <ChevronLeft className="h-5 w-5" />
            </button>
            <button onClick={shuffleCards} className="p-2 rounded-lg border border-border hover:bg-secondary">
              <Shuffle className="h-5 w-5" />
            </button>
            <button onClick={() => { setCardIndex(i => Math.min(activeDeck.cards.length - 1, i + 1)); setFlipped(false); }} disabled={cardIndex === activeDeck.cards.length - 1} className="p-2 rounded-lg border border-border hover:bg-secondary disabled:opacity-30">
              <ChevronRight className="h-5 w-5" />
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <div className="flex-1 container mx-auto px-4 py-10">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="text-3xl font-bold mb-2">AI <span className="gradient-text">Card Generator</span></h1>
          <p className="text-muted-foreground text-sm mb-8">Generate study cards on any topic</p>

          <div className="glass-card rounded-xl p-6 max-w-xl mb-10">
            <div className="flex gap-3">
              <input
                value={topic}
                onChange={e => setTopic(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleGenerate()}
                placeholder="Enter any topic..."
                className="flex-1 bg-secondary rounded-lg px-4 py-2.5 text-sm border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
              />
              <button onClick={handleGenerate} disabled={loading || !topic.trim()} className="gradient-bg-primary text-primary-foreground px-5 py-2.5 rounded-lg font-medium text-sm hover:opacity-90 disabled:opacity-50 flex items-center gap-2">
                {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
                Generate
              </button>
            </div>
          </div>

          {/* Decks grid */}
          <h2 className="text-xl font-bold mb-4">Your Decks</h2>
          {decks.length === 0 ? (
            <div className="glass-card rounded-xl p-10 text-center">
              <BookOpen className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
              <p className="text-muted-foreground">No decks yet. Generate your first flashcard deck!</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {decks.map(deck => (
                <div key={deck.id} onClick={() => openDeck(deck)} className="glass-card rounded-xl p-5 cursor-pointer hover:border-primary/30 transition-all">
                  <h3 className="font-semibold mb-2">{deck.topic}</h3>
                  <div className="flex items-center justify-between text-xs text-muted-foreground mb-2">
                    <span>{deck.cards.length} cards</span>
                    <span>Last studied: {deck.lastStudied}</span>
                  </div>
                  <div className="h-1.5 rounded-full bg-secondary overflow-hidden">
                    <div className="h-full gradient-bg-primary rounded-full" style={{ width: `${getDeckProgress(deck)}%` }} />
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">{getDeckProgress(deck)}% completed</p>
                </div>
              ))}
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
};

export default StudyTools;
