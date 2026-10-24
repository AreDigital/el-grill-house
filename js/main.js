// ============================================
// EL GRILL HOUSE — Menú de escaneo QR / toma de pedidos
// No se envía nada por WhatsApp: el cliente arma una
// lista en pantalla y se la muestra a quien le toma el pedido.
// Para cambiar productos/fotos: editar js/products.js
// ============================================

const state = {
  categoria: Object.keys(MENU)[0],
  vista: "grid", // "lista" o "grid"
  lista: [],
  detalleActual: null,
  detalleQty: 1,
  detalleSalsas: [],
  detallePermiteSalsas: false,
  promoIndex: 0,
  promoTimer: null,
};

// ---------- utilidades ----------
function formatoPrecio(valor) {
  return "$" + valor.toLocaleString("es-CO");
}

function corta(texto, n = 58) {
  if (!texto) return "";
  return texto.length > n ? texto.slice(0, n).trim() + "…" : texto;
}

function guardarLista() {
  try {
    sessionStorage.setItem("grillhouse_lista", JSON.stringify(state.lista));
  } catch (e) {}
}

function cargarLista() {
  try {
    const guardada = sessionStorage.getItem("grillhouse_lista");
    if (guardada) state.lista = JSON.parse(guardada);
  } catch (e) {}
}

// ---------- render: banner promo (carrusel) ----------
function renderPromo() {
  const track = document.getElementById("promo-track");
  const dots = document.getElementById("promo-dots");

  track.innerHTML = BANNERS.map(b => {
    let overlay = "";
    if (b.tipo === "producto") {
      overlay = `
      <div class="promo-overlay">
        <span class="promo-eyebrow">Recomendada del mes</span>
        <h2>${PRODUCTO_DEL_MES.nombre}</h2>
        <span class="promo-price">${formatoPrecio(PRODUCTO_DEL_MES.precio)}</span>
      </div>`;
    } else if (b.frase) {
      overlay = `<div class="promo-phrase">${b.frase}</div>`;
    }
    return `
      <div class="promo-slide" data-tipo="${b.tipo}">
        <img src="${b.img}" alt="">
        ${overlay}
      </div>`;
  }).join("");

  dots.innerHTML = BANNERS.map((_, i) => `<span class="promo-dot"></span>`).join("");

  configurarPromo();
  irASlide(0, false);
  iniciarAutoplayPromo();
}

function irASlide(indice, animar = true) {
  const total = BANNERS.length;
  const track = document.getElementById("promo-track");
  state.promoIndex = ((indice % total) + total) % total;

  track.scrollTo({
    left: state.promoIndex * track.clientWidth,
    behavior: animar ? "smooth" : "auto"
  });
  actualizarPuntos();
}

function actualizarPuntos() {
  document.querySelectorAll(".promo-dot").forEach((dot, i) => {
    dot.classList.toggle("active", i === state.promoIndex);
  });
}

function iniciarAutoplayPromo() {
  clearInterval(state.promoTimer);
  if (BANNERS.length <= 1) return;
  state.promoTimer = setInterval(() => irASlide(state.promoIndex + 1), 5000);
}

// El deslizamiento con el dedo lo maneja el navegador (CSS scroll-snap).
// Aquí solo sincronizamos los puntos, pausamos el autoplay mientras el
// usuario toca el banner, y abrimos la ficha del producto al tocarlo.
function configurarPromo() {
  const track = document.getElementById("promo-track");
  let tocando = false;
  let reinicio;

  function programarReinicioAutoplay() {
    clearTimeout(reinicio);
    reinicio = setTimeout(() => { if (!tocando) iniciarAutoplayPromo(); }, 1200);
  }

  track.addEventListener("scroll", () => {
    const i = Math.round(track.scrollLeft / track.clientWidth);
    if (i !== state.promoIndex && i >= 0 && i < BANNERS.length) {
      state.promoIndex = i;
      actualizarPuntos();
    }
  }, { passive: true });

  track.addEventListener("touchstart", () => {
    tocando = true;
    clearInterval(state.promoTimer);
  }, { passive: true });

  ["touchend", "touchcancel"].forEach(evento => {
    track.addEventListener(evento, () => {
      tocando = false;
      programarReinicioAutoplay();
    }, { passive: true });
  });

  // El navegador no dispara "click" después de un deslizamiento,
  // así que no hay que distinguir entre tocar y arrastrar.
  track.addEventListener("click", (e) => {
    const slide = e.target.closest(".promo-slide");
    if (slide && slide.dataset.tipo === "producto") {
      abrirDetalle(PRODUCTO_DEL_MES, true);
    }
  });
}

