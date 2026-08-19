import { NextResponse } from 'next/server';
import pool from '@/lib/db';
import { hashPassword } from '@/lib/auth';
import { validateRegisterInput } from '@/lib/validation';
import { RowDataPacket, ResultSetHeader } from 'mysql2';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const errorMsg = validateRegisterInput(body);
    if (errorMsg) {
      return NextResponse.json({ message: errorMsg }, { status: 400 });
    }

    const { name, username, email, password } = body;

    // Check if username or email already exists
    const [existing] = await pool.query<RowDataPacket[]>(
      'SELECT id, username, email FROM users WHERE username = ? OR email = ?',
      [username.trim(), email.trim().toLowerCase()]
    );

    if (existing.length > 0) {
      if (existing[0].username.toLowerCase() === username.trim().toLowerCase()) {
        return NextResponse.json({ message: 'Username is already taken.' }, { status: 400 });
      }
      return NextResponse.json({ message: 'Email address is already registered.' }, { status: 400 });
    }

    const hashedPassword = await hashPassword(password);

    const [result] = await pool.query<ResultSetHeader>(
      'INSERT INTO users (name, username, email, password_hash) VALUES (?, ?, ?, ?)',
      [name.trim(), username.trim(), email.trim().toLowerCase(), hashedPassword]
    );

    return NextResponse.json(
      { message: 'Registration successful!', userId: result.insertId },
      { status: 201 }
    );
  } catch (error: any) {
    console.error('Registration error:', error);
    return NextResponse.json({ message: 'An internal server error occurred.' }, { status: 500 });
  }
}
