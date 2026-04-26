
const API_KEY = process.env.ANTHROPIC_API_KEY;

async function testSpecific() {
  const model = 'claude-sonnet-4-20250514';
  console.log(`Testing specific model from code: ${model}`);
  try {
    const res = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'x-api-key': API_KEY,
        'anthropic-version': '2023-06-01',
        'content-type': 'application/json',
      },
      body: JSON.stringify({
        model,
        max_tokens: 10,
        messages: [{ role: 'user', content: 'hi' }],
      }),
    });

    if (res.ok) {
      console.log(`✅ Success with ${model}`);
    } else {
      const json = await res.json();
      console.log(`❌ Failed with ${model}: ${json.error?.message}`);
    }
  } catch (error) {
    console.log(`❌ Error: ${error.message}`);
  }
}

testSpecific();
