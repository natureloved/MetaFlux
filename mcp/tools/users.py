import json
from client import OpenMetadataClient


def get_user_info(om: OpenMetadataClient, username: str) -> str:
    """
    Get information about a user or owner in OpenMetadata.
    Use this to find who to contact about a specific data asset.

    Args:
        username: The name or username of the person
    """
    try:
        user = om.get_user(username)

        result = {
            "name": user.get("name"),
            "displayName": user.get("displayName"),
            "email": user.get("email"),
            "teams": [t.get("name") for t in user.get("teams", [])],
            "roles": [r.get("name") for r in user.get("roles", [])],
            "owned_assets_count": len(user.get("owns", []))
        }

        return json.dumps(result, indent=2)
    except Exception as e:
        return f"Could not find user '{username}': {str(e)}"
