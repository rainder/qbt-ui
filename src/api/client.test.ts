import { describe, it, expect, vi, beforeEach } from 'vitest';
import { apiGet, apiPost, ApiError } from './client';

describe('apiGet', () => {
  beforeEach(() => { vi.restoreAllMocks(); });

  it('returns parsed JSON on 200', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(
      new Response(JSON.stringify({ ok: 1 }), { status: 200, headers: { 'content-type': 'application/json' } }),
    ));
    expect(await apiGet('/foo')).toEqual({ ok: 1 });
  });

  it('returns text body when not json', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(
      new Response('Ok.', { status: 200, headers: { 'content-type': 'text/plain' } }),
    ));
    expect(await apiGet('/foo')).toBe('Ok.');
  });

  it('throws ApiError with status on non-2xx', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(new Response('Forbidden', { status: 403 })));
    await expect(apiGet('/x')).rejects.toMatchObject({ status: 403, message: 'Forbidden' });
  });
});

describe('apiPost', () => {
  it('sends form-urlencoded by default', async () => {
    const fetchMock = vi.fn().mockResolvedValue(new Response('Ok.', { status: 200 }));
    vi.stubGlobal('fetch', fetchMock);

    await apiPost('/bar', { a: '1', b: '2' });

    const [url, init] = fetchMock.mock.calls[0];
    expect(url).toBe('/api/v2/bar');
    expect(init.method).toBe('POST');
    expect((init.headers as Record<string, string>)['content-type']).toBe('application/x-www-form-urlencoded');
    expect(init.body).toBe('a=1&b=2');
  });

  it('sends FormData when given one', async () => {
    const fetchMock = vi.fn().mockResolvedValue(new Response('Ok.', { status: 200 }));
    vi.stubGlobal('fetch', fetchMock);
    const fd = new FormData();
    fd.append('urls', 'magnet:?xt=...');

    await apiPost('/torrents/add', fd);

    const [, init] = fetchMock.mock.calls[0];
    expect(init.body).toBeInstanceOf(FormData);
    expect(init.headers).toBeUndefined();
  });
});

describe('ApiError', () => {
  it('preserves status', () => {
    const err = new ApiError(403, 'Forbidden');
    expect(err.status).toBe(403);
    expect(err.message).toBe('Forbidden');
  });
});
