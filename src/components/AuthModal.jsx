import React, { useState, useEffect } from "react";
import { supabase } from "../lib/supabaseClient";

function FadeIn({ children }) {
  const [show, setShow] = useState(false);
  useEffect(() => {
    const id = requestAnimationFrame(() => setShow(true));
    return () => cancelAnimationFrame(id);
  }, []);
  return (
    <div
      className={`transition-all duration-300 ease-out ${
        show ? "opacity-100 translate-y-0" : "opacity-0 translate-y-2"
      }`}
    >
      {children}
    </div>
  );
}

export default function AuthModal({ isOpen, onClose }) {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [mounted, setMounted] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setMounted(false);
      setGoogleLoading(false);
      setSent(false);
      setErrorMsg("");
      const id = requestAnimationFrame(() => setMounted(true));
      return () => cancelAnimationFrame(id);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  // Login con Google
  const handleGoogleLogin = async () => {
    setErrorMsg("");
    setGoogleLoading(true);
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/mis-reservas/`,
      },
    });
    if (error) {
      setErrorMsg("Error al conectar con Google.");
      setGoogleLoading(false);
    }
  };

  // Login con Magic Link / OTP por Email
  const handleEmailLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg("");

    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: `${window.location.origin}/panel-usuario/`,
      },
    });

    setLoading(false);
    if (error) {
      setErrorMsg("Error al enviar el enlace. Inténtalo de nuevo.");
    } else {
      setSent(true);
    }
  };

  return (
    <div
      className={`fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-md p-4 overflow-y-auto transition-opacity duration-300 ${
        mounted ? "opacity-100" : "opacity-0"
      }`}
      data-theme="light"
    >
      <div
        className={`relative w-full max-w-md max-h-[90dvh] overflow-y-auto bg-base-100 rounded-[28px] shadow-[0_25px_70px_-15px_rgba(138,60,184,0.35)] transition-all duration-300 ease-out ${
          mounted
            ? "opacity-100 scale-100 translate-y-0"
            : "opacity-0 scale-95 translate-y-3"
        }`}
      >
        {/* Blob decorativo de fondo */}
        <div className="absolute -top-16 -right-16 w-48 h-48 rounded-full bg-[#8a3cb8]/20 blur-3xl pointer-events-none" />

        {/* Botón Cerrar */}
        <button
          onClick={onClose}
          className="absolute right-4 top-4 z-10 w-9 h-9 rounded-full bg-base-200/70 hover:bg-base-200 flex items-center justify-center transition-colors"
          aria-label="Cerrar"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            className="w-4 h-4"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>

        <div className="relative p-8">
          {/* Icono de marca */}
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#8a3cb8] to-[#6d2d93] flex items-center justify-center mx-auto mb-5 shadow-lg shadow-[#8a3cb8]/30">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="white"
              strokeWidth="2"
              className="w-6 h-6"
            >
              <rect x="5" y="11" width="14" height="9" rx="2" />
              <path strokeLinecap="round" d="M8 11V7a4 4 0 0 1 8 0v4" />
            </svg>
          </div>

          <h3 className="text-2xl font-bold text-center text-gray-900 mb-1">
            Acceso al panel
          </h3>
          <p className="text-sm text-center text-base-content/60 mb-7">
            Inicia sesión o regístrate para gestionar tus reservas
          </p>

          {errorMsg && (
            <div className="text-xs text-red-600 bg-red-50 border border-red-100 rounded-xl px-3 py-2.5 mb-4 text-center">
              {errorMsg}
            </div>
          )}

          {sent ? (
            <FadeIn>
              <div className="text-center py-6 bg-[#8a3cb8]/5 rounded-2xl border border-[#8a3cb8]/15">
                <div className="w-12 h-12 rounded-full bg-[#8a3cb8]/10 flex items-center justify-center mx-auto mb-3">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="#8a3cb8"
                    strokeWidth="2.5"
                    className="w-6 h-6"
                  >
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                </div>
                <p className="text-sm font-semibold text-gray-900">
                  ¡Enlace enviado!
                </p>
                <p className="text-xs text-base-content/60 mt-1 px-4">
                  Revisa tu correo{" "}
                  <span className="font-semibold text-gray-800">{email}</span>{" "}
                  para acceder directamente.
                </p>
              </div>
            </FadeIn>
          ) : googleLoading ? (
            <FadeIn>
              <div className="flex flex-col items-center justify-center py-8 gap-3">
                <div className="w-8 h-8 border-[3px] border-[#8a3cb8]/20 border-t-[#8a3cb8] rounded-full animate-spin" />
                <p className="text-sm text-base-content/60">
                  Conectando con Google...
                </p>
              </div>
            </FadeIn>
          ) : (
            <FadeIn>
              <button
                onClick={handleGoogleLogin}
                type="button"
                className="btn w-full rounded-2xl flex items-center justify-center gap-2.5 border border-gray-200 bg-white hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 mb-5"
              >
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                  <path
                    fill="#4285F4"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                  />
                </svg>
                <span className="font-medium text-gray-700">
                  Continuar con Google
                </span>
              </button>

              <div className="flex items-center gap-3 mb-5">
                <div className="h-px flex-1 bg-gray-200" />
                <span className="text-[11px] font-semibold tracking-wider text-gray-400">
                  O
                </span>
                <div className="h-px flex-1 bg-gray-200" />
              </div>

              <form onSubmit={handleEmailLogin} className="space-y-3">
                <input
                  type="email"
                  placeholder="tu@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full px-4 py-3 rounded-2xl border-2 border-gray-200 focus:outline-none focus:border-[#8a3cb8] focus:ring-4 focus:ring-[#8a3cb8]/10 transition-all text-sm"
                />
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3 rounded-2xl bg-gradient-to-r from-[#8a3cb8] to-[#6d2d93] text-white! font-semibold text-sm shadow-lg shadow-[#8a3cb8]/25 hover:shadow-xl hover:shadow-[#8a3cb8]/30 hover:-translate-y-0.5 active:translate-y-0 transition-all duration-200 disabled:opacity-60 disabled:hover:translate-y-0 flex items-center justify-center"
                >
                  {loading ? (
                    <span className="loading loading-spinner loading-sm" />
                  ) : (
                    "Recibir enlace de acceso"
                  )}
                </button>
              </form>
            </FadeIn>
          )}
        </div>
      </div>
    </div>
  );
}
