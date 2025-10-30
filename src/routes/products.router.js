import { Router } from "express";
import { upload } from "../middlewares/upload.js";
import Product from "../models/Product.js";

const router = Router();

// 👉 Formulario para agregar productos
router.get("/new", (req, res) => {
  res.render("products/add");
});

// 👉 Guardar producto (con foto)
router.post("/", upload.single("image"), async (req, res) => {
  try {
    const { title, description, price, category } = req.body;

    await Product.create({
      title,
      description,
      price: Number(price),
      category,
      imageUrl: req.file ? req.file.path : undefined, // URL pública Cloudinary
    });

    res.redirect("/products");
  } catch (error) {
    console.error(error);
    res.status(400).render("products/add", { error: error.message, old: req.body });
  }
});

// 👉 Listado de productos
router.get("/", async (req, res) => {
  const products = await Product.find().lean();
  res.render("products/list", { products });
});

export default router;
