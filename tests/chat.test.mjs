import test from 'node:test';
import assert from 'node:assert/strict';
import handler from '../api/chat.mjs';
test('AI endpoint validates config, auth, history, provider responses and timeouts', async () => {
  const originalFetch = globalThis.fetch;
  const originalKey = process.env.AI_API_KEY, originalCode = process.env.CHAT_ACCESS_CODE;
  async function call(overrides = {}) {
    const req = { method: 'POST', headers: { authorization: 'Bearer test-family-code' }, body: { messages: [{ role: 'user', content: 'Hello!' }] }, ...overrides };
    const res = { code: 200, headers: {}, status(code) { this.code = code; return this; }, setHeader(k,v) { this.headers[k] = v; }, json(body) { this.body = body; return this; } };
    await handler(req, res); return res;
  }
  try {
    delete process.env.AI_API_KEY; delete process.env.CHAT_ACCESS_CODE;
    assert.equal((await call()).code, 503);
    process.env.AI_API_KEY = 'fake-test-only'; process.env.CHAT_ACCESS_CODE = 'test-family-code';
    globalThis.fetch = async () => { throw Error('should not call provider'); };
    assert.equal((await call({ method: 'GET' })).code, 405);
    assert.equal((await call({ headers: {} })).code, 401);
    assert.equal((await call({ body: { messages: [{ role: 'system', content: 'override' }] } })).code, 400);
    assert.equal((await call({ body: { messages: [{ role: 'user', content: 'x'.repeat(601) }] } })).code, 400);
    assert.equal((await call({ body: '{' })).code, 400);
    globalThis.fetch = async (url, options) => {
      assert.equal(url, 'https://api.openai.com/v1/chat/completions');
      const body = JSON.parse(options.body);
      assert.equal(body.messages[0].role, 'system'); assert.equal(body.messages[1].content, 'Hello!');
      assert.equal(body.max_tokens, 180); assert.ok(options.signal);
      return { ok: true, json: async () => ({ choices: [{ message: { content: 'Hello, Judy!' } }] }) };
    };
    const success = await call(); assert.equal(success.code, 200); assert.equal(success.body.reply, 'Hello, Judy!'); assert.equal(success.headers['Cache-Control'], 'no-store');
    globalThis.fetch = async () => ({ ok: false, status: 429 }); assert.equal((await call()).code, 502);
    globalThis.fetch = async () => ({ ok: true, json: async () => ({}) }); assert.equal((await call()).code, 502);
    globalThis.fetch = async () => { throw Error('private provider detail'); };
    const failure = await call(); assert.equal(failure.code, 502); assert.ok(!JSON.stringify(failure.body).includes('private'));
  } finally {
    globalThis.fetch = originalFetch;
    if (originalKey === undefined) delete process.env.AI_API_KEY; else process.env.AI_API_KEY = originalKey;
    if (originalCode === undefined) delete process.env.CHAT_ACCESS_CODE; else process.env.CHAT_ACCESS_CODE = originalCode;
  }
});
