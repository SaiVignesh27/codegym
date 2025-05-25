import React from 'react';
import Sidebar from './Sidebar';
import Header from './Header';
import { SidebarProvider } from '@/contexts/SidebarContext';
import { useAuth } from '@/providers/AuthProvider';
import { Redirect } from 'wouter';

interface StudentLayoutProps {
  children: React.ReactNode;
}

export default function StudentLayout({ children }: StudentLayoutProps) {
  const { isLoggedIn, isStudent, loading } = useAuth();
  
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }
  
  // Redirect if not logged in or not a student
  if (!isLoggedIn || !isStudent) {
    return <Redirect to="/student/login" />;
  }
  
  return (
    <SidebarProvider>
      <div className="flex h-screen overflow-hidden">
        <Sidebar />
        
        <div className="flex-1 flex flex-col overflow-hidden">
          <Header />
          
          <main className="flex-1 overflow-y-auto bg-gray-50 dark:bg-dark-background p-4 md:p-6">
            {children}
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}
