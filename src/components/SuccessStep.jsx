import React from "react";
import { CheckCircle2, Mail, Sparkles, CalendarCheck } from "lucide-react";
import reservaConfirmada from "../assets/reserva-confirmada.jpeg";

export default function SuccessStep({ email, onClose }) {
  return (
    <div
      className="fixed inset-0 z-[9999] bg-base-100 flex flex-col w-full h-full overflow-y-auto"
      data-theme="light"
    >
      {/* FOTO CON DEGRADADO */}
      <div className="relative w-full h-64 sm:h-80 shrink-0 overflow-hidden rounded-t-3xl sm:max-w-md sm:mx-auto">
        <img
          src={reservaConfirmada}
          alt="Reserva confirmada"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-x-0 bottom-0 h-20 bg-gradient-to-t from-base-100 to-transparent" />
      </div>

      {/* CONTENIDO DE LA CONFIRMACIÓN */}
      <div className="flex-1 w-full max-w-md mx-auto px-6 pt-2 pb-8 flex flex-col justify-between shadow-[0_25px_60px_-15px_rgba(168,85,247,0.3)] rounded-3xl relative z-10 bg-base-100">
        <div className="space-y-5">
          {/* CABECERA CON ICONO ANIMADO */}
          <div className="text-center space-y-3 pt-2">
            {/* Icono de Check con efecto pop/pulse suave */}
            <div className="inline-flex items-center justify-center w-16 h-16 bg-success/10 text-success rounded-full ring-8 ring-success/5 animate-[bounce_1s_ease-in-out_1]">
              <CheckCircle2 className="w-10 h-10 stroke-[2.5]" />
            </div>

            <div className="space-y-1">
              <h2 className="text-3xl font-extrabold text-base-content tracking-tight">
                ¡Reserva confirmada!
              </h2>
              <p className="text-sm text-base-content/70 font-medium">
                ¡Todo listo! Tu plaza para el tour ya está asegurada.
              </p>
            </div>
          </div>

          {/* TARJETA CON EL EMAIL DE DESTINO */}
          <div className="bg-base-200/60 border border-base-300 rounded-2xl p-3.5 flex items-center gap-3">
            <div className="bg-primary/10 text-primary p-2.5 rounded-xl shrink-0">
              <Mail className="w-5 h-5" />
            </div>
            <div className="overflow-hidden">
              <p className="text-[11px] text-base-content/60 font-semibold uppercase tracking-wider">
                Comprobante enviado a
              </p>
              <p className="text-sm font-bold text-base-content truncate">
                {email || "tuemail@ejemplo.com"}
              </p>
            </div>
          </div>

          {/* RECOMENDACIONES Y SPAM */}
          <div className="space-y-3 bg-base-100 border border-base-200 rounded-2xl p-4">
            <div className="flex items-start gap-2.5">
              <Sparkles className="w-4 h-4 text-warning shrink-0 mt-0.5" />
              <p className="text-xs text-base-content/80 leading-relaxed font-medium">
                Te enviamos la ubicación exacta del punto de encuentro y los
                detalles de tu guía.
              </p>
            </div>
            <div className="flex items-start gap-2.5 pt-2.5 border-t border-base-200/60">
              <CalendarCheck className="w-4 h-4 text-info shrink-0 mt-0.5" />
              <p className="text-xs text-base-content/70 leading-relaxed">
                ¿No lo ves en un par de minutos? Revisa la carpeta de{" "}
                <strong>Spam</strong> o <strong>Promociones</strong> y márcalo
                como deseado.
              </p>
            </div>
          </div>
        </div>

        {/* BOTÓN DE CIERRE */}
        <div className="pt-6">
          <button
            type="button"
            onClick={onClose}
            className="btn btn-neutral btn-lg w-full rounded-xl text-white font-medium shadow-md transition-all active:scale-[0.98]"
          >
            Entendido, ¡gracias!
          </button>
        </div>
      </div>
    </div>
  );
}
