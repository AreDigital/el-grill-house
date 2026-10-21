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
const MAX_SALSAS = 2;

const PRODUCTO_DEL_MES = {
  nombre: "Hamburguesa Americana",
  descripcion: "Pan brioche, carne de hamburguesa, tocineta crocante, doble queso cheddar, cebolla caramelizada, pepinillos y sour cream.",
  precio: 38000,
  img: "assets/hero-americana.png" // TEMPORAL — cambiar cada mes por la foto del producto destacado
};

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
      { nombre: "Costillera", precio: 40000, descripcion: "Pan brioche, carne de hamburguesa, costilla desmechada, salsa BBQ de la casa, queso mozzarella, cebolla crispy y lechuga.", img: null },
      { nombre: "Argentina", precio: 38000, descripcion: "Pan brioche con orégano y parmesano, carne de hamburguesa, chorizo, queso mozzarella, cebolla grillada, chimichurri y rúcula.", img: null },
      { nombre: "Italiana", precio: 38000, descripcion: "Pan brioche con orégano y parmesano, carne de hamburguesa, pesto de albahaca, queso mozzarella, queso provolone, tomate confitado, rúcula, aceite de oliva, bañado en reducción de vino tinto.", img: null },
      { nombre: "Mediterránea", precio: 45000, descripcion: "Pan brioche, carne de hamburguesa, camarón apanado, queso mozzarella, salsa alioli, cebolla morada, lechuga, tomate y miel picante.", img: null },
      { nombre: "Americana", precio: 38000, descripcion: "Pan brioche, carne de hamburguesa, tocineta crocante, doble queso cheddar, cebolla caramelizada, pepinillos y sour cream.", img: "assets/hero-americana.png" },
      { nombre: "Paisa", precio: 42000, descripcion: "Pan brioche, carne de hamburguesa, chicharrón, aguacate, hogao, maicitos, salsa BBQ y queso mozzarella.", img: null },
      { nombre: "Cheseburguer", precio: 35000, descripcion: "Pan brioche con orégano y parmesano, carne de hamburguesa, doble queso cheddar y mozzarella, cebolla caramelizada, pepinillos y salsa Grill House.", img: null },
      { nombre: "La de Pollo", precio: 35000, descripcion: "Pan brioche, pechuga de pollo a la parrilla, tocineta, queso mozzarella, cebolla caramelizada, miel mostaza, lechuga y tomate.", img: null }
    ]
  },
  parrilla: {
    titulo: "Parrilla",
    subtitulo: "Cortes certified Angus Beef. Incluyen ensalada de temporada, arepa con queso y papas a la francesa.",
    permiteSalsas: true,
    items: [
      { nombre: "Punta de Anca", precio: 40000, descripcion: "Delicioso corte fino de picaña.", img: null },
      { nombre: "Churrasco", precio: 40000, descripcion: "Delicioso corte de res, jugoso y tierno.", img: null },
      { nombre: "Medallones de Cerdo", precio: 35000, descripcion: "Medallones jugosos y llenos de sabor.", img: null },
      { nombre: "Costillas a la BBQ", precio: 35000, descripcion: "Costillas de cerdo bañadas en nuestra salsa BBQ de la casa, llenas de tocineta.", img: null },
      { nombre: "Pechuga de Pollo a la Parrilla", precio: 30000, descripcion: "Deliciosa pechuga asada a la parrilla, jugosa y llena de sabor.", img: null },
      { nombre: "Chuzos de Pollo", precio: 28000, descripcion: "Deliciosos trozos de pollo marinados, asados en brochetas.", img: null }
    ]
  },
  entradas: {
    titulo: "Entradas",
    subtitulo: "El inicio del buen parche.",
    items: [
      { nombre: "Yucas Fritas x5", precio: 12000, descripcion: "Crocantes yucas fritas acompañadas de salsa de la casa.", img: null },
      { nombre: "Papas con Queso y Tocineta", precio: 18000, descripcion: "Crujientes papas francesas con queso, tocineta y salsa cheddar.", img: null },
      { nombre: "Aros de Cebolla x5", precio: 10000, descripcion: "Los mejores aros de cebolla para compartir, con miel mostaza.", img: null },
      { nombre: "Patacón con Hogao x5", precio: 12000, descripcion: "Deliciosos patacones con el hogao más exquisito.", img: null },
      { nombre: "Langostinos Apanados x4", precio: 25000, descripcion: "Nuevo en la carta.", nuevo: true, img: null }
    ]
  },
  bebidas: {
    titulo: "Bebidas",
    subtitulo: "Para acompañar grandes momentos.",
    items: [
      { nombre: "Gaseosa", precio: 5000, img: null },
      { nombre: "Agua", precio: 4000, img: null },
      { nombre: "Soda Hatsu", precio: 6000, img: null },
      { nombre: "Cerveza Águila", precio: 5000, img: null },
      { nombre: "Agua Saborizada Cool Drink", precio: 6000, img: null }
    ]
  }
};

const NEGOCIO = {
  nombre: "El Grill House",
  direccion: "Diagonal 42 #36A 10, La Independencia, Itagüí",
  whatsapp: "573113195427",
  domicilios: "Domicilios en todo el sur"
};
