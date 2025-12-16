import { verifyJwt } from '../services/jwt.service.js';

export function requireAuth(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'Chưa đăng nhập' });
  }
  try {
    const token = authHeader.split(' ')[1];
    req.user = verifyJwt(token);
    next();
  } catch (err) {
    res.status(401).json({ message: 'Token không hợp lệ' });
  }
}
