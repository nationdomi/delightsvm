/* ================================================================
   DELIGHTS BY VM — Editor de posts
   Renderiza en canvas nativo. Exporta PNG (imagen) y MP4/WebM (video 8s).
================================================================ */

const CFG = {
  WHATSAPP: "593997177039",
  HANDLE: "@delightsbyvm",
  LOCATION: "Santa Ana, Manabí · Papas del Malecón",
  DURATION_MS: 8000,
  FPS: 30,
  MAX_PRODUCTS: 5,
  MIN_PRODUCTS: 3,
};

const FORMATS = {
  portrait: { w: 1080, h: 1350, label: "1080 × 1350" },
  square:   { w: 1080, h: 1080, label: "1080 × 1080" },
  story:    { w: 1080, h: 1920, label: "1080 × 1920" },
};

const COLORS = {
  cream: "#FAF5EE",
  paper: "#FDFBF7",
  peach: "#FBD8BF",
  blush: "#F4C7C0",
  wine:  "#9A3A3A",
  wineDeep: "#6E1C25",
  chocolate: "#3B2416",
  chocolate2: "#5A3924",
  chocolate3: "#8A6449",
  gold: "#C8994A",
};

const state = {
  format: "portrait",
  style: "grid",       // grid | menu
  theme: "warm",       // warm | chocolate
  title: "Disponibles hoy",
  subtitle: "",
  selectedIds: [],
  logoImg: null,
  logoInvertedImg: null,  // versión blanca del logo para fondo chocolate
  productImgs: new Map(),
};

const canvas = document.getElementById("post-canvas");
const ctx = canvas.getContext("2d");
const overlay = document.getElementById("preview-overlay");
const previewFrame = document.getElementById("preview-frame");

/* ============ HELPERS ============ */
const clamp = (v, mn, mx) => Math.max(mn, Math.min(mx, v));
const ease = (t) => t < .5 ? 2*t*t : 1 - Math.pow(-2*t + 2, 2) / 2; // easeInOutQuad
const easeOut = (t) => 1 - Math.pow(1 - t, 3);
const easeIn = (t) => t * t * t;

function loadImage(src) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    // No seteamos crossOrigin: el mismo origen no lo necesita
    // y en file:// causa errores de CORS espurios
    img.onload = () => resolve(img);
    img.onerror = (e) => reject(new Error(`No se pudo cargar ${src}`));
    img.src = src;
  });
}

function roundRect(ctx, x, y, w, h, r) {
  const rr = Math.min(r, w/2, h/2);
  ctx.beginPath();
  ctx.moveTo(x + rr, y);
  ctx.arcTo(x + w, y, x + w, y + h, rr);
  ctx.arcTo(x + w, y + h, x, y + h, rr);
  ctx.arcTo(x, y + h, x, y, rr);
  ctx.arcTo(x, y, x + w, y, rr);
  ctx.closePath();
}

function drawImageCover(ctx, img, dx, dy, dw, dh) {
  const sr = img.width / img.height;
  const dr = dw / dh;
  let sx, sy, sw, sh;
  if (sr > dr) {
    sh = img.height;
    sw = sh * dr;
    sx = (img.width - sw) / 2;
    sy = 0;
  } else {
    sw = img.width;
    sh = sw / dr;
    sx = 0;
    sy = (img.height - sh) / 2;
  }
  ctx.drawImage(img, sx, sy, sw, sh, dx, dy, dw, dh);
}

function fmtPrice(p) { return "$" + p.toFixed(2); }

