// contact.js — Contact form validation + toast + FAQ accordion
(() => {
  const form = document.getElementById("contactForm");
  if (!form) return;

  const nameEl = document.getElementById("cName");
  const emailEl = document.getElementById("cEmail");
  const msgEl = document.getElementById("cMessage");
  const toast = document.getElementById("contactToast");

  const faqItems = Array.from(document.querySelectorAll(".faq-item"));

  function setErr(inputId, msg) {
    const el = document.querySelector(`[data-err-for="${inputId}"]`);
    if (!el) return;
    el.textContent = msg || "";
  }

  function validEmail(v) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(v || "").trim());
  }

  function showToast(text) {
    if (!toast) return;
    toast.textContent = text || "Done";
    toast.hidden = false;

    if (window.gsap) {
      gsap.killTweensOf(toast);
      gsap.fromTo(
        toast,
        { y: 12, opacity: 0, filter: "blur(10px)" },
        { y: 0, opacity: 1, filter: "blur(0px)", duration: 0.25, ease: "power3.out" }
      );
      gsap.to(toast, {
        opacity: 0,
        duration: 0.35,
        delay: 2.1,
        onComplete: () => {
          toast.hidden = true;
          toast.style.opacity = "";
        },
      });
    } else {
      setTimeout(() => (toast.hidden = true), 2200);
    }
  }

  function validate() {
    let ok = true;

    const name = String(nameEl.value || "").trim();
    const email = String(emailEl.value || "").trim();
    const msg = String(msgEl.value || "").trim();

    setErr("cName", "");
    setErr("cEmail", "");
    setErr("cMessage", "");

    if (name.length < 2) {
      setErr("cName", "Please enter your name.");
      ok = false;
    }

    if (!validEmail(email)) {
      setErr("cEmail", "Please enter a valid email.");
      ok = false;
    }

    if (msg.length < 10) {
      setErr("cMessage", "Message must be at least 10 characters.");
      ok = false;
    }

    return ok;
  }

  form.addEventListener("submit", (e) => {
    e.preventDefault();
    if (!validate()) {
      showToast("Fix fields");
      return;
    }

    // Frontend-only placeholder. Replace with fetch() to your backend/email service.
    showToast("Message sent");
    form.reset();
  });

  // FAQ accordion
  faqItems.forEach((btn) => {
    btn.addEventListener("click", () => {
      const expanded = btn.getAttribute("aria-expanded") === "true";
      const answer = btn.querySelector(".faq-a");
      const ico = btn.querySelector(".faq-ico");

      // close all others (cleaner)
      faqItems.forEach((b) => {
        if (b !== btn) {
          b.setAttribute("aria-expanded", "false");
          const a = b.querySelector(".faq-a");
          const i = b.querySelector(".faq-ico");
          if (a) a.hidden = true;
          if (i) i.textContent = "+";
        }
      });

      btn.setAttribute("aria-expanded", expanded ? "false" : "true");
      if (answer) answer.hidden = expanded ? true : false;
      if (ico) ico.textContent = expanded ? "+" : "–";

      if (window.gsap && answer) {
        gsap.fromTo(
          answer,
          { opacity: 0, y: 6, filter: "blur(8px)" },
          { opacity: 1, y: 0, filter: "blur(0px)", duration: 0.25, ease: "power2.out" }
        );
      }
    });
  });
})();
