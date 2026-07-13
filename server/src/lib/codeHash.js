const crypto = require('crypto');

// Hachage simple du code confidentiel (PBKDF2, pas de dépendance externe).
// Stocké en un seul champ "sel:hash" dans app_users.code_hash.
function hashCode(code) {
  const salt = crypto.randomBytes(16).toString('hex');
  const hash = crypto.pbkdf2Sync(code, salt, 100000, 32, 'sha256').toString('hex');
  return `${salt}:${hash}`;
}

function verifyCode(code, stored) {
  if (!stored) return false;
  const [salt, hash] = stored.split(':');
  if (!salt || !hash) return false;
  const check = crypto.pbkdf2Sync(code, salt, 100000, 32, 'sha256').toString('hex');
  const a = Buffer.from(hash, 'hex');
  const b = Buffer.from(check, 'hex');
  return a.length === b.length && crypto.timingSafeEqual(a, b);
}

module.exports = { hashCode, verifyCode };
