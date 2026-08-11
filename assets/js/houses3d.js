/* ==========================================================================
   REKOREALITY — 3D modely domů
   --------------------------------------------------------------------------
   Jeden sdílený WebGL renderer vykresluje všechny scény a výsledek přenáší
   do 2D canvasu každého slotu (drawImage). Díky tomu vzniká jediný WebGL
   kontext místo sedmi, sloty se dají zaoblovat/ořezávat běžným CSS a
   renderuje se jen to, co je právě vidět.

   Slot v HTML:
     <div class="house3d" data-house="villa">
       <canvas class="house3d__canvas"></canvas>
       <img class="house3d__poster" src="…svg" alt="…">   ← fallback
     </div>

   Když WebGL nebo modul selže, zůstane viditelný poster. Nic se nerozbije.
   ========================================================================== */

import * as THREE from 'three';
import { M, U, prepareTimeline, applyTimeline, clamp01 } from './houses3d.lib.js';
import { MODELS } from './houses3d.models.js';

/* --------------------------------------------------------------------------
   0. Konstanty
   -------------------------------------------------------------------------- */
const MAX_W = 1600;              // max. rozlišení sdíleného framebufferu
const MAX_H = 1000;
const DPR_CAP = 1.75;
const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

/* Tempo simulace „před → po" (sekundy) */
const RUN_S = 7.5;      // přeměna starého domu na nový
const HOLD_S = 3.4;     // výdrž na hotovém stavu
const REWIND_S = 1.1;   // rychlé přetočení zpět

/* --------------------------------------------------------------------------
   3. Sdílený renderer + prostředí
   -------------------------------------------------------------------------- */
let gl = null;
let envMap = null;

function createRenderer() {
  const canvas = document.createElement('canvas');
  canvas.width = MAX_W;
  canvas.height = MAX_H;
  const r = new THREE.WebGLRenderer({
    canvas, antialias: true, alpha: true, powerPreference: 'high-performance',
  });
  r.setPixelRatio(1);
  r.setSize(MAX_W, MAX_H, false);
  r.setClearAlpha(0);
  r.shadowMap.enabled = true;
  r.shadowMap.type = THREE.PCFSoftShadowMap;
  r.toneMapping = THREE.ACESFilmicToneMapping;
  r.toneMappingExposure = 0.98;
  r.outputColorSpace = THREE.SRGBColorSpace;
  return r;
}

/** Procedurální obloha → PMREM. Dává sklu a kovu reálné odlesky. */
function buildEnvironment(renderer) {
  const sky = new THREE.Mesh(
    new THREE.SphereGeometry(60, 24, 16),
    new THREE.ShaderMaterial({
      side: THREE.BackSide,
      uniforms: {
        top:    { value: new THREE.Color(0x2f86cf) },
        mid:    { value: new THREE.Color(0xcbe6f4) },
        bottom: { value: new THREE.Color(0x9c9382) },
      },
      vertexShader: `
        varying vec3 vP;
        void main(){ vP = position; gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.0); }
      `,
      fragmentShader: `
        uniform vec3 top; uniform vec3 mid; uniform vec3 bottom;
        varying vec3 vP;
        void main(){
          float h = normalize(vP).y;
          vec3 c = h > 0.0 ? mix(mid, top, pow(h, 0.7)) : mix(mid, bottom, pow(-h, 0.5));
          gl_FragColor = vec4(c, 1.0);
        }
      `,
    })
  );
  const s = new THREE.Scene();
  s.add(sky);
  const pmrem = new THREE.PMREMGenerator(renderer);
  pmrem.compileEquirectangularShader();
  const tex = pmrem.fromScene(s, 0.02).texture;
  pmrem.dispose();
  sky.geometry.dispose();
  sky.material.dispose();
  return tex;
}

/** Světelná sestava — jemné denní světlo s měkkým stínem. */
function addLights(scene, radius) {
  const hemi = new THREE.HemisphereLight(0xdcefff, 0x7d8a68, 0.62);
  scene.add(hemi);

  const key = new THREE.DirectionalLight(0xfff2df, 2.7);
  key.position.set(radius * 0.85, radius * 1.15, radius * 0.7);
  key.castShadow = true;
  key.shadow.mapSize.set(1024, 1024);
  key.shadow.bias = -0.0016;
  key.shadow.normalBias = 0.03;
  const c = key.shadow.camera;
  c.near = 1;
  c.far = radius * 4;
  c.left = -radius * 1.25;
  c.right = radius * 1.25;
  c.top = radius * 1.25;
  c.bottom = -radius * 1.25;
  c.updateProjectionMatrix();
  scene.add(key);

  const fill = new THREE.DirectionalLight(0xbcd8f2, 0.36);
  fill.position.set(-radius, radius * 0.6, -radius * 0.8);
  scene.add(fill);
}

