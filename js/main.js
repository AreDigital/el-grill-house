// ============================================
// EL GRILL HOUSE — Render del menú
// No necesitas tocar este archivo para cambiar
// productos, precios o fotos: todo eso vive en
// products.js
// ============================================

function formatoPrecio(valor) {
  return "$" + valor.toLocaleString("es-CO");
}

function linkWhatsapp(nombre, precio) {
  const mensaje = `Hola ${NEGOCIO.nombre}, quiero pedir: ${nombre} (${formatoPrecio(precio)})`;
  return `https://wa.me/${NEGOCIO.whatsapp}?text=${encodeURIComponent(mensaje)}`;
}

function iconoWhatsapp() {
  return `<svg viewBox="0 0 24 24" fill="currentColor"><path d="M17.5 14.4c-.3-.1-1.6-.8-1.9-.9-.3-.1-.4-.1-.6.1-.2.3-.7.9-.8 1-.2.2-.3.2-.5.1-.3-.1-1.1-.4-2.1-1.3-.8-.7-1.3-1.6-1.5-1.8-.2-.3 0-.4.1-.6.1-.1.3-.3.4-.5.1-.1.2-.3.2-.5.1-.2 0-.3 0-.5-.1-.1-.6-1.5-.8-2-.2-.5-.4-.4-.6-.4h-.5c-.2 0-.5.1-.7.3-.2.3-1 1-1 2.4s1 2.8 1.1 3c.1.2 2 3.1 4.9 4.3.7.3 1.2.5 1.6.6.7.2 1.3.2 1.8.1.5-.1 1.6-.7 1.9-1.3.2-.6.2-1.1.1-1.3-.1-.1-.2-.2-.5-.3z"/><path d="M12 2a10 10 0 00-8.6 15.1L2 22l5-1.3A10 10 0 1012 2zm5.9 14.2c-.5 1.3-2.6 2.4-3.4 2.5-.9.1-1.7.3-3.6-.5-3-1.3-4.9-4.3-5-4.5-.2-.2-1.2-1.6-1.2-3s.8-2.2 1-2.5c.3-.3.6-.4.8-.4h.6c.2 0 .4 0 .6.5.3.6.9 2.1 1 2.3.1.2.2.4 0 .6-.1.2-.1.3-.3.5-.2.2-.3.4-.5.6-.2.2-.3.4-.1.7.1.3 1 1.6 2.1 2.6 1.4 1.3 2.6 1.7 2.9 1.9.3.2.5.1.6-.1.2-.2.8-.9 1-1.2.2-.3.4-.2.6-.1.2.1 1.6.7 1.9.9.3.1.5.2.5.3.1.2.1.6-.1 1.1z"/></svg>`;
}

function cardProducto(item) {
  const imagen = item.img
    ? `<img src="${item.img}" alt="${item.nombre}" loading="lazy">`
    : `<div class="card-img placeholder">${item.nombre}<br><small>foto próximamente</small></div>`;

  return `
    <article class="card">
      <div class="card-img">
        ${item.nuevo ? '<span class="badge-new">Nuevo</span>' : ''}
        ${imagen}
      </div>
      <div class="card-body">
        <h3>${item.nombre}</h3>
        ${item.descripcion ? `<p>${item.descripcion}</p>` : '<p></p>'}
        <div class="card-footer">
          <span class="price">${formatoPrecio(item.precio)}</span>
          <a class="btn-wsp small" href="${linkWhatsapp(item.nombre, item.precio)}" target="_blank" rel="noopener">
            ${iconoWhatsapp()} Pedir
          </a>
        </div>
      </div>
    </article>
  `;
}

function renderMenu() {
  const contenedor = document.getElementById("menu-sections");
  let html = "";

  for (const [clave, categoria] of Object.entries(MENU)) {
    html += `
      <section class="menu-section" id="${clave}">
        <h2>${categoria.titulo}</h2>
        ${categoria.subtitulo ? `<p class="subtitulo">${categoria.subtitulo}</p>` : ""}
        <div class="menu-grid">
          ${categoria.items.map(cardProducto).join("")}
        </div>
      </section>
    `;
  }

  contenedor.innerHTML = html;
}

function renderHero() {
  document.getElementById("hero-img").src = PRODUCTO_DEL_MES.img;
  document.getElementById("hero-nombre").textContent = PRODUCTO_DEL_MES.nombre;
  document.getElementById("hero-desc").textContent = PRODUCTO_DEL_MES.descripcion;
  document.getElementById("hero-wsp").href = linkWhatsapp(PRODUCTO_DEL_MES.nombre, PRODUCTO_DEL_MES.precio);
}

function renderRecomendada() {
  const img = document.getElementById("recomendada-img");
  if (RECOMENDADA.img) {
    img.innerHTML = `<img src="${RECOMENDADA.img}" alt="${RECOMENDADA.nombre}">`;
  } else {
    img.innerHTML = `<div class="card-img placeholder" style="height:100%">${RECOMENDADA.nombre}<br><small>foto próximamente</small></div>`;
  }
  document.getElementById("recomendada-nombre").textContent = RECOMENDADA.nombre;
  document.getElementById("recomendada-desc").textContent = RECOMENDADA.descripcion;
  document.getElementById("recomendada-precio").textContent = formatoPrecio(RECOMENDADA.precio);
  document.getElementById("recomendada-wsp").href = linkWhatsapp(RECOMENDADA.nombre, RECOMENDADA.precio);
}

function renderFooter() {
  document.getElementById("footer-direccion").textContent = NEGOCIO.direccion;
  document.getElementById("footer-domicilios").textContent = NEGOCIO.domicilios;
  document.getElementById("footer-wsp").href = `https://wa.me/${NEGOCIO.whatsapp}`;
}

function toggleNav() {
  document.getElementById("main-nav").classList.toggle("open");
}

document.addEventListener("DOMContentLoaded", () => {
  renderHero();
  renderRecomendada();
  renderMenu();
  renderFooter();

  document.getElementById("nav-toggle").addEventListener("click", toggleNav);
  document.querySelectorAll("#main-nav a, .cat-nav a").forEach(link => {
    link.addEventListener("click", () => {
      document.getElementById("main-nav").classList.remove("open");
    });
  });
});
