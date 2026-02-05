// store.js — shared PRODUCTS + cart helpers

window.PRODUCTS = window.PRODUCTS || {
  women: [
    { id: "w1", gender: "women", drop: "Drop_01", name: "Arc Runner Set", price: 78, img: "./img/tshirt.jpeg", tag: "New",
      desc: "Arc Fit seam mapping with airflow zones. Built for pace, designed for presence." },
    { id: "w2", gender: "women", drop: "Drop_01", name: "Pulse Crop Top", price: 42, img: "./img/tshirt.jpeg", tag: "Core",
      desc: "Compression-support feel with a clean silhouette for training or street." },
  ],
  men: [
    { id: "m1", gender: "men", drop: "Drop_01", name: "Arc Shell Jacket", price: 110, img: "./img/tshirt.jpeg", tag: "New",
      desc: "Lightweight shell with motion-line paneling. Weather-ready and camera-ready." },
    { id: "m2", gender: "men", drop: "Drop_01", name: "Compression Base", price: 55, img: "./img/tshirt.jpeg", tag: "Tech",
      desc: "Engineered compression with breathable mapping. Layer it, or wear it solo." },
  ],
};

function flattenProducts() {
  const p = window.PRODUCTS;
  return [...(p.women || []), ...(p.men || [])];
}

window.findProductById = function findProductById(id) {
  return flattenProducts().find((p) => p.id === id) || null;
};

const CART_KEY = "boltarc_cart_v1";

window.getCart = function getCart() {
  try {
    return JSON.parse(localStorage.getItem(CART_KEY) || "[]");
  } catch {
    return [];
  }
};

window.setCart = function setCart(items) {
  localStorage.setItem(CART_KEY, JSON.stringify(items));
};

window.getCartCount = function getCartCount() {
  return window.getCart().reduce((sum, it) => sum + (it.qty || 0), 0);
};

window.addToCart = function addToCart({ id, size = "M", qty = 1 }) {
  const cart = window.getCart();
  const existing = cart.find((it) => it.id === id && it.size === size);
  if (existing) existing.qty += qty;
  else cart.push({ id, size, qty });

  window.setCart(cart);
  return cart;
};

window.updateCartBadge = function updateCartBadge() {
  const badge = document.getElementById("cartBadge");
  if (!badge) return;
  badge.textContent = String(window.getCartCount());
  badge.style.display = window.getCartCount() > 0 ? "grid" : "none";
};
