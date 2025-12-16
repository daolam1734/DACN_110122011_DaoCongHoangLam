export function userContextMiddleware(req, res, next) {
  req.userId = req.headers['x-user-id'] || null;
  next();
}
