const LOGIN_URL = 'https://sandbox.open-metadata.org/api/v1/users/login';
const TOKEN_TTL_MS = 55 * 60 * 1000; // 55 minutes

let cachedToken: string | null = null;
let fetchedAt: number | null = null;

export async function getToken(): Promise<string> {
  if (cachedToken && fetchedAt !== null && Date.now() - fetchedAt < TOKEN_TTL_MS) {
    return cachedToken;
  }

  const res = await fetch(LOGIN_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email: 'admin@open-metadata.org',
      password: 'Admin@1234!',
    }),
  });

  if (!res.ok) {
    throw new Error(`OpenMetadata login failed: ${res.status} ${res.statusText}`);
  }

  const data = await res.json();
  cachedToken = data.accessToken as string;
  fetchedAt = Date.now();
  return cachedToken;
}

export function clearTokenCache(): void {
  cachedToken = null;
  fetchedAt = null;
}