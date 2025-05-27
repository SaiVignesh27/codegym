import React from 'react';
import { useQuery } from '@tanstack/react-query';
import StudentLayout from '@/components/layout/StudentLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { useAuth } from '@/providers/AuthProvider';
import { TestStatus, AssignmentStatus } from '@shared/types';
import { Calendar, Clock, Star, BookOpen, CheckCircle, FileQuestion, ClipboardList, Loader2 } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { Course } from '@shared/schema';
import { Link } from 'wouter';

interface CourseProgress {
  courseId: string;
  completed: number;
  total: number;
  lastActivity?: Date;
}

interface CourseWithProgress extends Course {
  progress: number;
  completedItems: number;
  totalItems: number;
  lastActivity?: Date;
}

export default function StudentDashboard() {
  const { user } = useAuth();
  
  // Fetch enrolled courses
  const { data: courses, isLoading: isLoadingCourses } = useQuery<Course[]>({
    queryKey: ['/api/student/courses'],
  });
  
  // Fetch course progress
  const { data: progressData, isLoading: isLoadingProgress } = useQuery<Record<string, CourseProgress>>({
    queryKey: ['/api/student/progress'],
  });
  
  // Fetch upcoming tests
  const { data: tests, isLoading: isLoadingTests } = useQuery<TestStatus[]>({
    queryKey: ['/api/student/tests/upcoming'],
  });
  
  // Fetch pending assignments
  const { data: assignments, isLoading: isLoadingAssignments } = useQuery<AssignmentStatus[]>({
    queryKey: ['/api/student/assignments/pending'],
  });
  
  // Process courses with progress data
  const coursesWithProgress: CourseWithProgress[] = React.useMemo(() => {
    if (!courses || !progressData) return [];
    
    return courses.map(course => {
      const courseProgress = progressData[course._id as string] || { completed: 0, total: 0 };
      return {
        ...course,
        progress: courseProgress.total > 0 ? Math.round((courseProgress.completed / courseProgress.total) * 100) : 0,
        completedItems: courseProgress.completed || 0,
        totalItems: courseProgress.total || 0,
        lastActivity: courseProgress.lastActivity
      };
    });
  }, [courses, progressData]);

  const isLoading = isLoadingCourses || isLoadingProgress || isLoadingTests || isLoadingAssignments;

  return (
    <StudentLayout>
      <div className="space-y-6">
        {/* Welcome Section */}
        <div className="bg-white dark:bg-dark-surface rounded-lg shadow-sm border border-light-border dark:border-dark-border p-6">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-gray-800 dark:text-white">Welcome back, {user?.name || 'Student'}!</h2>
              <p className="text-gray-600 dark:text-gray-400 mt-1">
                Continue your learning journey and track your progress
              </p>
            </div>
            <div className="mt-4 md:mt-0">
              <Button asChild>
                <Link href="/student/courses">Continue Learning</Link>
              </Button>
            </div>
          </div>
        </div>
        
        {/* Learning Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-500 dark:text-gray-400">
                Enrolled Courses
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center">
                <BookOpen className="h-5 w-5 text-primary mr-2" />
                <span className="text-2xl font-bold">{courses?.length || 0}</span>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-500 dark:text-gray-400">
                Upcoming Tests
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center">
                <FileQuestion className="h-5 w-5 text-green-500 mr-2" />
                <span className="text-2xl font-bold">{tests?.length || 0}</span>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-500 dark:text-gray-400">
                Pending Assignments
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center">
                <ClipboardList className="h-5 w-5 text-warning mr-2" />
                <span className="text-2xl font-bold">{assignments?.length || 0}</span>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-500 dark:text-gray-400">
                Average Score
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center">
                <Star className="h-5 w-5 text-yellow-500 mr-2" fill="currentColor" />
                <span className="text-2xl font-bold">
                  {coursesWithProgress.length > 0 
                    ? Math.round(coursesWithProgress.reduce((acc, course) => acc + course.progress, 0) / coursesWithProgress.length)
                    : 0}%
                </span>
              </div>
            </CardContent>
          </Card>
        </div>
        
        {/* Course Progress and Upcoming Tasks */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Current Course Progress */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle>Course Progress</CardTitle>
                <CardDescription>Your most recent course activities</CardDescription>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <div className="space-y-4">
                    {Array(3).fill(0).map((_, i) => (
                      <div key={i} className="animate-pulse">
                        <div className="h-5 bg-gray-200 dark:bg-gray-700 rounded mb-2 w-1/3"></div>
                        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded mb-2"></div>
                        <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded"></div>
                      </div>
                    ))}
                  </div>
                ) : coursesWithProgress.length > 0 ? (
                  <div className="space-y-6">
                    {coursesWithProgress.map((course) => (
                      <div key={course._id}>
                        <div className="flex justify-between mb-2">
                          <h4 className="font-medium text-gray-800 dark:text-white">{course.title}</h4>
                          <span className="text-sm text-gray-500 dark:text-gray-400">{course.progress}% Complete</span>
                        </div>
                        <Progress value={course.progress} className="h-2" />
                        <div className="mt-2 flex justify-between text-xs text-gray-500 dark:text-gray-400">
                          <span>
                            Last activity: {course.lastActivity 
                              ? formatDistanceToNow(new Date(course.lastActivity), { addSuffix: true })
                              : 'No activity yet'}
                          </span>
                          <span>{course.completedItems}/{course.totalItems} items completed</span>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                    <BookOpen className="h-12 w-12 mx-auto mb-4 opacity-20" />
                    <h3 className="text-lg font-medium">No courses enrolled</h3>
                    <p className="text-sm">Enroll in courses to start learning</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
          
          {/* Upcoming Tests and Deadlines */}
          <div>
            <Card>
              <CardHeader>
                <CardTitle>Upcoming Tasks</CardTitle>
                <CardDescription>Tests and assignment deadlines</CardDescription>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <div className="space-y-4">
                    {Array(4).fill(0).map((_, i) => (
                      <div key={i} className="animate-pulse">
                        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded mb-2 w-3/4"></div>
                        <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
                      </div>
                    ))}
                  </div>
                ) : (tests?.length || 0) + (assignments?.length || 0) > 0 ? (
                  <div className="space-y-4">
                    {tests?.map((test) => (
                      <div key={test._id} className="flex items-start">
                        <div className="p-2 rounded-md bg-primary-light bg-opacity-10 mt-0.5">
                          <FileQuestion className="h-4 w-4 text-primary" />
                        </div>
                        <div className="ml-3">
                          <h4 className="text-sm font-medium text-gray-800 dark:text-white">{test.title}</h4>
                          <p className="text-xs text-gray-500 dark:text-gray-400 flex items-center mt-1">
                            <Clock className="h-3 w-3 mr-1" /> {test.status === 'completed' ? 'Completed' : 'Pending'}
                          </p>
                        </div>
                      </div>
                    ))}
                    
                    {assignments?.map((assignment) => (
                      <div key={assignment._id} className="flex items-start">
                        <div className="p-2 rounded-md bg-warning bg-opacity-10 mt-0.5">
                          <ClipboardList className="h-4 w-4 text-warning" />
                        </div>
                        <div className="ml-3">
                          <h4 className="text-sm font-medium text-gray-800 dark:text-white">{assignment.title}</h4>
                          <p className="text-xs text-gray-500 dark:text-gray-400 flex items-center mt-1">
                            <Calendar className="h-3 w-3 mr-1" /> Due {formatDistanceToNow(new Date(assignment.dueDate), { addSuffix: true })}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                    <FileQuestion className="h-12 w-12 mx-auto mb-4 opacity-20" />
                    <h3 className="text-lg font-medium">No upcoming tasks</h3>
                    <p className="text-sm">You're all caught up!</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </StudentLayout>
  );
}
