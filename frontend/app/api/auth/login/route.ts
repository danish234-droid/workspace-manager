import { NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongodb';
import { UserModel } from '@/lib/models';
import { comparePassword, signToken, hashPassword } from '@/lib/auth';
import { MOCK_CREDENTIALS, MOCK_USERS } from '@/lib/mockData';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email, password } = body;

    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email and password are required.' },
        { status: 400 }
      );
    }

    await connectToDatabase();
    const normalizedEmail = email.toLowerCase().trim();

    let user = await UserModel.findOne({ email: normalizedEmail });

    // If demo user doesn't exist in DB yet, auto-provision from mock credentials
    if (!user && MOCK_CREDENTIALS[normalizedEmail] && password === MOCK_CREDENTIALS[normalizedEmail]) {
      const mockMeta = MOCK_USERS.find(u => u.email.toLowerCase() === normalizedEmail);
      if (mockMeta) {
        const hashed = await hashPassword(password);
        user = await UserModel.create({
          id: mockMeta.id,
          name: mockMeta.name,
          email: normalizedEmail,
          password: hashed,
          avatarColor: mockMeta.avatarColor || '#6366f1',
        });
      }
    }

    if (!user) {
      return NextResponse.json(
        { error: 'Invalid email or password.' },
        { status: 401 }
      );
    }

    const isMatch = await comparePassword(password, user.password || '');
    if (!isMatch) {
      // Also check mock credentials for demo convenience
      if (MOCK_CREDENTIALS[normalizedEmail] === password) {
        // Update hash to current
        user.password = await hashPassword(password);
        await user.save();
      } else {
        return NextResponse.json(
          { error: 'Invalid email or password.' },
          { status: 401 }
        );
      }
    }

    const token = signToken({
      userId: user.id,
      email: user.email,
      name: user.name,
    });

    const userPayload = {
      id: user.id,
      name: user.name,
      email: user.email,
      avatarUrl: user.avatarUrl,
      avatarColor: user.avatarColor || '#6366f1',
      createdAt: user.createdAt ? new Date(user.createdAt).toISOString() : new Date().toISOString(),
      updatedAt: user.updatedAt ? new Date(user.updatedAt).toISOString() : new Date().toISOString(),
    };

    const response = NextResponse.json({
      message: 'Logged in successfully',
      user: userPayload,
      token,
    });

    response.cookies.set({
      name: 'auth_token',
      value: token,
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60,
      path: '/',
    });

    return response;
  } catch (error: any) {
    console.error('Login error:', error);
    return NextResponse.json(
      { error: error?.message || 'Internal server error during login.' },
      { status: 500 }
    );
  }
}
