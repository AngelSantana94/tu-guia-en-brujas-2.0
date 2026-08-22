import React, { useState, useEffect, useCallback } from "react";
import { supabase } from "../lib/supabaseClient";

export default function EditarPerfil() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");

  // Cargar los datos del usuario logeado desde Supabase Auth
  const loadUser = useCallback(async () => {
    setLoading(true);
    setError(null);

    const {
      data: { user: authUser },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !authUser) {
      setError("No se pudo cargar tu perfil. Inicia sesión de nuevo.");
      setUser(null);
    } else {
      setUser(authUser);
      setFullName(
        authUser.user_metadata?.full_name || authUser.user_metadata?.name || "",
      );
      setEmail(authUser.email || "");
      setPhone(authUser.user_metadata?.phone || "");
    }

    setLoading(false);
  }, []);

  useEffect(() => {
    loadUser();
  }, [loadUser]);

  // Guardar cambios en Supabase Auth
  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    setSuccess(null);

    try {
      // 1. Nombre y teléfono -> metadatos del usuario
      const { error: metaError } = await supabase.auth.updateUser({
        data: {
          full_name: fullName,
          phone: phone,
        },
      });
      if (metaError) throw metaError;

      // 2. Email -> solo si realmente cambió (dispara confirmación por correo)
      if (email && email !== user?.email) {
        const { error: emailError } = await supabase.auth.updateUser({ email });
        if (emailError) throw emailError;
        setSuccess(
          "Datos guardados. Revisa tu correo para confirmar el cambio de email.",
        );
      } else {
        setSuccess("Perfil actualizado correctamente.");
      }

      await loadUser();
    } catch (err) {
      console.error("Error al actualizar el perfil:", err);
      setError(
        err.message || "No se pudo actualizar el perfil. Inténtalo de nuevo.",
      );
    } finally {
      setSaving(false);
    }
  };

  // 1. Cargando
  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <span className="loading loading-spinner loading-lg text-primary"></span>
      </div>
    );
  }

  // 2. Sin sesión
  if (!user) {
    return (
      <div className="alert alert-error text-sm rounded-2xl max-w-2xl shadow-sm">
        <span>{error || "Debes iniciar sesión para editar tu perfil."}</span>
      </div>
    );
  }

  // 3. Formulario
  return (
    <div className="w-full max-w-lg">
      <h2 className="text-2xl font-bold mb-1">Editar perfil</h2>
      <p className="text-sm text-base-content/70 mb-6">
        Actualiza tus datos de contacto.
      </p>

      {error && (
        <div className="alert alert-error text-xs mb-4 p-3 rounded-lg">
          <span>{error}</span>
        </div>
      )}
      {success && (
        <div className="alert alert-success text-xs mb-4 p-3 rounded-lg">
          <span>{success}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="label">
            <span className="label-text font-medium">Nombre completo</span>
          </label>
          <input
            type="text"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            placeholder="Tu nombre"
            className="input input-bordered w-full rounded-xl focus:outline-none focus:border-primary"
          />
        </div>

        <div>
          <label className="label">
            <span className="label-text font-medium">Email</span>
          </label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="tu@email.com"
            required
            className="input input-bordered w-full rounded-xl focus:outline-none focus:border-primary"
          />
          <p className="text-xs text-base-content/50 mt-1">
            Si cambias el email, te pediremos confirmarlo desde tu correo.
          </p>
        </div>

        <div>
          <label className="label">
            <span className="label-text font-medium">Teléfono</span>
          </label>
          <input
            type="tel"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="+32 400 00 00 00"
            className="input input-bordered w-full rounded-xl focus:outline-none focus:border-primary"
          />
        </div>

        <button
          type="submit"
          disabled={saving}
          className="btn bg-[#8a3cb8] hover:bg-[#7832a0] border-none text-white w-full rounded-xl"
        >
          {saving ? (
            <span className="loading loading-spinner"></span>
          ) : (
            "Guardar cambios"
          )}
        </button>
      </form>
    </div>
  );
}
