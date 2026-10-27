// Fachliche Stammdaten für den Länderatlas v0.2
import { COUNTRIES as C1, MARKER_COORDS as M1 } from "./countries.mjs";

// Kontinente nach UN-M49 (5) + Antarktis nur für die Gebietsliste
export const CONTINENTS = [
  ["EU", "Europa"], ["AS", "Asien"], ["AF", "Afrika"], ["AM", "Amerika"], ["OC", "Ozeanien"], ["AN", "Antarktis"],
];

// Regionen = feinste M49-Ebene (Subregion bzw. Intermediate Region), geografisch sortiert
export const REGIONS = [
  ["NEU", "EU", "Nordeuropa"], ["WEU", "EU", "Westeuropa"], ["SEU", "EU", "Südeuropa"], ["EEU", "EU", "Osteuropa"],
  ["WAS", "AS", "Westasien"], ["CAS", "AS", "Zentralasien"], ["SAS", "AS", "Südasien"], ["EAS", "AS", "Ostasien"], ["SEA", "AS", "Südostasien"],
  ["NAF", "AF", "Nordafrika"], ["WAF", "AF", "Westafrika"], ["MAF", "AF", "Zentralafrika"], ["EAF", "AF", "Ostafrika"], ["SAF", "AF", "Südliches Afrika"],
  ["NAM", "AM", "Nördliches Amerika"], ["CAM", "AM", "Mittelamerika"], ["CAR", "AM", "Karibik"], ["SAM", "AM", "Südamerika"],
  ["ANZ", "OC", "Australien und Neuseeland"], ["MEL", "OC", "Melanesien"], ["MIC", "OC", "Mikronesien"], ["POL", "OC", "Polynesien"],
  ["ANT", "AN", "Antarktis"],
];

const MEMBERS = {
  NAF: "DZ EG LY MA SD TN",
  EAF: "BI KM DJ ER ET KE MG MW MU MZ RW SC SO SS UG TZ ZM ZW",
  MAF: "AO CM CF TD CG CD GQ GA ST",
  SAF: "BW SZ LS NA ZA",
  WAF: "BJ BF CV CI GM GH GN GW LR ML MR NE NG SN SL TG",
  NAM: "CA US",
  CAM: "BZ CR SV GT HN MX NI PA",
  CAR: "AG BS BB CU DM DO GD HT JM KN LC VC TT",
  SAM: "AR BO BR CL CO EC GY PY PE SR UY VE",
  CAS: "KZ KG TJ TM UZ",
  EAS: "CN JP KP KR MN TW",
  SEA: "BN KH ID LA MY MM PH SG TH TL VN",
  SAS: "AF BD BT IN IR MV NP PK LK",
  WAS: "AM AZ BH CY GE IQ IL JO KW LB OM QA SA PS SY TR AE YE",
  NEU: "DK EE FI IS IE LV LT NO SE GB",
  WEU: "AT BE FR DE LI LU MC NL CH",
  SEU: "AL AD BA HR GR VA IT MT ME MK PT SM RS SI ES XK",
  EEU: "BY BG CZ HU PL MD RO RU SK UA",
  ANZ: "AU NZ",
  MEL: "FJ PG SB VU",
  MIC: "KI MH FM NR PW",
  POL: "WS TO TV",
};
const REGION_OF = {};
for (const [r, list] of Object.entries(MEMBERS)) for (const iso of list.split(" ")) REGION_OF[iso] = r;

// [iso, Kartenschlüssel (ISO numerisch), Name, Region, Gruppe]
export const COUNTRIES = C1.map(([iso, num, name, , grp]) => [iso, num, name, REGION_OF[iso], grp]);

