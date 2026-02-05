// loader.js — Custom page loader for non-home pages
// Requires GSAP (optional). Works without GSAP too.

(() => {
  const loader = document.getElementById("pageLoader");
  if (!loader) return;

  const fill = loader.querySelector(".pageLoader-barFill");
  const inner = loader.querySelector(".pageLoader-inner");

  // 1) Show immediately (in case browser cached a hidden state)
  loader.style.opacity = "1";
  loader.style.visibility = "visible";
  loader.style.pointerEvents = "all";

  // 2) Fake progress (smooth, never blocks actual load)
  let p = 0;
  const tick = () => {
    // ease up to ~92% while waiting for load
    p = Math.min(92, p + (p < 70 ? 6 : 2));
    if (fill) fill.style.width = `${p}%`;
  };
  const iv = setInterval(tick, 160);
  tick();

  function hideLoader() {
    clearInterval(iv);
    if (fill) fill.style.width = "100%";

    // Slight delay so 100% is visible
    const done = () => {
      loader.style.pointerEvents = "none";
      loader.setAttribute("aria-hidden", "true");
    };

    if (window.gsap && inner) {
      gsap.killTweensOf([loader, inner]);
      gsap.to(inner, { y: 10, opacity: 0, duration: 0.28, ease: "power2.in" });
      gsap.to(loader, {
        opacity: 0,
        duration: 0.22,
        ease: "power2.inOut",
        delay: 0.08,
        onComplete: () => {
          loader.style.visibility = "hidden";
          done();
        },
      });
    } else {
      loader.style.transition = "opacity 200ms ease";
      loader.style.opacity = "0";
      setTimeout(() => {
        loader.style.visibility = "hidden";
        done();
      }, 220);
    }
  }

  // Hide when page is ready
  window.addEventListener("load", () => {
    // small hold for cinematic feel
    setTimeout(hideLoader, 220);
  });

  // Optional: show loader when navigating internal links (page transition)
  document.addEventListener("click", (e) => {
    const a = e.target.closest("a");
    if (!a) return;

    const href = a.getAttribute("href") || "";
    const isExternal =
      a.target === "_blank" ||
      a.hasAttribute("download") ||
      href.startsWith("http") ||
      href.startsWith("mailto:") ||
      href.startsWith("tel:");

    const isHashOnly = href.startsWith("#");

    // Only for internal page nav
    if (isExternal || isHashOnly) return;

    // Show loader immediately on click
    loader.style.visibility = "visible";
    loader.style.opacity = "1";
    loader.style.pointerEvents = "all";
    loader.setAttribute("aria-hidden", "false");
    if (fill) fill.style.width = "0%";

    if (window.gsap && inner) {
      gsap.fromTo(loader, { opacity: 0 }, { opacity: 1, duration: 0.12 });
      gsap.fromTo(inner, { y: -6, opacity: 0 }, { y: 0, opacity: 1, duration: 0.18, ease: "power2.out" });
    }
  });
})();







// GSAP
gsap.registerPlugin(ScrollTrigger);

// =========================
// HEADER + TICKER DROP-IN
// =========================
const topbar = document.querySelector(".topbar");
const tickerEl = document.querySelector(".ticker");

// Start hidden above (so the "slide down" has somewhere to come from)
gsap.set([tickerEl, topbar], { y: -60, opacity: 0 });

function dropHeaderAndTicker() {
  if (!topbar && !tickerEl) return;

  // ✅ Delay is here (1 second before sliding down)
  return gsap.to([tickerEl, topbar], {
    y: 0,
    opacity: 1,
    duration: 0.6,
    ease: "power3.out",
    delay: 1, // <------------------- DELAY (1s)
  });
}

// =========================
// TICKER: pause on hover + tab hidden
// =========================
(() => {
  const t = document.querySelector(".ticker");
  if (!t) return;

  const tracks = t.querySelectorAll(".ticker-track");

  function setPlayState(state) {
    tracks.forEach((trk) => (trk.style.animationPlayState = state));
  }

  t.addEventListener("mouseenter", () => setPlayState("paused"));
  t.addEventListener("mouseleave", () => setPlayState("running"));

  document.addEventListener("visibilitychange", () => {
    setPlayState(document.hidden ? "paused" : "running");
  });
})();

// =========================
// SPLASH + HERO + MENU
// =========================
const splash = document.getElementById("splash");
const enterBtn = document.getElementById("enterBtn");

const meterBar = document.querySelector(".splash-meterBar");
const flash = document.querySelector(".splash-flash");

