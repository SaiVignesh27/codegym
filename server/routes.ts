import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { mongoStorage } from "./index";
import bcrypt from "bcrypt";
import { CircleUser } from "lucide-react";

// Add authentication middleware
const authenticateUser = async (req: Request, res: Response, next: Function) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      return res.status(401).json({ error: 'No authorization header' });
    }

    const token = authHeader.split(' ')[1];
    if (!token) {
      return res.status(401).json({ error: 'No token provided' });
    }

    // In a real app, verify JWT token here
    // For now, we'll just check if it's a valid token format
    if (!token.startsWith('student-token-') && !token.startsWith('admin-token-')) {
      return res.status(401).json({ error: 'Invalid token' });
    }

    // Get user from token (in a real app, decode JWT)
    const userEmail = req.headers['x-user-email'] as string;
    if (!userEmail) {
      return res.status(401).json({ error: 'No user email in request' });
    }

    const user = await mongoStorage.getUserByEmail(userEmail);
    if (!user) {
      return res.status(401).json({ error: 'User not found' });
    }

    // Verify token matches user role
    const isAdmin = token.startsWith('admin-token-');
    if ((isAdmin && user.role !== 'admin') || (!isAdmin && user.role !== 'student')) {
      return res.status(403).json({ error: 'Invalid token for user role' });
    }

    // Add user to request object
    (req as any).user = user;
    next();
  } catch (error) {
    console.error('Authentication error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

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
      // Get counts from MongoDB storage
      const users = await mongoStorage.listUsers('student');
      const courses = await mongoStorage.listCourses();
      const tests = await mongoStorage.listTests();
      const assignments = await mongoStorage.listAssignments();

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
      const courses = await mongoStorage.listCourses();
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
      const tests = await mongoStorage.listTests();
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
      const courses = await mongoStorage.listCourses({ visibility: 'public' });
      const classes = await mongoStorage.listClasses({ visibility: 'public' });
      const tests = await mongoStorage.listTests({ visibility: 'public' });
      const assignments = await mongoStorage.listAssignments({ visibility: 'public' });

      const coursesWithProgress = courses.map(course => {
        // Get all items for this course
        const courseClasses = classes.filter(c => c.courseId === course._id);
        const courseTests = tests.filter(t => t.courseId === course._id);
        const courseAssignments = assignments.filter(a => a.courseId === course._id);
        
        const totalItems = courseClasses.length + courseTests.length + courseAssignments.length;
        const completedItems = 0; // This will be updated when we implement progress tracking
        
        return {
          ...course,
          progress: totalItems > 0 ? Math.round((completedItems / totalItems) * 100) : 0,
          instructor: {
            name: course.instructor?.name || 'Unknown Instructor',
            initials: course.instructor?.initials || 'UI'
          }
        };
      });

      res.json(coursesWithProgress);
    } catch (error) {
      console.error('Error fetching student courses:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  app.get('/api/student/tests/upcoming', async (req, res) => {
    try {
      const tests = await mongoStorage.listTests({ visibility: 'public' });

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
      const assignments = await mongoStorage.listAssignments({ visibility: 'public' });

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

  app.get('/api/student/profile', authenticateUser, async (req, res) => {
    try {
      const user = (req as any).user;

      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }

      // Don't send the password
      const { password, ...userData } = user;

      res.json(userData);
    } catch (error) {
      console.error('Error fetching student profile:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  app.patch('/api/student/profile', authenticateUser, async (req, res) => {
    try {
      const { name, email } = req.body;
      const user = (req as any).user;

      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }

      const updatedUser = await mongoStorage.updateUser(user._id, { name, email });
      if (!updatedUser) {
        return res.status(404).json({ error: 'Failed to update user' });
      }

      const { password, ...userData } = updatedUser;
      res.json(userData);
    } catch (error) {
      console.error('Error updating student profile:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  app.patch('/api/student/profile/password', authenticateUser, async (req, res) => {
    try {
      const { currentPassword, newPassword } = req.body;
      const user = (req as any).user;

      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }

      const isValidPassword = await bcrypt.compare(currentPassword, user.password);
      if (!isValidPassword) {
        return res.status(401).json({ error: 'Current password is incorrect' });
      }

      const hashedPassword = await bcrypt.hash(newPassword, 10);
      await mongoStorage.updateUser(user._id, { password: hashedPassword });

      res.json({ message: 'Password updated successfully' });
    } catch (error) {
      console.error('Error updating student password:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  app.get('/api/admin/profile', authenticateUser, async (req, res) => {
    try {
      const user = (req as any).user;

      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }

      // Don't send the password
      const { password, ...userData } = user;

      res.json(userData);
    } catch (error) {
      console.error('Error fetching admin profile:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  app.patch('/api/admin/profile', authenticateUser, async (req, res) => {
    try {
      const { name, email } = req.body;
      const user = (req as any).user;

      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }

      const updatedUser = await mongoStorage.updateUser(user._id, { name, email });
      if (!updatedUser) {
        return res.status(404).json({ error: 'Failed to update user' });
      }

      const { password, ...userData } = updatedUser;
      res.json(userData);
    } catch (error) {
      console.error('Error updating admin profile:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  app.patch('/api/admin/profile/password', authenticateUser, async (req, res) => {
    try {
      const { currentPassword, newPassword } = req.body;
      const user = (req as any).user;

      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }

      const isValidPassword = await bcrypt.compare(currentPassword, user.password);
      if (!isValidPassword) {
        return res.status(401).json({ error: 'Current password is incorrect' });
      }

      const hashedPassword = await bcrypt.hash(newPassword, 10);
      await mongoStorage.updateUser(user._id, { password: hashedPassword });

      res.json({ message: 'Password updated successfully' });
    } catch (error) {
      console.error('Error updating admin password:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  // Admin User Management Endpoints
  app.get('/api/admin/users', async (req, res) => {
    try {
      const role = req.query.role as 'admin' | 'student' | undefined;
      const users = await mongoStorage.listUsers(role);

      // Don't send passwords
      const sanitizedUsers = users.map(user => {
        const { password, ...userWithoutPassword } = user;
        return userWithoutPassword;
      });

      res.json(sanitizedUsers);
    } catch (error) {
      console.error('Error fetching users:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  app.post('/api/admin/users', async (req, res) => {
    try {
      const userData = req.body;
      const newUser = await mongoStorage.createUser(userData);

      // Don't send password
      const { password, ...userWithoutPassword } = newUser;

      res.status(201).json(userWithoutPassword);
    } catch (error) {
      console.error('Error creating user:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  app.get('/api/admin/users/:id', async (req, res) => {
    try {
      const userId = req.params.id;
      const user = await mongoStorage.getUser(userId);

      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }

      // Don't send password
      const { password, ...userWithoutPassword } = user;

      res.json(userWithoutPassword);
    } catch (error) {
      console.error('Error fetching user:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  app.patch('/api/admin/users/:id', async (req, res) => {
    try {
      const userId = req.params.id;
      const userData = req.body;

      const updatedUser = await mongoStorage.updateUser(userId, userData);

      if (!updatedUser) {
        return res.status(404).json({ error: 'User not found' });
      }

      // Don't send password
      const { password, ...userWithoutPassword } = updatedUser;

      res.json(userWithoutPassword);
    } catch (error) {
      console.error('Error updating user:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  app.delete('/api/admin/users/:id', async (req, res) => {
    try {
      const userId = req.params.id;
      const result = await mongoStorage.deleteUser(userId);

      if (!result) {
        return res.status(404).json({ error: 'User not found' });
      }

      res.status(204).send();
    } catch (error) {
      console.error('Error deleting user:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  // Admin Course Management Endpoints
  app.get('/api/admin/courses', async (req, res) => {
    try {
      const courses = await mongoStorage.listCourses();
      res.json(courses);
    } catch (error) {
      console.error('Error fetching courses:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  app.post('/api/admin/courses', async (req, res) => {
    try {
      const courseData = req.body;
      const newCourse = await mongoStorage.createCourse(courseData);
      res.status(201).json(newCourse);
    } catch (error) {
      console.error('Error creating course:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  app.get('/api/admin/courses/:id', async (req, res) => {
    try {
      const courseId = req.params.id;
      const course = await mongoStorage.getCourse(courseId);

      if (!course) {
        return res.status(404).json({ error: 'Course not found' });
      }

      res.json(course);
    } catch (error) {
      console.error('Error fetching course:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  app.patch('/api/admin/courses/:id', async (req, res) => {
    try {
      const courseId = req.params.id;
      const courseData = req.body;

      const updatedCourse = await mongoStorage.updateCourse(courseId, courseData);

      if (!updatedCourse) {
        return res.status(404).json({ error: 'Course not found' });
      }

      res.json(updatedCourse);
    } catch (error) {
      console.error('Error updating course:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  app.delete('/api/admin/courses/:id', async (req, res) => {
    try {
      const courseId = req.params.id;
      const result = await mongoStorage.deleteCourse(courseId);

      if (!result) {
        return res.status(404).json({ error: 'Course not found' });
      }

      res.status(204).send();
    } catch (error) {
      console.error('Error deleting course:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  // Admin Class Management Endpoints
  app.get('/api/admin/classes', async (req, res) => {
    try {
      const courseId = req.query.courseId as string | undefined;
      const classes = await mongoStorage.listClasses({ courseId });
      res.json(classes);
    } catch (error) {
      console.error('Error fetching classes:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  app.post('/api/admin/classes', async (req, res) => {
    try {
      const classData = req.body;
      const newClass = await mongoStorage.createClass(classData);
      res.status(201).json(newClass);
    } catch (error) {
      console.error('Error creating class:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  app.get('/api/admin/classes/:id', async (req, res) => {
    try {
      const classId = req.params.id;
      const classData = await mongoStorage.getClass(classId);

      if (!classData) {
        return res.status(404).json({ error: 'Class not found' });
      }

      res.json(classData);
    } catch (error) {
      console.error('Error fetching class:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  app.patch('/api/admin/classes/:id', async (req, res) => {
    try {
      const classId = req.params.id;
      const classData = req.body;

      const updatedClass = await mongoStorage.updateClass(classId, classData);

      if (!updatedClass) {
        return res.status(404).json({ error: 'Class not found' });
      }

      res.json(updatedClass);
    } catch (error) {
      console.error('Error updating class:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  app.delete('/api/admin/classes/:id', async (req, res) => {
    try {
      const classId = req.params.id;
      const result = await mongoStorage.deleteClass(classId);

      if (!result) {
        return res.status(404).json({ error: 'Class not found' });
      }

      res.status(204).send();
    } catch (error) {
      console.error('Error deleting class:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  // Admin Test Management Endpoints
  app.get('/api/admin/tests', async (req, res) => {
    try {
      const courseId = req.query.courseId as string | undefined;
      const classId = req.query.classId as string | undefined;

      const tests = await mongoStorage.listTests({ courseId, classId });
      res.json(tests);
    } catch (error) {
      console.error('Error fetching tests:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  app.post('/api/admin/tests', async (req, res) => {
    try {
      const testData = req.body;
      const newTest = await mongoStorage.createTest(testData);
      res.status(201).json(newTest);
    } catch (error) {
      console.error('Error creating test:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  app.get('/api/admin/tests/:id', async (req, res) => {
    try {
      const testId = req.params.id;
      const test = await mongoStorage.getTest(testId);

      if (!test) {
        return res.status(404).json({ error: 'Test not found' });
      }

      res.json(test);
    } catch (error) {
      console.error('Error fetching test:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  app.patch('/api/admin/tests/:id', async (req, res) => {
    try {
      const testId = req.params.id;
      const testData = req.body;

      const updatedTest = await mongoStorage.updateTest(testId, testData);

      if (!updatedTest) {
        return res.status(404).json({ error: 'Test not found' });
      }

      res.json(updatedTest);
    } catch (error) {
      console.error('Error updating test:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  app.delete('/api/admin/tests/:id', async (req, res) => {
    try {
      const testId = req.params.id;
      const result = await mongoStorage.deleteTest(testId);

      if (!result) {
        return res.status(404).json({ error: 'Test not found' });
      }

      res.status(204).send();
    } catch (error) {
      console.error('Error deleting test:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  // Admin Assignment Management Endpoints
  app.get('/api/admin/assignments', async (req, res) => {
    try {
      const courseId = req.query.courseId as string | undefined;

      const assignments = await mongoStorage.listAssignments({ courseId });
      res.json(assignments);
    } catch (error) {
      console.error('Error fetching assignments:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  app.post('/api/admin/assignments', async (req, res) => {
    try {
      const assignmentData = req.body;
      const newAssignment = await mongoStorage.createAssignment(assignmentData);
      res.status(201).json(newAssignment);
    } catch (error) {
      console.error('Error creating assignment:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  app.get('/api/admin/assignments/:id', async (req, res) => {
    try {
      const assignmentId = req.params.id;
      const assignment = await mongoStorage.getAssignment(assignmentId);

      if (!assignment) {
        return res.status(404).json({ error: 'Assignment not found' });
      }

      res.json(assignment);
    } catch (error) {
      console.error('Error fetching assignment:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  app.patch('/api/admin/assignments/:id', async (req, res) => {
    try {
      const assignmentId = req.params.id;
      const assignmentData = req.body;

      const updatedAssignment = await mongoStorage.updateAssignment(assignmentId, assignmentData);

      if (!updatedAssignment) {
        return res.status(404).json({ error: 'Assignment not found' });
      }

      res.json(updatedAssignment);
    } catch (error) {
      console.error('Error updating assignment:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  app.delete('/api/admin/assignments/:id', async (req, res) => {
    try {
      const assignmentId = req.params.id;
      const result = await mongoStorage.deleteAssignment(assignmentId);

      if (!result) {
        return res.status(404).json({ error: 'Assignment not found' });
      }

      res.status(204).send();
    } catch (error) {
      console.error('Error deleting assignment:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  // Admin Result Management Endpoints
  app.get('/api/admin/results', async (req, res) => {
    try {
      const studentId = req.query.studentId as string | undefined;
      const courseId = req.query.courseId as string | undefined;
      const testId = req.query.testId as string | undefined;
      const assignmentId = req.query.assignmentId as string | undefined;

      const results = await mongoStorage.listResults({ 
        studentId, 
        courseId, 
        testId, 
        assignmentId 
      });

      res.json(results);
    } catch (error) {
      console.error('Error fetching results:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  app.post('/api/admin/results', async (req, res) => {
    try {
      const resultData = req.body;
      const newResult = await mongoStorage.createResult(resultData);
      res.status(201).json(newResult);
    } catch (error) {
      console.error('Error creating result:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  // Student Endpoints
  app.get('/api/student/courses/:id', async (req, res) => {
    try {
      const courseId = req.params.id;
      const course = await mongoStorage.getCourse(courseId);

      if (!course) {
        return res.status(404).json({ error: 'Course not found' });
      }

      res.json(course);
    } catch (error) {
      console.error('Error fetching course details:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  app.get('/api/student/tests', async (req, res) => {
    try {
      const courseId = req.query.courseId as string | undefined;
      const tests = await mongoStorage.listTests({ 
        visibility: 'public',
        courseId
      });

      // Add status information
      const testsWithStatus = tests.map(test => ({
        ...test,
        status: Math.random() > 0.5 ? 'completed' : 'pending',
        questions: test.questions ? test.questions.length : 0
      }));

      res.json(testsWithStatus);
    } catch (error) {
      console.error('Error fetching student tests:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  app.get('/api/student/tests/:id', async (req, res) => {
    try {
      const testId = req.params.id;
      const test = await mongoStorage.getTest(testId);

      if (!test) {
        return res.status(404).json({ error: 'Test not found' });
      }

      if (test.visibility !== 'public') {
        return res.status(403).json({ error: 'Access denied' });
      }

      res.json(test);
    } catch (error) {
      console.error('Error fetching student test:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  app.get('/api/student/assignments', authenticateUser, async (req, res) => {
    try {
      const courseId = req.query.courseId as string | undefined;
      const user = (req as any).user;

      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }

      const assignments = await mongoStorage.listAssignments({ 
        visibility: 'public',
        courseId
      });

      // Fetch student's assignment results
      const results = await mongoStorage.listResults({ 
        studentId: user._id,
        assignmentId: { $exists: true }
      });

      // Merge assignments with results to determine status
      const assignmentsWithStatus = assignments.map(assignment => {
        const result = results.find(r => r.assignmentId === assignment._id);
        const dueDate = assignment.dueDate ? new Date(assignment.dueDate) : undefined;
        const now = new Date();

        let status: 'pending' | 'in-progress' | 'completed' | 'overdue' = 'pending';
        if (result) {
          status = 'completed';
        } else if (dueDate && dueDate < now) {
          status = 'overdue';
        } else if (assignment.status === 'in-progress') {
          status = 'in-progress';
        }

        return {
          ...assignment,
          status,
          dueDate
        };
      });

      res.json(assignmentsWithStatus);
    } catch (error) {
      console.error('Error fetching student assignments:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  app.get('/api/student/assignments/:id', async (req, res) => {
    try {
      const assignmentId = req.params.id;
      const assignment = await mongoStorage.getAssignment(assignmentId);

      if (!assignment) {
        return res.status(404).json({ error: 'Assignment not found' });
      }

      if (assignment.visibility !== 'public') {
        return res.status(403).json({ error: 'Access denied' });
      }

      res.json(assignment);
    } catch (error) {
      console.error('Error fetching student assignment:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  app.get('/api/student/classes', async (req, res) => {
    try {
      const courseId = req.query.courseId as string | undefined;
      const classes = await mongoStorage.listClasses({ 
        visibility: 'public',
        courseId
      });

      res.json(classes);
    } catch (error) {
      console.error('Error fetching student classes:', error);
      res.status(50).json({ error: 'Internal server error' });
    }
  });

  app.get('/api/student/classes/:id', async (req, res) => {
    try {
      const classId = req.params.id;
      const classData = await mongoStorage.getClass(classId);

      if (!classData) {
        return res.status(404).json({ error: 'Class not found' });
      }

      if (classData.visibility !== 'public') {
        return res.status(403).json({ error: 'Access denied' });
      }

      res.json(classData);
    } catch (error) {
      console.error('Error fetching student class:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  app.get('/api/student/results', authenticateUser, async (req, res) => {
    try {
      const user = (req as any).user;
      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }

      const results = await mongoStorage.listResults({ 
        studentId: user._id
      });

      // If no results found, return empty array instead of 404
      res.json(results || []);
    } catch (error) {
      console.error('Error fetching student results:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  app.get('/api/student/tests/:id/results', authenticateUser, async (req, res) => {
    try {
      const testId = req.params.id;
      const user = (req as any).user;
      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }

      const test = await mongoStorage.getTest(testId);
      if (!test) {
        return res.status(404).json({ error: 'Test not found' });
      }

      const result = await mongoStorage.listResults({ 
        studentId: user._id,
        testId 
      }).then(results => results[0]);

      // Return test data even if no result exists yet
      res.json({ 
        test,
        result: result || null
      });
    } catch (error) {
      console.error('Error fetching test results:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  app.get('/api/student/assignments/:id/results', authenticateUser, async (req, res) => {
    try {
      const assignmentId = req.params.id;
      const user = (req as any).user;
      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }

      const assignment = await mongoStorage.getAssignment(assignmentId);
      if (!assignment) {
        return res.status(404).json({ error: 'Assignment not found' });
      }

      const result = await mongoStorage.listResults({ 
        studentId: user._id,
        assignmentId 
      }).then(results => results[0]);

      if (!result) {
        return res.status(404).json({ error: 'Result not found' });
      }

      res.json({ assignment, result });
    } catch (error) {
      console.error('Error fetching assignment results:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  app.post('/api/student/results', authenticateUser, async (req, res) => {
    try {
      const user = (req as any).user;
      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }

      // Check if a result already exists for this test/assignment
      const existingResult = await mongoStorage.listResults({
        studentId: user._id,
        testId: req.body.testId,
        assignmentId: req.body.assignmentId
      }).then(results => results[0]);

      if (existingResult) {
        // Update existing result
        const updatedResult = await mongoStorage.updateResult(existingResult._id!, {
          ...req.body,
          studentId: user._id,
          submittedAt: new Date()
        });
        return res.json(updatedResult);
      }

      // Create new result
      const resultData = {
        ...req.body,
        studentId: user._id,
        submittedAt: new Date()
      };

      const newResult = await mongoStorage.createResult(resultData);
      res.status(201).json(newResult);
    } catch (error) {
      console.error('Error creating student result:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  app.get('/api/student/leaderboard', async (req, res) => {
    try {
      const courseId = req.query.courseId as string;
      const type = req.query.type as string;
      const timeRange = req.query.timeRange as string;

      // Get results with filters
      const results = await mongoStorage.listResults({
        courseId: courseId !== 'all' ? courseId : undefined,
      });

      // Filter by time range
      const now = new Date();
      const filteredResults = results.filter(result => {
        const submittedAt = new Date(result.submittedAt);
        switch (timeRange) {
          case 'week':
            return (now.getTime() - submittedAt.getTime()) <= 7 * 24 * 60 * 60 * 1000;
          case 'month':
            return (now.getTime() - submittedAt.getTime()) <= 30 * 24 * 60 * 60 * 1000;
          case 'year':
            return (now.getTime() - submittedAt.getTime()) <= 365 * 24 * 60 * 60 * 1000;
          default:
            return true;
        }
      }).filter(result => {
        if (type === 'test') return result.testId;
        if (type === 'assignment') return result.assignmentId;
        return true;
      });

      // Group by student and calculate scores
      const leaderboardMap = new Map();

      for (const result of filteredResults) {
        const student = await mongoStorage.getUser(result.studentId);
        if (!student) continue;

        const entry = leaderboardMap.get(result.studentId) || {
          studentId: result.studentId,
          studentName: student.name,
          courseId: result.courseId,
          testId: result.testId,
          assignmentId: result.assignmentId,
          totalTests: 0,
          totalAssignments: 0,
          score: 0,
          completedAt: result.submittedAt
        };

        if (result.testId) entry.totalTests++;
        if (result.assignmentId) entry.totalAssignments++;
        
        entry.score = Math.round((entry.score + (result.score || 0)) / 
          (entry.totalTests + entry.totalAssignments));

        if (result.submittedAt > entry.completedAt) {
          entry.completedAt = result.submittedAt;
        }

        leaderboardMap.set(result.studentId, entry);
      }

      // Convert to array and sort
      const leaderboard = Array.from(leaderboardMap.values())
        .sort((a, b) => b.score - a.score)
        .slice(0, 10);

      res.json(leaderboard);
    } catch (error) {
      console.error('Error fetching leaderboard:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  app.get('/api/student/progress', authenticateUser, async (req, res) => {
    try {
      const user = (req as any).user;
      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }

      // Get all course progress for the student
      const courseProgress = await mongoStorage.listCourseProgress({ studentId: user._id });
      
      // Get all courses the student is enrolled in
      const courses = await mongoStorage.listCourses({ 
        visibility: 'public',
        createdBy: user._id 
      });
      
      // Calculate overall progress
      const progress = {
        overall: courseProgress.length > 0 
          ? Math.round(courseProgress.reduce((acc, cp) => acc + (cp.completedItems.length / cp.totalItems), 0) / courseProgress.length * 100)
          : 0,
        courses: {
          completed: courseProgress.filter(cp => cp.completedItems.length === cp.totalItems).length,
          inProgress: courseProgress.filter(cp => cp.completedItems.length > 0 && cp.completedItems.length < cp.totalItems).length,
          total: courses.length
        },
        tests: {
          completed: courseProgress.reduce((acc, cp) => acc + cp.completedItems.filter((item: any) => item.itemType === 'test').length, 0),
          pending: courses.reduce((acc, course) => acc + (course.tests?.length || 0), 0) - 
            courseProgress.reduce((acc, cp) => acc + cp.completedItems.filter((item: any) => item.itemType === 'test').length, 0),
          average: courseProgress.length > 0
            ? Math.round(courseProgress.reduce((acc, cp) => {
                const testScores = cp.completedItems
                  .filter((item: any) => item.itemType === 'test' && item.score !== undefined)
                  .map((item: any) => item.score!);
                return acc + (testScores.reduce((sum: number, score: number) => sum + score, 0) / testScores.length);
              }, 0) / courseProgress.length)
            : 0
        },
        assignments: {
          completed: courseProgress.reduce((acc, cp) => acc + cp.completedItems.filter((item: any) => item.itemType === 'assignment').length, 0),
          pending: courses.reduce((acc, course) => acc + (course.assignments?.length || 0), 0) - 
            courseProgress.reduce((acc, cp) => acc + cp.completedItems.filter((item: any) => item.itemType === 'assignment').length, 0),
          average: courseProgress.length > 0
            ? Math.round(courseProgress.reduce((acc, cp) => {
                const assignmentScores = cp.completedItems
                  .filter((item: any) => item.itemType === 'assignment' && item.score !== undefined)
                  .map((item: any) => item.score!);
                return acc + (assignmentScores.reduce((sum: number, score: number) => sum + score, 0) / assignmentScores.length);
              }, 0) / courseProgress.length)
            : 0
        }
      };

      res.json(progress);
    } catch (error) {
      console.error('Error fetching student progress:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  // Update course progress endpoint
  app.post('/api/student/progress', authenticateUser, async (req, res) => {
    try {
      const { courseId, itemId, itemType, score } = req.body;
      const user = (req as any).user;

      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }

      // Get existing progress or create new
      let progress = await mongoStorage.getCourseProgressByStudentAndCourse(user._id, courseId);
      
      if (!progress) {
        // Get course to determine total items
        const course = await mongoStorage.getCourse(courseId);
        if (!course) {
          return res.status(404).json({ error: 'Course not found' });
        }

        // Calculate total items
        const totalItems = (course.classes?.length || 0) + 
          (course.tests?.length || 0) + 
          (course.assignments?.length || 0);

        // Create new progress
        progress = await mongoStorage.createCourseProgress({
          studentId: user._id,
          courseId,
          completedItems: [],
          totalItems
        });
      }

      // Check if item is already completed
      const existingItem = progress.completedItems.find((item: any) => item.itemId === itemId);
      if (existingItem) {
        // Update existing item
        existingItem.completedAt = new Date();
        if (score !== undefined) {
          existingItem.score = score;
        }
      } else {
        // Add new completed item
        progress.completedItems.push({
          itemId,
          itemType,
          completedAt: new Date(),
          score
        });
      }

      // Update progress
      progress.lastActivity = new Date();
      const updatedProgress = await mongoStorage.updateCourseProgress(progress._id!, progress);

      res.json(updatedProgress);
    } catch (error) {
      console.error('Error updating course progress:', error);
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
      const user = await mongoStorage.getUserByEmail(email);

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
      const user = await mongoStorage.getUserByEmail(email);

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

  // Student Results Endpoints
  app.get('/api/student/results/tests', authenticateUser, async (req, res) => {
    try {
      const user = (req as any).user;
      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }

      // Get all test results for this student
      const results = await mongoStorage.listResults({ 
        studentId: user._id,
        testId: { $exists: true }
      });
      res.json(results);
    } catch (error) {
      console.error('Error fetching student test results:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  app.get('/api/student/results/assignments', authenticateUser, async (req, res) => {
    try {
      const user = (req as any).user;
      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }

      // Get all assignment results for this student
      const results = await mongoStorage.listResults({ 
        studentId: user._id,
        assignmentId: { $exists: true }
      });
      res.json(results);
    } catch (error) {
      console.error('Error fetching student assignment results:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  const httpServer = createServer(app);

  return httpServer;
}