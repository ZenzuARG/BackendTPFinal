# 🛒 Proyecto Final Backend - Profesionalizando la Base de Datos

Este proyecto corresponde a la **entrega final del curso de Backend en Coderhouse**, donde se profesionaliza un e-commerce implementando **MongoDB como sistema de persistencia principal**, junto con **endpoints RESTful** y **vistas dinámicas con Handlebars**.

---

## 🚀 Objetivos del Proyecto

### 🎯 Objetivos Generales
- Utilizar **MongoDB** como sistema de persistencia principal.
- Definir todos los **endpoints** necesarios para trabajar con **productos y carritos**.

### ⚙️ Objetivos Específicos
- Profesionalizar las consultas de productos con **filtros, paginación y ordenamientos**.
- Profesionalizar la gestión de carritos implementando los últimos conceptos vistos (`populate`, referencias a otros modelos, etc).

---

## 🧩 Tecnologías Utilizadas

| Herramienta          | Descripción                                                |
|----------------------|------------------------------------------------------------|
| Node.js              | Entorno de ejecución para el backend                      |
| Express.js           | Framework para manejo de rutas y middlewares              |
| MongoDB / Mongoose   | Base de datos NoSQL para productos y carritos             |
| Handlebars           | Motor de plantillas para renderizar vistas                |
| Socket.io            | Comunicación en tiempo real para productos                |
| Cookie-Parser        | Manejo de carrito anónimo mediante cookies                |
| Nodemon              | Recarga automática durante el desarrollo                  |

---

## 🗂️ Estructura del Proyecto

La estructura principal del proyecto es:

    backend/
    ├── public/
    │   └── css / imgs
    ├── src/
    │   ├── config/
    │   │   └── db.js
    │   ├── managers/
    │   │   ├── ProductManager.js
    │   │   └── CartManager.js
    │   ├── models/
    │   │   ├── product.model.js
    │   │   └── cart.model.js
    │   ├── routes/
    │   │   ├── products.router.js
    │   │   ├── carts.router.js
    │   │   └── views.router.js
    │   └── views/
    │       ├── home.handlebars
    │       ├── productDetail.handlebars
    │       ├── cartDetail.handlebars
    │       └── realTimeProducts.handlebars
    ├── app.js
    ├── package.json
    └── README.md

---

## ⚡ Instalación y Configuración

1. Clonar el repositorio:

       git clone <URL_DEL_REPO>
       cd backend

2. Instalar dependencias:

       npm install

3. Configurar la conexión a MongoDB en `src/config/db.js` (o mediante variable de entorno):

       await mongoose.connect('mongodb://127.0.0.1:27017/coderBackend');

4. Levantar el servidor:

       npm run dev

   El servidor se inicia en:  
   http://localhost:8080

---

## 🧠 Funcionalidades Principales

### 🛍️ Gestión de Productos

**Endpoint principal de productos**

- `GET /api/products`

Recibe por *query params*:

- `limit`: cantidad de productos por página (opcional, por defecto 10)
- `page`: número de página a solicitar (opcional, por defecto 1)
- `sort`: orden de precio, valores `asc` o `desc` (opcional)
- `query`: filtro de búsqueda (por categoría o disponibilidad, opcional)

**Formato de respuesta (consigna)**

    {
      "status": "success",
      "payload": [ ... ],
      "totalPages": 3,
      "prevPage": 1,
      "nextPage": 3,
      "page": 2,
      "hasPrevPage": true,
      "hasNextPage": true,
      "prevLink": "http://localhost:8080/api/products?page=1&limit=10",
      "nextLink": "http://localhost:8080/api/products?page=3&limit=10"
    }

Se puede acceder desde la vista:

- `GET /products` → muestra todos los productos con su paginación, filtros y botón **“Agregar al carrito”**.

---

### 🛒 Carrito de Compras

El proyecto maneja un **carrito anónimo persistente** mediante una cookie `cartId`.  
Si el usuario ingresa por primera vez y no tiene esa cookie, el servidor crea un carrito nuevo en MongoDB y guarda su `_id` en la cookie.

