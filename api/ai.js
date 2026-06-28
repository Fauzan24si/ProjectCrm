/**
 * Vercel Serverless Function: proxy untuk AI Chat.
 *
 * Tujuan:
 *  - Menyembunyikan API key di server (TIDAK bocor ke browser).
 *  - Menggantikan proxy Vite (yang hanya jalan saat `npm run dev`).
 *
 * Endpoint ini menerima POST dari client di `/api/ai` lalu meneruskannya
 * ke server AI sebenarnya, sambil menambahkan header Authorization.
 *
 * Set environment variable berikut di dashboard Vercel
 * (Project Settings > Environment Variables) — TANPA prefix VITE_:
 *   AI_PROXY_TARGET  - base server AI, mis. http://79.137.75.106:20128
 *   AI_API_KEY       - API key rahasia
 *   AI_MODEL         - (opsional) nama model default
 */

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: { message: 'Method Not Allowed' } });
  }

  // Terima nama tanpa prefix (disarankan) maupun dengan prefix VITE_
  // agar kompatibel dengan env yang sudah terlanjur di-set di Vercel.
  const target = process.env.AI_PROXY_TARGET || process.env.VITE_AI_PROXY_TARGET;
  const apiKey = process.env.AI_API_KEY || process.env.VITE_AI_API_KEY;
  const defaultModel = process.env.AI_MODEL || process.env.VITE_AI_MODEL;

  if (!target || !apiKey) {
    return res.status(500).json({
      error: {
        message:
          'Konfigurasi server AI belum lengkap. Set AI_PROXY_TARGET dan AI_API_KEY di Vercel.',
      },
    });
  }

  try {
    // Body bisa berupa object (sudah di-parse Vercel) atau string.
    const payload =
      typeof req.body === 'string' ? JSON.parse(req.body || '{}') : req.body || {};

    // Model: bila AI_MODEL di-set di server, selalu pakai itu (otoritatif),
    // agar tidak bergantung pada VITE_AI_MODEL yang di-inline saat build.
    // Jika tidak, pakai model dari client; fallback terakhir ke defaultModel.
    if (defaultModel) {
      payload.model = defaultModel;
    } else if (!payload.model) {
      payload.model = 'openai.gpt-oss-120b';
    }

    const upstream = await fetch(`${target.replace(/\/$/, '')}/v1/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify(payload),
    });

    // Teruskan body apa adanya (mendukung JSON biasa maupun SSE text).
    const text = await upstream.text();
    res.status(upstream.status);
    res.setHeader(
      'Content-Type',
      upstream.headers.get('content-type') || 'application/json'
    );
    return res.send(text);
  } catch (err) {
    return res.status(502).json({
      error: { message: `Gagal menghubungi server AI: ${err.message}` },
    });
  }
}
