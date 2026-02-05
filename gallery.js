// gallery.js — Bolt Arc Gallery (filters + search + sort + lightbox)
// Runs only if #galleryGrid exists.

(() => {
  const grid = document.getElementById("galleryGrid");
  if (!grid) return;

  const empty = document.getElementById("galleryEmpty");
  const searchEl = document.getElementById("gallerySearch");
  const sortEl = document.getElementById("gallerySort");
  const tabs = Array.from(document.querySelectorAll(".gallery-tab"));

  // Lightbox elements
  const lightbox = document.getElementById("lightbox");
  const lbImg = document.getElementById("lightboxImg");
  const lbTitle = document.getElementById("lightboxTitle");
  const lbMeta = document.getElementById("lightboxMeta");
  const lbClose = document.getElementById("lightboxClose");
  const lbPrev = document.getElementById("lightboxPrev");
  const lbNext = document.getElementById("lightboxNext");

  // Replace paths with your real assets
  // Tip: keep consistent filenames: img/gallery/01.jpg ... etc
  const GALLERY = [
    {
      id: "g01",
      type: "garms",
      title: "Arc Runner Set",
      meta: "Drop_01 • Studio",
      date: "2026-01-10",
      src: "img/gallery/01.jpg",
      alt: "Bolt Arc Arc Runner Set studio shot",
    },
    {
      id: "g02",
      type: "gym",
      title: "Push Session",
      meta: "Gym • Night",
      date: "2026-01-12",
      src: "img/gallery/02.jpg",
      alt: "Athlete training in gym wearing Bolt Arc apparel",
    },
    {
      id: "g03",
      type: "garms",
      title: "Reflect Zip",
      meta: "Drop_01 • Street",
      date: "2026-01-14",
      src: "img/gallery/03.jpg",
      alt: "Bolt Arc Reflect Zip streetwear look",
    },
    {
      id: "g04",
      type: "gym",
      title: "Leg Day",
      meta: "Gym • Intention",
      date: "2026-01-05",
      src: "img/gallery/04.jpg",
      alt: "Training session focus in gym",
    },
    {
      id: "g05",
      type: "garms",
      title: "Compression Base",
      meta: "Drop_01 • Fit",
      date: "2026-01-02",
      src: "img/gallery/05.jpg",
      alt: "Bolt Arc compression base garment detail shot",
    },
    {
      id: "g06",
      type: "gym",
      title: "Core Circuit",
      meta: "Gym • Motion",
      date: "2025-12-28",
      src: "img/gallery/06.jpg",
      alt: "Athlete performing core circuit in gym",
    },
    {
      id: "g07",
      type: "garms",
      title: "Arc Shell Jacket",
      meta: "Drop_01 • Outerwear",
      date: "2026-01-08",
      src: "img/gallery/07.jpg",
      alt: "Bolt Arc Arc Shell Jacket product photo",
    },
    {
      id: "g08",
      type: "gym",
      title: "Sprints",
      meta: "Gym • Pace",
      date: "2026-01-16",
      src: "img/gallery/08.jpg",
      alt: "Runner sprinting wearing performance apparel",
    },
    {
      id: "g09",
      type: "garms",
      title: "Motion Tee",
      meta: "Drop_01 • Essential",
      date: "2026-01-03",
      src: "img/gallery/09.jpg",
      alt: "Bolt Arc Motion Tee on model",
    },
    {
      id: "g10",
      type: "gym",
      title: "Lift Focus",
      meta: "Gym • Strength",
      date: "2026-01-07",
      src: "img/gallery/10.jpg",
      alt: "Weightlifting training in gym",
    },
    {
      id: "g11",
      type: "garms",
      title: "Stride Pant",
      meta: "Drop_01 • Move",
      date: "2026-01-15",
      src: "img/gallery/11.jpg",
      alt: "Bolt Arc Stride Pant styling",
    },
    {
      id: "g12",
      type: "gym",
      title: "Warm Up",
      meta: "Gym • Routine",
      date: "2026-01-01",
      src: "img/gallery/12.jpg",
      alt: "Warm up routine in gym",
    },
  ];

  let state = {
    filter: "all",
    q: "",
    sort: "featured",
  };

  function matchesSearch(item) {
    const q = state.q.trim().toLowerCase();
    if (!q) return true;
    return (
      item.title.toLowerCase().includes(q) ||
      item.meta.toLowerCase().includes(q) ||
      item.type.toLowerCase().includes(q)
    );
  }

  function getList() {
    let list = GALLERY.filter((it) =>
      state.filter === "all" ? true : it.type === state.filter
    ).filter(matchesSearch);

    if (state.sort === "newest") {
      list = [...list].sort((a, b) => new Date(b.date) - new Date(a.date));
    } else if (state.sort === "oldest") {
      list = [...list].sort((a, b) => new Date(a.date) - new Date(b.date));
    }

    return list;
  }

  function tileHTML(it, index) {
    return `
    <button class="gallery-tile" type="button" data-index="${index}" aria-label="Open image: ${
      it.title
    }">
      <span class="gallery-media" style="background-image: url('./img/tshirt.jpeg')"></span>
      <span class="gallery-meta">
        <span class="gallery-row">
          <span class="gallery-kicker">${it.type.toUpperCase()}</span>
          <span class="gallery-chip">VIEW</span>
        </span>
        <span class="gallery-name">${it.title}</span>
        <span class="gallery-sub">${it.meta}</span>
      </span>
    </button>
  `;
  }

  // Lightbox state uses current rendered list (so arrows follow filter/search)
  let currentList = [];
  let currentIndex = 0;

  function openLightbox(i) {
    currentIndex = i;
    const it = currentList[currentIndex];
    if (!it) return;

    lbImg.src = "img/tshirt.jpeg"; // ✅ force it
    lbImg.alt = it.alt || it.title;
    lbTitle.textContent = it.title;
    lbMeta.textContent = it.meta;

    lightbox.classList.add("is-open");
    lightbox.setAttribute("aria-hidden", "false");
    document.body.style.overflow = "hidden";

    if (window.gsap) {
      gsap.fromTo(
        ".lightbox-figure",
        { y: 10, opacity: 0, filter: "blur(10px)" },
        {
          y: 0,
          opacity: 1,
          filter: "blur(0px)",
          duration: 0.35,
          ease: "power3.out",
        }
      );
      gsap.fromTo(".lightbox", { opacity: 0 }, { opacity: 1, duration: 0.18 });
    }
  }

  function closeLightbox() {
    if (!lightbox.classList.contains("is-open")) return;

    if (window.gsap) {
      gsap.to(".lightbox-figure", {
        y: 8,
        opacity: 0,
        filter: "blur(10px)",
        duration: 0.2,
        ease: "power2.in",
      });
      gsap.to(".lightbox", {
        opacity: 0,
        duration: 0.18,
        onComplete: () => {
          lightbox.classList.remove("is-open");
          lightbox.removeAttribute("style");
          lightbox.setAttribute("aria-hidden", "true");
          document.body.style.overflow = "";
        },
      });
    } else {
      lightbox.classList.remove("is-open");
      lightbox.setAttribute("aria-hidden", "true");
      document.body.style.overflow = "";
    }
  }

  function nav(delta) {
    if (!currentList.length) return;
    currentIndex =
      (currentIndex + delta + currentList.length) % currentList.length;
    const it = currentList[currentIndex];

    lbImg.src = "img/tshirt.jpeg"; // ✅ force it here too
    lbImg.alt = it.alt || it.title;
    lbTitle.textContent = it.title;
    lbMeta.textContent = it.meta;

    if (window.gsap) {
      gsap.fromTo(
        "#lightboxImg",
        { opacity: 0.6, scale: 0.995 },
        { opacity: 1, scale: 1, duration: 0.22, ease: "power2.out" }
      );
    }
  }

  function render() {
    currentList = getList();

    grid.innerHTML = currentList.map((it, i) => tileHTML(it, i)).join("");

    const hasAny = currentList.length > 0;
    if (empty) empty.hidden = hasAny;

    // Entrance animation
    if (window.gsap) {
      gsap.fromTo(
        ".gallery-tile",
        { y: 16, opacity: 0, filter: "blur(10px)" },
        {
          y: 0,
          opacity: 1,
          filter: "blur(0px)",
          duration: 0.5,
          stagger: 0.03,
          ease: "power3.out",
        }
      );
    }
  }

  // Events: tabs
  tabs.forEach((btn) => {
    btn.addEventListener("click", () => {
      state.filter = btn.dataset.filter;

      tabs.forEach((t) => {
        const active = t === btn;
        t.classList.toggle("is-active", active);
        t.setAttribute("aria-selected", active ? "true" : "false");
      });

      render();
    });
  });

  // Search + sort
  searchEl?.addEventListener("input", (e) => {
    state.q = e.target.value || "";
    render();
  });

  sortEl?.addEventListener("change", (e) => {
    state.sort = e.target.value || "featured";
    render();
  });

  // Tile click (event delegation)
  grid.addEventListener("click", (e) => {
    const tile = e.target.closest(".gallery-tile");
    if (!tile) return;
    const index = Number(tile.dataset.index);
    openLightbox(index);
  });

  // Lightbox controls
  lbClose?.addEventListener("click", closeLightbox);
  lbPrev?.addEventListener("click", () => nav(-1));
  lbNext?.addEventListener("click", () => nav(1));

  lightbox?.addEventListener("click", (e) => {
    // clicking backdrop closes (not image)
    if (e.target === lightbox) closeLightbox();
  });

  window.addEventListener("keydown", (e) => {
    if (!lightbox.classList.contains("is-open")) return;
    if (e.key === "Escape") closeLightbox();
    if (e.key === "ArrowLeft") nav(-1);
    if (e.key === "ArrowRight") nav(1);
  });

  // Run
  render();
})();
