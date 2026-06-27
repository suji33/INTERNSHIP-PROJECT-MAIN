import { CheckCircle, XCircle } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

interface SkillsListProps {
  matchedSkills: string[];
  missingSkills: string[];
}

export function SkillsList({ matchedSkills, missingSkills }: SkillsListProps) {
  return (
    <div className="grid md:grid-cols-2 gap-6">
      {/* Matched Skills */}
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <CheckCircle className="w-5 h-5 text-green-500" />
          <h3 className="font-medium">Matched Skills ({matchedSkills.length})</h3>
        </div>
        <div className="flex flex-wrap gap-2">
          {matchedSkills.length > 0 ? (
            matchedSkills.map((skill, index) => (
              <Badge
                key={index}
                className={cn(
                  'bg-green-500/10 text-green-600 border-green-500/20',
                  'hover:bg-green-500/20'
                )}
              >
                {skill}
              </Badge>
            ))
          ) : (
            <p className="text-sm text-muted-foreground">No matching skills found</p>
          )}
        </div>
      </div>

      {/* Missing Skills */}
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <XCircle className="w-5 h-5 text-destructive" />
          <h3 className="font-medium">Missing Skills ({missingSkills.length})</h3>
        </div>
        <div className="flex flex-wrap gap-2">
          {missingSkills.length > 0 ? (
            missingSkills.map((skill, index) => (
              <Badge
                key={index}
                variant="outline"
                className={cn(
                  'border-destructive/30 text-destructive',
                  'hover:bg-destructive/10'
                )}
              >
                {skill}
              </Badge>
            ))
          ) : (
            <p className="text-sm text-muted-foreground">No missing skills - great match!</p>
          )}
        </div>
      </div>
    </div>
  );
}
