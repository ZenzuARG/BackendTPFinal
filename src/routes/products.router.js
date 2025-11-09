import { Router } from 'express';
import ProductManager from '../managers/ProductManager.js';

const router = Router();
const pm = new ProductManager();

// GET con paginación, filtros y orden
router.get('/', async (req, res) => {
  try {
    const { limit, page, sort, query } = req.query;
    const result = await pm.paginate({ limit, page, sort, query });

    // armamos links
    const baseUrl = `${req.protocol}://${req.get('host')}${req.baseUrl}`;
    const paramsBase = `&limit=${limit || 10}${query ? `&query=${encodeURIComponent(query)}` : ''}${sort ? `&sort=${sort}` : ''}`;

    const prevLink = result.hasPrevPage
      ? `${baseUrl}?page=${result.prevPage}${paramsBase}`
      : null;
    const nextLink = result.hasNextPage
      ? `${baseUrl}?page=${result.nextPage}${paramsBase}`
      : null;

    res.json({
      ...result,
      prevLink,
      nextLink
    });
  } catch (err) {
    res.status(500).json({ status: 'error', error: err.message });
  }
});

router.get('/:pid', async (req, res) => {
  try {
    const prod = await pm.getById(req.params.pid);
    if (!prod)
      return res.status(404).json({ status: 'error', error: 'Producto no encontrado' });
    res.json({ status: 'success', payload: prod });
  } catch (err) {
    res.status(500).json({ status: 'error', error: err.message });
  }
});

router.post('/', async (req, res) => {
  try {
    const created = await pm.create(req.body);
    // avisar por WS
    const io = req.app.get('io');
    if (io) io.emit('products:update', await pm.getAll());
    res.status(201).json({ status: 'success', payload: created });
  } catch (err) {
    res.status(400).json({ status: 'error', error: err.message });
  }
});

router.put('/:pid', async (req, res) => {
  try {
    const updated = await pm.update(req.params.pid, req.body);
    if (!updated)
      return res.status(404).json({ status: 'error', error: 'Producto no encontrado' });
    res.json({ status: 'success', payload: updated });
  } catch (err) {
    res.status(400).json({ status: 'error', error: err.message });
  }
});

router.delete('/:pid', async (req, res) => {
  try {
    const ok = await pm.delete(req.params.pid);
    if (!ok)
      return res.status(404).json({ status: 'error', error: 'Producto no encontrado' });
    const io = req.app.get('io');
    if (io) io.emit('products:update', await pm.getAll());
    res.json({ status: 'success', payload: true });
  } catch (err) {
    res.status(500).json({ status: 'error', error: err.message });
  }
});

export default router;
