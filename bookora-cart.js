/* =========================================================
   BOOKORA CART — FULL CORRECTED SCRIPT
   Works with bookstore.html and cart.html.
   Product additions stay on the bookstore page.
   ========================================================= */

const CART_KEY = "bookoraCart";

const BOOKORA_CONFIG = {
  API_URL: "https://script.google.com/macros/s/AKfycbyrXBdILUSGd01m2e2cxnqFKrEtQRee14KLUdr7sSOCi7VSVR6yxe-WxFvyNRez9hC2-w/exec",
  RAZORPAY_KEY_ID: "rzp_test_TYlHvNzD4g70Te"
};

/* Keep IDs in sync with data-product-id / addToCart(...) in bookstore.html. */
const PRODUCTS = {
  "premium-monthly-planner": { name: "Premium Monthly Planner", price: 229, delivery: "digital", format: "Printable PDF" },
  "jesus-saves-animals-playbook": { name: "Jesus Saves Animals — Channel Master Playbook", price: 229, delivery: "digital", format: "Digital PDF" },
  "cozy-witch-seasons": { name: "Cozy Witch Seasons — Adult Coloring Book", price: 229, delivery: "digital", format: "Printable PDF" },
  "prompt-profit-vault": { name: "Prompt Profit Vault — 500 AI Prompts", price: 229, delivery: "digital", format: "Digital PDF" },
  "digital-painting-backgrounds-1500": { name: "1500+ Digital Painting Backgrounds", price: 229, delivery: "digital", format: "Digital Images" },
  "cozy-kittens": { name: "Cozy Kittens Coloring Book", price: 229, delivery: "digital", format: "Digital" },
  "magical-animals": { name: "Magical Animals Coloring Book", price: 229, delivery: "digital", format: "Digital" },
  "cozy-little-worlds": { name: "Cozy Little Worlds", price: 229, delivery: "digital", format: "Digital" },
  "lantern-beyond-snow": { name: "Lantern Beyond Snow", price: 229, delivery: "digital", format: "Digital" },
  "smart-playful": { name: "Smart & Playful", price: 229, delivery: "digital", format: "Digital" },
  "smart-playful-activity": { name: "Smart Playful Activity Book", price: 229, delivery: "digital", format: "Digital" },
  "preschool-alphabet-workbook": { name: "Preschool Alphabet Workbook", price: 229, delivery: "digital", format: "Digital" },
  "my-first-maze-activity-book": { name: "My First Maze Activity Book", price: 229, delivery: "digital", format: "Digital" },
  "modern-alphabet-activity-book": { name: "My First Modern Alphabet Activity Book", price: 229, delivery: "digital", format: "Digital" },
  "educational-learning-collection": { name: "Educational Learning Collection", price: 229, delivery: "digital", format: "Digital" },
  "bookora-digital-reading": { name: "BookOra Digital Reading Collection", price: 229, delivery: "digital", format: "Digital" },
  "creator-digital-resource-pack": { name: "Creator Digital Resource Pack", price: 229, delivery: "digital", format: "Digital" },
  "adham-yavaal-soft-copy": { name: "Adham and Yavaal Coloring Book with Jesus — Soft Copy", price: 120, region: "India", delivery: "digital", format: "Soft Copy" },
  "jesus-zentangle-coloring-kids": { name: "Jesus & Zentangle Coloring Fun for Kids", price: 229, delivery: "digital", format: "Digital" },
  "nativity-coloring-book-kids": { name: "The Nativity Coloring Book for Kids", price: 229, delivery: "digital", format: "Digital" },
  "bible-stories-coloring-book-kids": { name: "Jesus and Bible Stories Coloring Book for Kids", price: 229, delivery: "digital", format: "Digital" }
};

