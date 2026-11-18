/* =====================================================================
   Wortland – Spiel-Engine
   Ansichten, adaptive Stufen, Runden, Endgegner, Challenges, Speichern
   ===================================================================== */
'use strict';

const KEY = 'wortland-v1';
const ROUND = 8, BOSS_Q = 12, BOSS_HEARTS = 4, DAILY_Q = 10, BLITZ_SEC = 60;
const LVL = [null, { icon: '🌱', name: 'Leicht' }, { icon: '🌿', name: 'Mittel' }, { icon: '🌳', name: 'Schwer' }];
const RANKS = [['🥚', 'Ei', 0], ['🐣', 'Küken', 100], ['🐤', 'Spatz', 300], ['🦉', 'Eule', 700], ['🦅', 'Adler', 1300], ['🔥', 'Phönix', 2200], ['🐉', 'Wortdrache', 3500]];
const BADGES = [
  { id: 'erste', icon: '🎒', name: 'Los geht’s', how: 'Die erste Runde gespielt.' },
  { id: 'k1', icon: '💎', name: 'Erster Kristall', how: 'Einen Wort-Kristall gefunden.' },
  { id: 'k5', icon: '💠', name: 'Halbe Krone', how: 'Fünf Wort-Kristalle gefunden.' },
  { id: 'k10', icon: '👑', name: 'Kristallkrone', how: 'Alle zehn Wort-Kristalle gefunden.' },
  { id: 'dieb', icon: '🦝', name: 'Diebesfänger', how: 'Klau, den Wortdieb, besiegt.' },
  { id: 'wirrwarr', icon: '🌀', name: 'Held von Wortland', how: 'Den Wirrwarr besiegt.' },
  { id: 'perfekt', icon: '⭐', name: 'Fehlerfrei', how: 'Eine Runde mit 8 von 8 richtig.' },
  { id: 'stufe3', icon: '🌳', name: 'Grosser Baum', how: 'In einem Ort Stufe 3 erreicht.' },
  { id: 'sterne3', icon: '🌟', name: 'Drei Sterne', how: 'In einem Ort drei Sterne geholt.' },
  { id: 'serie3', icon: '🔥', name: 'Feuer', how: '3 Tage nacheinander gespielt.' },
  { id: 'serie7', icon: '☄️', name: 'Feuerwerk', how: '7 Tage nacheinander gespielt.' },
  { id: 'blitz10', icon: '⚡', name: 'Blitzschnell', how: 'In der Sanduhr-Jagd 10 richtig.' },
  { id: 'tag5', icon: '📅', name: 'Treue Seele', how: '5 Tages-Quests geschafft.' },
  { id: 'fehler10', icon: '🔁', name: 'Fehlerjäger', how: '10 alte Fehler korrigiert.' },
  { id: 'meister', icon: '🎓', name: 'Grammatik-Profi', how: 'In allen zehn Orten drei Sterne.' }
];
const PRAISE = ['Super!', 'Richtig!', 'Toll gemacht!', 'Genau!', 'Stark!', 'Prima!', 'Sehr gut!', 'Klasse!'];
const COMFORT = ['Fast!', 'Nicht schlimm.', 'Das lernst du noch.', 'Fehler helfen beim Lernen.'];
const LUMI_TIPS = [
  'Lerne jedes Nomen mit Artikel: der Hund, die Katze, das Haus.',
  'Tippe auf 🔊, dann lese ich dir vor.',
  'Fehler kommen in die Fehlerkiste. Übe sie später nochmals!',
  'Jeden Tag ein bisschen ist besser als einmal ganz viel.',
  'Das Verb steht im Satz auf Platz 2.',
  'Wenn es zu schwer ist, wird es automatisch leichter. Keine Angst!',
  'Der Hinweis-Knopf 💡 hilft dir. Du bekommst dann etwas weniger Punkte.',
  'Speichere deinen Spielstand, wenn du an einem anderen Gerät weiterspielen willst.'
];

/* ---------- Zustand ---------- */
function blank() {
  return { v: 1, name: '', start: 1, xp: 0, streak: 0, lastDay: null, realms: {}, boss: {}, daily: { day: -1 }, dailyCount: 0, blitzBest: 0,
    badges: {}, fixed: 0, perfect: 0, sound: true, autoRead: false, allOpen: false, seenStart: false, created: Date.now() };
}
let S = blank();
let memoryOnly = false;
function load() {
  try { const raw = localStorage.getItem(KEY); if (raw) S = Object.assign(blank(), JSON.parse(raw)); } catch (e) { memoryOnly = true; }
}
function save() { try { localStorage.setItem(KEY, JSON.stringify(S)); } catch (e) { memoryOnly = true; } }
function rs(id) {
  if (!S.realms[id]) S.realms[id] = { s: [0, 1, 1.8, 2.6][S.start] || 1, n: 0, ok: 0, rounds: 0, stars: 0, best: 0, err: [], intro: false, outro: false };
  return S.realms[id];
}
const lvlOf = s => Math.max(1, Math.min(3, Math.floor(s)));
const dayIdx = () => { const d = new Date(); return Math.floor((Date.UTC(d.getFullYear(), d.getMonth(), d.getDate())) / 864e5); };
const crystals = () => REALMS.filter(r => rs(r.id).stars >= 1).length;
const rankOf = xp => { let i = 0; RANKS.forEach((r, k) => { if (xp >= r[2]) i = k; }); return i; };
const esc = s => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const strip = s => String(s).replace(/<table[\s\S]*?<\/table>/g, ' ').replace(/<br\s*\/?>/g, ' ').replace(/<[^>]+>/g, '').replace(/\s+/g, ' ').trim();
const stars = n => '★'.repeat(n) + '☆'.repeat(3 - n);

function realmOpen(i) {
  if (S.allOpen || i === 0) return true;
  if (rs(REALMS[i - 1].id).stars < 1) return false;
  if (i === 5 && !(S.boss.dieb && S.boss.dieb.won)) return false;
  return true;
}
function bossOpen(b) { return S.allOpen || b.realms.every(i => rs(REALMS[i].id).stars >= 1); }
function bossRec(id) { return S.boss[id] || (S.boss[id] = { won: false, best: 0, tries: 0 }); }

function touchStreak() {
  const d = dayIdx();
  if (S.lastDay === d) return;
  S.streak = S.lastDay === d - 1 ? S.streak + 1 : 1;
  S.lastDay = d;
}
const streakNow = () => (S.lastDay === dayIdx() || S.lastDay === dayIdx() - 1) ? S.streak : 0;

function award(id) { if (!S.badges[id]) { S.badges[id] = Date.now(); ui.newBadges.push(id); } }
function checkBadges() {
  const c = crystals();
  if (Object.values(S.realms).some(r => r.rounds > 0)) award('erste');
  if (c >= 1) award('k1'); if (c >= 5) award('k5'); if (c >= 10) award('k10');
  if (S.boss.dieb && S.boss.dieb.won) award('dieb');
  if (S.boss.wirrwarr && S.boss.wirrwarr.won) award('wirrwarr');
  if (S.perfect > 0) award('perfekt');
  if (Object.values(S.realms).some(r => r.s >= 3)) award('stufe3');
  if (Object.values(S.realms).some(r => r.stars >= 3)) award('sterne3');
  if (S.streak >= 3) award('serie3'); if (S.streak >= 7) award('serie7');
  if (S.blitzBest >= 10) award('blitz10');
  if (S.dailyCount >= 5) award('tag5');
  if (S.fixed >= 10) award('fehler10');
  if (REALMS.every(r => rs(r.id).stars >= 3)) award('meister');
}

