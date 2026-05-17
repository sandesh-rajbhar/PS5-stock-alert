# Capture real Zepto / Instamart cookies

The QC scrapers (Zepto, Swiggy Instamart) need the **actual cookie names** these
sites use to identify a darkstore session. My current guesses (`user_lat`,
`userLocation`, etc.) don't set a real location — the page returns "not
serviceable" no matter what.

To fix: open each site on your phone, set your location, then export cookies.
Takes ~5 min. No account/login needed — just a location-set session.

---

## Zepto

### Mobile (recommended — real darkstore session)

iOS Safari and Android Chrome don't expose cookies cleanly from the share
sheet. Easier path: use desktop Chrome and **set location to your real
coordinates manually**.

### Desktop Chrome

1. Open `https://www.zepto.com`
2. Click **Set delivery location** → enter your real address
3. Wait for product list to load (means darkstore session is active)
4. Open DevTools (F12) → **Application** tab → **Cookies** → `https://www.zepto.com`
5. Screenshot the cookie list OR select all rows → copy
6. Paste here. I only need the **cookie names and values** (not expiry).

### What I'm looking for

Any cookie whose name contains: `lat`, `lng`, `location`, `store`, `darkstore`,
`session`, `tid`, `geo`, `address`, `zip`. The value is what authorizes the
session.

If you see something like:

```
zSession=abc123...
zUserLocation={"lat":19.0760,"lng":72.8777,"storeId":"xyz"}
sLocation=eyJsYXQiOjE5...
```

That's exactly what I need.

---

## Swiggy Instamart

### Desktop Chrome (same flow)

1. Open `https://www.swiggy.com/instamart`
2. Click the location pin top-left → enter your real address → confirm
3. Wait for product grid to render (means session is active)
4. DevTools → **Application** → **Cookies** → `https://www.swiggy.com`
5. Screenshot or copy all rows

### What I'm looking for

Cookies named: `_session_tid`, `_swuid`, `tid`, `sid`, `userLocation`, `lat`,
`lng`, `_swugen`, `_gcl_au`, `address-id`. Their values authorize the
darkstore session.

---

## Verify the cookies work before sharing

Optional but speeds things up. In DevTools → **Network** tab, filter by
"product" or "BDFUT1SDIF" (the Instamart PS5 SKU). Reload page. Click any
request → **Headers** → **Request Headers** → copy the full `Cookie:` line
verbatim. That's the exact string the browser is sending — guaranteed to
work if pasted into my scraper.

For Zepto: filter Network by "pvid" or "ad968d7d", reload, copy the `Cookie:`
header.

---

## Sensitive data warning

Cookies may include session tokens that authorize cart/checkout actions on
your account. If you've added a credit card or address to Zepto/Instamart,
**log out first** before copying cookies. The location-only session does
**not** need to be logged in.

Best practice: open in Chrome **Incognito**, set location, copy cookies,
close window. The session dies with the window.

---

## After you paste

I'll:

1. Update `src/lib/scrapers/zepto.ts` and `src/lib/scrapers/instamart.ts`
   `buildHeaders()` to use the real cookie names
2. Update the parser to match the real `___INITIAL_STATE___` /
   RSC payload shape
3. Test from Vercel — if cookies are bound to your IP/device, may still fail
   server-side; in that case fall back to headless browser or accept that QC
   is browser-only and we can't run background alerts for it
