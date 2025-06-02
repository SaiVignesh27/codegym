import React from 'react';
import { useQuery } from '@tanstack/react-query';
import StudentLayout from '@/components/layout/StudentLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { useAuth } from '@/providers/AuthProvider';
import { TestStatus, AssignmentStatus } from '@shared/types';
import { Calendar, Clock, Star, BookOpen, CheckCircle, FileQuestion, ClipboardList, Loader2, FileText } from 'lucide-react';
import { formatDistanceToNow, format } from 'date-fns';
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

interface Task {
  id: string;
  title: string;
  type: 'assignment' | 'test';
  courseTitle: string;
  dueDate?: Date;
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
  
  // Fetch pending assignments
  const { data: pendingAssignments, isLoading: isLoadingAssignments } = useQuery<AssignmentStatus[]>({
    queryKey: ['/api/student/assignments/pending'],
  });

  // Fetch all assignments for counting
  const { data: allAssignments } = useQuery<AssignmentStatus[]>({
    queryKey: ['/api/student/assignments'],
  });

  // Fetch pending tests
  const { data: pendingTests, isLoading: isLoadingTests } = useQuery<TestStatus[]>({
    queryKey: ['/api/student/tests/pending'],
    enabled: !!user,
  });

  
  // Fetch all tests for counting
  const { data: allTests } = useQuery<TestStatus[]>({
    queryKey: ['/api/student/tests'],
    enabled: !!user,
  });

  // Calculate test stats
  const testStats = React.useMemo(() => {
    if (!allTests) return { total: 0, completed: 0, pending: 0 };
    
    return {
      total: allTests.length,
      completed: allTests.filter(t => t.status === 'completed').length,
      pending: allTests.filter(t => t.status === 'pending').length
    };
  }, [allTests]);

  // Calculate assignment stats
  const assignmentStats = React.useMemo(() => {
    if (!allAssignments) return { total: 0, completed: 0, pending: 0, overdue: 0 };
    
    return {
      total: allAssignments.length,
      completed: allAssignments.filter(a => a.status === 'completed').length,
      pending: allAssignments.filter(a => a.status === 'pending').length,
      overdue: allAssignments.filter(a => a.status === 'overdue').length
    };
  }, [allAssignments]);

  // Separate upcoming assignments and tests
  const upcomingAssignments = React.useMemo(() => {
    if (!pendingAssignments) return [];
    return pendingAssignments.map(assignment => ({
      id: assignment._id,
      title: assignment.title,
      type: 'assignment' as const,
      dueDate: assignment.dueDate,
      courseTitle: assignment.courseTitle
    }));
  }, [pendingAssignments]);

  const upcomingTests = React.useMemo(() => {
    if (!pendingTests) return [];
    return pendingTests.map(test => ({
      id: test._id,
      title: test.title,
      type: 'test' as const,
      courseTitle: test.courseTitle
    }));
  }, [pendingTests]);

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

  // Check if all data is loading
  const isLoading = isLoadingAssignments || isLoadingTests || isLoadingCourses;

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
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Assignments</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center">
                <FileQuestion className="h-5 w-5 text-purple-500 mr-2" />
                <span className="text-2xl font-bold">{assignmentStats.total}</span>
              </div>
              <p className="text-xs text-muted-foreground">
                {assignmentStats.completed} completed, {assignmentStats.pending} pending
              </p>
            </CardContent>
          </Card>
          
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
                Number of Tests
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center">
                <FileQuestion className="h-5 w-5 text-green-500 mr-2" />
                <span className="text-2xl font-bold">{testStats.total}</span>
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                {testStats.completed} completed, {testStats.pending} pending
              </p>
            </CardContent>
          </Card>
        </div>
        
        {/* Course Progress and Upcoming Tasks */}
        <div className="space-y-6">
          {/* Current Course Progress */}
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

