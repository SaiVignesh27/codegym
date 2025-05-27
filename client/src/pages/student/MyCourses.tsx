import React from 'react';
import { useQuery } from '@tanstack/react-query';
import StudentLayout from '@/components/layout/StudentLayout';
import { Course, Class, Test, Assignment } from '@shared/schema';
import { useAuth } from '@/providers/AuthProvider';
import { Link, useParams } from 'wouter';

import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
  CardDescription,
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
  CheckCircle,
  Gauge,
} from 'lucide-react';

interface CourseWithProgress extends Course {
  progress: number;
  completedItems: number;
  totalItems: number;
  instructor: {
    name: string;
    title: string;
    initials: string;
  };
}

interface ProgressData {
  overall: number;
  courses: {
    completed: number;
    inProgress: number;
    total: number;
  };
  tests: {
    completed: number;
    pending: number;
    average: number;
  };
  assignments: {
    completed: number;
    pending: number;
    average: number;
  };
}

export default function MyCourses() {
  const { id } = useParams();
  const { user } = useAuth();

  const { data: courses, isLoading: isLoadingCourses } = useQuery<Course[]>({
    queryKey: ['/api/student/courses'],
  });

  const { data: classes, isLoading: isLoadingClasses } = useQuery<Class[]>({
    queryKey: ['/api/student/classes'],
  });

  const { data: tests, isLoading: isLoadingTests } = useQuery<Test[]>({
    queryKey: ['/api/student/tests'],
  });

  const { data: assignments, isLoading: isLoadingAssignments } = useQuery<Assignment[]>({
    queryKey: ['/api/student/assignments'],
  });

  const { data: progressData, isLoading: isLoadingProgress } = useQuery<ProgressData>({
    queryKey: ['/api/student/progress'],
  });

  // Compute courses with progress info
  const coursesWithProgress: CourseWithProgress[] = React.useMemo(() => {
    if (!courses) return [];

    return courses.map(course => {
      const courseClasses = classes?.filter(c => c.courseId === course._id) || [];
      const courseTests = tests?.filter(t => t.courseId === course._id) || [];
      const courseAssignments = assignments?.filter(a => a.courseId === course._id) || [];

      const totalItems = courseClasses.length + courseTests.length + courseAssignments.length;
      // For example purpose: progress = completedItems / totalItems * 100
      // You can replace this with real data from progressData or API response
      // For now, let's just simulate some progress randomly or use 0
      // TODO: Replace with actual logic
      const completedItems = 0;

      return {
        ...course,
        progress: totalItems > 0 ? Math.round((completedItems / totalItems) * 100) : 0,
        completedItems,
        totalItems,
        instructor: {
          name: course.instructor?.name ?? 'Unknown Instructor',
          title: course.instructor?.title ?? 'Instructor',
          initials: course.instructor?.initials ?? 'UI',
        },
      };
    });
  }, [courses, classes, tests, assignments]);

  // Filter courses by progress for tabs
  const allCourses = coursesWithProgress;
  const inProgressCourses = coursesWithProgress.filter(c => c.progress > 0 && c.progress < 100);
  const completedCourses = coursesWithProgress.filter(c => c.progress === 100);

  // Category color helper
  const getCategoryColor = (category: string) => {
    switch (category.toLowerCase()) {
      case 'java programming':
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
  const getSkillLevelColor = (skillLevel: string) => {
    switch (skillLevel.toLowerCase()) {
      case 'Advanced':
        return 'bg-green-500 bg-opacity-10 text-green-500';
      case 'Intermediate':
        return 'bg-blue-500 bg-opacity-10 text-blue-500';
      case 'Beginner':
        return 'bg-purple-500 bg-opacity-10 text-purple-500';
      default:
        return 'bg-gray-500 bg-opacity-10 text-gray-500';
    }
  };

  // Count content items by type
  const getCourseContentCount = (courseId: string, type: 'class' | 'test' | 'assignment') => {
    if (type === 'class') return classes?.filter(c => c.courseId === courseId).length ?? 0;
    if (type === 'test') return tests?.filter(t => t.courseId === courseId).length ?? 0;
    if (type === 'assignment') return assignments?.filter(a => a.courseId === courseId).length ?? 0;
    return 0;
  };

  const isLoading = isLoadingCourses || isLoadingClasses || isLoadingTests || isLoadingAssignments || isLoadingProgress;

  const renderCourseCard = (course: CourseWithProgress) => (
    <Card key={course._id} className="overflow-hidden">
      <div className="relative h-40 overflow-hidden">
        <img
          src={course.image}
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
          <Badge className={getCategoryColor(course.category ?? '')}>
            {course.category ?? 'General'}
          </Badge>
          <div className="flex items-center">
          <span className="text-xs text-gray-500 dark:text-gray-400">
            <Badge className={getSkillLevelColor(course.skillLevel ?? '')}>
            <Gauge className="text-gray-500 dark:text-gray-400 h-4 w-4 mr-1" />
            {course.skillLevel}
            </Badge>
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
            <span>{getCourseContentCount(course._id ?? '', 'class')} Classes</span>
          </div>
          <div className="bg-gray-50 dark:bg-dark-border p-2 rounded">
            <FileQuestion className="h-4 w-4 mx-auto mb-1 text-secondary" />
            <span>{getCourseContentCount(course._id ?? '', 'test')} Tests</span>
          </div>
          <div className="bg-gray-50 dark:bg-dark-border p-2 rounded">
            <ClipboardList className="h-4 w-4 mx-auto mb-1 text-green-500" />
            <span>{getCourseContentCount(course._id ?? '', 'assignment')} Assignments</span>
          </div>
        </div>
      </CardContent>
      <CardFooter className="flex items-center justify-between pt-4">
        <Avatar>
          <AvatarFallback>{course.instructor.initials}</AvatarFallback>
        </Avatar>
        <div className="ml-3">
          <p className="text-sm font-medium text-gray-900 dark:text-white">{course.instructor.name}</p>
          <p className="text-xs text-gray-500 dark:text-gray-400">{course.instructor.title}</p>
        </div>
        <Button variant="ghost" asChild>
          <Link href={`/student/courses/${course._id}`}>View Details</Link>
        </Button>
      </CardFooter>
    </Card>
  );

  return (
    <StudentLayout>
      <div className="container mx-auto p-4">
        <Tabs defaultValue="all" className="w-full">
          <TabsList>
            <TabsTrigger value="all">All Courses</TabsTrigger>
            <TabsTrigger value="in-progress">In Progress</TabsTrigger>
            <TabsTrigger value="completed">Completed</TabsTrigger>
          </TabsList>

          <TabsContent value="all" className="m-0">
            {isLoading && (
              <div className="my-20 flex flex-col items-center justify-center text-gray-600 dark:text-gray-400 space-y-4">
                <Loader2 className="animate-spin h-10 w-10" />
                <p>Loading courses...</p>
              </div>
            )}

            {!isLoading && allCourses.length === 0 && (
              <div className="my-20 flex flex-col items-center justify-center space-y-2 text-center text-gray-600 dark:text-gray-400">
                <School className="w-12 h-12" />
                <p className="text-lg font-semibold">No courses found</p>
                <p className="text-sm">Start learning to see courses here</p>
              </div>
            )}

            {!isLoading && allCourses.length > 0 && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {allCourses.map(renderCourseCard)}
              </div>
            )}
          </TabsContent>

          <TabsContent value="in-progress" className="m-0">
            {!isLoading && inProgressCourses.length === 0 && (
              <div className="my-16 flex flex-col items-center justify-center space-y-3 text-gray-600 dark:text-gray-400">
                <School className="w-14 h-14" />
                <h3 className="text-xl font-semibold">No courses in progress</h3>
                <p>Start learning to see courses here</p>
              </div>
            )}

            {!isLoading && inProgressCourses.length > 0 && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {inProgressCourses.map(renderCourseCard)}
              </div>
            )}
          </TabsContent>

          <TabsContent value="completed" className="m-0">
            {!isLoading && completedCourses.length === 0 && (
              <div className="my-16 flex flex-col items-center justify-center space-y-3 text-gray-600 dark:text-gray-400">
                <CheckCircle className="w-14 h-14" />
                <h3 className="text-xl font-semibold">No completed courses yet</h3>
                <p>Complete courses to see them here</p>
              </div>
            )}

            {!isLoading && completedCourses.length > 0 && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {completedCourses.map(renderCourseCard)}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </StudentLayout>
  );
}
