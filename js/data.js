/* =====================================================================
   Wortland – Inhalte
   Hier stehen Wörter, Story und Aufgaben-Generatoren der zehn Orte.
   Jeder Ort hat make(stufe): stufe 1 = leicht, 2 = mittel, 3 = schwer.
   Eine Aufgabe ist ein Objekt:
     { kind: 'mc',    q, opts: [richtig, falsch, …], fixed?, colors?, x }
     { kind: 'input', q, ans: [richtig, …], x, keys? }
     { kind: 'order', q, words: [Teile in richtiger Reihenfolge], alts?: [[…]], x }
   q und x dürfen HTML enthalten. «___» ist die Lücke.
   Schweizer Rechtschreibung: ss statt ß.
   ===================================================================== */
'use strict';

let RNG = Math.random; // wird für die Tages-Challenge durch einen Zufallsgenerator mit Startwert ersetzt
const pick = a => a[Math.floor(RNG() * a.length)];
const chance = p => RNG() < p;
const shuffle = a => { a = a.slice(); for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(RNG() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; };
const uniq = a => a.filter((v, i) => a.indexOf(v) === i);
const cap = s => s.charAt(0).toUpperCase() + s.slice(1);
const art = a => `<b class="a-${a}">${a}</b>`;
const opt3 = (right, pool) => [right].concat(shuffle(uniq(pool).filter(x => x !== right)).slice(0, 2));
const opt4 = (right, pool) => [right].concat(shuffle(uniq(pool).filter(x => x !== right)).slice(0, 3));

/* ---------- Wörter ---------- */
// [Artikel, Singular, Plural (null = kein Plural üben), Emoji (leer = keins)]
const NOUNS = [
  ['der', 'Hund', 'Hunde', '🐕'], ['der', 'Apfel', 'Äpfel', '🍎'], ['der', 'Ball', 'Bälle', '⚽'], ['der', 'Tisch', 'Tische', ''],
  ['der', 'Stuhl', 'Stühle', '🪑'], ['der', 'Baum', 'Bäume', '🌳'], ['der', 'Vogel', 'Vögel', '🐦'], ['der', 'Fisch', 'Fische', '🐟'],
  ['der', 'Bus', 'Busse', '🚌'], ['der', 'Zug', 'Züge', '🚆'], ['der', 'Schuh', 'Schuhe', '👟'], ['der', 'Mann', 'Männer', '👨'],
  ['der', 'Lehrer', 'Lehrer', '👨‍🏫'], ['der', 'Bruder', 'Brüder', ''], ['der', 'Vater', 'Väter', ''], ['der', 'Stift', 'Stifte', '✏️'],
  ['der', 'Schlüssel', 'Schlüssel', '🔑'], ['der', 'Kuchen', 'Kuchen', '🍰'], ['der', 'Mond', 'Monde', '🌙'], ['der', 'Computer', 'Computer', '💻'],
  ['der', 'Löffel', 'Löffel', '🥄'], ['der', 'Teller', 'Teller', '🍽️'], ['der', 'Hut', 'Hüte', '🎩'], ['der', 'Freund', 'Freunde', ''],
  ['der', 'Käse', null, '🧀'], ['der', 'Schrank', 'Schränke', ''], ['der', 'Hunger', null, ''],
  ['die', 'Katze', 'Katzen', '🐈'], ['die', 'Banane', 'Bananen', '🍌'], ['die', 'Blume', 'Blumen', '🌸'], ['die', 'Tür', 'Türen', '🚪'],
  ['die', 'Lampe', 'Lampen', '💡'], ['die', 'Schule', 'Schulen', '🏫'], ['die', 'Frau', 'Frauen', '👩'], ['die', 'Mutter', 'Mütter', ''],
  ['die', 'Schwester', 'Schwestern', ''], ['die', 'Tasche', 'Taschen', '👜'], ['die', 'Uhr', 'Uhren', '⏰'], ['die', 'Hand', 'Hände', '✋'],
  ['die', 'Maus', 'Mäuse', '🐭'], ['die', 'Sonne', null, '☀️'], ['die', 'Milch', null, '🥛'], ['die', 'Brille', 'Brillen', '👓'],
  ['die', 'Jacke', 'Jacken', '🧥'], ['die', 'Gabel', 'Gabeln', '🍴'], ['die', 'Kuh', 'Kühe', '🐄'], ['die', 'Lehrerin', 'Lehrerinnen', '👩‍🏫'],
  ['die', 'Zeitung', 'Zeitungen', '📰'], ['die', 'Tomate', 'Tomaten', '🍅'], ['die', 'Birne', 'Birnen', '🍐'], ['die', 'Stadt', 'Städte', '🏙️'],
  ['die', 'Zeit', null, ''], ['die', 'Pizza', null, '🍕'],
  ['das', 'Haus', 'Häuser', '🏠'], ['das', 'Buch', 'Bücher', '📖'], ['das', 'Auto', 'Autos', '🚗'], ['das', 'Kind', 'Kinder', '🧒'],
  ['das', 'Brot', 'Brote', '🍞'], ['das', 'Ei', 'Eier', '🥚'], ['das', 'Bett', 'Betten', '🛏️'], ['das', 'Fenster', 'Fenster', '🪟'],
  ['das', 'Handy', 'Handys', '📱'], ['das', 'Pferd', 'Pferde', '🐎'], ['das', 'Schwein', 'Schweine', '🐖'], ['das', 'Velo', 'Velos', '🚲'],
  ['das', 'Heft', 'Hefte', '📒'], ['das', 'Messer', 'Messer', '🔪'], ['das', 'Zimmer', 'Zimmer', ''], ['das', 'Bild', 'Bilder', '🖼️'],
  ['das', 'Schaf', 'Schafe', '🐑'], ['das', 'Herz', 'Herzen', '❤️'], ['das', 'Spiel', 'Spiele', '🎲'], ['das', 'Flugzeug', 'Flugzeuge', '✈️'],
  ['das', 'Mädchen', 'Mädchen', '👧'], ['das', 'Wasser', null, '💧'], ['das', 'Geschenk', 'Geschenke', '🎁'], ['das', 'Boot', 'Boote', '⛵'],
  ['das', 'Sofa', 'Sofas', '🛋️'], ['das', 'Brötchen', 'Brötchen', '🥐']
];
const N = {};
NOUNS.forEach(n => { N[n[1]] = { a: n[0], sg: n[1], pl: n[2], e: n[3] }; });
const withEmoji = NOUNS.filter(n => n[3]).map(n => N[n[1]]);
const countable = NOUNS.filter(n => n[2]).map(n => N[n[1]]);

function artTip(n) {
  if (/chen$/.test(n.sg)) return 'Wörter mit <b>-chen</b> am Ende sind immer <b>das</b>.';
  if (/(ung|heit|keit|in)$/.test(n.sg) && n.a === 'die') return 'Wörter mit <b>-ung, -heit, -keit, -in</b> am Ende sind <b>die</b>.';
  if (['Mann', 'Vater', 'Bruder', 'Lehrer'].includes(n.sg)) return 'Männer haben meistens den Artikel <b>der</b>.';
  if (['Frau', 'Mutter', 'Schwester', 'Lehrerin'].includes(n.sg)) return 'Frauen haben meistens den Artikel <b>die</b>.';
  if (n.a === 'die' && /e$/.test(n.sg)) return 'Viele Nomen mit <b>-e</b> am Ende sind <b>die</b>.';
  return 'Hier hilft keine Regel. Lerne das Nomen immer zusammen mit dem Artikel.';
}
const indef = a => a === 'die' ? 'eine' : 'ein';
const pron = a => a === 'der' ? 'er' : a === 'die' ? 'sie' : 'es';

/* ---------- Personen ---------- */
const NAMES1 = ['Mia', 'Ali', 'Lea', 'Noah', 'Elif', 'Luca', 'Amina', 'Jonas', 'Sara', 'Yusuf'];
const NAMES2 = ['Mia und Ali', 'Lea und Noah', 'Elif und Sara', 'Die Kinder', 'Meine Eltern'];
// Person: s = Subjekt, i = Index in der Formen-Tabelle (0 ich, 1 du, 2 er/sie/es, 3 wir, 4 ihr, 5 sie/Sie)
function person(set) {
  const all = {
    ich: () => ({ s: 'ich', i: 0 }), du: () => ({ s: 'du', i: 1 }), er: () => ({ s: pick(['er', pick(NAMES1), pick(NAMES1)]), i: 2 }),
    wir: () => ({ s: 'wir', i: 3 }), ihr: () => ({ s: 'ihr', i: 4 }), sie: () => ({ s: pick(NAMES2), i: 5 })
  };
  return all[pick(set)]();
}
const PERS_ALL = ['ich', 'du', 'er', 'wir', 'ihr', 'sie'];
const PERS_EASY = ['ich', 'du', 'er'];
const subj = (p, first) => first ? cap(p.s) : (/^[A-Z]/.test(p.s) && !/^(Die|Meine) /.test(p.s) ? p.s : p.s.charAt(0).toLowerCase() + p.s.slice(1));
const PNAME = ['ich', 'du', 'er/sie/es', 'wir', 'ihr', 'sie/Sie'];

/* ---------- Verben ---------- */
function regular(inf) {
  const st = inf.slice(0, -2);
  const e = /(t|d|chn|ffn|gn)$/.test(st) ? 'e' : '';
  const s = /(s|ss|z|tz|x)$/.test(st) ? '' : 's';
  return [st + 'e', st + e + s + 't', st + e + 't', inf, st + e + 't', inf];
}
const VREG = {
  spielen: ['Fussball', 'Gitarre', 'im Park'], machen: ['die Hausaufgaben', 'Sport', 'eine Pause'], wohnen: ['in Frauenfeld', 'in Weinfelden', 'in einem Haus'],
  lernen: ['Deutsch', 'Mathe', 'für die Prüfung'], kochen: ['Spaghetti', 'Reis', 'eine Suppe'], kaufen: ['Brot', 'Milch', 'eine Jacke'],
  trinken: ['Wasser', 'Tee', 'Milch'], singen: ['ein Lied', 'im Chor', 'laut'], tanzen: ['gern', 'auf dem Fest', 'im Zimmer'],
  arbeiten: ['im Garten', 'am Computer', 'viel'], hören: ['Musik', 'gut zu', 'ein Lied'], gehen: ['nach Hause', 'in die Schule', 'ins Kino'],
  kommen: ['aus Syrien', 'aus der Türkei', 'aus Portugal', 'aus Eritrea', 'aus der Ukraine', 'aus Afghanistan', 'aus Brasilien'],
  schwimmen: ['im See', 'gern', 'schnell'], schreiben: ['einen Brief', 'eine Nachricht', 'ins Heft'], malen: ['ein Bild', 'eine Blume', 'gern'],
  fragen: ['die Lehrerin', 'meinen Vater', 'viel'], suchen: ['den Schlüssel', 'das Handy', 'die Brille'], brauchen: ['einen Stift', 'Hilfe', 'mehr Zeit']
};
// «hören gut zu» ist trennbar – darum nicht in Satzbau-Aufgaben
const SEIN = ['bin', 'bist', 'ist', 'sind', 'seid', 'sind'];
const HABEN = ['habe', 'hast', 'hat', 'haben', 'habt', 'haben'];
const SEIN_C = ['müde', 'zu Hause', 'in der Schule', '12 Jahre alt', 'glücklich', 'krank', 'gross', 'hier'];
const HABEN_C = ['Hunger', 'Durst', 'einen Hund', 'Zeit', 'eine Schwester', 'Glück', 'Fieber'];
const VSTRONG = {
  fahren: [['fahre', 'fährst', 'fährt', 'fahren', 'fahrt', 'fahren'], ['mit dem Bus', 'nach Zürich', 'Velo']],
  essen: [['esse', 'isst', 'isst', 'essen', 'esst', 'essen'], ['einen Apfel', 'Pizza', 'Brot']],
  lesen: [['lese', 'liest', 'liest', 'lesen', 'lest', 'lesen'], ['ein Buch', 'die Zeitung', 'einen Comic']],
  sprechen: [['spreche', 'sprichst', 'spricht', 'sprechen', 'sprecht', 'sprechen'], ['Deutsch', 'Arabisch', 'Türkisch', 'Englisch', 'Tigrinya']],
  schlafen: [['schlafe', 'schläfst', 'schläft', 'schlafen', 'schlaft', 'schlafen'], ['lange', 'gut', 'im Zelt']],
  nehmen: [['nehme', 'nimmst', 'nimmt', 'nehmen', 'nehmt', 'nehmen'], ['den Bus', 'einen Stift', 'ein Stück Kuchen']],
  sehen: [['sehe', 'siehst', 'sieht', 'sehen', 'seht', 'sehen'], ['einen Film', 'den Mond', 'ein Reh']],
  geben: [['gebe', 'gibst', 'gibt', 'geben', 'gebt', 'geben'], ['der Lehrerin das Heft', 'dem Hund Wasser']],
  laufen: [['laufe', 'läufst', 'läuft', 'laufen', 'lauft', 'laufen'], ['schnell', 'nach Hause', 'zur Schule']],
  helfen: [['helfe', 'hilfst', 'hilft', 'helfen', 'helft', 'helfen'], ['meiner Mutter', 'dem Lehrer', 'im Garten']]
};
const STRONG_RULE = { fahren: 'a → ä', schlafen: 'a → ä', laufen: 'au → äu', essen: 'e → i', sprechen: 'e → i', nehmen: 'e → i', geben: 'e → i', helfen: 'e → i', lesen: 'e → ie', sehen: 'e → ie' };

function formTable(forms, mark) {
  return `<table class="ctab">${forms.map((f, i) => `<tr${i === mark ? ' class="hl"' : ''}><td>${PNAME[i]}</td><td><b>${f}</b></td></tr>`).join('')}</table>`;
}

const MODAL = {
  können: ['kann', 'kannst', 'kann', 'können', 'könnt', 'können'],
  müssen: ['muss', 'musst', 'muss', 'müssen', 'müsst', 'müssen'],
  wollen: ['will', 'willst', 'will', 'wollen', 'wollt', 'wollen'],
  möchten: ['möchte', 'möchtest', 'möchte', 'möchten', 'möchtet', 'möchten'],
  dürfen: ['darf', 'darfst', 'darf', 'dürfen', 'dürft', 'dürfen']
};
const ACTS = [
  { c: 'gut', v: 'schwimmen', m: ['können'] }, { c: 'Deutsch', v: 'lernen', m: ['müssen', 'wollen', 'möchten'] },
  { c: 'ein Eis', v: 'essen', m: ['wollen', 'möchten', 'dürfen'] }, { c: 'nach Hause', v: 'gehen', m: ['müssen', 'wollen', 'dürfen', 'möchten'] },
  { c: 'Fussball', v: 'spielen', m: ['können', 'wollen', 'möchten', 'dürfen'] }, { c: 'die Hausaufgaben', v: 'machen', m: ['müssen'] },
  { c: 'ins Kino', v: 'gehen', m: ['wollen', 'möchten', 'dürfen'] }, { c: 'Gitarre', v: 'spielen', m: ['können', 'wollen', 'möchten'] },
  { c: 'das Fenster', v: 'öffnen', m: ['können', 'dürfen'] }, { c: 'ein Velo', v: 'kaufen', m: ['wollen', 'möchten'] },
  { c: 'drei Sprachen', v: 'sprechen', m: ['können'] }, { c: 'früh', v: 'aufstehen', m: ['müssen'] }
];
const TIMES = ['Heute', 'Morgen', 'Am Montag', 'Am Abend', 'Am Wochenende', 'Jetzt', 'Am Nachmittag'];

const PART = {
  spielen: ['gespielt', 'h', 'Fussball'], machen: ['gemacht', 'h', 'die Hausaufgaben'], lernen: ['gelernt', 'h', 'Deutsch'], kochen: ['gekocht', 'h', 'Spaghetti'],
  kaufen: ['gekauft', 'h', 'Brot'], hören: ['gehört', 'h', 'Musik'], tanzen: ['getanzt', 'h', 'auf dem Fest'], arbeiten: ['gearbeitet', 'h', 'im Garten'],
  malen: ['gemalt', 'h', 'ein Bild'], essen: ['gegessen', 'h', 'Pizza'], trinken: ['getrunken', 'h', 'Tee'], lesen: ['gelesen', 'h', 'ein Buch'],
  schreiben: ['geschrieben', 'h', 'einen Brief'], sehen: ['gesehen', 'h', 'einen Film'], schlafen: ['geschlafen', 'h', 'lange'], singen: ['gesungen', 'h', 'ein Lied'],
  gehen: ['gegangen', 's', 'nach Hause'], fahren: ['gefahren', 's', 'nach Zürich'], kommen: ['gekommen', 's', 'zu spät'], schwimmen: ['geschwommen', 's', 'im See'],
  laufen: ['gelaufen', 's', 'zur Schule'], fliegen: ['geflogen', 's', 'nach Spanien']
};
const PAST_T = ['Gestern', 'Am Montag', 'Letzte Woche', 'Am Wochenende', 'Gestern Abend'];

/* ---------- Präpositionen ---------- */
const PLACES = [
  { n: 'Park', g: 'm', p: 'in' }, { n: 'Kino', g: 'n', p: 'in' }, { n: 'Schule', g: 'f', p: 'in' }, { n: 'Küche', g: 'f', p: 'in' },
  { n: 'Garten', g: 'm', p: 'in' }, { n: 'Zimmer', g: 'n', p: 'in' }, { n: 'Bibliothek', g: 'f', p: 'in' }, { n: 'Schwimmbad', g: 'n', p: 'in' },
  { n: 'Supermarkt', g: 'm', p: 'in' }, { n: 'Bahnhof', g: 'm', p: 'an' }, { n: 'See', g: 'm', p: 'an' }, { n: 'Bushaltestelle', g: 'f', p: 'an' }
];
const placeForm = pl => pl.p === 'in' ? (pl.g === 'f' ? 'in der' : 'im') : (pl.g === 'f' ? 'an der' : 'am');
const FURN = [
  { n: 'Tisch', g: 'm', p: ['auf', 'unter', 'neben'] }, { n: 'Bett', g: 'n', p: ['auf', 'unter', 'neben'] }, { n: 'Stuhl', g: 'm', p: ['auf', 'unter', 'neben'] },
  { n: 'Sofa', g: 'n', p: ['auf', 'hinter', 'neben'] }, { n: 'Tür', g: 'f', p: ['neben', 'vor', 'hinter'] }, { n: 'Lampe', g: 'f', p: ['neben', 'unter'] },
  { n: 'Schrank', g: 'm', p: ['neben', 'auf', 'vor'] }
];
const THINGS = ['Die Katze', 'Der Ball', 'Das Buch', 'Die Tasche', 'Der Hund', 'Das Handy', 'Der Schlüssel', 'Die Maus'];
const PREP_CUE = { auf: '⬆️ oben drauf', unter: '⬇️ unten drunter', neben: '↔️ direkt daneben', hinter: '🔙 dahinter', vor: '🔜 davor', in: '📦 drin' };
const datArt = g => g === 'f' ? 'der' : 'dem';
const nomArt = g => g === 'm' ? 'der' : g === 'f' ? 'die' : 'das';

/* =====================================================================
   Die zehn Orte von Wortland
   ===================================================================== */
const REALMS = [
/* ---------------------------------------------------------------- 1 */
{ id: 'artikel', icon: '⚓', color: '#3b82c4', name: 'Hafen der drei Tore', topic: 'Artikel: der, die, das',
  npc: '🧑‍✈️ Kapitänin Ida',
  intro: 'Am Hafen gibt es drei Tore. Das blaue Tor ist für <b class="a-der">der</b>. Das rote Tor ist für <b class="a-die">die</b>. Das grüne Tor ist für <b class="a-das">das</b>. Der Wirrwarr hat die Schilder vertauscht. Jetzt finden die Schiffe das richtige Tor nicht. Hilf Kapitänin Ida!',
  outro: 'Alle Schiffe fahren durch das richtige Tor. Kapitänin Ida lacht und schenkt dir den <b>blauen Wort-Kristall</b>.',
  rule: `<p>Jedes Nomen hat einen <b>Artikel</b>: ${art('der')}, ${art('die')} oder ${art('das')}.</p>
    <div class="ex3"><span class="a-der">der Hund 🐕</span><span class="a-die">die Katze 🐈</span><span class="a-das">das Haus 🏠</span></div>
    <p><b>Lerne jedes Nomen mit Artikel!</b> Nicht «Hund», sondern «der Hund».</p>
    <p>Tipps:</p><ul><li>Wörter mit <b>-chen</b> sind immer <b>das</b>: das Mädchen.</li><li>Viele Wörter mit <b>-e</b> sind <b>die</b>: die Blume, die Tasche.</li><li>Wörter mit <b>-ung</b> und <b>-in</b> sind <b>die</b>: die Zeitung, die Lehrerin.</li></ul>
    <p><b>ein / eine:</b> ${art('der')} → ein · ${art('die')} → eine · ${art('das')} → ein</p>
    <p><b>er / sie / es:</b> ${art('der')} Ball → <b>er</b> · ${art('die')} Uhr → <b>sie</b> · ${art('das')} Buch → <b>es</b></p>`,
  make(l) {
    if (l === 1) {
      const n = pick(withEmoji);
      return { kind: 'mc', fixed: true, colors: true, q: `<div class="pic">${n.e}</div><p class="sent">___ ${n.sg}</p>`, lead: 'Welcher Artikel passt?',
        opts: [n.a].concat(['der', 'die', 'das'].filter(a => a !== n.a)), order: ['der', 'die', 'das'], x: `${art(n.a)} ${n.sg}. ${artTip(n)}` };
    }
    if (l === 2) {
      const n = pick(NOUNS.map(x => N[x[1]]).filter(x => !['Hunger', 'Zeit', 'Milch', 'Wasser', 'Käse', 'Sonne'].includes(x.sg)));
      if (chance(0.5)) return { kind: 'mc', fixed: true, q: `<p class="sent">Das ist ___ ${n.sg}. ${n.e}</p>`, lead: 'ein oder eine?',
        opts: [indef(n.a), indef(n.a) === 'ein' ? 'eine' : 'ein'], order: ['ein', 'eine'], x: `${art(n.a)} ${n.sg} → <b>${indef(n.a)}</b> ${n.sg}. Bei <b>die</b> heisst es <b>eine</b>, bei <b>der</b> und <b>das</b> heisst es <b>ein</b>.` };
      return { kind: 'mc', fixed: true, colors: true, q: `<p class="sent">___ ${n.sg}</p>`, lead: 'Welcher Artikel passt? Diesmal ohne Bild.',
        opts: [n.a].concat(['der', 'die', 'das'].filter(a => a !== n.a)), order: ['der', 'die', 'das'], x: `${art(n.a)} ${n.sg}. ${artTip(n)}` };
    }
    const r = RNG();
    if (r < 0.4) {
      const n = pick(withEmoji);
      return { kind: 'input', q: `<div class="pic">${n.e}</div><p class="sent">___ ${n.sg}</p>`, lead: 'Schreib den Artikel.', ans: [n.a], x: `${art(n.a)} ${n.sg}. ${artTip(n)}` };
    }
    if (r < 0.7) {
      const n = pick(countable.filter(x => x.e));
      return { kind: 'mc', fixed: true, q: `<p class="sent">Wo ist ${n.a} ${n.sg}? ${n.e}<br>___ ist hier.</p>`, lead: 'er, sie oder es?',
        opts: [cap(pron(n.a))].concat(['Er', 'Sie', 'Es'].filter(p => p !== cap(pron(n.a)))), order: ['Er', 'Sie', 'Es'], x: `${art(n.a)} ${n.sg} → <b>${pron(n.a)}</b>. der → er, die → sie, das → es.` };
    }
    const n = pick(countable);
    return { kind: 'input', q: `<p class="sent">Das ist ___ ${n.sg}. ${n.e}</p>`, lead: 'Schreib ein oder eine.', ans: [indef(n.a)], x: `${art(n.a)} ${n.sg} → <b>${indef(n.a)}</b> ${n.sg}.` };
  } },

/* ---------------------------------------------------------------- 2 */
{ id: 'plural', icon: '🧺', color: '#d9822b', name: 'Markt der Vielen', topic: 'Einzahl und Mehrzahl (Plural)',
  npc: '🧔 Händler Bruno',
  intro: 'Auf dem Markt verkauft Bruno Obst und viele andere Sachen. Aber der Wirrwarr hat die Mehrzahl gestohlen. Bruno ruft: «Drei Apfel! Zwei Buch!» Das ist falsch. Die Leute kaufen nichts mehr. Hilf Bruno!',
  outro: 'Bruno ruft jetzt richtig: «Drei Äpfel! Zwei Bücher!» Alle kaufen wieder ein. Er schenkt dir den <b>orangen Wort-Kristall</b>.',
  rule: `<p><b>Einzahl</b> (Singular): ein Ding. <b>Mehrzahl</b> (Plural): viele Dinge.</p>
    <p>Im Plural ist der Artikel <b>immer ${art('die')}</b>: der Hund → <b>die</b> Hunde.</p>
    <table class="ctab"><tr><td>-e</td><td>der Hund → die Hund<b>e</b></td></tr><tr><td>-n / -en</td><td>die Blume → die Blume<b>n</b></td></tr>
    <tr><td>-er</td><td>das Kind → die Kind<b>er</b></td></tr><tr><td>-s</td><td>das Auto → die Auto<b>s</b></td></tr>
    <tr><td>Umlaut</td><td>der Apfel → die <b>Ä</b>pfel, das Buch → die B<b>ü</b>ch<b>er</b></td></tr><tr><td>gleich</td><td>der Lehrer → die Lehrer</td></tr></table>
    <p><b>Lerne den Plural immer mit:</b> der Hund, die Hunde.</p>`,
  make(l) {
    const n = pick(countable);
    const dis = uniq([n.sg, n.sg + 's', /e$/.test(n.sg) ? n.sg + 'n' : n.sg + 'e', /e$/.test(n.sg) ? n.sg + 's' : n.sg + 'en', n.sg + 'er'])
      .filter(x => x !== n.pl && x !== n.pl + 'n' && x !== n.pl + 's');
    const ex = `ein${n.a === 'die' ? 'e' : ''} ${n.sg} → zwei <b>${n.pl}</b>. ${n.pl === n.sg ? 'Bei diesem Wort ist der Plural gleich wie die Einzahl.' : ''}`;
    if (l === 1) {
      const nn = pick(countable.filter(x => x.e));
      const d1 = uniq([nn.sg, nn.sg + 's', /e$/.test(nn.sg) ? nn.sg + 'n' : nn.sg + 'e', nn.sg + 'er']).filter(x => x !== nn.pl && x !== nn.pl + 'n' && x !== nn.pl + 's');
      return { kind: 'mc', q: `<div class="pic">${nn.e} ${nn.e} ${nn.e}</div><p class="sent">Das sind drei ___.</p>`, lead: 'Welches Wort passt?',
        opts: opt3(nn.pl, d1), x: `ein${nn.a === 'die' ? 'e' : ''} ${nn.sg} → drei <b>${nn.pl}</b>.` };
    }
    if (l === 2) {
      if (chance(0.4)) return { kind: 'mc', fixed: true, colors: true, q: `<p class="sent">Das ist ${n.a} ${n.sg}.<br>Das sind ___ ${n.pl}.</p>`, lead: 'Welcher Artikel passt im Plural?',
        opts: ['die', 'der', 'das'], order: ['der', 'die', 'das'], x: `Im Plural ist der Artikel immer <b>die</b>: die ${n.pl}.` };
      return { kind: 'mc', q: `<p class="sent">${n.a} ${n.sg} ${n.e}<br>→ zwei ___</p>`, lead: 'Wie heisst der Plural?', opts: opt4(n.pl, dis), x: ex };
    }
    return { kind: 'input', q: `<p class="sent">${n.a} ${n.sg} ${n.e}<br>→ zwei ___</p>`, lead: 'Schreib den Plural.', ans: [n.pl], x: ex };
  } },

/* ---------------------------------------------------------------- 3 */
{ id: 'verben', icon: '🏘️', color: '#3f9d5b', name: 'Dorf der Tu-Wörter', topic: 'Verben im Präsens',
  npc: '👩‍🍳 Bäckerin Lina',
  intro: 'Im Dorf arbeiten alle fleissig. Sie backen, kochen, singen und spielen. Aber die Verben passen nicht mehr zu den Personen. Der Bäcker sagt: «Ich backt Brot.» Die Kinder rufen: «Wir spielt!» Hilf dem Dorf!',
  outro: 'Jetzt sagt der Bäcker: «Ich backe Brot.» Die Kinder rufen: «Wir spielen!» Lina schenkt dir den <b>grünen Wort-Kristall</b>.',
  rule: `<p>Das Verb ändert seine <b>Endung</b>. Die Endung passt zur Person.</p>
    <table class="ctab"><tr><td>ich</td><td>spiel<b>e</b></td></tr><tr><td>du</td><td>spiel<b>st</b></td></tr><tr><td>er / sie / es</td><td>spiel<b>t</b></td></tr>
    <tr><td>wir</td><td>spiel<b>en</b></td></tr><tr><td>ihr</td><td>spiel<b>t</b></td></tr><tr><td>sie / Sie</td><td>spiel<b>en</b></td></tr></table>
    <p>Ein Name (Mia, Ali) ist wie <b>er / sie</b>: Mia spiel<b>t</b>. Zwei Namen (Mia und Ali) sind wie <b>sie</b>: Mia und Ali spiel<b>en</b>.</p>
    <p>Achtung: arbeiten → du arbeit<b>est</b>, er arbeit<b>et</b>. tanzen → du tanz<b>t</b>.</p>`,
  make(l) {
    const v = pick(Object.keys(VREG)), f = regular(v), c = pick(VREG[v]);
    const p = person(l === 1 ? PERS_EASY : PERS_ALL);
    const right = f[p.i];
    const x = `${cap(p.s)} <b>${right}</b> ${c}.` + formTable(f, p.i);
    if (l === 1) return { kind: 'mc', q: `<p class="sent">${cap(p.s)} ___ ${c}.</p><p class="inf">(${v})</p>`, lead: 'Welche Form passt?', opts: opt3(right, f.slice(0, 3)), x };
    if (l === 2) {
      if (chance(0.25)) {
        const i = pick([0, 1]);
        const pr = i === 0 ? 'Ich' : 'Du';
        return { kind: 'mc', fixed: true, q: `<p class="sent">___ ${f[i]} ${c}.</p>`, lead: 'Welches Wort passt?', opts: [pr].concat(['Ich', 'Du', 'Wir'].filter(z => z !== pr)), order: ['Ich', 'Du', 'Wir'],
          x: `<b>${pr}</b> ${f[i]} ${c}. Die Endung <b>-${i === 0 ? 'e' : 'st'}</b> gehört zu <b>${i === 0 ? 'ich' : 'du'}</b>.` + formTable(f, i) };
      }
      return { kind: 'mc', q: `<p class="sent">${cap(p.s)} ___ ${c}.</p><p class="inf">(${v})</p>`, lead: 'Welche Form passt?', opts: opt4(right, f), x };
    }
    return { kind: 'input', q: `<p class="sent">${cap(p.s)} ___ ${c}.</p><p class="inf">(${v})</p>`, lead: 'Schreib das Verb in der richtigen Form.', ans: [right], x };
  } },

/* ---------------------------------------------------------------- 4 */
{ id: 'stark', icon: '⛰️', color: '#8a6a4f', name: 'Felsen der Starken', topic: 'sein, haben und starke Verben',
  npc: '🧌 Riese Bodo',
  intro: 'Auf dem Felsen wohnt Riese Bodo. Er ist sehr stark. Seine Lieblingswörter sind «sein» und «haben». Er liebt auch starke Verben: Sie ändern ihren Vokal. Der Wirrwarr hat Bodo verwirrt. Er sagt: «Ich ist müde. Du esst Brot.» Hilf ihm!',
  outro: 'Bodo sagt: «Ich bin müde. Du isst Brot.» Dann schläft er zufrieden ein. Neben ihm liegt der <b>braune Wort-Kristall</b>.',
  rule: `<p><b>sein</b> und <b>haben</b> sind unregelmässig. Lerne sie auswendig!</p>
    <table class="ctab"><tr><th></th><th>sein</th><th>haben</th></tr><tr><td>ich</td><td>bin</td><td>habe</td></tr><tr><td>du</td><td>bist</td><td>hast</td></tr>
    <tr><td>er / sie / es</td><td>ist</td><td>hat</td></tr><tr><td>wir</td><td>sind</td><td>haben</td></tr><tr><td>ihr</td><td>seid</td><td>habt</td></tr><tr><td>sie / Sie</td><td>sind</td><td>haben</td></tr></table>
    <p><b>Starke Verben</b> ändern den Vokal, aber <b>nur bei du und er/sie/es</b>:</p>
    <ul><li>a → ä: fahren → du f<b>ä</b>hrst, er f<b>ä</b>hrt</li><li>e → i: essen → du <b>i</b>sst, er <b>i</b>sst</li><li>e → ie: lesen → du l<b>ie</b>st, er l<b>ie</b>st</li></ul>`,
  make(l) {
    const p = person(l === 1 ? PERS_EASY : PERS_ALL);
    const sh = () => {
      const isSein = chance(0.5), f = isSein ? SEIN : HABEN, c = pick(isSein ? SEIN_C : HABEN_C);
      return { f, c, v: isSein ? 'sein' : 'haben', x: `${cap(p.s)} <b>${f[p.i]}</b> ${c}.` + formTable(f, p.i) };
    };
    const st = () => {
      const v = pick(Object.keys(VSTRONG)), f = VSTRONG[v][0], c = pick(VSTRONG[v][1]), wrong = regular(v);
      return { f, c, v, wrong, x: `${cap(p.s)} <b>${f[p.i]}</b> ${c}. <br>${v}: ${STRONG_RULE[v]} bei du und er/sie/es.` + formTable(f, p.i) };
    };
    if (l === 1) { const a = sh(); return { kind: 'mc', q: `<p class="sent">${cap(p.s)} ___ ${a.c}.</p><p class="inf">(${a.v})</p>`, lead: 'Welche Form passt?', opts: opt3(a.f[p.i], a.f.slice(0, 3)), x: a.x }; }
    if (l === 2) {
      if (chance(0.3)) { const a = sh(); return { kind: 'mc', q: `<p class="sent">${cap(p.s)} ___ ${a.c}.</p><p class="inf">(${a.v})</p>`, lead: 'Welche Form passt?', opts: opt4(a.f[p.i], a.f), x: a.x }; }
      const p2 = person(['du', 'er', 'du', 'er', 'ich', 'wir']);
      Object.assign(p, p2);
      const a = st();
      return { kind: 'mc', q: `<p class="sent">${cap(p.s)} ___ ${a.c}.</p><p class="inf">(${a.v})</p>`, lead: 'Welche Form passt?', opts: opt4(a.f[p.i], [a.wrong[p.i]].concat(a.f)), x: a.x };
    }
    const a = chance(0.35) ? sh() : st();
    return { kind: 'input', q: `<p class="sent">${cap(p.s)} ___ ${a.c}.</p><p class="inf">(${a.v})</p>`, lead: 'Schreib das Verb in der richtigen Form.', ans: [a.f[p.i]], x: a.x };
  } },

/* ---------------------------------------------------------------- 5 */
{ id: 'satzbau', icon: '🌉', color: '#6c5fc7', name: 'Brücke der Ordnung', topic: 'Satzbau: Das Verb auf Platz 2',
  npc: '🧝 Brückenwächterin Nora',
  intro: 'Über den Fluss führt eine Brücke aus Wort-Brettern. Die Regel der Brücke ist streng: Das Verb steht immer auf Brett Nummer 2. Der Wirrwarr hat die Bretter vertauscht. Jetzt wackelt die Brücke! Baue die Sätze richtig, dann hält die Brücke wieder.',
  outro: 'Die Brücke steht fest. Nora öffnet das Tor und gibt dir den <b>violetten Wort-Kristall</b>. Doch was raschelt da im Gebüsch?',
  rule: `<p>Im Aussagesatz steht das <b>Verb immer auf Platz 2</b>.</p>
    <div class="slots"><span>Ich</span><span class="v">spiele</span><span>heute</span><span>Fussball.</span></div>
    <div class="slots"><span>Heute</span><span class="v">spiele</span><span>ich</span><span>Fussball.</span></div>
    <p>Platz 1 kann auch eine Zeit sein (Heute, Am Montag …). Dann kommt die Person <b>nach</b> dem Verb.</p>
    <p><b>W-Frage:</b> W-Wort, dann Verb: <span class="slots in"><span>Wo</span><span class="v">wohnst</span><span>du?</span></span></p>
    <p><b>Ja/Nein-Frage:</b> Das Verb steht auf Platz 1: <span class="slots in"><span class="v">Spielst</span><span>du</span><span>Fussball?</span></span></p>`,
  make(l) {
    const vs = Object.keys(VREG).filter(v => v !== 'hören');
    const v = pick(l === 1 ? vs : vs.filter(z => z !== 'wohnen' && z !== 'kommen')), f = regular(v), c = pick(VREG[v]);
    const p = person(PERS_ALL);
    if (l === 1) {
      if (chance(0.4)) {
        const S = cap(p.s), V = f[p.i];
        return { kind: 'mc', q: '<p class="sent">Welcher Satz ist richtig?</p>', lead: 'Denk an Platz 2!', opts: [`${S} ${V} ${c}.`, `${S} ${c} ${V}.`, `${cap(c)} ${subj(p)} ${V}.`].filter((x, i, a) => a.indexOf(x) === i),
          x: `Das Verb <b>${V}</b> steht auf Platz 2: ${S} <b>${V}</b> ${c}.` };
      }
      return { kind: 'order', words: [cap(p.s), f[p.i], c], end: '.', lead: `Baue den Satz. Er beginnt mit «${cap(p.s)}».`, x: `Das Verb <b>${f[p.i]}</b> steht auf Platz 2.` };
    }
    if (l === 2) {
      const r = RNG();
      if (r < 0.4) {
        const t = pick(TIMES);
        return { kind: 'order', words: [t, f[p.i], subj(p), c], end: '.', lead: `Baue den Satz. Er beginnt mit «${t}».`, x: `Platz 1: <b>${t}</b>. Platz 2: das Verb <b>${f[p.i]}</b>. Dann die Person: ${subj(p)}.` };
      }
      if (r < 0.75) {
        const Q = pick([['Wo', 'wohnen'], ['Was', 'machen'], ['Woher', 'kommen'], ['Wann', 'kommen'], ['Wie', 'heissen'], ['Was', 'lernen'], ['Was', 'kochen'], ['Wohin', 'gehen']]);
        const q2 = person(['du', 'ihr', 'er', 'du']);
        const fv = regular(Q[1])[q2.i];
        return { kind: 'order', words: [Q[0], fv, subj(q2)], end: '?', lead: `Baue die Frage. Sie beginnt mit «${Q[0]}».`, x: `W-Frage: Zuerst das W-Wort <b>${Q[0]}</b>, dann das Verb <b>${fv}</b>.` };
      }
      const q2 = person(['du', 'ihr', 'er']);
      return { kind: 'order', words: [cap(regular(v)[q2.i]), subj(q2), c], end: '?', lead: 'Baue die Ja/Nein-Frage.', x: `Ja/Nein-Frage: Das Verb <b>${regular(v)[q2.i]}</b> steht auf Platz 1.` };
    }
    const t = pick(TIMES), adv = pick(['gern', 'oft', 'immer', 'nie']);
    if (chance(0.5) && !['gern', 'schnell', 'viel', 'laut'].includes(c)) {
      return { kind: 'order', words: [t, f[p.i], subj(p), adv, c], end: '.', lead: `Baue den Satz. Er beginnt mit «${t}».`, x: `${t} <b>${f[p.i]}</b> ${subj(p)} ${adv} ${c}. Das Verb steht auf Platz 2, die Person direkt danach.` };
    }
    const Q = pick([['Wo', 'spielen', 'Fussball'], ['Wann', 'lernen', 'Deutsch'], ['Warum', 'kaufen', 'eine Jacke'], ['Wie oft', 'schwimmen', 'im See'], ['Wann', 'machen', 'die Hausaufgaben']]);
    const q2 = person(['du', 'ihr', 'er', 'sie']);
    return { kind: 'order', words: [Q[0], regular(Q[1])[q2.i], subj(q2), Q[2]], end: '?', lead: `Baue die Frage. Sie beginnt mit «${Q[0]}».`, x: `${Q[0]} <b>${regular(Q[1])[q2.i]}</b> ${subj(q2)} ${Q[2]}? Nach dem W-Wort kommt das Verb.` };
  } },

/* ---------------------------------------------------------------- 6 */
{ id: 'nein', icon: '🌫️', color: '#5f8f8a', name: 'Nebelmoor', topic: 'Verneinung: nicht und kein',
  npc: '🐸 Frosch Quax',
  intro: 'Hinter der Brücke liegt das Nebelmoor. Hier sagen alle oft «Nein». Aber wie? Mit «nicht» oder mit «kein»? Frosch Quax ist ganz verwirrt. Er quakt: «Das ist nicht Hund! Ich bin kein müde!» Hilf Quax!',
  outro: 'Quax quakt jetzt richtig: «Das ist kein Hund. Ich bin nicht müde.» Der Nebel wird dünn, und du findest den <b>grauen Wort-Kristall</b>.',
  rule: `<p><b>kein</b> steht vor einem <b>Nomen</b> (statt ein / eine oder ohne Artikel):</p>
    <ul><li>Das ist <b>ein</b> Hund. → Das ist <b>kein</b> Hund.</li><li>Ich habe Zeit. → Ich habe <b>keine</b> Zeit.</li></ul>
    <table class="ctab"><tr><td>ein</td><td>→ kein</td></tr><tr><td>eine</td><td>→ keine</td></tr><tr><td>einen</td><td>→ keinen</td></tr></table>
    <p><b>nicht</b> steht bei <b>Verben</b>, <b>Adjektiven</b> und <b>Orten</b>:</p>
    <ul><li>Ich bin <b>nicht</b> müde.</li><li>Mia schwimmt <b>nicht</b>.</li><li>Ali ist <b>nicht</b> zu Hause.</li></ul>`,
  make(l) {
    const NICHT = ['Ich bin ___ müde.', 'Mia schwimmt ___.', 'Das Wasser ist ___ kalt.', 'Ali ist ___ zu Hause.', 'Der Bus kommt ___.', 'Wir spielen heute ___.',
      'Das Buch ist ___ spannend.', 'Du bist ___ krank.', 'Der Hund bellt ___.', 'Ich wohne ___ in Zürich.', 'Die Suppe ist ___ heiss.', 'Lea tanzt ___ gern.'];
    const nichtQ = () => pick(NICHT);
    const kNom = () => { const n = pick(countable.filter(x => !['Lehrer', 'Lehrerin', 'Mann', 'Frau', 'Mutter', 'Vater', 'Bruder', 'Schwester', 'Freund'].includes(x.sg))); return { n, w: n.a === 'die' ? 'keine' : 'kein', s: `Das ist ___ ${n.sg}. ${n.e}` }; };
    const kAcc = () => {
      const n = pick(['Bruder', 'Schwester', 'Hund', 'Katze', 'Velo', 'Handy', 'Stift', 'Heft', 'Uhr', 'Zeit', 'Hunger', 'Computer', 'Jacke'].map(x => N[x]));
      return { n, w: n.a === 'der' ? 'keinen' : n.a === 'die' ? 'keine' : 'kein', s: `${pick(['Ich habe', 'Wir haben', 'Mia hat', 'Du hast'])} ___ ${n.sg}.` };
    };
    const xN = s => `<b>nicht</b>, weil hier kein Nomen verneint wird: ${s.replace('___', '<b>nicht</b>')}`;
    const xK = k => `<b>${k.w}</b>, weil ein Nomen verneint wird: ${k.n.a} ${k.n.sg} → ${k.w} ${k.n.sg}. ${k.n.a === 'der' && k.w === 'keinen' ? 'Nach «haben» steht der Akkusativ: einen → keinen.' : ''}`;
    if (l === 1) {
      if (chance(0.5)) { const s = nichtQ(); return { kind: 'mc', fixed: true, q: `<p class="sent">${s}</p>`, lead: 'nicht oder kein?', opts: ['nicht', 'kein'], order: ['nicht', 'kein'], x: xN(s) }; }
      const k = kNom();
      return { kind: 'mc', fixed: true, q: `<p class="sent">${k.s}</p>`, lead: 'nicht oder kein?', opts: [k.w, 'nicht'], order: ['nicht', k.w], x: xK(k) };
    }
    const all = ['nicht', 'kein', 'keine', 'keinen'];
    if (l === 2) {
      if (chance(0.35)) { const s = nichtQ(); return { kind: 'mc', fixed: true, q: `<p class="sent">${s}</p>`, lead: 'Was passt?', opts: ['nicht'].concat(all.slice(1)), order: all, x: xN(s) }; }
      const k = chance(0.6) ? kAcc() : kNom();
      return { kind: 'mc', fixed: true, q: `<p class="sent">${k.s}</p>`, lead: 'Was passt?', opts: [k.w].concat(all.filter(z => z !== k.w)), order: all, x: xK(k) };
    }
    if (chance(0.3)) { const s = nichtQ(); return { kind: 'input', q: `<p class="sent">${s}</p>`, lead: 'Schreib nicht, kein, keine oder keinen.', ans: ['nicht'], x: xN(s) }; }
    const k = chance(0.7) ? kAcc() : kNom();
    return { kind: 'input', q: `<p class="sent">${k.s}</p>`, lead: 'Schreib nicht, kein, keine oder keinen.', ans: [k.w], x: xK(k) };
  } },

/* ---------------------------------------------------------------- 7 */
{ id: 'akk', icon: '🌲', color: '#2f7d4a', name: 'Wald der Verwandlung', topic: 'Akkusativ: den, einen',
  npc: '🦊 Fuchs Fino',
  intro: 'Im Wald wohnt Fuchs Fino. Hier verwandeln sich Wörter! Wenn man etwas sieht, kauft oder sucht, wird aus «der» plötzlich «den». Aber der Wirrwarr hat die Zauberei gestört. Fino sagt: «Ich sehe der Baum.» Hilf ihm!',
  outro: 'Fino sagt stolz: «Ich sehe den Baum. Ich habe einen Freund.» Er wedelt mit dem Schwanz und gibt dir den <b>dunkelgrünen Wort-Kristall</b>.',
  rule: `<p>Viele Verben brauchen den <b>Akkusativ</b>. Frage: <b>Wen oder was?</b></p>
    <p>haben · sehen · kaufen · suchen · brauchen · essen · trinken · möchten</p>
    <table class="ctab"><tr><th></th><th>Nominativ</th><th>Akkusativ</th></tr>
    <tr class="hl"><td>${art('der')}</td><td>der / ein Hund</td><td><b>den / einen</b> Hund</td></tr>
    <tr><td>${art('die')}</td><td>die / eine Katze</td><td>die / eine Katze</td></tr>
    <tr><td>${art('das')}</td><td>das / ein Pferd</td><td>das / ein Pferd</td></tr></table>
    <p><b>Nur bei der ändert sich etwas!</b> der → den, ein → einen. die und das bleiben gleich.</p>`,
  make(l) {
    const FR = [
      { v: 'Ich sehe', n: ['Hund', 'Katze', 'Pferd', 'Vogel', 'Bus', 'Zug', 'Flugzeug', 'Mond', 'Schaf', 'Kuh', 'Baum', 'Boot'], d: true },
      { v: 'Ich kaufe', n: ['Apfel', 'Banane', 'Brot', 'Ball', 'Tasche', 'Heft', 'Stift', 'Jacke', 'Buch', 'Hut', 'Käse'], d: true },
      { v: 'Mia sucht', n: ['Schlüssel', 'Brille', 'Handy', 'Stift', 'Tasche', 'Heft', 'Ball', 'Schuh'], d: true },
      { v: 'Wir brauchen', n: ['Löffel', 'Gabel', 'Messer', 'Teller', 'Stift', 'Heft', 'Computer'], d: true },
      { v: 'Ali isst', n: ['Apfel', 'Banane', 'Brot', 'Kuchen', 'Ei', 'Tomate', 'Birne', 'Brötchen'], d: true },
      { v: 'Ich habe', n: ['Bruder', 'Schwester', 'Hund', 'Katze', 'Velo', 'Handy', 'Freund'], d: false },
      { v: 'Du möchtest', n: ['Apfel', 'Pizza', 'Velo', 'Hund', 'Computer', 'Uhr'], d: false }
    ];
    const fr = pick(l === 1 ? FR.filter(z => z.d) : FR), n = N[pick(fr.n)];
    const def = fr.d && (l === 1 || chance(0.5)) && l !== 2;
    const right = def ? (n.a === 'der' ? 'den' : n.a) : (n.a === 'der' ? 'einen' : n.a === 'die' ? 'eine' : 'ein');
    const base = def ? n.a : indef(n.a);
    const x = `${art(n.a)} ${n.sg} → ${fr.v} <b>${right}</b> ${n.sg}. ${n.a === 'der' ? 'Bei <b>der</b> ändert sich der Artikel: ' + (def ? 'der → den.' : 'ein → einen.') : 'Bei <b>' + n.a + '</b> bleibt der Artikel gleich.'}`;
    if (l === 1) return { kind: 'mc', q: `<p class="sent">${fr.v} ___ ${n.sg}. ${n.e}</p><p class="inf">(${n.a} ${n.sg})</p>`, lead: 'Welcher Artikel passt?', opts: n.a === 'der' ? ['den', 'der', 'dem'] : [n.a, 'den', n.a === 'die' ? 'der' : 'dem'], x };
    if (l === 2) return { kind: 'mc', fixed: true, q: `<p class="sent">${fr.v} ___ ${n.sg}. ${n.e}</p>`, lead: 'einen, eine oder ein?', opts: [right].concat(['einen', 'eine', 'ein'].filter(z => z !== right)), order: ['einen', 'eine', 'ein'], x };
    return { kind: 'input', q: `<p class="sent">${fr.v} ___ ${n.sg}. ${n.e}</p><p class="inf">(${def ? 'der, die oder das' : 'ein oder eine'} → Akkusativ)</p>`, lead: 'Schreib den richtigen Artikel.', ans: [right], x };
  } },

/* ---------------------------------------------------------------- 8 */
{ id: 'modal', icon: '🏰', color: '#b0477a', name: 'Schloss der Wünsche', topic: 'Modalverben: können, müssen, wollen …',
  npc: '🤴 König Leo',
  intro: 'Im Schloss wünscht sich jeder etwas. «Ich will tanzen!», «Ich kann singen!», «Ich muss lernen!» Aber der Wirrwarr hat die Sätze zerbrochen. Jetzt sagt König Leo: «Ich will tanzen Walzer.» Niemand versteht ihn. Hilf dem König!',
  outro: 'Der König sagt: «Ich will Walzer tanzen!» Das ganze Schloss tanzt. Leo schenkt dir den <b>rosa Wort-Kristall</b>.',
  rule: `<p>Modalverben: <b>können, müssen, wollen, möchten, dürfen</b>.</p>
    <p>Das Modalverb steht auf <b>Platz 2</b>. Das zweite Verb steht im <b>Infinitiv am Ende</b>.</p>
    <div class="slots"><span>Ich</span><span class="v">kann</span><span>gut</span><span class="v">schwimmen.</span></div>
    <table class="ctab"><tr><th></th><th>können</th><th>müssen</th><th>wollen</th></tr><tr><td>ich</td><td>kann</td><td>muss</td><td>will</td></tr><tr><td>du</td><td>kannst</td><td>musst</td><td>willst</td></tr>
    <tr class="hl"><td>er / sie / es</td><td>kann</td><td>muss</td><td>will</td></tr><tr><td>wir</td><td>können</td><td>müssen</td><td>wollen</td></tr><tr><td>ihr</td><td>könnt</td><td>müsst</td><td>wollt</td></tr><tr><td>sie / Sie</td><td>können</td><td>müssen</td><td>wollen</td></tr></table>
    <p>Achtung: <b>ich</b> und <b>er/sie/es</b> sind gleich und haben <b>kein -t</b>: ich kann, er kann.</p>`,
  make(l) {
    const a = pick(ACTS), m = pick(a.m), f = MODAL[m];
    const p = person(l === 1 ? PERS_EASY : PERS_ALL);
    const xf = `${cap(p.s)} <b>${f[p.i]}</b> ${a.c} <b>${a.v}</b>.` + formTable(f, p.i);
    if (l === 1) return { kind: 'mc', q: `<p class="sent">${cap(p.s)} ___ ${a.c} ${a.v}.</p><p class="inf">(${m})</p>`, lead: 'Welche Form passt?', opts: opt3(f[p.i], f.concat(p.i === 2 ? [f[2] + 't'] : [])), x: xf };
    if (l === 2) {
      if (chance(0.5)) {
        const S = cap(p.s), M = f[p.i];
        return { kind: 'mc', q: '<p class="sent">Welcher Satz ist richtig?</p>', lead: 'Wo steht der Infinitiv?', opts: [`${S} ${M} ${a.c} ${a.v}.`, `${S} ${M} ${a.v} ${a.c}.`, `${S} ${a.c} ${a.v} ${M}.`],
          x: `Das Modalverb <b>${M}</b> steht auf Platz 2, der Infinitiv <b>${a.v}</b> am Ende.` };
      }
      return { kind: 'order', words: [cap(p.s), f[p.i], a.c, a.v], end: '.', lead: `Baue den Satz. Er beginnt mit «${cap(p.s)}».`, x: `${cap(p.s)} <b>${f[p.i]}</b> ${a.c} <b>${a.v}</b>. Modalverb auf Platz 2, Infinitiv am Ende.` };
    }
    if (chance(0.5)) {
      const t = pick(['Heute', 'Morgen', 'Am Montag', 'Am Wochenende']);
      return { kind: 'order', words: [t, f[p.i], subj(p), a.c, a.v], end: '.', lead: `Baue den Satz. Er beginnt mit «${t}».`, x: `${t} <b>${f[p.i]}</b> ${subj(p)} ${a.c} <b>${a.v}</b>. Modalverb auf Platz 2, Infinitiv am Ende.` };
    }
    return { kind: 'input', q: `<p class="sent">${cap(p.s)} ___ ${a.c} ${a.v}.</p><p class="inf">(${m})</p>`, lead: 'Schreib das Modalverb in der richtigen Form.', ans: [f[p.i]], x: xf };
  } },

/* ---------------------------------------------------------------- 9 */
{ id: 'orte', icon: '🧭', color: '#c2453a', name: 'Labyrinth der Orte', topic: 'Präpositionen mit Dativ: Wo?',
  npc: '🐹 Maulwurf Moli',
  intro: 'Im Labyrinth fragen alle: «Wo?» Wo ist der Schlüssel? Wo ist die Katze? Wo bist du? Maulwurf Moli kennt jeden Weg. Aber der Wirrwarr hat seine Karte zerrissen. Moli sagt: «Die Katze ist auf das Tisch.» Hilf ihm, den Weg zu finden!',
  outro: '«Die Katze ist auf dem Tisch!», ruft Moli. Ihr findet den Ausgang. Dort wartet der <b>rote Wort-Kristall</b>.',
  rule: `<p>Frage <b>Wo?</b> → Präposition + <b>Dativ</b>.</p>
    <p>${Object.keys(PREP_CUE).map(p => `<span class="chip">${p} <small>${PREP_CUE[p]}</small></span>`).join(' ')}</p>
    <table class="ctab"><tr><th>Nominativ</th><th>Dativ</th></tr><tr><td>${art('der')} Tisch</td><td>auf <b>dem</b> Tisch</td></tr>
    <tr><td>${art('das')} Bett</td><td>unter <b>dem</b> Bett</td></tr><tr><td>${art('die')} Tür</td><td>neben <b>der</b> Tür</td></tr></table>
    <p>Kurzformen: in + dem = <b>im</b> (im Park) · an + dem = <b>am</b> (am Bahnhof)</p>`,
  make(l) {
    const furn = () => {
      const fu = pick(FURN), pr = pick(fu.p), th = pick(THINGS);
      const right = pr === 'in' ? 'im' : datArt(fu.g);
      return { fu, pr, th, right, x: `${nomArt(fu.g)} ${fu.n} → ${pr} <b>${datArt(fu.g)}</b> ${fu.n}. Frage «Wo?» → Dativ: der/das → <b>dem</b>, die → <b>der</b>.` };
    };
    const place = () => {
      const pl = pick(PLACES), s = pick(['Ich bin', 'Mia ist', 'Wir sind', 'Ali wartet', 'Die Kinder sind', 'Du bist']);
      const right = placeForm(pl);
      return { pl, s, right, x: `${nomArt(pl.g)} ${pl.n} → <b>${right}</b> ${pl.n}. ${pl.p === 'in' ? 'in + dem = im' : 'an + dem = am'}${pl.g === 'f' ? ', aber bei <b>die</b> heisst es ' + pl.p + ' der.' : '.'}` };
    };
    if (l === 1) {
      const a = furn();
      return { kind: 'mc', fixed: true, q: `<p class="sent">${a.th} ist ${a.pr} ___ ${a.fu.n}.</p><p class="inf">(${nomArt(a.fu.g)} ${a.fu.n})</p>`, lead: 'Wo? → Dativ. Welcher Artikel passt?', opts: [a.right].concat(['dem', 'der', 'den'].filter(z => z !== a.right)), order: ['dem', 'der', 'den'], x: a.x };
    }
    if (l === 2) {
      if (chance(0.35)) {
        const fu = pick(FURN), pr = pick(fu.p), th = pick(THINGS);
        const others = shuffle(['auf', 'unter', 'neben', 'hinter', 'vor'].filter(z => z !== pr)).slice(0, 2);
        return { kind: 'mc', q: `<p class="sent">${th} ist ___ ${datArt(fu.g)} ${fu.n}.</p><p class="cue">${PREP_CUE[pr]}</p>`, lead: 'Welche Präposition passt zum Bild-Hinweis?', opts: [pr].concat(others), x: `${PREP_CUE[pr]} = <b>${pr}</b>.` };
      }
      const a = place();
      const opts = [a.right].concat(['im', 'in der', 'am', 'an der'].filter(z => z !== a.right && (a.pl.g === 'f' ? z !== 'im' && z !== 'am' : true)));
      if (a.pl.g === 'f') opts.push(a.pl.p === 'in' ? 'im' : 'am');
      return { kind: 'mc', fixed: true, q: `<p class="sent">${a.s} ___ ${a.pl.n}.</p>`, lead: 'Wo? Was passt?', opts: uniq(opts).slice(0, 4), order: ['im', 'in der', 'am', 'an der'], x: a.x };
    }
    if (chance(0.5)) { const a = furn(); return { kind: 'input', q: `<p class="sent">${a.th} ist ${a.pr} ___ ${a.fu.n}.</p>`, lead: 'Schreib den Artikel im Dativ.', ans: [a.right], x: a.x }; }
    const a = place();
    return { kind: 'input', q: `<p class="sent">${a.s} ___ ${a.pl.n}.</p><p class="inf">(${a.pl.p})</p>`, lead: `Schreib «${a.pl.p}» mit dem Artikel (oder die Kurzform).`, ans: [a.right].concat(a.right === 'im' ? ['in dem'] : a.right === 'am' ? ['an dem'] : []), x: a.x };
  } },

/* ---------------------------------------------------------------- 10 */
{ id: 'perfekt', icon: '🕰️', color: '#a07a1f', name: 'Turm der Erinnerung', topic: 'Perfekt: habe gespielt, bin gegangen',
  npc: '⏰ Die alte Uhr Tikka',
  intro: 'Der letzte Ort ist ein hoher Turm. Hier erzählt man von gestern. Die alte Uhr Tikka erinnert sich an alles. Aber der Wirrwarr hat ihre Erinnerungen durcheinandergebracht. Tikka sagt: «Gestern ich habe gespielt Fussball.» Hilf Tikka, sich richtig zu erinnern!',
  outro: 'Tikka tickt fröhlich: «Gestern habe ich Fussball gespielt!» Ganz oben im Turm leuchtet der <b>goldene Wort-Kristall</b>. Jetzt bist du bereit für den Wirrwarr!',
  rule: `<p>Mit dem <b>Perfekt</b> erzählst du, was <b>schon passiert</b> ist.</p>
    <p><b>haben</b> oder <b>sein</b> auf Platz 2 + <b>Partizip</b> am Ende:</p>
    <div class="slots"><span>Ich</span><span class="v">habe</span><span>Fussball</span><span class="v">gespielt.</span></div>
    <div class="slots"><span>Gestern</span><span class="v">bin</span><span>ich</span><span>nach Hause</span><span class="v">gegangen.</span></div>
    <ul><li>regelmässig: <b>ge</b>…<b>t</b>: spielen → <b>ge</b>spiel<b>t</b>, machen → <b>ge</b>mach<b>t</b></li><li>unregelmässig: <b>ge</b>…<b>en</b>: essen → <b>ge</b>gess<b>en</b>, lesen → <b>ge</b>les<b>en</b></li></ul>
    <p><b>sein</b> bei Bewegung von A nach B: gehen, fahren, kommen, laufen, fliegen, schwimmen → ich <b>bin</b> gegangen.</p>`,
  make(l) {
    const v = pick(Object.keys(PART)), [pt, aux, c] = PART[v];
    const AF = aux === 's' ? SEIN : HABEN, OF = aux === 's' ? HABEN : SEIN;
    const p = person(l === 1 ? ['ich', 'er', 'wir'] : PERS_ALL);
    const st = v.slice(0, -2);
    const wrongP = uniq([`ge${st}t`, `ge${v}`, v, regular(v)[2]]).filter(z => z !== pt);
    const x = `${cap(p.s)} <b>${AF[p.i]}</b> ${c} <b>${pt}</b>. ${v} → ${pt}${aux === 's' ? ' (mit <b>sein</b>, weil es eine Bewegung ist)' : ' (mit <b>haben</b>)'}.`;
    if (l === 1) {
      const t = pick(PAST_T);
      return { kind: 'mc', q: `<p class="sent">${t} ${AF[p.i]} ${subj(p)} ${c} ___.</p><p class="inf">(${v})</p>`, lead: 'Welches Partizip passt?', opts: opt3(pt, wrongP),
        x: `${t} ${AF[p.i]} ${subj(p)} ${c} <b>${pt}</b>. ${v} → ${pt}.` };
    }
    if (l === 2) {
      return { kind: 'mc', q: `<p class="sent">${cap(p.s)} ___ ${c} ${pt}.</p>`, lead: 'haben oder sein? Welche Form passt?',
        opts: opt3(AF[p.i], [OF[p.i], AF[(p.i + 2) % 6] !== AF[p.i] ? AF[(p.i + 2) % 6] : AF[(p.i + 1) % 6]]), x };
    }
    if (chance(0.5)) return { kind: 'input', q: `<p class="sent">${cap(p.s)} ${AF[p.i]} ${c} ___.</p><p class="inf">(${v})</p>`, lead: 'Schreib das Partizip.', ans: [pt], x };
    return { kind: 'order', words: [cap(p.s), AF[p.i], pick(['gestern', 'am Montag', 'letzte Woche']), c, pt], end: '.', lead: `Baue den Satz. Er beginnt mit «${cap(p.s)}».`, x: `${x} Hilfsverb auf Platz 2, Partizip am Ende.` };
  } }
];

/* ---------- Endgegner ---------- */
const BOSSES = [
  { id: 'dieb', after: 5, realms: [0, 1, 2, 3, 4], icon: '🦝', name: 'Klau, der Wortdieb', color: '#555',
    intro: 'Da raschelt es im Gebüsch! Ein Waschbär springt heraus. Es ist Klau, der Wortdieb. Er hat einen Sack voller Wörter gestohlen. «Die Wörter gehören mir!», ruft er. Beantworte seine Fragen. Dann muss er die Wörter zurückgeben.',
    win: 'Klau lässt den Sack fallen. Alle Wörter fliegen zurück nach Hause. «Du bist zu schlau für mich!», murmelt er und rennt in den Wald. Der Weg ins Nebelmoor ist frei.',
    lose: 'Klau lacht und rennt davon. Aber keine Sorge: Übe noch ein bisschen und versuche es nochmals!' },
  { id: 'wirrwarr', after: 10, realms: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9], icon: '🌀', name: 'Der Wirrwarr', color: '#6b3fa0',
    intro: 'Der Himmel wird dunkel. Ein grosser Wirbel dreht sich über dem Turm. Das ist der Wirrwarr! «Ich mache alle Wörter kaputt!», heult er. Aber du hast zehn Wort-Kristalle. Zeig ihm, was du gelernt hast!',
    win: 'Die zehn Kristalle leuchten hell. Der Wirrwarr wird kleiner und kleiner, bis er nur noch ein leises Lüftchen ist. Im ganzen Wortland sprechen die Leute wieder richtig. Es gibt ein grosses Fest – und du bist der Ehrengast!',
    lose: 'Der Wirrwarr wirbelt dich aus dem Turm. Aber Lumi fängt dich auf. «Übe noch ein wenig, dann schaffst du es!»' }
];