const hamburger = document.getElementById("hamburger");
const menu = document.getElementById("menu");
const closeMenu = document.getElementById("closeMenu");
const backdrop = document.getElementById("backdrop");

function lockScroll(lock) {
  document.body.style.overflow = lock ? "hidden" : "";
}

// ---------- helper: split text into spans ----------
function splitIntoChars(el) {
  if (!el) return [];
  const text = el.textContent || "";
  el.textContent = "";
  const frag = document.createDocumentFragment();

  [...text].forEach((ch) => {
    const span = document.createElement("span");
    span.className = "char";
    span.textContent = ch === " " ? "\u00A0" : ch;
    frag.appendChild(span);
  });

  el.appendChild(frag);
  return el.querySelectorAll(".char");
}

// ---------- hard remove splash (never get stuck) ----------
// =========================
// SPLASH (SAFE) — only runs if #splash exists
// =========================

// Guard: if there is no splash on this page, do NOT lock scroll, do NOT bind splash events.
if (splash) {
  function removeSplash() {
    // Always clear the fallback timer
    if (splashFallbackTimer) {
      clearTimeout(splashFallbackTimer);
      splashFallbackTimer = null;
    }

    // If already hidden, just ensure scroll is unlocked
    if (splash.getAttribute("aria-hidden") === "true" || splash.style.display === "none") {
      lockScroll(false);
      if (typeof introHero === "function") introHero();
      return;
    }

    // If GSAP isn't available, hard-remove safely
    if (!window.gsap) {
      splash.setAttribute("aria-hidden", "true");
      splash.style.display = "none";
      lockScroll(false);
      if (typeof introHero === "function") introHero();
      return;
    }

    // GSAP remove
    gsap.killTweensOf(splash);
    gsap.to(splash, {
      opacity: 0,
      duration: 0.35,
      ease: "power2.out",
      onComplete: () => {
        splash.setAttribute("aria-hidden", "true");
        splash.style.display = "none";
        lockScroll(false);

        // After splash disappears, run hero animation (if it exists)
        if (typeof introHero === "function") introHero();
      },
    });
  }

  // ---------- SPLASH ----------
  let splashDone = false;
  let splashFallbackTimer = null;

  function playSplash() {
    if (splashDone) return;
    splashDone = true;

    // lock scroll during splash
    lockScroll(true);

    // Fallback so it never traps you on splash
    splashFallbackTimer = setTimeout(removeSplash, 2500);

    try {
      const kick = splash.querySelector(".splash-kicker");
      const title = splash.querySelector(".splash-title");
      const sub = splash.querySelector(".splash-sub");

      const kickChars = splitIntoChars(kick);
      const titleChars = splitIntoChars(title);
      const subChars = splitIntoChars(sub);

      if (meterBar && window.gsap) {
        gsap.to(meterBar, { width: "100%", duration: 1.2, ease: "power2.out" });
      }

      // If GSAP missing, just remove splash after a short delay
      if (!window.gsap) {
        setTimeout(removeSplash, 450);
        return;
      }

      const tl = gsap.timeline({
        defaults: { ease: "power3.out" },
        onComplete: () => removeSplash(), // removeSplash clears timer + unlocks scroll
      });

      // Splash panel in -> out
      tl.fromTo(
        splash.querySelector(".splash-inner"),
        { y: 14, opacity: 0, filter: "blur(10px)" },
        { y: 0, opacity: 1, filter: "blur(0px)", duration: 0.55 }
      ).to(splash.querySelector(".splash-inner"), {
        y: -18,
        opacity: 0,
        duration: 0.32,
        ease: "power4.in",
      });

      // Text reveals
      if (kickChars.length) {
        tl.from(kickChars, { y: 10, opacity: 0, stagger: 0.01, duration: 0.3 }, "-=0.25");
      }
      if (titleChars.length) {
        tl.from(
          titleChars,
          { yPercent: 120, opacity: 0, filter: "blur(8px)", stagger: 0.02, duration: 0.75 },
          "-=0.05"
        );
      }
      if (subChars.length) {
        tl.from(subChars, { y: 10, opacity: 0, stagger: 0.008, duration: 0.4 }, "-=0.35");
      }

      // Flash
      if (flash) {
        tl.to(flash, { opacity: 1, duration: 0.08 }, "+=0.2").to(flash, { opacity: 0, duration: 0.18 });
      }

      // Fade splash overlay
      tl.to(splash, { opacity: 0, duration: 0.55, ease: "power2.inOut" }, "-=0.05");
    } catch (err) {
      console.error("Splash error:", err);
      removeSplash(); // guarantees unlock
    }
  }

  // Bind splash events (only if splash exists)
  enterBtn?.addEventListener("click", playSplash);
  window.addEventListener("keydown", (e) => {
    if (e.key === "Enter" && !splashDone) playSplash();
  });

  // Auto play after load (only on pages with splash)
  window.addEventListener("load", () => {
    if (typeof dropHeaderAndTicker === "function") dropHeaderAndTicker();
    setTimeout(playSplash, 250);
  });
} else {
  // No splash on this page: never lock scroll, and still allow header drop if desired
  lockScroll(false);

  window.addEventListener("load", () => {
    if (typeof dropHeaderAndTicker === "function") dropHeaderAndTicker();
  });
}

