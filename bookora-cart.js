const CART_KEY = "bookoraCart";

const RAZORPAY_KEY_ID = "rzp_test_TYlHvNzD4g70Te";

const APPS_SCRIPT_URL =
  "https://script.google.com/macros/s/AKfycbyrXBdILUSGd01m2e2cxnqFKrEtQRee14KLUdr7sSOCi7VSVR6yxe-WxFvyNRez9hC2-w/exec";


/* =========================================================
   BOOKORA PRODUCTS
   ========================================================= */

const PRODUCTS = {

  "cozy-kittens": {
    name: "Cozy Kittens Coloring Book",
    price: 229,
    delivery: "digital",
    format: "Digital"
  },

  "magical-animals": {
    name: "Magical Animals Coloring Book",
    price: 229,
    delivery: "digital",
    format: "Digital"
  },

  "cozy-little-worlds": {
    name: "Cozy Little Worlds",
    price: 229,
    delivery: "digital",
    format: "Digital"
  },

  "smart-playful-activity": {
    name: "Smart Playful Activity Book",
    price: 229,
    delivery: "digital",
    format: "Digital"
  },

  "educational-learning-collection": {
    name: "Educational Learning Collection",
    price: 229,
    delivery: "digital",
    format: "Digital"
  },

  "bookora-digital-reading": {
    name: "BookOra Digital Reading Collection",
    price: 229,
    delivery: "digital",
    format: "Digital"
  },

  "creator-digital-resource-pack": {
    name: "Creator Digital Resource Pack",
    price: 229,
    delivery: "digital",
    format: "Digital"
  },

  "lantern-beyond-snow": {
    name: "Lantern Beyond Snow",
    price: 229,
    delivery: "digital",
    format: "Digital"
  },

  "smart-playful": {
    name: "Smart & Playful",
    price: 229,
    delivery: "digital",
    format: "Digital"
  },

  "adham-yavaal-soft-copy": {
    name: "Adham and Yavaal Coloring Book with Jesus — Soft Copy",
    price: 120,
    region: "India",
    delivery: "digital",
    format: "Soft Copy"
  }

};


/* =========================================================
   GET CART
   ========================================================= */

function getCart() {

  try {

    const raw =
      JSON.parse(
        localStorage.getItem(CART_KEY) || "[]"
      );

    return raw.map(item => {

      const product =
        PRODUCTS[item.id] || {};

      return {

        ...item,

        name:
          item.name ||
          product.name ||
          item.id,

        price:
          Number(
            item.price ??
            product.price ??
            0
          ),

        region:
          item.region ||
          product.region ||
          "",

        format:
          item.format ||
          product.format ||
          "",

        delivery:
          item.delivery ||
          product.delivery ||
          "digital"

      };

    });

  } catch (error) {

    console.error(
      "Cart read error:",
      error
    );

    return [];

  }

}


/* =========================================================
   SAVE CART
   ========================================================= */

function saveCart(cart) {

  localStorage.setItem(
    CART_KEY,
    JSON.stringify(cart)
  );

  updateCartCount();

}


/* =========================================================
   UPDATE CART COUNT
   ========================================================= */

function updateCartCount() {

  const cart = getCart();

  const count =
    cart.reduce(
      (total, item) =>
        total +
        Number(item.qty || 1),
      0
    );


  /*
    IMPORTANT:

    Bookstore uses:
    #cartCount

    Some other pages may use:
    .cart-count

    So update BOTH.
  */

  document
    .querySelectorAll(
      "#cartCount, .cart-count"
    )
    .forEach(el => {

      el.textContent = count;

    });


  /*
    Update product buttons
    after cart count changes.
  */

  updateProductButtonStates(count);

}


/* =========================================================
   UPDATE PRODUCT BUTTON STATES
   ========================================================= */

