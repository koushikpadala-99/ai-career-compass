import { AnalysisResult } from '@/utils/careerData';
import { Brain, Tag, Sparkles, BarChart3 } from 'lucide-react';

interface AIAnalysisBoxProps {
  result: AnalysisResult;
}

const AIAnalysisBox = ({ result }: AIAnalysisBoxProps) => (
  <div className="glass-card rounded-xl p-6 border-primary/20">
    <div className="flex items-center gap-2 mb-4">
      <Brain className="h-5 w-5 text-primary" />
      <h3 className="font-bold text-lg">AI Interest Analysis Results</h3>
    </div>

    <div className="space-y-4">
      {/* Keywords */}
      <div>
        <div className="flex items-center gap-2 mb-2">
          <Tag className="h-4 w-4 text-primary" />
          <span className="text-sm font-semibold">Keywords Detected</span>
        </div>
        <div className="flex flex-wrap gap-1.5">
          {result.keywordsDetected.map(k => (
            <span key={k} className="text-xs px-2.5 py-1 rounded-full bg-primary/10 text-primary font-medium">{k}</span>
          ))}
        </div>
      </div>

      {/* Categories */}
      <div>
        <div className="flex items-center gap-2 mb-2">
          <BarChart3 className="h-4 w-4 text-accent" />
          <span className="text-sm font-semibold">Suggested Categories</span>
        </div>
        <div className="space-y-2">
          {result.categories.map(cat => (
            <div key={cat.name}>
              <div className="flex justify-between text-xs mb-1">
                <span>{cat.name}</span>
                <span className="text-muted-foreground">{cat.percentage}%</span>
              </div>
              <div className="h-1.5 rounded-full bg-secondary overflow-hidden">
                <div className="h-full rounded-full gradient-bg-primary transition-all" style={{ width: `${cat.percentage}%` }} />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Personality */}
      <div>
        <div className="flex items-center gap-2 mb-2">
          <Sparkles className="h-4 w-4 text-accent" />
          <span className="text-sm font-semibold">Personality Indicators</span>
        </div>
        <div className="flex flex-wrap gap-1.5">
          {result.personality.map(p => (
            <span key={p} className="text-xs px-2.5 py-1 rounded-full bg-accent/10 text-accent font-medium">{p}</span>
          ))}
        </div>
      </div>
    </div>
  </div>
);

export default AIAnalysisBox;
