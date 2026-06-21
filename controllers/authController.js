const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const dataStore = require('../config/dataStore');

const generateToken = (user) => {
  const jwtSecret = process.env.JWT_SECRET || 'haiderpay_super_secret_jwt_key_987654321';
  // Include user role in token for scalable authentication
  return jwt.sign(
    { 
      id: user.id || user._id, 
      email: user.email, 
      role: user.role 
    }, 
    jwtSecret, 
    { expiresIn: '30d' }
  );
};

exports.signup = async (req, res) => {
  const { fullName, email, phone, cnic, password, businessType, images } = req.body;

  try {
    if (!fullName || !email || !password) {
      return res.status(400).json({ message: 'Please enter required fields (fullName, email, password)' });
    }

    // Check if user already exists
    const existingUser = await dataStore.getUserByEmail(email);
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists with this email' });
    }

    // Hash the password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Map businessType to Role: 'Shop' or 'Restaurant', or fallback to 'Customer'
    let role = 'Customer';
    if (businessType === 'Shop' || businessType === 'Restaurant') {
      role = businessType;
    }

    // Save user to dataStore
    const user = await dataStore.createUser({
      fullName,
      email,
      phone: phone || '',
      cnic: cnic || '',
      password: hashedPassword,
      role,
      images: images || []
    });

    const token = generateToken(user);

    res.status(201).json({
      token,
      user: {
        id: user.id || user._id,
        fullName: user.fullName,
        email: user.email,
        role: user.role
      },
      // Success message for frontend
      message: `You have successfully registered as ${user.role}`
    });
  } catch (error) {
    console.error('Signup error:', error);
    res.status(500).json({ message: 'Server error during registration' });
  }
};

exports.login = async (req, res) => {
  const { email, password } = req.body;

  try {
    if (!email || !password) {
      return res.status(400).json({ message: 'Please enter all fields' });
    }

    // Find user by email
    const user = await dataStore.getUserByEmail(email);
    if (!user) {
      return res.status(400).json({ message: 'Invalid credentials (email not found)' });
    }

    // Verify password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid credentials (incorrect password)' });
    }

    const token = generateToken(user);

    res.json({
      token,
      user: {
        id: user.id || user._id,
        fullName: user.fullName,
        email: user.email,
        role: user.role
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Server error during login' });
  }
};

exports.getMe = async (req, res) => {
  try {
    // req.user has { id, email, role } from token
    const user = await dataStore.getUserById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: 'User profile not found' });
    }
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: 'Server error fetching user details' });
  }
};