/* ---------- Ton und Vorlesen ---------- */
let AC = null;
function beep(ok) {
  if (!S.sound) return;
  try {
    AC = AC || new (window.AudioContext || window.webkitAudioContext)();
    const notes = ok ? [660, 880] : [300, 220];
    notes.forEach((f, i) => {
      const o = AC.createOscillator(), g = AC.createGain(), t = AC.currentTime + i * 0.11;
      o.type = ok ? 'triangle' : 'sine'; o.frequency.value = f;
      g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(0.18, t + 0.02); g.gain.exponentialRampToValueAtTime(0.0001, t + 0.16);
      o.connect(g).connect(AC.destination); o.start(t); o.stop(t + 0.18);
    });
  } catch (e) { /* ohne Ton weiter */ }
}
let VOICE = null;
function pickVoice() {
  if (!window.speechSynthesis) return;
  const vs = speechSynthesis.getVoices().filter(v => /^de/i.test(v.lang));
  VOICE = vs.find(v => /de-CH/i.test(v.lang)) || vs.find(v => /de-DE/i.test(v.lang) && /google|natural|premium|enhanced/i.test(v.name)) || vs.find(v => /de-DE/i.test(v.lang)) || vs[0] || null;
}
if (window.speechSynthesis) { pickVoice(); speechSynthesis.onvoiceschanged = pickVoice; }
const canSpeak = () => !!window.speechSynthesis;
function speak(html) {
  if (!canSpeak()) return;
  const t = strip(html).replace(/_{3}/g, ' … ').replace(/[\u{1F000}-\u{1FAFF}\u{2600}-\u{27BF}\u{2B00}-\u{2BFF}\u{FE0F}\u{200D}]/gu, '').replace(/[«»]/g, '').replace(/→/g, ', ').replace(/\s+/g, ' ').trim();
  if (!t) return;
  speechSynthesis.cancel();
  const u = new SpeechSynthesisUtterance(t);
  u.lang = VOICE ? VOICE.lang : 'de-DE'; if (VOICE) u.voice = VOICE; u.rate = 0.88;
  speechSynthesis.speak(u);
}
const sayBtn = (key, label) => canSpeak() ? `<button class="say" data-act="say" data-key="${key}" aria-label="${label || 'Vorlesen'}" title="Vorlesen">🔊</button>` : '';

/* ---------- Oberfläche ---------- */
const ui = { view: 'map', realm: null, boss: null, newBadges: [], toast: '', saveMsg: '', loadInfo: null, confirmReset: false, renaming: false, sayMap: {} };
let R = null; // laufende Runde
const app = () => document.getElementById('app');

function go(view, extra) {
  Object.assign(ui, { view }, extra || {});
  if (window.speechSynthesis) speechSynthesis.cancel();
  render();
  window.scrollTo(0, 0);
}
function render() {
  ui.sayMap = {};
  let h;
  if (!S.name) h = viewStart();
  else switch (ui.view) {
    case 'realm': h = viewRealm(); break;
    case 'rule': h = viewRule(); break;
    case 'play': h = viewPlay(); break;
    case 'summary': h = viewSummary(); break;
    case 'boss': h = viewBoss(); break;
    case 'save': h = viewSave(); break;
    case 'stats': h = viewStats(); break;
    case 'badges': h = viewBadges(); break;
    case 'settings': h = viewSettings(); break;
    case 'story': h = viewStory(); break;
    default: h = viewMap();
  }
  app().innerHTML = h + (ui.toast ? `<div class="toast" role="status">${ui.toast}</div>` : '');
  ui.toast = '';
  afterRender();
}
function say(key, html) { ui.sayMap[key] = html; return sayBtn(key); }

function topbar(title, back) {
  const rk = RANKS[rankOf(S.xp)];
  return `<header class="bar">
    ${back ? `<button class="back" data-act="${back}" aria-label="Zurück">←</button>` : '<span class="logo" aria-hidden="true">🦉</span>'}
    <span class="bt">${title}</span>
    <span class="chips"><span class="chip" title="Rang">${rk[0]} <span class="hide-s">${rk[1]}</span></span><span class="chip mono" title="Erfahrungspunkte">${S.xp} XP</span><span class="chip" title="Serie: Tage nacheinander">🔥 ${streakNow()}</span><span class="chip" title="Wort-Kristalle">💎 ${crystals()}/10</span></span>
  </header>`;
}
function lumi(text, key) {
  return `<div class="lumi"><div class="owl" aria-hidden="true">🦉</div><div class="bubble"><p>${text}</p>${say(key || 'lumi', text)}</div></div>`;
}

/* ---------- Start ---------- */
function viewStart() {
  return `<main class="wrap start">
    <div class="hero"><div class="sigil" aria-hidden="true">🗺️</div><h1>Wortland</h1><p class="sub">Das Grammatik-Abenteuer für Deutsch als Zweitsprache</p></div>
    ${lumi(STORY_START, 'start')}
    <section class="card">
      <h2>1. Wie heisst du?</h2>
      <p class="small">Dein Vorname oder ein Fantasiename (2 bis 20 Zeichen).</p>
      <div class="namerow"><input id="nameIn" class="field" maxlength="20" autocomplete="off" placeholder="Name" value="${esc(ui.nameDraft || '')}"><button class="btn" data-act="randname" title="Zufälliger Name">🎲</button></div>
      <p class="err" id="nameErr" aria-live="polite"></p>
    </section>
    <section class="card">
      <h2>2. Wie gut kannst du schon Deutsch?</h2>
      <p class="small">Keine Sorge: Das Spiel passt sich an. Wenn es zu leicht oder zu schwer ist, ändert sich die Stufe von selbst.</p>
      <div class="lvlpick">${[1, 2, 3].map(i => `<button class="lvlcard${(ui.startLvl || 1) === i ? ' on' : ''}" data-act="startlvl" data-l="${i}"><span class="li">${LVL[i].icon}</span><b>${['', 'Ich lerne erst seit kurzem Deutsch.', 'Ich kann schon einiges.', 'Ich kann schon gut Deutsch.'][i]}</b><small>Start auf Stufe ${i}</small></button>`).join('')}</div>
    </section>
    <button class="btn primary big block" data-act="begin">Abenteuer beginnen ➜</button>
    <details class="card"><summary><b>Ich habe schon einen Spielstand</b></summary>${loadBox()}</details>
    ${footer()}
  </main>`;
}
const NICK_A = ['Mutige', 'Schnelle', 'Kluge', 'Fröhliche', 'Starke', 'Leise', 'Wilde', 'Helle'];
const NICK_B = ['Eule', 'Möwe', 'Katze', 'Libelle', 'Biene', 'Taube', 'Ente', 'Robbe'];

