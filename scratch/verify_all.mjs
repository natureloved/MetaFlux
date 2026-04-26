
const BASE_URL = process.env.OPENMETADATA_BASE_URL || 'https://sandbox.open-metadata.org/api/v1';
const TOKEN = process.env.OPENMETADATA_TOKEN;

async function testAllIndex() {
  console.log('Testing index "all"...');
  try {
    const res = await fetch(`${BASE_URL}/search/query?q=*&index=all&size=5`, {
      headers: { Authorization: `Bearer ${TOKEN}` }
    });
    const data = await res.json();
    console.log('Hits:', data.hits?.hits?.length);
    if (data.hits?.hits?.length > 0) {
      console.log('First hit type:', data.hits.hits[0]._source.entityType);
    }
  } catch (error) {
    console.log('Error:', error.message);
  }
}
testAllIndex();