function getCart() {
  try {
    const stored = JSON.parse(localStorage.getItem(CART_KEY) || "[]");
    if (!Array.isArray(stored)) return [];

    return stored
      .filter(item => item && item.id)
      .map(item => {
        const product = PRODUCTS[item.id] || {};
        const qty = Math.max(1, Math.floor(Number(item.qty) || 1));
        return {
          ...item,
          id: String(item.id),
          qty,
          name: item.name || product.name || String(item.id),
          price: Number(item.price ?? product.price ?? 0),
          region: item.region || product.region || "",
          format: item.format || product.format || "",
          delivery: item.delivery || product.delivery || "digital"
        };
      });
  } catch (error) {
    console.error("BookOra: unable to read cart.", error);
    return [];
  }
}

function saveCart(cart) {
  try {
    localStorage.setItem(CART_KEY, JSON.stringify(cart));
    updateCartCount();
    updateProductButtonStates();
  } catch (error) {
    console.error("BookOra: unable to save cart.", error);
    alert("Your cart could not be saved. Please check your browser storage settings.");
  }
}

function updateCartCount() {
  const count = getCart().reduce((sum, item) => sum + Number(item.qty || 1), 0);
  document.querySelectorAll("#cartCount, .cart-count, #floatingCartCount").forEach(el => {
    el.textContent = String(count);
  });
  const floatingCart = document.querySelector(".bookora-floating-cart");
  if (floatingCart) {
    floatingCart.setAttribute("aria-label", `Open shopping cart, ${count} item${count === 1 ? "" : "s"}`);
    floatingCart.setAttribute("title", `Open cart (${count})`);
  }
}

/* Update each product card with a clean quantity control after adding. */
function updateProductButtonStates() {
  const cart = getCart();
  document.querySelectorAll(".store-buy-btn[data-product-id]").forEach(button => {
    const id = button.getAttribute("data-product-id");
    const item = cart.find(row => row.id === id);

    if (!item) {
      button.classList.remove("bookora-added");
      button.removeAttribute("aria-label");
      button.innerHTML = "ADD TO CART";
      return;
    }

    const qty = Number(item.qty || 1);
    button.classList.add("bookora-added");
    button.setAttribute("aria-label", `${item.name}, quantity ${qty}. Use minus or plus to change quantity.`);
    button.innerHTML = `
      <span class="qty-minus" role="button" tabindex="0" aria-label="Decrease ${item.name} quantity" data-qty-action="minus" data-product-id="${id}">−</span>
      <span class="qty-value" aria-live="polite">${qty}</span>
      <span class="qty-plus" role="button" tabindex="0" aria-label="Increase ${item.name} quantity" data-qty-action="plus" data-product-id="${id}">+</span>
    `;
  });
}

function addToCart(id) {
  const product = PRODUCTS[id];
  if (!product) {
    console.error("BookOra: unknown product ID:", id);
    alert("This product could not be found. Please refresh the page and try again.");
    return;
  }

  const cart = getCart();
  const existing = cart.find(item => item.id === id);
  if (existing) {
    existing.qty = Math.min(20, Number(existing.qty || 1) + 1);
  } else {
    cart.push({
      id,
      qty: 1,
      name: product.name,
      price: Number(product.price),
      region: product.region || "",
      format: product.format || "",
      delivery: product.delivery || "digital"
    });
  }

  saveCart(cart);
  // Intentionally remain on bookstore.html; customer can continue shopping.
}

function decreaseBookQty(id) {
  const cart = getCart();
  const item = cart.find(row => row.id === id);
  if (!item) return;

  item.qty = Number(item.qty || 1) - 1;
  const nextCart = item.qty <= 0 ? cart.filter(row => row.id !== id) : cart;
  saveCart(nextCart);
  if (typeof renderCart === "function") renderCart();
}

/* Delegated events keep + / − controls working after their HTML is refreshed. */
document.addEventListener("click", function (event) {
  const control = event.target.closest("[data-qty-action][data-product-id]");
  if (!control) return;
  event.preventDefault();
  event.stopPropagation();
  const id = control.getAttribute("data-product-id");
  if (control.getAttribute("data-qty-action") === "minus") decreaseBookQty(id);
  else if (control.getAttribute("data-qty-action") === "plus") addToCart(id);
});

