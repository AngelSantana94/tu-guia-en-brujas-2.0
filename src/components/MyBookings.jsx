import React, { useEffect, useState } from "react";
import BookingCard from "./BookingCard";
import { supabase } from "../lib/supabaseClient";

export default function MyBookings() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function fetchUserBookings() {
      setLoading(true);
      setError(null);

      // 1. Obtener sesión/usuario actual de forma segura desde el cliente de Supabase
      const {
        data: { user },
        error: authError,
      } = await supabase.auth.getUser();

      if (authError || !user) {
        setError("Debes iniciar sesión para ver tus reservas.");
        setLoading(false);
        return;
      }

      // 2. Hacer el fetch filtrando por el email del usuario autenticado
      const { data, error: dbError } = await supabase
        .from("bookings")
        .select(
          `
              id,
              tour_id,
              schedule_id,
              status,
              attended,
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
                image_url
              )
            `,
        )
        .eq("email", user.email)
        .order("booking_date", { ascending: false });

      if (dbError) {
        console.error("Error al obtener reservas:", dbError);
        setError("No se pudieron cargar tus reservas.");
      } else {
        setBookings(data || []);
      }
      setLoading(false);
    }

    fetchUserBookings();
  }, []);

  const handleModify = (booking) => {
    console.log("Modificar reserva:", booking.id);
  };

  const handleCancel = async (booking) => {
    const confirmCancel = window.confirm(
      "¿Estás seguro de que deseas cancelar esta reserva?",
    );

    if (!confirmCancel) return;

    const { error } = await supabase
      .from("bookings")
      .update({ status: "cancelled" })
      .eq("id", booking.id);

    if (error) {
      alert("Hubo un problema al cancelar la reserva.");
    } else {
      setBookings((prev) =>
        prev.map((item) =>
          item.id === booking.id ? { ...item, status: "cancelled" } : item,
        ),
      );
    }
  };

  const handleReview = (booking) => {
    console.log("Valorar reserva:", booking.id);
  };

  return (
    <div className="w-full space-y-4">
      {/* Carga */}
      {loading && (
        <div className="flex flex-col items-center justify-center py-12 gap-3">
          <span className="loading loading-spinner loading-lg text-neutral"></span>
          <p className="text-sm text-base-content/60 font-medium">
            Cargando tus reservas...
          </p>
        </div>
      )}

      {/* Error */}
      {!loading && error && (
        <div className="alert alert-error text-sm rounded-xl">
          <span>{error}</span>
        </div>
      )}

      {/* Sin Reservas */}
      {!loading && !error && bookings.length === 0 && (
        <div className="text-center py-12 bg-base-100 border border-base-200 rounded-2xl p-8 space-y-3">
          <h3 className="text-lg font-bold text-base-content">
            No tienes reservas activas
          </h3>
          <p className="text-sm text-base-content/60 max-w-sm mx-auto">
            Aún no has reservado ninguna experiencia. Explora nuestros tours y
            asegura tu plaza.
          </p>
        </div>
      )}

      {/* Lista de Cards */}
      {!loading && !error && bookings.length > 0 && (
        <div className="flex flex-col gap-4">
          {bookings.map((booking) => (
            <BookingCard
              key={booking.id}
              booking={booking}
              onModify={handleModify}
              onCancel={handleCancel}
              onReview={handleReview}
            />
          ))}
        </div>
      )}
    </div>
  );
}
