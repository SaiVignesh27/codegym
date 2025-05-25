import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import AdminLayout from '@/components/layout/AdminLayout';
import { apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';
import { Test, Course, Class, Question, User } from '@shared/schema';
import { z } from 'zod';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
} from '@/components/ui/form';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs';
import TestItem from '@/components/dashboard/TestItem';
import { FileQuestion, Loader2, Plus, Minus, Code, CheckSquare, TextCursor } from 'lucide-react';

// Form schema for creating/editing tests
const questionSchema = z.object({
  text: z.string().min(1, "Question text is required"),
  type: z.enum(["mcq", "fill", "code"]),
  options: z.array(z.string()).optional(),
  correctAnswer: z.union([z.string(), z.array(z.string())]),
  codeTemplate: z.string().optional(),
  testCases: z.array(
    z.object({
      input: z.string(),
      output: z.string(),
    })
  ).optional(),
  points: z.number().default(1),
});

const testFormSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().optional(),
  courseId: z.string().min(1, "Course is required"),
  classId: z.string().optional(),
  questions: z.array(questionSchema).min(1, "At least one question is required"),
  visibility: z.enum(["public", "private"]),
  assignedTo: z.array(z.string()).optional(),
  timeLimit: z.number().optional(),
});

type TestFormValues = z.infer<typeof testFormSchema>;

