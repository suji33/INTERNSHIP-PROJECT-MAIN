// ATS API Service - Connects to Python Backend
// Configure the BASE_URL to point to your local Python server

import type { ATSResult, ChatMessage, APIResponse } from '@/types/ats';

// Change this to your Python backend URL
const BASE_URL = 'http://localhost:5000/api';

/**
 * Analyze resume against job description
 * Sends resume file and job description to Python backend
 */
export async function analyzeResume(
  resumeFile: File,
  jobDescription: string
): Promise<APIResponse<ATSResult>> {
  try {
    const formData = new FormData();
    formData.append('resume', resumeFile);
    formData.append('job_description', jobDescription);

    const response = await fetch(`${BASE_URL}/analyze`, {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      throw new Error(`Server error: ${response.status}`);
    }

    const data = await response.json();
    
    return {
      success: true,
      data: {
        score: data.score,
        status: data.score >= 70 ? 'Shortlisted' : 'Rejected',
        matchedSkills: data.matched_skills || [],
        missingSkills: data.missing_skills || [],
      },
    };
  } catch (error) {
    console.error('API Error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to analyze resume',
    };
  }
}

/**
 * Get chatbot suggestions for resume improvement
 */
export async function getChatSuggestions(
  missingSkills: string[],
  matchedSkills: string[],
  score: number
): Promise<APIResponse<string>> {
  try {
    const response = await fetch(`${BASE_URL}/chat`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        missing_skills: missingSkills,
        matched_skills: matchedSkills,
        score: score,
      }),
    });

    if (!response.ok) {
      throw new Error(`Server error: ${response.status}`);
    }

    const data = await response.json();
    
    return {
      success: true,
      data: data.suggestion,
    };
  } catch (error) {
    console.error('Chat API Error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to get suggestions',
    };
  }
}

/**
 * Check if Python backend is running
 */
export async function checkHealth(): Promise<boolean> {
  try {
    const response = await fetch(`${BASE_URL}/health`);
    return response.ok;
  } catch {
    return false;
  }
}
