# 🌌 MetaFlux Upgraded

> Talk to your data catalog in plain English.

MetaFlux is a premium AI-powered data command center that bridges human conversation with complex data ecosystems. Powered by OpenMetadata and Claude 3.5 Sonnet.

## 🚀 What it does
- **Instant Discovery**: Find any data asset using natural language.
- **Visual Intelligence**: See lineage graphs and cascading impact radars instantly.
- **Automated Observability**: Real-time health scores and PII detection.

## 💎 Unique Features
1. **Health Score Engine**: Multi-dimensional analysis of documentation, quality, ownership, and freshness.
2. **PII Sentinel**: Automatic detection and alerting of sensitive data with owner lookup.
3. **Intent-Aware Routing**: Claude-powered engine that resolves context and pronouns across messages.
4. **Interactive Lineage**: Custom React Flow visualization for upstream/downstream navigation.
5. **Impact Radar**: Predictive analysis of downstream cascading effects.

## 🛠️ Tech Stack
- **Framework**: Next.js 14 (App Router)
- **AI**: Anthropic Claude 3.5 Sonnet
- **Styling**: Tailwind CSS + Framer Motion
- **Visualization**: React Flow
- **Data Source**: OpenMetadata REST APIs

## ⚙️ Setup
1. Clone the repository.
2. Install dependencies: `npm install`
3. Create `.env.local` with:
   ```env
   OPENMETADATA_BASE_URL=https://sandbox.open-metadata.org/api/v1
   ANTHROPIC_API_KEY=your_key_here
   ```
4. Run locally: `npm run dev`

## 🔗 How it uses OpenMetadata
- **Auth**: Automated JWT login via `/api/v1/users/login`.
- **Discovery**: Full-text search via `/api/v1/search/query`.
- **Entity Metadata**: Detailed schema and stats via `/api/v1/tables`.
- **Lineage**: Graph traversal via `/api/v1/lineage`.
- **Quality**: Test results via `/api/v1/dataQuality`.
