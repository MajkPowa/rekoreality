/* ==========================================================================
   Vývojový náhled modelů — ASCII render do konzole.
   Není součástí webu, žádná stránka ho nelinkuje. Slouží k ladění kompozice
   bez screenshotů:  const p = await import('/dev/preview.mjs'); p.preview('villa')
   ========================================================================== */
import * as THREE from 'three';
import { M, U, prepareTimeline, applyTimeline } from '../assets/js/houses3d.lib.js';

const RAMP = ' .:-=+*#%@';

function ctxCache() {
  if (window.__prev3d) return window.__prev3d;
  const canvas = document.createElement('canvas');
  canvas.width = 1200; canvas.height = 700;
  const r = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
  r.setPixelRatio(1); r.setClearAlpha(0);
  r.shadowMap.enabled = true; r.shadowMap.type = THREE.PCFSoftShadowMap;
  r.toneMapping = THREE.ACESFilmicToneMapping; r.toneMappingExposure = 0.98;
  r.outputColorSpace = THREE.SRGBColorSpace;

  const sky = new THREE.Mesh(new THREE.SphereGeometry(60, 24, 16), new THREE.ShaderMaterial({
    side: THREE.BackSide,
    uniforms: { top: { value: new THREE.Color(0x2f86cf) }, mid: { value: new THREE.Color(0xcbe6f4) }, bottom: { value: new THREE.Color(0x9c9382) } },
    vertexShader: 'varying vec3 vP; void main(){vP=position; gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}',
    fragmentShader: 'uniform vec3 top;uniform vec3 mid;uniform vec3 bottom;varying vec3 vP;void main(){float h=normalize(vP).y; vec3 c = h>0.?mix(mid,top,pow(h,.7)):mix(mid,bottom,pow(-h,.5)); gl_FragColor=vec4(c,1.);}',
  }));
  const es = new THREE.Scene(); es.add(sky);
  const pm = new THREE.PMREMGenerator(r); pm.compileEquirectangularShader();
  const env = pm.fromScene(es, 0.02).texture; pm.dispose();

  const blit = document.createElement('canvas');
  window.__prev3d = { r, env, blit, bctx: blit.getContext('2d', { willReadFrequently: true }) };
  return window.__prev3d;
}

function lights(scene, radius) {
  scene.add(new THREE.HemisphereLight(0xdcefff, 0x7d8a68, 0.62));
  const key = new THREE.DirectionalLight(0xfff2df, 2.7);
  key.position.set(radius * 0.85, radius * 1.15, radius * 0.7);
  key.castShadow = true;
  key.shadow.mapSize.set(1024, 1024);
  key.shadow.bias = -0.0016; key.shadow.normalBias = 0.03;
  const c = key.shadow.camera;
  c.near = 1; c.far = radius * 4;
  c.left = -radius * 1.25; c.right = radius * 1.25;
  c.top = radius * 1.25; c.bottom = -radius * 1.25;
  c.updateProjectionMatrix();
  scene.add(key);
  const fill = new THREE.DirectionalLight(0xbcd8f2, 0.36);
  fill.position.set(-radius, radius * 0.6, -radius * 0.8);
  scene.add(fill);
}

/**
 * @param {string} key       klíč v MODELS
 * @param {object} opt       { cols, rows, aspect, view:{...} } — view přepíše definici
 */
export async function preview(key, opt = {}) {
  const cols = opt.cols || 72;
  const rows = opt.rows || 24;
  const { MODELS } = await import('../assets/js/houses3d.models.js?v=' + (opt.bust || Date.now()));
  const def = MODELS[key];
  if (!def) return { error: 'model "' + key + '" neexistuje', available: Object.keys(MODELS) };

  const { r, env, blit, bctx } = ctxCache();
  const aspect = opt.aspect || 16 / 9;
  const W = Math.min(1200, Math.round(700 * aspect));
  const H = Math.round(W / aspect);
  r.setSize(W, H, false);

  const scene = new THREE.Scene();
  scene.environment = env;
  const radius = def.radius || 26;
  lights(scene, radius);

  let group, meshes = 0, bbox = null;
  try {
    group = def.build(THREE, M, U);
    scene.add(group);
    group.traverse((o) => { if (o.isMesh) meshes++; });
    const b = new THREE.Box3().setFromObject(group);
    bbox = { min: b.min.toArray().map((n) => +n.toFixed(1)), max: b.max.toArray().map((n) => +n.toFixed(1)) };
    if (def.timeline) applyTimeline(prepareTimeline(group), opt.progress == null ? 1 : opt.progress);
  } catch (e) {
    return { error: 'build selhal: ' + e.message, stack: (e.stack || '').slice(0, 300) };
  }

  const v = Object.assign({}, def.view, opt.view || {});
  const cam = new THREE.PerspectiveCamera(v.fov || 30, W / H, 0.5, radius * 8);
  const t = new THREE.Vector3(v.target[0], v.target[1], v.target[2]);
  cam.position.set(
    t.x + v.dist * Math.cos(v.el) * Math.sin(v.az),
    t.y + v.dist * Math.sin(v.el),
    t.z + v.dist * Math.cos(v.el) * Math.cos(v.az)
  );
  cam.lookAt(t);

  r.setScissorTest(false);
  r.setViewport(0, 0, W, H);
  r.clear();
  r.render(scene, cam);

  blit.width = W; blit.height = H;
  bctx.clearRect(0, 0, W, H);
  bctx.drawImage(r.domElement, 0, r.domElement.height - H, W, H, 0, 0, W, H);
  const d = bctx.getImageData(0, 0, W, H).data;

  const art = [];
  let opaque = 0, total = 0;
  let minX = 1e9, maxX = -1e9, minY = 1e9, maxY = -1e9;
  for (let ry = 0; ry < rows; ry++) {
    let line = '';
    for (let rx = 0; rx < cols; rx++) {
      const x = Math.floor((rx + 0.5) * W / cols);
      const y = Math.floor((ry + 0.5) * H / rows);
      const i = (y * W + x) * 4;
      total++;
      if (d[i + 3] < 12) { line += ' '; continue; }
      opaque++;
      minX = Math.min(minX, rx); maxX = Math.max(maxX, rx);
      minY = Math.min(minY, ry); maxY = Math.max(maxY, ry);
      const l = (d[i] * 0.299 + d[i + 1] * 0.587 + d[i + 2] * 0.114) / 255;
      line += RAMP[Math.min(9, Math.floor(l * 9.99))];
    }
    art.push(line);
  }

  scene.remove(group);
  return {
    model: key, meshes, bbox,
    coveragePct: +(100 * opaque / total).toFixed(1),
    fillBox: opaque ? { cols: [minX, maxX], rows: [minY, maxY] } : null,
    art,
  };
}
