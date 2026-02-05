// templates.js — minimal product card only

window.productCardTemplate = function productCardTemplate(p) {
  return `
    <article class="lb-product">

      <div class="lb-productTop">
        <p class="lb-kicker">${p.drop}</p>
        <span class="lb-chip">${p.tag || "Drop"}</span>
      </div>

      <div class="lb-productMain">
        <div
          class="lb-productMedia"
          style="background-image:url('${p.img}')">
        </div>

        <div class="lb-productInfo">
          <h3 class="lb-name">${p.name}</h3>

          <div class="lb-row">
            <span class="lb-price">£${Number(p.price).toFixed(0)}</span>
            <span class="lb-note">${(p.gender || "").toUpperCase()}</span>
          </div>

          <p class="lb-mini">
            ${p.desc || "Performance-driven apparel engineered for motion."}
          </p>

          <div class="lb-actions">
            <a class="rail-btn"
               href="product.html?id=${encodeURIComponent(p.id)}">
              View product
            </a>
          </div>
        </div>
      </div>

    </article>
  `;
};