#### Endpoints del carrito

- `POST /api/carts`  
  Crea un carrito nuevo.

- `GET /api/carts/:cid`  
  Devuelve el carrito con sus productos.  
  Utiliza `populate` para traer el documento completo de cada producto.

- `POST /api/carts/:cid/product/:pid`  
  Agrega un producto al carrito (o incrementa la cantidad).  
  Si la petición viene desde un formulario HTML, redirige a `/mycart`.

- `PUT /api/carts/:cid`  
  Reemplaza todo el arreglo de productos del carrito con el enviado en `req.body`.

- `PUT /api/carts/:cid/products/:pid`  
  Actualiza únicamente la cantidad de un producto dentro del carrito.

- `DELETE /api/carts/:cid/products/:pid`  
  Elimina un producto específico del carrito.

- `DELETE /api/carts/:cid`  
  Vacía por completo el carrito.

#### Vistas relacionadas

- `/mycart`  
  Muestra el carrito actual del usuario (identificado por la cookie `cartId`).

- `/carts/:cid`  
  Muestra un carrito específico, listando solo los productos que pertenecen a ese carrito.

---

## 🖥️ Vistas con Handlebars

### `/products`
- Lista paginada de productos.
- Filtros por categoría / query y ordenamiento por precio.
- Botón **“Agregar al carrito”** por cada producto.

### `/products/:pid`
- Detalle de un producto:
  - Título, descripción, categoría.
  - Precio, stock y estado.
- Formulario para agregar al carrito indicando cantidad.
- Al agregar, se redirige automáticamente al carrito del usuario.

### `/mycart` y `/carts/:cid`
- Tabla con:
  - Nombre del producto.
  - Precio individual.
  - Cantidad.
  - Subtotal (precio * cantidad).
- Cálculo del **total** del carrito.
- Botón para volver al catálogo de productos.

### `/realtimeproducts`
- Vista donde se visualizan productos en tiempo real utilizando **Socket.IO**.
- Al crear o eliminar productos, la lista se actualiza sin recargar la página.

---

## 🍪 Carrito Anónimo con Cookies

- Al entrar a `/products`, el servidor:
  - Verifica si existe cookie `cartId`.
  - Si no existe, crea un carrito vacío en MongoDB.
  - Guarda el `_id` del carrito en la cookie `cartId` (7 días de duración).
- Todas las operaciones de agregar productos al carrito usan el `cartId` de esa cookie.
- No es necesario un sistema de autenticación para manejar el carrito.

---

## 📦 Scripts Disponibles

- Iniciar el servidor en modo desarrollo (con nodemon):

      npm run dev

- Iniciar el servidor en modo normal:

      npm start

---

## 📚 Requisitos de la Consigna Cubiertos

- ✅ MongoDB como sistema de persistencia principal.
- ✅ Endpoints completos para **productos** y **carritos**.
- ✅ Paginación, filtros y ordenamiento en `GET /api/products`.
- ✅ Búsqueda por categoría o disponibilidad mediante `query`.
- ✅ Carritos con referencias a productos y uso de `populate`.
- ✅ Endpoints adicionales de carritos:
  - `DELETE /api/carts/:cid/products/:pid`
  - `PUT /api/carts/:cid`
  - `PUT /api/carts/:cid/products/:pid`
  - `DELETE /api/carts/:cid`
- ✅ Vistas:
  - `/products` con paginación.
  - `/products/:pid` con detalle.
  - `/carts/:cid` y `/mycart` para ver contenido del carrito.
- ✅ Integración con Socket.IO para vista en tiempo real.
- ✅ Manejo de carrito anónimo mediante cookie, sin necesidad de login.
- ✅ Estilos en modo oscuro y maquetado mejorado para detalle de productos y carrito.

---

## 👤 Autor

**Zenon Zuliani**  
Proyecto realizado como **entrega final de Backend en Coderhouse**.
