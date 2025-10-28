import { Router } from 'express';
import { Product } from '../models/Product.js';
import { upload } from '../middlewares/upload.js';

export const productsRouter = Router();

// Form de carga
productsRouter.get('/new', (_req, res) => {
  res.render("products/add");
});

// Crear producto con imagen
productsRouter.post('/', upload.single('image'), async (req, res) => {
  try {
    const { title, description, price, category } = req.body;
    const imageUrl = req.file ? `/uploads/${req.file.filename}` : undefined;

    await Product.create({
      title,
      description,
      price: Number(price),
      category,
      imageUrl,
    });

    res.redirect('/products');
  } catch (err) {
    console.error(err);
    res.status(400).render('products/new', { error: err.message, old: req.body });
  }
});

// Listado
productsRouter.get('/', async (_req, res) => {
  const products = await Product.find().sort({ createdAt: -1 }).lean();
  res.render('products/list', { products });
});
