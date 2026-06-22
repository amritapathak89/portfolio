// --- Starfield background ---
// All module state is declared up front so initializeBackground() is safe to
// call synchronously (the deferred script runs while readyState is "interactive").
let canvas;
let ctx;
let stars = [];
let lastPaintTime = 0;
let rafId = null;
let resizeTimeout = null;
let resizeCooldown = 500;
let lastResizeTime = Date.now();

function initializeBackground() {
  canvas = document.getElementById("stars");
  if (!canvas) return;
  ctx = canvas.getContext("2d"); // cache the 2D context once
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;

  window.addEventListener("resize", function () {
    if (Date.now() - lastResizeTime < resizeCooldown && resizeTimeout) {
      clearTimeout(resizeTimeout);
      resizeTimeout = null;
    }

    lastResizeTime = Date.now();
    canvas.style.display = "none";
    resizeTimeout = setTimeout(function () {
      fadeIn(canvas, 500);
      initializeStars();
    }, 500);
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
  });

  initializeStars();
  startLoop();
}

function startLoop() {
  if (rafId === null) {
    rafId = requestAnimationFrame(paintLoop);
  }
}

function stopLoop() {
  if (rafId !== null) {
    cancelAnimationFrame(rafId);
    rafId = null;
  }
}

function rand(max) {
  return Math.random() * max;
}

function Star(size, speed) {
  this.size = size;
  this.speed = speed;
  this.x = rand(window.innerWidth);
  this.y = rand(window.innerHeight);
}

Star.prototype.animate = function (delta) {
  this.x += this.speed * delta;
  this.y -= this.speed * delta;
  if (this.y < 0) {
    this.y = window.innerHeight;
  }
  if (this.x > window.innerWidth) {
    this.x = 0;
  }
  ctx.fillStyle = "#ffffff";
  ctx.fillRect(this.x, this.y, this.size, this.size);
};

function initializeStars() {
  let winArea = window.innerWidth * window.innerHeight;
  let smallStarsDensity = 0.0001;
  let mediumStarsDensity = 0.00005;
  let largeStarsDensity = 0.00002;
  let smallStarsCount = winArea * smallStarsDensity;
  let mediumStarsCount = winArea * mediumStarsDensity;
  let largeStarsCount = winArea * largeStarsDensity;
  stars = [];
  for (let i = 0; i < smallStarsCount; i++) {
    stars.push(new Star(1, 30));
  }

  for (let i = 0; i < mediumStarsCount; i++) {
    stars.push(new Star(2, 20));
  }

  for (let i = 0; i < largeStarsCount; i++) {
    stars.push(new Star(3, 10));
  }
}

function drawStars(delta) {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  for (let i = 0; i < stars.length; i++) {
    stars[i].animate(delta);
  }
}

function paintLoop(timestamp) {
  let delta = (timestamp - lastPaintTime) / 1000;
  if (delta > 0.05) {
    delta = 0.05;
  }
  drawStars(delta);
  lastPaintTime = timestamp;
  rafId = requestAnimationFrame(paintLoop);
}

// Pause the animation when the tab is hidden; resume when it becomes visible.
document.addEventListener("visibilitychange", function () {
  if (document.hidden) {
    stopLoop();
  } else {
    lastPaintTime = 0; // avoid a large delta jump on resume
    startLoop();
  }
});

ready(function () {
  initializeBackground();
});

function fadeIn(element, duration, callback) {
  element.style.opacity = 0;
  element.style.display = "block";

  let startTime = Date.now();
  let tick = function () {
    let newOpacity = (Date.now() - startTime) / duration;
    if (newOpacity > 1) {
      newOpacity = 1;
      callback && callback();
    } else {
      (window.requestAnimationFrame && requestAnimationFrame(tick)) || setTimeout(tick, 16);
    }

    element.style.opacity = newOpacity;
  };
  tick();
}

//http://youmightnotneedjquery.com/
function ready(fn) {
  if (document.attachEvent ? document.readyState === "complete" : document.readyState !== "loading") {
    fn();
  } else {
    document.addEventListener("DOMContentLoaded", fn);
  }
}

