
export const API_BASE = ((import.meta.env.VITE_API_BASE as string) || '/api')
  .trim()
  .replace(/\/$/, '');

export type ApiRequestOptions = {
  method?: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
  headers?: HeadersInit;
  body?: unknown;
  accessToken?: string;
  signal?: AbortSignal;
};

export class ApiError extends Error {
  status: number;
  details: unknown;

  constructor(message: string, status: number, details?: unknown) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.details = details;
  }
}

export async function apiFetch<T = unknown>(path: string, options: ApiRequestOptions = {}): Promise<T> {
  const url = `${API_BASE}${path.startsWith('/') ? '' : '/'}${path}`;

  const headers: HeadersInit = {
    Accept: 'application/json',
    ...(options.body !== undefined ? { 'Content-Type': 'application/json' } : {}),
    ...(options.headers || {}),
  };

  if (options.accessToken) {
    (headers as Record<string, string>)['Authorization'] = `Bearer ${options.accessToken}`;
  }

  const res = await fetch(url, {
    method: options.method || (options.body !== undefined ? 'POST' : 'GET'),
    headers,
    body: options.body !== undefined ? JSON.stringify(options.body) : undefined,
    signal: options.signal,
    credentials: 'include',
  });

  const contentType = res.headers.get('content-type') || '';
  const isJson = contentType.includes('application/json');
  const payload = isJson ? await res.json().catch(() => null) : await res.text().catch(() => '');

  if (!res.ok) {
    const msg =
      payload && typeof payload === 'object' && (payload as any).error?.message
        ? String((payload as any).error.message)
        : `Request failed with status ${res.status}`;
    throw new ApiError(msg, res.status, payload);
  }

  return payload as T;
}

export const apiGet = <T = unknown>(path: string, options?: Omit<ApiRequestOptions, 'method' | 'body'>) =>
  apiFetch<T>(path, { ...(options || {}), method: 'GET' });

export const apiPost = <T = unknown>(path: string, body?: unknown, options?: Omit<ApiRequestOptions, 'method' | 'body'>) =>
  apiFetch<T>(path, { ...(options || {}), method: 'POST', body });

