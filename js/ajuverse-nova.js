/* =========================================================
   AJUVERSE — NOVA INTERACTION LAYER
   Visual-only. No cart, payment, or form-submission logic.
   Adds: ambient background field, pointer-based 3D tilt on
   cards/covers, and a light scroll parallax on that field.
   Everything here is guarded and respects
   prefers-reduced-motion + touch devices.
   ========================================================= */
(function () {
  "use strict";

  var reduceMotion = false;
  try {
    reduceMotion = window.matchMedia &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  } catch (e) {}

  var hasHover = true;
  try {
    hasHover = window.matchMedia && window.matchMedia("(hover: hover)").matches;
  } catch (e) {}

  /* ---------------- Ambient field ---------------- */
  function mountField() {
    if (document.getElementById("nova-field")) return;
    var field = document.createElement("div");
    field.id = "nova-field";
    field.setAttribute("aria-hidden", "true");
    document.body.insertBefore(field, document.body.firstChild);
    return field;
  }

  var field = mountField();

  if (field && !reduceMotion) {
    var ticking = false;
    var onScroll = function () {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(function () {
        var shift = Math.min(window.scrollY * 0.06, 70);
        field.style.setProperty("--nova-scroll-shift", shift + "px");
        ticking = false;
      });
    };
    window.addEventListener("scroll", onScroll, { passive: true });
  }

  /* ---------------- 3D pointer tilt ---------------- */
  var TILT_SELECTORS = [
    ".path-card", ".home-project-card", ".category-card", ".feature-card",
    ".academy-path-card", ".process-card", ".store-book-card",
    ".project-card", ".kdp-book", ".testimonial-card",
    ".hero-visual img", ".academy-hero-visual img", ".book-detail-cover img",
    ".kdp-cover img", ".hero-image img"
  ].join(",");

  if (!reduceMotion && hasHover) {
    var nodes = document.querySelectorAll(TILT_SELECTORS);

    nodes.forEach(function (el) {
      el.classList.add("nova-tilt");

      var raf = null;
      var rect = null;

      var onEnter = function () {
        rect = el.getBoundingClientRect();
      };

      var onMove = function (e) {
        if (!rect) rect = el.getBoundingClientRect();
        var px = (e.clientX - rect.left) / rect.width;
        var py = (e.clientY - rect.top) / rect.height;
        var ry = (px - 0.5) * 10;   // rotateY range
        var rx = (0.5 - py) * 8;    // rotateX range

        if (raf) cancelAnimationFrame(raf);
        raf = requestAnimationFrame(function () {
          el.style.setProperty("--nova-rx", rx.toFixed(2) + "deg");
          el.style.setProperty("--nova-ry", ry.toFixed(2) + "deg");
        });
      };

      var onLeave = function () {
        if (raf) cancelAnimationFrame(raf);
        el.style.setProperty("--nova-rx", "0deg");
        el.style.setProperty("--nova-ry", "0deg");
        rect = null;
      };

      el.addEventListener("pointerenter", onEnter);
      el.addEventListener("pointermove", onMove);
      el.addEventListener("pointerleave", onLeave);
    });
  }

  /* ---------------- Hero visual micro-parallax ---------------- */
  var heroVisual = document.querySelector(".hero-visual, .academy-hero-visual");
  if (heroVisual && !reduceMotion && hasHover) {
    var heroRaf = null;
    document.addEventListener("pointermove", function (e) {
      var cx = window.innerWidth / 2;
      var cy = window.innerHeight / 2;
      var dx = (e.clientX - cx) / cx;
      var dy = (e.clientY - cy) / cy;

      if (heroRaf) cancelAnimationFrame(heroRaf);
      heroRaf = requestAnimationFrame(function () {
        heroVisual.style.transform =
          "translate3d(" + (dx * 6).toFixed(2) + "px," + (dy * 6).toFixed(2) + "px,0)";
      });
    }, { passive: true });
  }
})();
