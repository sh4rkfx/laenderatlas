// [ISO-3166 alpha-2, ISO numeric (Kartenschlüssel), deutscher Name, Kontinent, Gruppe]
// Kontinent nach UN-M49, Amerika geteilt: NA = Nordamerika inkl. Mittelamerika & Karibik, SA = Südamerika
// Gruppe: un = UN-Mitglied (193), obs = UN-Beobachterstaat (2), x = weitere (Kosovo, Taiwan)
export const COUNTRIES = [
  // Afrika (54)
  ["DZ","012","Algerien","AF","un"],["EG","818","Ägypten","AF","un"],["AO","024","Angola","AF","un"],
  ["GQ","226","Äquatorialguinea","AF","un"],["ET","231","Äthiopien","AF","un"],["BJ","204","Benin","AF","un"],
  ["BW","072","Botswana","AF","un"],["BF","854","Burkina Faso","AF","un"],["BI","108","Burundi","AF","un"],
  ["DJ","262","Dschibuti","AF","un"],["CI","384","Elfenbeinküste","AF","un"],["ER","232","Eritrea","AF","un"],
  ["SZ","748","Eswatini","AF","un"],["GA","266","Gabun","AF","un"],["GM","270","Gambia","AF","un"],
  ["GH","288","Ghana","AF","un"],["GN","324","Guinea","AF","un"],["GW","624","Guinea-Bissau","AF","un"],
  ["CM","120","Kamerun","AF","un"],["CV","132","Kap Verde","AF","un"],["KE","404","Kenia","AF","un"],
  ["KM","174","Komoren","AF","un"],["CG","178","Kongo (Republik)","AF","un"],["CD","180","Kongo (Dem. Rep.)","AF","un"],
  ["LS","426","Lesotho","AF","un"],["LR","430","Liberia","AF","un"],["LY","434","Libyen","AF","un"],
  ["MG","450","Madagaskar","AF","un"],["MW","454","Malawi","AF","un"],["ML","466","Mali","AF","un"],
  ["MA","504","Marokko","AF","un"],["MR","478","Mauretanien","AF","un"],["MU","480","Mauritius","AF","un"],
  ["MZ","508","Mosambik","AF","un"],["NA","516","Namibia","AF","un"],["NE","562","Niger","AF","un"],
  ["NG","566","Nigeria","AF","un"],["RW","646","Ruanda","AF","un"],["ZM","894","Sambia","AF","un"],
  ["ST","678","São Tomé und Príncipe","AF","un"],["SN","686","Senegal","AF","un"],["SC","690","Seychellen","AF","un"],
  ["SL","694","Sierra Leone","AF","un"],["ZW","716","Simbabwe","AF","un"],["SO","706","Somalia","AF","un"],
  ["ZA","710","Südafrika","AF","un"],["SD","729","Sudan","AF","un"],["SS","728","Südsudan","AF","un"],
  ["TZ","834","Tansania","AF","un"],["TG","768","Togo","AF","un"],["TD","148","Tschad","AF","un"],
  ["TN","788","Tunesien","AF","un"],["UG","800","Uganda","AF","un"],["CF","140","Zentralafrikanische Republik","AF","un"],
  // Asien (47 + Palästina + Taiwan)
  ["AF","004","Afghanistan","AS","un"],["AM","051","Armenien","AS","un"],["AZ","031","Aserbaidschan","AS","un"],
  ["BH","048","Bahrain","AS","un"],["BD","050","Bangladesch","AS","un"],["BT","064","Bhutan","AS","un"],
  ["BN","096","Brunei","AS","un"],["CN","156","China","AS","un"],["GE","268","Georgien","AS","un"],
  ["IN","356","Indien","AS","un"],["ID","360","Indonesien","AS","un"],["IQ","368","Irak","AS","un"],
  ["IR","364","Iran","AS","un"],["IL","376","Israel","AS","un"],["JP","392","Japan","AS","un"],
  ["YE","887","Jemen","AS","un"],["JO","400","Jordanien","AS","un"],["KH","116","Kambodscha","AS","un"],
  ["KZ","398","Kasachstan","AS","un"],["QA","634","Katar","AS","un"],["KG","417","Kirgisistan","AS","un"],
  ["KW","414","Kuwait","AS","un"],["LA","418","Laos","AS","un"],["LB","422","Libanon","AS","un"],
  ["MY","458","Malaysia","AS","un"],["MV","462","Malediven","AS","un"],["MN","496","Mongolei","AS","un"],
  ["MM","104","Myanmar","AS","un"],["NP","524","Nepal","AS","un"],["KP","408","Nordkorea","AS","un"],
  ["OM","512","Oman","AS","un"],["TL","626","Osttimor","AS","un"],["PK","586","Pakistan","AS","un"],
  ["PH","608","Philippinen","AS","un"],["SA","682","Saudi-Arabien","AS","un"],["SG","702","Singapur","AS","un"],
  ["LK","144","Sri Lanka","AS","un"],["KR","410","Südkorea","AS","un"],["SY","760","Syrien","AS","un"],
  ["TJ","762","Tadschikistan","AS","un"],["TH","764","Thailand","AS","un"],["TR","792","Türkei","AS","un"],
  ["TM","795","Turkmenistan","AS","un"],["UZ","860","Usbekistan","AS","un"],["AE","784","Vereinigte Arabische Emirate","AS","un"],
  ["VN","704","Vietnam","AS","un"],["CY","196","Zypern","AS","un"],
  ["PS","275","Palästina","AS","obs"],["TW","158","Taiwan","AS","x"],
  // Europa (43 + Vatikanstadt + Kosovo)
  ["AL","008","Albanien","EU","un"],["AD","020","Andorra","EU","un"],["BE","056","Belgien","EU","un"],
  ["BY","112","Belarus","EU","un"],["BA","070","Bosnien und Herzegowina","EU","un"],["BG","100","Bulgarien","EU","un"],
  ["DK","208","Dänemark","EU","un"],["DE","276","Deutschland","EU","un"],["EE","233","Estland","EU","un"],
  ["FI","246","Finnland","EU","un"],["FR","250","Frankreich","EU","un"],["GR","300","Griechenland","EU","un"],
  ["IE","372","Irland","EU","un"],["IS","352","Island","EU","un"],["IT","380","Italien","EU","un"],
  ["HR","191","Kroatien","EU","un"],["LV","428","Lettland","EU","un"],["LI","438","Liechtenstein","EU","un"],
  ["LT","440","Litauen","EU","un"],["LU","442","Luxemburg","EU","un"],["MT","470","Malta","EU","un"],
  ["MD","498","Moldau","EU","un"],["MC","492","Monaco","EU","un"],["ME","499","Montenegro","EU","un"],
  ["NL","528","Niederlande","EU","un"],["MK","807","Nordmazedonien","EU","un"],["NO","578","Norwegen","EU","un"],
  ["AT","040","Österreich","EU","un"],["PL","616","Polen","EU","un"],["PT","620","Portugal","EU","un"],
  ["RO","642","Rumänien","EU","un"],["RU","643","Russland","EU","un"],["SM","674","San Marino","EU","un"],
  ["SE","752","Schweden","EU","un"],["CH","756","Schweiz","EU","un"],["RS","688","Serbien","EU","un"],
  ["SK","703","Slowakei","EU","un"],["SI","705","Slowenien","EU","un"],["ES","724","Spanien","EU","un"],
  ["CZ","203","Tschechien","EU","un"],["UA","804","Ukraine","EU","un"],["HU","348","Ungarn","EU","un"],
  ["GB","826","Vereinigtes Königreich","EU","un"],
  ["VA","336","Vatikanstadt","EU","obs"],["XK","XK","Kosovo","EU","x"],
  // Nordamerika inkl. Mittelamerika & Karibik (23)
  ["AG","028","Antigua und Barbuda","NA","un"],["BS","044","Bahamas","NA","un"],["BB","052","Barbados","NA","un"],
  ["BZ","084","Belize","NA","un"],["CR","188","Costa Rica","NA","un"],["DM","212","Dominica","NA","un"],
  ["DO","214","Dominikanische Republik","NA","un"],["SV","222","El Salvador","NA","un"],["GD","308","Grenada","NA","un"],
  ["GT","320","Guatemala","NA","un"],["HT","332","Haiti","NA","un"],["HN","340","Honduras","NA","un"],
  ["JM","388","Jamaika","NA","un"],["CA","124","Kanada","NA","un"],["CU","192","Kuba","NA","un"],
  ["MX","484","Mexiko","NA","un"],["NI","558","Nicaragua","NA","un"],["PA","591","Panama","NA","un"],
  ["KN","659","St. Kitts und Nevis","NA","un"],["LC","662","St. Lucia","NA","un"],["VC","670","St. Vincent und die Grenadinen","NA","un"],
  ["TT","780","Trinidad und Tobago","NA","un"],["US","840","Vereinigte Staaten","NA","un"],
  // Südamerika (12)
  ["AR","032","Argentinien","SA","un"],["BO","068","Bolivien","SA","un"],["BR","076","Brasilien","SA","un"],
  ["CL","152","Chile","SA","un"],["EC","218","Ecuador","SA","un"],["GY","328","Guyana","SA","un"],
  ["CO","170","Kolumbien","SA","un"],["PY","600","Paraguay","SA","un"],["PE","604","Peru","SA","un"],
  ["SR","740","Suriname","SA","un"],["UY","858","Uruguay","SA","un"],["VE","862","Venezuela","SA","un"],
  // Ozeanien (14)
  ["AU","036","Australien","OC","un"],["FJ","242","Fidschi","OC","un"],["KI","296","Kiribati","OC","un"],
  ["MH","584","Marshallinseln","OC","un"],["FM","583","Mikronesien","OC","un"],["NR","520","Nauru","OC","un"],
  ["NZ","554","Neuseeland","OC","un"],["PW","585","Palau","OC","un"],["PG","598","Papua-Neuguinea","OC","un"],
  ["SB","090","Salomonen","OC","un"],["WS","882","Samoa","OC","un"],["TO","776","Tonga","OC","un"],
  ["TV","798","Tuvalu","OC","un"],["VU","548","Vanuatu","OC","un"],
];

