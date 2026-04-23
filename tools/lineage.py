import json
from client import OpenMetadataClient


def get_data_lineage(
    om: OpenMetadataClient,
    entity_fqn: str,
    entity_type: str = "table",
    upstream_depth: int = 2,
    downstream_depth: int = 2,
) -> str:
    """
    Get the data lineage for an entity — what feeds into it and what it feeds into.

    Args:
        entity_fqn: Fully qualified name of the entity
        entity_type: Type of entity — 'table', 'dashboard', 'pipeline'
        upstream_depth: How many levels upstream to traverse (default 2)
        downstream_depth: How many levels downstream to traverse (default 2)
    """
    try:
        lineage = om.get_lineage(entity_type, entity_fqn, upstream_depth, downstream_depth)

        nodes = lineage.get("nodes", [])
        edges = lineage.get("upstreamEdges", []) + lineage.get("downstreamEdges", [])

        # Build a readable map of node id → name
        node_map = {
            n.get("id"): n.get("fullyQualifiedName", n.get("name", n.get("id")))
            for n in nodes
        }
        # Include the entity itself
        entity = lineage.get("entity", {})
        node_map[entity.get("id")] = entity.get("fullyQualifiedName", entity.get("name", ""))

        upstream = []
        downstream = []

        for edge in lineage.get("upstreamEdges", []):
            from_name = node_map.get(edge.get("fromEntity"), edge.get("fromEntity"))
            upstream.append(from_name)

        for edge in lineage.get("downstreamEdges", []):
            to_name = node_map.get(edge.get("toEntity"), edge.get("toEntity"))
            downstream.append(to_name)

        result = {
            "entity": entity_fqn,
            "upstream_sources": list(set(upstream)) or ["No upstream dependencies found"],
            "downstream_consumers": list(set(downstream)) or ["No downstream consumers found"],
            "total_nodes_in_graph": len(nodes),
            "summary": (
                f"'{entity_fqn}' receives data from {len(upstream)} source(s) "
                f"and feeds data into {len(downstream)} consumer(s)."
            ),
        }

        return json.dumps(result, indent=2)
    except Exception as e:
        return f"Could not retrieve lineage: {str(e)}"
