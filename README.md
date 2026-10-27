# Länderatlas 0.2

Weltkarte für bereiste und geplante Länder, mit einer eigenen Karte für Johannes und für Elisabeth, einer Vergleichsansicht und einer Statistik nach UN-M49.

Die App ist rein statisch und läuft auf GitHub Pages. Die Karten liegen als JSON-Dateien in diesem Repo. Wer einen Token hat, speichert direkt aus der App heraus; jedes Speichern ist ein Commit.

## Dateien

| Datei | Inhalt |
|---|---|
| `index.html`, `app.css`, `app.js` | Die App |
| `geo.js` | Länder, Gebiete, Regionen und Kartengeometrie (Natural Earth 1:50 Mio., vereinfacht) |
| `data/profile.json` | Liste der Profile: `[{"id": "johannes", "name": "Johannes"}, …]` |
| `data/johannes.json`, `data/elisabeth.json` | Die Karten. Fehlt eine Datei, legt das erste Speichern sie an |
| `.nojekyll` | Verhindert, dass GitHub Pages die Dateien durch Jekyll schickt |

## Einrichten

1. Öffentliches Repository anlegen, z. B. `laenderatlas`. GitHub Pages ist nur für öffentliche Repos kostenlos.
2. Alle Dateien aus dem ZIP in den Hauptordner von `main` hochladen, inklusive `data/` und `.nojekyll`.
3. **Settings → Pages → Build and deployment → Source: Deploy from a branch**, Branch `main`, Ordner `/ (root)`, speichern.
4. Nach ein bis zwei Minuten läuft die App unter `https://<benutzername>.github.io/laenderatlas/`.

## Tokens zum Bearbeiten

Erstelle zwei Tokens in deinem GitHub-Konto, einen für deine Geräte und einen für Elisabeths Geräte. So kann jeder Token einzeln widerrufen werden.

1. [github.com/settings/personal-access-tokens/new](https://github.com/settings/personal-access-tokens/new) öffnen (Fine-grained token).
2. Name z. B. `Länderatlas Elisabeth`, Ablaufdatum wählen.
3. **Repository access:** `Only select repositories` → dieses Repo.
4. **Permissions → Repository permissions → Contents:** `Read and write`. Sonst nichts.
5. Token erzeugen und kopieren. GitHub zeigt ihn nur einmal an.

Auf jedem Gerät, das bearbeiten soll:

1. App öffnen → **Einstellungen**.
2. **Wem gehört dieses Gerät?** → eigenen Namen wählen.
3. Token einfügen → **Token prüfen und speichern**.

Der Token bleibt nur im Browser dieses Geräts (`localStorage`). Da beide Tokens in deinem Konto liegen, erscheinen alle Commits unter deinem GitHub-Namen; die Commit-Nachricht nennt die Person, z. B. `Länderatlas Elisabeth: bereist +IS; geplant +JP`.

## Bedienung

| Aktion | So geht's |
|---|---|
| Karte wechseln | Oben „Johannes“, „Elisabeth“ oder „Vergleich“; Links: `…/#johannes`, `…/#elisabeth`, `…/#vergleich` |
| Land markieren (Liste) | „Bereist“ oder „Geplant“ anklicken; erneuter Klick hebt die Markierung auf |
| Land markieren (Suche) | Name oder ISO-Code tippen, `Enter` = bereist, `Umschalt+Enter` = geplant |
| Land markieren (Karte) | Klick wechselt offen → bereist → geplant → offen |
| Gebiete | Reiter „Gebiete“ im Register; auf der Karte als Rauten ab 2,5-facher Vergrößerung |
| Speichern | Leiste unten: „Speichern“ erzeugt einen Commit. Für andere in etwa einer Minute sichtbar |
| Daten aus Prototyp 0.1 übernehmen | Im Prototyp „Daten sichern / laden“ → Text kopieren; hier „Einstellungen“ → Text einfügen → „Übernehmen“ → „Speichern“ |

Nicht gespeicherte Änderungen bleiben als Entwurf im Browser erhalten, auch nach dem Neuladen. Hat ein anderes Gerät derselben Person in der Zwischenzeit gespeichert, lädt die App den neuen Stand und legt die eigenen Änderungen darüber.

## Fachliche Festlegungen

- **Zählbasis:** 197 Länder = 193 UN-Mitglieder + Vatikanstadt, Palästina, Kosovo, Taiwan.
- **Kontinente und Regionen:** UN-M49, 5 Kontinente, 22 Regionen (feinste M49-Ebene). Kosovo und Taiwan fehlen in M49 und zählen zu Südeuropa bzw. Ostasien.
- **Auffällige M49-Zuordnungen:** Iran → Südasien, Mexiko → Mittelamerika, Sudan → Nordafrika, Zypern und Türkei → Westasien, Russland → Osteuropa.
- **Gebiete:** 53 abhängige oder umstrittene Gebiete nach M49 (z. B. Grönland, Hongkong, Puerto Rico, Französisch-Guayana, Antarktis) mit eigener Zählung, nicht in den 197.
- **Kartendetails:** Nordzypern zählt zu Zypern, Somaliland zu Somalia. Die Antarktis ist nur in der Liste, nicht auf der Karte. Bouvetinsel und Tuvalu fehlen in den Grenzdaten und erscheinen als Punkt.

## Datenschutz

Repo und Seite sind öffentlich: Beide Länderlisten und die Commit-Historie (wann gespeichert wurde) kann jeder sehen, der das Repo findet. Die Seite enthält `noindex`, damit Suchmaschinen sie nicht aufnehmen.

## Datenformat

```json
{
  "profil": "elisabeth",
  "aktualisiert": "2026-10-27T10:42:00.000Z",
  "bereist": ["AT", "DE", "IT"],
  "geplant": ["JP"],
  "gebiete": { "bereist": ["HK"], "geplant": ["PF"] }
}
```

Codes sind ISO 3166-1 alpha-2, Kosovo ist `XK`.

## Quellen und Lizenzen

- Grenzen: [Natural Earth](https://www.naturalearthdata.com/) (Public Domain) über [world-atlas](https://github.com/topojson/world-atlas) (ISC)
- [D3](https://d3js.org/) 7.9.0 und [topojson-client](https://github.com/topojson/topojson-client) 3.1.0 (ISC), per CDN
- Schriften: Archivo und IBM Plex Mono über Google Fonts (SIL OFL)
