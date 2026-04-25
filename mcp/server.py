import json
import os
from typing import Optional

import httpx
from dotenv import load_dotenv
from mcp.server.fastmcp import FastMCP

load_dotenv()

# ── Config ─────────────────────────────────────────────────────────────────────

BASE_URL = os.getenv("OPENMETADATA_BASE_URL", "https://sandbox.open-metadata.org").rstrip("/")
EMAIL    = os.getenv("OPENMETADATA_EMAIL", "admin@open-metadata.org")
PASSWORD = os.getenv("OPENMETADATA_PASSWORD", "Admin@1234!")

# ── Auth ───────────────────────────────────────────────────────────────────────

_token: Optional[str] = None

def get_token() -> str:
    global _token
    if _token:
        return _token
    _token = _fetch_token()
    return _token

def _fetch_token() -> str:
    resp = httpx.post(
        f"{BASE_URL}/api/v1/users/login",
        json={"email": EMAIL, "password": PASSWORD},
        timeout=15,
    )
    resp.raise_for_status()
    return resp.json()["accessToken"]

def _refresh_token() -> str:
    global _token
    _token = None
    return get_token()

def api_get(path: str, params: dict = {}) -> dict:
    """Make an authenticated GET request. Auto-refreshes token on 401."""
    headers = {"Authorization": f"Bearer {get_token()}"}
    resp = httpx.get(f"{BASE_URL}/api/v1{path}", headers=headers, params=params, timeout=20)

    if resp.status_code == 401:
        headers["Authorization"] = f"Bearer {_refresh_token()}"
        resp = httpx.get(f"{BASE_URL}/api/v1{path}", headers=headers, params=params, timeout=20)

    resp.raise_for_status()
    return resp.json()

# ── MCP Server ─────────────────────────────────────────────────────────────────

mcp = FastMCP(
    name="MetaFlux",
    instructions=(
        "You are MetaFlux, an intelligent data catalog assistant powered by OpenMetadata. "
        "Help users discover data assets, understand lineage, monitor data quality, "
        "identify PII data, and analyze the impact of potential changes. "
        "Always use search_assets first when you need to find a table's fully qualified name (FQN). "
        "Be concise but thorough in your responses."
    ),
)

# ── Tool 1: Search ─────────────────────────────────────────────────────────────

@mcp.tool()
def search_assets(query: str, size: int = 10) -> str:
    """
    Search for data assets in the OpenMetadata catalog.

    Args:
        query: Search keywords e.g. 'customer', 'orders', 'revenue pipeline'
        size:  Number of results to return (default 10, max 25)
    """
    try:
        data = api_get("/search/query", {
            "q":     query,
            "index": "dataAsset_search_index",
            "from":  0,
            "size":  min(size, 25),
        })

        hits = data.get("hits", {}).get("hits", [])
        if not hits:
            return f"No assets found for '{query}'. Try broader terms."

        results = []
        for hit in hits:
            s = hit.get("_source", {})
            results.append({
                "name":               s.get("name"),
                "fullyQualifiedName": s.get("fullyQualifiedName"),
                "type":               s.get("entityType", "unknown"),
                "description":        (s.get("description") or "No description")[:150],
                "owners":             [o.get("displayName", o.get("name", "")) for o in (s.get("owners") or [])],
                "tags":               [t.get("tagFQN") for t in (s.get("tags") or [])],
            })

        return json.dumps(results, indent=2)

    except Exception as e:
        return f"Search failed: {str(e)}"

# ── Tool 2: Table Details ──────────────────────────────────────────────────────

