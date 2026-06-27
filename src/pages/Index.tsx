import { useState } from 'react';
import { FileSearch, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { FileUpload } from '@/components/ats/FileUpload';
import { JobDescriptionInput } from '@/components/ats/JobDescriptionInput';
import { ResultsPanel } from '@/components/ats/ResultsPanel';
import { BackendStatus } from '@/components/ats/BackendStatus';
import { analyzeResume } from '@/services/atsApi';
import type { ATSResult } from '@/types/ats';
import { useToast } from '@/hooks/use-toast';

export default function Index() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [jobDescription, setJobDescription] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [result, setResult] = useState<ATSResult | null>(null);
  const { toast } = useToast();

  const canSubmit = selectedFile && jobDescription.trim().length > 50;

  const handleAnalyze = async () => {
    if (!selectedFile || !jobDescription.trim()) return;

    setIsAnalyzing(true);
    setResult(null);

    try {
      const response = await analyzeResume(selectedFile, jobDescription);

      if (response.success && response.data) {
        setResult(response.data);
        toast({
          title: 'Analysis Complete',
          description: `Your ATS score is ${response.data.score}%`,
        });
      } else {
        // Demo mode fallback when backend is not available
        const demoResult = generateDemoResult(jobDescription);
        setResult(demoResult);
        toast({
          title: 'Demo Mode',
          description: 'Backend not connected. Showing demo results.',
          variant: 'default',
        });
      }
    } catch {
      // Demo mode fallback
      const demoResult = generateDemoResult(jobDescription);
      setResult(demoResult);
      toast({
        title: 'Demo Mode',
        description: 'Using demo results. Connect Python backend for real analysis.',
        variant: 'default',
      });
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleReset = () => {
    setSelectedFile(null);
    setJobDescription('');
    setResult(null);
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card">
        <div className="container mx-auto px-4 py-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-primary flex items-center justify-center">
                <FileSearch className="w-6 h-6 text-primary-foreground" />
              </div>
              <div>
                <h1 className="text-xl font-bold">Applicant Tracking System</h1>
                <p className="text-sm text-muted-foreground">Resume Analysis Tool</p>
              </div>
            </div>
            <BackendStatus />
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-2 gap-8">
          {/* Input Panel */}
          <Card>
            <CardHeader>
              <CardTitle>Upload & Analyze</CardTitle>
              <CardDescription>
                Upload your resume and paste the job description to get your ATS score
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <FileUpload
                selectedFile={selectedFile}
                onFileSelect={setSelectedFile}
                disabled={isAnalyzing}
              />

              <JobDescriptionInput
                value={jobDescription}
                onChange={setJobDescription}
                disabled={isAnalyzing}
              />

              <div className="flex gap-3">
                <Button
                  onClick={handleAnalyze}
                  disabled={!canSubmit || isAnalyzing}
                  className="flex-1"
                >
                  {isAnalyzing ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Analyzing...
                    </>
                  ) : (
                    <>
                      <FileSearch className="w-4 h-4 mr-2" />
                      Analyze Resume
                    </>
                  )}
                </Button>

                {result && (
                  <Button variant="outline" onClick={handleReset}>
                    Reset
                  </Button>
                )}
              </div>

              {!canSubmit && (
                <p className="text-xs text-muted-foreground text-center">
                  {!selectedFile
                    ? 'Please upload a resume to continue'
                    : 'Job description must be at least 50 characters'}
                </p>
              )}
            </CardContent>
          </Card>

          {/* Results Panel */}
          {result ? (
            <ResultsPanel result={result} />
          ) : (
            <Card className="flex items-center justify-center min-h-[400px]">
              <div className="text-center p-8">
                <FileSearch className="w-16 h-16 mx-auto mb-4 text-muted-foreground/30" />
                <h3 className="text-lg font-medium mb-2">No Results Yet</h3>
                <p className="text-sm text-muted-foreground max-w-[250px]">
                  Upload your resume and job description, then click "Analyze Resume" to see your ATS score
                </p>
              </div>
            </Card>
          )}
        </div>

        {/* Instructions */}
        <Card className="mt-8">
          <CardHeader>
            <CardTitle className="text-lg">How It Works</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid sm:grid-cols-3 gap-6">
              <div className="flex gap-3">
                <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                  <span className="text-sm font-bold text-primary">1</span>
                </div>
                <div>
                  <h4 className="font-medium">Upload Resume</h4>
                  <p className="text-sm text-muted-foreground">
                    Upload your resume in PDF or DOCX format
                  </p>
                </div>
              </div>
              <div className="flex gap-3">
                <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                  <span className="text-sm font-bold text-primary">2</span>
                </div>
                <div>
                  <h4 className="font-medium">Paste Job Description</h4>
                  <p className="text-sm text-muted-foreground">
                    Copy the job posting you're applying for
                  </p>
                </div>
              </div>
              <div className="flex gap-3">
                <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                  <span className="text-sm font-bold text-primary">3</span>
                </div>
                <div>
                  <h4 className="font-medium">Get Results</h4>
                  <p className="text-sm text-muted-foreground">
                    View your score, skills match, and improvement tips
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </main>

      {/* Footer */}
      <footer className="border-t mt-auto">
        <div className="container mx-auto px-4 py-4">
          <p className="text-center text-sm text-muted-foreground">
            Applicant Tracking System — College Project
          </p>
        </div>
      </footer>
    </div>
  );
}

// Demo result generator (used when Python backend is not connected)
function generateDemoResult(jobDescription: string): ATSResult {
  // Extract potential skills from job description
  const skillPatterns = [
    'python', 'javascript', 'react', 'node', 'sql', 'mongodb', 'aws', 'docker',
    'git', 'html', 'css', 'java', 'c++', 'machine learning', 'data analysis',
    'communication', 'teamwork', 'leadership', 'problem solving', 'agile',
    'rest api', 'typescript', 'testing', 'debugging', 'project management'
  ];

  const lowerDesc = jobDescription.toLowerCase();
  const foundSkills = skillPatterns.filter((skill) => lowerDesc.includes(skill));

  // Simulate random matching
  const shuffled = [...foundSkills].sort(() => Math.random() - 0.5);
  const splitPoint = Math.floor(shuffled.length * (0.4 + Math.random() * 0.3));
  
  const matchedSkills = shuffled.slice(0, splitPoint);
  const missingSkills = shuffled.slice(splitPoint);

  // Calculate score
  const score = foundSkills.length > 0 
    ? Math.round((matchedSkills.length / foundSkills.length) * 100)
    : Math.floor(Math.random() * 40) + 40;

  return {
    score,
    status: score >= 70 ? 'Shortlisted' : 'Rejected',
    matchedSkills: matchedSkills.map(s => s.charAt(0).toUpperCase() + s.slice(1)),
    missingSkills: missingSkills.map(s => s.charAt(0).toUpperCase() + s.slice(1)),
  };
}
