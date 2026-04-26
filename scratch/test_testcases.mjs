
const BASE_URL = process.env.OPENMETADATA_BASE_URL || 'https://sandbox.open-metadata.org/api/v1';
const TOKEN = process.env.OPENMETADATA_TOKEN;

async function testTestCases() {
  try {
    const searchRes = await fetch(`${BASE_URL}/search/query?q=*&index=table_search_index&size=1`, {
      headers: { Authorization: `Bearer ${TOKEN}` }
    });
    const searchData = await searchRes.json();
    const fqn = searchData.hits?.hits?.[0]?._source?.fullyQualifiedName;
    if (!fqn) {
      console.log('No table found.');
      return;
    }
    console.log(`Testing test cases for: ${fqn}`);
    
    // Test the current format in code
    const entityLink = `<"<table.${fqn}>">`;
    const params = new URLSearchParams({
      entityLink: entityLink,
      limit: '5',
    });
    const res = await fetch(`${BASE_URL}/dataQuality/testCases?${params}`, {
      headers: { Authorization: `Bearer ${TOKEN}` }
    });
    
    if (res.ok) {
      const data = await res.json();
      console.log(`✅ Success with format ${entityLink}. Found ${data.data?.length} test cases.`);
    } else {
      console.log(`❌ Failed with format ${entityLink}: ${res.status} ${await res.text()}`);
      
      // Try alternative format
      const altLink = `<#E::table::${fqn}>`;
      const altParams = new URLSearchParams({ entityLink: altLink });
      const altRes = await fetch(`${BASE_URL}/dataQuality/testCases?${altParams}`, {
        headers: { Authorization: `Bearer ${TOKEN}` }
      });
      if (altRes.ok) {
        console.log(`✅ Success with alternative format ${altLink}.`);
      } else {
        console.log(`❌ Failed with alternative format ${altLink}: ${altRes.status}`);
      }
    }
  } catch (error) {
    console.log('Error:', error.message);
  }
}
testTestCases();
