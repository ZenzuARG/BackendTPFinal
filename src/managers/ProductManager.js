import { ProductModel } from '../dao/models/product.model.js';

export default class ProductManager {
  async getAll() {
    return ProductModel.find().lean();
  }

  async getById(id) {
    return ProductModel.findById(id).lean();
  }

  async create(data) {
    const doc = await ProductModel.create(data);
    return doc.toObject();
  }

  async update(id, data) {
    const updated = await ProductModel.findByIdAndUpdate(
      id,
      data,
      { new: true, runValidators: true }
    ).lean();
    return updated;
  }

  async delete(id) {
    const res = await ProductModel.findByIdAndDelete(id);
    return !!res;
  }

  /**
   * Paginación + filtros + orden
   * query: string -> categoría o 'available'
   * sort: 'asc' | 'desc' sobre price
   */
  async paginate({ limit = 10, page = 1, query, sort }) {
    const limitNum = Number(limit) > 0 ? Number(limit) : 10;
    const pageNum = Number(page) > 0 ? Number(page) : 1;

    const filter = {};
    if (query) {
      if (query === 'available') {
        filter.stock = { $gt: 0 };
      } else {
        // usamos query como categoría
        filter.category = query;
      }
    }

    const sortOpt = {};
    if (sort === 'asc') sortOpt.price = 1;
    if (sort === 'desc') sortOpt.price = -1;

    const skip = (pageNum - 1) * limitNum;

    const [docs, totalDocs] = await Promise.all([
      ProductModel.find(filter)
        .sort(sortOpt)
        .skip(skip)
        .limit(limitNum)
        .lean(),
      ProductModel.countDocuments(filter)
    ]);

    const totalPages = Math.max(1, Math.ceil(totalDocs / limitNum));
    const hasPrevPage = pageNum > 1;
    const hasNextPage = pageNum < totalPages;

    return {
      status: 'success',
      payload: docs,
      totalPages,
      prevPage: hasPrevPage ? pageNum - 1 : null,
      nextPage: hasNextPage ? pageNum + 1 : null,
      page: pageNum,
      hasPrevPage,
      hasNextPage
      // prevLink y nextLink los arma el router con la URL real
    };
  }
}
