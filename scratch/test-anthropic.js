const Anthropic = require('@anthropic-ai/sdk');
require('dotenv').config({ path: '.env.local' });

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY || '',
});

async function test() {
  try {
    const response = await anthropic.messages.create({
      model: 'claude-3-5-sonnet-20241022',
      max_tokens: 10,
      messages: [{ role: 'user', content: 'hi' }],
    });
    console.log('Anthropic Success:', response.content[0].text);
  } catch (error) {
    console.error('Anthropic Error:', error.message);
  }
}

test();
