// ============================================
// EL GRILL HOUSE — Datos del menú
// ============================================
// Para CAMBIAR un producto: edita su objeto abajo.
// Para CAMBIAR una foto: reemplaza el archivo en /assets/productos/
//   y actualiza el campo "img" con el mismo nombre de archivo.
// Si un producto no tiene foto aún, deja img: null y se mostrará
// un marcador de posición automático con el nombre del plato.
// ============================================

const SALSAS = [
  "Ajo cremoso",
  "Trozos de tocineta",
  "Bbq grill",
  "Bbq grill picante",
  "Ranch",
  "Chimichurri"
];
const SALSAS_INCLUIDAS = 2;      // salsas que van incluidas en el precio
const PRECIO_SALSA_EXTRA = 2000; // costo de cada salsa adicional

const PRODUCTO_DEL_MES = {
  nombre: "Hamburguesa Americana",
  descripcion: "Pan brioche, carne de hamburguesa, tocineta crocante, doble queso cheddar, cebolla caramelizada, pepinillos y sour cream.",
  precio: 32000,
  img: "assets/05 Hamburguesa Americana.jpg" // cambiar cada mes por la foto del producto destacado
};

// Imágenes del banner principal (carrusel). Para agregar/quitar una,
// edita este arreglo. tipo "producto" muestra el overlay (nombre/precio)
// y abre la ficha de PRODUCTO_DEL_MES al tocarla; tipo "imagen" es un
// banner libre (branding, promos de temporada) sin overlay ni acción.
const BANNERS = [
  { tipo: "producto", img: PRODUCTO_DEL_MES.img },
  { tipo: "imagen", img: "assets/banner-halloween.jpg" },
  { tipo: "imagen", img: "assets/banner-domicilios.jpg" }
];

const RECOMENDADA = {
  nombre: "La del Chirry",
  tag: "Recomendada",
  descripcion: "Pan, salsa de la casa, carne de hamburguesa, doble queso mozzarella, doble tocineta y ripio de papa. Más que una hamburguesa, un recuerdo que sabe increíble.",
  precio: 30000,
  img: null // pendiente foto original del producto
};

