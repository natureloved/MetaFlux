import { getToken, clearTokenCache } from './auth';
import type {
  SearchResult,
  TableEntity,
  LineageData,
  LineageNode,
  TestCase,
  ImpactNode,
} from '../types/openmetadata';

const BASE_URL = 'https://sandbox.open-metadata.org/api/v1';

/* ─────────────────────────────────────────────
   Core fetch wrapper
   • Injects auth header on every request
   • On 401: clears token cache and retries once
───────────────────────────────────────────── */
async function apiFetch(path: string, init: RequestInit = {}): Promise<Response> {
  const withAuth = async (token: string): Promise<Response> =>
    fetch(`${BASE_URL}${path}`, {
      ...init,
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
        ...(init.headers ?? {}),
      },
    });

  const res = await withAuth(await getToken());

  if (res.status === 401) {
    clearTokenCache();
    return withAuth(await getToken()); // retry once with fresh token
  }

  return res;
}

async function unwrap<T>(res: Response, label: string): Promise<T> {
  if (!res.ok) {
    const body = await res.text().catch(() => '');
    throw new Error(`${label}: ${res.status} ${res.statusText}${body ? ` — ${body}` : ''}`);
  }
  return res.json() as Promise<T>;
}

/* ─────────────────────────────────────────────
   1. searchAssets
───────────────────────────────────────────── */
export async function searchAssets(query: string, size = 8): Promise<SearchResult[]> {
  const params = new URLSearchParams({
    q: query,
    index: 'dataAsset_search_index',
    from: '0',
    size: String(size),
    includeSourceFields: [
      'id', 'name', 'fullyQualifiedName', 'description',
      'entityType', 'tags', 'owners', 'updatedAt', 'testSuite',
    ].join(','),
  });

  const res = await apiFetch(`/search/query?${params}`);
  const data = await unwrap<{ hits: { hits: Array<{ _source: SearchResult }> } }>(res, 'searchAssets');
  return data.hits?.hits?.map(h => h._source) ?? [];
}

/* ─────────────────────────────────────────────
   2. getTable
───────────────────────────────────────────── */
export async function getTable(fqn: string): Promise<TableEntity> {
  const fields = 'columns,tags,owners,usageSummary,testSuite,followers,domain';
  const res = await apiFetch(`/tables/name/${encodeURIComponent(fqn)}?fields=${fields}`);
  return unwrap<TableEntity>(res, 'getTable');
}

/* ─────────────────────────────────────────────
   3. getLineage
───────────────────────────────────────────── */
export async function getLineage(entityType: string, fqn: string): Promise<LineageData> {
  const res = await apiFetch(
    `/lineage/${entityType}/name/${encodeURIComponent(fqn)}?upstreamDepth=3&downstreamDepth=3`,
  );
  return unwrap<LineageData>(res, 'getLineage');
}

/* ─────────────────────────────────────────────
   4. getTestCases
───────────────────────────────────────────── */
export async function getTestCases(tableFqn: string): Promise<TestCase[]> {
  const params = new URLSearchParams({
    entityLink: `<"<table.${tableFqn}>">`,
    limit: '50',
    fields: 'testDefinition,testCaseResult',
  });
  const res = await apiFetch(`/dataQuality/testCases?${params}`);
  const data = await unwrap<{ data: TestCase[] }>(res, 'getTestCases');
  return data.data ?? [];
}

/* ─────────────────────────────────────────────
   5. getDownstreamNodes  (pure function)
   BFS from the center entity along downstreamEdges,
   returning annotated ImpactNodes sorted by depth.
───────────────────────────────────────────── */
export function getDownstreamNodes(lineageData: LineageData): ImpactNode[] {
  const { entity, nodes, downstreamEdges } = lineageData;

  // id → node lookup
  const byId = new Map<string, LineageNode>(nodes.map(n => [n.id, n]));

  // adjacency: from-id → [to-id, ...]
  const adj = new Map<string, string[]>();
  for (const edge of downstreamEdges) {
    const from = edge.fromEntity.id;
    const to   = edge.toEntity.id;
    if (!adj.has(from)) adj.set(from, []);
    adj.get(from)!.push(to);
  }

  // BFS
  const visited = new Set<string>([entity.id]);
  const queue: { id: string; depth: number }[] = [{ id: entity.id, depth: 0 }];
  const result: ImpactNode[] = [];

  while (queue.length > 0) {
    const { id, depth } = queue.shift()!;

    for (const neighborId of adj.get(id) ?? []) {
      if (visited.has(neighborId)) continue;
      visited.add(neighborId);

      const node = byId.get(neighborId);
      if (node) {
        result.push({
          id:          node.id,
          name:        node.name,
          fqn:         node.fullyQualifiedName,
          entityType:  node.entityType ?? node.type ?? 'unknown',
          depth:       depth + 1,
          displayName: node.displayName,
        });
      }

      queue.push({ id: neighborId, depth: depth + 1 });
    }
  }

  return result.sort((a, b) => a.depth - b.depth);
}

/* ─────────────────────────────────────────────
   Convenience wrapper used by app/api/chat/route.ts
   Fetches lineage then delegates to getDownstreamNodes.
───────────────────────────────────────────── */
export async function getDownstreamImpact(fqn: string): Promise<ImpactNode[]> {
  const lineage = await getLineage('table', fqn);
  return getDownstreamNodes(lineage);
}