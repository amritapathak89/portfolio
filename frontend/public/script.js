ready(function () {
  initializeBackground();
});

let resizeTimeout;
let resizeCooldown = 500;
let lastResizeTime = Date.now();
function initializeBackground() {
  canvas = document.getElementById("stars");
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
  window.addEventListener("resize", function () {
    if (Date.now() - lastResizeTime < resizeCooldown && resizeTimeout) {
      clearTimeout(resizeTimeout);
      delete resizeTimeout;
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
  (window.requestAnimationFrame && requestAnimationFrame(paintLoop)) || setTimeout(paintLoop, ms);
}

let canvas;
let stars = [];

function rand(max) {
  return Math.random() * max;
}

function Star(canvas, size, speed) {
  this.ctx = canvas.getContext("2d");
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
  this.ctx.fillStyle = "#ffffff";
  this.ctx.fillRect(this.x, this.y, this.size, this.size);
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
    stars.push(new Star(canvas, 1, 30));
  }

  for (let i = 0; i < mediumStarsCount; i++) {
    stars.push(new Star(canvas, 2, 20));
  }

  for (let i = 0; i < largeStarsCount; i++) {
    stars.push(new Star(canvas, 3, 10));
  }
}

function drawStars(delta) {
  for (let i = 0; i < stars.length; i++) {
    stars[i].animate(delta);
  }
}

let ms = 16;
let lastPaintTime = 0;
function paintLoop(timestamp) {
  canvas.getContext("2d").clearRect(0, 0, canvas.width, canvas.height);
  let delta = (window.requestAnimationFrame ? timestamp - lastPaintTime : ms) / 1000;
  if (delta > 0.05) {
    delta = 0.05;
  }
  drawStars(delta);
  (window.requestAnimationFrame && requestAnimationFrame(paintLoop)) || setTimeout(paintLoop, ms);
  lastPaintTime = timestamp;
}

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

let navLinks = document.querySelectorAll(".nav-link");
navLinks.forEach((navItem) => {
  navItem.addEventListener("click", hideNavBar);
});

function hideNavBar() {
  let removeClass = document.querySelector("#navbarNav");
  removeClass.classList.remove("show");
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
        entry.target.classList.add("slide-in");
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
          // Add animation class to each skillbox
          document.querySelectorAll(".skillbox").forEach((skillbox) => {
            skillbox.classList.add("animate");
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

/* form-submit */

document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("contactForm");

  form.addEventListener("submit", async (event) => {
    event.preventDefault();

    const formData = {
      name: document.getElementById("name").value,
      email: document.getElementById("email").value,
      company: document.getElementById("company").value,
      phone: document.getElementById("phone").value,
      message: document.getElementById("message").value,
    };

    try {
      const response = await fetch("http://localhost:8000/submit-form", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        const result = await response.json();
        alert(result.message);
        form.reset();
      } else {
        const error = await response.json();
        alert(`Error: ${error.message}`);
      }
    } catch (error) {
      console.error("Error submitting form:", error);
      alert("An error occurred while submitting the form.");
    }
  });
});


