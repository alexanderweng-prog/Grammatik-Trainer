# Wortland – Grammatik-Abenteuer für DaZ

Spielerischer Grammatiktrainer für Schülerinnen und Schüler mit Deutsch als Zweitsprache (Anfänger, etwa A1–A2). Aufgebaut wie Naturalia: Weltkarte mit Orten, Story, Endgegner, Challenges, Abzeichen und Spielstand zum Sichern. Die Inhalte bauen auf den Grammatik-Kategorien des Kanti-Trainers Deutsch auf, sind aber für Anfänger neu geschrieben (einfache Sprache, Bilder, Vorlesen).

## Die Geschichte

Der Wirrwarr hat im Wortland alle Wörter durcheinandergewirbelt. Lumi, die Eule, begleitet die Kinder durch zehn Orte. In jedem Ort gibt es einen Wort-Kristall. Nach Ort 5 wartet Klau, der Wortdieb, am Schluss der Wirrwarr.

| Nr. | Ort | Thema |
|---|---|---|
| 1 | Hafen der drei Tore | Artikel der/die/das, ein/eine, er/sie/es |
| 2 | Markt der Vielen | Plural |
| 3 | Dorf der Tu-Wörter | Verben im Präsens (regelmässig) |
| 4 | Felsen der Starken | sein, haben, starke Verben (fährt, isst, liest) |
| 5 | Brücke der Ordnung | Satzbau: Verb auf Platz 2, W-Fragen, Ja/Nein-Fragen |
| – | Klau, der Wortdieb | Endgegner 1 (Orte 1–5) |
| 6 | Nebelmoor | nicht / kein |
| 7 | Wald der Verwandlung | Akkusativ (den, einen) |
| 8 | Schloss der Wünsche | Modalverben und Satzklammer |
| 9 | Labyrinth der Orte | Präpositionen mit Dativ (Wo?), im/am |
| 10 | Turm der Erinnerung | Perfekt mit haben/sein |
| – | Der Wirrwarr | Endgegner 2 (alle Orte) |

## Wie sich das Niveau anpasst

- Jeder Ort hat drei Stufen: 🌱 leicht (Auswahl mit Bildern, wenig Optionen), 🌿 mittel (mehr Optionen, Sätze bauen), 🌳 schwer (selber schreiben, längere Sätze).
- Pro Ort gibt es einen Stufenwert. Richtig: +0,25, falsch: −0,35. Nach etwa 4 richtigen Antworten steigt die Stufe, nach 2–3 Fehlern sinkt sie. Mit Hinweis zählt eine richtige Antwort nur halb.
- Die Aufgaben werden einzeln erzeugt, darum passt sich die Stufe schon innerhalb einer Runde an.
- Auf Stufe 2 und 3 kommt jede vierte Aufgabe zur Wiederholung eine Stufe tiefer.
- Beim ersten Start wählen die Kinder selbst, wie gut sie Deutsch können (Start auf Stufe 1, 2 oder 3).
- Falsche Aufgaben kommen in die **Fehlerkiste** und tauchen später wieder auf, bis sie richtig gelöst sind.

## Sterne und Freischalten

- ★ 5 von 8 richtig → Wort-Kristall, der nächste Ort öffnet sich
- ★★ 6 von 8 richtig mit Aufgaben auf Stufe 2
- ★★★ 7 von 8 richtig mit Aufgaben auf Stufe 3
- Ort 6 öffnet sich erst, wenn Klau besiegt ist. Endgegner: 12 Fragen, 4 Herzen.
- **Lehrperson:** Unter Einstellungen → «Alle Orte und Endgegner öffnen» lässt sich alles direkt freischalten.

## Challenges

- **Tages-Quest:** 10 gemischte Aufgaben, einmal pro Tag, +50 XP
- **Sanduhr-Jagd:** 60 Sekunden, so viele richtig wie möglich (Rekord wird gespeichert, verändert die Stufe nicht)
- **Fehlerkiste:** alte Fehler aus allen Orten üben
- Serie 🔥 (Tage nacheinander), Ränge nach XP (Ei bis Wortdrache), 15 Abzeichen

## Vorlesen

Story, Regeln und Aufgaben haben einen 🔊-Knopf. Das nutzt die Sprachausgabe des Browsers (deutsche Stimme, de-CH falls vorhanden). Auf manchen Geräten fehlt eine deutsche Stimme, dann klingt es schlecht oder bleibt stumm. In den Einstellungen gibt es einen Stimmtest und «Aufgaben automatisch vorlesen».

## Spielstand

- Speichert automatisch im Browser (Schlüssel `wortland-v1`).
- Unter «Spielstand» als Datei (`wortland-<Name>-<Datum>.txt`) oder als Code sichern und auf einem anderen Gerät laden. Der Code ist komprimiert, nicht verschlüsselt.
- Unter «Mein Lernstand» sehen die Kinder pro Thema Stufe, Trefferquote, Sterne und offene Fehler. Den Text können sie kopieren und der Lehrperson schicken.

## Aufbau

- `index.html` – Startseite
- `js/data.js` – Wörter, Story, Regeln und Aufgaben-Generatoren der zehn Orte (`make(stufe)`). Neue Wörter einfach in `NOUNS`, `VREG` usw. ergänzen.
- `js/app.js` – Spiel-Engine
- `style.css`, `fonts/` (Fredoka, Nunito, Cinzel; SIL Open Font License)

Kein Build-Schritt nötig. Lokal einfach `index.html` im Browser öffnen.

## Veröffentlichen mit GitHub Pages

Settings → Pages → Source «Deploy from a branch», Branch wählen, Ordner `/ (root)`, Save. Danach ist die App unter `https://alexanderweng-prog.github.io/Grammatik-Trainer/` erreichbar.
