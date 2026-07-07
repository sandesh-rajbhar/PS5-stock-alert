export type Platform = 'amazon' | 'flipkart' | 'croma' | 'vijaysales' | 'reliancedigital' | 'blinkit' | 'zepto' | 'instamart';

export interface ProductItem {
  name: string;
  url: string;
  price: string | null;
  inStock: boolean;
}

export interface ScrapeResult {
  inStock: boolean;
  price: string | null;
  productUrl: string;
  productName: string;
  items?: ProductItem[];
  listingCount?: number;
  error?: boolean;
  deliveryTime?: string;
  note?: string; // Surface state like "Store not serviceable here"
  scope?: 'pincode' | 'national'; // 'national' = stock not verified for the user's pincode
}

export interface Subscriber {
  id: string;
  email: string;
  pincode: string;
  notify_email: boolean;
  created_at: string;
  is_active: boolean;
  unsubscribe_token: string;
}

export interface StockStatus {
  id: string;
  platform: Platform;
  product_name: string;
  in_stock: boolean;
  price: string | null;
  product_url: string;
  available_items?: ProductItem[];
  is_pincode_dependent: boolean;
  is_location_dependent?: boolean;
  note?: string;
  last_checked: string;
}

export interface StockEvent {
  id: string;
  platform: string;
  became_in_stock: boolean;
  price: string | null;
  product_url: string;
  event_time: string;
}

export interface NotifyParams {
  email: string;
  platform: string;
  productUrl: string;
  price: string | null;
  deliveryTime?: string;
  unsubscribeToken: string;
  telegramChatId?: string | null;
  nationalOnly?: boolean; // stock confirmed nationally but not for the subscriber's pincode
}
