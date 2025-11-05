import express from "express";
import { engine } from "express-handlebars";
import path from "path";
import dotenv from "dotenv";
import { connectDB } from "./db.js";
import productsRouter from "./routes/products.router.js";

dotenv.config();

const app = express();

// 📦 Handlebars
app.engine("handlebars", engine());
app.set("view engine", "handlebars");
app.set("views", path.resolve("src", "views"));

// 📜 Parsers
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// 🖼️ Archivos estáticos
app.use("/public", express.static(path.resolve("public")));
app.use("/uploads", express.static(path.resolve("uploads")));

// 🧩 Rutas
app.use("/products", productsRouter);

// 🧱 Ruta protegida solo para admin
app.get("/upload", (req, res) => {
  const key = req.query.key; // Clave en la URL

  if (key !== process.env.ADMIN_KEY) {
    return res.status(403).send("<h1>🚫 Acceso denegado</h1>");
  }

  // Si la clave es correcta, renderiza el formulario de agregar producto
  res.render("products/add");
});

app.get('/', (_req, res) => {
  res.render('home');
});

app.get('/contacto', (_req, res) => {
  res.render('contacto');
});



// 🚀 Inicializar servidor y conexión DB
const PORT = process.env.PORT || 3000;
await connectDB(process.env.MONGODB_URI);
app.listen(PORT, () => console.log(`🚀 http://localhost:${PORT}`));
