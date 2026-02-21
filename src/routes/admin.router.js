import { Router } from "express";
const router = Router();

router.get("/login", (req, res) => {
  res.render("admin/login");
});

router.post("/login", (req, res) => {
  const { password } = req.body;

  if (password === process.env.ADMIN_KEY) {
    req.session.isAdmin = true;

    console.log("SESSION DESPUÉS DE LOGIN:", req.session);

    return res.redirect("/products/new");
  }

  res.status(401).send("Acceso denegado");
});

router.get("/", (req, res) => {
  if (!req.session.isAdmin) {
    return res.redirect("/admin/login");
  }

  res.render("products/add");
});

export default router;
