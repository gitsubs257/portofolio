/* ============================================================
   SUBASH — Premium portfolio interactions
   Works with the supplied index.html and style.css.
   ============================================================ */

document.addEventListener("DOMContentLoaded", () => {
  const body = document.body;
  const loader = document.getElementById("loader");
  const progress = document.getElementById("progress");
  const topButton = document.getElementById("top");
  const cursor = document.querySelector(".cursor");
  const navLinks = [...document.querySelectorAll("nav a[href^='#']")];
  const motionSafe = !window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* Loading screen */
  const finishLoading = () => {
    body.classList.add("loaded");
    window.setTimeout(() => loader?.remove(), 900);
  };

  if (document.readyState === "complete") {
    window.setTimeout(finishLoading, 450);
  } else {
    window.addEventListener("load", () => window.setTimeout(finishLoading, 450), {
      once: true,
    });
  }

  /* Smooth scroll for navigation and hero buttons */
  document.querySelectorAll('a[href^="#"]').forEach((link) => {
    link.addEventListener("click", (event) => {
      const id = link.getAttribute("href");
      const target = id ? document.querySelector(id) : null;

      if (!target) return;

      event.preventDefault();
      target.scrollIntoView({ behavior: "smooth", block: "start" });
    });
  });

  /* Scroll progress, active nav state, and lightweight scroll motion */
  const sections = [...document.querySelectorAll("section[id]")];
  const scrollMotionTargets = [
    ...document.querySelectorAll(".hero, .heroGlow, .aboutCard, .skill, .card, form, .contact-profiles"),
  ];
  let scrollFrame = 0;
  let cachedHeight = 1;

  const refreshScrollMetrics = () => {
    cachedHeight = Math.max(1, document.documentElement.scrollHeight - window.innerHeight);
  };

  const updateActiveNav = () => {
    let activeId = "";
    const marker = window.scrollY + window.innerHeight * 0.38;

    sections.forEach((section) => {
      if (marker >= section.offsetTop) activeId = section.id;
    });

    navLinks.forEach((link) => {
      link.classList.toggle("active", link.getAttribute("href") === `#${activeId}`);
    });
  };

  const updateScrollUI = () => {
    const scrollableHeight = document.documentElement.scrollHeight - window.innerHeight;
    const percentage = scrollableHeight > 0 ? (window.scrollY / cachedHeight) * 100 : 0;

    progress?.style.setProperty("--progress", `${Math.min(100, percentage)}%`);
    topButton?.classList.toggle("visible", window.scrollY > 500);

    if (motionSafe) {
      const scrollRatio = Math.min(1, window.scrollY / cachedHeight);
      body.style.setProperty("--scroll-ratio", `${scrollRatio}`);
      body.style.setProperty("--grid-a-x", `${(scrollRatio * 80).toFixed(1)}px`);
      body.style.setProperty("--grid-a-y", `${(scrollRatio * -120).toFixed(1)}px`);
      body.style.setProperty("--grid-b-x", `${(scrollRatio * -90).toFixed(1)}px`);
      body.style.setProperty("--grid-b-y", `${(scrollRatio * 70).toFixed(1)}px`);

      scrollMotionTargets.forEach((element) => {
        const rect = element.getBoundingClientRect();
        const centerOffset = (rect.top + rect.height / 2 - window.innerHeight / 2) / window.innerHeight;
        const clampedOffset = Math.max(-1, Math.min(1, centerOffset));
        element.style.setProperty("--scroll-shift", `${(-clampedOffset * 18).toFixed(2)}px`);
        element.style.setProperty("--scroll-depth", `${(1 - Math.abs(clampedOffset) * 0.14).toFixed(3)}`);
      });
    }

    updateActiveNav();
    scrollFrame = 0;
  };

  const scheduleScrollUI = () => {
    if (!scrollFrame) scrollFrame = window.requestAnimationFrame(updateScrollUI);
  };

  refreshScrollMetrics();
  updateScrollUI();
  window.addEventListener("scroll", scheduleScrollUI, { passive: true });
  window.addEventListener(
    "resize",
    () => {
      refreshScrollMetrics();
      scheduleScrollUI();
    },
    { passive: true },
  );

  topButton?.addEventListener("click", () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  });

  /* Custom cursor and pointer glow */
  const finePointer = window.matchMedia("(pointer: fine)");

  const enableCursor = () => {
    if (!cursor || !finePointer.matches) return;

    let cursorFrame = 0;
    let x = -100;
    let y = -100;

    const drawCursor = () => {
      cursor.style.setProperty("--cursor-x", `${x}px`);
      cursor.style.setProperty("--cursor-y", `${y}px`);
      cursorFrame = 0;
    };

    window.addEventListener(
      "pointermove",
      (event) => {
        x = event.clientX;
        y = event.clientY;

        if (!cursorFrame) cursorFrame = window.requestAnimationFrame(drawCursor);
      },
      { passive: true },
    );

    document.querySelectorAll("a, button, input, textarea").forEach((element) => {
      element.addEventListener("pointerenter", () => cursor.classList.add("hover"));
      element.addEventListener("pointerleave", () => cursor.classList.remove("hover"));
    });
  };

  enableCursor();

  /* Mouse spotlight. The update is throttled so fast mouse movement stays smooth. */
  let spotlightFrame = 0;
  let spotlightX = window.innerWidth / 2;
  let spotlightY = window.innerHeight / 2;

  const drawSpotlight = () => {
    body.style.setProperty("--mouse-x", `${spotlightX}px`);
    body.style.setProperty("--mouse-y", `${spotlightY}px`);
    spotlightFrame = 0;
  };

  window.addEventListener(
    "pointermove",
    (event) => {
      spotlightX = event.clientX;
      spotlightY = event.clientY;
      if (!spotlightFrame) spotlightFrame = window.requestAnimationFrame(drawSpotlight);
    },
    { passive: true },
  );

  /* Rotating role line in hero */
  const typingTarget = document.querySelector(".typing");
  const roles = [
    "Full Stack Developer",
    "MERN Stack Developer",
    "Creative UI Designer",
    "Problem Solver",
  ];

  if (typingTarget) {
    const typingSpeed = 70;
    const deletingSpeed = 38;
    const holdAfterTyping = 1600;
    const holdAfterDeleting = 280;
    let roleIndex = 0;
    let characterIndex = 0;
    let deleting = false;

    const typeRole = () => {
      const currentRole = roles[roleIndex];

      if (!deleting) {
        characterIndex += 1;
        typingTarget.textContent = currentRole.slice(0, characterIndex);

        if (characterIndex === currentRole.length) {
          deleting = true;
          window.setTimeout(typeRole, holdAfterTyping);
          return;
        }

        window.setTimeout(typeRole, typingSpeed);
        return;
      }

      characterIndex -= 1;
      typingTarget.textContent = currentRole.slice(0, characterIndex);

      if (characterIndex === 0) {
        deleting = false;
        roleIndex = (roleIndex + 1) % roles.length;
        window.setTimeout(typeRole, holdAfterDeleting);
        return;
      }

      window.setTimeout(typeRole, deletingSpeed);
    };

    window.setTimeout(typeRole, 700);
  }

  /* Scroll reveal setup. Existing reveal classes are also supported. */
  const revealTargets = [...document.querySelectorAll(".title, .aboutCard, .skill, .card, form, .profile-card")];

  revealTargets.forEach((element, index) => {
    if (!element.classList.contains("reveal")) {
      element.classList.add("reveal");
    }

    element.style.setProperty("--reveal-index", index % 8);

    if (element.classList.contains("skill") || element.classList.contains("card") || element.classList.contains("profile-card")) {
      element.style.transitionDelay = `${(index % 6) * 55}ms`;
    }
  });

  const revealObserver = new IntersectionObserver(
    (entries, observer) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;

        entry.target.classList.add("show");
        observer.unobserve(entry.target);
      });
    },
    { threshold: 0.12, rootMargin: "0px 0px -25px" },
  );

  revealTargets.forEach((target) => revealObserver.observe(target));

  /* Subtle 3D project-card tilt, disabled on touch-only devices. */
  if (finePointer.matches) {
    document.querySelectorAll(".card").forEach((card) => {
      card.addEventListener("pointermove", (event) => {
        const bounds = card.getBoundingClientRect();
        const horizontal = (event.clientX - bounds.left) / bounds.width - 0.5;
        const vertical = (event.clientY - bounds.top) / bounds.height - 0.5;
        const rotateX = vertical * -6;
        const rotateY = horizontal * 7;

        card.style.transform = `translateY(-10px) rotateX(${rotateX}deg) rotateY(${rotateY}deg)`;
      });

      card.addEventListener("pointerleave", () => {
        card.style.removeProperty("transform");
      });
    });
  }

  /* Contact form: visual success state without assuming a back-end endpoint. */
  const form = document.querySelector("#contact form");

  form?.addEventListener("submit", (event) => {
    event.preventDefault();

    const submitButton = form.querySelector("button");
    if (!submitButton) return;

    const originalText = submitButton.textContent;
    submitButton.textContent = "Message Ready ✓";
    submitButton.disabled = true;

    window.setTimeout(() => {
      submitButton.textContent = originalText;
      submitButton.disabled = false;
      form.reset();
    }, 2100);
  });
});
