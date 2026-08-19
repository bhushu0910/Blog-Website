import { NextResponse } from 'next/server';
import { getAuthUser } from '@/lib/auth';
import pool from '@/lib/db';
import { validateUsername, validateEmail } from '@/lib/validation';
import { RowDataPacket } from 'mysql2';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const sessionUser = await getAuthUser();
    if (!sessionUser) {
      return NextResponse.json({ message: 'Unauthorized.' }, { status: 401 });
    }

    const [rows] = await pool.query<RowDataPacket[]>(
      'SELECT id, name, username, email, created_at, updated_at FROM users WHERE id = ?',
      [sessionUser.id]
    );

    if (rows.length === 0) {
      return NextResponse.json({ message: 'User not found.' }, { status: 404 });
    }

    return NextResponse.json({ user: rows[0] });
  } catch (error) {
    return NextResponse.json({ message: 'Server error.' }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const sessionUser = await getAuthUser();
    if (!sessionUser) {
      return NextResponse.json({ message: 'Unauthorized.' }, { status: 401 });
    }

    const { name, username, email } = await request.json();

    if (!name || name.trim().length === 0) {
      return NextResponse.json({ message: 'Name is required.' }, { status: 400 });
    }
    if (!username || !validateUsername(username)) {
      return NextResponse.json({ message: 'Invalid username format.' }, { status: 400 });
    }
    if (!email || !validateEmail(email)) {
      return NextResponse.json({ message: 'Invalid email format.' }, { status: 400 });
    }

    const [existing] = await pool.query<RowDataPacket[]>(
      'SELECT id, username, email FROM users WHERE (username = ? OR email = ?) AND id != ?',
      [username.trim(), email.trim().toLowerCase(), sessionUser.id]
    );

    if (existing.length > 0) {
      if (existing[0].username.toLowerCase() === username.trim().toLowerCase()) {
        return NextResponse.json({ message: 'Username is already taken by another account.' }, { status: 400 });
      }
      return NextResponse.json({ message: 'Email address is already in use by another account.' }, { status: 400 });
    }

    await pool.query(
      'UPDATE users SET name = ?, username = ?, email = ? WHERE id = ?',
      [name.trim(), username.trim(), email.trim().toLowerCase(), sessionUser.id]
    );

    return NextResponse.json({ message: 'Profile updated successfully!' });
  } catch (error) {
    console.error('Profile update error:', error);
    return NextResponse.json({ message: 'Server error updating profile.' }, { status: 500 });
  }
}
