import { useState, useEffect } from "react";
import logoTuguiaenbrujas from "../assets/logo-header-01.png";

export default function CityStep({
  onNext,
  onSkip,
  onBack,
  submitting,
  error,
}) {
  const [city, setCity] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const [loadingSuggestions, setLoadingSuggestions] = useState(false);

  useEffect(() => {
    if (city.trim().length < 3) {
      setSuggestions([]);
      return;
    }

    const delayDebounce = setTimeout(async () => {
      setLoadingSuggestions(true);
      try {
        const res = await fetch(
          `https://photon.komoot.io/api/?q=${encodeURIComponent(city)}&limit=15`,
        );

        if (!res.ok) throw new Error("Error en el servidor de mapas");

        const data = await res.json();
        if (!data || !data.features) {
          setSuggestions([]);
          return;
        }

        const allowedPlaces = [
          "city",
          "town",
          "village",
          "municipality",
          "administrative",
        ];

        const cleanSuggestions = data.features
          .filter((f) => {
            const prop = f.properties;
            return (
              prop &&
              (allowedPlaces.includes(prop.osm_value) ||
                prop.type === "locality")
            );
          })
          .map((f) => {
            const name = f.properties.name;
            const country = f.properties.country || "";
            // Recomponemos el formato completo exigido: "Ciudad, País"
            return {
              id: f.properties.osm_id + Math.random(),
              fullName: country ? `${name}, ${country}` : name,
            };
          });

        // Eliminamos duplicados basados en el texto completo ("Brugge, Bélgica")
        const seen = new Set();
        const unique = cleanSuggestions.filter((item) => {
          const duplicate = seen.has(item.fullName.toLowerCase());
          seen.add(item.fullName.toLowerCase());
          return !duplicate;
        });

        setSuggestions(unique.slice(0, 5));
      } catch (err) {
        console.error("Error buscando ciudades:", err);
        setSuggestions([]);
      } finally {
        setLoadingSuggestions(false);
      }
    }, 400);

    return () => clearTimeout(delayDebounce);
  }, [city]);

  const handleSelectCity = (selected) => {
    setCity(selected.fullName); // Rellena el input con el texto completo
    setSuggestions([]);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!city.trim()) return;
    onNext(city.trim());
  };

  return (
    <div
      className="fixed inset-0 z-[10000] bg-base-100 flex flex-col w-full h-full overflow-y-auto"
      data-theme="light"
    >
      {error && (
        <p className="text-sm text-error bg-error/10 p-3 rounded-xl">{error}</p>
      )}

      {/* HEADER DEL WIDGET */}
      <div className="flex items-center justify-between px-5 py-4   bg-base-100 shrink-0">
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
      <div className="flex-1 w-full max-w-md mx-auto px-6 py-4 flex flex-col shadow-[0_25px_60px_-15px_rgba(168,85,247,0.3)]">
        <img
          src={logoTuguiaenbrujas}
          alt="Turixe"
          className="h-30 object-contain z-[10000]"
        />

        {/* Textos alineados e idénticos a tu diseño original */}
        <div className="space-y-2">
          <h2 className="text-2xl font-bold text-base-content">
            ¿En qué ciudad vives?
          </h2>
          <p className="text-sm text-base-content/60 leading-relaxed">
            Ayúdanos a personalizar tu experiencia indicándonos en qué ciudad
            vives. Puedes omitir este paso si lo prefieres.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 relative">
          <div className="relative z-30">
            <input
              type="text"
              id="floating_city"
              autoComplete="off"
              disabled={submitting}
              className="block px-4 pb-2.5 pt-6 w-full text-base bg-base-100 rounded-2xl border-2 border-base-300 appearance-none focus:outline-none focus:ring-0 focus:border-neutral peer transition-colors text-base-content disabled:opacity-50 font-medium"
              placeholder=" "
              value={city}
              onChange={(e) => setCity(e.target.value)}
            />
            <label
              htmlFor="floating_city"
              className="absolute text-sm text-base-content/50 duration-300 transform -translate-y-3 scale-75 top-4 z-10 origin-[0] bg-base-100 px-1 peer-focus:px-1 peer-focus:text-neutral peer-placeholder-shown:scale-100 peer-placeholder-shown:-translate-y-1/2 peer-placeholder-shown:top-1/2 peer-focus:top-4 peer-focus:scale-75 peer-focus:-translate-y-3 start-3 cursor-text font-medium"
            >
              Ciudad
            </label>

            {loadingSuggestions && (
              <span className="loading loading-spinner loading-xs absolute right-4 top-5 text-base-content/40"></span>
            )}

            {/* Lista limpia flotante: divide-y añade el borde inferior separador entre elementos */}
            {suggestions.length > 0 && (
              <ul className="absolute left-0 right-0 mt-2 bg-base-100 rounded-2xl shadow-xl z-50 max-h-60 overflow-y-auto p-0 m-0 list-none border border-base-200 divide-y divide-base-200">
                {suggestions.map((item) => (
                  <li key={item.id} className="p-0 m-0 list-none">
                    <button
                      type="button"
                      // border-0 y bg-transparent rompen por completo los recuadros grises/negros del navegador
                      className="w-full text-left px-5 py-3.5 bg-transparent hover:bg-base-200/60 text-sm font-semibold text-base-content transition-colors border-0 outline-none focus:outline-none block"
                      onClick={() => handleSelectCity(item)}
                    >
                      {item.fullName}
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>

          <div className="flex flex-col gap-3 pt-4 relative z-10">
            <button
              type="submit"
              disabled={submitting || !city.trim()}
              className="btn btn-neutral btn-lg w-full rounded-xl text-white font-medium shadow-md"
            >
              {submitting ? (
                <span className="loading loading-spinner loading-md"></span>
              ) : (
                "Continuar"
              )}
            </button>

            <button
              type="button"
              disabled={submitting}
              onClick={() => onSkip()}
              className="btn btn-ghost w-full text-base-content/60 hover:bg-base-200 rounded-xl font-medium"
            >
              Omitir este paso
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