/* ---------- Karte ---------- */
const MAP_X = [50, 74, 58, 28, 42, 70, 50, 24, 40, 72, 56, 30];
function mapNodes() {
  const nodes = [];
  REALMS.forEach((r, i) => { nodes.push({ t: 'r', r, i }); if (i === 4) nodes.push({ t: 'b', b: BOSSES[0] }); });
  nodes.push({ t: 'b', b: BOSSES[1] });
  return nodes;
}
function viewMap() {
  const nodes = mapNodes(), H = nodes.length * 96 + 40;
  const pts = nodes.map((n, k) => [MAP_X[k], (k * 96 + 60) / H * 100]);
  let d = `M ${pts[0][0]} ${pts[0][1]}`;
  for (let i = 0; i < pts.length - 1; i++) {
    const p0 = pts[Math.max(0, i - 1)], p1 = pts[i], p2 = pts[i + 1], p3 = pts[Math.min(pts.length - 1, i + 2)];
    d += ` C ${(p1[0] + (p2[0] - p0[0]) / 6).toFixed(1)} ${(p1[1] + (p2[1] - p0[1]) / 6).toFixed(1)}, ${(p2[0] - (p3[0] - p1[0]) / 6).toFixed(1)} ${(p2[1] - (p3[1] - p1[1]) / 6).toFixed(1)}, ${p2[0]} ${p2[1].toFixed(1)}`;
  }
  let nextSet = false;
  const html = nodes.map((n, k) => {
    const st = `--x:${MAP_X[k]}%;--y:${pts[k][1]}%`, side = MAP_X[k] > 55 ? ' rt' : '';
    if (n.t === 'r') {
      const r = n.r, s = rs(r.id), open = realmOpen(n.i), lv = lvlOf(s.s);
      const isNext = open && s.stars < 1 && !nextSet; if (isNext) nextSet = true;
      return `<button class="node${side}${open ? '' : ' locked'}${s.stars ? ' done' : ''}${isNext ? ' next' : ''}" style="${st};--c:${r.color}" data-act="${open ? 'realm' : 'locked'}" data-id="${r.id}" aria-label="${esc(r.name)}${open ? '' : ' (noch gesperrt)'}">
        <span class="ni">${open ? r.icon : '🔒'}</span><span class="nl"><b>${n.i + 1}. ${r.name}</b><small>${esc(r.topic)}</small><small class="ns">${open ? `${stars(s.stars)} · ${LVL[lv].icon} Stufe ${lv}` : 'gesperrt'}</small></span></button>`;
    }
    const b = n.b, rec = bossRec(b.id), open = bossOpen(b);
    const isNext = open && !rec.won && !nextSet; if (isNext) nextSet = true;
    return `<button class="node boss${side}${open ? '' : ' locked'}${rec.won ? ' done' : ''}${isNext ? ' next' : ''}" style="${st};--c:${b.color}" data-act="${open ? 'boss' : 'locked'}" data-id="${b.id}" aria-label="Endgegner ${esc(b.name)}">
      <span class="ni">${open ? b.icon : '🔒'}</span><span class="nl"><b>${b.name}</b><small>${rec.won ? 'besiegt ✔' : 'Endgegner'}</small></span></button>`;
  }).join('');
  const nErr = REALMS.reduce((a, r) => a + rs(r.id).err.length, 0);
  const dDone = S.daily.day === dayIdx() && S.daily.done;
  const rk = rankOf(S.xp), cur = RANKS[rk], nxt = RANKS[rk + 1];
  const pct = nxt ? Math.round((S.xp - cur[2]) / (nxt[2] - cur[2]) * 100) : 100;
  const tip = !S.seenStart ? `Hallo ${esc(S.name)}! Tippe auf den leuchtenden Ort. Dort beginnt dein Abenteuer.` : pick(LUMI_TIPS);
  return `${topbar('Wortland')}
  <main class="wrap">
    ${lumi(tip, 'tip')}
    <div class="rankbar"><span>${cur[0]} <b>${cur[1]}</b></span><div class="xpbar"><div style="width:${pct}%"></div></div><span class="small mono">${nxt ? 'nächster Rang: ' + nxt[2] + ' XP' : 'höchster Rang!'}</span></div>
    <h2 class="h">🗺️ Die Karte von Wortland</h2>
    <div class="map" style="height:${H}px"><svg viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true"><path class="road2" d="${d}"/><path class="road" d="${d}"/></svg>${html}</div>
    <h2 class="h">⚔️ Challenges</h2>
    <div class="grid2">
      <button class="card act" data-act="daily" ${dDone ? 'disabled' : ''}><span class="ai">📅</span><b>Tages-Quest</b><small>${dDone ? 'Heute geschafft! Morgen gibt es eine neue.' : DAILY_Q + ' gemischte Aufgaben · +50 XP Bonus'}</small></button>
      <button class="card act" data-act="blitz"><span class="ai">⏳</span><b>Sanduhr-Jagd</b><small>${BLITZ_SEC} Sekunden · so viele richtig wie möglich · Rekord: ${S.blitzBest}</small></button>
      <button class="card act" data-act="errors" ${nErr ? '' : 'disabled'}><span class="ai">🔁</span><b>Fehlerkiste</b><small>${nErr ? nErr + ' Fehler warten. Besiege sie!' : 'Leer. Super!'}</small></button>
      <button class="card act" data-act="story"><span class="ai">📖</span><b>Geschichte</b><small>Was bisher geschah</small></button>
    </div>
    <h2 class="h">🎒 Mein Rucksack</h2>
    <div class="grid2">
      <button class="card act" data-act="badges"><span class="ai">🏅</span><b>Abzeichen</b><small>${Object.keys(S.badges).length} von ${BADGES.length}</small></button>
      <button class="card act" data-act="stats"><span class="ai">📊</span><b>Mein Lernstand</b><small>Was kann ich schon?</small></button>
      <button class="card act" data-act="save"><span class="ai">💾</span><b>Spielstand</b><small>Sichern oder laden</small></button>
      <button class="card act" data-act="settings"><span class="ai">⚙️</span><b>Einstellungen</b><small>Ton, Name, Lehrperson</small></button>
    </div>
    ${footer()}
  </main>`;
}
function footer() {
  return `<footer class="foot"><div class="logochip"><img src="logo.png" alt="Sekundarschule Halingen"></div>
    <p class="small">Wortland speichert deinen Fortschritt automatisch auf diesem Gerät.${memoryOnly ? ' <b>Achtung: Der Browser erlaubt kein Speichern. Sichere deinen Spielstand als Code!</b>' : ''}</p></footer>`;
}

/* ---------- Ort ---------- */
function curRealm() { return REALMS.find(r => r.id === ui.realm); }
function lvlMeter(s) {
  const l = lvlOf(s), frac = l >= 3 ? Math.min(1, (s - 3) / 0.99) : s - l;
  const need = l >= 3 ? 0 : Math.max(1, Math.ceil((l + 1 - s) / 0.25 - 1e-9));
  return `<div class="lvl"><div class="lsteps">${[1, 2, 3].map(i => `<span class="${i <= l ? 'on' : ''}${i === l ? ' cur' : ''}">${LVL[i].icon}<small>Stufe ${i}</small></span>`).join('')}</div>
    <div class="xpbar"><div style="width:${Math.round(frac * 100)}%"></div></div>
    <p class="small">${l < 3 ? `Noch etwa <b>${need} richtige</b> Antworten bis Stufe ${l + 1}.` : 'Höchste Stufe! Bleib dran und hol drei Sterne.'}</p></div>`;
}
function viewRealm() {
  const r = curRealm(), s = rs(r.id), i = REALMS.indexOf(r);
  const pct = s.n ? Math.round(s.ok / s.n * 100) : 0;
  return `${topbar(`${r.icon} ${r.name}`, 'map')}
  <main class="wrap" style="--c:${r.color}">
    <div class="realmhead"><span class="rico">${r.icon}</span><div><span class="tag">Ort ${i + 1} · ${esc(r.topic)}</span><h1>${r.name}</h1><p class="stars big" aria-label="${s.stars} von 3 Sternen">${stars(s.stars)}</p></div></div>
    <section class="card story"><p class="npc">${r.npc}</p><p>${r.intro}</p>${say('intro', r.intro)}</section>
    ${s.outro ? `<section class="card story won"><p>💎 ${r.outro}</p></section>` : ''}
    <section class="card"><h2>Deine Stufe</h2>${lvlMeter(s.s)}</section>
    <div class="actions">
      <button class="btn big" data-act="rule">📜 Regel lesen</button>
      <button class="btn primary big" data-act="play">⚔️ Abenteuer starten <small>${ROUND} Aufgaben</small></button>
      ${s.err.length ? `<button class="btn big" data-act="playerr">🔁 Fehler üben <small>${s.err.length}</small></button>` : ''}
    </div>
    <section class="card">
      <h2>So holst du Sterne</h2>
      <ul class="starlist"><li class="${s.stars >= 1 ? 'got' : ''}">★ Eine Runde mit mindestens 5 von 8 richtig → <b>Wort-Kristall</b></li>
      <li class="${s.stars >= 2 ? 'got' : ''}">★★ 6 von 8 richtig, mit Aufgaben auf Stufe 2</li>
      <li class="${s.stars >= 3 ? 'got' : ''}">★★★ 7 von 8 richtig, mit Aufgaben auf Stufe 3</li></ul>
      <p class="small">Runden: ${s.rounds} · Aufgaben: ${s.n} · richtig: ${pct} %</p>
    </section>
  </main>`;
}
function viewRule() {
  const r = curRealm();
  return `${topbar('📜 Regel', 'realm')}
  <main class="wrap" style="--c:${r.color}">
    <section class="card scroll"><div class="scrollhead"><span class="tag">${r.icon} ${r.name}</span><h1>${esc(r.topic)}</h1>${say('rule', r.rule)}</div><div class="rule">${r.rule}</div></section>
    <button class="btn primary big block" data-act="play">⚔️ Jetzt üben</button>
  </main>`;
}
function viewStory() {
  const parts = [`<p>${STORY_START}</p>`];
  REALMS.forEach((r, i) => {
    const s = rs(r.id);
    if (s.intro || s.rounds) parts.push(`<h3>${r.icon} ${r.name}</h3><p>${r.intro}</p>`);
    if (s.outro) parts.push(`<p>💎 ${r.outro}</p>`);
    BOSSES.forEach(b => { if (b.after === i + 1 && bossRec(b.id).tries) parts.push(`<h3>${b.icon} ${b.name}</h3><p>${b.intro}</p>${bossRec(b.id).won ? `<p>🏆 ${b.win}</p>` : ''}`); });
  });
  const txt = parts.join('');
  return `${topbar('📖 Geschichte', 'map')}<main class="wrap"><section class="card scroll">${say('story', txt)}${txt}<p class="small"><i>Fortsetzung folgt … Spiel weiter, dann erfährst du mehr.</i></p></section></main>`;
}

