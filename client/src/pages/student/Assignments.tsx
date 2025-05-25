import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import StudentLayout from '@/components/layout/StudentLayout';
import { Assignment, Result, Course } from '@shared/schema';
import { Link } from 'wouter';
import { format, isAfter } from 'date-fns';

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
  AlertTriangle
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
      const dueDate = assignment.dueDate ? new Date(assignment.dueDate) : new Date();
      const isOverdue = isAfter(new Date(), dueDate) && !result;
      
      let status: 'pending' | 'in-progress' | 'completed' | 'overdue' = 'pending';
      if (result?.status === 'completed') {
        status = 'completed';
      } else if (isOverdue) {
        status = 'overdue';
      } else if (result?.status === 'in-progress') {
        status = 'in-progress';
      }
      
      return {
        ...assignment,
        result,
        isCompleted: result?.status === 'completed',
        isOverdue,
        status,
        score: result?.score || 0,
      };
    });
  }, [assignments, results]);
  
  // Filter assignments by search and course
  const filteredAssignments = React.useMemo(() => {
    return assignmentsWithResults.filter(assignment => {
      const matchesSearch = assignment.title.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCourse = courseFilter === 'all' || assignment.courseId === courseFilter;
      return matchesSearch && matchesCourse;
    });
  }, [assignmentsWithResults, searchQuery, courseFilter]);
  
  // Split assignments by status
  const pendingAssignments = filteredAssignments.filter(a => a.status === 'pending');
  const inProgressAssignments = filteredAssignments.filter(a => a.status === 'in-progress');
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
          <TabsList className="grid w-full grid-cols-4 md:w-[600px]">
            <TabsTrigger value="pending">Pending</TabsTrigger>
            <TabsTrigger value="in-progress">In Progress</TabsTrigger>
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
                          <span>{assignment.dueDate ? getDaysRemaining(new Date(assignment.dueDate)) : 'No deadline'}</span>
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
                          <span className="text-gray-500 dark:text-gray-400">
                            {assignment.dueDate ? formatDate(new Date(assignment.dueDate)) : 'No deadline'}
                          </span>
                        </div>
                      </div>
                    </CardContent>
                    
                    <CardFooter className="border-t bg-gray-50 dark:bg-dark-border pt-4">
                      <Button asChild className="w-full">
                        <Link href={`/student/assignments/${assignment._id}`}>
                          Start Assignment <ChevronRight className="h-4 w-4 ml-1" />
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
                <p className="text-sm">All assignments have been started or completed</p>
              </div>
            )}
          </TabsContent>
          
          <TabsContent value="in-progress" className="m-0">
            {isLoading ? (
              <div className="flex justify-center py-8">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : inProgressAssignments.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {inProgressAssignments.map((assignment) => (
                  <Card key={assignment._id} className="overflow-hidden border-l-4 border-l-primary">
                    <CardHeader className="pb-2">
                      <div className="flex justify-between items-start">
                        <Badge className="bg-primary-light bg-opacity-10 text-primary">
                          {getCourseName(assignment.courseId)}
                        </Badge>
                        <Badge variant="outline" className="bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-300 border-blue-200 dark:border-blue-800">
                          In Progress
                        </Badge>
                      </div>
                      <CardTitle className="mt-2 text-lg">{assignment.title}</CardTitle>
                      <CardDescription className="line-clamp-2">
                        {assignment.description || 'Continue working on this assignment.'}
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
                        <div className="flex items-center text-amber-600 dark:text-amber-400 font-medium">
                          <Clock className="h-4 w-4 mr-1" />
                          <span>
                            {assignment.dueDate ? getDaysRemaining(new Date(assignment.dueDate)) : 'No deadline'}
                          </span>
                        </div>
                      </div>
                    </CardContent>
                    
                    <CardFooter className="border-t bg-gray-50 dark:bg-dark-border pt-4">
                      <Button asChild className="w-full">
                        <Link href={`/student/assignments/${assignment._id}`}>
                          Continue Working
                        </Link>
                      </Button>
                    </CardFooter>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="text-center py-12 text-gray-500 dark:text-gray-400">
                <ClipboardList className="h-12 w-12 mx-auto mb-4 opacity-20" />
                <h3 className="text-lg font-medium">No assignments in progress</h3>
                <p className="text-sm">Start working on assignments to see them here</p>
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
                  <Card key={assignment._id} className="overflow-hidden">
                    <div className="absolute top-2 right-2">
                      <Badge className="bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-300 border-green-200 dark:border-green-800">
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
                      <Button asChild variant="outline" className="w-full">
                        <Link href={`/student/assignments/${assignment._id}/results`}>
                          View Results
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
                            Due {assignment.dueDate ? formatDate(new Date(assignment.dueDate)) : 'N/A'}
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