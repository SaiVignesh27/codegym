import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import StudentLayout from '@/components/layout/StudentLayout';
import { Assignment, Result, Course } from '@shared/schema';
import { Link } from 'wouter';
import { format, isAfter } from 'date-fns';
import { useAuth } from '@/hooks/useAuth';

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { 
  ClipboardList, 
  Loader2, 
  Clock, 
  Search, 
  ChevronRight, 
  CheckCircle, 
  Star,
  Calendar,
  AlertTriangle,
  XCircle
} from 'lucide-react';

// Interface for assignment with result
interface AssignmentWithResult extends Assignment {
  result?: Result;
  isCompleted: boolean;
  isOverdue: boolean;
  status: 'pending' | 'in-progress' | 'completed' | 'overdue';
  score?: number;
}

export default function Assignments() {
  const [searchQuery, setSearchQuery] = useState('');
  const [courseFilter, setCourseFilter] = useState('all');
  const { user } = useAuth();
  
  // Fetch available assignments
  const { data: assignments, isLoading: isLoadingAssignments } = useQuery<Assignment[]>({
    queryKey: ['/api/student/assignments'],
  });
  
  // Fetch assignment results
  const { data: results, isLoading: isLoadingResults } = useQuery<Result[]>({
    queryKey: ['/api/student/results/assignments'],
  });
  
  // Fetch courses for filter
  const { data: courses = [], isLoading: isLoadingCourses } = useQuery<Course[]>({
    queryKey: ['/api/student/courses'],
  });
  
  // Process assignments with results
  const assignmentsWithResults: AssignmentWithResult[] = React.useMemo(() => {
    if (!assignments || !results) return [];
    
    return assignments.map(assignment => {
      const result = results.find(r => r.assignmentId === assignment._id);
      const dueDate = assignment.dueDate ? new Date(assignment.dueDate) : undefined;
      const startTime = assignment.timeWindow?.startTime ? new Date(assignment.timeWindow.startTime) : undefined;
      const endTime = assignment.timeWindow?.endTime ? new Date(assignment.timeWindow.endTime) : undefined;
      const now = new Date();
      
      let status: 'pending' | 'in-progress' | 'completed' | 'overdue' = 'pending';
      if (result) {
        status = 'completed';
      } else if (dueDate && dueDate < now) {
        status = 'overdue';
      } else if (startTime && endTime) {
        if (now >= startTime && now <= endTime) {
          status = 'in-progress';
        } else if (now > endTime) {
          status = 'overdue';
        }
      }
      
      return {
        ...assignment,
        result,
        isCompleted: !!result,
        isOverdue: status === 'overdue',
        status,
        score: result?.score || 0,
      };
    });
  }, [assignments, results]);
  
  // Filter assignments by search, course, and course access
  const filteredAssignments = React.useMemo(() => {
    return assignmentsWithResults.filter(assignment => {
      const matchesSearch = assignment.title.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCourse = courseFilter === 'all' || assignment.courseId === courseFilter;
      
      // Get the course for this assignment
      const course = courses?.find(c => c._id === assignment.courseId);
      
      // Only show assignments if:
      // 1. Course is public, OR
      // 2. Course is private and student is assigned to it
      const hasAccess = course && (
        course.visibility === 'public' || 
        (course.visibility === 'private' && course.assignedTo?.includes(user?._id || ''))
      );
      
      return matchesSearch && matchesCourse && hasAccess;
    });
  }, [assignmentsWithResults, searchQuery, courseFilter, courses, user?._id]);
  
  // Split assignments by status
  const pendingAssignments = filteredAssignments.filter(a => a.status === 'pending' || a.status === 'in-progress');
  const completedAssignments = filteredAssignments.filter(a => a.status === 'completed');
  const overdueAssignments = filteredAssignments.filter(a => a.status === 'overdue');
  
  // Check if all data is loading
  const isLoading = isLoadingAssignments || isLoadingResults || isLoadingCourses;
  
  // Format date
  const formatDate = (date: Date) => {
    return format(date, 'MMM dd, yyyy');
  };
  
  // Calculate days remaining
  const getDaysRemaining = (dueDate: Date) => {
    const now = new Date();
    const diffTime = dueDate.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays < 0) return 'Overdue';
    if (diffDays === 0) return 'Due today';
    if (diffDays === 1) return '1 day left';
    return `${diffDays} days left`;
  };
  
  // Get course name
  const getCourseName = (courseId: string) => {
    const course = courses.find(course => course._id === courseId);
    return course?.title || 'Unknown Course';
  };

  // Get status badge color
  const getStatusColor = (status: 'pending' | 'in-progress' | 'completed' | 'overdue') => {
    switch (status) {
      case "completed":
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300";
      case "in-progress":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300";
      case "pending":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300";
      case "overdue":
        return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300";
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300";
    }
  };

  // Get status icon
  const getStatusIcon = (status: 'pending' | 'in-progress' | 'completed' | 'overdue') => {
    switch (status) {
      case "completed":
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case "in-progress":
        return <Clock className="h-4 w-4 text-blue-500" />;
      case "pending":
        return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
      case "overdue":
        return <XCircle className="h-4 w-4 text-red-500" />;
      default:
        return null;
    }
  };

  return (
    <StudentLayout>
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-800 dark:text-white">Assignments</h2>
          <p className="text-gray-600 dark:text-gray-400">Manage and complete your assignments</p>
        </div>

        <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4 items-start sm:items-center">
          <div className="relative w-full sm:w-96">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search assignments..."
              className="pl-8"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          
          <Select
            value={courseFilter}
            onValueChange={setCourseFilter}
          >
            <SelectTrigger className="w-full sm:w-60">
              <SelectValue placeholder="Filter by course" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Courses</SelectItem>
              {courses.map((course) => (
                <SelectItem key={course._id} value={course._id || ''}>
                  {course.title}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <Tabs defaultValue="pending" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3 md:w-[450px]">
            <TabsTrigger value="pending">Pending</TabsTrigger>
            <TabsTrigger value="completed">Completed</TabsTrigger>
            <TabsTrigger value="overdue">Overdue</TabsTrigger>
          </TabsList>
          
          <TabsContent value="pending" className="m-0">
            {isLoading ? (
              <div className="flex justify-center py-8">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : pendingAssignments.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {pendingAssignments.map((assignment) => (
                  <Card key={assignment._id} className="overflow-hidden">
                    <CardHeader className="pb-2">
                      <div className="flex justify-between items-start">
                        <Badge className="bg-primary-light bg-opacity-10 text-primary">
                          {getCourseName(assignment.courseId)}
                        </Badge>
                        <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
                          <Clock className="h-4 w-4 mr-1" />
                          <span>
                            {assignment.timeWindow?.endTime ? (
                              <>
                                {format(new Date(assignment.timeWindow.endTime), 'MMM dd, yyyy')}
                              </>
                            ) : assignment.dueDate ? (
                              <>
                                {format(new Date(assignment.dueDate), 'MMM dd, yyyy')}
                              </>
                            ) : 'No deadline'}
                          </span>
                        </div>
                      </div>
                      <CardTitle className="mt-2 text-lg">{assignment.title}</CardTitle>
                      <CardDescription className="line-clamp-2">
                        {assignment.description || 'Complete this assignment to improve your skills.'}
                      </CardDescription>
                    </CardHeader>
                    
                    <CardContent>
                      <div className="flex items-center justify-between text-sm">
                        <div className="flex items-center">
                          <ClipboardList className="h-4 w-4 mr-1 text-gray-500 dark:text-gray-400" />
                          <span className="text-gray-500 dark:text-gray-400">
                            {assignment.type || 'Coding Assignment'}
                          </span>
                        </div>
                        <div className="flex items-center">
                          <Calendar className="h-4 w-4 mr-1 text-gray-500 dark:text-gray-400" />
                          <span>
                            {assignment.timeWindow?.endTime ? (
                              <>
                                {getDaysRemaining(new Date(assignment.timeWindow.endTime))}
                              </>
                            ) : assignment.dueDate ? (
                              <>
                                {getDaysRemaining(new Date(assignment.dueDate))}
                              </>
                            ) : 'No deadline'}
                          </span>
                        </div>
                      </div>
                    </CardContent>
                    
                    <CardFooter className="border-t bg-gray-50 dark:bg-dark-border pt-4">
                      <Button asChild className="w-full">
                        <Link href={`/student/assignments/${assignment._id}`}>
                          {assignment.status === 'in-progress' ? 'Continue Working' : 'Start Assignment'} <ChevronRight className="h-4 w-4 ml-1" />
                        </Link>
                      </Button>
                    </CardFooter>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="text-center py-12 text-gray-500 dark:text-gray-400">
                <ClipboardList className="h-12 w-12 mx-auto mb-4 opacity-20" />
                <h3 className="text-lg font-medium">No pending assignments found</h3>
                <p className="text-sm">All assignments have been completed</p>
              </div>
            )}
          </TabsContent>
          
          <TabsContent value="completed" className="m-0">
            {isLoading ? (
              <div className="flex justify-center py-8">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : completedAssignments.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {completedAssignments.map((assignment) => (
                  <Card key={assignment._id} className="overflow-hidden relative">
                    <div className="absolute top-2 right-2">
                      <Badge className="bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-300 flex items-center">
                        <CheckCircle className="h-3 w-3 mr-1" /> Completed
                      </Badge>
                    </div>
                    
                    <CardHeader className="pb-2">
                      <Badge className="bg-primary-light bg-opacity-10 text-primary">
                        {getCourseName(assignment.courseId)}
                      </Badge>
                      <CardTitle className="mt-2 text-lg">{assignment.title}</CardTitle>
                      <CardDescription className="line-clamp-2">
                        {assignment.description || 'You have completed this assignment.'}
                      </CardDescription>
                    </CardHeader>
                    
                    <CardContent>
                      <div className="bg-gray-50 dark:bg-dark-border rounded-lg p-4 mb-4">
                        <div className="flex justify-between items-center mb-2">
                          <span className="text-sm text-gray-500 dark:text-gray-400">Your Score</span>
                          <div className="flex items-center">
                            <Star className="h-4 w-4 text-yellow-500 mr-1" fill="currentColor" />
                            <span className="font-semibold">{assignment.score}%</span>
                          </div>
                        </div>
                        <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                          <div 
                            className={`h-full rounded-full ${
                              (assignment.score || 0) >= 70 
                                ? 'bg-green-500' 
                                : (assignment.score || 0) >= 40 
                                ? 'bg-yellow-500' 
                                : 'bg-red-500'
                            }`}
                            style={{ width: `${assignment.score || 0}%` }}
                          ></div>
                        </div>
                      </div>
                      
                      <div className="flex items-center justify-between text-sm">
                        <div className="flex items-center">
                          <ClipboardList className="h-4 w-4 mr-1 text-gray-500 dark:text-gray-400" />
                          <span className="text-gray-500 dark:text-gray-400">
                            {assignment.type || 'Coding Assignment'}
                          </span>
                        </div>
                        <div className="flex items-center">
                          <Calendar className="h-4 w-4 mr-1 text-gray-500 dark:text-gray-400" />
                          <span className="text-gray-500 dark:text-gray-400">
                            {assignment.result?.submittedAt 
                              ? formatDate(new Date(assignment.result.submittedAt)) 
                              : 'Completed'}
                          </span>
                        </div>
                      </div>
                    </CardContent>
                    
                    <CardFooter className="border-t bg-gray-50 dark:bg-dark-border pt-4">
                      <Button asChild size="sm">
                        <Link href={assignment.isCompleted
                            ? `/student/assignments/${assignment._id}/results`
                            : `/student/assignments/${assignment._id}`}>
                          View Submission
                        </Link>
                        
                      </Button>
                    </CardFooter>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="text-center py-12 text-gray-500 dark:text-gray-400">
                <ClipboardList className="h-12 w-12 mx-auto mb-4 opacity-20" />
                <h3 className="text-lg font-medium">No completed assignments found</h3>
                <p className="text-sm">Complete some assignments to see them here</p>
              </div>
            )}
          </TabsContent>
          
          <TabsContent value="overdue" className="m-0">
            {isLoading ? (
              <div className="flex justify-center py-8">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : overdueAssignments.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {overdueAssignments.map((assignment) => (
                  <Card key={assignment._id} className="overflow-hidden border-l-4 border-l-destructive">
                    <div className="absolute top-2 right-2">
                      <Badge variant="destructive">
                        <AlertTriangle className="h-3 w-3 mr-1" /> Overdue
                      </Badge>
                    </div>
                    
                    <CardHeader className="pb-2">
                      <Badge className="bg-primary-light bg-opacity-10 text-primary">
                        {getCourseName(assignment.courseId)}
                      </Badge>
                      <CardTitle className="mt-2 text-lg">{assignment.title}</CardTitle>
                      <CardDescription className="line-clamp-2">
                        {assignment.description || 'This assignment is past its due date.'}
                      </CardDescription>
                    </CardHeader>
                    
                    <CardContent>
                      <div className="flex items-center justify-between text-sm">
                        <div className="flex items-center">
                          <ClipboardList className="h-4 w-4 mr-1 text-gray-500 dark:text-gray-400" />
                          <span className="text-gray-500 dark:text-gray-400">
                            {assignment.type || 'Coding Assignment'}
                          </span>
                        </div>
                        <div className="flex items-center text-destructive font-medium">
                          <Calendar className="h-4 w-4 mr-1" />
                          <span>
                            {assignment.timeWindow?.endTime ? (
                              <>
                                {getDaysRemaining(new Date(assignment.timeWindow.endTime))} 
                              </>
                            ) : assignment.dueDate ? (
                              <>
                                {getDaysRemaining(new Date(assignment.dueDate))} 
                              </>
                            ) : 'No deadline'}
                          </span>
                        </div>
                      </div>
                    </CardContent>
                    
                    <CardFooter className="border-t bg-gray-50 dark:bg-dark-border pt-4">
                      <Button asChild variant="outline" className="w-full">
                        <Link href={`/student/assignments/${assignment._id}`}>
                          Submit Anyway
                        </Link>
                      </Button>
                    </CardFooter>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="text-center py-12 text-gray-500 dark:text-gray-400">
                <ClipboardList className="h-12 w-12 mx-auto mb-4 opacity-20" />
                <h3 className="text-lg font-medium">No overdue assignments</h3>
                <p className="text-sm">Great job keeping up with your work!</p>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </StudentLayout>
  );
}