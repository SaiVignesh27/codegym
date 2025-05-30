import React, { useState, useEffect } from 'react';
import { useParams, Link, useLocation } from 'wouter';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import StudentLayout from '@/components/layout/StudentLayout';
import { Assignment, Result, Question } from '@shared/schema';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Loader2, ArrowLeft } from 'lucide-react';
import { apiRequest } from '@/lib/queryClient';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertTriangle } from 'lucide-react';
import { useAuth } from '@/providers/AuthProvider';
import CodeEditor from '@/components/editor/CodeEditor';

export default function AssignmentView() {
  const { id } = useParams();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [, setLocation] = useLocation();
  const queryClient = useQueryClient();

  // Define handleAnswerChange at the top of the component
  const handleAnswerChange = (index: number, value: string) => {
    setAnswers(prev => ({
      ...prev,
      [index]: value
    }));
  };

  const { data: assignment, isLoading } = useQuery<Assignment>({
    queryKey: [`/api/student/assignments/${id}`],
  });

  const submitAssignment = useMutation({
    mutationFn: async () => {
      if (!assignment) throw new Error('Assignment not found');

      // Calculate score
      const questionResults = assignment.questions.map((question, index) => {
        const answer = answers[question._id || index.toString()];
        let isCorrect = false;

        if (question.type === 'code') {
          // For code questions, normalize both answers by removing extra whitespace
          const normalizedAnswer = answer?.replace(/\s+/g, ' ').trim();
          const normalizedCorrectAnswer = typeof question.correctAnswer === 'string' 
            ? question.correctAnswer.replace(/\s+/g, ' ').trim()
            : '';
          isCorrect = normalizedAnswer === normalizedCorrectAnswer;
        } else {
          isCorrect = answer === question.correctAnswer;
        }

        const points = isCorrect ? (question.points || 1) : 0;
        return {
          questionId: question._id || index.toString(),
          answer,
          isCorrect,
          points,
        };
      });

      const totalPoints = questionResults.reduce((sum, q) => sum + q.points, 0);
      const maxPoints = assignment.questions.reduce((sum, q) => sum + (q.points || 1), 0);
      const scorePercentage = (totalPoints / maxPoints) * 100;

      const result = { 
        assignmentId: id,
        courseId: assignment.courseId,
        type: 'assignment',
        answers: questionResults,
        score: scorePercentage,
        maxScore: maxPoints,
        submittedAt: new Date(),
        title: assignment.title
      };

      return apiRequest('POST', '/api/student/results', result);
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: [`/api/student/assignments/${id}`] });
      queryClient.setQueryData([`/api/student/assignments/${id}/results`], {
        assignment,
        result: data
      });
      setLocation(`/student/assignments/${id}/results`);
    },
  });

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      await submitAssignment.mutateAsync();
    } catch (error) {
      console.error('Failed to submit assignment:', error);
    }
    setIsSubmitting(false);
  };

  // Initialize answers with template code when assignment loads
  useEffect(() => {
    if (assignment?.questions) {
      const initialAnswers: Record<string, string> = {};
      assignment.questions.forEach((question, index) => {
        if (question.type === 'code') {
          initialAnswers[index] = question.codeTemplate || '';
        }
      });
      setAnswers(initialAnswers);
    }
  }, [assignment]);

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
              language="java"
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

  if (isLoading) {
    return (
      <StudentLayout>
        <div className="flex justify-center py-8">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </StudentLayout>
    );
  }

  if (!assignment) {
    return (
      <StudentLayout>
        <div className="text-center py-12">
          <h2 className="text-2xl font-bold mb-2">Assignment Not Found</h2>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            The assignment you're looking for doesn't exist or you don't have access to it.
          </p>
          <Button asChild>
            <Link href="/student/assignments">Back to Assignments</Link>
          </Button>
        </div>
      </StudentLayout>
    );
  }

  return (
    <StudentLayout>
      <div className="space-y-6">
        <div>
          <Button variant="outline" asChild className="mb-4">
            <Link href="/student/assignments">
              <ArrowLeft className="h-4 w-4 mr-2" /> Back to Assignments
            </Link>
          </Button>
          <h2 className="text-2xl font-bold">{assignment.title}</h2>
          <p className="text-gray-600 dark:text-gray-400">{assignment.description}</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Assignment Questions</CardTitle>
          </CardHeader>
          <CardContent>
            {assignment.questions?.map((question, index) => (
              <div key={index} className="mb-6">
                <h3 className="font-medium mb-2">Question {index + 1}</h3>
                <p className="mb-4">{question.text}</p>
                {renderQuestion(question, index)}
              </div>
            ))}
            <div className="flex justify-end mt-6">
              <Button
                onClick={handleSubmit}
                disabled={isSubmitting}
              >
                {isSubmitting && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                Submit Assignment
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </StudentLayout>
  );
}
