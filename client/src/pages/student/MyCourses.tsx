import React from 'react';
import { useQuery } from '@tanstack/react-query';
import StudentLayout from '@/components/layout/StudentLayout';
import { Course, Class, Test, Assignment } from '@shared/schema';
import { useAuth } from '@/providers/AuthProvider';
import { Link } from 'wouter';

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
import { Progress } from '@/components/ui/progress';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { 
  School, 
  Loader2, 
  FileVideo, 
  FileText, 
  FileQuestion, 
  ClipboardList,
  BookOpen,
  Users,
  Star,
  CheckCircle
} from 'lucide-react';

// Interface for course with progress
interface CourseWithProgress extends Course {
  progress: number;
  completedItems: number;
  totalItems: number;
  instructor: {
    name: string;
    initials: string;
  };
}

export default function MyCourses() {
  const { user } = useAuth();
  
  // Fetch enrolled courses
  const { data: courses, isLoading: isLoadingCourses } = useQuery<Course[]>({
    queryKey: ['/api/student/courses'],
  });
  
  // Fetch classes
  const { data: classes, isLoading: isLoadingClasses } = useQuery<Class[]>({
    queryKey: ['/api/student/classes'],
  });
  
  // Fetch tests
  const { data: tests, isLoading: isLoadingTests } = useQuery<Test[]>({
    queryKey: ['/api/student/tests'],
  });
  
  // Fetch assignments
  const { data: assignments, isLoading: isLoadingAssignments } = useQuery<Assignment[]>({
    queryKey: ['/api/student/assignments'],
  });
  
  // Fetch progress data
  const { data: progressData, isLoading: isLoadingProgress } = useQuery({
    queryKey: ['/api/student/progress'],
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
        instructor: {
          name: "John Doe", // This would come from the user who created the course
          initials: "JD"
        }
      };
    });
  }, [courses, progressData]);

  // Get category color based on category name
  const getCategoryColor = (category: string) => {
    switch (category?.toLowerCase()) {
      case 'javascript':
        return 'bg-primary-light bg-opacity-10 text-primary';
      case 'react':
        return 'bg-secondary bg-opacity-10 text-secondary';
      case 'node.js':
        return 'bg-green-500 bg-opacity-10 text-green-500';
      case 'python':
        return 'bg-blue-500 bg-opacity-10 text-blue-500';
      case 'database':
        return 'bg-purple-500 bg-opacity-10 text-purple-500';
      default:
        return 'bg-gray-500 bg-opacity-10 text-gray-500';
    }
  };

  // Get course content count by type
  const getCourseContentCount = (courseId: string, type: 'class' | 'test' | 'assignment') => {
    if (type === 'class') {
      return classes?.filter(c => c.courseId === courseId).length || 0;
    } else if (type === 'test') {
      return tests?.filter(t => t.courseId === courseId).length || 0;
    } else {
      return assignments?.filter(a => a.courseId === courseId).length || 0;
    }
  };

  // Check if all data is loading
  const isLoading = isLoadingCourses || isLoadingClasses || isLoadingTests || isLoadingAssignments || isLoadingProgress;

  return (
    <StudentLayout>
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-800 dark:text-white">My Courses</h2>
          <p className="text-gray-600 dark:text-gray-400">Access and continue your enrolled courses</p>
        </div>

        <Tabs defaultValue="all" className="space-y-6">
          <TabsList>
            <TabsTrigger value="all">All Courses</TabsTrigger>
            <TabsTrigger value="in-progress">In Progress</TabsTrigger>
            <TabsTrigger value="completed">Completed</TabsTrigger>
          </TabsList>
          
          <TabsContent value="all" className="m-0">
            {isLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {Array(3).fill(0).map((_, i) => (
                  <Card key={i} className="animate-pulse">
                    <div className="h-40 bg-gray-200 dark:bg-gray-700 rounded-t-lg"></div>
                    <CardContent className="p-6">
                      <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded mb-4 w-3/4"></div>
                      <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded mb-4"></div>
                      <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : coursesWithProgress.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {coursesWithProgress.map((course) => (
                  <Card key={course._id} className="overflow-hidden">
                    <div className="relative h-40 overflow-hidden">
                      <img 
                        src={course.image || 'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&h=300'} 
                        alt={course.title} 
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute inset-0 bg-black bg-opacity-40 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
                        <Button asChild variant="secondary">
                          <Link href={`/student/courses/${course._id}`}>
                            <BookOpen className="mr-2 h-4 w-4" />
                            Continue Learning
                          </Link>
                        </Button>
                      </div>
                    </div>
                    
                    <CardContent className="pt-6">
                      <div className="flex items-center justify-between mb-2">
                        <Badge className={getCategoryColor(course.category || '')}>
                          {course.category || 'General'}
                        </Badge>
                        <div className="flex items-center">
                          <Users className="text-gray-500 dark:text-gray-400 h-4 w-4 mr-1" />
                          <span className="text-xs text-gray-500 dark:text-gray-400">
                            {course.assignedTo?.length || 0} students
                          </span>
                        </div>
                      </div>
                      
                      <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-1">{course.title}</h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-4 line-clamp-2">{course.description}</p>
                      
                      <div className="mb-2">
                        <div className="flex justify-between text-sm mb-1">
                          <span className="text-gray-600 dark:text-gray-400">Progress</span>
                          <span className="font-medium">{course.progress}%</span>
                        </div>
                        <Progress value={course.progress} className="h-2" />
                      </div>
                      
                      <div className="grid grid-cols-3 gap-2 text-center text-xs mt-4">
                        <div className="bg-gray-50 dark:bg-dark-border p-2 rounded">
                          <FileVideo className="h-4 w-4 mx-auto mb-1 text-primary" />
                          <span>{getCourseContentCount(course._id as string, 'class')} Classes</span>
                        </div>
                        <div className="bg-gray-50 dark:bg-dark-border p-2 rounded">
                          <FileQuestion className="h-4 w-4 mx-auto mb-1 text-secondary" />
                          <span>{getCourseContentCount(course._id as string, 'test')} Tests</span>
                        </div>
                        <div className="bg-gray-50 dark:bg-dark-border p-2 rounded">
                          <ClipboardList className="h-4 w-4 mx-auto mb-1 text-warning" />
                          <span>{getCourseContentCount(course._id as string, 'assignment')} Assignments</span>
                        </div>
                      </div>
                    </CardContent>
                    
                    <CardFooter className="bg-gray-50 dark:bg-dark-border border-t border-gray-100 dark:border-gray-800">
                      <div className="flex items-center justify-between w-full">
                        <div className="flex items-center">
                          <Avatar className="h-6 w-6 mr-2">
                            <AvatarFallback className="bg-primary-light text-white text-xs">
                              {course.instructor.initials}
                            </AvatarFallback>
                          </Avatar>
                          <span className="text-xs text-gray-600 dark:text-gray-400">{course.instructor.name}</span>
                        </div>
                        <div className="flex items-center">
                          <Star className="h-4 w-4 text-warning mr-1" fill="currentColor" />
                          <span className="text-xs">4.8</span>
                        </div>
                      </div>
                    </CardFooter>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="text-center py-12 text-gray-500 dark:text-gray-400">
                <School className="h-12 w-12 mx-auto mb-4 opacity-20" />
                <h3 className="text-lg font-medium">No courses found</h3>
                <p className="text-sm">You are not enrolled in any courses yet</p>
              </div>
            )}
          </TabsContent>
          
          <TabsContent value="in-progress" className="m-0">
            {isLoading ? (
              <div className="flex justify-center py-8">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : coursesWithProgress.filter(c => c.progress > 0 && c.progress < 100).length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {coursesWithProgress
                  .filter(c => c.progress > 0 && c.progress < 100)
                  .map((course) => (
                    <Card key={course._id} className="overflow-hidden">
                      <div className="relative h-40 overflow-hidden">
                        <img 
                          src={course.image || 'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&h=300'} 
                          alt={course.title} 
                          className="w-full h-full object-cover"
                        />
                        <div className="absolute inset-0 bg-black bg-opacity-40 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
                          <Button asChild variant="secondary">
                            <Link href={`/student/courses/${course._id}`}>
                              <BookOpen className="mr-2 h-4 w-4" />
                              Continue Learning
                            </Link>
                          </Button>
                        </div>
                      </div>
                      
                      <CardContent className="pt-6">
                        <div className="flex items-center justify-between mb-2">
                          <Badge className={getCategoryColor(course.category || '')}>
                            {course.category || 'General'}
                          </Badge>
                          <Badge variant="outline" className="bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-300 border-yellow-200 dark:border-yellow-800">
                            In Progress
                          </Badge>
                        </div>
                        
                        <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-1">{course.title}</h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mb-4 line-clamp-2">{course.description}</p>
                        
                        <div className="mb-2">
                          <div className="flex justify-between text-sm mb-1">
                            <span className="text-gray-600 dark:text-gray-400">Progress</span>
                            <span className="font-medium">{course.progress}%</span>
                          </div>
                          <Progress value={course.progress} className="h-2" />
                          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                            {course.completedItems} of {course.totalItems} items completed
                          </p>
                        </div>
                      </CardContent>
                      
                      <CardFooter className="flex justify-end pt-0">
                        <Button asChild size="sm">
                          <Link href={`/student/courses/${course._id}`}>
                            Continue
                          </Link>
                        </Button>
                      </CardFooter>
                    </Card>
                  ))}
              </div>
            ) : (
              <div className="text-center py-12 text-gray-500 dark:text-gray-400">
                <School className="h-12 w-12 mx-auto mb-4 opacity-20" />
                <h3 className="text-lg font-medium">No courses in progress</h3>
                <p className="text-sm">Start learning to see courses here</p>
              </div>
            )}
          </TabsContent>
          
          <TabsContent value="completed" className="m-0">
            {isLoading ? (
              <div className="flex justify-center py-8">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : coursesWithProgress.filter(c => c.progress === 100).length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {coursesWithProgress
                  .filter(c => c.progress === 100)
                  .map((course) => (
                    <Card key={course._id} className="overflow-hidden">
                      <div className="relative h-40 overflow-hidden">
                        <img 
                          src={course.image || 'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&h=300'} 
                          alt={course.title} 
                          className="w-full h-full object-cover"
                        />
                        <div className="absolute top-2 right-2">
                          <Badge className="bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-300 border-green-200 dark:border-green-800">
                            <CheckCircle className="h-3 w-3 mr-1" /> Completed
                          </Badge>
                        </div>
                      </div>
                      
                      <CardContent className="pt-6">
                        <div className="flex items-center justify-between mb-2">
                          <Badge className={getCategoryColor(course.category || '')}>
                            {course.category || 'General'}
                          </Badge>
                        </div>
                        
                        <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-1">{course.title}</h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mb-4 line-clamp-2">{course.description}</p>
                        
                        <div className="mb-2">
                          <div className="flex justify-between text-sm mb-1">
                            <span className="text-gray-600 dark:text-gray-400">Progress</span>
                            <span className="font-medium">100%</span>
                          </div>
                          <Progress value={100} className="h-2 bg-green-100 dark:bg-green-900" />
                          <p className="text-xs text-green-600 dark:text-green-400 mt-1 flex items-center">
                            <CheckCircle className="h-3 w-3 mr-1" />
                            Course completed
                          </p>
                        </div>
                      </CardContent>
                      
                      <CardFooter className="flex justify-end pt-0">
                        <Button asChild size="sm" variant="outline">
                          <Link href={`/student/courses/${course._id}`}>
                            Review Course
                          </Link>
                        </Button>
                      </CardFooter>
                    </Card>
                  ))}
              </div>
            ) : (
              <div className="text-center py-12 text-gray-500 dark:text-gray-400">
                <School className="h-12 w-12 mx-auto mb-4 opacity-20" />
                <h3 className="text-lg font-medium">No completed courses</h3>
                <p className="text-sm">Complete a course to see it here</p>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </StudentLayout>
  );
}
