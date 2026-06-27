// ATS System Type Definitions

export interface ATSResult {
  score: number;
  status: 'Shortlisted' | 'Rejected';
  matchedSkills: string[];
  missingSkills: string[];
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

export interface AnalyzeRequest {
  resume: File;
  jobDescription: string;
}

export interface ChatRequest {
  missingSkills: string[];
  matchedSkills: string[];
  score: number;
}

export interface APIResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}
