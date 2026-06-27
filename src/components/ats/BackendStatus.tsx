import { useState, useEffect } from 'react';
import { CheckCircle2, XCircle, Loader2 } from 'lucide-react';
import { checkHealth } from '@/services/atsApi';
import { cn } from '@/lib/utils';

export function BackendStatus() {
  const [status, setStatus] = useState<'checking' | 'connected' | 'disconnected'>('checking');

  useEffect(() => {
    const check = async () => {
      const isHealthy = await checkHealth();
      setStatus(isHealthy ? 'connected' : 'disconnected');
    };

    check();
    
    // Check every 30 seconds
    const interval = setInterval(check, 30000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div
      className={cn(
        'inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium',
        status === 'checking' && 'bg-muted text-muted-foreground',
        status === 'connected' && 'bg-green-500/10 text-green-600',
        status === 'disconnected' && 'bg-amber-500/10 text-amber-600'
      )}
    >
      {status === 'checking' && (
        <>
          <Loader2 className="w-3 h-3 animate-spin" />
          <span>Checking backend...</span>
        </>
      )}
      {status === 'connected' && (
        <>
          <CheckCircle2 className="w-3 h-3" />
          <span>Backend Connected</span>
        </>
      )}
      {status === 'disconnected' && (
        <>
          <XCircle className="w-3 h-3" />
          <span>Backend Offline (Demo Mode)</span>
        </>
      )}
    </div>
  );
}
