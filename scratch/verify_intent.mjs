
async function trigger() {
  try {
    const res = await fetch('http://localhost:3000/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        message: 'Tell me about table_always_own_e1ff399f',
        sessionContext: [],
        conversationHistory: []
      })
    });
    const data = await res.json();
    console.log('Intent:', data.intent);
    console.log('AI Response:', data.aiResponse);
    console.log('Error:', data.error);
  } catch (error) {
    console.error('Fetch error:', error);
  }
}
trigger();
