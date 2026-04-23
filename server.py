import os
from dotenv import load_dotenv
from fastmcp import FastMCP
from client import OpenMetadataClient
from tools.discovery import search_data_assets, get_table_details
from tools.lineage import get_data_lineage
from tools.quality import get_data_quality_status
from tools.governance import get_glossary_terms, list_classification_tags
from tools.updates import update_table_description, add_tag_to_table
from tools.users import get_user_info

load_dotenv()

# Initialize the OpenMetadata client
om = OpenMetadataClient(
    base_url=os.getenv("OPENMETADATA_URL", "https://sandbox.open-metadata.org"),
    token=os.getenv("OPENMETADATA_TOKEN", ""),
)

# Initialize the MCP server
mcp = FastMCP(
    name="OpenMetadata",
    instructions=(
        "You are a data catalog assistant powered by OpenMetadata. "
        "Help users discover data assets, understand data lineage, check data quality, "
        "and navigate data governance. When users ask about data, tables, pipelines, "
        "or dashboards, use the available tools to find accurate, up-to-date information. "
        "Always use search_data_assets first if you need to find an entity's full FQN."
    ),
)


# ── Discovery ──────────────────────────────────────────────────────────────────

@mcp.tool()
def search(query: str, entity_type: str = "table", limit: int = 10) -> str:
    """Search for data assets (tables, dashboards, pipelines, etc.) by keyword."""
    return search_data_assets(om, query, entity_type, limit)


@mcp.tool()
def describe_table(table_fqn: str) -> str:
    """Get full details of a table: schema, columns, owners, tags, and usage stats."""
    return get_table_details(om, table_fqn)


# ── Lineage ────────────────────────────────────────────────────────────────────

@mcp.tool()
def lineage(entity_fqn: str, entity_type: str = "table", upstream_depth: int = 2, downstream_depth: int = 2) -> str:
    """Trace data lineage — where data comes from and where it flows to."""
    return get_data_lineage(om, entity_fqn, entity_type, upstream_depth, downstream_depth)


# ── Data Quality ───────────────────────────────────────────────────────────────

@mcp.tool()
def data_quality(table_fqn: str) -> str:
    """Check data quality test results and health status for a table."""
    return get_data_quality_status(om, table_fqn)


# ── Governance ─────────────────────────────────────────────────────────────────

@mcp.tool()
def glossary() -> str:
    """Browse the business glossary — defined business terms and their meanings."""
    return get_glossary_terms(om)


@mcp.tool()
def tags() -> str:
    """List all available classification tags and governance categories."""
    return list_classification_tags(om)


# ── Updates & Documentation ──────────────────────────────────────────────────

@mcp.tool()
def update_description(table_fqn: str, description: str) -> str:
    """Update a table's description. Use this to document data assets based on their metadata."""
    return update_table_description(om, table_fqn, description)


@mcp.tool()
def add_tag(table_fqn: str, tag_fqn: str) -> str:
    """Add a classification or glossary tag to a table for governance."""
    return add_tag_to_table(om, table_fqn, tag_fqn)


# ── User Information ─────────────────────────────────────────────────────────

@mcp.tool()
def user_info(username: str) -> str:
    """Get contact details and roles for a data owner or user."""
    return get_user_info(om, username)


# ── Entry point ────────────────────────────────────────────────────────────────

if __name__ == "__main__":
    mcp.run()
