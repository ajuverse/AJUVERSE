/* =========================================================
   AJUVERSE — MAIN JAVASCRIPT
========================================================= */

document.addEventListener("DOMContentLoaded", () => {


    /* =====================================================
       PORTFOLIO FILTER
    ===================================================== */

    const filterButtons = document.querySelectorAll(
        ".portfolio-filter"
    );

    const portfolioCards = document.querySelectorAll(
        ".portfolio-card"
    );


    filterButtons.forEach((button) => {

        button.addEventListener("click", () => {


            /* Remove active state */

            filterButtons.forEach((btn) => {
                btn.classList.remove("active");
            });


            /* Add active state to clicked button */

            button.classList.add("active");


            /* Get selected category */

            const selectedFilter =
                button.getAttribute("data-filter");


            /* Show / hide cards */

            portfolioCards.forEach((card) => {

                const cardCategory =
                    card.getAttribute("data-category");


                if (
                    selectedFilter === "all" ||
                    cardCategory === selectedFilter
                ) {

                    card.style.display = "block";

                    setTimeout(() => {
                        card.style.opacity = "1";
                        card.style.transform = "translateY(0)";
                    }, 10);

                } else {

                    card.style.opacity = "0";
                    card.style.transform = "translateY(10px)";

                    setTimeout(() => {
                        card.style.display = "none";
                    }, 200);

                }

            });

        });

    });



    /* =====================================================
       WHAT I DO → PORTFOLIO
    ===================================================== */

    const skillLinks = document.querySelectorAll(
        ".skill-portfolio-link"
    );


    skillLinks.forEach((link) => {

        link.addEventListener("click", (event) => {

            event.preventDefault();


            const targetCategory =
                link.getAttribute("data-target");


            /* Find matching portfolio filter */

            const matchingFilter =
                document.querySelector(
                    `.portfolio-filter[data-filter="${targetCategory}"]`
                );


            if (matchingFilter) {

                matchingFilter.click();

            }


            /* Scroll to Portfolio */

            const portfolioSection =
                document.querySelector("#portfolio");


            if (portfolioSection) {

                portfolioSection.scrollIntoView({
                    behavior: "smooth"
                });

            }

        });

    });



    /* =====================================================
       SMOOTH INTERNAL LINKS
    ===================================================== */

    const internalLinks =
        document.querySelectorAll(
            'a[href^="#"]'
        );


    internalLinks.forEach((link) => {

        link.addEventListener("click", (event) => {

            const targetId =
                link.getAttribute("href");


            if (
                !targetId ||
                targetId === "#"
            ) {
                return;
            }


            const target =
                document.querySelector(targetId);


            if (target) {

                event.preventDefault();


                target.scrollIntoView({
                    behavior: "smooth",
                    block: "start"
                });

            }

        });

    });


});