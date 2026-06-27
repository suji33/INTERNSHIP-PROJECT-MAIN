import { useMemo } from 'react';
import { CheckCircle2, XCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ScoreDisplayProps {
  score: number;
  status: 'Shortlisted' | 'Rejected';
}

export function ScoreDisplay({ score, status }: ScoreDisplayProps) {
  const isShortlisted = status === 'Shortlisted';
  
  // Calculate the stroke dashoffset for the circular progress
  const circumference = 2 * Math.PI * 45; // radius = 45
  const strokeDashoffset = useMemo(() => {
    return circumference - (score / 100) * circumference;
  }, [score, circumference]);

  return (
    <div className="flex flex-col items-center p-6">
      {/* Circular Progress */}
      <div className="relative w-32 h-32">
        <svg className="w-full h-full transform -rotate-90">
          {/* Background circle */}
          <circle
            cx="64"
            cy="64"
            r="45"
            fill="none"
            stroke="currentColor"
            strokeWidth="8"
            className="text-muted"
          />
          {/* Progress circle */}
          <circle
            cx="64"
            cy="64"
            r="45"
            fill="none"
            stroke="currentColor"
            strokeWidth="8"
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            className={cn(
              'transition-all duration-1000 ease-out',
              isShortlisted ? 'text-green-500' : 'text-destructive'
            )}
          />
        </svg>
        {/* Score text in center */}
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-3xl font-bold">{score}%</span>
          <span className="text-xs text-muted-foreground">ATS Score</span>
        </div>
      </div>

      {/* Status Badge */}
      <div
        className={cn(
          'mt-4 flex items-center gap-2 px-4 py-2 rounded-full font-medium',
          isShortlisted 
            ? 'bg-green-500/10 text-green-600' 
            : 'bg-destructive/10 text-destructive'
        )}
      >
        {isShortlisted ? (
          <>
            <CheckCircle2 className="w-5 h-5" />
            <span>Shortlisted</span>
          </>
        ) : (
          <>
            <XCircle className="w-5 h-5" />
            <span>Rejected</span>
          </>
        )}
      </div>

      <p className="mt-2 text-xs text-muted-foreground text-center">
        Threshold: 70% or above for shortlisting
      </p>
    </div>
  );
}
