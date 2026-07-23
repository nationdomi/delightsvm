/* ================================================================
   DELIGHTS BY VM — Data compartida entre el sitio y el editor de posts
   Editar productos, precios o descripciones acá.
================================================================ */

window.CATEGORIES = [
  { id: "edicion-chocolate",  label: "Edición Chocolate" },
  { id: "cheesecakes",        label: "Cheesecakes" },
  { id: "paves-tradicionales",label: "Pavés · Sabores Tradicionales" },
  { id: "paves-premium",      label: "Pavés · Sabores Premium" },
  { id: "toque-fresco",       label: "Los del Toque Fresco" },
  { id: "gelatinas",          label: "Gelatinas" },
];

window.PRODUCTS = [
  // ────── EDICIÓN CHOCOLATE ──────
  {
    id: "chococrunch",
    name: "Chococrunch",
    category: "edicion-chocolate",
    categoryLabel: "Edición Chocolate",
    price: 2.00,
    badge: { type: "new", label: "Nuevo" },
    photo: "assets/products/chococrunch.jpg",
    description: "Capas de bizcocho de chocolate súper húmedo intercaladas con capas de ganache de chocolate. Coronado con nuestra capa mega crujiente de cereal envuelto en crema de avellanas.",
  },
  {
    id: "vaso-oreo",
    name: "Vaso de Oreo",
    category: "edicion-chocolate",
    categoryLabel: "Edición Chocolate",
    price: 1.50,
    photo: "assets/products/vaso-oreo.jpg",
    description: "Capas de bizcocho de chocolate húmedo, dulce de leche y doble crema de galleta oreo, con un topping de chispas de chocolate.",
  },
  {
    id: "chocotorta",
    name: "Chocotorta",
    category: "edicion-chocolate",
    categoryLabel: "Edición Chocolate",
    price: 1.75,
    photo: "assets/products/chocotorta.jpg",
    description: "Capas de bizcocho de chocolate húmedo, relleno de crema de chocotorta argentina con dulce de leche y queso crema, coronado con chips de chocolate.",
  },
  {
    id: "vaso-patagonico",
    name: "Vaso Patagónico",
    category: "edicion-chocolate",
    categoryLabel: "Edición Chocolate",
    price: 1.75,
    badge: { type: "special", label: "Ed. Especial" },
    photo: "assets/products/vaso-patagonico.jpg",
    description: "Capas de bizcocho húmedo de chocolate, mermelada casera de frutos rojos, y una ganache de crema Bariloche. Coronado con trozos de Franui y de arándanos cubiertos en chocolate.",
  },
  {
    id: "noir-maracuya",
    name: "Noir Maracuyá",
    category: "edicion-chocolate",
    categoryLabel: "Edición Chocolate",
    price: 1.75,
    photo: "assets/products/noir-maracuya.jpg",
    description: "Capas de bizcocho de chocolate húmedo, relleno con un brigadeiro de maracuyá. Coronado con una ganache de chocolate semiamargo mezclada con crema de avellanas, y finalizado con frambuesas bañadas en chocolate con maracuyá.",
  },

  // ────── CHEESECAKES ──────
  {
    id: "cheesecake-frutos-rojos",
    name: "Cheesecake de Frutos Rojos",
    category: "cheesecakes",
    categoryLabel: "Cheesecake",
    price: 1.75,
    photo: "assets/products/cheesecake-frutos-rojos.jpg",
    description: "Nuestra clásica crema de cheesecake sobre base crocante de vainilla, coronada con mermelada artesanal de frutos rojos.",
  },
  {
    id: "cheesecake-galak",
    name: "Cheesecake de Galak",
    category: "cheesecakes",
    categoryLabel: "Cheesecake",
    price: 1.75,
    photo: "assets/products/cheesecake-galak.jpg",
    description: "Un cheesecake clásico y suave realzado con una generosa capa de ganache de chocolate 100% Galak, protagonista del sabor y la experiencia.",
  },
  {
    id: "cheesecake-maracuya",
    name: "Cheesecake de Maracuyá",
    category: "cheesecakes",
    categoryLabel: "Cheesecake",
    price: 1.50,
    photo: "assets/products/cheesecake-maracuya.jpg",
    description: "Base de galleta de vainilla, crema sedosa de cheesecake con pulpa de maracuyá y topping de mermelada artesanal de maracuyá.",
  },
  {
    id: "cheesecake-higos",
    name: "Cheesecake de Higos",
    category: "cheesecakes",
    categoryLabel: "Cheesecake",
    price: 1.50,
    photo: "assets/products/cheesecake-higos.jpg",
    description: "Crema de cheesecake con higos dentro de su mezcla, endulzado con su propio almíbar, base crocante de galleta de vainilla y coronado con una reducción artesanal de higos.",
  },

  // ────── PAVÉS TRADICIONALES ──────
  {
    id: "pave-leche-vaquita",
    name: "Pavé Leche Vaquita",
    category: "paves-tradicionales",
    categoryLabel: "Pavé Tradicional",
    price: 1.50,
    badge: { type: "top", label: "Más Vendido" },
    photo: "assets/products/pave-leche-vaquita.jpg",
    description: "Elaborado con leche en polvo La Vaquita integrada en la mezcla, entre cada capa y también en la superficie.",
  },
  {
    id: "pave-quipitos",
    name: "Pavé de Quipitos",
    category: "paves-tradicionales",
    categoryLabel: "Pavé Tradicional",
    price: 1.50,
    photo: "assets/products/pave-quipitos.jpg",
    description: "Un guiño a la infancia, se cubre con una generosa capa de quipitos que aportan color, textura y un toque divertido.",
  },
  {
    id: "pave-milo",
    name: "Pavé de Milo",
    category: "paves-tradicionales",
    categoryLabel: "Pavé Tradicional",
    price: 1.50,
    photo: "assets/products/pave-milo.jpg",
    description: "Capas de nuestra crema de pavé hecha con milo, Milo entre capas y en la superficie, coronado con gotas de chocolate.",
  },

  // ────── PAVÉS PREMIUM ──────
  {
    id: "pave-franui",
    name: "Pavé de Franui",
    category: "paves-premium",
    categoryLabel: "Pavé Premium",
    price: 1.75,
    badge: { type: "premium", label: "Premium" },
    photo: "assets/products/pave-franui.jpg",
    description: "Nuestro sabor más premium. Base de crema tradicional, capa de mermelada artesanal de frutos rojos y una delicada cobertura de chocolate semiamargo, coronado con franuis.",
  },
  {
    id: "pave-oreo",
    name: "Pavé de Oreo",
    category: "paves-premium",
    categoryLabel: "Pavé Premium",
    price: 1.75,
    photo: "assets/products/pave-oreo.jpg",
    description: "Su crema está fusionada con el relleno original de las galletas Oreo, acompañada de trozos y capas de oreo triturada que aportan textura.",
  },

  // ────── TOQUE FRESCO ──────
  {
    id: "carlota-durazno",
    name: "Carlota de Durazno",
    category: "toque-fresco",
    categoryLabel: "Toque Fresco",
    price: 1.50,
    photo: "assets/products/carlota-durazno.jpg",
    description: "Cremosa, delicada y con un toque fresco que la hace especial, terminada con un merengue suizo flameado para un contraste suave.",
  },
  {
    id: "lemon-pie-cup",
    name: "Lemon Pie Cup",
    category: "toque-fresco",
    categoryLabel: "Toque Fresco",
    price: 1.50,
    photo: "assets/products/lemon-pie-cup.jpg",
    description: "Capas de crema de limón, combinadas con capas de galleta de vainilla intercaladas, y coronado con una irresistible capa de merengue suizo flameado.",
  },

  // ────── GELATINAS ──────
  {
    id: "gelatina-mosaico",
    name: "Gelatina Mosaico",
    category: "gelatinas",
    categoryLabel: "Gelatina",
    price: 1.00,
    photo: "assets/products/gelatina-mosaico.jpg",
    description: "Cuatro sabores de gelatina en cubos envueltos en una base cremosa de gelatina elaborada con tres tipos de leche.",
  },
];
