/* ================================================================
   DELIGHTS BY VM · Admin del catálogo
   ================================================================ */

// Clave simple (barrera básica — no es seguridad real). Podés cambiarla acá:
const ADMIN_PASSWORD = "delights2026";

const CATEGORIES = window.CATEGORIES;
const CATEGORY_MAP = Object.fromEntries(CATEGORIES.map(c => [c.id, c.label]));

// Copia editable en memoria (empieza como clon del catálogo original)
let workingProducts = clone(window.PRODUCTS);
const originalProducts = clone(window.PRODUCTS);
let isDirty = false;

function clone(obj) { return JSON.parse(JSON.stringify(obj)); }
function slugify(str) {
  return String(str).toLowerCase()
    .normalize("NFD").replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    || "postre-" + Date.now();
}

/* ============ GATE ============ */
(function() {
  const saved = sessionStorage.getItem("delights_admin_ok");
  if (saved === "1") return showApp();

  const gate = document.getElementById("gate");
  const input = document.getElementById("gate-input");
  const btn = document.getElementById("gate-btn");
  const msg = document.getElementById("gate-msg");

  function attempt() {
    if (input.value === ADMIN_PASSWORD) {
      sessionStorage.setItem("delights_admin_ok", "1");
      showApp();
    } else {
      msg.textContent = "Clave incorrecta";
      input.value = "";
      input.focus();
    }
  }
  btn.addEventListener("click", attempt);
  input.addEventListener("keydown", e => { if (e.key === "Enter") attempt(); });
  setTimeout(() => input.focus(), 100);
})();

function showApp() {
  document.getElementById("gate").style.display = "none";
  document.getElementById("app").classList.remove("app-hidden");
  init();
}

/* ============ INIT ============ */
function init() {
  document.getElementById("btn-add").addEventListener("click", addProduct);
  document.getElementById("btn-download").addEventListener("click", downloadProductsJs);
  document.getElementById("btn-reset").addEventListener("click", resetAll);
  document.getElementById("modal-close").addEventListener("click", () => {
    document.getElementById("dl-modal").classList.remove("show");
  });
  renderList();
  renderPreview();
  updateCount();

  // Warn on leave if dirty
  window.addEventListener("beforeunload", (e) => {
    if (isDirty) {
      e.preventDefault();
      e.returnValue = "";
      return "";
    }
  });
}

function markDirty() {
  isDirty = true;
  document.getElementById("dirty").classList.add("show");
}
function markClean() {
  isDirty = false;
  document.getElementById("dirty").classList.remove("show");
}

/* ============ LISTA (edición inline) ============ */
function renderList() {
  const container = document.getElementById("product-list");
  container.innerHTML = "";
  workingProducts.forEach((p, i) => {
    container.appendChild(buildRow(p, i));
  });
  updateCount();
}

function updateCount() {
  document.getElementById("count").textContent = workingProducts.length;
}

