// nodemailer.js
import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: "TU_CORREO@gmail.com",
    pass: "TU_APP_PASSWORD" // no uses tu contraseña real, usa una contraseña de aplicación
  }
});

export async function enviarMail(destinatario, asunto, mensaje) {
  try {
    await transporter.sendMail({
      from: '"Mi Tienda" <TU_CORREO@gmail.com>',
      to: destinatario,
      subject: asunto,
      text: mensaje,
    });
    console.log("📩 Email enviado a", destinatario);
  } catch (error) {
    console.error("❌ Error enviando email:", error);
  }
}
