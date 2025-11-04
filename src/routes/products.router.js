import { Router } from "express";
import { upload } from "../middlewares/upload.js";
import Product from "../models/Product.js";

const router = Router();

// 👉 Formulario para agregar productos
router.get("/new", (req, res) => {
  const key = req.query.key; // la clave viene por URL

  if (key !== process.env.ADMIN_KEY) {
    return res.status(403).send("<h1>🚫 Acceso denegado</h1>");
  }

  res.render("products/add");
});


// 👉 Guardar producto (con foto)
router.post("/", upload.single("image"), async (req, res) => {
  try {
    const { title, description, price, category } = req.body;

    // 📸 Mostrar qué devuelve Cloudinary
    console.log("📸 req.file =>", JSON.stringify(req.file, null, 2));

    // 🔍 Detectar URL de la imagen, incluso si está dentro de un objeto
    let imageUrl;

    if (req.file) {
      // Si el campo "path" es un objeto, convertimos a string
      if (typeof req.file.path === "object" && req.file.path.secure_url) {
        imageUrl = req.file.path.secure_url;
      }
      // Si el campo "secure_url" está directo
      else if (req.file.secure_url) {
        imageUrl = req.file.secure_url;
      }
      // Si el campo "path" es un string normal
      else if (typeof req.file.path === "string") {
        imageUrl = req.file.path;
      }
      // Si nada de eso, tratamos de extraer la URL desde el JSON
      else {
        const stringified = JSON.stringify(req.file);
        const match = stringified.match(/https:\/\/res\.cloudinary\.com\/[^\s"]+/);
        imageUrl = match ? match[0] : undefined;
      }
    }

    console.log("✅ URL de imagen guardada:", imageUrl);

    // 👉 Crear el producto con la URL correcta
    const newProduct = await Product.create({
      title,
      description,
      price: Number(price),
      category,
      imageUrl,
    });

    console.log("✅ Producto guardado correctamente");
    res.redirect("/products");
  } catch (error) {
    console.error("❌ Error al crear producto:", error);
    res.status(400).render("products/add", {
      error: error.message,
      old: req.body,
    });
  }
});

// 👉 Listado de productos
router.get("/", async (req, res) => {
  try {
    const products = await Product.find().lean();
    console.log("📦 Productos cargados:", products.length);
    res.render("products/list", { products });
  } catch (error) {
    console.error("❌ Error al obtener productos:", error);
    res.status(500).send("Error al cargar productos");
  }
});

export default router;
