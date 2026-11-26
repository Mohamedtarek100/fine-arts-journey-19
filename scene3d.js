/**
 * =========================================================================
 *  Three.js Silky 60FPS Fine Arts Atelier & Realistic 3D Birthday Cake Engine (v10)
 *  - Frame-rate independent exponential smoothing (60/90/120Hz buttery fluid!)
 *  - Continuous pixel-by-pixel camera glide + helical sway + pointer/gyroscope/touch response
 *  - Optimized GPU lighting (1 Directional + 1 Hemisphere + 1 Accent PointLight -> locked 60fps)
 *  - Hand-sculpted Realistic 2-Tier Patisserie Birthday Cake with Extruded 3D "1" & "9" Candles,
 *    dripping dark-gold ganache, buttercream rosettes, berries, golden pearls, flickering flames,
 *    smoke puffs, 360° turntable, close-up zoom, and 3D golden fireworks!
 * =========================================================================
 */

import * as THREE from './vendor/three.module.min.js';

function isSafeLocalTexturePath(path) {
  return typeof path === 'string' && /^\.\/assets\/[a-zA-Z0-9._/-]+$/.test(path) && !path.includes('..');
}

const ZONE_STAGES = [
  { id: 'prologue', z: 2.0, camDist: 6.4, mobileDist: 7.0, y: 0.1 },   // 0: Easel & Palette
  { id: 'childhood', z: -12.0, camDist: 6.2, mobileDist: 6.8, y: 0.1 }, // 1: Childhood Frame & Pencils
  { id: 'passion', z: -26.0, camDist: 6.2, mobileDist: 6.8, y: 0.1 },   // 2: Sacred Golden Geometry
  { id: 'thanaweya', z: -40.0, camDist: 6.6, mobileDist: 7.2, y: 0.1 }, // 3: Hourglass & Hope Lanterns
  { id: 'fine-arts', z: -55.0, camDist: 7.4, mobileDist: 8.2, y: 0.15 },// 4: Fine Arts Archway & Sculpture
  { id: 'cake', z: -71.0, camDist: 7.0, mobileDist: 6.8, y: 0.15 },     // 5: Realistic 3D Birthday Cake (1 & 9 Candles)
];

export class Atelier3DScene {
  constructor(canvas, config) {
    this.canvas = canvas;
    this.config = config;

    // Continuous scroll progress [0..1] + exact zone float [0..5]
    this.scrollProgress = 0;
    this.smoothScroll = 0;
    this.targetZoneFloat = 0;
    this.smoothZoneFloat = 0;

    // Continuous interactive pointer / gyroscope / touch spin
    this.pointer = { x: 0, y: 0 };
    this.smoothPointer = { x: 0, y: 0 };
    this.gyro = { x: 0, y: 0 };

    this.inspectMode = false;
    this.isDragging = false;
    this.dragStart = { x: 0, y: 0 };
    this.spinVelocity = 0;
    this.spinAngle = 0;
    this.orbitYTarget = 0;
    this.orbitYCurrent = 0;

    // Realistic 3D Cake Interactive States
    this.candlesLit = true;
    this.candleWind = 0;
    this.cakeTurntable = true;
    this.cakeZoom = false;
    this.cakeZoomLerp = 0;
    this.smokeTime = -1;
    this.wishBurstTime = -1;

    this.disposed = false;
    this.isHidden = false;
    this.isMobile = window.innerWidth < 940;

    // 8 Family Personas + 4 Museum Masterpiece Moods
    this.themePresets = {
      yomna:   { key: 0xffd996, rim: 0xe2ab58, fog: 0x120d09 },
      essam:   { key: 0xffd685, rim: 0x5686c0, fog: 0x0c1018 },
      heba:    { key: 0xffe4cc, rim: 0xe29884, fog: 0x160e0e },
      youssef: { key: 0xffe4b0, rim: 0x62a0d8, fog: 0x0b121c },
      islam:   { key: 0xffe2b5, rim: 0x56b8aa, fog: 0x0a1514 },
      salwa:   { key: 0xffdeb8, rim: 0xdc9466, fog: 0x16100b },
      nada:    { key: 0xffe6ce, rim: 0xb486d4, fog: 0x130e18 },
      mohamed: { key: 0xfcdea4, rim: 0x76ae7c, fog: 0x0d1410 },
    };

    this.moodOverrides = {
      rembrandt:  null,
      vangogh:    { key: 0xffd66b, rim: 0x3e74f0, fog: 0x091126 },
      louvre:     { key: 0xfff6e8, rim: 0xcfbda0, fog: 0x151310 },
      terracotta: { key: 0xffbc7e, rim: 0xd86042, fog: 0x1a0e0a },
    };

    this.activePersonaKey = 'yomna';
    this.activeMoodKey = 'rembrandt';
    this.targetTheme = this.themePresets.yomna;
    this.curKeyColor = new THREE.Color(this.targetTheme.key);
    this.curRimBase = new THREE.Color(this.targetTheme.rim);
    this.curFogBase = new THREE.Color(this.targetTheme.fog);

    // Pre-allocated scratch objects so animate() has ZERO per-frame GC allocations!
    this._tmpKey = new THREE.Color();
    this._tmpRim = new THREE.Color();
    this._tmpFog = new THREE.Color();
    this._twilightRim = new THREE.Color(0x4b78c4);
    this._twilightFog = new THREE.Color(0x0b1120);
    this._tmpScale = new THREE.Vector3();

    this.clock = new THREE.Clock();
    this.animatedObjects = [];
    this.zoneGroups = [];
    this.lanterns = [];
    this.cakeFlames = [];
    this.smokePuffs = [];
    this.goldLeafData = [];

    this.init();
  }

