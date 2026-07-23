/* ================================================================
   DELIGHTS BY VM — Interacciones
   ================================================================ */

const CONFIG = {
  WHATSAPP: "593997177039",
  DEPOSIT_PCT: 0.5,
  CURRENCY: "$",
  LOCAL_KEY: "delights_cart_v1",
};

/* Data compartida: viene de products.js (window.PRODUCTS y window.CATEGORIES) */
const PRODUCTS = window.PRODUCTS;
const CATEGORIES = window.CATEGORIES;


/* ============ ICONOS SVG ============ */
const ICONS = {
  plus: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"><path d="M12 5v14M5 12h14"/></svg>',
  minus:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"><path d="M5 12h14"/></svg>',
  x:    '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M18 6 6 18M6 6l12 12"/></svg>',
  ig:   '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round"><rect width="20" height="20" x="2" y="2" rx="5" ry="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37Z"/><line x1="17.5" x2="17.51" y1="6.5" y2="6.5"/></svg>',
  star: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M11.5 2.29a.5.5 0 0 1 1 0l2.31 4.68a2.12 2.12 0 0 0 1.6 1.16l5.16.76a.53.53 0 0 1 .3.9l-3.74 3.64a2.12 2.12 0 0 0-.6 1.88l.88 5.14a.53.53 0 0 1-.77.56l-4.62-2.43a2.12 2.12 0 0 0-1.97 0L6.4 21.01a.53.53 0 0 1-.77-.56l.88-5.14a2.12 2.12 0 0 0-.61-1.88L2.16 9.8a.53.53 0 0 1 .3-.91l5.16-.75a2.12 2.12 0 0 0 1.6-1.16Z"/></svg>',
  sparkle:'<svg viewBox="0 0 24 24" fill="currentColor"><path d="M9.94 15.5A2 2 0 0 0 8.5 14.06l-6.14-1.58a.5.5 0 0 1 0-.96L8.5 9.94A2 2 0 0 0 9.94 8.5l1.58-6.13a.5.5 0 0 1 .96 0L14.06 8.5A2 2 0 0 0 15.5 9.94l6.14 1.58a.5.5 0 0 1 0 .96l-6.14 1.58a2 2 0 0 0-1.44 1.44l-1.58 6.14a.5.5 0 0 1-.96 0z"/></svg>',
  crown: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M11.56 2.71A.5.5 0 0 1 12 2.5a.5.5 0 0 1 .44.21L14.87 6l3.35-1.9a.5.5 0 0 1 .74.5L18 12H6L4.04 4.6a.5.5 0 0 1 .74-.5L8.13 6zM6 14h12l-.5 4a2 2 0 0 1-2 1.75h-7A2 2 0 0 1 6.5 18z"/></svg>',
};

const BADGE_ICONS = {
  new: ICONS.sparkle,
  top: ICONS.star,
  premium: ICONS.crown,
  special: ICONS.sparkle,
};

/* ============ LOADER + REVEAL ============ */
(function () {
  const loader = document.getElementById("loader");
  const reveal = () => {
    if (!loader) return;
    loader.classList.add("hide");
    setTimeout(() => loader.remove(), 700);
    document.querySelectorAll(".reveal").forEach((el, i) => {
      // no-op: IntersectionObserver hará el trabajo
    });
  };
  if (document.readyState === "complete") setTimeout(reveal, 500);
  else window.addEventListener("load", () => setTimeout(reveal, 500));
  setTimeout(reveal, 3500);
})();

/* IntersectionObserver para .reveal */
(function () {
  const items = document.querySelectorAll(".reveal");
  if (!("IntersectionObserver" in window)) {
    items.forEach((el) => el.classList.add("visible"));
    return;
  }
  const io = new IntersectionObserver((entries) => {
    entries.forEach((e) => {
      if (e.isIntersecting) {
        e.target.classList.add("visible");
        io.unobserve(e.target);
      }
    });
  }, { threshold: 0.12 });
  items.forEach((el) => io.observe(el));
})();

