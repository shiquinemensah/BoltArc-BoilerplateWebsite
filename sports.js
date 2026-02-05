// sports.js — subtle page reveals (compatible with your GSAP system)
(() => {
  // If you already run a global reveal system in main.js, this will do nothing harmful.
  const els = Array.from(document.querySelectorAll("[data-reveal]"));
  if (!els.length) return;

  // If GSAP exists, do clean entrance once
  if (window.gsap) {
    els.forEach((el) => {
      gsap.set(el, { opacity: 0, y: 14, filter: "blur(10px)" });

      gsap.to(el, {
        opacity: 1,
        y: 0,
        filter: "blur(0px)",
        duration: 0.75,
        ease: "power3.out",
        scrollTrigger: window.ScrollTrigger
          ? { trigger: el, start: "top 85%" }
          : undefined,
      });
    });

    // Gentle drift on hero image
    const img = document.querySelector(".sports-heroImg");
    if (img) {
      gsap.to(img, { y: 14, duration: 7, ease: "sine.inOut", yoyo: true, repeat: -1 });
    }
  }
})();
