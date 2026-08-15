/* ==========================================================================
   REKOREALITY — knihovna 3D modelů
   --------------------------------------------------------------------------
   Konvence pro každý model („plovoucí diorama"):
     • osa Y nahoru, horní plocha pozemku v y = 0, scéna vystředěná kolem počátku
     • +Z je směr k divákovi (hlavní fasáda), jednotky ≈ metry
     • scéna NEMÁ nekonečný terén — stojí na U.plot(), pod ním U.softShadow()
     • build(THREE, M, U) vrací THREE.Group
     • view = { az, el, dist, target:[x,y,z], fov } — sférická pozice kamery
     • radius řídí rozsah stínové kamery

   Modely s časovou osou (timeline: true) navíc značkují podskupiny přes
   userData.phase = 'old' | 'new'. Engine je pak prolíná zleva doprava
   podle postupu simulace. Vše neoznačené je společné oběma stavům.
   ========================================================================== */

/* --------------------------------------------------------------------------
   VILLA — hero: simulace „před → po"
   Původní dům z konce 70. let se sedlovou střechou se promění
   v dvoupodlažní vilu s převislým patrem, terasou a bazénem.
   -------------------------------------------------------------------------- */
function buildVilla(THREE, M, U) {
  const g = new THREE.Group();
  const DZ = -4.5;                       // odsazení domu do zadní části pozemku

  /* ================= SPOLEČNÉ ================= */
  g.add(U.plot(58, 42, 2.2, M.grass, M.soil, 3.0));
  g.add(U.softShadow(78, 60, -2.35, 0.42));
  g.add(U.pine(-22.0, -14.5, 1.55));     // vzrostlá zeleň zůstává i po rekonstrukci
  g.add(U.pine(-18.5, -17.5, 1.1));
  g.add(U.tree(21.5, -13.5, 1.5));
  g.add(U.tree(17.5, -17.0, 1.05));

  /* ================= PŮVODNÍ STAV ================= */
  const old = new THREE.Group();
  old.userData.phase = 'old';
  g.add(old);

  const oh = new THREE.Group();
  oh.position.z = DZ;
  old.add(oh);

  const OW = 20, OGH = 4.2, OD = 10.5;

  // sokl a přízemí
  oh.add(U.box(OW + 0.5, 0.9, OD + 0.5, M.renderOld2, 0, 0, 0));
  oh.add(U.box(OW, OGH, OD, M.renderOld, 0, 0.9, 0));

  // malá okna a vstupní dveře
  [-7.4, -2.8, 2.8].forEach((x) => {
    oh.add(U.box(1.8, 1.5, 0.14, M.glassOld, x, 2.4, OD / 2 + 0.02));
    oh.add(U.windowFrame(1.9, 1.6, M.frame, x, 2.35, OD / 2 + 0.1, 0.11));
  });
  oh.add(U.box(1.5, 2.5, 0.16, M.woodOld, 7.4, 0.9, OD / 2 + 0.04));
  oh.add(U.windowFrame(1.6, 2.6, M.frame, 7.4, 0.85, OD / 2 + 0.12, 0.11));
  oh.add(U.box(2.8, 0.22, 1.2, M.renderOld2, 7.4, 3.5, OD / 2 + 0.5));   // stříška nad vstupem

  // patro
  oh.add(U.box(OW, 3.3, OD, M.renderOld, 0, OGH + 0.9, 0));
  [-7.4, -2.8, 2.8, 7.4].forEach((x) => {
    oh.add(U.box(1.6, 1.3, 0.14, M.glassOld, x, 6.4, OD / 2 + 0.02));
    oh.add(U.windowFrame(1.7, 1.4, M.frame, x, 6.35, OD / 2 + 0.1, 0.1));
  });

  // sedlová střecha — otočená tak, aby k divákovi mířila okapová strana
  const oroof = U.gableRoof(OD, OW, 3.4, M.roofOld, 0, OGH + 0.9 + 3.3, 0, 0.65);
  oroof.rotation.y = Math.PI / 2;
  oh.add(oroof);
  oh.add(U.box(1.1, 4.2, 1.1, M.brick, 5.6, 8.4, -2.2));                 // komín
  oh.add(U.box(OW + 1.3, 0.16, 0.16, M.metal, 0, 8.3, OD / 2 + 0.62));   // okap

  // dřevěná kůlna vlevo
  oh.add(U.box(5.0, 2.6, 3.6, M.woodOld, -12.6, 0, 1.6));
  oh.add(U.box(5.6, 0.22, 4.2, M.roofOld, -12.6, 2.6, 1.6));

  // zanedbané okolí
  old.add(U.slab(3.0, 17, M.concreteMid, -2.5, 0.06, 10.5));             // popraskaný chodník
  old.add(U.slab(13, 7.5, M.soil, 2.0, 0.04, 12.0));                     // udusaná plocha
  old.add(U.bush(-14.5, 4.5, 1.9, M.foliage));                           // přerostlé keře
  old.add(U.bush(-11.8, 6.6, 1.5, M.foliage));
  old.add(U.bush(13.6, 4.0, 2.0, M.foliage));
  old.add(U.bush(16.0, 6.2, 1.4, M.foliage));
  old.add(U.bush(-6.0, 15.5, 1.2, M.foliage));
  for (let i = 0; i < 9; i++) {                                          // starý plot
    old.add(U.box(0.16, 1.2, 0.16, M.woodOld, -24 + i * 6, 0, 19.4));
  }
  old.add(U.box(52, 0.12, 0.12, M.woodOld, 0, 1.0, 19.4));

  /* ================= PO REKONSTRUKCI ================= */
  const nw = new THREE.Group();
  nw.userData.phase = 'new';
  g.add(nw);

  const h = new THREE.Group();
  h.position.z = DZ;
  nw.add(h);

  const GW = 22, GH = 4.4, GD = 11;
  h.add(U.box(GW, GH, GD, M.concrete, 0, 0, 0));

  // prosklená část fasády (vlevo)
  const glassW = 13.4;
  const glassX = -GW / 2 + glassW / 2 + 0.6;
  h.add(U.box(glassW, 3.5, 0.18, M.glassWarm, glassX, 0.55, GD / 2 + 0.02));
  for (let i = 1; i < 6; i++) {
    h.add(U.box(0.12, 3.5, 0.26, M.frame, glassX - glassW / 2 + (glassW / 6) * i, 0.55, GD / 2 + 0.05));
  }
  h.add(U.box(glassW + 0.3, 0.16, 0.3, M.frame, glassX, 0.42, GD / 2 + 0.05));
  h.add(U.box(glassW + 0.3, 0.16, 0.3, M.frame, glassX, 4.06, GD / 2 + 0.05));

  // dřevěný obklad a vstup (vpravo)
  const woodW = 7.2;
  const woodX = GW / 2 - woodW / 2 - 0.4;
  h.add(U.box(woodW, GH, 0.22, M.wood, woodX, 0, GD / 2 + 0.03));
  h.add(U.slats(woodW, GH, M.woodDark, woodX, 0, GD / 2 + 0.15, 14, 0.07));
  h.add(U.box(2.0, 3.0, 0.16, M.glassWarm, woodX - 0.7, 0, GD / 2 + 0.22));
  h.add(U.windowFrame(2.0, 3.0, M.frame, woodX - 0.7, 0, GD / 2 + 0.3, 0.09));
  h.add(U.box(0.24, GH, GD * 0.8, M.concreteMid, -GW / 2 - 0.1, 0, -0.6));

  // převislé patro
  const UW = 25.2, UH = 4.0, UD = 12.4, UY = GH;
  h.add(U.box(UW, UH, UD, M.concrete, 0, UY, 0.6));
  h.add(U.box(UW + 0.4, 0.32, UD + 0.4, M.render, 0, UY + UH, 0.6));
  h.add(U.box(GW, 0.26, GD, M.concreteDark, 0, UY - 0.26, 0));

  const w1 = 8.6, w1x = -UW / 2 + w1 / 2 + 1.0;
  h.add(U.box(w1, 2.6, 0.18, M.glassWarm, w1x, UY + 0.7, UD / 2 + 0.62));
  h.add(U.box(0.12, 2.6, 0.26, M.frame, w1x, UY + 0.7, UD / 2 + 0.66));
  h.add(U.windowFrame(w1, 2.6, M.frame, w1x, UY + 0.7, UD / 2 + 0.7, 0.1));

  const lvW = 12.0, lvX = UW / 2 - lvW / 2 - 1.0;
  h.add(U.box(lvW, 3.0, 0.16, M.roofDark, lvX, UY + 0.6, UD / 2 + 0.56));
  h.add(U.louvers(lvW, 3.0, M.roof, lvX, UY + 0.62, UD / 2 + 0.7, 7, 0.14));
  h.add(U.box(0.18, 2.6, 7.0, M.glass, -UW / 2 - 0.02, UY + 0.7, 0.6));
  h.add(U.box(1.6, 1.2, 1.6, M.concreteMid, -7.0, UY + UH + 0.32, -2.6));

  // terasa a bazén
  nw.add(U.slab(30, 7.6, M.deck, 0, 0.08, 4.4));
  for (let i = 0; i < 3; i++) {
    nw.add(U.slab(10, 0.85, M.deck, -6.5, 0.08 - i * 0.14, 8.4 + i * 0.85));
  }
  nw.add(U.slab(19, 9.0, M.deck, 0, 0.05, 12.6));
  nw.add(U.box(16.4, 0.55, 6.8, M.water, 0, -0.48, 12.6));
  nw.add(U.box(17.2, 0.2, 7.6, M.render, 0, -0.02, 12.6));

  // upravená zeleň
  nw.add(U.tree(-24.0, 4.0, 1.2));
  nw.add(U.bush(-15.6, 2.0, 1.15));
  nw.add(U.bush(-13.8, 3.6, 0.85));
  nw.add(U.bush(15.4, 2.4, 1.2));
  nw.add(U.bush(17.2, 4.0, 0.9));
  nw.add(U.bush(-11.0, 17.5, 1.0));
  nw.add(U.bush(11.5, 17.8, 1.1));

  // lehátka
  for (let i = 0; i < 2; i++) {
    const l = new THREE.Group();
    l.add(U.box(2.1, 0.14, 0.85, M.render, 0, 0.42, 0));
    l.add(U.box(0.14, 0.5, 0.85, M.render, -0.95, 0.52, 0));
    l.position.set(-12.2 + i * 2.7, 0, 12.0);
    l.rotation.y = -0.22;
    nw.add(l);
  }

  return g;
}

