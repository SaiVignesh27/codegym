import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import StudentLayout from '@/components/layout/StudentLayout';
import { LeaderboardEntry } from '@shared/types';
import { Course } from '@shared/schema';
import { format } from 'date-fns';

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { 
  Loader2, 
  Trophy, 
  Medal, 
  Star, 
  TrendingUp,
  User,
  BookOpen,
  FileQuestion,
  ClipboardList
} from 'lucide-react';

export default function Leaderboard() {
  const [timeFilter, setTimeFilter] = useState('week');
  const [courseFilter, setCourseFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');
  
  // Fetch leaderboard data
  const { data: leaderboardData, isLoading } = useQuery<LeaderboardEntry[]>({
    queryKey: ['/api/student/leaderboard', timeFilter, courseFilter, typeFilter],
    refetchInterval: 30000, // Refetch every 30 seconds
  });
  
  // Fetch courses for filter
  const { data: courses = [] } = useQuery<Course[]>({
    queryKey: ['/api/student/courses'],
  });
  
  // Format date
  const formatDate = (date: Date) => {
    return format(date, 'MMM dd, yyyy');
  };
  
  // Get user initials for avatar
  const getUserInitials = (name: string) => {
    if (!name) return 'U';
    
    const names = name.split(' ');
    if (names.length >= 2) {
      return `${names[0][0]}${names[names.length - 1][0]}`.toUpperCase();
    }
    
    return names[0].substring(0, 2).toUpperCase();
  };
  
  // Get badge for rank
  const getRankBadge = (rank: number) => {
    if (rank === 1) {
      return (
        <div className="flex items-center">
          <Trophy className="h-5 w-5 mr-1 text-yellow-500" fill="currentColor" />
          <span className="font-bold">1st</span>
        </div>
      );
    } else if (rank === 2) {
      return (
        <div className="flex items-center">
          <Medal className="h-5 w-5 mr-1 text-gray-400" fill="currentColor" />
          <span className="font-bold">2nd</span>
        </div>
      );
    } else if (rank === 3) {
      return (
        <div className="flex items-center">
          <Medal className="h-5 w-5 mr-1 text-amber-700" fill="currentColor" />
          <span className="font-bold">3rd</span>
        </div>
      );
    }
    
    return <span className="font-medium">{rank}th</span>;
  };
  
  // Get course name
  const getCourseName = (courseId?: string) => {
    if (!courseId) return 'All Courses';
    const course = courses.find(course => course._id === courseId);
    return course?.title || 'Unknown Course';
  };
  
  // Get content type
  const getContentType = (entry: LeaderboardEntry) => {
    if (entry.testId) return 'Test';
    if (entry.assignmentId) return 'Assignment';
    return 'Course';
  };
  
  // Get content icon
  const getContentIcon = (entry: LeaderboardEntry) => {
    if (entry.testId) {
      return <FileQuestion className="h-4 w-4 text-secondary" />;
    }
    if (entry.assignmentId) {
      return <ClipboardList className="h-4 w-4 text-warning" />;
    }
    return <BookOpen className="h-4 w-4 text-primary" />;
  };

  return (
    <StudentLayout>
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-800 dark:text-white">Leaderboard</h2>
          <p className="text-gray-600 dark:text-gray-400">See how you compare with other students</p>
        </div>

        <div className="flex flex-col md:flex-row space-y-4 md:space-y-0 md:space-x-4 items-start md:items-center">
          <Select
            value={timeFilter}
            onValueChange={setTimeFilter}
          >
            <SelectTrigger className="w-full md:w-40">
              <SelectValue placeholder="Time period" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="week">This Week</SelectItem>
              <SelectItem value="month">This Month</SelectItem>
              <SelectItem value="year">This Year</SelectItem>
              <SelectItem value="all">All Time</SelectItem>
            </SelectContent>
          </Select>
          
          <Select
            value={courseFilter}
            onValueChange={setCourseFilter}
          >
            <SelectTrigger className="w-full md:w-60">
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
          
          <Select
            value={typeFilter}
            onValueChange={setTypeFilter}
          >
            <SelectTrigger className="w-full md:w-40">
              <SelectValue placeholder="Content type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              <SelectItem value="course">Courses</SelectItem>
              <SelectItem value="test">Tests</SelectItem>
              <SelectItem value="assignment">Assignments</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <Tabs defaultValue="overall" className="space-y-6">
          <TabsList>
            <TabsTrigger value="overall">Overall Ranking</TabsTrigger>
            <TabsTrigger value="personal">Your Progress</TabsTrigger>
          </TabsList>
          
          <TabsContent value="overall" className="m-0">
            <Card>
              <CardHeader>
                <CardTitle>Top Students</CardTitle>
                <CardDescription>
                  Students ranked by their performance across all content
                </CardDescription>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <div className="flex justify-center py-8">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                  </div>
                ) : leaderboardData && leaderboardData.length > 0 ? (
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead className="w-16">Rank</TableHead>
                          <TableHead>Student</TableHead>
                          <TableHead>Content</TableHead>
                          <TableHead className="text-right">Score</TableHead>
                          <TableHead className="text-right">Completed</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {leaderboardData.map((entry, index) => (
                          <TableRow key={entry.studentId + index} className={index < 3 ? "font-medium" : ""}>
                            <TableCell className="font-medium">
                              {getRankBadge(index + 1)}
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center">
                                <Avatar className="h-8 w-8 mr-2">
                                  <AvatarFallback className={
                                    index === 0
                                      ? "bg-yellow-500 text-white"
                                      : index === 1
                                      ? "bg-gray-400 text-white"
                                      : index === 2
                                      ? "bg-amber-700 text-white"
                                      : "bg-primary text-white"
                                  }>
                                    {getUserInitials(entry.studentName)}
                                  </AvatarFallback>
                                </Avatar>
                                <div>
                                  <div className="font-medium">{entry.studentName}</div>
                                  <div className="text-sm text-gray-500">
                                    {getCourseName(entry.courseId)}
                                  </div>
                                </div>
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center">
                                {getContentIcon(entry)}
                                <span className="ml-2">{getContentType(entry)}</span>
                              </div>
                            </TableCell>
                            <TableCell className="text-right">
                              <div className="flex items-center justify-end">
                                <Star className="h-4 w-4 text-yellow-500 mr-1" fill="currentColor" />
                                <span className="font-bold">{entry.score}%</span>
                              </div>
                            </TableCell>
                            <TableCell className="text-right text-gray-500">
                              {formatDate(new Date(entry.completedAt))}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                ) : (
                  <div className="text-center py-12 text-gray-500 dark:text-gray-400">
                    <Trophy className="h-12 w-12 mx-auto mb-4 opacity-20" />
                    <h3 className="text-lg font-medium">No leaderboard data available</h3>
                    <p className="text-sm">Complete courses, tests, or assignments to appear on the leaderboard</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="personal" className="m-0">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg">Your Rank</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-center py-4">
                    <div className="text-center">
                      <div className="relative">
                        <Avatar className="h-20 w-20 mx-auto">
                          <AvatarFallback className="bg-primary text-white text-2xl">
                            <User className="h-10 w-10" />
                          </AvatarFallback>
                        </Avatar>
                        <div className="absolute -top-2 -right-2 bg-primary text-white rounded-full h-8 w-8 flex items-center justify-center border-2 border-background">
                          <span className="font-bold">5</span>
                        </div>
                      </div>
                      <h3 className="text-xl font-bold mt-3">John Doe</h3>
                      <p className="text-gray-500 dark:text-gray-400">5th Place Overall</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg">Total Points</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-center py-4">
                    <div className="text-center">
                      <div className="text-4xl font-bold text-primary">850</div>
                      <div className="flex items-center justify-center mt-1 text-green-600 dark:text-green-400">
                        <TrendingUp className="h-4 w-4 mr-1" />
                        <span className="text-sm">+120 this week</span>
                      </div>
                      <p className="text-gray-500 dark:text-gray-400 mt-1">Points earned across all courses</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg">Achievements</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <Badge className="bg-primary-light bg-opacity-10 text-primary mr-2">
                          <Star className="h-3 w-3 mr-1" fill="currentColor" />
                          5
                        </Badge>
                        <span className="text-sm">Course Completions</span>
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <Badge className="bg-secondary bg-opacity-10 text-secondary mr-2">
                          <Star className="h-3 w-3 mr-1" fill="currentColor" />
                          12
                        </Badge>
                        <span className="text-sm">Tests Completed</span>
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <Badge className="bg-warning bg-opacity-10 text-warning mr-2">
                          <Star className="h-3 w-3 mr-1" fill="currentColor" />
                          8
                        </Badge>
                        <span className="text-sm">Assignments Submitted</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card className="md:col-span-3">
                <CardHeader>
                  <CardTitle>Your Recent Achievements</CardTitle>
                  <CardDescription>
                    Track your progress and achievements over time
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {isLoading ? (
                    <div className="flex justify-center py-8">
                      <Loader2 className="h-8 w-8 animate-spin text-primary" />
                    </div>
                  ) : (
                    <div className="overflow-x-auto">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Content</TableHead>
                            <TableHead>Type</TableHead>
                            <TableHead>Course</TableHead>
                            <TableHead className="text-right">Score</TableHead>
                            <TableHead className="text-right">Completed</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {/* Sample data - would be from user's actual results */}
                          <TableRow>
                            <TableCell>
                              <div className="font-medium">JavaScript Basics</div>
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center">
                                <BookOpen className="h-4 w-4 text-primary mr-1" />
                                <span>Course</span>
                              </div>
                            </TableCell>
                            <TableCell>Web Development</TableCell>
                            <TableCell className="text-right">
                              <div className="flex items-center justify-end">
                                <Star className="h-4 w-4 text-yellow-500 mr-1" fill="currentColor" />
                                <span className="font-bold">92%</span>
                              </div>
                            </TableCell>
                            <TableCell className="text-right text-gray-500">
                              {formatDate(new Date())}
                            </TableCell>
                          </TableRow>
                          <TableRow>
                            <TableCell>
                              <div className="font-medium">React Components</div>
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center">
                                <FileQuestion className="h-4 w-4 text-secondary mr-1" />
                                <span>Test</span>
                              </div>
                            </TableCell>
                            <TableCell>Frontend Development</TableCell>
                            <TableCell className="text-right">
                              <div className="flex items-center justify-end">
                                <Star className="h-4 w-4 text-yellow-500 mr-1" fill="currentColor" />
                                <span className="font-bold">88%</span>
                              </div>
                            </TableCell>
                            <TableCell className="text-right text-gray-500">
                              {formatDate(new Date())}
                            </TableCell>
                          </TableRow>
                          <TableRow>
                            <TableCell>
                              <div className="font-medium">API Integration</div>
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center">
                                <ClipboardList className="h-4 w-4 text-warning mr-1" />
                                <span>Assignment</span>
                              </div>
                            </TableCell>
                            <TableCell>Backend Development</TableCell>
                            <TableCell className="text-right">
                              <div className="flex items-center justify-end">
                                <Star className="h-4 w-4 text-yellow-500 mr-1" fill="currentColor" />
                                <span className="font-bold">95%</span>
                              </div>
                            </TableCell>
                            <TableCell className="text-right text-gray-500">
                              {formatDate(new Date())}
                            </TableCell>
                          </TableRow>
                        </TableBody>
                      </Table>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </StudentLayout>
  );
}