// Kartenflächen ohne eigenen Länderstatus → einem Land zugeschlagen (nach Name in Natural Earth)
export const MERGE_BY_NAME = { "N. Cyprus": "CY", "Somaliland": "SO", "Kosovo": "XK", "Ashmore and Cartier Is.": "AU" };

// Abhängige Gebiete: werden grau gezeichnet und zählen nicht
export const TERRITORY_DE = {
  "850":"Amerikanische Jungferninseln (USA)","316":"Guam (USA)","016":"Amerikanisch-Samoa (USA)","630":"Puerto Rico (USA)",
  "580":"Nördliche Marianen (USA)","239":"Südgeorgien (UK)","086":"Britisches Territorium im Indischen Ozean (UK)",
  "654":"St. Helena (UK)","612":"Pitcairninseln (UK)","660":"Anguilla (UK)","238":"Falklandinseln (UK)",
  "136":"Kaimaninseln (UK)","060":"Bermuda (UK)","092":"Britische Jungferninseln (UK)","796":"Turks- und Caicosinseln (UK)",
  "500":"Montserrat (UK)","832":"Jersey (UK)","831":"Guernsey (UK)","833":"Isle of Man (UK)",
  "570":"Niue (NZ)","184":"Cookinseln (NZ)","533":"Aruba (NL)","531":"Curaçao (NL)","534":"Sint Maarten (NL)",
  "732":"Westsahara (umstritten)","666":"St. Pierre und Miquelon (FR)","876":"Wallis und Futuna (FR)","663":"St. Martin (FR)",
  "652":"St. Barthélemy (FR)","258":"Französisch-Polynesien (FR)","540":"Neukaledonien (FR)","260":"Französische Süd- und Antarktisgebiete (FR)",
  "248":"Åland (FI)","304":"Grönland (DK)","234":"Färöer (DK)","446":"Macau (CN)","344":"Hongkong (CN)",
  "334":"Heard und McDonaldinseln (AU)","574":"Norfolkinsel (AU)",
  "Indian Ocean Ter.":"Weihnachtsinsel / Kokosinseln (AU)","Siachen Glacier":"Siachen-Gletscher (umstritten)",
};

