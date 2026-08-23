// vite.config.js
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig(() => {
  return {
    // ✅ Con dominio personalizado, la base es raíz "/"
    base: "/",
    plugins: [react(), tailwindcss()],

    build: {
      rollupOptions: {
        input: {
          main: "index.html",
          freeTour: "free-tour/index.html",
          esencialTour: "esencial-tour/index.html",
          esencialNocturno: "esencial-nocturno/index.html",
          brujas: "privado-brujas/index.html",
          gante: "privado-gante/index.html",
          bruselas: "privado-bruselas/index.html",
          antwerpen: "privado-amberes/index.html",
          aboutUs: "about-us/index.html",
          misReservas: "mis-reservas/index.html",
          panelUsuario: "panel-usuario/index.html",
          privacidad: "politica-de-privacidad/index.html",
          cookies: "politica-de-cookies/index.html",
          aviso: "aviso-legal/index.html",
        },
      },
    },
  };
});
