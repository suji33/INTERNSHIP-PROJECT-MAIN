import { useState, useRef, useEffect } from 'react';
import { Send, Bot, User, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { getChatSuggestions } from '@/services/atsApi';
import type { ChatMessage } from '@/types/ats';
import { cn } from '@/lib/utils';

interface ChatbotProps {
  missingSkills: string[];
  matchedSkills: string[];
  score: number;
}

export function Chatbot({ missingSkills, matchedSkills, score }: ChatbotProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const hasInitialized = useRef(false);

  // Initialize with welcome message and initial suggestions
  useEffect(() => {
    if (hasInitialized.current) return;
    hasInitialized.current = true;

    const welcomeMessage: ChatMessage = {
      id: 'welcome',
      role: 'assistant',
      content: `Hello! I've analyzed your resume against the job description. Your ATS score is ${score}%. ${
        score >= 70 
          ? "Congratulations on being shortlisted!" 
          : "Let me help you improve your resume."
      }\n\nAsk me anything like:\n• "How can I improve my resume?"\n• "What skills should I add?"\n• "Tips for better matching"`,
      timestamp: new Date(),
    };

    setMessages([welcomeMessage]);
  }, [score]);

  // Auto-scroll to bottom
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: input.trim(),
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const response = await getChatSuggestions(missingSkills, matchedSkills, score);
      
      const assistantMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: response.success && response.data 
          ? response.data 
          : generateLocalResponse(input.trim(), missingSkills, matchedSkills, score),
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, assistantMessage]);
    } catch {
      // Fallback to local response if API fails
      const fallbackMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: generateLocalResponse(input.trim(), missingSkills, matchedSkills, score),
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, fallbackMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="flex flex-col h-[400px] border rounded-lg bg-card">
      {/* Header */}
      <div className="flex items-center gap-2 p-4 border-b bg-muted/50">
        <Bot className="w-5 h-5 text-primary" />
        <h3 className="font-medium">Resume Improvement Assistant</h3>
      </div>

      {/* Messages */}
      <ScrollArea className="flex-1 p-4" ref={scrollRef}>
        <div className="space-y-4">
          {messages.map((message) => (
            <div
              key={message.id}
              className={cn(
                'flex gap-3',
                message.role === 'user' ? 'justify-end' : 'justify-start'
              )}
            >
              {message.role === 'assistant' && (
                <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                  <Bot className="w-4 h-4 text-primary" />
                </div>
              )}
              <div
                className={cn(
                  'max-w-[80%] rounded-lg px-4 py-2 text-sm',
                  message.role === 'user'
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-muted'
                )}
              >
                <p className="whitespace-pre-wrap">{message.content}</p>
              </div>
              {message.role === 'user' && (
                <div className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center shrink-0">
                  <User className="w-4 h-4" />
                </div>
              )}
            </div>
          ))}
          
          {isLoading && (
            <div className="flex gap-3">
              <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                <Bot className="w-4 h-4 text-primary" />
              </div>
              <div className="bg-muted rounded-lg px-4 py-2">
                <Loader2 className="w-4 h-4 animate-spin" />
              </div>
            </div>
          )}
        </div>
      </ScrollArea>

      {/* Input */}
      <div className="p-4 border-t">
        <div className="flex gap-2">
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Ask for resume improvement tips..."
            disabled={isLoading}
            className="flex-1"
          />
          <Button 
            onClick={handleSend} 
            disabled={!input.trim() || isLoading}
            size="icon"
          >
            <Send className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}

// Local fallback response generator (rule-based)
function generateLocalResponse(
  query: string,
  missingSkills: string[],
  matchedSkills: string[],
  score: number
): string {
  const lowerQuery = query.toLowerCase();

  // Check for improvement-related queries
  if (lowerQuery.includes('improve') || lowerQuery.includes('better') || lowerQuery.includes('help')) {
    if (missingSkills.length === 0) {
      return `Your resume is well-aligned with the job description! To further improve:\n\n1. Quantify your achievements (e.g., "increased sales by 20%")\n2. Use action verbs to start bullet points\n3. Ensure consistent formatting throughout`;
    }
    
    return `Here are my suggestions to improve your resume:\n\n1. **Add Missing Skills**: Consider adding these skills to your resume:\n   ${missingSkills.slice(0, 5).map(s => `• ${s}`).join('\n   ')}\n\n2. **Highlight Existing Skills**: Make sure these matched skills are prominently displayed:\n   ${matchedSkills.slice(0, 3).map(s => `• ${s}`).join('\n   ')}\n\n3. **Use Keywords**: Mirror the exact terminology from the job description`;
  }

  // Check for skills-related queries
  if (lowerQuery.includes('skill') || lowerQuery.includes('add')) {
    if (missingSkills.length === 0) {
      return `Great news! Your resume already contains all the key skills from the job description. Consider:\n\n• Adding related certifications\n• Including relevant projects\n• Mentioning tools/technologies you've used`;
    }
    
    return `Based on the job description, you should consider adding these skills:\n\n${missingSkills.map(s => `• **${s}** - Research and practice this skill, then add relevant experience`).join('\n')}\n\nPrioritize the top 3-5 skills that are most commonly mentioned in the job description.`;
  }

  // Check for score-related queries
  if (lowerQuery.includes('score') || lowerQuery.includes('percent') || lowerQuery.includes('%')) {
    return `Your ATS score is ${score}%. ${
      score >= 70 
        ? `This is above the 70% threshold, which means you're likely to be shortlisted!\n\nTo further improve:\n• Add more relevant keywords\n• Include measurable achievements\n• Tailor your summary to the role`
        : `This is below the 70% threshold. To improve:\n\n1. Add the missing skills: ${missingSkills.slice(0, 3).join(', ')}\n2. Use exact keywords from the job posting\n3. Reorganize to highlight relevant experience first\n4. Remove irrelevant information`
    }`;
  }

  // Check for format/section queries
  if (lowerQuery.includes('format') || lowerQuery.includes('section') || lowerQuery.includes('structure')) {
    return `Here are formatting tips for a better ATS score:\n\n1. **Use Standard Sections**: Summary, Experience, Skills, Education\n2. **Simple Formatting**: Avoid tables, graphics, or complex layouts\n3. **Clear Headings**: Use standard section titles\n4. **Bullet Points**: Use simple bullets for experience\n5. **Font**: Stick to standard fonts like Arial or Calibri\n6. **File Format**: Submit as PDF unless specified otherwise`;
  }

  // Default response
  return `I can help you with:\n\n• **"How to improve my resume?"** - Get personalized suggestions\n• **"What skills should I add?"** - See missing skills analysis\n• **"Explain my score"** - Understand your ATS score\n• **"Format tips"** - Best practices for resume structure\n\nYour current score is ${score}% with ${matchedSkills.length} matched and ${missingSkills.length} missing skills.`;
}