function buildGable(THREE, M, U) {
  const g = new THREE.Group();

  /* --- pozemek 34 x 30 m --- */
  g.add(U.plot(34, 30, 2.2, M.grass, M.soil, 3.0));
  g.add(U.softShadow(44, 42, -2.35, 0.42));

  /* --- ulice, obrubník, plot a živý plot na jižní hraně --- */
  g.add(U.slab(27, 2.6, M.asphalt, 0, 0.06, 13.5));
  g.add(U.slab(27, 1.3, M.deck, 0, 0.13, 11.5));
  g.add(U.box(3.5, 0.55, 0.3, M.concreteMid, -13.45, 0, 10.5));
  g.add(U.box(18.1, 0.55, 0.3, M.concreteMid, 5.35, 0, 10.5));
  g.add(U.box(17.4, 0.95, 0.6, M.hedge, 5.35, 0, 9.85));
  g.add(U.box(1.0, 1.25, 12.0, M.hedge, 15.4, 0, -3.0));

  /* --- zpevněné plochy: vjezd ke garáži, chodník ke vchodu, záhon --- */
  g.add(U.slab(5.6, 9.1, M.deck, -8.7, 0.07, 6.55));
  g.add(U.slab(1.6, 7.2, M.deck, -4.6, 0.07, 7.5));
  g.add(U.slab(9.0, 4.6, M.grassDark, 1.5, 0.03, 6.8));

  /* ======================= DŮM ======================= */
  const H = new THREE.Group();
  H.position.z = -2.2;              // dům posunutý do zadní části pozemku
  g.add(H);

  const HW = 12, HD = 9;            // půdorys 12 x 9 m
  const FZ = HD / 2;                // rovina hlavní fasády (+Z)
  const SY = 0.45;                  // výška soklu
  const EY = SY + 5.3;              // úroveň okapu — dvě podlaží
  const RH = 3.35;                  // výška sedlové střechy

  H.add(U.box(HW + 0.3, SY, HD + 0.3, M.concreteDark, 0, 0, 0));   // sokl
  H.add(U.box(HW, EY - SY, HD, M.render, 0, SY, 0));               // hmota s omítkou

  // světlé omítnuté štíty lícují se stěnou, tmavá krytina leží 2 cm nad nimi
  const stit = U.gableRoof(9.9, HW + 0.1, RH, M.render, 0, EY, 0, 0);
  stit.rotation.y = Math.PI / 2;    // hřeben podél X, štíty na ±X
  H.add(stit);
  const strecha = U.gableRoof(9.9, HW - 0.1, RH, M.roof, 0, EY + 0.02, 0, 0);
  strecha.rotation.y = Math.PI / 2;
  H.add(strecha);
  H.add(U.box(HW + 0.2, 0.24, 0.44, M.roofDark, 0, EY + RH - 0.18, 0));  // hřebenáč

  // okap a svod
  H.add(U.box(HW + 0.1, 0.16, 0.16, M.metal, 0, EY - 0.16, FZ + 0.43));
  H.add(U.box(0.14, EY - SY, 0.14, M.metal, HW / 2 - 0.2, SY, FZ + 0.09));

  // komín a stará televizní anténa
  H.add(U.box(0.8, 1.95, 0.8, M.brick, -3.0, 7.45, -0.9));
  H.add(U.box(0.96, 0.16, 0.96, M.concreteDark, -3.0, 9.4, -0.9));
  H.add(U.box(0.08, 2.4, 0.08, M.metal, -4.4, 8.1, -0.6));
  H.add(U.box(0.06, 0.06, 1.5, M.metal, -4.4, 9.9, -0.6));
  H.add(U.box(0.06, 0.06, 1.2, M.metal, -4.4, 10.25, -0.6));

  /* --- okna hlavní fasády --- */
  const okno = (w, hgt, x, y) => {
    H.add(U.box(w, hgt, 0.12, M.glassWarm, x, y, FZ - 0.02));
    H.add(U.windowFrame(w, hgt, M.frame, x, y, FZ + 0.06, 0.1));
  };
  okno(1.9, 1.50, -1.9, 1.55);      // přízemí
  okno(1.9, 1.50, 1.2, 1.55);
  okno(1.3, 1.50, 4.2, 1.55);
  okno(1.9, 1.45, -4.6, 3.95);      // patro
  okno(1.9, 1.45, -1.9, 3.95);
  okno(1.9, 1.45, 1.2, 3.95);
  okno(1.3, 1.45, 4.2, 3.95);

  /* --- vstup: dveře, betonová stříška, schod --- */
  H.add(U.box(1.2, 2.25, 0.12, M.woodDark, -4.6, SY, FZ - 0.02));
  H.add(U.windowFrame(1.3, 2.35, M.frame, -4.6, SY - 0.05, FZ + 0.06, 0.1));
  H.add(U.slab(2.1, 1.1, M.concreteMid, -4.6, 3.05, FZ + 0.5, 0.14));
  H.add(U.slab(2.4, 1.2, M.concreteMid, -4.6, SY, FZ + 0.55, 0.45));
  H.add(U.slab(2.6, 0.42, M.concreteMid, -4.6, 0.22, FZ + 1.36, 0.22));

  /* --- vikýř v podkroví na přední straně střechy ---
     hloubka je volená tak, aby se zadní štít vikýře schoval pod hlavní střechu */
  const DX = 0.1, DZ = 1.8, DF = 3.2;     // střed v X, střed hmoty v Z, rovina čela
  H.add(U.box(2.6, 1.8, 2.8, M.render, DX, 6.4, DZ));
  H.add(U.gableRoof(2.8, 2.9, 0.7, M.roofDark, DX, 8.2, 1.85, 0.12));
  H.add(U.box(1.66, 1.06, 0.08, M.frame, DX, 7.12, DF + 0.03));
  H.add(U.box(1.5, 0.90, 0.12, M.glassWarm, DX, 7.20, DF - 0.01));

  /* --- štítové okno podkroví na straně garáže (-X) --- */
  H.add(U.box(0.12, 1.05, 1.35, M.glassWarm, -6.07, 6.6, 0));
  const stitRam = U.windowFrame(1.35, 1.05, M.frame, -6.12, 6.6, 0, 0.1);
  stitRam.rotation.y = Math.PI / 2;
  H.add(stitRam);

  /* --- dvě okna na boční stěně za garáží --- */
  const oknoBok = (w, hgt, y, z) => {
    H.add(U.box(0.08, hgt + 0.16, w + 0.16, M.frame, -6.09, y - 0.08, z));
    H.add(U.box(0.12, hgt, w, M.glassWarm, -6.05, y, z));
  };
  oknoBok(1.1, 1.35, 1.55, -2.9);
  oknoBok(1.1, 1.30, 3.95, -2.9);

  /* --- dřevěný přízemní přístavek / garáž (-X) --- */
  const GX = -8.7, GZ = 1.2, GW = 5.5, GD = 6.2, GH = 2.55;
  H.add(U.box(GW + 0.2, 0.2, GD + 0.2, M.concreteDark, GX, 0, GZ));
  H.add(U.box(GW, GH, GD, M.wood, GX, 0.2, GZ));
  H.add(U.slab(GW + 0.4, GD + 0.4, M.roofDark, GX, GH + 0.4, GZ, 0.2));
  H.add(U.box(3.6, 2.15, 0.12, M.woodDark, GX, 0.25, 4.28));            // vrata
  H.add(U.slats(3.5, 2.05, M.wood, GX, 0.3, 4.38, 9, 0.09));            // svlaky
  H.add(U.box(0.18, GH, 0.18, M.woodDark, GX - GW / 2 + 0.09, 0.2, 4.22));
  H.add(U.box(0.18, GH, 0.18, M.woodDark, GX + GW / 2 - 0.09, 0.2, 4.22));

  /* --- vzrostlá zeleň a keře --- */
  g.add(U.tree(-14.0, -7.0, 1.55));
  g.add(U.tree(13.2, -6.0, 1.40));
  g.add(U.tree(12.0, 7.6, 1.15));
  g.add(U.pine(-14.8, 3.2, 1.30));
  g.add(U.bush(-1.5, 3.6, 1.05));
  g.add(U.bush(0.7, 3.4, 0.80));
  g.add(U.bush(4.6, 3.2, 1.10));
  g.add(U.bush(7.6, 4.6, 0.90));
  g.add(U.bush(-13.0, 7.6, 1.20));
  g.add(U.bush(9.8, 9.2, 0.95));

  return g;
}

