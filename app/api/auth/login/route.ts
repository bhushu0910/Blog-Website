import { NextResponse } from 'next/server';
import pool from '@/lib/db';
import { verifyPassword, createSessionToken, USER_COOKIE_NAME } from '@/lib/auth';
import { RowDataPacket } from 'mysql2';

export async function POST(request: Request) {
  try {
    const { identifier, password } = await request.json();

    if (!identifier || !password) {
      return NextResponse.json({ message: 'Email/Username and password are required.' }, { status: 400 });
    }

    const term = identifier.trim();

    // Query by username OR email
    const [rows] = await pool.query<RowDataPacket[]>(
      'SELECT id, name, username, email, password_hash, is_disabled FROM users WHERE username = ? OR email = ?',
      [term, term.toLowerCase()]
    );

    if (rows.length === 0) {
      return NextResponse.json({ message: 'Invalid credentials.' }, { status: 401 });
    }

    const user = rows[0];

    if (user.is_disabled) {
      return NextResponse.json({ message: 'Your account has been disabled. Contact administrator.' }, { status: 403 });
    }

    const isMatch = await verifyPassword(password, user.password_hash);
    if (!isMatch) {
      return NextResponse.json({ message: 'Invalid credentials.' }, { status: 401 });
    }

    const token = await createSessionToken({
      id: user.id,
      username: user.username,
      email: user.email,
      role: 'user',
    });

    const response = NextResponse.json({
      message: 'Login successful!',
      user: {
        id: user.id,
        name: user.name,
        username: user.username,
        email: user.email,
      },
    });

    response.cookies.set(USER_COOKIE_NAME, token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60, // 7 days
      path: '/',
    });

    return response;
  } catch (error: any) {
    console.error('Login error:', error);
    return NextResponse.json({ message: 'An internal server error occurred.' }, { status: 500 });
  }
}
