
async function trigger() {
  try {
    const res = await fetch('http://localhost:3000/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        message: 'search for customer data',
        sessionContext: [],
        conversationHistory: []
      })
    });
    const data = await res.json();
    console.log(JSON.stringify(data, null, 2));
  } catch (error) {
    console.error('Fetch error:', error);
  }
}
trigger();
