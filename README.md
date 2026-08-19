# Full-Stack Blog Website (Next.js + MySQL)

A modern, responsive, full-stack blog web application built with **Next.js (App Router)**, **TypeScript**, **Tailwind CSS**, and **MySQL**.

---

## 🌟 Key Features

### 👤 Registered User Features
1. **Home Page**: Featured header banner, recent blog posts grid, responsive navigation.
2. **Authentication**: Secure registration with email & username validation, password confirmation, and non-plaintext password hashing using `bcryptjs`.
3. **Login & Session Management**: Secure authentication via HTTP-only JWT cookies (`blog_user_token`).
4. **User Dashboard**: Overview of user profile info and list of blogs created by the logged-in user.
5. **Blog CRUD Operations**:
   - Create new blog posts with input validation.
   - Edit personal blog posts (with strict server-side ownership authorization).
   - Delete personal blog posts with confirmation dialogs.
6. **Blog Listing & Search**: Paginated `/blogs` page with keyword search across titles and descriptions.
7. **Single Blog View**: Dedicated `/blogs/[id]` pages showing full blog post, author details, creation timestamp, and update timestamp.
8. **Profile Management**: `/profile` page allowing users to view and update their name, username, and email.

### 🛡️ Admin Management System
1. **Dedicated Admin Login**: `/admin/login` page operating on isolated admin credentials.
2. **Admin Dashboard**: `/admin/dashboard` showing total registered users, total published blogs, recent user signups, and recent blog posts.
3. **User Management (`/admin/users`)**:
   - List all registered users with creation timestamps and account statuses.
   - Edit user profiles.
   - Disable/Enable user accounts (prevents login when disabled).
   - Delete user accounts.
   - **Secure Password Reset**: Reset any user password directly without exposing existing password hashes or plaintext passwords.
4. **Blog Management (`/admin/blogs`)**:
   - List all community blog posts.
   - Edit title, content, or publishing status (`published` vs `draft`).
   - Toggle post publishing status with one click.
   - Delete any blog post.

---

## 🚀 Tech Stack

- **Frontend**: Next.js 14 App Router, React 18, Tailwind CSS, Lucide Icons
- **Backend**: Next.js Route Handlers (`app/api/`)
- **Database**: MySQL with `mysql2` connection pool
- **Security & Auth**: `bcryptjs` password hashing, `jose` JWT Tokens in HTTP-only cookies, SQL injection protection via parameterized queries.

---

## 🛠️ Local Setup & Setup Guide

### 1. Prerequisites
- **Node.js** (v18 or higher) & **npm**
- **MySQL Server** (running locally on `localhost:3306`)

### 2. Environment Configuration
Create a `.env.local` file in the root directory (copied from `.env.local.example`):

```env
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=your_mysql_password
DB_NAME=blog_database

JWT_SECRET=super-secret-key-change-this-in-production-123456789
ADMIN_JWT_SECRET=admin-super-secret-key-change-this-in-production-987654321

NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### 3. Database Initialization & Admin Seeding
Run the database setup script to automatically create the `blog_database` database, required tables (`users`, `blogs`, `admins`), indexes, foreign keys, and seed the initial admin user:

```bash
npm run db:init
```

> **Default Admin Credentials**:
> - **Username**: `admin`
> - **Password**: `Admin@123456`

### 4. Running the Application
Start the Next.js development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 📂 Project Architecture

```
├── app/
│   ├── page.tsx (Home Page)
│   ├── layout.tsx (Root Layout)
│   ├── globals.css (Tailwind CSS)
│   ├── register/page.tsx (User Registration)
│   ├── login/page.tsx (User Login)
│   ├── dashboard/page.tsx (User Dashboard)
│   ├── profile/page.tsx (User Profile View/Edit)
│   ├── blogs/
│   │   ├── page.tsx (Blog Listing & Search)
│   │   ├── create/page.tsx (Create Blog Post)
│   │   ├── edit/[id]/page.tsx (Edit Own Blog Post)
│   │   └── [id]/page.tsx (Single Blog Detail)
│   ├── admin/
│   │   ├── login/page.tsx (Admin Login)
│   │   ├── dashboard/page.tsx (Admin Dashboard)
│   │   ├── users/page.tsx (Admin User Management)
│   │   └── blogs/page.tsx (Admin Blog Management)
│   └── api/
│       ├── auth/ (register, login, logout, me)
│       ├── profile/ (get/update profile)
│       ├── blogs/ (list, create, get/edit/delete single blog)
│       └── admin/ (auth, stats, users, blogs, reset-password)
├── components/
│   ├── Navbar.tsx
│   ├── Footer.tsx
│   ├── BlogCard.tsx
│   └── Pagination.tsx
├── lib/
│   ├── db.ts (MySQL connection pool)
│   ├── auth.ts (bcrypt & JWT utilities)
│   ├── validation.ts (Input validation helpers)
│   └── types.ts (TypeScript definitions)
└── scripts/
    ├── schema.sql (DDL SQL file)
    └── init-db.js (Automated DB & Admin initialization script)
```
