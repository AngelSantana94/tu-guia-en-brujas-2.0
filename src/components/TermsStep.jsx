import { useState } from "react";
import logoTuguiaenbrujas from "../assets/logo-header-01.png";

export default function TermsStep({ onAccept, onBack, submitting }) {
  const [accepted, setAccepted] = useState(false);

  return (
    <div
      style={{ zIndex: 9999 }}
      className="fixed inset-0 bg-base-100 flex flex-col w-full h-dvh overflow-y-auto"
      data-theme="light"
    >
      {/* Header idéntico al del paso "Tus datos" */}
      <div className="flex items-center justify-between p-4 shrink-0">
        <button
          type="button"
          onClick={onBack}
          className="btn btn-ghost btn-circle btn-sm bg-base-200/50"
          aria-label="Atrás"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth="2"
            stroke="currentColor"
            className="w-5 h-5"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18"
            />
          </svg>
        </button>
        <div className="w-8" />
      </div>

      <div className="flex-1 w-full max-w-md mx-auto px-6 py-4 flex flex-col">
        <img
          src={logoTuguiaenbrujas}
          alt="Tu Guía en Brujas"
          className="h-24 object-contain mb-4"
        />
        <h2 className="text-2xl font-bold text-base-content mb-2">
          Normas del tour
        </h2>
        <p className="text-sm text-base-content/60 mb-8 font-medium">
          Solo un momento antes de confirmar tu plaza.
        </p>

        {/* Sección: A tener en cuenta */}
        <div className="space-y-4">
          <h3 className="text-lg font-bold text-base-content uppercase tracking-wider text-xs opacity-70">
            A tener en cuenta:
          </h3>

          <ul className="p-0 m-0 list-none">
            {/* PUNTO 1 */}
            <li className="flex gap-4 items-start list-none p-0 mb-7 last:mb-0">
              <div className="p-2 bg-base-200 rounded-full shrink-0 text-base-content/70 mt-0.5">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={2}
                  stroke="currentColor"
                  className="w-5 h-5"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M2.25 8.25h19.5M2.25 9h19.5m-16.5 5.25h6m-6 2.25h3m-3.75 3h15a2.25 2.25 0 0 0 2.25-2.25V6.75A2.25 2.25 0 0 0 19.5 4.5h-15a2.25 2.25 0 0 0-2.25 2.25v10.5A2.25 2.25 0 0 0 4.5 19.5Z"
                  />
                </svg>
              </div>
              <div>
                <h4 className="font-bold text-base text-base-content leading-tight mb-1">
                  Realiza un pago justo
                </h4>
                <p className="text-sm text-base-content/60 leading-normal">
                  Aunque el tour no tiene una tarifa obligatoria, lo habitual
                  para recompensar el esfuerzo y la calidad del recorrido es una
                  aportación orientativa de entre{" "}
                  <span className="font-semibold text-base-content/80">
                    15 y 50 € por persona
                  </span>
                  .
                </p>
              </div>
            </li>

            {/* PUNTO 2 */}
            <li className="flex gap-4 items-start list-none p-0 mb-7 last:mb-0">
              <div className="p-2 bg-base-200 rounded-full shrink-0 text-base-content/70 mt-0.5">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={2}
                  stroke="currentColor"
                  className="w-5 h-5"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M12 6v6h4.5m4.5 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z"
                  />
                </svg>
              </div>
              <div>
                <h4 className="font-bold text-base text-base-content leading-tight mb-1">
                  Llega 10 minutos antes
                </h4>
                <p className="text-sm text-base-content/60 leading-normal">
                  Asegúrate de llegar antes para{" "}
                  <span className="font-semibold text-base-content/80">
                    encontrar al guía
                  </span>{" "}
                  en el punto de encuentro.
                </p>
              </div>
            </li>

            {/* PUNTO 3 */}
            <li className="flex gap-4 items-start list-none p-0 mb-7 last:mb-0">
              <div className="p-2 bg-base-200 rounded-full shrink-0 text-base-content/70 mt-0.5">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={2}
                  stroke="currentColor"
                  className="w-5 h-5"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="m9.75 9.75 4.5 4.5m0-4.5-4.5 4.5M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z"
                  />
                </svg>
              </div>
              <div>
                <h4 className="font-bold text-base text-base-content leading-tight mb-1">
                  Cancela si no puedes asistir
                </h4>
                <p className="text-sm text-base-content/60 leading-normal">
                  El aforo está limitado a{" "}
                  <span className="font-semibold text-base-content/80">
                    20 personas por tour
                  </span>
                  . Si no puedes venir, cancela o modifica tu reserva con
                  antelación: el guía te estará esperando.
                </p>
              </div>
            </li>
          </ul>
        </div>

        {/* Checkbox de aceptación */}
        <label className="flex items-start gap-3 mt-8 cursor-pointer select-none">
          <input
            type="checkbox"
            checked={accepted}
            onChange={(e) => setAccepted(e.target.checked)}
            className="checkbox checkbox-neutral mt-0.5 shrink-0"
          />
          <span className="text-sm text-base-content/70">
            He leído y acepto las condiciones del tour.
          </span>
        </label>

        {/* BOTÓN DE ACEPTACIÓN */}
        <div className="pt-6">
          <button
            type="button"
            onClick={onAccept}
            disabled={!accepted || submitting}
            className="btn btn-neutral btn-lg w-full rounded-xl text-white font-medium shadow-md transition-all active:scale-[0.98] disabled:opacity-40"
          >
            {submitting ? (
              <span className="loading loading-spinner" />
            ) : (
              "Aceptar y continuar"
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
