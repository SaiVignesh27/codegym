import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import AdminLayout from '@/components/layout/AdminLayout';
import { apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';
import { Course, User } from '@shared/schema';
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
import CourseCard from '@/components/dashboard/CourseCard';
import { Checkbox } from '@/components/ui/checkbox';
import { Loader2, Plus, School } from 'lucide-react';

// Form schema for creating/editing courses
const courseFormSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().optional(),
  category: z.string().optional(),
  image: z.string().optional(),
  visibility: z.enum(["public", "private"]),
  assignedTo: z.array(z.string()).optional(),
});

type CourseFormValues = z.infer<typeof courseFormSchema>;

export default function Courses() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
  
  // Fetch courses
  const { data: courses, isLoading: isLoadingCourses } = useQuery<Course[]>({
    queryKey: ['/api/admin/courses'],
  });

  // Fetch students for assignment
  const { data: students, isLoading: isLoadingStudents } = useQuery<User[]>({
    queryKey: ['/api/admin/users', { role: 'student' }],
  });

  // Setup form with validation
  const form = useForm<CourseFormValues>({
    resolver: zodResolver(courseFormSchema),
    defaultValues: {
      title: '',
      description: '',
      category: '',
      image: '',
      visibility: 'public',
      assignedTo: [],
    },
  });

  // Reset form when dialog opens/closes
  React.useEffect(() => {
    if (selectedCourse) {
      form.reset({
        title: selectedCourse.title,
        description: selectedCourse.description || '',
        category: selectedCourse.category || '',
        image: selectedCourse.image || '',
        visibility: selectedCourse.visibility,
        assignedTo: selectedCourse.assignedTo || [],
      });
    } else {
      form.reset({
        title: '',
        description: '',
        category: '',
        image: '',
        visibility: 'public',
        assignedTo: [],
      });
    }
  }, [selectedCourse, form]);

  // Create course mutation
  const createCourseMutation = useMutation({
    mutationFn: (data: CourseFormValues) => apiRequest('POST', '/api/admin/courses', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/courses'] });
      toast({
        title: 'Success',
        description: 'Course created successfully',
      });
      setIsDialogOpen(false);
    },
    onError: (error) => {
      toast({
        title: 'Error creating course',
        description: (error as Error).message,
        variant: 'destructive',
      });
    },
  });

  // Update course mutation
  const updateCourseMutation = useMutation({
    mutationFn: (data: { id: string; courseData: CourseFormValues }) => 
      apiRequest('PATCH', `/api/admin/courses/${data.id}`, data.courseData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/courses'] });
      toast({
        title: 'Success',
        description: 'Course updated successfully',
      });
      setSelectedCourse(null);
    },
    onError: (error) => {
      toast({
        title: 'Error updating course',
        description: (error as Error).message,
        variant: 'destructive',
      });
    },
  });

  // Delete course mutation
  const deleteCourseMutation = useMutation({
    mutationFn: (id: string) => apiRequest('DELETE', `/api/admin/courses/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/courses'] });
      toast({
        title: 'Success',
        description: 'Course deleted successfully',
      });
    },
    onError: (error) => {
      toast({
        title: 'Error deleting course',
        description: (error as Error).message,
        variant: 'destructive',
      });
    },
  });

  // Form submission handler
  const onSubmit = (data: CourseFormValues) => {
    if (selectedCourse) {
      updateCourseMutation.mutate({ id: selectedCourse._id as string, courseData: data });
    } else {
      createCourseMutation.mutate(data);
    }
  };

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

  const getInstructorDetails = (course: Course) => {
    // This is a placeholder function that would typically fetch instructor details
    // from the user who created the course
    return {
      name: "John Doe",
      initials: "JD"
    };
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-800 dark:text-white">Course Management</h2>
            <p className="text-gray-600 dark:text-gray-400">Create and manage learning courses</p>
          </div>
          <Button onClick={() => setIsDialogOpen(true)}>
            <Plus className="mr-2 h-4 w-4" /> Create Course
          </Button>
        </div>

        {isLoadingCourses ? (
          <div className="flex justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {courses && courses.length > 0 ? (
              courses.map((course) => (
                <div key={course._id} className="relative group">
                  <CourseCard
                    id={course._id as string}
                    title={course.title}
                    description={course.description || ''}
                    category={course.category || 'General'}
                    categoryColor={getCategoryColor(course.category || '')}
                    students={(course.assignedTo?.length || 0)}
                    instructor={getInstructorDetails(course)}
                    rating={4.8} // This would come from a ratings system
                    imageUrl={course.image || 'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&h=300'}
                  />
                  <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-10 transition-all flex items-center justify-center opacity-0 group-hover:opacity-100">
                    <Button 
                      variant="secondary" 
                      className="mr-2"
                      onClick={() => setSelectedCourse(course)}
                    >
                      Edit
                    </Button>
                    <Button 
                      variant="destructive"
                      onClick={() => deleteCourseMutation.mutate(course._id as string)}
                    >
                      Delete
                    </Button>
                  </div>
                </div>
              ))
            ) : (
              <div className="col-span-full flex flex-col items-center justify-center py-12 text-gray-500 dark:text-gray-400">
                <School className="h-12 w-12 mb-4 opacity-20" />
                <h3 className="text-lg font-medium">No courses found</h3>
                <p className="text-sm">Create your first course to get started</p>
                <Button variant="outline" className="mt-4" onClick={() => setIsDialogOpen(true)}>
                  <Plus className="mr-2 h-4 w-4" /> Create Course
                </Button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Create/Edit Course Dialog */}
      <Dialog open={isDialogOpen || !!selectedCourse} onOpenChange={(open) => {
        if (!open) {
          setIsDialogOpen(false);
          setSelectedCourse(null);
        }
      }}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>{selectedCourse ? 'Edit Course' : 'Create New Course'}</DialogTitle>
            <DialogDescription>
              {selectedCourse 
                ? 'Update course details and student assignments' 
                : 'Fill out the form to create a new course'}
            </DialogDescription>
          </DialogHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Course Title</FormLabel>
                    <FormControl>
                      <Input placeholder="JavaScript Fundamentals" {...field} />
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
                        placeholder="A comprehensive course covering JavaScript basics to advanced concepts"
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
                  name="category"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Category</FormLabel>
                      <FormControl>
                        <Input placeholder="JavaScript" {...field} value={field.value || ''} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="image"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Image URL</FormLabel>
                      <FormControl>
                        <Input placeholder="https://example.com/image.jpg" {...field} value={field.value || ''} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
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
                  disabled={createCourseMutation.isPending || updateCourseMutation.isPending}
                >
                  {(createCourseMutation.isPending || updateCourseMutation.isPending) && (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  )}
                  {selectedCourse ? 'Update Course' : 'Create Course'}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </AdminLayout>
  );
}
