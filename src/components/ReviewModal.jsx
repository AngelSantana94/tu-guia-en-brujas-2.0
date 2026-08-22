import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { supabase } from "../lib/supabaseClient";

const STAR_LABELS = ["Muy malo", "Malo", "Normal", "Bueno", "Excelente"];

export default function ReviewModal({ booking, isOpen, onClose, onReviewed }) {
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [comment, setComment] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  // Reiniciar el formulario cada vez que se abre el modal
  useEffect(() => {
    if (!isOpen) return;
    setRating(0);
    setHoverRating(0);
    setComment("");
    setError(null);
  }, [isOpen, booking?.id]);

  if (!isOpen || !booking) return null;

  const tourName = booking.tours?.name || "este tour";
  const canSubmit = rating > 0 && comment.trim().length > 0;

  const handleSubmit = async () => {
    if (!canSubmit) return;

    setSubmitting(true);
    setError(null);

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      setError("Debes iniciar sesión para valorar.");
      setSubmitting(false);
      return;
    }

    // Extraemos el nombre completo del usuario, o su email/nombre por defecto
    const userName =
      user.user_metadata?.full_name ||
      user.user_metadata?.name ||
      user.email?.split("@")[0] ||
      "Viajero";

    const { error: insertError } = await supabase.from("reviews").insert({
      user_id: user.id,
      tour_id: booking.tour_id,
      rating,
      comment: comment.trim(),
      is_approved: true,
      user_name: userName, // <-- Guardamos el nombre directamente
    });

    setSubmitting(false);

    if (insertError) {
      if (insertError.code === "23505") {
        setError("Ya has valorado este tour anteriormente.");
      } else {
        console.error("[ReviewModal] error insertando review:", insertError);
        setError("No se pudo guardar tu valoración. Inténtalo de nuevo.");
      }
      return;
    }

    if (onReviewed) onReviewed(booking.tour_id);
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
          <span className="font-bold text-lg">Valorar</span>
          <div className="w-8" />
        </div>

        {/* Cuerpo */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {error && (
            <div className="p-3 bg-error/10 border border-error/30 rounded-xl text-error text-sm font-medium text-center">
              {error}
            </div>
          )}

          <div className="text-center space-y-1">
            <h3 className="text-xl font-extrabold text-base-content">
              ¿Qué tal estuvo {tourName}?
            </h3>
            <p className="text-sm text-base-content/60">
              Tu opinión ayuda a otros viajeros
            </p>
          </div>

          {/* Estrellas */}
          <div className="flex justify-center gap-2">
            {[1, 2, 3, 4, 5].map((star) => {
              const filled = star <= (hoverRating || rating);
              return (
                <button
                  key={star}
                  type="button"
                  onClick={() => setRating(star)}
                  onMouseEnter={() => setHoverRating(star)}
                  onMouseLeave={() => setHoverRating(0)}
                  className="p-1"
                  aria-label={`${star} estrellas`}
                >
                  <svg
                    className={`w-9 h-9 transition-colors ${
                      filled
                        ? "fill-amber-400 stroke-amber-400"
                        : "fill-none stroke-base-300"
                    }`}
                    viewBox="0 0 24 24"
                    strokeWidth="1.5"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M11.48 3.499a.562.562 0 011.04 0l2.125 5.111a.563.563 0 00.475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 00-.182.557l1.285 5.385a.562.562 0 01-.84.61l-4.725-2.885a.562.562 0 00-.586 0L6.982 21.539a.562.562 0 01-.84-.61l1.285-5.386a.562.562 0 00-.182-.557l-4.204-3.602a.562.562 0 01.321-.988l5.518-.442a.563.563 0 00.475-.345L11.48 3.5z"
                    />
                  </svg>
                </button>
              );
            })}
          </div>

          {rating > 0 && (
            <p className="text-center text-sm font-semibold text-neutral">
              {STAR_LABELS[rating - 1]}
            </p>
          )}

          <textarea
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder="Cuéntanos tu experiencia..."
            rows={5}
            className="textarea textarea-bordered w-full rounded-xl text-sm"
          />
        </div>

        {/* Botón fijo abajo */}
        <div className="p-4 border-t border-base-200 shrink-0">
          <button
            type="button"
            onClick={handleSubmit}
            disabled={!canSubmit || submitting}
            className={`btn w-full rounded-xl font-bold shadow-md transition-colors ${
              canSubmit
                ? "btn-neutral text-white"
                : "bg-base-300 text-base-content/40 cursor-not-allowed border-none hover:bg-base-300"
            }`}
          >
            {submitting ? (
              <span className="loading loading-spinner" />
            ) : (
              "Enviar valoración"
            )}
          </button>
        </div>
      </div>
    </div>,
    document.body,
  );
}
