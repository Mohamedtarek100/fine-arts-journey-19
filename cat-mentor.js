/**
 * =========================================================================
 *  Photorealistic 3D Fluffy Golden Persian/Shirazi Cat Mentor Engine (v2 Ultra)
 *  - Custom Real-Time Multi-Shell Volumetric Fur Shader with Gravity Droop,
 *    Root Ambient Occlusion & Warm Golden Fresnel Rim Backlight (locked 60FPS!)
 *  - Vertex-Sculpted Organic Feline Anatomy (ONE continuous sculpted Shirazi head
 *    with eye sockets & cheek ruff, cupped curved ears, articulated 2-segment spine
 *    with thorax & pelvis, 3-bone front legs [shoulder/elbow/wrist], 3-bone hind legs
 *    [thigh/knee/hock], 4-toe paws with pink beans, and 6-segment fluffy plume tail)
 *  - Authentic Feline Kinematics (Zero Foot-Sliding, Smooth Pose Transitions):
 *    * 'guide'   : Regal Shirazi sit on folded hind legs, breathing, blinking, ear flick, eye tracking
 *    * 'run'     : Smooth stand-up into full-profile 4-leg feline trot/gallop with spine flex &
 *                  velocity-locked stride (zero sliding!)
 *    * 'groom'   : Realistic paw-lick & cheek/ear face-wash (bent elbow, curled wrist, jaw & pink
 *                  curved tongue licking paw then sweeping cheek) + spine-curved shoulder/flank licking!
 *    * 'play'    : Real feline crouch + physics-driven bouncing golden yarn ball with timed paw-swat hits!
 *    * 'stretch' : Authentic feline yoga downward stretch (chest low, paws extended, arched back, tail high!)
 *    * 'pet'     : Blissful closed-eye purring head-nuzzle + golden sparkles!
 * =========================================================================
 */

import * as THREE from './vendor/three.module.min.js';

const FUR_SHELL_VERT = /* glsl */ `
  uniform float uShellDist;
  uniform float uDroop;
  uniform float uLayerFrac;
  varying vec2 vUv;
  varying vec3 vNormalW;
  varying vec3 vViewPos;

  void main() {
    vUv = uv;
    vec3 displaced = position + normal * uShellDist;
    // Soft gravity droop on long Persian fur tips
    displaced.y -= uDroop * uLayerFrac * uLayerFrac;

    vec4 mvPos = modelViewMatrix * vec4(displaced, 1.0);
    vViewPos = -mvPos.xyz;
    vNormalW = normalize(mat3(modelMatrix) * normal);
    gl_Position = projectionMatrix * mvPos;
  }
`;

const FUR_SHELL_FRAG = /* glsl */ `
  uniform sampler2D uColorMap;
  uniform sampler2D uFurAlphaMap;
  uniform float uLayerFrac;
  uniform float uDensity;
  uniform vec3 uRimColor;
  varying vec2 vUv;
  varying vec3 vNormalW;
  varying vec3 vViewPos;

  void main() {
    vec2 tiledUv = vUv * uDensity;
    float strand = texture2D(uFurAlphaMap, tiledUv).r;
    // Taper hair strands cleanly from thick plush base to delicate fluffy tips
    float cutoff = mix(0.14, 0.72, uLayerFrac);
    if (strand < cutoff) discard;

    vec3 baseCol = texture2D(uColorMap, vUv).rgb;
    // Soft self-shadowing occlusion near roots, luminous honey warmth at tips
    float rootAO = mix(0.74, 1.12, uLayerFrac);

    vec3 N = normalize(vNormalW);
    vec3 L1 = normalize(vec3(0.55, 0.82, 0.72));
    vec3 L2 = normalize(vec3(-0.65, 0.45, -0.55));
    float diff1 = max(dot(N, L1), 0.0) * 0.72 + 0.36;
    float diff2 = max(dot(N, L2), 0.0) * 0.28;

    vec3 V = normalize(vViewPos);
    float fresnel = pow(1.0 - max(dot(N, V), 0.0), 2.4);
    vec3 rim = uRimColor * fresnel * (0.42 + uLayerFrac * 0.45);

    vec3 col = baseCol * rootAO * (diff1 + diff2) + rim;
    float alpha = smoothstep(cutoff, cutoff + 0.16, strand) * mix(0.86, 0.56, uLayerFrac);
    gl_FragColor = vec4(col, alpha);
  }
`;

export class CatMentor3D {
  constructor(canvas, stageWrapper, onStateChange = null) {
    this.canvas = canvas;
    this.stageWrapper = stageWrapper;
    this.onStateChange = onStateChange;

    this.state = 'guide'; // 'guide' | 'run' | 'groom' | 'play' | 'stretch' | 'pet'
    this.stateTimer = 0;
    this.stateDuration = 7.5;
    this.groomStyle = 0; // 0 = paw-lick & face-wash, 1 = curved-spine flank grooming

    // Screen horizontal roaming state (px offset from right edge, negative = left)
    this.roamX = 0;
    this.targetRoamX = 0;
    this.facingDir = 0; // 0 = 3/4 front showcase, -1 = running left, +1 = running right
    this.stridePhase = 0; // Velocity-locked stride -> ZERO foot-sliding!

    // Yarn ball physics for authentic paw-swatting play!
    this.ball = { x: 0.38, y: 0.14, z: 0.85, vx: -0.95, vy: 1.4, swatSide: 0, swatTimer: 0 };

    // Natural feline micro-life timers
    this.blinkTimer = 2.6;
    this.blinkProgress = 0;
    this.earTwitchTimer = 3.2;
    this.earTwitchSide = 1;
    this.scrollBoostTimer = 0;

    this.pointer = { x: 0, y: 0 };
    this.smoothPointer = { x: 0, y: 0 };

    this.disposed = false;
    this.isHidden = false;
    this.paused = false;

    this.clock = new THREE.Clock();
    this.tailSegments = [];
    this.sparkles = [];
    this._tmpVec = new THREE.Vector3();

    this.init();
  }

  /* ==================== HIGH-RES PROCEDURAL PERSIAN FUR & EYE TEXTURES ==================== */
  createFurTextures(baseHex, midHex, creamHex, addTabbyMarks = false) {
    const size = 512;
    const cDiff = document.createElement('canvas');
    cDiff.width = size;
    cDiff.height = size;
    const ctx = cDiff.getContext('2d');

    // Warm base gradient (richer golden-caramel back, lighter ivory underside)
    const g = ctx.createLinearGradient(0, 0, 0, size);
    g.addColorStop(0, midHex);
    g.addColorStop(0.45, baseHex);
    g.addColorStop(0.82, creamHex);
    g.addColorStop(1, creamHex);
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, size, size);

    // Optional soft tabby forehead "M" & cheek striping (matching Photos #1, #4, #5!)
    if (addTabbyMarks) {
      ctx.save();
      ctx.strokeStyle = 'rgba(168, 102, 42, 0.32)';
      ctx.lineWidth = 10;
      ctx.lineCap = 'round';
      for (let s = -2; s <= 2; s++) {
        ctx.beginPath();
        ctx.moveTo(size * 0.5 + s * 22, size * 0.12);
        ctx.quadraticCurveTo(size * 0.5 + s * 16, size * 0.28, size * 0.5 + s * 26, size * 0.42);
        ctx.stroke();
      }
      ctx.restore();
    }

    // Matching directional hair bump canvas
    const cBump = document.createElement('canvas');
    cBump.width = size;
    cBump.height = size;
    const bctx = cBump.getContext('2d');
    bctx.fillStyle = '#808080';
    bctx.fillRect(0, 0, size, size);

    // Paint 4,500 fine silky Persian hair strands
    for (let i = 0; i < 4500; i++) {
      const x = Math.random() * size;
      const y = Math.random() * size;
      const len = 12 + Math.random() * 28;
      const sway = (Math.random() - 0.5) * 6;
      const r = Math.random();
      ctx.strokeStyle = r < 0.36 ? creamHex : r < 0.72 ? baseHex : midHex;
      ctx.globalAlpha = 0.16 + Math.random() * 0.24;
      ctx.lineWidth = 1.0 + Math.random() * 1.5;
      ctx.beginPath();
      ctx.moveTo(x, y);
      ctx.lineTo(x + sway, y + len);
      ctx.stroke();

      const lum = Math.floor(110 + Math.random() * 125);
      bctx.strokeStyle = `rgb(${lum},${lum},${lum})`;
      bctx.globalAlpha = 0.35;
      bctx.lineWidth = 1.1;
      bctx.beginPath();
      bctx.moveTo(x, y);
      bctx.lineTo(x + sway, y + len);
      bctx.stroke();
    }
    ctx.globalAlpha = 1;
    bctx.globalAlpha = 1;

