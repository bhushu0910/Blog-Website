import { NextResponse } from 'next/server';
import { getAuthAdmin } from '@/lib/auth';
import pool from '@/lib/db';
import { RowDataPacket } from 'mysql2';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const adminSession = await getAuthAdmin();
    if (!adminSession) {
      return NextResponse.json({ authenticated: false, admin: null }, { status: 401 });
    }

    const [rows] = await pool.query<RowDataPacket[]>(
      'SELECT id, username, created_at FROM admins WHERE id = ?',
      [adminSession.id]
    );

    if (rows.length === 0) {
      return NextResponse.json({ authenticated: false, admin: null }, { status: 401 });
    }

    return NextResponse.json({
      authenticated: true,
      admin: rows[0],
    });
  } catch (error) {
    return NextResponse.json({ authenticated: false, admin: null }, { status: 500 });
  }
}
