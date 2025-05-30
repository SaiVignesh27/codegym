import React, { useState, useEffect } from 'react';
import { useParams, useLocation, Link } from 'wouter';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import StudentLayout from '@/components/layout/StudentLayout';
import { Test, Result, Question } from '@shared/schema';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Loader2, ArrowLeft, Timer, AlertTriangle } from 'lucide-react';
import { useAuth } from '@/providers/AuthProvider';
import { apiRequest } from '@/lib/queryClient';
import CodeEditor from '@/components/editor/CodeEditor';

export default function TestView() {
  const { id } = useParams();
  const [, setLocation] = useLocation();
  const { user } = useAuth();
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [timeLeft, setTimeLeft] = useState<number | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const queryClient = useQueryClient();
  const [isTestSubmitted, setIsTestSubmitted] = useState(false);
  const { data: test, isLoading } = useQuery<Test>({
    queryKey: [`/api/student/tests/${id}`],
  });

  // Fetch the student's result for this test
  const { data: resultData, isLoading: isResultLoading } = useQuery<{ result: Result }>({
    queryKey: [`/api/student/tests/${id}/results`],
    retry: false,
  });

  const submitTest = useMutation({
    mutationFn: async () => {
      if (!test || !user) throw new Error('Test or user not found');

      // Calculate score with improved answer checking
      const questionResults = test.questions.map((question, index) => {
        const studentAnswer = answers[question._id || index.toString()];
        const correctAnswer = question.correctAnswer;
        
        // Get the index of the selected option
        const selectedOptionIndex = question.options?.findIndex(opt => opt === studentAnswer) ?? -1;
        const correctAnswerIndex = parseInt(correctAnswer.toString());
        
        // Check if the answer is correct
        const isCorrect = selectedOptionIndex === correctAnswerIndex;
        const feedback = isCorrect 
          ? 'Correct answer' 
          : `Incorrect. Correct answer: ${question.options?.[correctAnswerIndex] || correctAnswer}`;

        const points = isCorrect ? (question.points || 1) : 0;
        
        return {
          questionId: question._id || index.toString(),
          answer: studentAnswer,
          isCorrect,
          points,
          feedback,
          correctAnswer: question.options?.[correctAnswerIndex] || correctAnswer
        };
      });

      const totalPoints = questionResults.reduce((sum, q) => sum + q.points, 0);
      const maxPoints = test.questions.reduce((sum, q) => sum + (q.points || 1), 0);
      const scorePercentage = Math.round((totalPoints / maxPoints) * 100);

      // Create result object
      const result: Partial<Result> = {
        studentId: user._id,
        courseId: test.courseId,
        testId: id,
        type: 'test',
        answers: questionResults,
        status: 'completed',
        score: scorePercentage,
        maxScore: maxPoints,
        submittedAt: new Date(),
        studentName: user.name,
        title: test.title,
        timeSpent: test.timeLimit ? (test.timeLimit * 60 - timeLeft!) : undefined
      };

      return apiRequest('POST', '/api/student/results', result);
    },
    onSuccess: () => {
      setIsTestSubmitted(true);
      queryClient.invalidateQueries({ queryKey: [`/api/student/tests/${id}`] });
      queryClient.invalidateQueries({ queryKey: [`/api/student/tests/${id}/results`] });
      queryClient.invalidateQueries({ queryKey: ['/api/student/course-progress'] });
      queryClient.invalidateQueries({ queryKey: [`/api/student/tests`] });
      if (test?.courseId) {
        queryClient.invalidateQueries({ queryKey: [`/api/student/tests?courseId=${test.courseId}`] });
      }
    },
  });

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      await submitTest.mutateAsync();
    } catch (error) {
      console.error('Failed to submit test:', error);
    }
    setIsSubmitting(false);
  };

  // If result exists, redirect to results page
  React.useEffect(() => {
    if (resultData?.result) {
      setLocation(`/student/tests/${id}/results`);
    }
  }, [resultData, id, setLocation]);

  // Start timer when test loads
  React.useEffect(() => {
    if (test?.timeLimit) {
      setTimeLeft(test.timeLimit * 60); // Convert to seconds
    }
  }, [test]);

  // Timer countdown
  React.useEffect(() => {
    if (timeLeft === null) return;
    if (timeLeft <= 0) {
      handleSubmit();
      return;
    }

    const timer = setInterval(() => {
      setTimeLeft((prev) => (prev !== null ? prev - 1 : null));
    }, 1000);

    return () => clearInterval(timer);
  }, [timeLeft, handleSubmit]);

  // Initialize answers with template code when test loads
  React.useEffect(() => {
    if (test?.questions) {
      const initialAnswers: Record<string, string> = {};
      test.questions.forEach((question, index) => {
        if (question.type === 'code') {
          initialAnswers[index] = question.codeTemplate || '';
        }
      });
      setAnswers(initialAnswers);
    }
  }, [test]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // Render question based on type
  const renderQuestion = (question: Question, index: number) => {
    switch (question.type) {
      case 'mcq':
        return (
          <RadioGroup
            value={answers[index] || ''}
            onValueChange={(value) => handleAnswerChange(index, value)}
            className="space-y-2"
          >
            {question.options?.map((option: string, optionIndex: number) => (
              <div key={optionIndex} className="flex items-center space-x-2">
                <RadioGroupItem value={option} id={`q${index}-o${optionIndex}`} />
                <Label htmlFor={`q${index}-o${optionIndex}`}>{option}</Label>
              </div>
            ))}
          </RadioGroup>
        );
      case 'fill':
        return (
          <textarea
            value={answers[index] || ''}
            onChange={(e) => handleAnswerChange(index, e.target.value)}
            className="w-full min-h-[100px] p-2 border rounded"
            placeholder="Type your answer here..."
          />
        );
      case 'code':
        return (
          <div className="space-y-4">
            <CodeEditor
              value={answers[index] || ''}
              onChange={(value) => handleAnswerChange(index, value)}
              language="javascript"
              placeholder="Write your code here..."
              className="min-h-[200px]"
              templateCode={question.codeTemplate || ''}
            />
          </div>
        );
      default:
        return null;
    }
  };

  const handleAnswerChange = (index: number, value: string) => {
    setAnswers(prev => ({
      ...prev,
      [index]: value
    }));
  };

  React.useEffect(() => {
    if (isTestSubmitted) {
      setLocation(`/student/tests/${id}/results`);
    }
  }, [isTestSubmitted, id, setLocation]);

  if (isLoading) {
    return (
      <StudentLayout>
        <div className="flex justify-center py-8">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </StudentLayout>
    );
  }

  if (!test) {
    return (
      <StudentLayout>
        <div className="text-center py-12">
          <h2 className="text-2xl font-bold mb-2">Test Not Found</h2>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            The test you're looking for doesn't exist or you don't have access to it.
          </p>
          <Button asChild>
            <Link href="/student/daily-tests">Back to Tests</Link>
          </Button>
        </div>
      </StudentLayout>
    );
  }

  return (
    <StudentLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <Button variant="outline" asChild className="mb-4">
              <Link href="/student/daily-tests">
                <ArrowLeft className="h-4 w-4 mr-2" /> Back to Tests
              </Link>
            </Button>
            <h2 className="text-2xl font-bold">{test.title}</h2>
            <p className="text-gray-600 dark:text-gray-400">{test.description}</p>
          </div>
          {timeLeft !== null && (
            <div className="flex items-center gap-2 text-lg font-semibold">
              <Timer className="h-5 w-5 text-primary" />
              <span>{formatTime(timeLeft)}</span>
            </div>
          )}
        </div>

        {timeLeft !== null && timeLeft < 300 && (
          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertTitle>Time is running out!</AlertTitle>
            <AlertDescription>
              You have less than 5 minutes remaining to complete this test.
            </AlertDescription>
          </Alert>
        )}

        <div className="space-y-6">
          {test.questions?.map((question, index) => (
            <Card key={index}>
              <CardHeader>
                <CardTitle className="text-lg">Question {index + 1}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="mb-4">{question.text}</p>
                {renderQuestion(question, index)}
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="flex justify-end">
          <Button
            onClick={handleSubmit}
            disabled={isSubmitting}
          >
            {isSubmitting && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
            Submit Test
          </Button>
        </div>
      </div>
    </StudentLayout>
  );
}
