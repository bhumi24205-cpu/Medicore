const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'medicore_hospital_system_secret_token_2026_xyz';

function verifyToken(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'Authentication required. No Bearer token provided.' });
  }

  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded; // { user_id, username, role, doctor_id, patient_id }
    next();
  } catch (err) {
    return res.status(401).json({ message: 'Invalid or expired token.' });
  }
}

module.exports = {
  verifyToken,
  JWT_SECRET
};