/* ============ LAYOUT PER FORMAT ============
   Devuelve las rectangulos y tamaños para cada formato.
================================================== */
function computeLayout(fmt, n, style) {
  const W = FORMATS[fmt].w;
  const H = FORMATS[fmt].h;
  const isStory = fmt === "story";
  const isSquare = fmt === "square";
  const useMenu = style === "menu";

  const pad = isStory ? 90 : 60;

  const headerY = isStory ? 140 : 70;
  const logoH = isStory ? 130 : 100;
  const logoY = headerY;
  const titleY = logoY + logoH + (isStory ? 100 : 65);
  const titleSize = isSquare ? 100 : (useMenu ? 108 : 118);
  const subY = titleY + titleSize + 20;
  const subSize = 32;
  const headerBottom = subY + subSize + (isStory ? 90 : 50);

  const footerH = isStory ? 260 : 210;
  const footerTop = H - footerH;

  const gridTop = headerBottom;
  const gridBottom = footerTop - 30;
  const gridH = gridBottom - gridTop;
  const gridW = W - 2 * pad;

  let rects = [];

  if (useMenu) {
    // ESTILO MENÚ: filas horizontales de ancho completo
    const gap = 22;
    const rowH = (gridH - gap * (n - 1)) / n;
    // Limitar el alto de cada fila para no verse desproporcionadas
    const maxRowH = isSquare ? 190 : 260;
    const finalRowH = Math.min(rowH, maxRowH);
    // Centrar verticalmente si sobra espacio
    const totalH = finalRowH * n + gap * (n - 1);
    const startY = gridTop + (gridH - totalH) / 2;
    for (let i = 0; i < n; i++) {
      rects.push({
        x: pad,
        y: startY + i * (finalRowH + gap),
        w: gridW,
        h: finalRowH,
      });
    }
  } else if (isSquare) {
    // GRID en 1:1
    const gap = 28;
    if (n <= 2) {
      const cellW = (gridW - gap * (n-1)) / n;
      const cellH = Math.min(gridH, cellW * 1.15);
      const y = gridTop + (gridH - cellH) / 2;
      for (let i = 0; i < n; i++) {
        rects.push({ x: pad + i * (cellW + gap), y, w: cellW, h: cellH });
      }
    } else {
      const cols = 2;
      const rows = Math.ceil(n / cols);
      const cellW = (gridW - gap * (cols-1)) / cols;
      const cellH = (gridH - gap * (rows-1)) / rows;
      for (let i = 0; i < n; i++) {
        const r = Math.floor(i / cols);
        const c = i % cols;
        const isLastRowOdd = (r === rows - 1 && n % cols === 1);
        const rowItems = isLastRowOdd ? 1 : cols;
        const rowW = rowItems * cellW + (rowItems - 1) * gap;
        const rowX = pad + (gridW - rowW) / 2;
        const inRowIdx = isLastRowOdd ? 0 : c;
        rects.push({
          x: rowX + inRowIdx * (cellW + gap),
          y: gridTop + r * (cellH + gap),
          w: cellW,
          h: cellH,
        });
      }
    }
  } else {
    // GRID en 4:5 o 9:16 → 2 columnas
    const gap = 28;
    const cols = 2;
    const rows = Math.ceil(n / cols);
    const cellW = (gridW - gap * (cols-1)) / cols;
    const cellH = (gridH - gap * (rows-1)) / rows;
    for (let i = 0; i < n; i++) {
      const r = Math.floor(i / cols);
      const c = i % cols;
      const isLastRowOdd = (r === rows - 1 && n % cols === 1);
      const rowItems = isLastRowOdd ? 1 : cols;
      const rowW = rowItems * cellW + (rowItems - 1) * gap;
      const rowX = pad + (gridW - rowW) / 2;
      const inRowIdx = isLastRowOdd ? 0 : c;
      rects.push({
        x: rowX + inRowIdx * (cellW + gap),
        y: gridTop + r * (cellH + gap),
        w: cellW,
        h: cellH,
      });
    }
  }

  return {
    W, H, pad,
    logoY, logoH,
    titleY, titleSize,
    subY, subSize,
    footerTop, footerH,
    rects,
    style,
  };
}

/* ============ TEMA (colores dinámicos según fondo) ============ */
function getPalette(theme) {
  switch (theme) {

    case "vino":
      // Vino profundo: gradiente vertical burdeos + halos sutiles (a Dom le gustó así)
      return {
        bgKind: "gradient",
        bgGradientDir: "vertical",
        bgGradient: [["#7A2732", 0], ["#4A0F1A", 1]],
        blob1: "rgba(228,198,138,.24)",  // halo gold arriba-derecha
        blob2: "rgba(250,245,238,.10)",  // halo cream abajo-izquierda
        dot: "#E4C68A",
        dotAlpha: .22,
        dotCount: 30,
        textPrimary: COLORS.cream,
        textSecondary: "#E8D5C9",
        accent: "#E4C68A",
        ornament: "#E4C68A",
        cardBg: "rgba(255,255,255,.09)",
        cardBorder: "rgba(228,198,138,.32)",
        cardText: COLORS.cream,
        cardShadow: "rgba(0,0,0,.40)",
        ctaBg: COLORS.cream,
        ctaText: COLORS.wineDeep,
        chipBg: "rgba(250,245,238,.95)",
        chipText: COLORS.wineDeep,
        logoTintWhite: true,
      };

    case "rosa":
      // Rosa polvo: gradiente diagonal limpio de tres tonos, sin blobs
      return {
        bgKind: "gradient",
        bgGradientDir: "diagonal-tl-br",
        bgGradient: [["#F8E5DF", 0], ["#F1CBC6", 0.55], ["#E4AAA0", 1]],
        blob1: null,
        blob2: null,
        dot: COLORS.wine,
        dotAlpha: .07,
        dotCount: 18,
        textPrimary: COLORS.chocolate,
        textSecondary: "#7A4E45",
        accent: COLORS.wine,
        ornament: COLORS.wine,
        cardBg: "#FFFFFF",
        cardBorder: null,
        cardText: COLORS.chocolate,
        cardShadow: "rgba(122,78,69,.22)",
        ctaBg: COLORS.wine,
        ctaText: "#FFFFFF",
        chipBg: "rgba(255,255,255,.95)",
        chipText: COLORS.wine,
        logoTintWhite: false,
      };

    case "terracota":
      // Terracota: gradiente diagonal tierra cálida, sin blobs
      return {
        bgKind: "gradient",
        bgGradientDir: "diagonal-tl-br",
        bgGradient: [["#E9AB89", 0], ["#D0835F", 0.55], ["#A5624A", 1]],
        blob1: null,
        blob2: null,
        dot: COLORS.chocolate,
        dotAlpha: .06,
        dotCount: 18,
        textPrimary: COLORS.chocolate,
        textSecondary: "#2A1810",
        accent: COLORS.wineDeep,
        ornament: COLORS.wineDeep,
        cardBg: COLORS.cream,
        cardBorder: null,
        cardText: COLORS.chocolate,
        cardShadow: "rgba(110,28,37,.25)",
        ctaBg: COLORS.chocolate,
        ctaText: COLORS.cream,
        chipBg: "rgba(255,255,255,.95)",
        chipText: COLORS.wineDeep,
        logoTintWhite: false,
      };

    default: // "warm" — EL ORIGINAL, sin cambios
      return {
        bgKind: "solid",
        bgSolid: COLORS.cream,
        blob1: "rgba(251, 216, 191, 0.45)",  // peach top-right
        blob2: "rgba(244, 199, 192, 0.45)",  // blush bottom-left
        dot: COLORS.gold,
        dotAlpha: .18,
        dotCount: 24,
        textPrimary: COLORS.chocolate,
        textSecondary: COLORS.chocolate2,
        accent: COLORS.wine,
        ornament: COLORS.wine,
        cardBg: "#FFFFFF",
        cardBorder: null,
        cardText: COLORS.chocolate,
        cardShadow: "rgba(255, 255, 255, 0.16)",
        ctaBg: COLORS.wine,
        ctaText: "#FFFFFF",
        chipBg: "rgba(255,255,255,.95)",
        chipText: COLORS.wine,
        logoTintWhite: false,
      };
  }
}