@mcp.tool()
def get_table_details(fqn: str) -> str:
    """
    Get full schema and metadata for a table including columns, tags, owners, and test suite.

    Args:
        fqn: Fully qualified name e.g. 'sample_data.ecommerce_db.shopify.orders'
             Use search_assets first if you don't know the exact FQN.
    """
    try:
        table = api_get(f"/tables/name/{fqn}", {
            "fields": "columns,tags,owners,testSuite,tableConstraints,usageSummary"
        })

        columns = [
            {
                "name":        col.get("name"),
                "type":        col.get("dataType"),
                "description": (col.get("description") or "")[:100],
                "tags":        [t.get("tagFQN") for t in (col.get("tags") or [])],
                "nullable":    col.get("constraint") != "NOT_NULL",
            }
            for col in table.get("columns", [])
        ]

        return json.dumps({
            "name":               table.get("name"),
            "fullyQualifiedName": table.get("fullyQualifiedName"),
            "description":        table.get("description") or "No description",
            "tableType":          table.get("tableType"),
            "owners":             [o.get("displayName", o.get("name", "")) for o in (table.get("owners") or [])],
            "tags":               [t.get("tagFQN") for t in (table.get("tags") or [])],
            "columnCount":        len(columns),
            "columns":            columns,
            "weeklyUsage":        table.get("usageSummary", {}).get("weeklyStats", {}).get("count", 0),
        }, indent=2)

    except Exception as e:
        return f"Could not retrieve table '{fqn}': {str(e)}"

# ── Tool 3: Lineage ────────────────────────────────────────────────────────────

@mcp.tool()
def get_lineage(fqn: str, depth: int = 2) -> str:
    """
    Get upstream and downstream data lineage for a table.

    Args:
        fqn:   Fully qualified name of the table
        depth: How many levels to traverse in each direction (default 2, max 5)
    """
    try:
        depth = min(depth, 5)
        data  = api_get(f"/lineage/table/name/{fqn}", {
            "upstreamDepth":   depth,
            "downstreamDepth": depth,
        })

        entity    = data.get("entity", {})
        nodes     = data.get("nodes", [])
        node_map  = {n.get("id"): n.get("fullyQualifiedName", n.get("name")) for n in nodes}
        node_map[entity.get("id")] = entity.get("fullyQualifiedName", fqn)

        upstream   = list({node_map.get(e.get("fromEntity"), e.get("fromEntity"))
                           for e in data.get("upstreamEdges", [])})
        downstream = list({node_map.get(e.get("toEntity"), e.get("toEntity"))
                           for e in data.get("downstreamEdges", [])})

        return json.dumps({
            "entity":               fqn,
            "upstream_sources":     upstream   or ["No upstream sources"],
            "downstream_consumers": downstream or ["No downstream consumers"],
            "summary": (
                f"'{fqn}' receives data from {len(upstream)} source(s) "
                f"and feeds {len(downstream)} downstream consumer(s)."
            ),
        }, indent=2)

    except Exception as e:
        return f"Could not retrieve lineage for '{fqn}': {str(e)}"

# ── Tool 4: Data Quality ───────────────────────────────────────────────────────

@mcp.tool()
def get_data_quality(table_fqn: str) -> str:
    """
    Get data quality test results and health status for a table.

    Args:
        table_fqn: Fully qualified name of the table to check
    """
    try:
        entity_link = f"<#E::table::{table_fqn}>"
        data        = api_get("/dataQuality/testCases", {
            "entityLink": entity_link,
            "limit":      50,
            "fields":     "testDefinition,testCaseResult",
        })

        tests = data.get("data", [])
        if not tests:
            return f"No data quality tests configured for '{table_fqn}'."

        passed  = []
        failed  = []
        aborted = []

        for t in tests:
            result = t.get("testCaseResult", {})
            status = result.get("testCaseStatus", "Unknown")
            entry  = {
                "name":   t.get("name"),
                "status": status,
                "result": result.get("result") or "",
            }
            if status == "Success":
                passed.append(entry)
            elif status == "Failed":
                failed.append(entry)
            else:
                aborted.append(entry)

        total     = len(tests)
        pass_rate = round(len(passed) / total * 100, 1) if total > 0 else 0

        return json.dumps({
            "table":        table_fqn,
            "health":       "Healthy" if not failed else "Issues Detected",
            "passRate":     f"{pass_rate}%",
            "total":        total,
            "passed":       len(passed),
            "failed":       len(failed),
            "failingTests": failed,
            "passingTests": [t["name"] for t in passed],
        }, indent=2)

    except Exception as e:
        return f"Could not retrieve data quality for '{table_fqn}': {str(e)}"

# ── Tool 5: PII Detection ──────────────────────────────────────────────────────

