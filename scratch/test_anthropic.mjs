
const API_KEY = process.env.ANTHROPIC_API_KEY;

async function testAnthropic() {
  console.log('Testing Anthropic API...');
  if (!API_KEY) {
    console.error('ANTHROPIC_API_KEY is not set');
    return;
  }

  try {
    const res = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'x-api-key': API_KEY,
        'anthropic-version': '2023-06-01',
        'content-type': 'application/json',
      },
      body: JSON.stringify({
        model: 'claude-3-5-sonnet-20241022',
        max_tokens: 10,
        messages: [{ role: 'user', content: 'Hello' }],
      }),
    });

    if (res.ok) {
      const data = await res.json();
      console.log('Successfully reached Anthropic:', data.content[0].text);
    } else {
      console.error('Failed to reach Anthropic:', res.status, res.statusText);
      const text = await res.text();
      console.error('Response body:', text);
    }
  } catch (error) {
    console.error('Error during fetch:', error);
  }
}

testAnthropic();
