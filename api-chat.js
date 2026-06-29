// api/chat.js — Vercel serverless function
// Proxies the venue concierge to Claude, keeping your API key server-side.
//
// SETUP:
//   1. Put this file at  api/chat.js  in your repo (Vercel auto-detects it).
//   2. In Vercel → Project → Settings → Environment Variables,
//      add  ANTHROPIC_API_KEY  with your key.
//   3. In concierge.html set  USE_LIVE_AI = true  and redeploy.
//
// The frontend posts { system, messages }. We forward to Claude and
// return the raw response so the page can read data.content.

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const key = process.env.ANTHROPIC_API_KEY;
  if (!key) {
    return res.status(500).json({ error: "ANTHROPIC_API_KEY not set" });
  }

  try {
    const { system, messages } = req.body || {};

    const r = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": key,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: "claude-sonnet-4-6",
        max_tokens: 400,
        system: system || "You are a helpful venue concierge.",
        messages: messages || [],
      }),
    });

    const data = await r.json();
    return res.status(r.status).json(data);
  } catch (err) {
    return res.status(500).json({ error: "Upstream error", detail: String(err) });
  }
}
