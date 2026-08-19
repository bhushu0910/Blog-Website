import { NextResponse } from 'next/server';
import { getAuthAdmin, hashPassword } from '@/lib/auth';
import pool from '@/lib/db';

interface Context {
  params: {
    id: string;
  };
}

export async function POST(request: Request, { params }: Context) {
  try {
    const admin = await getAuthAdmin();
    if (!admin) {
      return NextResponse.json({ message: 'Unauthorized.' }, { status: 401 });
    }

    const userId = parseInt(params.id, 10);
    const { newPassword } = await request.json();

    if (!newPassword || newPassword.length < 6) {
      return NextResponse.json({ message: 'New password must be at least 6 characters long.' }, { status: 400 });
    }

    const hashedPassword = await hashPassword(newPassword);

    await pool.query('UPDATE users SET password_hash = ? WHERE id = ?', [hashedPassword, userId]);

    return NextResponse.json({ message: 'User password reset successfully.' });
  } catch (error) {
    console.error('Reset password error:', error);
    return NextResponse.json({ message: 'Error resetting password.' }, { status: 500 });
  }
}
