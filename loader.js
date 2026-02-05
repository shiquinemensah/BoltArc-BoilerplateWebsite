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