/* ============ NAV: scroll state + active link ============ */
(function () {
  const nav = document.getElementById("nav");
  const links = document.querySelectorAll(".nav-links a");
  const sections = ["top", "postres", "filosofia", "contacto"]
    .map((id) => document.getElementById(id))
    .filter(Boolean);

  const onScroll = () => {
    nav.classList.toggle("scrolled", window.scrollY > 40);
  };
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  if ("IntersectionObserver" in window) {
    const io = new IntersectionObserver((entries) => {
      const visible = entries
        .filter((e) => e.isIntersecting)
        .sort((a, b) => b.intersectionRatio - a.intersectionRatio);
      if (visible.length) {
        const id = visible[0].target.id;
        links.forEach((a) => a.classList.toggle("active", a.getAttribute("href") === "#" + id));
      }
    }, { rootMargin: "-40% 0px -50% 0px", threshold: [0, 0.25, 0.5, 0.75] });
    sections.forEach((s) => io.observe(s));
  }
})();

/* ============ MENÚ MOBILE ============ */
(function () {
  const btn = document.getElementById("menu-btn");
  const menu = document.getElementById("mobile-menu");
  if (!btn || !menu) return;
  btn.addEventListener("click", () => menu.classList.toggle("open"));
  menu.querySelectorAll("a").forEach((a) => a.addEventListener("click", () => menu.classList.remove("open")));
})();

/* ============ RENDER PRODUCTOS ============ */
function renderCatalog(filter = "all") {
  const container = document.getElementById("product-container");
  const showAll = filter === "all";
  const cats = showAll ? CATEGORIES : CATEGORIES.filter((c) => c.id === filter);
  let html = "";
  cats.forEach((cat) => {
    const items = PRODUCTS.filter((p) => p.category === cat.id);
    if (!items.length) return;
    html += `
      <div class="cat-strip">
        <span class="line"></span>
        <h3>${cat.label}</h3>
        <span class="line-r"></span>
      </div>
      <div class="product-grid">
        ${items.map(productCard).join("")}
      </div>
    `;
  });
  container.innerHTML = html;
  updateCartVisual(); // refresca los estados "en carrito"
}

function productCard(p) {
  const badge = p.badge ? `<span class="product-badge badge-${p.badge.type}">${BADGE_ICONS[p.badge.type] || ""}${p.badge.label}</span>` : "";
  return `
    <article class="product" data-id="${p.id}">
      <div class="product-photo">
        ${badge}
        <img src="${p.photo}" alt="${p.name}" loading="lazy">
        <button class="quick-add" data-add="${p.id}" aria-label="Agregar ${p.name} al carrito">${ICONS.plus}</button>
      </div>
      <div class="product-body">
        <span class="product-cat">${p.categoryLabel}</span>
        <h4 class="product-name">${p.name}</h4>
        <p class="product-desc">${p.description}</p>
        <div class="product-foot">
          <span class="product-price">${CONFIG.CURRENCY}${p.price.toFixed(2)}</span>
          <button class="product-add" data-add="${p.id}">
            ${ICONS.plus}
            Agregar
          </button>
        </div>
      </div>
    </article>
  `;
}

/* ============ FILTROS ============ */
(function () {
  document.querySelectorAll(".filter").forEach((btn) => {
    btn.addEventListener("click", () => {
      document.querySelectorAll(".filter").forEach((b) => b.classList.remove("active"));
      btn.classList.add("active");
      renderCatalog(btn.dataset.filter);
    });
  });
})();

/* ============ INSTAGRAM GRID ============ */
(function () {
  const grid = document.getElementById("ig-grid");
  if (!grid) return;
  // 8 posts con las mejores fotos que tenemos
  const picks = [
    "assets/products/pave-franui.jpg",
    "assets/products/noir-maracuya.jpg",
    "assets/products/chococrunch.jpg",
    "assets/products/cheesecake-galak.jpg",
    "assets/products/vaso-patagonico.jpg",
    "assets/products/pave-leche-vaquita.jpg",
    "assets/products/pave-quipitos.jpg",
    "assets/products/pave-milo.jpg",
  ];
  grid.innerHTML = picks.map((src) => `
    <a class="ig-tile" href="https://www.instagram.com/delightsbyvm" target="_blank" rel="noopener" aria-label="Ver en Instagram">
      <img src="${src}" alt="" loading="lazy">
      <span class="ig-tile-icon">${ICONS.ig}</span>
    </a>
  `).join("");
})();