@mcp.tool()
def detect_pii_assets(limit: int = 20) -> str:
    """
    Find all data assets tagged with PII or Sensitive classifications.
    Useful for compliance audits and data governance reviews.

    Args:
        limit: Maximum number of PII assets to return (default 20)
    """
    try:
        results = []

        for tag in ["PII", "Sensitive", "Personal"]:
            data = api_get("/search/query", {
                "q":     tag,
                "index": "dataAsset_search_index",
                "from":  0,
                "size":  min(limit, 50),
            })

            hits = data.get("hits", {}).get("hits", [])
            for hit in hits:
                s    = hit.get("_source", {})
                tags = [t.get("tagFQN", "") for t in (s.get("tags") or [])]

                pii_tags = [t for t in tags if any(
                    keyword in t for keyword in ["PII", "Sensitive", "Personal", "Confidential"]
                )]

                if pii_tags:
                    asset = {
                        "name":               s.get("name"),
                        "fullyQualifiedName": s.get("fullyQualifiedName"),
                        "type":               s.get("entityType", "unknown"),
                        "piiTags":            pii_tags,
                        "owners":             [o.get("displayName", o.get("name", "")) for o in (s.get("owners") or [])],
                        "description":        (s.get("description") or "")[:100],
                    }
                    if not any(r["fullyQualifiedName"] == asset["fullyQualifiedName"] for r in results):
                        results.append(asset)

        if not results:
            return "No PII or Sensitive assets found in the catalog."

        return json.dumps({
            "totalFound": len(results),
            "warning":    "These assets contain sensitive data. Ensure proper access controls are in place.",
            "piiAssets":  results[:limit],
        }, indent=2)

    except Exception as e:
        return f"PII detection failed: {str(e)}"

# ── Tool 6: Impact Analysis ────────────────────────────────────────────────────

@mcp.tool()
def get_impact_analysis(fqn: str) -> str:
    """
    Analyze the downstream impact if a table changes or goes offline.
    Returns all affected assets sorted by how close they are to the source.

    Args:
        fqn: Fully qualified name of the table to analyze
    """
    try:
        data   = api_get(f"/lineage/table/name/{fqn}", {"downstreamDepth": 5})
        nodes  = data.get("nodes", [])
        entity = data.get("entity", {})

        node_map = {n.get("id"): n for n in nodes}
        node_map[entity.get("id")] = entity

        edges     = data.get("downstreamEdges", [])
        adjacency: dict[str, list[str]] = {}
        for edge in edges:
            src = edge.get("fromEntity")
            dst = edge.get("toEntity")
            if src not in adjacency:
                adjacency[src] = []
            adjacency[src].append(dst)

        from collections import deque
        visited = {}
        queue   = deque([(entity.get("id"), 0)])

        while queue:
            node_id, depth = queue.popleft()
            if node_id in visited:
                continue
            visited[node_id] = depth
            for neighbor in adjacency.get(node_id, []):
                if neighbor not in visited:
                    queue.append((neighbor, depth + 1))

        impacted = []
        for node_id, depth in sorted(visited.items(), key=lambda x: x[1]):
            if node_id == entity.get("id") or depth == 0:
                continue
            node = node_map.get(node_id, {})
            impacted.append({
                "depth":              depth,
                "name":               node.get("name") or node.get("fullyQualifiedName", node_id),
                "fullyQualifiedName": node.get("fullyQualifiedName", ""),
                "type":               node.get("entityType", "unknown"),
            })

        if not impacted:
            return json.dumps({
                "entity":   fqn,
                "impact":   "No downstream consumers. Safe to modify.",
                "affected": [],
            }, indent=2)

        return json.dumps({
            "entity":         fqn,
            "warning":        f"Modifying this table affects {len(impacted)} downstream asset(s).",
            "totalAffected":  len(impacted),
            "affectedAssets": impacted,
            "recommendation": (
                "Review all depth-1 consumers first as they are directly impacted. "
                "Coordinate with asset owners before making schema changes."
            ),
        }, indent=2)

    except Exception as e:
        return f"Impact analysis failed for '{fqn}': {str(e)}"

# ── Entry Point ────────────────────────────────────────────────────────────────

if __name__ == "__main__":
    mcp.run(transport="stdio")
