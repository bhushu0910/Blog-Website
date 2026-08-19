import { NextResponse } from 'next/server';
import { getAuthAdmin } from '@/lib/auth';
import pool from '@/lib/db';
import { validateUsername, validateEmail } from '@/lib/validation';
import { RowDataPacket } from 'mysql2';

interface Context {
  params: {
    id: string;
  };
}

export async function GET(request: Request, { params }: Context) {
  try {
    const admin = await getAuthAdmin();
    if (!admin) {
      return NextResponse.json({ message: 'Unauthorized.' }, { status: 401 });
    }

    const userId = parseInt(params.id, 10);
    const [rows] = await pool.query<RowDataPacket[]>(
      'SELECT id, name, username, email, is_disabled, created_at, updated_at FROM users WHERE id = ?',
      [userId]
    );

    if (rows.length === 0) {
      return NextResponse.json({ message: 'User not found.' }, { status: 404 });
    }

    return NextResponse.json({ user: rows[0] });
  } catch (error) {
    return NextResponse.json({ message: 'Error fetching user.' }, { status: 500 });
  }
}

export async function PUT(request: Request, { params }: Context) {
  try {
    const admin = await getAuthAdmin();
    if (!admin) {
      return NextResponse.json({ message: 'Unauthorized.' }, { status: 401 });
    }

    const userId = parseInt(params.id, 10);
    const { name, username, email, is_disabled } = await request.json();

    if (!name || name.trim().length === 0) {
      return NextResponse.json({ message: 'Name is required.' }, { status: 400 });
    }
    if (!username || !validateUsername(username)) {
      return NextResponse.json({ message: 'Invalid username.' }, { status: 400 });
    }
    if (!email || !validateEmail(email)) {
      return NextResponse.json({ message: 'Invalid email.' }, { status: 400 });
    }

    // Collision check
    const [existing] = await pool.query<RowDataPacket[]>(
      'SELECT id FROM users WHERE (username = ? OR email = ?) AND id != ?',
      [username.trim(), email.trim().toLowerCase(), userId]
    );

    if (existing.length > 0) {
      return NextResponse.json({ message: 'Username or Email is already used by another account.' }, { status: 400 });
    }

    await pool.query(
      'UPDATE users SET name = ?, username = ?, email = ?, is_disabled = ? WHERE id = ?',
      [name.trim(), username.trim(), email.trim().toLowerCase(), is_disabled ? 1 : 0, userId]
    );

    return NextResponse.json({ message: 'User updated successfully!' });
  } catch (error) {
    return NextResponse.json({ message: 'Error updating user.' }, { status: 500 });
  }
}

export async function DELETE(request: Request, { params }: Context) {
  try {
    const admin = await getAuthAdmin();
    if (!admin) {
      return NextResponse.json({ message: 'Unauthorized.' }, { status: 401 });
    }

    const userId = parseInt(params.id, 10);
    await pool.query('DELETE FROM users WHERE id = ?', [userId]);

    return NextResponse.json({ message: 'User deleted successfully!' });
  } catch (error) {
    return NextResponse.json({ message: 'Error deleting user.' }, { status: 500 });
  }
}
