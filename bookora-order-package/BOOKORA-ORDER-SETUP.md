# BookOra Cart + Razorpay + Google Sheets Setup

## Recommendation
Use **Razorpay**, not a direct personal UPI link. Razorpay Checkout can present UPI and other enabled payment methods, while your server can create a Razorpay Order, verify the payment signature, and use webhooks for payment-state reliability. Razorpay requires server-side order creation and signature verification for a standard integration.

## Files
- `bookstore.html` — updated BookOra store with Add to Cart and cart counter
- `cart.html` — cart + Name, Email, Address, Pincode, State, Phone No + BUY NOW
- `order-success.html` — order success page
- `bookora-cart.js` — cart and Razorpay frontend flow
- `BookOra-Razorpay-GoogleSheets.gs` — Google Apps Script backend

## Prices
All listed products use MRP **₹299** and today's offer price **₹229**.

## Google Sheet
1. Sign into Google with `jeniaju112@gmail.com`.
2. Create a Google Sheet named `BookOra Orders`.
3. Extensions → Apps Script.
4. Paste `BookOra-Razorpay-GoogleSheets.gs`.
5. In Apps Script Project Settings → Script Properties, add:
   - `RAZORPAY_KEY_ID` = your Razorpay Test/Live Key ID
   - `RAZORPAY_KEY_SECRET` = your Razorpay Test/Live Key Secret
   - `RAZORPAY_WEBHOOK_SECRET` = a random secret you choose for the Razorpay webhook
6. Deploy → New deployment → Web app → Execute as **Me** → Who has access **Anyone**.
7. Copy the Web App URL.
8. Put that URL into `BOOKORA_CONFIG.API_URL` in `bookora-cart.js`.
9. Put the Razorpay Key ID into `BOOKORA_CONFIG.RAZORPAY_KEY_ID`.

## Razorpay
Use **Test Mode first**. Create API keys in the Razorpay Dashboard. Then test the complete flow. After testing, replace Test keys with Live keys. Configure a Razorpay webhook to the same Apps Script Web App URL and subscribe to payment/order events such as `order.paid`.

## Important
Never put the Razorpay **Key Secret** in HTML or JavaScript. It stays only in Apps Script Script Properties.

## Go-live flow
Customer → Add to Cart → Cart → Customer details → BUY NOW → Razorpay Checkout/UPI → server-side signature verification → Google Sheet row → email to `jeniaju112@gmail.com` → confirmation email to customer → Order Success page.
