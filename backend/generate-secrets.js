
const crypto = require('crypto');

// Generate a 32-character base64 string
const aesKey = crypto.randomBytes(24).toString('base64').slice(0, 32); // Safe for AES-256
const jwtSecret = crypto.randomBytes(32).toString('hex');

console.log('ENCRYPTION_KEY:', aesKey);
console.log('JWT_SECRET:', jwtSecret);