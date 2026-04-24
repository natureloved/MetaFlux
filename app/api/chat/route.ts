import { NextRequest, NextResponse } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';
import { searchAssets, getTable, getLineage, getTestCases, getDownstreamImpact } from '../../../lib/openmetadata';
import { computeHealthScore } from '../../../lib/scoring';

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY || '',
});

/**
 * Helper to strip markdown and parse JSON from AI response
 */
function parseAIResponse(text: string) {
  try {
    // Try to find JSON block
    const jsonMatch = text.match(/```json\n([\s\S]*?)\n```/) || text.match(/```([\s\S]*?)```/);
    const cleanText = jsonMatch ? jsonMatch[1] : text;
    return JSON.parse(cleanText.trim());
  } catch (e) {
    console.error('Failed to parse AI response as JSON:', text);
    throw new Error('AI returned invalid JSON format');
  }
}

export async function POST(req: NextRequest) {
  try {
    const { message, sessionContext } = await req.json();

    const systemPrompt = `You are MetaFlux, an intelligent data catalog assistant. You help users discover, understand, and reason about data assets.

Current session context (assets discussed so far): ${JSON.stringify(sessionContext)}

Classify the user's intent and respond ONLY with JSON:
{
  "intent": "search" | "lineage" | "impact" | "explain_schema" | "quality" | "compare" | "general",
  "query": "string",           // search term or asset FQN extracted from message
  "secondaryQuery": "string",  // optional: for 'compare' intent
  "response": "string"         // your natural language reply (1-2 sentences)
}

For 'general' intents with no data needed, response is your full answer.
For all others, response is a short intro (e.g. 'Here is the lineage for orders_fact:').
Always resolve pronouns like 'that table' or 'it' using the session context.`;

    const response = await anthropic.messages.create({
      model: 'claude-opus-4-6',
      max_tokens: 1000,
      system: systemPrompt,
      messages: [{ role: 'user', content: message }],
    });

    const content = response.content[0];
    if (content.type !== 'text') {
      throw new Error('AI did not return a text response');
    }
    const aiResult = parseAIResponse(content.text);
    const { intent, query, secondaryQuery, response: aiResponse } = aiResult;

    let data: any = null;
    let hasPII = false;
    let piiDetails: string[] = [];

    switch (intent) {
      case 'search':
        data = await searchAssets(query);
        // Add health scores to search results
        if (data.hits?.hits) {
          data.hits.hits = await Promise.all(data.hits.hits.map(async (hit: any) => {
            const source = hit._source;
            if (hit._index === 'table_search_index') {
              const table = await getTable(source.fullyQualifiedName);
              const tests = await getTestCases(source.fullyQualifiedName);
              return { ...hit, healthScore: computeHealthScore(table, tests) };
            }
            return hit;
          }));
        }
        break;

      case 'lineage':
        data = await getLineage('table', query);
        break;

      case 'impact':
        data = await getDownstreamImpact(query);
        break;

      case 'explain_schema':
      case 'quality':
        const table = await getTable(query);
        const tests = await getTestCases(query);
        const health = computeHealthScore(table, tests);
        
        // Check for PII
        const piiTags = ['PII', 'Sensitive', 'Personal'];
        table.columns.forEach(col => {
          if (col.tags?.some(tag => piiTags.some(p => tag.tagFQN.includes(p)))) {
            hasPII = true;
            piiDetails.push(col.name);
          }
        });

        data = { table, tests, health };
        break;

      case 'compare':
        const t1 = await getTable(query);
        const t2 = await getTable(secondaryQuery);
        data = { table1: t1, table2: t2 };
        break;
        
      default:
        data = null;
    }

    return NextResponse.json({
      intent,
      aiResponse,
      data,
      hasPII,
      piiDetails,
    });

  } catch (error: any) {
    console.error('Chat API Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