/* --------------------------------------------------------------------------
   POOLVILLA — moderní vila s bazénem, Praha-západ, po rekonstrukci
   Horizontální hmota z pohledového betonu doplněná svislým dřevěným obkladem,
   plochá střecha s tenkou světlou atikou a přesahem nad terasou i stáním,
   před domem dřevěná terasa a zapuštěný bazén.
   -------------------------------------------------------------------------- */
function buildPoolvilla(THREE, M, U) {
  const g = new THREE.Group();

  /* --- pozemek (40 × 34 m) --- */
  g.add(U.plot(40, 34, 2.2, M.grass, M.soil, 3.0));
  g.add(U.softShadow(52, 47, -2.35, 0.42));

  /* ==========================================================
     DŮM — posunutý do zadní části pozemku, čelo fasády v z = -4
     ========================================================== */
  const h = new THREE.Group();
  h.position.z = -9;
  g.add(h);

  const GW = 18, GH = 3.6, GD = 10;    // půdorys 18 × 10 m
  const F = GD / 2;                     // rovina hlavní fasády (+Z)
  h.add(U.box(GW, GH, GD, M.concrete, 0, 0, 0));

  /* --- velkoplošné prosklení obytné části (vlevo) --- */
  const glW = 9.6, glX = -GW / 2 + glW / 2 + 0.5;    // x -8,5 … 1,1
  h.add(U.box(glW, 2.9, 0.18, M.glassWarm, glX, 0.3, F + 0.02));
  for (let i = 1; i < 5; i++) {                       // svislé příčle
    h.add(U.box(0.12, 2.9, 0.26, M.frame, glX - glW / 2 + (glW / 5) * i, 0.3, F + 0.06));
  }
  h.add(U.box(glW + 0.3, 0.18, 0.3, M.frame, glX, 0.12, F + 0.06));   // parapetní pás
  h.add(U.box(glW + 0.3, 0.16, 0.3, M.frame, glX, 3.20, F + 0.06));   // nadpražní pás

  /* --- vstup --- */
  h.add(U.box(1.6, 2.6, 0.16, M.glassWarm, 2.4, 0, F + 0.06));
  h.add(U.windowFrame(1.6, 2.6, M.frame, 2.4, 0, F + 0.14, 0.09));

  /* --- svislý dřevěný obklad (vpravo, u vstupu a krytého stání) --- */
  const wdW = 5.0, wdX = GW / 2 - wdW / 2 - 0.5;      // x 3,5 … 8,5
  h.add(U.box(wdW, GH, 0.22, M.wood, wdX, 0, F + 0.03));
  h.add(U.slats(wdW, GH, M.woodDark, wdX, 0, F + 0.16, 10, 0.07));

  /* --- boční prosklení štítové stěny -X (natočené k divákovi) --- */
  h.add(U.box(0.18, 2.6, 5.0, M.glassWarm, -GW / 2 - 0.02, 0.5, 0.5));
  const sideFr = U.windowFrame(5.0, 2.6, M.frame, 0, 0.5, 0, 0.1);
  sideFr.rotation.y = Math.PI / 2;
  sideFr.position.set(-GW / 2 - 0.14, 0, 0.5);
  h.add(sideFr);

  /* ==========================================================
     PLOCHÁ STŘECHA s přesahem 4 m nad terasou a stáním
     ========================================================== */
  const RY = GH;                                                    // úroveň stropu
  h.add(U.box(19.2, 0.34, 14.6, M.concreteMid, 0, RY, 1.7));        // střešní deska
  h.add(U.box(19.6, 0.28, 15.0, M.render, 0, RY + 0.34, 1.7));      // tenká světlá atika
  h.add(U.box(18.0, 0.20, 4.2, M.concreteDark, 0, RY - 0.2, 6.9));  // podhled ve stínu
  h.add(U.box(0.30, RY - 0.2, 0.30, M.metal, -7.6, 0, 8.5));        // subtilní sloupky
  h.add(U.box(0.30, RY - 0.2, 0.30, M.metal, 7.6, 0, 8.5));

  /* --- technika a fotovoltaika na střeše --- */
  h.add(U.box(1.4, 0.9, 1.4, M.concreteMid, -6.2, RY + 0.62, -2.2));
  h.add(U.box(3.8, 0.12, 1.7, M.solar, -2.4, RY + 0.62, -3.6));

  /* ==========================================================
     VYVÝŠENÁ ČÁST — nízké druhé podlaží ustoupené od fasády
     ========================================================== */
  const UY = RY + 0.62, UH = 3.0;      // stojí na atice hlavní střechy
  h.add(U.box(7.8, UH, 8.6, M.concrete, 4.6, UY, -0.8));
  h.add(U.box(8.2, 0.26, 9.0, M.render, 4.6, UY + UH, -0.8));       // atika patra
  const UF = -0.8 + 4.3;                                            // čelo patra
  h.add(U.box(4.2, 2.2, 0.18, M.glassWarm, 3.2, UY + 0.5, UF + 0.02));
  h.add(U.box(0.10, 2.2, 0.24, M.frame, 1.8, UY + 0.5, UF + 0.06));
  h.add(U.box(0.10, 2.2, 0.24, M.frame, 4.6, UY + 0.5, UF + 0.06));
  h.add(U.windowFrame(4.2, 2.2, M.frame, 3.2, UY + 0.5, UF + 0.12, 0.1));
  h.add(U.box(2.6, UH, 0.20, M.wood, 7.0, UY, UF + 0.03));
  h.add(U.slats(2.6, UH, M.woodDark, 7.0, UY, UF + 0.16, 6, 0.07));

  /* ==========================================================
     ZAHRADA — terasa, kryté stání, bazén
     ========================================================== */
  g.add(U.slab(13.5, 8.6, M.deck, -1.75, 0.06, 0.3));      // dřevěná terasa před prosklením
  g.add(U.slab(14.5, 5.0, M.asphalt, 12.25, 0.03, -1.8));  // příjezd a kryté stání pod přesahem
  g.add(U.slab(6.8, 6.4, M.deck, 7.9, 0.06, 7.8));         // deck s lehátky u bazénu

  /* --- bazén 12 × 5,4 m, hladina lemovaná světlým obrubníkem --- */
  const PW = 12, PD = 5.4, px = -2, pz = 7.6;
  g.add(U.box(PW, 0.60, PD, M.water, px, -0.53, pz));      // zapuštěná vodní hladina
  g.add(U.box(PW + 0.9, 0.2, 0.45, M.render, px, -0.08, pz - PD / 2 - 0.225));
  g.add(U.box(PW + 0.9, 0.2, 0.45, M.render, px, -0.08, pz + PD / 2 + 0.225));
  g.add(U.box(0.45, 0.2, PD, M.render, px - PW / 2 - 0.225, -0.08, pz));
  g.add(U.box(0.45, 0.2, PD, M.render, px + PW / 2 + 0.225, -0.08, pz));

  /* --- dvě lehátka opřená zády k plotu, čelem k bazénu --- */
  for (let i = 0; i < 2; i++) {
    const l = new THREE.Group();
    l.add(U.box(1.9, 0.34, 0.62, M.metal, 0, 0.06, 0));    // rám
    l.add(U.box(2.0, 0.16, 0.78, M.render, 0, 0.40, 0));   // sedák
    l.add(U.box(0.16, 0.50, 0.78, M.render, 0.92, 0.50, 0)); // opěrka
    l.position.set(7.6, 0, 6.3 + i * 2.3);
    l.rotation.y = 0.1 - i * 0.2;
    g.add(l);
  }

  /* --- slunečník --- */
  const pole = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.06, 2.4, 8), M.metal);
  pole.position.set(9.9, 1.26, 7.5);
  pole.castShadow = true;
  g.add(pole);
  const shade = new THREE.Mesh(new THREE.ConeGeometry(1.5, 0.45, 12), M.render);
  shade.position.set(9.9, 2.62, 7.5);
  shade.castShadow = true;
  g.add(shade);

  /* --- truhlík u vstupu --- */
  g.add(U.box(2.2, 0.5, 0.9, M.render, 2.4, 0.06, -2.4));
  g.add(U.box(2.0, 0.4, 0.7, M.hedge, 2.4, 0.50, -2.4));

  /* ==========================================================
     ZELEŇ — vzrostlá po stranách, živý plot po obvodu
     ========================================================== */
  g.add(U.box(30, 1.6, 1.0, M.hedge, 0, 0, -15.8));
  g.add(U.box(0.9, 1.5, 10, M.hedge, -18.6, 0, -9));
  g.add(U.box(0.9, 1.5, 8, M.hedge, 18.6, 0, -9));

  g.add(U.pine(-16.5, -10.5, 1.5));
  g.add(U.pine(-13.5, -14.5, 1.1));
  g.add(U.tree(-15.5, 3.0, 1.3));
  g.add(U.tree(-16.8, 12.5, 1.05));
  g.add(U.tree(16.5, -9.0, 1.45));
  g.add(U.tree(13.8, -13.5, 1.05));

  g.add(U.bush(-12.5, 2.5, 0.9));
  g.add(U.bush(-11.0, 5.5, 1.05));
  g.add(U.bush(-12.2, 7.5, 0.85));
  g.add(U.bush(-10.5, 10.5, 1.0));
  g.add(U.bush(12.6, 2.6, 1.1));
  g.add(U.bush(13.8, 4.2, 0.85));
  g.add(U.bush(11.9, 6.6, 0.95));
  g.add(U.bush(13.2, 9.0, 1.05));

  return g;
}