document.addEventListener("keydown", function (event) {
  if (event.key !== "Enter" && event.key !== " ") return;
  const control = event.target.closest("[data-qty-action][data-product-id]");
  if (!control) return;
  event.preventDefault();
  control.click();
});

function removeFromCart(id) {
  saveCart(getCart().filter(item => item.id !== id));
  if (typeof renderCart === "function") renderCart();
}

/* Cart-page controls pass a desired quantity (not a delta). */
function changeQty(id, qty) {
  const cart = getCart();
  const item = cart.find(row => row.id === id);
  if (!item) return;

  qty = Math.floor(Number(qty));
  if (!Number.isFinite(qty) || qty <= 0) {
    removeFromCart(id);
    return;
  }
  item.qty = Math.min(20, qty);
  saveCart(cart);
  if (typeof renderCart === "function") renderCart();
}

function cartTotals() {
  const cart = getCart();
  const subtotal = cart.reduce((sum, item) => sum + Number(item.price || 0) * Number(item.qty || 1), 0);
  const qty = cart.reduce((sum, item) => sum + Number(item.qty || 1), 0);
  return { subtotal, total: subtotal, qty };
}

function renderCart() {
  const container = document.getElementById("cartItems");
  if (!container) {
    updateCartCount();
    updateProductButtonStates();
    return;
  }

  const cart = getCart();
  if (!cart.length) {
    container.innerHTML = `
      <div class="empty-cart">
        <h3>Your cart is empty</h3>
        <p>Add a BookOra product to continue.</p>
        <a href="BookOra-Digital.html">Continue shopping →</a>
      </div>`;
  } else {
    container.innerHTML = cart.map(item => {
      const safeId = String(item.id).replace(/&/g, "&amp;").replace(/'/g, "&#39;").replace(/"/g, "&quot;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
      const safeName = String(item.name || item.id).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
      const qty = Number(item.qty || 1);
      const price = Number(item.price || 0);
      return `
        <article class="cart-item">
          <div class="cart-item-info">
            <h3>${safeName}</h3>
            ${item.format ? `<p>Format: ${item.format}</p>` : ""}
            ${item.region ? `<p>Region: ${item.region}</p>` : ""}
            <p>₹${price.toFixed(0)} each</p>
          </div>
          <div class="cart-item-controls qty">
            <button type="button" aria-label="Decrease quantity" onclick="changeQty('${safeId}', ${qty - 1})">−</button>
            <span aria-live="polite">${qty}</span>
            <button type="button" aria-label="Increase quantity" onclick="changeQty('${safeId}', ${qty + 1})" ${qty >= 20 ? "disabled" : ""}>+</button>
          </div>
          <strong class="cart-item-total">₹${(price * qty).toFixed(0)}</strong>
          <button type="button" class="remove" onclick="removeFromCart('${safeId}')">Remove</button>
        </article>`;
    }).join("");
  }

  const totals = cartTotals();
  document.querySelectorAll("#cartSubtotal, [data-cart-subtotal]").forEach(el => el.textContent = `₹${totals.subtotal.toFixed(0)}`);
  document.querySelectorAll("#cartTotal, [data-cart-total]").forEach(el => el.textContent = `₹${totals.total.toFixed(0)}`);
  updateCartCount();
  updateProductButtonStates();
}

/* Checkout integration: preserves the existing Apps Script + Razorpay flow. */
async function startPayment(event) {
  if (event && typeof event.preventDefault === "function") event.preventDefault();

  const cart = getCart();
  if (!cart.length) {
    alert("Your cart is empty.");
    return;
  }

  const form = event && event.target && event.target.tagName === "FORM" ? event.target : document.getElementById("checkoutForm");
  if (!form) {
    alert("Checkout form could not be found.");
    return;
  }

  const customer = Object.fromEntries(new FormData(form).entries());
  const submitButton = form.querySelector('button[type="submit"]');
  const originalButtonText = submitButton ? submitButton.textContent : "BUY NOW";
  if (submitButton) {
    submitButton.disabled = true;
    submitButton.textContent = "CREATING ORDER...";
  }

  try {
    if (!BOOKORA_CONFIG.API_URL || BOOKORA_CONFIG.API_URL.includes("PASTE_")) throw new Error("BookOra payment endpoint is not configured.");
    if (typeof Razorpay === "undefined") throw new Error("Razorpay checkout did not load. Please refresh and try again.");

    const items = cart.map(item => ({ id: item.id, qty: Number(item.qty || 1), region: item.region || "", format: item.format || "", delivery: item.delivery || "digital" }));
    const response = await fetch(BOOKORA_CONFIG.API_URL, {
      method: "POST",
      headers: { "Content-Type": "text/plain;charset=utf-8" },
      body: JSON.stringify({ action: "createOrder", customer, items })
    });
    const data = await response.json();
    if (!response.ok || !data.ok) throw new Error(data.error || "Could not create the order. Please try again.");

    const options = {
      key: data.keyId || BOOKORA_CONFIG.RAZORPAY_KEY_ID,
      amount: data.amount,
      currency: data.currency || "INR",
      name: "BookOra",
      description: "BookOra order",
      order_id: data.orderId,
      prefill: {
        name: customer.name || "",
        email: customer.email || "",
        contact: customer.phone || customer.whatsapp || ""
      },
      theme: { color: "#f2b300" },
      handler: async function (payment) {
        try {
          const verifyResponse = await fetch(BOOKORA_CONFIG.API_URL, {
            method: "POST",
            headers: { "Content-Type": "text/plain;charset=utf-8" },
            body: JSON.stringify({
              action: "verifyPayment",
              customer,
              items,
              razorpay_payment_id: payment.razorpay_payment_id,
              razorpay_order_id: payment.razorpay_order_id,
              razorpay_signature: payment.razorpay_signature
            })
          });
          const result = await verifyResponse.json();
          if (!verifyResponse.ok || !result.ok) throw new Error(result.error || "Payment verification failed. Please contact BookOra before retrying.");
          localStorage.removeItem(CART_KEY);
          window.location.href = "order-success.html?order=" + encodeURIComponent(result.orderId || payment.razorpay_order_id);
        } catch (error) {
          alert(error.message || "Payment verification could not be completed. Please contact BookOra with your payment details.");
          if (submitButton) {
            submitButton.disabled = false;
            submitButton.textContent = originalButtonText;
          }
        }
      },
      modal: {
        ondismiss: function () {
          if (submitButton) {
            submitButton.disabled = false;
            submitButton.textContent = originalButtonText;
          }
        }
      }
    };

    const razorpay = new Razorpay(options);
    razorpay.on("payment.failed", function (response) {
      alert((response.error && response.error.description) || "Payment was not completed. Please try again.");
      if (submitButton) {
        submitButton.disabled = false;
        submitButton.textContent = originalButtonText;
      }
    });
    razorpay.open();
  } catch (error) {
    alert(error.message || "Something went wrong while starting checkout.");
    if (submitButton) {
      submitButton.disabled = false;
      submitButton.textContent = originalButtonText;
    }
  }
}

/* Support both inline onsubmit and normal form submission. */
document.addEventListener("DOMContentLoaded", function () {
  updateCartCount();
  updateProductButtonStates();
  renderCart();
  const checkoutForm = document.getElementById("checkoutForm");
  if (checkoutForm && !checkoutForm.dataset.bookoraPaymentBound) {
    checkoutForm.addEventListener("submit", startPayment);
    checkoutForm.dataset.bookoraPaymentBound = "true";
  }
});
