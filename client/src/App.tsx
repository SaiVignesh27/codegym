import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ThemeProvider } from "@/providers/ThemeProvider";
import { AuthProvider } from "@/providers/AuthProvider";
import NotFound from "@/pages/not-found";

// Auth Pages
import AdminLogin from "@/pages/auth/AdminLogin";
import StudentLogin from "@/pages/auth/StudentLogin";

// Admin Pages
import AdminDashboard from "@/pages/admin/Dashboard";
import AdminUsers from "@/pages/admin/Users";
import AdminCourses from "@/pages/admin/Courses";
import AdminClasses from "@/pages/admin/Classes";
import AdminTests from "@/pages/admin/Tests";
import AdminAssignments from "@/pages/admin/Assignments";
import AdminLeaderboard from "@/pages/admin/Leaderboard";
import AdminProfile from "@/pages/admin/Profile";

// Student Pages
import StudentDashboard from "@/pages/student/Dashboard";
import StudentCourses from "@/pages/student/MyCourses";
import CourseDetail from "@/pages/student/CourseDetail";
import StudentDailyTests from "@/pages/student/DailyTests";
import StudentAssignments from "@/pages/student/Assignments";
import StudentLeaderboard from "@/pages/student/Leaderboard";
import StudentProfile from "@/pages/student/Profile";
import ClassView from "@/pages/student/ClassView";
import TestView from "@/pages/student/TestView";
import TestResults from "@/pages/student/TestResults";
import AssignmentView from "@/pages/student/AssignmentView";

// Logout handler
import { useEffect } from "react";
import { logout } from "./lib/auth";

function LogoutHandler() {
  useEffect(() => {
    logout();
  }, []);
  return null;
}

function Router() {
  return (
    <Switch>
      {/* Auth Routes */}
      <Route path="/admin/login" component={AdminLogin} />
      <Route path="/student/login" component={StudentLogin} />
      <Route path="/logout" component={LogoutHandler} />
      
      {/* Admin Routes */}
      <Route path="/admin/dashboard" component={AdminDashboard} />
      <Route path="/admin/users" component={AdminUsers} />
      <Route path="/admin/courses" component={AdminCourses} />
      <Route path="/admin/classes" component={AdminClasses} />
      <Route path="/admin/tests" component={AdminTests} />
      <Route path="/admin/assignments" component={AdminAssignments} />
      <Route path="/admin/leaderboard" component={AdminLeaderboard} />
      <Route path="/admin/profile" component={AdminProfile} />
      
      {/* Student Routes */}
      <Route path="/student/dashboard" component={StudentDashboard} />
      <Route path="/student/courses" component={StudentCourses} />
      <Route path="/student/courses/:id" component={CourseDetail} />
<Route path="/student/classes/:id" component={ClassView} />
      <Route path="/student/daily-tests" component={StudentDailyTests} />
      <Route path="/student/tests/:id" component={TestView} />
      <Route path="/student/tests/:id/results" component={TestResults} />
      <Route path="/student/assignments/:id" component={AssignmentView} />
      <Route path="/student/assignments/:id/results" component={TestResults} />
      <Route path="/student/assignments" component={StudentAssignments} />
      <Route path="/student/leaderboard" component={StudentLeaderboard} />
      <Route path="/student/profile" component={StudentProfile} />
      
      {/* Root route redirect */}
      <Route path="/">
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <h1 className="text-3xl font-bold mb-4">Welcome to CodeGym</h1>
            <div className="space-x-4">
              <a href="/admin/login" className="text-primary hover:underline">Admin Login</a>
              <a href="/student/login" className="text-primary hover:underline">Student Login</a>
            </div>
          </div>
        </div>
      </Route>
      
      {/* Fallback to 404 */}
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <AuthProvider>
          <TooltipProvider>
            <Toaster />
            <Router />
          </TooltipProvider>
        </AuthProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;
