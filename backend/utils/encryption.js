const crypto = require('crypto');

// Validate encryption key
if (!process.env.ENCRYPTION_KEY || process.env.ENCRYPTION_KEY.length !== 32) {
  throw new Error('Missing or invalid ENCRYPTION_KEY. Must be 32 characters.');
}
const ENCRYPTION_KEY = Buffer.from(process.env.ENCRYPTION_KEY);
const IV_LENGTH = 16; // For AES, this is always 16
const ALGORITHM = 'aes-256-cbc';

function encrypt(text) {
  const iv = crypto.randomBytes(IV_LENGTH);
  const cipher = crypto.createCipheriv(ALGORITHM, ENCRYPTION_KEY, iv);
  let encrypted = cipher.update(text);
  encrypted = Buffer.concat([encrypted, cipher.final()]);
  return iv.toString('hex') + ':' + encrypted.toString('hex');
}

function decrypt(text) {
  const textParts = text.split(':');
  const iv = Buffer.from(textParts.shift(), 'hex');
  const encryptedText = Buffer.from(textParts.join(':'), 'hex');
  const decipher = crypto.createDecipheriv(ALGORITHM, ENCRYPTION_KEY, iv);
  let decrypted = decipher.update(encryptedText);
  decrypted = Buffer.concat([decrypted, decipher.final()]);
  return decrypted.toString();
}

// Mask sensitive data (e.g., for display in logs or responses)
function maskSensitiveData(text, maskChar = '*') {
  if (!text) return '';
  const visibleLength = Math.min(4, Math.floor(text.length / 4));
  const maskedLength = text.length - visibleLength;
  return text.slice(0, visibleLength) + maskChar.repeat(maskedLength);
}

module.exports = {
  encrypt,
  decrypt,
  maskSensitiveData
}; 
