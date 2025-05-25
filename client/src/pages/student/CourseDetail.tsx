import React, { useState } from 'react';
import { useParams } from 'wouter';
import { useQuery } from '@tanstack/react-query';
import StudentLayout from '@/components/layout/StudentLayout';
import { Course, Class, Test, Assignment } from '@shared/schema';
import { apiRequest } from '@/lib/queryClient';

import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { 
  FileVideo, 
  FileQuestion, 
  ClipboardList, 
  Clock, 
  Award,
  BookOpen,
  CalendarDays,
  CheckCircle,
  XCircle,
  AlertCircle,
  Loader2,
  ArrowRight
} from 'lucide-react';

export default function CourseDetail() {
  const { id } = useParams();
  const [activeTab, setActiveTab] = useState('overview');
  
  // Fetch course details
  const { data: course, isLoading: isLoadingCourse } = useQuery<Course>({
    queryKey: [`/api/student/courses/${id}`],
  });
  
  // Fetch course classes
  const { data: classes, isLoading: isLoadingClasses } = useQuery<Class[]>({
    queryKey: [`/api/student/classes?courseId=${id}`],
  });
  
  // Fetch course tests
  const { data: tests, isLoading: isLoadingTests } = useQuery<any[]>({
    queryKey: [`/api/student/tests?courseId=${id}`],
  });
  
  // Fetch course assignments
  const { data: assignments, isLoading: isLoadingAssignments } = useQuery<any[]>({
    queryKey: [`/api/student/assignments?courseId=${id}`],
  });
  
  const isLoading = isLoadingCourse || isLoadingClasses || isLoadingTests || isLoadingAssignments;
  
  // Get status badge color
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300';
      case 'in-progress':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300';
      case 'overdue':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300';
    }
  };
  
  // Format date to readable string
  const formatDate = (date: Date | string) => {
    if (!date) return '';
    const d = new Date(date);
    return d.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
  };
  
  // Get time left string
  const getTimeLeft = (dueDate: Date | string) => {
    if (!dueDate) return '';
    const now = new Date();
    const due = new Date(dueDate);
    const diffTime = due.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays < 0) return 'Overdue';
    if (diffDays === 0) return 'Due today';
    if (diffDays === 1) return 'Due tomorrow';
    return `${diffDays} days left`;
  };
  
  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'in-progress':
        return <Clock className="h-4 w-4 text-blue-500" />;
      case 'pending':
        return <AlertCircle className="h-4 w-4 text-yellow-500" />;
      case 'overdue':
        return <XCircle className="h-4 w-4 text-red-500" />;
      default:
        return null;
    }
  };
  
  if (isLoading) {
    return (
      <StudentLayout>
        <div className="flex items-center justify-center min-h-[50vh]">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <span className="ml-2">Loading course...</span>
        </div>
      </StudentLayout>
    );
  }
  
  if (!course) {
    return (
      <StudentLayout>
        <div className="text-center py-12">
          <h2 className="text-2xl font-bold mb-2">Course Not Found</h2>
          <p className="text-gray-600 dark:text-gray-400 mb-6">The course you're looking for doesn't exist or you don't have access to it.</p>
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
        {/* Course Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Badge variant="secondary">
                {course.category || 'General'}
              </Badge>
              <Badge className="bg-primary-light text-white">
                {course.level || 'Beginner'}
              </Badge>
            </div>
            <h1 className="text-2xl md:text-3xl font-bold">{course.title}</h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">{course.description}</p>
          </div>
          <div className="flex gap-2">
            <Button asChild variant="outline">
              <a href="/student/courses">
                Back to Courses
              </a>
            </Button>
          </div>
        </div>
        
        {/* Course Content Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="w-full md:w-auto">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="classes">Classes</TabsTrigger>
            <TabsTrigger value="tests">Tests</TabsTrigger>
            <TabsTrigger value="assignments">Assignments</TabsTrigger>
          </TabsList>
          
          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Course Info Card */}
              <Card className="md:col-span-2">
                <CardHeader>
                  <CardTitle>About this Course</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <h3 className="font-medium mb-2">Description</h3>
                    <p className="text-gray-600 dark:text-gray-400">{course.description}</p>
                  </div>
                  
                  <Separator />
                  
                  <div>
                    <h3 className="font-medium mb-2">What You'll Learn</h3>
                    <ul className="list-disc list-inside text-gray-600 dark:text-gray-400 space-y-1">
                      {course.learningObjectives?.map((objective, idx) => (
                        <li key={idx}>{objective}</li>
                      )) || (
                        <>
                          <li>Build and deploy web applications</li>
                          <li>Learn coding best practices</li>
                          <li>Understand programming concepts</li>
                        </>
                      )}
                    </ul>
                  </div>
                  
                  <Separator />
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <h3 className="font-medium mb-2">Course Details</h3>
                      <div className="space-y-2 text-sm">
                        <div className="flex items-center">
                          <FileVideo className="h-4 w-4 mr-2 text-gray-500 dark:text-gray-400" />
                          <span>{classes?.length || 0} Classes</span>
                        </div>
                        <div className="flex items-center">
                          <FileQuestion className="h-4 w-4 mr-2 text-gray-500 dark:text-gray-400" />
                          <span>{tests?.length || 0} Tests</span>
                        </div>
                        <div className="flex items-center">
                          <ClipboardList className="h-4 w-4 mr-2 text-gray-500 dark:text-gray-400" />
                          <span>{assignments?.length || 0} Assignments</span>
                        </div>
                        <div className="flex items-center">
                          <Clock className="h-4 w-4 mr-2 text-gray-500 dark:text-gray-400" />
                          <span>{course.duration || '4 weeks'} Duration</span>
                        </div>
                      </div>
                    </div>
                    
                    <div>
                      <h3 className="font-medium mb-2">Instructor</h3>
                      <div className="flex items-center">
                        <Avatar className="h-10 w-10 mr-3">
                          <AvatarFallback className="bg-primary-light text-white">
                            JD
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-medium">John Doe</p>
                          <p className="text-sm text-gray-500 dark:text-gray-400">Lead Instructor</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              {/* Progress Card */}
              <Card>
                <CardHeader>
                  <CardTitle>Your Progress</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span>Overall Completion</span>
                      <span className="font-medium">68%</span>
                    </div>
                    <Progress value={68} className="h-2" />
                  </div>
                  
                  <div className="grid grid-cols-1 gap-3 mt-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <div className="bg-primary/10 p-2 rounded-full mr-3">
                          <FileVideo className="h-4 w-4 text-primary" />
                        </div>
                        <span>Classes</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant="outline">
                          3/5 completed
                        </Badge>
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <div className="bg-secondary/10 p-2 rounded-full mr-3">
                          <FileQuestion className="h-4 w-4 text-secondary" />
                        </div>
                        <span>Tests</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant="outline">
                          2/3 completed
                        </Badge>
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <div className="bg-yellow-500/10 p-2 rounded-full mr-3">
                          <ClipboardList className="h-4 w-4 text-yellow-500" />
                        </div>
                        <span>Assignments</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant="outline">
                          2/4 completed
                        </Badge>
                      </div>
                    </div>
                  </div>
                </CardContent>
                <CardFooter>
                  <Button className="w-full" onClick={() => setActiveTab('classes')}>
                    Continue Learning
                  </Button>
                </CardFooter>
              </Card>
            </div>
          </TabsContent>
          
          {/* Classes Tab */}
          <TabsContent value="classes" className="space-y-4">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold">Course Classes</h2>
            </div>
            
            {isLoadingClasses ? (
              <div className="flex justify-center py-8">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : classes && classes.length > 0 ? (
              <div className="space-y-4">
                {classes.map((classItem, index) => (
                  <Card key={classItem._id} className="overflow-hidden">
                    <div className="p-6 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                      <div className="flex items-start md:items-center gap-4">
                        <div className="bg-primary-light/10 p-3 rounded-full">
                          <FileVideo className="h-6 w-6 text-primary-light" />
                        </div>
                        <div>
                          <h3 className="text-lg font-medium mb-1">{classItem.title}</h3>
                          <p className="text-sm text-gray-500 dark:text-gray-400">{classItem.description}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3 ml-auto">
                        <Badge className={getStatusColor('completed')}>
                          {getStatusIcon('completed')}
                          <span className="ml-1">Completed</span>
                        </Badge>
                        <div className="flex gap-2">
                          {classItem.content?.downloadable && (
                            <Button variant="outline" size="sm" asChild>
                              <a href={classItem.content.url} download target="_blank" rel="noopener noreferrer">
                                Download
                              </a>
                            </Button>
                          )}
                          <Button size="sm" asChild>
                            <a href={`/student/classes/${classItem._id}`}>
                              View Class <ArrowRight className="ml-2 h-4 w-4" />
                            </a>
                          </Button>
                        </div>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="text-center py-12 border rounded-md">
                <FileVideo className="h-12 w-12 mx-auto mb-4 text-gray-300 dark:text-gray-600" />
                <h3 className="text-lg font-medium mb-1">No Classes Available</h3>
                <p className="text-gray-500 dark:text-gray-400">This course doesn't have any classes yet.</p>
              </div>
            )}
          </TabsContent>
          
          {/* Tests Tab */}
          <TabsContent value="tests" className="space-y-4">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold">Course Tests</h2>
            </div>
            
            {isLoadingTests ? (
              <div className="flex justify-center py-8">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : tests && tests.length > 0 ? (
              <div className="space-y-4">
                {tests.map((test) => (
                  <Card key={test._id} className="overflow-hidden">
                    <div className="p-6 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                      <div className="flex items-start md:items-center gap-4">
                        <div className="bg-secondary/10 p-3 rounded-full">
                          <FileQuestion className="h-6 w-6 text-secondary" />
                        </div>
                        <div>
                          <h3 className="text-lg font-medium mb-1">{test.title}</h3>
                          <div className="flex flex-wrap gap-3 text-sm text-gray-500 dark:text-gray-400">
                            <span className="flex items-center">
                              <Award className="h-4 w-4 mr-1" />
                              {test.points} points
                            </span>
                            <span className="flex items-center">
                              <FileQuestion className="h-4 w-4 mr-1" />
                              {test.questions?.length || 0} questions
                            </span>
                            {test.timeLimit && (
                              <span className="flex items-center">
                                <Clock className="h-4 w-4 mr-1" />
                                {test.timeLimit} min
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-3 ml-auto">
                        <Badge className={getStatusColor(test.status)}>
                          {getStatusIcon(test.status)}
                          <span className="ml-1">{test.status === 'completed' ? 'Completed' : 'Take Test'}</span>
                        </Badge>
                        <Button asChild size="sm">
                          <a href={`/student/tests/${test._id}`}>
                            {test.status === 'completed' ? 'View Results' : 'Start Test'}
                          </a>
                        </Button>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="text-center py-12 border rounded-md">
                <FileQuestion className="h-12 w-12 mx-auto mb-4 text-gray-300 dark:text-gray-600" />
                <h3 className="text-lg font-medium mb-1">No Tests Available</h3>
                <p className="text-gray-500 dark:text-gray-400">This course doesn't have any tests yet.</p>
              </div>
            )}
          </TabsContent>
          
          {/* Assignments Tab */}
          <TabsContent value="assignments" className="space-y-4">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold">Course Assignments</h2>
            </div>
            
            {isLoadingAssignments ? (
              <div className="flex justify-center py-8">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : assignments && assignments.length > 0 ? (
              <div className="space-y-4">
                {assignments.map((assignment) => (
                  <Card key={assignment._id} className="overflow-hidden">
                    <div className="p-6 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                      <div className="flex items-start md:items-center gap-4">
                        <div className="bg-yellow-500/10 p-3 rounded-full">
                          <ClipboardList className="h-6 w-6 text-yellow-500" />
                        </div>
                        <div>
                          <h3 className="text-lg font-medium mb-1">{assignment.title}</h3>
                          <div className="flex flex-wrap gap-3 text-sm text-gray-500 dark:text-gray-400">
                            <span className="flex items-center">
                              <CalendarDays className="h-4 w-4 mr-1" />
                              Due: {formatDate(assignment.dueDate)}
                            </span>
                            <span className="flex items-center">
                              <Clock className="h-4 w-4 mr-1" />
                              {getTimeLeft(assignment.dueDate)}
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-3 ml-auto">
                        <Badge className={getStatusColor(assignment.status)}>
                          {getStatusIcon(assignment.status)}
                          <span className="ml-1">{assignment.status === 'completed' ? 'Completed' : assignment.status === 'in-progress' ? 'In Progress' : 'Pending'}</span>
                        </Badge>
                        <Button asChild size="sm">
                          <a href={`/student/assignments/${assignment._id}`}>
                            {assignment.status === 'completed' ? 'View Submission' : 'Start Assignment'}
                          </a>
                        </Button>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="text-center py-12 border rounded-md">
                <ClipboardList className="h-12 w-12 mx-auto mb-4 text-gray-300 dark:text-gray-600" />
                <h3 className="text-lg font-medium mb-1">No Assignments Available</h3>
                <p className="text-gray-500 dark:text-gray-400">This course doesn't have any assignments yet.</p>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </StudentLayout>
  );
}