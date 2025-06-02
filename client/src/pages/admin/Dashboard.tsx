import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@/providers/AuthProvider';
import AdminLayout from '@/components/layout/AdminLayout';
import StatCard from '@/components/dashboard/StatCard';
import { DashboardStats } from '@shared/types';
import { 
  User, 
  School, 
  FileQuestion, 
  ClipboardList,
  CheckCircle,
  UserPlus,
  Edit,
  AlertTriangle,
  Airplay
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Link } from 'wouter';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { format } from 'date-fns';

interface Test {
  _id: string;
  title: string;
  courseId: string;
  questions: any[];
  visibility: 'public' | 'private';
  assignedTo: string[];
  isActive: boolean;
  course?: {
    title: string;
  };
}

interface Assignment {
  _id: string;
  title: string;
  courseId: string;
  questions: any[];
  visibility: 'public' | 'private';
  assignedTo: string[];
  timeWindow: {
    startTime: string;
    endTime: string;
  };
  course?: {
    title: string;
  };
}

export default function AdminDashboard() {
  const { user } = useAuth();

  // Fetch dashboard stats
  const { data: stats, isLoading: isLoadingStats } = useQuery<DashboardStats>({
    queryKey: ['/api/admin/dashboard/stats'],
  });

  // Fetch recent courses
  const { data: courses, isLoading: isLoadingCourses } = useQuery<any>({
    queryKey: ['/api/admin/courses/recent'],
  });

  // Fetch tests
  const { data: tests, isLoading: isLoadingTests } = useQuery<Test[]>({
    queryKey: ['/api/admin/tests'],
  });

  // Fetch assignments
  const { data: assignments, isLoading: isLoadingAssignments } = useQuery<Assignment[]>({
    queryKey: ['/api/admin/assignments'],
  });

  // Find course name by ID
  const getCourseName = (courseId: string) => {
    const course = courses?.find((c: { _id: string; title: string }) => c._id === courseId);
    return course?.title || 'Unknown Course';
  };

  // Check if assignment is active
  const isAssignmentActive = (assignment: Assignment) => {
    const now = new Date();
    const startTime = new Date(assignment.timeWindow?.startTime || Date.now());
    const endTime = new Date(assignment.timeWindow?.endTime || Date.now() + 7 * 24 * 60 * 60 * 1000);
    return now >= startTime && now <= endTime;
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Welcome Section */}
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold text-gray-800 dark:text-white">Welcome back, {user?.name}!</h2>
            <p className="text-gray-600 dark:text-gray-400">Here's what's happening with your courses today.</p>
          </div>
          <div className="mt-4 md:mt-0 flex space-x-3">
            <Link href="/admin/courses">
              <Button>
                <span className="mr-1">+</span>
                Create Course
              </Button>
            </Link>
          </div>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {isLoadingStats ? (
            Array(4).fill(0).map((_, i) => (
              <div key={i} className="bg-white dark:bg-dark-surface h-24 animate-pulse rounded-lg"></div>
            ))
          ) : (
            <>
              <StatCard
                title="Active Students"
                value={stats?.students || 0}
                icon={User}
                iconColor="text-primary"
                iconBgColor="bg-primary-light bg-opacity-10"
              />
              <StatCard
                title="Active Courses"
                value={stats?.courses || 0}
                icon={Airplay}
                iconColor="text-secondary"
                iconBgColor="bg-primary-light bg-opacity-10"
              />
              <StatCard
                title="Tests Created"
                value={stats?.tests || 0}
                icon={FileQuestion}
                iconColor="text-warning"
                iconBgColor="bg-warning bg-opacity-10"
              />
              <StatCard
                title="Pending Assignments"
                value={stats?.assignments || 0}
                icon={ClipboardList}
                iconColor="text-error"
                iconBgColor="bg-error bg-opacity-10"
              />
            </>
          )}
        </div>

        {/* Tests and Assignments Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Tests Section */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Recent Tests</CardTitle>
                <CardDescription>Tests created by admins</CardDescription>
              </div>
              <Link href="/admin/tests">
                <Button variant="ghost" size="sm">
                  View All
                </Button>
              </Link>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {tests && tests.length > 0 ? (
                  tests.slice(0, 5).map((test) => (
                    <Link
                      key={test._id}
                      href={`/admin/tests/`}
                      className="block"
                    >
                      <div className="flex items-center justify-between p-4 rounded-lg border bg-card hover:bg-accent/50 transition-colors">
                        <div className="space-y-1">
                          <h4 className="font-medium">{test.title}</h4>
                          <p className="text-sm text-muted-foreground">
                            {getCourseName(test.courseId)} • {test.questions.length} questions
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge variant={test.visibility === 'public' ? 'default' : 'secondary'}>
                            {test.visibility}
                          </Badge>
                        </div>
                      </div>
                    </Link>
                  ))
                ) : (
                  <p className="text-sm text-muted-foreground">No tests found</p>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Assignments Section */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Recent Assignments</CardTitle>
                <CardDescription>Assignments created by admins</CardDescription>
              </div>
              <Link href="/admin/assignments">
                <Button variant="ghost" size="sm">
                  View All
                </Button>
              </Link>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {assignments && assignments.length > 0 ? (
                  assignments.slice(0, 5).map((assignment) => {
                    const isActive = isAssignmentActive(assignment);
                    return (
                      <Link
                        key={assignment._id}
                        href={`/admin/assignments/`}
                        className="block"
                      >
                        <div className="flex items-center justify-between p-4 rounded-lg border bg-card hover:bg-accent/50 transition-colors">
                          <div className="space-y-1">
                            <h4 className="font-medium">{assignment.title}</h4>
                            <p className="text-sm text-muted-foreground">
                              {getCourseName(assignment.courseId)}
                            </p>
                            {assignment.timeWindow && (
                              <p className="text-sm text-muted-foreground">
                                Due: {format(new Date(assignment.timeWindow.endTime), 'MMM dd, yyyy HH:mm')}
                              </p>
                            )}
                          </div>
                          <div className="flex items-center gap-2">
                            <Badge variant={assignment.visibility === 'public' ? 'default' : 'secondary'}>
                              {assignment.visibility}
                            </Badge>
                            <Badge variant={isActive ? 'default' : 'destructive'}>
                              {isActive ? 'Active' : 'Inactive'}
                            </Badge>
                          </div>
                        </div>
                      </Link>
                    );
                  })
                ) : (
                  <p className="text-sm text-muted-foreground">No assignments found</p>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </AdminLayout>
  );
}

