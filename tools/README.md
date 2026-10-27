# Build-Werkzeuge

Die ausgelieferten Dateien im Hauptordner (`index.html`, `app.js`, `app.css`, `geo.js`) werden hieraus erzeugt.
Für kleine Änderungen an der App reicht es, `app.js` und `app.css` im Hauptordner direkt zu bearbeiten.

| Datei | Zweck |
|---|---|
| `countries.mjs` | 197 Länder mit deutschem Namen und ISO-Codes |
| `atlas-data.mjs` | UN-M49-Regionen, 53 Gebiete, Teilflächen, Markerkoordinaten |
| `build-geo.mjs` | Erzeugt `geo.json` aus Natural Earth (npm-Paket `world-atlas`) |
| `build-v2.mjs` | Baut `index.html`, `geo.js` und die Demo-Seite aus `src/` |

```bash
npm install world-atlas@2 topojson-client@3 topojson-simplify@3 d3@7
node build-geo.mjs && node build-v2.mjs
cp -r dist2/github/{index.html,app.js,app.css,geo.js} ..
```

`build-v2.mjs` schreibt nach `tools/dist2/` (Repo-Dateien und die Demo-Seite `laenderatlas.html`). `data/` im Hauptordner nicht überschreiben, dort liegen eure Karten.