function buildRow(p, index) {
  const row = document.createElement("div");
  row.className = "prow";
  row.dataset.index = index;

  // Photo
  const photo = document.createElement("div");
  photo.className = "prow-photo" + (p.photo ? "" : " no-img");
  if (p.photo) {
    const im = document.createElement("img");
    im.src = p.photo;
    im.alt = "";
    im.onerror = () => { photo.classList.add("no-img"); photo.textContent = "SIN FOTO"; };
    photo.appendChild(im);
  } else {
    photo.textContent = "SIN FOTO";
  }
  row.appendChild(photo);

  // Body: fields
  const body = document.createElement("div");
  body.className = "prow-body";

  body.appendChild(field("Nombre", p.name || "", (v) => update(index, "name", v), { wide: true }));
  body.appendChild(field("Precio (USD)", p.price ?? 0, (v) => update(index, "price", parseFloat(v) || 0), { type: "number", step: "0.05", min: "0" }));

  // Categoría (select)
  const catField = document.createElement("div");
  catField.className = "f";
  const catLabel = document.createElement("label"); catLabel.textContent = "Categoría";
  const catSelect = document.createElement("select");
  CATEGORIES.forEach(c => {
    const opt = document.createElement("option");
    opt.value = c.id; opt.textContent = c.label;
    if (c.id === p.category) opt.selected = true;
    catSelect.appendChild(opt);
  });
  catSelect.addEventListener("change", () => {
    workingProducts[index].category = catSelect.value;
    workingProducts[index].categoryLabel = shortLabel(catSelect.value);
    markDirty(); renderPreview(); markRow(row);
  });
  catField.appendChild(catLabel);
  catField.appendChild(catSelect);
  body.appendChild(catField);

  // Foto path
  body.appendChild(field("Foto (nombre de archivo)", p.photo || "", (v) => update(index, "photo", v), {
    placeholder: "assets/products/mi-postre.jpg",
    wide: true
  }));

  // FocalY (con slider)
  const focalField = document.createElement("div");
  focalField.className = "f wide";
  const focalLabel = document.createElement("label");
  focalLabel.innerHTML = `Punto focal vertical <span style="color:var(--chocolate-2); font-weight:500; text-transform:none; letter-spacing:0">— dónde está el centro del postre en la foto (0.00 arriba, 1.00 abajo)</span>`;
  const focalRow = document.createElement("div");
  focalRow.style.cssText = "display:flex; align-items:center; gap:.75rem;";
  const focalSlider = document.createElement("input");
  focalSlider.type = "range"; focalSlider.min = "0"; focalSlider.max = "1"; focalSlider.step = "0.01";
  focalSlider.value = p.focalY ?? 0.5;
  focalSlider.style.cssText = "flex:1;";
  const focalVal = document.createElement("input");
  focalVal.type = "number"; focalVal.min = "0"; focalVal.max = "1"; focalVal.step = "0.01";
  focalVal.value = (p.focalY ?? 0.5).toFixed(2);
  focalVal.style.cssText = "width:5rem;";
  focalSlider.addEventListener("input", () => {
    focalVal.value = parseFloat(focalSlider.value).toFixed(2);
    workingProducts[index].focalY = parseFloat(focalSlider.value);
    markDirty(); markRow(row);
  });
  focalVal.addEventListener("input", () => {
    const v = clamp(parseFloat(focalVal.value) || 0.5, 0, 1);
    focalSlider.value = v;
    workingProducts[index].focalY = v;
    markDirty(); markRow(row);
  });
  focalRow.appendChild(focalSlider);
  focalRow.appendChild(focalVal);
  focalField.appendChild(focalLabel);
  focalField.appendChild(focalRow);
  body.appendChild(focalField);

  // Descripción
  body.appendChild(field("Descripción", p.description || "", (v) => update(index, "description", v), { textarea: true, wide: true }));

  // Badge selector
  const badgeField = document.createElement("div");
  badgeField.className = "f wide";
  const badgeLabel = document.createElement("label"); badgeLabel.textContent = "Insignia (opcional)";
  const badgeSelector = document.createElement("div");
  badgeSelector.className = "badge-selector";
  const types = [
    { type: "none", label: "Ninguna" },
    { type: "new", label: "Nuevo" },
    { type: "top", label: "Más vendido" },
    { type: "premium", label: "Premium" },
    { type: "special", label: "Ed. Especial" },
  ];
  const currentType = p.badge?.type || "none";
  types.forEach(t => {
    const pill = document.createElement("button");
    pill.type = "button";
    pill.className = "badge-pill";
    pill.dataset.type = t.type;
    pill.textContent = t.label;
    if (t.type === currentType) pill.classList.add("active");
    pill.addEventListener("click", () => {
      badgeSelector.querySelectorAll(".badge-pill").forEach(x => x.classList.remove("active"));
      pill.classList.add("active");
      if (t.type === "none") {
        delete workingProducts[index].badge;
      } else {
        workingProducts[index].badge = { type: t.type, label: t.label };
      }
      markDirty(); renderPreview(); markRow(row);
    });
    badgeSelector.appendChild(pill);
  });
  badgeField.appendChild(badgeLabel);
  badgeField.appendChild(badgeSelector);
  body.appendChild(badgeField);

  row.appendChild(body);

  // Actions
  const actions = document.createElement("div");
  actions.className = "prow-actions";
  const upBtn = miniBtn("Subir", `<path d="M12 19V5M5 12l7-7 7 7"/>`, () => moveRow(index, -1));
  const downBtn = miniBtn("Bajar", `<path d="M12 5v14M5 12l7 7 7-7"/>`, () => moveRow(index, +1));
  const dupBtn = miniBtn("Duplicar", `<rect width="14" height="14" x="8" y="8" rx="2"/><path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"/>`, () => duplicateRow(index));
  const delBtn = miniBtn("Eliminar", `<path d="M3 6h18M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2M10 11v6M14 11v6M5 6l1 14a2 2 0 0 0 2 2h8a2 2 0 0 0 2-2l1-14"/>`, () => deleteRow(index));
  delBtn.classList.add("danger");
  actions.appendChild(upBtn); actions.appendChild(downBtn); actions.appendChild(dupBtn); actions.appendChild(delBtn);
  row.appendChild(actions);

  return row;
}