  init() {
    this.renderer = new THREE.WebGLRenderer({
      canvas: this.canvas,
      antialias: !this.isMobile,
      alpha: true,
      powerPreference: 'high-performance',
    });
    // Optimal pixel ratio for locked 60FPS on both phones and high-DPI laptops
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, this.isMobile ? 1.5 : 1.75));
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.24;
    this.renderer.outputColorSpace = THREE.SRGBColorSpace;

    this.scene = new THREE.Scene();
    this.scene.fog = new THREE.FogExp2(0x120d09, 0.02);

    const aspect = window.innerWidth / Math.max(1, window.innerHeight);
    this.camera = new THREE.PerspectiveCamera(aspect < 0.85 ? 56 : 45, aspect, 0.1, 150);

    this.glowTexture = this.createRadialGlowTexture();
    this.beamTexture = this.createLightBeamTexture();
    this.textureLoader = new THREE.TextureLoader();

    // Fast, crisp PBR Standard Materials (high visual luxury, zero heavy clearcoat stall)
    this.materials = {
      gold: new THREE.MeshStandardMaterial({ color: 0xf2cc72, metalness: 0.86, roughness: 0.22 }),
      goldGlow: new THREE.MeshStandardMaterial({
        color: 0xfff0bc,
        emissive: 0xdf9f34,
        emissiveIntensity: 0.72,
        metalness: 0.65,
        roughness: 0.2,
      }),
      wood: new THREE.MeshStandardMaterial({ color: 0x69422a, metalness: 0.08, roughness: 0.56 }),
      darkWood: new THREE.MeshStandardMaterial({ color: 0x3d2416, metalness: 0.06, roughness: 0.66 }),
      marble: new THREE.MeshStandardMaterial({ color: 0xf7f0e6, metalness: 0.08, roughness: 0.26 }),
      glassGold: new THREE.MeshStandardMaterial({
        color: 0xffe6a8,
        transparent: true,
        opacity: 0.4,
        roughness: 0.15,
        metalness: 0.25,
      }),
      // Realistic Patisserie Cake Materials
      cakeCream: new THREE.MeshStandardMaterial({ color: 0xfbf3e4, roughness: 0.58, metalness: 0.02 }),
      cakeFrosting: new THREE.MeshStandardMaterial({ color: 0xfff8ed, roughness: 0.45, metalness: 0.04 }),
      cakeGanache: new THREE.MeshStandardMaterial({ color: 0x3b1f14, roughness: 0.22, metalness: 0.16 }),
      strawberry: new THREE.MeshStandardMaterial({ color: 0xc22b38, roughness: 0.32, metalness: 0.08 }),
      berryLeaf: new THREE.MeshStandardMaterial({ color: 0x4b7a44, roughness: 0.55 }),
      macaronRose: new THREE.MeshStandardMaterial({ color: 0xe2988d, roughness: 0.42 }),
      macaronGold: new THREE.MeshStandardMaterial({ color: 0xe6be68, roughness: 0.35, metalness: 0.35 }),
      candleNumber: new THREE.MeshStandardMaterial({
        color: 0xfff4d9,
        emissive: 0x5c370c,
        emissiveIntensity: 0.25,
        roughness: 0.32,
        metalness: 0.22,
      }),
      candleTrim: new THREE.MeshStandardMaterial({
        color: 0xf5cd70,
        metalness: 0.85,
        roughness: 0.18,
      }),
    };

    this.setupOptimizedLights();
    this.buildGoldenDustField();
    this.buildFloatingGoldLeafFlakes();
    this.buildJourneyLightRibbon();

    this.buildZone0Prologue();
    this.buildZone1Childhood();
    this.buildZone2Passion();
    this.buildZone3Thanaweya();
    this.buildZone4FineArts();
    this.buildZone5RealisticCake();
    this.buildCelebrationBurstSystem();

    this.applyResponsiveLayout();
    this.bindEvents();
    this.animate();
  }

  /* ==================== PUBLIC INTERACTIVE CONTROLS ==================== */
  setInspectMode(enabled) {
    this.inspectMode = Boolean(enabled);
    if (!enabled) this.orbitYTarget = 0;
  }

  nudgeSpin(deltaRad) {
    this.spinVelocity += deltaRad * 1.4;
  }

  toggleCakeTurntable() {
    this.cakeTurntable = !this.cakeTurntable;
    return this.cakeTurntable;
  }

  toggleCakeZoom() {
    this.cakeZoom = !this.cakeZoom;
    return this.cakeZoom;
  }

  launchFireworks() {
    this.wishBurstTime = 0;
    const pos = this.burstPoints.geometry.attributes.position.array;
    for (let i = 0; i < this.burstVelocities.length; i++) {
      pos[i * 3] = (Math.random() - 0.5) * 1.6;
      pos[i * 3 + 1] = 0.8 + (Math.random() - 0.5) * 0.7;
      pos[i * 3 + 2] = ZONE_STAGES[5].z + (Math.random() - 0.5) * 1.2;
    }
    this.burstPoints.geometry.attributes.position.needsUpdate = true;
    this.burstPoints.material.opacity = 1;
  }

  setVisitorTheme(themeKey) {
    if (this.themePresets[themeKey]) this.activePersonaKey = themeKey;
    this.refreshTargetTheme();
  }

  setLightingMood(moodKey) {
    this.activeMoodKey = moodKey in this.moodOverrides ? moodKey : 'rembrandt';
    this.refreshTargetTheme();
  }

  refreshTargetTheme() {
    const override = this.moodOverrides[this.activeMoodKey];
    this.targetTheme = override || this.themePresets[this.activePersonaKey] || this.themePresets.yomna;
  }

  setCandleWind(level) {
    this.candleWind = Math.max(0, Math.min(1, Number(level) || 0));
  }

  setContinuousScroll(scrollNorm, zoneFloat) {
    this.scrollProgress = Math.max(0, Math.min(1, scrollNorm));
    this.targetZoneFloat = Math.max(0, Math.min(ZONE_STAGES.length - 1, zoneFloat));
  }

  /* ==================== TEXTURES & LIGHTS ==================== */
  createRadialGlowTexture() {
    const size = 96;
    const c = document.createElement('canvas');
    c.width = size;
    c.height = size;
    const ctx = c.getContext('2d');
    const g = ctx.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2);
    g.addColorStop(0, 'rgba(255, 252, 238, 1)');
    g.addColorStop(0.32, 'rgba(248, 212, 126, 0.85)');
    g.addColorStop(0.66, 'rgba(210, 148, 56, 0.22)');
    g.addColorStop(1, 'rgba(0, 0, 0, 0)');
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, size, size);
    const tex = new THREE.CanvasTexture(c);
    tex.colorSpace = THREE.SRGBColorSpace;
    return tex;
  }

  createLightBeamTexture() {
    const c = document.createElement('canvas');
    c.width = 64;
    c.height = 192;
    const ctx = c.getContext('2d');
    const g = ctx.createLinearGradient(0, 0, 0, 192);
    g.addColorStop(0, 'rgba(255, 238, 180, 0.46)');
    g.addColorStop(0.55, 'rgba(240, 194, 102, 0.14)');
    g.addColorStop(1, 'rgba(240, 194, 102, 0)');
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, 64, 192);
    const tex = new THREE.CanvasTexture(c);
    tex.colorSpace = THREE.SRGBColorSpace;
    return tex;
  }

  loadArtTexture(path) {
    const safePath = isSafeLocalTexturePath(path) ? path : './assets/art/chapter4-fine-arts.jpg';
    const tex = this.textureLoader.load(safePath);
    tex.colorSpace = THREE.SRGBColorSpace;
    return tex;
  }

  setupOptimizedLights() {
    // Lean 3-light studio rig -> 3x faster GPU shader at full 60FPS!
    this.hemiLight = new THREE.HemisphereLight(0xfff5e2, 0x2a1b11, 1.05);
    this.scene.add(this.hemiLight);

    this.dirKeyLight = new THREE.DirectionalLight(0xffd996, 2.1);
    this.dirKeyLight.position.set(4, 7, 6);
    this.scene.add(this.dirKeyLight);

    // Single dynamic accent light that follows active 3D sculpture / flickers on cake flames
    this.accentLight = new THREE.PointLight(0xe2ab58, 32, 34, 1.4);
    this.scene.add(this.accentLight);
  }

  buildGoldenDustField() {
    const count = this.isMobile ? 320 : 560;
    const positions = new Float32Array(count * 3);
    const colors = new Float32Array(count * 3);
    const palette = [
      new THREE.Color(0xfce6a8),
      new THREE.Color(0xe2b659),
      new THREE.Color(0xfff9ec),
      new THREE.Color(0xd8885e),
    ];

    for (let i = 0; i < count; i++) {
      positions[i * 3] = (Math.random() - 0.5) * (this.isMobile ? 14 : 26);
      positions[i * 3 + 1] = (Math.random() - 0.5) * 13;
      positions[i * 3 + 2] = 9 - Math.random() * 88;
      const col = palette[i % palette.length];
      colors[i * 3] = col.r;
      colors[i * 3 + 1] = col.g;
      colors[i * 3 + 2] = col.b;
    }

    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geo.setAttribute('color', new THREE.BufferAttribute(colors, 3));

    this.dustField = new THREE.Points(
      geo,
      new THREE.PointsMaterial({
        size: this.isMobile ? 0.26 : 0.22,
        map: this.glowTexture,
        vertexColors: true,
        transparent: true,
        opacity: 0.8,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
      })
    );
    this.scene.add(this.dustField);
  }

  buildFloatingGoldLeafFlakes() {
    const count = this.isMobile ? 36 : 64;
    this.goldLeafMesh = new THREE.InstancedMesh(
      new THREE.PlaneGeometry(0.14, 0.14),
      new THREE.MeshStandardMaterial({ color: 0xf5d27a, metalness: 0.9, roughness: 0.18, side: THREE.DoubleSide }),
      count
    );
    this.dummyObj = new THREE.Object3D();

    for (let i = 0; i < count; i++) {
      this.goldLeafData.push({
        x: (Math.random() - 0.5) * (this.isMobile ? 8 : 14),
        y: (Math.random() - 0.5) * 7.5,
        z: 6 - Math.random() * 82,
        rotX: Math.random() * Math.PI,
        rotY: Math.random() * Math.PI,
        rotZ: Math.random() * Math.PI,
        speed: 0.45 + Math.random() * 0.8,
        scale: 0.55 + Math.random() * 1.0,
      });
    }
    this.scene.add(this.goldLeafMesh);
  }

  buildJourneyLightRibbon() {
    const xAmp = this.isMobile ? 0.65 : 1.9;
    this.journeyCurve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(-xAmp * 0.7, -0.8, ZONE_STAGES[0].z),
      new THREE.Vector3(xAmp, -0.45, ZONE_STAGES[1].z),
      new THREE.Vector3(-xAmp, 0.2, ZONE_STAGES[2].z),
      new THREE.Vector3(xAmp * 0.8, -0.35, ZONE_STAGES[3].z),
      new THREE.Vector3(0.0, -0.15, ZONE_STAGES[4].z),
      new THREE.Vector3(0.0, -0.4, ZONE_STAGES[5].z),
    ]);

    this.ribbonMesh = new THREE.Mesh(
      new THREE.TubeGeometry(this.journeyCurve, 160, 0.035, 6, false),
      new THREE.MeshStandardMaterial({
        color: 0xf7d47c,
        emissive: 0xd19230,
        emissiveIntensity: 0.8,
        metalness: 0.8,
        roughness: 0.22,
        transparent: true,
        opacity: 0.75,
      })
    );
    this.scene.add(this.ribbonMesh);

    this.cometGroup = new THREE.Group();
    const cometCore = new THREE.Mesh(new THREE.SphereGeometry(0.14, 12, 12), new THREE.MeshBasicMaterial({ color: 0xfff6d6 }));
    const cometGlow = new THREE.Sprite(
      new THREE.SpriteMaterial({ map: this.glowTexture, color: 0xffd678, transparent: true, opacity: 0.95, blending: THREE.AdditiveBlending })
    );
    cometGlow.scale.set(1.9, 1.9, 1);
    this.cometGroup.add(cometCore, cometGlow);
    this.scene.add(this.cometGroup);
  }

  /* ==================== ZONE 0: PROLOGUE EASEL & PALETTE ==================== */
  buildZone0Prologue() {
    const stage = new THREE.Group();
    stage.position.set(0, ZONE_STAGES[0].y, ZONE_STAGES[0].z);
    const rig = new THREE.Group();

    const easel = new THREE.Group();
    const legGeo = new THREE.BoxGeometry(0.11, 4.0, 0.11);
    const leftLeg = new THREE.Mesh(legGeo, this.materials.wood);
    leftLeg.position.set(-0.68, -0.3, 0);
    leftLeg.rotation.set(-0.09, 0, -0.14);

    const rightLeg = new THREE.Mesh(legGeo, this.materials.wood);
    rightLeg.position.set(0.68, -0.3, 0);
    rightLeg.rotation.set(-0.09, 0, 0.14);

    const backLeg = new THREE.Mesh(new THREE.BoxGeometry(0.1, 3.9, 0.1), this.materials.darkWood);
    backLeg.position.set(0, -0.38, -0.98);
    backLeg.rotation.x = 0.34;

    const mast = new THREE.Mesh(new THREE.BoxGeometry(0.11, 3.5, 0.1), this.materials.darkWood);
    mast.position.set(0, 0.12, -0.15);
    mast.rotation.x = -0.09;

    const shelf = new THREE.Mesh(new THREE.BoxGeometry(2.25, 0.1, 0.25), this.materials.gold);
    shelf.position.set(0, -0.72, 0.16);
    shelf.rotation.x = -0.09;

    const artPath = this.config.chapters?.[3]?.image || './assets/art/chapter4-fine-arts.jpg';
    const framedCanvas = this.createFramedPainting(2.05, 1.54, artPath);
    framedCanvas.position.set(0, 0.2, 0.14);
    framedCanvas.rotation.x = -0.09;

    const clamp = new THREE.Mesh(new THREE.BoxGeometry(0.32, 0.12, 0.18), this.materials.goldGlow);
    clamp.position.set(0, 1.06, 0.05);

    easel.add(leftLeg, rightLeg, backLeg, mast, shelf, framedCanvas, clamp);
    rig.add(easel);

    const palette = this.createArtistPalette();
    palette.position.set(1.32, -0.45, 0.85);
    palette.rotation.set(0.45, -0.5, 0.22);
    rig.add(palette);
    this.animatedObjects.push({ mesh: palette, baseY: -0.45, speed: 1.2, amp: 0.13, rotY: 0.32 });

    const brush1 = this.createPaintbrush(0xe0844f);
    brush1.position.set(-1.32, 0.7, 0.72);
    brush1.rotation.set(0.3, 0.2, -0.62);
    rig.add(brush1);
    this.animatedObjects.push({ mesh: brush1, baseY: 0.7, speed: 1.4, amp: 0.14, rotZ: 0.18 });

    const halo1 = new THREE.Mesh(new THREE.TorusGeometry(2.2, 0.02, 12, 84), this.materials.goldGlow);
    halo1.position.set(0, 0.18, -0.25);
    halo1.rotation.set(0.35, 0.2, 0);
    rig.add(halo1);

    stage.add(rig);
    this.heroHalos = [halo1];
    this.zoneGroups.push({ stage, rig, desktopOffsetX: -2.15, mobileScale: 0.74 });
    this.scene.add(stage);
  }

  /* ==================== ZONE 1: CHILDHOOD ==================== */
  buildZone1Childhood() {
    const stage = new THREE.Group();
    stage.position.set(0, ZONE_STAGES[1].y, ZONE_STAGES[1].z);
    const rig = new THREE.Group();

    const frame = this.createFramedPainting(2.0, 1.5, this.config.chapters?.[0]?.image || './assets/art/chapter1-childhood.jpg');
    frame.rotation.y = -0.18;
    rig.add(frame);
    this.animatedObjects.push({ mesh: frame, baseY: 0, speed: 0.95, amp: 0.12 });

    const pastelColors = [0xf0c05a, 0xd97854, 0x6f98bd, 0x86ad7e, 0xe095a4, 0xe8b468];
    pastelColors.forEach((hex, idx) => {
      const pencil = new THREE.Group();
      const shaft = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.05, 1.05, 6), new THREE.MeshStandardMaterial({ color: hex, roughness: 0.42 }));
      const tip = new THREE.Mesh(new THREE.ConeGeometry(0.05, 0.2, 6), new THREE.MeshStandardMaterial({ color: 0xf0dab5, roughness: 0.65 }));
      tip.position.y = 0.62;
      pencil.add(shaft, tip);

      const angle = (idx / pastelColors.length) * Math.PI * 2;
      pencil.position.set(Math.cos(angle) * 1.6, Math.sin(angle) * 1.1, 0.55);
      pencil.rotation.set(0.35 + idx * 0.2, idx * 0.4, 0.55);
      rig.add(pencil);
      this.animatedObjects.push({ mesh: pencil, baseY: pencil.position.y, speed: 1.15 + idx * 0.14, amp: 0.14, rotY: 0.4 });
    });

    stage.add(rig);
    this.zoneGroups.push({ stage, rig, desktopOffsetX: 2.0, mobileScale: 0.78 });
    this.scene.add(stage);
  }

  /* ==================== ZONE 2: PASSION ==================== */
  buildZone2Passion() {
    const stage = new THREE.Group();
    stage.position.set(0, ZONE_STAGES[2].y, ZONE_STAGES[2].z);
    const rig = new THREE.Group();

    const icoWire = new THREE.Mesh(
      new THREE.IcosahedronGeometry(1.4, 0),
      new THREE.MeshStandardMaterial({ color: 0xf2cd74, emissive: 0x9c6e1e, emissiveIntensity: 0.35, metalness: 0.85, roughness: 0.2, wireframe: true })
    );
    const innerGem = new THREE.Mesh(new THREE.OctahedronGeometry(0.7, 0), this.materials.marble);
    const orbitRing1 = new THREE.Mesh(new THREE.TorusGeometry(1.88, 0.022, 10, 72), this.materials.goldGlow);
    orbitRing1.rotation.x = 1.12;
    rig.add(icoWire, innerGem, orbitRing1);
    this.passionSculpture = { icoWire, innerGem, orbitRing1 };

    const palette2 = this.createArtistPalette();
    palette2.position.set(1.22, -0.62, 0.9);
    palette2.rotation.set(0.35, -0.45, -0.15);
    rig.add(palette2);
    this.animatedObjects.push({ mesh: palette2, baseY: -0.62, speed: 1.1, amp: 0.14, rotY: -0.32 });

    stage.add(rig);
    this.zoneGroups.push({ stage, rig, desktopOffsetX: -2.0, mobileScale: 0.78 });
    this.scene.add(stage);
  }

  /* ==================== ZONE 3: THANAWEYA HOURGLASS & LANTERNS ==================== */
  buildZone3Thanaweya() {
    const stage = new THREE.Group();
    stage.position.set(0, ZONE_STAGES[3].y, ZONE_STAGES[3].z);
    const rig = new THREE.Group();

    const hourglass = new THREE.Group();
    const topBulb = new THREE.Mesh(new THREE.ConeGeometry(0.66, 1.0, 20), this.materials.glassGold);
    topBulb.position.y = 0.52;
    topBulb.rotation.x = Math.PI;
    const botBulb = new THREE.Mesh(new THREE.ConeGeometry(0.66, 1.0, 20), this.materials.glassGold);
    botBulb.position.y = -0.52;
    const topCap = new THREE.Mesh(new THREE.CylinderGeometry(0.8, 0.8, 0.1, 22), this.materials.goldGlow);
    topCap.position.y = 1.06;
    const botCap = topCap.clone();
    botCap.position.y = -1.06;
    const compassHalo = new THREE.Mesh(new THREE.TorusGeometry(1.7, 0.02, 10, 72), this.materials.gold);
    hourglass.add(topBulb, botBulb, topCap, botCap, compassHalo);
    rig.add(hourglass);
    this.thanaweyaHourglass = { group: hourglass, compassHalo };

    const orbGeo = new THREE.SphereGeometry(0.15, 10, 10);
    const haloMat = new THREE.SpriteMaterial({ map: this.glowTexture, color: 0xffd47e, transparent: true, opacity: 0.88, blending: THREE.AdditiveBlending });
    for (let i = 0; i < 12; i++) {
      const lantern = new THREE.Group();
      const core = new THREE.Mesh(orbGeo, this.materials.goldGlow);
      const glow = new THREE.Sprite(haloMat);
      glow.scale.set(1.15, 1.15, 1);
      lantern.add(core, glow);

      const angle = (i / 12) * Math.PI * 2;
      const rad = 1.35 + (i % 3) * 0.6;
      const x = Math.cos(angle) * rad;
      lantern.position.set(x, (Math.random() - 0.5) * 3.4, Math.sin(angle) * 1.2 - 0.3);
      lantern.scale.setScalar(0.65 + (i % 3) * 0.2);
      rig.add(lantern);
      this.lanterns.push({ mesh: lantern, baseX: x, speedY: 0.34 + (i % 3) * 0.12, phase: i * 0.8 });
    }

    stage.add(rig);
    this.zoneGroups.push({ stage, rig, desktopOffsetX: 2.0, mobileScale: 0.78 });
    this.scene.add(stage);
  }

  /* ==================== ZONE 4: FINE ARTS ARCHWAY & SCULPTURE ==================== */
  buildZone4FineArts() {
    const stage = new THREE.Group();
    stage.position.set(0, ZONE_STAGES[4].y - 0.25, ZONE_STAGES[4].z);
    const rig = new THREE.Group();

    const buildColumn = (x, h = 3.6) => {
      const col = new THREE.Group();
      const shaft = new THREE.Mesh(new THREE.CylinderGeometry(0.22, 0.25, h, 14), this.materials.marble);
      const base = new THREE.Mesh(new THREE.BoxGeometry(0.74, 0.24, 0.74), this.materials.marble);
      base.position.y = -h / 2 - 0.12;
      const cap = new THREE.Mesh(new THREE.BoxGeometry(0.74, 0.22, 0.74), this.materials.marble);
      cap.position.y = h / 2 + 0.1;
      const goldBand = new THREE.Mesh(new THREE.CylinderGeometry(0.3, 0.24, 0.12, 16), this.materials.goldGlow);
      goldBand.position.y = h / 2 - 0.05;
      col.add(shaft, base, cap, goldBand);
      col.position.set(x, -0.1, 0);
      return col;
    };

    rig.add(buildColumn(-1.8), buildColumn(1.8));
    const archCurve = new THREE.Mesh(new THREE.TorusGeometry(1.8, 0.16, 12, 48, Math.PI), this.materials.marble);
    archCurve.position.set(0, 1.72, 0);
    const archGoldTrim = new THREE.Mesh(new THREE.TorusGeometry(1.64, 0.045, 10, 48, Math.PI), this.materials.goldGlow);
    archGoldTrim.position.set(0, 1.72, 0.08);
    rig.add(archCurve, archGoldTrim);

    const beamMat = new THREE.MeshBasicMaterial({ map: this.beamTexture, transparent: true, opacity: 0.45, blending: THREE.AdditiveBlending, side: THREE.DoubleSide, depthWrite: false });
    const beam = new THREE.Mesh(new THREE.PlaneGeometry(2.6, 5.2), beamMat);
    beam.position.set(0, 0.55, -0.4);
    rig.add(beam);

    const sculpture = new THREE.Mesh(new THREE.TorusKnotGeometry(0.6, 0.17, 72, 14, 2, 3), this.materials.marble);
    sculpture.position.y = 0.12;
    const goldCrown = new THREE.Mesh(new THREE.TorusGeometry(1.15, 0.022, 10, 64), this.materials.goldGlow);
    goldCrown.position.y = 0.12;
    rig.add(sculpture, goldCrown);
    this.fineArtsSculpture = { sculpture, goldCrown };

    stage.add(rig);
    this.zoneGroups.push({ stage, rig, desktopOffsetX: -2.1, mobileScale: 0.76 });
    this.scene.add(stage);
  }

  /* ==================== ZONE 5: REALISTIC 3D 2-TIER BIRTHDAY CAKE WITH "1" & "9" CANDLES ==================== */
  createExtrudedDigit1() {
    const s = new THREE.Shape();
    // Classic bold luxury numeral "1" with angled flag + base serif
    s.moveTo(-0.22, 0);
    s.lineTo(0.24, 0);
    s.lineTo(0.24, 0.13);
    s.lineTo(0.09, 0.13);
    s.lineTo(0.09, 0.92);
    s.lineTo(-0.07, 0.92);
    s.lineTo(-0.26, 0.71);
    s.lineTo(-0.17, 0.61);
    s.lineTo(-0.06, 0.73);
    s.lineTo(-0.06, 0.13);
    s.lineTo(-0.22, 0.13);
    s.closePath();

    const geo = new THREE.ExtrudeGeometry(s, {
      depth: 0.11,
      bevelEnabled: true,
      bevelThickness: 0.024,
      bevelSize: 0.02,
      bevelSegments: 3,
    });
    geo.translate(0, 0, -0.055);
    return geo;
  }

  createExtrudedDigit9() {
    const s = new THREE.Shape();
    // Clean, unmistakable bold numeral "9" with rounded upper bowl + curved tail
    s.moveTo(-0.18, 0.02);
    s.quadraticCurveTo(0.18, 0.0, 0.28, 0.28);
    s.quadraticCurveTo(0.34, 0.56, 0.25, 0.76);
    s.quadraticCurveTo(0.14, 0.95, -0.04, 0.94);
    s.quadraticCurveTo(-0.28, 0.93, -0.31, 0.66);
    s.quadraticCurveTo(-0.33, 0.4, -0.06, 0.37);
    s.quadraticCurveTo(0.08, 0.36, 0.15, 0.44);
    s.quadraticCurveTo(0.13, 0.18, -0.14, 0.15);
    s.lineTo(-0.22, 0.15);
    s.closePath();

    // Inner counter cutout hole of the "9" loop!
    const hole = new THREE.Path();
    hole.absellipse(-0.02, 0.65, 0.125, 0.145, 0, Math.PI * 2, true, 0);
    s.holes.push(hole);

    const geo = new THREE.ExtrudeGeometry(s, {
      depth: 0.11,
      bevelEnabled: true,
      bevelThickness: 0.024,
      bevelSize: 0.02,
      bevelSegments: 3,
    });
    geo.translate(0, 0, -0.055);
    return geo;
  }

  createCandleFlameUnit(x, y, z) {
    const holder = new THREE.Group();
    holder.position.set(x, y, z);

    // Dark burned wick
    const wick = new THREE.Mesh(
      new THREE.CylinderGeometry(0.012, 0.014, 0.11, 8),
      new THREE.MeshStandardMaterial({ color: 0x1a1410, roughness: 0.9 })
    );
    wick.position.y = 0.04;
    holder.add(wick);

    // Multi-layer Realistic Flame (amber outer teardrop + bright white-gold inner core + halo glow)
    const flameGroup = new THREE.Group();
    flameGroup.position.y = 0.14;

    const outerFlame = new THREE.Mesh(
      new THREE.ConeGeometry(0.065, 0.28, 12),
      new THREE.MeshBasicMaterial({ color: 0xffa834, transparent: true, opacity: 0.92 })
    );
    outerFlame.position.y = 0.06;

    const innerFlame = new THREE.Mesh(
      new THREE.ConeGeometry(0.034, 0.16, 10),
      new THREE.MeshBasicMaterial({ color: 0xfff8dc })
    );
    innerFlame.position.y = 0.03;

    const flameGlow = new THREE.Sprite(
      new THREE.SpriteMaterial({
        map: this.glowTexture,
        color: 0xffc858,
        transparent: true,
        opacity: 0.96,
        blending: THREE.AdditiveBlending,
      })
    );
    flameGlow.scale.set(1.15, 1.15, 1);
    flameGlow.position.y = 0.08;

    flameGroup.add(outerFlame, innerFlame, flameGlow);
    holder.add(flameGroup);

    // Subtle rising smoke puff mesh (appears right when blown out!)
    const smokeMat = new THREE.SpriteMaterial({
      map: this.glowTexture,
      color: 0xcfc7be,
      transparent: true,
      opacity: 0,
    });
    const smoke = new THREE.Sprite(smokeMat);
    smoke.scale.set(0.45, 0.45, 1);
    smoke.position.y = 0.15;
    holder.add(smoke);

    this.cakeFlames.push({ group: flameGroup, glow: flameGlow, phase: x * 4 + 1.2 });
    this.smokePuffs.push({ sprite: smoke, baseY: 0.15 });
    return holder;
  }

  buildZone5RealisticCake() {
    const stage = new THREE.Group();
    stage.position.set(0, ZONE_STAGES[5].y, ZONE_STAGES[5].z);
    const rig = new THREE.Group();

    const cake = new THREE.Group();
    cake.position.y = -0.35;

    // 1. Luxury Marble & Antique-Gold Pedestal Cake Stand
    const foot = new THREE.Mesh(new THREE.CylinderGeometry(0.55, 0.85, 0.16, 32), this.materials.gold);
    foot.position.y = -1.28;
    const stem = new THREE.Mesh(new THREE.CylinderGeometry(0.18, 0.28, 0.48, 24), this.materials.marble);
    stem.position.y = -0.98;
    const platter = new THREE.Mesh(new THREE.CylinderGeometry(1.88, 1.72, 0.12, 42), this.materials.marble);
    platter.position.y = -0.7;
    const platterGoldRim = new THREE.Mesh(new THREE.TorusGeometry(1.86, 0.036, 10, 48), this.materials.goldGlow);
    platterGoldRim.rotation.x = Math.PI / 2;
    platterGoldRim.position.y = -0.66;
    cake.add(foot, stem, platter, platterGoldRim);

    // 2. Bottom Patisserie Tier (Cream Sponge + Glossy Dark Chocolate Drip Glaze + Piped Rosettes)
    const tier1 = new THREE.Mesh(new THREE.CylinderGeometry(1.48, 1.5, 0.88, 42), this.materials.cakeCream);
    tier1.position.y = -0.2;
    const tier1GoldRibbon = new THREE.Mesh(new THREE.CylinderGeometry(1.508, 1.512, 0.08, 42), this.materials.gold);
    tier1GoldRibbon.position.y = -0.58;
    const tier1GlazeTop = new THREE.Mesh(new THREE.CylinderGeometry(1.5, 1.5, 0.07, 42), this.materials.cakeGanache);
    tier1GlazeTop.position.y = 0.23;
    cake.add(tier1, tier1GoldRibbon, tier1GlazeTop);

    // Sculpted Realistic Ganache Drips cascading down Bottom Tier
    const dripGeo = new THREE.CapsuleGeometry(0.055, 0.26, 6, 10);
    for (let i = 0; i < 20; i++) {
      const a = (i / 20) * Math.PI * 2;
      const dripLen = 0.7 + ((i * 7) % 5) * 0.22;
      const drip = new THREE.Mesh(dripGeo, this.materials.cakeGanache);
      drip.scale.set(1, dripLen, 1);
      drip.position.set(Math.cos(a) * 1.485, 0.15 - dripLen * 0.13, Math.sin(a) * 1.485);
      cake.add(drip);
    }

    // Piped Buttercream Rosette Pearls around Tier 1 Base
    const pearlGeo = new THREE.SphereGeometry(0.085, 12, 10);
    const goldBeadGeo = new THREE.SphereGeometry(0.042, 10, 8);
    for (let i = 0; i < 24; i++) {
      const a = (i / 24) * Math.PI * 2;
      const rosette = new THREE.Mesh(pearlGeo, this.materials.cakeFrosting);
      rosette.scale.set(1.15, 0.78, 1.15);
      rosette.position.set(Math.cos(a) * 1.54, -0.59, Math.sin(a) * 1.54);
      cake.add(rosette);
    }

    // Fresh Sculpted Realistic Plump Strawberries & Pastel Macarons decorating Tier 1 Rim
    const berryGeo = new THREE.SphereGeometry(0.125, 14, 12);
    const macaronGeo = new THREE.CylinderGeometry(0.15, 0.15, 0.11, 18);
    for (let i = 0; i < 8; i++) {
      const a = (i / 8) * Math.PI * 2 + 0.2;
      if (i % 2 === 0) {
        const berry = new THREE.Group();
        const fruit = new THREE.Mesh(berryGeo, this.materials.strawberry);
        fruit.scale.set(1.0, 1.28, 1.0);
        const leaf = new THREE.Mesh(new THREE.CylinderGeometry(0.11, 0.02, 0.045, 7), this.materials.berryLeaf);
        leaf.position.y = 0.14;
        berry.add(fruit, leaf);
        berry.position.set(Math.cos(a) * 1.24, 0.36, Math.sin(a) * 1.24);
        berry.rotation.z = 0.2;
        cake.add(berry);
      } else {
        const mac = new THREE.Mesh(macaronGeo, i % 4 === 1 ? this.materials.macaronRose : this.materials.macaronGold);
        mac.position.set(Math.cos(a) * 1.24, 0.34, Math.sin(a) * 1.24);
        mac.rotation.set(0.3, a, 0.2);
        cake.add(mac);
      }
    }

    // 3. Upper Patisserie Tier (Elevated Ivory Buttercream + Gold Leaf Band + Glaze Drips)
    const tier2 = new THREE.Mesh(new THREE.CylinderGeometry(0.96, 0.98, 0.74, 38), this.materials.cakeCream);
    tier2.position.y = 0.63;
    const tier2GoldRibbon = new THREE.Mesh(new THREE.CylinderGeometry(0.99, 0.995, 0.075, 38), this.materials.goldGlow);
    tier2GoldRibbon.position.y = 0.31;
    const tier2GlazeTop = new THREE.Mesh(new THREE.CylinderGeometry(0.975, 0.975, 0.06, 38), this.materials.cakeGanache);
    tier2GlazeTop.position.y = 1.0;
    cake.add(tier2, tier2GoldRibbon, tier2GlazeTop);

    for (let i = 0; i < 14; i++) {
      const a = (i / 14) * Math.PI * 2;
      const dLen = 0.62 + ((i * 5) % 4) * 0.2;
      const drip = new THREE.Mesh(dripGeo, this.materials.cakeGanache);
      drip.scale.set(0.85, dLen, 0.85);
      drip.position.set(Math.cos(a) * 0.965, 0.93 - dLen * 0.12, Math.sin(a) * 0.965);
      cake.add(drip);

      const bead = new THREE.Mesh(goldBeadGeo, this.materials.goldGlow);
      bead.position.set(Math.cos(a) * 0.84, 1.05, Math.sin(a) * 0.84);
      cake.add(bead);
    }

    // 4. SCULPTED 3D NUMBER CANDLES: "1" (Left) AND "9" (Right) ON TOP OF CAKE!
    const pickGeo = new THREE.CylinderGeometry(0.025, 0.025, 0.22, 10);

    // Candle "1"
    const candle1Group = new THREE.Group();
    candle1Group.position.set(-0.34, 1.12, 0.02);
    const pick1 = new THREE.Mesh(pickGeo, this.materials.gold);
    pick1.position.y = -0.06;
    const digit1Mesh = new THREE.Mesh(this.createExtrudedDigit1(), this.materials.candleNumber);
    const digit1GoldOutline = new THREE.Mesh(this.createExtrudedDigit1(), this.materials.candleTrim);
    digit1GoldOutline.scale.set(1.06, 1.04, 0.72);
    digit1GoldOutline.position.z = -0.02;
    candle1Group.add(pick1, digit1Mesh, digit1GoldOutline);
    candle1Group.add(this.createCandleFlameUnit(0.02, 0.94, 0));
    cake.add(candle1Group);

    // Candle "9"
    const candle9Group = new THREE.Group();
    candle9Group.position.set(0.34, 1.12, 0.02);
    const pick9 = new THREE.Mesh(pickGeo, this.materials.gold);
    pick9.position.y = -0.06;
    const digit9Mesh = new THREE.Mesh(this.createExtrudedDigit9(), this.materials.candleNumber);
    const digit9GoldOutline = new THREE.Mesh(this.createExtrudedDigit9(), this.materials.candleTrim);
    digit9GoldOutline.scale.set(1.06, 1.04, 0.72);
    digit9GoldOutline.position.z = -0.02;
    candle9Group.add(pick9, digit9Mesh, digit9GoldOutline);
    candle9Group.add(this.createCandleFlameUnit(-0.02, 0.95, 0));
    cake.add(candle9Group);

    // Delicate Floating Golden Aura Ring cradling the Cake
    const cakeAuraRing = new THREE.Mesh(new THREE.TorusGeometry(2.25, 0.018, 10, 84), this.materials.goldGlow);
    cakeAuraRing.rotation.x = Math.PI / 2 - 0.16;
    cakeAuraRing.position.y = -0.7;
    cake.add(cakeAuraRing);

    rig.add(cake);
    stage.add(rig);

    this.cakeRig = rig;
    this.cakeAuraRing = cakeAuraRing;
    this.zoneGroups.push({ stage, rig, desktopOffsetX: 0, mobileScale: 0.84 });
    this.scene.add(stage);
  }

  buildCelebrationBurstSystem() {
    const count = this.isMobile ? 220 : 360;
    const positions = new Float32Array(count * 3);
    const colors = new Float32Array(count * 3);
    this.burstVelocities = [];

    const palette = [
      new THREE.Color(0xffeaa8),
      new THREE.Color(0xf4c058),
      new THREE.Color(0xffffff),
      new THREE.Color(0xdc7e56),
      new THREE.Color(0x9ec098),
    ];

    for (let i = 0; i < count; i++) {
      positions[i * 3] = 0;
      positions[i * 3 + 1] = 0.8;
      positions[i * 3 + 2] = ZONE_STAGES[5].z;
      const c = palette[i % palette.length];
      colors[i * 3] = c.r;
      colors[i * 3 + 1] = c.g;
      colors[i * 3 + 2] = c.b;

      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);
      const speed = 2.5 + Math.random() * 5.2;
      this.burstVelocities.push({
        x: Math.sin(phi) * Math.cos(theta) * speed,
        y: Math.abs(Math.cos(phi)) * speed * 0.95 + 1.4,
        z: Math.sin(phi) * Math.sin(theta) * speed,
      });
    }

    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geo.setAttribute('color', new THREE.BufferAttribute(colors, 3));

    this.burstPoints = new THREE.Points(
      geo,
      new THREE.PointsMaterial({
        size: 0.36,
        map: this.glowTexture,
        vertexColors: true,
        transparent: true,
        opacity: 0,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
      })
    );
    this.scene.add(this.burstPoints);
  }

  createFramedPainting(width, height, imagePath) {
    const frameGroup = new THREE.Group();
    const border = 0.1;
    const depth = 0.08;

    const topBar = new THREE.Mesh(new THREE.BoxGeometry(width + border * 2, border, depth), this.materials.gold);
    topBar.position.y = height / 2 + border / 2;
    const botBar = topBar.clone();
    botBar.position.y = -(height / 2 + border / 2);
    const leftBar = new THREE.Mesh(new THREE.BoxGeometry(border, height, depth), this.materials.gold);
    leftBar.position.x = -(width / 2 + border / 2);
    const rightBar = leftBar.clone();
    rightBar.position.x = width / 2 + border / 2;

    const back = new THREE.Mesh(new THREE.BoxGeometry(width + border, height + border, 0.025), this.materials.darkWood);
    back.position.z = -0.025;

    const painting = new THREE.Mesh(
      new THREE.PlaneGeometry(width, height),
      new THREE.MeshStandardMaterial({ map: this.loadArtTexture(imagePath), roughness: 0.56, metalness: 0.04 })
    );
    painting.position.z = 0.01;

    frameGroup.add(topBar, botBar, leftBar, rightBar, back, painting);
    return frameGroup;
  }

  createArtistPalette() {
    const group = new THREE.Group();
    const shape = new THREE.Shape();
    shape.moveTo(0, -0.62);
    shape.bezierCurveTo(0.85, -0.7, 1.05, 0.25, 0.58, 0.68);
    shape.bezierCurveTo(0.18, 1.02, -0.78, 0.85, -0.92, 0.22);
    shape.bezierCurveTo(-1.02, -0.25, -0.52, -0.4, -0.26, -0.24);
    shape.bezierCurveTo(-0.1, -0.14, -0.18, -0.58, 0, -0.62);

    const hole = new THREE.Path();
    hole.absellipse(-0.42, -0.02, 0.14, 0.17, 0, Math.PI * 2, true, 0);
    shape.holes.push(hole);

    const extrude = new THREE.ExtrudeGeometry(shape, { depth: 0.055, bevelEnabled: true, bevelThickness: 0.02, bevelSize: 0.02, bevelSegments: 2 });
    extrude.center();
    group.add(new THREE.Mesh(extrude, this.materials.wood));

    const paints = [
      { color: 0xd87048, x: -0.52, y: 0.44 },
      { color: 0xf0c252, x: -0.1, y: 0.62 },
      { color: 0x4270a3, x: 0.36, y: 0.48 },
      { color: 0x74986e, x: 0.62, y: 0.12 },
      { color: 0xc2485a, x: 0.52, y: -0.28 },
      { color: 0xfaf3e6, x: 0.14, y: -0.44 },
    ];
    const dabGeo = new THREE.SphereGeometry(0.12, 12, 10);
    paints.forEach((p) => {
      const dab = new THREE.Mesh(dabGeo, new THREE.MeshStandardMaterial({ color: p.color, roughness: 0.22, metalness: 0.12 }));
      dab.scale.set(1.15, 0.88, 0.45);
      dab.position.set(p.x, p.y, 0.055);
      group.add(dab);
    });
    group.scale.setScalar(0.75);
    return group;
  }

  createPaintbrush(tipColor) {
    const brush = new THREE.Group();
    const handle = new THREE.Mesh(new THREE.CylinderGeometry(0.018, 0.036, 1.32, 10), this.materials.darkWood);
    handle.position.y = -0.35;
    const ferrule = new THREE.Mesh(new THREE.CylinderGeometry(0.038, 0.035, 0.22, 12), this.materials.gold);
    ferrule.position.y = 0.42;
    const bristles = new THREE.Mesh(new THREE.ConeGeometry(0.044, 0.26, 12), new THREE.MeshStandardMaterial({ color: tipColor, roughness: 0.48 }));
    bristles.position.y = 0.65;
    brush.add(handle, ferrule, bristles);
    return brush;
  }

  applyResponsiveLayout() {
    const w = window.innerWidth;
    const h = Math.max(1, window.innerHeight);
    const aspect = w / h;
    this.isMobile = w < 940;
    const isPortrait = aspect < 0.9;

    this.camera.aspect = aspect;
    this.camera.fov = isPortrait ? 56 : aspect < 1.15 ? 50 : 45;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(w, h);

    for (const zEntry of this.zoneGroups) {
      if (this.isMobile) {
        zEntry.stage.position.x = 0;
        zEntry.rig.scale.setScalar(isPortrait ? zEntry.mobileScale : 0.88);
      } else {
        zEntry.stage.position.x = zEntry.desktopOffsetX;
        zEntry.rig.scale.setScalar(1);
      }
    }
  }

  triggerWishCelebration(blowOut = true) {
    this.candlesLit = !blowOut;
    this.candleWind = 0;
    if (blowOut) {
      this.smokeTime = 0;
      this.launchFireworks();
    } else {
      this.smokeTime = -1;
    }
  }

  bindEvents() {
    window.addEventListener('resize', () => this.applyResponsiveLayout(), { passive: true });
    window.addEventListener(
      'pointermove',
      (e) => {
        if (e.pointerType === 'mouse' || this.inspectMode) {
          this.pointer.x = (e.clientX / window.innerWidth) * 2 - 1;
          this.pointer.y = -(e.clientY / window.innerHeight) * 2 + 1;
        }
        if (this.isDragging) {
          const dx = (e.clientX - this.dragStart.x) / window.innerWidth;
          const dy = (e.clientY - this.dragStart.y) / window.innerHeight;
          this.dragStart.x = e.clientX;
          this.dragStart.y = e.clientY;
          this.spinVelocity += dx * 6.5;
          if (this.inspectMode || e.pointerType === 'mouse') {
            this.orbitYTarget = Math.max(-1.0, Math.min(1.0, this.orbitYTarget - dy * 2.4));
          }
        }
      },
      { passive: true }
    );

    // Subtle real-time mobile phone tilt parallax (Gyroscope!)
    window.addEventListener(
      'deviceorientation',
      (e) => {
        if (e.gamma !== null && e.beta !== null) {
          this.gyro.x = Math.max(-1, Math.min(1, e.gamma / 30));
          this.gyro.y = Math.max(-1, Math.min(1, (e.beta - 45) / 35));
        }
      },
      { passive: true }
    );

    this.canvas.addEventListener('pointerdown', (e) => {
      if (e.pointerType === 'touch' && !this.inspectMode) return;
      this.isDragging = true;
      this.dragStart.x = e.clientX;
      this.dragStart.y = e.clientY;
    });

    const endDrag = () => {
      this.isDragging = false;
      this.orbitYTarget = 0;
    };
    window.addEventListener('pointerup', endDrag);
    window.addEventListener('pointercancel', endDrag);

    document.addEventListener('visibilitychange', () => {
      this.isHidden = document.hidden;
    });
  }

  animate() {
    if (this.disposed) return;
    requestAnimationFrame(() => this.animate());
    if (this.isHidden) return;

    const dt = Math.min(this.clock.getDelta(), 0.05);
    const t = this.clock.getElapsedTime();

    // Frame-rate independent silky exponential smoothing (locked fluid feel at 60/90/120Hz!)
    const dampFast = 1 - Math.exp(-9.5 * dt);
    const dampMed = 1 - Math.exp(-6.5 * dt);

    this.smoothScroll += (this.scrollProgress - this.smoothScroll) * dampFast;
    this.smoothZoneFloat += (this.targetZoneFloat - this.smoothZoneFloat) * dampFast;

    const inputX = this.isMobile ? this.gyro.x * 0.85 + this.pointer.x * 0.4 : this.pointer.x;
    const inputY = this.isMobile ? this.gyro.y * 0.6 + this.pointer.y * 0.35 : this.pointer.y;
    this.smoothPointer.x += (inputX - this.smoothPointer.x) * dampMed;
    this.smoothPointer.y += (inputY - this.smoothPointer.y) * dampMed;

    // Inertia-based smooth 3D spin!
    this.spinAngle += this.spinVelocity * dt * 2.2;
    this.spinVelocity *= Math.exp(-4.5 * dt);
    this.orbitYCurrent += (this.orbitYTarget - this.orbitYCurrent) * dampMed;

    // Continuous smooth camera glide along the 6 3D Stages (moves on EVERY single scroll pixel!)
    const idxLow = Math.max(0, Math.min(ZONE_STAGES.length - 1, Math.floor(this.smoothZoneFloat)));
    const idxHigh = Math.max(0, Math.min(ZONE_STAGES.length - 1, idxLow + 1));
    const frac = this.smoothZoneFloat - idxLow;
    const sA = ZONE_STAGES[idxLow];
    const sB = ZONE_STAGES[idxHigh];

    const stageZ = THREE.MathUtils.lerp(sA.z, sB.z, frac);
    const stageY = THREE.MathUtils.lerp(sA.y, sB.y, frac);

    // Cake Close-Up Zoom interpolation when user toggles "تقريب على شمعتي 19"
    const nearCake = Math.max(0, 1 - Math.abs(this.smoothZoneFloat - 5));
    const desiredZoom = this.cakeZoom && nearCake > 0.4 ? 1 : 0;
    this.cakeZoomLerp += (desiredZoom - this.cakeZoomLerp) * dampMed;

    const baseDist = THREE.MathUtils.lerp(
      this.isMobile ? sA.mobileDist : sA.camDist,
      this.isMobile ? sB.mobileDist : sB.camDist,
      frac
    );
    const dist = baseDist - this.cakeZoomLerp * 2.55;

    // Continuous helical scroll motion so EVERY scroll pixel visibly orbits/glides the 3D scene!
    const scrollHelixX = Math.sin(this.smoothScroll * Math.PI * 5.0) * (this.isMobile ? 0.45 : 0.85);
    const scrollHelixY = Math.cos(this.smoothScroll * Math.PI * 4.0) * 0.16;

    const camX = scrollHelixX + this.smoothPointer.x * 0.72;
    const camY =
      stageY +
      scrollHelixY +
      (this.isMobile && !this.inspectMode ? 0.25 : 0.34) +
      this.cakeZoomLerp * 0.42 +
      this.smoothPointer.y * 0.36 +
      this.orbitYCurrent;
    const camZ = stageZ + dist;

    this.camera.position.set(camX, camY, camZ);

    // Frame the 3D Cake cleanly inside the unobstructed upper showcase window on BOTH desktop & mobile!
    let verticalFocusShift = 0.05;
    if (!this.inspectMode) {
      if (this.isMobile) {
        verticalFocusShift = -0.68 - 0.32 * nearCake * (1 - this.cakeZoomLerp * 0.65);
      } else {
        verticalFocusShift = 0.05 - 0.36 * nearCake * (1 - this.cakeZoomLerp * 0.65);
      }
    }
    this.camera.lookAt(
      this.smoothPointer.x * 0.22,
      stageY + verticalFocusShift + this.cakeZoomLerp * 0.58 + this.smoothPointer.y * 0.18,
      stageZ
    );

    // Continuous scroll-linked rotation on every 3D sculpture!
    // For the Realistic Birthday Cake: smooth luxury showcase oscillation (±26°) when turntable is active
    // so sculpted "1" & "9" candles ALWAYS face forward cleanly as "19" (never backwards!), while still
    // letting users freely drag 360° whenever they wish!
    const scrollRot = this.smoothScroll * Math.PI * 2.4;
    for (let i = 0; i < this.zoneGroups.length; i++) {
      const zg = this.zoneGroups[i];
      if (zg.rig === this.cakeRig) {
        const baseShowcase = this.cakeTurntable ? Math.sin(t * 0.62) * 0.42 : 0;
        zg.rig.rotation.y = baseShowcase + this.spinAngle + this.smoothPointer.x * 0.28;
      } else {
        zg.rig.rotation.y = Math.sin(t * 0.55 + i) * 0.14 + scrollRot * 0.28 + this.spinAngle + this.smoothPointer.x * 0.26;
      }
    }

    if (this.journeyCurve && this.cometGroup) {
      const cometT = Math.min(0.995, Math.max(0.005, this.smoothScroll));
      this.cometGroup.position.copy(this.journeyCurve.getPointAt(cometT));
      this.cometGroup.scale.setScalar(1.0 + Math.sin(t * 5.2) * 0.16);
    }

    // Smooth Dynamic Mood Lighting (zero per-frame heap allocations!)
    this.accentLight.position.set(camX + 2.0, stageY + 2.2, stageZ + 2.8);
    const twilightFactor = Math.exp(-Math.pow(this.smoothZoneFloat - 3.0, 2) / 0.55);

    this._tmpKey.setHex(this.targetTheme.key);
    this._tmpRim.setHex(this.targetTheme.rim);
    this._tmpFog.setHex(this.targetTheme.fog);

    this.curKeyColor.lerp(this._tmpKey, dampMed);
    this.curRimBase.lerp(this._tmpRim, dampMed);
    this.curFogBase.lerp(this._tmpFog, dampMed);

    this.dirKeyLight.color.copy(this.curKeyColor);
    this.accentLight.color.copy(this.curRimBase).lerp(this._twilightRim, twilightFactor * 0.6);
    if (nearCake > 0.5 && this.candlesLit) {
      this.accentLight.intensity = 34 + Math.sin(t * 11) * 4.5;
    } else {
      this.accentLight.intensity = 28;
    }
    this.scene.fog.color.copy(this.curFogBase).lerp(this._twilightFog, twilightFactor * 0.55);

    // Animate gold leaf flakes
    if (this.goldLeafMesh) {
      for (let i = 0; i < this.goldLeafData.length; i++) {
        const d = this.goldLeafData[i];
        this.dummyObj.position.set(d.x + Math.sin(t * d.speed + i) * 0.24, d.y + Math.cos(t * d.speed * 0.7 + i) * 0.2, d.z);
        this.dummyObj.rotation.set(d.rotX + t * d.speed * 0.65, d.rotY + t * d.speed * 0.5, d.rotZ + t * d.speed * 0.3);
        this.dummyObj.scale.setScalar(d.scale);
        this.dummyObj.updateMatrix();
        this.goldLeafMesh.setMatrixAt(i, this.dummyObj.matrix);
      }
      this.goldLeafMesh.instanceMatrix.needsUpdate = true;
    }

    if (this.heroHalos) this.heroHalos[0].rotation.z = t * 0.22;

    for (const obj of this.animatedObjects) {
      obj.mesh.position.y = obj.baseY + Math.sin(t * obj.speed) * obj.amp;
      if (obj.rotY) obj.mesh.rotation.y += obj.rotY * dt;
      if (obj.rotZ) obj.mesh.rotation.z += Math.sin(t * 0.8) * obj.rotZ * dt;
    }

    if (this.passionSculpture) {
      this.passionSculpture.icoWire.rotation.y = t * 0.32;
      this.passionSculpture.innerGem.rotation.y = -t * 0.48;
      this.passionSculpture.orbitRing1.rotation.z = t * 0.34;
    }

    if (this.thanaweyaHourglass) {
      this.thanaweyaHourglass.group.rotation.y = t * 0.28;
      this.thanaweyaHourglass.compassHalo.rotation.x = 0.8 + Math.sin(t * 0.45) * 0.35;
    }

    for (const l of this.lanterns) {
      l.mesh.position.y += l.speedY * dt;
      l.mesh.position.x = l.baseX + Math.sin(t * 0.85 + l.phase) * 0.16;
      if (l.mesh.position.y > 2.2) l.mesh.position.y = -2.0;
    }

    if (this.fineArtsSculpture) {
      this.fineArtsSculpture.sculpture.rotation.y = t * 0.34;
      this.fineArtsSculpture.goldCrown.rotation.y = -t * 0.38;
      this.fineArtsSculpture.goldCrown.rotation.x = 0.6 + Math.sin(t * 0.45) * 0.28;
    }

    // Realistic "1" & "9" Candle Flames + Wind Physics + Rising Smoke Puffs!
    if (this.cakeAuraRing) this.cakeAuraRing.rotation.z = t * 0.25;
    const windJitter = this.candleWind * 0.55;
    for (let i = 0; i < this.cakeFlames.length; i++) {
      const f = this.cakeFlames[i];
      const fSpeed = 11 + this.candleWind * 30;
      const targetScale = this.candlesLit
        ? Math.max(0.22, 0.96 - this.candleWind * 0.35 + Math.sin(t * fSpeed + f.phase) * (0.14 + windJitter * 0.6))
        : 0.001;
      this._tmpScale.set(targetScale, targetScale * 1.06, targetScale);
      f.group.scale.lerp(this._tmpScale, dampFast);
      f.group.rotation.z = this.candlesLit ? Math.sin(t * 24 + i * 2) * (0.06 + windJitter) : 0;
      f.glow.material.opacity = THREE.MathUtils.lerp(
        f.glow.material.opacity,
        this.candlesLit ? 0.92 + Math.sin(t * 8 + f.phase) * 0.08 : 0,
        dampFast
      );
    }

    // Wispy Smoke Puffs ascending after blowing out "1" & "9" candles
    if (this.smokeTime >= 0) {
      this.smokeTime += dt;
      for (const sp of this.smokePuffs) {
        sp.sprite.position.y = sp.baseY + this.smokeTime * 0.65;
        sp.sprite.position.x = Math.sin(this.smokeTime * 3.2) * 0.08;
        const s = 0.4 + this.smokeTime * 0.55;
        sp.sprite.scale.set(s, s, 1);
        sp.sprite.material.opacity = Math.max(0, 0.55 - this.smokeTime * 0.24);
      }
      if (this.smokeTime > 2.6) {
        this.smokeTime = -1;
        for (const sp of this.smokePuffs) sp.sprite.material.opacity = 0;
      }
    }

    // Golden Firework / Confetti Burst Physics
    if (this.wishBurstTime >= 0) {
      this.wishBurstTime += dt;
      const pos = this.burstPoints.geometry.attributes.position.array;
      for (let i = 0; i < this.burstVelocities.length; i++) {
        const v = this.burstVelocities[i];
        pos[i * 3] += v.x * dt * 0.68;
        pos[i * 3 + 1] += (v.y - this.wishBurstTime * 1.15) * dt * 0.68;
        pos[i * 3 + 2] += v.z * dt * 0.68;
      }
      this.burstPoints.geometry.attributes.position.needsUpdate = true;
      this.burstPoints.material.opacity = Math.max(0, 1 - this.wishBurstTime / 4.6);
      if (this.wishBurstTime > 4.8) this.wishBurstTime = -1;
    }

    if (this.dustField) this.dustField.position.y = Math.sin(t * 0.22) * 0.2;

    this.renderer.render(this.scene, this.camera);
  }
}
