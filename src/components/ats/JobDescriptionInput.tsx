import { Textarea } from '@/components/ui/textarea';

interface JobDescriptionInputProps {
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
}

export function JobDescriptionInput({ value, onChange, disabled }: JobDescriptionInputProps) {
  return (
    <div className="space-y-3">
      <label htmlFor="job-description" className="text-sm font-medium text-foreground">
        Job Description
      </label>
      <Textarea
        id="job-description"
        placeholder="Paste the job description here...

Example:
We are looking for a Software Developer with experience in:
- Python, JavaScript, React
- Database management (SQL, MongoDB)
- REST APIs and web services
- Version control (Git)
- Problem-solving and teamwork skills"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        disabled={disabled}
        className="min-h-[200px] resize-none"
      />
      <p className="text-xs text-muted-foreground">
        Include required skills, qualifications, and responsibilities for accurate matching
      </p>
    </div>
  );
}