/* ============ CARRITO ============ */
const cart = {
  items: loadCart(),
  add(id) {
    const item = this.items.find((i) => i.id === id);
    if (item) item.qty += 1;
    else this.items.push({ id, qty: 1 });
    this.persist();
    this.render();
    updateCartVisual();
  },
  remove(id) {
    this.items = this.items.filter((i) => i.id !== id);
    this.persist();
    this.render();
    updateCartVisual();
  },
  setQty(id, qty) {
    const item = this.items.find((i) => i.id === id);
    if (!item) return;
    item.qty = Math.max(1, Math.min(99, qty));
    this.persist();
    this.render();
    updateCartVisual();
  },
  count() {
    return this.items.reduce((s, i) => s + i.qty, 0);
  },
  total() {
    return this.items.reduce((s, i) => {
      const p = PRODUCTS.find((x) => x.id === i.id);
      return p ? s + p.price * i.qty : s;
    }, 0);
  },
  deposit() {
    return this.total() * CONFIG.DEPOSIT_PCT;
  },
  persist() {
    try { localStorage.setItem(CONFIG.LOCAL_KEY, JSON.stringify(this.items)); } catch (e) {}
  },
  render() {
    const body = document.getElementById("cart-body");
    const foot = document.getElementById("cart-foot");
    if (!this.items.length) {
      body.innerHTML = `
        <div class="cart-empty">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.25" stroke-linecap="round" stroke-linejoin="round"><path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z"/><path d="M3 6h18"/><path d="M16 10a4 4 0 0 1-8 0"/></svg>
          <h3>Tu carrito está vacío</h3>
          <p>Explora nuestros postres y agrega tus favoritos.</p>
          <button class="btn btn-primary" id="cart-empty-explore">Ver postres</button>
        </div>
      `;
      foot.style.display = "none";
      const b = document.getElementById("cart-empty-explore");
      if (b) b.addEventListener("click", () => { closeCart(); document.getElementById("postres").scrollIntoView({ behavior: "smooth" }); });
      return;
    }
    body.innerHTML = this.items.map((i) => {
      const p = PRODUCTS.find((x) => x.id === i.id);
      if (!p) return "";
      return `
        <div class="cart-item">
          <img src="${p.photo}" alt="">
          <div class="cart-item-body">
            <div class="cart-item-top">
              <div>
                <span class="cart-item-cat">${p.categoryLabel}</span>
                <div class="cart-item-name">${p.name}</div>
              </div>
              <button class="cart-item-remove" data-remove="${p.id}" aria-label="Quitar ${p.name}">${ICONS.x}</button>
            </div>
            <div class="cart-item-foot">
              <div class="qty">
                <button data-dec="${p.id}" aria-label="Menos">${ICONS.minus}</button>
                <span>${i.qty}</span>
                <button data-inc="${p.id}" aria-label="Más">${ICONS.plus}</button>
              </div>
              <span class="cart-item-price">${CONFIG.CURRENCY}${(p.price * i.qty).toFixed(2)}</span>
            </div>
          </div>
        </div>
      `;
    }).join("");
    foot.style.display = "block";
    document.getElementById("cart-total").textContent = `${CONFIG.CURRENCY}${this.total().toFixed(2)}`;
    document.getElementById("cart-deposit").textContent = `${CONFIG.CURRENCY}${this.deposit().toFixed(2)}`;
  },
};

function loadCart() {
  try {
    const raw = localStorage.getItem(CONFIG.LOCAL_KEY);
    if (!raw) return [];
    const arr = JSON.parse(raw);
    return Array.isArray(arr) ? arr.filter((i) => PRODUCTS.find((p) => p.id === i.id)) : [];
  } catch (e) { return []; }
}

