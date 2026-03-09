import { useState, useEffect, useCallback } from 'react';
import { Play, Pause, RotateCcw } from 'lucide-react';

interface TimerProps {
  initialMinutes?: number;
  onComplete?: () => void;
}

const Timer = ({ initialMinutes = 25, onComplete }: TimerProps) => {
  const [seconds, setSeconds] = useState(initialMinutes * 60);
  const [isRunning, setIsRunning] = useState(false);
  const [sessions, setSessions] = useState(0);

  useEffect(() => {
    if (!isRunning) return;
    const interval = setInterval(() => {
      setSeconds(prev => {
        if (prev <= 1) {
          setIsRunning(false);
          setSessions(s => s + 1);
          onComplete?.();
          return initialMinutes * 60;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [isRunning, initialMinutes, onComplete]);

  const reset = useCallback(() => {
    setIsRunning(false);
    setSeconds(initialMinutes * 60);
  }, [initialMinutes]);

  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  const progress = ((initialMinutes * 60 - seconds) / (initialMinutes * 60)) * 100;

  return (
    <div className="glass-card rounded-xl p-4">
      <h4 className="text-sm font-semibold mb-3">⏱️ Pomodoro Timer</h4>
      <div className="relative flex items-center justify-center mb-3">
        <div className="w-28 h-28 rounded-full border-4 border-secondary flex items-center justify-center relative">
          <svg className="absolute inset-0 w-full h-full -rotate-90" viewBox="0 0 100 100">
            <circle cx="50" cy="50" r="46" fill="none" stroke="hsl(var(--primary))" strokeWidth="4" strokeDasharray={`${progress * 2.89} 289`} strokeLinecap="round" />
          </svg>
          <span className="text-2xl font-mono font-bold">{String(mins).padStart(2, '0')}:{String(secs).padStart(2, '0')}</span>
        </div>
      </div>
      <div className="flex items-center justify-center gap-2">
        <button onClick={() => setIsRunning(!isRunning)} className="gradient-bg-primary text-primary-foreground p-2 rounded-lg hover:opacity-90">
          {isRunning ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
        </button>
        <button onClick={reset} className="p-2 rounded-lg border border-border hover:bg-secondary">
          <RotateCcw className="h-4 w-4" />
        </button>
      </div>
      <p className="text-xs text-muted-foreground text-center mt-2">Sessions: {sessions}</p>
    </div>
  );
};

export default Timer;
