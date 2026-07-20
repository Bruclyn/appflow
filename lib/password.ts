import { randomBytes, scrypt, timingSafeEqual } from 'crypto'
import { promisify } from 'util'

const scryptAsync = promisify(scrypt)
const KEY_LENGTH = 64

/**
 * Hash a plaintext password using scrypt (built into Node — no bcrypt dependency
 * required). Returns a `salt:hash` string safe to persist.
 */
export async function hashPassword(password: string): Promise<string> {
  const salt = randomBytes(16).toString('hex')
  const derived = (await scryptAsync(password, salt, KEY_LENGTH)) as Buffer
  return `${salt}:${derived.toString('hex')}`
}

/** Verify a plaintext password against a stored `salt:hash` value. */
export async function verifyPassword(
  password: string,
  stored: string,
): Promise<boolean> {
  const [salt, key] = stored.split(':')
  if (!salt || !key) return false
  const derived = (await scryptAsync(password, salt, KEY_LENGTH)) as Buffer
  const keyBuffer = Buffer.from(key, 'hex')
  if (keyBuffer.length !== derived.length) return false
  return timingSafeEqual(keyBuffer, derived)
}
