import { useState, useEffect, useMemo } from "react";
import { supabase } from "../lib/supabaseClient";
import banderaEspana from "../assets/espana.png";
import logoTuguiaenbrujas from "../assets/logo-header-01.png";
import PhoneStep from "./PhoneStep";
import CityStep from "./CityStep";
import SuccessStep from "./SuccessStep";
import { createPortal } from "react-dom";
import TermsStep from "./TermsStep";

const DIAS = ["lun", "mar", "mié", "jue", "vie", "sáb", "dom"];
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
const MESES_A_MOSTRAR = 6;

function toISODate(date) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

function buildMonthGrid(year, month) {
  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);
  const startOffset = (firstDay.getDay() + 6) % 7;

  const cells = [];
  for (let i = 0; i < startOffset; i++) cells.push(null);
  for (let day = 1; day <= lastDay.getDate(); day++) {
    cells.push(new Date(year, month, day));
  }
  return cells;
}

export default function BookingFlow({ tour, onBooked, size = "sm" }) {
  const btnSize = size === "lg" ? "btn-lg" : "btn-sm";

  const [today, setToday] = useState(null);
  const [availability, setAvailability] = useState([]);
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [sheetStep, setSheetStep] = useState(null);

  const [numAdults, setNumAdults] = useState(1);
  const [numMinors, setNumMinors] = useState(0);
  const [customerName, setCustomerName] = useState("");
  const [email, setEmail] = useState("");

  const [phone, setPhone] = useState("");
  const [selectedCity, setSelectedCity] = useState(null);

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  useEffect(() => {
    supabase.rpc("get_server_today").then(({ data, error }) => {
      if (error) {
        setError("No se pudo obtener la fecha del servidor");
        setLoading(false);
        return;
      }
      setToday(new Date(`${data}T00:00:00`));
    });
  }, []);

  const monthsList = useMemo(() => {
    if (!today) return [];
    return Array.from({ length: MESES_A_MOSTRAR }, (_, i) => {
      const d = new Date(today.getFullYear(), today.getMonth() + i, 1);
      return { year: d.getFullYear(), month: d.getMonth() };
    });
  }, [today]);

  useEffect(() => {
    if (!today || !tour || monthsList.length === 0) return;
    setLoading(true);
    const last = monthsList[monthsList.length - 1];
    const end = new Date(last.year, last.month + 1, 0);

    supabase
      .rpc("get_availability", {
        p_tour_id: tour.id,
        p_start_date: toISODate(today),
        p_end_date: toISODate(end),
      })
      .then(({ data, error }) => {
        if (error) setError("No se pudo cargar la disponibilidad");
        else setAvailability(data || []);
        setLoading(false);
      });
  }, [today, tour, monthsList]);

  const slotsForSelectedDate = useMemo(() => {
    if (!selectedDate) return [];
    return availability.filter((a) => a.booking_date === selectedDate);
  }, [availability, selectedDate]);

  function handleSelectDate(date) {
    if (!date || date < today) return;
    setSelectedDate(toISODate(date));
    setSelectedSlot(null);
    setSheetStep("horarios");
  }

  function handleSelectSlot(slot) {
    setSelectedSlot(slot);
    setSheetStep("personas");
  }

  function handleContinueToDatos() {
    setSheetStep("datos");
  }

  function handleBack() {
    if (sheetStep === "datos") {
      setSheetStep("personas");
    } else if (sheetStep === "personas") {
      setSheetStep("horarios");
      setSelectedSlot(null);
    } else {
      closeSheet();
    }
  }

  function closeSheet() {
    setSheetStep(null);
    setSelectedSlot(null);
  }

  const formatSelectedDate = (dateStr) => {
    if (!dateStr) return "Fecha seleccionada";

    const parts = dateStr.split("-");
    if (parts.length !== 3) return "Fecha seleccionada";

    const [year, month, day] = parts;
    const monthIndex = parseInt(month, 10) - 1;
    const monthName = MESES[monthIndex] || "mes";

    return `${parseInt(day, 10)} de ${monthName} de ${year}`;
  };

  const handleNextToPhone = () => {
    if (
      !customerName.trim() ||
      !/^[a-zA-ZÀ-ÿ\s]{2,}$/.test(customerName.trim())
    ) {
      setError(
        "Introduce nombre y apellidos válidos, sin números ni caracteres especiales.",
      );
      return;
    }

    if (
      !email.trim() ||
      !/^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(email.trim())
    ) {
      setError(
        "Introduce un correo electrónico válido sin caracteres especiales.",
      );
      return;
    }

    setError(null);
    setSheetStep("phone");
  };

  async function handleConfirm(finalCityValue) {
    setSubmitting(true);
    setError(null);

    setSheetStep("procesando");

    const { data, error } = await supabase.rpc("create_booking", {
      p_tour_id: tour.id,
      p_schedule_id: selectedSlot.schedule_id,
      p_booking_date: selectedDate,
      p_booking_time: selectedSlot.booking_time,
      p_customer_name: customerName,
      p_email: email,
      p_phone: phone || null,
      p_num_adults: numAdults,
      p_num_minors: numMinors,
      p_notes: finalCityValue || null,
    });

    if (error) {
      console.error("Error al guardar la reserva:", error.message);
      // Aquí manejas el estado de error de tu interfaz si aplica
      return;
    }

    // 📩 Invocar la Edge Function para enviar los correos
    await supabase.functions.invoke("send-booking-email", {
      body: {
        record: {
          customer_name: customerName,
          email: email,
          phone: phone || null,
          notes: finalCityValue || null,
          booking_date: selectedDate,
          booking_time: selectedSlot.booking_time,
          num_adults: numAdults,
          num_minors: numMinors,
        },
      },
    });

    setSubmitting(false);

    if (error) {
      setError("Ha ocurrido un error, inténtalo de nuevo");
      setSheetStep("city");
      return;
    }

    if (!data.success) {
      setError(
        data.error === "sin_cupo"
          ? `Solo quedan ${data.remaining} plazas, por favor ajusta la cantidad.`
          : "No se pudo completar la reserva",
      );
      setSheetStep(data.error === "sin_cupo" ? "personas" : "city");
      return;
    }

    setSuccess(data);
    setSheetStep("exito");
  }

  if (loading && !today) {
    return (
      <p className="text-sm text-base-content/60 p-4">
        Cargando disponibilidad...
      </p>
    );
  }
  if (error && !today) {
    return <p className="text-sm text-error p-4">{error}</p>;
  }

  let sheetTitle = "";
  if (sheetStep === "horarios") {
    sheetTitle = `Horarios el ${selectedDate?.split("-").reverse().slice(0, 2).join("/")}`;
  } else if (sheetStep === "personas") {
    sheetTitle = "¿Cuántos sois?";
  } else if (sheetStep === "datos") {
    sheetTitle = "Tus datos";
  }

  return (
    <div className="relative flex flex-col w-full h-full bg-base-100">
      <div className="overflow-y-auto overscroll-contain flex-1 px-4 pb-24">
        <div className="sticky top-0 bg-base-100/95 backdrop-blur-sm grid grid-cols-7 text-center text-xs font-bold text-base-content/60 py-3 z-10 border-b border-base-200">
          {DIAS.map((d) => (
            <span key={d}>{d}</span>
          ))}
        </div>

        {monthsList.map(({ year, month }) => (
          <div key={`${year}-${month}`} className="mb-6">
            <p className="font-extrabold text-lg mt-6 mb-3 capitalize text-neutral">
              {MESES[month]}{" "}
              <span className="font-normal text-base-content/40">{year}</span>
            </p>
            <div className="grid grid-cols-7 gap-2">
              {buildMonthGrid(year, month).map((date, i) => {
                if (!date) return <span key={i} />;
                const iso = toISODate(date);
                const isPast = date < today;
                const isSelected = iso === selectedDate;

                return (
                  <button
                    type="button"
                    key={iso}
                    disabled={isPast}
                    onClick={() => handleSelectDate(date)}
                    className={`btn btn-circle w-full aspect-square text-sm ${
                      isSelected
                        ? "btn-neutral shadow-lg scale-105"
                        : "btn-ghost hover:bg-base-200"
                    } ${isPast ? "btn-disabled opacity-20" : ""}`}
                  >
                    {date.getDate()}
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {sheetStep && (
        <div
          className="absolute inset-0 bg-black/40 z-10 backdrop-blur-[2px]"
          onClick={closeSheet}
        />
      )}

      {sheetStep && (
        <div
          className={`absolute inset-x-0 bottom-0 z-20 w-full bg-base-100 rounded-t-3xl shadow-[0_-15px_40px_rgba(0,0,0,0.15)] flex flex-col transition-all duration-300 ${
            sheetStep === "horarios" ? "h-auto" : "h-auto max-h-[75vh]"
          }`}
        >
          <div className="flex items-center justify-between px-5 py-4 border-b border-base-200 shrink-0">
            <button
              type="button"
              onClick={handleBack}
              className="btn btn-ghost btn-circle btn-sm"
              aria-label="Atrás"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                className="w-5 h-5"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M15 19l-7-7 7-7"
                />
              </svg>
            </button>

            <span className="font-bold text-lg">{sheetTitle}</span>

            <button
              type="button"
              onClick={closeSheet}
              className="btn btn-ghost btn-circle btn-sm bg-base-200"
              aria-label="Cerrar"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                className="w-4 h-4"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>

          <div className="p-5 overflow-y-auto overscroll-contain flex-1 pb-safe">
            {/* --- PASO 1: HORARIOS --- */}
            {sheetStep === "horarios" && (
              <div className="grid grid-cols-3 gap-3">
                {slotsForSelectedDate.length === 0 && (
                  <p className="text-center text-base-content/50 py-10">
                    No hay horarios disponibles para este día.
                  </p>
                )}
                {slotsForSelectedDate.map((slot) => {
                  const sinCupo = slot.remaining <= 0;
                  const isSelected =
                    selectedSlot?.schedule_id === slot.schedule_id;
                  return (
                    <button
                      type="button"
                      key={slot.schedule_id}
                      disabled={sinCupo}
                      onClick={() => handleSelectSlot(slot)}
                      className={`btn ${btnSize} justify-between px-6 ${
                        isSelected
                          ? "btn-neutral shadow-md"
                          : "btn-outline border-base-300"
                      } ${sinCupo ? "btn-disabled opacity-40" : ""}`}
                    >
                      <span className="flex items-center gap-2 text-lg font-bold">
                        <img
                          src={banderaEspana}
                          alt="Español"
                          className="w-6 h-6 rounded-full object-cover shrink-0 border border-base-200"
                        />
                        {slot.booking_time.slice(0, 5)}
                      </span>

                      {sinCupo && (
                        <span className="text-xs uppercase tracking-wider text-error">
                          Agotado
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            )}

            {/* --- PASO 2: PERSONAS --- */}
            {sheetStep === "personas" &&
              (() => {
                const maxPlazas = Math.min(
                  20,
                  selectedSlot?.remaining ??
                    selectedSlot?.available_spots ??
                    20,
                );
                const totalPersonas = numAdults + numMinors;

                return (
                  <div className="space-y-5">
                    {error && (
                      <div className="p-3 bg-error/10 border border-error/30 rounded-xl text-error text-sm font-medium text-center">
                        {error}
                      </div>
                    )}

                    <div className="bg-base-200/50 p-4 rounded-2xl space-y-4">
                      {/* ADULTOS */}
                      <div className="flex items-center justify-between">
                        <span className="font-semibold">Adultos</span>
                        <div className="flex items-center gap-4">
                          <button
                            type="button"
                            className="btn btn-circle btn-sm bg-base-100 shadow-sm disabled:opacity-30"
                            onClick={() =>
                              setNumAdults((n) => Math.max(1, n - 1))
                            }
                            disabled={numAdults <= 1}
                          >
                            −
                          </button>
                          <span className="w-4 text-center font-bold text-lg">
                            {numAdults}
                          </span>
                          <button
                            type="button"
                            className="btn btn-circle btn-sm bg-base-100 shadow-sm disabled:opacity-30"
                            onClick={() => setNumAdults((n) => n + 1)}
                            disabled={totalPersonas >= maxPlazas}
                          >
                            +
                          </button>
                        </div>
                      </div>

                      {/* MENORES */}
                      <div className="flex items-center justify-between">
                        <span className="font-semibold">
                          Menores{" "}
                          <span className="text-xs font-normal opacity-60">
                            (hasta 15 años)
                          </span>
                        </span>
                        <div className="flex items-center gap-4">
                          <button
                            type="button"
                            className="btn btn-circle btn-sm bg-base-100 shadow-sm disabled:opacity-30"
                            onClick={() =>
                              setNumMinors((n) => Math.max(0, n - 1))
                            }
                            disabled={numMinors <= 0}
                          >
                            −
                          </button>
                          <span className="w-4 text-center font-bold text-lg">
                            {numMinors}
                          </span>
                          <button
                            type="button"
                            className="btn btn-circle btn-sm bg-base-100 shadow-sm disabled:opacity-30"
                            onClick={() => setNumMinors((n) => n + 1)}
                            disabled={totalPersonas >= maxPlazas}
                          >
                            +
                          </button>
                        </div>
                      </div>
                    </div>

                    <p className="text-xs text-base-content/60 text-center">
                      Quedan disponibles {maxPlazas} plazas. Total seleccionado:{" "}
                      <span className="font-bold">{totalPersonas}</span>
                    </p>

                    <button
                      type="button"
                      className="btn btn-neutral btn-lg w-full mt-4 shadow-lg"
                      onClick={handleContinueToDatos}
                    >
                      Continuar
                    </button>
                  </div>
                );
              })()}

            {/* PASO 3: DATOS VIA PORTAL */}
            {sheetStep === "datos" &&
              createPortal(
                <div className="fixed inset-0 z-[9999] bg-base-100 flex flex-col w-full h-full overflow-y-auto">
                  <div className="flex items-center justify-between p-4 shrink-0">
                    <button
                      type="button"
                      onClick={handleBack}
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
                      alt="Turixe"
                      className="h-24 object-contain mb-4"
                    />
                    <h2 className="text-2xl font-bold text-base-content mb-2">
                      Completa tu reserva
                    </h2>

                    <p className="text-sm text-base-content/60 mb-8 font-medium">
                      {formatSelectedDate(selectedDate)} ·{" "}
                      {selectedSlot?.booking_time?.slice(0, 5) ||
                        "Hora seleccionada"}{" "}
                      · {numAdults + numMinors} personas
                    </p>

                    <button
                      type="button"
                      className="btn btn-outline border-base-300 hover:bg-base-200 gap-3 w-full bg-white text-black font-medium mb-8 rounded-xl h-12"
                      onClick={() => console.log("Login con Google")}
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
                          d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                        />
                        <path
                          fill="#EA4335"
                          d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                        />
                      </svg>
                      Continuar con Google
                    </button>

                    <div className="flex items-center gap-4 mb-8">
                      <div className="h-[1px] flex-1 bg-base-200" />
                      <span className="text-xs text-base-content/40 font-medium">
                        o
                      </span>
                      <div className="h-[1px] flex-1 bg-base-200" />
                    </div>

                    <div className="flex flex-col gap-5">
                      <div className="relative">
                        <input
                          type="text"
                          id="floating_name"
                          className={`block px-4 pb-2.5 pt-6 w-full text-base bg-base-100 rounded-xl border-2 appearance-none focus:outline-none focus:ring-0 peer transition-colors ${
                            error
                              ? "border-error focus:border-error text-error"
                              : "border-base-200 focus:border-neutral text-base-content"
                          }`}
                          placeholder=" "
                          value={customerName}
                          onChange={(e) => setCustomerName(e.target.value)}
                        />
                        <label
                          htmlFor="floating_name"
                          className={`absolute text-base duration-300 transform -translate-y-3 scale-75 top-4 z-10 origin-[0] bg-base-100 px-1 peer-focus:px-1 peer-placeholder-shown:scale-100 peer-placeholder-shown:-translate-y-1/2 peer-placeholder-shown:top-1/2 peer-focus:top-4 peer-focus:scale-75 peer-focus:-translate-y-3 start-3 cursor-text ${
                            error
                              ? "text-error"
                              : "text-base-content/60 peer-focus:text-neutral"
                          }`}
                        >
                          Nombre y apellidos
                        </label>
                      </div>

                      {error && (
                        <p className="text-sm text-error mt-[-10px]">{error}</p>
                      )}

                      <div className="relative">
                        <input
                          type="email"
                          id="floating_email"
                          className="block px-4 pb-2.5 pt-6 w-full text-base bg-base-100 rounded-xl border-2 border-base-200 appearance-none focus:outline-none focus:ring-0 focus:border-neutral peer transition-colors text-base-content"
                          placeholder=" "
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                        />
                        <label
                          htmlFor="floating_email"
                          className="absolute text-base text-base-content/60 duration-300 transform -translate-y-3 scale-75 top-4 z-10 origin-[0] bg-base-100 px-1 peer-focus:px-1 peer-focus:text-neutral peer-placeholder-shown:scale-100 peer-placeholder-shown:-translate-y-1/2 peer-placeholder-shown:top-1/2 peer-focus:top-4 peer-focus:scale-75 peer-focus:-translate-y-3 start-3 cursor-text"
                        >
                          Correo electrónico
                        </label>
                      </div>

                      <button
                        type="button"
                        className="btn btn-neutral btn-lg w-full mt-2 rounded-xl text-white font-medium"
                        disabled={submitting || !customerName || !email}
                        onClick={handleNextToPhone}
                      >
                        {submitting ? (
                          <span className="loading loading-spinner" />
                        ) : (
                          "Reservar con email"
                        )}
                      </button>

                      <p className="text-sm text-base-content/60 text-center mt-2">
                        Puedes cancelar cuando quieras
                      </p>
                    </div>
                  </div>
                </div>,
                document.body,
              )}

            {/* --- PASO 4: TELÉFONO (vía Portal) --- */}
            {sheetStep === "phone" &&
              createPortal(
                <PhoneStep
                  onNext={(phoneNumber) => {
                    setPhone(phoneNumber);
                    setSheetStep("city");
                  }}
                  onBack={() => setSheetStep("datos")}
                />,
                document.body,
              )}

            {/* --- PASO 5: CIUDAD (vía Portal) --- */}
            {sheetStep === "city" &&
              createPortal(
                <CityStep
                  submitting={submitting}
                  error={error}
                  onNext={(cityVal) => {
                    setSelectedCity(cityVal);
                    setSheetStep("normas");
                  }}
                  onSkip={() => {
                    setSelectedCity(null);
                    setSheetStep("normas");
                  }}
                  onBack={() => setSheetStep("phone")}
                />,
                document.body,
              )}

            {/* --- PASO 5.5: RESUMEN INTERMEDIO (vía Portal) --- */}
            {sheetStep === "resumen" &&
              createPortal(
                <SuccessStep
                  email={email}
                  onClose={() => {
                    handleConfirm(selectedCity);
                  }}
                />,
                document.body,
              )}

            {/* --- PASO 6: NORMAS DEL TOUR (vía Portal) --- */}
            {sheetStep === "normas" &&
              createPortal(
                <TermsStep
                  onAccept={() => handleConfirm(selectedCity)}
                  onBack={() => setSheetStep("city")}
                  submitting={submitting}
                />,
                document.body,
              )}

            {/* --- PASO 7: ÉXITO TOTAL (vía Portal) --- */}
            {sheetStep === "exito" &&
              createPortal(
                <SuccessStep
                  email={email}
                  onClose={() => {
                    onBooked?.(success);
                    setSheetStep(null);
                  }}
                />,
                document.body,
              )}
          </div>
        </div>
      )}
    </div>
  );
}
