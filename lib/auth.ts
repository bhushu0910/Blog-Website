import bcrypt from 'bcryptjs';
import { SignJWT, jwtVerify } from 'jose';
import { cookies } from 'next/headers';
import { UserAuthSession, AdminAuthSession } from './types';

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || 'fallback-secret-key-change-in-production'
);

const ADMIN_JWT_SECRET = new TextEncoder().encode(
  process.env.ADMIN_JWT_SECRET || 'fallback-admin-secret-key-change-in-production'
);

export const USER_COOKIE_NAME = 'blog_user_token';
export const ADMIN_COOKIE_NAME = 'blog_admin_token';

// Password Hashing
export async function hashPassword(password: string): Promise<string> {
  return await bcrypt.hash(password, 10);
}

export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return await bcrypt.compare(password, hash);
}

// User JWT Session
export async function createSessionToken(payload: UserAuthSession): Promise<string> {
  return new SignJWT({ ...payload })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('7d')
    .sign(JWT_SECRET);
}

export async function verifySessionToken(token: string): Promise<UserAuthSession | null> {
  try {
    const { payload } = await jwtVerify(token, JWT_SECRET);
    return payload as unknown as UserAuthSession;
  } catch (err) {
    return null;
  }
}

// Admin JWT Session
export async function createAdminSessionToken(payload: AdminAuthSession): Promise<string> {
  return new SignJWT({ ...payload })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('1d')
    .sign(ADMIN_JWT_SECRET);
}

export async function verifyAdminSessionToken(token: string): Promise<AdminAuthSession | null> {
  try {
    const { payload } = await jwtVerify(token, ADMIN_JWT_SECRET);
    return payload as unknown as AdminAuthSession;
  } catch (err) {
    return null;
  }
}

// Cookies helper for Route Handlers
export async function getAuthUser(): Promise<UserAuthSession | null> {
  const cookieStore = cookies();
  const token = cookieStore.get(USER_COOKIE_NAME)?.value;
  if (!token) return null;
  return await verifySessionToken(token);
}

export async function getAuthAdmin(): Promise<AdminAuthSession | null> {
  const cookieStore = cookies();
  const token = cookieStore.get(ADMIN_COOKIE_NAME)?.value;
  if (!token) return null;
  return await verifyAdminSessionToken(token);
}
