import React from 'react';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation } from '@tanstack/react-query';
import { LoginCredentials } from '@shared/types';
import { loginUser } from '@/lib/auth';
import { useLocation } from 'wouter';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Loader2, Code } from 'lucide-react';

// Form validation schema
const loginSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(1, 'Password is required'),
});

export default function StudentLogin() {
  const [, navigate] = useLocation();
  const { toast } = useToast();
  
  // Setup form with validation
  const form = useForm<z.infer<typeof loginSchema>>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });
  
  // Setup login mutation
  const loginMutation = useMutation({
    mutationFn: (credentials: LoginCredentials) => loginUser(credentials, 'student'),
    onSuccess: () => {
      toast({
        title: 'Login successful',
        description: 'Welcome to CodeGym',
      });
      navigate('/student/dashboard');
    },
    onError: (error) => {
      toast({
        title: 'Login failed',
        description: (error as Error).message || 'Invalid credentials',
        variant: 'destructive',
      });
    },
  });
  
  // Form submission handler
  const onSubmit = (data: z.infer<typeof loginSchema>) => {
    loginMutation.mutate(data);
  };
  
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-dark-background p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <div className="flex items-center justify-center w-12 h-12 rounded-md bg-primary text-white">
              <Code className="h-6 w-6" />
            </div>
          </div>
          <CardTitle className="text-2xl font-bold text-center">Student Login</CardTitle>
          <CardDescription>
            Enter your credentials to access your learning dashboard
          </CardDescription>
        </CardHeader>
        
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input placeholder="student@example.com" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Password</FormLabel>
                    <FormControl>
                      <Input type="password" placeholder="••••••••" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <Button 
                type="submit" 
                className="w-full"
                disabled={loginMutation.isPending}
              >
                {loginMutation.isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Logging in...
                  </>
                ) : (
                  'Login'
                )}
              </Button>
            </form>
          </Form>
        </CardContent>
        
        <CardFooter className="flex justify-center text-sm text-gray-500 dark:text-gray-400">
          <div>
            <span>Are you an admin? </span>
            <Button variant="link" className="p-0 h-auto" onClick={() => navigate('/admin/login')}>
              Login here
            </Button>
          </div>
        </CardFooter>
      </Card>
    </div>
  );
}
