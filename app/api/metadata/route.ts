import { NextRequest, NextResponse } from 'next/server';
import { searchAssets, getTable, getLineage, getTestCases, getDownstreamNodes } from '../../../lib/openmetadata';
import { computeHealthScore } from '../../../lib/scoring';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const type = searchParams.get('type');

  try {
    if (type === 'assets') {
      const query = searchParams.get('q') || '*';
      const assets = await searchAssets(query, 20);
      
      // Enrich with health scores
      const enriched = await Promise.all(
        assets.map(async (asset) => {
          try {
            const table = await getTable(asset.fullyQualifiedName);
            const tests = await getTestCases(asset.fullyQualifiedName);
            return { ...asset, healthScore: computeHealthScore(table, tests) };
          } catch {
            return asset;
          }
        })
      );

      return NextResponse.json(enriched);
    }

    if (type === 'lineage') {
      const fqn = searchParams.get('fqn');
      if (!fqn) return NextResponse.json({ error: 'fqn is required' }, { status: 400 });

      const lineage = await getLineage('table', fqn);
      return NextResponse.json(lineage);
    }

    return NextResponse.json({ error: 'Invalid type' }, { status: 400 });
  } catch (error: any) {
    console.error('[Metadata API Error]:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
