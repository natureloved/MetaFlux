import json
from client import OpenMetadataClient


def get_glossary_terms(om: OpenMetadataClient, limit: int = 20) -> str:
    """
    Browse the business glossary — defined terms, definitions, and ownership.

    Args:
        limit: Maximum number of terms to return (default 20)
    """
    try:
        response = om.get_glossary_terms(limit=limit)
        terms = response.get("data", [])

        if not terms:
            return "No glossary terms found."

        output = []
        for term in terms:
            output.append({
                "term": term.get("displayName") or term.get("name"),
                "fullyQualifiedName": term.get("fullyQualifiedName"),
                "description": (term.get("description") or "No definition provided")[:200],
                "owners": [o.get("displayName", o.get("name", "")) for o in (term.get("owners") or [])],
                "relatedTerms": [
                    t.get("displayName", t.get("name", ""))
                    for t in (term.get("relatedTerms") or [])
                ],
            })

        return json.dumps(output, indent=2)
    except Exception as e:
        return f"Could not retrieve glossary terms: {str(e)}"


def list_classification_tags(om: OpenMetadataClient) -> str:
    """
    List all available classification tags and categories in OpenMetadata.
    Useful for understanding what governance labels exist.
    """
    try:
        response = om.get_tags()
        classifications = response.get("data", [])

        output = [
            {
                "classification": c.get("displayName") or c.get("name"),
                "description": (c.get("description") or "")[:150],
                "termCount": c.get("termCount", 0),
            }
            for c in classifications
        ]

        return json.dumps(output, indent=2)
    except Exception as e:
        return f"Could not retrieve tags: {str(e)}"
