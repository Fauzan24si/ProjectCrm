/**
 * Service untuk AI Chat menggunakan endpoint OpenAI-compatible.
 *
 * Dua mode jalan:
 *  - DEVELOPMENT (`npm run dev`): memanggil proxy Vite di `/ai-api/v1`
 *    (lihat vite.config.js) dengan API key dari .env. Proxy Vite hanya
 *    aktif di mode dev.
 *  - PRODUCTION (Vercel): memanggil serverless function `/api/ai`
 *    (lihat api/ai.js). API key disimpan di server (env Vercel: AI_API_KEY),
 *    sehingga TIDAK bocor ke browser.
 *
 * Konfigurasi .env untuk dev:
 *   VITE_AI_BASE_URL  - base URL endpoint via proxy (mis. /ai-api/v1)
 *   VITE_AI_API_KEY   - API key
 *   VITE_AI_MODEL     - nama model
 */

const BASE_URL = import.meta.env.VITE_AI_BASE_URL;
const API_KEY = import.meta.env.VITE_AI_API_KEY;
const MODEL = import.meta.env.VITE_AI_MODEL || 'openai.gpt-oss-120b';

/**
 * Kirim daftar pesan ke model dan dapatkan balasan.
 *
 * Strategi endpoint (robust untuk semua cara menjalankan app):
 *  1. Coba serverless `/api/ai` lebih dulu — ini jalan di Vercel (deploy)
 *     maupun `vercel dev`. Key ditambahkan di server.
 *  2. Bila `/api/ai` tidak tersedia (mis. `npm run dev` murni, yang
 *     mengembalikan HTML / 404), fallback ke proxy Vite `/ai-api/v1`
 *     dengan key dari .env.
 *
 * @param {Array<{role: 'system'|'user'|'assistant', content: string}>} messages
 * @param {object} [options]
 * @param {number} [options.maxTokens=512]
 * @param {AbortSignal} [options.signal]
 * @returns {Promise<string>} konten balasan asisten
 */
export async function sendChat(messages, { maxTokens = 512, signal } = {}) {
  const body = {
    model: MODEL,
    messages,
    max_tokens: maxTokens,
    stream: false,
  };

  // 1. Serverless function (Vercel deploy & `vercel dev`).
  const viaServerless = await tryRequest('/api/ai', body, { signal });
  if (viaServerless.ok) return parseChatResponse(viaServerless.raw);

  // 2. Fallback: proxy Vite (hanya aktif pada `npm run dev`).
  if (viaServerless.unavailable && BASE_URL && API_KEY) {
    const viaProxy = await tryRequest(
      `${BASE_URL}/chat/completions`,
      body,
      { signal, headers: { Authorization: `Bearer ${API_KEY}` } }
    );
    if (viaProxy.ok) return parseChatResponse(viaProxy.raw);
    if (viaProxy.error) throw new Error(viaProxy.error);
  }

  // Tidak ada endpoint yang tersedia.
  if (viaServerless.error) throw new Error(viaServerless.error);
  throw new Error(
    'Layanan AI tidak tersedia. Jalankan via Vercel/`vercel dev`, atau set ' +
      'VITE_AI_BASE_URL & VITE_AI_API_KEY untuk mode `npm run dev`.'
  );
}

/**
 * Lakukan satu request ke sebuah endpoint AI.
 * @returns {Promise<{ok:boolean, raw?:string, error?:string, unavailable?:boolean}>}
 *   - ok=true       : sukses, `raw` berisi body
 *   - unavailable   : endpoint tidak ada (HTML/404) -> boleh fallback
 *   - error         : pesan error pasti (jangan fallback)
 */
async function tryRequest(url, body, { signal, headers = {} } = {}) {
  let response;
  try {
    response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...headers },
      body: JSON.stringify(body),
      signal,
    });
  } catch (err) {
    if (err?.name === 'AbortError') throw err;
    // Gagal jaringan -> anggap endpoint ini tidak tersedia (boleh fallback).
    return { unavailable: true };
  }

  const contentType = response.headers.get('content-type') || '';
  const raw = await response.text();

  // Endpoint tidak ada: SPA fallback mengembalikan HTML, atau 404.
  const looksHtml =
    contentType.includes('text/html') || /^\s*<(!doctype|html)/i.test(raw);
  if (looksHtml || response.status === 404) {
    return { unavailable: true };
  }

  if (!response.ok) {
    let detail = raw;
    try {
      const errBody = JSON.parse(raw);
      detail = errBody.error?.message || JSON.stringify(errBody);
    } catch {
      // Bukan JSON; pakai teks mentah.
    }
    return { error: `AI request gagal (${response.status}): ${detail}` };
  }

  return { ok: true, raw };
}

/**
 * Parse respons chat completion.
 * Mendukung dua format:
 *  1. JSON biasa: { choices: [{ message: { content } }] }
 *  2. SSE stream:  baris-baris "data: {...}" dengan delta.content
 * @param {string} raw
 * @returns {string}
 */
function parseChatResponse(raw) {
  const text = (raw || '').trim();
  if (!text) return '';

  // Format JSON biasa.
  if (!text.startsWith('data:')) {
    try {
      const data = JSON.parse(text);
      return data.choices?.[0]?.message?.content ?? '';
    } catch {
      // Bukan JSON valid. Jika tampak seperti HTML, jangan kembalikan mentah.
      if (/^\s*<(!doctype|html|\?xml)/i.test(text)) {
        throw new Error('Respons AI tidak valid (menerima HTML, bukan data).');
      }
      return text;
    }
  }

  // Format SSE: gabungkan semua delta.content dari tiap baris "data: {...}".
  let content = '';
  const lines = text.split('\n');
  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed.startsWith('data:')) continue;

    const payload = trimmed.slice(5).trim();
    if (payload === '' || payload === '[DONE]') continue;

    try {
      const chunk = JSON.parse(payload);
      const choice = chunk.choices?.[0];
      // Streaming pakai `delta.content`, non-streaming pakai `message.content`.
      const piece =
        choice?.delta?.content ?? choice?.message?.content ?? '';
      content += piece;
    } catch {
      // Lewati baris yang tidak bisa di-parse.
    }
  }
  return content;
}
