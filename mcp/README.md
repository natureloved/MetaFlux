# 🌌 MetaFlux: OpenMetadata MCP Server

MetaFlux is a powerful **Model Context Protocol (MCP)** server that bridges AI assistants with the [OpenMetadata](https://open-metadata.org/) ecosystem. It allows AI agents to discover, document, and govern data assets directly through natural language.

## 🚀 Features

- **🔍 Smart Discovery**: Search for tables, dashboards, and pipelines across your entire data landscape.
- **🌿 Deep Lineage**: Trace data flow with upstream and downstream lineage visualization.
- **✅ Data Quality**: Monitor health status and test results for data assets.
- **🛡️ Active Governance**:
    - Browse business glossaries and classification tags.
    - **[New]** Apply governance tags (PII, Data Tiers) directly via AI.
- **📝 AI Documentation**:
    - **[New]** Update and improve data asset descriptions using AI reasoning.
- **👥 Team Insights**: Find and contact data owners and stewards.

## 🛠️ Setup

### Prerequisites
- Python 3.10+
- An OpenMetadata instance (or use the [Public Sandbox](https://sandbox.open-metadata.org))
- A valid OpenMetadata JWT Token

### Installation
1. Clone the repository:
   ```bash
   git clone https://github.com/natureloved/MetaFlux.git
   cd MetaFlux
   ```
2. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```
3. Configure environment variables:
   Create a `.env` file based on `.env.example`:
   ```env
   OPENMETADATA_URL=https://sandbox.open-metadata.org
   OPENMETADATA_TOKEN=your_jwt_token_here
   ```

## 🔌 Connecting to Claude Desktop

Add this to your `claude_desktop_config.json`:

```json
{
  "mcpServers": {
    "metaflux": {
      "command": "python",
      "args": ["/path/to/MetaFlux/server.py"],
      "env": {
        "OPENMETADATA_URL": "https://sandbox.open-metadata.org",
        "OPENMETADATA_TOKEN": "your_token_here"
      }
    }
  }
}
```

## 📖 How to Use

Once connected, you can use natural language to interact with your data catalog.

### Example Prompts
- **Discovery**: "Find all tables related to 'customer' and tell me who owns them."
- **Lineage**: "Show me the upstream sources for the `raw_customers` table."
- **Quality**: "Are there any failing data quality tests in the `ecommerce` schema?"
- **Governance**: "List all classification tags available in our catalog."
- **Updates**: "Write a markdown description for the `dim_customer` table based on its columns."

### Example Workflow: Owner Lookup
**User**: *"Who is the owner of the `customer_metrics` table and what is their email?"*

**Claude's Internal Logic**:
1.  Calls `describe_table(table_fqn="...")` to find the owner name.
2.  Calls `user_info(username="shailesh.parmar")` to fetch the email and team details.
3.  **Response**: *"The owner of `customer_metrics` is Shailesh Parmar (shailesh.parmar@example.com) from the Engineering team."*

## 🧪 Testing

Test the tools using the MCP Inspector:
```bash
npx @modelcontextprotocol/inspector python server.py
```

## 📝 License
Apache License 2.0
