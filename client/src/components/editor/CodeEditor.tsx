import React from 'react';
import CodeMirror from '@uiw/react-codemirror';
import { javascript } from '@codemirror/lang-javascript';
import { python } from '@codemirror/lang-python';
import { java } from '@codemirror/lang-java';
import { cpp } from '@codemirror/lang-cpp';
import { Button } from '@/components/ui/button';
import { RotateCcw } from 'lucide-react';

interface CodeEditorProps {
  value: string;
  onChange: (value: string) => void;
  language?: string | number;
  placeholder?: string;
  className?: string;
  templateCode?: string;
}

export default function CodeEditor({
  value,
  onChange,
  language = 'javascript',
  placeholder = 'Write your code here...',
  className = '',
  templateCode = ''
}: CodeEditorProps) {
  const getLanguageExtension = () => {
    const lang = typeof language === 'string' ? language.toLowerCase() : language;
    
    switch (lang) {
      case 'python':
      case 71: return python();
      case 'java':
      case 62: return java();
      case 'cpp':
      case 'c':
      case 52:
      case 51: return cpp();
      default: return javascript();
    }
  };

  const getFileExtension = () => {
    const lang = typeof language === 'string' ? language.toLowerCase() : language;
    
    switch (lang) {
      case 'python':
      case 71: return 'py';
      case 'java':
      case 62: return 'java';
      case 'cpp':
      case 52: return 'cpp';
      case 'c':
      case 51: return 'c';
      default: return 'js';
    }
  };

  const handleReset = () => {
    onChange(templateCode);
  };

  return (
    <div className={`bg-white dark:bg-dark-surface rounded-lg shadow-sm border border-light-border dark:border-dark-border overflow-hidden ${className}`}>
      <div className="border border-light-border dark:border-dark-border rounded-md overflow-hidden">
        <div className="bg-gray-100 dark:bg-gray-800 px-4 py-1 text-xs font-mono border-b border-light-border dark:border-dark-border flex justify-between items-center">
          <span>code.{getFileExtension()}</span>
          {templateCode && (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleReset}
              className="h-6 px-2 text-xs"
            >
              <RotateCcw className="h-3 w-3 mr-1" />
              Reset to Template
            </Button>
          )}
        </div>

        <CodeMirror
          value={value}
          height="240px"
          theme="dark"
          extensions={[getLanguageExtension()]}
          onChange={onChange}
          placeholder={placeholder}
          basicSetup={{
            lineNumbers: true,
            foldGutter: true,
            highlightActiveLine: true
          }}
          className="text-sm"
        />
      </div>
    </div>
  );
}
