import { NextResponse } from 'next/server';
import { getAuthAdmin } from '@/lib/auth';
import pool from '@/lib/db';
import { RowDataPacket } from 'mysql2';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    const admin = await getAuthAdmin();
    if (!admin) {
      return NextResponse.json({ message: 'Unauthorized.' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search') || '';

    let sql = 'SELECT id, name, username, email, is_disabled, created_at, updated_at FROM users';
    const params: any[] = [];

    if (search.trim()) {
      sql += ' WHERE name LIKE ? OR username LIKE ? OR email LIKE ?';
      const term = `%${search.trim()}%`;
      params.push(term, term, term);
    }

    sql += ' ORDER BY created_at DESC';

    const [users] = await pool.query<RowDataPacket[]>(sql, params);

    return NextResponse.json({ users });
  } catch (error) {
    console.error('Admin fetch users error:', error);
    return NextResponse.json({ message: 'Error fetching users.' }, { status: 500 });
  }
}
