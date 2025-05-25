
import React, { useState } from 'react';
import { useParams, Link } from 'wouter';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import StudentLayout from '@/components/layout/StudentLayout';
import { Test } from '@shared/schema';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Loader2, ArrowLeft, Timer, AlertTriangle } from 'lucide-react';

export default function TestView() {
  const { id } = useParams();
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [timeLeft, setTimeLeft] = useState<number | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const queryClient = useQueryClient();

  const { data: test, isLoading } = useQuery<Test>({
    queryKey: [`/api/student/tests/${id}`],
  });

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
      setTimeLeft(prev => prev !== null ? prev - 1 : null);
    }, 1000);

    return () => clearInterval(timer);
  }, [timeLeft]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const submitTest = useMutation({
    mutationFn: async () => {
      const response = await fetch(`/api/student/results`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          testId: id,
          answers,
          submittedAt: new Date()
        }),
      });
      if (!response.ok) throw new Error('Failed to submit test');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/student/tests/${id}`] });
      setLocation(`/student/tests/${id}/results`);
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
          <Alert variant="warning">
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
                <RadioGroup
                  value={answers[question._id || index.toString()]}
                  onValueChange={(value) =>
                    setAnswers(prev => ({
                      ...prev,
                      [question._id || index.toString()]: value
                    }))
                  }
                >
                  {question.options?.map((option, optIndex) => (
                    <div key={optIndex} className="flex items-center space-x-2">
                      <RadioGroupItem
                        value={option}
                        id={`q${index}-opt${optIndex}`}
                      />
                      <Label htmlFor={`q${index}-opt${optIndex}`}>{option}</Label>
                    </div>
                  ))}
                </RadioGroup>
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
