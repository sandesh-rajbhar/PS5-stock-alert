-- Stores each subscriber
CREATE TABLE subscribers (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  email TEXT NOT NULL,
  pincode TEXT NOT NULL,
  notify_email BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT NOW(),
  is_active BOOLEAN DEFAULT TRUE,
  unsubscribe_token TEXT DEFAULT gen_random_uuid()::TEXT,
  UNIQUE(email)
);

-- Stores latest stock status per platform
CREATE TABLE stock_status (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  platform TEXT NOT NULL,           -- 'amazon' | 'flipkart' | 'croma' | 'vijaysales' | 'blinkit' | 'zepto'
  product_name TEXT,
  in_stock BOOLEAN DEFAULT FALSE,
  price TEXT,
  product_url TEXT,
  is_pincode_dependent BOOLEAN DEFAULT FALSE,  -- TRUE for Blinkit & Zepto
  last_checked TIMESTAMP DEFAULT NOW(),
  UNIQUE(platform)
);

-- For Blinkit & Zepto: stock varies by pincode/dark store
CREATE TABLE quick_commerce_stock (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  platform TEXT NOT NULL,           -- 'blinkit' | 'zepto'
  pincode TEXT NOT NULL,
  in_stock BOOLEAN DEFAULT FALSE,
  price TEXT,
  product_url TEXT,
  delivery_time TEXT,               -- e.g. "10 minutes", "2 hours"
  last_checked TIMESTAMP DEFAULT NOW(),
  UNIQUE(platform, pincode)
);

-- Audit log of every stock change
CREATE TABLE stock_events (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  platform TEXT NOT NULL,
  became_in_stock BOOLEAN,
  price TEXT,
  product_url TEXT,
  event_time TIMESTAMP DEFAULT NOW()
);

-- Track which subscribers were notified
CREATE TABLE notification_log (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  subscriber_id UUID REFERENCES subscribers(id),
  stock_event_id UUID REFERENCES stock_events(id),
  sent_at TIMESTAMP DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE subscribers ENABLE ROW LEVEL SECURITY;
ALTER TABLE stock_status ENABLE ROW LEVEL SECURITY;
ALTER TABLE quick_commerce_stock ENABLE ROW LEVEL SECURITY;
ALTER TABLE stock_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE notification_log ENABLE ROW LEVEL SECURITY;

-- Public read policies
CREATE POLICY "Public can read stock status" ON stock_status FOR SELECT USING (true);
CREATE POLICY "Public can read quick commerce stock" ON quick_commerce_stock FOR SELECT USING (true);
