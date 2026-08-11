/* ==========================================================================
   REKOREALITY — 3D knihovna: materiály a stavební pomocníci
   Oddělený modul, aby se dal importovat i bez spuštění enginu (testy, náhledy).
   ========================================================================== */

import * as THREE from 'three';

/* --------------------------------------------------------------------------
   1. Materiálová knihovna — sdílená všemi modely
   -------------------------------------------------------------------------- */
const std = (o) => new THREE.MeshStandardMaterial(o);
const phys = (o) => new THREE.MeshPhysicalMaterial(o);

export const M = {
  /* konstrukce */
  concrete:     std({ color: 0xe6e2da, roughness: 0.93 }),
  concreteMid:  std({ color: 0xcdc7bb, roughness: 0.94 }),
  concreteDark: std({ color: 0xa9a294, roughness: 0.95 }),
  render:       std({ color: 0xf3efe6, roughness: 0.96 }),
  brick:        std({ color: 0xab6d4c, roughness: 0.92 }),
  roof:         std({ color: 0x3a3e45, roughness: 0.86 }),
  roofDark:     std({ color: 0x2a2e35, roughness: 0.82 }),

  /* původní (nezrekonstruovaný) stav — matné, zašlé povrchy */
  renderOld:    std({ color: 0xcfc7b2, roughness: 1 }),
  renderOld2:   std({ color: 0xbdb49e, roughness: 1 }),
  roofOld:      std({ color: 0x7a6154, roughness: 0.98 }),
  woodOld:      std({ color: 0x6f5a41, roughness: 0.98 }),
  glassOld:     std({ color: 0x54626b, roughness: 0.42, metalness: 0.1 }),

  /* výplně */
  glass:        phys({ color: 0x1c2a33, roughness: 0.05, metalness: 0.08, transparent: true,
                       opacity: 0.78, clearcoat: 1, clearcoatRoughness: 0.06 }),
  glassWarm:    phys({ color: 0x2b3b45, roughness: 0.07, metalness: 0.08, transparent: true,
                       opacity: 0.84, clearcoat: 1, clearcoatRoughness: 0.06,
                       emissive: 0xffb265, emissiveIntensity: 0.42 }),
  frame:        std({ color: 0xeee9e1, roughness: 0.45, metalness: 0.2 }),
  metal:        std({ color: 0x9ba1a7, roughness: 0.32, metalness: 0.85 }),

  /* dřevo */
  wood:         std({ color: 0xb07a3e, roughness: 0.76 }),
  woodDark:     std({ color: 0x835326, roughness: 0.8 }),
  deck:         std({ color: 0xdfdacd, roughness: 0.9 }),

  /* okolí */
  grass:        std({ color: 0x7ba05f, roughness: 1 }),
  grassDark:    std({ color: 0x5f8049, roughness: 1 }),
  soil:         std({ color: 0xcac3b5, roughness: 0.98 }),
  hedge:        std({ color: 0x4c7343, roughness: 1 }),
  foliage:      std({ color: 0x3f6146, roughness: 1 }),
  foliageLite:  std({ color: 0x5c8351, roughness: 1 }),
  trunk:        std({ color: 0x6b533a, roughness: 0.95 }),
  water:        phys({ color: 0x5fb4d4, roughness: 0.04, metalness: 0.2, transparent: true,
                       opacity: 0.88, clearcoat: 1 }),
  asphalt:      std({ color: 0xa5a099, roughness: 1 }),
  solar:        std({ color: 0x1f3049, roughness: 0.22, metalness: 0.6 }),
  shadowOnly:   new THREE.ShadowMaterial({ opacity: 0.24 }),
};

/* --------------------------------------------------------------------------
   2. Pomocné funkce pro stavbu modelů
   -------------------------------------------------------------------------- */
