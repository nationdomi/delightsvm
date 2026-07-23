# Delights by VM — Boutique de postres

Sitio estático construido en HTML + CSS + JS puro. Todo en un solo lugar, listo para subir a cualquier hosting estático.

## Estructura

```
delights/
├── index.html          Single-page site
├── styles.css          Todos los estilos
├── script.js           Catálogo, carrito y checkout WhatsApp
├── README.md           Este archivo
└── assets/
    ├── logo.svg        Logo Delights by VM
    ├── og.jpg          Tarjeta social (1200x630)
    └── products/       8 fotos de producto optimizadas
```

## Configuración rápida

Los tres ajustes que probablemente quieras editar:

### 1. Número de WhatsApp
`script.js`, línea ~5:
```js
const CONFIG = {
  WHATSAPP: "593997177039",   // <-- acá
  DEPOSIT_PCT: 0.5,           // 50% de depósito
  ...
};
```

### 2. Precios, productos y badges
`script.js`, arreglo `PRODUCTS`. Cada producto:
```js
{
  id: "chococrunch",
  name: "Chococrunch",
  category: "edicion-chocolate",       // debe existir en CATEGORIES
  categoryLabel: "Edición Chocolate",  // el chip que aparece en la card
  price: 2.00,
  badge: { type: "new", label: "Nuevo" },  // opcional
  photo: "assets/products/chococrunch.jpg",
  description: "Capas de bizcocho de chocolate...",
}
```

Badges disponibles: `new` (vino), `top` (naranja), `premium` (dorado), `special` (celeste).

### 3. FAQ
Editá directamente los `<details class="faq-item">` en `index.html`.

## Editor de posts (herramienta interna) 🎨

En `posts.html` hay una herramienta oculta para que **Viviana genere posts diarios** de Instagram.
- Acceso: `tudominio.com/posts.html` (no está linkeada desde el sitio público)
- Elige el formato: **Feed 4:5 · Feed 1:1 · Story 9:16**
- Selecciona **3 a 5 postres** disponibles del día
- Edita el título ("Disponibles hoy" por defecto) y un subtítulo opcional
- Descarga como **imagen PNG** en alta calidad
- Descarga como **video de 8 segundos** con animación editorial (logo → título → postres entrando uno a uno → CTA de WhatsApp subiendo)

Formato del video: intenta MP4 (H.264) primero, cae a WebM si el navegador no lo soporta. Chrome desktop y Safari 14+ dan MP4 nativo. Instagram acepta ambos, aunque MP4 es más universal.

Sus preferencias (título, subtítulo, selección) se guardan en localStorage para que el editor recuerde entre sesiones.

## Deploy en GitHub Pages + Namecheap

1. Creá un repo (por ejemplo `delights-by-vm`) y subí todos los archivos.
2. En `Settings → Pages`, seleccioná la branch `main` y carpeta `/root`.
3. En Namecheap, apuntá el dominio con:
   - **A records** al apex: `185.199.108.153`, `185.199.109.153`, `185.199.110.153`, `185.199.111.153`
   - **CNAME** `www` → `tu-usuario.github.io`
4. En GitHub Pages, agregá tu Custom Domain y activá HTTPS.

Alternativa más simple: **Netlify** o **Vercel** (arrastrar la carpeta al drop zone y listo).

## Detalles técnicos

- **Sin dependencias** — no requiere build, ni npm, ni frameworks.
- **Fuentes**: Fraunces (display) + Manrope (body) desde Google Fonts.
- **Carrito**: persistido en `localStorage` (clave `delights_cart_v1`).
- **Checkout**: genera un mensaje estructurado y abre `wa.me/...` en pestaña nueva. Funciona en Safari iOS.
- **Depósito 50%**: se calcula automáticamente del total del carrito.
- **Accesibilidad**: navegable con teclado, `aria-label` en botones ícono, respeta `prefers-reduced-motion`.
- **Performance**: fotos optimizadas (~100KB c/u), fuentes con `preconnect`, imágenes con `loading="lazy"`.

## Fotos de producto

Actualmente hay 8 fotos propias en `assets/products/` (las que subiste):
- chococrunch.jpg
- cheesecake-galak.jpg
- noir-maracuya.jpg
- pave-franui.jpg
- pave-leche-vaquita.jpg
- pave-milo.jpg
- pave-quipitos.jpg
- vaso-patagonico.jpg

Los otros 9 productos usan las URLs que ya tenías en `raw.githubusercontent.com/nationdomi/images/`. Cuando tengas fotos propias de esos productos, subílas a `assets/products/` y editá el `photo:` en `script.js`.

## Instagram grid

La sección "Detrás de cada creación" muestra 8 fotos en grilla que enlazan al perfil `@delightsbyvm`. Como el sitio es estático y no queremos exponer un token de API de Instagram, usamos las fotos de producto como preview. Si querés que sean posts reales, se puede sumar Elfsight, LightWidget o un feed pre-generado por script.

## Ajustes finos

- **Colores**: variables CSS en `:root` de `styles.css`. Cambiá `--wine`, `--peach`, etc. y se propaga.
- **Producto destacado del hero**: cambiar `src` de `#hero-photo` y la badge/precio.
- **Copy del hero**: `.hero-title`, `.hero-sub`.
