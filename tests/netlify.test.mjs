import test from 'node:test';
import assert from 'node:assert/strict';
import { handler } from '../netlify/functions/chat.mjs';

test('Netlify adapter forwards auth, JSON/base64 body, response status and headers', async () => {
  const oldKey = process.env.AI_API_KEY, oldCode = process.env.CHAT_ACCESS_CODE, originalFetch = globalThis.fetch;
  try {
    process.env.AI_API_KEY = 'test-only'; process.env.CHAT_ACCESS_CODE = 'test-code';
    assert.equal((await handler({ httpMethod: 'GET' })).statusCode, 405);
    assert.equal((await handler({ httpMethod: 'POST', headers: {}, body: '{}' })).statusCode, 401);
    globalThis.fetch = async () => ({ ok: true, json: async () => ({ choices: [{ message: { content: 'Hello Judy!' } }] }) });
    const body = JSON.stringify({ messages: [{ role: 'user', content: 'Hello' }] });
    for (const encoded of [false, true]) {
      const result = await handler({ httpMethod: 'POST', headers: { Authorization: 'Bearer test-code' }, isBase64Encoded: encoded, body: encoded ? Buffer.from(body).toString('base64') : body });
      assert.equal(result.statusCode, 200); assert.equal(JSON.parse(result.body).reply, 'Hello Judy!');
      assert.equal(result.headers['Cache-Control'], 'no-store'); assert.match(result.headers['Content-Type'], /application\/json/);
    }
  } finally {
    globalThis.fetch = originalFetch;
    if (oldKey === undefined) delete process.env.AI_API_KEY; else process.env.AI_API_KEY = oldKey;
    if (oldCode === undefined) delete process.env.CHAT_ACCESS_CODE; else process.env.CHAT_ACCESS_CODE = oldCode;
  }
});
