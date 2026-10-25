import React, { useEffect, useState } from 'react';
import { createRoot } from 'react-dom/client';
import './style.css';

const animals = [
  { id: 'cat', word: 'Cat', cn: '小猫', icon: '🐱', color: '#fff0d3' },
  { id: 'dog', word: 'Dog', cn: '小狗', icon: '🐶', color: '#f5e5d6' },
  { id: 'rabbit', word: 'Rabbit', cn: '兔子', icon: '🐰', color: '#ffe5e9' },
  { id: 'bear', word: 'Bear', cn: '小熊', icon: '🐻', color: '#f0e5d8' },
  { id: 'panda', word: 'Panda', cn: '熊猫', icon: '🐼', color: '#e8efdf' },
  { id: 'lion', word: 'Lion', cn: '狮子', icon: '🦁', color: '#ffedc6' },
  { id: 'elephant', word: 'Elephant', cn: '大象', icon: '🐘', color: '#e2e9f6' },
  { id: 'monkey', word: 'Monkey', cn: '猴子', icon: '🐵', color: '#f6e4d2' },
  { id: 'duck', word: 'Duck', cn: '鸭子', icon: '🦆', color: '#e2efdf' },
  { id: 'pig', word: 'Pig', cn: '小猪', icon: '🐷', color: '#ffe4e7' },
];
type Animal = typeof animals[number];
type Progress = { learned: string[]; stars: number };
const key = 'judy-cuibao-progress-v1';
function load(): Progress {
  try { const p = JSON.parse(localStorage.getItem(key) || 'null'); return { learned: Array.isArray(p?.learned) ? [...new Set<string>(p.learned.filter((id: unknown) => animals.some(a => a.id === id)))] : [], stars: Number.isSafeInteger(p?.stars) && p.stars >= 0 ? p.stars : 0 }; } catch { return { learned: [], stars: 0 }; }
}
function shuffle<T,>(items: T[]): T[] { const copy = [...items]; for (let i = copy.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [copy[i], copy[j]] = [copy[j], copy[i]]; } return copy; }
function round(previous?: string) { const target = shuffle(animals.filter(a => a.id !== previous))[0]; return { target, choices: shuffle([target, ...shuffle(animals.filter(a => a.id !== target.id)).slice(0, 2)]) }; }
function CatTeacher({ small = false }: { small?: boolean }) {
  return <svg className={small ? 'cat-teacher small' : 'cat-teacher'} viewBox="0 0 260 260" role="img" aria-label="白猫老师脆宝"><ellipse cx="130" cy="240" rx="85" ry="12" fill="#bed8bb"/><path d="M76 190 Q60 246 108 239 L161 239 Q200 234 182 186" fill="white" stroke="#d9e0d2" strokeWidth="3"/><path d="M182 211 Q236 229 219 190" fill="none" stroke="white" strokeWidth="20" strokeLinecap="round"/><path d="M51 106 L42 28 Q74 25 99 62 Q129 49 160 63 Q188 25 218 28 L208 112 Q224 200 130 205 Q35 200 51 106" fill="#fff" stroke="#d9e0d2" strokeWidth="3"/><path d="M53 44 L62 86 L87 68Z M206 44 L175 69 L201 87Z" fill="#f6c7c6"/><ellipse cx="86" cy="145" rx="19" ry="11" fill="#f8d6d1"/><ellipse cx="175" cy="145" rx="19" ry="11" fill="#f8d6d1"/><path d="M84 122 Q96 107 107 122 M153 122 Q165 107 177 122" fill="none" stroke="#526456" strokeWidth="5" strokeLinecap="round"/><path d="M123 136 Q130 130 137 136 L130 143Z" fill="#d79b9b"/><path d="M130 142 V150 M130 150 Q120 161 112 150 M130 150 Q140 161 148 150" fill="none" stroke="#526456" strokeWidth="3" strokeLinecap="round"/><path d="M63 139 L32 133 M63 153 L31 158 M196 139 L228 133 M196 153 L229 158" stroke="#bdc9b9" strokeWidth="3" strokeLinecap="round"/><path d="M96 200 L130 212 L164 200 L164 218 L130 212 L96 218Z" fill="#e9ac63"/><circle cx="130" cy="212" r="6" fill="#bd7f42"/></svg>;
}
function App() {
  const [page, setPage] = useState<'home' | 'learn' | 'game'>('home');
  const [progress, setProgress] = useState(load);
  const [message, setMessage] = useState('');
  const [active, setActive] = useState('');
  const [question, setQuestion] = useState(() => round());
  const [wrong, setWrong] = useState<string[]>([]);
  const [won, setWon] = useState(false);
  const [storageError, setStorageError] = useState(false);
  useEffect(() => { try { localStorage.setItem(key, JSON.stringify(progress)); setStorageError(false); } catch { setStorageError(true); } }, [progress]);
  useEffect(() => () => { window.speechSynthesis?.cancel(); }, []);
  function speak(word: string) {
    setMessage('');
    if (!('speechSynthesis' in window)) { setMessage('这个浏览器暂不支持朗读，请试试 Safari 或 Chrome。'); return; }
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(word); utterance.lang = 'en-US'; utterance.rate = 0.8;
    const voice = window.speechSynthesis.getVoices().find(v => v.lang === 'en-US'); if (voice) utterance.voice = voice;
    utterance.onerror = e => { if (e.error !== 'canceled' && e.error !== 'interrupted') setMessage('声音暂时没播放出来，打开设备声音后再点一次吧。'); };
    window.speechSynthesis.speak(utterance);
  }
  function learn(a: Animal) { setActive(a.id); speak(a.word); setProgress(p => p.learned.includes(a.id) ? p : { ...p, learned: [...p.learned, a.id] }); }
  function choose(a: Animal) {
    if (won || wrong.includes(a.id)) return;
    if (a.id === question.target.id) { setWon(true); setProgress(p => ({ ...p, stars: p.stars + 1 })); speak(`Great job! ${a.word}!`); }
    else { setWrong(ids => [...ids, a.id]); speak('Try again!'); }
  }
  function navigate(next: typeof page) { window.speechSynthesis?.cancel(); setMessage(''); setPage(next); window.scrollTo({ top: 0, behavior: 'smooth' }); }
  return <><header className="header"><button className="brand" onClick={() => navigate('home')} aria-label="回到首页"><span className="brand-icon">🐾</span><span>Judy & 脆宝<small>小小英语，大大世界</small></span></button><div className="star-counter" aria-label={`已获得${progress.stars}颗星星`}>⭐ <strong>{progress.stars}</strong></div></header>
    <main>
      {page === 'home' ? <>
        <section className="hero"><div className="hero-copy"><span className="pill">🌱 每天一点点，快乐长大</span><h1>欢迎来到<br/>我们的<span>英语世界</span><i> ✨</i></h1><p>和脆宝一起听一听、点一点，<br/>认识可爱的动物朋友！</p><button className="primary" onClick={() => navigate('learn')}>一起学英语 <span>→</span></button><div className="parent-note">🔊 打开声音，跟着脆宝读一读</div></div><div className="hero-art"><span className="cloud cloud-one"/><span className="cloud cloud-two"/><span className="sun">☀</span><div className="speech-bubble">Hello, Judy! <span>我是你的老师，脆宝 ♡</span></div><CatTeacher/><span className="flower flower-one">🌼</span><span className="flower flower-two">🌷</span><span className="art-ground"/><span className="sparkle">✦</span></div></section>
        <section className="activities"><div className="section-title"><div><span className="eyebrow">LET'S PLAY & LEARN</span><h2>今天想玩什么？</h2></div><span className="little-doodle">快乐学习每一天 🌈</span></div><div className="activity-grid"><button className="activity learn-activity" onClick={() => navigate('learn')}><span className="activity-emoji">🐰 🐱</span><span className="activity-content"><strong>动物好朋友</strong><span>点一点，听听它叫什么</span><em>10 张可爱单词卡</em></span><span className="circle-arrow">↗</span></button><button className="activity game-activity" onClick={() => navigate('game')}><span className="activity-emoji">🎯</span><span className="activity-content"><strong>谁躲在这里？</strong><span>听声音，找到动物朋友</span><em>答对就能收集星星 ⭐</em></span><span className="circle-arrow">↗</span></button></div></section>
        <section className="progress-panel"><span className="seedling">🌱</span><div><h3>小小进步，也值得庆祝</h3><p>已认识 {progress.learned.length} / 10 位动物朋友</p><div className="progress-track" role="progressbar" aria-label="学习进度" aria-valuenow={progress.learned.length} aria-valuemin={0} aria-valuemax={10}><span style={{width: `${progress.learned.length * 10}%`}}/></div></div><span className="progress-sticker">做得好！<br/>⭐</span></section>
      </> : <>
        <div className="page-heading"><button className="back" onClick={() => navigate('home')}>← 首页</button><div><h1>{page === 'learn' ? '动物好朋友' : '谁躲在这里？'}</h1><p>{page === 'learn' ? '点一点动物，跟着脆宝读一读' : '听听脆宝说什么，再点选动物'}</p></div><CatTeacher small/></div>
        {page === 'learn' ? <><div className="animal-grid">{animals.map(a => <button key={a.id} className={`animal-card ${active === a.id ? 'selected' : ''}`} style={{background: a.color}} onClick={() => learn(a)} aria-label={`听 ${a.word} ${a.cn} 发音`}><span className="learned-check">{progress.learned.includes(a.id) ? '✓' : '♫'}</span><span className="animal-picture" role="img" aria-label={a.cn}>{a.icon}</span><strong>{a.word}</strong><span className="animal-cn">{a.cn} · 🔊</span></button>)}</div><button className="primary bottom-action" onClick={() => navigate('game')}>试试小游戏 ⭐ →</button></> : <section className="game-board"><button className="listen-button" onClick={() => speak(question.target.word)} aria-label="听题目美式英语发音"><span>🔊</span>听一听，再找一找</button><div className="game-choices">{question.choices.map(a => <button key={a.id} disabled={won || wrong.includes(a.id)} className={`choice ${wrong.includes(a.id) ? 'wrong' : ''} ${won && a.id === question.target.id ? 'correct' : ''}`} style={{background: a.color}} onClick={() => choose(a)} aria-label={`选择${a.cn}`}><span role="img" aria-label={a.cn}>{a.icon}</span>{won && a.id === question.target.id && <b>⭐</b>}{wrong.includes(a.id) && <small>再试试 ♡</small>}</button>)}</div><div className="game-feedback" role="status">{won ? <><span className="reward">🌟</span><strong>太棒啦！获得一颗星星！</strong><button className="primary" onClick={() => { const next = round(question.target.id); setQuestion(next); setWon(false); setWrong([]); speak(next.target.word); }}>再玩一次 →</button></> : <p>{wrong.length ? '没关系，再听一次吧 💛' : '👆 先点喇叭听题目'}</p>}</div></section>}
      </>}
      <p className="status" role="status">{message || (storageError ? '浏览器无法保存进度，本次仍可继续玩。' : '')}</p>
    </main><footer><span>🐾</span> 陪伴每一个好奇的小脑袋 <span>♡</span><small>Judy & 脆宝的英语世界 · 进度保存在当前浏览器</small></footer></>;
}
createRoot(document.getElementById('root')!).render(<React.StrictMode><App/></React.StrictMode>);
