import { Bookmark, BookmarkCheck, MapPin, GraduationCap, DollarSign, Briefcase } from 'lucide-react';
import { Career } from '@/utils/careerData';

interface CareerCardProps {
  career: Career;
  isSaved: boolean;
  onSave: () => void;
  onViewRoadmap: () => void;
}

const CareerCard = ({ career, isSaved, onSave, onViewRoadmap }: CareerCardProps) => {
  const percentage = career.matchPercentage || 0;
  const barColor = percentage >= 70 ? 'bg-primary' : percentage >= 40 ? 'bg-accent' : 'bg-muted-foreground';

  return (
    <div className="glass-card rounded-xl p-5 flex flex-col gap-4 hover:border-primary/30 transition-all group">
      <div className="flex items-start justify-between">
        <div>
          <span className="text-xs font-medium px-2 py-1 rounded-full bg-primary/10 text-primary">{career.category}</span>
          <h3 className="text-lg font-bold mt-2">{career.title}</h3>
        </div>
        <button onClick={onSave} className="p-2 rounded-lg hover:bg-secondary transition-colors">
          {isSaved ? <BookmarkCheck className="h-5 w-5 text-primary" /> : <Bookmark className="h-5 w-5 text-muted-foreground" />}
        </button>
      </div>

      {/* Match bar */}
      <div>
        <div className="flex justify-between text-sm mb-1">
          <span className="text-muted-foreground">Match</span>
          <span className="font-semibold">{percentage}%</span>
        </div>
        <div className="h-2 rounded-full bg-secondary overflow-hidden">
          <div className={`h-full rounded-full ${barColor} transition-all`} style={{ width: `${percentage}%` }} />
        </div>
      </div>

      {career.matchReason && (
        <p className="text-sm text-muted-foreground italic">"{career.matchReason}"</p>
      )}

      <div className="grid grid-cols-2 gap-2 text-xs text-muted-foreground">
        <div className="flex items-center gap-1"><GraduationCap className="h-3 w-3" /> {career.education}</div>
        <div className="flex items-center gap-1"><DollarSign className="h-3 w-3" /> {career.salary}</div>
        <div className="flex items-center gap-1 col-span-2"><Briefcase className="h-3 w-3" /> {career.workStyle}</div>
      </div>

      <div className="flex flex-wrap gap-1">
        {career.skills.map(skill => (
          <span key={skill} className="text-xs px-2 py-0.5 rounded-full bg-secondary text-secondary-foreground">{skill}</span>
        ))}
      </div>

      <button onClick={onViewRoadmap} className="mt-auto w-full gradient-bg-primary text-primary-foreground py-2 rounded-lg text-sm font-medium hover:opacity-90 transition-opacity">
        View Roadmap
      </button>
    </div>
  );
};

export default CareerCard;