// ---------- render: chips de categoría ----------
function renderChips() {
  const cont = document.getElementById("chip-row");
  cont.innerHTML = Object.entries(MENU).map(([clave, cat]) => `
    <button class="chip ${clave === state.categoria ? "active" : ""}" data-cat="${clave}">
      ${cat.chipLabel || cat.titulo}
    </button>
  `).join("");

  cont.querySelectorAll(".chip").forEach(btn => {
    btn.addEventListener("click", () => {
      state.categoria = btn.dataset.cat;
      renderChips();
      renderLista();
    });
  });
}

// ---------- render: filas o cuadrícula de producto ----------
function renderLista() {
  const cont = document.getElementById("product-list");
  const items = MENU[state.categoria].items;
  let grupoActual = null;

  if (state.vista === "grid") {
    cont.classList.add("grid-view");
    cont.innerHTML = items.map((item, i) => {
      const header = item.grupo && item.grupo !== grupoActual
        ? `<div class="group-header">${(grupoActual = item.grupo)}</div>` : "";
      return `${header}
      <button class="grid-item" data-idx="${i}">
        <div class="grid-img ${item.img ? "" : "placeholder"}">
          ${item.nuevo ? '<span class="badge-new">Nuevo</span>' : ""}
          ${item.img ? `<img src="${item.img}" alt="${item.nombre}">` : ""}
        </div>
        <h3>${item.nombre}</h3>
        <div class="grid-price">${formatoPrecio(item.precio)}</div>
      </button>
    `;
    }).join("");
  } else {
    cont.classList.remove("grid-view");
    cont.innerHTML = items.map((item, i) => {
      const header = item.grupo && item.grupo !== grupoActual
        ? `<div class="group-header">${(grupoActual = item.grupo)}</div>` : "";
      return `${header}
      <button class="row-item" data-idx="${i}">
        <div class="row-img ${item.img ? "" : "placeholder"}">
          ${item.nuevo ? '<span class="badge-new">Nuevo</span>' : ""}
          ${item.img ? `<img src="${item.img}" alt="${item.nombre}">` : ""}
        </div>
        <div class="row-text">
          <h3>${item.nombre}</h3>
          <p>${corta(item.descripcion)}</p>
        </div>
        <div class="row-price">${formatoPrecio(item.precio)}</div>
      </button>
    `;
    }).join("");
  }

  const selector = state.vista === "grid" ? ".grid-item" : ".row-item";
  const permiteSalsas = !!MENU[state.categoria].permiteSalsas;
  cont.querySelectorAll(selector).forEach(el => {
    el.addEventListener("click", () => {
      const item = items[el.dataset.idx];
      abrirDetalle(item, permiteSalsas);
    });
  });
}

function actualizarBotonVista() {
  const label = document.getElementById("view-toggle-label");
  const icon = document.getElementById("view-toggle-icon");
  if (state.vista === "lista") {
    label.textContent = "Ver en cuadrícula";
    icon.innerHTML = "&#9638;";
  } else {
    label.textContent = "Ver en lista";
    icon.innerHTML = "&#9776;";
  }
}

// ---------- sheet de detalle ----------
function abrirDetalle(item, permiteSalsas = false) {
  state.detalleActual = item;
  state.detalleQty = 1;
  state.detalleSalsas = [];
  state.detallePermiteSalsas = permiteSalsas;

  document.getElementById("detail-img").src = item.img || "assets/logo.png";
  document.getElementById("detail-nombre").textContent = item.nombre;
  document.getElementById("detail-desc").textContent = item.descripcion || "";
  document.getElementById("detail-precio").textContent = formatoPrecio(item.precio);
  document.getElementById("qty-value").textContent = "1";

  const seccionSalsa = document.getElementById("salsa-section");
  seccionSalsa.hidden = !permiteSalsas;
  if (permiteSalsas) renderSalsaGrid();

  abrirSheet("detail-sheet", "detail-backdrop");
}

function renderSalsaGrid() {
  const cont = document.getElementById("salsa-grid");
  const limite = state.detalleSalsas.length >= MAX_SALSAS;

  cont.innerHTML = SALSAS.map(s => {
    const seleccionada = state.detalleSalsas.includes(s);
    const bloqueada = limite && !seleccionada;
    return `<button type="button" class="salsa-chip ${seleccionada ? "selected" : ""} ${bloqueada ? "disabled" : ""}" data-salsa="${s}">${s}</button>`;
  }).join("");

  cont.querySelectorAll(".salsa-chip").forEach(btn => {
    btn.addEventListener("click", () => toggleSalsa(btn.dataset.salsa));
  });
}

function toggleSalsa(nombre) {
  const idx = state.detalleSalsas.indexOf(nombre);
  if (idx > -1) {
    state.detalleSalsas.splice(idx, 1);
  } else if (state.detalleSalsas.length < MAX_SALSAS) {
    state.detalleSalsas.push(nombre);
  }
  renderSalsaGrid();
}

