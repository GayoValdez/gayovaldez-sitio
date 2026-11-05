// Verifica pagos de Stripe y entrega el contenido exclusivo de Gayo Valdez.
// Variables (Cloudflare > Worker > Settings > Variables and Secrets):
//   STRIPE_KEY    (Secret)  clave restringida de Stripe, solo lectura
//   TOKEN_SECRET  (Secret)  texto largo al azar
//   CONTENT       (Text)    JSON con el contenido, ver LEEME
const ORIGIN = "https://gayovaldez.com";
const DAYS = 30;
const enc = new TextEncoder();

const cors = (extra = {}) => ({
  "Access-Control-Allow-Origin": ORIGIN,
  "Access-Control-Allow-Headers": "content-type, authorization",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Content-Type": "application/json",
  ...extra,
});
const out = (obj, status = 200) => new Response(JSON.stringify(obj), { status, headers: cors() });

const b64 = (buf) => btoa(String.fromCharCode(...new Uint8Array(buf))).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
async function sign(data, secret) {
  const k = await crypto.subtle.importKey("raw", enc.encode(secret), { name: "HMAC", hash: "SHA-256" }, false, ["sign"]);
  return b64(await crypto.subtle.sign("HMAC", k, enc.encode(data)));
}
async function makeToken(sub, secret) {
  const body = b64(enc.encode(JSON.stringify({ sub, exp: Date.now() + DAYS * 864e5 })));
  return body + "." + (await sign(body, secret));
}
async function readToken(tok, secret) {
  const [body, sig] = String(tok || "").split(".");
  if (!body || !sig || (await sign(body, secret)) !== sig) return null;
  try {
    const p = JSON.parse(atob(body.replace(/-/g, "+").replace(/_/g, "/")));
    return p.exp > Date.now() ? p : null;
  } catch { return null; }
}
async function stripe(path, key) {
  const r = await fetch("https://api.stripe.com/v1/" + path, { headers: { Authorization: "Bearer " + key } });
  return r.ok ? r.json() : null;
}
const activa = (s) => s && (s.status === "active" || s.status === "trialing");

export default {
  async fetch(req, env) {
    if (req.method === "OPTIONS") return new Response(null, { status: 204, headers: cors() });
    if (req.method !== "POST") return out({ error: "método no permitido" }, 405);
    const url = new URL(req.url);

    // 1) Canjear la sesión de Stripe por un token
    if (url.pathname === "/login") {
      const { session_id } = await req.json().catch(() => ({}));
      if (!/^cs_(test|live)_[A-Za-z0-9]+$/.test(session_id || "")) return out({ error: "sesión inválida" }, 400);
      const ses = await stripe("checkout/sessions/" + session_id, env.STRIPE_KEY);
      if (!ses || ses.status !== "complete" || !ses.subscription) return out({ error: "pago no encontrado" }, 403);
      const sub = await stripe("subscriptions/" + ses.subscription, env.STRIPE_KEY);
      if (!activa(sub)) return out({ error: "suscripción inactiva" }, 403);
      return out({ token: await makeToken(ses.subscription, env.TOKEN_SECRET) });
    }

    // 2) Entregar el contenido si la suscripción sigue activa
    if (url.pathname === "/contenido") {
      const tok = (req.headers.get("authorization") || "").replace(/^Bearer /, "");
      const p = await readToken(tok, env.TOKEN_SECRET);
      if (!p) return out({ error: "sin acceso" }, 401);
      const sub = await stripe("subscriptions/" + p.sub, env.STRIPE_KEY);
      if (!activa(sub)) return out({ error: "suscripción inactiva" }, 403);
      let items = [];
      try { items = JSON.parse(env.CONTENT || "[]"); } catch {}
      return out({ items });
    }
    return out({ error: "no existe" }, 404);
  },
};
