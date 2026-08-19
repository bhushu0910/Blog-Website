import { NextResponse } from 'next/server';
import pool from '@/lib/db';
import { getAuthUser } from '@/lib/auth';
import { validateBlogInput } from '@/lib/validation';
import { RowDataPacket } from 'mysql2';

interface Context {
  params: {
    id: string;
  };
}

export async function GET(request: Request, { params }: Context) {
  try {
    const blogId = parseInt(params.id, 10);
    if (isNaN(blogId)) {
      return NextResponse.json({ message: 'Invalid blog ID.' }, { status: 400 });
    }

    const [blogs] = await pool.query<RowDataPacket[]>(
      `SELECT b.id, b.user_id, b.title, b.description, b.status, b.created_at, b.updated_at,
              u.name as author_name, u.username as author_username
       FROM blogs b
       JOIN users u ON b.user_id = u.id
       WHERE b.id = ?`,
      [blogId]
    );

    if (blogs.length === 0) {
      return NextResponse.json({ message: 'Blog post not found.' }, { status: 404 });
    }

    return NextResponse.json({ blog: blogs[0] });
  } catch (error) {
    console.error('Get blog error:', error);
    return NextResponse.json({ message: 'Error fetching blog details.' }, { status: 500 });
  }
}

export async function PUT(request: Request, { params }: Context) {
  try {
    const sessionUser = await getAuthUser();
    if (!sessionUser) {
      return NextResponse.json({ message: 'Unauthorized.' }, { status: 401 });
    }

    const blogId = parseInt(params.id, 10);
    if (isNaN(blogId)) {
      return NextResponse.json({ message: 'Invalid blog ID.' }, { status: 400 });
    }

    // Ownership check
    const [existing] = await pool.query<RowDataPacket[]>(
      'SELECT id, user_id FROM blogs WHERE id = ?',
      [blogId]
    );

    if (existing.length === 0) {
      return NextResponse.json({ message: 'Blog post not found.' }, { status: 404 });
    }

    if (existing[0].user_id !== sessionUser.id) {
      return NextResponse.json({ message: 'Forbidden. You can only edit your own blogs.' }, { status: 403 });
    }

    const body = await request.json();
    const errorMsg = validateBlogInput(body);
    if (errorMsg) {
      return NextResponse.json({ message: errorMsg }, { status: 400 });
    }

    const { title, description } = body;

    await pool.query(
      'UPDATE blogs SET title = ?, description = ? WHERE id = ? AND user_id = ?',
      [title.trim(), description.trim(), blogId, sessionUser.id]
    );

    return NextResponse.json({ message: 'Blog post updated successfully!' });
  } catch (error) {
    console.error('Update blog error:', error);
    return NextResponse.json({ message: 'Error updating blog post.' }, { status: 500 });
  }
}

export async function DELETE(request: Request, { params }: Context) {
  try {
    const sessionUser = await getAuthUser();
    if (!sessionUser) {
      return NextResponse.json({ message: 'Unauthorized.' }, { status: 401 });
    }

    const blogId = parseInt(params.id, 10);
    if (isNaN(blogId)) {
      return NextResponse.json({ message: 'Invalid blog ID.' }, { status: 400 });
    }

    // Ownership check
    const [existing] = await pool.query<RowDataPacket[]>(
      'SELECT id, user_id FROM blogs WHERE id = ?',
      [blogId]
    );

    if (existing.length === 0) {
      return NextResponse.json({ message: 'Blog post not found.' }, { status: 404 });
    }

    if (existing[0].user_id !== sessionUser.id) {
      return NextResponse.json({ message: 'Forbidden. You can only delete your own blogs.' }, { status: 403 });
    }

    await pool.query('DELETE FROM blogs WHERE id = ? AND user_id = ?', [blogId, sessionUser.id]);

    return NextResponse.json({ message: 'Blog post deleted successfully!' });
  } catch (error) {
    console.error('Delete blog error:', error);
    return NextResponse.json({ message: 'Error deleting blog post.' }, { status: 500 });
  }
}
