
import React, { useState } from 'react';
import { useParams, Link, useLocation } from 'wouter';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import StudentLayout from '@/components/layout/StudentLayout';
import { Assignment } from '@shared/schema';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Loader2, ArrowLeft } from 'lucide-react';

export default function AssignmentView() {
  const { id } = useParams();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [, setLocation] = useLocation();
  const queryClient = useQueryClient();

  const { data: assignment, isLoading } = useQuery<Assignment>({
    queryKey: [`/api/student/assignments/${id}`],
  });

  const submitAssignment = useMutation({
    mutationFn: async () => {
      const response = await fetch(`/api/student/results`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          assignmentId: id,
          answers,
          submittedAt: new Date()
        }),
      });
      if (!response.ok) throw new Error('Failed to submit assignment');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/student/assignments/${id}`] });
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
                <textarea
                  className="w-full p-2 border rounded-md dark:bg-gray-800"
                  rows={4}
                  placeholder="Enter your answer here..."
                  value={answers[question._id || index.toString()] || ''}
                  onChange={(e) => setAnswers(prev => ({
                    ...prev,
                    [question._id || index.toString()]: e.target.value
                  }))}
                />
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
