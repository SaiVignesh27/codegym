import React, { useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import StudentLayout from '@/components/layout/StudentLayout';
import { apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/providers/AuthProvider';
import { User } from '@shared/schema';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { Loader2, User as UserIcon, Key, Mail, GraduationCap } from 'lucide-react';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Progress } from '@/components/ui/progress';

// Form schema for profile update
const profileFormSchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Invalid email address"),
});

// Form schema for password update
const passwordFormSchema = z.object({
  currentPassword: z.string().min(1, "Current password is required"),
  newPassword: z.string().min(6, "New password must be at least 6 characters"),
  confirmPassword: z.string().min(6, "Confirm password must be at least 6 characters"),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: "Passwords do not match",
  path: ["confirmPassword"],
});

type ProfileFormValues = z.infer<typeof profileFormSchema>;
type PasswordFormValues = z.infer<typeof passwordFormSchema>;

export default function Profile() {
  const { toast } = useToast();
  const { user } = useAuth();
  const queryClient = useQueryClient();
  
  // Fetch user profile
  const { data: profile, isLoading: isLoadingProfile } = useQuery<User>({
    queryKey: ['/api/student/profile'],
  });

  // Define stats type with default mock data for development
  type UserStats = {
    enrolledCourses: number;
    completedCourses: number;
    averageScore: number;
    overallProgress: number;
    testsCompleted: number;
    assignmentsCompleted: number;
    classesAttended: number;
    codingPoints: number;
    quizPoints: number;
    participationPoints: number;
    skills: {
      javascript: number;
      react: number;
      nodejs: number;
      database: number;
      problemSolving: number;
    };
  };

  // Fetch user progress and stats
  const { data: stats, isLoading: isLoadingStats } = useQuery<UserStats>({
    queryKey: ['/api/student/stats'],
    initialData: {
      enrolledCourses: 3,
      completedCourses: 1,
      averageScore: 86,
      overallProgress: 65,
      testsCompleted: 12,
      assignmentsCompleted: 8,
      classesAttended: 24,
      codingPoints: 450,
      quizPoints: 320,
      participationPoints: 180,
      skills: {
        javascript: 80,
        react: 65,
        nodejs: 60,
        database: 50,
        problemSolving: 75
      }
    }
  });

  // Setup form with validation for profile
  const profileForm = useForm<ProfileFormValues>({
    resolver: zodResolver(profileFormSchema),
    defaultValues: {
      name: '',
      email: '',
    },
  });

  // Setup form with validation for password
  const passwordForm = useForm<PasswordFormValues>({
    resolver: zodResolver(passwordFormSchema),
    defaultValues: {
      currentPassword: '',
      newPassword: '',
      confirmPassword: '',
    },
  });

  // Set form values when profile data is loaded
  useEffect(() => {
    if (profile) {
      profileForm.reset({
        name: profile.name,
        email: profile.email,
      });
    }
  }, [profile, profileForm]);

  // Profile update mutation
  const updateProfileMutation = useMutation({
    mutationFn: (data: ProfileFormValues) => apiRequest('PATCH', '/api/student/profile', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/student/profile'] });
      toast({
        title: 'Success',
        description: 'Profile updated successfully',
      });
    },
    onError: (error) => {
      toast({
        title: 'Error updating profile',
        description: (error as Error).message,
        variant: 'destructive',
      });
    },
  });

  // Password update mutation
  const updatePasswordMutation = useMutation({
    mutationFn: (data: PasswordFormValues) => apiRequest('PATCH', '/api/student/profile/password', data),
    onSuccess: () => {
      toast({
        title: 'Success',
        description: 'Password updated successfully',
      });
      passwordForm.reset({
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
      });
    },
    onError: (error) => {
      toast({
        title: 'Error updating password',
        description: (error as Error).message,
        variant: 'destructive',
      });
    },
  });

  // Profile form submission handler
  const onProfileSubmit = (data: ProfileFormValues) => {
    updateProfileMutation.mutate(data);
  };

  // Password form submission handler
  const onPasswordSubmit = (data: PasswordFormValues) => {
    updatePasswordMutation.mutate(data);
  };

  // Get user initials for avatar
  const getUserInitials = () => {
    if (!profile?.name) return 'U';
    
    const names = profile.name.split(' ');
    if (names.length >= 2) {
      return `${names[0][0]}${names[names.length - 1][0]}`.toUpperCase();
    }
    
    return names[0].substring(0, 2).toUpperCase();
  };

  return (
    <StudentLayout>
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-800 dark:text-white">Profile Settings</h2>
          <p className="text-gray-600 dark:text-gray-400">Manage your account details and track your progress</p>
        </div>

        <Tabs defaultValue="general" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3 md:w-[600px]">
            <TabsTrigger value="general">General</TabsTrigger>
            <TabsTrigger value="security">Security</TabsTrigger>
            <TabsTrigger value="progress">Progress</TabsTrigger>
          </TabsList>
          
          <TabsContent value="general" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Profile Information</CardTitle>
                <CardDescription>Update your personal information</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex flex-col md:flex-row gap-6 items-start md:items-center">
                  <Avatar className="h-20 w-20 text-2xl">
                    <AvatarFallback className="bg-primary text-white">
                      {isLoadingProfile ? <Loader2 className="h-6 w-6 animate-spin" /> : getUserInitials()}
                    </AvatarFallback>
                  </Avatar>
                  
                  <div>
                    <h3 className="font-medium text-lg">{profile?.name || 'Loading...'}</h3>
                    <p className="text-gray-500 dark:text-gray-400">{profile?.email || 'Loading...'}</p>
                    <p className="text-sm flex items-center mt-1">
                      <GraduationCap className="h-4 w-4 text-primary mr-1" />
                      <span>Student Account</span>
                    </p>
                  </div>
                </div>
                
                <Separator />
                
                {isLoadingProfile ? (
                  <div className="flex justify-center py-4">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                  </div>
                ) : (
                  <Form {...profileForm}>
                    <form onSubmit={profileForm.handleSubmit(onProfileSubmit)} className="space-y-4">
                      <FormField
                        control={profileForm.control}
                        name="name"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Full Name</FormLabel>
                            <FormControl>
                              <div className="flex items-center">
                                <UserIcon className="mr-2 h-4 w-4 text-gray-500" />
                                <Input {...field} />
                              </div>
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={profileForm.control}
                        name="email"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Email Address</FormLabel>
                            <FormControl>
                              <div className="flex items-center">
                                <Mail className="mr-2 h-4 w-4 text-gray-500" />
                                <Input {...field} />
                              </div>
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <Button 
                        type="submit" 
                        className="mt-4"
                        disabled={updateProfileMutation.isPending}
                      >
                        {updateProfileMutation.isPending && (
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        )}
                        Save Changes
                      </Button>
                    </form>
                  </Form>
                )}
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="security" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Password</CardTitle>
                <CardDescription>Update your password</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <Form {...passwordForm}>
                  <form onSubmit={passwordForm.handleSubmit(onPasswordSubmit)} className="space-y-4">
                    <FormField
                      control={passwordForm.control}
                      name="currentPassword"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Current Password</FormLabel>
                          <FormControl>
                            <div className="flex items-center">
                              <Key className="mr-2 h-4 w-4 text-gray-500" />
                              <Input type="password" {...field} />
                            </div>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={passwordForm.control}
                      name="newPassword"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>New Password</FormLabel>
                          <FormControl>
                            <div className="flex items-center">
                              <Key className="mr-2 h-4 w-4 text-gray-500" />
                              <Input type="password" {...field} />
                            </div>
                          </FormControl>
                          <FormDescription>
                            Password must be at least 6 characters long
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={passwordForm.control}
                      name="confirmPassword"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Confirm New Password</FormLabel>
                          <FormControl>
                            <div className="flex items-center">
                              <Key className="mr-2 h-4 w-4 text-gray-500" />
                              <Input type="password" {...field} />
                            </div>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <Button 
                      type="submit" 
                      className="mt-4"
                      disabled={updatePasswordMutation.isPending}
                    >
                      {updatePasswordMutation.isPending && (
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      )}
                      Update Password
                    </Button>
                  </form>
                </Form>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Account Security</CardTitle>
                <CardDescription>Manage your account security settings</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div>
                    <h4 className="font-medium">Role</h4>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1 flex items-center">
                      <GraduationCap className="h-4 w-4 mr-1 text-primary" />
                      Student
                    </p>
                  </div>
                  
                  <div>
                    <h4 className="font-medium">Last Login</h4>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                      {new Date().toLocaleString()}
                    </p>
                  </div>
                </div>
              </CardContent>
              <CardFooter className="border-t px-6 py-4">
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  If you notice any suspicious activity on your account, please contact your instructor or administrator immediately.
                </p>
              </CardFooter>
            </Card>
          </TabsContent>
          
          <TabsContent value="progress" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Learning Progress</CardTitle>
                <CardDescription>Track your learning journey</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {isLoadingStats ? (
                  <div className="flex justify-center py-4">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                  </div>
                ) : (
                  <>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
                        <div className="text-sm text-gray-500 dark:text-gray-400 mb-1">Courses Enrolled</div>
                        <div className="text-2xl font-bold">{stats?.enrolledCourses || 0}</div>
                      </div>
                      <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
                        <div className="text-sm text-gray-500 dark:text-gray-400 mb-1">Completed Courses</div>
                        <div className="text-2xl font-bold">{stats?.completedCourses || 0}</div>
                      </div>
                      <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
                        <div className="text-sm text-gray-500 dark:text-gray-400 mb-1">Average Score</div>
                        <div className="text-2xl font-bold">{stats?.averageScore || 0}%</div>
                      </div>
                    </div>
                    
                    <div className="space-y-4 mt-6">
                      <h4 className="font-medium">Overall Progress</h4>
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span>Course Completion</span>
                          <span className="font-medium">{stats?.overallProgress || 0}%</span>
                        </div>
                        <Progress value={stats?.overallProgress || 0} className="h-2" />
                      </div>
                      
                      <h4 className="font-medium mt-4">Activity Summary</h4>
                      <div className="space-y-2">
                        <div className="flex justify-between items-center">
                          <span className="text-sm">Tests Completed</span>
                          <span className="font-medium">{stats?.testsCompleted || 0}</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-sm">Assignments Submitted</span>
                          <span className="font-medium">{stats?.assignmentsCompleted || 0}</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-sm">Classes Attended</span>
                          <span className="font-medium">{stats?.classesAttended || 0}</span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="mt-6">
                      <h4 className="font-medium mb-2">Learning Achievements</h4>
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                        <div className="bg-primary bg-opacity-10 text-primary rounded-lg p-3 text-center">
                          <div className="font-semibold">{stats?.codingPoints || 0}</div>
                          <div className="text-xs">Coding Points</div>
                        </div>
                        <div className="bg-secondary bg-opacity-10 text-secondary rounded-lg p-3 text-center">
                          <div className="font-semibold">{stats?.quizPoints || 0}</div>
                          <div className="text-xs">Quiz Points</div>
                        </div>
                        <div className="bg-warning bg-opacity-10 text-warning rounded-lg p-3 text-center">
                          <div className="font-semibold">{stats?.participationPoints || 0}</div>
                          <div className="text-xs">Participation</div>
                        </div>
                      </div>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Skills Breakdown</CardTitle>
                <CardDescription>Your progress in different skill areas</CardDescription>
              </CardHeader>
              <CardContent>
                {isLoadingStats ? (
                  <div className="flex justify-center py-4">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>JavaScript</span>
                        <span className="font-medium">{stats?.skills?.javascript || 0}%</span>
                      </div>
                      <Progress value={stats?.skills?.javascript || 0} className="h-2" />
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>React</span>
                        <span className="font-medium">{stats?.skills?.react || 0}%</span>
                      </div>
                      <Progress value={stats?.skills?.react || 0} className="h-2" />
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Node.js</span>
                        <span className="font-medium">{stats?.skills?.nodejs || 0}%</span>
                      </div>
                      <Progress value={stats?.skills?.nodejs || 0} className="h-2" />
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Database</span>
                        <span className="font-medium">{stats?.skills?.database || 0}%</span>
                      </div>
                      <Progress value={stats?.skills?.database || 0} className="h-2" />
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Problem Solving</span>
                        <span className="font-medium">{stats?.skills?.problemSolving || 0}%</span>
                      </div>
                      <Progress value={stats?.skills?.problemSolving || 0} className="h-2" />
                    </div>
                  </div>
                )}
              </CardContent>
              <CardFooter className="border-t px-6 py-4">
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Skill ratings are based on your performance in related tests, assignments, and courses.
                </p>
              </CardFooter>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </StudentLayout>
  );
}