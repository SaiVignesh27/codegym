import type { VercelRequest, VercelResponse } from '@vercel/node';
import { MongoClient } from 'mongodb';
import bcrypt from 'bcrypt';

const MONGODB_URI = "mongodb+srv://saivigneshkadiri:sai12345@codegym.bpmjmxr.mongodb.net/?retryWrites=true&w=majority&appName=codegym";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    const client = await MongoClient.connect(MONGODB_URI);
    const db = client.db('codegym');
    const user = await db.collection('users').findOne({ email });

    if (!user) {
      await client.close();
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    if (user.role !== 'admin') {
      await client.close();
      return res.status(403).json({ error: 'Access denied. Not an admin account.' });
    }

    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      await client.close();
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const token = 'admin-token-' + Date.now();
    await client.close();

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
} 