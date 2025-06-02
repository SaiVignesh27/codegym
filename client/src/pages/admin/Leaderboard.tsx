import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import AdminLayout from '@/components/layout/AdminLayout';
import { LeaderboardEntry } from '@shared/types';
import { format } from 'date-fns';

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Course, Test, Assignment } from '@shared/schema';
import { Loader2, Search, Trophy, Medal, Star, Download, FileQuestion, ClipboardList } from 'lucide-react';

export default function Leaderboard() {
  const [selectedCourse, setSelectedCourse] = useState<string>('all');
  const [contentType, setContentType] = useState<'test' | 'assignment'>('test');
  const [selectedItem, setSelectedItem] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  
  // Fetch courses
  const { data: courses, isLoading: isLoadingCourses } = useQuery<Course[]>({
    queryKey: ['/api/admin/courses'],
  });
  
  // Fetch tests
  const { data: tests, isLoading: isLoadingTests } = useQuery<Test[]>({
    queryKey: ['/api/admin/tests'],
  });
  
  // Fetch assignments
  const { data: assignments, isLoading: isLoadingAssignments } = useQuery<Assignment[]>({
    queryKey: ['/api/admin/assignments'],
  });
  
  // Fetch leaderboard entries
  const { data: leaderboardEntries, isLoading: isLoadingLeaderboard } = useQuery<LeaderboardEntry[]>({
    queryKey: ['/api/admin/leaderboard', { 
      courseId: selectedCourse,
      contentType,
      itemId: selectedItem
    }],
  });

  // Filter leaderboard by search query
  const filteredEntries = leaderboardEntries?.filter(entry => 
    entry.studentName.toLowerCase().includes(searchQuery.toLowerCase())
  ) || [];

  // Get the title of a test or assignment
  const getItemTitle = (itemId: string) => {
    if (!itemId) return '';
    
    if (contentType === 'test') {
      const test = tests?.find(t => t._id === itemId);
      return test?.title || 'Unknown Test';
    } else {
      const assignment = assignments?.find(a => a._id === itemId);
      return assignment?.title || 'Unknown Assignment';
    }
  };

  // Get course name
  const getCourseName = (courseId: string) => {
    if (!courseId) return '';
    const course = courses?.find(c => c._id === courseId);
    return course?.title || 'Unknown Course';
  };

  // Format date
  const formatDate = (date: Date) => {
    return format(date, 'MMM dd, yyyy HH:mm');
  };

  // Handle export to CSV
  const exportToCSV = () => {
    if (!leaderboardEntries || leaderboardEntries.length === 0) return;
    
    const headers = ['Rank', 'Student Name', 'Course', 'Item Type', 'Item Title', 'Score', 'Completed At'];
    
    const csvData = filteredEntries.map((entry, index) => [
      (index + 1).toString(),
      entry.studentName,
      getCourseName(entry.courseId || ''),
      contentType === 'test' ? 'Test' : 'Assignment',
      getItemTitle(contentType === 'test' ? entry.testId || '' : entry.assignmentId || ''),
      entry.score.toString(),
      formatDate(new Date(entry.completedAt))
    ]);
    
    const csvContent = [
      headers.join(','),
      ...csvData.map(row => row.join(','))
    ].join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `codegym-leaderboard-${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };
  
  // Get medal icon based on rank
  const getMedalIcon = (index: number) => {
    switch (index) {
      case 0:
        return <Medal className="h-5 w-5 text-yellow-500" fill="currentColor" />;
      case 1:
        return <Medal className="h-5 w-5 text-gray-400" fill="currentColor" />;
      case 2:
        return <Medal className="h-5 w-5 text-amber-700" fill="currentColor" />;
      default:
        return null;
    }
  };

  const getFilteredEntries = () => {
    if (!leaderboardEntries) return [];
    let filtered = leaderboardEntries.filter((entry) => {
      const isTestEntry = entry.testId !== undefined && entry.testId !== null;
      const isAssignmentEntry = entry.assignmentId !== undefined && entry.assignmentId !== null;

      if (contentType === 'test') {
        return isTestEntry;
      } else if (contentType === 'assignment') {
        return isAssignmentEntry;
      }
      // Should not reach here if contentType is always 'test' or 'assignment'
      return false;
    });

    if (selectedItem !== 'all') {
      filtered = filtered.filter((entry) =>
        contentType === 'test' ? entry.testId === selectedItem : entry.assignmentId === selectedItem
      );
    }
    return [...filtered].sort((a, b) => b.score - a.score);
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-800 dark:text-white">Leaderboard</h2>
            <p className="text-gray-600 dark:text-gray-400">Track student performance across tests and assignments</p>
          </div>
          <Button variant="outline" onClick={exportToCSV} disabled={!leaderboardEntries || leaderboardEntries.length === 0}>
            <Download className="mr-2 h-4 w-4" />
            Export to CSV
          </Button>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Student Rankings</CardTitle>
            <CardDescription>View and filter student performance</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-4 sm:space-y-0">
              <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2 w-full sm:w-auto">
                <div className="relative w-full sm:w-60">
                  <Search className="absolute left-2 top-2.5 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Search by student name"
                    className="pl-8"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
                
                <Select
                  value={selectedCourse}
                  onValueChange={setSelectedCourse}
                >
                  <SelectTrigger className="w-full sm:w-60">
                    <SelectValue placeholder="Filter by course" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Courses</SelectItem>
                    {courses?.map((course) => (
                      <SelectItem key={course._id} value={course._id as string}>
                        {course.title}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Select
                  value={contentType}
                  onValueChange={(value: 'test' | 'assignment') => {
                    setContentType(value);
                    setSelectedItem('all');
                  }}
                >
                  <SelectTrigger className="w-full sm:w-40">
                    <SelectValue placeholder="Content type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="test">Tests</SelectItem>
                    <SelectItem value="assignment">Assignments</SelectItem>
                  </SelectContent>
                </Select>

                <Select
                  value={selectedItem}
                  onValueChange={setSelectedItem}
                >
                  <SelectTrigger className="w-full sm:w-60">
                    <SelectValue placeholder={`Select ${contentType === 'test' ? 'test' : 'assignment'}`} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All {contentType === 'test' ? 'Tests' : 'Assignments'}</SelectItem>
                    {contentType === 'test' 
                      ? tests?.map((test) => (
                          <SelectItem key={test._id} value={test._id || ''}>
                            {test.title}
                          </SelectItem>
                        ))
                      : assignments?.map((assignment) => (
                          <SelectItem key={assignment._id} value={assignment._id || ''}>
                            {assignment.title}
                          </SelectItem>
                        ))
                    }
                  </SelectContent>
                </Select>
              </div>
            </div>

            {isLoadingLeaderboard ? (
              <div className="flex justify-center py-8">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : getFilteredEntries().length > 0 ? (
              <div className="rounded-md border overflow-hidden mt-6">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-[80px]">Rank</TableHead>
                      <TableHead>Student</TableHead>
                      <TableHead>Course</TableHead>
                      <TableHead>{contentType === 'test' ? 'Test' : 'Assignment'}</TableHead>
                      <TableHead className="text-right">Score</TableHead>
                      <TableHead className="text-right">Completed</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {getFilteredEntries().map((entry, index) => (
                      <TableRow key={`${entry.studentId}-${entry.testId || entry.assignmentId}`}>
                        <TableCell className="font-medium">
                          <div className="flex items-center">
                            {getMedalIcon(index)}
                            <span className="ml-1">{index + 1}</span>
                          </div>
                        </TableCell>
                        <TableCell>{entry.studentName}</TableCell>
                        <TableCell>{getCourseName(entry.courseId || '')}</TableCell>
                        <TableCell>
                          <div className="flex items-center">
                            {contentType === 'test' ? (
                              <FileQuestion className="h-4 w-4 text-secondary mr-2" />
                            ) : (
                              <ClipboardList className="h-4 w-4 text-warning mr-2" />
                            )}
                            {getItemTitle(contentType === 'test' ? entry.testId || '' : entry.assignmentId || '')}
                          </div>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end">
                            <Star className="h-4 w-4 text-yellow-500 mr-1" fill="currentColor" />
                            <span>{entry.score}%</span>
                          </div>
                        </TableCell>
                        <TableCell className="text-right">{entry.completedAt ? formatDate(new Date(entry.completedAt)) : 'N/A'}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            ) : (
              <div className="text-center py-12 text-gray-500 dark:text-gray-400">
                <Trophy className="h-12 w-12 mx-auto mb-4 opacity-20" />
                <h3 className="text-lg font-medium">No leaderboard data found</h3>
                <p className="text-sm">Students need to complete {contentType === 'test' ? 'tests' : 'assignments'} to appear here</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
}