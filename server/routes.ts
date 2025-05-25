import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";

export async function registerRoutes(app: Express): Promise<Server> {
  // Test API endpoint
  app.get('/api/test', (req, res) => {
    res.json({ message: 'API is working!' });
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
      
      // Verify password (this would typically use bcrypt.compare)
      const isValidPassword = user.password === password; // In a real app, use bcrypt.compare
      
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
      
      // Verify password (this would typically use bcrypt.compare)
      const isValidPassword = user.password === password; // In a real app, use bcrypt.compare
      
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
