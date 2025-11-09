import { Router } from 'express';
import CartManager from '../managers/CartManager.js';

const router = Router();
const cm = new CartManager();

// Crear carrito
router.post('/', async (_req, res) => {
  try {
    const cart = await cm.create();
    res.status(201).json({ status: 'success', payload: cart });
  } catch (err) {
    console.error('Error creando carrito:', err);
    res.status(500).json({ status: 'error', error: err.message });
  }
});

// Obtener carrito con populate (API)
router.get('/:cid', async (req, res) => {
  try {
    const cart = await cm.getById(req.params.cid, { populate: true });
    if (!cart) {
      return res
        .status(404)
        .json({ status: 'error', error: 'Carrito no encontrado' });
    }

    res.json({ status: 'success', payload: cart });
  } catch (err) {
    console.error('Error obteniendo carrito:', err);
    res.status(500).json({ status: 'error', error: err.message });
  }
});

// AGREGAR PRODUCTO AL CARRITO
router.post('/:cid/product/:pid', async (req, res) => {
  try {
    const { cid, pid } = req.params;
    const qty = Number(req.body?.quantity) || 1;

    const cart = await cm.addProduct(cid, pid, qty);
    if (!cart) {
      return res
        .status(404)
        .json({ status: 'error', error: 'Carrito no encontrado' });
    }

    // Si viene desde un formulario HTML, redirigimos al carrito
    const wantsHTML =
      req.headers.accept && req.headers.accept.includes('text/html');

    if (wantsHTML) {
      return res.redirect('/mycart');
    }

    // Si es llamado como API (Postman, fetch), devolvemos JSON
    res.status(201).json({ status: 'success', payload: cart });
  } catch (err) {
    console.error('Error agregando producto a carrito:', err);
    res.status(500).json({ status: 'error', error: err.message });
  }
});

/**
 * Resto de endpoints pedidos en la consigna
 */

// DELETE api/carts/:cid/products/:pid -> elimina producto puntual
router.delete('/:cid/products/:pid', async (req, res) => {
  try {
    const { cid, pid } = req.params;
    const cart = await cm.deleteProduct(cid, pid);
    if (!cart) {
      return res
        .status(404)
        .json({
          status: 'error',
          error: 'Carrito o producto no encontrado'
        });
    }
    res.json({ status: 'success', payload: cart });
  } catch (err) {
    console.error('Error eliminando producto del carrito:', err);
    res.status(500).json({ status: 'error', error: err.message });
  }
});

// PUT api/carts/:cid -> reemplaza todo el array de productos
router.put('/:cid', async (req, res) => {
  try {
    const { cid } = req.params;
    const { products } = req.body; // [{ product, quantity }]

    if (!Array.isArray(products)) {
      return res
        .status(400)
        .json({ status: 'error', error: 'products debe ser un array' });
    }

    const cart = await cm.updateProducts(cid, products);
    if (!cart) {
      return res
        .status(404)
        .json({ status: 'error', error: 'Carrito no encontrado' });
    }

    res.json({ status: 'success', payload: cart });
  } catch (err) {
    console.error('Error actualizando productos del carrito:', err);
    res.status(500).json({ status: 'error', error: err.message });
  }
});

// PUT api/carts/:cid/products/:pid -> actualiza SOLO cantidad
router.put('/:cid/products/:pid', async (req, res) => {
  try {
    const { cid, pid } = req.params;
    const { quantity } = req.body;

    const cart = await cm.updateProductQuantity(cid, pid, quantity);
    if (!cart) {
      return res
        .status(404)
        .json({
          status: 'error',
          error: 'Carrito o producto no encontrado'
        });
    }

    res.json({ status: 'success', payload: cart });
  } catch (err) {
    console.error('Error actualizando cantidad de producto:', err);
    res.status(500).json({ status: 'error', error: err.message });
  }
});

// DELETE api/carts/:cid -> vacía carrito
router.delete('/:cid', async (req, res) => {
  try {
    const { cid } = req.params;
    const cart = await cm.clearCart(cid);
    if (!cart) {
      return res
        .status(404)
        .json({ status: 'error', error: 'Carrito no encontrado' });
    }

    res.json({ status: 'success', payload: cart });
  } catch (err) {
    console.error('Error vaciando carrito:', err);
    res.status(500).json({ status: 'error', error: err.message });
  }
});

export default router;