// navbar toggle (replaces Bootstrap's collapse plugin)
const navToggle = document.querySelector("#navToggle");
const navMenu = document.querySelector("#navbarNav");

if (navToggle && navMenu) {
  navToggle.addEventListener("click", () => {
    const isOpen = navMenu.classList.toggle("hidden") === false;
    navToggle.setAttribute("aria-expanded", String(isOpen));
  });
}

let navLinks = document.querySelectorAll(".nav-link");
navLinks.forEach((navItem) => {
  navItem.addEventListener("click", hideNavBar);
});

function hideNavBar() {
  // only collapses on mobile; lg:flex keeps it visible on large screens
  if (navMenu) navMenu.classList.add("hidden");
  if (navToggle) navToggle.setAttribute("aria-expanded", "false");
}

// carousel
document.addEventListener("DOMContentLoaded", function () {
  const carousels = document.querySelectorAll(".carousel");

  carousels.forEach((carousel) => {
    const carouselImages = carousel.querySelector(".carousel-images");
    const images = carousel.querySelectorAll(".carousel-image");
    const prevButton = carousel.querySelector(".carousel-control.prev");
    const nextButton = carousel.querySelector(".carousel-control.next"); // Corrected the quotation mark here

    let currentIndex = 0;
    const imageCount = images.length;

    function updateCarousel() {
      const offset = -currentIndex * 100;
      carouselImages.style.transform = `translateX(${offset}%)`;
    }

    function showNextImage() {
      currentIndex = (currentIndex + 1) % imageCount; // Move to the next image
      updateCarousel();
    }

    function showPreviousImage() {
      currentIndex = (currentIndex - 1 + imageCount) % imageCount; // Move to the previous image
      updateCarousel();
    }

    prevButton.addEventListener("click", showPreviousImage);
    nextButton.addEventListener("click", showNextImage);

    // Initialize the carousel
    updateCarousel();
  });
});

// card animation

document.addEventListener("DOMContentLoaded", () => {
  const cards = document.querySelectorAll(".card");

  const observerOptions = {
    root: null, // Use the viewport as the root
    rootMargin: "0px",
    threshold: 0.02,
  };

  const observer = new IntersectionObserver((entries, observer) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        // reveal: drop the hidden/offscreen utilities, add the visible ones
        entry.target.classList.remove("opacity-0", "-translate-x-full");
        entry.target.classList.add("opacity-100", "translate-x-0");
        observer.unobserve(entry.target); // Stop observing once the animation is triggered
      }
    });
  }, observerOptions);

  cards.forEach((card) => {
    observer.observe(card);
  });
});

// hobby image animation

document.addEventListener("DOMContentLoaded", () => {
  const target = document.querySelector(".hobby-imgs-div");

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("animate-slideInOut");
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.02 }
  );

  observer.observe(target);
});

// animation for skills bar box

document.addEventListener("DOMContentLoaded", () => {
  const skillsSection = document.querySelector(".skills-bar");

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          // fill each skill bar (fillBar keyframe reads the per-bar --final-width var)
          document.querySelectorAll(".level").forEach((level) => {
            level.classList.add("animate-fillBar");
          });
          // Once animated, we can unobserve the element if we only want the animation to happen once
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.1 }
  ); // Adjust the threshold as needed

  observer.observe(skillsSection);
});

/* contact email tooltip — reveal on tap/click (hover & keyboard focus handled by CSS) */

document.addEventListener("DOMContentLoaded", () => {
  const emailReveal = document.querySelector(".email-reveal");
  if (!emailReveal) return;

  emailReveal.addEventListener("click", () => {
    emailReveal.classList.toggle("show-tooltip");
  });

  // Hide the tooltip when tapping/clicking anywhere outside the email
  document.addEventListener("click", (event) => {
    if (!emailReveal.contains(event.target)) {
      emailReveal.classList.remove("show-tooltip");
    }
  });
});