const MENU = {
  hamburguesas: {
    titulo: "Hamburguesas",
    chipLabel: "Burguer",
    permiteSalsas: true,
    items: [
      { nombre: "Costillera", precio: 35000, descripcion: "Pan brioche, carne de hamburguesa, costilla desmechada, salsa BBQ de la casa, queso mozzarella, cebolla crispy y lechuga.", img: "assets/01 Hamburguesa Costillera.jpg" },
      { nombre: "Argentina", precio: 34000, descripcion: "Pan brioche con orégano y parmesano, carne de hamburguesa, chorizo, queso mozzarella, cebolla grillada, chimichurri y rúcula.", img: "assets/02 Hamburguesa Argentina.jpg" },
      { nombre: "Italiana", precio: 35000, descripcion: "Pan brioche con orégano y parmesano, carne de hamburguesa, pesto de albahaca, queso mozzarella, queso provolone, tomate confitado, rúcula, aceite de oliva, bañado en reducción de vino tinto.", img: "assets/03 Hamburguesa Italiana.jpg" },
      { nombre: "Mediterránea", precio: 40000, descripcion: "Pan brioche, carne de hamburguesa, camarón apanado, queso mozzarella, salsa alioli, cebolla morada, lechuga, tomate y miel picante.", img: "assets/04 Hamburguesa Mediterranea.jpg" },
      { nombre: "Americana", precio: 32000, descripcion: "Pan brioche, carne de hamburguesa, tocineta crocante, doble queso cheddar, cebolla caramelizada, pepinillos y sour cream.", img: "assets/05 Hamburguesa Americana.jpg" },
      { nombre: "Paisa", precio: 38000, descripcion: "Pan brioche, carne de hamburguesa, chicharrón, aguacate, hogao, maicitos, salsa BBQ y queso mozzarella.", img: "assets/06 Hamburguesa Paisa.jpg" },
      { nombre: "Cheseburguer", precio: 30000, descripcion: "Pan brioche con orégano y parmesano, carne de hamburguesa, doble queso cheddar y mozzarella, cebolla caramelizada, pepinillos y salsa Grill House.", img: "assets/07 Cheseburguer.jpg" },
      { nombre: "La de Pollo", precio: 30000, descripcion: "Pan brioche, pechuga de pollo a la parrilla, tocineta, queso mozzarella, cebolla caramelizada, miel mostaza, lechuga y tomate.", img: "assets/08 La de Pollo.jpg" }
    ]
  },
  parrilla: {
    titulo: "Parrilla",
    subtitulo: "Cortes certified Angus Beef. Incluyen ensalada de temporada, arepa con queso y papas a la francesa.",
    permiteSalsas: true,
    items: [
      { nombre: "Punta de Anca", precio: 40000, descripcion: "Delicioso corte fino de picaña.", img: "assets/09 Punta de anca.jpg" },
      { nombre: "Churrasco", precio: 40000, descripcion: "Delicioso corte de res, jugoso y tierno.", img: "assets/10 Churrasco.jpg" },
      { nombre: "Medallones de Cerdo", precio: 35000, descripcion: "Medallones jugosos y llenos de sabor.", img: "assets/11 Medallones de Cerdo.jpg" },
      { nombre: "Costillas a la BBQ", precio: 35000, descripcion: "Costillas de cerdo bañadas en nuestra salsa BBQ de la casa, llenas de tocineta.", img: "assets/12 Costillas a la BBQ.jpg" },
      { nombre: "Pechuga de Pollo a la Parrilla", precio: 30000, descripcion: "Deliciosa pechuga asada a la parrilla, jugosa y llena de sabor.", img: "assets/13 Pechuga de pollo a la parrilla.jpg" },
      { nombre: "Chuzos de Pollo", precio: 28000, descripcion: "Deliciosos trozos de pollo marinados, asados en brochetas.", img: "assets/14 Chuzos de pollo.jpg" }
    ]
  },
  entradas: {
    titulo: "Entradas",
    subtitulo: "El inicio del buen parche.",
    permiteSalsas: true,
    salsasExtra: ["Hogao"], // salsa adicional solo para entradas
    items: [
      { nombre: "Yucas Fritas x5", precio: 12000, descripcion: "Crocantes yucas fritas acompañadas de salsa de la casa.", img: "assets/15 Yucas Fritas.jpg" },
      { nombre: "Papas con Queso y Tocineta", precio: 18000, descripcion: "Crujientes papas francesas con queso, tocineta y salsa cheddar.", img: "assets/16 Papas con queso y tocineta.jpg" },
      { nombre: "Aros de Cebolla x5", precio: 10000, descripcion: "Los mejores aros de cebolla para compartir, con miel mostaza.", img: "assets/17 Aros de Cebolla.jpg" },
      { nombre: "Patacón con Hogao x5", precio: 12000, descripcion: "Deliciosos patacones con el hogao más exquisito.", img: "assets/18 Patacon con Hogao.jpg" },
      { nombre: "Langostinos Apanados x4", precio: 25000, descripcion: "Nuevo en la carta.", nuevo: true, img: "assets/19 Langostinos apanados.jpg" }
    ]
  },
  bebidas: {
    titulo: "Bebidas",
    subtitulo: "Para acompañar grandes momentos.",
    items: [
      { nombre: "Coca-Cola", precio: 5000, descripcion: "400 ml", grupo: "Gaseosas", img: "assets/20 Coca-Cola.jpg" },
      { nombre: "Coca-Cola Zero", precio: 5000, descripcion: "400 ml", grupo: "Gaseosas", img: "assets/21 Coca-Cola Zero.jpg" },
      { nombre: "Quatro", precio: 5000, descripcion: "400 ml", grupo: "Gaseosas", img: "assets/22 Quatro.jpg" },
      { nombre: "Manzana Postobón", precio: 5000, descripcion: "400 ml", grupo: "Gaseosas", img: "assets/23 Manzana Postobon.jpg" },
      { nombre: "Colombiana", precio: 5000, descripcion: "400 ml", grupo: "Gaseosas", img: "assets/24 Colombiana.jpg" },
      { nombre: "Agua Cristal", precio: 4000, descripcion: "400 ml", grupo: "Agua", img: "assets/25 Agua Cristal.jpg" },
      { nombre: "Hatsu Sandía", precio: 6000, descripcion: "300 ml", grupo: "Soda Hatsu", img: "assets/26 Hatsu Sandia.jpg" },
      { nombre: "Hatsu Frambuesa", precio: 6000, descripcion: "300 ml", grupo: "Soda Hatsu", img: "assets/27 Hatsu Frambuesa.jpg" },
      { nombre: "Cool Drink Kiwi", precio: 6000, descripcion: "340 ml", grupo: "Cool Drink", img: "assets/28 Cool Drink Kiwi.jpg" },
      { nombre: "Cool Drink Manzana Verde", precio: 6000, descripcion: "340 ml", grupo: "Cool Drink", img: "assets/29 Cool Drink Manzana Verde.jpg" },
      { nombre: "Cool Drink Maracuyá", precio: 6000, descripcion: "340 ml", grupo: "Cool Drink", img: "assets/30 Cool Drink Maracuya.jpg" },
      { nombre: "Cool Drink Mangostino", precio: 6000, descripcion: "340 ml", grupo: "Cool Drink", img: "assets/31 Cool Drink Mangostino.jpg" },
      { nombre: "Cool Drink Granada", precio: 6000, descripcion: "340 ml", grupo: "Cool Drink", img: "assets/32 Cool Drink Granada.jpg" },
      { nombre: "Cerveza Costeñita", precio: 5000, descripcion: "175 ml", grupo: "Cerveza", img: "assets/33 Cerveza Costenita.jpg" },
      { nombre: "Tequila Rose Strawberry Cream", precio: 20000, descripcion: "330 ml", grupo: "Cócteles", img: "assets/34 Tequila Rose Strawberry Cream.jpg" },
      { nombre: "Buchanan's Coconut Cream", precio: 20000, descripcion: "330 ml", grupo: "Cócteles", img: "assets/35 Buchanans Coconut Cream.jpg" }
    ]
  }
};

const NEGOCIO = {
  nombre: "El Grill House",
  direccion: "Diagonal 42 #36A 10, La Independencia, Itagüí",
  whatsapp: "573113195427",
  domicilios: "Domicilios solo en Itagüí, La Estrella, Envigado y Sabaneta"
};
