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
  editandoIndice: null,
  detalleQty: 1,
  detalleSalsas: [],
  detalleSinSalsa: false,
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
  const salsasExtra = MENU[state.categoria].salsasExtra || [];
  cont.querySelectorAll(selector).forEach(el => {
    el.addEventListener("click", () => {
      const item = items[el.dataset.idx];
      abrirDetalle(item, permiteSalsas, salsasExtra);
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
function abrirDetalle(item, permiteSalsas = false, salsasExtra = [], edicion = null) {
  state.editandoIndice = edicion ? edicion.indice : null;
  state.detalleSalsasExtra = salsasExtra;
  state.detalleActual = item;
  state.detalleQty = 1;
  state.detalleSalsas = [];
  state.detalleSinSalsa = false;
  state.detallePermiteSalsas = permiteSalsas;

  document.getElementById("detail-img").src = item.img || "assets/logo.png";
  document.getElementById("detail-nombre").textContent = item.nombre;
  document.getElementById("detail-desc").textContent = item.descripcion || "";
  document.getElementById("detail-precio").textContent = formatoPrecio(item.precio);
  document.getElementById("qty-value").textContent = "1";

  const seccionSalsa = document.getElementById("salsa-section");
  seccionSalsa.hidden = !permiteSalsas;
  document.getElementById("salsa-aviso").hidden = true;
  if (permiteSalsas) renderSalsaGrid();
  actualizarBotonAnadir();

  if (edicion) {
    state.detalleQty = edicion.linea.cantidad;
    state.detalleSalsas = [...(edicion.linea.salsas || [])];
    state.detalleSinSalsa = !!edicion.linea.sinSalsa;
    document.getElementById("qty-value").textContent = state.detalleQty;
    if (permiteSalsas) renderSalsaGrid();
    actualizarBotonAnadir();
  }
  document.getElementById("detail-add").textContent = edicion ? "Actualizar" : "Añadir a mi lista";

  const resumen = document.getElementById("detail-lista-total");
  resumen.hidden = state.lista.length === 0 || !!edicion;
  resumen.textContent = `En tu lista llevas ${formatoPrecio(totalLista())}`;

  abrirSheet("detail-sheet", "detail-backdrop");
}

function renderSalsaGrid() {
  const cont = document.getElementById("salsa-grid");
  document.getElementById("salsa-nota").textContent =
    `Desde la ${SALSAS_INCLUIDAS + 1}ª salsa: +${formatoPrecio(PRECIO_SALSA_EXTRA)} c/u`;

  const chipSin = `<button type="button" class="salsa-chip sin-salsa ${state.detalleSinSalsa ? "selected" : ""}" data-sin="1">Sin salsas</button>`;

  cont.innerHTML = (state.detalleSalsasExtra || []).concat(SALSAS).map(s => {
    const seleccionada = state.detalleSalsas.includes(s);
    const pos = state.detalleSalsas.indexOf(s);
    const esExtra = seleccionada && pos >= SALSAS_INCLUIDAS;
    const marca = esExtra ? `<span class="salsa-extra">+${formatoPrecio(PRECIO_SALSA_EXTRA)}</span>` : "";
    return `<button type="button" class="salsa-chip ${seleccionada ? "selected" : ""}" data-salsa="${s}">${s}${marca}</button>`;
  }).join("") + chipSin;

  cont.querySelectorAll(".salsa-chip").forEach(btn => {
    btn.addEventListener("click", () => {
      if (btn.dataset.sin) toggleSinSalsa();
      else toggleSalsa(btn.dataset.salsa);
    });
  });
  actualizarBotonAnadir();
}

function toggleSalsa(nombre) {
  const idx = state.detalleSalsas.indexOf(nombre);
  if (idx > -1) {
    state.detalleSalsas.splice(idx, 1);
  } else {
    state.detalleSalsas.push(nombre);
    state.detalleSinSalsa = false;
  }
  renderSalsaGrid();
}

function toggleSinSalsa() {
  state.detalleSinSalsa = !state.detalleSinSalsa;
  if (state.detalleSinSalsa) state.detalleSalsas = [];
  renderSalsaGrid();
}

// En hamburguesas y parrilla hay que elegir salsas o "Sin salsas" antes de añadir
function salsaPendiente() {
  return state.detallePermiteSalsas && !state.detalleSinSalsa && state.detalleSalsas.length === 0;
}

function actualizarBotonAnadir() {
  const pendiente = salsaPendiente();
  const btn = document.getElementById("detail-add");
  btn.classList.toggle("pendiente", pendiente);
  btn.setAttribute("aria-disabled", pendiente ? "true" : "false");
  if (!pendiente) document.getElementById("salsa-aviso").hidden = true;
  actualizarPrecioDetalle();
}

function salsasAdicionales() {
  return Math.max(0, state.detalleSalsas.length - SALSAS_INCLUIDAS);
}

function actualizarPrecioDetalle() {
  const item = state.detalleActual;
  if (!item) return;
  const extras = salsasAdicionales();
  const costoExtra = extras * PRECIO_SALSA_EXTRA;
  document.getElementById("detail-precio").textContent = formatoPrecio(item.precio + costoExtra);

  const detalle = document.getElementById("detail-precio-extra");
  detalle.hidden = !extras;
  if (extras) {
    detalle.textContent = `${formatoPrecio(item.precio)} + ${formatoPrecio(costoExtra)} por ${extras} ${extras > 1 ? "salsas adicionales" : "salsa adicional"}`;
  }
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
  if (salsaPendiente()) {
    const aviso = document.getElementById("salsa-aviso");
    aviso.hidden = false;
    document.getElementById("salsa-section").scrollIntoView({ behavior: "smooth", block: "center" });
    return;
  }

  const item = state.detalleActual;
  const qty = state.detalleQty;
  const sinSalsa = state.detalleSinSalsa;
  const salsas = [...state.detalleSalsas]; // en el orden elegido: las primeras son las incluidas
  const adicionales = salsasAdicionales();
  const claveNueva = claveSalsas({ salsas, adicionales, sinSalsa });
  const indiceEdicion = state.editandoIndice;
  if (indiceEdicion !== null) state.lista.splice(indiceEdicion, 1);
  const existente = state.lista.find(l => l.nombre === item.nombre && claveSalsas(l) === claveNueva);

  if (existente) {
    existente.cantidad += qty;
  } else {
    const nueva = { nombre: item.nombre, precio: item.precio + adicionales * PRECIO_SALSA_EXTRA, cantidad: qty, salsas, sinSalsa, adicionales };
    if (indiceEdicion !== null) state.lista.splice(indiceEdicion, 0, nueva);
    else state.lista.push(nueva);
  }

  guardarLista();
  renderCartBar();
  cerrarDetalle();
}

// Cierra la tarjeta del producto; si se estaba editando, vuelve a "Mi lista"
function cerrarDetalle() {
  const editaba = state.editandoIndice !== null;
  state.editandoIndice = null;
  if (editaba) {
    unirIguales();
    guardarLista();
    renderCartBar();
  }
  cerrarSheet("detail-sheet", "detail-backdrop");
  if (editaba) {
    renderListSheet();
    abrirSheet("list-sheet", "list-backdrop");
  }
}

// Junta las líneas idénticas (mismo producto y mismas salsas) sumando cantidades
function claveSalsas(l) {
  const s = l.salsas || [];
  const corte = s.length - (l.adicionales || 0);
  return JSON.stringify([s.slice(0, corte).sort(), s.slice(corte).sort(), !!l.sinSalsa]);
}

function unirIguales() {
  const llave = (l) => JSON.stringify([l.nombre, claveSalsas(l)]);
  const resultado = [];
  state.lista.forEach(l => {
    const igual = resultado.find(r => llave(r) === llave(l));
    if (igual) igual.cantidad += l.cantidad;
    else resultado.push(l);
  });
  state.lista = resultado;
}

function buscarProducto(nombre) {
  for (const cat of Object.values(MENU)) {
    const item = cat.items.find(i => i.nombre === nombre);
    if (item) return { item, permiteSalsas: !!cat.permiteSalsas, salsasExtra: cat.salsasExtra || [] };
  }
  return null;
}

function modificarEnLista(indice) {
  let linea = state.lista[indice];
  const prod = buscarProducto(linea.nombre);
  if (!prod) return;

  // Una línea con varias unidades se separa en líneas de 1, para editar cada una por su cuenta
  if (linea.cantidad > 1) {
    const unidades = Array.from({ length: linea.cantidad }, () => ({ ...linea, salsas: [...(linea.salsas || [])], cantidad: 1 }));
    state.lista.splice(indice, 1, ...unidades);
    linea = state.lista[indice];
  }

  cerrarSheet("list-sheet", "list-backdrop");
  abrirDetalle(prod.item, prod.permiteSalsas, prod.salsasExtra, { indice, linea });
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

// Si un mismo producto aparece en varias líneas (salsas distintas), se numera: "Costillera 1", "Costillera 2"
function titulosLista() {
  const totalPorNombre = {};
  state.lista.forEach(l => { totalPorNombre[l.nombre] = (totalPorNombre[l.nombre] || 0) + 1; });
  const contador = {};
  return state.lista.map(l => {
    if (totalPorNombre[l.nombre] < 2) return l.nombre;
    contador[l.nombre] = (contador[l.nombre] || 0) + 1;
    return `${l.nombre} ${contador[l.nombre]}`;
  });
}

// Devuelve hasta dos líneas: las salsas incluidas y, aparte, las adicionales con su costo
function lineasSalsas(l) {
  const s = l.salsas || [];
  if (!s.length) return l.sinSalsa ? ["Sin salsas"] : [];
  const extra = l.adicionales || 0;
  const corte = s.length - extra;
  const lineas = [`Salsas: ${s.slice(0, corte).join(", ")}`];
  if (extra) lineas.push(`Adicionales: ${s.slice(corte).join(", ")} (+${formatoPrecio(extra * PRECIO_SALSA_EXTRA)})`);
  return lineas;
}

// ---------- modo web: copiar pedido / pedir por WhatsApp ----------
function textoPedido() {
  const titulos = titulosLista();
  const divisor = "━━━━━━━━━━━━━━";
  const bloques = state.lista.map((l, i) => {
    const lineas = lineasSalsas(l);
    return `*${i + 1}. ${titulos[i]}*  x${l.cantidad}\n` + (lineas.length ? `${lineas.join("\n")}\n` : "") + `${formatoPrecio(l.precio * l.cantidad)}\n${divisor}`;
  });
  const d = leerDatosEntrega();
  const datos = d
    ? `\n\n*Datos de entrega*\nNombre: ${d.nombre}\nTeléfono: ${d.telefono}\nDirección: ${d.direccion}\nBarrio: ${d.barrio}, ${d.municipio}` + (d.referencia ? `\nReferencia: ${d.referencia}` : "") + textoPago(d)
    : "";
  const envio = d ? costoDomicilio() : 0;
  const totales = envio > 0
    ? `Subtotal: ${formatoPrecio(totalLista())}\nDomicilio (${d.municipio}): ${formatoPrecio(envio)}\n*TOTAL: ${formatoPrecio(totalLista() + envio)}*`
    : `*TOTAL: ${formatoPrecio(totalLista())}*`;
  return `Hola, ${saludoSegunHora()}\nQuiero hacer este pedido:\n\n${divisor}\n${bloques.join("\n")}\n\n${totales}${datos}`;
}

function textoPago(d) {
  if (!d.pago) return "";
  if (d.pago === "Transferencia") {
    return `\n\n*Pago: Transferencia*\n¡Muchas gracias! Quedo atento a la confirmación para hacer la transferencia y enviarles el comprobante.`;
  }
  return `\n\n*Pago: Efectivo*`;
}

function saludoSegunHora() {
  const h = new Date().getHours();
  if (h >= 5 && h < 12) return "buenos días";
  if (h >= 12 && h < 18) return "buenas tardes";
  return "buenas noches";
}

// ---------- datos de entrega (solo modo web) ----------
const CAMPOS_ENTREGA = [
  { id: "entrega-nombre", clave: "nombre", etiqueta: "Nombre", obligatorio: true },
  { id: "entrega-telefono", clave: "telefono", etiqueta: "Teléfono", obligatorio: true },
  { id: "entrega-municipio", clave: "municipio", etiqueta: "Municipio", obligatorio: true },
  { id: "entrega-direccion", clave: "direccion", etiqueta: "Dirección", obligatorio: true },
  { id: "entrega-barrio", clave: "barrio", etiqueta: "Barrio", obligatorio: true },
  { id: "entrega-referencia", clave: "referencia", etiqueta: "Referencia", obligatorio: false }
];
const CLAVE_DATOS_ENTREGA = "grillhouse_datos_entrega";
const NOTA_TRANSFERENCIA = "Espera nuestra confirmación antes de transferir. Te avisamos por WhatsApp apenas revisemos que todo esté disponible.";
const NOTA_EFECTIVO = "Listo, te confirmamos el pedido por WhatsApp.";

function formaDePago() {
  const el = document.querySelector(".pago-chip.selected");
  return el ? el.dataset.pago : "";
}

function seleccionarPago(valor) {
  document.querySelectorAll(".pago-chip").forEach(b => b.classList.toggle("selected", b.dataset.pago === valor));
  const nota = document.getElementById("pago-nota");
  nota.hidden = !valor;
  nota.classList.toggle("es-transferencia", valor === "Transferencia");
  if (valor === "Transferencia") {
    nota.innerHTML = `${NOTA_TRANSFERENCIA}<br><br>${PAGO_TRANSFERENCIA.banco}: <strong>${PAGO_TRANSFERENCIA.numero}</strong>`;
  } else if (valor === "Efectivo") {
    nota.textContent = NOTA_EFECTIVO;
  }
  document.getElementById("entrega-aviso").hidden = true;
  guardarDatosEntrega();
}

function hayFormularioEntrega() {
  return window.MODO === "web" && !!document.getElementById("datos-entrega");
}

function valorCampo(c) {
  return document.getElementById(c.id).value.trim();
}

// Devuelve los datos si el formulario existe y está completo; null si no hay formulario.
// Si falta algo, marca los campos y devuelve false.
function leerDatosEntrega() {
  if (!hayFormularioEntrega()) return null;
  const d = {};
  CAMPOS_ENTREGA.forEach(c => { d[c.clave] = valorCampo(c); });
  if (mismoWhatsApp()) d.telefono = "el mismo de este WhatsApp";
  d.pago = formaDePago();
  return d;
}

function mismoWhatsApp() {
  const el = document.getElementById("entrega-mismo-wa");
  return !!el && el.checked;
}

function actualizarTelefonoVisible() {
  document.getElementById("entrega-telefono-wrap").hidden = mismoWhatsApp();
}

function validarEntrega() {
  if (!hayFormularioEntrega()) return true;
  const faltan = CAMPOS_ENTREGA.filter(c => {
    if (!c.obligatorio) return false;
    const v = valorCampo(c);
    if (c.clave === "telefono") return !mismoWhatsApp() && v.replace(/\D/g, "").length < 7;
    return !v;
  });
  CAMPOS_ENTREGA.forEach(c => document.getElementById(c.id).classList.toggle("invalid", faltan.includes(c)));
  const aviso = document.getElementById("entrega-aviso");
  const etiquetas = faltan.map(c => c.etiqueta);
  if (!formaDePago()) etiquetas.push("Forma de pago");
  aviso.hidden = etiquetas.length === 0;
  if (etiquetas.length) {
    aviso.textContent = `Completa para continuar: ${etiquetas.join(", ")}`;
    if (!faltan.length) {
      document.getElementById("pago-efectivo").scrollIntoView({ behavior: "smooth", block: "center" });
      return false;
    }
    const primero = document.getElementById(faltan[0].id);
    primero.scrollIntoView({ behavior: "smooth", block: "center" });
    primero.focus({ preventScroll: true });
    return false;
  }
  return true;
}

function guardarDatosEntrega() {
  try {
    const d = {};
    CAMPOS_ENTREGA.forEach(c => { d[c.clave] = valorCampo(c); });
    d.mismoWa = mismoWhatsApp();
    d.pago = formaDePago();
    localStorage.setItem(CLAVE_DATOS_ENTREGA, JSON.stringify(d));
  } catch (e) {}
}

function restaurarDatosEntrega() {
  try {
    const d = JSON.parse(localStorage.getItem(CLAVE_DATOS_ENTREGA) || "null");
    if (!d) return;
    CAMPOS_ENTREGA.forEach(c => { if (d[c.clave]) document.getElementById(c.id).value = d[c.clave]; });
    document.getElementById("entrega-mismo-wa").checked = !!d.mismoWa;
    if (d.pago) seleccionarPago(d.pago);
  } catch (e) {}
}

const CAMPOS_DIRECCION = ["entrega-municipio", "entrega-direccion", "entrega-barrio", "entrega-referencia"];

function actualizarBotonOtraDireccion() {
  const hayDireccion = CAMPOS_DIRECCION.some(id => document.getElementById(id).value.trim() !== "");
  document.getElementById("otra-direccion").hidden = !hayDireccion;
}

// Borra solo la dirección (municipio, dirección, barrio y referencia); nombre, teléfono y pago se conservan
function usarOtraDireccion() {
  CAMPOS_DIRECCION.forEach(id => {
    const el = document.getElementById(id);
    el.value = "";
    el.classList.remove("invalid");
  });
  document.getElementById("entrega-aviso").hidden = true;
  guardarDatosEntrega();
  actualizarTotalLista();
  actualizarBotonOtraDireccion();
  const primero = document.getElementById("entrega-municipio");
  primero.scrollIntoView({ behavior: "smooth", block: "center" });
  primero.focus({ preventScroll: true });
}

function configurarFormularioEntrega() {
  if (!hayFormularioEntrega()) return;
  const selectMunicipio = document.getElementById("entrega-municipio");
  Object.keys(TARIFA_DOMICILIO).forEach(m => {
    const op = document.createElement("option");
    op.value = m;
    op.textContent = `${m} · domicilio ${formatoPrecio(TARIFA_DOMICILIO[m])}`;
    selectMunicipio.appendChild(op);
  });
  document.querySelectorAll(".pago-chip").forEach(b => {
    b.addEventListener("click", () => seleccionarPago(b.dataset.pago));
  });
  restaurarDatosEntrega();
  actualizarTotalLista();
  actualizarBotonOtraDireccion();
  document.getElementById("otra-direccion").addEventListener("click", usarOtraDireccion);
  actualizarTelefonoVisible();
  document.getElementById("entrega-mismo-wa").addEventListener("change", () => {
    actualizarTelefonoVisible();
    document.getElementById("entrega-telefono").classList.remove("invalid");
    guardarDatosEntrega();
  });
  CAMPOS_ENTREGA.forEach(c => {
    const el = document.getElementById(c.id);
    el.addEventListener("input", () => { el.classList.remove("invalid"); guardarDatosEntrega(); actualizarBotonOtraDireccion(); });
    el.addEventListener("change", () => {
      el.classList.remove("invalid");
      guardarDatosEntrega();
      actualizarBotonOtraDireccion();
      if (c.clave === "municipio") actualizarTotalLista();
    });
  });
}

async function copiarTexto(texto) {
  try {
    await navigator.clipboard.writeText(texto);
  } catch (e) {
    const ta = document.createElement("textarea");
    ta.value = texto;
    ta.style.position = "fixed";
    ta.style.opacity = "0";
    document.body.appendChild(ta);
    ta.select();
    document.execCommand("copy");
    ta.remove();
  }
}

async function copiarPedido(btn) {
  if (!validarEntrega()) return;
  await copiarTexto(textoPedido());
  const original = btn.textContent;
  btn.textContent = "¡Copiado!";
  setTimeout(() => { btn.textContent = original; }, 2000);
}

// ---------- después de enviar por WhatsApp ----------
const CLAVE_PEDIDO_PENDIENTE = "grillhouse_pedido_pendiente";

function guardarPedidoPendiente() {
  try {
    localStorage.setItem(CLAVE_PEDIDO_PENDIENTE, JSON.stringify({
      total: totalLista() + costoDomicilio(),
      pago: formaDePago(),
      hora: Date.now()
    }));
  } catch (e) {}
}

function leerPedidoPendiente() {
  try {
    const p = JSON.parse(localStorage.getItem(CLAVE_PEDIDO_PENDIENTE) || "null");
    if (!p || Date.now() - p.hora > 12 * 60 * 60 * 1000) return null;
    return p;
  } catch (e) { return null; }
}

function borrarPedidoPendiente() {
  try { localStorage.removeItem(CLAVE_PEDIDO_PENDIENTE); } catch (e) {}
}

function mostrarModalPedido(html) {
  const modal = document.getElementById("pedido-modal");
  modal.innerHTML = `<div class="pedido-modal-card">${html}</div>`;
  modal.hidden = false;
}

function cerrarModalPedido() {
  document.getElementById("pedido-modal").hidden = true;
}

function preguntarSiEnvio() {
  mostrarModalPedido(`
    <h3>¿Ya enviaste tu pedido por WhatsApp?</h3>
    <button class="btn-whatsapp" id="pedido-si">Sí, ya lo envié</button>
    <button class="btn-copy" id="pedido-no">Volver a mi lista</button>`);
  document.getElementById("pedido-si").addEventListener("click", () => {
    const pendiente = leerPedidoPendiente();
    borrarPedidoPendiente();
    state.lista = [];
    guardarLista();
    renderCartBar();
    cerrarSheet("list-sheet", "list-backdrop");
    mostrarPedidoEnviado(pendiente);
  });
  document.getElementById("pedido-no").addEventListener("click", () => {
    borrarPedidoPendiente();
    cerrarModalPedido();
    renderListSheet();
    abrirSheet("list-sheet", "list-backdrop");
  });
}

function mostrarPedidoEnviado(p) {
  const total = p ? formatoPrecio(p.total) : "";
  const filaNequi = `<div class="pago-fila"><div><small>${PAGO_TRANSFERENCIA.banco}</small><strong>${PAGO_TRANSFERENCIA.numero}</strong></div><button class="btn-copy-mini" data-copiar="${PAGO_TRANSFERENCIA.numero}">Copiar</button></div>`;
  let cuerpo = `<p>Espera nuestra confirmación por WhatsApp.</p>`;

  if (p && p.pago === "Transferencia") {
    cuerpo = `<p>Espera nuestra confirmación por WhatsApp. Cuando te la demos, transfiere:</p>
      <div class="pago-fila"><div><small>Valor a pagar</small><strong>${total}</strong></div></div>
      ${filaNequi}
      <p class="nota-extra">No olvides enviarnos el comprobante por WhatsApp.</p>`;
  } else if (p && p.pago === "Efectivo") {
    cuerpo = `<p>Espera nuestra confirmación por WhatsApp.</p>
      <div class="pago-fila"><div><small>Valor a pagar en efectivo</small><strong>${total}</strong></div></div>
      ${filaNequi}
      <p class="nota-extra">Si prefieres transferir, espera nuestra confirmación y envíanos el comprobante por WhatsApp.</p>`;
  }

  mostrarModalPedido(`<h3>¡Pedido enviado!</h3>${cuerpo}<button class="btn-whatsapp" id="pedido-listo">Listo</button>`);
  document.querySelectorAll("[data-copiar]").forEach(b => {
    b.addEventListener("click", async () => {
      await copiarTexto(b.dataset.copiar);
      const t = b.textContent;
      b.textContent = "¡Copiado!";
      setTimeout(() => { b.textContent = t; }, 2000);
    });
  });
  document.getElementById("pedido-listo").addEventListener("click", cerrarModalPedido);
}

function revisarPedidoPendiente() {
  if (window.MODO !== "web" || !document.getElementById("pedido-modal")) return;
  if (!document.getElementById("pedido-modal").hidden) return;
  if (leerPedidoPendiente()) preguntarSiEnvio();
}

function pedirPorWhatsApp() {
  if (!validarEntrega()) return;
  guardarPedidoPendiente();
  const url = `https://wa.me/${NEGOCIO.whatsapp}?text=${encodeURIComponent(textoPedido())}`;
  // Se abre WhatsApp en otra pestaña (enlace real, para que los celulares lo traten como un toque) y esta página
  // se queda aquí, preguntando si ya se envió el pedido.
  const enlace = document.createElement("a");
  enlace.href = url;
  enlace.target = "_blank";
  enlace.rel = "noopener";
  document.body.appendChild(enlace);
  enlace.click();
  enlace.remove();
  preguntarSiEnvio();
}

function configurarModoWeb() {
  const web = window.MODO === "web";
  document.getElementById("list-hint").hidden = web;
  document.getElementById("list-web-actions").hidden = !web || state.lista.length === 0;
  const form = document.getElementById("datos-entrega");
  if (form) form.hidden = !web || state.lista.length === 0;
}

// Domicilio según el municipio elegido (solo versión web con formulario)
function municipioElegido() {
  if (!hayFormularioEntrega()) return "";
  return document.getElementById("entrega-municipio").value;
}

function costoDomicilio() {
  return TARIFA_DOMICILIO[municipioElegido()] || 0;
}

function actualizarTotalLista() {
  const cont = document.getElementById("list-total");
  const envio = costoDomicilio();
  cont.classList.toggle("con-domicilio", envio > 0);
  if (envio > 0) {
    cont.innerHTML = `
      <div class="total-fila"><span>Subtotal</span><span>${formatoPrecio(totalLista())}</span></div>
      <div class="total-fila"><span>Domicilio (${municipioElegido()})</span><span>${formatoPrecio(envio)}</span></div>
      <div class="total-fila total-final"><span>Total</span><span>${formatoPrecio(totalLista() + envio)}</span></div>`;
  } else {
    cont.innerHTML = `<span>Total</span><span>${formatoPrecio(totalLista())}</span>`;
  }
}

function renderListSheet() {
  const cont = document.getElementById("list-items");

  if (state.lista.length === 0) {
    cont.innerHTML = `<p style="color:var(--muted); padding: 10px 0;">Tu lista está vacía.</p>`;
  } else {
    const titulos = titulosLista();

    cont.innerHTML = state.lista.map((l, i) => `
      <div class="list-item">
        <img class="list-item-img" src="${(buscarProducto(l.nombre) || {}).item?.img || "assets/logo.png"}" alt="">
        <div class="list-item-info">
          <h4>${titulos[i]}</h4>
          <span>x${l.cantidad}${lineasSalsas(l)[0] ? " · " + lineasSalsas(l)[0] : ""}</span>
          ${lineasSalsas(l)[1] ? `<span>${lineasSalsas(l)[1]}</span>` : ""}
          <button class="edit-item" data-idx="${i}">Modificar</button>
        </div>
        <div class="list-item-right">
          <span class="list-item-price">${formatoPrecio(l.precio * l.cantidad)}</span>
          <button class="remove-item" data-idx="${i}" aria-label="Quitar">&times;</button>
        </div>
      </div>
    `).join("");

    cont.querySelectorAll(".edit-item").forEach(btn => {
      btn.addEventListener("click", () => modificarEnLista(Number(btn.dataset.idx)));
    });
    cont.querySelectorAll(".remove-item").forEach(btn => {
      btn.addEventListener("click", () => quitarDeLista(Number(btn.dataset.idx)));
    });
  }

  configurarModoWeb();
  actualizarTotalLista();
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

  document.getElementById("detail-close").addEventListener("click", cerrarDetalle);
  document.getElementById("detail-backdrop").addEventListener("click", cerrarDetalle);

  document.getElementById("qty-minus").addEventListener("click", () => {
    state.detalleQty = Math.max(1, state.detalleQty - 1);
    document.getElementById("qty-value").textContent = state.detalleQty;
    actualizarPrecioDetalle();
  });
  document.getElementById("qty-plus").addEventListener("click", () => {
    state.detalleQty += 1;
    document.getElementById("qty-value").textContent = state.detalleQty;
    actualizarPrecioDetalle();
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

  configurarFormularioEntrega();
  revisarPedidoPendiente();
  window.addEventListener("pageshow", revisarPedidoPendiente);
  document.addEventListener("visibilitychange", () => { if (!document.hidden) revisarPedidoPendiente(); });
  document.getElementById("list-clear").addEventListener("click", vaciarLista);
  document.getElementById("list-copy").addEventListener("click", (e) => copiarPedido(e.currentTarget));
  document.getElementById("list-whatsapp").addEventListener("click", pedirPorWhatsApp);
});
