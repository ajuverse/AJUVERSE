// ==========================
// AJUVERSE FINAL SCRIPT
// ==========================

// Navbar Shadow on Scroll

window.addEventListener("scroll", () => {

const header = document.querySelector(".header");

if(window.scrollY > 50){

header.style.boxShadow =
"0px 10px 30px rgba(0,0,0,0.4)";

}
else{

header.style.boxShadow = "none";

}

});

// ==========================
// Scroll Reveal Animation
// ==========================

const revealElements = document.querySelectorAll(

'.service-card, .portfolio-card, .stats-grid div'

);

const revealObserver = new IntersectionObserver(

(entries)=>{

entries.forEach(entry=>{

if(entry.isIntersecting){

entry.target.style.opacity = "1";
entry.target.style.transform =
"translateY(0px)";

}

});

},

{
threshold:0.2
}

);

revealElements.forEach(element=>{

element.style.opacity = "0";

element.style.transform =
"translateY(60px)";

element.style.transition =
"all 0.8s ease";

revealObserver.observe(element);

});

// ==========================
// Hero Fade In
// ==========================

window.addEventListener("load",()=>{

const heroContent =
document.querySelector(".hero-content");

const heroImage =
document.querySelector(".hero-image");

heroContent.style.opacity="0";
heroImage.style.opacity="0";

heroContent.style.transform=
"translateX(-40px)";

heroImage.style.transform=
"translateX(40px)";

setTimeout(()=>{

heroContent.style.transition=
"all 1s ease";

heroImage.style.transition=
"all 1s ease";

heroContent.style.opacity="1";
heroImage.style.opacity="1";

heroContent.style.transform=
"translateX(0px)";

heroImage.style.transform=
"translateX(0px)";

},300);

});

// ==========================
// Portfolio Hover Glow
// ==========================

const cards =
document.querySelectorAll(".portfolio-card");

cards.forEach(card=>{

card.addEventListener("mouseenter",()=>{

card.style.boxShadow =
"0 20px 40px rgba(255,255,255,0.08)";

});

card.addEventListener("mouseleave",()=>{

card.style.boxShadow =
"none";

});

});

// ==========================
// Services Hover Glow
// ==========================

const serviceCards =
document.querySelectorAll(".service-card");

serviceCards.forEach(card=>{

card.addEventListener("mouseenter",()=>{

card.style.boxShadow =
"0 20px 40px rgba(255,255,255,0.08)";

});

card.addEventListener("mouseleave",()=>{

card.style.boxShadow =
"none";

});

});

// ==========================
// Smooth Anchor Scroll
// ==========================

document.querySelectorAll('a[href^="#"]')
.forEach(anchor => {

anchor.addEventListener("click", function(e) {

e.preventDefault();

document.querySelector(
this.getAttribute("href")
).scrollIntoView({

behavior:"smooth"

});

});

});

// ==========================
// Console Branding
// ==========================

console.log(

"%cAjuVerse Loaded Successfully 🚀",

"color:white;background:black;padding:10px;font-size:16px;"

);