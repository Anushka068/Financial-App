import express from 'express';
import { generateToken } from '../middleware/auth.js';
import { validateLoginInput, validateRegisterInput } from '../middleware/validation.js';
import User from '../models/User.js';

const router = express.Router();

// Login
router.post('/login', validateLoginInput, async (req, res, next) => {
  try {
    const { email, password } = req.body;

    // Find user
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Check password
    const isValidPassword = await user.comparePassword(password);
    if (!isValidPassword) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Generate token
    const token = generateToken({ 
      id: user._id, 
      email: user.email, 
      role: user.role 
    });

    res.json({
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        avatar: user.avatar
      }
    });
  } catch (error) {
    next(error);
  }
});

// Register
router.post('/register', validateRegisterInput, async (req, res, next) => {
  try {
    const { name, email, password } = req.body;

    // Check if user exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ error: 'User already exists' });
    }

    // Create new user
    const newUser = await User.create({
      name,
      email,
      password,
      role: 'user'
    });

    // Generate token
    const token = generateToken({ 
      id: newUser._id, 
      email: newUser.email, 
      role: newUser.role 
    });

    res.status(201).json({
      token,
      user: {
        id: newUser._id,
        name: newUser.name,
        email: newUser.email,
        role: newUser.role,
        avatar: newUser.avatar
      }
    });
  } catch (error) {
    next(error);
  }
});

export default router;