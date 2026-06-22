// Portfolio interactions — starfield, carousel, scroll reveals, navbar, email tooltip, scroll-to-top.
// Wrapped in an IIFE so nothing leaks onto `window`. Loaded with `defer`, so the
// DOM is fully parsed by the time this runs; a single ready() drives all init.
(function () {
  "use strict";

  // --- i18n (language switching) ---
  // English text lives in index.html as the no-JS fallback. French (and a
  // refresh of English) is applied by swapping textContent / attributes of
  // [data-i18n*] elements. Prose with inline markup is wrapped in <span> in
  // the HTML so every value here stays plain text.
  const LANG_KEY = "lang";
  const SUPPORTED_LANGS = ["en", "fr"];
  let currentLang = "en";
  const carouselUpdaters = []; // re-localise each carousel's a11y labels on change

  const translations = {
    en: {
      "nav.about": "About",
      "nav.work": "My Work",
      "nav.blog": "Blog",
      "nav.contact": "Contact",

      "hero.designer": "Designer",
      "hero.designerDesc": "Product designer specialising in UX, UI & UML design",
      "hero.coder": "Coder",
      "hero.coderDesc": "Full stack developer who writes clean, elegant and efficient code",

      "work.heading": "Some of my latest Work",
      "work.viewProject": "View Project",
      "work.private": "This is a private project",
      "work.speedily.title": "Designed & Developed a delivery app",
      "work.speedily.desc": "Made a fully functional, secure PWA from scratch",
      "work.justhomes.title": "Built a Lead generation Website",
      "work.justhomes.desc": "Worked on a website for generating leads for a real estate company",
      "work.pdf.title": "A ready to use PDF Utility App",
      "work.pdf.desc": "A classic desktop application that compresses PDF size",
      "work.wikistage.title": "Worked as a freelancer for Wikistage",
      "work.wikistage.desc": "Helped in enhancing the seo and testing the site",
      "work.travaux.title": "Developed a Work and Services App",
      "work.travaux.desc": "A website that allows you to book services online",
      "work.brasserie.title": "Designed an elegant Website for a Client",
      "work.brasserie.desc": "A minimalistic yet sophisticated Brasserie Website for a client which offers menu and booking details.",
      "work.hdm.title": "Worked on a Dashboard for HDM Network",
      "work.hdm.desc": "A fully functional mobile and desktop version of a logistics app",
      "work.video.title": "Created a Video Convertor App",
      "work.video.desc": "A light desktop app that allows you to convert videos into AVI, MP4, MOV format",

      "about.heading": "About Me",
      "about.subheading": "Passionate Front-End Developer",
      "about.bio1": "With over 5 years of professional experience, I specialize in creating dynamic, responsive web applications with a strong focus on user experience and performance optimization. Leveraging trending technologies, I build scalable and maintainable solutions. My journey in web development began in 2018, transforming a hobby into a rewarding career. Based in Grand Paris, France, I thrive on integrating APIs, implementing state management libraries, and utilizing modern development tools to deliver high-quality code. I also blog occasionally for ",
      "about.bio2": ". Let's build something amazing together!",

      "hobbies.heading": "When I'm not Developing I'm ...",

      "strengths.designerHeading": "Strengths as a Designer",
      "strengths.creative": "Creative",
      "strengths.attentive": "Attentive",
      "strengths.detail": "Detail Oriented",
      "strengths.coderHeading": "Traits as a Coder",
      "strengths.meticulous": "Meticulous",
      "strengths.team": "Team Player",
      "strengths.problem": "Problem solver",

      "edu.heading": "Education",
      "edu.2023": "Pursued a full time course in Web Designing and Web Development from G2R, Paris France.",
      "edu.2022": "Successfully completed an intense Full Stack Web Developer Bootcamp from Udemy.",
      "edu.2018": "Started coding with a Diploma course in Full-stack Development from Disha Computers, India",
      "edu.2015": "Secured distinction in Master's in English Literature from Pune University, India",

      "exp.heading": "Experience",
      "exp.sc2.role": "Full-Stack Developer, SC2, France.",
      "exp.sc2.detail": "Maintain, optimise multiple WordPress e-commerce sites, and build custom Laravel & React admin dashboards (GraphQL & REST APIs) to manage orders, sales and products on our private platform. Ship AI-powered newsletters and targeted campaigns via Leadfox + internal admin tools focused on a intuitive UX.",
      "exp.sc2.tech": "Tech used: PHP, Laravel, React, Next.js, TypeScript, MySQL, GraphQL, Tailwind CSS, WordPress, Docker, GitLab CI/CD",
      "exp.hdm.role": "Full-Stack Developer, HDM Network, Belgium",
      "exp.hdm.tech": "Tech used: LAMP stack, ReactJS, Tailwind, PHP, Symfony, Apiplatform, Github, SCRUM",
      "exp.wikistage.role": "Frontend Developer (Freelance), WikiStage, Paris, FR.",
      "exp.wikistage.tech": "Tech used: LAMP stack, MongoDB, Node, NextJs",
      "exp.nine.role": "Frontend Developer, 9ONIONS CULTURE INFOTECH Pvt. Ltd, Pune, IN.",
      "exp.nine.tech": "Tech used: LAMP stack, ReactJS, Typescript, Bootstrap, Jest, Cypress, GitHub Actions",

      "skills.heading": "Skills",

      "contact.heading": "Get in touch",
      "contact.emailLabel": "Email:",
      "contact.tooltip": "My first name followed by my last name",

      "meta.title": "Amrita Vidhate - Designer - Coder",
      "meta.description": "Full Stack Junior Developer trained in conception, designing and building a website. Well-versed in Latest Technological Frameworks",

      "a11y.langSwitcher": "Choose language",
      "a11y.navToggle": "Toggle navigation",
      "a11y.scrollTop": "Scroll back to top",
      "a11y.linkedin": "LinkedIn link",
      "a11y.github": "GitHub link",
      "a11y.facebook": "Facebook link",
      "a11y.stackoverflow": "Stack Overflow link",
      "a11y.carousel": "Project screenshots",
      "a11y.prev": "Previous image",
      "a11y.next": "Next image",
      "a11y.imageStatus": "Image {current} of {total}",

      "alt.coderGirl": "Illustration of a girl coding",
      "alt.cooking": "Cooking",
      "alt.reading": "Reading",
      "alt.craft": "Diy-art-craft",
      "alt.travel": "Travelling",
      "alt.devIllustration": "Illustration of a developer",
    },
    fr: {
      "nav.about": "À propos",
      "nav.work": "Projets",
      "nav.blog": "Blog",
      "nav.contact": "Contact",

      "hero.designer": "Designer",
      "hero.designerDesc": "Product designer spécialisée en conception UX, UI et UML",
      "hero.coder": "Développeuse",
      "hero.coderDesc": "Développeuse full-stack qui écrit un code propre, élégant et efficace",

      "work.heading": "Quelques-uns de mes derniers projets",
      "work.viewProject": "Voir le projet",
      "work.private": "Ceci est un projet privé",
      "work.speedily.title": "Conception et développement d'une application de livraison",
      "work.speedily.desc": "Création d'une PWA sécurisée et entièrement fonctionnelle, de A à Z",
      "work.justhomes.title": "Création d'un site de génération de leads",
      "work.justhomes.desc": "Développement d'un site de génération de leads pour une agence immobilière",
      "work.pdf.title": "Une application utilitaire PDF prête à l'emploi",
      "work.pdf.desc": "Une application de bureau classique qui compresse la taille des PDF",
      "work.wikistage.title": "Mission en freelance pour Wikistage",
      "work.wikistage.desc": "Amélioration du référencement (SEO) et tests du site",
      "work.travaux.title": "Développement d'une application de travaux et services",
      "work.travaux.desc": "Un site qui permet de réserver des services en ligne",
      "work.brasserie.title": "Conception d'un site élégant pour un client",
      "work.brasserie.desc": "Un site de brasserie minimaliste et raffiné pour un client, présentant le menu et les réservations.",
      "work.hdm.title": "Développement d'un tableau de bord pour HDM Network",
      "work.hdm.desc": "Une application logistique entièrement fonctionnelle, en versions mobile et bureau",
      "work.video.title": "Création d'une application de conversion vidéo",
      "work.video.desc": "Une application de bureau légère pour convertir des vidéos aux formats AVI, MP4 et MOV",

      "about.heading": "À propos de moi",
      "about.subheading": "Développeuse Front-End passionnée",
      "about.bio1": "Forte de plus de 5 ans d'expérience professionnelle, je me spécialise dans la création d'applications web dynamiques et responsives, en mettant l'accent sur l'expérience utilisateur et l'optimisation des performances. En m'appuyant sur les technologies actuelles, je conçois des solutions évolutives et maintenables. Mon parcours dans le développement web a commencé en 2018, transformant un loisir en une carrière épanouissante. Basée dans le Grand Paris, en France, j'aime intégrer des API, mettre en œuvre des bibliothèques de gestion d'état et utiliser des outils de développement modernes pour livrer un code de haute qualité. Je blogue aussi de temps en temps pour ",
      "about.bio2": ". Construisons ensemble quelque chose d'extraordinaire !",

      "hobbies.heading": "Quand je ne développe pas, je…",

      "strengths.designerHeading": "Mes atouts en tant que designer",
      "strengths.creative": "Créative",
      "strengths.attentive": "Attentive",
      "strengths.detail": "Souci du détail",
      "strengths.coderHeading": "Mes qualités en tant que développeuse",
      "strengths.meticulous": "Méticuleuse",
      "strengths.team": "Esprit d'équipe",
      "strengths.problem": "Résolution de problèmes",

      "edu.heading": "Formation",
      "edu.2023": "Formation à temps plein en web design et développement web chez G2R, Paris, France.",
      "edu.2022": "Bootcamp intensif de développeuse web full-stack réussi sur Udemy.",
      "edu.2018": "Débuts en programmation avec un diplôme en développement full-stack chez Disha Computers, Inde.",
      "edu.2015": "Master en littérature anglaise obtenu avec mention à l'université de Pune, Inde.",

      "exp.heading": "Expérience",
      "exp.sc2.role": "Développeuse Full-Stack, SC2, France.",
      "exp.sc2.detail": "Maintenance et optimisation de plusieurs sites e-commerce WordPress, et création de tableaux de bord d'administration sur mesure en Laravel & React (API GraphQL & REST) pour gérer les commandes, les ventes et les produits sur notre plateforme privée. Déploiement de newsletters propulsées par l'IA et de campagnes ciblées via Leadfox, ainsi que d'outils d'administration internes axés sur une UX intuitive.",
      "exp.sc2.tech": "Technologies : PHP, Laravel, React, Next.js, TypeScript, MySQL, GraphQL, Tailwind CSS, WordPress, Docker, GitLab CI/CD",
      "exp.hdm.role": "Développeuse Full-Stack, HDM Network, Belgique",
      "exp.hdm.tech": "Technologies : stack LAMP, ReactJS, Tailwind, PHP, Symfony, API Platform, GitHub, SCRUM",
      "exp.wikistage.role": "Développeuse Frontend (Freelance), WikiStage, Paris, FR.",
      "exp.wikistage.tech": "Technologies : stack LAMP, MongoDB, Node, NextJs",
      "exp.nine.role": "Développeuse Frontend, 9ONIONS CULTURE INFOTECH Pvt. Ltd, Pune, IN.",
      "exp.nine.tech": "Technologies : stack LAMP, ReactJS, Typescript, Bootstrap, Jest, Cypress, GitHub Actions",

      "skills.heading": "Compétences",

      "contact.heading": "Contactez-moi",
      "contact.emailLabel": "E-mail :",
      "contact.tooltip": "Mon prénom suivi de mon nom",

      "meta.title": "Amrita Vidhate - Designer & Développeuse",
      "meta.description": "Développeuse full-stack spécialisée en conception, design et création de sites web. Maîtrise des frameworks technologiques les plus récents.",

      "a11y.langSwitcher": "Choisir la langue",
      "a11y.navToggle": "Afficher ou masquer la navigation",
      "a11y.scrollTop": "Revenir en haut",
      "a11y.linkedin": "Lien LinkedIn",
      "a11y.github": "Lien GitHub",
      "a11y.facebook": "Lien Facebook",
      "a11y.stackoverflow": "Lien Stack Overflow",
      "a11y.carousel": "Captures d'écran du projet",
      "a11y.prev": "Image précédente",
      "a11y.next": "Image suivante",
      "a11y.imageStatus": "Image {current} sur {total}",

      "alt.coderGirl": "Illustration d'une fille en train de coder",
      "alt.cooking": "Cuisine",
      "alt.reading": "Lecture",
      "alt.craft": "Bricolage et loisirs créatifs",
      "alt.travel": "Voyages",
      "alt.devIllustration": "Illustration d'une développeuse",
    },
  };

  function getStoredLang() {
    try {
      const saved = localStorage.getItem(LANG_KEY);
      return SUPPORTED_LANGS.indexOf(saved) !== -1 ? saved : null;
    } catch (e) {
      return null; // localStorage can throw in private mode / sandboxed iframes
    }
  }

  // localStorage wins; otherwise fall back to the browser's preferred languages.
  function detectBrowserLang() {
    const list = navigator.languages || [navigator.language || ""];
    for (let i = 0; i < list.length; i++) {
      if (list[i] && list[i].toLowerCase().indexOf("fr") === 0) return "fr";
    }
    return "en";
  }

  function resolveInitialLang() {
    return getStoredLang() || detectBrowserLang();
  }

  function t(key) {
    const dict = translations[currentLang] || translations.en;
    if (dict[key] != null) return dict[key];
    if (translations.en[key] != null) return translations.en[key];
    return key; // last resort: surface the missing key instead of throwing
  }

  function applyAttr(dataAttr, targetAttr) {
    document.querySelectorAll("[" + dataAttr + "]").forEach((el) => {
      el.setAttribute(targetAttr, t(el.getAttribute(dataAttr)));
    });
  }

  function applyLang(lang) {
    if (SUPPORTED_LANGS.indexOf(lang) === -1) lang = "en";
    currentLang = lang;
    document.documentElement.lang = lang;

    document.querySelectorAll("[data-i18n]").forEach((el) => {
      el.textContent = t(el.getAttribute("data-i18n"));
    });
    applyAttr("data-i18n-content", "content");
    applyAttr("data-i18n-aria", "aria-label");
    applyAttr("data-i18n-alt", "alt");

    updateLangUI(lang);
    carouselUpdaters.forEach((fn) => fn());
  }

  function setLang(lang) {
    try {
      localStorage.setItem(LANG_KEY, lang);
    } catch (e) {
      /* ignore persistence failures */
    }
    applyLang(lang);
  }

  function updateLangUI(lang) {
    const current = document.getElementById("langCurrent");
    if (current) current.textContent = lang.toUpperCase();
    document.querySelectorAll("#langMenu [data-lang]").forEach((item) => {
      const active = item.getAttribute("data-lang") === lang;
      item.setAttribute("aria-checked", String(active));
      const check = item.querySelector(".lang-check");
      if (check) check.classList.toggle("invisible", !active);
    });
  }

  // --- Language switcher (globe dropdown) ---
  function initLangSwitcher() {
    const wrap = document.getElementById("langSwitcher");
    const button = document.getElementById("langButton");
    const menu = document.getElementById("langMenu");
    if (!wrap || !button || !menu) return;

    const openMenu = () => {
      menu.classList.remove("hidden");
      button.setAttribute("aria-expanded", "true");
    };
    const closeMenu = () => {
      menu.classList.add("hidden");
      button.setAttribute("aria-expanded", "false");
    };

    button.addEventListener("click", (event) => {
      event.stopPropagation();
      if (menu.classList.contains("hidden")) openMenu();
      else closeMenu();
    });

    menu.querySelectorAll("[data-lang]").forEach((item) => {
      item.addEventListener("click", () => {
        setLang(item.getAttribute("data-lang"));
        closeMenu();
        button.focus();
      });
    });

    document.addEventListener("click", (event) => {
      if (!wrap.contains(event.target)) closeMenu();
    });
    document.addEventListener("keydown", (event) => {
      if (event.key === "Escape" && !menu.classList.contains("hidden")) {
        closeMenu();
        button.focus();
      }
    });
  }

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
        carousel.setAttribute("tabindex", "0");

        status = document.createElement("p");
        status.className = "sr-only";
        status.setAttribute("aria-live", "polite");
        carousel.appendChild(status);
      }

      // (Re)apply the localised a11y labels for the current slide + language.
      function applyLabels() {
        if (multi) {
          carousel.setAttribute("aria-label", t("a11y.carousel"));
          if (status) {
            status.textContent = t("a11y.imageStatus")
              .replace("{current}", String(currentIndex + 1))
              .replace("{total}", String(imageCount));
          }
        }
        if (prevButton) prevButton.setAttribute("aria-label", t("a11y.prev"));
        if (nextButton) nextButton.setAttribute("aria-label", t("a11y.next"));
      }

      function update() {
        carouselImages.style.transform = `translateX(${-currentIndex * 100}%)`;
        applyLabels();
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

      // Re-localise this carousel's labels whenever the language changes.
      carouselUpdaters.push(applyLabels);

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
    // Resolve + apply language first so static text is correct before the
    // rest of the UI initialises (carousels then build with the right labels).
    applyLang(resolveInitialLang());
    initializeBackground();
    initNavbar();
    initLangSwitcher();
    initCarousels();
    initReveals();
    initEmailTooltip();
    initScrollTop();
  });
})();
