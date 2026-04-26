
const API_KEY = process.env.ANTHROPIC_API_KEY;

const models = [
  'claude-3-5-sonnet-20240620',
  'claude-3-5-sonnet-latest',
  'claude-3-opus-20240229',
  'claude-3-sonnet-20240229',
  'claude-3-haiku-20240307',
  'claude-2.1',
  'claude-2.0'
];

async function testModels() {
  for (const model of models) {
    console.log(`Testing model: ${model}`);
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
        return;
      } else {
        const json = await res.json();
        console.log(`❌ Failed with ${model}: ${json.error?.message}`);
      }
    } catch (error) {
      console.log(`❌ Error with ${model}: ${error.message}`);
    }
  }
}

testModels();
