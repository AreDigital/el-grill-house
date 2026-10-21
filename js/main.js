// ============================================
// EL GRILL HOUSE — Menú de escaneo QR / toma de pedidos
// No se envía nada por WhatsApp: el cliente arma una
// lista en pantalla y se la muestra a quien le toma el pedido.
// Para cambiar productos/fotos: editar js/products.js
// ============================================

const state = {
  categoria: Object.keys(MENU)[0],
  lista: [],
  detalleActual: null,
  detalleQty: 1,
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

// ---------- render: banner promo ----------
function renderPromo() {
  document.getElementById("promo-img").src = PRODUCTO_DEL_MES.img;
  document.getElementById("promo-nombre").textContent = PRODUCTO_DEL_MES.nombre;
  document.getElementById("promo-precio").textContent = formatoPrecio(PRODUCTO_DEL_MES.precio);
}

// ---------- render: chips de categoría ----------
function renderChips() {
  const cont = document.getElementById("chip-row");
  cont.innerHTML = Object.entries(MENU).map(([clave, cat]) => `
    <button class="chip ${clave === state.categoria ? "active" : ""}" data-cat="${clave}">
      ${cat.titulo}
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

// ---------- render: filas de producto ----------
function renderLista() {
  const cont = document.getElementById("product-list");
  const items = MENU[state.categoria].items;

  cont.innerHTML = items.map((item, i) => `
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
  `).join("");

  cont.querySelectorAll(".row-item").forEach(row => {
    row.addEventListener("click", () => {
      const item = items[row.dataset.idx];
      abrirDetalle(item);
    });
  });
}

// ---------- sheet de detalle ----------
function abrirDetalle(item) {
  state.detalleActual = item;
  state.detalleQty = 1;

  document.getElementById("detail-img").src = item.img || "assets/logo.png";
  document.getElementById("detail-nombre").textContent = item.nombre;
  document.getElementById("detail-desc").textContent = item.descripcion || "";
  document.getElementById("detail-precio").textContent = formatoPrecio(item.precio);
  document.getElementById("qty-value").textContent = "1";

  abrirSheet("detail-sheet", "detail-backdrop");
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
  const existente = state.lista.find(l => l.nombre === item.nombre);

  if (existente) {
    existente.cantidad += qty;
  } else {
    state.lista.push({ nombre: item.nombre, precio: item.precio, cantidad: qty });
  }

  guardarLista();
  renderCartBar();
  cerrarSheet("detail-sheet", "detail-backdrop");
}

function quitarDeLista(nombre) {
  state.lista = state.lista.filter(l => l.nombre !== nombre);
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
    cont.innerHTML = state.lista.map(l => `
      <div class="list-item">
        <div class="list-item-info">
          <h4>${l.nombre}</h4>
          <span>x${l.cantidad}</span>
        </div>
        <div class="list-item-right">
          <span class="list-item-price">${formatoPrecio(l.precio * l.cantidad)}</span>
          <button class="remove-item" data-nombre="${l.nombre}" aria-label="Quitar">&times;</button>
        </div>
      </div>
    `).join("");

    cont.querySelectorAll(".remove-item").forEach(btn => {
      btn.addEventListener("click", () => quitarDeLista(btn.dataset.nombre));
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
  renderLista();
  renderFooter();
  renderCartBar();

  document.getElementById("promo-card").addEventListener("click", () => {
    abrirDetalle(PRODUCTO_DEL_MES);
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
