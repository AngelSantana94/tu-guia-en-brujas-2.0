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
      className="fixed inset-0 z-[10000] bg-base-100 flex flex-col w-full h-full overflow-y-auto overflow-x-hidden"
      data-theme="light"
    >
      {/* HEADER DEL WIDGET */}
      <div className="flex items-center justify-between px-5 py-4 bg-base-100 shrink-0">
        <button
          type="button"
          onClick={onClose}
          className="btn btn-ghost btn-sm btn-circle text-lg font-bold cursor-pointer"
          aria-label="Cerrar"
        >
          ✕
        </button>

        <div className="w-8"></div>
      </div>

      {/* CONTENIDO PRINCIPAL */}
      <div className="flex-1 w-full max-w-md mx-auto px-4 sm:px-6 py-4 flex flex-col justify-between">
        <div className="space-y-4">
          <img
            src={logoTuguiaenbrujas}
            alt="Logo"
            className="h-24 object-contain mx-auto"
          />

          <h2 className="text-2xl font-black text-base-content leading-tight">
            ¿Cómo puede avisarte el guía si hay cambios en el tour?
          </h2>

          <p className="text-sm text-base-content/70 leading-relaxed">
            El guía puede necesitar tu número de teléfono/WhatsApp para
            contactarte en caso de cambios de última hora en el tour.
          </p>

          {/* CONTENEDOR DEL PHONE INPUT */}
          <div
            className="pt-4 phone-step-container w-full max-w-full overflow-hidden
            [&_.react-international-phone-country-selector-button]:!w-16 
            sm:[&_.react-international-phone-country-selector-button]:!w-20 
            [&_.react-international-phone-country-selector-button]:!h-14 
            [&_.react-international-phone-country-selector-button]:!border-2 
            [&_.react-international-phone-country-selector-button]:!border-base-300 
            [&_.react-international-phone-country-selector-button]:!rounded-2xl 
            [&_.react-international-phone-country-selector-button]:!bg-base-100 
            [&_.react-international-phone-country-selector-button]:!flex 
            [&_.react-international-phone-country-selector-button]:!items-center 
            [&_.react-international-phone-country-selector-button]:!justify-center 
            [&_.react-international-phone-country-selector-button]:!shrink-0
            [&_.react-international-phone-country-selector-button]:!cursor-pointer
            hover:[&_.react-international-phone-country-selector-button]:!border-neutral"
          >
            <PhoneInput
              defaultCountry="be"
              value={phone}
              onChange={(phone) => setPhone(phone)}
              className="!w-full !flex !items-center !gap-2 sm:!gap-3"
              inputClassName="!flex-1 !min-w-0 !w-full !h-14 !border-2 !border-base-300 !rounded-2xl !bg-base-100 !text-base-content !px-3 sm:!px-4 !text-base focus:!border-neutral !transition-colors !font-medium"
            />
          </div>
        </div>

        {/* BOTONES INFERIORES */}
        <div className="flex flex-col gap-4 mt-8 shrink-0">
          <button
            type="button"
            onClick={handleSave}
            className="btn btn-neutral mb-3 w-full h-12 rounded-xl text-base font-bold normal-case shadow-sm cursor-pointer"
          >
            Guardar
          </button>
        </div>
      </div>
    </div>
  );
}
