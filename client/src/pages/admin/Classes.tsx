import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import AdminLayout from '@/components/layout/AdminLayout';
import { apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';
import { Class, Course, User } from '@shared/schema';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
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
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { 
  FileVideo, 
  FileText, 
  Loader2, 
  MoreVertical, 
  Plus, 
  Edit, 
  Trash2, 
  Video, 
  File
} from 'lucide-react';

// Form schema for creating/editing classes
const classFormSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().optional(),
  courseId: z.string().min(1, "Course is required"),
  content: z.object({
    type: z.enum(["video", "document"]),
    url: z.string().min(1, "Content URL is required"),
  }),
  visibility: z.enum(["public", "private"]),
  assignedTo: z.array(z.string()).optional(),
});

type ClassFormValues = z.infer<typeof classFormSchema>;

export default function Classes() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedClass, setSelectedClass] = useState<Class | null>(null);
  
  // Fetch classes
  const { data: classes, isLoading: isLoadingClasses } = useQuery<Class[]>({
    queryKey: ['/api/admin/classes'],
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
  const form = useForm<ClassFormValues>({
    resolver: zodResolver(classFormSchema),
    defaultValues: {
      title: '',
      description: '',
      courseId: '',
      content: {
        type: 'video',
        url: '',
      },
      visibility: 'public',
      assignedTo: [],
    },
  });

  // Reset form when dialog opens/closes
  React.useEffect(() => {
    if (selectedClass) {
      form.reset({
        title: selectedClass.title,
        description: selectedClass.description || '',
        courseId: selectedClass.courseId,
        content: selectedClass.content,
        visibility: selectedClass.visibility,
        assignedTo: selectedClass.assignedTo || [],
      });
    } else {
      form.reset({
        title: '',
        description: '',
        courseId: '',
        content: {
          type: 'video',
          url: '',
        },
        visibility: 'public',
        assignedTo: [],
      });
    }
  }, [selectedClass, form]);

  // Create class mutation
  const createClassMutation = useMutation({
    mutationFn: (data: ClassFormValues) => apiRequest('POST', '/api/admin/classes', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/classes'] });
      toast({
        title: 'Success',
        description: 'Class created successfully',
      });
      setIsDialogOpen(false);
    },
    onError: (error) => {
      toast({
        title: 'Error creating class',
        description: (error as Error).message,
        variant: 'destructive',
      });
    },
  });

  // Update class mutation
  const updateClassMutation = useMutation({
    mutationFn: (data: { id: string; classData: ClassFormValues }) => 
      apiRequest('PATCH', `/api/admin/classes/${data.id}`, data.classData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/classes'] });
      toast({
        title: 'Success',
        description: 'Class updated successfully',
      });
      setSelectedClass(null);
    },
    onError: (error) => {
      toast({
        title: 'Error updating class',
        description: (error as Error).message,
        variant: 'destructive',
      });
    },
  });

  // Delete class mutation
  const deleteClassMutation = useMutation({
    mutationFn: (id: string) => apiRequest('DELETE', `/api/admin/classes/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/classes'] });
      toast({
        title: 'Success',
        description: 'Class deleted successfully',
      });
    },
    onError: (error) => {
      toast({
        title: 'Error deleting class',
        description: (error as Error).message,
        variant: 'destructive',
      });
    },
  });

  // Form submission handler
  const onSubmit = (data: ClassFormValues) => {
    if (selectedClass) {
      updateClassMutation.mutate({ id: selectedClass._id as string, classData: data });
    } else {
      createClassMutation.mutate(data);
    }
  };

  // Find course name by ID
  const getCourseName = (courseId: string) => {
    const course = courses?.find(c => c._id === courseId);
    return course?.title || 'Unknown Course';
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-800 dark:text-white">Class Management</h2>
            <p className="text-gray-600 dark:text-gray-400">Manage video and document classes</p>
          </div>
          <Button onClick={() => setIsDialogOpen(true)}>
            <Plus className="mr-2 h-4 w-4" /> Create Class
          </Button>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Classes</CardTitle>
            <CardDescription>All video and document classes organized by course</CardDescription>
          </CardHeader>
          <CardContent>
            {isLoadingClasses ? (
              <div className="flex justify-center py-8">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Title</TableHead>
                    <TableHead>Course</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Visibility</TableHead>
                    <TableHead className="w-[100px]">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {classes && classes.length > 0 ? (
                    classes.map((classItem) => (
                      <TableRow key={classItem._id}>
                        <TableCell className="font-medium">{classItem.title}</TableCell>
                        <TableCell>{getCourseName(classItem.courseId)}</TableCell>
                        <TableCell>
                          <div className="flex items-center">
                            {classItem.content.type === 'video' ? (
                              <>
                                <FileVideo className="h-4 w-4 mr-2 text-primary" />
                                <span>Video</span>
                              </>
                            ) : (
                              <>
                                <FileText className="h-4 w-4 mr-2 text-secondary" />
                                <span>Document</span>
                              </>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                            classItem.visibility === 'public' 
                              ? 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-300' 
                              : 'bg-purple-100 dark:bg-purple-900 text-purple-800 dark:text-purple-300'
                          }`}>
                            {classItem.visibility === 'public' ? 'Public' : 'Private'}
                          </span>
                        </TableCell>
                        <TableCell>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" className="h-8 w-8 p-0">
                                <span className="sr-only">Open menu</span>
                                <MoreVertical className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem onClick={() => setSelectedClass(classItem)}>
                                <Edit className="mr-2 h-4 w-4" />
                                Edit
                              </DropdownMenuItem>
                              <DropdownMenuItem 
                                className="text-red-600 focus:text-red-600"
                                onClick={() => deleteClassMutation.mutate(classItem._id as string)}
                              >
                                <Trash2 className="mr-2 h-4 w-4" />
                                Delete
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center py-8 text-gray-500 dark:text-gray-400">
                        No classes found
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Create/Edit Class Dialog */}
      <Dialog open={isDialogOpen || !!selectedClass} onOpenChange={(open) => {
        if (!open) {
          setIsDialogOpen(false);
          setSelectedClass(null);
        }
      }}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>{selectedClass ? 'Edit Class' : 'Create New Class'}</DialogTitle>
            <DialogDescription>
              {selectedClass 
                ? 'Update class details and content' 
                : 'Add a new video or document class to a course'}
            </DialogDescription>
          </DialogHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Class Title</FormLabel>
                    <FormControl>
                      <Input placeholder="JavaScript Arrays & Objects" {...field} />
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
                        placeholder="Learn about arrays and objects in JavaScript"
                        className="resize-none"
                        {...field}
                        value={field.value || ''}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="courseId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Course</FormLabel>
                    <Select 
                      onValueChange={field.onChange} 
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
                name="content.type"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Content Type</FormLabel>
                    <Select 
                      onValueChange={field.onChange} 
                      defaultValue={field.value}
                      value={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select content type" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="video">
                          <div className="flex items-center">
                            <Video className="h-4 w-4 mr-2" />
                            <span>Video</span>
                          </div>
                        </SelectItem>
                        <SelectItem value="document">
                          <div className="flex items-center">
                            <File className="h-4 w-4 mr-2" />
                            <span>Document</span>
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
                name="content.url"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      {form.watch('content.type') === 'video' ? 'Video URL' : 'Document URL'}
                    </FormLabel>
                    <FormControl>
                      <Input 
                        placeholder={form.watch('content.type') === 'video' 
                          ? "https://example.com/video.mp4" 
                          : "https://example.com/document.pdf"}
                        {...field} 
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
              
              <DialogFooter>
                <Button 
                  type="submit" 
                  disabled={createClassMutation.isPending || updateClassMutation.isPending}
                >
                  {(createClassMutation.isPending || updateClassMutation.isPending) && (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  )}
                  {selectedClass ? 'Update Class' : 'Create Class'}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </AdminLayout>
  );
}
