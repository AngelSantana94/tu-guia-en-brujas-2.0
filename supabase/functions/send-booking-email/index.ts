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

    const { record } = await req.json();
    if (!record) throw new Error("No se recibieron datos de la reserva.");

    // 1. Generar Magic Link para que el cliente acceda a sus reservas
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

    const totalPersons =
      Number(record.num_adults || 0) + Number(record.num_minors || 0);
    const tourTitle = record.tour_name || "Tour por Brujas";

    // 2. Email al CLIENTE (Con diseño corporativo morado, logo y Magic Link)
    await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${RESEND_API_KEY}`,
      },
      body: JSON.stringify({
        from: "Tu Guía en Brujas <info@tuguiaenbrujas.com>",
        reply_to: "tuguiaenbrujas@gmail.com",
        to: [record.email],
        subject: `¡Reserva confirmada! - ${tourTitle}`,
        html: `
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
                
                <!-- Saludo -->
                <div style="padding-bottom: 20px; border-bottom: 1px solid #edf2f7;">
                  <p style="font-size: 18px; margin: 0; color: #1a1a1a; font-weight: 600;">
                    ¡Enhorabuena ${record.customer_name}! Tu reserva ha sido confirmada.
                  </p>
                  <p style="font-size: 15px; color: #4a5568; margin-top: 8px; margin-bottom: 0;">
                    Muestra este correo al guía cuando llegues al punto de encuentro.
                  </p>
                </div>

                <!-- Punto de Encuentro -->
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
                    <strong>Recomendamos llegar 10 minutos antes</strong> de la hora de inicio para realizar el check-in. El guía no responderá al teléfono durante el recorrido.
                  </p>
                </div>

                <!-- Detalles de la Reserva -->
                <div style="background-color: #f8fafc; padding: 20px; border-radius: 8px; border: 1px solid #e2e8f0; margin-bottom: 24px;">
                  <h3 style="color: #1a1a1a; margin-top: 0; font-size: 18px;">Detalles de tu reserva</h3>
                  <ul style="padding-left: 0; list-style: none; margin: 0; font-size: 15px;">
                    <li style="margin-bottom: 8px;"><strong>Tour:</strong> ${tourTitle}</li>
                    <li style="margin-bottom: 8px;"><strong>Fecha:</strong> ${record.booking_date}</li>
                    <li style="margin-bottom: 8px;"><strong>Hora:</strong> ${record.booking_time}</li>
                    <li style="margin-bottom: 8px;"><strong>Idioma:</strong> Español</li>
                    <li style="margin-bottom: 8px;"><strong>Titular:</strong> ${record.customer_name}</li>
                    <li style="margin-bottom: 8px;"><strong>Plazas:</strong> ${totalPersons} persona(s) (${record.num_adults || 0} adultos, ${record.num_minors || 0} niños)</li>
                  </ul>
                </div>

                <div style="text-align: center; margin-bottom: 30px;">
  <a href="${clientMagicLink}" 
     style="background-color: #8a3cb8; color: #ffffff; padding: 14px 28px; font-weight: bold; border-radius: 8px; text-decoration: none; display: inline-block; font-size: 16px;">
    Ver mis reservas
  </a>
</div>

                <!-- Gestión de Reserva con Magic Link -->
                <div style="padding-top: 20px;">
                  <h3 style="color: #1a1a1a; margin-top: 0; font-size: 16px;">¿Necesitas gestionar tu reserva?</h3>
                  <p style="font-size: 14px; color: #4a5568; margin-bottom: 16px;">
                    Si no vas a poder asistir, por favor cancela tu plaza para que otra persona pueda disfrutar del tour. Puedes acceder directamente haciendo clic abajo.
                  </p>
                  <div>
                    <a href="${clientMagicLink}" target="_blank" style="padding: 12px 20px; border-radius: 10px; text-decoration: none; font-weight: bold; display: inline-block; background-color: #8a3cb8; color: #ffffff; font-size: 14px;">
                      Gestionar o Cancelar Reserva
                    </a>
                  </div>
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
        `,
      }),
    });

    // 3. Email de Notificación Interna para Ti
    await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${RESEND_API_KEY}`,
      },
      body: JSON.stringify({
        from: "Sistema de Reservas <info@tuguiaenbrujas.com>",
        to: ["tuguiaenbrujas@gmail.com"],
        subject: `Nueva reserva: ${tourTitle} - ${record.customer_name}`,
        html: `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <h2>Nueva reserva recibida</h2>
        <p><strong>Tour:</strong> ${tourTitle}</p>
        <p><strong>Cliente:</strong> ${record.customer_name}</p>
        <p><strong>Email:</strong> ${record.email}</p>
        <p><strong>Teléfono:</strong> ${record.phone || "No facilitado"}</p>
        <p><strong>Fecha y Hora:</strong> ${record.booking_date} a las ${record.booking_time}</p>
        <p><strong>Plazas:</strong> ${record.num_adults} Adultos / ${record.num_minors} Niños</p>
      </div>
    `,
      }),
    });

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
