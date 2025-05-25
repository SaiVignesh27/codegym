import React from 'react';
import { useQuery } from '@tanstack/react-query';
import AdminLayout from '@/components/layout/AdminLayout';
import StatCard from '@/components/dashboard/StatCard';
import CourseCard from '@/components/dashboard/CourseCard';
import TestItem from '@/components/dashboard/TestItem';
import ActivityItem from '@/components/dashboard/ActivityItem';
import CodeEditor from '@/components/editor/CodeEditor';
import { DashboardStats, RecentActivity } from '@shared/types';
import { 
  User, 
  School, 
  FileQuestion, 
  ClipboardList,
  CheckCircle,
  UserPlus,
  Edit,
  AlertTriangle
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Link } from 'wouter';

// Sample code for the code editor demo
const sampleCode = `/**
 * Find the maximum value in an array of numbers
 * @param {number[]} arr - The input array of numbers
 * @return {number} The maximum value in the array
 */
function findMax(arr) {
  // Your solution here
  if (arr.length === 0) {
    return null;
  }
  
  let max = arr[0];
  
  for (let i = 1; i < arr.length; i++) {
    if (arr[i] > max) {
      max = arr[i];
    }
  }
  
  return max;
}

// Test cases
console.log(findMax([1, 3, 5, 7, 9])); // Expected: 9
console.log(findMax([-1, -5, -10]));   // Expected: -1
console.log(findMax([]));              // Expected: null`;

