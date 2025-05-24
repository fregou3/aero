const jwt = require('jsonwebtoken');
const db = require('../models');
const User = db.user;

module.exports = async (req, res, next) => {
  // Get token from header
  const token = req.header('x-auth-token');

  // Check if no token
  if (!token) {
    return res.status(401).json({ message: 'No token, authorization denied' });
  }

  try {
    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'aeromaintenance-secret');

    // Add user from payload
    req.user = decoded.user;

    // Check if user still exists and is active
    const user = await User.findByPk(req.user.id);
    if (!user) {
      return res.status(401).json({ message: 'User not found' });
    }
    
    if (!user.active) {
      return res.status(401).json({ message: 'User account is inactive' });
    }

    next();
  } catch (err) {
    res.status(401).json({ message: 'Token is not valid' });
  }
};
