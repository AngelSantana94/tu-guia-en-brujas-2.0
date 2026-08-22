import React, { useState, useEffect } from "react";
import { supabase } from "../lib/supabaseClient";

const MESES = [
  "Enero",
  "Febrero",
  "Marzo",
  "Abril",
  "Mayo",
  "Junio",
  "Julio",
  "Agosto",
  "Septiembre",
  "Octubre",
  "Noviembre",
  "Diciembre",
];

function getInitials(name) {
  if (!name) return "?";
  const parts = name.trim().split(/\s+/);
  const first = parts[0]?.[0] || "";
  const second = parts[1]?.[0] || "";
  return (first + second).toUpperCase();
}

// Paleta de colores para el avatar cuando no hay foto. El color se elige
// de forma determinista a partir del nombre/id, así que el mismo usuario
// siempre sale con el mismo color (no cambia en cada render/recarga).
const AVATAR_COLORS = [
  "bg-rose-500",
  "bg-orange-500",
  "bg-amber-500",
  "bg-emerald-500",
  "bg-teal-500",
  "bg-cyan-500",
  "bg-blue-500",
  "bg-indigo-500",
  "bg-violet-500",
  "bg-fuchsia-500",
  "bg-pink-500",
];

function getAvatarColor(seed) {
  if (!seed) return AVATAR_COLORS[0];
  let hash = 0;
  for (let i = 0; i < seed.length; i++) {
    hash = seed.charCodeAt(i) + ((hash << 5) - hash);
  }
  const index = Math.abs(hash) % AVATAR_COLORS.length;
  return AVATAR_COLORS[index];
}

function StarRow({ rating }) {
  return (
    <div className="flex items-center gap-0.5 shrink-0">
      {[1, 2, 3, 4, 5].map((star) => (
        <svg
          key={star}
          className={`w-4 h-4 ${
            star <= rating
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
      ))}
    </div>
  );
}

export default function MyReviews() {
  const [reviews, setReviews] = useState([]);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function fetchReviews() {
      try {
        setLoading(true);
        setError(null);

        const {
          data: { user: authUser },
          error: authError,
        } = await supabase.auth.getUser();

        if (authError || !authUser) {
          setError("Debes iniciar sesión para ver tus opiniones.");
          return;
        }
        setUser(authUser);

        const { data, error: dbError } = await supabase
          .from("reviews")
          .select(
            `
            id,
            rating,
            comment,
            created_at,
            is_approved,
            tour_id,
            tours (
              id,
              name,
              image_url
            )
          `,
          )
          .eq("user_id", authUser.id)
          .order("created_at", { ascending: false });

        if (dbError) throw dbError;

        setReviews(data || []);
      } catch (err) {
        console.error("Error al obtener opiniones:", err);
        setError("No se pudieron cargar tus opiniones. Inténtalo de nuevo.");
      } finally {
        setLoading(false);
      }
    }

    fetchReviews();
  }, []);

  const displayName =
    user?.user_metadata?.full_name ||
    user?.user_metadata?.name ||
    user?.email?.split("@")[0] ||
    "Tú";
  const avatarUrl = user?.user_metadata?.avatar_url || null;

  // 1. Cargando
  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <span className="loading loading-spinner loading-lg text-primary"></span>
      </div>
    );
  }

  // 2. Error / sin sesión
  if (error) {
    return (
      <div className="alert alert-error text-sm rounded-2xl max-w-2xl shadow-sm">
        <span>{error}</span>
      </div>
    );
  }

  // 3. Sin opiniones
  if (reviews.length === 0) {
    return (
      <p className="text-base-content/70">
        Aún no has dejado ninguna opinión sobre tus tours realizados.
      </p>
    );
  }

  // 4. Listado
  return (
    <div className="w-full flex flex-col gap-4">
      {reviews.map((review) => {
        const date = new Date(review.created_at);
        const mesAno = `${MESES[date.getMonth()]} ${date.getFullYear()}`;
        const tourName = review.tours?.name || "Tour";

        return (
          <div
            key={review.id}
            className="border border-base-200 rounded-2xl p-5 bg-base-100 shadow-xs hover:shadow-md transition-all"
          >
            {/* Fila 1: avatar + nombre a la izquierda, estrellas a la derecha */}
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-3 min-w-0">
                {avatarUrl ? (
                  <img
                    src={avatarUrl}
                    alt={displayName}
                    className="w-11 h-11 rounded-full object-cover shrink-0"
                  />
                ) : (
                  <div
                    className={`w-11 h-11 rounded-full text-white flex items-center justify-center font-bold text-sm shrink-0 ${getAvatarColor(
                      user?.id || displayName,
                    )}`}
                  >
                    {getInitials(displayName)}
                  </div>
                )}
                <span className="font-semibold text-base-content truncate">
                  {displayName}
                </span>
              </div>

              <StarRow rating={review.rating} />
            </div>

            {/* Fila 2: estado */}
            <div className="mt-1.5 flex items-center gap-1.5">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-3.5 w-3.5 text-emerald-600 shrink-0"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth="2.5"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M5 13l4 4L19 7"
                />
              </svg>
              <span className="text-xs text-base-content/60">
                Reserva confirmada
              </span>
            </div>

            {/* Fila 3: tour + mes/año */}
            <div className="mt-3 flex items-center justify-between flex-wrap gap-1">
              <span className="font-bold text-base-content">{tourName}</span>
              <span className="text-xs text-base-content/50 font-medium">
                {mesAno}
              </span>
            </div>

            {/* Comentario */}
            <p className="mt-2 text-sm text-base-content/80 leading-relaxed">
              {review.comment}
            </p>
          </div>
        );
      })}
    </div>
  );
}
