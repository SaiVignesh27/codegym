import { Switch, Route, Link } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ThemeProvider } from "@/providers/ThemeProvider";
import { AuthProvider } from "@/providers/AuthProvider";
import NotFound from "@/pages/not-found";
import logo from "./faangtech .jpg"

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
import StudentLeaderboard from "@/pages/student/Leaderboard";
import StudentProfile from "@/pages/student/Profile";
import ClassView from "@/pages/student/ClassView";
import TestView from "@/pages/student/TestView";
import TestResults from "@/pages/student/TestResults";
import AssignmentResults from "@/pages/student/AssignmentResults";
import StudentAssignments from "@/pages/student/Assignments";
import AssignmentView from "@/pages/student/AssignmentView";
import faang from "./faangtech .jpg"
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
      <Route path="/student/assignments/:id/results" component={AssignmentResults} />
      <Route path="/student/assignments" component={StudentAssignments} />
      <Route path="/student/leaderboard" component={StudentLeaderboard} />
      <Route path="/student/profile" component={StudentProfile} />

      {/* Root route redirect */}
      <Route path="/">
        
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="container mx-auto px-4 py-20">
          <div className="max-w-5xl mx-auto">
            
            {/* Logo and Title */}
            <div className="text-center mb-16">
              <img 
                src={logo} 
                alt="CodeGym Logo" 
                className="w-28 h-28 mx-auto mb-6 rounded-full  transform transition-transform duration-300 hover:scale-110"
                />
              <h1 className="text-4xl md:text-5xl font-extrabold text-gray-800 mb-3">
                Welcome to <span className="text-indigo-600">CodeGym</span>
                <span className="block text-sm md:text-base text-indigo-500 font-medium mt-1 transform transition-transform duration-300 hover:scale-105">
                  By FAANG Tech Lab – The Coding School
                </span>
              </h1>

              <p className="text-lg md:text-xl text-gray-600">
                Your journey to coding excellence starts here
              </p>
            </div>

            {/* Features Section */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16 ">
              {[
                {
                  icon: "💻",
                  title: "Learn to Code",
                  desc: "Master programming with interactive lessons",
                },
                {
                  icon: "🎯",
                  title: "Track Progress",
                  desc: "Monitor your learning journey",
                },
                {
                  icon: "🏆",
                  title: "Earn Badges",
                  desc: "Get recognized for your achievements",
                },
              ].map((feature, index) => (
                <div
                  key={index}
                  className="bg-white p-8 rounded-2xl shadow-md hover:shadow-xl transition duration-300 transform transition-transform duration-300 hover:scale-110"
                >
                  <div className="text-4xl text-indigo-600 mb-4">{feature.icon}</div>
                  <h3 className="text-lg font-semibold text-gray-800 mb-2">
                    {feature.title}
                  </h3>
                  <p className="text-gray-600 text-sm">{feature.desc}</p>
                </div>
              ))}
            </div>

            {/* Login Buttons */}
            <div className="flex justify-center gap-6">
              <Link
                to="/admin/login"
                className="px-8 py-3 bg-indigo-600 text-white font-medium rounded-lg hover:bg-indigo-700 transition shadow-md hover:shadow-xl transform transition-transform duration-300 hover:scale-110"
              >
                Admin Login
              </Link>
              <Link
                to="/student/login"
                className="px-8 py-3 bg-white text-indigo-600 font-medium rounded-lg border-2 border-indigo-600 hover:bg-indigo-50 transition shadow-md hover:shadow-xl transform transition-transform duration-300 hover:scale-110"
              >
                Student Login
              </Link>
            </div>
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
