import { NextResponse } from 'next/server';
import { getAuthAdmin } from '@/lib/auth';
import pool from '@/lib/db';
import { RowDataPacket } from 'mysql2';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const admin = await getAuthAdmin();
    if (!admin) {
      return NextResponse.json({ message: 'Unauthorized.' }, { status: 401 });
    }

    const [userCountRows] = await pool.query<RowDataPacket[]>('SELECT COUNT(*) as count FROM users');
    const [blogCountRows] = await pool.query<RowDataPacket[]>('SELECT COUNT(*) as count FROM blogs');

    const [recentUsers] = await pool.query<RowDataPacket[]>(
      'SELECT id, name, username, email, is_disabled, created_at FROM users ORDER BY created_at DESC LIMIT 5'
    );

    const [recentBlogs] = await pool.query<RowDataPacket[]>(
      `SELECT b.id, b.title, b.status, b.created_at, u.name as author_name
       FROM blogs b
       JOIN users u ON b.user_id = u.id
       ORDER BY b.created_at DESC LIMIT 5`
    );

    return NextResponse.json({
      totalUsers: userCountRows[0].count,
      totalBlogs: blogCountRows[0].count,
      recentUsers,
      recentBlogs,
    });
  } catch (error) {
    console.error('Admin stats error:', error);
    return NextResponse.json({ message: 'Error fetching stats.' }, { status: 500 });
  }
}