// ---------- HERO INTRO ----------
function introHero() {
  const heroEls = document.querySelectorAll("[data-hero]");
  if (!heroEls.length) return;

  gsap.set(heroEls, { opacity: 0, y: 10, filter: "blur(8px)" });
  gsap.set(".hero-media", { scale: 1.08 });

  const tl = gsap.timeline({ defaults: { ease: "power3.out" } });
  tl.to(".hero-media", { scale: 1.02, duration: 1.15, ease: "power2.out" }, 0).to(
    heroEls,
    { opacity: 1, y: 0, filter: "blur(0px)", duration: 0.7, stagger: 0.12 },
    0.15
  );

  // Subtle continuous drift
  gsap.to(".hero-media", { y: 18, duration: 8, ease: "sine.inOut", yoyo: true, repeat: -1 });

  // Scroll reveals
  gsap.utils.toArray("[data-reveal]").forEach((el) => {
    gsap.set(el, { opacity: 0, y: 16, filter: "blur(10px)" });
    gsap.to(el, {
      opacity: 1,
      y: 0,
      filter: "blur(0px)",
      duration: 0.8,
      ease: "power3.out",
      scrollTrigger: { trigger: el, start: "top 85%" },
    });
  });
}

// ---------- Hamburger animation ----------
function animateHamburger(isOpen) {
  const lines = hamburger?.querySelectorAll(".hamb-line");
  if (!lines || lines.length < 3) return;

  gsap.killTweensOf(lines);

  if (isOpen) {
    gsap.to(lines[0], { y: 6, rotate: 45, duration: 0.2 });
    gsap.to(lines[1], { opacity: 0, duration: 0.15 });
    gsap.to(lines[2], { y: -22, rotate: -45, duration: 0.2 });
  } else {
    gsap.to(lines[0], { y: 0, rotate: 0, duration: 0.2 });
    gsap.to(lines[1], { opacity: 1, duration: 0.15 });
    gsap.to(lines[2], { y: 0, rotate: 0, duration: 0.2 });
  }
}

// ---------- MENU (CENTER SLIDE PANEL) ----------
let menuOpen = false;

const menuTl = gsap.timeline({ paused: true, defaults: { ease: "power3.out" } });

menuTl
  .set([backdrop, menu], { pointerEvents: "auto" })
  .to(backdrop, { opacity: 1, duration: 0.18 }, 0)
  .fromTo(
    ".menu-center-panel",
    { y: -26, opacity: 0, scale: 0.96, filter: "blur(10px)" },
    { y: 0, opacity: 1, scale: 1, filter: "blur(0px)", duration: 0.45 },
    0
  )
  .from(".menu-center-link", { y: 10, opacity: 0, stagger: 0.06, duration: 0.28 }, 0.15)
  .from(".menu-center-foot", { y: 10, opacity: 0, duration: 0.25 }, 0.32);

function setMenu(open) {
  menuOpen = open;

  hamburger?.setAttribute("aria-expanded", String(open));
  menu?.setAttribute("aria-hidden", String(!open));
  backdrop?.setAttribute("aria-hidden", String(!open));

  if (open) {
    lockScroll(true);
    animateHamburger(true);
    menuTl.play(0);
  } else {
    lockScroll(false);
    animateHamburger(false);
    menuTl.reverse();
    menuTl.eventCallback("onReverseComplete", () => {
      gsap.set([backdrop, menu], { pointerEvents: "none" });
    });
  }
}

hamburger?.addEventListener("click", () => setMenu(!menuOpen));
closeMenu?.addEventListener("click", () => setMenu(false));
backdrop?.addEventListener("click", () => setMenu(false));

window.addEventListener("keydown", (e) => {
  if (e.key === "Escape" && menuOpen) setMenu(false);
});

document.querySelectorAll(".menu-center-link").forEach((a) => {
  a.addEventListener("click", () => setMenu(false));
});

