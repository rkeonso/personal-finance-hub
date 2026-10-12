import jwt from 'jsonwebtoken';

export function requireAuth(req, res, next) {
  const token = req.cookies.token;

  if (!token) {
    return res.status(401).json({ error: 'Authentication required' });
  }

  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    req.user = payload; // Contains { userId: string }
    next();
  } catch (err) {
    return res.status(403).json({ error: 'Invalid or expired session token' });
  }
}