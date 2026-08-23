import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import HeaderAuth from "./components/HeaderAuth";
import UserDashboard from "./components/UserDashboard";
import MyReviews from "./components/MyReviews";
import { ProtectedRoute } from "./components/ProtectedRoute";
import EditarPerfil from "./components/EditarPerfil";
import { inject } from "@vercel/analytics";
import "/src/tailwind.css";

// 1. Inicializar Vercel Analytics globalmente para todas las páginas
inject();

// Helper para montar componentes de forma segura (evita Error #299 y elementos nulos)
function safeRender(id, element) {
  const container = document.getElementById(id);
  if (!container) return;

  if (!container._reactRoot) {
    container._reactRoot = ReactDOM.createRoot(container);
  }
  container._reactRoot.render(<React.StrictMode>{element}</React.StrictMode>);
}

// 2. Header
safeRender("header-auth-root", <HeaderAuth />);

// 3. Dashboard de Usuario
safeRender(
  "reservas-root",
  <ProtectedRoute>
    <UserDashboard />
  </ProtectedRoute>,
);

// 4. Mis Opiniones
safeRender(
  "opiniones-root",
  <ProtectedRoute>
    <MyReviews />
  </ProtectedRoute>,
);

// 5. Editar Perfil
safeRender("editar-perfil-root", <EditarPerfil />);

// 6. Aplicación principal (solo si el HTML tiene id="root")
safeRender("root", <App />);
