import express from 'express';
import { engine } from 'express-handlebars';
import path from 'path';
import dotenv from 'dotenv';
import { connectDB } from './db.js';
import { productsRouter } from './routes/products.router.js';

dotenv.config();

const app = express();

// Handlebars
app.engine('handlebars', engine());
app.set('view engine', 'handlebars');
app.set('views', path.resolve('src', 'views'));

// Parsers
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// Static
app.use('/public', express.static(path.resolve('public')));
app.use('/uploads', express.static(path.resolve('uploads'))); // 👈 necesario para ver imágenes

// Rutas
app.use('/products', productsRouter);

// Home simple
app.get('/', (_req, res) => res.redirect('/products'));

const PORT = process.env.PORT || 3000;
await connectDB(process.env.MONGODB_URI);
app.listen(PORT, () => console.log(`🚀 http://localhost:${PORT}`));
