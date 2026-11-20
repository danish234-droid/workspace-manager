import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { cookies } from 'next/headers';
import connectToDatabase from './mongodb';
import { UserModel } from './models';
import type { User } from '@/types';

const JWT_SECRET = process.env.JWT_SECRET || 'workspace-manager-jwt-super-secret-key-2026';
const JWT_EXPIRES_IN = '7d';

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 10);
}

export async function comparePassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

export interface JWTPayload {
  userId: string;
  email: string;
  name: string;
}

export function signToken(payload: JWTPayload): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
}

export function verifyToken(token: string): JWTPayload | null {
  try {
    return jwt.verify(token, JWT_SECRET) as JWTPayload;
  } catch {
    return null;
  }
}

export async function getAuthenticatedUser(request?: Request): Promise<User | null> {
  try {
    let token: string | null = null;

    if (request) {
      const authHeader = request.headers.get('authorization');
      if (authHeader && authHeader.startsWith('Bearer ')) {
        token = authHeader.substring(7);
      }
    }

    if (!token) {
      const cookieStore = await cookies();
      const authCookie = cookieStore.get('auth_token');
      if (authCookie) {
        token = authCookie.value;
      }
    }

    if (!token) {
      return null;
    }

    const payload = verifyToken(token);
    if (!payload || !payload.userId) {
      return null;
    }

    await connectToDatabase();
    const userDoc = await UserModel.findOne({ id: payload.userId }).lean();
    if (!userDoc) {
      // Fallback search by email
      const userByEmail = await UserModel.findOne({ email: payload.email }).lean();
      if (!userByEmail) return null;
      return {
        id: userByEmail.id,
        name: userByEmail.name,
        email: userByEmail.email,
        avatarUrl: userByEmail.avatarUrl,
        avatarColor: userByEmail.avatarColor || '#6366f1',
        createdAt: userByEmail.createdAt ? new Date(userByEmail.createdAt).toISOString() : new Date().toISOString(),
        updatedAt: userByEmail.updatedAt ? new Date(userByEmail.updatedAt).toISOString() : new Date().toISOString(),
      };
    }

    return {
      id: userDoc.id,
      name: userDoc.name,
      email: userDoc.email,
      avatarUrl: userDoc.avatarUrl,
      avatarColor: userDoc.avatarColor || '#6366f1',
      createdAt: userDoc.createdAt ? new Date(userDoc.createdAt).toISOString() : new Date().toISOString(),
      updatedAt: userDoc.updatedAt ? new Date(userDoc.updatedAt).toISOString() : new Date().toISOString(),
    };
  } catch (error) {
    console.error('Error in getAuthenticatedUser:', error);
    return null;
  }
}
