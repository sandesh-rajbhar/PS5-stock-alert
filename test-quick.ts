import { scrapeBlinkit } from './src/lib/scrapers/blinkit';
import { scrapeZepto } from './src/lib/scrapers/zepto';

async function test() {
  const pincode = '400001'; // Mumbai
  console.log(`Testing Blinkit for ${pincode}...`);
  try {
    const blinkit = await scrapeBlinkit(pincode);
    console.log('Blinkit Result:', JSON.stringify(blinkit, null, 2));
  } catch (e) {
    console.error('Blinkit test failed:', e);
  }

  console.log(`\nTesting Zepto for ${pincode}...`);
  try {
    const zepto = await scrapeZepto(pincode);
    console.log('Zepto Result:', JSON.stringify(zepto, null, 2));
  } catch (e) {
    console.error('Zepto test failed:', e);
  }
}

test().catch(console.error);
