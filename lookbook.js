
(() => {
  const mount = document.getElementById("lookbookProductMount");
  if (!mount) return;

  // choose a product
  const productId = "w1"; // change this
  const p = window.findProductById?.(productId);

  if (!p || typeof window.productCardTemplate !== "function") {
    mount.innerHTML = `<p style="opacity:.6">Product unavailable</p>`;
    return;
  }

  mount.innerHTML = window.productCardTemplate(p);
})();