function updateProductButtonStates() {

  const cart = getCart();

  document
    .querySelectorAll(
      ".store-buy-btn[data-product-id]"
    )
    .forEach(button => {

      const productId =
        button.getAttribute(
          "data-product-id"
        );


      const item =
        cart.find(
          item =>
            item.id === productId
        );


      if (item) {

        const productQty =
          Number(
            item.qty || 1
          );


        button.textContent =
          `✓ ADDED · ${productQty}`;


        button.classList.add(
          "bookora-added"
        );


      } else {

        button.textContent =
          "ADD TO CART";


        button.classList.remove(
          "bookora-added"
        );

      }

    });

}


/* =========================================================
   ADD TO CART
   ========================================================= */

function addToCart(id) {

  const product =
    PRODUCTS[id];


  if (!product) {

    console.error(
      "Unknown BookOra product:",
      id
    );

    return;

  }


  const cart =
    getCart();


  const existing =
    cart.find(
      item =>
        item.id === id
    );


  if (existing) {

    /*
      Same product clicked again.
      Increase quantity.
    */

    existing.qty =
      Number(
        existing.qty || 1
      ) + 1;

  } else {

    /*
      New product.
      Add quantity 1.
    */

    cart.push({

      id: id,

      qty: 1,

      name:
        product.name,

      price:
        product.price,

      region:
        product.region || "",

      format:
        product.format || "",

      delivery:
        product.delivery ||
        "digital"

    });

  }


  /*
    SAVE CART

    IMPORTANT:
    We DO NOT redirect to cart.html here.

    Customer stays on Bookstore.
  */

  saveCart(cart);


  /*
    Calculate exact total quantity.
  */

  const totalCount =
    cart.reduce(
      (total, item) =>
        total +
        Number(item.qty || 1),
      0
    );


  /*
    Update top CART number immediately.
  */

  document
    .querySelectorAll(
      "#cartCount, .cart-count"
    )
    .forEach(el => {

      el.textContent =
        totalCount;

    });


  /*
    Update product buttons immediately.
  */

  updateProductButtonStates(
    totalCount
  );

}


/* =========================================================
   REMOVE FROM CART
   ========================================================= */

function removeFromCart(id) {

  const cart =
    getCart().filter(
      item =>
        item.id !== id
    );


  saveCart(cart);


  if (
    typeof renderCart ===
    "function"
  ) {

    renderCart();

  }

}


/* =========================================================
   CHANGE QUANTITY
   ========================================================= */

function changeQty(id, qty) {

  const cart =
    getCart();


  const item =
    cart.find(
      item =>
        item.id === id
    );


  if (!item) {
    return;
  }


  qty =
    Number(qty);


  if (qty <= 0) {

    removeFromCart(id);

    return;

  }


  item.qty =
    qty;


  saveCart(cart);


  if (
    typeof renderCart ===
    "function"
  ) {

    renderCart();

  }

}


/* =========================================================
   CART TOTALS
   ========================================================= */

function cartTotals() {

  const cart =
    getCart();


  const subtotal =
    cart.reduce(
      (total, item) =>

        total +
        Number(
          item.price || 0
        ) *
        Number(
          item.qty || 1
        ),

      0
    );


  return {

    subtotal:
      subtotal,

    total:
      subtotal

  };

}


/* =========================================================
   RENDER CART PAGE
   ========================================================= */

function renderCart() {

  const cart =
    getCart();


  const container =
    document.getElementById(
      "cartItems"
    );


  if (!container) {
    return;
  }


  if (!cart.length) {

    container.innerHTML = `

      <div class="empty-cart">

        <h3>
          Your cart is empty
        </h3>

        <p>
          Add a BookOra product
          to continue.
        </p>

      </div>

    `;


    updateCartCount();

    return;

  }


  container.innerHTML =
    cart
      .map(
        item => `

    <div class="cart-item">

      <div class="cart-item-info">

        <h3>
          ${item.name}
        </h3>


        ${
          item.format
            ? `
              <p>
                Format:
                ${item.format}
              </p>
            `
            : ""
        }


        ${
          item.region
            ? `
              <p>
                Region:
                ${item.region}
              </p>
            `
            : ""
        }


        <p>
          ₹${Number(
            item.price
          ).toFixed(0)}
        </p>

      </div>


      <div class="cart-item-controls">


        <button
          type="button"
          onclick="
            changeQty(
              '${item.id}',
              ${
                Number(
                  item.qty || 1
                ) - 1
              }
            )
          "
        >
          −
        </button>


        <span>
          ${Number(
            item.qty || 1
          )}
        </span>


        <button
          type="button"
          onclick="
            changeQty(
              '${item.id}',
              ${
                Number(
                  item.qty || 1
                ) + 1
              }
            )
          "
        >
          +
        </button>


        <button
          type="button"
          onclick="
            removeFromCart(
              '${item.id}'
            )
          "
        >
          Remove
        </button>


      </div>

    </div>

  `
      )
      .join("");


  const totals =
    cartTotals();


  const subtotalEl =
    document.getElementById(
      "cartSubtotal"
    );


  const totalEl =
    document.getElementById(
      "cartTotal"
    );


  if (subtotalEl) {

    subtotalEl.textContent =
      `₹${totals.subtotal.toFixed(0)}`;

  }


  if (totalEl) {

    totalEl.textContent =
      `₹${totals.total.toFixed(0)}`;

  }


  updateCartCount();

}