// =========================
// PRODUCT RAIL TABS (Women / Men)
// =========================
(() => {
  const tabs = document.querySelectorAll(".rail-tab");
  const panels = document.querySelectorAll(".rail-panel");
  if (!tabs.length || !panels.length) return;

  function activate(targetId) {
    tabs.forEach((t) => {
      const isActive = t.dataset.target === targetId;
      t.classList.toggle("is-active", isActive);
      t.setAttribute("aria-selected", String(isActive));
    });

    panels.forEach((p) => {
      const isActive = p.id === targetId;
      p.classList.toggle("is-active", isActive);
      p.hidden = !isActive;

      if (isActive) {
        const track = p.querySelector(".rail-track");
        if (track) track.scrollLeft = 0;
      }
    });

    const activePanel = document.getElementById(targetId);
    if (activePanel) {
      gsap.fromTo(
        activePanel.querySelectorAll(".rail-card"),
        { opacity: 0, y: 10, filter: "blur(8px)" },
        { opacity: 1, y: 0, filter: "blur(0px)", duration: 0.45, stagger: 0.06, ease: "power3.out" }
      );
    }
  }

  tabs.forEach((btn) => btn.addEventListener("click", () => activate(btn.dataset.target)));
  activate("women");
})();

// =========================
// RAIL ARROWS (scoped per panel)
// =========================
(() => {
  function attachRailArrows(trackId, scopeEl) {
    const track = document.getElementById(trackId);
    if (!track || !scopeEl) return;

    const prev = scopeEl.querySelector(".rail-arrow--prev");
    const next = scopeEl.querySelector(".rail-arrow--next");
    if (!prev || !next) return;

    function step() {
      const card = track.querySelector(".rail-card");
      if (!card) return 320;
      const gap = parseFloat(getComputedStyle(track).gap || "0");
      return card.getBoundingClientRect().width + gap;
    }

    prev.addEventListener("click", () => track.scrollBy({ left: -step(), behavior: "smooth" }));
    next.addEventListener("click", () => track.scrollBy({ left: step(), behavior: "smooth" }));
  }

  const womenPanel = document.getElementById("women");
  const menPanel = document.getElementById("men");

  if (womenPanel) attachRailArrows("womenTrack", womenPanel);
  if (menPanel) attachRailArrows("menTrack", menPanel);
})();

// =========================
// SECTION TIMELINES (animation-friendly)
// =========================
(() => {
  const sections = gsap.utils.toArray("[data-sec]");
  if (!sections.length) return;

  sections.forEach((sec) => {
    const items = sec.querySelectorAll(
      "[data-anim], .sec-title, .sec-copy, .rail-card, .tile, .techCard, .look-stat, .foot-card"
    );
    if (!items.length) return;

    gsap.set(items, { opacity: 0, y: 18, filter: "blur(10px)" });

    gsap.timeline({
      scrollTrigger: {
        trigger: sec,
        start: "top 78%",
        end: "bottom 30%",
        toggleActions: "play none none reverse",
      },
      defaults: { ease: "power3.out" },
    }).to(items, {
      opacity: 1,
      y: 0,
      filter: "blur(0px)",
      duration: 0.75,
      stagger: 0.06,
    });

    const media = sec.querySelector(".sec-media, .tile-media, .look-media");
    if (media) {
      gsap.to(media, {
        y: 18,
        ease: "sine.inOut",
        scrollTrigger: { trigger: sec, start: "top bottom", end: "bottom top", scrub: 0.6 },
      });
    }
  });
})();


// lookbook.js (or add into your main.js safely)
// Size toggle
document.addEventListener("click", (e) => {
  const sizeBtn = e.target.closest(".lb-sizes .size-btn");
  if (sizeBtn) {
    sizeBtn.parentElement.querySelectorAll(".size-btn").forEach(b => b.classList.remove("is-active"));
    sizeBtn.classList.add("is-active");
  }

  // Add to bag (uses your existing toast + badge ids if present)
  const addBtn = e.target.closest("[data-add-to-bag]");
  if (addBtn) {
    const toast = document.getElementById("cartToast");
    const badge = document.getElementById("cartBadge");
    const bag = document.getElementById("bagBtn");

    // badge increment (demo)
    if (badge) {
      const n = Number(badge.textContent || "0") + 1;
      badge.textContent = String(n);
    }

    // toast
    if (toast) {
      toast.hidden = false;
      toast.style.opacity = "1";
      clearTimeout(window.__toastTimer);
      window.__toastTimer = setTimeout(() => (toast.hidden = true), 1300);
    }

    // bag bump animation (GSAP if available)
    if (window.gsap && bag) {
      gsap.fromTo(bag, { scale: 1 }, { scale: 1.14, duration: 0.12, yoyo: true, repeat: 1, ease: "power2.out" });
    }
  }
});