function buildBungalow(THREE, M, U) {
  const g = new THREE.Group();

  /* --- pozemek 36 × 30 m --- */
  const PW = 36, PD = 30;
  g.add(U.plot(PW, PD, 2.2, M.grass, M.soil, 3.0));
  g.add(U.softShadow(PW * 1.3, PD * 1.4, -2.35, 0.42));

  /* --- náznak sekaných pásů trávníku --- */
  g.add(U.slab(13.0, 8.0, M.grassDark, -9.5, 0.02, 8.5));
  g.add(U.slab(11.0, 5.8, M.grassDark, 10.5, 0.02, -10.3));

  /* ==================================================================
     DŮM — jedno podlaží 16 × 9 m, plochá střecha s markýzou
     ================================================================== */
  const HW = 16, HH = 3.2, HD = 9, HZ = -2.5;
  const zF = HZ + HD / 2;              // čelní fasáda (+Z) v z = 2.0
  const zB = HZ - HD / 2;              // zadní stěna v z = -7.0
  g.add(U.box(HW, HH, HD, M.render, 0, 0, HZ));

  /* střešní deska s velkým přesahem (markýza sahá do z = 5.0) */
  g.add(U.box(19.0, 0.42, 13.4, M.render, 0, HH, -1.7));
  g.add(U.box(19.0, 0.14, 2.75, M.concreteDark, 0, HH - 0.14, 3.625));  // podhled markýzy

  /* terasa pod markýzou */
  g.add(U.slab(17.6, 3.7, M.deck, 0, 0.10, 3.65));

  /* štíhlé sloupky nesoucí přesah */
  [-8.6, -3.0, 3.0, 8.6].forEach((x) => {
    g.add(U.box(0.16, 2.96, 0.16, M.metal, x, 0.10, 4.4));
  });

  /* --- velké prosklení přes levou část fasády --- */
  const GW = 10.6, GX = -2.3, GY = 0.10, GH = 2.90;
  g.add(U.box(GW, GH, 0.18, M.glassWarm, GX, GY, zF + 0.02));
  for (let i = 1; i < 6; i++) {
    g.add(U.box(0.12, GH, 0.26, M.frame, GX - GW / 2 + (GW / 6) * i, GY, zF + 0.06));
  }
  g.add(U.box(GW + 0.3, 0.16, 0.30, M.frame, GX, GY + GH, zF + 0.06));   // horní profil

  /* --- pravá omítaná část se vstupem --- */
  g.add(U.box(3.4, 3.05, 0.12, M.concreteMid, 5.6, 0.10, zF + 0.04));
  g.add(U.box(1.2, 2.40, 0.12, M.woodDark, 5.0, 0.10, zF + 0.16));       // dveře
  g.add(U.box(0.5, 2.40, 0.10, M.glassWarm, 6.1, 0.10, zF + 0.15));      // boční světlík
  g.add(U.windowFrame(1.4, 2.55, M.frame, 5.0, 0.10, zF + 0.24, 0.08));

  /* --- okna do stran a na zahradu vzadu --- */
  g.add(U.box(0.16, 1.70, 3.40, M.glassWarm, -HW / 2 - 0.03, 0.90, -3.2));
  g.add(U.box(0.20, 1.70, 0.10, M.frame, -HW / 2 - 0.05, 0.90, -3.2));
  g.add(U.box(0.16, 1.20, 2.20, M.glass, HW / 2 + 0.03, 1.30, -4.6));
  g.add(U.box(4.20, 1.50, 0.16, M.glass, -2.5, 1.30, zB - 0.03));

  /* --- střešní světlíky a technika --- */
  g.add(U.box(2.4, 0.30, 1.6, M.glassWarm, -4.0, HH + 0.42, -4.2));
  g.add(U.box(1.8, 0.30, 1.4, M.glassWarm, 1.5, HH + 0.42, -5.0));
  g.add(U.box(1.5, 0.60, 1.3, M.concreteMid, 6.0, HH + 0.42, -5.5));

  /* --- dřevěná clona na okraji terasy --- */
  const screen = new THREE.Group();
  screen.add(U.slats(2.8, 2.4, M.woodDark, 0, 0.10, 0, 8, 0.10));
  screen.rotation.y = Math.PI / 2;
  screen.position.set(-8.6, 0, 3.6);
  g.add(screen);

  /* --- stůl a dvě sedátka na terase --- */
  g.add(U.box(0.50, 0.62, 0.50, M.metal, -4.8, 0.10, 3.6));
  g.add(U.box(2.00, 0.08, 1.00, M.woodDark, -4.8, 0.72, 3.6));
  g.add(U.box(0.55, 0.42, 0.55, M.deck, -6.2, 0.10, 3.6));
  g.add(U.box(0.55, 0.42, 0.55, M.deck, -3.4, 0.10, 3.6));

  /* --- dlážděná cesta ke vstupu + nášlap z terasy --- */
  g.add(U.slab(3.2, 1.1, M.concreteMid, 5.0, 0.08, 5.9));
  for (let i = 0; i < 6; i++) {
    g.add(U.slab(2.4, 1.2, M.concreteMid, 5.0, 0.06, 6.9 + i * 1.28));
  }

  /* --- nízká svítidla u cesty --- */
  [8.18, 12.02].forEach((z) => {
    g.add(U.box(0.10, 0.95, 0.10, M.metal, 3.2, 0, z));
    g.add(U.box(0.20, 0.14, 0.20, M.glassWarm, 3.2, 0.95, z));
  });

  /* --- živý plot kolem pozemku (vpředu přerušený kvůli průhledu);
         délky drženy uvnitř zaoblených rohů pozemku (r = 3.0) --- */
  const HGH = 1.6, HGT = 0.9;
  g.add(U.box(HGT, HGH, 26.4, M.hedge, -17.0, 0, -0.2));   // levá strana
  g.add(U.box(HGT, HGH, 26.4, M.hedge, 17.0, 0, -0.2));    // pravá strana
  g.add(U.box(33.1, HGH, HGT, M.hedge, 0, 0, -13.7));      // zadní hrana
  g.add(U.box(8.0, HGH, HGT, M.hedge, -12.55, 0, 13.3));   // vpředu vlevo
  g.add(U.box(6.0, HGH, HGT, M.hedge, 13.55, 0, 13.3));    // vpředu vpravo

  /* --- vzrostlé stromy vzadu --- */
  g.add(U.tree(-12.0, -10.5, 1.6));
  g.add(U.tree(11.0, -11.0, 1.4));

  /* --- keře --- */
  g.add(U.bush(-7.4, 6.5, 0.85));
  g.add(U.bush(-5.9, 6.6, 0.60));
  g.add(U.bush(7.8, 6.6, 0.80));
  g.add(U.bush(9.6, 8.4, 0.65));
  g.add(U.bush(-14.3, 6.5, 1.05));
  g.add(U.bush(13.8, 3.6, 1.00));
  g.add(U.bush(-12.5, -5.5, 0.90));
  g.add(U.bush(1.0, 10.5, 0.75));

  return g;
}

