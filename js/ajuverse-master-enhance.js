/* =========================================================
   AJUVERSE MASTER INTERACTION LAYER
   Visual-only enhancement. No commerce/payment logic.
   ========================================================= */
(function () {
  "use strict";

  const body = document.body;
  if (!body) return;

  body.classList.add("aju-enhanced");

  /* Page identity classes for controlled visual styling */
  if (body.classList.contains("home-page")) body.classList.add("aju-home-page");
  if (body.classList.contains("bookstore-page")) body.classList.add("aju-bookstore-page");
  if (document.querySelector(".academy-hero")) body.classList.add("aju-academy-page");
  if (document.querySelector(".course-hero")) body.classList.add("aju-kdp-page");
  if (document.querySelector(".project-hero")) body.classList.add("aju-video-page");
  if (document.querySelector(".book-detail-hero")) body.classList.add("aju-book-page");
  if (document.querySelector("#checkoutForm")) body.classList.add("aju-cart-page");
  if (body.classList.contains("login-page")) body.classList.add("aju-auth-page");
  if (body.classList.contains("signup-page")) body.classList.add("aju-auth-page");
  if (document.querySelector(".box") && document.querySelector("#orderId")) body.classList.add("aju-order-page");

  /* Header scroll state */
  const updateHeader = () => {
    body.classList.toggle("aju-scrolled", window.scrollY > 18);
  };
  updateHeader();
  window.addEventListener("scroll", updateHeader, { passive: true });

  /* Mark major content blocks for a restrained reveal */
  const revealSelectors = [
    ".hero-content",
    ".hero-visual",
    ".start-section .section-title",
    ".path-card",
    ".home-selected-heading",
    ".home-project-card",
    ".cta-box",
    ".academy-hero-copy",
    ".academy-hero-visual",
    ".academy-section-heading",
    ".academy-path-card",
    ".featured-card",
    ".why-academy > .why-grid > *",
    ".testimonial-card",
    ".academy-free-banner",
    ".academy-final-cta",
    ".bookora-hero .hero-copy",
    ".bookora-hero .bookora-hero-actions",
    ".feature-grid > *",
    ".category-card",
    ".store-book-card",
    ".resource-row",
    ".about-bookora-bottom",
    ".bookora-message",
    ".book-detail-cover",
    ".book-detail-content",
    ".book-about .section-title",
    ".book-about-grid > *",
    ".book-purchase-cta",
    ".course-hero-content",
    ".course-overview .course-stat",
    ".curriculum-card",
    ".method-card",
    ".academy-cta",
    ".project-hero .hero-grid > *",
    ".project-overview > .overview-grid > *",
    ".feature-card",
    ".process-card",
    ".result-box"
  ];

  const revealNodes = [];
  revealSelectors.forEach((selector) => {
    document.querySelectorAll(selector).forEach((el) => {
      if (!el.classList.contains("aju-reveal")) {
        el.classList.add("aju-reveal");
        revealNodes.push(el);
      }
    });
  });

  /* Small stagger for groups, capped so pages stay fast */
  document.querySelectorAll(
    ".path-grid, .home-project-grid, .featured-grid, .category-grid, .store-book-grid, .resource-list, .feature-grid, .process-grid, .book-about-grid"
  ).forEach((group) => {
    Array.from(group.children).slice(0, 8).forEach((el, index) => {
      el.classList.add("aju-delay-" + Math.min(index + 1, 4));
    });
  });

  if ("IntersectionObserver" in window && !window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
    const observer = new IntersectionObserver((entries, obs) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add("aju-visible");
        obs.unobserve(entry.target);
      });
    }, {
      threshold: 0.12,
      rootMargin: "0px 0px -45px 0px"
    });

    revealNodes.forEach((el) => observer.observe(el));
  } else {
    revealNodes.forEach((el) => el.classList.add("aju-visible"));
  }

  /* Keep same-page anchors smooth without hijacking normal links */
  document.querySelectorAll('a[href*="#"]').forEach((link) => {
    link.addEventListener("click", function () {
      const href = this.getAttribute("href") || "";
      const hashIndex = href.indexOf("#");
      if (hashIndex === -1 || hashIndex === href.length - 1) return;
      const hash = href.slice(hashIndex);
      const target = document.querySelector(hash);
      if (!target) return;
      target.scrollIntoView({ behavior: "smooth", block: "start" });
    });
  });
})();