// Punktmarker (Hauptstadt) für Staaten, die auf der Weltkarte zu klein zum Anklicken sind
export const MARKER_COORDS = {
  VA:[12.45,41.90],MC:[7.42,43.74],SM:[12.45,43.94],LI:[9.52,47.14],AD:[1.52,42.51],MT:[14.51,35.90],LU:[6.13,49.61],
  SG:[103.82,1.35],BH:[50.58,26.22],MV:[73.51,4.18],NR:[166.93,-0.53],TV:[179.19,-8.52],KI:[173.0,1.45],
  MH:[171.38,7.09],FM:[158.21,6.92],PW:[134.58,7.50],WS:[-171.75,-13.83],TO:[-175.2,-21.14],
  AG:[-61.85,17.12],BB:[-59.54,13.16],DM:[-61.37,15.41],GD:[-61.68,12.12],KN:[-62.72,17.30],LC:[-60.98,13.91],
  VC:[-61.20,13.16],ST:[6.73,0.33],SC:[55.45,-4.62],MU:[57.50,-20.16],KM:[43.33,-11.70],CV:[-23.51,14.93],
  TT:[-61.22,10.65],BN:[114.94,4.89],QA:[51.18,25.30],LB:[35.86,33.87],CY:[33.36,35.17],PS:[35.2,31.9],
  GM:[-15.31,13.45],SZ:[31.47,-26.52],KW:[47.98,29.37],ME:[19.26,42.44],XK:[20.9,42.6],SI:[14.82,46.15],
  BS:[-77.35,25.05],JM:[-77.30,18.11],FJ:[178.07,-17.71],SB:[159.95,-9.43],VU:[168.32,-17.73],TL:[125.73,-8.83],
  DJ:[42.59,11.83],RW:[29.87,-1.94],BI:[29.92,-3.37],LS:[28.23,-29.61],SV:[-88.90,13.79],BZ:[-88.50,17.19],
  AM:[44.51,40.18],IL:[34.85,31.05],
};