function field(labelText, value, onchange, opts = {}) {
  const wrap = document.createElement("div");
  wrap.className = "f" + (opts.wide ? " wide" : "");
  const label = document.createElement("label");
  label.textContent = labelText;
  wrap.appendChild(label);
  const input = document.createElement(opts.textarea ? "textarea" : "input");
  if (opts.type) input.type = opts.type;
  if (opts.step) input.step = opts.step;
  if (opts.min !== undefined) input.min = opts.min;
  if (opts.placeholder) input.placeholder = opts.placeholder;
  input.value = value;
  input.addEventListener("input", () => {
    onchange(input.value);
    markDirty();
    renderPreview();
    markRow(wrap.closest(".prow"));
  });
  wrap.appendChild(input);
  return wrap;
}

function miniBtn(title, svgPath, onClick) {
  const b = document.createElement("button");
  b.className = "mini-btn";
  b.type = "button";
  b.title = title;
  b.innerHTML = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round">${svgPath}</svg>`;
  b.addEventListener("click", onClick);
  return b;
}

function shortLabel(catId) {
  const label = CATEGORY_MAP[catId] || catId;
  // remover "· Sabores XXX" y similares para categoryLabel más limpio
  return label.replace(/\s·\s.+$/, "").replace(/^Los del /, "");
}

function update(index, field, value) {
  workingProducts[index][field] = value;
  markDirty();
  renderPreview();
}

function markRow(row) {
  if (row) row.classList.add("dirty");
}

/* ============ ACTIONS ============ */
function addProduct() {
  const newP = {
    id: "postre-" + Date.now(),
    name: "Nuevo postre",
    category: CATEGORIES[0].id,
    categoryLabel: shortLabel(CATEGORIES[0].id),
    price: 1.50,
    photo: "",
    description: "",
    focalY: 0.5,
  };
  workingProducts.push(newP);
  markDirty();
  renderList();
  renderPreview();
  // scroll al nuevo item
  const rows = document.querySelectorAll(".prow");
  rows[rows.length - 1]?.scrollIntoView({ behavior: "smooth", block: "center" });
  showToast("Postre agregado ✓");
}

function moveRow(index, delta) {
  const target = index + delta;
  if (target < 0 || target >= workingProducts.length) return;
  const [item] = workingProducts.splice(index, 1);
  workingProducts.splice(target, 0, item);
  markDirty();
  renderList();
  renderPreview();
}

function duplicateRow(index) {
  const copy = clone(workingProducts[index]);
  copy.id = copy.id + "-copia-" + Date.now();
  copy.name = copy.name + " (copia)";
  workingProducts.splice(index + 1, 0, copy);
  markDirty();
  renderList();
  renderPreview();
  showToast("Postre duplicado");
}

function deleteRow(index) {
  const p = workingProducts[index];
  if (!confirm(`¿Eliminar "${p.name}"?`)) return;
  workingProducts.splice(index, 1);
  markDirty();
  renderList();
  renderPreview();
  showToast("Postre eliminado");
}

function resetAll() {
  if (!confirm("¿Descartar todos los cambios y volver al catálogo original?")) return;
  workingProducts = clone(originalProducts);
  markClean();
  renderList();
  renderPreview();
  showToast("Cambios descartados");
}

