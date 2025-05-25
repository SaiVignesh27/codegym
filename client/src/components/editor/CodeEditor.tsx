import React, { useState } from 'react';
import { apiRequest } from '@/lib/queryClient';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { CodeExecutionResult } from '@shared/types';

// Language options for the code editor
const LANGUAGES = [
  { id: 63, name: 'JavaScript (Node.js v14.16.0)' },
  { id: 71, name: 'Python (3.9.0)' },
  { id: 62, name: 'Java (JDK 14.0.1)' },
  { id: 52, name: 'C++ (GCC 9.2.0)' },
  { id: 51, name: 'C (GCC 9.2.0)' },
];

interface CodeEditorProps {
  initialCode?: string;
  language?: number;
  readOnly?: boolean;
  question?: string;
  description?: string;
  onSubmit?: (code: string, languageId: number, result: CodeExecutionResult) => void;
}

export default function CodeEditor({
  initialCode = '',
  language = 63, // Default to JavaScript
  readOnly = false,
  question,
  description,
  onSubmit
}: CodeEditorProps) {
  const [code, setCode] = useState(initialCode);
  const [selectedLanguage, setSelectedLanguage] = useState(language);
  const [output, setOutput] = useState<string>('');
  const [isRunning, setIsRunning] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [runResult, setRunResult] = useState<CodeExecutionResult | null>(null);

  // Handler for language change
  const handleLanguageChange = (value: string) => {
    setSelectedLanguage(Number(value));
  };

  // Handler for code execution
  const handleRunCode = async () => {
    try {
      setIsRunning(true);
      setOutput('Running code...');
      
      const response = await apiRequest('POST', '/api/code/execute', {
        source_code: code,
        language_id: selectedLanguage
      });
      
      const result: CodeExecutionResult = await response.json();
      setRunResult(result);
      
      let outputText = '';
      
      if (result.status.id === 3) { // Accepted status
        outputText = result.stdout || 'Code executed successfully with no output.';
      } else if (result.status.id === 6) { // Compilation error
        outputText = `Compilation Error: ${result.compile_output || 'Unknown error'}`;
      } else if (result.stderr) {
        outputText = `Error: ${result.stderr}`;
      } else if (result.message) {
        outputText = `Error: ${result.message}`;
      } else {
        outputText = `Status: ${result.status.description}`;
      }
      
      setOutput(outputText);
    } catch (error) {
      setOutput(`Error executing code: ${(error as Error).message}`);
    } finally {
      setIsRunning(false);
    }
  };

  // Handler for code submission
  const handleSubmit = async () => {
    if (!onSubmit) return;
    
    try {
      setIsSubmitting(true);
      
      const response = await apiRequest('POST', '/api/code/execute', {
        source_code: code,
        language_id: selectedLanguage
      });
      
      const result: CodeExecutionResult = await response.json();
      onSubmit(code, selectedLanguage, result);
    } catch (error) {
      setOutput(`Error submitting code: ${(error as Error).message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Reset the code to initial value
  const handleReset = () => {
    setCode(initialCode);
  };

  return (
    <div className="bg-white dark:bg-dark-surface rounded-lg shadow-sm border border-light-border dark:border-dark-border overflow-hidden">
      {(question || description) && (
        <div className="border-b border-light-border dark:border-dark-border p-4">
          {question && <h3 className="text-lg font-semibold text-gray-800 dark:text-white">{question}</h3>}
          {description && <p className="text-sm text-gray-600 dark:text-gray-400">{description}</p>}
        </div>
      )}
      
      <div className="p-4">
        {/* Question description if provided */}
        {question && !description && (
          <div className="bg-gray-50 dark:bg-dark-border p-4 rounded-md mb-4">
            <h4 className="font-medium text-gray-800 dark:text-white mb-2">Question: {question}</h4>
          </div>
        )}
        
        <div className="mb-4">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center space-x-2">
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Language:</span>
              <Select 
                value={selectedLanguage.toString()} 
                onValueChange={handleLanguageChange}
                disabled={readOnly}
              >
                <SelectTrigger className="w-[180px] text-sm">
                  <SelectValue placeholder="Select language" />
                </SelectTrigger>
                <SelectContent>
                  {LANGUAGES.map(lang => (
                    <SelectItem key={lang.id} value={lang.id.toString()}>
                      {lang.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Button
                variant="default"
                size="sm"
                onClick={handleRunCode}
                disabled={isRunning || readOnly}
                className="mr-2"
              >
                {isRunning ? <Loader2 className="h-4 w-4 animate-spin mr-1" /> : 'Run'}
              </Button>
              
              <Button
                variant="outline"
                size="sm"
                onClick={handleReset}
                disabled={readOnly}
              >
                Reset
              </Button>
            </div>
          </div>
          
          {/* Code Editor */}
          <div className="border border-light-border dark:border-dark-border rounded-md overflow-hidden">
            <div className="bg-gray-100 dark:bg-gray-800 px-4 py-1 text-xs font-mono border-b border-light-border dark:border-dark-border flex justify-between">
              <span>code.{
                selectedLanguage === 63 ? 'js' :
                selectedLanguage === 71 ? 'py' :
                selectedLanguage === 62 ? 'java' :
                selectedLanguage === 52 || selectedLanguage === 51 ? 'c' : 'txt'
              }</span>
              <span className="text-gray-500">Judge0 API integration</span>
            </div>
            
            <textarea
              className="code-editor w-full bg-gray-50 dark:bg-dark-surface font-mono text-sm p-4 h-60 resize-none focus:outline-none text-gray-800 dark:text-gray-200"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              disabled={readOnly}
              spellCheck={false}
            />
          </div>
        </div>
        
        {/* Output section */}
        {(output || isRunning) && (
          <div className="mt-6">
            <h4 className="font-medium text-gray-800 dark:text-white mb-2">Output:</h4>
            <div className="bg-gray-900 text-gray-200 p-4 rounded-md font-mono text-sm h-32 overflow-y-auto">
              <pre>{output}</pre>
            </div>
          </div>
        )}
        
        {/* Submit button */}
        {onSubmit && (
          <div className="mt-6 flex justify-end">
            <Button
              onClick={handleSubmit}
              disabled={isSubmitting || readOnly}
            >
              {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
              Submit Answer
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
