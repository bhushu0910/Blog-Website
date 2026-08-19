import { NextResponse } from 'next/server';
import { getAuthUser } from '@/lib/auth';
import pool from '@/lib/db';
import { RowDataPacket } from 'mysql2';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const sessionUser = await getAuthUser();
    if (!sessionUser) {
      return NextResponse.json({ authenticated: false, user: null }, { status: 401 });
    }

    const [rows] = await pool.query<RowDataPacket[]>(
      'SELECT id, name, username, email, is_disabled, created_at, updated_at FROM users WHERE id = ?',
      [sessionUser.id]
    );

    if (rows.length === 0 || rows[0].is_disabled) {
      return NextResponse.json({ authenticated: false, user: null }, { status: 401 });
    }

    return NextResponse.json({
      authenticated: true,
      user: rows[0],
    });
  } catch (error) {
    console.error('Auth me error:', error);
    return NextResponse.json({ authenticated: false, user: null }, { status: 500 });
  }
}
