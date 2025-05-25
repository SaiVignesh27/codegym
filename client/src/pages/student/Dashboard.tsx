import React from 'react';
import { useQuery } from '@tanstack/react-query';
import StudentLayout from '@/components/layout/StudentLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { useAuth } from '@/providers/AuthProvider';
import { TestStatus, AssignmentStatus } from '@shared/types';
import { Calendar, Clock, Star, BookOpen, CheckCircle, FileQuestion, ClipboardList } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

export default function StudentDashboard() {
  const { user } = useAuth();
  
  // Fetch enrolled courses
  const { data: courses, isLoading: isLoadingCourses } = useQuery({
    queryKey: ['/api/student/courses'],
  });
  
  // Fetch upcoming tests
  const { data: tests, isLoading: isLoadingTests } = useQuery<TestStatus[]>({
    queryKey: ['/api/student/tests/upcoming'],
  });
  
  // Fetch pending assignments
  const { data: assignments, isLoading: isLoadingAssignments } = useQuery<AssignmentStatus[]>({
    queryKey: ['/api/student/assignments/pending'],
  });
  
  // Fetch recent achievements
  const { data: achievements, isLoading: isLoadingAchievements } = useQuery({
    queryKey: ['/api/student/achievements'],
  });
  
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
              <Button>Continue Learning</Button>
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
                Completed Tests
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center">
                <FileQuestion className="h-5 w-5 text-green-500 mr-2" />
                <span className="text-2xl font-bold">12</span>
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
                <span className="text-2xl font-bold">87%</span>
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
                {isLoadingCourses ? (
                  <div className="space-y-4">
                    {Array(3).fill(0).map((_, i) => (
                      <div key={i} className="animate-pulse">
                        <div className="h-5 bg-gray-200 dark:bg-gray-700 rounded mb-2 w-1/3"></div>
                        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded mb-2"></div>
                        <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded"></div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="space-y-6">
                    <div>
                      <div className="flex justify-between mb-2">
                        <h4 className="font-medium text-gray-800 dark:text-white">JavaScript Fundamentals</h4>
                        <span className="text-sm text-gray-500 dark:text-gray-400">65% Complete</span>
                      </div>
                      <Progress value={65} className="h-2" />
                      <div className="mt-2 flex justify-between text-xs text-gray-500 dark:text-gray-400">
                        <span>Last activity: 2 hours ago</span>
                        <span>8/12 lessons completed</span>
                      </div>
                    </div>
                    
                    <div>
                      <div className="flex justify-between mb-2">
                        <h4 className="font-medium text-gray-800 dark:text-white">React.js Development</h4>
                        <span className="text-sm text-gray-500 dark:text-gray-400">40% Complete</span>
                      </div>
                      <Progress value={40} className="h-2" />
                      <div className="mt-2 flex justify-between text-xs text-gray-500 dark:text-gray-400">
                        <span>Last activity: Yesterday</span>
                        <span>4/10 lessons completed</span>
                      </div>
                    </div>
                    
                    <div>
                      <div className="flex justify-between mb-2">
                        <h4 className="font-medium text-gray-800 dark:text-white">Node.js Backend Development</h4>
                        <span className="text-sm text-gray-500 dark:text-gray-400">20% Complete</span>
                      </div>
                      <Progress value={20} className="h-2" />
                      <div className="mt-2 flex justify-between text-xs text-gray-500 dark:text-gray-400">
                        <span>Last activity: 3 days ago</span>
                        <span>2/10 lessons completed</span>
                      </div>
                    </div>
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
                {isLoadingTests || isLoadingAssignments ? (
                  <div className="space-y-4">
                    {Array(4).fill(0).map((_, i) => (
                      <div key={i} className="animate-pulse">
                        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded mb-2 w-3/4"></div>
                        <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="flex items-start">
                      <div className="p-2 rounded-md bg-primary-light bg-opacity-10 mt-0.5">
                        <FileQuestion className="h-4 w-4 text-primary" />
                      </div>
                      <div className="ml-3">
                        <h4 className="text-sm font-medium text-gray-800 dark:text-white">JavaScript Arrays & Objects</h4>
                        <p className="text-xs text-gray-500 dark:text-gray-400 flex items-center mt-1">
                          <Clock className="h-3 w-3 mr-1" /> Due tomorrow
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-start">
                      <div className="p-2 rounded-md bg-warning bg-opacity-10 mt-0.5">
                        <ClipboardList className="h-4 w-4 text-warning" />
                      </div>
                      <div className="ml-3">
                        <h4 className="text-sm font-medium text-gray-800 dark:text-white">React Hooks Assignment</h4>
                        <p className="text-xs text-gray-500 dark:text-gray-400 flex items-center mt-1">
                          <Calendar className="h-3 w-3 mr-1" /> Due in 3 days
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-start">
                      <div className="p-2 rounded-md bg-secondary bg-opacity-10 mt-0.5">
                        <FileQuestion className="h-4 w-4 text-secondary" />
                      </div>
                      <div className="ml-3">
                        <h4 className="text-sm font-medium text-gray-800 dark:text-white">React Component Lifecycle</h4>
                        <p className="text-xs text-gray-500 dark:text-gray-400 flex items-center mt-1">
                          <Clock className="h-3 w-3 mr-1" /> Due in 5 days
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-start">
                      <div className="p-2 rounded-md bg-green-500 bg-opacity-10 mt-0.5">
                        <ClipboardList className="h-4 w-4 text-green-500" />
                      </div>
                      <div className="ml-3">
                        <h4 className="text-sm font-medium text-gray-800 dark:text-white">Final Project Submission</h4>
                        <p className="text-xs text-gray-500 dark:text-gray-400 flex items-center mt-1">
                          <Calendar className="h-3 w-3 mr-1" /> Due in 2 weeks
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
        
        {/* Recent Achievements */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Achievements</CardTitle>
            <CardDescription>Your latest learning milestones</CardDescription>
          </CardHeader>
          <CardContent>
            {isLoadingAchievements ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {Array(3).fill(0).map((_, i) => (
                  <div key={i} className="animate-pulse">
                    <div className="h-20 bg-gray-200 dark:bg-gray-700 rounded"></div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <div className="bg-gray-50 dark:bg-dark-border rounded-lg p-4 flex items-center">
                  <div className="p-3 rounded-full bg-green-100 dark:bg-green-900">
                    <CheckCircle className="h-6 w-6 text-green-600 dark:text-green-400" />
                  </div>
                  <div className="ml-4">
                    <h4 className="font-medium text-gray-800 dark:text-white">JavaScript Mastery</h4>
                    <p className="text-xs text-gray-500 dark:text-gray-400">Completed all JavaScript tests with 90%+ score</p>
                  </div>
                </div>
                
                <div className="bg-gray-50 dark:bg-dark-border rounded-lg p-4 flex items-center">
                  <div className="p-3 rounded-full bg-primary-light bg-opacity-20">
                    <Star className="h-6 w-6 text-primary" fill="currentColor" />
                  </div>
                  <div className="ml-4">
                    <h4 className="font-medium text-gray-800 dark:text-white">Top Performer</h4>
                    <p className="text-xs text-gray-500 dark:text-gray-400">Ranked in the top 5% of React.js course</p>
                  </div>
                </div>
                
                <div className="bg-gray-50 dark:bg-dark-border rounded-lg p-4 flex items-center">
                  <div className="p-3 rounded-full bg-purple-100 dark:bg-purple-900">
                    <BookOpen className="h-6 w-6 text-purple-600 dark:text-purple-400" />
                  </div>
                  <div className="ml-4">
                    <h4 className="font-medium text-gray-800 dark:text-white">Learning Streak</h4>
                    <p className="text-xs text-gray-500 dark:text-gray-400">Completed lessons for 7 consecutive days</p>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </StudentLayout>
  );
}
