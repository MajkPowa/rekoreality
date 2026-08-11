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
};