function buildTownvilla(THREE, M, U) {
  const g = new THREE.Group();

  /* --- pozemek 32 × 28 m --- */
  g.add(U.plot(32, 28, 2.2, M.grass, M.soil, 3.0));
  g.add(U.softShadow(41.6, 39.2, -2.35, 0.42));

  /* ======================= DŮM (12 × 10 m, ~9 m) =======================
     Vlastní skupina posunutá do zadní poloviny pozemku; lokální osy:
     x = ±6, z = ±5, čelní fasáda v lokálním z = +5.                      */
  const h = new THREE.Group();
  h.position.z = -2.5;
  g.add(h);

  const F = 5.0;          // lokální z čelní fasády
  const EY = 7.94;        // úroveň okapu
  const RIDGE = EY + 1.15;

  /* --- hmota: sokl, cihelné přízemí, římsa, omítnuté patro --- */
  h.add(U.box(12.3, 0.45, 10.3, M.concreteDark, 0, 0, 0));      // patka soklu
  h.add(U.box(12.0, 3.60, 10.0, M.brick, 0, 0.45, 0));          // přízemí — cihla
  h.add(U.box(12.6, 0.32, 10.6, M.concreteMid, 0, 3.95, 0));    // mezipatrová římsa
  h.add(U.box(12.0, 3.60, 10.0, M.render, 0, 4.27, 0));         // patro — světlá omítka
  h.add(U.box(12.4, 0.22, 10.4, M.concreteMid, 0, 7.72, 0));    // korunní římsa

  /* --- nízká sedlová střecha, hřeben rovnoběžně s ulicí --- */
  const roof = U.gableRoof(10, 12, 1.15, M.roofDark, 0, EY, 0, 0.5);
  roof.rotation.y = Math.PI / 2;
  h.add(roof);
  h.add(U.box(13.2, 0.14, 0.40, M.roof, 0, RIDGE - 0.07, 0));   // hřebenáč
  h.add(U.box(13.2, 0.14, 0.18, M.metal, 0, 7.80, F + 0.40));   // okap pod čelní hranou střechy

  // svody u čelních rohů (stará klempířina)
  for (const sx of [-5.85, 5.85]) {
    const p = new THREE.Mesh(new THREE.CylinderGeometry(0.09, 0.09, 7.67, 8), M.metal);
    p.position.set(sx, 3.985, F + 0.40);
    p.castShadow = true;
    h.add(p);
  }

  /* --- tři symetrická okna v patře (skla vždy až PŘED lícem stěny) --- */
  for (const wx of [-3.7, 0, 3.7]) {
    h.add(U.box(1.5, 1.9, 0.16, M.glassWarm, wx, 5.15, F + 0.01));
    h.add(U.windowFrame(1.5, 1.9, M.frame, wx, 5.15, F + 0.05, 0.1));
    h.add(U.box(1.8, 0.12, 0.36, M.concreteMid, wx, 5.03, F + 0.06));
  }

  /* --- dvě okna v přízemí po stranách vstupu --- */
  for (const wx of [-3.7, 3.7]) {
    h.add(U.box(1.5, 1.75, 0.16, M.glassWarm, wx, 1.50, F + 0.01));
    h.add(U.windowFrame(1.5, 1.75, M.frame, wx, 1.50, F + 0.05, 0.1));
    h.add(U.box(1.8, 0.12, 0.36, M.concreteMid, wx, 1.38, F + 0.06));
  }

  /* --- vstup se stříškou, schody --- */
  h.add(U.box(1.4, 2.50, 0.12, M.woodDark, 0, 0.45, F + 0.03));      // dveře
  h.add(U.box(0.9, 0.50, 0.10, M.glassWarm, 0, 2.30, F + 0.06));     // světlík ve dveřích
  h.add(U.windowFrame(1.6, 2.65, M.frame, 0, 0.42, F + 0.07, 0.1));
  h.add(U.box(3.2, 0.18, 1.50, M.concreteMid, 0, 3.27, F + 0.65));   // stříška
  for (const bx of [-1.4, 1.4]) {
    h.add(U.box(0.12, 0.55, 0.70, M.metal, bx, 2.72, F + 0.35));     // konzolky
  }
  h.add(U.slab(3.0, 1.45, M.deck, 0, 0.45, F + 0.70, 0.45));         // podesta
  h.add(U.slab(3.0, 0.55, M.deck, 0, 0.24, F + 1.65, 0.24));         // schod

  /* --- boční okna (obě štítové stěny) --- */
  const sideWindow = (sx, sz, w, hh, y) => {
    const grp = new THREE.Group();
    grp.add(U.box(w, hh, 0.16, M.glassWarm, 0, 0, 0));
    grp.add(U.windowFrame(w, hh, M.frame, 0, 0, 0.08, 0.09));
    grp.rotation.y = sx > 0 ? Math.PI / 2 : -Math.PI / 2;
    grp.position.set(sx, y, sz);
    return grp;
  };
  h.add(sideWindow(-6, 1.5, 1.3, 1.6, 5.3));
  h.add(sideWindow(-6, -2.0, 1.3, 1.6, 5.3));
  h.add(sideWindow(6, 1.5, 1.3, 1.6, 5.3));
  h.add(sideWindow(6, -2.0, 1.3, 1.6, 5.3));
  h.add(U.box(0.14, 1.4, 1.1, M.glassWarm, -6, 1.6, -0.5));
  h.add(U.box(0.14, 1.4, 1.1, M.glassWarm, 6, 1.6, -0.5));

  /* --- komín --- */
  h.add(U.box(0.9, 2.6, 0.9, M.brick, -2.8, 7.5, -2.5));
  h.add(U.box(1.1, 0.16, 1.1, M.concreteDark, -2.8, 10.1, -2.5));

  /* --- opadaná omítka a zatékání (zanedbaný stav) --- */
  h.add(U.box(1.3, 1.1, 0.06, M.concreteMid, -5.3, 4.50, F + 0.01));
  h.add(U.box(0.9, 1.4, 0.06, M.concreteMid, 5.3, 6.10, F + 0.01));
  h.add(U.box(0.06, 1.2, 2.0, M.concreteMid, -6.01, 4.40, 1.0));

  /* ======================= ULICE A PŘEDZAHRÁDKA ======================= */
  g.add(U.slab(26, 3.8, M.asphalt, 0, 0.04, 11.5, 0.20));            // vozovka
  for (const dx of [-10.5, -3.5, 3.5, 10.5]) {
    g.add(U.slab(2.2, 0.20, M.concreteMid, dx, 0.06, 11.5, 0.05));   // dělicí čára
  }
  g.add(U.box(26, 0.20, 0.34, M.concreteMid, 0, 0, 9.45));           // obrubník
  g.add(U.slab(26, 3.2, M.deck, 0, 0.16, 8.0, 0.32));                // chodník
  g.add(U.slab(2.8, 2.1, M.deck, 0, 0.10, 5.40, 0.20));              // pěšina k domu

  // nízká zídka s živým plotem + sloupky branky
  for (const sx of [-7.95, 7.95]) {
    g.add(U.box(12.1, 0.55, 0.50, M.concreteMid, sx, 0, 5.9));
    g.add(U.box(11.7, 0.70, 0.60, M.hedge, sx, 0.55, 5.9));
  }
  g.add(U.box(0.5, 1.45, 0.6, M.brick, -1.8, 0, 5.9));
  g.add(U.box(0.5, 1.45, 0.6, M.brick, 1.8, 0, 5.9));

  // stromořadí na chodníku a pouliční lampa
  g.add(U.tree(-10.9, 7.9, 1.10));
  g.add(U.tree(10.2, 7.9, 1.05));
  const pole = new THREE.Mesh(new THREE.CylinderGeometry(0.09, 0.12, 4.4, 8), M.metal);
  pole.position.set(6.4, 2.2, 8.9);
  pole.castShadow = true;
  g.add(pole);
  g.add(U.box(0.5, 0.24, 0.5, M.glassWarm, 6.4, 4.30, 8.9));

  /* ======================= ZAHRADA ZA DOMEM ======================= */
  g.add(U.slab(7.0, 3.2, M.deck, 0, 0.08, -9.2, 0.20));              // terasa
  g.add(U.box(2.8, 2.1, 2.2, M.concreteMid, -11.6, 0, -11.2));       // kůlna
  g.add(U.gableRoof(2.8, 2.2, 0.55, M.roofDark, -11.6, 2.1, -11.2, 0.25));
  for (const sx of [-14.4, 14.4]) {
    g.add(U.box(0.7, 1.15, 17, M.hedge, sx, 0, -3.0));               // ploty k sousedům
  }
  g.add(U.tree(-11.0, -6.0, 1.35));
  g.add(U.bush(-8.6, 3.4, 1.00));
  g.add(U.bush(8.8, 3.2, 1.15));
  g.add(U.bush(9.6, -8.0, 0.95));
  g.add(U.bush(-4.2, -10.6, 0.85));

  return g;
}

