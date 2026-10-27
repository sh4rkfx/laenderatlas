/* Länderatlas 0.2 – Karten für mehrere Profile, gespeichert als JSON im GitHub-Repo */
(function () {
  "use strict";

  const CFG = window.ATLAS_CONFIG || { mode: "github" };
  const G = window.ATLAS_GEO;
  const DEMO = CFG.mode === "demo";

  // ---------- Stammdaten ----------
  const CONT = new Map(G.continents);
  const REG = new Map(G.regions.map(([code, cont, name]) => [code, { code, cont, name }]));
  const ORDER_C = ["EU", "AS", "AF", "AM", "OC"];
  const ORDER_T = ["EU", "AS", "AF", "AM", "OC", "AN"];
  const regionsOf = cont => G.regions.filter(r => r[1] === cont).map(r => r[0]);
  const GROUP_NOTE = { obs: "UN-Beobachter", x: "teilweise anerkannt" };
  const ALIASES = {
    US: "USA Amerika", GB: "UK Großbritannien England Schottland Wales Nordirland", NL: "Holland", BY: "Weißrussland",
    MK: "Mazedonien", SZ: "Swasiland", MM: "Burma Birma", TL: "Timor-Leste Ost-Timor", CI: "Côte d'Ivoire",
    CZ: "Tschechische Republik", CV: "Cabo Verde", VA: "Vatikan Heiliger Stuhl", KR: "Korea", KP: "Korea DVRK",
    CD: "Kinshasa Zaire", CG: "Brazzaville", AE: "VAE Emirate Dubai Abu Dhabi", DO: "Dom. Rep.", BA: "Bosnien",
    MD: "Moldawien Moldova", KG: "Kirgistan", TR: "Türkiye", RU: "Russische Föderation", TW: "Republik China",
    LK: "Ceylon", IR: "Persien", ST: "Sao Tome", KN: "Saint Kitts", LC: "Saint Lucia", VC: "Saint Vincent",
    NZ: "Aotearoa", CF: "ZAR", HK: "Hong Kong", MO: "Macao", GL: "Kalaallit Nunaat", FO: "Färöer Faroe",
    PF: "Tahiti Bora Bora", RE: "Reunion", SJ: "Spitzbergen", AQ: "Südpol", GF: "Guyane", FK: "Malvinas"
  };
  const norm = s => s.toLowerCase().replace(/ß/g, "ss").normalize("NFD").replace(/[̀-ͯ]/g, "");
  const translit = s => s.toLowerCase().replace(/ä/g, "ae").replace(/ö/g, "oe").replace(/ü/g, "ue").replace(/ß/g, "ss");
  const ITEMS = new Map();
  for (const [iso, name, region, grp] of G.countries) ITEMS.set(iso, { iso, name, region, cont: REG.get(region).cont, grp, kind: "c" });
  for (const [iso, name, region] of G.territories) ITEMS.set(iso, { iso, name, region, cont: REG.get(region).cont, grp: "", kind: "t" });
  for (const it of ITEMS.values()) it.key = [norm(it.name), translit(it.name), norm(ALIASES[it.iso] || ""), it.iso.toLowerCase()].join(" | ");
  const N_C = G.countries.length, N_T = G.territories.length;
  const collator = new Intl.Collator("de");
  const esc = s => String(s).replace(/[&<>"']/g, ch => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[ch]));
  const $ = id => document.getElementById(id);

  // ---------- Gerät (localStorage) ----------
  const LS = {
    get(k) { try { const v = localStorage.getItem(k); return v ? JSON.parse(v) : null; } catch (e) { return null; } },
    set(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) { /* Speicher nicht verfügbar */ } },
    del(k) { try { localStorage.removeItem(k); } catch (e) { /* egal */ } }
  };
  const DEVICE_KEY = DEMO ? "laenderatlas.demo.geraet" : "laenderatlas.geraet";
  const device = Object.assign({ owner: DEMO ? "johannes" : "", token: "", repo: "" }, LS.get(DEVICE_KEY) || {});
  const saveDevice = () => LS.set(DEVICE_KEY, device);
  function detectRepo() {
    const h = location.hostname;
    if (!h.endsWith(".github.io")) return "";
    const owner = h.slice(0, -".github.io".length);
    const seg = location.pathname.split("/").filter(Boolean)[0];
    return seg && !seg.includes(".") ? `${owner}/${seg}` : `${owner}/${h}`;
  }
  const repo = () => (device.repo || detectRepo()).trim();
  const scope = () => DEMO ? "demo" : (repo() || "lokal");
  const draftKey = id => `laenderatlas.entwurf.${scope()}.${id}`;

  // ---------- Zustand ----------
  const S = {
    profiles: [],          // [{id, name, slot}]
    data: new Map(),       // id -> {base, local, sha, updated, state: "loading"|"ok"|"error", error}
    view: "",
    tab: "c",
    filter: "all",
    collapsed: new Set(),
    saving: false,
    saveError: ""
  };
  const profile = id => S.profiles.find(p => p.id === id);
  const isCompare = () => S.view === "vergleich";
  const pA = () => S.profiles[0], pB = () => S.profiles[1];
  function canEdit(id) {
    if (!id || id !== device.owner) return false;
    return DEMO || (!!device.token && !!repo());
  }
  function editReason(id) {
    if (isCompare()) return "In der Vergleichsansicht wird nichts bearbeitet.";
    const p = profile(id);
    if (!device.owner) return "Unter Einstellungen festlegen, wem dieses Gerät gehört.";
    if (id !== device.owner) return `Das ist die Karte von ${p.name}. Bearbeiten nur auf dem Gerät von ${p.name}.`;
    if (!repo()) return "Unter Einstellungen das GitHub-Repository eintragen.";
    return "Zum Bearbeiten unter Einstellungen einen GitHub-Token eintragen.";
  }
  const statusOf = (id, iso) => { const d = S.data.get(id); return (d && d.local[iso]) || ""; };

  // ---------- Datenformat ----------
  function parseData(o) {
    const st = {};
    const add = (arr, s) => Array.isArray(arr) && arr.forEach(x => {
      const k = String(x).trim().toUpperCase();
      if (/^[A-Z]{2}$/.test(k)) st[k] = s;
    });
    add(o && o.geplant, "p"); add(o && o.bereist, "v");
    add(o && o.gebiete && o.gebiete.geplant, "p"); add(o && o.gebiete && o.gebiete.bereist, "v");
    return { status: st, updated: (o && o.aktualisiert) || null };
  }
  function serialize(id, status) {
    const c = { v: [], p: [] }, t = { v: [], p: [] };
    for (const [iso, s] of Object.entries(status)) {
      if (s !== "v" && s !== "p") continue;
      const it = ITEMS.get(iso);
      (it && it.kind === "t" ? t : c)[s].push(iso);
    }
    [c.v, c.p, t.v, t.p].forEach(a => a.sort());
    return JSON.stringify({
      profil: id, aktualisiert: new Date().toISOString(),
      bereist: c.v, geplant: c.p, gebiete: { bereist: t.v, geplant: t.p }
    }, null, 2) + "\n";
  }
  function changes(id) {
    const d = S.data.get(id), out = {};
    if (!d || d.state !== "ok") return out;
    for (const k of new Set([...Object.keys(d.base), ...Object.keys(d.local)])) {
      if ((d.base[k] || "") !== (d.local[k] || "")) out[k] = d.local[k] || "";
    }
    return out;
  }
  function applyChanges(target, ch) {
    for (const [k, s] of Object.entries(ch)) { if (s) target[k] = s; else delete target[k]; }
  }
  function storeDraft(id) {
    const ch = changes(id);
    if (Object.keys(ch).length) LS.set(draftKey(id), ch); else LS.del(draftKey(id));
  }
  function commitMessage(name, ch) {
    const g = { v: [], p: [], "": [] };
    for (const [k, s] of Object.entries(ch)) g[s].push(k);
    const fmt = (label, arr, sign) => arr.length ? `${label} ${arr.sort().slice(0, 12).map(k => sign + k).join(" ")}${arr.length > 12 ? " …" : ""}` : "";
    const parts = [fmt("bereist", g.v, "+"), fmt("geplant", g.p, "+"), fmt("entfernt", g[""], "")].filter(Boolean);
    return `Länderatlas ${name}: ${parts.join("; ")}`;
  }

  // ---------- GitHub ----------
  const API = "https://api.github.com";
  function b64encode(str) {
    const bytes = new TextEncoder().encode(str);
    let bin = "";
    for (let i = 0; i < bytes.length; i += 0x8000) bin += String.fromCharCode.apply(null, bytes.subarray(i, i + 0x8000));
    return btoa(bin);
  }
  function b64decode(b64) {
    const bin = atob(String(b64).replace(/\s/g, ""));
    return new TextDecoder().decode(Uint8Array.from(bin, ch => ch.charCodeAt(0)));
  }
  function ghHeaders(json) {
    const h = { "Accept": "application/vnd.github+json", "Authorization": "Bearer " + device.token, "X-GitHub-Api-Version": "2022-11-28" };
    if (json) h["Content-Type"] = "application/json";
    return h;
  }
  function httpError(status, body) { const e = new Error("HTTP " + status); e.status = status; e.body = body || ""; return e; }
  async function ghGet(path) {
    const r = await fetch(`${API}/repos/${repo()}/contents/${path}`, { headers: ghHeaders(), cache: "no-store" });
    if (r.status === 404) return { text: null, sha: null };
    if (!r.ok) throw httpError(r.status, await r.text().catch(() => ""));
    const j = await r.json();
    return { text: b64decode(j.content), sha: j.sha };
  }
  async function ghPut(path, text, sha, message) {
    const body = { message, content: b64encode(text) };
    if (sha) body.sha = sha;
    const r = await fetch(`${API}/repos/${repo()}/contents/${path}`, { method: "PUT", headers: ghHeaders(true), body: JSON.stringify(body) });
    if (!r.ok) throw httpError(r.status, await r.text().catch(() => ""));
    const j = await r.json();
    return j.content.sha;
  }
  async function fetchPublic(path) {
    const r = await fetch(`${path}?t=${Date.now()}`, { cache: "no-store" });
    if (r.status === 404) return null;
    if (!r.ok) throw httpError(r.status);
    return r.text();
  }
  const useApi = () => !DEMO && !!device.token && !!repo();

  async function loadProfiles() {
    if (DEMO) return CFG.demo.profiles;
    let text;
    if (useApi()) { try { text = (await ghGet("data/profile.json")).text; } catch (e) { text = null; } }
    if (text == null) text = await fetchPublic("data/profile.json");
    if (text == null) throw new Error("data/profile.json fehlt im Repo.");
    const arr = JSON.parse(text);
    if (!Array.isArray(arr) || !arr.length) throw new Error("data/profile.json enthält keine Profile.");
    return arr.filter(p => p && /^[a-z0-9-]+$/.test(p.id) && p.name);
  }
  async function loadRemote(id) {
    if (DEMO) {
      const saved = LS.get(`laenderatlas.demo.daten.${id}`);
      return { ...parseData(saved || CFG.demo.data[id] || {}), sha: null };
    }
    if (useApi()) {
      try {
        const { text, sha } = await ghGet(`data/${id}.json`);
        return { ...parseData(text ? JSON.parse(text) : {}), sha };
      } catch (e) {
        if (e.status !== 401 && e.status !== 403) throw e;
        // Token abgelehnt: zum Ansehen auf die veröffentlichte Datei ausweichen
        const text = await fetchPublic(`data/${id}.json`);
        return { ...parseData(text ? JSON.parse(text) : {}), sha: null, warn: e.status };
      }
    }
    const text = await fetchPublic(`data/${id}.json`);
    return { ...parseData(text ? JSON.parse(text) : {}), sha: null };
  }
  async function loadProfile(id) {
    const d = { base: {}, local: {}, sha: null, updated: null, state: "loading", error: "" };
    S.data.set(id, d);
    try {
      const r = await loadRemote(id);
      d.base = r.status; d.local = { ...r.status }; d.sha = r.sha; d.updated = r.updated; d.state = "ok"; d.warn = r.warn || 0;
      const draft = LS.get(draftKey(id));
      if (draft && id === device.owner) applyChanges(d.local, draft);
    } catch (e) {
      d.state = "error";
      d.error = e.status ? `HTTP ${e.status}` : (e.message || "Netzwerkfehler");
    }
  }

  // ---------- Karte ----------
  const svg = d3.select("#map");
  const W = 1000, PAD = 6;
  const fc = topojson.feature(G.topo, G.topo.objects.countries);
  const proj = d3.geoNaturalEarth1().rotate([-11, 0]).fitExtent([[PAD, PAD], [W - PAD, 5000]], fc);
  const path = d3.geoPath(proj);
  const bb = path.bounds(fc);
  const t0 = proj.translate();
  proj.translate([t0[0], t0[1] + PAD - bb[0][1]]);
  const H = Math.ceil(bb[1][1] - bb[0][1] + PAD * 2);
  svg.attr("viewBox", `0 0 ${W} ${H}`);
  const defs = svg.append("defs");
  const pat = defs.append("pattern").attr("id", "both").attr("patternUnits", "userSpaceOnUse").attr("patternTransform", "rotate(45)");
  const patA = pat.append("rect").attr("style", "fill: var(--p1)");
  const patB = pat.append("rect").attr("style", "fill: var(--p2)");
  function setPattern(k) {
    const w = 7 / k;
    pat.attr("width", w).attr("height", w);
    patA.attr("width", w).attr("height", w);
    patB.attr("width", w / 2).attr("height", w);
  }
  setPattern(1);
  const root = svg.append("g");
  root.append("path").attr("class", "grat").attr("d", path(d3.geoGraticule().step([20, 20])()));
  const areas = root.append("g").selectAll("path")
    .data(fc.features).join("path")
    .attr("d", path)
    .attr("data-iso", d => d.properties.i || null);
  const markerData = Object.entries(G.markers).map(([iso, ll]) => ({ iso, xy: proj(ll), kind: ITEMS.get(iso).kind }));
  markerData.sort((a, b) => (a.kind === "t") - (b.kind === "t"));
  const markers = root.append("g").selectAll("g")
    .data(markerData).join(enter => enter.append(d => document.createElementNS("http://www.w3.org/2000/svg", d.kind === "t" ? "rect" : "circle")))
    .attr("data-iso", d => d.iso);
  markers.filter(d => d.kind === "c").attr("r", 3.4);
  markers.filter(d => d.kind === "t").attr("x", -2.6).attr("y", -2.6).attr("width", 5.2).attr("height", 5.2);
  let zoomK = 1;
  function placeMarkers() {
    const f = 1 / Math.sqrt(zoomK);
    markers.attr("transform", d => `translate(${d.xy[0]},${d.xy[1]}) scale(${f})${d.kind === "t" ? " rotate(45)" : ""}`);
  }
  placeMarkers();

  function stateClass(iso) {
    if (isCompare()) {
      const a = pA() && statusOf(pA().id, iso) === "v";
      const b = pB() && statusOf(pB().id, iso) === "v";
      return a && b ? "ab" : a ? "a" : b ? "b" : "";
    }
    return statusOf(S.view, iso);
  }
  function paintMap() {
    areas.attr("class", d => {
      const p = d.properties;
      if (p.k === "n") return "c n";
      const s = stateClass(p.i);
      return "c" + (p.k === "t" ? " t" : "") + (s ? " " + s : "");
    });
    markers.attr("class", d => {
      const s = stateClass(d.iso);
      return "m" + (d.kind === "t" ? " t" : "") + (s ? " " + s : "");
    });
    svg.classed("show-terr", S.tab === "t" || zoomK >= 2.5);
  }

  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const zoom = d3.zoom()
    .scaleExtent([1, 16])
    .translateExtent([[0, 0], [W, H]])
    .clickDistance(5)
    .filter(ev => {
      if (ev.type === "wheel") return ev.ctrlKey || ev.metaKey;
      if (ev.type === "dblclick") return false;
      if (ev.type.startsWith("touch")) return ev.touches && ev.touches.length >= 2;
      return !ev.button;
    })
    .on("start", ev => { if (ev.sourceEvent && ev.sourceEvent.type === "mousedown") svg.classed("dragging", true); })
    .on("zoom", ev => {
      root.attr("transform", ev.transform);
      zoomK = ev.transform.k;
      placeMarkers();
      setPattern(zoomK);
      svg.classed("show-terr", S.tab === "t" || zoomK >= 2.5);
    })
    .on("end", () => svg.classed("dragging", false));
  svg.call(zoom).on("dblclick.zoom", null);
  svg.style("touch-action", "pan-x pan-y");
  const dur = reduceMotion ? 0 : 300;
  $("z-in").onclick = () => svg.transition().duration(dur).call(zoom.scaleBy, 1.8);
  $("z-out").onclick = () => svg.transition().duration(dur).call(zoom.scaleBy, 1 / 1.8);
  $("z-reset").onclick = () => svg.transition().duration(dur).call(zoom.transform, d3.zoomIdentity);

  // Tooltip, Klick
  const frame = document.querySelector("#plate .frame");
  const tip = $("tip"), toastEl = $("toast");
  let toastTimer;
  function toast(msg) {
    toastEl.textContent = msg;
    toastEl.classList.add("show");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => toastEl.classList.remove("show"), 2600);
  }
  const LABEL = { v: "bereist", p: "geplant", "": "offen" };
  function describe(el) {
    const iso = el.getAttribute("data-iso");
    if (!iso) { const d = d3.select(el).datum(); return { title: d.properties.n || "Gebiet", sub: "zählt nicht" }; }
    const it = ITEMS.get(iso);
    const where = REG.get(it.region).name + (it.kind === "t" ? " · Gebiet" : "");
    if (isCompare()) {
      const parts = [pA(), pB()].filter(Boolean).map(p => `${p.name}: ${statusOf(p.id, iso) === "v" ? "bereist" : "–"}`);
      return { title: it.name, sub: `${where} · ${parts.join(" · ")}` };
    }
    const hint = canEdit(S.view) ? " · Klick wechselt" : "";
    return { title: it.name, sub: `${where} · ${LABEL[statusOf(S.view, iso)]}${hint}` };
  }
  const hitTarget = t => (t && t.closest ? t.closest("path.c, .m") : null);
  function showTip(el, ev) {
    const { title, sub } = describe(el);
    tip.innerHTML = `<b>${esc(title)}</b><small>${esc(sub)}</small>`;
    tip.hidden = false;
    const r = frame.getBoundingClientRect();
    let x = ev.clientX - r.left + 14, y = ev.clientY - r.top + 14;
    if (x + tip.offsetWidth > r.width - 8) x = ev.clientX - r.left - tip.offsetWidth - 14;
    if (y + tip.offsetHeight > r.height - 8) y = ev.clientY - r.top - tip.offsetHeight - 14;
    tip.style.left = Math.max(4, x) + "px"; tip.style.top = Math.max(4, y) + "px";
  }
  let lastHover = null;
  svg.on("pointermove", ev => {
    if (ev.pointerType === "touch") return;
    const el = hitTarget(ev.target);
    if (!el) { tip.hidden = true; lastHover = null; return; }
    lastHover = el;
    showTip(el, ev);
  });
  svg.on("pointerleave", () => { tip.hidden = true; lastHover = null; });
  svg.on("click", ev => {
    const el = hitTarget(ev.target);
    if (!el) return;
    const iso = el.getAttribute("data-iso");
    if (!iso) { toast(`${d3.select(el).datum().properties.n} zählt nicht`); return; }
    const it = ITEMS.get(iso);
    if (isCompare() || !canEdit(S.view)) {
      const { sub } = describe(el);
      toast(isCompare() ? `${it.name}: ${sub.split(" · ").slice(-2).join(" · ")}` : `${it.name}: ${LABEL[statusOf(S.view, iso)]}. ${editReason(S.view)}`);
      return;
    }
    const next = { "": "v", v: "p", p: "" }[statusOf(S.view, iso)];
    setStatus(iso, next);
    toast(`${it.name}: ${LABEL[next]}`);
    if (it.kind !== S.tab) { /* Zeile liegt im anderen Reiter */ } else {
      const row = rowEls.get(iso);
      if (row && !row.hidden) { row.classList.remove("flash"); void row.offsetWidth; row.classList.add("flash"); }
    }
    if (lastHover === el) showTip(el, ev);
  });

  // ---------- Kopf, Kontext, Legende ----------
  function renderNav() {
    const nav = $("views");
    nav.innerHTML = "";
    const links = S.profiles.map(p => ({ id: p.id, label: p.name, dot: `s${p.slot}` }));
    if (S.profiles.length >= 2) links.push({ id: "vergleich", label: "Vergleich", dot: "both" });
    for (const l of links) {
      const a = document.createElement("a");
      a.href = "#" + l.id;
      a.innerHTML = `<i class="dot ${l.dot}" aria-hidden="true"></i>${esc(l.label)}`;
      if (l.id === S.view) a.setAttribute("aria-current", "page");
      nav.append(a);
    }
  }
  const dtf = new Intl.DateTimeFormat("de-AT", { day: "2-digit", month: "2-digit", year: "numeric", hour: "2-digit", minute: "2-digit" });
  function fmtDate(iso) { const d = new Date(iso); return isNaN(d) ? "" : dtf.format(d); }
  function renderContext() {
    const who = $("ctx-who"), badge = $("ctx-badge"), meta = $("ctx-meta");
    meta.classList.remove("err");
    if (isCompare()) {
      who.textContent = `Vergleich: ${pA().name} und ${pB().name}`;
      badge.hidden = true;
      meta.textContent = "Bereiste Länder beider Karten übereinander";
    } else {
      const p = profile(S.view), d = S.data.get(S.view);
      who.textContent = `Karte von ${p.name}`;
      badge.hidden = false;
      const ed = canEdit(p.id);
      badge.textContent = ed ? "bearbeitbar" : "nur ansehen";
      badge.classList.toggle("edit", ed);
      if (!d || d.state === "loading") meta.textContent = "Wird geladen …";
      else if (d.state === "error") { meta.textContent = `Konnte nicht geladen werden (${d.error}). Liegt data/${p.id}.json im Repo?`; meta.classList.add("err"); }
      else meta.textContent = d.updated ? `Stand ${fmtDate(d.updated)}` : (Object.keys(d.base).length ? "" : "Noch keine Einträge gespeichert");
      if (!ed && d && d.state === "ok" && p.id === device.owner) meta.textContent += ` · ${editReason(p.id)}`;
      if (d && d.warn) { meta.textContent += ` · GitHub lehnt den Token ab (HTTP ${d.warn}); Einstellungen prüfen.`; meta.classList.add("err"); }
    }
  }
  function renderLegend() {
    const lg = $("legend");
    if (isCompare()) {
      lg.innerHTML = `<span><i class="sw a"></i>nur ${esc(pA().name)}</span><span><i class="sw b"></i>nur ${esc(pB().name)}</span>` +
        `<span><i class="sw ab"></i>beide</span><span><i class="sw o"></i>keiner</span><span><i class="sw dot"></i>Kleinstaat</span><span><i class="sw dia"></i>Gebiet</span>`;
    } else {
      lg.innerHTML = `<span><i class="sw v"></i>Bereist</span><span><i class="sw p"></i>Geplant</span><span><i class="sw o"></i>Offen</span>` +
        `<span><i class="sw t"></i>Gebiet, zählt separat</span><span><i class="sw dot"></i>Kleinstaat</span><span><i class="sw dia"></i>Gebiet (Punkt)</span>`;
    }
  }
  function applyViewColor() {
    const p = isCompare() ? null : profile(S.view);
    const slot = p ? p.slot : 1;
    document.documentElement.style.setProperty("--vis", `var(--p${slot})`);
    document.documentElement.style.setProperty("--on-vis", `var(--on-p${slot})`);
  }

  // ---------- Statistik ----------
  const nf1 = new Intl.NumberFormat("de-AT", { minimumFractionDigits: 1, maximumFractionDigits: 1 });
  const pct = (x, y) => y ? nf1.format(x / y * 100) + " %" : "–";
  function tally(kind, tagsOf) {
    const out = { all: { n: 0 }, cont: {}, reg: {} };
    const bump = (o, tags) => { o.n++; for (const t of tags) o[t] = (o[t] || 0) + 1; };
    for (const it of ITEMS.values()) {
      if (it.kind !== kind) continue;
      const tags = tagsOf(it.iso);
      bump(out.all, tags);
      bump(out.cont[it.cont] ||= { n: 0 }, tags);
      bump(out.reg[it.region] ||= { n: 0 }, tags);
    }
    return out;
  }
  const profileTags = id => iso => { const s = statusOf(id, iso); return s ? [s] : []; };
  function compareTags(iso) {
    const a = statusOf(pA().id, iso) === "v", b = statusOf(pB().id, iso) === "v";
    const t = [];
    if (a) t.push("a"); if (b) t.push("b"); if (a && b) t.push("both"); if (a || b) t.push("u");
    return t;
  }
  const g0 = (o, k) => (o && o[k]) || 0;
  const barHtml = (n, v, p) => `<div class="bar" aria-hidden="true"><span class="v" style="width:${n ? v / n * 100 : 0}%"></span><span class="p" style="width:${n ? p / n * 100 : 0}%"></span></div>`;
  function discBtn(cont) {
    const open = !S.collapsed.has(cont);
    return `<button type="button" class="disc" data-cont="${cont}" aria-expanded="${open}">${esc(CONT.get(cont))}</button>`;
  }

  function renderStats() {
    const el = $("stats");
    if (isCompare()) return renderCompareStats(el);
    const p = profile(S.view), d = S.data.get(S.view);
    if (!d || d.state !== "ok") { el.innerHTML = `<h2 class="eyebrow">Statistik</h2><p class="world-sub">${d && d.state === "error" ? "Keine Daten." : "Wird geladen …"}</p>`; return; }
    const c = tally("c", profileTags(p.id));
    const t = tally("t", profileTags(p.id));
    const contsVisited = ORDER_C.filter(k => g0(c.cont[k], "v") > 0).length;
    const regsVisited = Object.values(c.reg).filter(r => g0(r, "v") > 0).length;
    const nRegs = Object.keys(c.reg).length;
    let rows = "";
    for (const k of ORDER_C) {
      const x = c.cont[k];
      const open = !S.collapsed.has(k);
      rows += `<tr class="cont-row${g0(x, "v") ? "" : " zero"}"><th scope="row">${discBtn(k)}</th><td class="num">${g0(x, "v")}/${x.n}</td><td class="num">${pct(g0(x, "v"), x.n)}</td><td class="barcell">${barHtml(x.n, g0(x, "v"), g0(x, "p"))}</td><td class="num">${g0(x, "p")}</td></tr>`;
      for (const r of regionsOf(k)) {
        const y = c.reg[r];
        if (!y) continue;
        rows += `<tr class="reg${g0(y, "v") ? "" : " zero"}" data-cont="${k}"${open ? "" : " hidden"}><th scope="row">${esc(REG.get(r).name)}</th><td class="num">${g0(y, "v")}/${y.n}</td><td class="num">${pct(g0(y, "v"), y.n)}</td><td class="barcell">${barHtml(y.n, g0(y, "v"), g0(y, "p"))}</td><td class="num">${g0(y, "p")}</td></tr>`;
      }
    }
    el.innerHTML = `
      <h2 class="eyebrow">Statistik · ${esc(p.name)}</h2>
      <div class="world">
        <p class="world-line">Länder (Welt): <b class="hl">${g0(c.all, "v")}</b>/<b>${c.all.n}</b>, d. h. <b class="hl">${pct(g0(c.all, "v"), c.all.n)}</b></p>
        <div class="bar big" aria-hidden="true"><span class="v" style="width:${g0(c.all, "v") / c.all.n * 100}%"></span><span class="p" style="width:${g0(c.all, "p") / c.all.n * 100}%"></span></div>
        <p class="world-sub">Geplant: <b>${g0(c.all, "p")}</b> · Mit allen geplanten Reisen: <b>${g0(c.all, "v") + g0(c.all, "p")}/${c.all.n}, d. h. ${pct(g0(c.all, "v") + g0(c.all, "p"), c.all.n)}</b> · Kontinente betreten: <b>${contsVisited}/${ORDER_C.length}</b> · Regionen betreten: <b>${regsVisited}/${nRegs}</b></p>
      </div>
      <div class="table-wrap">
        <table class="cont">
          <caption class="eyebrow">Länder (pro Kontinent und UN-M49-Region)</caption>
          <thead><tr><th scope="col">Kontinent / Region</th><th scope="col" class="num">Bereist</th><th scope="col" class="num">d. h.</th><th scope="col">Anteil bereist und geplant</th><th scope="col" class="num">Geplant</th></tr></thead>
          <tbody>${rows}</tbody>
        </table>
      </div>
      <p class="terr-line">Gebiete (zählen separat): <b>${g0(t.all, "v")}/${t.all.n}</b>, d. h. <b>${pct(g0(t.all, "v"), t.all.n)}</b> · geplant <b>${g0(t.all, "p")}</b></p>
      <p class="foot">Kontinente und Regionen nach UN-M49. Kosovo und Taiwan stehen nicht in M49 und zählen zu Südeuropa bzw. Ostasien. Auffällige M49-Zuordnungen: Iran → Südasien, Mexiko → Mittelamerika, Sudan → Nordafrika, Zypern und Türkei → Westasien, Russland → Osteuropa.</p>`;
  }
  function renderCompareStats(el) {
    const a = pA(), b = pB();
    const da = S.data.get(a.id), db = S.data.get(b.id);
    if (!da || !db || da.state !== "ok" || db.state !== "ok") {
      el.innerHTML = `<h2 class="eyebrow">Vergleich</h2><p class="world-sub">${(da && da.state === "error") || (db && db.state === "error") ? "Eine der Karten konnte nicht geladen werden." : "Wird geladen …"}</p>`;
      return;
    }
    const c = tally("c", compareTags), t = tally("t", compareTags);
    const cell = (o, k) => `<td class="num">${g0(o, k)} · ${pct(g0(o, k), o.n)}</td>`;
    let rows = "";
    for (const k of ORDER_C) {
      const x = c.cont[k], open = !S.collapsed.has(k);
      rows += `<tr class="cont-row"><th scope="row">${discBtn(k)}</th><td class="num">${x.n}</td>${cell(x, "a")}${cell(x, "b")}${cell(x, "both")}${cell(x, "u")}</tr>`;
      for (const r of regionsOf(k)) {
        const y = c.reg[r];
        if (!y) continue;
        rows += `<tr class="reg${g0(y, "u") ? "" : " zero"}" data-cont="${k}"${open ? "" : " hidden"}><th scope="row">${esc(REG.get(r).name)}</th><td class="num">${y.n}</td>${cell(y, "a")}${cell(y, "b")}${cell(y, "both")}${cell(y, "u")}</tr>`;
      }
    }
    const all = c.all;
    el.innerHTML = `
      <h2 class="eyebrow">Vergleich</h2>
      <div class="world">
        <p class="world-line small"><span class="hl1">${esc(a.name)}</span>: <b class="hl1">${g0(all, "a")}</b>/<b>${all.n}</b>, d. h. <b class="hl1">${pct(g0(all, "a"), all.n)}</b></p>
        <p class="world-line small"><span class="hl2">${esc(b.name)}</span>: <b class="hl2">${g0(all, "b")}</b>/<b>${all.n}</b>, d. h. <b class="hl2">${pct(g0(all, "b"), all.n)}</b></p>
        <p class="world-sub">Gemeinsam bereist: <b>${g0(all, "both")}</b> · Zusammen: <b>${g0(all, "u")}/${all.n}, d. h. ${pct(g0(all, "u"), all.n)}</b> · Gebiete: ${esc(a.name)} <b>${g0(t.all, "a")}</b>, ${esc(b.name)} <b>${g0(t.all, "b")}</b>, beide <b>${g0(t.all, "both")}</b> von ${t.all.n}</p>
      </div>
      <div class="table-wrap">
        <table class="cont">
          <caption class="eyebrow">Bereiste Länder (pro Kontinent und UN-M49-Region)</caption>
          <thead><tr><th scope="col">Kontinent / Region</th><th scope="col" class="num">Länder</th><th scope="col" class="num">${esc(a.name)}</th><th scope="col" class="num">${esc(b.name)}</th><th scope="col" class="num">Beide</th><th scope="col" class="num">Zusammen</th></tr></thead>
          <tbody>${rows}</tbody>
        </table>
      </div>
      <p class="foot">Verglichen werden nur bereiste Länder. Kontinente und Regionen nach UN-M49; Kosovo zählt zu Südeuropa, Taiwan zu Ostasien.</p>`;
  }
  $("stats").addEventListener("click", ev => {
    const b = ev.target.closest(".disc");
    if (!b) return;
    const k = b.dataset.cont;
    if (S.collapsed.has(k)) S.collapsed.delete(k); else S.collapsed.add(k);
    b.setAttribute("aria-expanded", String(!S.collapsed.has(k)));
    document.querySelectorAll(`#stats tr.reg[data-cont="${k}"]`).forEach(tr => tr.hidden = S.collapsed.has(k));
  });

  // ---------- Register ----------
  const list = $("list"), q = $("q"), empty = $("empty");
  const rowEls = new Map();
  const grpEls = [];
  function filterDefs() {
    if (isCompare()) return [["all", "Alle"], ["both", "Beide"], ["a", "Nur " + pA().name], ["b", "Nur " + pB().name]];
    return [["all", "Alle"], ["v", "Bereist"], ["p", "Geplant"], ["o", "Offen"]];
  }
  function renderFilters() {
    const defs = filterDefs();
    if (!defs.some(d => d[0] === S.filter)) S.filter = "all";
    $("filters").innerHTML = defs.map(([k, label]) => `<button type="button" data-f="${k}" aria-pressed="${k === S.filter}">${esc(label)}<span data-count="${k}">0</span></button>`).join("");
  }
  function updateFilterCounts() {
    const counts = { all: 0 };
    for (const it of ITEMS.values()) {
      if (it.kind !== S.tab) continue;
      counts.all++;
      for (const k of rowTags(it.iso)) counts[k] = (counts[k] || 0) + 1;
    }
    document.querySelectorAll("#filters [data-count]").forEach(s => s.textContent = counts[s.dataset.count] || 0);
  }
  function rowTags(iso) {
    if (isCompare()) {
      const a = statusOf(pA().id, iso) === "v", b = statusOf(pB().id, iso) === "v";
      return a && b ? ["both"] : a ? ["a"] : b ? ["b"] : [];
    }
    const s = statusOf(S.view, iso);
    return s ? [s] : ["o"];
  }
  function buildList() {
    list.innerHTML = "";
    rowEls.clear();
    grpEls.length = 0;
    const editable = !isCompare() && canEdit(S.view);
    const order = S.tab === "c" ? ORDER_C : ORDER_T;
    for (const k of order) {
      const members = [...ITEMS.values()].filter(it => it.kind === S.tab && it.cont === k);
      if (!members.length) continue;
      const li = document.createElement("li");
      li.innerHTML = `<h3 class="grp-h">${esc(CONT.get(k))} <span></span></h3>`;
      const regs = [];
      for (const r of regionsOf(k)) {
        const rm = members.filter(it => it.region === r).sort((x, y) => collator.compare(x.name, y.name));
        if (!rm.length) continue;
        const h = document.createElement("h4");
        h.className = "reg-h";
        h.innerHTML = `${esc(REG.get(r).name)} <span></span>`;
        const ul = document.createElement("ul");
        ul.className = "rows";
        for (const it of rm) {
          const row = document.createElement("li");
          row.className = "row";
          row.dataset.iso = it.iso;
          const note = GROUP_NOTE[it.grp] ? ` <small>· ${GROUP_NOTE[it.grp]}</small>` : "";
          let right;
          if (isCompare()) right = `<span class="pair" aria-hidden="true"><i data-p="1">${esc(pA().name[0])}</i><i data-p="2">${esc(pB().name[0])}</i></span>`;
          else if (editable) right = `<span class="seg" role="group" aria-label="Status ${esc(it.name)}"><button type="button" data-s="v" aria-pressed="false">Bereist</button><button type="button" data-s="p" aria-pressed="false">Geplant</button></span>`;
          else right = `<span class="state"></span>`;
          row.innerHTML = `<span class="code">${it.iso}</span><span class="name">${esc(it.name)}${note}</span>${right}`;
          ul.append(row);
          rowEls.set(it.iso, row);
        }
        li.append(h, ul);
        regs.push({ code: r, h, ul, items: rm });
      }
      list.append(li);
      grpEls.push({ cont: k, li, count: li.querySelector(".grp-h span"), regs });
    }
    for (const iso of rowEls.keys()) paintRow(iso);
    updateCounts();
    applyFilter();
    $("reg-h").textContent = isCompare() ? "Länder vergleichen" : editable ? "Länder auswählen" : "Länder";
    $("q-hint").innerHTML = editable
      ? "<kbd>Enter</kbd> markiert den ersten Treffer als bereist, <kbd>Umschalt</kbd>+<kbd>Enter</kbd> als geplant."
      : esc(isCompare() ? "Kreise zeigen, wer das Land bereist hat." : editReason(S.view));
  }
  function paintRow(iso) {
    const row = rowEls.get(iso);
    if (!row) return;
    if (isCompare()) {
      row.classList.remove("v", "p");
      const pa = row.querySelector('[data-p="1"]'), pb = row.querySelector('[data-p="2"]');
      pa.classList.toggle("on1", statusOf(pA().id, iso) === "v");
      pb.classList.toggle("on2", statusOf(pB().id, iso) === "v");
      return;
    }
    const s = statusOf(S.view, iso);
    row.classList.toggle("v", s === "v");
    row.classList.toggle("p", s === "p");
    row.querySelectorAll("button[data-s]").forEach(b => b.setAttribute("aria-pressed", String(b.dataset.s === s)));
    const st = row.querySelector(".state");
    if (st) st.textContent = s ? LABEL[s] : "";
  }
  function updateCounts() {
    for (const g of grpEls) {
      const count = (items, tag) => items.filter(it => rowTags(it.iso).includes(tag)).length;
      const all = g.regs.flatMap(r => r.items);
      const tag = isCompare() ? "u" : "v";
      const fn = items => isCompare()
        ? items.filter(it => statusOf(pA().id, it.iso) === "v" || statusOf(pB().id, it.iso) === "v").length
        : count(items, tag);
      g.count.textContent = `${fn(all)}/${all.length}`;
      for (const r of g.regs) r.h.querySelector("span").textContent = `${fn(r.items)}/${r.items.length}`;
    }
    updateFilterCounts();
  }
  function applyFilter() {
    const needle = norm(q.value.trim());
    let shown = 0;
    for (const g of grpEls) {
      let gShown = 0;
      for (const r of g.regs) {
        let n = 0;
        for (const it of r.items) {
          const ok = (S.filter === "all" || rowTags(it.iso).includes(S.filter)) && (!needle || it.key.includes(needle));
          rowEls.get(it.iso).hidden = !ok;
          if (ok) n++;
        }
        r.h.hidden = r.ul.hidden = n === 0;
        gShown += n;
      }
      g.li.hidden = gShown === 0;
      shown += gShown;
    }
    empty.hidden = shown > 0;
    if (!shown) empty.textContent = q.value.trim() ? `Nichts gefunden für „${q.value.trim()}“${S.filter !== "all" ? " in diesem Filter" : ""}.` : "In diesem Filter ist noch nichts.";
  }
  function firstVisible() {
    for (const [iso, row] of rowEls) if (!row.hidden && !row.parentElement.hidden && !row.closest("li:not(.row)").hidden) return iso;
    return null;
  }
  list.addEventListener("click", ev => {
    const btn = ev.target.closest("button[data-s]");
    if (!btn) return;
    const iso = btn.closest(".row").dataset.iso;
    const s = btn.dataset.s;
    setStatus(iso, statusOf(S.view, iso) === s ? "" : s);
  });
  const highlight = (iso, on) => svg.selectAll(`[data-iso="${iso}"]`).classed("hl", on);
  list.addEventListener("pointerover", ev => {
    if (ev.pointerType !== "mouse") return;
    const row = ev.target.closest(".row");
    if (row) highlight(row.dataset.iso, true);
  });
  list.addEventListener("pointerout", ev => {
    const row = ev.target.closest(".row");
    if (row && !row.contains(ev.relatedTarget)) highlight(row.dataset.iso, false);
  });
  q.addEventListener("input", applyFilter);
  q.addEventListener("keydown", ev => {
    if (ev.key !== "Enter") return;
    ev.preventDefault();
    if (isCompare() || !canEdit(S.view)) return;
    const iso = firstVisible();
    if (!iso) return;
    const s = ev.shiftKey ? "p" : "v";
    setStatus(iso, s);
    toast(`${ITEMS.get(iso).name}: ${LABEL[s]}`);
    q.select();
  });
  $("filters").addEventListener("click", ev => {
    const b = ev.target.closest("button[data-f]");
    if (!b) return;
    S.filter = b.dataset.f;
    document.querySelectorAll("#filters button").forEach(x => x.setAttribute("aria-pressed", String(x === b)));
    applyFilter();
  });
  document.querySelector(".tabs").addEventListener("click", ev => {
    const b = ev.target.closest("button[data-tab]");
    if (!b || b.dataset.tab === S.tab) return;
    S.tab = b.dataset.tab;
    document.querySelectorAll(".tabs button").forEach(x => x.setAttribute("aria-selected", String(x === b)));
    buildList();
    paintMap();
  });

  // ---------- Ändern und Speichern ----------
  function setStatus(iso, s) {
    const d = S.data.get(S.view);
    if (!d || d.state !== "ok") return;
    if (s) d.local[iso] = s; else delete d.local[iso];
    storeDraft(S.view);
    S.saveError = "";
    paintRow(iso);
    paintMap();
    renderStats();
    updateCounts();
    if (S.filter !== "all") applyFilter();
    renderSavebar();
  }
  function ownerChanges() { return device.owner && S.data.get(device.owner) ? changes(device.owner) : {}; }
  function renderSavebar() {
    const ch = ownerChanges();
    const n = Object.keys(ch).length;
    const bar = $("savebar"), msg = $("save-msg");
    bar.hidden = n === 0 && !S.saveError;
    msg.classList.toggle("err", !!S.saveError);
    if (S.saveError) msg.textContent = S.saveError;
    else if (S.saving) msg.textContent = "Speichere …";
    else msg.textContent = `${n} ${n === 1 ? "Änderung" : "Änderungen"} an deiner Karte nicht gespeichert`;
    $("btn-save").disabled = S.saving || n === 0;
    $("btn-discard").disabled = S.saving || n === 0;
    $("btn-save").textContent = S.saving ? "Speichere …" : "Speichern";
  }
  function errorText(e) {
    if (!e.status) return "Keine Verbindung zu GitHub. Die Änderungen bleiben auf diesem Gerät; später erneut speichern.";
    if (e.status === 401) return "Der Token ist ungültig oder abgelaufen. Unter Einstellungen einen neuen eintragen.";
    if (e.status === 403) return "Der Token darf nicht in dieses Repo schreiben. Beim Token unter Contents „Read and write“ wählen.";
    if (e.status === 404) return "Repo nicht gefunden oder der Token hat keinen Zugriff darauf. Einstellungen prüfen.";
    return `Speichern fehlgeschlagen (HTTP ${e.status}). Die Änderungen bleiben auf diesem Gerät.`;
  }
  async function save() {
    const id = device.owner;
    const d = S.data.get(id);
    const ch = changes(id);
    if (!d || !Object.keys(ch).length || S.saving) return;
    const p = profile(id);
    S.saving = true; S.saveError = ""; renderSavebar();
    try {
      if (DEMO) {
        LS.set(`laenderatlas.demo.daten.${id}`, JSON.parse(serialize(id, d.local)));
      } else {
        const message = commitMessage(p.name, ch);
        try {
          d.sha = await ghPut(`data/${id}.json`, serialize(id, d.local), d.sha, message);
        } catch (e) {
          if (e.status !== 409 && e.status !== 422) throw e;
          // Datei wurde inzwischen anderswo geändert: neu laden, eigene Änderungen darüberlegen, einmal wiederholen
          const fresh = await loadRemote(id);
          d.base = fresh.status; d.sha = fresh.sha;
          d.local = { ...fresh.status }; applyChanges(d.local, ch);
          d.sha = await ghPut(`data/${id}.json`, serialize(id, d.local), d.sha, message);
        }
      }
      d.base = { ...d.local };
      d.updated = new Date().toISOString();
      LS.del(draftKey(id));
      S.saving = false;
      renderAll();
      toast(DEMO ? "Gespeichert (Demo: nur in diesem Browser)." : "Gespeichert. Für andere in etwa einer Minute sichtbar.");
    } catch (e) {
      S.saving = false;
      S.saveError = errorText(e);
      renderSavebar();
    }
  }
  $("btn-save").addEventListener("click", save);
  let discardArmed = 0;
  $("btn-discard").addEventListener("click", () => {
    const btn = $("btn-discard");
    if (!discardArmed) {
      btn.textContent = "Wirklich verwerfen?";
      discardArmed = setTimeout(() => { discardArmed = 0; btn.textContent = "Verwerfen"; }, 3500);
      return;
    }
    clearTimeout(discardArmed); discardArmed = 0; btn.textContent = "Verwerfen";
    const d = S.data.get(device.owner);
    d.local = { ...d.base };
    LS.del(draftKey(device.owner));
    S.saveError = "";
    renderAll();
    toast("Änderungen verworfen.");
  });
  window.addEventListener("beforeunload", ev => {
    if (Object.keys(ownerChanges()).length) { ev.preventDefault(); ev.returnValue = ""; }
  });

  // ---------- Link kopieren ----------
  $("btn-link").addEventListener("click", () => {
    const url = location.href;
    const box = $("linkbox");
    const fallback = () => { box.value = url; box.hidden = false; box.focus(); box.select(); toast("Link markiert. Mit Strg+C kopieren."); };
    try { navigator.clipboard.writeText(url).then(() => toast("Link kopiert."), fallback); } catch (e) { fallback(); }
  });

  // ---------- Einstellungen ----------
  const dlg = $("dlg");
  function fillSettings() {
    const sel = $("set-owner");
    sel.innerHTML = `<option value="">niemand, nur ansehen</option>` + S.profiles.map(p => `<option value="${p.id}">${esc(p.name)}</option>`).join("");
    sel.value = device.owner || "";
    $("gh-fields").hidden = DEMO;
    $("demo-settings").hidden = !DEMO;
    $("set-repo").value = device.repo || "";
    $("set-repo").placeholder = detectRepo() || "benutzer/repo";
    $("repo-hint").textContent = detectRepo()
      ? `Automatisch erkannt: ${detectRepo()}. Nur ausfüllen, wenn es ein anderes Repo ist.`
      : "Die Seite läuft nicht unter github.io, deshalb bitte Besitzer und Repo angeben.";
    $("set-token").value = "";
    $("set-token").placeholder = device.token ? "Token gespeichert · neuen einfügen zum Ersetzen" : "github_pat_…";
    $("token-remove").hidden = !device.token;
    $("token-msg").textContent = "";
    const owner = profile(device.owner);
    $("data-section").hidden = !owner;
    if (owner) {
      $("data-h").textContent = `Daten der Karte von ${owner.name}`;
      const d = S.data.get(owner.id);
      $("io").value = d && d.state === "ok" ? serialize(owner.id, d.local) : "";
    }
    $("io-msg").textContent = "";
    $("reset-row").hidden = false; $("reset-confirm").hidden = true;
  }
  $("btn-settings").addEventListener("click", () => { fillSettings(); if (dlg.showModal) dlg.showModal(); else dlg.setAttribute("open", ""); });
  const closeDlg = () => { if (dlg.close) dlg.close(); else dlg.removeAttribute("open"); };
  $("dlg-close").addEventListener("click", closeDlg);
  dlg.addEventListener("click", ev => { if (ev.target === dlg) closeDlg(); });
  $("set-owner").addEventListener("change", async ev => {
    device.owner = ev.target.value; saveDevice();
    if (device.owner && S.data.has(device.owner)) await loadProfile(device.owner); // Entwurf dieses Geräts wieder anwenden
    fillSettings(); renderAll();
  });
  $("set-repo").addEventListener("change", ev => {
    device.repo = ev.target.value.trim().replace(/^https?:\/\/github\.com\//, "").replace(/\/+$/, "");
    saveDevice(); fillSettings(); renderAll();
  });
  $("token-save").addEventListener("click", async () => {
    const tok = $("set-token").value.trim();
    const msg = $("token-msg");
    msg.className = "msg";
    if (!tok) { msg.textContent = "Bitte zuerst einen Token einfügen."; msg.classList.add("err"); return; }
    if (!repo()) { msg.textContent = "Bitte zuerst das Repository angeben."; msg.classList.add("err"); return; }
    msg.textContent = "Prüfe Zugriff …";
    const prev = device.token;
    device.token = tok;
    try {
      const r = await ghGet("data/profile.json");
      if (r.text == null) throw httpError(404);
      saveDevice();
      msg.textContent = `Zugriff auf ${repo()} bestätigt. Ob der Token schreiben darf, zeigt sich beim ersten Speichern.`;
      msg.classList.add("ok");
      await reloadAll();
      fillSettings();
      $("token-msg").textContent = `Zugriff auf ${repo()} bestätigt. Ob der Token schreiben darf, zeigt sich beim ersten Speichern.`;
      $("token-msg").className = "msg ok";
    } catch (e) {
      device.token = prev;
      msg.classList.add("err");
      msg.textContent = !e.status ? "GitHub ist nicht erreichbar. Verbindung prüfen."
        : e.status === 401 ? "GitHub lehnt den Token ab. Ist er vollständig kopiert und nicht abgelaufen?"
        : e.status === 404 ? `${repo()}/data/profile.json nicht gefunden. Stimmt das Repo, und hat der Token Zugriff darauf?`
        : `Prüfung fehlgeschlagen (HTTP ${e.status}).`;
    }
  });
  $("token-remove").addEventListener("click", async () => {
    device.token = ""; saveDevice();
    await reloadAll();
    fillSettings();
    $("token-msg").textContent = "Token von diesem Gerät entfernt.";
  });
  function setIoMsg(text, err) { const m = $("io-msg"); m.textContent = text; m.className = "msg" + (err ? " err" : ""); }
  $("io-copy").addEventListener("click", () => {
    const io = $("io");
    const fallback = () => { io.focus(); io.select(); setIoMsg("Text ist markiert. Mit Strg+C (Mac: ⌘+C) kopieren."); };
    try { navigator.clipboard.writeText(io.value).then(() => setIoMsg("In die Zwischenablage kopiert."), fallback); } catch (e) { fallback(); }
  });
  function importText(text) {
    const d = S.data.get(device.owner);
    if (!d || d.state !== "ok") { setIoMsg("Die Karte ist noch nicht geladen.", true); return; }
    let o;
    try { o = JSON.parse(text); } catch (e) { setIoMsg("Der Text ist kein gültiges JSON. Prüfe, ob er vollständig eingefügt wurde.", true); return; }
    if (!o || (!Array.isArray(o.bereist) && !Array.isArray(o.geplant))) { setIoMsg("Im Text fehlen die Listen „bereist“ und „geplant“.", true); return; }
    const parsed = parseData(o).status;
    const unknown = Object.keys(parsed).filter(k => !ITEMS.has(k));
    unknown.forEach(k => delete parsed[k]);
    d.local = parsed;
    storeDraft(device.owner);
    renderAll();
    const n = Object.keys(parsed).length;
    setIoMsg(`${n} Einträge übernommen${unknown.length ? `, unbekannte Codes ignoriert: ${unknown.join(", ")}` : ""}. Zum Sichern auf „Speichern“ klicken.`, unknown.length > 0);
  }
  $("io-apply").addEventListener("click", () => importText($("io").value));
  $("io-file").addEventListener("change", ev => {
    const f = ev.target.files && ev.target.files[0];
    if (!f) return;
    const r = new FileReader();
    r.onload = () => { $("io").value = String(r.result); importText($("io").value); };
    r.onerror = () => setIoMsg("Die Datei konnte nicht gelesen werden.", true);
    r.readAsText(f);
    ev.target.value = "";
  });
  $("reset").addEventListener("click", () => {
    const d = S.data.get(device.owner);
    $("reset-q").textContent = `Alle ${d ? Object.keys(d.local).length : 0} Markierungen entfernen?`;
    $("reset-row").hidden = true; $("reset-confirm").hidden = false;
  });
  $("reset-no").addEventListener("click", () => { $("reset-row").hidden = false; $("reset-confirm").hidden = true; });
  $("reset-yes").addEventListener("click", () => {
    const d = S.data.get(device.owner);
    d.local = {};
    storeDraft(device.owner);
    renderAll();
    $("io").value = serialize(device.owner, d.local);
    $("reset-row").hidden = false; $("reset-confirm").hidden = true;
    setIoMsg("Alle Markierungen entfernt. Zum Sichern auf „Speichern“ klicken.");
  });

  // ---------- Ansicht ----------
  function viewFromHash() {
    const h = decodeURIComponent(location.hash.slice(1));
    if (h === "vergleich" && S.profiles.length >= 2) return h;
    if (profile(h)) return h;
    return (device.owner && profile(device.owner)) ? device.owner : S.profiles[0].id;
  }
  function renderAll() {
    applyViewColor();
    renderNav();
    renderContext();
    renderLegend();
    renderFilters();
    buildList();
    paintMap();
    renderStats();
    renderSavebar();
  }
  function setView(v) {
    S.view = v;
    if (location.hash.slice(1) !== v) {
      try { history.replaceState(null, "", "#" + v); } catch (e) { /* Rahmen erlaubt es nicht */ }
    }
    renderAll();
  }
  window.addEventListener("hashchange", () => setView(viewFromHash()));
  async function reloadAll() {
    await Promise.all(S.profiles.map(p => loadProfile(p.id)));
    renderAll();
  }

  async function start() {
    $("demo-note").hidden = !DEMO;
    try {
      const ps = await loadProfiles();
      S.profiles = ps.map((p, i) => ({ id: p.id, name: p.name, slot: i % 2 + 1 }));
    } catch (e) {
      $("ctx-who").textContent = "Profile fehlen";
      $("ctx-meta").textContent = `${e.message || e} Lege data/profile.json im Repo an (siehe README).`;
      $("ctx-meta").classList.add("err");
      paintMap();
      return;
    }
    S.view = viewFromHash();
    S.profiles.forEach(p => S.data.set(p.id, { base: {}, local: {}, sha: null, updated: null, state: "loading" }));
    renderAll();
    if (location.hash.slice(1) !== S.view) { try { history.replaceState(null, "", "#" + S.view); } catch (e) { /* egal */ } }
    await reloadAll();
  }
  start();
})();
