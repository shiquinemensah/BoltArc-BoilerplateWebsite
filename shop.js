// =========================
// SHOP PAGE (only run if shop DOM exists)
// + View -> product.html?id=...
// + Add to bag -> localStorage cart + fly-to-bag animation + toast + badge
// =========================
(() => {
  const grid = document.getElementById("shopGrid");
  if (!grid) return; // ✅ prevents errors on non-shop pages

  const empty = document.getElementById("shopEmpty");
  const searchEl = document.getElementById("shopSearch");
  const sortEl = document.getElementById("shopSort");
  const tabs = Array.from(document.querySelectorAll(".shop-tab"));

  // OPTIONAL (but recommended):
  // Ensure you have these in your header:
  // <button id="bagBtn" ...> ... <span id="cartBadge" class="cart-badge">0</span></button>
  const bagBtn = document.getElementById("bagBtn");
  const cartBadge = document.getElementById("cartBadge");
  const toast = document.getElementById("cartToast");

  const PRODUCTS = {
    women: [
      { id: "w1", gender: "women", drop: "Drop_01", name: "Arc Runner Set", price: 78, img: "./img/tshirt.jpeg", tag: "New" },
      { id: "w2", gender: "women", drop: "Drop_01", name: "Pulse Crop Top", price: 42, img: "./img/tshirt.jpeg", tag: "Core" },
      { id: "w3", gender: "women", drop: "Drop_01", name: "Stride Legging", price: 64, img: "./img/tshirt.jpeg", tag: "Tech" },
      { id: "w4", gender: "women", drop: "Drop_01", name: "Arc Wind Shell", price: 95, img: "./img/tshirt.jpeg", tag: "Limited" },
      { id: "w5", gender: "women", drop: "Drop_01", name: "Reflect Zip", price: 88, img: "./img/tshirt.jpeg", tag: "Night" },
      { id: "w6", gender: "women", drop: "Drop_01", name: "Motion Tee", price: 38, img: "./img/tshirt.jpeg", tag: "Core" },
    ],
    men: [
      { id: "m1", gender: "men", drop: "Drop_01", name: "Arc Shell Jacket", price: 110, img: "./img/tshirt.jpeg", tag: "New" },
      { id: "m2", gender: "men", drop: "Drop_01", name: "Compression Base", price: 55, img: "./img/tshirt.jpeg", tag: "Tech" },
      { id: "m3", gender: "men", drop: "Drop_01", name: "Stride Pant", price: 72, img: "./img/tshirt.jpeg", tag: "Core" },
      { id: "m4", gender: "men", drop: "Drop_01", name: "Arc Runner Tee", price: 44, img: "./img/tshirt.jpeg", tag: "Core" },
      { id: "m5", gender: "men", drop: "Drop_01", name: "Reflect Wind", price: 98, img: "./img/tshirt.jpeg", tag: "Night" },
      { id: "m6", gender: "men", drop: "Drop_01", name: "Arc Short", price: 48, img: "./img/tshirt.jpeg", tag: "Move" },
    ],
  };

  // -------------------------
  // CART (localStorage)
  // -------------------------
  const CART_KEY = "boltarc_cart_v1";

  function getCart() {
    try {
      return JSON.parse(localStorage.getItem(CART_KEY) || "[]");
    } catch {
      return [];
    }
  }

  function setCart(items) {
    localStorage.setItem(CART_KEY, JSON.stringify(items));
  }

  function addToCart({ id, qty = 1, size = "M" }) {
    const cart = getCart();
    const existing = cart.find((it) => it.id === id && it.size === size);
    if (existing) existing.qty += qty;
    else cart.push({ id, size, qty });
    setCart(cart);
    return cart;
  }

  function cartCount() {
    return getCart().reduce((sum, it) => sum + (it.qty || 0), 0);
  }

  function updateBadge() {
    if (!cartBadge) return;
    const n = cartCount();
    cartBadge.textContent = String(n);
    cartBadge.style.display = n > 0 ? "grid" : "none";
  }

  // -------------------------
  // TOAST
  // -------------------------
  function showToast(msg) {
    if (!toast) return;

    toast.textContent = msg;
    toast.hidden = false;

    if (window.gsap) {
      gsap.killTweensOf(toast);
      gsap.fromTo(toast, { y: 10, opacity: 0 }, { y: 0, opacity: 1, duration: 0.25, ease: "power2.out" });
      gsap.to(toast, {
        opacity: 0,
        duration: 0.25,
        ease: "power2.in",
        delay: 1.35,
        onComplete: () => (toast.hidden = true),
      });
    } else {
      setTimeout(() => (toast.hidden = true), 1600);
    }
  }

  // -------------------------
  // FLY TO BAG ANIMATION
  // -------------------------
  function flyToBagFromCard(cardEl) {
    if (!window.gsap || !bagBtn || !cardEl) return;

    const media = cardEl.querySelector(".shop-media");
    if (!media) return;

    const a = media.getBoundingClientRect();
    const b = bagBtn.getBoundingClientRect();

    const flyer = media.cloneNode(true);
    flyer.classList.add("flyer");
    flyer.style.position = "fixed";
    flyer.style.left = `${a.left}px`;
    flyer.style.top = `${a.top}px`;
    flyer.style.width = `${a.width}px`;
    flyer.style.height = `${a.height}px`;
    flyer.style.margin = "0";
    flyer.style.zIndex = "9999";
    flyer.style.borderRadius = "18px";
    flyer.style.pointerEvents = "none";
    document.body.appendChild(flyer);

    const destX = b.left + b.width / 2 - (a.left + a.width / 2);
    const destY = b.top + b.height / 2 - (a.top + a.height / 2);

    gsap.to(flyer, {
      x: destX,
      y: destY,
      scale: 0.12,
      opacity: 0.25,
      duration: 0.7,
      ease: "power3.inOut",
      onComplete: () => flyer.remove(),
    });

    gsap.fromTo(bagBtn, { scale: 1 }, { scale: 1.08, duration: 0.18, yoyo: true, repeat: 1, ease: "power2.out" });
  }

  // -------------------------
  // STATE + FILTERING
  // -------------------------
  let state = { gender: "women", q: "", sort: "featured" };

  function formatGBP(n) {
    return `£${Number(n).toFixed(0)}`;
  }

  function getCurrentList() {
    const base = PRODUCTS[state.gender] || [];
    const q = state.q.trim().toLowerCase();

    let list = base.filter((p) => {
      if (!q) return true;
      return (
        p.name.toLowerCase().includes(q) ||
        p.drop.toLowerCase().includes(q) ||
        (p.tag || "").toLowerCase().includes(q)
      );
    });

    switch (state.sort) {
      case "priceLow":
        return [...list].sort((a, b) => a.price - b.price);
      case "priceHigh":
        return [...list].sort((a, b) => b.price - a.price);
      case "nameAZ":
        return [...list].sort((a, b) => a.name.localeCompare(b.name));
      default:
        return list; // featured order
    }
  }

  // -------------------------
  // CARD TEMPLATE (UPDATED)
  // - Add button carries data-add
  // - View links to product.html?id=...
  // -------------------------
  function cardHTML(p) {
    return `
      <article class="shop-card" data-id="${p.id}">
        <div class="shop-media" style="background-image:url('${p.img}')"></div>

        <div class="shop-meta">
          <div class="shop-row">
            <p class="shop-kicker">${p.drop}</p>
            <span class="shop-chip">${p.tag || "Drop"}</span>
          </div>

          <h3 class="shop-name">${p.name}</h3>

          <div class="shop-row shop-rowBottom">
            <span class="shop-price">${formatGBP(p.price)}</span>

            <div class="shop-actions">
              <a class="rail-btn" href="#" data-add="${p.id}">Add to bag</a>
              <a class="rail-btn rail-btn-ghost" href="product.html?id=${encodeURIComponent(p.id)}">View</a>
            </div>
          </div>
        </div>
      </article>
    `;
  }

  function render() {
    const list = getCurrentList();
    grid.innerHTML = list.map(cardHTML).join("");

    const hasAny = list.length > 0;
    if (empty) empty.hidden = hasAny;

    if (window.gsap) {
      gsap.fromTo(
        ".shop-card",
        { y: 18, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.45, stagger: 0.04, ease: "power2.out" }
      );
    }
  }

  // -------------------------
  // TAB SWITCH
  // -------------------------
  tabs.forEach((btn) => {
    btn.addEventListener("click", () => {
      state.gender = btn.dataset.gender;

      tabs.forEach((t) => {
        const active = t === btn;
        t.classList.toggle("is-active", active);
        t.setAttribute("aria-selected", active ? "true" : "false");
      });

      render();
    });
  });

  // -------------------------
  // SEARCH + SORT
  // -------------------------
  searchEl?.addEventListener("input", (e) => {
    state.q = e.target.value || "";
    render();
  });

  sortEl?.addEventListener("change", (e) => {
    state.sort = e.target.value;
    render();
  });

  // -------------------------
  // ADD TO BAG (event delegation)
  // -------------------------
  grid.addEventListener("click", (e) => {
    const addBtn = e.target.closest("[data-add]");
    if (!addBtn) return;

    e.preventDefault();

    const id = addBtn.getAttribute("data-add");
    if (!id) return;

    addToCart({ id, qty: 1, size: "M" }); // listing page default size
    updateBadge();

    const card = addBtn.closest(".shop-card");
    flyToBagFromCard(card);
    showToast("Added to bag");
  });

  // ✅ initial render + badge
  updateBadge();
  render();
})();
