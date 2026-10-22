import jwt from 'jsonwebtoken';

export const generateToken = (userId, role) => {
  return jwt.sign(
    { id: userId, role },
    process.env.JWT_SECRET || 'placetrack_jwt_secret_academic_fallback_key',
    {
      expiresIn: process.env.JWT_EXPIRE || '7d',
    }
  );
};
