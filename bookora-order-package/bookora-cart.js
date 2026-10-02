const BOOKORA_CONFIG = {
  API_URL: "https://script.google.com/macros/s/AKfycbyrXBdILUSGd01m2e2cxnqFKrEtQRee14KLUdr7sSOCi7VSVR6yxe-WxFvyNRez9hC2-w/exec",
  RAZORPAY_KEY_ID: "rzp_test_TYlHvNzD4g70Te"
};

const BOOKORA_PRODUCTS = {
  "cozy-kittens": {name:"Cozy Kittens Coloring Book", price:229},
  "magical-animals": {name:"Magical Animals Coloring Book", price:229},
  "cozy-little-worlds": {name:"Cozy Little Worlds", price:229},
  "smart-playful-activity": {name:"Smart Playful Activity Book", price:229},
  "educational-learning-collection": {name:"Educational Learning Collection", price:229},
  "bookora-digital-reading": {name:"BookOra Digital Reading Collection", price:229},
  "creator-digital-resource-pack": {name:"Creator Digital Resource Pack", price:229}
};

function getCart(){ try{return JSON.parse(localStorage.getItem("bookoraCart")||"[]")}catch(e){return []} }
function saveCart(c){localStorage.setItem("bookoraCart",JSON.stringify(c)); updateCartCount();}
function updateCartCount(){const n=getCart().reduce((s,x)=>s+x.qty,0);document.querySelectorAll("#cartCount").forEach(el=>el.textContent=n);}
function addToCart(id){const p=BOOKORA_PRODUCTS[id];if(!p)return;const c=getCart();const row=c.find(x=>x.id===id);if(row)row.qty++;else c.push({id,qty:1});saveCart(c);window.location.href="cart.html";}
function removeFromCart(id){saveCart(getCart().filter(x=>x.id!==id));renderCart();}
function changeQty(id,d){const c=getCart();const r=c.find(x=>x.id===id);if(!r)return;r.qty=Math.max(1,r.qty+d);saveCart(c);renderCart();}
function cartTotals(){return getCart().reduce((a,x)=>{const p=BOOKORA_PRODUCTS[x.id];a.qty+=x.qty;a.total+=p.price*x.qty;return a},{qty:0,total:0});}
function renderCart(){const list=document.getElementById("cartItems");if(!list)return;const c=getCart();list.innerHTML=c.length?c.map(x=>{const p=BOOKORA_PRODUCTS[x.id];return `<div class="cart-item"><div><strong>${p.name}</strong><div class="cart-item-price">₹${p.price} each</div></div><div class="qty"><button type="button" onclick="changeQty('${x.id}',-1)">−</button><span>${x.qty}</span><button type="button" onclick="changeQty('${x.id}',1)">+</button></div><strong>₹${p.price*x.qty}</strong><button type="button" class="remove" onclick="removeFromCart('${x.id}')">Remove</button></div>`}).join(""):`<div class="empty-cart">Your cart is empty. <a href="bookstore.html">Continue shopping →</a></div>`;const t=cartTotals();document.querySelectorAll("#cartTotal").forEach(e=>e.textContent=`₹${t.total}`);document.querySelectorAll("#cartCount").forEach(e=>e.textContent=t.qty);}
async function startPayment(e){e.preventDefault();const c=getCart();if(!c.length){alert("Your cart is empty.");return;}const form=e.target;const customer=Object.fromEntries(new FormData(form).entries());const btn=form.querySelector("button[type=submit]");btn.disabled=true;btn.textContent="CREATING ORDER...";try{if(BOOKORA_CONFIG.API_URL.includes("PASTE_"))throw new Error("Google Apps Script URL is not configured yet.");const items=c.map(x=>({id:x.id,qty:x.qty}));const r=await fetch(BOOKORA_CONFIG.API_URL,{method:"POST",headers:{"Content-Type":"text/plain;charset=utf-8"},body:JSON.stringify({action:"createOrder",customer,items})});const data=await r.json();if(!data.ok)throw new Error(data.error||"Could not create order");const options={key:data.keyId||BOOKORA_CONFIG.RAZORPAY_KEY_ID,amount:data.amount,currency:"INR",name:"BookOra",description:"BookOra order",order_id:data.orderId,prefill:{name:customer.name,email:customer.email,contact:customer.phone},theme:{color:"#f2b300"},handler:async function(resp){const verify=await fetch(BOOKORA_CONFIG.API_URL,{method:"POST",headers:{"Content-Type":"text/plain;charset=utf-8"},body:JSON.stringify({action:"verifyPayment",customer,items,razorpay_payment_id:resp.razorpay_payment_id,razorpay_order_id:resp.razorpay_order_id,razorpay_signature:resp.razorpay_signature})});const result=await verify.json();if(!result.ok)throw new Error(result.error||"Payment verification failed");localStorage.removeItem("bookoraCart");window.location.href="order-success.html?order="+encodeURIComponent(result.orderId);}};const rz=new Razorpay(options);rz.on("payment.failed",function(){btn.disabled=false;btn.textContent="BUY NOW";alert("Payment was not completed. Please try again.");});rz.open();}catch(err){alert(err.message);btn.disabled=false;btn.textContent="BUY NOW";}}
document.addEventListener("DOMContentLoaded",()=>{updateCartCount();renderCart();const form=document.getElementById("checkoutForm");if(form)form.addEventListener("submit",startPayment);});