export default function AdminDashboard() {
  // Fetch dashboard stats
  const { data: stats, isLoading: isLoadingStats } = useQuery<DashboardStats>({
    queryKey: ['/api/admin/dashboard/stats'],
  });

  // Fetch recent courses
  const { data: courses, isLoading: isLoadingCourses } = useQuery<any>({
    queryKey: ['/api/admin/courses/recent'],
  });

  // Fetch recent tests
  const { data: tests, isLoading: isLoadingTests } = useQuery<any>({
    queryKey: ['/api/admin/tests/recent'],
  });

  // Fetch recent activities
  const { data: activities, isLoading: isLoadingActivities } = useQuery<RecentActivity[]>({
    queryKey: ['/api/admin/activities/recent'],
  });

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Welcome Section */}
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold text-gray-800 dark:text-white">Welcome back, John!</h2>
            <p className="text-gray-600 dark:text-gray-400">Here's what's happening with your courses today.</p>
          </div>
          <div className="mt-4 md:mt-0 flex space-x-3">
            <Link href="/admin/courses/new">
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
                trend={{ value: 12, isPositive: true, text: "vs last month" }}
              />
              <StatCard
                title="Active Courses"
                value={stats?.courses || 0}
                icon={School}
                iconColor="text-secondary"
                iconBgColor="bg-secondary bg-opacity-10"
                trend={{ value: 4, isPositive: true, text: "vs last month" }}
              />
              <StatCard
                title="Tests Created"
                value={stats?.tests || 0}
                icon={FileQuestion}
                iconColor="text-warning"
                iconBgColor="bg-warning bg-opacity-10"
                trend={{ value: 7, isPositive: true, text: "vs last month" }}
              />
              <StatCard
                title="Pending Assignments"
                value={stats?.assignments || 0}
                icon={ClipboardList}
                iconColor="text-error"
                iconBgColor="bg-error bg-opacity-10"
                trend={{ value: 3, isPositive: false, text: "vs last month" }}
              />
            </>
          )}
        </div>

        {/* Recent Courses */}
        <div className="bg-white dark:bg-dark-surface rounded-lg shadow-sm border border-light-border dark:border-dark-border p-4">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-800 dark:text-white">Recent Courses</h3>
            <Link href="/admin/courses">
              <a className="text-primary hover:text-primary-dark text-sm font-medium">View all</a>
            </Link>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {isLoadingCourses ? (
              Array(3).fill(0).map((_, i) => (
                <div key={i} className="bg-gray-100 dark:bg-dark-border h-64 animate-pulse rounded-lg"></div>
              ))
            ) : (
              <>
                <CourseCard
                  id="1"
                  title="JavaScript Fundamentals"
                  description="A comprehensive course covering JavaScript basics to advanced concepts."
                  category="JavaScript"
                  categoryColor="bg-primary-light bg-opacity-10 text-primary"
                  students={48}
                  instructor={{ name: "John Doe", initials: "JD" }}
                  rating={4.8}
                  imageUrl="https://images.unsplash.com/photo-1522202176988-66273c2fd55f?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&h=300"
                />
                <CourseCard
                  id="2"
                  title="React.js Development"
                  description="Learn to build modern web applications with React.js library."
                  category="React"
                  categoryColor="bg-secondary bg-opacity-10 text-secondary"
                  students={36}
                  instructor={{ name: "John Doe", initials: "JD" }}
                  rating={4.9}
                  imageUrl="https://images.unsplash.com/photo-1516321318423-f06f85e504b3?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&h=300"
                />
                <CourseCard
                  id="3"
                  title="Node.js Backend Development"
                  description="Server-side JavaScript development with Node.js and Express."
                  category="Node.js"
                  categoryColor="bg-green-500 bg-opacity-10 text-green-500"
                  students={29}
                  instructor={{ name: "John Doe", initials: "JD" }}
                  rating={4.7}
                  imageUrl="https://images.unsplash.com/photo-1550439062-609e1531270e?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&h=300"
                />
              </>
            )}
          </div>
        </div>

        {/* Recent Tests & Activity */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Recent Tests */}
          <div className="bg-white dark:bg-dark-surface rounded-lg shadow-sm border border-light-border dark:border-dark-border p-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-800 dark:text-white">Recent Tests</h3>
              <Link href="/admin/tests/new">
                <a className="text-primary hover:text-primary-dark text-sm font-medium">Create New</a>
              </Link>
            </div>
            
            <div className="space-y-3">
              {isLoadingTests ? (
                Array(4).fill(0).map((_, i) => (
                  <div key={i} className="bg-gray-100 dark:bg-dark-border h-16 animate-pulse rounded-lg"></div>
                ))
              ) : (
                <>
                  <TestItem
                    id="1"
                    title="JavaScript Arrays & Objects"
                    course="JavaScript Fundamentals"
                    questionCount={10}
                    isActive={true}
                    icon={FileQuestion}
                    iconColor="text-primary"
                    iconBgColor="bg-primary-light bg-opacity-10"
                  />
                  <TestItem
                    id="2"
                    title="React Hooks Fundamentals"
                    course="React.js Development"
                    questionCount={8}
                    isActive={true}
                    icon={FileQuestion}
                    iconColor="text-secondary"
                    iconBgColor="bg-secondary bg-opacity-10"
                  />
                  <TestItem
                    id="3"
                    title="RESTful API Design"
                    course="Node.js Backend Development"
                    questionCount={12}
                    isActive={false}
                    icon={FileQuestion}
                    iconColor="text-green-500"
                    iconBgColor="bg-green-500 bg-opacity-10"
                  />
                  <TestItem
                    id="4"
                    title="MongoDB Aggregation"
                    course="Database Management"
                    questionCount={8}
                    isActive={true}
                    icon={FileQuestion}
                    iconColor="text-purple-500"
                    iconBgColor="bg-purple-500 bg-opacity-10"
                  />
                </>
              )}
            </div>
          </div>
          
          {/* Recent Activity */}
          <div className="bg-white dark:bg-dark-surface rounded-lg shadow-sm border border-light-border dark:border-dark-border p-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-800 dark:text-white">Recent Activity</h3>
              <a href="#" className="text-primary hover:text-primary-dark text-sm font-medium">View all</a>
            </div>
            
            <div className="relative">
              {/* Timeline Connector */}
              <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-gray-200 dark:bg-gray-700"></div>
              
              {/* Activity Items */}
              <div className="space-y-4">
                {isLoadingActivities ? (
                  Array(4).fill(0).map((_, i) => (
                    <div key={i} className="pl-8">
                      <div className="bg-gray-100 dark:bg-dark-border h-12 animate-pulse rounded-lg"></div>
                    </div>
                  ))
                ) : (
                  <>
                    <ActivityItem
                      icon={CheckCircle}
                      iconColor="text-white"
                      iconBgColor="bg-green-500"
                      title="Emma Wilson completed 'JavaScript Promises' test"
                      description="Score: 92%"
                      timestamp={new Date(Date.now() - 30 * 60 * 1000)} // 30 minutes ago
                    />
                    <ActivityItem
                      icon={UserPlus}
                      iconColor="text-white"
                      iconBgColor="bg-primary"
                      title="5 new students enrolled in 'React.js Development'"
                      description=""
                      timestamp={new Date(Date.now() - 60 * 60 * 1000)} // 1 hour ago
                    />
                    <ActivityItem
                      icon={Edit}
                      iconColor="text-white"
                      iconBgColor="bg-warning"
                      title="You updated 'Node.js Middleware' assignment"
                      description=""
                      timestamp={new Date(Date.now() - 2 * 60 * 60 * 1000)} // 2 hours ago
                    />
                    <ActivityItem
                      icon={AlertTriangle}
                      iconColor="text-white"
                      iconBgColor="bg-error"
                      title="Assignment deadline approaching: 'MongoDB Final Project'"
                      description="Due in 2 days"
                      timestamp={new Date(Date.now() + 2 * 24 * 60 * 60 * 1000)} // 2 days from now
                      isLast={true}
                    />
                  </>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Code Editor Preview */}
        <CodeEditor
          initialCode={sampleCode}
          question="Array Manipulation"
          description="This is how coding questions appear to students"
          readOnly={true}
        />
      </div>
    </AdminLayout>
  );
}
