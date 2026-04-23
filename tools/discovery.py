import json
from client import OpenMetadataClient


def search_data_assets(om: OpenMetadataClient, query: str, entity_type: str = "table", limit: int = 10) -> str:
    """
    Search for data assets in OpenMetadata by keyword.

    Args:
        query: Search keywords e.g. 'customer', 'sales orders', 'revenue'
        entity_type: One of: table, dashboard, pipeline, topic, mlmodel, glossary_term
        limit: Max results to return (default 10, max 25)
    """
    try:
        results = om.search(query, entity_type=entity_type, size=min(limit, 25))
        hits = results.get("hits", {}).get("hits", [])

        if not hits:
            return f"No {entity_type}s found matching '{query}'. Try broader search terms."

        output = []
        for hit in hits:
            s = hit.get("_source", {})
            output.append({
                "name": s.get("name", "Unknown"),
                "fullyQualifiedName": s.get("fullyQualifiedName", ""),
                "description": (s.get("description") or "No description provided")[:200],
                "owners": [o.get("displayName", o.get("name", "")) for o in (s.get("owners") or [])],
                "tags": [t.get("tagFQN", "") for t in (s.get("tags") or [])],
                "tier": next(
                    (t.get("tagFQN") for t in (s.get("tags") or []) if "Tier" in t.get("tagFQN", "")),
                    "Untiered"
                ),
            })

        return json.dumps(output, indent=2)
    except Exception as e:
        return f"Search failed: {str(e)}"


def get_table_details(om: OpenMetadataClient, table_fqn: str) -> str:
    """
    Get detailed information about a specific table.

    Args:
        table_fqn: Fully qualified name e.g. 'sample_data.ecommerce_db.shopify.orders'
                   (use search_data_assets first to find the exact FQN)
    """
    try:
        table = om.get_table(table_fqn)

        columns = []
        for col in table.get("columns", []):
            columns.append({
                "name": col.get("name"),
                "type": col.get("dataType"),
                "description": (col.get("description") or "")[:100],
                "tags": [t.get("tagFQN") for t in (col.get("tags") or [])],
            })

        result = {
            "name": table.get("name"),
            "fullyQualifiedName": table.get("fullyQualifiedName"),
            "description": table.get("description") or "No description",
            "owners": [o.get("displayName", o.get("name", "")) for o in (table.get("owners") or [])],
            "tags": [t.get("tagFQN") for t in (table.get("tags") or [])],
            "tableType": table.get("tableType"),
            "columns": columns,
            "columnCount": len(columns),
            "usageSummary": table.get("usageSummary", {}).get("weeklyStats", {}),
        }

        return json.dumps(result, indent=2)
    except Exception as e:
        return f"Could not retrieve table details: {str(e)}"
