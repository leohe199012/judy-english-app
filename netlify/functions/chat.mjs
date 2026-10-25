import chat from '../../api/chat.mjs';

// Reuse the same validation, authentication and provider logic on Netlify.
export async function handler(event) {
  const headers = Object.fromEntries(Object.entries(event.headers || {}).map(([name, value]) => [name.toLowerCase(), value]));
  const response = {
    statusCode: 200,
    headers: { 'Content-Type': 'application/json; charset=utf-8' },
    body: '',
    setHeader(name, value) { this.headers[name] = value; },
    status(code) { this.statusCode = code; return this; },
    json(data) { this.body = JSON.stringify(data); return this; }
  };
  await chat({ method: event.httpMethod, headers, body: event.isBase64Encoded ? Buffer.from(event.body || '', 'base64').toString('utf8') : event.body }, response);
  return { statusCode: response.statusCode, headers: response.headers, body: response.body };
}
