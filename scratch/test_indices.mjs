
const BASE_URL = process.env.OPENMETADATA_BASE_URL || 'https://sandbox.open-metadata.org/api/v1';
const TOKEN = process.env.OPENMETADATA_TOKEN;

async function testIndex(indexName) {
  console.log(`Testing index: ${indexName}`);
  try {
    const res = await fetch(`${BASE_URL}/search/query?q=*&index=${indexName}&size=1`, {
      headers: { Authorization: `Bearer ${TOKEN}` }
    });
    if (res.ok) {
      console.log(`✅ Index ${indexName} exists.`);
      return true;
    } else {
      console.log(`❌ Index ${indexName} failed: ${res.status} ${await res.text()}`);
      return false;
    }
  } catch (error) {
    console.log(`❌ Error: ${error.message}`);
    return false;
  }
}

async function run() {
  const indices = [
    'dataAsset_search_index',
    'table_search_index',
    'dashboard_search_index',
    'pipeline_search_index',
    'topic_search_index',
    'all'
  ];
  for (const idx of indices) {
    await testIndex(idx);
  }
}
run();
