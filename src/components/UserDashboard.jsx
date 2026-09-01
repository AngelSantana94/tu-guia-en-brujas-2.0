import React, { useState, useEffect } from "react";
import BookingCard from "./BookingCard";
import { supabase } from "../lib/supabaseClient";

export default function UserDashboard() {
  const [reservas, setReservas] = useState([]);
  const [reviewedTourIds, setReviewedTourIds] = useState(new Set());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function fetchReservas() {
      try {
        setLoading(true);
        setError(null);

        // 1. Obtener usuario autenticado
        const {
          data: { user },
          error: authError,
        } = await supabase.auth.getUser();

        if (authError || !user) {
          setError("Debes iniciar sesión para consultar tus reservas.");
          return;
        }

        // 2. Consulta a la BD
        const { data, error: dbError } = await supabase
          .from("bookings")
          .select(
            `
    id,
    tour_id,
    schedule_id,
    status,
    booking_date,
    booking_time,
    num_adults,
    num_minors,
    email,
    customer_name,
    phone,
    tours (
      id,
      name,
      slug,
      meeting_point,
      duration_minutes,
      image_url
    )
  `,
          )
          .eq("email", user.email)
          .order("booking_date", { ascending: false });

        if (dbError) throw dbError;

        setReservas(data || []);

        // 3. Traer qué tours ya valoró este usuario (reviews se relaciona
        //    por user_id + tour_id, no tiene booking_id)
        const { data: reviewsData, error: reviewsError } = await supabase
          .from("reviews")
          .select("tour_id")
          .eq("user_id", user.id);

        if (reviewsError) {
          console.error("Error al obtener reviews:", reviewsError);
        } else {
          setReviewedTourIds(
            new Set((reviewsData || []).map((r) => r.tour_id)),
          );
        }
      } catch (err) {
        console.error("Error al obtener reservas:", err);
        setError("No se pudieron cargar tus reservas. Inténtalo de nuevo.");
      } finally {
        setLoading(false);
      }
    }

    fetchReservas();
  }, []);

  // Handlers para las tarjetas
  const handleModify = (updatedBooking) => {
    setReservas((prev) =>
      prev.map((item) =>
        item.id === updatedBooking.id ? { ...item, ...updatedBooking } : item,
      ),
    );
  };

  const handleCancel = (updatedBooking) => {
    setReservas((prev) =>
      prev.map((item) =>
        item.id === updatedBooking.id ? { ...item, ...updatedBooking } : item,
      ),
    );
  };

  const handleReview = (tourId) => {
    setReviewedTourIds((prev) => new Set(prev).add(tourId));
  };

  // 1. Cargando
  if (loading) {
    return (
      <div className="flex flex-col justify-center items-center py-16 gap-3">
        <span className="loading loading-spinner loading-lg text-[#8a3cb8]"></span>
        <p className="text-sm text-base-content/60 font-medium">
          Cargando tus reservas...
        </p>
      </div>
    );
  }

  // 2. Error o Sin Sesión
  if (error) {
    return (
      <div className="alert alert-error text-sm rounded-2xl max-w-2xl mx-auto my-4 shadow-sm">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="stroke-current shrink-0 h-6 w-6"
          fill="none"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
        <span>{error}</span>
      </div>
    );
  }

  // 3. Estado Vacío (Sin reservas encontradas)
  if (!reservas || reservas.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center text-center p-8 bg-base-100 border border-base-200 rounded-2xl shadow-sm my-4 max-w-2xl mx-auto">
        <div className="w-16 h-16 bg-base-200 text-base-content/60 rounded-full flex items-center justify-center mb-4">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-8 w-8"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 002-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
            />
          </svg>
        </div>

        <h3 className="text-xl font-bold text-base-content mb-2">
          Aún no has hecho ninguna reserva con nosotros
        </h3>

        <p className="text-gray-500 text-sm max-w-md mb-6">
          Explora nuestros tours guiados por Brujas y descubre la ciudad con los
          mejores guías locales.
        </p>

        <a
          href="/"
          className="btn btn-primary bg-[#8a3cb8] text-white! font-medium px-6 rounded-xl"
        >
          Explorar tours
        </a>
      </div>
    );
  }

  // 4. Renderizado del listado
  return (
    <div className="w-full flex flex-col gap-5 py-4">
      {reservas.map((booking) => (
        <BookingCard
          key={booking.id}
          booking={booking}
          onModify={handleModify}
          onCancel={handleCancel}
          onReview={handleReview}
          reviewedTourIds={reviewedTourIds}
        />
      ))}
    </div>
  );
}
