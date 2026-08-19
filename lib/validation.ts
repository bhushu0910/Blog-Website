export function validateEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

export function validateUsername(username: string): boolean {
  // 3 to 30 characters, alphanumeric and underscores/hyphens
  const usernameRegex = /^[a-zA-Z0-9_-]{3,30}$/;
  return usernameRegex.test(username);
}

export interface RegisterInput {
  name?: string;
  username?: string;
  email?: string;
  password?: string;
  confirmPassword?: string;
}

export function validateRegisterInput(input: RegisterInput): string | null {
  if (!input.name || input.name.trim().length === 0) {
    return 'Full Name is required.';
  }
  if (!input.username || !validateUsername(input.username)) {
    return 'Username must be 3-30 characters long and contain only letters, numbers, underscores, or hyphens.';
  }
  if (!input.email || !validateEmail(input.email)) {
    return 'Please provide a valid email address.';
  }
  if (!input.password || input.password.length < 6) {
    return 'Password must be at least 6 characters long.';
  }
  if (input.password !== input.confirmPassword) {
    return 'Passwords do not match.';
  }
  return null;
}

export interface BlogInput {
  title?: string;
  description?: string;
}

export function validateBlogInput(input: BlogInput): string | null {
  if (!input.title || input.title.trim().length === 0) {
    return 'Blog title is required.';
  }
  if (input.title.trim().length > 255) {
    return 'Title must not exceed 255 characters.';
  }
  if (!input.description || input.description.trim().length === 0) {
    return 'Blog content/description is required.';
  }
  return null;
}
