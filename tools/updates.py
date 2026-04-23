import json
from client import OpenMetadataClient


def update_table_description(om: OpenMetadataClient, table_fqn: str, description: str) -> str:
    """
    Update the description of a table. Useful for AI-assisted documentation.

    Args:
        table_fqn: Fully qualified name of the table
        description: The new markdown-formatted description
    """
    try:
        # 1. Get the table to find its ID
        table = om.get_table(table_fqn)
        table_id = table.get("id")

        # 2. Prepare JSON Patch
        patch = [
            {
                "op": "add" if not table.get("description") else "replace",
                "path": "/description",
                "value": description
            }
        ]

        # 3. Apply Patch
        result = om.patch_table(table_id, patch)
        return f"Successfully updated description for {table_fqn}."
    except Exception as e:
        return f"Failed to update description: {str(e)}"


def add_tag_to_table(om: OpenMetadataClient, table_fqn: str, tag_fqn: str) -> str:
    """
    Add a governance or classification tag to a table.

    Args:
        table_fqn: Fully qualified name of the table
        tag_fqn: Fully qualified name of the tag (e.g., 'PII.Sensitive', 'DataTier.Gold')
    """
    try:
        # 1. Get current table tags
        table = om.get_table(table_fqn)
        table_id = table.get("id")
        current_tags = table.get("tags", [])

        # Check if tag already exists
        if any(t.get("tagFQN") == tag_fqn for t in current_tags):
            return f"Tag '{tag_fqn}' is already present on {table_fqn}."

        # 2. Add new tag to the list
        new_tag = {"tagFQN": tag_fqn, "labelType": "Manual", "state": "Confirmed"}
        updated_tags = current_tags + [new_tag]

        # 3. Prepare and apply JSON Patch
        patch = [
            {
                "op": "add" if not current_tags else "replace",
                "path": "/tags",
                "value": updated_tags
            }
        ]

        om.patch_table(table_id, patch)
        return f"Successfully added tag '{tag_fqn}' to {table_fqn}."
    except Exception as e:
        return f"Failed to add tag: {str(e)}"
