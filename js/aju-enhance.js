/* =========================================================
   AJUVERSE — EXPERIENCE ENHANCEMENT LAYER
   Vanilla JS. No dependencies. No build step.

   Loaded in <head> WITHOUT defer so the .aju-js flag lands
   on <html> before first paint. Everything else waits for
   DOMContentLoaded.

   This file never touches cart state, product data,
   Razorpay, or the Apps Script endpoints.
========================================================= */

(function () {
    "use strict";

    /* Flag the document immediately. CSS keys every initial
       hidden state off html.aju-js, so if this script fails
       to load the site simply renders fully visible. */
    document.documentElement.classList.add("aju-js");

    /* Guarded: if matchMedia is unavailable the layer must
       degrade quietly, never throw and take the page with it. */
    var reduceMotion = false;

    try {
        if (typeof window.matchMedia === "function") {
            reduceMotion = window.matchMedia(
                "(prefers-reduced-motion: reduce)"
            ).matches;
        }
    } catch (e) {
        reduceMotion = false;
    }


    /* =====================================================
       REVEAL TARGETS

       Curated on purpose. Elements that already carry a
       load-time animation in style.css (.hero-content,
       .hero-visual, .path-card, .service-card) are excluded
       so the two systems never fight.
    ===================================================== */

    /* Every selector below was taken from the real markup in
       this project. Nothing speculative. */
    var REVEAL_SELECTORS = [
        /* home */
        ".section-title",
        ".home-selected-heading",
        ".home-project-card",
        ".cta-box",
        ".footer-brand",
        ".footer-column",
        /* bookstore */
        ".store-category-heading",
        ".store-book-card",
        ".category-card",
        ".news-item",
        /* academy */
        ".academy-section-heading",
        ".academy-path-card",
        ".featured-card",
        /* kdp publishing */
        ".section-heading",
        ".method-card",
        ".curriculum-card",
        /* video editing */
        ".feature-header",
        ".feature-card",
        ".process-card",
        ".result-box",
        ".info-panel",
        /* book detail pages */
        ".book-about-grid"
    ];

    var IMAGE_SELECTORS = [
        ".home-project-image",
        ".store-book-image",
        ".course-image",
        ".resource-cover",
        ".book-detail-cover",
        ".hero-image-wrap"
    ];


    /* =====================================================
       HELPERS
    ===================================================== */

    function each(list, fn) {
        Array.prototype.forEach.call(list, fn);
    }

    /* An element is "above the fold" if it starts inside the
       first viewport. Those are revealed straight away so
       nothing important is hidden behind a scroll. */
    function isAboveFold(el) {
        var box = el.getBoundingClientRect();
        return box.top < window.innerHeight * 0.92;
    }


    /* =====================================================
       SCROLL REVEAL
    ===================================================== */

    function initReveal() {

        var nodes = document.querySelectorAll(
            REVEAL_SELECTORS.join(",")
        );

        var images = document.querySelectorAll(
            IMAGE_SELECTORS.join(",")
        );

        if (!nodes.length && !images.length) {
            return;
        }

        /* No IntersectionObserver, or motion is reduced:
           show everything and stop. */
        if (reduceMotion || !("IntersectionObserver" in window)) {
            each(nodes, function (el) {
                el.classList.add("aju-in", "aju-done");
            });
            each(images, function (el) {
                el.classList.add("aju-in");
            });
            return;
        }

        /* Tag elements. Siblings inside the same parent get a
           staggered delay, capped so a long list never leaves
           the visitor waiting. */
        var groups = {};
        var groupIndex = 0;

        each(nodes, function (el) {
            el.setAttribute("data-aju-reveal", "");

            var parent = el.parentNode;

            if (!parent.__ajuGroup) {
                parent.__ajuGroup = "g" + (groupIndex++);
                groups[parent.__ajuGroup] = 0;
            }

            var n = groups[parent.__ajuGroup]++;
            var delay = Math.min(n * 80, 320);

            el.style.setProperty("--aju-delay", delay + "ms");
        });

        each(images, function (el) {
            el.setAttribute("data-aju-img", "");
        });

        var observer = new IntersectionObserver(
            function (entries) {
                entries.forEach(function (entry) {
                    if (!entry.isIntersecting) {
                        return;
                    }

                    var el = entry.target;
                    el.classList.add("aju-in");

                    /* Drop the will-change hint once settled. */
                    window.setTimeout(function () {
                        el.classList.add("aju-done");
                    }, 1200);

                    observer.unobserve(el);
                });
            },
            {
                rootMargin: "0px 0px -8% 0px",
                threshold: 0.08
            }
        );

        each(nodes, function (el) {
            if (isAboveFold(el)) {
                el.classList.add("aju-in");
                window.setTimeout(function () {
                    el.classList.add("aju-done");
                }, 1200);
            } else {
                observer.observe(el);
            }
        });

        each(images, function (el) {
            if (isAboveFold(el)) {
                el.classList.add("aju-in");
            } else {
                observer.observe(el);
            }
        });
    }


    /* =====================================================
       HEADER SCROLL STATE
       rAF-throttled, passive listener, no layout reads in
       the scroll handler beyond scrollY.
    ===================================================== */

    function initHeader() {

        var header = document.querySelector(".site-header");

        if (!header) {
            return;
        }

        var ticking = false;
        var lastState = null;

        function apply() {
            var scrolled = window.scrollY > 24;

            if (scrolled !== lastState) {
                header.classList.toggle("aju-scrolled", scrolled);
                lastState = scrolled;
            }

            ticking = false;
        }

        window.addEventListener(
            "scroll",
            function () {
                if (!ticking) {
                    ticking = true;
                    window.requestAnimationFrame(apply);
                }
            },
            { passive: true }
        );

        apply();
    }


    /* =====================================================
       CURRENT NAVIGATION STATE

       Resolved from the URL so every page marks its own nav
       item without needing a hand-written class="active".
       An existing .active class is respected and left alone.
    ===================================================== */

    function initNavState() {

        var nav = document.querySelector(".main-nav");

        if (!nav) {
            return;
        }

        if (nav.querySelector("a.active")) {
            return;
        }

        var here = window.location.pathname
            .split("/")
            .pop()
            .toLowerCase() || "index.html";

        each(nav.querySelectorAll("a"), function (link) {

            var href = (link.getAttribute("href") || "").toLowerCase();

            if (!href || href.charAt(0) === "#") {
                return;
            }

            var target = href.split("#")[0].split("/").pop();

            if (target && target === here) {
                link.classList.add("aju-current");
                link.setAttribute("aria-current", "page");
            }
        });
    }


    /* =====================================================
       SKIP LINK
       Injected rather than added to 12 HTML files by hand.
    ===================================================== */

    function initSkipLink() {

        var main = document.querySelector("main") ||
                   document.querySelector("#home") ||
                   document.querySelector("section");

        if (!main || document.querySelector(".aju-skip-link")) {
            return;
        }

        if (!main.id) {
            main.id = "aju-main";
        }

        var link = document.createElement("a");
        link.className = "aju-skip-link";
        link.href = "#" + main.id;
        link.textContent = "Skip to content";

        document.body.insertBefore(link, document.body.firstChild);
    }


    /* =====================================================
       PAGE EXIT TRANSITION

       Capped at 170ms. Skipped for anything that is not a
       plain same-origin navigation, so downloads, external
       links, mailto:, tel:, wa.me, anchors, new-tab clicks
       and the BookOra checkout redirect all behave exactly
       as they did before.
    ===================================================== */

    function initPageTransition() {

        if (reduceMotion) {
            return;
        }

        document.addEventListener("click", function (event) {

            if (event.defaultPrevented ||
                event.button !== 0 ||
                event.metaKey || event.ctrlKey ||
                event.shiftKey || event.altKey) {
                return;
            }

            var link = event.target.closest && event.target.closest("a");

            if (!link) {
                return;
            }

            var href = link.getAttribute("href");

            if (!href ||
                href.charAt(0) === "#" ||
                link.target === "_blank" ||
                link.hasAttribute("download") ||
                link.hasAttribute("data-aju-no-transition") ||
                /^(mailto:|tel:|javascript:)/i.test(href)) {
                return;
            }

            var url;

            try {
                url = new URL(href, window.location.href);
            } catch (e) {
                return;
            }

            if (url.origin !== window.location.origin) {
                return;
            }

            /* Same page, different hash — let the browser scroll. */
            if (url.pathname === window.location.pathname &&
                url.hash) {
                return;
            }

            event.preventDefault();
            document.body.classList.add("aju-leaving");

            window.setTimeout(function () {
                window.location.href = url.href;
            }, 170);
        });

        /* Restore on back/forward from the bfcache, otherwise
           the page would return still faded out. */
        window.addEventListener("pageshow", function (event) {
            if (event.persisted) {
                document.body.classList.remove("aju-leaving");
            }
        });
    }


    /* =====================================================
       BOOT
    ===================================================== */

    function boot() {
        initHeader();
        initNavState();
        initSkipLink();
        initReveal();
        initPageTransition();
    }

    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", boot);
    } else {
        boot();
    }

})();