function buildCube(THREE, M, U) {
  const g = new THREE.Group();

  /* --- pozemek --- */
  g.add(U.plot(34, 30, 2.2, M.grass, M.soil, 3.0));
  g.add(U.softShadow(44, 42, -2.35, 0.42));

  /* ==========================================================
     DŮM — dva posunuté kvádry
     ========================================================== */
  const h = new THREE.Group();
  h.position.z = -4.2;                     // dům v zadní části pozemku
  g.add(h);

  const LW = 16, LH = 4.3, LD = 11;        // spodní, širší hmota
  const F = LD / 2;                        // čelní rovina přízemí
  h.add(U.box(LW, LH, LD, M.concreteMid, 0, 0, 0));

  const UW = 11.4, UH = 3.8, UD = 11.3;    // horní hmota
  const UX = 2.3, UY = LH, UZ = 1.35;      // vysunutá doprava a předsazená dopředu
  const UF = UZ + UD / 2;                  // čelo patra (1.5 m před přízemím)
  h.add(U.box(UW, UH, UD, M.concrete, UX, UY, UZ));
  h.add(U.box(UW + 0.5, 0.32, UD + 0.5, M.render, UX, UY + UH, UZ));   // tenká světlá atika

  /* --- kryté zápraží pod předsazeným patrem --- */
  h.add(U.box(UW, 0.22, UF - F, M.concreteDark, UX, UY - 0.22, (UF + F) / 2));  // podhled ve stínu
  h.add(U.box(0.24, UY - 0.22, 0.24, M.render, UX - 4.9, 0, UF - 0.45));
  h.add(U.box(0.24, UY - 0.22, 0.24, M.render, UX + 4.9, 0, UF - 0.45));

  /* --- střešní terasa nad odkrytou částí přízemí --- */
  h.add(U.slab(4.34, LD - 0.52, M.deck, -5.57, LH + 0.12, 0));
  h.add(U.box(4.34, 0.9, 0.26, M.render, -5.57, LH, F - 0.13));
  h.add(U.box(4.34, 0.9, 0.26, M.render, -5.57, LH, -F + 0.13));
  h.add(U.box(0.26, 0.9, LD, M.render, -LW / 2 + 0.13, LH, 0));

  for (let i = 0; i < 2; i++) {            // dva truhlíky se zelení
    const pz = -0.6 + i * 4.0;
    h.add(U.box(1.5, 0.5, 1.5, M.render, -5.6, LH + 0.12, pz));
    const gr = new THREE.Mesh(new THREE.IcosahedronGeometry(0.72, 1), M.hedge);
    gr.position.set(-5.6, LH + 0.96, pz);
    gr.scale.y = 0.8;
    gr.castShadow = true;
    h.add(gr);
  }

  /* --- velkoplošné prosklení přízemí (vlevo) --- */
  const gW = 8.0, gX = -3.4;
  h.add(U.box(gW, 3.5, 0.18, M.glassWarm, gX, 0.45, F + 0.02));
  for (let i = 1; i < 6; i++) {            // jemné příčle
    h.add(U.box(0.12, 3.5, 0.26, M.frame, gX - gW / 2 + (gW / 6) * i, 0.45, F + 0.06));
  }
  h.add(U.box(gW + 0.3, 0.16, 0.3, M.frame, gX, 0.30, F + 0.06));
  h.add(U.box(gW + 0.3, 0.16, 0.3, M.frame, gX, 3.95, F + 0.06));

  /* --- vstup uprostřed zápraží --- */
  h.add(U.box(3.0, 3.6, 0.14, M.concreteDark, 2.3, 0, F - 0.03));
  h.add(U.box(1.8, 2.9, 0.14, M.glassWarm, 2.3, 0, F + 0.11));
  h.add(U.windowFrame(1.8, 2.9, M.frame, 2.3, 0, F + 0.20, 0.09));

  /* --- svislý dřevěný akcent (vpravo) --- */
  const wW = 3.8, wX = 5.9;
  h.add(U.box(wW, LH, 0.2, M.wood, wX, 0, F + 0.02));
  h.add(U.slats(wW, LH, M.woodDark, wX, 0, F + 0.18, 10, 0.1));

  /* --- pásové prosklení patra --- */
  const uW = 9.4;
  h.add(U.box(uW, 2.7, 0.18, M.glassWarm, UX, UY + 0.75, UF + 0.02));
  for (let i = 1; i < 4; i++) {
    h.add(U.box(0.12, 2.7, 0.26, M.frame, UX - uW / 2 + (uW / 4) * i, UY + 0.75, UF + 0.06));
  }
  h.add(U.windowFrame(uW, 2.7, M.frame, UX, UY + 0.75, UF + 0.10, 0.1));

  /* --- pásové okno v boční stěně přízemí --- */
  h.add(U.box(0.16, 2.4, 4.4, M.glassWarm, -LW / 2 - 0.02, 1.0, -0.6));
  h.add(U.box(0.22, 0.14, 4.7, M.frame, -LW / 2 - 0.05, 0.86, -0.6));
  h.add(U.box(0.22, 0.14, 4.7, M.frame, -LW / 2 - 0.05, 3.40, -0.6));

  /* --- prosklené dveře patra na střešní terasu --- */
  h.add(U.box(0.16, 2.6, 3.6, M.glassWarm, UX - UW / 2 - 0.02, LH + 0.12, 3.0));
  h.add(U.box(0.24, 2.6, 0.12, M.frame, UX - UW / 2 - 0.06, LH + 0.12, 3.0));
  h.add(U.box(0.26, 0.14, 3.9, M.frame, UX - UW / 2 - 0.07, LH + 2.72, 3.0));

  /* ==========================================================
     KAMENNÁ TERASA A VODNÍ PRVEK
     ========================================================== */
  g.add(U.slab(18.4, 8.0, M.deck, 0, 0.10, 5.3));      // hlavní plocha
  g.add(U.slab(18.4, 0.9, M.deck, 0, 0.02, 9.75));     // nižší stupeň do trávníku

  g.add(U.box(6.0, 0.55, 2.0, M.water, -1.2, -0.46, 6.4));          // mělká hladina 6 × 2 m, těsně pod dlažbou
  g.add(U.box(6.56, 0.26, 0.28, M.render, -1.2, -0.02, 7.54));      // světlé obruby
  g.add(U.box(6.56, 0.26, 0.28, M.render, -1.2, -0.02, 5.26));
  g.add(U.box(0.28, 0.26, 2.0, M.render, -4.34, -0.02, 6.4));
  g.add(U.box(0.28, 0.26, 2.0, M.render, 1.94, -0.02, 6.4));

  /* --- lavice a dvě lehátka --- */
  g.add(U.box(2.6, 0.14, 0.62, M.wood, -6.4, 0.46, 4.2));
  g.add(U.box(0.16, 0.46, 0.5, M.concreteMid, -7.4, 0.10, 4.2));
  g.add(U.box(0.16, 0.46, 0.5, M.concreteMid, -5.4, 0.10, 4.2));

  for (let i = 0; i < 2; i++) {
    const l = new THREE.Group();
    l.add(U.box(1.9, 0.12, 0.72, M.render, 0, 0.44, 0));
    l.add(U.box(0.12, 0.46, 0.72, M.render, -0.89, 0.54, 0));
    l.add(U.box(1.5, 0.44, 0.16, M.concreteMid, 0, 0, 0));
    l.position.set(5.2 + i * 2.2, 0.10, 6.8);   // stojí na terase, ne v ní
    l.rotation.y = -0.12;
    g.add(l);
  }

  /* --- dva sloupky osvětlení u vstupní osy --- */
  g.add(U.box(0.1, 0.9, 0.1, M.metal, 0.3, 0.1, 2.9));
  g.add(U.box(0.1, 0.9, 0.1, M.metal, 4.3, 0.1, 2.9));

  /* --- střídmá zeleň --- */
  g.add(U.tree(-13.2, -3.5, 1.45));
  g.add(U.tree(-11.5, -11.5, 1.15));
  g.add(U.tree(13.2, -1.5, 1.35));
  g.add(U.bush(-11.4, 3.4, 1.05));
  g.add(U.bush(-12.5, 5.0, 0.8));
  g.add(U.bush(11.3, 3.6, 1.0));
  g.add(U.bush(12.4, 5.2, 0.78));

  return g;
}

