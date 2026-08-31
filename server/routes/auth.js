const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const { supabase } = require('../config/db');
const { protect } = require('../middleware/auth');

// @desc    Register new user
// @route   POST /api/auth/register
// @access  Public
router.post('/register', async (req, res) => {
  const { username, email, password, role } = req.body;

  try {
    // Check if user already exists
    const { data: existingUser } = await supabase
      .from('users')
      .select('id')
      .eq('email', email)
      .maybeSingle();

    if (existingUser) {
      return res.status(400).json({ message: 'User already exists' });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create user in Supabase
    const { data: user, error } = await supabase
      .from('users')
      .insert({
        username,
        email,
        password: hashedPassword,
        role: role || 'student',
      })
      .select()
      .single();

    if (error || !user) {
      return res.status(500).json({ message: error ? error.message : 'Error creating user' });
    }

    const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET, {
      expiresIn: process.env.JWT_EXPIRE || '7d',
    });

    res.status(201).json({
      success: true,
      token,
      user: {
        _id: user.id,
        id: user.id,
        username: user.username,
        email: user.email,
        role: user.role,
        avatar: user.avatar || '',
      },
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  try {
    const { data: user, error } = await supabase
      .from('users')
      .select('*')
      .eq('email', email)
      .maybeSingle();

    if (error || !user) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET, {
      expiresIn: process.env.JWT_EXPIRE || '7d',
    });

    res.json({
      success: true,
      token,
      user: {
        _id: user.id,
        id: user.id,
        username: user.username,
        email: user.email,
        role: user.role,
        avatar: user.avatar || '',
      },
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @desc    Update profile picture
// @route   PUT /api/auth/avatar
// @access  Private
router.put('/avatar', protect, async (req, res) => {
  try {
    const { avatar } = req.body;
    if (!avatar) {
      return res.status(400).json({ success: false, message: 'No image provided' });
    }

    const { data: updatedUser, error } = await supabase
      .from('users')
      .update({ avatar })
      .eq('id', req.user.id)
      .select()
      .single();

    if (error || !updatedUser) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    res.json({
      success: true,
      message: 'Avatar updated successfully',
      avatar: updatedUser.avatar,
    });
  } catch (error) {
    console.error('Avatar update error:', error);
    res.status(500).json({ success: false, message: 'Server error during avatar update' });
  }
});

// @desc    Get current user
// @route   GET /api/auth/me
// @access  Private
router.get('/me', protect, async (req, res) => {
  res.json({
    success: true,
    user: req.user,
  });
});

// @desc    Logout user
// @route   POST /api/auth/logout
// @access  Public
router.post('/logout', (req, res) => {
  res.json({ success: true, message: 'Logged out successfully' });
});

module.exports = router;