/* ============ PREVIEW ============ */
function renderPreview() {
  const grid = document.getElementById("preview-grid");
  grid.innerHTML = "";
  workingProducts.forEach(p => {
    const cell = document.createElement("div");
    cell.className = "pgc";
    const photo = document.createElement("div");
    photo.className = "pgc-photo";
    if (p.photo) {
      const im = document.createElement("img");
      im.src = p.photo; im.alt = "";
      im.onerror = () => photo.innerHTML = '<div style="display:flex;align-items:center;justify-content:center;height:100%;color:var(--chocolate-2);font-size:.7rem;">SIN FOTO</div>';
      // aplicar focal Y como object-position
      if (p.focalY !== undefined) {
        im.style.objectPosition = `50% ${(p.focalY * 100).toFixed(0)}%`;
      }
      photo.appendChild(im);
    } else {
      photo.innerHTML = '<div style="display:flex;align-items:center;justify-content:center;height:100%;color:var(--chocolate-2);font-size:.7rem;">SIN FOTO</div>';
    }
    cell.appendChild(photo);

    const body = document.createElement("div");
    body.className = "pgc-body";
    const cat = document.createElement("div");
    cat.className = "pgc-cat"; cat.textContent = p.categoryLabel || "";
    const name = document.createElement("div");
    name.className = "pgc-name"; name.textContent = p.name || "(sin nombre)";
    const price = document.createElement("div");
    price.className = "pgc-price"; price.textContent = "$" + (p.price ?? 0).toFixed(2);
    body.appendChild(cat); body.appendChild(name); body.appendChild(price);
    cell.appendChild(body);
    grid.appendChild(cell);
  });
}

/* ============ EXPORT ============ */
function serializeProducts() {
  // Generar un JS válido, human-readable, con el formato de nuestro products.js original.
  const catsStr = "window.CATEGORIES = " + JSON.stringify(CATEGORIES, null, 2) + ";";

  const prodStrs = workingProducts.map(p => {
    const lines = ["  {"];
    lines.push(`    id: ${JSON.stringify(p.id)},`);
    lines.push(`    name: ${JSON.stringify(p.name)},`);
    lines.push(`    category: ${JSON.stringify(p.category)},`);
    lines.push(`    categoryLabel: ${JSON.stringify(p.categoryLabel || shortLabel(p.category))},`);
    lines.push(`    price: ${Number(p.price).toFixed(2)},`);
    if (p.badge) {
      lines.push(`    badge: { type: ${JSON.stringify(p.badge.type)}, label: ${JSON.stringify(p.badge.label)} },`);
    }
    lines.push(`    photo: ${JSON.stringify(p.photo || "")},`);
    if (p.focalY !== undefined) {
      lines.push(`    focalY: ${Number(p.focalY).toFixed(2)},`);
    }
    if (p.focalX !== undefined) {
      lines.push(`    focalX: ${Number(p.focalX).toFixed(2)},`);
    }
    lines.push(`    description: ${JSON.stringify(p.description || "")},`);
    lines.push("  },");
    return lines.join("\n");
  }).join("\n");

  return `/* ================================================================
   DELIGHTS BY VM — Data compartida entre el sitio y el editor de posts
   Generado automáticamente desde admin.html el ${new Date().toLocaleString("es-EC")}
================================================================ */

${catsStr}

window.PRODUCTS = [
${prodStrs}
];
`;
}

function downloadProductsJs() {
  // Auto-slugify ids que estén vacíos o duplicados
  const seen = new Set();
  workingProducts.forEach(p => {
    if (!p.id || seen.has(p.id)) {
      p.id = slugify(p.name) + "-" + Math.random().toString(36).slice(2, 6);
    }
    seen.add(p.id);
  });

  const content = serializeProducts();
  const blob = new Blob([content], { type: "text/javascript;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "products.js";
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  setTimeout(() => URL.revokeObjectURL(url), 2000);
  markClean();
  document.getElementById("dl-modal").classList.add("show");
}

/* ============ HELPERS ============ */
function clamp(v, mn, mx) { return Math.max(mn, Math.min(mx, v)); }

let toastTimer;
function showToast(msg) {
  const t = document.getElementById("toast");
  document.getElementById("toast-text").textContent = msg;
  t.classList.add("show");
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => t.classList.remove("show"), 2200);
}