/* --------------------------------------------------------------------------
   4. Slot
   -------------------------------------------------------------------------- */
class Slot {
  constructor(el, def) {
    this.el = el;
    this.def = def;
    this.canvas = el.querySelector('.house3d__canvas');
    this.ctx = this.canvas.getContext('2d');
    this.visible = false;
    this.ready = false;
    this.t = Math.random() * 40;

    this.scene = new THREE.Scene();
    this.scene.environment = envMap;

    const radius = def.radius || 26;
    addLights(this.scene, radius);

    const model = def.build(THREE, M, U);
    this.scene.add(model);

    // časová osa simulace
    this.items = def.timeline ? prepareTimeline(model) : null;
    this.progress = 0;
    this.simT = 0;
    this.simState = 'run';        // run → hold → rewind → run …
    this.playing = true;
    if (this.items) {
      // Bez animací ukážeme rovnou hotový stav — simulace není nositelem informace,
      // kterou by uživatel jinak nedostal (čísla jsou i v textu stránky).
      if (reduceMotion) { this.playing = false; this.progress = 1; }
      applyTimeline(this.items, this.progress);
    }

    const v = def.view;
    this.camera = new THREE.PerspectiveCamera(v.fov || 30, 1.6, 0.5, radius * 8);
    this.target = new THREE.Vector3(v.target[0], v.target[1], v.target[2]);
    this.view = v;
    this.px = 0;
    this.py = 0;
  }

  /** Rozměry v pixelech, omezené kapacitou sdíleného framebufferu. */
  size() {
    const r = this.el.getBoundingClientRect();
    const dpr = Math.min(window.devicePixelRatio || 1, DPR_CAP);
    let w = Math.max(2, Math.round(r.width * dpr));
    let h = Math.max(2, Math.round(r.height * dpr));
    const k = Math.min(1, MAX_W / w, MAX_H / h);
    return { w: Math.floor(w * k), h: Math.floor(h * k), cssW: r.width, cssH: r.height };
  }

  /** Ruční přetažení časové osy — zastaví automatické přehrávání. */
  seek(p, fromUser) {
    if (!this.items) return;
    this.progress = clamp01(p);
    if (fromUser) { this.playing = false; this.simState = 'run'; this.simT = this.progress * RUN_S; }
    applyTimeline(this.items, this.progress);
    this.emit();
  }

  emit() {
    this.el.dispatchEvent(new CustomEvent('house3d:progress', {
      bubbles: true,
      detail: { progress: this.progress, playing: this.playing },
    }));
  }

  /** Automatický cyklus: rozjezd → výdrž na hotovém stavu → rychlé přetočení. */
  advanceSim(dt) {
    if (!this.items || !this.playing) return;
    this.simT += dt;
    if (this.simState === 'run') {
      this.progress = clamp01(this.simT / RUN_S);
      if (this.progress >= 1) { this.simState = 'hold'; this.simT = 0; }
    } else if (this.simState === 'hold') {
      this.progress = 1;
      if (this.simT >= HOLD_S) { this.simState = 'rewind'; this.simT = 0; }
    } else {
      this.progress = clamp01(1 - this.simT / REWIND_S);
      if (this.progress <= 0) { this.simState = 'run'; this.simT = 0; }
    }
    applyTimeline(this.items, this.progress);
    this.emit();
  }

  update(dt) {
    this.advanceSim(dt);
    const v = this.view;
    const spin = reduceMotion ? 0 : (this.def.spin ?? 0.05);
    this.t += dt;

    const az = v.az + Math.sin(this.t * spin) * (this.def.sway ?? 0.17) + this.px * 0.16;
    const el = THREE.MathUtils.clamp(v.el + this.py * 0.07, 0.06, 1.2);
    const d = v.dist;

    this.camera.position.set(
      this.target.x + d * Math.cos(el) * Math.sin(az),
      this.target.y + d * Math.sin(el),
      this.target.z + d * Math.cos(el) * Math.cos(az)
    );
    this.camera.lookAt(this.target);
  }