/* ============ DRAW FUNCTIONS ============ */

function drawBackground(ctx, L, theme) {
  const { W, H } = L;
  const pal = getPalette(theme);

  // Base — soporta linear vertical, diagonal, o solid
  if (pal.bgKind === "gradient") {
    let x0, y0, x1, y1;
    if (pal.bgGradientDir === "diagonal-tl-br") {
      [x0, y0, x1, y1] = [0, 0, W, H];
    } else if (pal.bgGradientDir === "diagonal-tr-bl") {
      [x0, y0, x1, y1] = [W, 0, 0, H];
    } else {
      [x0, y0, x1, y1] = [0, 0, 0, H]; // vertical por default
    }
    const g = ctx.createLinearGradient(x0, y0, x1, y1);
    for (const [color, stop] of pal.bgGradient) g.addColorStop(stop, color);
    ctx.fillStyle = g;
  } else {
    ctx.fillStyle = pal.bgSolid;
  }
  ctx.fillRect(0, 0, W, H);

  // Blobs opcionales
if (pal.blob1) {
    const g1 = ctx.createRadialGradient(W * .82, H * .12, 40, W * .82, H * .12, W * .55);
    g1.addColorStop(0, pal.blob1);
    g1.addColorStop(1, "rgba(250,245,238,0)"); // <-- AQUÍ
    ctx.fillStyle = g1;
    ctx.fillRect(0, 0, W, H);
  }
  if (pal.blob2) {
    const g2 = ctx.createRadialGradient(W * .12, H * .88, 40, W * .12, H * .88, W * .6);
    g2.addColorStop(0, pal.blob2);
    g2.addColorStop(1, "rgba(250,245,238,0)"); // <-- AQUÍ
    ctx.fillStyle = g2;
    ctx.fillRect(0, 0, W, H);
  }

  // Puntos dispersos (si el tema los tiene)
  if (pal.dotCount > 0) {
    ctx.save();
    ctx.fillStyle = pal.dot;
    ctx.globalAlpha = pal.dotAlpha;
    const seed = 42;
    for (let i = 0; i < pal.dotCount; i++) {
      const rx = ((i * 137 + seed) % W);
      const ry = ((i * 197 + seed * 3) % H);
      const rr = 2 + ((i * 7) % 4);
      ctx.beginPath();
      ctx.arc(rx, ry, rr, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.restore();
  }
}

function drawLogo(ctx, L, opacity, theme) {
  if (!state.logoImg || opacity <= 0) return;
  const pal = getPalette(theme);
  ctx.save();
  ctx.globalAlpha = opacity;
  const targetH = L.logoH;
  const scale = targetH / state.logoImg.height;
  const targetW = state.logoImg.width * scale;
  const x = (L.W - targetW) / 2;

  if (pal.logoTintWhite) {
    // Dibujar el logo con tinte cream (mask)
    const off = document.createElement("canvas");
    off.width = state.logoImg.width;
    off.height = state.logoImg.height;
    const offCtx = off.getContext("2d");
    offCtx.drawImage(state.logoImg, 0, 0);
    offCtx.globalCompositeOperation = "source-in";
    offCtx.fillStyle = COLORS.cream;
    offCtx.fillRect(0, 0, off.width, off.height);
    ctx.drawImage(off, x, L.logoY, targetW, targetH);
  } else {
    ctx.drawImage(state.logoImg, x, L.logoY, targetW, targetH);
  }
  ctx.restore();
}

function drawTitle(ctx, L, title, subtitle, opacity, revealProgress, theme) {
  if (opacity <= 0) return;
  const pal = getPalette(theme);
  ctx.save();
  ctx.globalAlpha = opacity;
  ctx.textAlign = "center";
  ctx.textBaseline = "top";
  ctx.fillStyle = pal.textPrimary;

  const size = L.titleSize;
  ctx.font = `italic 500 ${size}px "Fraunces", serif`;
  const cx = L.W / 2;
  const y = L.titleY;
  const rp = clamp(revealProgress ?? 1, 0, 1);
  const eased = easeOut(rp);
  ctx.fillText(title, cx, y);

  // Ornamento debajo del título — línea limpia
  if (rp > .5) {
    const ornOpacity = clamp((rp - .5) * 2, 0, 1);
    ctx.save();
    ctx.globalAlpha = opacity * ornOpacity;
    ctx.fillStyle = pal.ornament;
    const ornY = y + size + 14;
    const ornW = 70 * eased;
    ctx.fillRect(cx - ornW/2, ornY, ornW, 2);
    ctx.restore();
  }

  if (subtitle) {
    ctx.font = `400 ${L.subSize}px "Manrope", sans-serif`;
    ctx.fillStyle = pal.textSecondary;
    ctx.fillText(subtitle, cx, L.subY + 18);
  }
  ctx.restore();
}

function drawProductCardGrid(ctx, L, rect, product, entryProgress, theme) {
  if (entryProgress <= 0 || !product) return;
  const img = state.productImgs.get(product.id);
  if (!img) return;
  const pal = getPalette(theme);

  ctx.save();
  const p = clamp(entryProgress, 0, 1);
  const eased = easeOut(p);
  const translateY = (1 - eased) * 40;
  const scale = 0.94 + 0.06 * eased;
  const opacity = eased;
  ctx.globalAlpha = opacity;
  const cx = rect.x + rect.w / 2;
  const cy = rect.y + rect.h / 2;
  ctx.translate(cx, cy + translateY);
  ctx.scale(scale, scale);
  ctx.translate(-cx, -cy - translateY);
  ctx.translate(0, translateY);

  const radius = 32;

  // Card fondo
  ctx.save();
  ctx.shadowColor = pal.cardShadow;
  ctx.shadowBlur = 24;
  ctx.shadowOffsetY = 8;
  ctx.fillStyle = pal.cardBg;
  roundRect(ctx, rect.x, rect.y, rect.w, rect.h, radius);
  ctx.fill();
  ctx.restore();
  if (pal.cardBorder) {
    ctx.strokeStyle = pal.cardBorder;
    ctx.lineWidth = 1.5;
    roundRect(ctx, rect.x, rect.y, rect.w, rect.h, radius);
    ctx.stroke();
  }

  // Foto arriba
  const photoH = rect.h * 0.68;
  ctx.save();
  ctx.beginPath();
  const rr = radius;
  const px = rect.x, py = rect.y, pw = rect.w, ph = photoH;
  ctx.moveTo(px + rr, py);
  ctx.lineTo(px + pw - rr, py);
  ctx.arcTo(px + pw, py, px + pw, py + rr, rr);
  ctx.lineTo(px + pw, py + ph);
  ctx.lineTo(px, py + ph);
  ctx.lineTo(px, py + rr);
  ctx.arcTo(px, py, px + rr, py, rr);
  ctx.clip();
  drawImageCover(ctx, img, px, py, pw, ph);
  ctx.restore();

  const textAreaY = rect.y + photoH;
  const textAreaH = rect.h - photoH;
  const nameY = textAreaY + textAreaH * 0.28;
  const priceY = textAreaY + textAreaH * 0.68;

  // Chip categoría
  const chipY = rect.y + 18;
  const chipX = rect.x + 18;
  const chipText = product.categoryLabel.toUpperCase();
  ctx.font = `700 16px "Manrope", sans-serif`;
  const chipTextW = ctx.measureText(chipText).width;
  const chipPad = 12;
  ctx.fillStyle = pal.chipBg;
  roundRect(ctx, chipX, chipY, chipTextW + chipPad*2, 26, 13);
  ctx.fill();
  ctx.fillStyle = pal.chipText;
  ctx.textAlign = "left";
  ctx.textBaseline = "middle";
  ctx.fillText(chipText, chipX + chipPad, chipY + 13);

  // Badge
  if (product.badge) {
    const bg = product.badge;
    const badgeText = bg.label.toUpperCase();
    ctx.font = `800 15px "Manrope", sans-serif`;
    const bTextW = ctx.measureText(badgeText).width;
    const bx = rect.x + rect.w - bTextW - 24 - 18;
    const by = chipY;
    const badgeColors = { new: COLORS.wine, top: "#D95C42", premium: COLORS.gold, special: "#4E7BA0" };
    ctx.fillStyle = badgeColors[bg.type] || COLORS.wine;
    roundRect(ctx, bx, by, bTextW + 24, 26, 13);
    ctx.fill();
    ctx.fillStyle = "white";
    ctx.textAlign = "left";
    ctx.fillText(badgeText, bx + 12, by + 13);
  }

  // Nombre
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillStyle = pal.cardText;
  const nameSize = Math.min(30, rect.w / 12);
  ctx.font = `500 ${nameSize}px "Fraunces", serif`;
  wrapText(ctx, product.name, rect.x + rect.w/2, nameY, rect.w - 40, nameSize * 1.15);

  // Precio
  const priceSize = Math.min(40, rect.w / 8);
  ctx.font = `600 ${priceSize}px "Fraunces", serif`;
  ctx.fillStyle = pal.accent;
  ctx.fillText(fmtPrice(product.price), rect.x + rect.w/2, priceY);

  ctx.restore();
}

/* Menú vertical: filas con foto a la izquierda, nombre+precio a la derecha */
function drawProductRowMenu(ctx, L, rect, product, entryProgress, theme) {
  if (entryProgress <= 0 || !product) return;
  const img = state.productImgs.get(product.id);
  if (!img) return;
  const pal = getPalette(theme);

  ctx.save();
  const p = clamp(entryProgress, 0, 1);
  const eased = easeOut(p);
  const translateX = (1 - eased) * -60;
  const opacity = eased;
  ctx.globalAlpha = opacity;
  ctx.translate(translateX, 0);

  // Foto cuadrada a la izquierda, redondeada
  const photoSize = rect.h - 20;
  const photoX = rect.x + 10;
  const photoY = rect.y + 10;

  ctx.save();
  ctx.shadowColor = pal.cardShadow;
  ctx.shadowBlur = 16;
  ctx.shadowOffsetY = 6;
  ctx.beginPath();
  roundRect(ctx, photoX, photoY, photoSize, photoSize, 22);
  ctx.fillStyle = "#000";
  ctx.fill();
  ctx.restore();

  ctx.save();
  ctx.beginPath();
  roundRect(ctx, photoX, photoY, photoSize, photoSize, 22);
  ctx.clip();
  drawImageCover(ctx, img, photoX, photoY, photoSize, photoSize);
  ctx.restore();

  // Badge (encima de la foto, esquina superior izquierda)
  if (product.badge) {
    const bg = product.badge;
    const badgeText = bg.label.toUpperCase();
    ctx.font = `800 14px "Manrope", sans-serif`;
    const bTextW = ctx.measureText(badgeText).width;
    const bx = photoX + 10;
    const by = photoY + 10;
    const badgeColors = { new: COLORS.wine, top: "#D95C42", premium: COLORS.gold, special: "#4E7BA0" };
    ctx.fillStyle = badgeColors[bg.type] || COLORS.wine;
    roundRect(ctx, bx, by, bTextW + 20, 22, 11);
    ctx.fill();
    ctx.fillStyle = "white";
    ctx.textAlign = "left";
    ctx.textBaseline = "middle";
    ctx.fillText(badgeText, bx + 10, by + 11);
  }

  // Texto a la derecha
  const textX = photoX + photoSize + 30;
  const textW = rect.x + rect.w - textX - 20;
  const centerY = rect.y + rect.h / 2;

  // Categoría (chiquita arriba)
  ctx.textAlign = "left";
  ctx.textBaseline = "alphabetic";
  ctx.font = `700 18px "Manrope", sans-serif`;
  ctx.fillStyle = pal.textSecondary;
  ctx.fillText(product.categoryLabel.toUpperCase(), textX, centerY - 44);

  // Nombre (Fraunces italic)
  ctx.font = `italic 500 42px "Fraunces", serif`;
  ctx.fillStyle = pal.textPrimary;
  const name = product.name;
  const nameMaxW = textW - 130; // dejamos espacio para el precio a la derecha
  let displayName = name;
  if (ctx.measureText(name).width > nameMaxW) {
    // truncar con …
    while (ctx.measureText(displayName + "…").width > nameMaxW && displayName.length > 4) {
      displayName = displayName.slice(0, -1);
    }
    displayName += "…";
  }
  ctx.fillText(displayName, textX, centerY + 8);

  // Precio a la derecha, alineado con el nombre
  ctx.textAlign = "right";
  ctx.font = `600 44px "Fraunces", serif`;
  ctx.fillStyle = pal.accent;
  const priceX = rect.x + rect.w - 30;
  ctx.fillText(fmtPrice(product.price), priceX, centerY + 8);

  // Línea decorativa debajo
  ctx.strokeStyle = pal.textSecondary;
  ctx.globalAlpha = opacity * 0.15;
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(textX, rect.y + rect.h - 8);
  ctx.lineTo(rect.x + rect.w - 20, rect.y + rect.h - 8);
  ctx.stroke();

  ctx.restore();
}

function wrapText(ctx, text, x, y, maxW, lineH) {
  const words = text.split(" ");
  const lines = [];
  let current = "";
  for (const w of words) {
    const test = current ? current + " " + w : w;
    if (ctx.measureText(test).width > maxW && current) {
      lines.push(current);
      current = w;
    } else {
      current = test;
    }
  }
  if (current) lines.push(current);
  // dibujar centrado verticalmente
  const totalH = lines.length * lineH;
  let cy = y - (totalH - lineH) / 2;
  for (const line of lines) {
    ctx.fillText(line, x, cy);
    cy += lineH;
  }
}

function drawFooter(ctx, L, progress, theme) {
  if (progress <= 0) return;
  const pal = getPalette(theme);
  ctx.save();
  const eased = easeOut(clamp(progress, 0, 1));
  const translateY = (1 - eased) * 40;
  ctx.globalAlpha = eased;
  ctx.translate(0, translateY);

  const footerY = L.footerTop;
  const ctaHeight = 90;
  const ctaW = L.W - L.pad * 2;
  const ctaX = L.pad;
  const ctaY = footerY + 30;

  ctx.fillStyle = pal.ctaBg;
  roundRect(ctx, ctaX, ctaY, ctaW, ctaHeight, ctaHeight/2);
  ctx.fill();

  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillStyle = pal.ctaText;
  ctx.font = `700 34px "Manrope", sans-serif`;
  ctx.fillText("Pide ya por WhatsApp", L.W/2, ctaY + ctaHeight/2);

  ctx.font = `500 26px "Manrope", sans-serif`;
  ctx.fillStyle = pal.textSecondary;
  const handleY = ctaY + ctaHeight + 48;
  ctx.fillText(`${CFG.HANDLE}  ·  ${CFG.LOCATION}`, L.W/2, handleY);

  ctx.restore();
}

/* ============ MAIN RENDER (frame en tiempo t 0..1) ============ */
function renderFrame(progress) {
  const products = state.selectedIds.map(id => window.PRODUCTS.find(p => p.id === id)).filter(Boolean);
  const L = computeLayout(state.format, products.length, state.style);
  const theme = state.theme;

  if (canvas.width !== L.W || canvas.height !== L.H) {
    canvas.width = L.W;
    canvas.height = L.H;
  }

  drawBackground(ctx, L, theme);

  if (products.length === 0) {
    const pal = getPalette(theme);
    ctx.save();
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillStyle = pal.textSecondary;
    ctx.globalAlpha = .6;
    ctx.font = `italic 500 60px "Fraunces", serif`;
    ctx.fillText("Elige los postres", L.W/2, L.H/2 - 40);
    ctx.font = `500 32px "Manrope", sans-serif`;
    ctx.fillText("disponibles hoy", L.W/2, L.H/2 + 30);
    ctx.restore();
    return;
  }

  // Remapeamos el tiempo total (0.0 a 1.0) para que toda la animación ocurra
  // dentro del primer 37.5% del video (3s de 8s). El resto (62.5% / 5s) queda estático al 100%.
  const animProgress = clamp(progress / 0.375, 0, 1);

  // Nueva línea de tiempo dentro de los primeros 3 segundos:
  // 0.00-0.10 → logo
  // 0.10-0.30 → título
  // 0.30-0.75 → productos escalonados
  // 0.75-1.00 → footer
  const logoP = clamp(animProgress / 0.10, 0, 1);
  drawLogo(ctx, L, logoP, theme);

  const titleP = clamp((animProgress - 0.10) / 0.20, 0, 1);
  const titleOp = clamp((animProgress - 0.10) / 0.10, 0, 1);
  drawTitle(ctx, L, state.title, state.subtitle, titleOp, titleP, theme);

  const nProducts = products.length;
  const productsWindow = 0.75 - 0.30;
  const perProduct = productsWindow / Math.max(nProducts, 1);
  products.forEach((product, i) => {
    const start = 0.30 + i * (perProduct * 0.7);
    const p = clamp((animProgress - start) / (perProduct * 1.3), 0, 1);
    if (state.style === "menu") {
      drawProductRowMenu(ctx, L, L.rects[i], product, p, theme);
    } else {
      drawProductCardGrid(ctx, L, L.rects[i], product, p, theme);
    }
  });

  const footerP = clamp((animProgress - 0.75) / 0.25, 0, 1);
  drawFooter(ctx, L, footerP, theme);
}


/* ============ FLUJO DE PREVIEW (dibujar estado final) ============ */
function renderStatic() {
  renderFrame(1);
  updatePreviewInfo();
}

function updatePreviewInfo() {
  const L = FORMATS[state.format];
  document.getElementById("preview-size").textContent = L.label;
  document.getElementById("preview-count").textContent =
    `${state.selectedIds.length} postre${state.selectedIds.length !== 1 ? "s" : ""}`;
  previewFrame.classList.toggle("square", state.format === "square");
  previewFrame.classList.toggle("story", state.format === "story");
  // Botones habilitados solo con 3-5 postres
  const ok = state.selectedIds.length >= CFG.MIN_PRODUCTS && state.selectedIds.length <= CFG.MAX_PRODUCTS;
  document.getElementById("btn-png").disabled = !ok;
  document.getElementById("btn-mp4").disabled = !ok;
  document.getElementById("picker-count").textContent = `${state.selectedIds.length} / ${CFG.MAX_PRODUCTS}`;
}

/* ============ PICKER ============ */
function renderPicker() {
  const picker = document.getElementById("picker");
  picker.innerHTML = window.PRODUCTS.map(p => `
    <button class="pick-tile" data-id="${p.id}" title="${p.name}">
      <img src="${p.photo}" alt="" loading="lazy">
      <span class="pick-tile-name">${p.name}</span>
      <span class="pick-tile-index"></span>
    </button>
  `).join("");
  picker.addEventListener("click", (e) => {
    const tile = e.target.closest(".pick-tile");
    if (!tile) return;
    const id = tile.dataset.id;
    togglePick(id);
  });
}

function togglePick(id) {
  const i = state.selectedIds.indexOf(id);
  if (i >= 0) {
    state.selectedIds.splice(i, 1);
  } else {
    if (state.selectedIds.length >= CFG.MAX_PRODUCTS) {
      showToast(`Máximo ${CFG.MAX_PRODUCTS} postres por post`);
      return;
    }
    state.selectedIds.push(id);
    preloadProduct(id);
  }
  refreshPickerState();
  renderStatic();
  savePrefs();
}

function refreshPickerState() {
  document.querySelectorAll(".pick-tile").forEach(t => {
    const idx = state.selectedIds.indexOf(t.dataset.id);
    t.classList.toggle("selected", idx >= 0);
    if (idx >= 0) t.querySelector(".pick-tile-index").textContent = (idx + 1);
    // Disable when at max
    const atMax = state.selectedIds.length >= CFG.MAX_PRODUCTS && idx < 0;
    t.classList.toggle("disabled", atMax);
  });
}

/* ============ PRELOAD ============ */
async function preloadLogo() {
  if (state.logoImg) return;
  try {
    // IMPORTANTE: PNG y no SVG. Los SVG hacen "taint" el canvas en Chrome/Safari
    // (porque un SVG podría contener scripts), y eso rompe toDataURL y captureStream.
    // El PNG rasterizado nos deja exportar imagen y video sin problemas.
    state.logoImg = await loadImage("assets/logo.png");
  } catch (e) {
    console.warn("Logo no cargó:", e.message);
  }
}
async function preloadProduct(id) {
  if (state.productImgs.has(id)) return state.productImgs.get(id);
  const p = window.PRODUCTS.find(x => x.id === id);
  if (!p) return null;
  try {
    const img = await loadImage(p.photo);
    state.productImgs.set(id, img);
    renderStatic(); // re-render con la imagen ya cargada
    return img;
  } catch (e) {
    console.warn(`Foto ${id} no cargó:`, e.message);
    return null;
  }
}

/* ============ CONTROLES ============ */
function setupControls() {
  // Formato
  document.querySelectorAll(".chip[data-format]").forEach(chip => {
    chip.addEventListener("click", () => {
      document.querySelectorAll(".chip[data-format]").forEach(c => c.classList.remove("active"));
      chip.classList.add("active");
      state.format = chip.dataset.format;
      renderStatic();
      savePrefs();
    });
  });

  // Estilo
  document.querySelectorAll(".chip[data-style]").forEach(chip => {
    chip.addEventListener("click", () => {
      document.querySelectorAll(".chip[data-style]").forEach(c => c.classList.remove("active"));
      chip.classList.add("active");
      state.style = chip.dataset.style;
      renderStatic();
      savePrefs();
    });
  });

  // Fondo (tema)
  document.querySelectorAll(".chip[data-theme]").forEach(chip => {
    chip.addEventListener("click", () => {
      document.querySelectorAll(".chip[data-theme]").forEach(c => c.classList.remove("active"));
      chip.classList.add("active");
      state.theme = chip.dataset.theme;
      renderStatic();
      savePrefs();
    });
  });

  const titleIn = document.getElementById("in-title");
  const subIn = document.getElementById("in-subtitle");
  titleIn.addEventListener("input", () => {
    state.title = titleIn.value || "Disponibles hoy";
    renderStatic();
    savePrefs();
  });
  subIn.addEventListener("input", () => {
    state.subtitle = subIn.value;
    renderStatic();
    savePrefs();
  });

  document.getElementById("btn-clear").addEventListener("click", () => {
    state.selectedIds = [];
    refreshPickerState();
    renderStatic();
    savePrefs();
  });

  document.getElementById("btn-png").addEventListener("click", exportPNG);
  document.getElementById("btn-mp4").addEventListener("click", exportVideo);
}

/* ============ EXPORT PNG ============ */
async function exportPNG() {
  try {
    renderStatic();
    const dataUrl = canvas.toDataURL("image/png");
    if (!dataUrl || dataUrl === "data:,") {
      throw new Error("El canvas no pudo generar la imagen (¿imagen no cargada?)");
    }
    const a = document.createElement("a");
    a.href = dataUrl;
    a.download = `delights-${state.style}-${state.theme}-${state.format}-${Date.now()}.png`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    showToast("Imagen descargada ✓");
    console.log("[png] OK");
  } catch (err) {
    console.error("[png] Falló:", err);
    // Detectar el error clásico de canvas tainted
    if (err.name === "SecurityError" || String(err).includes("tainted")) {
      showToast("Error de seguridad al exportar. Recargá la página y probá de nuevo.");
    } else {
      showToast(err.message || "Error al descargar la imagen");
    }
  }
}

/* ============ EXPORT VIDEO ============ */
async function exportVideo() {
  const btn = document.getElementById("btn-mp4");
  btn.disabled = true;
  showRec(true);

  try {
    if (typeof MediaRecorder === "undefined") {
      throw new Error("Tu navegador no soporta MediaRecorder. Probá Chrome, Edge o Safari 14+.");
    }
    if (typeof canvas.captureStream !== "function") {
      throw new Error("Tu navegador no soporta canvas.captureStream. Actualizá el navegador.");
    }

    // Intento 1: MP4 (mejor para Instagram)
    console.log("[video] Intento 1: MP4");
    let result = await tryRecordCanvas("mp4");

    // Fallback: WebM si MP4 no dio suficiente contenido
    if (!result || result.size < 50_000) {
      console.warn(`[video] MP4 dio ${result?.size ?? 0} bytes → fallback a WebM`);
      console.log("[video] Intento 2: WebM");
      result = await tryRecordCanvas("webm");
    }

    if (!result || result.size < 50_000) {
      throw new Error("El navegador no generó un video válido. Probá Chrome desktop actualizado.");
    }

    // Descarga
    const url = URL.createObjectURL(result.blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `delights-${state.style}-${state.theme}-${state.format}-${Date.now()}.${result.ext}`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    setTimeout(() => URL.revokeObjectURL(url), 2000);

    const mb = (result.size / 1024 / 1024).toFixed(1);
    showToast(`Video ${result.ext.toUpperCase()} · ${mb} MB ✓`);
    console.log(`[video] OK · ${result.ext} · ${result.size} bytes`);
  } catch (err) {
    console.error("[video] Falló:", err);
    showToast(err.message || "Error al generar video");
  } finally {
    showRec(false);
    btn.disabled = false;
    setTimeout(renderStatic, 500);
  }
}

async function tryRecordCanvas(preferKind) {
  const candidates = preferKind === "mp4"
    ? ["video/mp4;codecs=avc1.42E01F", "video/mp4;codecs=avc1.42001E", "video/mp4;codecs=avc1", "video/mp4"]
    : ["video/webm;codecs=vp9", "video/webm;codecs=vp8", "video/webm"];

  const mime = candidates.find(t => MediaRecorder.isTypeSupported(t));
  if (!mime) {
    console.log(`[video] ${preferKind} no soportado`);
    return null;
  }
  const ext = mime.startsWith("video/mp4") ? "mp4" : "webm";
  document.getElementById("vid-format").textContent = ext.toUpperCase();
  console.log(`[video] Usando ${mime}`);

  const stream = canvas.captureStream(CFG.FPS);
  if (!stream || stream.getVideoTracks().length === 0) {
    console.warn("[video] captureStream sin tracks");
    return null;
  }

  let recorder;
  try {
    recorder = new MediaRecorder(stream, { mimeType: mime, videoBitsPerSecond: 3_500_000 });
  } catch (e) {
    console.warn("[video] Constructor con bitrate falló, retry sin bitrate:", e.message);
    try {
      recorder = new MediaRecorder(stream, { mimeType: mime });
    } catch (e2) {
      console.error("[video] Constructor falló totalmente:", e2);
      return null;
    }
  }

  const chunks = [];
  let recorderError = null;
  recorder.ondataavailable = (e) => {
    if (e.data && e.data.size > 0) chunks.push(e.data);
  };
  recorder.onerror = (e) => {
    recorderError = e.error || new Error("MediaRecorder emitió error");
    console.error("[video] recorder.onerror:", recorderError);
  };

  const stopped = new Promise((resolve) => { recorder.onstop = resolve; });

  recorder.start(200);   // chunks cada 200ms — clave para Safari y algunas versiones de Chrome
  console.log(`[video] Recorder iniciado, state=${recorder.state}`);

const totalFrames = Math.round((CFG.DURATION_MS / 1000) * CFG.FPS);
  const recTime = document.getElementById("rec-time");

  await new Promise((resolve) => {
    let currentFrame = 0;

    function renderNextStep() {
      const t = currentFrame / totalFrames;
      renderFrame(t);

      const elapsedSec = (t * (CFG.DURATION_MS / 1000)).toFixed(1);
      recTime.textContent = elapsedSec;

      if (currentFrame >= totalFrames) {
        renderFrame(1);
        setTimeout(resolve, 500);
        return;
      }

      currentFrame++;
      setTimeout(renderNextStep, 1000 / CFG.FPS);
    }

    renderNextStep();
  });

  if (recorder.state !== "inactive") {
    try { recorder.requestData(); } catch (_) {}
    recorder.stop();
  }
  await stopped;

  if (recorderError) return null;

  const totalSize = chunks.reduce((s, c) => s + c.size, 0);
  console.log(`[video] Terminado: ${chunks.length} chunks, ${totalSize} bytes`);
  const blob = new Blob(chunks, { type: mime });
  return { blob, size: blob.size, ext, mime };
}

function showRec(show) {
  document.getElementById("rec-badge").classList.toggle("show", show);
}

/* ============ PREFS EN LOCALSTORAGE ============ */
const PREFS_KEY = "delights_post_editor_v1";
function savePrefs() {
  try {
    localStorage.setItem(PREFS_KEY, JSON.stringify({
      format: state.format,
      style: state.style,
      theme: state.theme,
      title: state.title,
      subtitle: state.subtitle,
      selectedIds: state.selectedIds,
    }));
  } catch (e) {}
}
function loadPrefs() {
  try {
    const raw = localStorage.getItem(PREFS_KEY);
    if (!raw) return;
    const p = JSON.parse(raw);
    if (p.format && FORMATS[p.format]) state.format = p.format;
    if (p.style === "grid" || p.style === "menu") state.style = p.style;
    if (["warm","vino","rosa","terracota"].includes(p.theme)) state.theme = p.theme;
    if (typeof p.title === "string") state.title = p.title;
    if (typeof p.subtitle === "string") state.subtitle = p.subtitle;
    if (Array.isArray(p.selectedIds)) {
      state.selectedIds = p.selectedIds.filter(id => window.PRODUCTS.find(x => x.id === id)).slice(0, CFG.MAX_PRODUCTS);
    }
  } catch (e) {}
}

/* ============ TOAST ============ */
let toastTimer;
function showToast(msg) {
  const t = document.getElementById("toast");
  document.getElementById("toast-text").textContent = msg;
  t.classList.add("show");
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => t.classList.remove("show"), 2400);
}

/* ============ INIT ============ */
async function init() {
  overlay.classList.add("show");
  loadPrefs();

  // Reflejar prefs en la UI
  document.getElementById("in-title").value = state.title;
  document.getElementById("in-subtitle").value = state.subtitle;
  document.querySelectorAll(".chip[data-format]").forEach(c => {
    c.classList.toggle("active", c.dataset.format === state.format);
  });
  document.querySelectorAll(".chip[data-style]").forEach(c => {
    c.classList.toggle("active", c.dataset.style === state.style);
  });
  document.querySelectorAll(".chip[data-theme]").forEach(c => {
    c.classList.toggle("active", c.dataset.theme === state.theme);
  });

  renderPicker();
  refreshPickerState();
  setupControls();

  // Preload
  await preloadLogo();
  // preload solo las fotos seleccionadas (rápido)
  await Promise.all(state.selectedIds.map(id => preloadProduct(id)));

  // Esperar fuentes cargadas
  try {
    await document.fonts.ready;
  } catch (e) {}

  renderStatic();
  overlay.classList.remove("show");
}

init();
