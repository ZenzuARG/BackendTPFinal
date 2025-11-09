import { Router } from 'express';
import ProductManager from '../managers/ProductManager.js';
import CartManager from '../managers/CartManager.js';

const router = Router();
const pm = new ProductManager();
const cm = new CartManager();

// Home -> redirige a /products
router.get('/', (_req, res) => {
  res.redirect('/products');
});

// Helper: obtiene cartId desde cookie, y si no existe crea carrito en Mongo
async function ensureCart(req, res) {
  let cartId = req.cookies.cartId;

  if (!cartId) {
    const cart = await cm.create();
    cartId = cart._id.toString();

    res.cookie('cartId', cartId, {
      maxAge: 1000 * 60 * 60 * 24 * 7, // 7 días
      httpOnly: true
    });
  }

  return cartId;
}

// Listado de productos con paginación
router.get('/products', async (req, res) => {
  try {
    const { limit, page, sort, query } = req.query;
    const result = await pm.paginate({ limit, page, sort, query });

    const baseUrl = '/products';
    const paramsBase =
      `&limit=${limit || 10}` +
      (query ? `&query=${encodeURIComponent(query)}` : '') +
      (sort ? `&sort=${sort}` : '');

    const prevLink = result.hasPrevPage
      ? `${baseUrl}?page=${result.prevPage}${paramsBase}`
      : null;
    const nextLink = result.hasNextPage
      ? `${baseUrl}?page=${result.nextPage}${paramsBase}`
      : null;

    const cartId = await ensureCart(req, res);

    res.render('home', {
      title: 'Catálogo de productos',
      products: result.payload,
      page: result.page,
      totalPages: result.totalPages,
      hasPrevPage: result.hasPrevPage,
      hasNextPage: result.hasNextPage,
      prevLink,
      nextLink,
      query,
      sort,
      cartId
    });
  } catch (err) {
    console.error('Error en /products:', err);
    res.status(500).send('Error interno en listado de productos');
  }
});

// Detalle de producto
router.get('/products/:pid', async (req, res) => {
  try {
    const prod = await pm.getById(req.params.pid);
    if (!prod) return res.status(404).send('Producto no encontrado');

    const cartId = await ensureCart(req, res);

    res.render('productDetail', {
      title: prod.title,
      product: prod,
      cartId
    });
  } catch (err) {
    console.error('Error en /products/:pid:', err);
    res.status(500).send('Error interno en detalle de producto');
  }
});

// Vista de carrito por id (usa populate)
router.get('/carts/:cid', async (req, res) => {
  try {
    const cart = await cm.getById(req.params.cid, { populate: true });
    if (!cart) return res.status(404).send('Carrito no encontrado');

    const validProducts = (cart.products || []).filter(p => p.product);

    const items = validProducts.map(p => ({
      title: p.product.title,
      price: p.product.price,
      quantity: p.quantity,
      subtotal: p.product.price * p.quantity
    }));

    const total = items.reduce((acc, i) => acc + i.subtotal, 0);

    res.render('cartDetail', {
      title: `Carrito ${cart._id}`,
      cartId: cart._id,
      items,
      total
    });
  } catch (err) {
    console.error('Error en /carts/:cid:', err);
    res.status(500).send('Error interno en vista de carrito');
  }
});

// Atajo: ver "mi" carrito (el de la cookie)
router.get('/mycart', async (req, res) => {
  try {
    const cartId = await ensureCart(req, res);
    res.redirect(`/carts/${cartId}`);
  } catch (err) {
    console.error('Error en /mycart:', err);
    res.status(500).send('Error interno en mi carrito');
  }
});

// Vista realtime
router.get('/realtimeproducts', async (_req, res) => {
  try {
    const products = await pm.getAll();
    res.render('realTimeProducts', {
      title: 'Productos en tiempo real',
      products
    });
  } catch (err) {
    console.error('Error en /realtimeproducts:', err);
    res.status(500).send('Error interno en realtime');
  }
});

export default router;