const STORY_START = 'Willkommen im Wortland! Hier wohnen viele Wörter. Aber dann ist der Wirrwarr gekommen. Er hat alle Wörter durcheinandergewirbelt. Jetzt sprechen die Leute falsch und verstehen sich nicht mehr. Ich bin Lumi, die Eule. Hilf mir bitte! In jedem Ort gibt es einen Wort-Kristall. Sammle alle zehn Kristalle. Dann können wir den Wirrwarr besiegen.';

/* Kurze Tipps für den Hinweis-Knopf (bei Aufgaben mit nur zwei Antworten) */
const TIPS = {
  artikel: 'der = blau, die = rot, das = grün. Bei die heisst es eine, bei der und das heisst es ein.',
  plural: 'Im Plural ist der Artikel immer die.',
  verben: 'ich -e, du -st, er/sie/es -t, wir -en, ihr -t, sie -en.',
  stark: 'Starke Verben ändern den Vokal nur bei du und er/sie/es.',
  satzbau: 'Das Verb steht auf Platz 2.',
  nein: 'kein steht vor einem Nomen. nicht steht bei Verben, Adjektiven und Orten.',
  akk: 'Nur der ändert sich: der → den, ein → einen.',
  modal: 'Modalverb auf Platz 2, Infinitiv am Ende. ich kann, er kann (ohne -t).',
  orte: 'Wo? → Dativ: der/das → dem, die → der.',
  perfekt: 'Bewegung von A nach B → sein. Sonst meistens haben.'
};
REALMS.forEach(r => { r.tip = TIPS[r.id]; });