function abrirSheet(sheetId, backdropId) {
  document.getElementById(sheetId).classList.add("open");
  document.getElementById(backdropId).classList.add("open");
}

function cerrarSheet(sheetId, backdropId) {
  document.getElementById(sheetId).classList.remove("open");
  document.getElementById(backdropId).classList.remove("open");
}

// ---------- carrito / lista ----------
function agregarALista() {
  const item = state.detalleActual;
  const qty = state.detalleQty;
  const salsas = [...state.detalleSalsas].sort();
  const mismasSalsas = (a) => JSON.stringify((a || []).slice().sort()) === JSON.stringify(salsas);
  const existente = state.lista.find(l => l.nombre === item.nombre && mismasSalsas(l.salsas));

  if (existente) {
    existente.cantidad += qty;
  } else {
    state.lista.push({ nombre: item.nombre, precio: item.precio, cantidad: qty, salsas });
  }

  guardarLista();
  renderCartBar();
  cerrarSheet("detail-sheet", "detail-backdrop");
}

function quitarDeLista(indice) {
  state.lista.splice(indice, 1);
  guardarLista();
  renderCartBar();
  renderListSheet();
}

function vaciarLista() {
  state.lista = [];
  guardarLista();
  renderCartBar();
  cerrarSheet("list-sheet", "list-backdrop");
}

function totalLista() {
  return state.lista.reduce((acc, l) => acc + l.precio * l.cantidad, 0);
}

function renderCartBar() {
  const bar = document.getElementById("cart-bar");
  const count = state.lista.reduce((acc, l) => acc + l.cantidad, 0);

  if (count === 0) {
    bar.hidden = true;
    return;
  }

  bar.hidden = false;
  document.getElementById("cart-count").textContent = count;
  document.getElementById("cart-total").textContent = formatoPrecio(totalLista());
}

function renderListSheet() {
  const cont = document.getElementById("list-items");

  if (state.lista.length === 0) {
    cont.innerHTML = `<p style="color:var(--muted); padding: 10px 0;">Tu lista está vacía.</p>`;
  } else {
    cont.innerHTML = state.lista.map((l, i) => `
      <div class="list-item">
        <div class="list-item-info">
          <h4>${l.nombre}</h4>
          <span>x${l.cantidad}${l.salsas && l.salsas.length ? " · " + l.salsas.join(", ") : ""}</span>
        </div>
        <div class="list-item-right">
          <span class="list-item-price">${formatoPrecio(l.precio * l.cantidad)}</span>
          <button class="remove-item" data-idx="${i}" aria-label="Quitar">&times;</button>
        </div>
      </div>
    `).join("");

    cont.querySelectorAll(".remove-item").forEach(btn => {
      btn.addEventListener("click", () => quitarDeLista(Number(btn.dataset.idx)));
    });
  }

  document.getElementById("list-total").innerHTML = `<span>Total</span><span>${formatoPrecio(totalLista())}</span>`;
}

// ---------- footer ----------
function renderFooter() {
  document.getElementById("footer-direccion").textContent = NEGOCIO.direccion;
  document.getElementById("footer-domicilios").textContent = NEGOCIO.domicilios;
}

// ---------- eventos generales ----------
document.addEventListener("DOMContentLoaded", () => {
  cargarLista();
  renderPromo();
  renderChips();
  actualizarBotonVista();
  renderLista();
  renderFooter();
  renderCartBar();

  document.getElementById("view-toggle").addEventListener("click", () => {
    state.vista = state.vista === "lista" ? "grid" : "lista";
    actualizarBotonVista();
    renderLista();
  });

  document.getElementById("detail-close").addEventListener("click", () => {
    cerrarSheet("detail-sheet", "detail-backdrop");
  });
  document.getElementById("detail-backdrop").addEventListener("click", () => {
    cerrarSheet("detail-sheet", "detail-backdrop");
  });

  document.getElementById("qty-minus").addEventListener("click", () => {
    state.detalleQty = Math.max(1, state.detalleQty - 1);
    document.getElementById("qty-value").textContent = state.detalleQty;
  });
  document.getElementById("qty-plus").addEventListener("click", () => {
    state.detalleQty += 1;
    document.getElementById("qty-value").textContent = state.detalleQty;
  });

  document.getElementById("detail-add").addEventListener("click", agregarALista);

  document.getElementById("cart-bar").addEventListener("click", () => {
    renderListSheet();
    abrirSheet("list-sheet", "list-backdrop");
  });

  document.getElementById("list-close").addEventListener("click", () => {
    cerrarSheet("list-sheet", "list-backdrop");
  });
  document.getElementById("list-backdrop").addEventListener("click", () => {
    cerrarSheet("list-sheet", "list-backdrop");
  });

  document.getElementById("list-clear").addEventListener("click", vaciarLista);
});