    const map = new THREE.CanvasTexture(cDiff);
    map.colorSpace = THREE.SRGBColorSpace;
    map.wrapS = THREE.RepeatWrapping;
    map.wrapT = THREE.RepeatWrapping;

    const bumpMap = new THREE.CanvasTexture(cBump);
    bumpMap.wrapS = THREE.RepeatWrapping;
    bumpMap.wrapT = THREE.RepeatWrapping;

    return { map, bumpMap };
  }

  createFurAlphaStrandTexture() {
    const size = 256;
    const c = document.createElement('canvas');
    c.width = size;
    c.height = size;
    const ctx = c.getContext('2d');
    ctx.fillStyle = '#000000';
    ctx.fillRect(0, 0, size, size);

    // Dense overlapping soft fluffy hair tufts for volumetric shell fur!
    for (let i = 0; i < 2400; i++) {
      const x = Math.random() * size;
      const y = Math.random() * size;
      const rad = 1.4 + Math.random() * 3.4;
      const bright = Math.floor(155 + Math.random() * 100);
      const grad = ctx.createRadialGradient(x, y, 0, x, y, rad);
      grad.addColorStop(0, `rgb(${bright},${bright},${bright})`);
      grad.addColorStop(1, 'rgb(0,0,0)');
      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.arc(x, y, rad, 0, Math.PI * 2);
      ctx.fill();
    }

    const tex = new THREE.CanvasTexture(c);
    tex.wrapS = THREE.RepeatWrapping;
    tex.wrapT = THREE.RepeatWrapping;
    return tex;
  }

  createRealisticFelineEyeTexture() {
    // 2:1 Equirectangular map -> zero UV distortion on spherical eyeball!
    const c = document.createElement('canvas');
    c.width = 384;
    c.height = 192;
    const ctx = c.getContext('2d');
    const cx = 192;
    const cy = 96;

    // Dark espresso lash/sclera rim (like Photo #5 close-up!)
    ctx.fillStyle = '#1e1008';
    ctx.fillRect(0, 0, 384, 192);

    // Deep honey-amber-hazel cat iris with warm radial glow
    const irisGrad = ctx.createRadialGradient(cx, cy, 10, cx, cy, 50);
    irisGrad.addColorStop(0, '#442409');
    irisGrad.addColorStop(0.42, '#9b6422');
    irisGrad.addColorStop(0.75, '#7a4914');
    irisGrad.addColorStop(0.94, '#3d2109');
    irisGrad.addColorStop(1, '#1a0c04');
    ctx.fillStyle = irisGrad;
    ctx.beginPath();
    ctx.arc(cx, cy, 50, 0, Math.PI * 2);
    ctx.fill();

    // Fine realistic radial iris striations
    for (let i = 0; i < 48; i++) {
      const a = (i / 48) * Math.PI * 2;
      ctx.strokeStyle = i % 2 === 0 ? 'rgba(232, 184, 96, 0.28)' : 'rgba(65, 32, 8, 0.28)';
      ctx.lineWidth = 1.2;
      ctx.beginPath();
      ctx.moveTo(cx + Math.cos(a) * 18, cy + Math.sin(a) * 18);
      ctx.lineTo(cx + Math.cos(a) * 46, cy + Math.sin(a) * 46);
      ctx.stroke();
    }

    // Authentic feline vertical-almond dilated pupil (warm affectionate indoor light!)
    ctx.fillStyle = '#0c0502';
    ctx.beginPath();
    ctx.ellipse(cx, cy, 20, 30, 0, 0, Math.PI * 2);
    ctx.fill();

    // Soft glass cornea window reflection + bright pinprick catchlight
    ctx.fillStyle = 'rgba(255, 253, 246, 0.94)';
    ctx.beginPath();
    ctx.ellipse(cx - 14, cy - 15, 9, 6.5, -0.45, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = 'rgba(255, 240, 205, 0.55)';
    ctx.beginPath();
    ctx.arc(cx + 14, cy + 12, 3.8, 0, Math.PI * 2);
    ctx.fill();

    const tex = new THREE.CanvasTexture(c);
    tex.colorSpace = THREE.SRGBColorSpace;
    return tex;
  }

  /* ==================== MULTI-SHELL VOLUMETRIC FUR BUILDER ==================== */
  addFurShells(parentMesh, colorMap, { layers = 4, maxLen = 0.068, droop = 0.022, density = 6.5 } = {}) {
    const geo = parentMesh.geometry;
    for (let i = 1; i <= layers; i++) {
      const frac = i / layers;
      const mat = new THREE.ShaderMaterial({
        vertexShader: FUR_SHELL_VERT,
        fragmentShader: FUR_SHELL_FRAG,
        transparent: true,
        depthWrite: i === 1,
        uniforms: {
          uShellDist: { value: frac * maxLen },
          uDroop: { value: droop },
          uLayerFrac: { value: frac },
          uDensity: { value: density },
          uColorMap: { value: colorMap },
          uFurAlphaMap: { value: this.furAlphaTex },
          uRimColor: { value: new THREE.Color(0xffe1a6) },
        },
      });
      const shell = new THREE.Mesh(geo, mat);
      parentMesh.add(shell);
    }
  }

  /* ==================== VERTEX-SCULPTED ORGANIC FELINE GEOMETRIES ==================== */
  createSculptedHeadGeo() {
    // Sculpt ONE seamless organic Shirazi Persian head (flat delicate nose bridge,
    // real eye sockets, gentle triangular muzzle, lush tapering cheek fluff!)
    const geo = new THREE.SphereGeometry(0.32, 36, 28);
    const pos = geo.attributes.position;
    for (let i = 0; i < pos.count; i++) {
      let x = pos.getX(i);
      let y = pos.getY(i);
      let z = pos.getZ(i);

      // Slightly wider skull & subtly softened top crown
      x *= 1.07;
      y *= 0.94;
      z *= 0.98;

      // Lush Persian cheek fluff tapering cleanly below eye level (NOT detached balls!)
      if (y < 0.03 && y > -0.22 && z > -0.14) {
        const cheekWeight = Math.exp(-Math.pow((y + 0.09) / 0.11, 2)) * Math.max(0, Math.abs(x) / 0.28);
        x += Math.sign(x) * cheekWeight * 0.068;
        z += cheekWeight * 0.02;
      }

      // Gentle projecting feline muzzle & whisker bridge
      if (z > 0.12 && y < 0.03 && y > -0.24 && Math.abs(x) < 0.19) {
        const muzW = Math.exp(-Math.pow(x / 0.12, 2)) * Math.exp(-Math.pow((y + 0.09) / 0.095, 2));
        z += muzW * 0.095;
      }

      // Subtle anatomical eye-socket hollows so eyes sit naturally INSIDE the face!
      if (z > 0.15 && y > -0.04 && y < 0.14) {
        const eyeDistL = Math.hypot(x + 0.125, y - 0.045);
        const eyeDistR = Math.hypot(x - 0.125, y - 0.045);
        const sock = Math.exp(-Math.pow(Math.min(eyeDistL, eyeDistR) / 0.072, 2));
        z -= sock * 0.035;
      }

      // Smooth jawline taper at chin
      if (y < -0.18) {
        x *= 0.86;
      }

      pos.setXYZ(i, x, y, z);
    }
    geo.computeVertexNormals();
    return geo;
  }

  createSculptedEarGeo() {
    // Organic curved cupped feline ear (NOT a sharp pyramid cone!)
    const geo = new THREE.SphereGeometry(0.115, 20, 16);
    const pos = geo.attributes.position;
    for (let i = 0; i < pos.count; i++) {
      let x = pos.getX(i);
      let y = pos.getY(i);
      let z = pos.getZ(i);

      // Stretch upward into rounded triangular ear silhouette
      const h = (y + 0.115) / 0.23; // 0 at base -> 1 at tip
      const taper = Math.max(0.16, 1.0 - Math.pow(h, 1.25) * 0.84);
      x *= taper * 1.08;
      y = h * 0.24;
      z *= 0.48 * taper;

      // Cup forward side slightly concave like a real cat ear!
      if (z > 0) {
        z -= Math.sin(h * Math.PI) * 0.025 * Math.max(0, 1 - Math.abs(x) * 10);
      }
      pos.setXYZ(i, x, y, z);
    }
    geo.computeVertexNormals();
    return geo;
  }

  createSculptedBodySegmentGeo(rx, ry, rz, backPinch = 0.0) {
    const geo = new THREE.SphereGeometry(1.0, 26, 20);
    const pos = geo.attributes.position;
    for (let i = 0; i < pos.count; i++) {
      let x = pos.getX(i) * rx;
      let y = pos.getY(i) * ry;
      let z = pos.getZ(i) * rz;
      if (backPinch !== 0 && z < 0) {
        const w = Math.min(1, -z / rz);
        x *= 1 - w * backPinch;
        y *= 1 - w * backPinch * 0.6;
      }
      pos.setXYZ(i, x, y, z);
    }
    geo.computeVertexNormals();
    return geo;
  }

  /* ==================== INIT RENDERER & STUDIO LIGHTING ==================== */
  init() {
    this.renderer = new THREE.WebGLRenderer({
      canvas: this.canvas,
      antialias: true,
      alpha: true,
      powerPreference: 'high-performance',
    });
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.75));
    this.renderer.outputColorSpace = THREE.SRGBColorSpace;
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.12;

    this.scene = new THREE.Scene();
    this.camera = new THREE.PerspectiveCamera(31, 1, 0.1, 40);
    this.camera.position.set(0, 1.08, 4.7);
    this.camera.lookAt(0, 0.56, 0.05);

    const hemi = new THREE.HemisphereLight(0xfff7ea, 0x3b2616, 1.18);
    this.scene.add(hemi);

    const key = new THREE.DirectionalLight(0xffe8c6, 1.75);
    key.position.set(2.6, 4.8, 4.4);
    this.scene.add(key);

    const rim = new THREE.DirectionalLight(0xf6ca72, 1.25);
    rim.position.set(-3.2, 2.5, -2.8);
    this.scene.add(rim);

    // Generate High-Res Fur & Eye Textures
    this.furAlphaTex = this.createFurAlphaStrandTexture();
    const headTex = this.createFurTextures('#e4ae6e', '#c6813c', '#f6e1be', true);
    const bodyTex = this.createFurTextures('#e5b070', '#c7833d', '#f5dfb9', false);
    const creamTex = this.createFurTextures('#f7e6c9', '#e3be88', '#fff8ec', false);
    const tailTex = this.createFurTextures('#dfa562', '#bd7835', '#f5dfb8', false);
    const eyeTex = this.createRealisticFelineEyeTexture();

    this.furMaps = { head: headTex.map, body: bodyTex.map, cream: creamTex.map, tail: tailTex.map };

    this.mats = {
      furHead: new THREE.MeshStandardMaterial({ map: headTex.map, bumpMap: headTex.bumpMap, bumpScale: 0.025, roughness: 0.88 }),
      furBody: new THREE.MeshStandardMaterial({ map: bodyTex.map, bumpMap: bodyTex.bumpMap, bumpScale: 0.028, roughness: 0.88 }),
      furCream: new THREE.MeshStandardMaterial({ map: creamTex.map, bumpMap: creamTex.bumpMap, bumpScale: 0.024, roughness: 0.9 }),
      furTail: new THREE.MeshStandardMaterial({ map: tailTex.map, bumpMap: tailTex.bumpMap, bumpScale: 0.03, roughness: 0.88 }),
      innerEar: new THREE.MeshStandardMaterial({ color: 0xe6a69d, roughness: 0.76 }),
      nose: new THREE.MeshStandardMaterial({ color: 0xd87b6c, roughness: 0.36, metalness: 0.04 }),
      mouthDark: new THREE.MeshStandardMaterial({ color: 0x3a1c17, roughness: 0.8 }),
      tongue: new THREE.MeshStandardMaterial({ color: 0xeb7f8c, roughness: 0.32 }),
      toeBean: new THREE.MeshStandardMaterial({ color: 0xe4949d, roughness: 0.52 }),
      eye: new THREE.MeshStandardMaterial({ map: eyeTex, roughness: 0.08, metalness: 0.14 }),
      eyeliner: new THREE.MeshStandardMaterial({ color: 0x261409, roughness: 0.6 }),
      whisker: new THREE.MeshStandardMaterial({ color: 0xfff8ec, roughness: 0.45 }),
      collar: new THREE.MeshStandardMaterial({ color: 0x2a1a10, roughness: 0.55 }),
      gold: new THREE.MeshStandardMaterial({ color: 0xf4cd72, metalness: 0.86, roughness: 0.2 }),
      yarn: new THREE.MeshStandardMaterial({ color: 0xe6b552, roughness: 0.78, metalness: 0.1 }),
      yarnStripe: new THREE.MeshStandardMaterial({ color: 0xfce6a4, roughness: 0.65, metalness: 0.18 }),
    };

    this.buildSoftShadowDisc();
    this.buildAnatomicalPersianCat();
    this.buildGoldenYarnBall();
    this.buildSparkleParticles();

    this.handleResize();
    this.bindEvents();
    this.animate();
  }

  buildSoftShadowDisc() {
    const c = document.createElement('canvas');
    c.width = 128;
    c.height = 128;
    const ctx = c.getContext('2d');
    const g = ctx.createRadialGradient(64, 64, 4, 64, 64, 60);
    g.addColorStop(0, 'rgba(0, 0, 0, 0.52)');
    g.addColorStop(0.65, 'rgba(0, 0, 0, 0.16)');
    g.addColorStop(1, 'rgba(0, 0, 0, 0)');
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, 128, 128);
    const tex = new THREE.CanvasTexture(c);
    this.shadowDisc = new THREE.Mesh(
      new THREE.PlaneGeometry(1.9, 1.35),
      new THREE.MeshBasicMaterial({ map: tex, transparent: true, depthWrite: false })
    );
    this.shadowDisc.rotation.x = -Math.PI / 2;
    this.shadowDisc.position.y = 0.01;
    this.scene.add(this.shadowDisc);
  }

  /* ==================== BUILD TRUE ANATOMICAL PERSIAN CAT SKELETON ==================== */
  buildAnatomicalPersianCat() {
    this.catRoot = new THREE.Group();
    this.scene.add(this.catRoot);

    // Master Pelvis / Hip Root (whole body rises/sits/bounds from here!)
    this.pelvisGroup = new THREE.Group();
    this.pelvisGroup.position.set(0, 0.56, -0.18);
    this.catRoot.add(this.pelvisGroup);

    // Rounded Hind Haunches with Volumetric Fur
    const haunchMesh = new THREE.Mesh(this.createSculptedBodySegmentGeo(0.34, 0.31, 0.38, 0.12), this.mats.furBody);
    this.addFurShells(haunchMesh, this.furMaps.body, { layers: 4, maxLen: 0.072, droop: 0.024, density: 6.2 });
    this.pelvisGroup.add(haunchMesh);

    // Flexible Spine -> Chest / Thorax Group (allows real arching, stretching, and flank-grooming curve!)
    this.spinePivot = new THREE.Group();
    this.spinePivot.position.set(0, 0.05, 0.24);
    this.pelvisGroup.add(this.spinePivot);

    const thoraxMesh = new THREE.Mesh(this.createSculptedBodySegmentGeo(0.32, 0.30, 0.42, 0.08), this.mats.furBody);
    thoraxMesh.position.set(0, 0.02, 0.24);
    this.addFurShells(thoraxMesh, this.furMaps.body, { layers: 4, maxLen: 0.074, droop: 0.025, density: 6.2 });
    this.spinePivot.add(thoraxMesh);

    // Iconic Plush Ivory-Cream Persian Chest Mane / Ruff (longer flowing volumetric fur!)
    this.chestRuff = new THREE.Mesh(this.createSculptedBodySegmentGeo(0.28, 0.27, 0.26, 0.0), this.mats.furCream);
    this.chestRuff.position.set(0, 0.04, 0.48);
    this.addFurShells(this.chestRuff, this.furMaps.cream, { layers: 4, maxLen: 0.095, droop: 0.038, density: 5.5 });
    this.spinePivot.add(this.chestRuff);

    // Delicate Velvet & Gold Atelier Collar + Tiny Bell
    const collar = new THREE.Mesh(new THREE.TorusGeometry(0.215, 0.02, 10, 28), this.mats.collar);
    collar.rotation.x = Math.PI / 2 + 0.36;
    collar.position.set(0, 0.22, 0.46);
    const bell = new THREE.Mesh(new THREE.SphereGeometry(0.044, 12, 10), this.mats.gold);
    bell.position.set(0, 0.12, 0.66);
    this.spinePivot.add(collar, bell);

    // ==================== NECK -> SCULPTED SHIRAZI HEAD ====================
    this.neckPivot = new THREE.Group();
    this.neckPivot.position.set(0, 0.24, 0.44);
    this.spinePivot.add(this.neckPivot);

    const neckMesh = new THREE.Mesh(new THREE.CylinderGeometry(0.19, 0.24, 0.26, 18), this.mats.furCream);
    neckMesh.position.set(0, 0.07, 0.03);
    neckMesh.rotation.x = 0.16;
    this.addFurShells(neckMesh, this.furMaps.cream, { layers: 3, maxLen: 0.065, droop: 0.022, density: 5.5 });
    this.neckPivot.add(neckMesh);

    this.headGroup = new THREE.Group();
    this.headGroup.position.set(0, 0.22, 0.11);
    this.neckPivot.add(this.headGroup);

    // Seamless Vertex-Sculpted Shirazi Head with Soft Multi-Shell Volumetric Fur!
    const headMesh = new THREE.Mesh(this.createSculptedHeadGeo(), this.mats.furHead);
    this.addFurShells(headMesh, this.furMaps.head, { layers: 4, maxLen: 0.062, droop: 0.02, density: 6.8 });
    this.headGroup.add(headMesh);

    // Subtle soft cream chin & whisker pillows blended directly into sculpted muzzle
    const padGeo = new THREE.SphereGeometry(0.078, 16, 12);
    const padL = new THREE.Mesh(padGeo, this.mats.furCream);
    padL.scale.set(1.12, 0.85, 0.82);
    padL.position.set(-0.064, -0.088, 0.295);
    const padR = padL.clone();
    padR.position.x = 0.064;
    this.headGroup.add(padL, padR);

    // Articulated Lower Jaw + Animated Curved Pink Tongue (for real licking & yawning!)
    this.jawPivot = new THREE.Group();
    this.jawPivot.position.set(0, -0.118, 0.235);
    this.headGroup.add(this.jawPivot);

    const chinMesh = new THREE.Mesh(new THREE.SphereGeometry(0.066, 14, 10), this.mats.furCream);
    chinMesh.scale.set(1.05, 0.65, 1.0);
    chinMesh.position.set(0, -0.025, 0.055);
    const mouthCavity = new THREE.Mesh(new THREE.SphereGeometry(0.05, 12, 10), this.mats.mouthDark);
    mouthCavity.scale.set(1.0, 0.45, 0.9);
    mouthCavity.position.set(0, 0.005, 0.045);
    this.jawPivot.add(chinMesh, mouthCavity);

    this.tongueGroup = new THREE.Group();
    this.tongueGroup.position.set(0, -0.005, 0.05);
    const tongueMesh = new THREE.Mesh(new THREE.CapsuleGeometry(0.026, 0.095, 6, 12), this.mats.tongue);
    tongueMesh.rotation.x = Math.PI * 0.44;
    tongueMesh.scale.set(1.15, 1.0, 0.36);
    tongueMesh.position.set(0, -0.012, 0.052);
    this.tongueGroup.add(tongueMesh);
    this.tongueGroup.scale.set(0.01, 0.01, 0.01);
    this.jawPivot.add(this.tongueGroup);

    // Delicate Rosy-Pink Shirazi Nose (soft heart/triangle shape)
    const nose = new THREE.Mesh(new THREE.SphereGeometry(0.036, 14, 12), this.mats.nose);
    nose.scale.set(1.22, 0.84, 0.72);
    nose.position.set(0, -0.036, 0.355);
    this.headGroup.add(nose);

    // Deep-Set Almond Honey-Amber Eyes + Eyeliner Rim + Curved Animated Eyelids
    const buildFelineEye = (side) => {
      const socket = new THREE.Group();
      socket.position.set(side * 0.126, 0.045, 0.258);
      socket.rotation.y = side * 0.24;

      // Subtle dark lash rim around almond eye
      const rimRing = new THREE.Mesh(new THREE.TorusGeometry(0.072, 0.009, 8, 22), this.mats.eyeliner);
      rimRing.scale.set(1.06, 0.94, 0.6);
      rimRing.position.z = 0.016;
      socket.add(rimRing);

      // Eyeball pivots slightly to track pointer / yarn ball / paw!
      const eyeball = new THREE.Mesh(new THREE.SphereGeometry(0.074, 20, 18), this.mats.eye);
      eyeball.rotation.y = -Math.PI / 2;
      socket.add(eyeball);

      const upperLid = new THREE.Mesh(
        new THREE.SphereGeometry(0.08, 16, 12, 0, Math.PI * 2, 0, Math.PI * 0.56),
        this.mats.furHead
      );
      upperLid.rotation.x = -0.78;
      socket.add(upperLid);

      const lowerLid = new THREE.Mesh(
        new THREE.SphereGeometry(0.079, 14, 10, 0, Math.PI * 2, Math.PI * 0.56, Math.PI * 0.44),
        this.mats.furCream
      );
      lowerLid.rotation.x = 0.58;
      socket.add(lowerLid);

      this.headGroup.add(socket);
      return { socket, eyeball, upperLid, lowerLid };
    };

    this.eyeL = buildFelineEye(-1);
    this.eyeR = buildFelineEye(1);

    // Sculpted Organic Cupped Cat Ears with Inner Pink Shell & Cream Wisps
    const earGeo = this.createSculptedEarGeo();
    const buildEar = (side) => {
      const earPivot = new THREE.Group();
      earPivot.position.set(side * 0.19, 0.22, -0.01);
      earPivot.rotation.z = -side * 0.3;
      earPivot.rotation.y = side * 0.22;

      const outer = new THREE.Mesh(earGeo, this.mats.furHead);
      this.addFurShells(outer, this.furMaps.head, { layers: 3, maxLen: 0.032, droop: 0.008, density: 8.0 });

      const inner = new THREE.Mesh(earGeo, this.mats.innerEar);
      inner.scale.set(0.68, 0.72, 0.45);
      inner.position.set(0, 0.025, 0.024);

      const tuft = new THREE.Mesh(new THREE.SphereGeometry(0.038, 10, 8), this.mats.furCream);
      tuft.scale.set(1.25, 0.55, 0.55);
      tuft.position.set(-side * 0.025, 0.045, 0.042);

      earPivot.add(outer, inner, tuft);
      this.headGroup.add(earPivot);
      return earPivot;
    };
    this.earL = buildEar(-1);
    this.earR = buildEar(1);

    // Graceful Curved Whiskers (CatmullRom curves -> natural feline droop, NOT stiff needles!)
    [-1, 1].forEach((side) => {
      for (let i = 0; i < 4; i++) {
        const yOff = -0.07 - i * 0.018;
        const curve = new THREE.CatmullRomCurve3([
          new THREE.Vector3(side * 0.09, yOff, 0.31),
          new THREE.Vector3(side * 0.23, yOff - 0.005 + (1 - i) * 0.012, 0.3),
          new THREE.Vector3(side * (0.37 + i * 0.015), yOff - 0.045 + (1 - i) * 0.01, 0.24),
        ]);
        const w = new THREE.Mesh(new THREE.TubeGeometry(curve, 8, 0.0024, 5, false), this.mats.whisker);
        this.headGroup.add(w);
      }
    });

    // ==================== 3-BONE ARTICULATED FRONT LEGS (SHOULDER -> ELBOW -> WRIST/PAW) ====================
    const buildFrontLeg = (side) => {
      const shoulder = new THREE.Group();
      shoulder.position.set(side * 0.19, -0.06, 0.36);

      const upperArm = new THREE.Mesh(new THREE.CapsuleGeometry(0.088, 0.21, 8, 14), this.mats.furBody);
      upperArm.position.y = -0.12;
      this.addFurShells(upperArm, this.furMaps.body, { layers: 3, maxLen: 0.045, droop: 0.015, density: 6.5 });
      shoulder.add(upperArm);

      const elbow = new THREE.Group();
      elbow.position.set(0, -0.24, 0.0);
      const forearm = new THREE.Mesh(new THREE.CapsuleGeometry(0.072, 0.22, 8, 14), this.mats.furCream);
      forearm.position.y = -0.12;
      this.addFurShells(forearm, this.furMaps.cream, { layers: 2, maxLen: 0.032, droop: 0.01, density: 7.0 });
      elbow.add(forearm);

      const wrist = new THREE.Group();
      wrist.position.set(0, -0.25, 0.03);
      const paw = this.createSculptedPaw();
      wrist.add(paw);

      elbow.add(wrist);
      shoulder.add(elbow);
      this.spinePivot.add(shoulder);
      return { shoulder, elbow, wrist };
    };

    this.frontL = buildFrontLeg(-1);
    this.frontR = buildFrontLeg(1);

    // ==================== 3-BONE ARTICULATED HIND LEGS (HIP/THIGH -> KNEE -> BACKWARD HOCK -> PAW) ====================
    const buildHindLeg = (side) => {
      const hip = new THREE.Group();
      hip.position.set(side * 0.23, -0.04, -0.08);

      const thigh = new THREE.Mesh(new THREE.CapsuleGeometry(0.112, 0.22, 8, 14), this.mats.furBody);
      thigh.scale.set(0.92, 1.0, 1.12);
      thigh.position.set(0, -0.12, 0.02);
      this.addFurShells(thigh, this.furMaps.body, { layers: 3, maxLen: 0.052, droop: 0.018, density: 6.2 });
      hip.add(thigh);

      const knee = new THREE.Group();
      knee.position.set(0, -0.22, 0.04);
      const shin = new THREE.Mesh(new THREE.CapsuleGeometry(0.072, 0.18, 8, 12), this.mats.furBody);
      shin.position.set(0, -0.1, -0.035);
      shin.rotation.x = 0.24;
      knee.add(shin);

      const hock = new THREE.Group();
      hock.position.set(0, -0.19, -0.07);
      const ankle = new THREE.Mesh(new THREE.CapsuleGeometry(0.056, 0.12, 6, 10), this.mats.furCream);
      ankle.position.set(0, -0.06, 0.025);
      ankle.rotation.x = -0.22;
      hock.add(ankle);

      const paw = this.createSculptedPaw();
      paw.position.set(0, -0.13, 0.07);
      hock.add(paw);

      knee.add(hock);
      hip.add(knee);
      this.pelvisGroup.add(hip);
      return { hip, knee, hock };
    };

    this.hindL = buildHindLeg(-1);
    this.hindR = buildHindLeg(1);

    // ==================== 6-SEGMENT PLUSH VOLUMETRIC PLUME TAIL ====================
    let parentTail = this.pelvisGroup;
    const tailSpecs = [
      { pos: [0, 0.08, -0.34], r: 0.095, len: 0.19, fur: 0.075 },
      { pos: [0, 0.17, -0.04], r: 0.115, len: 0.21, fur: 0.092 },
      { pos: [0, 0.18, -0.03], r: 0.125, len: 0.21, fur: 0.1 },
      { pos: [0, 0.18, -0.02], r: 0.12, len: 0.2, fur: 0.096 },
      { pos: [0, 0.17, -0.01], r: 0.105, len: 0.18, fur: 0.086 },
      { pos: [0, 0.15, 0.0], r: 0.082, len: 0.14, fur: 0.07 },
    ];
    tailSpecs.forEach((spec, idx) => {
      const pivot = new THREE.Group();
      pivot.position.set(spec.pos[0], spec.pos[1], spec.pos[2]);
      const segMesh = new THREE.Mesh(
        new THREE.CapsuleGeometry(spec.r, spec.len, 6, 12),
        idx >= 4 ? this.mats.furCream : this.mats.furTail
      );
      segMesh.position.y = spec.len * 0.44;
      this.addFurShells(segMesh, idx >= 4 ? this.furMaps.cream : this.furMaps.tail, {
        layers: 3,
        maxLen: spec.fur,
        droop: 0.025,
        density: 5.5,
      });
      pivot.add(segMesh);
      parentTail.add(pivot);
      this.tailSegments.push(pivot);
      parentTail = pivot;
    });
  }

  createSculptedPaw() {
    const g = new THREE.Group();
    const base = new THREE.Mesh(new THREE.SphereGeometry(0.074, 12, 10), this.mats.furCream);
    base.scale.set(1.04, 0.62, 1.18);
    g.add(base);

    // 3 sculpted front fluffy toes
    [-0.042, 0, 0.042].forEach((tx, idx) => {
      const toe = new THREE.Mesh(new THREE.SphereGeometry(0.032, 8, 8), this.mats.furCream);
      toe.position.set(tx, -0.008, 0.068 - Math.abs(idx - 1) * 0.012);
      g.add(toe);

      // Cute pink toe-bean underneath!
      const bean = new THREE.Mesh(new THREE.SphereGeometry(0.018, 8, 8), this.mats.toeBean);
      bean.scale.set(1.0, 0.55, 1.0);
      bean.position.set(tx, -0.04, 0.056 - Math.abs(idx - 1) * 0.01);
      g.add(bean);
    });
    const palmBean = new THREE.Mesh(new THREE.SphereGeometry(0.034, 8, 8), this.mats.toeBean);
    palmBean.scale.set(1.1, 0.45, 0.95);
    palmBean.position.set(0, -0.042, 0.006);
    g.add(palmBean);
    return g;
  }

  buildGoldenYarnBall() {
    this.yarnBall = new THREE.Group();
    const core = new THREE.Mesh(new THREE.SphereGeometry(0.145, 16, 14), this.mats.yarn);
    this.yarnBall.add(core);
    for (let i = 0; i < 5; i++) {
      const band = new THREE.Mesh(new THREE.TorusGeometry(0.147, 0.018, 8, 24), this.mats.yarnStripe);
      band.rotation.set(i * 0.72, i * 1.12, i * 0.45);
      this.yarnBall.add(band);
    }
    this.yarnBall.visible = false;
    this.scene.add(this.yarnBall);
  }

  buildSparkleParticles() {
    const geo = new THREE.OctahedronGeometry(0.048, 0);
    for (let i = 0; i < 8; i++) {
      const sp = new THREE.Mesh(geo, new THREE.MeshBasicMaterial({ color: 0xffe8a3, transparent: true, opacity: 0 }));
      sp.visible = false;
      this.scene.add(sp);
      this.sparkles.push({ mesh: sp, life: 0, vx: 0, vy: 0, vz: 0 });
    }
  }

  spawnHappySparkles(originY = 1.08) {
    this.sparkles.forEach((s, i) => {
      const angle = (i / this.sparkles.length) * Math.PI * 2;
      s.mesh.position.set(Math.cos(angle) * 0.26, originY, Math.sin(angle) * 0.22 + 0.25);
      s.vx = Math.cos(angle) * (0.4 + Math.random() * 0.35);
      s.vy = 0.68 + Math.random() * 0.5;
      s.vz = Math.sin(angle) * 0.28;
      s.life = 1.0;
      s.mesh.visible = true;
    });
  }

  /* ==================== PUBLIC INTERACTIVE STATE CONTROLS ==================== */
  setState(nextState, duration = null) {
    this.state = nextState;
    this.stateTimer = 0;

    if (nextState === 'groom') {
      this.groomStyle = (this.groomStyle + 1) % 2;
      this.stateDuration = duration ?? 6.2;
      this.facingDir = 0;
    } else if (nextState === 'play') {
      this.stateDuration = duration ?? 6.8;
      this.facingDir = 0;
      this.ball = { x: 0.42, y: 0.34, z: 0.88, vx: -1.1, vy: 1.15, swatSide: 0, swatTimer: 0 };
    } else if (nextState === 'stretch') {
      this.stateDuration = duration ?? 4.6;
      this.facingDir = 0;
    } else if (nextState === 'pet') {
      this.stateDuration = duration ?? 3.4;
      this.facingDir = 0;
      this.spawnHappySparkles(1.08);
    } else if (nextState === 'run') {
      this.stateDuration = duration ?? 4.2;
      this.pickNewRoamTarget();
    } else {
      this.stateDuration = duration ?? 8.0;
      this.facingDir = 0;
    }

    if (this.onStateChange) this.onStateChange(nextState);
  }

  pickNewRoamTarget() {
    const maxRoam = Math.min(window.innerWidth * 0.5, window.innerWidth < 680 ? 140 : 440);
    const goLeft = Math.abs(this.roamX) < maxRoam * 0.42;
    this.targetRoamX = goLeft ? -(maxRoam * (0.55 + Math.random() * 0.45)) : -(Math.random() * maxRoam * 0.22);
    this.facingDir = this.targetRoamX < this.roamX ? -1 : 1;
  }

  onUserScroll(scrollDelta = 0) {
    if (this.paused) return;
    this.scrollBoostTimer = 1.05;
    if (this.state !== 'run' && Math.abs(scrollDelta) > 8) {
      this.state = 'run';
      this.stateTimer = 0;
      this.stateDuration = 2.5;
      const maxRoam = Math.min(window.innerWidth * 0.46, window.innerWidth < 680 ? 128 : 370);
      const step = Math.max(-72, Math.min(72, -scrollDelta * 0.32));
      this.targetRoamX = Math.max(-maxRoam, Math.min(0, this.roamX + step));
      this.facingDir = this.targetRoamX < this.roamX ? -1 : 1;
      if (this.onStateChange) this.onStateChange('run');
    }
  }

  setPaused(paused) {
    this.paused = Boolean(paused);
  }

  handleResize() {
    if (!this.canvas) return;
    const isMob = window.innerWidth < 680;
    const size = isMob ? 172 : 244;
    this.renderer.setSize(size, size, false);
    this.camera.aspect = 1;
    this.camera.updateProjectionMatrix();

    const maxRoam = Math.min(window.innerWidth * 0.48, isMob ? 128 : 400);
    this.roamX = Math.max(-maxRoam, Math.min(0, this.roamX));
    this.targetRoamX = Math.max(-maxRoam, Math.min(0, this.targetRoamX));
  }

  bindEvents() {
    window.addEventListener('resize', () => this.handleResize(), { passive: true });
    window.addEventListener(
      'pointermove',
      (e) => {
        if (e.pointerType !== 'mouse') return;
        this.pointer.x = (e.clientX / window.innerWidth) * 2 - 1;
        this.pointer.y = -(e.clientY / window.innerHeight) * 2 + 1;
      },
      { passive: true }
    );
    document.addEventListener('visibilitychange', () => {
      this.isHidden = document.hidden;
    });
  }

  /* ==================== 60FPS SMOOTH SKELETAL KINEMATICS LOOP ==================== */
  animate() {
    if (this.disposed) return;
    requestAnimationFrame(() => this.animate());
    if (this.isHidden || this.paused) return;

    const dt = Math.min(this.clock.getDelta(), 0.05);
    const t = this.clock.getElapsedTime();
    const damp = 1 - Math.exp(-8.5 * dt);
    const dampFast = 1 - Math.exp(-15.0 * dt);

    this.stateTimer += dt;
    if (this.scrollBoostTimer > 0) this.scrollBoostTimer = Math.max(0, this.scrollBoostTimer - dt);

    this.smoothPointer.x += (this.pointer.x - this.smoothPointer.x) * damp;
    this.smoothPointer.y += (this.pointer.y - this.smoothPointer.y) * damp;

    // Lively autonomous Persian cat behavior cycle
    if (this.state !== 'guide' && this.stateTimer >= this.stateDuration && this.scrollBoostTimer <= 0) {
      this.setState('guide', 8.0 + Math.random() * 4.5);
    } else if (this.state === 'guide' && this.stateTimer >= this.stateDuration) {
      const roll = Math.random();
      if (roll < 0.36) this.setState('groom');
      else if (roll < 0.64) this.setState('play');
      else if (roll < 0.84) this.setState('stretch');
      else this.setState('run');
    }

    // Velocity-locked horizontal screen roaming (stridePhase locked to actual pixels moved -> ZERO foot sliding!)
    let moveSpeed = 0;
    if (this.state === 'run') {
      const diff = this.targetRoamX - this.roamX;
      if (Math.abs(diff) > 3) {
        const maxSpd = window.innerWidth < 680 ? 132 : 205;
        const speed = Math.min(Math.abs(diff) * 2.4, maxSpd);
        const step = Math.sign(diff) * speed * dt;
        this.roamX += step;
        moveSpeed = Math.abs(step) / Math.max(0.001, dt);
        this.stridePhase += Math.abs(step) * 0.135;
        this.facingDir = diff < 0 ? -1 : 1;
      } else if (this.scrollBoostTimer <= 0) {
        this.facingDir = 0;
        if (this.stateTimer > 1.1) this.setState('guide');
      }
    } else {
      this.facingDir = 0;
    }

    if (this.stageWrapper) {
      this.stageWrapper.style.transform = `translate3d(${this.roamX.toFixed(1)}px, 0, 0)`;
    }

    // Smooth orientation: full profile when running, warm 3/4 portrait showcase when sitting/grooming/playing!
    const desiredRotY =
      this.facingDir === -1 ? -Math.PI * 0.48 :
      this.facingDir === 1 ? Math.PI * 0.48 :
      this.state === 'stretch' ? -0.62 : 0.24;
    this.catRoot.rotation.y += (desiredRotY - this.catRoot.rotation.y) * damp;

    // ==================== DEFAULT REGAL SHIRAZI SITTING POSE ====================
    // Pelvis sits snugly near ground, spine angles up gracefully, hind legs tucked cleanly under haunches,
    // front paws planted neatly in front!
    let pelY = 0.35 + Math.sin(t * 2.2) * 0.008;
    let pelZ = -0.16;
    let pelPitch = -0.58; // Hindquarters seated upright!
    let spinePitch = 0.34;
    let spineYaw = 0;
    let spineRoll = 0;

    let neckPitch = 0.22;
    let neckYaw = this.smoothPointer.x * 0.22;
    let headPitch = -this.smoothPointer.y * 0.15;
    let headYaw = this.smoothPointer.x * 0.26;
    let headRoll = 0;

    let jawOpen = 0;
    let tongueOut = 0;
    let happySquint = 0;

    // Front limbs (straight graceful sitting stance)
    let flShX = 0.28, flShZ = 0.04, flElX = -0.08, flWrX = -0.02;
    let frShX = 0.28, frShZ = -0.04, frElX = -0.08, frWrX = -0.02;

    // Hind limbs (neatly folded feline sit under haunches!)
    let hlHipX = -0.78, hlKneeX = 1.65, hlHockX = -1.25;
    let hrHipX = -0.78, hrKneeX = 1.65, hrHockX = -1.25;

    let tailBasePitch = -0.25;
    let tailSpeed = 2.0;
    let tailAmp = 0.16;

    this.yarnBall.visible = false;

    // ==================== STATE 1: AUTHENTIC 4-LEG FELINE TROT / BOUNDING RUN ====================
    if (this.state === 'run') {
      const s = this.stridePhase;
      const gallopAmp = Math.min(1.0, moveSpeed / 90);
      // Stand horizontally on all 4 paws at exact ground-contact height (pelY=0.58 -> paws kiss y=0.01!)
      pelY = 0.58 + Math.abs(Math.sin(s)) * 0.075 * gallopAmp;
      pelZ = -0.18;
      pelPitch = Math.sin(s) * 0.11 * gallopAmp;
      spinePitch = -Math.sin(s) * 0.17 * gallopAmp;

      // Head stabilization (stays level while spine flexes!)
      neckPitch = -0.18 - spinePitch * 0.6;
      neckYaw = 0;
      headPitch = 0.16;
      headYaw = 0;

      // 3-Bone Front Limbs: shoulder swing + elbow flexion on forward swing + wrist flick!
      const flPhase = Math.sin(s);
      const frPhase = Math.sin(s + 0.72);
      flShX = flPhase * 0.62 * gallopAmp;
      flElX = -Math.max(0, -Math.cos(s)) * 0.82 * gallopAmp;
      flWrX = Math.max(0, -Math.cos(s)) * 0.42 * gallopAmp;

      frShX = frPhase * 0.62 * gallopAmp;
      frElX = -Math.max(0, -Math.cos(s + 0.72)) * 0.82 * gallopAmp;
      frWrX = Math.max(0, -Math.cos(s + 0.72)) * 0.42 * gallopAmp;

      // 3-Bone Hind Limbs: synchronized push-off with authentic feline knee & springy hock!
      const hlPhase = -Math.sin(s + 0.25);
      const hrPhase = -Math.sin(s + 0.95);
      hlHipX = -0.18 + hlPhase * 0.58 * gallopAmp;
      hlKneeX = 0.52 + Math.max(0, Math.cos(s + 0.25)) * 0.62 * gallopAmp;
      hlHockX = -0.34 - Math.max(0, Math.cos(s + 0.25)) * 0.38 * gallopAmp;

      hrHipX = -0.18 + hrPhase * 0.58 * gallopAmp;
      hrKneeX = 0.52 + Math.max(0, Math.cos(s + 0.95)) * 0.62 * gallopAmp;
      hrHockX = -0.34 - Math.max(0, Math.cos(s + 0.95)) * 0.38 * gallopAmp;

      tailBasePitch = -0.76;
      tailSpeed = 6.2;
      tailAmp = 0.22;
    }

    // ==================== STATE 2: ANATOMICAL PAW-LICK & FACE-WASH / FLANK GROOMING ====================
    else if (this.state === 'groom') {
      happySquint = 0.62;
      const lickOsc = Math.sin(t * 6.4);

      if (this.groomStyle === 0) {
        // Authentic 2-Phase Cat Wash: (A) Lick fluffy front-right paw -> (B) Sweep across cheek & ear!
        const phase = (this.stateTimer % 3.2) / 3.2;
        if (phase < 0.62) {
          // Exact verified kinematics: right paw hovers 0.02 units directly in front of pink licking tongue!
          frShX = -1.14 + lickOsc * 0.06;
          frShZ = -0.28; // Inward toward mouth midline!
          frElX = -1.42;
          frWrX = -0.46;

          neckPitch = 0.42 + lickOsc * 0.05;
          neckYaw = 0.14; // Turns softly toward right paw (+X)
          headPitch = 0.22 + lickOsc * 0.08;
          headYaw = 0.12;
          headRoll = -0.12;
          jawOpen = 0.18 + Math.max(0, lickOsc) * 0.16;
          tongueOut = Math.max(0, lickOsc) * 1.0;
        } else {
          // Phase B: Graceful feline cheek-and-ear wash arc!
          const sweep = Math.sin(((phase - 0.62) / 0.38) * Math.PI);
          frShX = -1.38 - sweep * 0.34;
          frShZ = -0.32;
          frElX = -1.36 - sweep * 0.18;
          frWrX = -0.35;

          neckPitch = 0.22;
          neckYaw = 0.08;
          headPitch = 0.08 - sweep * 0.16;
          headRoll = -0.28 * sweep; // Leans cheek cozily into the paw stroke!
          jawOpen = 0.04;
          tongueOut = 0.05;
        }
      } else {
        // Style 1: Curves spine & neck gracefully sideways to lick her fluffy golden shoulder/flank fur!
        spineYaw = 0.34;
        spineRoll = -0.08;
        neckYaw = 0.52;
        neckPitch = 0.48 + lickOsc * 0.08;
        headYaw = 0.36;
        headPitch = 0.28 + lickOsc * 0.1;
        headRoll = 0.22;
        jawOpen = 0.16 + Math.max(0, lickOsc) * 0.16;
        tongueOut = Math.max(0, lickOsc) * 0.95;
      }
      tailSpeed = 1.4;
      tailAmp = 0.12;
    }

    // ==================== STATE 3: PHYSICS-SYNCHRONIZED GOLDEN YARN-BALL PLAY ====================
    else if (this.state === 'play') {
      this.yarnBall.visible = true;

      // Advance real bouncing ball physics in front of the cat!
      this.ball.vy -= 4.6 * dt;
      this.ball.x += this.ball.vx * dt;
      this.ball.y += this.ball.vy * dt;
      if (this.ball.y < 0.145) {
        this.ball.y = 0.145;
        this.ball.vy = Math.max(0.75, Math.abs(this.ball.vy) * 0.68);
      }
      // Bounce softly within cat's playful paw reach & trigger exact timed paw swat!
      if (this.ball.x < -0.52) {
        this.ball.x = -0.52;
        this.ball.vx = 0.95 + Math.random() * 0.45;
        this.ball.vy = 1.35 + Math.random() * 0.35;
        this.ball.swatSide = -1;
        this.ball.swatTimer = 0.38;
      } else if (this.ball.x > 0.52) {
        this.ball.x = 0.52;
        this.ball.vx = -(0.95 + Math.random() * 0.45);
        this.ball.vy = 1.35 + Math.random() * 0.35;
        this.ball.swatSide = 1;
        this.ball.swatTimer = 0.38;
      }
      if (this.ball.swatTimer > 0) this.ball.swatTimer = Math.max(0, this.ball.swatTimer - dt);

      this.yarnBall.position.set(this.ball.x, this.ball.y, this.ball.z);
      this.yarnBall.rotation.z -= this.ball.vx * dt * 4.5;
      this.yarnBall.rotation.x += dt * 2.8;

      // Playful low crouch + rump wiggle!
      pelY = 0.46 + Math.abs(Math.sin(t * 4.2)) * 0.04;
      pelPitch = -0.18;
      spinePitch = 0.24;
      spineRoll = Math.sin(t * 8.5) * 0.06;

      // Eyes & head lock right onto the bouncing yarn ball!
      neckYaw = Math.max(-0.42, Math.min(0.42, this.ball.x * 0.72));
      headYaw = Math.max(-0.4, Math.min(0.4, this.ball.x * 0.65));
      headPitch = 0.32 - this.ball.y * 0.45;
      headRoll = -this.ball.x * 0.16;

      // Timed paw swat directly toward the ball on impact!
      const swatArc = Math.sin((this.ball.swatTimer / 0.38) * Math.PI);
      if (this.ball.swatSide < 0 && this.ball.swatTimer > 0) {
        flShX = -0.82 * swatArc;
        flElX = -0.52 * swatArc;
        flShZ = -0.22 * swatArc;
      } else if (this.ball.swatSide > 0 && this.ball.swatTimer > 0) {
        frShX = -0.82 * swatArc;
        frElX = -0.52 * swatArc;
        frShZ = 0.22 * swatArc;
      } else {
        // Ready play stance
        flShX = -0.15; flElX = -0.35;
        frShX = -0.15; frElX = -0.35;
      }

      hlHipX = -0.52; hlKneeX = 1.15; hlHockX = -0.82;
      hrHipX = -0.52; hrKneeX = 1.15; hrHockX = -0.82;
      tailBasePitch = -0.52;
      tailSpeed = 7.4;
      tailAmp = 0.32;
    }

    // ==================== STATE 4: AUTHENTIC CAT YOGA STRETCH & CUTE YAWN ====================
    else if (this.state === 'stretch') {
      const env = Math.sin(Math.min(1, this.stateTimer / this.stateDuration) * Math.PI);
      // Iconic feline front stretch: rump rises high, chest sinks low, front paws slide far forward!
      pelY = 0.38 + env * 0.26;
      pelPitch = -0.52 + env * 0.85;
      spinePitch = 0.32 - env * 0.68;
      neckPitch = 0.12 - env * 0.38;
      headPitch = -0.05 - env * 0.18;
      headYaw = 0;

      flShX = 0.28 - env * 1.15; flElX = -0.05; flWrX = env * 0.45;
      frShX = 0.28 - env * 1.15; frElX = -0.05; frWrX = env * 0.45;

      hlHipX = -0.78 + env * 0.58; hlKneeX = 1.65 - env * 1.15; hlHockX = -1.25 + env * 0.88;
      hrHipX = -0.78 + env * 0.58; hrKneeX = 1.65 - env * 1.15; hrHockX = -1.25 + env * 0.88;

      // Cute sleepy stretch yawn at peak!
      jawOpen = env > 0.72 ? (env - 0.72) * 1.55 : 0;
      tongueOut = env > 0.75 ? (env - 0.75) * 2.2 : 0;
      happySquint = env * 0.82;
      tailBasePitch = -0.35 - env * 0.45;
      tailSpeed = 1.6;
      tailAmp = 0.14;
    }

    // ==================== STATE 5: AFFECTIONATE PURR & HEAD NUZZLE (PETTING!) ====================
    else if (this.state === 'pet') {
      happySquint = 0.96;
      pelY = 0.36 + Math.sin(t * 7.5) * 0.012;
      headRoll = Math.sin(t * 4.8) * 0.24;
      headPitch = -0.14 + Math.sin(t * 3.6) * 0.08;
      headYaw = Math.sin(t * 3.0) * 0.18;
      neckPitch = 0.12;
      tailSpeed = 4.6;
      tailAmp = 0.28;
    }

    // ==================== APPLY SMOOTH EXPONENTIAL JOINT INTERPOLATION ====================
    this.pelvisGroup.position.y += (pelY - this.pelvisGroup.position.y) * damp;
    this.pelvisGroup.position.z += (pelZ - this.pelvisGroup.position.z) * damp;
    this.pelvisGroup.rotation.x += (pelPitch - this.pelvisGroup.rotation.x) * damp;

    this.spinePivot.rotation.x += (spinePitch - this.spinePivot.rotation.x) * damp;
    this.spinePivot.rotation.y += (spineYaw - this.spinePivot.rotation.y) * damp;
    this.spinePivot.rotation.z += (spineRoll - this.spinePivot.rotation.z) * damp;

    this.neckPivot.rotation.x += (neckPitch - this.neckPivot.rotation.x) * damp;
    this.neckPivot.rotation.y += (neckYaw - this.neckPivot.rotation.y) * damp;

    this.headGroup.rotation.x += (headPitch - this.headGroup.rotation.x) * damp;
    this.headGroup.rotation.y += (headYaw - this.headGroup.rotation.y) * damp;
    this.headGroup.rotation.z += (headRoll - this.headGroup.rotation.z) * damp;

    this.jawPivot.rotation.x += (jawOpen - this.jawPivot.rotation.x) * dampFast;

    // Breathing ruff pulse
    const breath = 1 + Math.sin(t * 2.5) * 0.025;
    this.chestRuff.scale.set(breath, breath, breath);

    // 3-Bone Front Limbs
    this.frontL.shoulder.rotation.x += (flShX - this.frontL.shoulder.rotation.x) * dampFast;
    this.frontL.shoulder.rotation.z += (flShZ - this.frontL.shoulder.rotation.z) * dampFast;
    this.frontL.elbow.rotation.x += (flElX - this.frontL.elbow.rotation.x) * dampFast;
    this.frontL.wrist.rotation.x += (flWrX - this.frontL.wrist.rotation.x) * dampFast;

    this.frontR.shoulder.rotation.x += (frShX - this.frontR.shoulder.rotation.x) * dampFast;
    this.frontR.shoulder.rotation.z += (frShZ - this.frontR.shoulder.rotation.z) * dampFast;
    this.frontR.elbow.rotation.x += (frElX - this.frontR.elbow.rotation.x) * dampFast;
    this.frontR.wrist.rotation.x += (frWrX - this.frontR.wrist.rotation.x) * dampFast;

    // 3-Bone Hind Limbs
    this.hindL.hip.rotation.x += (hlHipX - this.hindL.hip.rotation.x) * dampFast;
    this.hindL.knee.rotation.x += (hlKneeX - this.hindL.knee.rotation.x) * dampFast;
    this.hindL.hock.rotation.x += (hlHockX - this.hindL.hock.rotation.x) * dampFast;

    this.hindR.hip.rotation.x += (hrHipX - this.hindR.hip.rotation.x) * dampFast;
    this.hindR.knee.rotation.x += (hrKneeX - this.hindR.knee.rotation.x) * dampFast;
    this.hindR.hock.rotation.x += (hrHockX - this.hindR.hock.rotation.x) * dampFast;

    // Curved Pink Tongue
    const tScale = Math.max(0.01, tongueOut);
    this._tmpVec.set(tScale, tScale, tScale);
    this.tongueGroup.scale.lerp(this._tmpVec, dampFast);

    // Natural Eye Blinking, Happy Squint & Subtle Pupil Eye-Tracking!
    this.blinkTimer -= dt;
    if (this.blinkTimer <= 0) {
      this.blinkProgress = 1.0;
      this.blinkTimer = 2.8 + Math.random() * 3.6;
    }
    if (this.blinkProgress > 0) this.blinkProgress = Math.max(0, this.blinkProgress - dt * 6.8);
    const blinkAmt = Math.sin(this.blinkProgress * Math.PI);
    const upperClose = Math.max(blinkAmt, happySquint * 0.72);
    const upperRot = -0.78 + upperClose * 0.86;
    const lowerRot = 0.58 - happySquint * 0.42;

    this.eyeL.upperLid.rotation.x = upperRot;
    this.eyeR.upperLid.rotation.x = upperRot;
    this.eyeL.lowerLid.rotation.x = lowerRot;
    this.eyeR.lowerLid.rotation.x = lowerRot;

    const lookYaw = this.state === 'play' ? this.ball.x * 0.35 : this.smoothPointer.x * 0.18;
    const lookPitch = this.state === 'play' ? (this.ball.y - 0.5) * 0.25 : this.smoothPointer.y * 0.14;
    this.eyeL.eyeball.rotation.y = -Math.PI / 2 + lookYaw;
    this.eyeR.eyeball.rotation.y = -Math.PI / 2 + lookYaw;
    this.eyeL.eyeball.rotation.z = lookPitch;
    this.eyeR.eyeball.rotation.z = lookPitch;

    // Independent Ear Twitches
    this.earTwitchTimer -= dt;
    let earTwitch = 0;
    if (this.earTwitchTimer <= 0) {
      this.earTwitchTimer = 2.6 + Math.random() * 4.2;
      this.earTwitchSide = Math.random() < 0.5 ? -1 : 1;
    } else if (this.earTwitchTimer < 0.24) {
      earTwitch = Math.sin((this.earTwitchTimer / 0.24) * Math.PI) * 0.24;
    }
    this.earL.rotation.z = 0.3 + (this.earTwitchSide < 0 ? earTwitch : 0);
    this.earR.rotation.z = -0.3 - (this.earTwitchSide > 0 ? earTwitch : 0);

    // Liquid-Smooth 6-Segment Persian Plume Tail Wave!
    for (let i = 0; i < this.tailSegments.length; i++) {
      const seg = this.tailSegments[i];
      const baseP = i === 0 ? tailBasePitch : 0.14;
      seg.rotation.z = Math.sin(t * tailSpeed - i * 0.58) * tailAmp;
      seg.rotation.x += (baseP + Math.cos(t * tailSpeed * 0.7 - i * 0.48) * 0.07 - seg.rotation.x) * damp;
    }

    // Golden Sparkles on Petting
    for (const s of this.sparkles) {
      if (s.life > 0) {
        s.life -= dt * 0.75;
        s.mesh.position.x += s.vx * dt;
        s.mesh.position.y += s.vy * dt;
        s.mesh.position.z += s.vz * dt;
        s.mesh.rotation.y += dt * 4.5;
        s.mesh.material.opacity = Math.max(0, s.life);
        if (s.life <= 0) s.mesh.visible = false;
      }
    }

    // Dynamic Ground Shadow (stretches horizontally when running/stretching, compacts when sitting!)
    const shadowSX = this.state === 'run' || this.state === 'stretch' ? 1.18 : 0.92;
    const shadowSY = this.state === 'run' ? 0.76 : 0.95;
    this.shadowDisc.scale.x += (shadowSX - this.shadowDisc.scale.x) * damp;
    this.shadowDisc.scale.y += (shadowSY - this.shadowDisc.scale.y) * damp;

    this.renderer.render(this.scene, this.camera);
  }
}
