// BOOKORA ORDER BACKEND — Google Apps Script
// 1) Create a Google Sheet while signed into jeniaju112@gmail.com.
// 2) Extensions -> Apps Script. Paste this file.
// 3) In Project Settings -> Script Properties add:
//    RAZORPAY_KEY_ID = your Razorpay test/live key id
//    RAZORPAY_KEY_SECRET = your Razorpay test/live key secret
//    RAZORPAY_WEBHOOK_SECRET = a secret you choose for the Razorpay webhook
// 4) Deploy as Web app: Execute as Me, Who has access: Anyone.

const ADMIN_EMAIL = 'jeniaju112@gmail.com';
const CURRENCY = 'INR';
const OFFER_PRICE = 229;
const CATALOG = {
  'cozy-kittens': 'Cozy Kittens Coloring Book',
  'magical-animals': 'Magical Animals Coloring Book',
  'cozy-little-worlds': 'Cozy Little Worlds',
  'smart-playful-activity': 'Smart Playful Activity Book',
  'educational-learning-collection': 'Educational Learning Collection',
  'bookora-digital-reading': 'BookOra Digital Reading Collection',
  'creator-digital-resource-pack': 'Creator Digital Resource Pack'
};

function doPost(e) {
  const raw = e && e.postData ? e.postData.contents : '';
  if (!raw) return json({ok:false,error:'Empty request'});
  try {
    const data = JSON.parse(raw);
    if (data.action === 'createOrder') return createOrder(data);
    if (data.action === 'verifyPayment') return verifyPayment(data);
    return json({ok:false,error:'Unknown action'});
  } catch(err) { return json({ok:false,error:String(err)}); }
}

function createOrder(data) {
  const customer = validateCustomer(data.customer);
  const items = normalizeItems(data.items);
  const amount = items.reduce((sum,x)=>sum+x.qty*OFFER_PRICE,0)*100;
  const receipt = 'BO-' + Utilities.getUuid().replace(/-/g,'').slice(0,16).toUpperCase();
  const props = PropertiesService.getScriptProperties();
  const keyId = props.getProperty('RAZORPAY_KEY_ID');
  const secret = props.getProperty('RAZORPAY_KEY_SECRET');
  if (!keyId || !secret) throw new Error('Razorpay keys are not configured in Script Properties.');
  const payload = {
    amount: amount,
    currency: CURRENCY,
    receipt: receipt,
    notes: {
      customer_name: customer.name,
      customer_email: customer.email,
      customer_phone: customer.phone,
      customer_address: customer.address,
      customer_pincode: customer.pincode,
      customer_state: customer.state,
      items: JSON.stringify(items)
    }
  };
  const res = UrlFetchApp.fetch('https://api.razorpay.com/v1/orders', {
    method:'post', contentType:'application/json', muteHttpExceptions:true,
    headers:{Authorization:'Basic '+Utilities.base64Encode(keyId+':'+secret)},
    payload:JSON.stringify(payload)
  });
  const out = JSON.parse(res.getContentText());
  if (res.getResponseCode() >= 300) throw new Error(out.error && out.error.description || 'Razorpay order creation failed.');
  return json({ok:true,keyId:keyId,orderId:out.id,amount:out.amount,currency:out.currency,receipt:receipt});
}

function verifyPayment(data) {
  const customer = validateCustomer(data.customer);
  const items = normalizeItems(data.items);
  const orderId = String(data.razorpay_order_id||'');
  const paymentId = String(data.razorpay_payment_id||'');
  const signature = String(data.razorpay_signature||'');
  if (!orderId || !paymentId || !signature) throw new Error('Missing Razorpay payment details.');
  const secret = PropertiesService.getScriptProperties().getProperty('RAZORPAY_KEY_SECRET');
  const expected = hmacHex(orderId+'|'+paymentId, secret);
  if (expected !== signature) throw new Error('Payment signature verification failed.');
  const total = items.reduce((sum,x)=>sum+x.qty*OFFER_PRICE,0);
  const orderNo = saveOrder({orderId, paymentId, customer, items, total, status:'PAID'});
  sendEmails(orderNo, orderId, paymentId, customer, items, total);
  return json({ok:true,orderId:orderNo});
}

function normalizeItems(items) {
  if (!Array.isArray(items) || !items.length) throw new Error('Cart is empty.');
  return items.map(x=>{
    const id=String(x.id||''); const qty=Math.max(1,Math.min(20,Number(x.qty)||1));
    if (!CATALOG[id]) throw new Error('Invalid product in cart.');
    return {id:id,name:CATALOG[id],qty:qty,unitPrice:OFFER_PRICE};
  });
}
function validateCustomer(c) {
  if (!c) throw new Error('Customer details are required.');
  const out={name:String(c.name||'').trim(),email:String(c.email||'').trim(),address:String(c.address||'').trim(),pincode:String(c.pincode||'').trim(),state:String(c.state||'').trim(),phone:String(c.phone||'').trim()};
  if (!out.name||!out.email||!out.address||!out.pincode||!out.state||!out.phone) throw new Error('Please complete all customer details.');
  return out;
}
function hmacHex(message, secret) { const bytes=Utilities.computeHmacSha256Signature(message, secret); return bytes.map(b=>('0'+(b&255).toString(16)).slice(-2)).join(''); }
function getSheet(){const ss=SpreadsheetApp.getActiveSpreadsheet();let sh=ss.getSheetByName('Orders');if(!sh)sh=ss.insertSheet('Orders');if(sh.getLastRow()===0)sh.appendRow(['Order ID','Date','Status','Payment ID','Customer Name','Email','Phone','Address','Pincode','State','Products','Total (INR)']);return sh;}
function saveOrder(o){const sh=getSheet();const orderNo=o.orderId;const values=sh.getDataRange().getValues();for(let i=1;i<values.length;i++){if(String(values[i][0])===orderNo)return orderNo;}const productText=o.items.map(x=>x.name+' x'+x.qty).join(' | ');sh.appendRow([orderNo,new Date(),o.status,o.paymentId,o.customer.name,o.customer.email,o.customer.phone,o.customer.address,o.customer.pincode,o.customer.state,productText,o.total]);return orderNo;}
function sendEmails(orderNo, razorOrderId, paymentId, c, items, total){const products=items.map(x=>x.name+' × '+x.qty).join('\n');const body='New BookOra order received.\n\nOrder ID: '+orderNo+'\nPayment ID: '+paymentId+'\n\nCustomer\nName: '+c.name+'\nEmail: '+c.email+'\nPhone: '+c.phone+'\nAddress: '+c.address+'\nPincode: '+c.pincode+'\nState: '+c.state+'\n\nProducts\n'+products+'\n\nTotal: ₹'+total;MailApp.sendEmail(ADMIN_EMAIL,'New BookOra Order — '+orderNo,body);MailApp.sendEmail(c.email,'BookOra Order Confirmation — '+orderNo,'Thank you for your BookOra order.\n\nOrder ID: '+orderNo+'\nProducts:\n'+products+'\n\nTotal paid: ₹'+total+'\n\nWe have received and verified your payment.');}
function json(o){return ContentService.createTextOutput(JSON.stringify(o)).setMimeType(ContentService.MimeType.JSON);}
