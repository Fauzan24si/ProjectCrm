/**
 * Service untuk AI Chat menggunakan endpoint OpenAI-compatible
 * (AWS Bedrock Mantle).
 *
 * Konfigurasi diambil dari .env:
 *   VITE_AI_BASE_URL  - base URL endpoint (mis. https://bedrock-mantle.us-east-1.api.aws/v1)
 *   VITE_AI_API_KEY   - API key
 *   VITE_AI_MODEL     - nama model (mis. openai.gpt-oss-120b)
 *
 * CATATAN KEAMANAN:
 * Memanggil API ini langsung dari browser akan mengekspos API key ke client.
 * Untuk production, sebaiknya proxy lewat backend agar key tidak bocor.
 */

const BASE_URL = import.meta.env.VITE_AI_BASE_URL;
const API_KEY = import.meta.env.VITE_AI_API_KEY;
const MODEL = import.meta.env.VITE_AI_MODEL || 'openai.gpt-oss-120b';

/**
 * Kirim daftar pesan ke model dan dapatkan balasan.
 * @param {Array<{role: 'system'|'user'|'assistant', content: string}>} messages
 * @param {object} [options]
 * @param {number} [options.maxTokens=512]
 * @param {AbortSignal} [options.signal]
 * @returns {Promise<string>} konten balasan asisten
 */
export async function sendChat(messages, { maxTokens = 512, signal } = {}) {
  if (!BASE_URL || !API_KEY) {
    throw new Error(
      'Konfigurasi AI belum lengkap. Set VITE_AI_BASE_URL dan VITE_AI_API_KEY di .env'
    );
  }

  const response = await fetch(`${BASE_URL}/chat/completions`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${API_KEY}`,
    },
    body: JSON.stringify({
      model: MODEL,
      messages,
      max_tokens: maxTokens,
      stream: false,
    }),
    signal,
  });

  if (!response.ok) {
    // Baca body SEKALI sebagai teks, lalu coba parse jadi JSON.
    // Membaca body dua kali (response.json() lalu response.text())
    // memicu error "body stream already read".
    const rawErr = await response.text();
    let detail = rawErr;
    try {
      const errBody = JSON.parse(rawErr);
      detail = errBody.error?.message || JSON.stringify(errBody);
    } catch {
      // Bukan JSON; pakai teks mentah apa adanya.
    }
    throw new Error(`AI request gagal (${response.status}): ${detail}`);
  }

  // Baca sebagai teks dulu agar bisa menangani JSON biasa maupun
  // format streaming SSE ("data: {...}") yang dikirim sebagian server.
  const raw = await response.text();
  return parseChatResponse(raw);
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
      // Bukan JSON valid; kembalikan apa adanya.
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
