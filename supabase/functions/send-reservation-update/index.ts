import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { status: 200, headers: corsHeaders });
  }

  try {
    const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");
    const SUPABASE_URL = Deno.env.get("SUPABASE_URL");
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

    if (!RESEND_API_KEY) throw new Error("Falta RESEND_API_KEY en Secrets.");

    const supabaseAdmin = createClient(
      SUPABASE_URL || "",
      SUPABASE_SERVICE_ROLE_KEY || "",
    );

    const {
      record,
      action = "EDITED",
      guideEmail = "tuguiaenbrujas@gmail.com",
    } = await req.json();
    if (!record) throw new Error("No se recibieron datos de la reserva.");

    const isCancelled = action === "CANCELLED";
    const totalPersons =
      Number(record.num_adults || 0) + Number(record.num_minors || 0);
    const tourTitle = record.tour_name || "Tour por Brujas";

    // 1. Generar Magic Link para el cliente
    let clientMagicLink = "https://tuguiaenbrujas.com/mis-reservas";
    try {
      const { data: linkData } = await supabaseAdmin.auth.admin.generateLink({
        type: "magiclink",
        email: record.email,
        options: { redirectTo: "https://tuguiaenbrujas.com/mis-reservas" },
      });
      if (linkData?.properties?.action_link) {
        clientMagicLink = linkData.properties.action_link;
      }
    } catch (e) {
      console.warn("Aviso: No se pudo generar Magic Link cliente:", e);
    }

    // Configuración de textos y colores según el tipo de acción
    const statusTag = isCancelled ? "CANCELADA" : "ACTUALIZADA";
    const statusColor = isCancelled ? "#e53e3e" : "#8a3cb8";
    const clientSubject = isCancelled
      ? `Reserva Cancelada - ${tourTitle}`
      : `¡Reserva Modificada! - ${tourTitle}`;
    const guideSubject = `[${statusTag}] Reserva: ${record.customer_name} (${tourTitle})`;

    // 2. Plantilla HTML para el CLIENTE
    const clientHtml = `
      <!DOCTYPE html>
      <html lang="es">
      <body style="background-color: #f6f7f9; font-family: system-ui, -apple-system, sans-serif; margin: 0; padding: 40px 16px; color: #333333;">
        <div style="max-width: 600px; margin: 0 auto;">
          
          <!-- Header con Logo -->
          <div style="text-align: center; padding-bottom: 20px;">
            <img src="https://tuguiaenbrujas.com/tu-guia-en-brujas.png" alt="Tu Guía en Brujas" style="max-width: 70px; height: auto; display: block; margin: 0 auto 12px auto;" />
            <h1 style="color: #8a3cb8; margin: 0; font-size: 26px; font-weight: 800; letter-spacing: -0.5px;">TU GUÍA EN BRUJAS</h1>
          </div>

          <!-- Tarjeta Principal -->
          <div style="background-color: #ffffff; border-radius: 16px; padding: 28px 24px; box-shadow: 0 4px 12px rgba(0,0,0,0.03);">
            
            <!-- Encabezado de estado -->
            <div style="padding-bottom: 20px; border-bottom: 1px solid #edf2f7;">
              <span style="display: inline-block; background-color: ${isCancelled ? "#fff5f5" : "#fcf5ff"}; color: ${statusColor}; font-size: 12px; font-weight: 800; padding: 4px 12px; border-radius: 20px; text-transform: uppercase; margin-bottom: 10px;">
                Reserva ${statusTag}
              </span>
              <p style="font-size: 18px; margin: 0; color: #1a1a1a; font-weight: 600;">
                Hola ${record.customer_name}, ${
                  isCancelled
                    ? "confirmamos la cancelación de tu reserva."
                    : "los cambios en tu reserva se han guardado correctamente."
                }
              </p>
            </div>

            ${
              !isCancelled
                ? `
            <!-- Punto de Encuentro (Solo si no está cancelada) -->
            <div style="padding: 20px 0; border-bottom: 1px solid #edf2f7;">
              <h3 style="color: #8a3cb8; margin-top: 0; font-size: 18px;">Punto de encuentro</h3>
              <p style="font-size: 15px; margin: 8px 0;">
                <strong>Dirección:</strong> Markt 7, 8000 Brugge, Bélgica. 
                <a href="https://maps.google.com/?q=Markt+7+Brugge" target="_blank" style="color: #8a3cb8; font-weight: bold; text-decoration: underline;">Cómo llegar</a>
              </p>
              <p style="font-size: 15px; margin: 8px 0;">
                <strong>Cómo encontrar al guía:</strong> Tu guía te estará esperando frente al campanario (Belfort) con un <strong>PARAGUAS MORADO</strong>.
              </p>
              <p style="font-size: 14px; background-color: #fcf5ff; border-left: 4px solid #8a3cb8; padding: 12px; border-radius: 4px; color: #4a5568; margin-top: 12px;">
                <strong>Recomendamos llegar 10 minutos antes</strong> de la hora de inicio para realizar el check-in.
              </p>
            </div>
            `
                : `
            <p style="font-size: 15px; color: #4a5568; margin-top: 16px;">
              Lamentamos que no puedas acompañarnos en esta ocasión. Esperamos verte muy pronto por Brujas.
            </p>
            `
            }

            <!-- Detalles de la Reserva -->
            <div style="background-color: #f8fafc; padding: 20px; border-radius: 8px; border: 1px solid #e2e8f0; margin: 20px 0 24px 0;">
              <h3 style="color: #1a1a1a; margin-top: 0; font-size: 18px;">Resumen de la reserva</h3>
              <ul style="padding-left: 0; list-style: none; margin: 0; font-size: 15px;">
                <li style="margin-bottom: 8px;"><strong>Tour:</strong> ${tourTitle}</li>
                <li style="margin-bottom: 8px;"><strong>Fecha:</strong> ${record.booking_date}</li>
                <li style="margin-bottom: 8px;"><strong>Hora:</strong> ${record.booking_time?.slice(0, 5)}</li>
                <li style="margin-bottom: 8px;"><strong>Idioma:</strong> Español</li>
                <li style="margin-bottom: 8px;"><strong>Titular:</strong> ${record.customer_name}</li>
                <li style="margin-bottom: 8px;"><strong>Plazas:</strong> ${totalPersons} persona(s) (${record.num_adults || 0} adultos, ${record.num_minors || 0} niños)</li>
              </ul>
            </div>

            <!-- Botón de acceso -->
            <div style="text-align: center; margin-bottom: 20px;">
              <a href="${clientMagicLink}" 
                 style="background-color: #8a3cb8; color: #ffffff; padding: 14px 28px; font-weight: bold; border-radius: 8px; text-decoration: none; display: inline-block; font-size: 16px;">
                Ver mis reservas
              </a>
            </div>

          </div>

          <!-- Footer -->
          <div style="background-color: #8a3cb8; border-radius: 16px; margin-top: 24px; padding: 24px 20px; text-align: center; color: #ffffff;">
            <p style="margin: 0 0 8px 0; font-size: 15px; font-weight: 700;">Tu Guía en Brujas</p>
            <p style="margin: 0; font-size: 13px; opacity: 0.9; line-height: 1.4;">Explora ciudades con guías apasionados, rutas auténticas y experiencias inolvidables.</p>
            <div style="margin-top: 16px; border-top: 1px solid rgba(255,255,255,0.2); padding-top: 12px; font-size: 11px; opacity: 0.8;">
              © 2026 Tu Guía en Brujas. Todos los derechos reservados.
            </div>
          </div>

        </div>
      </body>
      </html>
    `;

    // 3. Plantilla HTML interna para el GUÍA / ADMINISTRACIÓN
    const guideHtml = `
      <!DOCTYPE html>
      <html lang="es">
      <body style="background-color: #f6f7f9; font-family: system-ui, -apple-system, sans-serif; margin: 0; padding: 20px; color: #333333;">
        <div style="max-width: 600px; margin: 0 auto; background: #ffffff; padding: 24px; border-radius: 12px; border-left: 6px solid ${statusColor};">
          <h2 style="color: ${statusColor}; margin-top: 0;">Aviso de Reserva ${statusTag}</h2>
          <p style="font-size: 15px; color: #4a5568;">
            Se ha registrado un cambio en la reserva de <strong>${record.customer_name}</strong>.
          </p>
          
          <div style="background-color: #f8fafc; padding: 16px; border-radius: 8px; margin: 16px 0;">
            <p style="margin: 6px 0;"><strong>Tour:</strong> ${tourTitle}</p>
            <p style="margin: 6px 0;"><strong>Cliente:</strong> ${record.customer_name} (${record.email})</p>
            <p style="margin: 6px 0;"><strong>Teléfono:</strong> ${record.phone || "No facilitado"}</p>
            <p style="margin: 6px 0;"><strong>Fecha y Hora:</strong> ${record.booking_date} a las ${record.booking_time?.slice(0, 5)}</p>
            <p style="margin: 6px 0;"><strong>Plazas:</strong> ${totalPersons} persona(s) (${record.num_adults || 0} adultos, ${record.num_minors || 0} niños)</p>
          </div>

          <p style="font-size: 12px; color: #a0aec0; margin-bottom: 0;">
            Mensaje generado automáticamente por el Panel de Gestión de Tu Guía en Brujas.
          </p>
        </div>
      </body>
      </html>
    `;

    // 4. Enviar email al CLIENTE
    const sendToClient = fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${RESEND_API_KEY}`,
      },
      body: JSON.stringify({
        from: "Tu Guía en Brujas <info@tuguiaenbrujas.com>",
        reply_to: "tuguiaenbrujas@gmail.com",
        to: [record.email],
        subject: clientSubject,
        html: clientHtml,
      }),
    });

    // 5. Enviar email al GUÍA / ADMIN
    const sendToGuide = fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${RESEND_API_KEY}`,
      },
      body: JSON.stringify({
        from: "Sistema de Reservas <info@tuguiaenbrujas.com>",
        to: [guideEmail],
        subject: guideSubject,
        html: guideHtml,
      }),
    });

    await Promise.all([sendToClient, sendToGuide]);

    return new Response(JSON.stringify({ success: true }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  }
});