// Abhängige und umstrittene Gebiete nach UN-M49: [iso, Kartenschlüssel | null, Name, Region]
// Kartenschlüssel: ISO numerisch in world-atlas, "split:<Staat>" = aus dessen Fläche herausgelöst, null = nur Punkt/Liste
export const TERRITORIES = [
  ["EH", "732", "Westsahara (umstritten)", "NAF"],
  ["IO", "086", "Britisches Territorium im Indischen Ozean (UK)", "EAF"],
  ["TF", "260", "Französische Süd- und Antarktisgebiete (FR)", "EAF"],
  ["YT", "split:FR", "Mayotte (FR)", "EAF"],
  ["RE", "split:FR", "Réunion (FR)", "EAF"],
  ["SH", "654", "St. Helena, Ascension und Tristan da Cunha (UK)", "WAF"],
  ["AI", "660", "Anguilla (UK)", "CAR"],
  ["AW", "533", "Aruba (NL)", "CAR"],
  ["BQ", "split:NL", "Bonaire, Sint Eustatius und Saba (NL)", "CAR"],
  ["VG", "092", "Britische Jungferninseln (UK)", "CAR"],
  ["KY", "136", "Kaimaninseln (UK)", "CAR"],
  ["CW", "531", "Curaçao (NL)", "CAR"],
  ["GP", "split:FR", "Guadeloupe (FR)", "CAR"],
  ["MQ", "split:FR", "Martinique (FR)", "CAR"],
  ["MS", "500", "Montserrat (UK)", "CAR"],
  ["PR", "630", "Puerto Rico (USA)", "CAR"],
  ["BL", "652", "St. Barthélemy (FR)", "CAR"],
  ["MF", "663", "St. Martin (FR)", "CAR"],
  ["SX", "534", "Sint Maarten (NL)", "CAR"],
  ["TC", "796", "Turks- und Caicosinseln (UK)", "CAR"],
  ["VI", "850", "Amerikanische Jungferninseln (USA)", "CAR"],
  ["BV", "split:NO", "Bouvetinsel (NO)", "SAM"],
  ["FK", "238", "Falklandinseln (UK)", "SAM"],
  ["GF", "split:FR", "Französisch-Guayana (FR)", "SAM"],
  ["GS", "239", "Südgeorgien und Südliche Sandwichinseln (UK)", "SAM"],
  ["BM", "060", "Bermuda (UK)", "NAM"],
  ["GL", "304", "Grönland (DK)", "NAM"],
  ["PM", "666", "St. Pierre und Miquelon (FR)", "NAM"],
  ["HK", "344", "Hongkong (CN)", "EAS"],
  ["MO", "446", "Macau (CN)", "EAS"],
  ["AX", "248", "Åland (FI)", "NEU"],
  ["FO", "234", "Färöer (DK)", "NEU"],
  ["GG", "831", "Guernsey (UK)", "NEU"],
  ["IM", "833", "Isle of Man (UK)", "NEU"],
  ["JE", "832", "Jersey (UK)", "NEU"],
  ["SJ", "split:NO", "Svalbard und Jan Mayen (NO)", "NEU"],
  ["GI", null, "Gibraltar (UK)", "SEU"],
  ["CX", null, "Weihnachtsinsel (AU)", "ANZ"],
  ["CC", null, "Kokosinseln (AU)", "ANZ"],
  ["HM", "334", "Heard und McDonaldinseln (AU)", "ANZ"],
  ["NF", "574", "Norfolkinsel (AU)", "ANZ"],
  ["NC", "540", "Neukaledonien (FR)", "MEL"],
  ["GU", "316", "Guam (USA)", "MIC"],
  ["MP", "580", "Nördliche Marianen (USA)", "MIC"],
  ["UM", null, "Kleinere Amerikanische Überseeinseln (USA)", "MIC"],
  ["AS", "016", "Amerikanisch-Samoa (USA)", "POL"],
  ["CK", "184", "Cookinseln (NZ)", "POL"],
  ["PF", "258", "Französisch-Polynesien (FR)", "POL"],
  ["NU", "570", "Niue (NZ)", "POL"],
  ["PN", "612", "Pitcairninseln (UK)", "POL"],
  ["TK", null, "Tokelau (NZ)", "POL"],
  ["WF", "876", "Wallis und Futuna (FR)", "POL"],
  ["AQ", null, "Antarktis", "ANT"],
];

// Teilflächen, die in Natural Earth zu einem Staat gehören: Polygon-Schwerpunkt im Rechteck [lonMin, latMin, lonMax, latMax]
export const SPLIT_BOXES = {
  GF: [[-55, 1.5, -51, 6.5]],
  GP: [[-62, 15.7, -60.9, 16.7]],
  MQ: [[-61.4, 14.3, -60.7, 15]],
  RE: [[55, -21.6, 56, -20.7]],
  YT: [[44.8, -13.2, 45.5, -12.4]],
  SJ: [[5, 74, 36, 81.5], [-9.5, 70.5, -7.5, 71.5]],
  BV: [[3, -54.8, 4, -54.2]],
  BQ: [[-68.6, 11.9, -67.9, 12.5], [-63.4, 17.3, -62.8, 17.8]],
};

// Kartenflächen ohne eigene Liste (nicht anklickbar)
export const NEUTRAL_BY_NAME = { "Indian Ocean Ter.": "Weihnachtsinsel und Kokosinseln (AU)", "Siachen Glacier": "Siachen-Gletscher (umstritten)" };

export const MARKER_COORDS = {
  ...M1,
  AI: [-63.06, 18.22], AW: [-69.97, 12.52], BQ: [-68.26, 12.18], VG: [-64.62, 18.43], KY: [-81.25, 19.31], CW: [-68.99, 12.17],
  GP: [-61.55, 16.25], MQ: [-61.02, 14.64], MS: [-62.19, 16.74], PR: [-66.5, 18.22], BL: [-62.83, 17.9], MF: [-63.08, 18.08],
  SX: [-63.05, 18.03], TC: [-71.8, 21.8], VI: [-64.9, 18.34], BV: [3.41, -54.42], GS: [-36.6, -54.4], BM: [-64.75, 32.3],
  PM: [-56.3, 46.9], HK: [114.17, 22.32], MO: [113.55, 22.19], AX: [19.95, 60.18], FO: [-6.9, 62.0], GG: [-2.58, 49.45],
  IM: [-4.55, 54.23], JE: [-2.13, 49.21], GI: [-5.35, 36.14], CX: [105.69, -10.45], CC: [96.87, -12.17], HM: [73.5, -53.1],
  NF: [167.95, -29.04], GU: [144.79, 13.44], MP: [145.75, 15.18], UM: [166.65, 19.28], AS: [-170.7, -14.3], CK: [-159.78, -21.24],
  PF: [-149.4, -17.65], NU: [-169.87, -19.05], PN: [-130.1, -25.07], TK: [-171.85, -9.2], WF: [-176.2, -13.3], YT: [45.15, -12.83],
  RE: [55.53, -21.12], SH: [-5.7, -15.96], IO: [72.4, -7.3], TF: [69.35, -49.3], FK: [-59.5, -51.75], NC: [165.6, -21.3],
  SJ: [16, 78.2], GF: [-53.1, 4.0],
  GQ: [10.3, 1.6], HT: [-72.3, 18.9], MK: [21.7, 41.6],
};

// Gegenprüfung beim Import
const all = [...COUNTRIES.map(c => c[0]), ...TERRITORIES.map(t => t[0])];
if (new Set(all).size !== all.length) throw new Error("Doppelte ISO-Codes");
const missingRegion = COUNTRIES.filter(c => !c[3]).map(c => c[0]);
if (missingRegion.length) throw new Error("Ohne Region: " + missingRegion);
