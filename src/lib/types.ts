export type Platform = 'amazon' | 'flipkart' | 'croma' | 'vijaysales' | 'blinkit' | 'zepto' | 'reliancedigital';

export interface ScrapeResult {
  inStock: boolean;
  price: string | null;
  productUrl: string;
  productName: string;
  error?: boolean;
  deliveryTime?: string; // For Blinkit/Zepto
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
  is_pincode_dependent: boolean;
  last_checked: string;
}

export interface QuickCommerceStock {
  id: string;
  platform: 'blinkit' | 'zepto';
  pincode: string;
  in_stock: boolean;
  price: string | null;
  product_url: string;
  delivery_time: string | null;
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
}
