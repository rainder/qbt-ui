const BASE = '/api/v2';

export class ApiError extends Error {
  constructor(public status: number, message: string) {
    super(message);
    this.name = 'ApiError';
  }
}

async function parse(res: Response): Promise<unknown> {
  if (!res.ok) {
    const text = await res.text();
    throw new ApiError(res.status, text || res.statusText);
  }
  const ct = res.headers.get('content-type') ?? '';
  if (ct.includes('application/json')) return res.json();
  return res.text();
}

export async function apiGet<T = unknown>(path: string, params?: Record<string, string | number>): Promise<T> {
  const qs = params ? '?' + new URLSearchParams(
    Object.entries(params).map(([k, v]) => [k, String(v)]),
  ) : '';
  const res = await fetch(`${BASE}${path}${qs}`, { credentials: 'include' });
  return parse(res) as Promise<T>;
}

export async function apiPost<T = unknown>(
  path: string,
  body?: Record<string, string | number | boolean> | FormData,
): Promise<T> {
  let init: RequestInit;
  if (body instanceof FormData) {
    init = { method: 'POST', body, credentials: 'include' };
  } else if (body) {
    const params = new URLSearchParams();
    for (const [k, v] of Object.entries(body)) params.append(k, String(v));
    init = {
      method: 'POST',
      headers: { 'content-type': 'application/x-www-form-urlencoded' },
      body: params.toString(),
      credentials: 'include',
    };
  } else {
    init = { method: 'POST', credentials: 'include' };
  }
  const res = await fetch(`${BASE}${path}`, init);
  return parse(res) as Promise<T>;
}
