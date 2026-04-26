
const BASE_URL = process.env.OPENMETADATA_BASE_URL || 'https://sandbox.open-metadata.org/api/v1';
const TOKEN = process.env.OPENMETADATA_TOKEN;

async function testSearchAndGet() {
  try {
    console.log('Searching for "raw"...');
    const searchRes = await fetch(`${BASE_URL}/search/query?q=raw&index=dataAsset_search_index&size=1`, {
      headers: { Authorization: `Bearer ${TOKEN}` }
    });
    const searchData = await searchRes.json();
    const hits = searchData.hits?.hits;
    if (!hits || hits.length === 0) {
      console.log('No hits found.');
      return;
    }

    const fqn = hits[0]._source.fullyQualifiedName;
    console.log(`Found asset: ${fqn}. Fetching details...`);

    const tableRes = await fetch(`${BASE_URL}/tables/name/${encodeURIComponent(fqn)}?fields=columns`, {
      headers: { Authorization: `Bearer ${TOKEN}` }
    });
    
    if (tableRes.ok) {
      console.log('Successfully fetched table details.');
    } else {
      console.error('Failed to fetch table details:', tableRes.status, await tableRes.text());
    }
  } catch (error) {
    console.error('Error:', error);
  }
}

testSearchAndGet();
