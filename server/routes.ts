import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { mongoStorage } from "./index";
import bcrypt from "bcrypt";

export async function registerRoutes(app: Express): Promise<Server> {
  // Initialize MongoDB connection
  try {
    await mongoStorage.connect();
    console.log('Connected to MongoDB successfully');
  } catch (error) {
    console.error('Failed to connect to MongoDB:', error);
  }
  // Test API endpoint
  app.get('/api/test', (req, res) => {
    res.json({ message: 'API is working!' });
  });
  
  // Admin Dashboard Endpoints
  app.get('/api/admin/dashboard/stats', async (req, res) => {
    try {
      // Get counts from storage
      const users = await storage.listUsers('student');
      const courses = await storage.listCourses();
      const tests = await storage.listTests();
      const assignments = await storage.listAssignments();
      
      const stats = {
        students: users.length,
        courses: courses.length,
        tests: tests.length,
        assignments: assignments.length,
      };
      
      res.json(stats);
    } catch (error) {
      console.error('Error fetching dashboard stats:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  });
  
  app.get('/api/admin/courses/recent', async (req, res) => {
    try {
      const courses = await storage.listCourses();
      // Sort by creation date (newest first) and limit to 5
      const recentCourses = courses
        .sort((a, b) => (b.createdAt?.getTime() || 0) - (a.createdAt?.getTime() || 0))
        .slice(0, 5);
      
      res.json(recentCourses);
    } catch (error) {
      console.error('Error fetching recent courses:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  });
  
  app.get('/api/admin/tests/recent', async (req, res) => {
    try {
      const tests = await storage.listTests();
      // Sort by creation date (newest first) and limit to 5
      const recentTests = tests
        .sort((a, b) => (b.createdAt?.getTime() || 0) - (a.createdAt?.getTime() || 0))
        .slice(0, 5);
      
      res.json(recentTests);
    } catch (error) {
      console.error('Error fetching recent tests:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  });
  
  app.get('/api/admin/activities/recent', async (req, res) => {
    try {
      // Activity data for demonstration
      const activities = [
        {
          _id: '1',
          type: 'enrollment',
          title: 'New Enrollment',
          details: 'John Doe enrolled in JavaScript Basics',
          timestamp: new Date(),
          icon: 'user-plus',
          color: 'blue'
        },
        {
          _id: '2',
          type: 'completion',
          title: 'Course Completed',
          details: 'Sarah Miller completed React Fundamentals',
          timestamp: new Date(Date.now() - 1 * 60 * 60 * 1000),
          icon: 'check-circle',
          color: 'green'
        },
        {
          _id: '3',
          type: 'update',
          title: 'Course Updated',
          details: 'Node.js Advanced was updated with new content',
          timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
          icon: 'refresh-cw',
          color: 'purple'
        },
        {
          _id: '4',
          type: 'deadline',
          title: 'Assignment Due',
          details: 'Database Design assignment is due tomorrow',
          timestamp: new Date(Date.now() - 5 * 60 * 60 * 1000),
          icon: 'clock',
          color: 'orange'
        }
      ];
      
      res.json(activities);
    } catch (error) {
      console.error('Error fetching recent activities:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  });
  
  // Student Dashboard Endpoints
  app.get('/api/student/courses', async (req, res) => {
    try {
      const courses = await storage.listCourses({ visibility: 'public' });
      
      // Add progress information for each course
      const coursesWithProgress = courses.map(course => ({
        ...course,
        progress: Math.floor(Math.random() * 100),
        instructor: {
          name: 'John Instructor',
          initials: 'JI'
        }
      }));
      
      res.json(coursesWithProgress);
    } catch (error) {
      console.error('Error fetching student courses:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  });
  
  app.get('/api/student/tests/upcoming', async (req, res) => {
    try {
      const tests = await storage.listTests({ visibility: 'public' });
      
      // Add additional information for display
      const upcomingTests = tests.slice(0, 3).map(test => ({
        ...test,
        dueDate: new Date(Date.now() + Math.floor(Math.random() * 10) * 24 * 60 * 60 * 1000),
        status: 'pending'
      }));
      
      res.json(upcomingTests);
    } catch (error) {
      console.error('Error fetching upcoming tests:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  });
  
  app.get('/api/student/assignments/pending', async (req, res) => {
    try {
      const assignments = await storage.listAssignments({ visibility: 'public' });
      
      // Add due dates and status
      const pendingAssignments = assignments.slice(0, 3).map(assignment => ({
        ...assignment,
        dueDate: new Date(Date.now() + Math.floor(Math.random() * 10) * 24 * 60 * 60 * 1000),
        status: 'pending'
      }));
      
      res.json(pendingAssignments);
    } catch (error) {
      console.error('Error fetching pending assignments:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  });
  
  app.get('/api/student/achievements', async (req, res) => {
    try {
      // Sample achievements data
      const achievements = [
        {
          _id: '1',
          title: 'Course Champion',
          description: 'Completed JavaScript Fundamentals with 95% score',
          date: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
          icon: 'award',
          type: 'course'
        },
        {
          _id: '2',
          title: 'Test Ace',
          description: 'Scored 100% on React Components Test',
          date: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000),
          icon: 'check-circle',
          type: 'test'
        },
        {
          _id: '3',
          title: 'Quick Learner',
          description: 'Completed 3 classes in one day',
          date: new Date(Date.now() - 21 * 24 * 60 * 60 * 1000),
          icon: 'zap',
          type: 'class'
        }
      ];
      
      res.json(achievements);
    } catch (error) {
      console.error('Error fetching achievements:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  });
  
  app.get('/api/student/stats', async (req, res) => {
    try {
      // Sample student stats data
      const stats = {
        enrolledCourses: 5,
        completedCourses: 2,
        averageScore: 87,
        overallProgress: 65,
        testsCompleted: 12,
        assignmentsCompleted: 8,
        classesAttended: 24,
        codingPoints: 450,
        quizPoints: 320,
        participationPoints: 180,
        skills: {
          javascript: 85,
          react: 70,
          nodejs: 60,
          database: 55,
          problemSolving: 80
        }
      };
      
      res.json(stats);
    } catch (error) {
      console.error('Error fetching student stats:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  });
  
  app.get('/api/student/profile', async (req, res) => {
    try {
      // Get the student user
      const student = await storage.getUserByEmail('student@codegym.com');
      
      if (!student) {
        return res.status(404).json({ error: 'Student not found' });
      }
      
      // Don't send the password
      const { password, ...studentData } = student;
      
      res.json(studentData);
    } catch (error) {
      console.error('Error fetching student profile:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  });
  
  app.get('/api/admin/profile', async (req, res) => {
    try {
      // Get the admin user
      const admin = await storage.getUserByEmail('admin@codegym.com');
      
      if (!admin) {
        return res.status(404).json({ error: 'Admin not found' });
      }
      
      // Don't send the password
      const { password, ...adminData } = admin;
      
      res.json(adminData);
    } catch (error) {
      console.error('Error fetching admin profile:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  });
  
  // Authentication routes
  app.post('/api/auth/admin/login', async (req, res) => {
    try {
      const { email, password } = req.body;
      
      if (!email || !password) {
        return res.status(400).json({ error: 'Email and password are required' });
      }
      
      // Get user by email
      const user = await storage.getUserByEmail(email);
      
      if (!user) {
        return res.status(401).json({ error: 'Invalid credentials' });
      }
      
      // Check if user is admin
      if (user.role !== 'admin') {
        return res.status(403).json({ error: 'Access denied. Not an admin account.' });
      }
      
      // Verify password using bcrypt
      const isValidPassword = await bcrypt.compare(password, user.password);
      
      if (!isValidPassword) {
        return res.status(401).json({ error: 'Invalid credentials' });
      }
      
      // Create token (in a real app, use JWT)
      const token = 'admin-token-' + Date.now();
      
      // Return user info and token
      return res.json({
        user: {
          _id: user._id,
          name: user.name,
          email: user.email,
          role: user.role
        },
        token
      });
    } catch (error) {
      console.error('Admin login error:', error);
      return res.status(500).json({ error: 'Internal server error' });
    }
  });
  
  app.post('/api/auth/student/login', async (req, res) => {
    try {
      const { email, password } = req.body;
      
      if (!email || !password) {
        return res.status(400).json({ error: 'Email and password are required' });
      }
      
      // Get user by email
      const user = await storage.getUserByEmail(email);
      
      if (!user) {
        return res.status(401).json({ error: 'Invalid credentials' });
      }
      
      // Check if user is student
      if (user.role !== 'student') {
        return res.status(403).json({ error: 'Access denied. Not a student account.' });
      }
      
      // Verify password using bcrypt
      const isValidPassword = await bcrypt.compare(password, user.password);
      
      if (!isValidPassword) {
        return res.status(401).json({ error: 'Invalid credentials' });
      }
      
      // Create token (in a real app, use JWT)
      const token = 'student-token-' + Date.now();
      
      // Return user info and token
      return res.json({
        user: {
          _id: user._id,
          name: user.name,
          email: user.email,
          role: user.role
        },
        token
      });
    } catch (error) {
      console.error('Student login error:', error);
      return res.status(500).json({ error: 'Internal server error' });
    }
  });

  const httpServer = createServer(app);

  return httpServer;
}
