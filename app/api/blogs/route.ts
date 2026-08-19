import { NextResponse } from 'next/server';
import pool from '@/lib/db';
import { getAuthUser } from '@/lib/auth';
import { validateBlogInput } from '@/lib/validation';
import { RowDataPacket, ResultSetHeader } from 'mysql2';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const page = Math.max(1, parseInt(searchParams.get('page') || '1', 10));
    const limit = Math.min(50, Math.max(1, parseInt(searchParams.get('limit') || '6', 10)));
    const search = searchParams.get('search') || '';
    const userIdFilter = searchParams.get('user_id');

    const offset = (page - 1) * limit;

    let whereClause = "WHERE b.status = 'published'";
    const queryParams: any[] = [];

    if (userIdFilter) {
      whereClause += ' AND b.user_id = ?';
      queryParams.push(userIdFilter);
    }

    if (search.trim()) {
      whereClause += ' AND (b.title LIKE ? OR b.description LIKE ?)';
      const searchTerm = `%${search.trim()}%`;
      queryParams.push(searchTerm, searchTerm);
    }

    const [countRows] = await pool.query<RowDataPacket[]>(
      `SELECT COUNT(*) as total FROM blogs b ${whereClause}`,
      queryParams
    );
    const total = countRows[0].total;
    const totalPages = Math.ceil(total / limit) || 1;

    const [blogs] = await pool.query<RowDataPacket[]>(
      `SELECT b.id, b.user_id, b.title, b.description, b.status, b.created_at, b.updated_at,
              u.name as author_name, u.username as author_username
       FROM blogs b
       JOIN users u ON b.user_id = u.id
       ${whereClause}
       ORDER BY b.created_at DESC
       LIMIT ? OFFSET ?`,
      [...queryParams, limit, offset]
    );

    return NextResponse.json({
      blogs,
      pagination: {
        page,
        limit,
        total,
        totalPages,
      },
    });
  } catch (error) {
    console.error('Fetch blogs error:', error);
    return NextResponse.json({ message: 'Error fetching blogs.' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const sessionUser = await getAuthUser();
    if (!sessionUser) {
      return NextResponse.json({ message: 'Unauthorized. Please log in.' }, { status: 401 });
    }

    const body = await request.json();
    const errorMsg = validateBlogInput(body);
    if (errorMsg) {
      return NextResponse.json({ message: errorMsg }, { status: 400 });
    }

    const { title, description } = body;

    const [result] = await pool.query<ResultSetHeader>(
      'INSERT INTO blogs (user_id, title, description, status) VALUES (?, ?, ?, ?)',
      [sessionUser.id, title.trim(), description.trim(), 'published']
    );

    return NextResponse.json(
      { message: 'Blog post published successfully!', blogId: result.insertId },
      { status: 201 }
    );
  } catch (error) {
    console.error('Create blog error:', error);
    return NextResponse.json({ message: 'Error creating blog post.' }, { status: 500 });
  }
}
