// Keep the original portfolio's Three.js version pinned.
import * as THREE from "https://cdn.jsdelivr.net/npm/three@0.185.1/build/three.module.js";

export function createExplodedGeometry(isCompact) {
  const indexed = new THREE.TorusKnotGeometry(1.05, .32, isCompact ? 96 : 160, isCompact ? 12 : 20, 2, 3);
  const geometry = indexed.toNonIndexed();
  indexed.dispose();
  const base = geometry.attributes.position.array;
  const dispersed = new Float32Array(base.length);
  // Every triangle moves as one fragment; it returns to the original surface at 0.
  for (let i = 0; i < base.length; i += 9) {
    const x = (base[i] + base[i + 3] + base[i + 6]) / 3;
    const y = (base[i + 1] + base[i + 4] + base[i + 7]) / 3;
    const z = (base[i + 2] + base[i + 5] + base[i + 8]) / 3;
    const length = Math.max(.001, Math.hypot(x, y, z));
    const seed = Math.sin((i + 1) * 12.9898) * 43758.5453;
    const distance = 1.15 + (seed - Math.floor(seed)) * 1.9;
    for (let vertex = 0; vertex < 3; vertex++) {
      const j = i + vertex * 3;
      dispersed[j] = base[j] + x / length * distance;
      dispersed[j + 1] = base[j + 1] + y / length * distance;
      dispersed[j + 2] = base[j + 2] + z / length * distance;
    }
  }
  geometry.morphAttributes.position = [new THREE.Float32BufferAttribute(dispersed, 3)];
  geometry.computeBoundingSphere();
  return geometry;
}

