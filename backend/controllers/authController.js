const User = require('../models/User');
const jwt = require('jsonwebtoken');


const generateToken = (user) => {
  const secret = process.env.JWT_SECRET || 'super_secret_key_for_ecoroute_india_commute_engine_2026';
  return jwt.sign(
    { id: user.id, name: user.name, email: user.email },
    secret,
    { expiresIn: '7d' }
  );
};

exports.register = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ error: 'Please provide all required fields (name, email, password).' });
    }

    const emailNormalized = email.toLowerCase().trim();
    const existingUser = await User.findOne({ where: { email: emailNormalized } });
    if (existingUser) {
      return res.status(400).json({ error: 'User with this email already exists.' });
    }

    const user = await User.create({ name, email, password });
    const token = generateToken(user);

    return res.status(201).json({
      message: 'User registered successfully',
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        points: user.points || 0,
        streak: user.streak || 0,
        badges: user.badges || [],
        lastCommuteDate: user.lastCommuteDate || null
      }
    });
  } catch (error) {
    console.error('Registration error:', error);
    return res.status(500).json({ error: 'Registration failed. Server error.' });
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Please provide both email and password.' });
    }

    const emailNormalized = email.toLowerCase().trim();
    const user = await User.findOne({ where: { email: emailNormalized } });
    if (!user) {
      return res.status(401).json({ error: 'Invalid email or password.' });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ error: 'Invalid email or password.' });
    }

    const token = generateToken(user);

    return res.status(200).json({
      message: 'Login successful',
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        points: user.points || 0,
        streak: user.streak || 0,
        badges: user.badges || [],
        lastCommuteDate: user.lastCommuteDate || null
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    return res.status(500).json({ error: 'Login failed. Server error.' });
  }
};

exports.getMe = async (req, res) => {
  try {
    // req.user is populated by authMiddleware
    const user = await User.findByPk(req.user.id, {
      attributes: ['id', 'name', 'email', 'points', 'streak', 'lastCommuteDate', 'badges', 'created_at']
    });
    if (!user) {
      return res.status(404).json({ error: 'User not found.' });
    }
    return res.status(200).json({ user });
  } catch (error) {
    console.error('GetMe error:', error);
    return res.status(500).json({ error: 'Failed to fetch user profile.' });
  }
};