  render() {
    const { w, h, cssW, cssH } = this.size();
    if (w < 4 || h < 4) return;

    if (this.canvas.width !== w || this.canvas.height !== h) {
      this.canvas.width = w;
      this.canvas.height = h;
    }
    if (this.camera.aspect !== w / h) {
      this.camera.aspect = w / h;
      this.camera.updateProjectionMatrix();
    }

    gl.setScissorTest(true);
    gl.setViewport(0, 0, w, h);
    gl.setScissor(0, 0, w, h);
    gl.clear();
    gl.render(this.scene, this.camera);

    // WebGL má počátek vlevo dole → zdrojový výřez je u spodní hrany framebufferu.
    this.ctx.clearRect(0, 0, w, h);
    this.ctx.drawImage(gl.domElement, 0, MAX_H - h, w, h, 0, 0, w, h);

    if (!this.ready) {
      this.ready = true;
      this.el.classList.add('is-live');
    }
    void cssW; void cssH;
  }
}

/* --------------------------------------------------------------------------
   5. Boot
   -------------------------------------------------------------------------- */
function boot() {
  const nodes = Array.from(document.querySelectorAll('.house3d[data-house]'));
  if (!nodes.length) return;

  try {
    gl = createRenderer();
    envMap = buildEnvironment(gl);
  } catch (e) {
    console.warn('[houses3d] WebGL není dostupné, zůstávají zástupné obrázky.', e);
    return;
  }

  const slots = [];
  nodes.forEach((el) => {
    const def = MODELS[el.dataset.house];
    if (!def) {
      console.warn('[houses3d] Model "' + el.dataset.house + '" neexistuje — zůstává poster.');
      return;
    }
    if (!el.querySelector('.house3d__canvas')) return;
    try {
      slots.push(new Slot(el, def));
    } catch (e) {
      console.warn('[houses3d] Model "' + el.dataset.house + '" se nepodařilo sestavit.', e);
    }
  });
  if (!slots.length) return;

  /* Ovládání simulace pro UI (posuvník, tlačítko přehrávání). */
  const sim = slots.find((s) => s.items);
  if (sim) {
    window.RekoSim = {
      el: sim.el,
      seek: (p) => sim.seek(p, true),
      play: () => { sim.playing = true; sim.simState = 'run'; sim.simT = sim.progress * RUN_S; sim.emit(); },
      pause: () => { sim.playing = false; sim.emit(); },
      toggle: () => (sim.playing ? window.RekoSim.pause() : window.RekoSim.play()),
      get progress() { return sim.progress; },
      get playing() { return sim.playing; },
      _slot: sim,     // ladicí přístup (stav simulace, ruční krokování)
    };
    document.dispatchEvent(new CustomEvent('house3d:ready', { detail: window.RekoSim }));
  }

  const io = new IntersectionObserver(
    (entries) => entries.forEach((e) => {
      const s = slots.find((x) => x.el === e.target);
      if (s) s.visible = e.isIntersecting;
    }),
    { rootMargin: '240px 0px' }
  );
  slots.forEach((s) => io.observe(s.el));

  if (!reduceMotion) {
    window.addEventListener('pointermove', (e) => {
      const nx = (e.clientX / window.innerWidth) * 2 - 1;
      const ny = (e.clientY / window.innerHeight) * 2 - 1;
      slots.forEach((s) => { s.px = nx; s.py = -ny; });
    }, { passive: true });
  }

  let last = performance.now();
  let firstPass = true;

  function frame(now) {
    requestAnimationFrame(frame);
    if (document.hidden) { last = now; return; }
    const dt = Math.min((now - last) / 1000, 0.05);
    last = now;

    for (const s of slots) {
      if (!s.visible && !firstPass && s.ready) continue;
      if (!s.visible && !s.ready && !firstPass) continue;
      s.update(dt);
      s.render();
      if (reduceMotion && s.ready) s.visible = false; // statický snímek stačí
    }
    firstPass = false;
  }
  requestAnimationFrame(frame);

  window.addEventListener('resize', () => {
    slots.forEach((s) => { if (s.visible) s.render(); });
  }, { passive: true });
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', boot);
} else {
  boot();
}
