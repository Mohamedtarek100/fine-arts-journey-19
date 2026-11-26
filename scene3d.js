/**
 * =========================================================================
 *  Three.js Ultra 3D Fine Arts Atelier Engine (v9 — Section-Locked & Mobile-Stage)
 *  - Exact Zone Waypoint Camera Locking (3D sculpture ALWAYS matches active story Act!)
 *  - Dedicated Mobile Upper-Stage Framing (3D renders cleanly ABOVE story cards, never covered!)
 *  - Horizontal Touch Spin (`pan-y` friendly) + Desktop Drag Orbit
 *  - 4 Museum Masterpiece Lighting Moods + 8 Family Persona Auras
 *  - Real-Time Microphone Wind Physics on the 19 Birthday Candles
 * =========================================================================
 */

import * as THREE from './vendor/three.module.min.js';

function isSafeLocalTexturePath(path) {
  return typeof path === 'string' && /^\.\/assets\/[a-zA-Z0-9._/-]+$/.test(path) && !path.includes('..');
}

// Exact Z coordinates of our 6 sculpted 3D Diorama Stages
const ZONE_STAGES = [
  { id: 'prologue', z: 1.5, camDist: 6.8, mobileDist: 7.4, y: 0.15 },   // 0: Easel, Palette & Brushes
  { id: 'childhood', z: -13.0, camDist: 6.6, mobileDist: 7.2, y: 0.1 }, // 1: Childhood Frame, Pencils & Origami Stars
  { id: 'passion', z: -27.0, camDist: 6.6, mobileDist: 7.2, y: 0.15 },  // 2: Sacred Golden Geometry & Floating Atelier
  { id: 'thanaweya', z: -41.0, camDist: 7.0, mobileDist: 7.6, y: 0.1 }, // 3: 3D Hourglass, Bridge & 18 Rising Lanterns
  { id: 'fine-arts', z: -56.0, camDist: 7.8, mobileDist: 8.6, y: 0.2 }, // 4: Grand Fine Arts Archway, Columns & Sculpture
  { id: 'finale', z: -72.0, camDist: 7.2, mobileDist: 8.2, y: 0.05 },   // 5: 19 Floating Golden Candles Crown
];

export class Atelier3DScene {
  constructor(canvas, config) {
    this.canvas = canvas;
    this.config = config;

    // Continuous zone index [0 .. 5] synced directly to DOM sections!
    this.targetZoneFloat = 0;
    this.smoothZoneFloat = 0;

    this.pointer = { x: 0, y: 0 };
    this.smoothPointer = { x: 0, y: 0 };

    this.inspectMode = false;
    this.isDragging = false;
    this.dragStart = { x: 0, y: 0 };
    this.spinAngleTarget = 0;
    this.spinAngleCurrent = 0;
    this.orbitYTarget = 0;
    this.orbitYCurrent = 0;

    this.candlesLit = true;
    this.candleWind = 0; // 0..1 from real microphone blow!
    this.wishBurstTime = -1;
    this.disposed = false;
    this.isHidden = false;
    this.isMobile = window.innerWidth < 900;

    // 8 Family Persona Auras + 4 Museum Masterpiece Lighting Moods
    this.themePresets = {
      yomna:   { key: 0xffd68a, rim: 0xe0a854, fog: 0x120d09 },
      essam:   { key: 0xffd480, rim: 0x5280b8, fog: 0x0c1018 },
      heba:    { key: 0xffe2c8, rim: 0xe09480, fog: 0x160e0e },
      youssef: { key: 0xffe2ad, rim: 0x609cd4, fog: 0x0b121c },
      islam:   { key: 0xffe0b2, rim: 0x54b4a6, fog: 0x0a1514 },
      salwa:   { key: 0xffdcb5, rim: 0xd89062, fog: 0x16100b },
      nada:    { key: 0xffe4ca, rim: 0xb082d0, fog: 0x130e18 },
      mohamed: { key: 0xfadca0, rim: 0x74aa7a, fog: 0x0d1410 },
    };

    this.moodOverrides = {
      rembrandt:  null, // Uses active family persona warm atelier lighting
      vangogh:    { key: 0xffd468, rim: 0x3b6ee8, fog: 0x091126 },
      louvre:     { key: 0xfff5e4, rim: 0xc9b896, fog: 0x151310 },
      terracotta: { key: 0xffb878, rim: 0xd45d3f, fog: 0x1a0e0a },
    };

    this.activePersonaKey = 'yomna';
    this.activeMoodKey = 'rembrandt';
    this.targetTheme = this.themePresets.yomna;
    this.curKeyColor = new THREE.Color(this.targetTheme.key);
    this.curRimBase = new THREE.Color(this.targetTheme.rim);
    this.curFogBase = new THREE.Color(this.targetTheme.fog);

    this.clock = new THREE.Clock();
    this.animatedObjects = [];
    this.zoneGroups = [];
    this.lanterns = [];
    this.candles = [];
    this.flames = [];
    this.goldLeafData = [];

    this.init();
  }

