
import React from 'react';
import { useParams, Link, useLocation } from 'wouter';
import { useQuery } from '@tanstack/react-query';
import StudentLayout from '@/components/layout/StudentLayout';
import { Test, Assignment, Result } from '@shared/schema';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Loader2, ArrowLeft, CheckCircle, XCircle } from 'lucide-react';

export default function TestResults() {
  const { id } = useParams();
  const [location] = useLocation();
  const isAssignment = location.includes('assignments');
  
  const { data: resultData, isLoading } = useQuery({
    queryKey: [`/api/student/${isAssignment ? 'assignments' : 'tests'}/${id}/results`],
  });

  if (isLoading) {
    return (
      <StudentLayout>
        <div className="flex justify-center py-8">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </StudentLayout>
    );
  }

  if (!resultData) {
    return (
      <StudentLayout>
        <div className="text-center py-12">
          <h2 className="text-2xl font-bold mb-2">Results Not Found</h2>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            The results you're looking for don't exist or you don't have access to them.
          </p>
          <Button asChild>
            <Link href={isAssignment ? "/student/assignments" : "/student/tests"}>
              Back to {isAssignment ? "Assignments" : "Tests"}
            </Link>
          </Button>
        </div>
      </StudentLayout>
    );
  }

  const { test, assignment, result } = resultData;
  const item = isAssignment ? assignment : test;

  return (
    <StudentLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <Button variant="outline" asChild className="mb-4">
              <Link href={item?.courseId ? `/student/courses/${item.courseId}` : (isAssignment ? '/student/assignments' : '/student/tests')}>
                <ArrowLeft className="h-4 w-4 mr-2" /> Back to {item?.courseId ? 'Course' : (isAssignment ? 'Assignments' : 'Tests')}
              </Link>
            </Button>
            <h2 className="text-2xl font-bold">{item?.title} Results</h2>
            <p className="text-gray-600 dark:text-gray-400">{item?.description}</p>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Your Score</CardTitle>
            <CardDescription>
              You scored {result.score}% on this {isAssignment ? 'assignment' : 'test'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Progress value={result.score} className="my-2" />
            <p className="text-sm text-gray-500 mt-2">
              Completed on {new Date(result.submittedAt).toLocaleDateString()}
            </p>
          </CardContent>
        </Card>

        <div className="space-y-6">
          {item?.questions?.map((question, index) => {
            const answer = result.answers.find(a => a.questionId === (question._id || index.toString()));
            const isCorrect = answer?.isCorrect;

            return (
              <Card key={index}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">Question {index + 1}</CardTitle>
                    {isCorrect ? (
                      <CheckCircle className="h-5 w-5 text-green-500" />
                    ) : (
                      <XCircle className="h-5 w-5 text-red-500" />
                    )}
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="mb-4">{question.text}</p>
                  {question.options ? (
                    <div className="space-y-2">
                      {question.options.map((option, optIndex) => (
                        <div
                          key={optIndex}
                          className={`p-2 rounded ${
                            option === question.correctAnswer
                              ? 'bg-green-100 dark:bg-green-900'
                              : option === answer?.answer
                              ? 'bg-red-100 dark:bg-red-900'
                              : 'bg-gray-100 dark:bg-gray-800'
                          }`}
                        >
                          {option}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="p-4 bg-gray-100 dark:bg-gray-800 rounded">
                      <p className="font-medium mb-2">Your Answer:</p>
                      <p>{answer?.answer || 'No answer provided'}</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </StudentLayout>
  );
}
