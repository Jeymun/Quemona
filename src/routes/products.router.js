import { Router } from "express";
import { upload } from "../middlewares/upload.js";
import Product from "../models/Product.js";
import { MercadoPagoConfig, Preference } from "mercadopago";
import { v2 as cloudinary } from "cloudinary";
import fs from "fs";

const router = Router();

/* ==============================
   CONFIG MERCADO PAGO
================================= */
const client = new MercadoPagoConfig({
  accessToken: process.env.MERCADOPAGO_ACCESS_TOKEN,
});

/* ==============================
   MIDDLEWARE ADMIN
================================= */
function isAdmin(req, res, next) {
  if (req.session?.isAdmin) return next();
  return res.status(403).send("🚫 Acceso denegado");
}

/* ==============================
   FORM CREAR PRODUCTO
================================= */
router.get("/new", isAdmin, (req, res) => {
  res.render("products/add");
});

/* ==============================
   CREAR PRODUCTO
================================= */
router.post("/", isAdmin, upload.single("image"), async (req, res) => {
  try {
    const { title, description, price, category } = req.body;

    // Validación básica
    const parsedPrice = Number(price);
    if (!title || !description || !category) {
      throw new Error("Todos los campos son obligatorios");
    }
    if (isNaN(parsedPrice) || parsedPrice <= 0) {
      throw new Error("Precio inválido");
    }

    let imageUrl;

    if (req.file) {
      const result = await cloudinary.uploader.upload(req.file.path, {
        folder: "quemona/products",
      });

      imageUrl = result.secure_url;

      // borrar archivo temporal
      fs.unlinkSync(req.file.path);
    }

    await Product.create({
      title,
      description,
      price: parsedPrice,
      category,
      imageUrl,
    });

    res.redirect("/products");

  } catch (error) {
    console.error("❌ Error al crear producto:", error);
    res.status(400).render("products/add", {
      error: error.message,
      old: req.body,
    });
  }
});

/* ==============================
   LISTADO DE PRODUCTOS
================================= */
router.get("/", async (req, res) => {
  try {
    const products = await Product.find().lean();
    res.render("products/list", { products });
  } catch (error) {
    console.error("❌ Error al obtener productos:", error);
    res.status(500).send("Error al cargar productos");
  }
});

/* ==============================
   DETALLE DE PRODUCTO
================================= */
router.get("/:id", async (req, res) => {
  try {
    const product = await Product.findById(req.params.id).lean();
    if (!product) return res.status(404).send("Producto no encontrado");

    res.render("products/detail", { product });
  } catch (error) {
    console.error("❌ Error al obtener producto:", error);
    res.status(500).send("Error al obtener el producto");
  }
});

router.delete("/clear-test", async (req, res) => {
  try {
    await Product.deleteMany({ title: /test/i });
    res.send("Productos de prueba eliminados");
  } catch (error) {
    res.status(500).send("Error al eliminar productos");
  }
});

/* ==============================
   COMPRAR PRODUCTO
================================= */
router.post("/buy/:id", async (req, res) => {
  try {
    const product = await Product.findById(req.params.id).lean();
    if (!product) return res.status(404).send("Producto no encontrado");

    const preference = new Preference(client);

    const response = await preference.create({
      body: {
        items: [
          {
            id: product._id.toString(),
            title: product.title,
            quantity: 1,
            unit_price: Number(product.price),
            currency_id: "ARS",
            picture_url: product.imageUrl,
          },
        ],
        back_urls: {
          success: "https://quemona.onrender.com/success",
          failure: "https://quemona.onrender.com/failure",
          pending: "https://quemona.onrender.com/pending",
        },
        auto_return: "approved",
      },
    });

    res.redirect(response.init_point);

  } catch (error) {
    console.error("❌ Error creando preferencia:", error);
    res.status(500).send("Error al iniciar pago");
  }
});

export default router;