import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScoreDisplay } from './ScoreDisplay';
import { SkillsList } from './SkillsList';
import { Chatbot } from './Chatbot';
import type { ATSResult } from '@/types/ats';
import { BarChart3, MessageSquare } from 'lucide-react';

interface ResultsPanelProps {
  result: ATSResult;
}

export function ResultsPanel({ result }: ResultsPanelProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <BarChart3 className="w-5 h-5" />
          Analysis Results
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="results" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="results" className="flex items-center gap-2">
              <BarChart3 className="w-4 h-4" />
              Results
            </TabsTrigger>
            <TabsTrigger value="chatbot" className="flex items-center gap-2">
              <MessageSquare className="w-4 h-4" />
              Get Suggestions
            </TabsTrigger>
          </TabsList>

          <TabsContent value="results" className="mt-6 space-y-6">
            {/* Score Display */}
            <ScoreDisplay score={result.score} status={result.status} />
            
            {/* Skills Lists */}
            <SkillsList 
              matchedSkills={result.matchedSkills} 
              missingSkills={result.missingSkills} 
            />
          </TabsContent>

          <TabsContent value="chatbot" className="mt-6">
            <Chatbot
              missingSkills={result.missingSkills}
              matchedSkills={result.matchedSkills}
              score={result.score}
            />
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
