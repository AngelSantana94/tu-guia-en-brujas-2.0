import React from "react";
import ReactDOM from "react-dom/client";
import HeaderAuth from "./components/HeaderAuth";
import UserDashboard from "./components/UserDashboard";
import MyReviews from "./components/MyReviews";
import { ProtectedRoute } from "./components/ProtectedRoute";
import EditarPerfil from "./components/EditarPerfil";
import { inject } from "@vercel/analytics";
import "/src/tailwind.css";

// 1. Inicializar Vercel Analytics globalmente
inject();

// Helper para montar componentes de forma segura (sin errores si el ID no existe en el HTML actual)
function safeRender(id, element) {
  const container = document.getElementById(id);
  if (!container) return;

  if (!container._reactRoot) {
    container._reactRoot = ReactDOM.createRoot(container);
  }
  container._reactRoot.render(<React.StrictMode>{element}</React.StrictMode>);
}

// 2. Montar cada módulo en su contenedor HTML correspondiente
safeRender("header-auth-root", <HeaderAuth />);

safeRender(
  "reservas-root",
  <ProtectedRoute>
    <UserDashboard />
  </ProtectedRoute>,
);

safeRender(
  "opiniones-root",
  <ProtectedRoute>
    <MyReviews />
  </ProtectedRoute>,
);

safeRender("editar-perfil-root", <EditarPerfil />);
