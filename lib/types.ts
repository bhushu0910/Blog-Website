export interface User {
  id: number;
  name: string;
  username: string;
  email: string;
  is_disabled: boolean;
  created_at: string;
  updated_at: string;
}

export interface UserWithPassword extends User {
  password_hash: string;
}

export interface Blog {
  id: number;
  user_id: number;
  title: string;
  description: string;
  status: 'published' | 'draft';
  created_at: string;
  updated_at: string;
  author_name?: string;
  author_username?: string;
}

export interface Admin {
  id: number;
  username: string;
  created_at: string;
}

export interface UserAuthSession {
  id: number;
  username: string;
  email: string;
  role: 'user';
}

export interface AdminAuthSession {
  id: number;
  username: string;
  role: 'admin';
}
