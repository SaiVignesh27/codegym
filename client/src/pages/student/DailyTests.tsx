import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import StudentLayout from "@/components/layout/StudentLayout";
import { Test, Result } from "@shared/schema";
import { Link } from "wouter";
import { format } from "date-fns";

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  FileQuestion,
  Loader2,
  Clock,
  Search,
  ChevronRight,
  CheckCircle,
  Star,
  Calendar,
} from "lucide-react";

// Interface for test with result
interface TestWithResult extends Test {
  result?: Result;
  isCompleted: boolean;
  score?: number;
}

export default function DailyTests() {
  const [searchQuery, setSearchQuery] = useState("");
  const [courseFilter, setCourseFilter] = useState("all");

  // Fetch available tests
  const { data: tests, isLoading: isLoadingTests } = useQuery<Test[]>({
    queryKey: ["/api/student/tests"],
  });

  // Fetch test results
  const { data: results, isLoading: isLoadingResults } = useQuery<Result[]>({
    queryKey: ["/api/student/results/tests"],
  });

  // Fetch courses for filter
  const { data: courses, isLoading: isLoadingCourses } = useQuery({
    queryKey: ["/api/student/courses"],
  });

  // Process tests with results
  const testsWithResults: TestWithResult[] = React.useMemo(() => {
    if (!tests || !results) return [];

    return tests.map((test) => {
      const result = results.find((r) => r.testId === test._id);
      return {
        ...test,
        result,
        isCompleted: !!result,
        score: result?.score || 0,
      };
    });
  }, [tests, results]);

  // Filter tests by search and course
  const filteredTests = React.useMemo(() => {
    return testsWithResults.filter((test) => {
      const matchesSearch = test.title
        .toLowerCase()
        .includes(searchQuery.toLowerCase());
      const matchesCourse =
        courseFilter === "all" || test.courseId === courseFilter;
      return matchesSearch && matchesCourse;
    });
  }, [testsWithResults, searchQuery, courseFilter]);

  // Split tests into pending and completed
  const pendingTests = filteredTests.filter((test) => !test.isCompleted);
  const completedTests = filteredTests.filter((test) => test.isCompleted);

  // Check if all data is loading
  const isLoading = isLoadingTests || isLoadingResults || isLoadingCourses;

  // Format date
  const formatDate = (date: Date) => {
    return format(date, "MMM dd, yyyy");
  };

  // Get course name
  const getCourseName = (courseId: string) => {
    const course = courses?.find((c) => c._id === courseId);
    return course?.title || "Unknown Course";
  };

  return (
    <StudentLayout>
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-800 dark:text-white">
            Daily Tests
          </h2>
          <p className="text-gray-600 dark:text-gray-400">
            Practice and improve your skills with daily tests
          </p>
        </div>

        <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4 items-start sm:items-center">
          <div className="relative w-full sm:w-96">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search tests..."
              className="pl-8"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          <Select value={courseFilter} onValueChange={setCourseFilter}>
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
        </div>

        <Tabs defaultValue="pending" className="space-y-6">
          <TabsList>
            <TabsTrigger value="pending">Pending Tests</TabsTrigger>
            <TabsTrigger value="completed">Completed Tests</TabsTrigger>
          </TabsList>

          <TabsContent value="pending" className="m-0">
            {isLoading ? (
              <div className="flex justify-center py-8">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : pendingTests.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {pendingTests.map((test) => (
                  <Card key={test._id} className="overflow-hidden">
                    <CardHeader className="pb-2">
                      <div className="flex justify-between items-start">
                        <Badge className="bg-primary-light bg-opacity-10 text-primary">
                          {getCourseName(test.courseId)}
                        </Badge>
                        <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
                          <Clock className="h-4 w-4 mr-1" />
                          <span>{test.timeLimit || 30} min</span>
                        </div>
                      </div>
                      <CardTitle className="mt-2 text-lg">
                        {test.title}
                      </CardTitle>
                      <CardDescription className="line-clamp-2">
                        {test.description ||
                          "Test your knowledge with this daily test."}
                      </CardDescription>
                    </CardHeader>

                    <CardContent>
                      <div className="flex items-center justify-between text-sm">
                        <div className="flex items-center">
                          <FileQuestion className="h-4 w-4 mr-1 text-gray-500 dark:text-gray-400" />
                          <span className="text-gray-500 dark:text-gray-400">
                            {test.questions.length} questions
                          </span>
                        </div>
                        <div className="flex items-center">
                          <Calendar className="h-4 w-4 mr-1 text-gray-500 dark:text-gray-400" />
                          <span className="text-gray-500 dark:text-gray-400">
                            {test.createdAt
                              ? formatDate(new Date(test.createdAt))
                              : "Available now"}
                          </span>
                        </div>
                      </div>
                    </CardContent>

                    <CardFooter className="border-t bg-gray-50 dark:bg-dark-border pt-4">
                      <Button asChild className="w-full">
                        <Link href={`/student/daily-tests/${test._id}`}>
                          Start Test <ChevronRight className="h-4 w-4 ml-1" />
                        </Link>
                      </Button>
                    </CardFooter>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="text-center py-12 text-gray-500 dark:text-gray-400">
                <FileQuestion className="h-12 w-12 mx-auto mb-4 opacity-20" />
                <h3 className="text-lg font-medium">No pending tests found</h3>
                <p className="text-sm">
                  All tests have been completed or none are available
                </p>
              </div>
            )}
          </TabsContent>

          <TabsContent value="completed" className="m-0">
            {isLoading ? (
              <div className="flex justify-center py-8">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : completedTests.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {completedTests.map((test) => (
                  <Card key={test._id} className="overflow-hidden">
                    <div className="absolute top-2 right-2">
                      <Badge className="bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-300">
                        <CheckCircle className="h-3 w-3 mr-1" /> Completed
                      </Badge>
                    </div>

                    <CardHeader className="pb-2">
                      <Badge className="bg-primary-light bg-opacity-10 text-primary">
                        {getCourseName(test.courseId)}
                      </Badge>
                      <CardTitle className="mt-2 text-lg">
                        {test.title}
                      </CardTitle>
                      <CardDescription className="line-clamp-2">
                        {test.description ||
                          "Test your knowledge with this daily test."}
                      </CardDescription>
                    </CardHeader>

                    <CardContent>
                      <div className="bg-gray-50 dark:bg-dark-border rounded-lg p-4 mb-4">
                        <div className="flex justify-between items-center mb-2">
                          <span className="text-sm text-gray-500 dark:text-gray-400">
                            Your Score
                          </span>
                          <div className="flex items-center">
                            <Star
                              className="h-4 w-4 text-yellow-500 mr-1"
                              fill="currentColor"
                            />
                            <span className="font-semibold">{test.score}%</span>
                          </div>
                        </div>
                        <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full ${
                              (test.score || 0) >= 70
                                ? "bg-green-500"
                                : (test.score || 0) >= 40
                                  ? "bg-yellow-500"
                                  : "bg-red-500"
                            }`}
                            style={{ width: `${test.score || 0}%` }}
                          ></div>
                        </div>
                      </div>

                      <div className="flex items-center justify-between text-sm">
                        <div className="flex items-center">
                          <FileQuestion className="h-4 w-4 mr-1 text-gray-500 dark:text-gray-400" />
                          <span className="text-gray-500 dark:text-gray-400">
                            {test.questions.length} questions
                          </span>
                        </div>
                        <div className="flex items-center">
                          <Calendar className="h-4 w-4 mr-1 text-gray-500 dark:text-gray-400" />
                          <span className="text-gray-500 dark:text-gray-400">
                            {test.result?.submittedAt
                              ? formatDate(new Date(test.result.submittedAt))
                              : "Completed"}
                          </span>
                        </div>
                      </div>
                    </CardContent>

                    <CardFooter className="border-t bg-gray-50 dark:bg-dark-border pt-4">
                      <Button asChild variant="outline" className="w-full">
                        <Link href={`/student/daily-tests/${test._id}/results`}>
                          View Results
                        </Link>
                      </Button>
                    </CardFooter>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="text-center py-12 text-gray-500 dark:text-gray-400">
                <FileQuestion className="h-12 w-12 mx-auto mb-4 opacity-20" />
                <h3 className="text-lg font-medium">
                  No completed tests found
                </h3>
                <p className="text-sm">Complete some tests to see them here</p>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </StudentLayout>
  );
}
