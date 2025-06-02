import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import StudentLayout from '@/components/layout/StudentLayout';
import { LeaderboardEntry } from '@shared/types';
import { Test, Assignment } from '@shared/schema';
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
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Loader2, Trophy, Medal, FileQuestion, ClipboardList, Star } from 'lucide-react';

export default function Leaderboard() {
  const [timeFilter, setTimeFilter] = useState('week');
  const [contentType, setContentType] = useState<'test' | 'assignment'>('test');
  const [selectedItem, setSelectedItem] = useState('all');

  const { data: leaderboardData, isLoading } = useQuery<LeaderboardEntry[]>({
    queryKey: ['/api/student/leaderboard', {
      timeRange: timeFilter,
      type: contentType,
      itemId: selectedItem,
    }],
    refetchInterval: 30000,
  });

  const { data: tests = [] } = useQuery<Test[]>({
    queryKey: ['/api/student/tests'],
  });

  const { data: assignments = [] } = useQuery<Assignment[]>({
    queryKey: ['/api/student/assignments'],
  });

  const formatDate = (date: Date) => format(date, 'MMM dd, yyyy');

  const getUserInitials = (name: string) => {
    if (!name) return 'U';
    const names = name.trim().split(' ');
    return names.length >= 2
      ? `${names[0][0]}${names[names.length - 1][0]}`.toUpperCase()
      : names[0].substring(0, 2).toUpperCase();
  };

  const getRankBadge = (rank: number) => {
    const base = 'flex items-center font-bold';
    if (rank === 1)
      return (
        <div className={base}>
          <Trophy className="h-5 w-5 mr-1 text-yellow-500" fill="currentColor" />1st
        </div>
      );
    if (rank === 2)
      return (
        <div className={base}>
          <Medal className="h-5 w-5 mr-1 text-gray-400" fill="currentColor" />2nd
        </div>
      );
    if (rank === 3)
      return (
        <div className={base}>
          <Medal className="h-5 w-5 mr-1 text-amber-700" fill="currentColor" />3rd
        </div>
      );
    return <span className="font-medium">{rank}th</span>;
  };

  const getFilteredEntries = () => {
    if (!leaderboardData) return [];
    let filtered = leaderboardData.filter((entry) =>
      contentType === 'test' ? Boolean(entry.testId) : Boolean(entry.assignmentId)
    );
    if (selectedItem !== 'all') {
      filtered = filtered.filter((entry) =>
        contentType === 'test' ? entry.testId === selectedItem : entry.assignmentId === selectedItem
      );
    }
    return [...filtered].sort((a, b) => b.score - a.score);
  };

  const filteredEntries = getFilteredEntries();

  const getItemTitle = (entry: LeaderboardEntry) => {
    if (contentType === 'test' && entry.testId) {
      return tests.find((t) => t._id === entry.testId)?.title || 'Unknown Test';
    } else if (contentType === 'assignment' && entry.assignmentId) {
      return assignments.find((a) => a._id === entry.assignmentId)?.title || 'Unknown Assignment';
    }
    return 'Unknown';
  };

  const getSelectedItemTitle = () => {
    if (selectedItem === 'all') return contentType === 'test' ? 'All Tests' : 'All Assignments';
    return contentType === 'test'
      ? tests.find((t) => t._id === selectedItem)?.title || 'Unknown Test'
      : assignments.find((a) => a._id === selectedItem)?.title || 'Unknown Assignment';
  };

  return (
    <StudentLayout>
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-800 dark:text-white">Leaderboard</h2>
          <p className="text-gray-600 dark:text-gray-400">See how you compare with other students</p>
        </div>

        <div className="flex flex-col md:flex-row space-y-4 md:space-y-0 md:space-x-4 items-start md:items-center">
          <Select value={timeFilter} onValueChange={setTimeFilter}>
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
            value={contentType}
            onValueChange={(val: 'test' | 'assignment') => {
              setContentType(val);
              setSelectedItem('all');
            }}
          >
            <SelectTrigger className="w-full md:w-40">
              <SelectValue placeholder="Content type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="test">Tests</SelectItem>
              <SelectItem value="assignment">Assignments</SelectItem>
            </SelectContent>
          </Select>

          <Select value={selectedItem} onValueChange={setSelectedItem}>
            <SelectTrigger className="w-full md:w-60">
              <SelectValue placeholder={`Select ${contentType === 'test' ? 'test' : 'assignment'}`} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All {contentType === 'test' ? 'Tests' : 'Assignments'}</SelectItem>
              {(contentType === 'test' ? tests : assignments).map((item) => (
                <SelectItem key={item._id} value={item._id || ''}>
                  {item.title}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Top Students</CardTitle>
            <CardDescription>
              Students ranked by their performance in {getSelectedItemTitle()}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex justify-center py-8">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : filteredEntries.length > 0 ? (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-16">Rank</TableHead>
                      <TableHead>Student</TableHead>
                      <TableHead>{contentType === 'test' ? 'Test' : 'Assignment'}</TableHead>
                      <TableHead className="text-right">Score</TableHead>
                      <TableHead className="text-right">Completed</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredEntries.map((entry, index) => (
                      <TableRow
                        key={`${entry.studentId}-${entry.testId || entry.assignmentId}`}
                        className={index < 3 ? 'font-medium' : ''}
                      >
                        <TableCell>{getRankBadge(index + 1)}</TableCell>
                        <TableCell>
                          <div className="flex items-center">
                            <Avatar className="h-8 w-8 mr-2">
                              <AvatarFallback
                                className={
                                  index === 0
                                    ? 'bg-yellow-500 text-white'
                                    : index === 1
                                    ? 'bg-gray-400 text-white'
                                    : index === 2
                                    ? 'bg-amber-700 text-white'
                                    : 'bg-primary text-white'
                                }
                              >
                                {getUserInitials(entry.studentName)}
                              </AvatarFallback>
                            </Avatar>
                            <div>{entry.studentName}</div>
                          </div>
                        </TableCell>
                        <TableCell className="flex items-center">
                          {contentType === 'test' ? (
                            <FileQuestion className="h-4 w-4 text-secondary mr-2" />
                          ) : (
                            <ClipboardList className="h-4 w-4 text-warning mr-2" />
                          )}
                          {getItemTitle(entry)}
                        </TableCell>
                        <TableCell className="text-right font-semibold">
                          <div className="flex items-center justify-end">
                            <Star className="h-4 w-4 text-yellow-500 mr-1" fill="currentColor" />
                            <span className="font-bold">{entry.score}%</span>
                          </div>
                        </TableCell>
                        <TableCell className="text-right text-muted-foreground">
                          {entry.completedAt ? formatDate(new Date(entry.completedAt)) : 'N/A'}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            ) : (
              <div className="text-center text-muted-foreground py-6">No leaderboard data found.</div>
            )}
          </CardContent>
        </Card>
      </div>
    </StudentLayout>
  );
} 
