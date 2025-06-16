const rateLimitMap = new Map();
const WINDOW_SIZE = 60 * 1000; // 1 minute
const MAX_REQUESTS = 10;

function rateLimitNIDVerification(req, res, next) {
  const userId = req.user && req.user.userId;
  if (!userId) return res.status(401).json({ status: 'error', message: 'Authentication required' });
  const now = Date.now();
  let entry = rateLimitMap.get(userId);
  if (!entry || now - entry.start > WINDOW_SIZE) {
    entry = { count: 1, start: now };
    rateLimitMap.set(userId, entry);
    return next();
  }
  if (entry.count < MAX_REQUESTS) {
    entry.count++;
    return next();
  }
  return res.status(429).json({ status: 'error', message: 'Rate limit exceeded: 10 NID verifications per minute' });
}

module.exports = { rateLimitNIDVerification }; 