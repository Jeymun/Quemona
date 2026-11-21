import dotenv from "dotenv";
dotenv.config();

import express from "express";
import { engine } from "express-handlebars";
import path from "path";
import session from "express-session";
import adminRouter from "./routes/admin.router.js";
import { connectDB } from "./db.js";
import productsRouter from "./routes/products.router.js";
import Product from "./models/Product.js";
import { v2 as cloudinary } from "cloudinary";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

console.log(
  "🔑 Mercado Pago Token:",
  process.env.MERCADOPAGO_ACCESS_TOKEN ? "Cargado ✅" : "No encontrado ❌"
);

const app = express();

/* ==============================
   CONFIGURACIÓN BASE
================================= */

// 📦 Handlebars
app.engine("handlebars", engine());
app.set("view engine", "handlebars");
app.set("views", path.resolve("src", "views"));

// 📜 PARSERS (SIEMPRE PRIMERO)
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// 🔐 SESSION (DESPUÉS DE PARSERS)
app.use(
  session({
    secret: process.env.SESSION_SECRET || "supersecret",
    resave: false,
    saveUninitialized: false,
  })
);

// 🖼️ Archivos estáticos
app.use("/public", express.static(path.resolve("public")));
app.use("/uploads", express.static(path.resolve("uploads")));

/* ==============================
   ROUTERS
================================= */

app.use("/admin", adminRouter);
app.use("/products", productsRouter);

/* ==============================
   RUTAS GENERALES
================================= */

app.get("/", async (_req, res) => {
  try {
    const allProducts = await Product.find().lean();
    const featuredProducts = allProducts
      .sort(() => Math.random() - 0.5)
      .slice(0, 3);

    res.render("home", { featuredProducts });
  } catch (error) {
    console.error("❌ Error al cargar productos destacados:", error);
    res.render("home", { featuredProducts: [] });
  }
});

app.get("/contacto", (_req, res) => {
  res.render("contacto");
});

app.post("/contacto", (req, res) => {
  const { nombre, email, mensaje } = req.body;
  console.log("📩 Nuevo mensaje de contacto:", { nombre, email, mensaje });
  res.render("contacto", { enviado: true });
});

app.get("/success", (_req, res) => res.render("success"));
app.get("/failure", (_req, res) => res.render("failure"));
app.get("/pending", (_req, res) => res.render("pending"));

/* ==============================
   SERVER + DB
================================= */

const PORT = process.env.PORT || 3000;

await connectDB(process.env.MONGODB_URI);

app.listen(PORT, () => {
  console.log(`🚀 Servidor corriendo en http://localhost:${PORT}`);
});