export default function Tests() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedTest, setSelectedTest] = useState<Test | null>(null);
  
  // Fetch tests
  const { data: tests, isLoading: isLoadingTests } = useQuery<Test[]>({
    queryKey: ['/api/admin/tests'],
  });

  // Fetch courses for dropdown
  const { data: courses, isLoading: isLoadingCourses } = useQuery<Course[]>({
    queryKey: ['/api/admin/courses'],
  });

  // Fetch students for assignment
  const { data: students, isLoading: isLoadingStudents } = useQuery<User[]>({
    queryKey: ['/api/admin/users', { role: 'student' }],
  });

  // Setup form with validation
  const form = useForm<TestFormValues>({
    resolver: zodResolver(testFormSchema),
    defaultValues: {
      title: '',
      description: '',
      courseId: '',
      classId: '',
      questions: [
        {
          text: '',
          type: 'mcq',
          options: ['', '', '', ''],
          correctAnswer: '',
          points: 1,
        },
      ],
      visibility: 'public',
      assignedTo: [],
      timeLimit: 30,
    },
  });

  // Setup field array for questions
  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "questions",
  });

  // Fetch classes when course changes
  const selectedCourseId = form.watch('courseId');
  const { data: classes, isLoading: isLoadingClasses } = useQuery<Class[]>({
    queryKey: ['/api/admin/classes', { courseId: selectedCourseId }],
    enabled: !!selectedCourseId,
  });

  // Reset form when dialog opens/closes or selected test changes
  React.useEffect(() => {
    if (selectedTest) {
      form.reset({
        title: selectedTest.title,
        description: selectedTest.description || '',
        courseId: selectedTest.courseId,
        classId: selectedTest.classId || '',
        questions: selectedTest.questions,
        visibility: selectedTest.visibility,
        assignedTo: selectedTest.assignedTo || [],
        timeLimit: selectedTest.timeLimit || 30,
      });
    } else if (isDialogOpen) {
      form.reset({
        title: '',
        description: '',
        courseId: '',
        classId: '',
        questions: [
          {
            text: '',
            type: 'mcq',
            options: ['', '', '', ''],
            correctAnswer: '',
            points: 1,
          },
        ],
        visibility: 'public',
        assignedTo: [],
        timeLimit: 30,
      });
    }
  }, [selectedTest, isDialogOpen, form]);

  // Create test mutation
  const createTestMutation = useMutation({
    mutationFn: (data: TestFormValues) => apiRequest('POST', '/api/admin/tests', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/tests'] });
      toast({
        title: 'Success',
        description: 'Test created successfully',
      });
      setIsDialogOpen(false);
    },
    onError: (error) => {
      toast({
        title: 'Error creating test',
        description: (error as Error).message,
        variant: 'destructive',
      });
    },
  });

  // Update test mutation
  const updateTestMutation = useMutation({
    mutationFn: (data: { id: string; testData: TestFormValues }) => 
      apiRequest('PATCH', `/api/admin/tests/${data.id}`, data.testData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/tests'] });
      toast({
        title: 'Success',
        description: 'Test updated successfully',
      });
      setSelectedTest(null);
    },
    onError: (error) => {
      toast({
        title: 'Error updating test',
        description: (error as Error).message,
        variant: 'destructive',
      });
    },
  });

  // Delete test mutation
  const deleteTestMutation = useMutation({
    mutationFn: (id: string) => apiRequest('DELETE', `/api/admin/tests/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/tests'] });
      toast({
        title: 'Success',
        description: 'Test deleted successfully',
      });
    },
    onError: (error) => {
      toast({
        title: 'Error deleting test',
        description: (error as Error).message,
        variant: 'destructive',
      });
    },
  });

  // Toggle test status mutation
  const toggleTestStatusMutation = useMutation({
    mutationFn: (data: { id: string; isActive: boolean }) => 
      apiRequest('PATCH', `/api/admin/tests/${data.id}/status`, { isActive: data.isActive }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/tests'] });
      toast({
        title: 'Success',
        description: 'Test status updated',
      });
    },
    onError: (error) => {
      toast({
        title: 'Error updating test status',
        description: (error as Error).message,
        variant: 'destructive',
      });
    },
  });

  // Form submission handler
  const onSubmit = (data: TestFormValues) => {
    // Process form data before submission
    // Ensure correctAnswer is properly formatted based on question type
    const processedData = {
      ...data,
      questions: data.questions.map(q => {
        if (q.type === 'mcq') {
          // Ensure correctAnswer is a string for MCQ
          return { ...q, correctAnswer: q.correctAnswer.toString() };
        }
        return q;
      })
    };
    
    if (selectedTest) {
      updateTestMutation.mutate({ id: selectedTest._id as string, testData: processedData });
    } else {
      createTestMutation.mutate(processedData);
    }
  };

  // Find course name by ID
  const getCourseName = (courseId: string) => {
    const course = courses?.find(c => c._id === courseId);
    return course?.title || 'Unknown Course';
  };

  // Add a new question
  const addQuestion = () => {
    append({
      text: '',
      type: 'mcq',
      options: ['', '', '', ''],
      correctAnswer: '',
      points: 1,
    });
  };

  // Remove a question
  const removeQuestion = (index: number) => {
    if (fields.length > 1) {
      remove(index);
    } else {
      toast({
        title: 'Error',
        description: 'Test must have at least one question',
        variant: 'destructive',
      });
    }
  };

  // Render question form based on type
  const renderQuestionForm = (index: number, questionType: string) => {
    switch (questionType) {
      case 'mcq':
        return (
          <>
            <FormField
              control={form.control}
              name={`questions.${index}.options.0`}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Option A</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name={`questions.${index}.options.1`}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Option B</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name={`questions.${index}.options.2`}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Option C</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name={`questions.${index}.options.3`}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Option D</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name={`questions.${index}.correctAnswer`}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Correct Answer</FormLabel>
                  <Select 
                    onValueChange={field.onChange} 
                    defaultValue={field.value?.toString() || "0"}
                    value={field.value?.toString() || "0"}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select correct option" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="0">Option A</SelectItem>
                      <SelectItem value="1">Option B</SelectItem>
                      <SelectItem value="2">Option C</SelectItem>
                      <SelectItem value="3">Option D</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
          </>
        );
        
      case 'fill':
        return (
          <FormField
            control={form.control}
            name={`questions.${index}.correctAnswer`}
            render={({ field }) => (
              <FormItem>
                <FormLabel>Correct Answer</FormLabel>
                <FormControl>
                  <Input 
                    placeholder="Enter the correct answer"
                    {...field}
                    value={field.value.toString()}
                    onChange={(e) => field.onChange(e.target.value)}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        );
        
      case 'code':
        return (
          <>
            <FormField
              control={form.control}
              name={`questions.${index}.codeTemplate`}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Code Template</FormLabel>
                  <FormControl>
                    <Textarea 
                      className="font-mono h-40"
                      placeholder="// Provide a code template for students to start with"
                      {...field}
                      value={field.value || ''}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Label>Test Cases</Label>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    const testCases = form.getValues(`questions.${index}.testCases`) || [];
                    form.setValue(`questions.${index}.testCases`, [
                      ...testCases,
                      { input: '', output: '' }
                    ]);
                  }}
                >
                  <Plus className="h-4 w-4 mr-1" /> Add Test Case
                </Button>
              </div>
              
              {(form.getValues(`questions.${index}.testCases`) || []).map((_, testIndex) => (
                <div key={testIndex} className="grid grid-cols-2 gap-4 p-3 border rounded-md relative">
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute top-0 right-0 h-8 w-8 p-0"
                    onClick={() => {
                      const testCases = form.getValues(`questions.${index}.testCases`) || [];
                      form.setValue(
                        `questions.${index}.testCases`,
                        testCases.filter((_, i) => i !== testIndex)
                      );
                    }}
                  >
                    <Minus className="h-4 w-4" />
                  </Button>
                  
                  <FormField
                    control={form.control}
                    name={`questions.${index}.testCases.${testIndex}.input`}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Input</FormLabel>
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name={`questions.${index}.testCases.${testIndex}.output`}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Expected Output</FormLabel>
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              ))}
            </div>
          </>
        );
        
      default:
        return null;
    }
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-800 dark:text-white">Test Management</h2>
            <p className="text-gray-600 dark:text-gray-400">Create and manage daily tests</p>
          </div>
          <Button onClick={() => setIsDialogOpen(true)}>
            <Plus className="mr-2 h-4 w-4" /> Create Test
          </Button>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Tests</CardTitle>
            <CardDescription>All tests organized by course</CardDescription>
          </CardHeader>
          <CardContent>
            {isLoadingTests ? (
              <div className="flex justify-center py-8">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : (
              <div className="space-y-4">
                {tests && tests.length > 0 ? (
                  tests.map((test) => (
                    <TestItem
                      key={test._id}
                      id={test._id as string}
                      title={test.title}
                      course={getCourseName(test.courseId)}
                      questionCount={test.questions.length}
                      isActive={true} // This would typically come from a status field
                      icon={FileQuestion}
                      iconColor="text-primary"
                      iconBgColor="bg-primary-light bg-opacity-10"
                      onEdit={() => setSelectedTest(test)}
                      onToggleStatus={() => toggleTestStatusMutation.mutate({ 
                        id: test._id as string, 
                        isActive: false // Toggle logic would be implemented here
                      })}
                      onDelete={() => deleteTestMutation.mutate(test._id as string)}
                    />
                  ))
                ) : (
                  <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                    <FileQuestion className="h-12 w-12 mx-auto mb-4 opacity-20" />
                    <h3 className="text-lg font-medium">No tests found</h3>
                    <p className="text-sm">Create your first test to get started</p>
                    <Button variant="outline" className="mt-4" onClick={() => setIsDialogOpen(true)}>
                      <Plus className="mr-2 h-4 w-4" /> Create Test
                    </Button>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Create/Edit Test Dialog */}
      <Dialog open={isDialogOpen || !!selectedTest} onOpenChange={(open) => {
        if (!open) {
          setIsDialogOpen(false);
          setSelectedTest(null);
        }
      }}>
        <DialogContent className="sm:max-w-[800px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{selectedTest ? 'Edit Test' : 'Create New Test'}</DialogTitle>
            <DialogDescription>
              {selectedTest 
                ? 'Update test details and questions' 
                : 'Create a new test with multiple choice, fill-in-the-blank, or coding questions'}
            </DialogDescription>
          </DialogHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <Tabs defaultValue="details">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="details">Test Details</TabsTrigger>
                  <TabsTrigger value="questions">Questions</TabsTrigger>
                </TabsList>
                
                <TabsContent value="details" className="space-y-4 pt-4">
                  <FormField
                    control={form.control}
                    name="title"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Test Title</FormLabel>
                        <FormControl>
                          <Input placeholder="JavaScript Arrays & Objects Test" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="description"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Description</FormLabel>
                        <FormControl>
                          <Textarea 
                            placeholder="Test on JavaScript arrays and objects concepts"
                            className="resize-none"
                            {...field}
                            value={field.value || ''}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="courseId"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Course</FormLabel>
                          <Select 
                            onValueChange={(value) => {
                              field.onChange(value);
                              // Reset classId when course changes
                              form.setValue('classId', '');
                            }} 
                            defaultValue={field.value}
                            value={field.value}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select a course" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {isLoadingCourses ? (
                                <div className="flex justify-center py-2">
                                  <Loader2 className="h-4 w-4 animate-spin" />
                                </div>
                              ) : courses && courses.length > 0 ? (
                                courses.map((course) => (
                                  <SelectItem key={course._id} value={course._id as string}>
                                    {course.title}
                                  </SelectItem>
                                ))
                              ) : (
                                <div className="px-2 py-1 text-sm text-gray-500 dark:text-gray-400">
                                  No courses available
                                </div>
                              )}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="classId"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Class (Optional)</FormLabel>
                          <Select 
                            onValueChange={field.onChange} 
                            defaultValue={field.value}
                            value={field.value}
                            disabled={!selectedCourseId}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder={selectedCourseId ? "Select a class" : "Select a course first"} />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="">None (General test)</SelectItem>
                              {isLoadingClasses ? (
                                <div className="flex justify-center py-2">
                                  <Loader2 className="h-4 w-4 animate-spin" />
                                </div>
                              ) : classes && classes.length > 0 ? (
                                classes.map((classItem) => (
                                  <SelectItem key={classItem._id} value={classItem._id as string}>
                                    {classItem.title}
                                  </SelectItem>
                                ))
                              ) : (
                                <div className="px-2 py-1 text-sm text-gray-500 dark:text-gray-400">
                                  No classes available
                                </div>
                              )}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="timeLimit"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Time Limit (minutes)</FormLabel>
                          <FormControl>
                            <Input 
                              type="number" 
                              min="1" 
                              {...field} 
                              onChange={(e) => field.onChange(parseInt(e.target.value) || 30)}
                              value={field.value || 30}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="visibility"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Visibility</FormLabel>
                          <Select 
                            onValueChange={field.onChange} 
                            defaultValue={field.value}
                            value={field.value}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select visibility" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="public">Public (all students)</SelectItem>
                              <SelectItem value="private">Private (selected students only)</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  
                  {form.watch('visibility') === 'private' && (
                    <div>
                      <Label>Assign to Students</Label>
                      <div className="mt-2 border rounded-md p-4 max-h-60 overflow-y-auto">
                        {isLoadingStudents ? (
                          <div className="flex justify-center py-4">
                            <Loader2 className="h-4 w-4 animate-spin text-primary" />
                          </div>
                        ) : students && students.length > 0 ? (
                          <div className="space-y-2">
                            {students.map((student) => (
                              <div key={student._id} className="flex items-center space-x-2">
                                <Checkbox 
                                  id={`student-${student._id}`}
                                  checked={form.watch('assignedTo')?.includes(student._id as string)}
                                  onCheckedChange={(checked) => {
                                    const assignedTo = form.getValues('assignedTo') || [];
                                    if (checked) {
                                      form.setValue('assignedTo', [...assignedTo, student._id as string]);
                                    } else {
                                      form.setValue('assignedTo', assignedTo.filter(id => id !== student._id));
                                    }
                                  }}
                                />
                                <label
                                  htmlFor={`student-${student._id}`}
                                  className="text-sm leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                                >
                                  {student.name} ({student.email})
                                </label>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <p className="text-sm text-gray-500 dark:text-gray-400 text-center py-2">No students found</p>
                        )}
                      </div>
                    </div>
                  )}
                </TabsContent>
                
                <TabsContent value="questions" className="space-y-6 pt-4">
                  <div className="flex justify-between items-center">
                    <h4 className="text-lg font-medium">Questions</h4>
                    <Button type="button" onClick={addQuestion} variant="outline">
                      <Plus className="h-4 w-4 mr-2" /> Add Question
                    </Button>
                  </div>
                  
                  <Accordion type="multiple" className="w-full">
                    {fields.map((field, index) => (
                      <AccordionItem key={field.id} value={`question-${index}`}>
                        <AccordionTrigger className="hover:no-underline">
                          <div className="flex items-center text-left">
                            <span className="text-sm font-medium">Question {index + 1}</span>
                            <span className="ml-2 text-xs text-gray-500 dark:text-gray-400 truncate max-w-[200px]">
                              {form.getValues(`questions.${index}.text`) || 'New Question'}
                            </span>
                          </div>
                        </AccordionTrigger>
                        <AccordionContent>
                          <div className="space-y-4 p-4 border rounded-md bg-gray-50 dark:bg-dark-border">
                            <div className="flex justify-end">
                              <Button 
                                type="button" 
                                onClick={() => removeQuestion(index)} 
                                variant="ghost" 
                                size="sm"
                                className="text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300"
                              >
                                <Minus className="h-4 w-4 mr-1" /> Remove
                              </Button>
                            </div>
                            
                            <FormField
                              control={form.control}
                              name={`questions.${index}.text`}
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Question Text</FormLabel>
                                  <FormControl>
                                    <Textarea {...field} />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                            
                            <div className="grid grid-cols-2 gap-4">
                              <FormField
                                control={form.control}
                                name={`questions.${index}.type`}
                                render={({ field }) => (
                                  <FormItem>
                                    <FormLabel>Question Type</FormLabel>
                                    <Select 
                                      onValueChange={(value) => {
                                        field.onChange(value);
                                        // Reset question fields based on type
                                        if (value === 'mcq') {
                                          form.setValue(`questions.${index}.options`, ['', '', '', '']);
                                          form.setValue(`questions.${index}.correctAnswer`, '0');
                                        } else if (value === 'fill') {
                                          form.setValue(`questions.${index}.correctAnswer`, '');
                                        } else if (value === 'code') {
                                          form.setValue(`questions.${index}.codeTemplate`, '');
                                          form.setValue(`questions.${index}.testCases`, [{ input: '', output: '' }]);
                                        }
                                      }} 
                                      defaultValue={field.value}
                                      value={field.value}
                                    >
                                      <FormControl>
                                        <SelectTrigger>
                                          <SelectValue placeholder="Select question type" />
                                        </SelectTrigger>
                                      </FormControl>
                                      <SelectContent>
                                        <SelectItem value="mcq">
                                          <div className="flex items-center">
                                            <CheckSquare className="h-4 w-4 mr-2" />
                                            <span>Multiple Choice</span>
                                          </div>
                                        </SelectItem>
                                        <SelectItem value="fill">
                                          <div className="flex items-center">
                                            <TextCursor className="h-4 w-4 mr-2" />
                                            <span>Fill in the Blank</span>
                                          </div>
                                        </SelectItem>
                                        <SelectItem value="code">
                                          <div className="flex items-center">
                                            <Code className="h-4 w-4 mr-2" />
                                            <span>Coding Question</span>
                                          </div>
                                        </SelectItem>
                                      </SelectContent>
                                    </Select>
                                    <FormMessage />
                                  </FormItem>
                                )}
                              />
                              
                              <FormField
                                control={form.control}
                                name={`questions.${index}.points`}
                                render={({ field }) => (
                                  <FormItem>
                                    <FormLabel>Points</FormLabel>
                                    <FormControl>
                                      <Input 
                                        type="number" 
                                        min="1" 
                                        {...field} 
                                        onChange={(e) => field.onChange(parseInt(e.target.value) || 1)}
                                      />
                                    </FormControl>
                                    <FormMessage />
                                  </FormItem>
                                )}
                              />
                            </div>
                            
                            {/* Render different form fields based on question type */}
                            {renderQuestionForm(index, form.watch(`questions.${index}.type`))}
                          </div>
                        </AccordionContent>
                      </AccordionItem>
                    ))}
                  </Accordion>
                </TabsContent>
              </Tabs>
              
              <DialogFooter>
                <Button 
                  type="submit" 
                  disabled={createTestMutation.isPending || updateTestMutation.isPending}
                >
                  {(createTestMutation.isPending || updateTestMutation.isPending) && (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  )}
                  {selectedTest ? 'Update Test' : 'Create Test'}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </AdminLayout>
  );
}