export function initScene() {
  const stage = document.querySelector("#hero-visual");
  const layout = document.querySelector("#hero-layout");
  const hero = document.querySelector("#top");
  const canvas = document.querySelector("#webgl");
  const button = document.querySelector(".motion-toggle");
  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
  const finePointer = window.matchMedia("(hover: hover) and (pointer: fine)");
  const compact = window.matchMedia("(max-width: 760px)");
  let renderer;
  let geometry;
  let material;
  let haloGeometry;
  let haloMaterial;
  let particleGeometry;
  let particleMaterial;
  try {
    renderer = new THREE.WebGLRenderer({ canvas, antialias: !compact.matches, alpha: true, powerPreference: "low-power" });
    renderer.setClearColor(0x080808, 0);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, compact.matches ? 1.5 : 2));
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.3;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(38, 1, .1, 60);
    camera.position.set(0, 0, 7.4);
    geometry = createExplodedGeometry(compact.matches);
    material = new THREE.MeshPhysicalMaterial({ color: 0xe8e8e8, metalness: .5, roughness: .25, clearcoat: 1, clearcoatRoughness: .18 });
    const sculpture = new THREE.Mesh(geometry, material);
    sculpture.rotation.set(.35, .3, -.15);
    sculpture.scale.setScalar(1.2);
    scene.add(sculpture);

    haloGeometry = new THREE.IcosahedronGeometry(2.18, 1);
    haloMaterial = new THREE.MeshBasicMaterial({ color: 0xffffff, wireframe: true, transparent: true, opacity: .075 });
    const halo = new THREE.Mesh(haloGeometry, haloMaterial);
    scene.add(halo);
    const starCount = compact.matches ? 140 : 340;
    const stars = new Float32Array(starCount * 3);
    for (let i = 0; i < stars.length; i += 3) {
      stars[i] = (Math.random() - .5) * 12;
      stars[i + 1] = (Math.random() - .5) * 12;
      stars[i + 2] = -1 - Math.random() * 7;
    }
    particleGeometry = new THREE.BufferGeometry();
    particleGeometry.setAttribute("position", new THREE.Float32BufferAttribute(stars, 3));
    particleMaterial = new THREE.PointsMaterial({ color: 0xd7d7d7, size: .019, transparent: true, opacity: .55, depthWrite: false });
    const particles = new THREE.Points(particleGeometry, particleMaterial);
    scene.add(particles);
    scene.add(new THREE.HemisphereLight(0xffffff, 0x343434, 2.1));
    const key = new THREE.DirectionalLight(0xffffff, 4.5);
    key.position.set(3, 4, 5);
    scene.add(key);
    const fill = new THREE.DirectionalLight(0xc6c6c6, 2.5);
    fill.position.set(-4, -1, 2);
    scene.add(fill);
    const rim = new THREE.DirectionalLight(0xffffff, 5.5);
    rim.position.set(-1, 2, -4);
    scene.add(rim);

    let paused = reducedMotion.matches;
    let visible = true;
    let contextLost = false;
    let cleaned = false;
    let time = 0;
    let previousTime = 0;
    let scrollTarget = 0;
    let explosion = 0;
    const pointer = { x: 0, y: 0 };
    const smoothPointer = { x: 0, y: 0 };

    stage.hidden = false;
    layout.classList.add("has-scene");
    button.hidden = false;

    const render = () => {
      if (!contextLost && !cleaned) renderer.render(scene, camera);
    };
    const measure = () => {
      if (cleaned || stage.hidden) return;
      const { width, height } = stage.getBoundingClientRect();
      if (!width || !height) return;
      camera.aspect = width / height;
      // Keep the resting sculpture within the narrower dimension of the canvas.
      camera.position.z = 7.4 / Math.min(camera.aspect, 1);
      camera.updateProjectionMatrix();
      renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, compact.matches ? 1.5 : 2));
      renderer.setSize(width, height, false);
      render();
    };
    const updateScroll = () => {
      const rect = hero.getBoundingClientRect();
      const stageRect = stage.getBoundingClientRect();
      const travel = compact.matches ? stage.clientHeight * .85 : rect.height * .65;
      const distance = compact.matches ? window.innerHeight * .35 - stageRect.top : -rect.top;
      scrollTarget = Math.min(1, Math.max(0, distance / Math.max(travel, 1)));
    };
    const animate = (timestamp) => {
      const delta = previousTime ? Math.min((timestamp - previousTime) / 1000, .05) : 0;
      previousTime = timestamp;
      time += delta;
      const blend = 1 - Math.exp(-delta * 4.5);
      smoothPointer.x += (pointer.x - smoothPointer.x) * blend;
      smoothPointer.y += (pointer.y - smoothPointer.y) * blend;
      const target = reducedMotion.matches ? 0 : scrollTarget;
      explosion += (target - explosion) * blend;
      sculpture.morphTargetInfluences[0] = explosion;
      sculpture.rotation.set(.35 + time * .095 + smoothPointer.y * .22, .3 + time * .14 + smoothPointer.x * .3, -.15 + time * .025);
      // Pull the fragments back slightly so the dispersing shape remains readable.
      sculpture.scale.setScalar(1.2 * (1 - explosion * .3));
      particles.rotation.y = time * .008;
      halo.rotation.set(time * -.03, time * .035, 0);
      haloMaterial.opacity = .075 * (1 - explosion * .7);
      render();
    };
    const syncLoop = () => {
      previousTime = 0;
      renderer.setAnimationLoop(!paused && visible && !document.hidden && !contextLost && !cleaned ? animate : null);
    };
    const syncButton = () => {
      button.textContent = paused ? "Play animation" : "Pause animation";
      button.setAttribute("aria-label", button.textContent);
    };
    const toggleMotion = () => {
      paused = !paused;
      syncButton();
      syncLoop();
    };
    const changePreference = () => {
      paused = reducedMotion.matches;
      if (paused) {
        explosion = 0;
        sculpture.morphTargetInfluences[0] = 0;
        sculpture.scale.setScalar(1.2);
        haloMaterial.opacity = .075;
        render();
      }
      syncButton();
      syncLoop();
    };
    const movePointer = (event) => {
      if (!finePointer.matches || paused) return;
      const rect = stage.getBoundingClientRect();
      pointer.x = (event.clientX - rect.left) / rect.width * 2 - 1;
      pointer.y = (event.clientY - rect.top) / rect.height * 2 - 1;
    };
    const resetPointer = () => { pointer.x = 0; pointer.y = 0; };
    const loseContext = (event) => {
      event.preventDefault();
      contextLost = true;
      syncLoop();
      stage.hidden = true;
      layout.classList.remove("has-scene");
    };
    const restoreContext = () => {
      contextLost = false;
      stage.hidden = false;
      layout.classList.add("has-scene");
      measure();
      syncLoop();
    };
    const visibilityObserver = "IntersectionObserver" in window ? new IntersectionObserver((entries) => {
      visible = entries[0].isIntersecting;
      syncLoop();
    }, { rootMargin: "100px" }) : null;
    const resizeObserver = "ResizeObserver" in window ? new ResizeObserver(measure) : null;
    if (visibilityObserver) visibilityObserver.observe(stage);
    if (resizeObserver) resizeObserver.observe(stage);
    else window.addEventListener("resize", measure);
    button.addEventListener("click", toggleMotion);
    stage.addEventListener("pointermove", movePointer, { passive: true });
    stage.addEventListener("pointerleave", resetPointer);
    window.addEventListener("scroll", updateScroll, { passive: true });
    window.addEventListener("resize", updateScroll, { passive: true });
    document.addEventListener("visibilitychange", syncLoop);
    reducedMotion.addEventListener("change", changePreference);
    canvas.addEventListener("webglcontextlost", loseContext);
    canvas.addEventListener("webglcontextrestored", restoreContext);
    window.addEventListener("pagehide", (event) => {
      renderer.setAnimationLoop(null);
      if (event.persisted) return;
      cleaned = true;
      visibilityObserver?.disconnect();
      resizeObserver?.disconnect();
      geometry.dispose();
      material.dispose();
      haloGeometry.dispose();
      haloMaterial.dispose();
      particleGeometry.dispose();
      particleMaterial.dispose();
      renderer.dispose();
    });
    window.addEventListener("pageshow", () => {
      if (!cleaned) { measure(); updateScroll(); syncLoop(); }
    });
    syncButton();
    measure();
    updateScroll();
    syncLoop();
  } catch (error) {
    renderer?.setAnimationLoop(null);
    geometry?.dispose();
    material?.dispose();
    haloGeometry?.dispose();
    haloMaterial?.dispose();
    particleGeometry?.dispose();
    particleMaterial?.dispose();
    renderer?.dispose();
    stage.hidden = true;
    layout.classList.remove("has-scene");
    throw error;
  }
}