          {/* Tests and Assignments Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Available Tests */}
            <Card>
              <CardHeader>
                <CardTitle>Available Tests</CardTitle>
                <CardDescription>Tests ready to be taken</CardDescription>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <div className="space-y-4">
                    {Array(3).fill(0).map((_, i) => (
                      <div key={i} className="animate-pulse">
                        <div className="h-20 bg-gray-200 dark:bg-gray-700 rounded-lg"></div>
                      </div>
                    ))}
                  </div>
                ) : upcomingTests.length > 0 ? (
                  <div className="space-y-4">
                    {upcomingTests.map((test) => (
                      <div 
                        key={test.id} 
                        className="group relative overflow-hidden rounded-lg border border-light-border dark:border-dark-border bg-white dark:bg-dark-surface hover:shadow-md transition-all duration-200"
                      >
                        <div className="p-4">
                          <div className="flex items-start justify-between">
                            <div className="flex items-start space-x-3">
                              <div className="p-2 rounded-lg bg-purple-50 dark:bg-purple-900/20 text-purple-600 dark:text-purple-400">
                                <FileText className="h-5 w-5" />
                              </div>
                              <div>
                                <h4 className="font-medium text-gray-900 dark:text-white group-hover:text-primary transition-colors">
                                  {test.title}
                                </h4>
                                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                                  {test.courseTitle}
                                </p>
                              </div>
                            </div>
                            <div className="flex flex-col items-end space-y-2">
                              <Button 
                                asChild 
                                size="sm"
                                variant="secondary"
                                className="group-hover:scale-105 transition-transform"
                              >
                                <Link href={`/student/tests/${test.id}`}>
                                  Take Test
                                </Link>
                              </Button>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-gray-100 dark:bg-gray-800 mb-4">
                      <CheckCircle className="h-6 w-6 text-gray-400" />
                    </div>
                    <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-1">No available tests</h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      You've completed all available tests!
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Pending Assignments */}
            <Card>
              <CardHeader>
                <CardTitle>Pending Assignments</CardTitle>
                <CardDescription>Your upcoming assignments</CardDescription>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <div className="space-y-4">
                    {Array(3).fill(0).map((_, i) => (
                      <div key={i} className="animate-pulse">
                        <div className="h-20 bg-gray-200 dark:bg-gray-700 rounded-lg"></div>
                      </div>
                    ))}
                  </div>
                ) : upcomingAssignments.length > 0 ? (
                  <div className="space-y-4">
                    {upcomingAssignments.map((assignment) => (
                      <div 
                        key={assignment.id} 
                        className="group relative overflow-hidden rounded-lg border border-light-border dark:border-dark-border bg-white dark:bg-dark-surface hover:shadow-md transition-all duration-200"
                      >
                        <div className="p-4">
                          <div className="flex items-start justify-between">
                            <div className="flex items-start space-x-3">
                              <div className="p-2 rounded-lg bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400">
                                <ClipboardList className="h-5 w-5" />
                              </div>
                              <div>
                                <h4 className="font-medium text-gray-900 dark:text-white group-hover:text-primary transition-colors">
                                  {assignment.title}
                                </h4>
                                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                                  {assignment.courseTitle}
                                </p>
                              </div>
                            </div>
                            <div className="flex flex-col items-end space-y-2">
                              {assignment.dueDate && (
                                <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
                                  <Calendar className="h-4 w-4 mr-1" />
                                  {format(new Date(assignment.dueDate), 'MMM dd, yyyy')}
                                </div>
                              )}
                              <Button 
                                asChild 
                                size="sm"
                                className="group-hover:scale-105 transition-transform"
                              >
                                <Link href={`/student/assignments/${assignment.id}`}>
                                  Start Assignment
                                </Link>
                              </Button>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-gray-100 dark:bg-gray-800 mb-4">
                      <CheckCircle className="h-6 w-6 text-gray-400" />
                    </div>
                    <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-1">No pending assignments</h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      You're all caught up with your assignments!
                    </p>
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
