import { useEffect, useRef, useState } from 'react';
type Message = { role: 'user' | 'assistant'; content: string };
type Recognition = { lang: string; interimResults: boolean; onresult: ((event: { results: { [index: number]: { [index: number]: { transcript: string } } } }) => void) | null; onerror: ((event: { error: string }) => void) | null; onend: (() => void) | null; start: () => void; stop: () => void; abort: () => void };
type SpeechWindow = Window & { SpeechRecognition?: new () => Recognition; webkitSpeechRecognition?: new () => Recognition };
export default function Chat({ onBack, teacher }: { onBack: () => void; teacher: React.ReactNode }) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [text, setText] = useState('');
  const [code, setCode] = useState('');
  const [ready, setReady] = useState(false);
  const [busy, setBusy] = useState(false);
  const [listening, setListening] = useState(false);
  const [speaking, setSpeaking] = useState(false);
  const [error, setError] = useState('');
  const [language, setLanguage] = useState('zh-CN');
  const recognition = useRef<Recognition | null>(null);
  const request = useRef<AbortController | null>(null);
  const locked = useRef(false);
  const bottom = useRef<HTMLDivElement>(null);
  const SpeechRecognition = (window as SpeechWindow).SpeechRecognition || (window as SpeechWindow).webkitSpeechRecognition;
  useEffect(() => () => { recognition.current?.abort(); request.current?.abort(); window.speechSynthesis?.cancel(); }, []);
  useEffect(() => { bottom.current?.scrollIntoView({ block: 'nearest' }); }, [messages, busy]);
  function speak(content: string) {
    if (!('speechSynthesis' in window)) { setError('当前浏览器不支持朗读，可以看文字回复。'); return; }
    speechSynthesis.cancel(); const utterance = new SpeechSynthesisUtterance(content); utterance.lang = /[\u4e00-\u9fff]/.test(content) ? 'zh-CN' : 'en-US'; utterance.rate = .85;
    utterance.onstart = () => setSpeaking(true); utterance.onend = () => setSpeaking(false);
    utterance.onerror = e => { setSpeaking(false); if (!['canceled', 'interrupted'].includes(e.error)) setError('请点击回复上的喇叭重试播放。'); };
    speechSynthesis.speak(utterance);
  }
  async function send(content = text) {
    const trimmed = content.trim(); if (!trimmed || locked.current || listening) return;
    locked.current = true; setBusy(true); setError(''); window.speechSynthesis?.cancel(); setSpeaking(false);
    const history: Message[] = [...messages.slice(-10), { role: 'user', content: trimmed.slice(0, 600) }];
    const controller = new AbortController(); request.current = controller;
    const timeout = window.setTimeout(() => controller.abort(), 25000);
    try {
      const response = await fetch('/api/chat', { method: 'POST', signal: controller.signal, headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${code}` }, body: JSON.stringify({ messages: history }) });
      const type = response.headers.get('content-type') || '';
      if (!type.includes('application/json')) throw new Error('当前网站只支持单词和小游戏。AI 聊天需要部署到带后端的站点。');
      const data = await response.json(); if (!response.ok) throw new Error(data.error || '老师暂时无法回答。');
      if (typeof data.reply !== 'string' || !data.reply.trim()) throw new Error('老师暂时没回复，再试一次吧。');
      setMessages([...history, { role: 'assistant', content: data.reply }]); setText(''); speak(data.reply);
    } catch (e) { if (!controller.signal.aborted) setError(e instanceof Error ? e.message : '连接失败，请重试。'); else setError('等待太久了，请重试。'); }
    finally { clearTimeout(timeout); locked.current = false; setBusy(false); }
  }
  function startListening() {
    if (!SpeechRecognition || busy || listening) return;
    window.speechSynthesis?.cancel(); setSpeaking(false); setError('');
    const mic = new SpeechRecognition(); recognition.current = mic; mic.lang = language; mic.interimResults = false;
    mic.onresult = event => { setText(event.results[0][0].transcript.slice(0, 600)); };
    mic.onerror = event => { setListening(false); setError(event.error === 'not-allowed' ? '请在浏览器设置中允许麦克风，或在下面打字。' : '没听清楚，可以再试一次，或请家长打字。'); };
    mic.onend = () => setListening(false);
    try { mic.start(); setListening(true); } catch { setError('麦克风暂时无法启动，请试试打字。'); }
  }
  return <section className="chat-page"><div className="page-heading"><button className="back" onClick={onBack}>← 首页</button><div><h1>和脆宝聊聊天</h1><p>你好呀，我是你的 AI 英语小伙伴！</p></div></div>
    {!ready ? <section className="chat-consent"><div className="chat-avatar">{teacher}</div><h2>请家长帮忙开启</h2><p>聊天文字会发送到 AI 服务，回答由 AI 生成。语音输入可能使用浏览器厂商的在线识别服务；不支持时可以打字。请陪孩子一起使用，不要输入姓名、住址等私人信息。</p><p>API 可能产生费用。家庭口令用于保护你家的接口，不是 API 密钥。</p><form onSubmit={e => { e.preventDefault(); if (code.trim()) { setCode(code.trim()); setReady(true); } }}><label>家庭口令<input aria-label="家庭口令" type="password" value={code} maxLength={128} required onChange={e => setCode(e.target.value)} autoComplete="off"/></label><button className="primary" type="submit">开启聊天 🐾</button></form></section> : <>
    <div className={`chat-avatar ${speaking ? 'is-speaking' : ''}`}>{teacher}<span>{listening ? '我在听哦 🎤' : busy ? '脆宝想一想…' : speaking ? '脆宝说… ♫' : '点麦克风，说一句话吧 ♡'}</span></div>
    <div className="chat-history" role="log" aria-label="和脆宝的对话"><div className="chat-bubble assistant">Hello! 我是脆宝！你喜欢什么动物呀？ <button aria-label="播放欢迎语" onClick={() => speak('Hello! 我是脆宝！你喜欢什么动物呀？')}>🔊</button></div>{messages.map((m, i) => <div className={`chat-bubble ${m.role}`} key={i}>{m.content}{m.role === 'assistant' && <button aria-label="播放脆宝回复" onClick={() => speak(m.content)}>🔊</button>}</div>)}{busy && <p role="status">🐾 脆宝想一想…</p>}<div ref={bottom}/></div>
    <div className="voice-controls"><label>说话语言<select value={language} disabled={listening} onChange={e => setLanguage(e.target.value)}><option value="zh-CN">中文</option><option value="en-US">English</option></select></label><button className={`primary ${listening ? 'recording' : ''}`} disabled={busy || !SpeechRecognition} onClick={() => listening ? recognition.current?.stop() : startListening()}>{listening ? '⏹ 说完了' : '🎤 点我说话'}</button><button className="back" onClick={() => { window.speechSynthesis?.cancel(); setSpeaking(false); }}>停止播放</button></div>
    {!SpeechRecognition && <p className="chat-hint">此浏览器不支持语音输入，请打字，或尝试新版 Safari / Chrome。</p>}
    <form className="chat-input" onSubmit={e => { e.preventDefault(); void send(); }}><label className="sr-only" htmlFor="chat-text">想对脆宝说的话</label><input id="chat-text" value={text} maxLength={600} disabled={busy || listening} onChange={e => setText(e.target.value)} placeholder="说完后，点发送；也可以在这里打字"/><button className="primary" disabled={busy || listening || !text.trim()}>发送 ↑</button></form>
    <button className="clear-chat" disabled={busy || listening} onClick={() => { window.speechSynthesis?.cancel(); setSpeaking(false); setMessages([]); setText(''); setError(''); }}>重新聊天</button><p className="chat-hint">对话只在本次页面中保留，离开后清空。听写完成后，请点发送。</p>
    </>}{error && <p className="status" role="alert">{error}</p>}</section>;
}