/* =========================================================
   START PAYMENT
   ========================================================= */

async function startPayment(customer) {

  const cart =
    getCart();


  if (!cart.length) {

    alert(
      "Your cart is empty."
    );

    return;

  }


  const items =
    cart.map(
      item => ({

        id:
          item.id,

        qty:
          Number(
            item.qty || 1
          ),

        region:
          item.region || "",

        format:
          item.format || "",

        delivery:
          item.delivery || ""

      })
    );


  const response =
    await fetch(
      APPS_SCRIPT_URL,
      {

        method:
          "POST",

        headers: {

          "Content-Type":
            "text/plain;charset=utf-8"

        },

        body:
          JSON.stringify({

            action:
              "create_order",

            customer:
              customer,

            items:
              items

          })

      }
    );


  const data =
    await response.json();


  if (!data.ok) {

    throw new Error(
      data.error ||
      "Unable to create payment order."
    );

  }


  const options = {

    key:
      RAZORPAY_KEY_ID,

    amount:
      data.amount,

    currency:
      "INR",

    name:
      "BookOra",

    description:
      "BookOra Purchase",

    order_id:
      data.orderId,


    prefill: {

      name:
        customer.name || "",

      email:
        customer.email || "",

      contact:
        customer.phone ||
        customer.whatsapp ||
        ""

    },


    theme: {

      color:
        "#111111"

    },


    handler:
      async function(payment) {


        const verifyResponse =
          await fetch(
            APPS_SCRIPT_URL,
            {

              method:
                "POST",

              headers: {

                "Content-Type":
                  "text/plain;charset=utf-8"

              },

              body:
                JSON.stringify({

                  action:
                    "verify_payment",

                  razorpay_order_id:
                    payment.razorpay_order_id,

                  razorpay_payment_id:
                    payment.razorpay_payment_id,

                  razorpay_signature:
                    payment.razorpay_signature,

                  customer:
                    customer,

                  items:
                    items

                })

            }
          );


        const verifyData =
          await verifyResponse.json();


        if (!verifyData.ok) {

          alert(
            verifyData.error ||
            "Payment verification failed. Please contact BookOra."
          );

          return;

        }


        /*
          Payment successful.
          Clear cart.
        */

        localStorage.removeItem(
          CART_KEY
        );


        /*
          Go to success page.
        */

        window.location.href =
          "order-success.html?order_id=" +
          encodeURIComponent(
            payment.razorpay_order_id
          );

      }

  };


  const razorpay =
    new Razorpay(
      options
    );


  razorpay.on(
    "payment.failed",
    function(response) {

      alert(
        response.error?.description ||
        "Payment failed. Please try again."
      );

    }
  );


  razorpay.open();

}


/* =========================================================
   PAGE LOAD
   ========================================================= */

document.addEventListener(
  "DOMContentLoaded",
  function() {

    /*
      Update CART immediately
      when page loads.
    */

    updateCartCount();


    /*
      Render cart page
      if this is cart.html.
    */

    if (
      typeof renderCart ===
      "function"
    ) {

      renderCart();

    }

  }
);