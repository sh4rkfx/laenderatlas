// Erzeugt geo.json: vereinfachte Weltkarte (TopoJSON) + Stammdaten + Punktmarker
import fs from "node:fs";
import { createRequire } from "node:module";
import * as topojson from "topojson-client";
import * as simp from "topojson-simplify";
import * as d3 from "d3";
import { COUNTRIES, TERRITORIES, REGIONS, CONTINENTS, SPLIT_BOXES, NEUTRAL_BY_NAME, MARKER_COORDS } from "./atlas-data.mjs";

const require = createRequire(import.meta.url);
const topo = structuredClone(require("world-atlas/countries-50m.json"));
const MERGE_BY_NAME = { "N. Cyprus": "CY", "Somaliland": "SO", "Kosovo": "XK", "Ashmore and Cartier Is.": "AU" };

const cByNum = new Map(COUNTRIES.map(c => [c[1], c[0]]));
const tByNum = new Map(TERRITORIES.filter(t => t[1] && !t[1].startsWith("split:")).map(t => [t[1], t[0]]));
const splitTargets = {}; // Staat -> [Gebiets-ISO]
for (const t of TERRITORIES) if (t[1] && t[1].startsWith("split:")) (splitTargets[t[1].slice(6)] ||= []).push(t[0]);

const out = [];
const problems = [];
for (const g of topo.objects.countries.geometries) {
  const name = g.properties.name;
  if (g.id === "010") continue; // Antarktis nicht zeichnen
  let props;
  if (MERGE_BY_NAME[name]) props = { k: "c", i: MERGE_BY_NAME[name] };
  else if (NEUTRAL_BY_NAME[name]) props = { k: "n", n: NEUTRAL_BY_NAME[name] };
  else if (cByNum.has(g.id)) props = { k: "c", i: cByNum.get(g.id) };
  else if (tByNum.has(g.id)) props = { k: "t", i: tByNum.get(g.id) };
  else { problems.push(`unbekannt: ${g.id} ${name}`); continue; }

  const targets = props.k === "c" ? splitTargets[props.i] : null;
  if (targets && g.type === "MultiPolygon") {
    const keep = [], parts = {};
    for (const poly of g.arcs) {
      const f = topojson.feature(topo, { type: "Polygon", arcs: poly });
      const [lon, lat] = d3.geoCentroid(f);
      const hit = targets.find(t => SPLIT_BOXES[t].some(([x0, y0, x1, y1]) => lon >= x0 && lon <= x1 && lat >= y0 && lat <= y1));
      if (hit) (parts[hit] ||= []).push(poly); else keep.push(poly);
    }
    out.push({ type: "MultiPolygon", arcs: keep, properties: props });
    for (const [iso, polys] of Object.entries(parts)) out.push({ type: "MultiPolygon", arcs: polys, properties: { k: "t", i: iso } });
  } else {
    out.push({ type: g.type, arcs: g.arcs, properties: props });
  }
}
topo.objects.countries.geometries = out;

let t2 = simp.presimplify(topo);
t2 = simp.simplify(t2, simp.quantile(t2, 0.45));
t2 = topojson.quantize(t2, 2e4);

// Flächen messen (gleiche Projektion wie die App), Marker für zu kleine Flächen
const fc = topojson.feature(t2, t2.objects.countries);
const proj = d3.geoNaturalEarth1().rotate([-11, 0]).fitExtent([[6, 6], [994, 5000]], fc);
const path = d3.geoPath(proj);
const area = new Map();
for (const f of fc.features) if (f.properties.i) area.set(f.properties.i, (area.get(f.properties.i) || 0) + path.area(f));
const markers = {};
for (const iso of [...COUNTRIES.map(c => c[0]), ...TERRITORIES.map(t => t[0])]) {
  if (iso === "AQ") continue;
  if ((area.get(iso) || 0) < 10) {
    if (!MARKER_COORDS[iso]) problems.push(`Marker fehlt: ${iso}`);
    else markers[iso] = MARKER_COORDS[iso];
  }
}

const geo = {
  continents: CONTINENTS,
  regions: REGIONS,
  countries: COUNTRIES.map(([iso, , name, region, grp]) => [iso, name, region, grp]),
  territories: TERRITORIES.map(([iso, , name, region]) => [iso, name, region]),
  markers,
  topo: t2,
};
fs.writeFileSync("geo.json", JSON.stringify(geo));

// Bericht
const byRegion = {};
for (const c of COUNTRIES) byRegion[c[3]] = (byRegion[c[3]] || 0) + 1;
const tByRegion = {};
for (const t of TERRITORIES) tByRegion[t[3]] = (tByRegion[t[3]] || 0) + 1;
const splitDone = out.filter(g => g.properties.k === "t" && Object.keys(SPLIT_BOXES).includes(g.properties.i)).map(g => `${g.properties.i}:${g.arcs.length}`);
console.log({
  problems, countries: COUNTRIES.length, territories: TERRITORIES.length,
  sizeKB: Math.round(JSON.stringify(geo).length / 1024), splitDone,
  countryMarkers: Object.keys(markers).filter(i => COUNTRIES.some(c => c[0] === i)).length,
  territoryMarkers: Object.keys(markers).filter(i => TERRITORIES.some(t => t[0] === i)).join(" "),
  byRegion, tByRegion,
});