function updateCartVisual() {
  const n = cart.count();
  // Nav badge
  const nc = document.getElementById("cart-count");
  nc.textContent = n;
  nc.classList.toggle("show", n > 0);
  // FAB badge
  const fb = document.getElementById("fab-badge");
  const fc = document.getElementById("fab-cart");
  fb.textContent = n;
  fc.classList.toggle("show", n > 0);
  // Product buttons "added" state
  const ids = new Set(cart.items.map((i) => i.id));
  document.querySelectorAll(".quick-add").forEach((b) => b.classList.toggle("added", ids.has(b.dataset.add)));
}

/* ============ TOAST ============ */
let toastTimer;
function showToast(msg) {
  const t = document.getElementById("toast");
  document.getElementById("toast-text").textContent = msg;
  t.classList.add("show");
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => t.classList.remove("show"), 2200);
}

/* ============ EVENTOS DE PRODUCTO Y CARRITO ============ */
document.addEventListener("click", (e) => {
  const addBtn = e.target.closest("[data-add]");
  if (addBtn) {
    const id = addBtn.dataset.add;
    const p = PRODUCTS.find((x) => x.id === id);
    if (!p) return;
    cart.add(id);
    showToast(`${p.name} agregado`);
    // pulso visual
    if (addBtn.classList.contains("quick-add")) {
      addBtn.classList.add("pulse");
      setTimeout(() => addBtn.classList.remove("pulse"), 550);
    }
    return;
  }
  const remBtn = e.target.closest("[data-remove]");
  if (remBtn) { cart.remove(remBtn.dataset.remove); return; }
  const decBtn = e.target.closest("[data-dec]");
  if (decBtn) {
    const id = decBtn.dataset.dec;
    const it = cart.items.find((i) => i.id === id);
    if (it && it.qty > 1) cart.setQty(id, it.qty - 1);
    else if (it) cart.remove(id);
    return;
  }
  const incBtn = e.target.closest("[data-inc]");
  if (incBtn) {
    const id = incBtn.dataset.inc;
    const it = cart.items.find((i) => i.id === id);
    if (it) cart.setQty(id, it.qty + 1);
    return;
  }
});

/* ============ ABRIR / CERRAR CARRITO ============ */
function openCart() {
  document.getElementById("cart-drawer").classList.add("open");
  document.getElementById("cart-backdrop").classList.add("open");
  document.body.style.overflow = "hidden";
}
function closeCart() {
  document.getElementById("cart-drawer").classList.remove("open");
  document.getElementById("cart-backdrop").classList.remove("open");
  document.body.style.overflow = "";
}
document.getElementById("cart-btn").addEventListener("click", openCart);
document.getElementById("fab-cart").addEventListener("click", openCart);
document.getElementById("cart-close").addEventListener("click", closeCart);
document.getElementById("cart-backdrop").addEventListener("click", closeCart);
document.addEventListener("keydown", (e) => { if (e.key === "Escape") closeCart(); });

/* ============ CHECKOUT POR WHATSAPP ============ */
document.getElementById("cart-checkout").addEventListener("click", () => {
  if (!cart.items.length) return;
  const name = (document.getElementById("cart-name").value || "").trim();
  const lines = cart.items.map((i) => {
    const p = PRODUCTS.find((x) => x.id === i.id);
    return `• ${i.qty}× ${p.name} — ${CONFIG.CURRENCY}${(p.price * i.qty).toFixed(2)}`;
  }).join("\n");
  const msg =
    `¡Hola Delights by VM! 💗\n\n` +
    `Quisiera confirmar este pedido:\n\n${lines}\n\n` +
    `Total: ${CONFIG.CURRENCY}${cart.total().toFixed(2)}\n` +
    `Depósito 50%: ${CONFIG.CURRENCY}${cart.deposit().toFixed(2)}\n\n` +
    (name ? `Nombre: ${name}\n` : "") +
    `¿Me confirmas disponibilidad y datos para el depósito?\n\n¡Gracias! 🙌`;
  const url = `https://wa.me/${CONFIG.WHATSAPP}?text=${encodeURIComponent(msg)}`;
  window.open(url, "_blank");
});

/* ============ INIT ============ */
renderCatalog();
cart.render();
updateCartVisual();
