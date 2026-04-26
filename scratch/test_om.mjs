

const BASE_URL = process.env.OPENMETADATA_BASE_URL || 'https://sandbox.open-metadata.org/api/v1';

const TOKEN = process.env.OPENMETADATA_TOKEN;

async function testConnection() {
  console.log('Testing connection to:', BASE_URL);
  if (!TOKEN) {
    console.error('OPENMETADATA_TOKEN is not set');
    return;
  }

  try {
    const res = await fetch(`${BASE_URL}/system/version`, {
      headers: {
        Authorization: `Bearer ${TOKEN}`,
        'Content-Type': 'application/json',
      },
    });

    if (res.ok) {
      const data = await res.json();
      console.log('Successfully reached OpenMetadata:', data);
    } else {
      console.error('Failed to reach OpenMetadata:', res.status, res.statusText);
      const text = await res.text();
      console.error('Response body:', text);
    }
  } catch (error) {
    console.error('Error during fetch:', error);
  }
}

testConnection();