// featured.js — display 4 static products only
(() => {
  const mount = document.getElementById("featuredProducts");
  if (!mount) return;

  const PRODUCTS = [
    {
      id: "w1",
      name: "Arc Runner Set",
      price: 78,
      img: "./img/tshirt.jpeg"
    },
    {
      id: "w2",
      name: "Pulse Crop Top",
      price: 42,
      img: "./img/tshirt.jpeg"
    },
    {
      id: "m1",
      name: "Arc Shell Jacket",
      price: 110,
      img: "./img/tshirt.jpeg"
    },
    {
      id: "m2",
      name: "Compression Base",
      price: 55,
      img: "./img/tshirt.jpeg"
    }
  ];

  function cardHTML(p){
    return `
      <article class="rail-card">
        <div class="rail-media" style="background-image:url('${p.img}')"></div>

        <h5 class="rail-name">${p.name}</h5>
        <p class="rail-price">£${p.price}</p>

        <div class="rail-actions">
          <button class="rail-btn" type="button" data-add="${p.id}">Add to bag</button>
          <a class="rail-btn rail-btn-ghost" href="product.html?id=${p.id}">
            View
          </a>
        </div>
      </article>
    `;
  }

  mount.innerHTML = PRODUCTS.map(cardHTML).join("");

  // Optional: add-to-cart hook if it exists
  mount.addEventListener("click", (e) => {
    const btn = e.target.closest("[data-add]");
    if (!btn) return;

    const id = btn.dataset.add;

    window.addToCart?.({ id, size: "M", qty: 1 });
    window.updateCartBadge?.();
  });
})();


// featured.js — 4 featured products with gender tabs
(() => {
  const mount = document.getElementById("featuredProducts");
  if (!mount) return;

  const tabs = document.querySelectorAll(".rail-tab");

  const PRODUCTS = {
    women: [
      { id: "w1", name: "Arc Runner Set", price: 78, img: "./img/tshirt.jpeg" },
      { id: "w2", name: "Pulse Crop Top", price: 42, img: "./img/tshirt.jpeg" },
      { id: "w3", name: "Stride Legging", price: 64, img: "./img/tshirt.jpeg" },
      { id: "w4", name: "Motion Tee", price: 38, img: "./img/tshirt.jpeg" },
    ],
    men: [
      { id: "m1", name: "Arc Shell Jacket", price: 110, img: "./img/tshirt.jpeg" },
      { id: "m2", name: "Compression Base", price: 55, img: "./img/tshirt.jpeg" },
      { id: "m3", name: "Stride Pant", price: 72, img: "./img/tshirt.jpeg" },
      { id: "m4", name: "Arc Runner Tee", price: 44, img: "./img/tshirt.jpeg" },
    ],
  };

  let activeGender = "women";

  function cardHTML(p) {
    return `
      <article class="rail-card">
        <div class="rail-media" style="background-image:url('${p.img}')"></div>

        <h5 class="rail-name">${p.name}</h5>
        <p class="rail-price">£${p.price}</p>

        <div class="rail-actions">
          <button class="rail-btn" type="button" data-add="${p.id}">
            Add to bag
          </button>
          <a class="rail-btn rail-btn-ghost" href="product.html?id=${p.id}">
            View
          </a>
        </div>
      </article>
    `;
  }

  function render() {
    mount.innerHTML = PRODUCTS[activeGender].map(cardHTML).join("");

    // Optional entrance animation
    if (window.gsap) {
      gsap.fromTo(
        ".rail-card",
        { opacity: 0, y: 12, filter: "blur(8px)" },
        { opacity: 1, y: 0, filter: "blur(0px)", duration: 0.45, stagger: 0.06 }
      );
    }
  }

  // Tab switching
  tabs.forEach((btn) => {
    btn.addEventListener("click", () => {
      activeGender = btn.dataset.gender;

      tabs.forEach((t) => {
        const active = t === btn;
        t.classList.toggle("is-active", active);
        t.setAttribute("aria-selected", String(active));
      });

      render();
    });
  });

  // Add to bag handler
  mount.addEventListener("click", (e) => {
    const btn = e.target.closest("[data-add]");
    if (!btn) return;

    const id = btn.dataset.add;

    window.addToCart?.({ id, size: "M", qty: 1 });
    window.updateCartBadge?.();
  });

  // Initial render
  render();
})();