  init() {
    this.renderer = new THREE.WebGLRenderer({
      canvas: this.canvas,
      antialias: !this.isMobile || (window.devicePixelRatio || 1) <= 2,
      alpha: true,
      powerPreference: 'high-performance',
    });
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, this.isMobile ? 1.85 : 2));
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.28;
    this.renderer.outputColorSpace = THREE.SRGBColorSpace;

    this.scene = new THREE.Scene();
    this.scene.fog = new THREE.FogExp2(0x120d09, 0.022);

    const aspect = window.innerWidth / Math.max(1, window.innerHeight);
    this.camera = new THREE.PerspectiveCamera(aspect < 0.85 ? 58 : 46, aspect, 0.1, 160);

    this.glowTexture = this.createRadialGlowTexture();
    this.beamTexture = this.createLightBeamTexture();
    this.textureLoader = new THREE.TextureLoader();

    this.materials = {
      gold: new THREE.MeshStandardMaterial({
        color: 0xf0c96e,
        metalness: 0.86,
        roughness: 0.2,
      }),
      goldGlow: new THREE.MeshStandardMaterial({
        color: 0xfff0b8,
        emissive: 0xe2a83b,
        emissiveIntensity: 0.95,
        metalness: 0.65,
        roughness: 0.18,
      }),
      antiqueBrass: new THREE.MeshStandardMaterial({
        color: 0xc2923c,
        metalness: 0.78,
        roughness: 0.3,
      }),
      wood: new THREE.MeshStandardMaterial({
        color: 0x633e27,
        metalness: 0.08,
        roughness: 0.58,
      }),
      darkWood: new THREE.MeshStandardMaterial({
        color: 0x3b2315,
        metalness: 0.06,
        roughness: 0.68,
      }),
      marble: new THREE.MeshPhysicalMaterial({
        color: 0xf8f1e7,
        metalness: 0.04,
        roughness: 0.22,
        clearcoat: 0.45,
        clearcoatRoughness: 0.2,
      }),
      glassGold: new THREE.MeshPhysicalMaterial({
        color: 0xffe5a3,
        transparent: true,
        opacity: 0.42,
        roughness: 0.12,
        metalness: 0.1,
        clearcoat: 0.9,
      }),
      candleWax: new THREE.MeshStandardMaterial({
        color: 0xfaf0de,
        roughness: 0.48,
        metalness: 0.02,
        emissive: 0x4d2c0a,
        emissiveIntensity: 0.34,
      }),
    };

    this.setupLights();
    this.buildGoldenDustField();
    this.buildFloatingGoldLeafFlakes();
    this.buildJourneyLightRibbon();

    this.buildZone0Prologue();
    this.buildZone1Childhood();
    this.buildZone2Passion();
    this.buildZone3Thanaweya();
    this.buildZone4FineArts();
    this.buildZone5FinaleCandles();
    this.buildCelebrationBurstSystem();

    this.applyResponsiveLayout();
    this.bindEvents();
    this.animate();
  }

  setInspectMode(enabled) {
    this.inspectMode = Boolean(enabled);
    if (!enabled) {
      this.orbitYTarget = 0;
    }
  }

  nudgeSpin(deltaRad) {
    this.spinAngleTarget = Math.max(-1.35, Math.min(1.35, this.spinAngleTarget + deltaRad));
  }

  resetSpin() {
    this.spinAngleTarget = 0;
    this.orbitYTarget = 0;
  }

  setVisitorTheme(themeKey) {
    if (this.themePresets[themeKey]) {
      this.activePersonaKey = themeKey;
    }
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

  setZoneProgress(zoneFloat) {
    this.targetZoneFloat = Math.max(0, Math.min(ZONE_STAGES.length - 1, zoneFloat));
  }

  createRadialGlowTexture() {
    const size = 128;
    const c = document.createElement('canvas');
    c.width = size;
    c.height = size;
    const ctx = c.getContext('2d');
    const g = ctx.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2);
    g.addColorStop(0, 'rgba(255, 252, 238, 1)');
    g.addColorStop(0.3, 'rgba(246, 210, 124, 0.86)');
    g.addColorStop(0.65, 'rgba(210, 150, 60, 0.26)');
    g.addColorStop(1, 'rgba(0, 0, 0, 0)');
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, size, size);
    const tex = new THREE.CanvasTexture(c);
    tex.colorSpace = THREE.SRGBColorSpace;
    return tex;
  }

  createLightBeamTexture() {
    const c = document.createElement('canvas');
    c.width = 128;
    c.height = 256;
    const ctx = c.getContext('2d');
    const g = ctx.createLinearGradient(0, 0, 0, 256);
    g.addColorStop(0, 'rgba(255, 238, 180, 0.48)');
    g.addColorStop(0.55, 'rgba(240, 194, 102, 0.16)');
    g.addColorStop(1, 'rgba(240, 194, 102, 0)');
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, 128, 256);
    const tex = new THREE.CanvasTexture(c);
    tex.colorSpace = THREE.SRGBColorSpace;
    return tex;
  }

  loadArtTexture(path) {
    const safePath = isSafeLocalTexturePath(path) ? path : './assets/art/chapter4-fine-arts.jpg';
    const tex = this.textureLoader.load(safePath);
    tex.colorSpace = THREE.SRGBColorSpace;
    tex.anisotropy = Math.min(4, this.renderer.capabilities.getMaxAnisotropy());
    return tex;
  }

  setupLights() {
    this.ambientLight = new THREE.AmbientLight(0xffebd0, 0.88);
    this.scene.add(this.ambientLight);

    this.hemiLight = new THREE.HemisphereLight(0xfff6e5, 0x2c1c12, 0.75);
    this.scene.add(this.hemiLight);

    // Bright Sculptural Key Light right on active 3D stage
    this.keyLight = new THREE.PointLight(0xffd68a, 46, 42, 1.35);
    this.scene.add(this.keyLight);

    this.rimLight = new THREE.PointLight(0xe0a854, 28, 42, 1.45);
    this.scene.add(this.rimLight);

    // Front fill spotlight so dark wood/gold details gleam crisply on mobile screens
    this.frontFillLight = new THREE.PointLight(0xfff0d4, 18, 28, 1.4);
    this.scene.add(this.frontFillLight);
  }

  buildGoldenDustField() {
    const count = this.isMobile ? 460 : 780;
    const positions = new Float32Array(count * 3);
    const colors = new Float32Array(count * 3);
    const palette = [
      new THREE.Color(0xfce6a8),
      new THREE.Color(0xe2b659),
      new THREE.Color(0xfff9ec),
      new THREE.Color(0xd8885e),
    ];

    for (let i = 0; i < count; i++) {
      positions[i * 3] = (Math.random() - 0.5) * (this.isMobile ? 15 : 28);
      positions[i * 3 + 1] = (Math.random() - 0.5) * 14;
      positions[i * 3 + 2] = 10 - Math.random() * 92;

      const col = palette[i % palette.length];
      colors[i * 3] = col.r;
      colors[i * 3 + 1] = col.g;
      colors[i * 3 + 2] = col.b;
    }

    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geo.setAttribute('color', new THREE.BufferAttribute(colors, 3));

    const mat = new THREE.PointsMaterial({
      size: this.isMobile ? 0.26 : 0.22,
      map: this.glowTexture,
      vertexColors: true,
      transparent: true,
      opacity: 0.84,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });

    this.dustField = new THREE.Points(geo, mat);
    this.scene.add(this.dustField);
  }

  buildFloatingGoldLeafFlakes() {
    const count = this.isMobile ? 52 : 90;
    const flakeGeo = new THREE.PlaneGeometry(0.14, 0.14);
    const flakeMat = new THREE.MeshStandardMaterial({
      color: 0xf5d27a,
      metalness: 0.92,
      roughness: 0.16,
      side: THREE.DoubleSide,
    });

    this.goldLeafMesh = new THREE.InstancedMesh(flakeGeo, flakeMat, count);
    this.dummyObj = new THREE.Object3D();

    for (let i = 0; i < count; i++) {
      this.goldLeafData.push({
        x: (Math.random() - 0.5) * (this.isMobile ? 8.5 : 15),
        y: (Math.random() - 0.5) * 8,
        z: 6 - Math.random() * 84,
        rotX: Math.random() * Math.PI,
        rotY: Math.random() * Math.PI,
        rotZ: Math.random() * Math.PI,
        speed: 0.4 + Math.random() * 0.85,
        scale: 0.55 + Math.random() * 1.05,
      });
    }

    this.scene.add(this.goldLeafMesh);
  }

  buildJourneyLightRibbon() {
    const xAmp = this.isMobile ? 0.75 : 2.1;
    this.journeyCurve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(-xAmp * 0.7, -0.9, ZONE_STAGES[0].z),
      new THREE.Vector3(xAmp, -0.5, ZONE_STAGES[1].z),
      new THREE.Vector3(-xAmp, 0.25, ZONE_STAGES[2].z),
      new THREE.Vector3(xAmp * 0.8, -0.35, ZONE_STAGES[3].z),
      new THREE.Vector3(0.0, -0.15, ZONE_STAGES[4].z),
      new THREE.Vector3(0.0, -0.3, ZONE_STAGES[5].z),
    ]);

    const tubeGeo = new THREE.TubeGeometry(this.journeyCurve, 220, 0.038, 8, false);
    const tubeMat = new THREE.MeshStandardMaterial({
      color: 0xf7d47c,
      emissive: 0xd19230,
      emissiveIntensity: 0.85,
      metalness: 0.85,
      roughness: 0.2,
      transparent: true,
      opacity: 0.8,
    });

    this.ribbonMesh = new THREE.Mesh(tubeGeo, tubeMat);
    this.scene.add(this.ribbonMesh);

    this.cometGroup = new THREE.Group();
    const cometCore = new THREE.Mesh(
      new THREE.SphereGeometry(0.15, 16, 16),
      new THREE.MeshBasicMaterial({ color: 0xfff6d6 })
    );
    const cometGlow = new THREE.Sprite(
      new THREE.SpriteMaterial({
        map: this.glowTexture,
        color: 0xffd678,
        transparent: true,
        opacity: 0.96,
        blending: THREE.AdditiveBlending,
      })
    );
    cometGlow.scale.set(2.1, 2.1, 1);
    this.cometGroup.add(cometCore, cometGlow);
    this.scene.add(this.cometGroup);
  }

  /* ==================== ZONE 0: PROLOGUE — EASEL, PALETTE & BRUSHES ==================== */
  buildZone0Prologue() {
    const stage = new THREE.Group();
    stage.position.set(0, ZONE_STAGES[0].y, ZONE_STAGES[0].z);

    const rig = new THREE.Group();

    const easel = new THREE.Group();
    const legGeo = new THREE.BoxGeometry(0.11, 4.1, 0.11);

    const leftLeg = new THREE.Mesh(legGeo, this.materials.wood);
    leftLeg.position.set(-0.7, -0.3, 0);
    leftLeg.rotation.set(-0.09, 0, -0.14);

    const rightLeg = new THREE.Mesh(legGeo, this.materials.wood);
    rightLeg.position.set(0.7, -0.3, 0);
    rightLeg.rotation.set(-0.09, 0, 0.14);

    const backLeg = new THREE.Mesh(new THREE.BoxGeometry(0.1, 4.0, 0.1), this.materials.darkWood);
    backLeg.position.set(0, -0.4, -1.0);
    backLeg.rotation.x = 0.34;

    const mast = new THREE.Mesh(new THREE.BoxGeometry(0.12, 3.6, 0.1), this.materials.darkWood);
    mast.position.set(0, 0.12, -0.15);
    mast.rotation.x = -0.09;

    const shelf = new THREE.Mesh(new THREE.BoxGeometry(2.3, 0.11, 0.26), this.materials.gold);
    shelf.position.set(0, -0.74, 0.17);
    shelf.rotation.x = -0.09;

    const artPath = this.config.chapters?.[3]?.image || './assets/art/chapter4-fine-arts.jpg';
    const framedCanvas = this.createFramedPainting(2.1, 1.58, artPath);
    framedCanvas.position.set(0, 0.2, 0.14);
    framedCanvas.rotation.x = -0.09;

    const clamp = new THREE.Mesh(new THREE.BoxGeometry(0.34, 0.13, 0.2), this.materials.goldGlow);
    clamp.position.set(0, 1.08, 0.05);

    easel.add(leftLeg, rightLeg, backLeg, mast, shelf, framedCanvas, clamp);
    rig.add(easel);

    const palette = this.createArtistPalette();
    palette.position.set(1.38, -0.48, 0.9);
    palette.rotation.set(0.45, -0.5, 0.22);
    rig.add(palette);
    this.animatedObjects.push({ mesh: palette, baseY: -0.48, speed: 1.2, amp: 0.14, rotY: 0.3 });

    const brush1 = this.createPaintbrush(0xe0844f);
    brush1.position.set(-1.38, 0.72, 0.75);
    brush1.rotation.set(0.3, 0.2, -0.62);
    rig.add(brush1);
    this.animatedObjects.push({ mesh: brush1, baseY: 0.72, speed: 1.4, amp: 0.15, rotZ: 0.18 });

    const brush2 = this.createPaintbrush(0x4d79a8);
    brush2.position.set(1.28, 0.92, 0.38);
    brush2.rotation.set(-0.25, 0.4, 0.5);
    rig.add(brush2);
    this.animatedObjects.push({ mesh: brush2, baseY: 0.92, speed: 1.05, amp: 0.13, rotZ: -0.15 });

    const halo1 = new THREE.Mesh(new THREE.TorusGeometry(2.25, 0.02, 16, 128), this.materials.goldGlow);
    halo1.position.set(0, 0.18, -0.25);
    halo1.rotation.set(0.35, 0.2, 0);

    const halo2 = new THREE.Mesh(new THREE.TorusGeometry(2.6, 0.012, 12, 128), this.materials.gold);
    halo2.position.set(0, 0.18, -0.3);
    halo2.rotation.set(-0.42, 0.55, 0.2);

    rig.add(halo1, halo2);
    stage.add(rig);

    this.heroRig = rig;
    this.heroHalos = [halo1, halo2];
    this.zoneGroups.push({ stage, rig, desktopOffsetX: -2.2, mobileScale: 0.72 });
    this.scene.add(stage);
  }

  /* ==================== ZONE 1: CHILDHOOD — CENTERED DIORAMA ==================== */
  buildZone1Childhood() {
    const stage = new THREE.Group();
    stage.position.set(0, ZONE_STAGES[1].y, ZONE_STAGES[1].z);
    const rig = new THREE.Group();

    const artPath = this.config.chapters?.[0]?.image || './assets/art/chapter1-childhood.jpg';
    const frame = this.createFramedPainting(2.05, 1.54, artPath);
    frame.rotation.y = -0.18;
    rig.add(frame);
    this.animatedObjects.push({ mesh: frame, baseY: 0, speed: 0.95, amp: 0.12 });

    // Orbiting Colored Pencils & Golden Origami Stars tightly framing the canvas (visible on mobile!)
    const pastelColors = [0xf0c05a, 0xd97854, 0x6f98bd, 0x86ad7e, 0xe095a4, 0xe8b468];
    pastelColors.forEach((hex, idx) => {
      const pencil = new THREE.Group();
      const shaft = new THREE.Mesh(
        new THREE.CylinderGeometry(0.05, 0.05, 1.1, 6),
        new THREE.MeshStandardMaterial({ color: hex, roughness: 0.4 })
      );
      const tip = new THREE.Mesh(
        new THREE.ConeGeometry(0.05, 0.2, 6),
        new THREE.MeshStandardMaterial({ color: 0xf0dab5, roughness: 0.65 })
      );
      tip.position.y = 0.65;
      pencil.add(shaft, tip);

      const angle = (idx / pastelColors.length) * Math.PI * 2;
      pencil.position.set(Math.cos(angle) * 1.65, Math.sin(angle) * 1.15, 0.55 + (idx % 2) * 0.35);
      pencil.rotation.set(0.35 + idx * 0.2, idx * 0.4, 0.55);
      rig.add(pencil);
      this.animatedObjects.push({
        mesh: pencil,
        baseY: pencil.position.y,
        speed: 1.1 + idx * 0.14,
        amp: 0.14,
        rotY: 0.4,
      });
    });

    // Floating Golden Origami Paper Stars
    const starGeo = new THREE.OctahedronGeometry(0.18, 0);
    for (let i = 0; i < 5; i++) {
      const star = new THREE.Mesh(starGeo, this.materials.goldGlow);
      const a = (i / 5) * Math.PI * 2 + 0.4;
      star.position.set(Math.cos(a) * 1.35, Math.sin(a) * 0.95, 0.85);
      rig.add(star);
      this.animatedObjects.push({ mesh: star, baseY: star.position.y, speed: 1.4 + i * 0.2, amp: 0.12, rotY: 0.8 });
    }

    stage.add(rig);
    this.zoneGroups.push({ stage, rig, desktopOffsetX: 2.0, mobileScale: 0.78 });
    this.scene.add(stage);
  }

  /* ==================== ZONE 2: PASSION — SACRED ART GEOMETRY & PALETTE ==================== */
  buildZone2Passion() {
    const stage = new THREE.Group();
    stage.position.set(0, ZONE_STAGES[2].y, ZONE_STAGES[2].z);
    const rig = new THREE.Group();

    const icoWire = new THREE.Mesh(
      new THREE.IcosahedronGeometry(1.42, 0),
      new THREE.MeshStandardMaterial({
        color: 0xf2cd74,
        emissive: 0x9c6e1e,
        emissiveIntensity: 0.35,
        metalness: 0.9,
        roughness: 0.18,
        wireframe: true,
      })
    );
    const innerGem = new THREE.Mesh(new THREE.OctahedronGeometry(0.72, 0), this.materials.marble);
    const orbitRing1 = new THREE.Mesh(new THREE.TorusGeometry(1.92, 0.022, 14, 96), this.materials.goldGlow);
    orbitRing1.rotation.x = 1.12;
    const orbitRing2 = new THREE.Mesh(new THREE.TorusGeometry(2.18, 0.014, 12, 96), this.materials.gold);
    orbitRing2.rotation.y = 0.85;

    rig.add(icoWire, innerGem, orbitRing1, orbitRing2);
    this.passionSculpture = { icoWire, innerGem, orbitRing1, orbitRing2 };

    const palette2 = this.createArtistPalette();
    palette2.position.set(1.25, -0.65, 0.95);
    palette2.rotation.set(0.35, -0.45, -0.15);
    rig.add(palette2);
    this.animatedObjects.push({ mesh: palette2, baseY: -0.65, speed: 1.1, amp: 0.15, rotY: -0.3 });

    const brush = this.createPaintbrush(0xd96b43);
    brush.position.set(-1.25, 0.55, 0.9);
    brush.rotation.set(0.25, 0.3, -0.55);
    rig.add(brush);
    this.animatedObjects.push({ mesh: brush, baseY: 0.55, speed: 1.3, amp: 0.14, rotZ: 0.2 });

    stage.add(rig);
    this.zoneGroups.push({ stage, rig, desktopOffsetX: -2.0, mobileScale: 0.76 });
    this.scene.add(stage);
  }

  /* ==================== ZONE 3: THANAWEYA — 3D GOLDEN HOURGLASS, BRIDGE & LANTERNS ==================== */
  buildZone3Thanaweya() {
    const stage = new THREE.Group();
    stage.position.set(0, ZONE_STAGES[3].y, ZONE_STAGES[3].z);
    const rig = new THREE.Group();

    // Sculpted 3D Golden Hourglass of the Decisive Year (السنة الفاصلة)
    const hourglass = new THREE.Group();
    const topBulb = new THREE.Mesh(new THREE.ConeGeometry(0.68, 1.05, 24), this.materials.glassGold);
    topBulb.position.y = 0.55;
    topBulb.rotation.x = Math.PI;
    const botBulb = new THREE.Mesh(new THREE.ConeGeometry(0.68, 1.05, 24), this.materials.glassGold);
    botBulb.position.y = -0.55;

    const topCap = new THREE.Mesh(new THREE.CylinderGeometry(0.82, 0.82, 0.1, 28), this.materials.goldGlow);
    topCap.position.y = 1.1;
    const botCap = topCap.clone();
    botCap.position.y = -1.1;

    const waistRing = new THREE.Mesh(new THREE.TorusGeometry(0.18, 0.035, 12, 32), this.materials.goldGlow);
    waistRing.rotation.x = Math.PI / 2;

    // 3 Golden pillars framing hourglass
    for (let i = 0; i < 3; i++) {
      const a = (i / 3) * Math.PI * 2;
      const rod = new THREE.Mesh(new THREE.CylinderGeometry(0.028, 0.028, 2.2, 12), this.materials.gold);
      rod.position.set(Math.cos(a) * 0.74, 0, Math.sin(a) * 0.74);
      hourglass.add(rod);
    }

    const compassHalo = new THREE.Mesh(new THREE.TorusGeometry(1.75, 0.02, 12, 96), this.materials.gold);
    hourglass.add(topBulb, botBulb, topCap, botCap, waistRing, compassHalo);
    rig.add(hourglass);
    this.thanaweyaHourglass = { group: hourglass, compassHalo };

    // 16 Rising Golden Hope Lanterns tightly framing the hourglass
    const orbGeo = new THREE.SphereGeometry(0.16, 14, 14);
    const haloMat = new THREE.SpriteMaterial({
      map: this.glowTexture,
      color: 0xffd47e,
      transparent: true,
      opacity: 0.9,
      blending: THREE.AdditiveBlending,
    });

    for (let i = 0; i < 16; i++) {
      const lantern = new THREE.Group();
      const core = new THREE.Mesh(
        orbGeo,
        new THREE.MeshStandardMaterial({
          color: 0xffe8b3,
          emissive: 0xffb84d,
          emissiveIntensity: 1.6,
          roughness: 0.2,
        })
      );
      const glow = new THREE.Sprite(haloMat);
      glow.scale.set(1.2, 1.2, 1);
      lantern.add(core, glow);

      const angle = (i / 16) * Math.PI * 2;
      const rad = 1.35 + (i % 3) * 0.65;
      const x = Math.cos(angle) * rad;
      const y = (Math.random() - 0.5) * 3.6;
      const z = Math.sin(angle) * 1.4 - 0.4;
      lantern.position.set(x, y, z);
      lantern.scale.setScalar(0.65 + (i % 3) * 0.22);

      rig.add(lantern);
      this.lanterns.push({
        mesh: lantern,
        baseX: x,
        speedY: 0.32 + (i % 4) * 0.1,
        phase: i * 0.8,
      });
    }

    stage.add(rig);
    this.zoneGroups.push({ stage, rig, desktopOffsetX: 2.0, mobileScale: 0.78 });
    this.scene.add(stage);
  }

  /* ==================== ZONE 4: FINE ARTS — GRAND ARCHWAY & SCULPTURE ==================== */
  buildZone4FineArts() {
    const stage = new THREE.Group();
    stage.position.set(0, ZONE_STAGES[4].y - 0.25, ZONE_STAGES[4].z);
    const rig = new THREE.Group();

    const buildColumn = (x, z, h = 3.8) => {
      const col = new THREE.Group();
      const shaft = new THREE.Mesh(new THREE.CylinderGeometry(0.22, 0.26, h, 18), this.materials.marble);
      const base = new THREE.Mesh(new THREE.BoxGeometry(0.76, 0.24, 0.76), this.materials.marble);
      base.position.y = -h / 2 - 0.12;
      const baseGold = new THREE.Mesh(new THREE.CylinderGeometry(0.3, 0.34, 0.1, 24), this.materials.goldGlow);
      baseGold.position.y = -h / 2 + 0.05;
      const capital = new THREE.Mesh(new THREE.BoxGeometry(0.76, 0.22, 0.76), this.materials.marble);
      capital.position.y = h / 2 + 0.1;
      const capGold = new THREE.Mesh(new THREE.CylinderGeometry(0.32, 0.24, 0.12, 24), this.materials.goldGlow);
      capGold.position.y = h / 2 - 0.05;

      col.add(shaft, base, baseGold, capital, capGold);
      col.position.set(x, -0.1, z);
      return col;
    };

    rig.add(buildColumn(-1.85, 0));
    rig.add(buildColumn(1.85, 0));

    // Classical Neoclassical Triumphal Arch
    const archCurve = new THREE.Mesh(
      new THREE.TorusGeometry(1.85, 0.17, 16, 64, Math.PI),
      this.materials.marble
    );
    archCurve.position.set(0, 1.82, 0);

    const archGoldTrim = new THREE.Mesh(
      new THREE.TorusGeometry(1.68, 0.045, 12, 64, Math.PI),
      this.materials.goldGlow
    );
    archGoldTrim.position.set(0, 1.82, 0.08);
    rig.add(archCurve, archGoldTrim);

    // Volumetric Sunbeams
    const beamMat = new THREE.MeshBasicMaterial({
      map: this.beamTexture,
      transparent: true,
      opacity: 0.5,
      blending: THREE.AdditiveBlending,
      side: THREE.DoubleSide,
      depthWrite: false,
    });
    for (let i = -1; i <= 1; i++) {
      const beam = new THREE.Mesh(new THREE.PlaneGeometry(1.3, 5.4), beamMat);
      beam.position.set(i * 0.75, 0.6, -0.5);
      beam.rotation.z = -0.18 + i * 0.06;
      rig.add(beam);
    }

    // Central Classical Marble Sculpture + Golden Halo
    const plinth = new THREE.Mesh(new THREE.CylinderGeometry(0.52, 0.66, 1.1, 24), this.materials.marble);
    plinth.position.y = -1.45;
    const plinthRing = new THREE.Mesh(new THREE.TorusGeometry(0.54, 0.03, 12, 48), this.materials.goldGlow);
    plinthRing.rotation.x = Math.PI / 2;
    plinthRing.position.y = -0.9;

    const sculpture = new THREE.Mesh(
      new THREE.TorusKnotGeometry(0.62, 0.18, 112, 20, 2, 3),
      this.materials.marble
    );
    sculpture.position.y = 0.15;

    const goldCrown = new THREE.Mesh(new THREE.TorusGeometry(1.18, 0.022, 12, 96), this.materials.goldGlow);
    goldCrown.position.y = 0.15;

    rig.add(plinth, plinthRing, sculpture, goldCrown);
    this.fineArtsSculpture = { sculpture, goldCrown };

    stage.add(rig);
    this.zoneGroups.push({ stage, rig, desktopOffsetX: -2.1, mobileScale: 0.74 });
    this.scene.add(stage);
  }

  /* ==================== ZONE 5: FINALE — 19 GOLDEN BIRTHDAY CANDLES CROWN ==================== */
  buildZone5FinaleCandles() {
    const stage = new THREE.Group();
    stage.position.set(0, ZONE_STAGES[5].y, ZONE_STAGES[5].z);
    const rig = new THREE.Group();

    const candleGeo = new THREE.CylinderGeometry(0.068, 0.078, 0.68, 14);
    const holderGeo = new THREE.CylinderGeometry(0.12, 0.065, 0.08, 14);
    const flameGeo = new THREE.ConeGeometry(0.055, 0.24, 12);
    const flameMat = new THREE.MeshBasicMaterial({ color: 0xffea9f });
    const glowMat = new THREE.SpriteMaterial({
      map: this.glowTexture,
      color: 0xffc85c,
      transparent: true,
      opacity: 0.94,
      blending: THREE.AdditiveBlending,
    });

    // Central Golden Halo Ring uniting the 19 Candles
    const crownBase = new THREE.Mesh(new THREE.TorusGeometry(2.15, 0.025, 14, 96), this.materials.goldGlow);
    crownBase.rotation.x = Math.PI / 2 - 0.22;
    crownBase.position.y = -0.55;
    rig.add(crownBase);

    const totalCandles = 19;
    for (let i = 0; i < totalCandles; i++) {
      const candleUnit = new THREE.Group();
      const wax = new THREE.Mesh(candleGeo, this.materials.candleWax);
      const holder = new THREE.Mesh(holderGeo, this.materials.gold);
      holder.position.y = -0.36;

      const flameGroup = new THREE.Group();
      flameGroup.position.y = 0.46;
      const flameMesh = new THREE.Mesh(flameGeo, flameMat);
      const flameGlow = new THREE.Sprite(glowMat.clone());
      flameGlow.scale.set(0.92, 0.92, 1);

      flameGroup.add(flameMesh, flameGlow);
      candleUnit.add(wax, holder, flameGroup);

      // Compact two-tier circular chandelier crown so ALL 19 candles stay 100% visible on mobile!
      const angle = (i / totalCandles) * Math.PI * 2;
      const radius = i % 2 === 0 ? 2.15 : 1.45;
      const x = Math.cos(angle) * radius;
      const z = Math.sin(angle) * radius * 0.72;
      const y = (i % 2 === 0 ? -0.25 : 0.42) + Math.sin(i * 0.9) * 0.15;

      candleUnit.position.set(x, y, z);
      rig.add(candleUnit);

      this.candles.push({ group: candleUnit, baseY: y, phase: i * 0.65 });
      this.flames.push({ group: flameGroup, glow: flameGlow, phase: i * 1.1 });
    }

    this.finaleLight = new THREE.PointLight(0xffcf78, 34, 26, 1.4);
    this.finaleLight.position.set(0, 1.2, ZONE_STAGES[5].z + 1.5);
    this.scene.add(this.finaleLight);

    stage.add(rig);
    this.finaleRig = rig;
    this.zoneGroups.push({ stage, rig, desktopOffsetX: 0, mobileScale: 0.78 });
    this.scene.add(stage);
  }

  buildCelebrationBurstSystem() {
    const count = this.isMobile ? 240 : 380;
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
      positions[i * 3 + 1] = 0;
      positions[i * 3 + 2] = ZONE_STAGES[5].z;

      const c = palette[i % palette.length];
      colors[i * 3] = c.r;
      colors[i * 3 + 1] = c.g;
      colors[i * 3 + 2] = c.b;

      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);
      const speed = 2.6 + Math.random() * 5.4;
      this.burstVelocities.push({
        x: Math.sin(phi) * Math.cos(theta) * speed,
        y: Math.abs(Math.cos(phi)) * speed * 0.92 + 1.2,
        z: Math.sin(phi) * Math.sin(theta) * speed,
      });
    }

    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geo.setAttribute('color', new THREE.BufferAttribute(colors, 3));

    const mat = new THREE.PointsMaterial({
      size: 0.36,
      map: this.glowTexture,
      vertexColors: true,
      transparent: true,
      opacity: 0,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });

    this.burstPoints = new THREE.Points(geo, mat);
    this.scene.add(this.burstPoints);
  }

  createFramedPainting(width, height, imagePath) {
    const frameGroup = new THREE.Group();
    const border = 0.11;
    const depth = 0.08;

    const topBar = new THREE.Mesh(new THREE.BoxGeometry(width + border * 2, border, depth), this.materials.gold);
    topBar.position.y = height / 2 + border / 2;
    const botBar = topBar.clone();
    botBar.position.y = -(height / 2 + border / 2);
    const leftBar = new THREE.Mesh(new THREE.BoxGeometry(border, height, depth), this.materials.gold);
    leftBar.position.x = -(width / 2 + border / 2);
    const rightBar = leftBar.clone();
    rightBar.position.x = width / 2 + border / 2;

    const back = new THREE.Mesh(
      new THREE.BoxGeometry(width + border, height + border, 0.025),
      this.materials.darkWood
    );
    back.position.z = -0.025;

    const artTex = this.loadArtTexture(imagePath);
    const canvasMat = new THREE.MeshStandardMaterial({
      map: artTex,
      roughness: 0.56,
      metalness: 0.04,
    });
    const painting = new THREE.Mesh(new THREE.PlaneGeometry(width, height), canvasMat);
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

    const extrude = new THREE.ExtrudeGeometry(shape, {
      depth: 0.055,
      bevelEnabled: true,
      bevelThickness: 0.02,
      bevelSize: 0.02,
      bevelSegments: 3,
    });
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

    const dabGeo = new THREE.SphereGeometry(0.12, 16, 12);
    paints.forEach((p) => {
      const mat = new THREE.MeshPhysicalMaterial({
        color: p.color,
        roughness: 0.18,
        clearcoat: 0.88,
        clearcoatRoughness: 0.14,
      });
      const dab = new THREE.Mesh(dabGeo, mat);
      dab.scale.set(1.15, 0.88, 0.45);
      dab.position.set(p.x, p.y, 0.055);
      group.add(dab);
    });

    group.scale.setScalar(0.76);
    return group;
  }

  createPaintbrush(tipColor) {
    const brush = new THREE.Group();
    const handle = new THREE.Mesh(new THREE.CylinderGeometry(0.018, 0.036, 1.35, 14), this.materials.darkWood);
    handle.position.y = -0.35;
    const ferrule = new THREE.Mesh(new THREE.CylinderGeometry(0.038, 0.035, 0.22, 16), this.materials.gold);
    ferrule.position.y = 0.42;
    const bristles = new THREE.Mesh(
      new THREE.ConeGeometry(0.044, 0.26, 16),
      new THREE.MeshStandardMaterial({ color: tipColor, roughness: 0.48 })
    );
    bristles.position.y = 0.65;
    brush.add(handle, ferrule, bristles);
    return brush;
  }

  /* ==================== RESPONSIVE FRAMING (MOBILE UPPER-STAGE vs DESKTOP SIDE-STAGE) ==================== */
  applyResponsiveLayout() {
    const w = window.innerWidth;
    const h = Math.max(1, window.innerHeight);
    const aspect = w / h;
    this.isMobile = w < 940;
    const isPortrait = aspect < 0.9;

    this.camera.aspect = aspect;
    this.camera.fov = isPortrait ? 58 : aspect < 1.15 ? 52 : 46;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(w, h);

    for (const zEntry of this.zoneGroups) {
      if (this.isMobile) {
        // Dead-center horizontally so it sits cleanly inside every Mobile 3D Stage Window!
        zEntry.stage.position.x = 0;
        zEntry.rig.scale.setScalar(isPortrait ? zEntry.mobileScale : 0.86);
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
      this.wishBurstTime = 0;
      const pos = this.burstPoints.geometry.attributes.position.array;
      for (let i = 0; i < this.burstVelocities.length; i++) {
        pos[i * 3] = (Math.random() - 0.5) * 1.4;
        pos[i * 3 + 1] = (Math.random() - 0.5) * 0.8;
        pos[i * 3 + 2] = ZONE_STAGES[5].z + (Math.random() - 0.5) * 1.2;
      }
      this.burstPoints.geometry.attributes.position.needsUpdate = true;
      this.burstPoints.material.opacity = 1;
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
          this.spinAngleTarget = Math.max(-1.4, Math.min(1.4, dx * 3.6));
          if (this.inspectMode || e.pointerType === 'mouse') {
            this.orbitYTarget = Math.max(-1.1, Math.min(1.1, -dy * 2.4));
          }
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
      this.spinAngleTarget *= 0.35;
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

    this.smoothZoneFloat += (this.targetZoneFloat - this.smoothZoneFloat) * 0.08;
    this.smoothPointer.x += (this.pointer.x - this.smoothPointer.x) * 0.06;
    this.smoothPointer.y += (this.pointer.y - this.smoothPointer.y) * 0.06;
    this.spinAngleCurrent += (this.spinAngleTarget - this.spinAngleCurrent) * 0.09;
    this.orbitYCurrent += (this.orbitYTarget - this.orbitYCurrent) * 0.08;

    // Exact interpolation between active Story Zone Waypoints!
    const idxLow = Math.max(0, Math.min(ZONE_STAGES.length - 1, Math.floor(this.smoothZoneFloat)));
    const idxHigh = Math.max(0, Math.min(ZONE_STAGES.length - 1, idxLow + 1));
    const frac = this.smoothZoneFloat - idxLow;
    const smoothFrac = frac * frac * (3 - 2 * frac);

    const sA = ZONE_STAGES[idxLow];
    const sB = ZONE_STAGES[idxHigh];

    const stageZ = THREE.MathUtils.lerp(sA.z, sB.z, smoothFrac);
    const stageY = THREE.MathUtils.lerp(sA.y, sB.y, smoothFrac);
    const dist = THREE.MathUtils.lerp(
      this.isMobile ? sA.mobileDist : sA.camDist,
      this.isMobile ? sB.mobileDist : sB.camDist,
      smoothFrac
    );

    const autoSway = this.isMobile && !this.inspectMode ? Math.sin(t * 0.55) * 0.22 : 0;
    const camX = this.smoothPointer.x * 0.55 + autoSway;
    const camY = stageY + (this.isMobile && !this.inspectMode ? 0.15 : 0.28) + this.smoothPointer.y * 0.28 + this.orbitYCurrent;
    const camZ = stageZ + dist;

    this.camera.position.set(camX, camY, camZ);

    // KEY MOBILE BREAKTHROUGH: Look slightly lower (`-0.68`) on mobile so the 3D Sculpture
    // projects into the OPEN UPPER STAGE WINDOW of the phone screen, completely above the text card!
    const mobileUpperShift = this.isMobile && !this.inspectMode ? -0.68 : 0.05;
    this.camera.lookAt(
      this.smoothPointer.x * 0.2,
      stageY + mobileUpperShift + this.smoothPointer.y * 0.14,
      stageZ
    );

    // Apply user spin angle smoothly to all 3D stage rigs!
    for (let i = 0; i < this.zoneGroups.length; i++) {
      const zg = this.zoneGroups[i];
      const baseIdle = Math.sin(t * 0.45 + i) * 0.09;
      zg.rig.rotation.y = baseIdle + this.spinAngleCurrent + this.smoothPointer.x * 0.16;
    }

    // Move Golden Comet along the 3D Ribbon synced to zone progress
    if (this.journeyCurve && this.cometGroup) {
      const normProgress = this.smoothZoneFloat / (ZONE_STAGES.length - 1);
      const cometT = Math.min(0.995, Math.max(0.005, normProgress));
      this.cometGroup.position.copy(this.journeyCurve.getPointAt(cometT));
      this.cometGroup.scale.setScalar(1.0 + Math.sin(t * 5.2) * 0.18);
    }

    // Dynamic Studio Lighting right on the active sculpture!
    this.keyLight.position.set(camX + 3.0, stageY + 3.6, stageZ + 4.2);
    this.rimLight.position.set(camX - 4.2, stageY + 2.0, stageZ - 2.5);
    this.frontFillLight.position.set(camX, stageY + 1.2, stageZ + 5.2);

    const twilightFactor = Math.exp(-Math.pow(this.smoothZoneFloat - 3.0, 2) / 0.55);
    const fineArtsGlow = Math.exp(-Math.pow(this.smoothZoneFloat - 4.0, 2) / 0.55);

    this.curKeyColor.lerp(new THREE.Color(this.targetTheme.key), 0.06);
    this.curRimBase.lerp(new THREE.Color(this.targetTheme.rim), 0.06);
    this.curFogBase.lerp(new THREE.Color(this.targetTheme.fog), 0.06);

    this.keyLight.color.copy(this.curKeyColor);
    const twilightRim = new THREE.Color(0x4b78c4);
    this.rimLight.color.copy(this.curRimBase).lerp(twilightRim, twilightFactor * 0.65);
    this.keyLight.intensity = 46 + fineArtsGlow * 16;

    const twilightFog = new THREE.Color(0x0b1120);
    this.scene.fog.color.copy(this.curFogBase).lerp(twilightFog, twilightFactor * 0.6);

    if (this.goldLeafMesh) {
      for (let i = 0; i < this.goldLeafData.length; i++) {
        const d = this.goldLeafData[i];
        this.dummyObj.position.set(
          d.x + Math.sin(t * d.speed + i) * 0.28,
          d.y + Math.cos(t * d.speed * 0.7 + i) * 0.24,
          d.z
        );
        this.dummyObj.rotation.set(
          d.rotX + t * d.speed * 0.7,
          d.rotY + t * d.speed * 0.5,
          d.rotZ + t * d.speed * 0.3
        );
        this.dummyObj.scale.setScalar(d.scale);
        this.dummyObj.updateMatrix();
        this.goldLeafMesh.setMatrixAt(i, this.dummyObj.matrix);
      }
      this.goldLeafMesh.instanceMatrix.needsUpdate = true;
    }

    if (this.heroHalos) {
      this.heroHalos[0].rotation.z = t * 0.2;
      this.heroHalos[1].rotation.z = -t * 0.14;
      this.heroHalos[1].rotation.x = -0.42 + Math.sin(t * 0.35) * 0.12;
    }

    for (const obj of this.animatedObjects) {
      obj.mesh.position.y = obj.baseY + Math.sin(t * obj.speed) * obj.amp;
      if (obj.rotY) obj.mesh.rotation.y += obj.rotY * dt;
      if (obj.rotZ) obj.mesh.rotation.z += Math.sin(t * 0.8) * obj.rotZ * dt;
    }

    if (this.passionSculpture) {
      this.passionSculpture.icoWire.rotation.y = t * 0.3;
      this.passionSculpture.icoWire.rotation.x = t * 0.16;
      this.passionSculpture.innerGem.rotation.y = -t * 0.45;
      this.passionSculpture.orbitRing1.rotation.z = t * 0.32;
      this.passionSculpture.orbitRing2.rotation.x = t * 0.24;
    }

    if (this.thanaweyaHourglass) {
      this.thanaweyaHourglass.group.rotation.y = t * 0.25;
      this.thanaweyaHourglass.compassHalo.rotation.x = 0.8 + Math.sin(t * 0.4) * 0.35;
      this.thanaweyaHourglass.compassHalo.rotation.y = -t * 0.35;
    }

    for (const l of this.lanterns) {
      l.mesh.position.y += l.speedY * dt;
      l.mesh.position.x = l.baseX + Math.sin(t * 0.85 + l.phase) * 0.18;
      if (l.mesh.position.y > 2.4) l.mesh.position.y = -2.2;
    }

    if (this.fineArtsSculpture) {
      this.fineArtsSculpture.sculpture.rotation.y = t * 0.32;
      this.fineArtsSculpture.sculpture.rotation.x = Math.sin(t * 0.35) * 0.16;
      this.fineArtsSculpture.goldCrown.rotation.x = 0.6 + Math.sin(t * 0.4) * 0.3;
      this.fineArtsSculpture.goldCrown.rotation.y = -t * 0.35;
    }

    // 19 Birthday Candles + Real-Time Microphone Wind Flicker Physics!
    if (this.finaleRig && this.candlesLit) {
      this.finaleRig.rotation.y += dt * 0.14;
    }
    const windJitter = this.candleWind * 0.42;
    for (let i = 0; i < this.candles.length; i++) {
      const c = this.candles[i];
      c.group.position.y = c.baseY + Math.sin(t * 1.15 + c.phase) * 0.12;

      const f = this.flames[i];
      const flickerSpeed = 9.5 + this.candleWind * 28;
      const targetScale = this.candlesLit
        ? Math.max(0.2, 0.94 - this.candleWind * 0.35 + Math.sin(t * flickerSpeed + f.phase) * (0.14 + windJitter))
        : 0.001;
      f.group.scale.lerp(new THREE.Vector3(targetScale, targetScale, targetScale), 0.16);
      f.group.rotation.z = this.candlesLit ? Math.sin(t * 22 + i) * windJitter : 0;
      f.glow.material.opacity = THREE.MathUtils.lerp(
        f.glow.material.opacity,
        this.candlesLit ? 0.9 + Math.sin(t * 7 + f.phase) * 0.1 : 0,
        0.12
      );
    }

    if (this.finaleLight) {
      const targetIntensity = this.candlesLit ? 34 + Math.sin(t * 6) * 3 : 10;
      this.finaleLight.intensity += (targetIntensity - this.finaleLight.intensity) * 0.08;
    }

    if (this.wishBurstTime >= 0) {
      this.wishBurstTime += dt;
      const pos = this.burstPoints.geometry.attributes.position.array;
      for (let i = 0; i < this.burstVelocities.length; i++) {
        const v = this.burstVelocities[i];
        pos[i * 3] += v.x * dt * 0.65;
        pos[i * 3 + 1] += (v.y - this.wishBurstTime * 1.15) * dt * 0.65;
        pos[i * 3 + 2] += v.z * dt * 0.65;
      }
      this.burstPoints.geometry.attributes.position.needsUpdate = true;
      this.burstPoints.material.opacity = Math.max(0, 1 - this.wishBurstTime / 4.8);
      if (this.wishBurstTime > 5.0) this.wishBurstTime = -1;
    }

    if (this.dustField) {
      this.dustField.rotation.z = Math.sin(t * 0.05) * 0.04;
      this.dustField.position.y = Math.sin(t * 0.18) * 0.22;
    }

    this.renderer.render(this.scene, this.camera);
  }
}
