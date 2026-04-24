import type { HealthScore } from '../lib/scoring';
export type { HealthScore };

/* ── Primitive building blocks ── */

export interface Tag {
  tagFQN: string;
  name?: string;
  description?: string;
  labelType?: string;
  state?: string;
  source?: string;
}

export interface Owner {
  id: string;
  type: 'user' | 'team' | string;
  name?: string;
  displayName?: string;
  email?: string;
  href?: string;
}

export interface Column {
  name: string;
  dataType: string;
  description?: string;
  fullyQualifiedName?: string;
  tags?: Tag[];
  ordinalPosition?: number;
  constraint?: 'NULL' | 'NOT_NULL' | 'UNIQUE' | 'PRIMARY_KEY';
  dataLength?: number;
  precision?: number;
  scale?: number;
}

export interface UsageSummary {
  dailyStats?:   { count: number; percentileRank?: number };
  weeklyStats?:  { count: number; percentileRank?: number };
  monthlyStats?: { count: number; percentileRank?: number };
  date?: string;
}

/* ── Search ── */

export interface SearchResult {
  id: string;
  name: string;
  fullyQualifiedName: string;
  description?: string;
  entityType: string;
  tags?: Tag[];
  owners?: Owner[];
  updatedAt?: number;
  testSuite?: {
    id: string;
    name?: string;
    fullyQualifiedName?: string;
  };
  /** Attached by the route layer, not from OpenMetadata directly */
  healthScore?: HealthScore;
}

/* ── Table ── */

export interface TableEntity {
  id: string;
  name: string;
  displayName?: string;
  fullyQualifiedName: string;
  description?: string;
  entityType?: string;
  tableType?: string;
  columns: Column[];
  tags?: Tag[];
  owners?: Owner[];
  usageSummary?: UsageSummary;
  updatedAt?: number;
  updatedBy?: string;
  followers?: { id: string; type: string }[];
  testSuite?: {
    id: string;
    name?: string;
    fullyQualifiedName?: string;
  };
  domain?: {
    id: string;
    name?: string;
    displayName?: string;
  };
}

/* ── Lineage ── */

export interface LineageNode {
  id: string;
  name: string;
  displayName?: string;
  fullyQualifiedName: string;
  description?: string;
  /** Raw API field (may be present instead of entityType) */
  type?: string;
  /** Normalised entity type */
  entityType?: string;
  tags?: Tag[];
}

export interface LineageEdge {
  fromEntity: {
    id: string;
    type: string;
    name?: string;
    fullyQualifiedName?: string;
  };
  toEntity: {
    id: string;
    type: string;
    name?: string;
    fullyQualifiedName?: string;
  };
  lineageDetails?: {
    columnsLineage?: Array<{
      fromColumns: string[];
      toColumn: string;
    }>;
  };
}

export interface LineageData {
  entity: {
    id: string;
    name: string;
    fullyQualifiedName: string;
    type?: string;
    entityType?: string;
  };
  nodes: LineageNode[];
  upstreamEdges: LineageEdge[];
  downstreamEdges: LineageEdge[];
}

/** @deprecated Renamed to LineageData */
export type LineageResponse = LineageData;

/* ── Quality ── */

export interface TestCaseResult {
  testCaseStatus: 'Success' | 'Failed' | 'Aborted' | 'Queued';
  timestamp: number;
  result?: string;
  sampleData?: string;
  testResultValue?: Array<{ name: string; value: string }>;
}

export interface TestCase {
  id: string;
  name: string;
  displayName?: string;
  description?: string;
  fullyQualifiedName?: string;
  entityLink?: string;
  testDefinition?: {
    id: string;
    name?: string;
    displayName?: string;
    description?: string;
  };
  testCaseResult?: TestCaseResult;
  parameterValues?: Array<{ name: string; value: string }>;
}

/* ── Impact analysis ── */

export interface ImpactNode {
  id: string;
  name: string;
  fqn: string;
  entityType: string;
  depth: number;
  displayName?: string;
}
