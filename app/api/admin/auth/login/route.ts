import { NextResponse } from 'next/server';
import pool from '@/lib/db';
import { verifyPassword, createAdminSessionToken, ADMIN_COOKIE_NAME } from '@/lib/auth';
import { RowDataPacket } from 'mysql2';

export async function POST(request: Request) {
  try {
    const { username, password } = await request.json();

    if (!username || !password) {
      return NextResponse.json({ message: 'Admin username and password are required.' }, { status: 400 });
    }

    const [rows] = await pool.query<RowDataPacket[]>(
      'SELECT id, username, password_hash FROM admins WHERE username = ?',
      [username.trim()]
    );

    if (rows.length === 0) {
      return NextResponse.json({ message: 'Invalid admin credentials.' }, { status: 401 });
    }

    const admin = rows[0];
    const isMatch = await verifyPassword(password, admin.password_hash);
    if (!isMatch) {
      return NextResponse.json({ message: 'Invalid admin credentials.' }, { status: 401 });
    }

    const token = await createAdminSessionToken({
      id: admin.id,
      username: admin.username,
      role: 'admin',
    });

    const response = NextResponse.json({
      message: 'Admin login successful!',
      admin: {
        id: admin.id,
        username: admin.username,
      },
    });

    response.cookies.set(ADMIN_COOKIE_NAME, token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 24 * 60 * 60, // 1 day
      path: '/',
    });

    return response;
  } catch (error) {
    console.error('Admin login error:', error);
    return NextResponse.json({ message: 'An internal server error occurred.' }, { status: 500 });
  }
}
