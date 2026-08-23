import React, { useState } from "react";
import { PhoneInput } from "react-international-phone";
import "react-international-phone/style.css"; // Estilos base de la librería
import logoTuguiaenbrujas from "../assets/logo-header-01.png";

export default function PhoneStep({ onNext, onSkip, onBack }) {
  const [phone, setPhone] = useState("");

  const handleSave = () => {
    // Si el usuario solo dejó el prefijo (ej: "+32") o está vacío, lo tratamos como omitido
    const cleanedPhone = phone.trim();
    if (cleanedPhone.length <= 4) {
      onSkip();
    } else {
      onNext(cleanedPhone);
    }
  };

  return (
    <div
      className="fixed inset-0 z-[10000] bg-base-100 flex flex-col w-full h-full overflow-y-auto"
      data-theme="light"
    >
      {/* HEADER DEL WIDGET */}
      <div className="flex items-center justify-between px-5 py-4 bg-base-100 shrink-0">
        <button
          onClick={onBack}
          className="btn btn-ghost btn-sm btn-circle text-lg font-bold"
          aria-label="Volver atrás"
        >
          ✕
        </button>

        <div className="w-8"></div>
      </div>

      {/* CONTENIDO PRINCIPAL */}
      <div className="flex-1 w-full max-w-md mx-auto px-6 py-4 flex flex-col justify-between shadow-[0_25px_60px_-15px_rgba(168,85,247,0.3)]">
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
            className="pt-4 phone-step-container w-full overflow-hidden
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
            onClick={handleSave}
            className="btn btn-neutral mb-3 w-full h-12 rounded-xl text-base font-bold normal-case shadow-sm"
          >
            Guardar
          </button>
        </div>
      </div>
    </div>
  );
}
