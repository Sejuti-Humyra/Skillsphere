import jwt from 'jsonwebtoken';
export const auth = (req, res, next) => {
  const header = req.headers.authorization;
  if (!header) return res.status(401).json({ message: 'No token' });
  const token = header.split(' ')[1];
  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    const userId = payload.id || payload._id || payload.userId || null;
    if (!userId) return res.status(401).json({ message: 'Invalid token payload' });
    // Provide both forms so existing code expecting `id` or `_id` works
    req.user = { id: userId, _id: userId };
    next();
  } catch (err) {
    return res.status(401).json({ message: 'Invalid token' });
  }
};