/** Radiální „kaňka" pro měkký stín — generovaná jednou, sdílená. */
let _blob = null;
function blobTexture() {
  if (_blob) return _blob;
  const c = document.createElement('canvas');
  c.width = c.height = 128;
  const x = c.getContext('2d');
  const gr = x.createRadialGradient(64, 64, 4, 64, 64, 63);
  gr.addColorStop(0.00, 'rgba(255,255,255,1)');
  gr.addColorStop(0.42, 'rgba(255,255,255,0.72)');
  gr.addColorStop(0.75, 'rgba(255,255,255,0.22)');
  gr.addColorStop(1.00, 'rgba(255,255,255,0)');
  x.fillStyle = gr;
  x.fillRect(0, 0, 128, 128);
  _blob = new THREE.CanvasTexture(c);
  _blob.colorSpace = THREE.SRGBColorSpace;
  return _blob;
}

export const U = {
  /** Kvádr, který STOJÍ na úrovni y (nikoli vystředěný na y). */
  box(w, h, d, mat, x = 0, y = 0, z = 0) {
    const m = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), mat);
    m.position.set(x, y + h / 2, z);
    m.castShadow = true;
    m.receiveShadow = true;
    return m;
  },

  /** Vodorovná deska (terasa, chodník, hladina) — leží v rovině XZ. */
  slab(w, d, mat, x = 0, y = 0, z = 0, thickness = 0.12) {
    const m = U.box(w, thickness, d, mat, x, y - thickness, z);
    m.castShadow = false;
    return m;
  },

  /** Svislá tabule skla v rovině XY (otoč rotací kolem Y pro boční fasádu). */
  pane(w, h, mat, x = 0, y = 0, z = 0) {
    const m = new THREE.Mesh(new THREE.PlaneGeometry(w, h), mat);
    m.position.set(x, y + h / 2, z);
    return m;
  },

  /** Řada svislých dřevěných lamel podél osy X. */
  slats(w, h, mat, x = 0, y = 0, z = 0, count = 12, depth = 0.12) {
    const g = new THREE.Group();
    const step = w / count;
    for (let i = 0; i < count; i++) {
      const s = U.box(step * 0.62, h, depth, mat, -w / 2 + step * (i + 0.5), y, 0);
      g.add(s);
    }
    g.position.set(x, 0, z);
    return g;
  },

  /** Vodorovné stínicí lamely (fasádní clona). */
  louvers(w, h, mat, x = 0, y = 0, z = 0, count = 7, depth = 0.16) {
    const g = new THREE.Group();
    const step = h / count;
    for (let i = 0; i < count; i++) {
      g.add(U.box(w, step * 0.55, depth, mat, 0, y + step * i, 0));
    }
    g.position.set(x, 0, z);
    return g;
  },

  /** Rám okna — čtyři tenké profily kolem tabule. */
  windowFrame(w, h, mat, x = 0, y = 0, z = 0, t = 0.1) {
    const g = new THREE.Group();
    g.add(U.box(w, t, t * 1.4, mat, 0, y + h - t, 0));
    g.add(U.box(w, t, t * 1.4, mat, 0, y, 0));
    g.add(U.box(t, h, t * 1.4, mat, -w / 2 + t / 2, y, 0));
    g.add(U.box(t, h, t * 1.4, mat, w / 2 - t / 2, y, 0));
    g.position.set(x, 0, z);
    return g;
  },

  /** Listnatý strom (koule na kmeni). */
  tree(x, z, scale = 1, mat = M.foliage) {
    const g = new THREE.Group();
    const tr = U.box(0.34 * scale, 2.4 * scale, 0.34 * scale, M.trunk, 0, 0, 0);
    g.add(tr);
    const crown = new THREE.Mesh(new THREE.IcosahedronGeometry(1.55 * scale, 1), mat);
    crown.position.y = 3.7 * scale;
    crown.castShadow = true;
    crown.receiveShadow = true;
    g.add(crown);
    const c2 = new THREE.Mesh(new THREE.IcosahedronGeometry(1.05 * scale, 1), M.foliageLite);
    c2.position.set(0.7 * scale, 2.9 * scale, 0.4 * scale);
    c2.castShadow = true;
    g.add(c2);
    g.position.set(x, 0, z);
    return g;
  },

  /** Jehličnan (kužel). */
  pine(x, z, scale = 1) {
    const g = new THREE.Group();
    g.add(U.box(0.3 * scale, 1.2 * scale, 0.3 * scale, M.trunk, 0, 0, 0));
    for (let i = 0; i < 3; i++) {
      const c = new THREE.Mesh(
        new THREE.ConeGeometry((1.5 - i * 0.34) * scale, (2.2 - i * 0.2) * scale, 9),
        i % 2 ? M.foliageLite : M.foliage
      );
      c.position.y = (1.6 + i * 1.35) * scale;
      c.castShadow = true;
      g.add(c);
    }
    g.position.set(x, 0, z);
    return g;
  },

  /** Nízký keř. */
  bush(x, z, r = 0.9, mat = M.foliageLite) {
    const m = new THREE.Mesh(new THREE.IcosahedronGeometry(r, 1), mat);
    m.position.set(x, r * 0.72, z);
    m.scale.y = 0.72;
    m.castShadow = true;
    m.receiveShadow = true;
    return m;
  },

  /**
   * Pozemek — zaoblená deska, na které dům stojí.
   * Horní plocha leží v y = 0, deska sahá dolů o výšku h.
   * Základ „plovoucího dioramatu": scéna nemá nekonečný terén,
   * takže se nepřepaluje a prosvítá pozadí karty.
   */
  plot(w, d, h = 1.6, topMat = M.grass, sideMat = M.concreteMid, r = 2.4) {
    const hw = w / 2, hd = d / 2;
    r = Math.min(r, hw * 0.5, hd * 0.5);
    const s = new THREE.Shape();
    s.moveTo(-hw + r, -hd);
    s.lineTo(hw - r, -hd); s.quadraticCurveTo(hw, -hd, hw, -hd + r);
    s.lineTo(hw, hd - r);  s.quadraticCurveTo(hw, hd, hw - r, hd);
    s.lineTo(-hw + r, hd); s.quadraticCurveTo(-hw, hd, -hw, hd - r);
    s.lineTo(-hw, -hd + r); s.quadraticCurveTo(-hw, -hd, -hw + r, -hd);

    const geo = new THREE.ExtrudeGeometry(s, { depth: h, bevelEnabled: false, curveSegments: 8 });
    geo.rotateX(-Math.PI / 2);
    geo.translate(0, -h, 0);          // horní plocha do y = 0
    geo.computeVertexNormals();

    const m = new THREE.Mesh(geo, [topMat, sideMat]);
    m.castShadow = true;
    m.receiveShadow = true;
    return m;
  },

  /** Měkký kontaktní stín pod plovoucím pozemkem. */
  softShadow(w, d, y = -0.02, opacity = 0.34) {
    const m = new THREE.Mesh(
      new THREE.PlaneGeometry(w, d),
      new THREE.MeshBasicMaterial({
        map: blobTexture(), transparent: true, opacity,
        depthWrite: false, color: 0x2a3326,
      })
    );
    m.rotation.x = -Math.PI / 2;
    m.position.y = y;
    m.renderOrder = -1;
    return m;
  },

  /** Terén — velká deska, která přijímá stíny. */
  ground(size, mat = M.grass, y = 0) {
    const m = new THREE.Mesh(new THREE.PlaneGeometry(size, size), mat);
    m.rotation.x = -Math.PI / 2;
    m.position.y = y;
    m.receiveShadow = true;
    return m;
  },

  /** Neviditelná rovina jen pro zachycení stínu (průhledné pozadí). */
  shadowCatcher(size, y = 0) {
    const m = new THREE.Mesh(new THREE.PlaneGeometry(size, size), M.shadowOnly);
    m.rotation.x = -Math.PI / 2;
    m.position.y = y;
    m.receiveShadow = true;
    return m;
  },

  /**
   * Sedlová střecha nad půdorysem w × d.
   * POZOR na orientaci: hřeben běží podél osy Z, takže sklony míří k ±X
   * a ŠTÍTY (trojúhelníkové čelo) směřují k ±Z — tedy k divákovi.
   * Chceš-li k divákovi okapovou stranu, otoč střechu o rotation.y = Math.PI/2
   * a prohoď w s d.
   * Parametr y je úroveň OKAPU (spodní hrany), ne hřebene.
   */
  gableRoof(w, d, h, mat, x = 0, y = 0, z = 0, overhang = 0.5) {
    const W = w + overhang * 2, D = d + overhang * 2;
    const g = new THREE.BufferGeometry();
    const v = new Float32Array([
      // levá plocha
      -W / 2, 0, -D / 2, -W / 2, 0, D / 2, 0, h, D / 2,
      -W / 2, 0, -D / 2, 0, h, D / 2, 0, h, -D / 2,
      // pravá plocha
      W / 2, 0, D / 2, W / 2, 0, -D / 2, 0, h, -D / 2,
      W / 2, 0, D / 2, 0, h, -D / 2, 0, h, D / 2,
      // štíty
      -W / 2, 0, -D / 2, 0, h, -D / 2, W / 2, 0, -D / 2,
      W / 2, 0, D / 2, 0, h, D / 2, -W / 2, 0, D / 2,
    ]);
    g.setAttribute('position', new THREE.BufferAttribute(v, 3));
    g.computeVertexNormals();
    const m = new THREE.Mesh(g, mat);
    m.position.set(x, y, z);
    m.castShadow = true;
    m.receiveShadow = true;
    return m;
  },
};

