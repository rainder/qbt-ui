import { apiPost } from './client';

export async function login(username: string, password: string): Promise<void> {
  const result = await apiPost<string>('/auth/login', { username, password });
  if (typeof result === 'string' && result.trim() !== 'Ok.') {
    throw new Error('Invalid credentials');
  }
}

export async function logout(): Promise<void> {
  await apiPost('/auth/logout');
}
