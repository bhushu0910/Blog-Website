import { NextResponse } from 'next/server';
import { getAuthAdmin } from '@/lib/auth';
import pool from '@/lib/db';
import { validateBlogInput } from '@/lib/validation';
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

    const blogId = parseInt(params.id, 10);
    const [blogs] = await pool.query<RowDataPacket[]>(
      `SELECT b.id, b.user_id, b.title, b.description, b.status, b.created_at, b.updated_at,
              u.name as author_name, u.username as author_username, u.email as author_email
       FROM blogs b
       JOIN users u ON b.user_id = u.id
       WHERE b.id = ?`,
      [blogId]
    );

    if (blogs.length === 0) {
      return NextResponse.json({ message: 'Blog not found.' }, { status: 404 });
    }

    return NextResponse.json({ blog: blogs[0] });
  } catch (error) {
    return NextResponse.json({ message: 'Error fetching blog.' }, { status: 500 });
  }
}

export async function PUT(request: Request, { params }: Context) {
  try {
    const admin = await getAuthAdmin();
    if (!admin) {
      return NextResponse.json({ message: 'Unauthorized.' }, { status: 401 });
    }

    const blogId = parseInt(params.id, 10);
    const body = await request.json();
    const { title, description, status } = body;

    const errorMsg = validateBlogInput({ title, description });
    if (errorMsg) {
      return NextResponse.json({ message: errorMsg }, { status: 400 });
    }

    const blogStatus = status === 'draft' ? 'draft' : 'published';

    await pool.query(
      'UPDATE blogs SET title = ?, description = ?, status = ? WHERE id = ?',
      [title.trim(), description.trim(), blogStatus, blogId]
    );

    return NextResponse.json({ message: 'Blog updated successfully by admin!' });
  } catch (error) {
    return NextResponse.json({ message: 'Error updating blog.' }, { status: 500 });
  }
}

export async function DELETE(request: Request, { params }: Context) {
  try {
    const admin = await getAuthAdmin();
    if (!admin) {
      return NextResponse.json({ message: 'Unauthorized.' }, { status: 401 });
    }

    const blogId = parseInt(params.id, 10);
    await pool.query('DELETE FROM blogs WHERE id = ?', [blogId]);

    return NextResponse.json({ message: 'Blog deleted successfully by admin!' });
  } catch (error) {
    return NextResponse.json({ message: 'Error deleting blog.' }, { status: 500 });
  }
}
