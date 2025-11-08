import { Router } from "express";
import { upload } from "../middlewares/upload.js";
import Product from "../models/Product.js";
import { MercadoPagoConfig, Preference } from "mercadopago";

const router = Router();

// ✅ Configurar Mercado Pago con tu Access Token del .env
const client = new MercadoPagoConfig({
  accessToken: process.env.MERCADOPAGO_ACCESS_TOKEN,
});

// 👉 Formulario para agregar productos (solo con clave)
router.get("/new", (req, res) => {
  const key = req.query.key;
  if (key !== process.env.ADMIN_KEY) {
    return res.status(403).send("<h1>🚫 Acceso denegado</h1>");
  }
  res.render("products/add");
});

// 👉 Guardar producto (con imagen subida a Cloudinary)
router.post("/", upload.single("image"), async (req, res) => {
  try {
    const { title, description, price, category } = req.body;
    console.log("📸 req.file =>", JSON.stringify(req.file, null, 2));

    let imageUrl;
    if (req.file) {
      if (req.file.secure_url) imageUrl = req.file.secure_url;
      else if (typeof req.file.path === "string") imageUrl = req.file.path;
      else {
        const match = JSON.stringify(req.file).match(/https:\/\/res\.cloudinary\.com\/[^\s"]+/);
        imageUrl = match ? match[0] : undefined;
      }
    }

    await Product.create({
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
    res.render("products/list", { products });
  } catch (error) {
    console.error("❌ Error al obtener productos:", error);
    res.status(500).send("Error al cargar productos");
  }
});

// 👉 Detalle de producto individual
router.get("/:id", async (req, res) => {
  try {
    const product = await Product.findById(req.params.id).lean();
    if (!product) return res.status(404).send("Producto no encontrado");
    res.render("products/detail", { product });
  } catch (error) {
    console.error(error);
    res.status(500).send("Error al obtener el producto");
  }
});

// 🛒 Crear preferencia de Mercado Pago (pago directo)
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

    console.log("✅ Preferencia creada correctamente");
    console.log("🔗 URL de pago:", response.id || response.body.id);

    // Redirigir al checkout
    res.redirect(response.init_point || response.body.init_point);
  } catch (error) {
    console.error("❌ Error creando preferencia:", error);
    console.log("🪲 Detalle del error:", JSON.stringify(error, null, 2));
    res.status(500).send("Error al iniciar pago");
  }
});

export default router;
