// product.js — render product details + add-to-cart animation

function getQueryParam(name) {
  const url = new URL(window.location.href);
  return url.searchParams.get(name);
}

function productHTML(p) {
  return `
    <div class="product-mediaWrap">
      <div class="product-media" style="background-image:url('${p.img}')"></div>
    </div>

    <div class="product-info">
      <p class="product-kicker">${p.drop} / ${p.gender.toUpperCase()}</p>
      <h1 class="product-title">${p.name}</h1>

      <div class="product-row">
        <span class="product-price">£${Number(p.price).toFixed(0)}</span>
        <span class="product-chip">${p.tag || "Drop"}</span>
      </div>

      <p class="product-desc">${p.desc || "Performance-driven apparel engineered for motion."}</p>

      <div class="product-controls">
        <div class="product-control">
          <label class="product-label" for="sizeSel">Size</label>
          <select id="sizeSel" class="product-select">
            <option value="XS">XS</option>
            <option value="S">S</option>
            <option value="M" selected>M</option>
            <option value="L">L</option>
            <option value="XL">XL</option>
          </select>
        </div>

        <div class="product-control">
          <label class="product-label" for="qtySel">Qty</label>
          <input id="qtySel" class="product-qty" type="number" min="1" value="1" />
        </div>
      </div>

      <div class="product-actions">
        <button class="rail-btn product-addBtn" id="addBtn" type="button">Add to bag</button>
        <a class="rail-btn rail-btn-ghost" href="shop.html">Continue shopping</a>
      </div>

      <p class="product-note">Ships in 2–5 days. Easy returns.</p>
    </div>
  `;
}

function showToast(msg) {
  const toast = document.getElementById("cartToast");
  if (!toast) return;

  toast.textContent = msg;
  toast.hidden = false;

  if (window.gsap) {
    gsap.killTweensOf(toast);
    gsap.fromTo(toast, { y: 10, opacity: 0 }, { y: 0, opacity: 1, duration: 0.25, ease: "power2.out" });
    gsap.to(toast, { opacity: 0, duration: 0.25, ease: "power2.in", delay: 1.4, onComplete: () => (toast.hidden = true) });
  } else {
    setTimeout(() => (toast.hidden = true), 1600);
  }
}

function flyToBagAnimation(fromEl) {
  const bag = document.getElementById("bagBtn");
  if (!fromEl || !bag) return;

  const a = fromEl.getBoundingClientRect();
  const b = bag.getBoundingClientRect();

  // create a floating clone
  const flyer = fromEl.cloneNode(true);
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

  if (window.gsap) {
    gsap.to(flyer, {
      x: destX,
      y: destY,
      scale: 0.12,
      opacity: 0.3,
      duration: 0.7,
      ease: "power3.inOut",
      onComplete: () => flyer.remove(),
    });

    gsap.fromTo(
      bag,
      { scale: 1 },
      { scale: 1.08, duration: 0.18, yoyo: true, repeat: 1, ease: "power2.out" }
    );
  } else {
    flyer.remove();
  }
}

document.addEventListener("DOMContentLoaded", () => {
  window.updateCartBadge?.();

  const id = getQueryParam("id");
  const p = window.findProductById?.(id);

  const layout = document.getElementById("productLayout");
  if (!layout) return;

  if (!p) {
    layout.innerHTML = `<div class="shop-empty"><h3 class="shop-emptyTitle">Product not found</h3><p class="shop-emptyCopy">Return to shop and try again.</p></div>`;
    return;
  }

  layout.innerHTML = productHTML(p);

  const addBtn = document.getElementById("addBtn");
  addBtn?.addEventListener("click", () => {
    const size = document.getElementById("sizeSel")?.value || "M";
    const qty = Math.max(1, Number(document.getElementById("qtySel")?.value || 1));

    window.addToCart?.({ id: p.id, size, qty });
    window.updateCartBadge?.();

    // animate from product media to bag
    const media = document.querySelector(".product-mediaWrap");
    flyToBagAnimation(media);

    showToast("Added to bag");
  });
  
});



