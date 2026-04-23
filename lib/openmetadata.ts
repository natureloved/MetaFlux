import axios from 'axios';
import { getToken } from './auth';
import { TableEntity, LineageResponse, TestCase } from '../types/openmetadata';

const BASE_URL = process.env.OPENMETADATA_BASE_URL;

async function getHeaders() {
  const token = await getToken();
  return {
    Authorization: `Bearer ${token}`,
    'Content-Type': 'application/json',
  };
}

export async function searchAssets(query: string, size = 10) {
  const headers = await getHeaders();
  const response = await axios.get(`${BASE_URL}/search/query`, {
    params: { q: query, index: 'dataAsset_search_index', from: 0, size },
    headers,
  });
  return response.data;
}

export async function getTable(fqn: string): Promise<TableEntity> {
  const headers = await getHeaders();
  const response = await axios.get(`${BASE_URL}/tables/name/${fqn}`, {
    params: { fields: 'columns,tags,owners,followers,usageSummary,testSuite' },
    headers,
  });
  return response.data;
}

export async function getLineage(entityType: string, fqn: string, upstreamDepth = 2, downstreamDepth = 2): Promise<LineageResponse> {
  const headers = await getHeaders();
  const response = await axios.get(`${BASE_URL}/lineage/${entityType}/name/${fqn}`, {
    params: { upstreamDepth, downstreamDepth },
    headers,
  });
  return response.data;
}

export async function getTestCases(tableFqn: string): Promise<TestCase[]> {
  const headers = await getHeaders();
  const entityLink = `<#E::table::${tableFqn}>`;
  const response = await axios.get(`${BASE_URL}/dataQuality/testCases`, {
    params: { entityLink, limit: 50 },
    headers,
  });
  return response.data.data;
}

export async function getDownstreamImpact(fqn: string) {
  const lineage = await getLineage('table', fqn, 0, 5); // Fetch downstream up to depth 5
  return lineage.nodes
    .filter(node => node.fullyQualifiedName !== fqn)
    .map(node => ({
      name: node.name,
      type: node.type,
      fqn: node.fullyQualifiedName,
      // We'd ideally calculate depth here by traversing edges, 
      // but for simplicity in this helper, we'll return the nodes
    }));
}
