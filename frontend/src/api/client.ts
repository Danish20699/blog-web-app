const BASE_URL = (import.meta as any).env?.VITE_API_URL || 'http://localhost:8000';

interface RequestOptions extends RequestInit {
  auth?: boolean;
  isFormData?: boolean;
}

export async function apiClient<T>(
  endpoint: string,
  options: RequestOptions = {}
): Promise<T> {
  const { auth = true, isFormData = false, headers, ...customConfig } = options;
  const token = localStorage.getItem('blog_auth_token');

  const reqHeaders: Record<string, string> = {
    ...(!isFormData && { 'Content-Type': 'application/json' }),
    ...(auth && token ? { Authorization: `Bearer ${token}` } : {}),
    ...(headers as Record<string, string>),
  };

  const response = await fetch(`${BASE_URL}${endpoint}`, {
    ...customConfig,
    headers: reqHeaders,
  });

  if (!response.ok) {
    let errorMessage = `HTTP Error ${response.status}`;
    try {
      const errorData = await response.json();
      if (typeof errorData.detail === 'string') {
        errorMessage = errorData.detail;
      } else if (Array.isArray(errorData.detail)) {
        errorMessage = errorData.detail.map((d: any) => d.msg).join(', ');
      }
    } catch {
      // Body not JSON
    }
    throw new Error(errorMessage);
  }

  if (response.status === 204) return {} as T;
  return response.json();
}
