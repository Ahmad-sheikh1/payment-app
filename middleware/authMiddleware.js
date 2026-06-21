const jwt = require('jsonwebtoken');

// Standard Authentication Middleware
const authenticateToken = (req, res, next) => {
  const authHeader = req.header('Authorization');
  
  if (!authHeader) {
    return res.status(401).json({ message: 'No token, authorization denied' });
  }

  const parts = authHeader.split(' ');
  if (parts.length !== 2 || parts[0] !== 'Bearer') {
    return res.status(401).json({ message: 'Token format is invalid (should be Bearer <token>)' });
  }

  const token = parts[1];

  try {
    const jwtSecret = process.env.JWT_SECRET || 'haiderpay_super_secret_jwt_key_987654321';
    const decoded = jwt.verify(token, jwtSecret);
    
    // Attach user payload (id, email, role) directly from token (no DB lookup required)
    req.user = decoded;
    next();
  } catch (err) {
    res.status(401).json({ message: 'Token is not valid' });
  }
};

// Scalable Dynamic Role Authorization Middleware
const authorizeRoles = (allowedRoles = []) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ message: 'User not authenticated' });
    }

    const { role } = req.user;
    
    // Check if user's role is in the allowed roles list
    if (!allowedRoles.includes(role)) {
      return res.status(403).json({ 
        message: `Forbidden: Access restricted. Requires one of these roles: [${allowedRoles.join(', ')}]` 
      });
    }

    next();
  };
};

module.exports = {
  authenticateToken,
  authorizeRoles
};