/* --------------------------------------------------------------------------
   3b. Časová osa „před → po"
   Meshe označené (přes předka) userData.phase = 'old' | 'new' se prolínají
   podle postupu p ∈ ⟨0,1⟩. Vlna postupuje zleva doprava: každý prvek má
   podle své pozice na ose X vlastní okamžik přeměny.
   -------------------------------------------------------------------------- */
export const BAND = 0.26;                                     // šířka přechodové vlny
export const smooth = (t) => t * t * (3 - 2 * t);
export const clamp01 = (t) => (t < 0 ? 0 : t > 1 ? 1 : t);

function phaseOf(obj) {
  let o = obj;
  while (o) {
    if (o.userData && o.userData.phase) return o.userData.phase;
    o = o.parent;
  }
  return null;
}

export function prepareTimeline(root) {
  root.updateMatrixWorld(true);
  const bb = new THREE.Box3().setFromObject(root);
  const minX = bb.min.x;
  const spanX = Math.max(1, bb.max.x - minX);
  const items = [];
  const wp = new THREE.Vector3();

  root.traverse((o) => {
    if (!o.isMesh) return;
    const ph = phaseOf(o);
    if (!ph) return;

    o.getWorldPosition(wp);
    o.material = Array.isArray(o.material)
      ? o.material.map((m) => m.clone())
      : o.material.clone();
    const mats = Array.isArray(o.material) ? o.material : [o.material];
    mats.forEach((m) => { m.transparent = true; });

    items.push({
      mesh: o, mats, phase: ph,
      u: clamp01((wp.x - minX) / spanX),
      s0: o.scale.clone(),
      y0: o.position.y,
    });
  });
  return items;
}

export function applyTimeline(items, p) {
  for (const it of items) {
    // okamžik přeměny podle pozice na ose X
    const e = smooth(clamp01((p - it.u) / BAND + 0.5));
    const a = it.phase === 'new' ? e : 1 - e;

    if (a <= 0.015) { it.mesh.visible = false; continue; }
    it.mesh.visible = true;

    const s = 0.55 + 0.45 * a;
    it.mesh.scale.set(it.s0.x * s, it.s0.y * s, it.s0.z * s);
    it.mesh.position.y = it.y0 + (1 - a) * (it.phase === 'new' ? 1.4 : -0.9);
    for (const m of it.mats) m.opacity = a;
  }
}

