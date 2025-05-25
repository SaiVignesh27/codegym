
import React, { useState } from 'react';
import { useParams, Link } from 'wouter';
import { useQuery } from '@tanstack/react-query';
import StudentLayout from '@/components/layout/StudentLayout';
import { Test } from '@shared/schema';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Loader2, ArrowLeft, Timer } from 'lucide-react';

export default function TestView() {
  const { id } = useParams();
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const { data: test, isLoading } = useQuery<Test>({
    queryKey: [`/api/student/tests/${id}`],
  });

  const handleSubmit = async () => {
    setIsSubmitting(true);
    // Implement test submission logic here
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
            <Link href="/student/courses">Back to Courses</Link>
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
              <Link href={`/student/courses/${test.courseId}`}>
                <ArrowLeft className="h-4 w-4 mr-2" /> Back to Course
              </Link>
            </Button>
            <h2 className="text-2xl font-bold">{test.title}</h2>
            <p className="text-gray-600 dark:text-gray-400">{test.description}</p>
          </div>
          <div className="flex items-center gap-2">
            <Timer className="h-5 w-5 text-primary" />
            <span>Time remaining: {test.timeLimit} minutes</span>
          </div>
        </div>

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
