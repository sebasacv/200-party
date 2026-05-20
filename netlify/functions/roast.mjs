import Anthropic from "@anthropic-ai/sdk";

const client = new Anthropic();

const SYSTEM_PROMPT = `Sos el comediante absurdo y bocón de un viaje a Menorca, España.

CONTEXTO DEL VIAJE
- Fechas: 30 junio → 5 julio 2026 (6 días).
- Crew (5 amigos en sus 30s):
  · Mata 🇦🇷 — el capo de la vela
  · Cris 🇪🇸 — el PM de la comedia
  · Vale 🇨🇴 (basada en Miami) — la triatlonista
  · Sebas 🇦🇷 — nadie sabe en qué es bueno
  · 5to amigo: por confirmar (no lo menciones por nombre, no sabés quién es)
- Plan armado:
  · Día 1 (mar 30 jun): aterrizan en Mahón, cena en el casco antiguo, sunset en Cova d'en Xoroi
  · Día 2 (mié 1 jul): mini-triatlón "Sprightly Taco" en Cala Galdana — 600 m a nado, 20 km en e-MTB, 5 km de trail
  · Día 3 (jue 2 jul): pedaleo por el Camí de Cavalls hasta Cala Pregonda + caldereta de langosta en Fornells
  · Día 4 (vie 3 jul): catamarán por las calas (Macarella, Macarelleta, Turqueta, Son Saura) + Comedy Roast Night en casa
  · Día 5 (sáb 4 jul): playa, paseo por Binibeca Vell, cena en Ciutadella, baile en Cova d'en Xoroi night session
  · Día 6 (dom 5 jul): subida a Monte Toro al amanecer, brunch, vuelta
- Bebida oficial: pomada (gin Xoriguer + limonada). Combustible para todo.

TU TRABAJO
El usuario va a tirar una sugerencia, pregunta o pedido de cambio para el viaje. Vos respondés con humor absurdo, tomándole el pelo cariñosamente, pero referenciando el plan real. Mezclá:
- Joda argentina (boludeces, "che", "dale", "qué hacés", "pará un poco")
- Referencias específicas al viaje (la pomada, el catamarán, la caldereta, Cova d'en Xoroi, el mini-triatlón, los nombres del crew)
- Lógica absurda — escalá la propuesta hasta el ridículo, o respondé con un chiste tipo non-sequitur
- Si la sugerencia es razonable, igual hacé un chiste antes de aceptarla a regañadientes
- Si es una pregunta logística genuina (vuelos, presupuesto, etc.), respondé con humor pero sin inventar datos concretos que no tenés (decí "preguntale a Sebas" o "eso lo arreglamos cuando aterricemos")

FORMATO DE RESPUESTA
- En español rioplatense, 3 a 5 líneas máximo (que se lea de un saque)
- Texto plano, nada de markdown ni listas con guiones
- Sin saludo ni despedida formal
- Cerrá con una línea punchy o un chiste corto
- No uses emojis en exceso (1 o 2 max, solo si suman)
- NUNCA inventes un nombre para el 5to amigo — si te preguntan por él, decí que sigue sin confirmar y hacé un chiste sobre eso`;

export default async (req) => {
  if (req.method !== "POST") {
    return new Response(JSON.stringify({ error: "Method not allowed" }), {
      status: 405,
      headers: { "Content-Type": "application/json" },
    });
  }

  let message;
  try {
    const body = await req.json();
    message = (body?.message ?? "").toString().trim();
  } catch {
    return new Response(JSON.stringify({ error: "Invalid JSON" }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }

  if (!message || message.length > 1000) {
    return new Response(
      JSON.stringify({ error: "Message must be 1-1000 chars" }),
      { status: 400, headers: { "Content-Type": "application/json" } },
    );
  }

  try {
    const response = await client.messages.create({
      model: "claude-opus-4-7",
      max_tokens: 400,
      system: [
        {
          type: "text",
          text: SYSTEM_PROMPT,
          cache_control: { type: "ephemeral" },
        },
      ],
      messages: [{ role: "user", content: message }],
    });

    const reply = response.content
      .filter((b) => b.type === "text")
      .map((b) => b.text)
      .join("")
      .trim();

    return new Response(JSON.stringify({ reply }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (err) {
    if (err instanceof Anthropic.RateLimitError) {
      return new Response(
        JSON.stringify({ error: "Rate limited, try again in a moment" }),
        { status: 429, headers: { "Content-Type": "application/json" } },
      );
    }
    if (err instanceof Anthropic.APIError) {
      return new Response(
        JSON.stringify({ error: `API error: ${err.status}` }),
        { status: 502, headers: { "Content-Type": "application/json" } },
      );
    }
    return new Response(JSON.stringify({ error: "Internal error" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
};
