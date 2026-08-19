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

    let sql = `SELECT b.id, b.user_id, b.title, b.description, b.status, b.created_at, b.updated_at,
                      u.name as author_name, u.username as author_username, u.email as author_email
               FROM blogs b
               JOIN users u ON b.user_id = u.id`;
    const params: any[] = [];

    if (search.trim()) {
      sql += ' WHERE b.title LIKE ? OR b.description LIKE ? OR u.name LIKE ? OR u.username LIKE ?';
      const term = `%${search.trim()}%`;
      params.push(term, term, term, term);
    }

    sql += ' ORDER BY b.created_at DESC';

    const [blogs] = await pool.query<RowDataPacket[]>(sql, params);

    return NextResponse.json({ blogs });
  } catch (error) {
    console.error('Admin fetch blogs error:', error);
    return NextResponse.json({ message: 'Error fetching blogs for admin.' }, { status: 500 });
  }
}
