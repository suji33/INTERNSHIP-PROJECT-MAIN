import { useState, useRef, useCallback } from 'react';
import { Upload, FileText, X, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface FileUploadProps {
  onFileSelect: (file: File | null) => void;
  selectedFile: File | null;
  disabled?: boolean;
}

const ALLOWED_TYPES = [
  'application/pdf',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
];
const MAX_SIZE = 5 * 1024 * 1024; // 5MB

export function FileUpload({ onFileSelect, selectedFile, disabled }: FileUploadProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const validateFile = useCallback((file: File): boolean => {
    setError(null);
    
    if (!ALLOWED_TYPES.includes(file.type)) {
      setError('Please upload a PDF or DOCX file only');
      return false;
    }
    
    if (file.size > MAX_SIZE) {
      setError('File size must be less than 5MB');
      return false;
    }
    
    return true;
  }, []);

  const handleFile = useCallback((file: File) => {
    if (validateFile(file)) {
      onFileSelect(file);
    }
  }, [validateFile, onFileSelect]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    if (disabled) return;
    
    const file = e.dataTransfer.files[0];
    if (file) {
      handleFile(file);
    }
  }, [disabled, handleFile]);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    if (!disabled) {
      setIsDragging(true);
    }
  }, [disabled]);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFile(file);
    }
  }, [handleFile]);

  const handleRemove = useCallback(() => {
    onFileSelect(null);
    setError(null);
    if (inputRef.current) {
      inputRef.current.value = '';
    }
  }, [onFileSelect]);

  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  return (
    <div className="space-y-3">
      <label className="text-sm font-medium text-foreground">
        Upload Resume (PDF or DOCX)
      </label>
      
      {!selectedFile ? (
        <div
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          className={cn(
            'relative border-2 border-dashed rounded-lg p-8 text-center transition-colors cursor-pointer',
            isDragging 
              ? 'border-primary bg-primary/5' 
              : 'border-muted-foreground/25 hover:border-primary/50',
            disabled && 'opacity-50 cursor-not-allowed'
          )}
          onClick={() => !disabled && inputRef.current?.click()}
        >
          <input
            ref={inputRef}
            type="file"
            accept=".pdf,.docx"
            onChange={handleInputChange}
            className="hidden"
            disabled={disabled}
          />
          
          <Upload className="w-10 h-10 mx-auto mb-3 text-muted-foreground" />
          <p className="text-sm text-muted-foreground mb-1">
            Drag and drop your resume here, or{' '}
            <span className="text-primary font-medium">browse</span>
          </p>
          <p className="text-xs text-muted-foreground/70">
            Supports PDF and DOCX (max 5MB)
          </p>
        </div>
      ) : (
        <div className="flex items-center gap-3 p-4 bg-muted/50 rounded-lg border">
          <FileText className="w-8 h-8 text-primary shrink-0" />
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium truncate">{selectedFile.name}</p>
            <p className="text-xs text-muted-foreground">
              {formatFileSize(selectedFile.size)}
            </p>
          </div>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={handleRemove}
            disabled={disabled}
            className="shrink-0"
          >
            <X className="w-4 h-4" />
          </Button>
        </div>
      )}
      
      {error && (
        <div className="flex items-center gap-2 text-destructive text-sm">
          <AlertCircle className="w-4 h-4" />
          <span>{error}</span>
        </div>
      )}
    </div>
  );
}
