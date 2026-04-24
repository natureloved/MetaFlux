# MetaFlux

> Talk to your data catalog in plain English.

MetaFlux is an AI-powered data catalog interface built on [OpenMetadata](https://open-metadata.org). Ask questions in natural language and get instant answers — schema, lineage, quality, PII detection, and impact analysis — all rendered in a focused chat UI.

## Features

- **Intent-aware AI routing** — Claude classifies every message (search, lineage, schema, quality, impact, compare) and routes it to the right OpenMetadata API automatically, resolving pronouns across the conversation history.
- **Health Score Engine** — multi-dimensional scoring across description coverage, data quality tests, ownership, and freshness. Each asset shows a live grade (A–F) with a visual ring and breakdown tooltip.
- **PII Sentinel** — column-level PII tag detection with automatic banner alerts and owner lookup. Dismissable per message.
- **Interactive Lineage** — React Flow graph with custom nodes, upstream/downstream edges, and click-to-explore navigation.
- **Impact Radar** — downstream blast-radius analysis grouped by lineage depth, with per-tier risk counts.
- **Session context** — assets discussed in the conversation are tracked automatically and used to resolve follow-up questions.
- **Sandbox status** — live polling of the OpenMetadata sandbox with a real-time dot indicator in the sidebar.

## Tech stack

| Layer | Choice |
|---|---|
| Framework | Next.js 15 (App Router) |
| AI | Anthropic Claude (`claude-sonnet-4-20250514`) |
| Data catalog | OpenMetadata REST API |
| Visualization | React Flow v11 |
| Styling | CSS custom properties (no Tailwind) |
| Deployment | Vercel (Edge-compatible) |

## Setup

```bash
git clone https://github.com/natureloved/MetaFlux
cd MetaFlux
npm install
```

Create `.env.local`:

```env
OPENMETADATA_BASE_URL=https://sandbox.open-metadata.org/api/v1
ANTHROPIC_API_KEY=sk-ant-...
```

Start the dev server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Deploy to Vercel

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new)

Add the two environment variables above in the Vercel project settings. The included `vercel.json` sets a 30-second function timeout for the chat API route.

## Project structure

```
app/
  api/chat/route.ts     — intent classification + OpenMetadata data fetching
  page.tsx              — root page (mounts ChatInterface inside ErrorBoundary)
  opengraph-image.tsx   — OG image for social sharing

components/
  chat/
    ChatInterface.tsx   — two-panel layout, input bar, sidebar
    MessageBubble.tsx   — per-intent renderers (search, lineage, schema, quality, impact, compare)
    useChat.ts          — all chat state, session context, localStorage persistence
  cards/
    AssetCard.tsx       — horizontal asset card with health ring and tag pills
    HealthScoreRing.tsx — animated SVG gauge with breakdown tooltip
    PIIBanner.tsx       — dismissable PII warning banner
  lineage/
    LineageGraph.tsx    — React Flow lineage visualization
  impact/
    ImpactRadar.tsx     — tiered downstream impact list

lib/
  openmetadata.ts       — OpenMetadata API client (search, table, lineage, tests)
  scoring.ts            — health score computation
  auth.ts               — JWT token management with 55-min TTL cache
  useSandboxStatus.ts   — sandbox connectivity polling hook

types/
  openmetadata.ts       — shared TypeScript types
```

## How it works

1. User types a message.
2. `useChat` sends the message plus conversation history to `/api/chat`.
3. The API route calls Claude to classify the intent and extract query parameters.
4. Based on intent, the route fetches data from OpenMetadata (search, table details, lineage graph, test results).
5. PII columns are detected from OpenMetadata tags. Health scores are computed locally.
6. The response (`intent`, `aiResponse`, `data`, `hasPII`, `assetsDiscovered`) is rendered by `MessageBubble` using the appropriate intent renderer.
7. Discovered assets are added to the session context and persisted to `localStorage` for cross-session continuity.