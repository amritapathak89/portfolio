ready(function() {
  initializeBackground();
});

let resizeTimeout;
let resizeCooldown = 500;
let lastResizeTime = Date.now();
function initializeBackground() {
  canvas = document.getElementById("stars");
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
  window.addEventListener("resize", function() {
    if (Date.now() - lastResizeTime < resizeCooldown && resizeTimeout) {
      clearTimeout(resizeTimeout);
      delete resizeTimeout;
    }

    lastResizeTime = Date.now();
    canvas.style.display = "none";
    resizeTimeout = setTimeout(function() {
      fadeIn(canvas, 500);
      initializeStars();
    }, 500);
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
  });
  initializeStars();
  (window.requestAnimationFrame && requestAnimationFrame(paintLoop)) ||
    setTimeout(paintLoop, ms);
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

Star.prototype.animate = function(delta) {
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
  let delta =
    (window.requestAnimationFrame ? timestamp - lastPaintTime : ms) / 1000;
  if(delta > 0.05){
    delta = 0.05;
  }
  drawStars(delta);
  (window.requestAnimationFrame && requestAnimationFrame(paintLoop)) ||
    setTimeout(paintLoop, ms);
  lastPaintTime = timestamp;
}

function fadeIn(element, duration, callback) {
  element.style.opacity = 0;
  element.style.display = "block";

  let startTime = Date.now();
  let tick = function() {
    let newOpacity = (Date.now() - startTime) / duration;
    if (newOpacity > 1) {
      newOpacity = 1;
      callback && callback();
    } else {
      (window.requestAnimationFrame && requestAnimationFrame(tick)) ||
        setTimeout(tick, 16);
    }

    element.style.opacity = newOpacity;
  };
  tick();
}

//http://youmightnotneedjquery.com/
function ready(fn) {
  if (
    document.attachEvent
      ? document.readyState === "complete"
      : document.readyState !== "loading"
  ) {
    fn();
  } else {
    document.addEventListener("DOMContentLoaded", fn);
  }
}

let navLinks = document.querySelectorAll('.nav-link');
navLinks.forEach((navItem) => {
  navItem.addEventListener('click', hideNavBar);
});

function hideNavBar() {
  let removeClass = document.querySelector('#navbarNav');
  removeClass.classList.remove("show");
}