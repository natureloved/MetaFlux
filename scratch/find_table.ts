
import { searchAssets } from './lib/openmetadata.ts';

async function test() {
  try {
    const results = await searchAssets('table_test_mention_63639594');
    console.log(JSON.stringify(results, null, 2));
  } catch (err) {
    console.error(err);
  }
}
test();
