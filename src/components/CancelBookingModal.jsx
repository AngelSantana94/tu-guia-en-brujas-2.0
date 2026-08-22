import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { supabase } from "../lib/supabaseClient";

const MOTIVOS = [
  { key: "viaje_cancelado", label: "El viaje ha sido cancelado" },
  {
    key: "cambio_fecha",
    label:
      "Quiero realizar el mismo tour pero en otra fecha, hora o idioma diferentes",
  },
  { key: "cambio_personas", label: "Ha cambiado el número de personas" },
  { key: "otro_tour", label: "He encontrado otro tour que me interesa más" },
  { key: "salud", label: "Problemas de salud" },
  { key: "clima", label: "Condiciones meteorológicas" },
  { key: "guia_pidio", label: "El guía me ha pedido que cancele" },
  { key: "error_pagina", label: "Error en la página" },
  { key: "otro", label: "Otro motivo" },
];

export default function CancelBookingModal({
  booking,
  isOpen,
  onClose,
  onCancelled,
}) {
  const [selectedReason, setSelectedReason] = useState(null);
  const [otherNote, setOtherNote] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  // Reiniciar el formulario cada vez que se abre el modal
  useEffect(() => {
    if (!isOpen) return;
    setSelectedReason(null);
    setOtherNote("");
    setError(null);
  }, [isOpen, booking?.id]);

  if (!isOpen || !booking) return null;

  const isOtro = selectedReason === "otro";
  const canConfirm =
    !!selectedReason && (!isOtro || otherNote.trim().length > 0);

  const handleConfirm = async () => {
    if (!canConfirm) return;

    setSubmitting(true);
    setError(null);

    const { data: updateData, error: dbError } = await supabase
      .from("bookings")
      .update({
        status: "cancelled",
        cancellation_reason: selectedReason,
        cancellation_note: isOtro ? otherNote.trim() : null,
      })
      .eq("id", booking.id)
      .select();

    setSubmitting(false);

    if (dbError) {
      console.error("[CancelBookingModal] error al cancelar:", dbError);
      setError("No se pudo cancelar la reserva. Inténtalo de nuevo.");
      return;
    }

    // Supabase/PostgREST no da error cuando RLS bloquea la fila: simplemente
    // actualiza 0 filas y responde 200 OK. Si no volvió ninguna fila, la
    // cancelación NO se guardó de verdad, aunque no hubo excepción.
    if (!updateData || updateData.length === 0) {
      setError(
        "No se pudo cancelar la reserva (permisos insuficientes). Contacta con soporte.",
      );
      return;
    }

    if (onCancelled) {
      onCancelled({
        id: booking.id,
        status: "cancelled",
        cancellation_reason: selectedReason,
        cancellation_note: isOtro ? otherNote.trim() : null,
      });
    }
    onClose();
  };

  return createPortal(
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-0 md:p-4">
      <div className="relative w-full h-full md:h-auto md:max-h-[90vh] md:max-w-lg bg-base-100 rounded-none md:rounded-3xl shadow-2xl flex flex-col overflow-hidden">
        {/* Cabecera */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-base-200 shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="btn btn-ghost btn-circle btn-sm bg-base-200/60"
            aria-label="Cerrar"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="w-5 h-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2.5"
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
          <span className="font-bold text-lg">Cancelar</span>
          <div className="w-8" />
        </div>

        {/* Cuerpo */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {error && (
            <div className="p-3 bg-error/10 border border-error/30 rounded-xl text-error text-sm font-medium text-center">
              {error}
            </div>
          )}

          <h3 className="text-xl font-extrabold text-base-content">
            ¿Por qué quieres cancelar tu reserva?
          </h3>

          <div className="flex flex-col divide-y divide-base-200 border-y border-base-200">
            {MOTIVOS.map((motivo) => {
              const isSelected = selectedReason === motivo.key;
              return (
                <label
                  key={motivo.key}
                  className="flex items-center gap-4 py-4 cursor-pointer select-none"
                >
                  <input
                    type="checkbox"
                    checked={isSelected}
                    onChange={() =>
                      setSelectedReason(isSelected ? null : motivo.key)
                    }
                    className="checkbox checkbox-sm rounded-md border-2 border-base-300 [--chkbg:theme(colors.neutral)] [--chkfg:white]"
                  />
                  <span className="text-sm text-base-content leading-snug">
                    {motivo.label}
                  </span>
                </label>
              );
            })}
          </div>

          {isOtro && (
            <textarea
              value={otherNote}
              onChange={(e) => setOtherNote(e.target.value)}
              placeholder="Cuéntanos brevemente el motivo..."
              rows={3}
              className="textarea textarea-bordered w-full rounded-xl text-sm"
            />
          )}
        </div>

        {/* Botón fijo abajo */}
        <div className="p-4 border-t border-base-200 shrink-0">
          <button
            type="button"
            onClick={handleConfirm}
            disabled={!canConfirm || submitting}
            className={`btn w-full rounded-xl font-bold shadow-md transition-colors ${
              canConfirm
                ? "btn-neutral text-white"
                : "bg-base-300 text-base-content/40 cursor-not-allowed border-none hover:bg-base-300"
            }`}
          >
            {submitting ? (
              <span className="loading loading-spinner" />
            ) : (
              "Cancelar reserva"
            )}
          </button>
        </div>
      </div>
    </div>,
    document.body,
  );
}
