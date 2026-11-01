// The 3D viewer shared by every module: scene, camera, lights, orbit controls (mouse and touch),
// labels that always face the camera, "Reset view", and clicking on objects.
import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import { CSS2DRenderer, CSS2DObject } from "three/addons/renderers/CSS2DRenderer.js";

export { THREE };

export function createViewer(container, { grid = true } = {}) {
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(35, 1, 0.1, 5000);

  const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
  container.appendChild(renderer.domElement);

  const labelRenderer = new CSS2DRenderer();
  labelRenderer.domElement.className = "labels";
  container.appendChild(labelRenderer.domElement);

  const controls = new OrbitControls(camera, renderer.domElement);
  controls.enableDamping = true;
  controls.dampingFactor = 0.12;
  controls.maxPolarAngle = Math.PI * 0.95;

  scene.add(new THREE.HemisphereLight(0xffffff, 0x8a96a8, 1.9));
  const sun = new THREE.DirectionalLight(0xffffff, 1.5);
  sun.position.set(6, 12, 9);
  scene.add(sun);
  const fill = new THREE.DirectionalLight(0xffffff, 0.5);
  fill.position.set(-8, 4, -6);
  scene.add(fill);

  let gridHelper = null;
  if (grid) {
    gridHelper = new THREE.GridHelper(200, 200, 0x9aa3ad, 0xd5d9de);
    gridHelper.material.transparent = true;
    gridHelper.material.opacity = 0.45;
    gridHelper.position.y = -0.02;
    scene.add(gridHelper);
  }

  // Everything a module draws goes in here
  const root = new THREE.Group();
  scene.add(root);

  // ---------- Size ----------
  function resize() {
    const w = container.clientWidth, h = container.clientHeight;
    if (!w || !h) return;
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
    renderer.setSize(w, h);
    labelRenderer.setSize(w, h);
  }
  new ResizeObserver(resize).observe(container);
  resize();

  // ---------- Camera framing and Reset view ----------
  const home = { pos: new THREE.Vector3(10, 8, 14), target: new THREE.Vector3() };
  let tween = null;

  // Point the camera so the sphere (center, radius) fills the view, looking from direction dir
  function frame(center, radius, dir = new THREE.Vector3(0.9, 0.75, 1.3), { animate = true } = {}) {
    const fov = THREE.MathUtils.degToRad(camera.fov);
    const fit = Math.min(fov, 2 * Math.atan(Math.tan(fov / 2) * camera.aspect));
    const dist = (radius / Math.sin(fit / 2)) * 1.08;
    home.target.copy(center);
    home.pos.copy(center).add(dir.clone().normalize().multiplyScalar(dist));
    if (animate) goHome(); else { camera.position.copy(home.pos); controls.target.copy(home.target); controls.update(); }
    if (gridHelper) gridHelper.scale.setScalar(Math.max(1, radius / 25));
  }
  function frameObject(obj, dir, opts) {
    const box = new THREE.Box3().setFromObject(obj);
    if (box.isEmpty()) return;
    const s = box.getBoundingSphere(new THREE.Sphere());
    frame(s.center, s.radius, dir, opts);
  }
  function goHome() {
    tween = { t: 0, fromPos: camera.position.clone(), fromTarget: controls.target.clone() };
  }

  // ---------- Labels ----------
  function label(text, className = "lbl") {
    const div = document.createElement("div");
    div.className = className;
    div.textContent = text;
    const obj = new CSS2DObject(div);
    obj.center.set(0.5, 0.5);
    return obj;
  }

  // ---------- Clicking on objects (a click, not the end of a drag) ----------
  const ray = new THREE.Raycaster(), pointer = new THREE.Vector2();
  let down = null;
  const clickHandlers = [];
  renderer.domElement.addEventListener("pointerdown", (e) => { down = [e.clientX, e.clientY]; });
  renderer.domElement.addEventListener("pointerup", (e) => {
    if (!down || Math.hypot(e.clientX - down[0], e.clientY - down[1]) > 6) return;
    const r = renderer.domElement.getBoundingClientRect();
    pointer.set(((e.clientX - r.left) / r.width) * 2 - 1, -((e.clientY - r.top) / r.height) * 2 + 1);
    ray.setFromCamera(pointer, camera);
    const hits = ray.intersectObjects(root.children, true).filter((h) => h.object.visible && h.object.isMesh);
    clickHandlers.forEach((fn) => fn(hits[0] || null));
  });

  // ---------- Loop ----------
  const tickers = [];
  const clock = new THREE.Clock();
  function loop() {
    const dt = Math.min(clock.getDelta(), 0.05);
    if (tween) {
      tween.t = Math.min(1, tween.t + dt / 0.45);
      const k = 1 - Math.pow(1 - tween.t, 3);
      camera.position.lerpVectors(tween.fromPos, home.pos, k);
      controls.target.lerpVectors(tween.fromTarget, home.target, k);
      if (tween.t >= 1) tween = null;
    }
    tickers.forEach((fn) => fn(dt));
    controls.update();
    renderer.render(scene, camera);
    labelRenderer.render(scene, camera);
    requestAnimationFrame(loop);
  }
  requestAnimationFrame(loop);

  return {
    THREE, scene, camera, renderer, controls, root,
    frame, frameObject, label,
    resetView: goHome,
    onTick: (fn) => tickers.push(fn),
    onClick: (fn) => clickHandlers.push(fn),
    clear() {
      // remove a module's objects, including their labels (CSS2D elements stay in the DOM otherwise)
      root.traverse((o) => {
        if (o.isCSS2DObject && o.element.parentNode) o.element.parentNode.removeChild(o.element);
        if (o.geometry) o.geometry.dispose();
        if (o.material) [].concat(o.material).forEach((m) => m.dispose());
      });
      root.clear();
    },
  };
}
