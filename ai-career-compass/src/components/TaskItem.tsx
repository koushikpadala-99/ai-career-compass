import { Check, Clock, Zap } from 'lucide-react';

interface TaskItemProps {
  title: string;
  xp: number;
  time: string;
  completed: boolean;
  priority: 'high' | 'medium' | 'low';
  onToggle: () => void;
}

const priorityColors = {
  high: 'bg-destructive/10 text-destructive',
  medium: 'bg-accent/10 text-accent',
  low: 'bg-primary/10 text-primary',
};

const TaskItem = ({ title, xp, time, completed, priority, onToggle }: TaskItemProps) => (
  <div className={`flex items-center gap-3 p-3 rounded-lg border transition-all cursor-pointer hover:border-primary/30 ${completed ? 'bg-primary/5 border-primary/20' : 'border-border'}`} onClick={onToggle}>
    <div className={`h-5 w-5 rounded-md border-2 flex items-center justify-center flex-shrink-0 transition-colors ${completed ? 'bg-primary border-primary' : 'border-muted-foreground'}`}>
      {completed && <Check className="h-3 w-3 text-primary-foreground" />}
    </div>
    <div className="flex-1 min-w-0">
      <p className={`text-sm font-medium ${completed ? 'line-through text-muted-foreground' : ''}`}>{title}</p>
      <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground">
        <span className="flex items-center gap-1"><Zap className="h-3 w-3 text-accent" /> {xp} XP</span>
        <span className="flex items-center gap-1"><Clock className="h-3 w-3" /> {time}</span>
      </div>
    </div>
    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${priorityColors[priority]}`}>{priority}</span>
  </div>
);

export default TaskItem;
