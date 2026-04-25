const TOKEN = process.env.OPENMETADATA_TOKEN ?? '';

export async function getToken(): Promise<string> {
  if (!TOKEN) throw new Error('OPENMETADATA_TOKEN env var is not set');
  return TOKEN;
}

export function clearTokenCache(): void {
  // no-op — static token needs no cache invalidation
}
