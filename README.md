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

## 🧪 Testing

Test the tools using the MCP Inspector:
```bash
npx @modelcontextprotocol/inspector python server.py
```

## 📝 License
Apache License 2.0
