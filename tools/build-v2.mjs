import fs from "node:fs";
const geo = fs.readFileSync("geo.json", "utf8");
const css = fs.readFileSync("src/app.css", "utf8");
const js = fs.readFileSync("src/app.js", "utf8");
const body = fs.readFileSync("src/body.html", "utf8");
const LIBS = `<script src="https://cdnjs.cloudflare.com/ajax/libs/d3/7.9.0/d3.min.js"></script>
<script src="https://cdn.jsdelivr.net/npm/topojson-client@3.1.0/dist/topojson-client.min.js"></script>`;
const FONTS = `<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Archivo:wdth,wght@62..125,300..900&family=IBM+Plex+Mono:wght@400;500;600&display=swap">`;

const demo = {
  profiles: [{ id: "johannes", name: "Johannes" }, { id: "elisabeth", name: "Elisabeth" }],
  data: {
    johannes: {
      bereist: "AT DE CH IT FR ES PT NL BE CZ HU HR SI GR GB IE NO DK US CA MX TH JP MA EG AU AR".split(" "),
      geplant: "IS NZ PE CL VN NA ZA CR GE KR".split(" "),
      gebiete: { bereist: ["HK", "FO"], geplant: ["PF"] },
    },
    elisabeth: {
      bereist: "AT DE CH IT FR ES GR HR GB IE PT NL BE SE DK FI EE US TH ID VN KH MA TZ KE MX CU".split(" "),
      geplant: "IS JP NZ PE LK".split(" "),
      gebiete: { bereist: ["RE", "HK"], geplant: ["PF", "GL"] },
    },
  },
};

// 1) GitHub-Repo
const out = "dist2/github";
fs.rmSync("dist2", { recursive: true, force: true });
fs.mkdirSync(out + "/data", { recursive: true });
fs.writeFileSync(`${out}/index.html`, `<!doctype html>
<html lang="de">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<meta name="robots" content="noindex">
<title>Länderatlas</title>
<meta name="claude:viewport-fit-sides" content="cover">
${FONTS}
<link rel="stylesheet" href="app.css">
</head>
<body>
${body.trim()}
${LIBS}
<script src="geo.js"></script>
<script>window.ATLAS_CONFIG = { mode: "github" };</script>
<script src="app.js"></script>
</body>
</html>
`);
fs.writeFileSync(`${out}/app.css`, css);
fs.writeFileSync(`${out}/app.js`, js);
fs.writeFileSync(`${out}/geo.js`, `/* Länderatlas Stammdaten und Kartengeometrie (Natural Earth 1:50 Mio., vereinfacht). Erzeugt mit build-geo.mjs */\nwindow.ATLAS_GEO = ${geo};\n`);
fs.writeFileSync(`${out}/data/profile.json`, JSON.stringify(demo.profiles, null, 2) + "\n");
const empty = id => JSON.stringify({ profil: id, aktualisiert: null, bereist: [], geplant: [], gebiete: { bereist: [], geplant: [] } }, null, 2) + "\n";
fs.writeFileSync(`${out}/data/johannes.json`, empty("johannes"));
fs.writeFileSync(`${out}/data/elisabeth.json`, empty("elisabeth"));
fs.writeFileSync(`${out}/.nojekyll`, "");

// 2) Artefakt (Demo, alles inline)
const art = `<title>Länderatlas</title>
<meta name="claude:viewport-fit-sides" content="cover">
${FONTS}
<style>
${css}
</style>
${body.trim()}
${LIBS}
<script>window.ATLAS_GEO = ${geo};</script>
<script>window.ATLAS_CONFIG = { mode: "demo", demo: ${JSON.stringify(demo)} };</script>
<script>
${js}
</script>
`;
fs.writeFileSync("dist2/laenderatlas.html", art);
for (const f of ["dist2/laenderatlas.html", `${out}/index.html`, `${out}/app.js`, `${out}/geo.js`]) console.log(f, Math.round(fs.statSync(f).size / 1024) + " KB");
