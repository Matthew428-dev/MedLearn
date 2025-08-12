// utils/hashToken.js
import { createHash, randomBytes } from 'crypto';

export function makeToken() {
  return randomBytes(32).toString('base64url'); // send this in email
}
export function hashToken(t) {
  return createHash('sha256').update(t, 'utf8').digest('hex'); // 64-char hex
}