/* ---------- Runden ---------- */
function sig(q) { return strip(q.q || '') + '|' + (q.lead || '') + '|' + (q.words ? q.words.join(' ') : '') + '|' + (q.ans || q.opts || []).slice(0, 1).join(''); }
function startRound(mode, id) {
  const now = mode;
  R = { mode: now, id, k: 0, ok: 0, log: [], recent: [], q: null, done: false, hearts: BOSS_HEARTS, xp: 0, maxL: 1, lvlMsg: '', startS: null };
  if (now === 'realm' || now === 'errrealm') {
    const s = rs(id); s.intro = true; R.startS = s.s; R.total = now === 'errrealm' ? Math.min(ROUND, s.err.length) : ROUND;
    R.errQueue = now === 'errrealm' ? shuffle(s.err).slice(0, R.total).map(q => ({ q, rid: id })) : shuffle(s.err).slice(0, 2).map(q => ({ q, rid: id }));
  } else if (now === 'boss') {
    const b = BOSSES.find(x => x.id === id); R.total = BOSS_Q; R.errQueue = [];
    const pool = shuffle(b.realms); R.plan = []; while (R.plan.length < BOSS_Q) R.plan = R.plan.concat(shuffle(pool)); R.plan = R.plan.slice(0, BOSS_Q);
    bossRec(id).tries++;
  } else if (now === 'daily') {
    R.total = DAILY_Q; R.errQueue = []; R.seed = dayIdx();
  } else if (now === 'blitz') {
    R.total = 999; R.errQueue = []; R.endAt = Date.now() + BLITZ_SEC * 1000;
  } else if (now === 'errors') {
    const all = []; REALMS.forEach(r => rs(r.id).err.forEach(q => all.push({ q, rid: r.id })));
    R.errQueue = shuffle(all).slice(0, ROUND); R.total = R.errQueue.length;
  }
  touchStreak();
  nextQ();
  go('play');
  if (now === 'blitz') blitzTick();
}
function openRealmIdx() { return REALMS.map((r, i) => i).filter(i => realmOpen(i)); }
function nextQ() {
  R.answered = false; R.picked = []; R.hint = false; R.fb = null; R.removed = [];
  let item = null, rid, q;
  const fromErr = R.mode === 'errrealm' || R.mode === 'errors' || (R.mode === 'realm' && R.errQueue.length && (R.k === 3 || R.k === 6));
  if (fromErr && R.errQueue.length) {
    item = R.errQueue.shift(); rid = item.rid; q = JSON.parse(JSON.stringify(item.q)); q.fromErr = true;
  } else {
    if (R.mode === 'realm') rid = R.id;
    else if (R.mode === 'boss') rid = REALMS[R.plan[R.k]].id;
    else { if (R.mode === 'daily') RNG = seeded('wortland-r-' + R.seed + '-' + R.k); rid = REALMS[pick(openRealmIdx())].id; RNG = Math.random; }
    const realm = REALMS.find(r => r.id === rid), L = lvlOf(rs(rid).s);
    let ql = L;
    if (R.mode === 'realm' && L > 1 && chance(0.25)) ql = L - 1;
    if (R.mode === 'daily') RNG = seeded('wortland-' + R.seed + '-' + R.k);
    for (let t = 0; t < 12; t++) {
      q = realm.make(ql);
      if (R.mode === 'blitz' && q.kind === 'order') continue;
      if (!R.recent.includes(sig(q))) break;
    }
    RNG = Math.random;
    q.l = ql;
  }
  q.rid = rid;
  R.recent.push(sig(q)); if (R.recent.length > 8) R.recent.shift();
  if (q.kind === 'mc') {
    q.show = q.fixed && q.order ? q.order.filter(o => q.opts.includes(o)) : shuffle(q.opts);
  }
  if (q.kind === 'order') {
    let sh; for (let t = 0; t < 10; t++) { sh = shuffle(q.words.map((w, i) => i)); if (sh.some((v, i) => v !== i)) break; }
    q.tiles = sh;
  }
  R.maxL = Math.max(R.maxL, q.l || 1);
  R.q = q;
}
function seeded(str) {
  let h = 1779033703 ^ str.length;
  for (let i = 0; i < str.length; i++) { h = Math.imul(h ^ str.charCodeAt(i), 3432918353); h = (h << 13) | (h >>> 19); }
  let a = h >>> 0;
  return function () { a |= 0; a = (a + 0x6D2B79F5) | 0; let t = Math.imul(a ^ (a >>> 15), 1 | a); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
}
function rightText(q) {
  if (q.kind === 'mc') return q.opts[0];
  if (q.kind === 'input') return q.ans[0];
  return q.words.join(' ') + (q.end || '');
}
const norm = s => String(s).trim().replace(/\s+/g, ' ').replace(/ß/g, 'ss').replace(/[.!?]+$/, '');
function checkInput(q, v) {
  const n = norm(v);
  if (!n) return null;
  if (q.ans.some(a => norm(a) === n)) return { ok: true };
  if (q.ans.some(a => norm(a).toLowerCase() === n.toLowerCase())) return { ok: true, note: 'Achte auf Gross- und Kleinschreibung.' };
  const um = n.replace(/ae/g, 'ä').replace(/oe/g, 'ö').replace(/ue/g, 'ü').replace(/Ae/g, 'Ä').replace(/Oe/g, 'Ö').replace(/Ue/g, 'Ü');
  if (q.ans.some(a => norm(a).toLowerCase() === um.toLowerCase())) return { ok: true, note: 'Schreib ä, ö und ü mit den Punkten.' };
  return { ok: false };
}
function answer(ok, given, note) {
  if (R.answered) return;
  R.answered = true;
  const q = R.q, s = rs(q.rid), Lbefore = lvlOf(s.s);
  s.n++; if (ok) s.ok++;
  // Stufe anpassen (nicht bei der Sanduhr-Jagd)
  if (R.mode !== 'blitz') {
    const L = Lbefore, low = (q.l || L) < L;
    if (ok) s.s += (low ? 0.1 : 0.25) * (R.hint ? 0.5 : 1);
    else s.s -= low ? 0.5 : 0.35;
    s.s = Math.max(1, Math.min(3.99, Math.round(s.s * 100) / 100));
  }
  const La = lvlOf(s.s);
  R.lvlMsg = La > Lbefore ? `${LVL[La].icon} <b>Stufe ${La}!</b> Die Aufgaben werden jetzt schwieriger.` : La < Lbefore ? `${LVL[La].icon} Stufe ${La}: Wir üben jetzt etwas leichter.` : '';
  // Fehlerkiste
  const sg = sig(q);
  const clean = Object.assign({}, q); ['show', 'tiles', 'fromErr', 'rid'].forEach(k => delete clean[k]);
  if (!ok) { if (!s.err.some(e => sig(e) === sg)) { s.err.push(clean); if (s.err.length > 20) s.err.shift(); } }
  else if (q.fromErr) { const i = s.err.findIndex(e => sig(e) === sg); if (i >= 0) { s.err.splice(i, 1); S.fixed++; } }
  // Punkte
  let xp = 0;
  if (ok) { xp = R.mode === 'blitz' ? 3 : 5 + 5 * (q.l || 1); if (R.hint) xp = Math.ceil(xp / 2); R.ok++; }
  R.xp += xp; S.xp += xp;
  if (R.mode === 'boss' && !ok) R.hearts--;
  R.log.push({ ok, rid: q.rid, q: strip(q.q || q.lead || ''), right: rightText(q), given });
  R.fb = { ok, note, praise: ok ? pick(PRAISE) : pick(COMFORT) };
  beep(ok);
  save();
  if (R.mode === 'blitz') { R.k++; nextQ(); R.flash = ok ? 'good' : 'bad'; render(); return; }
  render();
  const nb = document.querySelector('[data-act="next"]'); if (nb) nb.focus();
}
function proceed() {
  R.k++;
  const over = R.mode === 'boss' ? (R.hearts <= 0 || R.k >= R.total) : R.k >= R.total;
  if (over) return finish();
  nextQ();
  render();
  window.scrollTo(0, 0);
  if (S.autoRead) speakQ();
}
function speakQ() { const q = R.q; speak((q.lead || '') + '. ' + (q.kind === 'order' ? '' : (q.q || ''))); }

function finish() {
  R.done = true;
  const res = { mode: R.mode, id: R.id, ok: R.ok, total: R.k, xp: R.xp, log: R.log, newStars: 0, firstCrystal: false, bonus: 0 };
  if (R.mode === 'realm' || R.mode === 'errrealm') {
    const s = rs(R.id); s.rounds++;
    if (R.mode === 'realm') {
      let st = 0;
      if (R.ok >= 5) st = 1;
      if (R.ok >= 6 && R.maxL >= 2) st = 2;
      if (R.ok >= 7 && R.maxL >= 3) st = 3;
      if (st > s.stars) { res.newStars = st; if (s.stars < 1) { res.firstCrystal = true; s.outro = true; } s.stars = st; }
      s.best = Math.max(s.best, R.ok);
      if (R.ok === ROUND) { S.perfect++; res.bonus = 20; } else if (R.ok >= 7) res.bonus = 10;
    }
    res.startL = lvlOf(R.startS); res.endL = lvlOf(s.s);
  } else if (R.mode === 'boss') {
    const rec = bossRec(R.id); res.won = R.hearts > 0 && R.k >= R.total;
    rec.best = Math.max(rec.best, R.ok);
    if (res.won) { if (!rec.won) res.bonus = 100; rec.won = true; }
  } else if (R.mode === 'daily') {
    if (S.daily.day !== dayIdx()) { S.daily = { day: dayIdx(), done: true }; S.dailyCount++; res.bonus = 50; }
  } else if (R.mode === 'blitz') {
    res.record = R.ok > S.blitzBest; S.blitzBest = Math.max(S.blitzBest, R.ok);
  }
  S.xp += res.bonus; res.xp += res.bonus;
  ui.newBadges = [];
  checkBadges();
  res.badges = ui.newBadges.slice();
  save();
  ui.res = res;
  go('summary');
  if (res.firstCrystal) speak(REALMS.find(r => r.id === R.id).outro);
}

/* ---------- Sanduhr ---------- */
let blitzTimer = null;
function blitzTick() {
  clearInterval(blitzTimer);
  blitzTimer = setInterval(() => {
    if (!R || R.mode !== 'blitz' || ui.view !== 'play') { clearInterval(blitzTimer); return; }
    const left = Math.max(0, R.endAt - Date.now());
    const el = document.getElementById('timer'); if (el) { el.style.width = (left / (BLITZ_SEC * 1000) * 100) + '%'; }
    const tn = document.getElementById('tnum'); if (tn) tn.textContent = Math.ceil(left / 1000);
    if (left <= 0) { clearInterval(blitzTimer); finish(); }
  }, 200);
}

/* ---------- Spielansicht ---------- */
function viewPlay() {
  const q = R.q, realm = REALMS.find(r => r.id === q.rid);
  let head = '', title = '';
  if (R.mode === 'realm' || R.mode === 'errrealm') title = `${realm.icon} ${realm.name}`;
  if (R.mode === 'boss') {
    const b = BOSSES.find(x => x.id === R.id);
    title = `${b.icon} ${b.name}`;
    const hp = R.total - R.ok;
    head = `<div class="bosshud"><span class="bossface${R.fb && R.fb.ok ? ' hit' : ''}">${b.icon}</span><div class="hp"><div style="width:${hp / R.total * 100}%"></div></div><span class="hearts" aria-label="${R.hearts} Herzen">${'❤️'.repeat(Math.max(0, R.hearts))}${'🖤'.repeat(BOSS_HEARTS - Math.max(0, R.hearts))}</span></div>`;
  }
  if (R.mode === 'daily') title = '📅 Tages-Quest';
  if (R.mode === 'errors') title = '🔁 Fehlerkiste';
  if (R.mode === 'blitz') {
    title = '⏳ Sanduhr-Jagd';
    const left = Math.max(0, R.endAt - Date.now());
    head = `<div class="blitzhud"><span class="tnum mono" id="tnum">${Math.ceil(left / 1000)}</span><div class="xpbar t"><div id="timer" style="width:${left / (BLITZ_SEC * 1000) * 100}%"></div></div><span class="chip mono">✔ ${R.ok}</span></div>`;
  }
  const prog = R.mode === 'blitz' ? '' : `<div class="dots" aria-label="Aufgabe ${R.k + 1} von ${R.total}">${Array.from({ length: R.total }, (_, i) => `<i class="${i < R.log.length ? (R.log[i].ok ? 'g' : 'b') : i === R.k ? 'c' : ''}"></i>`).join('')}</div>`;
  const lv = q.l ? `<span class="qlvl" title="Stufe der Aufgabe">${LVL[q.l].icon} Stufe ${q.l}</span>` : '';
  const realmTag = R.mode !== 'realm' && R.mode !== 'errrealm' ? `<span class="tag">${realm.icon} ${esc(realm.topic)}</span>` : '';
  const lead = `<p class="lead">${q.lead || ''} ${say('q', (q.lead || '') + '. ' + (q.kind === 'order' ? '' : (q.q || '')))}</p>`;
  let body = '';
  const done = R.answered;
  if (q.kind === 'mc') {
    body = `<div class="opts${q.colors ? ' art' : ''}${q.show.some(o => o.length > 18) ? ' long' : ''}">${q.show.map((o, i) => {
      let cls = 'opt'; if (q.colors) cls += ' a-' + o;
      if (done) { if (o === q.opts[0]) cls += ' right'; else if (o === R.given) cls += ' wrong'; }
      if (R.removed.includes(o)) cls += ' gone';
      return `<button class="${cls}" data-act="mc" data-o="${esc(o)}" ${done || R.removed.includes(o) ? 'disabled' : ''}><span class="k">${i + 1}</span>${esc(o)}</button>`;
    }).join('')}</div>`;
  } else if (q.kind === 'input') {
    body = `<div class="inrow"><input id="ans" class="field big${done ? (R.fb.ok ? ' right' : ' wrong') : ''}" autocomplete="off" autocapitalize="off" spellcheck="false" ${done ? 'disabled' : ''} value="${esc(R.given || '')}" placeholder="${R.hint ? esc(q.ans[0].charAt(0)) + '…' : 'Antwort'}" aria-label="Antwort"><button class="btn primary" data-act="check" ${done ? 'disabled' : ''}>Prüfen</button></div>
      ${done ? '' : `<div class="umlaut">${['ä', 'ö', 'ü', 'Ä', 'Ö', 'Ü'].map(c => `<button class="key" data-act="uml" data-c="${c}">${c}</button>`).join('')}</div>`}`;
  } else {
    const placed = R.picked, rest = q.tiles.filter(i => !placed.includes(i));
    body = `<div class="line${done ? (R.fb.ok ? ' right' : ' wrong') : ''}" aria-label="Dein Satz">${placed.length ? placed.map(i => `<button class="tile in" data-act="untile" data-i="${i}" ${done ? 'disabled' : ''}>${esc(q.words[i])}</button>`).join('') : '<span class="ph">Tippe die Wörter in der richtigen Reihenfolge an.</span>'}<span class="end">${q.end || ''}</span></div>
      <div class="pool">${rest.map(i => `<button class="tile" data-act="tile" data-i="${i}" ${done ? 'disabled' : ''}>${esc(q.words[i])}</button>`).join('')}</div>
      ${done ? '' : `<button class="btn primary block" data-act="checkorder" ${placed.length === q.words.length ? '' : 'disabled'}>Prüfen</button>`}`;
  }
  let fb = '';
  if (done && R.mode !== 'blitz') {
    const f = R.fb;
    fb = `<section class="fb ${f.ok ? 'good' : 'bad'}" aria-live="polite">
      <p class="fbt">${f.ok ? '✔ ' + f.praise : '✘ ' + f.praise + ' Richtig ist: <b>' + esc(rightText(q)) + '</b>'}</p>
      ${f.note ? `<p class="small"><b>${f.note}</b></p>` : ''}
      <div class="x">${q.x || ''}</div>
      ${R.lvlMsg ? `<p class="lvlmsg">${R.lvlMsg}</p>` : ''}
      <button class="btn primary big block" data-act="next">${(R.mode === 'boss' ? (R.hearts <= 0 || R.k + 1 >= R.total) : R.k + 1 >= R.total) ? 'Fertig ➜' : 'Weiter ➜'}</button>
    </section>`;
  }
  const flash = R.flash ? `<div class="flash ${R.flash}"></div>` : ''; R.flash = null;
  return `${topbar(title, 'quit')}
  <main class="wrap play" style="--c:${realm.color}">
    ${head}${prog}
    <section class="card qcard">
      <div class="qtop">${realmTag}${lv}${q.fromErr ? '<span class="tag">🔁 aus der Fehlerkiste</span>' : ''}</div>
      ${lead}
      <div class="q">${q.q || ''}</div>
      ${body}
      ${!done && R.mode !== 'boss' && R.mode !== 'blitz' ? `<button class="hintbtn" data-act="hint" ${R.hint ? 'disabled' : ''}>💡 ${R.hint ? 'Hinweis benutzt' : 'Hinweis'}</button>` : ''}
    </section>
    ${fb}${flash}
  </main>`;
}

/* ---------- Auswertung ---------- */
function viewSummary() {
  const res = ui.res;
  const badges = res.badges.map(id => BADGES.find(b => b.id === id)).map(b => `<div class="newbadge">${b.icon} Neues Abzeichen: <b>${b.name}</b><small>${b.how}</small></div>`).join('');
  const wrong = res.log.filter(x => !x.ok);
  const review = wrong.length ? `<section class="card"><h2>Das üben wir noch</h2><ul class="review">${wrong.map(x => `<li><span>${esc(x.q)}</span><b>${esc(x.right)}</b></li>`).join('')}</ul><p class="small">Diese Aufgaben liegen jetzt in der Fehlerkiste 🔁.</p></section>` : '';
  let head = '', story = '', btns = '';
  if (res.mode === 'realm' || res.mode === 'errrealm') {
    const r = REALMS.find(x => x.id === res.id), s = rs(r.id);
    head = `<div class="sumhead"><span class="big">${res.ok >= 7 ? '🏆' : res.ok >= 5 ? '🎉' : '💪'}</span><h1>${res.ok} von ${res.total} richtig</h1><p class="stars big">${stars(s.stars)}</p></div>`;
    if (res.newStars) head += `<p class="center"><b>Neu: ${res.newStars} ${res.newStars === 1 ? 'Stern' : 'Sterne'}!</b></p>`;
    if (res.endL !== res.startL) head += `<p class="center lvlmsg">${res.endL > res.startL ? `Du bist aufgestiegen: ${LVL[res.endL].icon} <b>Stufe ${res.endL}</b>!` : `Jetzt ${LVL[res.endL].icon} Stufe ${res.endL}. So lernst du sicher weiter.`}</p>`;
    if (res.firstCrystal) story = `<section class="card story won crystal"><div class="gem">💎</div><p>${r.outro}</p>${say('outro', r.outro)}</section>`;
    else if (res.mode === 'realm' && s.stars < 1) story = lumi('Für den Wort-Kristall brauchst du 5 von 8 richtig. Lies vielleicht zuerst die Regel. Du schaffst das!', 'sum');
    const idx = REALMS.indexOf(r);
    const nextB = BOSSES.find(b => b.after === idx + 1);
    btns = `<button class="btn primary big block" data-act="again">Nochmals spielen</button>
      ${res.firstCrystal && nextB ? `<button class="btn big block boss" data-act="boss" data-id="${nextB.id}">${nextB.icon} Zum Endgegner!</button>` : ''}
      ${res.firstCrystal && !nextB && REALMS[idx + 1] ? `<button class="btn big block" data-act="realm" data-id="${REALMS[idx + 1].id}">Weiter: ${REALMS[idx + 1].icon} ${REALMS[idx + 1].name}</button>` : ''}
      <button class="btn block" data-act="realm" data-id="${r.id}">Zurück zum Ort</button>`;
  } else if (res.mode === 'boss') {
    const b = BOSSES.find(x => x.id === res.id);
    head = `<div class="sumhead"><span class="big">${res.won ? '🏆' : b.icon}</span><h1>${res.won ? 'Gewonnen!' : 'Diesmal nicht …'}</h1><p>${res.ok} von ${res.total} richtig</p></div>`;
    story = `<section class="card story ${res.won ? 'won' : ''}"><p>${res.won ? b.win : b.lose}</p>${say('boss', res.won ? b.win : b.lose)}</section>`;
    btns = `${res.won ? '' : `<button class="btn primary big block" data-act="bossgo" data-id="${b.id}">Nochmals kämpfen</button>`}<button class="btn big block${res.won ? ' primary' : ''}" data-act="map">Zur Karte</button>`;
    if (res.won && b.id === 'wirrwarr') head += '<div class="confetti" aria-hidden="true">🎊🎉✨🎊🎉✨</div>';
  } else if (res.mode === 'blitz') {
    head = `<div class="sumhead"><span class="big">⏳</span><h1>${res.ok} richtig in ${BLITZ_SEC} Sekunden</h1><p>${res.record ? '<b>Neuer Rekord!</b>' : 'Rekord: ' + S.blitzBest}</p></div>`;
    btns = `<button class="btn primary big block" data-act="blitz">Nochmals</button><button class="btn block" data-act="map">Zur Karte</button>`;
  } else {
    head = `<div class="sumhead"><span class="big">${res.mode === 'daily' ? '📅' : '🔁'}</span><h1>${res.ok} von ${res.total} richtig</h1></div>`;
    if (res.mode === 'errors') head += `<p class="center">${res.ok ? res.ok + ' Fehler besiegt!' : 'Die Fehler bleiben noch in der Kiste.'}</p>`;
    btns = `${res.mode === 'errors' && REALMS.some(r => rs(r.id).err.length) ? '<button class="btn primary big block" data-act="errors">Weiter Fehler jagen</button>' : ''}<button class="btn big block" data-act="map">Zur Karte</button>`;
  }
  return `${topbar('Auswertung', 'map')}
  <main class="wrap">
    ${head}
    <p class="center xpgain mono">+${res.xp} XP${res.bonus ? ` <small>(inkl. ${res.bonus} Bonus)</small>` : ''}</p>
    ${badges}${story}${review}${btns}
  </main>`;
}

/* ---------- Endgegner ---------- */
function viewBoss() {
  const b = BOSSES.find(x => x.id === ui.boss), rec = bossRec(b.id);
  return `${topbar(`${b.icon} Endgegner`, 'map')}
  <main class="wrap" style="--c:${b.color}">
    <div class="bossintro"><span class="bossbig">${b.icon}</span><h1>${b.name}</h1></div>
    <section class="card story"><p>${b.intro}</p>${say('bi', b.intro)}</section>
    <section class="card"><h2>Regeln</h2><ul><li>${BOSS_Q} Fragen aus allen Orten bis hier.</li><li>Du hast ${BOSS_HEARTS} Herzen ❤️. Bei jedem Fehler verlierst du eins.</li><li>Kein Hinweis-Knopf.</li><li>Die Fragen passen zu deiner Stufe in jedem Ort.</li></ul>
    <p class="small">${rec.tries ? `Versuche: ${rec.tries} · Bestes Ergebnis: ${rec.best} von ${BOSS_Q}${rec.won ? ' · besiegt ✔' : ''}` : 'Noch nie gekämpft.'}</p></section>
    <button class="btn primary big block" data-act="bossgo" data-id="${b.id}">⚔️ Kampf beginnen</button>
  </main>`;
}

/* ---------- Abzeichen, Lernstand, Einstellungen ---------- */
function viewBadges() {
  return `${topbar('🏅 Abzeichen', 'map')}<main class="wrap"><div class="badges">${BADGES.map(b => { const got = !!S.badges[b.id]; return `<div class="badge${got ? ' got' : ''}"><span class="bi">${got ? b.icon : '🔒'}</span><b>${b.name}</b><small>${b.how}</small></div>`; }).join('')}</div></main>`;
}
function statsText() {
  const lines = [`Wortland – Lernstand von ${S.name} (${new Date().toLocaleDateString('de-CH')})`, `XP: ${S.xp} · Kristalle: ${crystals()}/10 · Endgegner: ${BOSSES.filter(b => bossRec(b.id).won).map(b => b.name).join(', ') || 'noch keiner'}`, ''];
  REALMS.forEach((r, i) => { const s = rs(r.id); lines.push(`${i + 1}. ${r.topic}: Stufe ${lvlOf(s.s)} · ${s.n ? Math.round(s.ok / s.n * 100) : 0} % richtig (${s.n} Aufgaben) · ${s.stars} Sterne · ${s.err.length} offene Fehler`); });
  return lines.join('\n');
}
function viewStats() {
  const rows = REALMS.map((r, i) => {
    const s = rs(r.id), pct = s.n ? Math.round(s.ok / s.n * 100) : null, l = lvlOf(s.s);
    return `<tr><td>${r.icon} <b>${esc(r.topic)}</b></td><td>${s.n ? `${LVL[l].icon} ${l}` : '–'}</td><td class="mono">${pct === null ? '–' : pct + ' %'}</td><td class="mono">${stars(s.stars)}</td><td class="mono">${s.err.length || ''}</td></tr>`;
  }).join('');
  const strong = REALMS.filter(r => rs(r.id).n >= 8 && rs(r.id).ok / rs(r.id).n >= 0.8).map(r => r.topic);
  const weak = REALMS.filter(r => rs(r.id).n >= 6 && rs(r.id).ok / rs(r.id).n < 0.6).map(r => r.topic);
  return `${topbar('📊 Lernstand', 'map')}
  <main class="wrap">
    <section class="card"><h2>Was kann ich schon?</h2>
      <div class="tablewrap"><table class="stats"><thead><tr><th>Thema</th><th>Stufe</th><th>richtig</th><th>Sterne</th><th>Fehler</th></tr></thead><tbody>${rows}</tbody></table></div>
      ${strong.length ? `<p>💪 <b>Das kannst du gut:</b> ${strong.map(esc).join(', ')}</p>` : ''}
      ${weak.length ? `<p>🎯 <b>Das solltest du noch üben:</b> ${weak.map(esc).join(', ')}</p>` : ''}
      <p class="small">Stufe 1 = leicht (mit Auswahl), Stufe 2 = mittel, Stufe 3 = schwer (selber schreiben, längere Sätze).</p>
    </section>
    <section class="card"><h2>Für die Lehrperson</h2><p class="small">Kopiere den Lernstand und schicke ihn deiner Lehrerin oder deinem Lehrer.</p>
      <textarea class="field code" id="statsTxt" readonly rows="8">${esc(statsText())}</textarea>
      <button class="btn" data-act="copystats">📋 Kopieren</button></section>
  </main>`;
}
function viewSettings() {
  return `${topbar('⚙️ Einstellungen', 'map')}
  <main class="wrap">
    <section class="card"><h2>Ton</h2>
      <label class="sw"><input type="checkbox" data-set="sound" ${S.sound ? 'checked' : ''}> Töne bei richtig und falsch</label>
      <label class="sw"><input type="checkbox" data-set="autoRead" ${S.autoRead ? 'checked' : ''}> Aufgaben automatisch vorlesen</label>
      ${canSpeak() ? `<p class="small">Stimme: ${VOICE ? esc(VOICE.name) : 'Standard'} <button class="linkbtn" data-act="testvoice">Test</button></p>` : '<p class="small">Dieser Browser kann leider nicht vorlesen.</p>'}
    </section>
    <section class="card"><h2>Spielername</h2>
      ${ui.renaming ? `<div class="namerow"><input id="nameIn" class="field" maxlength="20" value="${esc(S.name)}"><button class="btn primary" data-act="rename">OK</button></div><p class="err" id="nameErr"></p>` : `<p><b>${esc(S.name)}</b> <button class="linkbtn" data-act="renameedit">ändern</button></p>`}
    </section>
    <section class="card"><h2>Für Lehrpersonen</h2>
      <label class="sw"><input type="checkbox" data-set="allOpen" ${S.allOpen ? 'checked' : ''}> Alle Orte und Endgegner öffnen (ohne Kristalle)</label>
      <p class="small">Nützlich, wenn die Klasse direkt ein bestimmtes Thema üben soll.</p>
    </section>
    <section class="card danger"><h2>Neu beginnen</h2>
      <p class="small">Löscht den ganzen Fortschritt auf diesem Gerät. Sichere vorher deinen Spielstand, wenn du ihn behalten willst.</p>
      ${ui.confirmReset ? '<p><b>Wirklich alles löschen?</b></p><button class="btn bad" data-act="resetyes">Ja, löschen</button> <button class="btn" data-act="resetno">Nein</button>' : '<button class="btn bad" data-act="reset">Spielstand löschen</button>'}
    </section>
  </main>`;
}

/* ---------- Spielstand sichern und laden ---------- */
const b64enc = u8 => { let s = ''; for (let i = 0; i < u8.length; i += 8192) s += String.fromCharCode.apply(null, u8.subarray(i, i + 8192)); return btoa(s); };
const b64dec = s => Uint8Array.from(atob(s), c => c.charCodeAt(0));
async function pipeBytes(bytes, stream) { return new Uint8Array(await new Response(new Blob([bytes]).stream().pipeThrough(stream)).arrayBuffer()); }
async function makeCode() {
  const raw = new TextEncoder().encode(JSON.stringify(S));
  if (typeof CompressionStream !== 'undefined') { try { return 'WORTLAND1:' + b64enc(await pipeBytes(raw, new CompressionStream('deflate-raw'))); } catch (e) { /* weiter ohne Kompression */ } }
  return 'WORTLAND0:' + b64enc(raw);
}
async function readCode(code) {
  const m = String(code || '').replace(/\s+/g, '').match(/WORTLAND([01]):([A-Za-z0-9+/=]+)/);
  if (!m) throw new Error('Das ist kein Wortland-Spielstand.');
  let bytes = b64dec(m[2]);
  if (m[1] === '1') { if (typeof DecompressionStream === 'undefined') throw new Error('Dieser Browser kann den Code nicht öffnen.'); bytes = await pipeBytes(bytes, new DecompressionStream('deflate-raw')); }
  const data = JSON.parse(new TextDecoder().decode(bytes));
  if (!data || typeof data !== 'object' || !data.realms) throw new Error('Der Spielstand ist beschädigt.');
  return data;
}
function loadBox() {
  const li = ui.loadInfo;
  if (li) {
    const c = Object.values(li.realms || {}).filter(r => r.stars >= 1).length;
    return `<div class="loadpreview"><p>Spielstand von <b>${esc(li.name || '?')}</b>: ${li.xp || 0} XP, ${c} Kristalle.</p>
      ${S.name ? '<p class="small"><b>Achtung:</b> Der Fortschritt auf diesem Gerät wird ersetzt.</p>' : ''}
      <button class="btn primary" data-act="loadyes">Laden</button> <button class="btn" data-act="loadno">Abbrechen</button></div>`;
  }
  return `<p class="small">Wähle die Datei mit deinem Spielstand oder füge den Code ein.</p>
    <input type="file" id="loadFile" accept=".txt,text/plain" class="filein">
    <textarea id="loadCode" class="field code" rows="3" placeholder="WORTLAND1:…"></textarea>
    <button class="btn" data-act="loadcode">Code prüfen</button><p class="err" id="loadErr" aria-live="polite">${esc(ui.loadErr || '')}</p>`;
}
function viewSave() {
  return `${topbar('💾 Spielstand', 'map')}
  <main class="wrap">
    <section class="card"><h2>Spielstand sichern</h2>
      <p class="small">Wortland speichert automatisch auf diesem Gerät. Willst du an einem anderen Gerät weiterspielen? Dann sichere deinen Spielstand als Datei oder als Code (zum Beispiel per Mail an dich selbst).</p>
      <button class="btn primary" data-act="savefile">⬇️ Als Datei speichern</button> <button class="btn" data-act="savecode">📋 Code anzeigen</button>
      ${ui.code ? `<textarea class="field code" id="codeOut" rows="4" readonly>${esc(ui.code)}</textarea><button class="btn" data-act="copycode">Kopieren</button>` : ''}
      <p class="ok" aria-live="polite">${esc(ui.saveMsg || '')}</p>
    </section>
    <section class="card"><h2>Spielstand laden</h2>${loadBox()}</section>
  </main>`;
}

/* ---------- Ereignisse ---------- */
function setName(v) {
  const n = String(v || '').replace(/\s+/g, ' ').trim();
  if (n.length < 2 || n.length > 20) return 'Der Name braucht 2 bis 20 Zeichen.';
  if (/[<>]/.test(n)) return 'Bitte keine Sonderzeichen wie < oder >.';
  S.name = n; return '';
}
function afterRender() {
  const ni = document.getElementById('nameIn');
  if (ni) ni.addEventListener('keydown', e => { if (e.key === 'Enter') { const b = document.querySelector('[data-act="begin"],[data-act="rename"]'); if (b) b.click(); } });
  const ans = document.getElementById('ans');
  if (ans && !ans.disabled) { ans.focus(); ans.addEventListener('keydown', e => { if (e.key === 'Enter') { e.preventDefault(); doCheck(); } }); }
  const lf = document.getElementById('loadFile');
  if (lf) lf.addEventListener('change', () => { const f = lf.files && lf.files[0]; if (f) f.text().then(t => tryLoad(t)); });
  document.querySelectorAll('[data-set]').forEach(el => el.addEventListener('change', () => { S[el.dataset.set] = el.checked; save(); render(); }));
}
async function tryLoad(code) {
  try { ui.loadInfo = await readCode(code); ui.loadErr = ''; } catch (e) { ui.loadInfo = null; ui.loadErr = e.message || 'Der Code ist ungültig.'; }
  render();
}
function doCheck() {
  if (!R || R.answered) return;
  const el = document.getElementById('ans'); const v = el ? el.value : '';
  const r = checkInput(R.q, v);
  if (!r) { el && el.focus(); return; }
  R.given = v; answer(r.ok, v, r.note);
}
function quitRound() {
  if (R && R.mode === 'blitz') clearInterval(blitzTimer);
  const back = R && (R.mode === 'realm' || R.mode === 'errrealm') ? 'realm' : 'map';
  R = null; go(back);
}
document.addEventListener('click', e => {
  const b = e.target.closest('[data-act]'); if (!b || b.disabled) return;
  const a = b.dataset.act, id = b.dataset.id;
  switch (a) {
    case 'say': speak(ui.sayMap[b.dataset.key] || ''); break;
    case 'randname': { const v = pick(NICK_A) + ' ' + pick(NICK_B); ui.nameDraft = v; document.getElementById('nameIn').value = v; break; }
    case 'startlvl': ui.nameDraft = (document.getElementById('nameIn') || {}).value || ''; ui.startLvl = +b.dataset.l; render(); break;
    case 'begin': {
      const err = setName(document.getElementById('nameIn').value);
      if (err) { document.getElementById('nameErr').textContent = err; return; }
      S.start = ui.startLvl || 1; S.created = Date.now(); save(); go('map'); speak(`Hallo ${S.name}! Tippe auf den leuchtenden Ort. Dort beginnt dein Abenteuer.`); break;
    }
    case 'map': R = null; S.seenStart = true; save(); go('map'); break;
    case 'locked': ui.toast = '🔒 Dieser Ort ist noch gesperrt. Hol zuerst den Kristall im Ort davor.'; render(); break;
    case 'realm': R = null; S.seenStart = true; save(); go('realm', { realm: id }); break;
    case 'rule': go('rule'); break;
    case 'play': startRound('realm', ui.realm); break;
    case 'playerr': startRound('errrealm', ui.realm); break;
    case 'again': startRound(ui.res.mode === 'errrealm' && rs(ui.res.id).err.length ? 'errrealm' : 'realm', ui.res.id); break;
    case 'boss': go('boss', { boss: id }); break;
    case 'bossgo': startRound('boss', id); break;
    case 'daily': startRound('daily'); break;
    case 'blitz': startRound('blitz'); break;
    case 'errors': startRound('errors'); break;
    case 'story': go('story'); break;
    case 'badges': go('badges'); break;
    case 'stats': go('stats'); break;
    case 'save': go('save', { code: '', saveMsg: '', loadInfo: null, loadErr: '' }); break;
    case 'settings': go('settings', { renaming: false, confirmReset: false }); break;
    case 'quit': quitRound(); break;
    case 'mc': if (R && !R.answered) { R.given = b.dataset.o; answer(b.dataset.o === R.q.opts[0], b.dataset.o); } break;
    case 'check': doCheck(); break;
    case 'uml': { const el = document.getElementById('ans'); if (el) { const p = el.selectionStart || el.value.length; el.value = el.value.slice(0, p) + b.dataset.c + el.value.slice(el.selectionEnd || p); el.focus(); el.selectionStart = el.selectionEnd = p + 1; } break; }
    case 'tile': R.picked.push(+b.dataset.i); render(); break;
    case 'untile': R.picked = R.picked.filter(i => i !== +b.dataset.i); render(); break;
    case 'checkorder': {
      const q = R.q, given = R.picked.map(i => q.words[i]).join(' ');
      const ok = given === q.words.join(' ') || (q.alts || []).some(al => al.join(' ') === given);
      answer(ok, given + (q.end || ''));
      break;
    }
    case 'hint': {
      const q = R.q, realm = REALMS.find(r => r.id === q.rid);
      if (q.kind === 'mc') {
        const wrong = q.show.filter(o => o !== q.opts[0]);
        if (wrong.length < 2) { ui.toast = '💡 ' + (realm.tip || 'Lies die Regel nochmals.'); R.hint = true; render(); break; }
        R.removed = shuffle(wrong).slice(0, wrong.length - 1);
      }
      R.hint = true;
      if (q.kind === 'order') { R.picked = [0].concat(R.picked.filter(i => i !== 0)); }
      ui.toast = q.kind === 'input' ? `💡 Das Wort beginnt mit «${esc(q.ans[0].charAt(0))}».` : q.kind === 'order' ? '💡 Das erste Wort steht schon richtig.' : '💡 Nur noch zwei Antworten sind übrig.';
      render(); break;
    }
    case 'next': proceed(); break;
    case 'savefile': makeCode().then(code => {
      const d = new Date(), nm = S.name.replace(/[^A-Za-z0-9ÄÖÜäöü_-]+/g, '-');
      const blob = new Blob([`Wortland – Spielstand von ${S.name}\nGespeichert am ${d.toLocaleString('de-CH')}\nZum Laden: Wortland öffnen → Spielstand → Datei wählen.\n\n${code}\n`], { type: 'text/plain' });
      const u = URL.createObjectURL(blob), aEl = document.createElement('a');
      aEl.href = u; aEl.download = `wortland-${nm}-${d.toISOString().slice(0, 10)}.txt`; document.body.appendChild(aEl); aEl.click(); aEl.remove();
      setTimeout(() => URL.revokeObjectURL(u), 2000);
      ui.saveMsg = 'Datei gespeichert. Schau in deinem Download-Ordner nach.'; render();
    }); break;
    case 'savecode': makeCode().then(c => { ui.code = c; render(); }); break;
    case 'copycode': copy(ui.code, 'Code kopiert!'); break;
    case 'copystats': copy(statsText(), 'Lernstand kopiert!'); break;
    case 'loadcode': tryLoad(document.getElementById('loadCode').value); break;
    case 'loadyes': S = Object.assign(blank(), ui.loadInfo); ui.loadInfo = null; save(); ui.toast = '✔ Spielstand geladen. Willkommen zurück, ' + esc(S.name) + '!'; go('map'); break;
    case 'loadno': ui.loadInfo = null; render(); break;
    case 'testvoice': speak('Hallo! Ich bin Lumi, die Eule. Ich lese dir vor.'); break;
    case 'renameedit': ui.renaming = true; render(); break;
    case 'rename': { const old = S.name, err = setName(document.getElementById('nameIn').value); if (err) { S.name = old; document.getElementById('nameErr').textContent = err; return; } ui.renaming = false; save(); render(); break; }
    case 'reset': ui.confirmReset = true; render(); break;
    case 'resetno': ui.confirmReset = false; render(); break;
    case 'resetyes': S = blank(); save(); ui.confirmReset = false; go('map'); break;
  }
});
function copy(text, msg) {
  const done = () => { ui.saveMsg = msg; ui.toast = '📋 ' + msg; render(); };
  if (navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(text).then(done, () => { selectAll(); });
  else selectAll();
  function selectAll() { const t = document.querySelector('textarea.code'); if (t) { t.select(); document.execCommand('copy'); done(); } }
}
document.addEventListener('keydown', e => {
  if (ui.view !== 'play' || !R) return;
  if (e.target && e.target.tagName === 'INPUT') return;
  if (R.answered && e.key === 'Enter') { e.preventDefault(); proceed(); return; }
  if (!R.answered && R.q.kind === 'mc' && /^[1-4]$/.test(e.key)) { const o = R.q.show[+e.key - 1]; if (o && !R.removed.includes(o)) { R.given = o; answer(o === R.q.opts[0], o); } }
});

load();
render();
