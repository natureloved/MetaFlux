import type { TableEntity, TestCase } from '../types/openmetadata';

export interface HealthScore {
  total: number;
  grade: 'A' | 'B' | 'C' | 'D' | 'F';
  breakdown: {
    description: { score: number; max: 25; label: string };
    quality:     { score: number; max: 25; label: string };
    ownership:   { score: number; max: 25; label: string };
    freshness:   { score: number; max: 25; label: string };
  };
  warnings: string[];
  isPII: boolean;
  piiColumns: string[];
}

function scoreDescription(table: TableEntity): { score: number; label: string } {
  const hasTableDesc = !!table.description?.trim();
  const total = table.columns.length;
  const documented = table.columns.filter(c => !!c.description?.trim()).length;

  if (hasTableDesc && total > 0 && documented / total > 0.5) {
    return { score: 25, label: `${documented} of ${total} columns documented` };
  }
  if (hasTableDesc) {
    return { score: 12, label: `${documented} of ${total} columns documented` };
  }
  return { score: 0, label: `${documented} of ${total} columns documented` };
}

function scoreQuality(testCases: TestCase[]): { score: number; label: string } {
  if (testCases.length === 0) {
    return { score: 18, label: 'No tests defined' };
  }
  const passing = testCases.filter(t => t.testCaseResult?.testCaseStatus === 'Success').length;
  const ratio = passing / testCases.length;
  let score: number;
  if (ratio === 1)       score = 25;
  else if (ratio > 0.8)  score = 18;
  else if (ratio >= 0.5) score = 10;
  else                   score = 0;
  return { score, label: `${passing}/${testCases.length} tests passing` };
}

function scoreOwnership(table: TableEntity): { score: number; label: string } {
  const owner = table.owners?.[0];
  if (owner) {
    const name = owner.displayName || owner.name || 'Assigned';
    return { score: 25, label: name };
  }
  return { score: 0, label: 'Unassigned' };
}

function scoreFreshness(table: TableEntity): { score: number; label: string } {
  if (!table.updatedAt) return { score: 0, label: 'Unknown' };

  const daysAgo = Math.floor((Date.now() - table.updatedAt) / (1000 * 60 * 60 * 24));
  let score: number;
  if (daysAgo < 7)       score = 25;
  else if (daysAgo < 30) score = 20;
  else if (daysAgo < 90) score = 10;
  else                   score = 0;

  return { score, label: `Updated ${daysAgo} days ago` };
}

function toGrade(total: number): 'A' | 'B' | 'C' | 'D' | 'F' {
  if (total >= 90) return 'A';
  if (total >= 75) return 'B';
  if (total >= 55) return 'C';
  if (total >= 35) return 'D';
  return 'F';
}

function buildWarnings(
  table: TableEntity,
  testCases: TestCase[],
  freshness: { score: number },
): string[] {
  const warnings: string[] = [];

  if (!table.owners?.length) warnings.push('No owner assigned');

  const failing = testCases.filter(t => t.testCaseResult?.testCaseStatus === 'Failed').length;
  if (failing > 0) warnings.push(`${failing} quality tests failing`);

  if (freshness.score === 0 && table.updatedAt) warnings.push('Not updated in 90+ days');

  const total = table.columns.length;
  const documented = table.columns.filter(c => !!c.description?.trim()).length;
  if (total > 0 && documented / total < 0.5) warnings.push('Most columns lack descriptions');

  return warnings;
}

function detectPII(table: TableEntity): { isPII: boolean; piiColumns: string[] } {
  const piiColumns: string[] = [];
  for (const col of table.columns) {
    const hasPII = col.tags?.some(tag =>
      /pii|sensitive/i.test(tag.tagFQN),
    );
    if (hasPII) piiColumns.push(col.name);
  }
  return { isPII: piiColumns.length > 0, piiColumns };
}

export function computeHealthScore(table: TableEntity, testCases: TestCase[]): HealthScore {
  const desc      = scoreDescription(table);
  const quality   = scoreQuality(testCases);
  const ownership = scoreOwnership(table);
  const freshness = scoreFreshness(table);

  const total = Math.round(desc.score + quality.score + ownership.score + freshness.score);

  return {
    total,
    grade: toGrade(total),
    breakdown: {
      description: { score: desc.score,      max: 25, label: desc.label },
      quality:     { score: quality.score,   max: 25, label: quality.label },
      ownership:   { score: ownership.score, max: 25, label: ownership.label },
      freshness:   { score: freshness.score, max: 25, label: freshness.label },
    },
    warnings: buildWarnings(table, testCases, freshness),
    ...detectPII(table),
  };
}