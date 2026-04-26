import { NextRequest, NextResponse } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';
import {
  searchAssets,
  getTable,
  getLineage,
  getTestCases,
  getDownstreamNodes,
  getAsset,
} from '../../../lib/openmetadata';
import { computeHealthScore } from '../../../lib/scoring';
import type { TableEntity } from '../../../types/openmetadata';

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY || '' });

interface SessionAsset {
  name: string;
  fqn: string;
  entityType: string;
}

function piiCheck(table: TableEntity): {
  hasPII: boolean;
  piiDetails: { columns: string[]; owner: string | null } | null;
} {
  const piiColumns: string[] = [];

  const columns = (table as any).columns || [];
  for (const col of columns) {
    if (col.tags?.some(tag => /pii|sensitive/i.test(tag.tagFQN))) {
      piiColumns.push(col.name);
    }
  }

  const tableTagPII = table.tags?.some(tag => /pii|sensitive/i.test(tag.tagFQN)) ?? false;

  if (piiColumns.length === 0 && !tableTagPII) return { hasPII: false, piiDetails: null };

  const owner = table.owners?.[0];
  return {
    hasPII: true,
    piiDetails: {
      columns: piiColumns,
      owner: owner?.displayName ?? owner?.name ?? null,
    },
  };
}

function extractDiscovered(data: unknown, intent: string): SessionAsset[] {
  const assets: SessionAsset[] = [];
  if (!data) return assets;

  switch (intent) {
    case 'search': {
      const d = data as { results?: Array<{ name: string; fullyQualifiedName: string; entityType: string }> };
      for (const r of d.results ?? []) {
        assets.push({ name: r.name, fqn: r.fullyQualifiedName, entityType: r.entityType });
      }
      break;
    }
    case 'lineage': {
      const d = data as { table?: TableEntity };
      if (d.table?.fullyQualifiedName) {
        assets.push({ name: d.table.name, fqn: d.table.fullyQualifiedName, entityType: 'table' });
      }
      break;
    }
    case 'schema':
    case 'quality': {
      const d = data as { table?: TableEntity };
      if (d.table?.fullyQualifiedName) {
        assets.push({ name: d.table.name, fqn: d.table.fullyQualifiedName, entityType: 'table' });
      }
      break;
    }
    case 'impact': {
      const nodes = data as Array<{ name: string; fqn: string; entityType: string }>;
      if (Array.isArray(nodes)) {
        for (const n of nodes) assets.push({ name: n.name, fqn: n.fqn, entityType: n.entityType });
      }
      break;
    }
    case 'compare': {
      const d = data as { table1?: TableEntity; table2?: TableEntity };
      if (d.table1) assets.push({ name: d.table1.name, fqn: d.table1.fullyQualifiedName, entityType: 'table' });
      if (d.table2) assets.push({ name: d.table2.name, fqn: d.table2.fullyQualifiedName, entityType: 'table' });
      break;
    }
  }

  return assets;
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      message,
      sessionContext,
      conversationHistory,
    }: {
      message: string;
      sessionContext: SessionAsset[];
      conversationHistory: Array<{ role: 'user' | 'assistant'; content: string }>;
    } = body;

    if (!message?.trim()) {
      return NextResponse.json({ error: 'message is required' });
    }

    const systemPrompt = `You are MetaFlux, an expert AI assistant for data catalog exploration built on OpenMetadata. You help data engineers, analysts, and non-technical users understand their data landscape.

Session context (assets already discussed): ${JSON.stringify(sessionContext ?? [])}

Your job: classify the user intent and extract key parameters.
Respond ONLY with a valid JSON object — no markdown, no extra text:

{
  "intent": "search" | "lineage" | "impact" | "schema" | "quality" | "compare" | "general",
  "primaryQuery": string,
  "secondaryQuery": string,
  "aiResponse": string,
  "confidence": "high" | "medium" | "low"
}

Intent rules:
- search: General asset searches like "find PII", "failing tests", "customer tables"
- lineage: Upstream/downstream mapping for a specific asset
- impact: Downstream risk/blast-radius for a specific asset
- schema: Structure/columns for a specific asset
- quality: Reliability/test results for a specific asset
- compare: Side-by-side comparison of two assets
- general: Direct answers for general questions

For pronouns like 'it', 'that table', 'the one we just discussed':
resolve them using sessionContext before responding.

If the user provides a name (e.g. 'table_X') but you don't have its FQN in sessionContext, DO NOT guess a complex FQN. Just use the simple name (e.g. 'table_X') as the primaryQuery and the backend will resolve it.

- To find unowned assets: use intent 'search' with primaryQuery 'NOT owners.id:*'
- To find assets with PII: use intent 'search' with primaryQuery 'tags.tagFQN:*PII*'
- To find failing tests: use intent 'search' with primaryQuery 'testCaseResult.testCaseStatus:Failed'`;

    const messages: Array<{ role: 'user' | 'assistant'; content: string }> = [
      ...(conversationHistory ?? []),
      { role: 'user', content: message },
    ];

    const aiRes = await anthropic.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 1000,
      system: systemPrompt,
      messages,
    });

    const firstContent = aiRes.content[0];
    if (firstContent.type !== 'text') {
      return NextResponse.json({ error: 'AI returned non-text response' });
    }

    let parsed: {
      intent: string;
      primaryQuery: string;
      secondaryQuery?: string;
      aiResponse: string;
      confidence: string;
    };

    try {
      const raw = firstContent.text.trim();
      const jsonText = raw.startsWith('{') ? raw : (raw.match(/```(?:json)?\n?([\s\S]*?)\n?```/)?.[1] ?? raw);
      parsed = JSON.parse(jsonText);
    } catch {
      return NextResponse.json({ error: 'AI returned unparseable response' });
    }

    const { intent, primaryQuery, secondaryQuery, confidence } = parsed;
    let { aiResponse } = parsed;

    if (!aiResponse?.trim()) {
      if (intent === 'search') aiResponse = `I found some assets matching "${primaryQuery}".`;
      else if (intent === 'schema') aiResponse = `Here is the schema for ${primaryQuery}.`;
      else if (intent === 'lineage') aiResponse = `Here is the lineage for ${primaryQuery}.`;
      else if (intent === 'quality') aiResponse = `Here are the data quality results for ${primaryQuery}.`;
      else aiResponse = "I've retrieved the data you requested.";
    }

    let data: unknown = null;
    let hasPII = false;
    let piiDetails: { columns: string[]; owner: string | null } | null = null;

    const mergePII = (result: ReturnType<typeof piiCheck>) => {
      if (!result.hasPII) return;
      hasPII = true;
      if (!piiDetails) {
        piiDetails = result.piiDetails;
      } else {
        piiDetails = {
          columns: [...piiDetails.columns, ...(result.piiDetails?.columns ?? [])],
          owner: piiDetails.owner ?? result.piiDetails?.owner ?? null,
        };
      }
    };

    const getRobustAsset = async (query: string) => {
      // 1. Try search first to find the type and FQN
      let results = await searchAssets(query, 1);

      // 2. Fallback: try basename if it looks like a hallucinated FQN
      if (results.length === 0 && query.includes('.')) {
        const basename = query.split('.').pop() || query;
        results = await searchAssets(basename, 1);
      }

      // 3. Fallback: try direct getTable if it's a known table FQN
      if (results.length === 0) {
        try {
          return await getTable(query);
        } catch {
          throw new Error(`Asset not found for: ${query}`);
        }
      }

      const asset = await getAsset(results[0].entityType, results[0].fullyQualifiedName);
      return { ...asset, entityType: results[0].entityType };
    };

    switch (intent) {
      case 'search': {
        const assets = await searchAssets(primaryQuery);
        const enriched = await Promise.all(
          assets.map(async (asset) => {
            try {
              const table = await getAsset(asset.entityType, asset.fullyQualifiedName);
              const tests = asset.entityType === 'table' ? await getTestCases(asset.fullyQualifiedName) : [];
              mergePII(piiCheck(table));
              return { ...asset, healthScore: computeHealthScore(table, tests) };
            } catch {
              return asset;
            }
          }),
        );
        data = { results: enriched, query: primaryQuery };
        break;
      }

      case 'lineage': {
        const table = await getRobustAsset(primaryQuery);
        const lineage = await getLineage(table.entityType || 'table', table.fullyQualifiedName);
        mergePII(piiCheck(table));
        data = { table, lineage };
        break;
      }

      case 'impact': {
        const table = await getRobustAsset(primaryQuery);
        const lineage = await getLineage(table.entityType || 'table', table.fullyQualifiedName);
        data = { lineage, impacts: getDownstreamNodes(lineage) };
        break;
      }

      case 'schema': {
        const table = await getRobustAsset(primaryQuery);
        const tests = table.entityType === 'table' ? await getTestCases(table.fullyQualifiedName) : [];
        mergePII(piiCheck(table));
        data = { table };
        break;
      }

      case 'quality': {
        const table = await getRobustAsset(primaryQuery);
        const tests = table.entityType === 'table' ? await getTestCases(table.fullyQualifiedName) : [];
        mergePII(piiCheck(table));
        data = { table, tests, health: computeHealthScore(table, tests) };
        break;
      }

      case 'compare': {
        const [t1, t2] = await Promise.all([
          getRobustAsset(primaryQuery),
          getRobustAsset(secondaryQuery ?? ''),
        ]);
        const [tests1, tests2] = await Promise.all([
          getTestCases(t1.fullyQualifiedName).catch(() => [] as Awaited<ReturnType<typeof getTestCases>>),
          getTestCases(t2.fullyQualifiedName).catch(() => [] as Awaited<ReturnType<typeof getTestCases>>),
        ]);
        mergePII(piiCheck(t1));
        mergePII(piiCheck(t2));
        data = {
          table1: t1, table2: t2,
          health1: computeHealthScore(t1, tests1),
          health2: computeHealthScore(t2, tests2),
        };
        break;
      }

      default:
        data = null;
    }

    return NextResponse.json({
      intent,
      aiResponse,
      data,
      hasPII,
      piiDetails,
      assetsDiscovered: extractDiscovered(data, intent),
    });

  } catch (error: unknown) {
    console.error('[Chat API Error]:', error);
    const message = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json({ error: message });
  }
}