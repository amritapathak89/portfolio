// Portfolio interactions — starfield, carousel, scroll reveals, navbar, email tooltip, scroll-to-top.
// Wrapped in an IIFE so nothing leaks onto `window`. Loaded with `defer`, so the
// DOM is fully parsed by the time this runs; a single ready() drives all init.
(function () {
  "use strict";

  // --- Starfield background ---
  let canvas;
  let ctx;
  let stars = [];
  let lastPaintTime = 0;
  let rafId = null;
  let resizeTimeout = null;

  function initializeBackground() {
    canvas = document.getElementById("stars");
    if (!canvas) return;
    ctx = canvas.getContext("2d"); // cache the 2D context once
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    // Trailing debounce: re-init stars only once the user stops resizing.
    window.addEventListener("resize", function () {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      canvas.style.display = "none";
      clearTimeout(resizeTimeout);
      resizeTimeout = setTimeout(function () {
        fadeIn(canvas, 500);
        initializeStars();
      }, 500);
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
    const winArea = window.innerWidth * window.innerHeight;
    const smallStarsCount = winArea * 0.0001;
    const mediumStarsCount = winArea * 0.00005;
    const largeStarsCount = winArea * 0.00002;
    stars = [];
    for (let i = 0; i < smallStarsCount; i++) stars.push(new Star(1, 30));
    for (let i = 0; i < mediumStarsCount; i++) stars.push(new Star(2, 20));
    for (let i = 0; i < largeStarsCount; i++) stars.push(new Star(3, 10));
  }

  function drawStars(delta) {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    for (let i = 0; i < stars.length; i++) {
      stars[i].animate(delta);
    }
  }

  function paintLoop(timestamp) {
    let delta = (timestamp - lastPaintTime) / 1000;
    if (delta > 0.05) delta = 0.05;
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

  function fadeIn(element, duration, callback) {
    element.style.opacity = 0;
    element.style.display = "block";

    const startTime = Date.now();
    const tick = function () {
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

  // http://youmightnotneedjquery.com/
  function ready(fn) {
    if (document.readyState !== "loading") {
      fn();
    } else {
      document.addEventListener("DOMContentLoaded", fn);
    }
  }

  // --- Navbar toggle (replaces Bootstrap's collapse plugin) ---
  function initNavbar() {
    const navToggle = document.querySelector("#navToggle");
    const navMenu = document.querySelector("#navbarNav");
    if (!navToggle || !navMenu) return;

    navToggle.addEventListener("click", () => {
      const isOpen = navMenu.classList.toggle("hidden") === false;
      navToggle.setAttribute("aria-expanded", String(isOpen));
    });

    // Collapse on link click (mobile only; lg:flex keeps it visible on large screens).
    document.querySelectorAll(".nav-link").forEach((navItem) => {
      navItem.addEventListener("click", () => {
        navMenu.classList.add("hidden");
        navToggle.setAttribute("aria-expanded", "false");
      });
    });
  }

  // --- Carousels ---
  function initCarousels() {
    document.querySelectorAll(".carousel").forEach((carousel) => {
      const carouselImages = carousel.querySelector(".carousel-images");
      const images = carousel.querySelectorAll(".carousel-image");
      const prevButton = carousel.querySelector(".carousel-control.prev");
      const nextButton = carousel.querySelector(".carousel-control.next");
      const imageCount = images.length;
      let currentIndex = 0;

      // A11y: announce the carousel as a keyboard-operable group with a
      // live region that reports the current slide. Single-image cards need
      // none of this, so only enhance real (multi-image) carousels.
      const multi = imageCount > 1;
      let status = null;
      if (multi) {
        carousel.setAttribute("role", "group");
        carousel.setAttribute("aria-roledescription", "carousel");
        if (!carousel.hasAttribute("aria-label")) {
          carousel.setAttribute("aria-label", "Project screenshots");
        }
        carousel.setAttribute("tabindex", "0");

        status = document.createElement("p");
        status.className = "sr-only";
        status.setAttribute("aria-live", "polite");
        carousel.appendChild(status);
      }

      function update() {
        carouselImages.style.transform = `translateX(${-currentIndex * 100}%)`;
        if (status) status.textContent = `Image ${currentIndex + 1} of ${imageCount}`;
      }

      function next() {
        currentIndex = (currentIndex + 1) % imageCount;
        update();
      }
      function prev() {
        currentIndex = (currentIndex - 1 + imageCount) % imageCount;
        update();
      }

      if (nextButton) nextButton.addEventListener("click", next);
      if (prevButton) prevButton.addEventListener("click", prev);

      if (multi) {
        carousel.addEventListener("keydown", (event) => {
          if (event.key === "ArrowRight") {
            event.preventDefault();
            next();
          } else if (event.key === "ArrowLeft") {
            event.preventDefault();
            prev();
          }
        });
      }

      update();
    });
  }

  // --- Scroll-triggered reveals (cards, hobby strip, skill bars) ---
  function initReveals() {
    const cardObserver = new IntersectionObserver(
      (entries, observer) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.remove("opacity-0", "-translate-x-full");
            entry.target.classList.add("opacity-100", "translate-x-0");
            observer.unobserve(entry.target);
          }
        });
      },
      { root: null, rootMargin: "0px", threshold: 0.02 }
    );
    document.querySelectorAll(".card").forEach((card) => cardObserver.observe(card));

    const hobby = document.querySelector(".hobby-imgs-div");
    if (hobby) {
      const hobbyObserver = new IntersectionObserver(
        (entries, observer) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              entry.target.classList.add("animate-slideInOut");
              observer.unobserve(entry.target);
            }
          });
        },
        { threshold: 0.02 }
      );
      hobbyObserver.observe(hobby);
    }

    const skillsSection = document.querySelector(".skills-bar");
    if (skillsSection) {
      const skillsObserver = new IntersectionObserver(
        (entries, observer) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              document
                .querySelectorAll(".level")
                .forEach((level) => level.classList.add("animate-fillBar"));
              observer.unobserve(entry.target);
            }
          });
        },
        { threshold: 0.1 }
      );
      skillsObserver.observe(skillsSection);
    }
  }

  // --- Contact email tooltip (reveal on tap/click; hover & focus handled by CSS) ---
  function initEmailTooltip() {
    const emailReveal = document.querySelector(".email-reveal");
    if (!emailReveal) return;

    emailReveal.addEventListener("click", () => {
      emailReveal.classList.toggle("show-tooltip");
    });
    document.addEventListener("click", (event) => {
      if (!emailReveal.contains(event.target)) {
        emailReveal.classList.remove("show-tooltip");
      }
    });
  }

  // --- Scroll-to-top button (reveals after scrolling down; smooth scroll on click) ---
  function initScrollTop() {
    const btn = document.getElementById("scroll-top");
    if (!btn) return;

    const hidden = ["opacity-0", "invisible", "translate-y-2"];
    const shown = ["opacity-100", "visible", "translate-y-0"];

    function toggle() {
      const show = window.scrollY > 400;
      btn.classList.toggle(hidden[0], !show);
      btn.classList.toggle(hidden[1], !show);
      btn.classList.toggle(hidden[2], !show);
      btn.classList.toggle(shown[0], show);
      btn.classList.toggle(shown[1], show);
      btn.classList.toggle(shown[2], show);
    }

    btn.addEventListener("click", () => {
      const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      window.scrollTo({ top: 0, behavior: reduce ? "auto" : "smooth" });
    });
    window.addEventListener("scroll", toggle, { passive: true });
    toggle();
  }

  ready(function () {
    initializeBackground();
    initNavbar();
    initCarousels();
    initReveals();
    initEmailTooltip();
    initScrollTop();
  });
})();
