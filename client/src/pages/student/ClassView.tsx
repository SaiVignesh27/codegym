
import React from 'react';
import { useParams } from 'wouter';
import { useQuery } from '@tanstack/react-query';
import StudentLayout from '@/components/layout/StudentLayout';
import { Class } from '@shared/schema';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Loader2, FileVideo, FileText } from 'lucide-react';

export default function ClassView() {
  const { id } = useParams();
  
  const { data: classData, isLoading } = useQuery<Class>({
    queryKey: [`/api/student/classes/${id}`],
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

  if (!classData) {
    return (
      <StudentLayout>
        <div className="text-center py-12">
          <h2 className="text-2xl font-bold mb-2">Class Not Found</h2>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            The class you're looking for doesn't exist or you don't have access to it.
          </p>
          <Button asChild>
            <a href="/student/courses">Back to Courses</a>
          </Button>
        </div>
      </StudentLayout>
    );
  }

  return (
    <StudentLayout>
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-bold">{classData.title}</h2>
          <p className="text-gray-600 dark:text-gray-400">{classData.description}</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Class Content</CardTitle>
            <CardDescription>
              {classData.content.type === 'video' ? 'Video Lecture' : 'Document Material'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {classData.content.type === 'video' ? (
              <div className="aspect-video">
                <iframe
                  src={classData.content.url}
                  className="w-full h-full"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              </div>
            ) : (
              <div className="p-4 border rounded-lg">
                <a 
                  href={classData.content.url} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="flex items-center text-primary hover:underline"
                >
                  <FileText className="h-5 w-5 mr-2" />
                  View Document
                </a>
              </div>
            )}
          </CardContent>
        </Card>

        {classData.materials && classData.materials.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Additional Materials</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {classData.materials.map((material, index) => (
                  <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                    <div>
                      <h4 className="font-medium">{material.title}</h4>
                      <p className="text-sm text-gray-500">{material.description}</p>
                    </div>
                    <Button asChild variant="outline">
                      <a href={material.url} target="_blank" rel="noopener noreferrer">
                        Download
                      </a>
                    </Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </StudentLayout>
  );
}
