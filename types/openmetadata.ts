export interface TableEntity {
  id: string;
  name: string;
  fullyQualifiedName: string;
  description?: string;
  columns: Column[];
  owners?: Owner[];
  tags?: Tag[];
  followers?: any[];
  usageSummary?: {
    weeklyStats: {
      count: number;
      percentile: number;
    };
  };
  updatedAt?: number;
}

export interface Column {
  name: string;
  dataType: string;
  description?: string;
  tags?: Tag[];
}

export interface Owner {
  id: string;
  type: string;
  name: string;
  displayName?: string;
  email?: string;
}

export interface Tag {
  tagFQN: string;
  labelType: string;
  state: string;
}

export interface LineageResponse {
  entity: any;
  nodes: LineageNode[];
  upstreamEdges: LineageEdge[];
  downstreamEdges: LineageEdge[];
}

export interface LineageNode {
  id: string;
  type: string;
  name: string;
  fullyQualifiedName: string;
  description?: string;
}

export interface LineageEdge {
  fromEntity: string;
  toEntity: string;
}

export interface TestCase {
  id: string;
  name: string;
  description?: string;
  testCaseResult?: {
    timestamp: number;
    testCaseStatus: 'Success' | 'Failed' | 'Aborted';
    result: string;
  };
}

export interface HealthScore {
  total: number;
  breakdown: {
    description: number;
    quality: number;
    ownership: number;
    freshness: number;
  };
  grade: 'A' | 'B' | 'C' | 'D' | 'F';
  warnings: string[];
}
