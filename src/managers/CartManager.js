import { CartModel } from '../dao/models/cart.model.js';

export default class CartManager {
  async create() {
    const cart = await CartModel.create({ products: [] });
    return cart.toObject();
  }

  async getById(id, { populate = false } = {}) {
    let query = CartModel.findById(id);
    if (populate) {
      query = query.populate('products.product');
    }
    const cart = await query.lean();
    return cart;
  }

  async getAll() {
    return CartModel.find().lean();
  }

  async addProduct(cid, pid, qty = 1) {
    const cart = await CartModel.findById(cid);
    if (!cart) return null;

    const quantity = Number(qty) > 0 ? Number(qty) : 1;
    const item = cart.products.find(p => p.product.toString() === pid);

    if (item) item.quantity += quantity;
    else cart.products.push({ product: pid, quantity });

    await cart.save();
    return cart.toObject();
  }

  async updateProducts(cid, productsArray) {
    const cart = await CartModel.findById(cid);
    if (!cart) return null;

    cart.products = productsArray.map(p => ({
      product: p.product,
      quantity: Number(p.quantity) || 1
    }));

    await cart.save();
    return cart.toObject();
  }

  async updateProductQuantity(cid, pid, qty) {
    const cart = await CartModel.findById(cid);
    if (!cart) return null;

    const item = cart.products.find(p => p.product.toString() === pid);
    if (!item) return null;

    item.quantity = Number(qty) || item.quantity;
    await cart.save();
    return cart.toObject();
  }

  async deleteProduct(cid, pid) {
    const cart = await CartModel.findById(cid);
    if (!cart) return null;

    cart.products = cart.products.filter(
      p => p.product.toString() !== pid
    );
    await cart.save();
    return cart.toObject();
  }

  async clearCart(cid) {
    const cart = await CartModel.findById(cid);
    if (!cart) return null;

    cart.products = [];
    await cart.save();
    return cart.toObject();
  }
}