function buildAerial(THREE, M, U) {
  const g = new THREE.Group();

  /* --- pozemek na výšku (60 × 84 m) --- */
  const PW = 60, PD = 84;
  g.add(U.plot(PW, PD, 2.2, M.grass, M.soil, 3.0));
  g.add(U.softShadow(PW * 1.3, PD * 1.4, -2.35, 0.42));

  /* --- plochý pás: cesta, nájezd, jiný odstín trávy --- */
  function strip(w, d, mat, x, z, rot, y = 0.06, t = 0.1) {
    const s = U.slab(w, d, mat, x, y, z, t);
    s.rotation.y = rot;
    return s;
  }

  /* --- tmavší plochy trávy — rozbíjejí jednolitý zelený koberec --- */
  g.add(strip(15, 12, M.grassDark, 18.5, 33.5, 0.12, 0.04, 0.08));
  g.add(strip(9, 14, M.grassDark, -23.0, 16.0, -0.20, 0.04, 0.08));
  g.add(strip(16, 9, M.grassDark, 19.0, -35.5, 0.12, 0.04, 0.08));

  /* --- hlavní ulice: čtyři pootočené úseky dávají měkký oblouk --- */
  g.add(strip(6.0, 24, M.asphalt, 2.2, 29.4, 0.16));
  g.add(strip(6.0, 24, M.asphalt, 0.0, 12, -0.10));
  g.add(strip(6.0, 24, M.asphalt, -0.8, -8, 0.14));
  g.add(strip(6.0, 26, M.asphalt, -3.0, -28, -0.05));

  /* --- odbočka k východní části lokality --- */
  g.add(strip(20, 5.2, M.asphalt, 8.5, -5.5, 0.14));
  g.add(strip(13, 5.2, M.asphalt, 21.5, -11.5, 0.62));

  /* --- nájezdy k domům (o chlup výš, aby se netříštily s cestou) --- */
  g.add(strip(9.0, 3.2, M.asphalt, -4.5, 28.8, 0.05, 0.075));
  g.add(strip(8.0, 3.4, M.asphalt, 3.4, 15.5, -0.38, 0.075));
  g.add(strip(11.0, 3.2, M.asphalt, -6.0, 3.2, 0.06, 0.075));
  g.add(strip(7.0, 3.2, M.asphalt, 23.5, -16.4, -0.49, 0.075));
  g.add(strip(4.2, 3.2, M.asphalt, -5.9, -28.6, 0.03, 0.075));

  /* --- jeden dům: hmota + sedlová střecha, volitelně komín, garáž, panely, terasa --- */
  function house(cfg) {
    const h = new THREE.Group();
    const w = cfg.w, d = cfg.d, wall = cfg.wall, rh = cfg.rh;

    h.add(U.box(w, wall, d, cfg.body, 0, 0, 0));
    h.add(U.gableRoof(w, d, rh, cfg.roof, 0, wall, 0, 0.55));

    if (cfg.chimney) {
      h.add(U.box(0.8, 1.5, 0.8, M.concreteMid, 0, wall + rh - 0.5, -d * 0.26));
    }

    if (cfg.annex) {                       // nízká garáž s plochou střechou
      const aw = cfg.annex[0], ad = cfg.annex[1], ah = cfg.annex[2], az = cfg.annex[3];
      const ax = -(w + aw) / 2;
      h.add(U.box(aw, ah, ad, M.concreteMid, ax, 0, az));
      h.add(U.slab(aw + 0.5, ad + 0.4, M.roofDark, ax - 0.25, ah + 0.16, az, 0.16));
    }

    if (cfg.solar) {                       // panely na osluněné ploše střechy (+X)
      const half = (w + 1.1) / 2;
      const slope = Math.hypot(half, rh);
      const a = Math.atan2(rh, half);      // sklon střešní roviny
      const s = 0.52;                      // poloha středu panelu na spádnici
      const px = half * s + Math.sin(a) * 0.1;
      const py = wall + rh * (1 - s) + Math.cos(a) * 0.1;
      for (let i = 0; i < cfg.solar; i++) {
        const p = new THREE.Mesh(new THREE.BoxGeometry(slope * 0.5, 0.12, d * 0.3), M.solar);
        p.rotation.z = -a;
        p.position.set(px, py, (i - (cfg.solar - 1) / 2) * d * 0.36);
        p.castShadow = true;
        p.receiveShadow = true;
        h.add(p);
      }
    }

    if (cfg.terrace) {                     // terasa před domem (+Z)
      const tw = cfg.terrace[0], td = cfg.terrace[1], tx = cfg.terrace[2];
      h.add(U.slab(tw, td, M.deck, tx, 0.1, d / 2 + td / 2, 0.12));
    }

    h.position.set(cfg.x, 0, cfg.z);
    h.rotation.y = cfg.rot;
    return h;
  }

  /* --- pět domů: nepravidelné rozestupy i natočení, žádná mřížka --- */
  g.add(house({ x: -16.5, z: 25.0, rot: 0.30, w: 13.0, d: 9.0, wall: 3.4, rh: 2.6,
                body: M.render, roof: M.roof, chimney: true, solar: 2, terrace: [9, 5, -2] }));
  g.add(house({ x: 17.5, z: 21.5, rot: -0.38, w: 11.0, d: 9.0, wall: 3.6, rh: 2.8,
                body: M.concrete, roof: M.roofDark, solar: 1, annex: [5.5, 6.5, 2.8, -0.5] }));
  g.add(house({ x: -20.0, z: 1.0, rot: -0.14, w: 13.5, d: 9.5, wall: 3.2, rh: 2.5,
                body: M.render, roof: M.roof, chimney: true, terrace: [9, 5, 0] }));
  g.add(house({ x: 12.0, z: -24.0, rot: 0.45, w: 11.0, d: 8.5, wall: 3.5, rh: 2.7,
                body: M.concrete, roof: M.roof, solar: 2, terrace: [8, 4.5, 0] }));
  g.add(house({ x: -14.5, z: -30.0, rot: -0.24, w: 12.0, d: 9.0, wall: 3.3, rh: 2.5,
                body: M.render, roof: M.roofDark, chimney: true,
                annex: [4.5, 6.0, 2.7, 0.5], terrace: [8, 4.5, 1] }));

  /* --- bazén: zapuštěná hladina v betonovém lemu --- */
  function pool(x, z, w, d, rot) {
    const p = new THREE.Group();
    p.add(U.box(w, 0.6, d, M.water, 0, -0.5, 0));
    p.add(U.box(w + 1.2, 0.2, 0.6, M.render, 0, 0, d / 2 + 0.3));
    p.add(U.box(w + 1.2, 0.2, 0.6, M.render, 0, 0, -d / 2 - 0.3));
    p.add(U.box(0.6, 0.2, d, M.render, w / 2 + 0.3, 0, 0));
    p.add(U.box(0.6, 0.2, d, M.render, -w / 2 - 0.3, 0, 0));
    p.position.set(x, 0, z);
    p.rotation.y = rot;
    return p;
  }
  g.add(pool(-23.5, -10.0, 8.0, 4.5, -0.14));   // za domem 3
  g.add(pool(8.4, -31.4, 7.0, 4.0, 0.45));      // za domem 4

  /* --- živé ploty jako hranice pozemků --- */
  g.add(U.box(10.0, 1.1, 0.8, M.hedge, -19.0, 0, -15.5));
  g.add(U.box(0.8, 1.1, 8.0, M.hedge, 6.5, 0, 10.0));

  /* --- vzrostlá zeleň --- */
  g.add(U.tree(-27.0, 24.0, 1.20));
  g.add(U.tree(23.0, 33.0, 1.15));
  g.add(U.tree(26.0, 6.0, 1.30));
  g.add(U.tree(-9.0, -12.0, 1.05));
  g.add(U.tree(3.0, -37.0, 1.20));
  g.add(U.tree(24.0, -33.0, 1.05));
  g.add(U.tree(12.0, 8.0, 1.10));
  g.add(U.pine(-27.5, 17.0, 1.25));
  g.add(U.pine(10.0, 38.0, 1.10));
  g.add(U.pine(27.0, -3.0, 1.15));
  g.add(U.pine(-26.0, -18.0, 1.30));
  g.add(U.pine(-8.0, -39.0, 1.10));

  /* --- keře --- */
  g.add(U.bush(-9.0, 17.0, 1.10));
  g.add(U.bush(-24.5, 30.5, 0.95));
  g.add(U.bush(10.5, 26.0, 1.05));
  g.add(U.bush(20.0, 10.0, 0.90));
  g.add(U.bush(-15.0, -13.0, 1.15));
  g.add(U.bush(-8.0, -23.0, 1.00));
  g.add(U.bush(18.5, -30.0, 1.05));
  g.add(U.bush(4.8, 11.0, 0.85));
  g.add(U.bush(2.5, -19.0, 1.00));
  g.add(U.bush(26.5, 13.0, 1.10));

  return g;
}


/* --------------------------------------------------------------------------
   NOVAK — modelová ukázka: zděděný dům pana Nováka před vyklizením a po prodeji
   Stejná hmota, dvě fáze. Před: zašlá omítka, malá okna, kůlna, nepořádek,
   přerostlá zeleň. Po: světlá fasáda, velké prosklení, dřevěný akcent,
   terasa a upravená zahrada.
   -------------------------------------------------------------------------- */
