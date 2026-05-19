import { supabaseAdmin } from '../src/lib/supabase';
import { scrapeAmazon } from '../src/lib/scrapers/amazon';
import { scrapeFlipkart } from '../src/lib/scrapers/flipkart';
import { scrapeCroma } from '../src/lib/scrapers/croma';
import { scrapeVijaySales } from '../src/lib/scrapers/vijaysales';
import { scrapeRelianceDigital } from '../src/lib/scrapers/reliancedigital';
import { sendStockAlert } from '../src/lib/notifier';
import { ScrapeResult } from '../src/lib/types';

const PLATFORMS: { name: string; fn: (pincode: string) => Promise<ScrapeResult> }[] = [
  { name: 'amazon', fn: scrapeAmazon },
  { name: 'flipkart', fn: scrapeFlipkart },
  { name: 'croma', fn: scrapeCroma },
  { name: 'vijaysales', fn: scrapeVijaySales },
  { name: 'reliancedigital', fn: scrapeRelianceDigital },
];

const NATIONAL_BASELINE_PINCODE = '110001';

async function processPincode(pincode: string) {
  const isBaseline = pincode === NATIONAL_BASELINE_PINCODE;
  console.log(`Checking pincode: ${pincode} ${isBaseline ? '(Baseline)' : ''}`);

  const results = await Promise.all(
    PLATFORMS.map(p =>
      p.fn(pincode).catch((e): ScrapeResult => {
        console.error(`Scraper ${p.name} crashed for ${pincode}:`, e);
        return { inStock: false, price: null, productUrl: '', productName: '', error: true };
      })
    )
  );

  await Promise.all(
    PLATFORMS.map(async (p, i) => {
      const result = results[i];
      if (result.error) return;

      console.log(`[${pincode}] - ${p.name}: ${result.inStock ? 'IN STOCK' : 'OOS'} (${result.price || 'N/A'})`);

      const { data: prevStatus } = await supabaseAdmin
        .from('quick_commerce_stock')
        .select('in_stock')
        .eq('platform', p.name)
        .eq('pincode', pincode)
        .maybeSingle();

      const becameInStock = result.inStock && (!prevStatus || !prevStatus.in_stock);

      const cacheUpsert = supabaseAdmin.from('quick_commerce_stock').upsert(
        {
          platform: p.name,
          pincode,
          in_stock: result.inStock,
          price: result.price,
          product_url: result.productUrl,
          delivery_time: result.deliveryTime,
          available_items: result.items,
          last_checked: new Date().toISOString(),
        },
        { onConflict: 'platform,pincode' }
      );

      const nationalUpsert = isBaseline
        ? supabaseAdmin.from('stock_status').upsert(
            {
              platform: p.name,
              product_name: result.productName,
              in_stock: result.inStock,
              price: result.price,
              product_url: result.productUrl,
              available_items: result.items,
              last_checked: new Date().toISOString(),
            },
            { onConflict: 'platform' }
          )
        : Promise.resolve();

      await Promise.all([cacheUpsert, nationalUpsert]);

      if (!becameInStock) return;

      console.log(`!!! Alert: ${p.name} became in stock for ${pincode} !!!`);

      const { data: event, error: eventError } = await supabaseAdmin
        .from('stock_events')
        .insert({
          platform: `${p.name} (${pincode})`,
          became_in_stock: true,
          price: result.price,
          product_url: result.productUrl,
        })
        .select()
        .single();

      if (eventError) {
        console.error(`Failed to create stock event for ${pincode}:`, eventError);
      }

      const { data: subscribers, error: subError } = await supabaseAdmin
        .from('subscribers')
        .select('id, email, unsubscribe_token, telegram_chat_id')
        .eq('is_active', true)
        .eq('pincode', pincode);

      if (subError) {
        console.error(`Failed to fetch subscribers for ${pincode}:`, subError);
      }

      if (!subscribers || subscribers.length === 0) {
        console.log(`No active subscribers found for pincode ${pincode}.`);
        return;
      }

      console.log(`Sending alerts to ${subscribers.length} subscribers for ${p.name} in ${pincode}...`);

      await Promise.all(
        subscribers.map(async sub => {
          try {
            await sendStockAlert({
              email: sub.email,
              platform: p.name,
              productUrl: result.productUrl,
              price: result.price,
              deliveryTime: result.deliveryTime,
              unsubscribeToken: sub.unsubscribe_token,
              telegramChatId: sub.telegram_chat_id,
            });
            console.log(`  - Successfully sent alert to ${sub.email || 'Telegram ID: ' + sub.telegram_chat_id}`);
            
            await supabaseAdmin.from('notification_log').insert({
              subscriber_id: sub.id,
              stock_event_id: event?.id,
            });
          } catch (err) {
            console.error(`  - Failed to send alert to ${sub.email || sub.telegram_chat_id}:`, err);
          }
        })
      );
    })
  );
}

async function main() {
  const mode = process.argv[2]; // 'list', 'pincode', or 'all'
  const targetPincode = process.argv[3];

  try {
    const { data: pincodesData } = await supabaseAdmin
      .from('subscribers')
      .select('pincode')
      .eq('is_active', true);

    const subscriberPincodes = Array.from(new Set(pincodesData?.map(p => p.pincode) || []));
    const pincodesToCheck = Array.from(new Set([NATIONAL_BASELINE_PINCODE, ...subscriberPincodes]));

    if (mode === 'list') {
      console.log(JSON.stringify(pincodesToCheck));
      return;
    }

    if (mode === 'all') {
      console.log(`Starting bulk check for ${pincodesToCheck.length} pincodes...`);
      // Process in larger batches to match GitHub runner's capability
      const BATCH_SIZE = 10;
      for (let i = 0; i < pincodesToCheck.length; i += BATCH_SIZE) {
        const batch = pincodesToCheck.slice(i, i + BATCH_SIZE);
        console.log(`[${new Date().toLocaleTimeString()}] Processing batch: ${batch.join(', ')}`);
        await Promise.all(batch.map(p => processPincode(p).catch(err => {
          console.error(`Error processing pincode ${p}:`, err);
        })));
      }
      console.log('Bulk check complete.');
      process.exit(0);
    }

    if (targetPincode) {
      await processPincode(targetPincode);
      process.exit(0);
    } else {
      console.error('Missing pincode. Usage: tsx scripts/check-stock.ts [list|pincode|all] [value]');
      process.exit(1);
    }
  } catch (error) {
    console.error('Check stock error:', error);
    process.exit(1);
  }
}

main();