function buildNovak(THREE, M, U) {
  const g = new THREE.Group();
  const DZ = -3.5;                               // dům v zadní části pozemku
  const HW = 12, HD = 9, GH = 3.0, UH = 2.6;     // půdorys a výšky podlaží
  const EY = GH + UH;                            // úroveň okapu
  const FZ = HD / 2;                             // rovina hlavní fasády

  /* ---------- společné ---------- */
  g.add(U.plot(40, 34, 2.2, M.grass, M.soil, 3.0));
  g.add(U.softShadow(54, 48, -2.35, 0.42));
  g.add(U.tree(-16.5, -12.0, 1.45));
  g.add(U.tree(16.0, -13.0, 1.3));

  /* ---------- PŘED REKONSTRUKCÍ ---------- */
  const old = new THREE.Group();
  old.userData.phase = 'old';
  g.add(old);
  const oh = new THREE.Group();
  oh.position.z = DZ;
  old.add(oh);

  oh.add(U.box(HW + 0.4, 0.4, HD + 0.4, M.renderOld2, 0, 0, 0));
  oh.add(U.box(HW, GH - 0.4, HD, M.renderOld, 0, 0.4, 0));
  oh.add(U.box(HW, UH, HD, M.renderOld, 0, GH, 0));
  const oroof = U.gableRoof(HD, HW, 3.2, M.roofOld, 0, EY, 0, 0.55);
  oroof.rotation.y = Math.PI / 2;
  oh.add(oroof);
  oh.add(U.box(0.9, 3.6, 0.9, M.brick, 3.2, EY, -1.4));
  oh.add(U.box(HW + 0.8, 0.14, 0.14, M.metal, 0, EY - 0.24, FZ + 0.5));

  [-4.0, -0.6, 3.0].forEach(function (x) {
    oh.add(U.box(1.3, 1.2, 0.12, M.glassOld, x, 1.2, FZ + 0.02));
    oh.add(U.windowFrame(1.4, 1.3, M.frame, x, 1.15, FZ + 0.09, 0.1));
    oh.add(U.box(1.2, 1.1, 0.12, M.glassOld, x, 3.7, FZ + 0.02));
    oh.add(U.windowFrame(1.3, 1.2, M.frame, x, 3.65, FZ + 0.09, 0.1));
  });
  oh.add(U.box(1.1, 2.1, 0.14, M.woodOld, 5.0, 0.4, FZ + 0.03));
  oh.add(U.windowFrame(1.2, 2.2, M.frame, 5.0, 0.35, FZ + 0.1, 0.1));

  // kůlna a věci na zahradě
  old.add(U.box(4.2, 2.3, 3.2, M.woodOld, -11.5, 0, -1.0));
  old.add(U.box(4.8, 0.2, 3.8, M.roofOld, -11.5, 2.3, -1.0));
  old.add(U.box(1.4, 1.0, 1.0, M.woodOld, -7.4, 0, 2.6));
  old.add(U.box(1.0, 0.8, 0.9, M.concreteMid, -6.0, 0, 3.6));
  old.add(U.box(1.2, 0.6, 1.2, M.woodOld, 8.6, 0, 3.0));
  old.add(U.box(0.9, 1.1, 0.9, M.concreteMid, 9.9, 0, 4.2));

  // přerostlá zeleň, popraskaný chodník, starý plot
  old.add(U.bush(-9.0, 6.0, 1.9, M.foliage));
  old.add(U.bush(-6.8, 7.6, 1.5, M.foliage));
  old.add(U.bush(9.2, 6.4, 1.8, M.foliage));
  old.add(U.bush(11.2, 8.0, 1.3, M.foliage));
  old.add(U.bush(0.5, 12.0, 1.4, M.foliage));
  old.add(U.slab(2.2, 12, M.concreteMid, 4.4, 0.06, 8.0));
  for (let i = 0; i < 5; i++) {
    old.add(U.box(0.14, 1.0, 0.14, M.woodOld, -14 + i * 7, 0, 15.6));
  }
  old.add(U.box(30, 0.1, 0.1, M.woodOld, 0, 0.85, 15.6));

  /* ---------- PO REKONSTRUKCI ---------- */
  const nw = new THREE.Group();
  nw.userData.phase = 'new';
  g.add(nw);
  const nh = new THREE.Group();
  nh.position.z = DZ;
  nw.add(nh);

  nh.add(U.box(HW + 0.4, 0.4, HD + 0.4, M.concreteMid, 0, 0, 0));
  nh.add(U.box(HW, GH - 0.4, HD, M.render, 0, 0.4, 0));
  nh.add(U.box(HW, UH, HD, M.render, 0, GH, 0));
  const nroof = U.gableRoof(HD, HW, 3.2, M.roof, 0, EY, 0, 0.75);
  nroof.rotation.y = Math.PI / 2;
  nh.add(nroof);
  nh.add(U.box(HW + 1.0, 0.16, 0.16, M.metal, 0, EY - 0.26, FZ + 0.68));

  // velké prosklení
  nh.add(U.box(6.4, 2.2, 0.16, M.glassWarm, -2.6, 0.5, FZ + 0.02));
  [-4.5, -2.6, -0.7].forEach(function (x) {
    nh.add(U.box(0.1, 2.2, 0.24, M.frame, x, 0.5, FZ + 0.06));
  });
  nh.add(U.windowFrame(6.5, 2.3, M.frame, -2.6, 0.45, FZ + 0.1, 0.1));

  // dřevěný obklad a vstup
  nh.add(U.box(4.2, GH - 0.4, 0.2, M.wood, 3.6, 0.4, FZ + 0.02));
  nh.add(U.slats(4.2, GH - 0.4, M.woodDark, 3.6, 0.4, FZ + 0.14, 9, 0.07));
  nh.add(U.box(1.2, 2.2, 0.14, M.glassWarm, 4.6, 0.4, FZ + 0.2));
  nh.add(U.windowFrame(1.3, 2.3, M.frame, 4.6, 0.35, FZ + 0.27, 0.09));
  nh.add(U.slab(3.0, 1.4, M.concreteMid, 4.2, GH - 0.2, FZ + 0.8, 0.16));

  // nová okna patra
  [-3.8, -0.4, 3.2].forEach(function (x) {
    nh.add(U.box(1.9, 1.5, 0.14, M.glassWarm, x, 3.5, FZ + 0.02));
    nh.add(U.windowFrame(2.0, 1.6, M.frame, x, 3.45, FZ + 0.09, 0.1));
  });

  // terasa, chodník, stání
  nw.add(U.slab(14, 4.6, M.deck, 0, 0.08, 3.6));
  nw.add(U.slab(2.4, 9, M.deck, 4.4, 0.06, 10.5));
  nw.add(U.slab(6.0, 5.0, M.deck, -12.0, 0.05, 4.0));

  // upravená zahrada
  nw.add(U.bush(-8.4, 6.2, 1.0));
  nw.add(U.bush(-6.6, 7.2, 0.8));
  nw.add(U.bush(8.6, 6.4, 1.05));
  nw.add(U.bush(10.4, 7.4, 0.8));
  nw.add(U.tree(-14.0, 8.5, 1.0));
  nw.add(U.tree(13.5, 9.0, 0.95));
  nw.add(U.box(30, 0.9, 0.5, M.hedge, 0, 0, 15.6));

  return g;
}

/* ==========================================================================
   Registr modelů
   ========================================================================== */
export const MODELS = {
  villa: {
    build: buildVilla,
    radius: 34,
    timeline: true,
    view: { az: -0.46, el: 0.24, dist: 46, target: [0, 4.0, 0], fov: 32 },
    spin: 0.045,
    sway: 0.13,
  },

  gable: { build: buildGable, radius: 23, view: { az: -0.5, el: 0.28, dist: 30.6, target: [0, 3.24, 0], fov: 32 }, spin: 0.05, sway: 0.15 },
  poolvilla: { build: buildPoolvilla, radius: 27, view: { az: -0.44, el: 0.30, dist: 32.3, target: [0, 1.44, -2.0], fov: 32 }, spin: 0.05, sway: 0.14 },
  bungalow: { build: buildBungalow, radius: 26, view: { az: -0.5, el: 0.30, dist: 39.1, target: [0, 1.98, 0], fov: 32 }, spin: 0.05, sway: 0.15 },
  townvilla: { build: buildTownvilla, radius: 22, view: { az: -0.52, el: 0.28, dist: 31.5, target: [0, 3.9, 0.4], fov: 30 }, spin: 0.05, sway: 0.15 },
  cube: { build: buildCube, radius: 24, view: { az: 0.46, el: 0.29, dist: 31.4, target: [0.3, 3.24, -1.0], fov: 32 }, spin: 0.04, sway: 0.12 },
  novak: {
    build: buildNovak,
    radius: 26,
    timeline: true,
    autoplay: false,      // příběh čeká na tlačítko přehrát
    loop: false,          // přehraje se jednou a zůstane na konci
    duration: 13,         // delší než hero — jde o vyprávění, ne o smyčku
    view: { az: -0.48, el: 0.26, dist: 38, target: [0, 3.2, 0], fov: 32 },
    spin: 0.03,
    sway: 0.10,
  },
  aerial: { build: buildAerial, radius: 52, view: { az: -0.05, el: 0.93, dist: 230, target: [0, 1.0, 0], fov: 28 }, spin: 0.02, sway: 0.05 },
};
