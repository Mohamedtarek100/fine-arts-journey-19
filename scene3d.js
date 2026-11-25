/**
 * =========================================================================
 *  Three.js Cinema-Grade 3D Fine Arts Atelier & Motion-Graphics World
 *  Fully Responsive for BOTH Desktop Widescreen AND Mobile Portrait!
 *  - Dynamic portrait FOV & horizontal layout compression so ALL 3D models
 *    stay centered and framed on narrow mobile screens
 *  - Native touch scroll preserved; full touch 3D-orbit enabled in 3D Inspect mode
 * =========================================================================
 */

import * as THREE from './vendor/three.module.min.js';

function isSafeLocalTexturePath(path) {
  return typeof path === 'string' && /^\.\/assets\/[a-zA-Z0-9._/-]+$/.test(path) && !path.includes('..');
}

export class Atelier3DScene {
  constructor(canvas, config) {
    this.canvas = canvas;
    this.config = config;
    this.scrollProgress = 0;
    this.smoothScroll = 0;
    this.pointer = { x: 0, y: 0 };
    this.smoothPointer = { x: 0, y: 0 };

    // Orbit drag state (Mouse anytime; Touch when in 3D Inspect Mode)
    this.inspectMode = false;
    this.isDragging = false;
    this.dragStart = { x: 0, y: 0 };
    this.orbitTarget = { x: 0, y: 0 };
    this.orbitCurrent = { x: 0, y: 0 };

    this.candlesLit = true;
    this.wishBurstTime = -1;
    this.disposed = false;
    this.isHidden = false;
    this.isMobile = window.innerWidth < 900;

    // Live Visitor Persona 3D Theme Palette (morphs lighting & aura smoothly!)
    this.themePresets = {
      yomna:   { key: 0xffd288, rim: 0xdca454, fog: 0x110c09, dust: 0xfbe3a4 },
      father:  { key: 0xffd17a, rim: 0x4b74a8, fog: 0x0d1018, dust: 0xe6c87d },
      mother:  { key: 0xffe0c4, rim: 0xd98f7c, fog: 0x160e0e, dust: 0xf9d8c7 },
      brother: { key: 0xffe0a8, rim: 0x5c94c9, fog: 0x0b121b, dust: 0xcfe4fa },
      guest:   { key: 0xf8d994, rim: 0x6ea074, fog: 0x0d1410, dust: 0xdcf0d8 },
    };
    this.targetTheme = this.themePresets.yomna;
    this.curKeyColor = new THREE.Color(this.targetTheme.key);
    this.curRimBase = new THREE.Color(this.targetTheme.rim);
    this.curFogBase = new THREE.Color(this.targetTheme.fog);

    this.clock = new THREE.Clock();
    this.animatedObjects = [];
    this.lanterns = [];
    this.candles = [];
    this.flames = [];
    this.goldLeafData = [];
    this.responsiveGroups = [];

    this.init();
  }

  init() {
    this.renderer = new THREE.WebGLRenderer({
      canvas: this.canvas,
      antialias: !this.isMobile || (window.devicePixelRatio || 1) <= 2,
      alpha: true,
      powerPreference: 'high-performance',
    });
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, this.isMobile ? 1.75 : 2));
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.18;
    this.renderer.outputColorSpace = THREE.SRGBColorSpace;

    this.scene = new THREE.Scene();
    this.scene.fog = new THREE.FogExp2(0x110c09, this.isMobile ? 0.026 : 0.032);

    const aspect = window.innerWidth / Math.max(1, window.innerHeight);
    const fov = aspect < 0.85 ? 64 : aspect < 1.1 ? 54 : 46;
    this.camera = new THREE.PerspectiveCamera(fov, aspect, 0.1, 175);
    this.camera.position.set(0.6, 0.4, 8.6);

    this.glowTexture = this.createRadialGlowTexture();
    this.beamTexture = this.createLightBeamTexture();
    this.textureLoader = new THREE.TextureLoader();

    this.materials = {
      gold: new THREE.MeshStandardMaterial({
        color: 0xe8c268,
        metalness: 0.86,
        roughness: 0.22,
      }),
      goldGlow: new THREE.MeshStandardMaterial({
        color: 0xfce6a6,
        emissive: 0xdca53d,
        emissiveIntensity: 0.9,
        metalness: 0.62,
        roughness: 0.2,
      }),
      antiqueBrass: new THREE.MeshStandardMaterial({
        color: 0xb88937,
        metalness: 0.78,
        roughness: 0.32,
      }),
      wood: new THREE.MeshStandardMaterial({
        color: 0x563622,
        metalness: 0.08,
        roughness: 0.62,
      }),
      darkWood: new THREE.MeshStandardMaterial({
        color: 0x331f13,
        metalness: 0.06,
        roughness: 0.7,
      }),
      marble: new THREE.MeshPhysicalMaterial({
        color: 0xf6eee3,
        metalness: 0.04,
        roughness: 0.25,
        clearcoat: 0.4,
        clearcoatRoughness: 0.22,
      }),
      candleWax: new THREE.MeshStandardMaterial({
        color: 0xf8eedb,
        roughness: 0.5,
        metalness: 0.02,
        emissive: 0x452809,
        emissiveIntensity: 0.3,
      }),
    };

    this.setupLights();
    this.buildGoldenDustField();
    this.buildFloatingGoldLeafFlakes();
    this.buildJourneyLightRibbon();

    this.buildHeroEaselZone();
    this.buildChildhoodZone();
    this.buildArtPassionZone();
    this.buildThanaweyaLanternZone();
    this.buildOneStepBridgeZone();
    this.buildFineArtsSanctuaryZone();
    this.buildFinaleCandlesZone();
    this.buildCelebrationBurstSystem();

    this.applyResponsiveLayout();
    this.bindEvents();
    this.animate();
  }

  setInspectMode(enabled) {
    this.inspectMode = Boolean(enabled);
    if (!enabled) {
      this.orbitTarget.x = 0;
      this.orbitTarget.y = 0;
    }
  }

  setVisitorTheme(themeKey) {
    const preset = this.themePresets[themeKey] || this.themePresets.yomna;
    this.targetTheme = preset;
  }

  createRadialGlowTexture() {
    const size = 128;
    const c = document.createElement('canvas');
    c.width = size;
    c.height = size;
    const ctx = c.getContext('2d');
    const g = ctx.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2);
    g.addColorStop(0, 'rgba(255, 250, 232, 1)');
    g.addColorStop(0.28, 'rgba(244, 206, 120, 0.84)');
    g.addColorStop(0.62, 'rgba(205, 145, 58, 0.24)');
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
    g.addColorStop(0, 'rgba(255, 234, 170, 0.44)');
    g.addColorStop(0.55, 'rgba(235, 188, 96, 0.14)');
    g.addColorStop(1, 'rgba(235, 188, 96, 0)');
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
    this.ambientLight = new THREE.AmbientLight(0xffe8c6, 0.74);
    this.scene.add(this.ambientLight);

    this.hemiLight = new THREE.HemisphereLight(0xfff3dc, 0x261810, 0.62);
    this.scene.add(this.hemiLight);

    this.keyLight = new THREE.PointLight(0xffd288, 38, 42, 1.4);
    this.keyLight.position.set(3.5, 4.2, 6.5);
    this.scene.add(this.keyLight);

    this.rimLight = new THREE.PointLight(0xd8a056, 22, 42, 1.5);
    this.rimLight.position.set(-5.5, 2.5, 2.5);
    this.scene.add(this.rimLight);
  }

  /* ==================== PERSISTENT GOLDEN DUST FIELD ==================== */
  buildGoldenDustField() {
    const count = this.isMobile ? 420 : 760;
    const positions = new Float32Array(count * 3);
    const colors = new Float32Array(count * 3);
    const palette = [
      new THREE.Color(0xfae3a4),
      new THREE.Color(0xdcb056),
      new THREE.Color(0xfff7e8),
      new THREE.Color(0xd2835b),
    ];

    for (let i = 0; i < count; i++) {
      positions[i * 3] = (Math.random() - 0.5) * (this.isMobile ? 16 : 30);
      positions[i * 3 + 1] = (Math.random() - 0.5) * 16;
      positions[i * 3 + 2] = 14 - Math.random() * 108;

      const col = palette[i % palette.length];
      colors[i * 3] = col.r;
      colors[i * 3 + 1] = col.g;
      colors[i * 3 + 2] = col.b;
    }

    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geo.setAttribute('color', new THREE.BufferAttribute(colors, 3));

    const mat = new THREE.PointsMaterial({
      size: this.isMobile ? 0.25 : 0.22,
      map: this.glowTexture,
      vertexColors: true,
      transparent: true,
      opacity: 0.8,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });

    this.dustField = new THREE.Points(geo, mat);
    this.scene.add(this.dustField);
  }

  /* ==================== FLOATING METALLIC GOLD-LEAF FLAKES ==================== */
  buildFloatingGoldLeafFlakes() {
    const count = this.isMobile ? 48 : 90;
    const flakeGeo = new THREE.PlaneGeometry(0.14, 0.14);
    const flakeMat = new THREE.MeshStandardMaterial({
      color: 0xf2cd74,
      metalness: 0.92,
      roughness: 0.18,
      side: THREE.DoubleSide,
    });

    this.goldLeafMesh = new THREE.InstancedMesh(flakeGeo, flakeMat, count);
    this.dummyObj = new THREE.Object3D();

    for (let i = 0; i < count; i++) {
      this.goldLeafData.push({
        x: (Math.random() - 0.5) * (this.isMobile ? 9 : 16),
        y: (Math.random() - 0.5) * 9,
        z: 8 - Math.random() * 94,
        rotX: Math.random() * Math.PI,
        rotY: Math.random() * Math.PI,
        rotZ: Math.random() * Math.PI,
        speed: 0.4 + Math.random() * 0.9,
        scale: 0.5 + Math.random() * 1.1,
      });
    }

    this.scene.add(this.goldLeafMesh);
  }

  /* ==================== CONTINUOUS 3D GOLDEN MOTION-GRAPHIC RIBBON ==================== */
  buildJourneyLightRibbon() {
    const xAmp = this.isMobile ? 0.85 : 2.4;
    this.journeyCurve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(-xAmp * 0.85, -1.1, 3.2),
      new THREE.Vector3(xAmp, -0.75, -9.0),
      new THREE.Vector3(-xAmp, 0.2, -21.5),
      new THREE.Vector3(xAmp * 0.9, -0.45, -34.0),
      new THREE.Vector3(0.0, -0.25, -45.5),
      new THREE.Vector3(0.0, -0.1, -57.5),
      new THREE.Vector3(-xAmp * 0.7, -0.6, -69.0),
      new THREE.Vector3(0.0, -0.35, -81.0),
    ]);

    const tubeGeo = new THREE.TubeGeometry(this.journeyCurve, 220, 0.036, 8, false);
    const tubeMat = new THREE.MeshStandardMaterial({
      color: 0xf4cf76,
      emissive: 0xc98b2c,
      emissiveIntensity: 0.78,
      metalness: 0.85,
      roughness: 0.22,
      transparent: true,
      opacity: 0.76,
    });

    this.ribbonMesh = new THREE.Mesh(tubeGeo, tubeMat);
    this.scene.add(this.ribbonMesh);

    this.cometGroup = new THREE.Group();
    const cometCore = new THREE.Mesh(
      new THREE.SphereGeometry(0.15, 16, 16),
      new THREE.MeshBasicMaterial({ color: 0xfff3cb })
    );
    const cometGlow = new THREE.Sprite(
      new THREE.SpriteMaterial({
        map: this.glowTexture,
        color: 0xffd271,
        transparent: true,
        opacity: 0.96,
        blending: THREE.AdditiveBlending,
      })
    );
    cometGlow.scale.set(2.0, 2.0, 1);
    this.cometGroup.add(cometCore, cometGlow);
    this.scene.add(this.cometGroup);
  }

  /* ==================== ZONE 0: HERO WOODEN EASEL & PALETTE ==================== */
  buildHeroEaselZone() {
    const group = new THREE.Group();

    const easel = new THREE.Group();
    const legGeo = new THREE.BoxGeometry(0.11, 4.3, 0.11);

    const leftLeg = new THREE.Mesh(legGeo, this.materials.wood);
    leftLeg.position.set(-0.72, -0.35, 0);
    leftLeg.rotation.z = -0.14;
    leftLeg.rotation.x = -0.09;
    easel.add(leftLeg);

    const rightLeg = new THREE.Mesh(legGeo, this.materials.wood);
    rightLeg.position.set(0.72, -0.35, 0);
    rightLeg.rotation.z = 0.14;
    rightLeg.rotation.x = -0.09;
    easel.add(rightLeg);

    const backLeg = new THREE.Mesh(new THREE.BoxGeometry(0.1, 4.2, 0.1), this.materials.darkWood);
    backLeg.position.set(0, -0.45, -1.05);
    backLeg.rotation.x = 0.34;
    easel.add(backLeg);

    const mast = new THREE.Mesh(new THREE.BoxGeometry(0.12, 3.7, 0.1), this.materials.darkWood);
    mast.position.set(0, 0.1, -0.15);
    mast.rotation.x = -0.09;
    easel.add(mast);

    const shelf = new THREE.Mesh(new THREE.BoxGeometry(2.35, 0.1, 0.24), this.materials.wood);
    shelf.position.set(0, -0.78, 0.16);
    shelf.rotation.x = -0.09;
    easel.add(shelf);

    const artPath = this.config.chapters?.[3]?.image || './assets/art/chapter4-fine-arts.jpg';
    const framedCanvas = this.createFramedPainting(2.15, 1.62, artPath);
    framedCanvas.position.set(0, 0.18, 0.14);
    framedCanvas.rotation.x = -0.09;
    easel.add(framedCanvas);

    const clamp = new THREE.Mesh(new THREE.BoxGeometry(0.32, 0.12, 0.2), this.materials.gold);
    clamp.position.set(0, 1.07, 0.04);
    easel.add(clamp);

    group.add(easel);

    const palette = this.createArtistPalette();
    palette.position.set(1.42, -0.52, 0.9);
    palette.rotation.set(0.45, -0.5, 0.22);
    group.add(palette);
    this.animatedObjects.push({ mesh: palette, baseY: -0.52, speed: 1.15, amp: 0.14, rotY: 0.28 });

    const brush1 = this.createPaintbrush(0xd9804c);
    brush1.position.set(-1.42, 0.72, 0.75);
    brush1.rotation.set(0.3, 0.2, -0.65);
    group.add(brush1);
    this.animatedObjects.push({ mesh: brush1, baseY: 0.72, speed: 1.4, amp: 0.16, rotZ: 0.18 });

    const brush2 = this.createPaintbrush(0x4b749f);
    brush2.position.set(1.32, 0.95, 0.35);
    brush2.rotation.set(-0.25, 0.4, 0.52);
    group.add(brush2);
    this.animatedObjects.push({ mesh: brush2, baseY: 0.95, speed: 1.05, amp: 0.13, rotZ: -0.15 });

    const halo1 = new THREE.Mesh(new THREE.TorusGeometry(2.32, 0.018, 16, 128), this.materials.gold);
    halo1.position.set(0, 0.15, -0.3);
    halo1.rotation.set(0.35, 0.2, 0);
    group.add(halo1);

    const halo2 = new THREE.Mesh(new THREE.TorusGeometry(2.68, 0.01, 12, 128), this.materials.antiqueBrass);
    halo2.position.set(0, 0.15, -0.35);
    halo2.rotation.set(-0.42, 0.55, 0.2);
    group.add(halo2);

    this.heroGroup = group;
    this.heroHalos = [halo1, halo2];
    this.scene.add(group);
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
      roughness: 0.62,
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
      { color: 0xd06d47, x: -0.52, y: 0.44 },
      { color: 0xe6b94c, x: -0.1, y: 0.62 },
      { color: 0x3b638f, x: 0.36, y: 0.48 },
      { color: 0x6f8f69, x: 0.62, y: 0.12 },
      { color: 0xb64253, x: 0.52, y: -0.28 },
      { color: 0xf7efe0, x: 0.14, y: -0.44 },
    ];

    const dabGeo = new THREE.SphereGeometry(0.12, 16, 12);
    paints.forEach((p) => {
      const mat = new THREE.MeshPhysicalMaterial({
        color: p.color,
        roughness: 0.2,
        clearcoat: 0.85,
        clearcoatRoughness: 0.15,
      });
      const dab = new THREE.Mesh(dabGeo, mat);
      dab.scale.set(1.15, 0.88, 0.45);
      dab.position.set(p.x, p.y, 0.055);
      group.add(dab);
    });

    group.scale.setScalar(0.75);
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
      new THREE.MeshStandardMaterial({ color: tipColor, roughness: 0.5 })
    );
    bristles.position.y = 0.65;
    brush.add(handle, ferrule, bristles);
    return brush;
  }

  /* ==================== ZONE 1: CHILDHOOD FLOATING MEMORIES ==================== */
  buildChildhoodZone() {
    const group = new THREE.Group();
    group.position.set(0, 0, -10.5);

    const artPath = this.config.chapters?.[0]?.image || './assets/art/chapter1-childhood.jpg';
    const frame = this.createFramedPainting(2.1, 1.58, artPath);
    frame.position.set(2.9, 0.4, -1.2);
    frame.rotation.y = -0.38;
    group.add(frame);
    this.animatedObjects.push({ mesh: frame, baseY: 0.4, speed: 0.9, amp: 0.18 });

    const pastelColors = [0xe8b959, 0xd47654, 0x7094b8, 0x83a67b, 0xd992a0];
    pastelColors.forEach((hex, idx) => {
      const pencil = new THREE.Group();
      const shaft = new THREE.Mesh(
        new THREE.CylinderGeometry(0.045, 0.045, 1.15, 6),
        new THREE.MeshStandardMaterial({ color: hex, roughness: 0.45 })
      );
      const cone = new THREE.Mesh(
        new THREE.ConeGeometry(0.045, 0.18, 6),
        new THREE.MeshStandardMaterial({ color: 0xe6cfa8, roughness: 0.7 })
      );
      cone.position.y = 0.66;
      pencil.add(shaft, cone);

      const angle = (idx / pastelColors.length) * Math.PI * 2;
      pencil.position.set(
        -2.5 + Math.cos(angle) * 1.25,
        -0.3 + Math.sin(angle) * 1.0,
        (idx - 2) * 0.7
      );
      pencil.rotation.set(0.4 + idx * 0.2, idx * 0.5, 0.6);
      group.add(pencil);
      this.animatedObjects.push({
        mesh: pencil,
        baseY: pencil.position.y,
        speed: 1.0 + idx * 0.15,
        amp: 0.16,
        rotY: 0.35,
      });
    });

    this.responsiveGroups.push({ group, mobileScale: 0.58 });
    this.scene.add(group);
  }

  /* ==================== ZONE 2: ART PASSION & GOLDEN GEOMETRY ==================== */
  buildArtPassionZone() {
    const group = new THREE.Group();
    group.position.set(0, 0, -22.5);

    const geomCore = new THREE.Group();
    geomCore.position.set(-2.6, 0.15, -0.8);

    const icoWire = new THREE.Mesh(
      new THREE.IcosahedronGeometry(1.48, 0),
      new THREE.MeshStandardMaterial({
        color: 0xe8c36e,
        metalness: 0.9,
        roughness: 0.2,
        wireframe: true,
      })
    );
    const innerGem = new THREE.Mesh(new THREE.OctahedronGeometry(0.68, 0), this.materials.marble);
    const orbitRing = new THREE.Mesh(new THREE.TorusGeometry(2.05, 0.018, 12, 96), this.materials.gold);
    orbitRing.rotation.x = 1.15;
    geomCore.add(icoWire, innerGem, orbitRing);

    group.add(geomCore);
    this.passionSculpture = { group: geomCore, icoWire, innerGem, orbitRing };

    const palette2 = this.createArtistPalette();
    palette2.position.set(2.9, -0.25, -1.6);
    palette2.rotation.set(0.25, -0.6, -0.2);
    group.add(palette2);
    this.animatedObjects.push({ mesh: palette2, baseY: -0.25, speed: 1.0, amp: 0.18, rotY: -0.25 });

    this.responsiveGroups.push({ group, mobileScale: 0.58 });
    this.scene.add(group);
  }

  /* ==================== ZONE 3: THANAWEYA AMMA HOPE LANTERNS ==================== */
  buildThanaweyaLanternZone() {
    const group = new THREE.Group();
    group.position.set(0, 0, -34.5);

    const orbGeo = new THREE.SphereGeometry(0.22, 16, 16);
    const haloMat = new THREE.SpriteMaterial({
      map: this.glowTexture,
      color: 0xffcf77,
      transparent: true,
      opacity: 0.85,
      blending: THREE.AdditiveBlending,
    });

    for (let i = 0; i < 18; i++) {
      const lantern = new THREE.Group();
      const core = new THREE.Mesh(
        orbGeo,
        new THREE.MeshStandardMaterial({
          color: 0xffe4a8,
          emissive: 0xffb347,
          emissiveIntensity: 1.5,
          roughness: 0.2,
        })
      );
      const ring = new THREE.Mesh(new THREE.TorusGeometry(0.32, 0.014, 8, 32), this.materials.gold);
      ring.rotation.x = Math.PI / 2;
      const glow = new THREE.Sprite(haloMat);
      glow.scale.set(1.45, 1.45, 1);

      lantern.add(core, ring, glow);

      const side = i % 2 === 0 ? -1 : 1;
      const x = side * (1.5 + Math.random() * 3.4);
      const y = (Math.random() - 0.5) * 6.0;
      const z = (Math.random() - 0.5) * 8;
      lantern.position.set(x, y, z);
      lantern.scale.setScalar(0.65 + Math.random() * 0.62);

      group.add(lantern);
      this.lanterns.push({
        mesh: lantern,
        baseX: x,
        speedY: 0.28 + Math.random() * 0.35,
        phase: Math.random() * Math.PI * 2,
      });
    }

    this.responsiveGroups.push({ group, mobileScale: 0.62 });
    this.scene.add(group);
  }

  /* ==================== ZONE 4: ONE-STEP GOLDEN BRIDGE ==================== */
  buildOneStepBridgeZone() {
    const group = new THREE.Group();
    group.position.set(0, -0.2, -46);

    this.bridgeSteps = [];
    for (let i = 0; i < 6; i++) {
      const stepGroup = new THREE.Group();
      const disc = new THREE.Mesh(
        new THREE.CylinderGeometry(0.95 - i * 0.04, 1.05 - i * 0.04, 0.08, 32),
        this.materials.marble
      );
      const rim = new THREE.Mesh(
        new THREE.TorusGeometry(0.98 - i * 0.04, 0.024, 10, 48),
        this.materials.goldGlow
      );
      rim.rotation.x = Math.PI / 2;
      rim.position.y = 0.04;
      stepGroup.add(disc, rim);
      stepGroup.position.set(0, -2.0 + i * 0.14, 3.4 - i * 1.45);
      group.add(stepGroup);
      this.bridgeSteps.push({ mesh: stepGroup, baseY: stepGroup.position.y, phase: i * 0.7 });
    }

    const compassOuter = new THREE.Mesh(new THREE.TorusGeometry(3.2, 0.022, 12, 128), this.materials.gold);
    const compassInner = new THREE.Mesh(new THREE.TorusGeometry(2.55, 0.014, 12, 128), this.materials.antiqueBrass);
    compassOuter.position.set(0, 0.4, -1.5);
    compassInner.position.set(0, 0.4, -1.5);
    group.add(compassOuter, compassInner);
    this.bridgeCompass = { outer: compassOuter, inner: compassInner };

    this.responsiveGroups.push({ group, mobileScale: 0.68 });
    this.scene.add(group);
  }

  /* ==================== ZONE 5: GRAND NEOCLASSICAL FINE ARTS ARCHWAY ==================== */
  buildFineArtsSanctuaryZone() {
    const group = new THREE.Group();
    group.position.set(0, -0.45, -58.5);

    const buildColumn = (x, z, h = 5.6) => {
      const col = new THREE.Group();
      const shaft = new THREE.Mesh(new THREE.CylinderGeometry(0.32, 0.37, h, 18), this.materials.marble);
      const base = new THREE.Mesh(new THREE.BoxGeometry(1.1, 0.36, 1.1), this.materials.marble);
      base.position.y = -h / 2 - 0.18;
      const baseGold = new THREE.Mesh(new THREE.CylinderGeometry(0.44, 0.48, 0.15, 24), this.materials.gold);
      baseGold.position.y = -h / 2 + 0.08;
      const capital = new THREE.Mesh(new THREE.BoxGeometry(1.08, 0.3, 1.08), this.materials.marble);
      capital.position.y = h / 2 + 0.14;
      const capGold = new THREE.Mesh(new THREE.CylinderGeometry(0.46, 0.34, 0.18, 24), this.materials.gold);
      capGold.position.y = h / 2 - 0.08;

      col.add(shaft, base, baseGold, capital, capGold);
      col.position.set(x, 0, z);
      return col;
    };

    group.add(buildColumn(-3.2, -1.2));
    group.add(buildColumn(3.2, -1.2));
    group.add(buildColumn(-4.8, -4.6));
    group.add(buildColumn(4.8, -4.6));

    const archCurve = new THREE.Mesh(
      new THREE.TorusGeometry(3.2, 0.24, 16, 64, Math.PI),
      this.materials.marble
    );
    archCurve.position.set(0, 2.85, -1.2);
    const archGoldTrim = new THREE.Mesh(
      new THREE.TorusGeometry(2.96, 0.05, 12, 64, Math.PI),
      this.materials.goldGlow
    );
    archGoldTrim.position.set(0, 2.85, -1.05);
    group.add(archCurve, archGoldTrim);

    const beamMat = new THREE.MeshBasicMaterial({
      map: this.beamTexture,
      transparent: true,
      opacity: 0.48,
      blending: THREE.AdditiveBlending,
      side: THREE.DoubleSide,
      depthWrite: false,
    });
    for (let i = -1; i <= 1; i++) {
      const beam = new THREE.Mesh(new THREE.PlaneGeometry(2.2, 8.8), beamMat);
      beam.position.set(i * 1.35, 1.4, -2.6);
      beam.rotation.z = -0.22 + i * 0.06;
      beam.rotation.y = i * 0.15;
      group.add(beam);
    }

    const pedestalGroup = new THREE.Group();
    pedestalGroup.position.set(0, -0.35, -3.4);

    const plinth = new THREE.Mesh(new THREE.CylinderGeometry(0.75, 0.94, 1.9, 24), this.materials.marble);
    plinth.position.y = -1.65;
    const plinthRing = new THREE.Mesh(new THREE.TorusGeometry(0.78, 0.038, 14, 48), this.materials.gold);
    plinthRing.rotation.x = Math.PI / 2;
    plinthRing.position.y = -0.68;

    const sculpture = new THREE.Mesh(
      new THREE.TorusKnotGeometry(0.84, 0.24, 112, 20, 2, 3),
      this.materials.marble
    );
    sculpture.position.y = 0.65;

    const goldCrown = new THREE.Mesh(new THREE.TorusGeometry(1.62, 0.02, 12, 96), this.materials.goldGlow);
    goldCrown.position.y = 0.65;

    pedestalGroup.add(plinth, plinthRing, sculpture, goldCrown);
    group.add(pedestalGroup);
    this.fineArtsSculpture = { sculpture, goldCrown };

    this.responsiveGroups.push({ group, mobileScale: 0.64 });
    this.scene.add(group);
  }

  /* ==================== ZONE 7: FINALE — 19 FLOATING GOLDEN CANDLES ==================== */
  buildFinaleCandlesZone() {
    const group = new THREE.Group();
    group.position.set(0, 0, -82);

    const candleGeo = new THREE.CylinderGeometry(0.075, 0.085, 0.72, 14);
    const holderGeo = new THREE.CylinderGeometry(0.13, 0.07, 0.08, 14);
    const flameGeo = new THREE.ConeGeometry(0.055, 0.22, 12);
    const flameMat = new THREE.MeshBasicMaterial({ color: 0xffe699 });
    const glowMat = new THREE.SpriteMaterial({
      map: this.glowTexture,
      color: 0xffc65c,
      transparent: true,
      opacity: 0.92,
      blending: THREE.AdditiveBlending,
    });

    const totalCandles = 19;
    for (let i = 0; i < totalCandles; i++) {
      const candleUnit = new THREE.Group();
      const wax = new THREE.Mesh(candleGeo, this.materials.candleWax);
      const holder = new THREE.Mesh(holderGeo, this.materials.gold);
      holder.position.y = -0.38;

      const flameGroup = new THREE.Group();
      flameGroup.position.y = 0.48;
      const flameMesh = new THREE.Mesh(flameGeo, flameMat);
      const flameGlow = new THREE.Sprite(glowMat.clone());
      flameGlow.scale.set(0.95, 0.95, 1);

      flameGroup.add(flameMesh, flameGlow);
      candleUnit.add(wax, holder, flameGroup);

      const t = i / (totalCandles - 1);
      const angle = (t - 0.5) * Math.PI * 1.45;
      const radius = 3.7 + (i % 3) * 0.55;
      const x = Math.sin(angle) * radius;
      const z = -Math.cos(angle) * radius + 1.2;
      const y = -1.5 + Math.sin(t * Math.PI) * 2.4 + ((i % 2) * 0.5 - 0.25);

      candleUnit.position.set(x, y, z);
      group.add(candleUnit);

      this.candles.push({ group: candleUnit, baseY: y, phase: i * 0.65 });
      this.flames.push({ group: flameGroup, glow: flameGlow, phase: i * 1.1 });
    }

    this.finaleLight = new THREE.PointLight(0xffcb74, 30, 26, 1.5);
    this.finaleLight.position.set(0, 1.5, -81);
    this.scene.add(this.finaleLight);

    this.responsiveGroups.push({ group, mobileScale: 0.66 });
    this.scene.add(group);
  }

  /* ==================== CELEBRATION 3D GOLDEN BURST ==================== */
  buildCelebrationBurstSystem() {
    const count = this.isMobile ? 220 : 380;
    const positions = new Float32Array(count * 3);
    const colors = new Float32Array(count * 3);
    this.burstVelocities = [];

    const palette = [
      new THREE.Color(0xffe7a0),
      new THREE.Color(0xf2bd55),
      new THREE.Color(0xffffff),
      new THREE.Color(0xd97a54),
      new THREE.Color(0x9cb896),
    ];

    for (let i = 0; i < count; i++) {
      positions[i * 3] = 0;
      positions[i * 3 + 1] = 0;
      positions[i * 3 + 2] = -81;

      const c = palette[i % palette.length];
      colors[i * 3] = c.r;
      colors[i * 3 + 1] = c.g;
      colors[i * 3 + 2] = c.b;

      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);
      const speed = 2.6 + Math.random() * 5.6;
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

  /* ==================== DYNAMIC DESKTOP / MOBILE RESPONSIVE FRAMING ==================== */
  applyResponsiveLayout() {
    const w = window.innerWidth;
    const h = Math.max(1, window.innerHeight);
    const aspect = w / h;
    this.isMobile = w < 900;
    const isPortrait = aspect < 0.9;

    this.camera.aspect = aspect;
    this.camera.fov = isPortrait ? 64 : aspect < 1.15 ? 54 : 46;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(w, h);

    if (this.heroGroup) {
      if (this.isMobile) {
        // Centered & elevated into the mobile top 3D showcase window!
        this.heroGroup.position.set(0, isPortrait ? 1.55 : 0.75, 1.3);
        this.heroGroup.scale.setScalar(isPortrait ? 0.62 : 0.74);
      } else {
        this.heroGroup.position.set(-2.45, -0.15, 1.6);
        this.heroGroup.scale.setScalar(1);
      }
    }

    for (const entry of this.responsiveGroups) {
      const s = isPortrait ? entry.mobileScale : this.isMobile ? 0.8 : 1;
      entry.group.scale.set(s, s, 1);
    }
  }

  triggerWishCelebration(blowOut = true) {
    this.candlesLit = !blowOut;
    if (blowOut) {
      this.wishBurstTime = 0;
      const pos = this.burstPoints.geometry.attributes.position.array;
      for (let i = 0; i < this.burstVelocities.length; i++) {
        pos[i * 3] = (Math.random() - 0.5) * 1.4;
        pos[i * 3 + 1] = -0.2 + (Math.random() - 0.5) * 0.8;
        pos[i * 3 + 2] = -81 + (Math.random() - 0.5) * 1.2;
      }
      this.burstPoints.geometry.attributes.position.needsUpdate = true;
      this.burstPoints.material.opacity = 1;
    }
  }

  setScrollProgress(progress) {
    this.scrollProgress = Math.max(0, Math.min(1, progress));
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
          this.orbitTarget.x = Math.max(-2.6, Math.min(2.6, dx * 4.8));
          this.orbitTarget.y = Math.max(-1.4, Math.min(1.4, -dy * 2.8));
        }
      },
      { passive: true }
    );

    // Preserve native smooth vertical touch scrolling on mobile!
    // Allow drag-to-orbit on desktop mouse anytime, OR on mobile touch inside 3D Inspect Mode.
    this.canvas.addEventListener('pointerdown', (e) => {
      if (e.pointerType === 'touch' && !this.inspectMode) return;
      this.isDragging = true;
      this.dragStart.x = e.clientX;
      this.dragStart.y = e.clientY;
    });

    const endDrag = () => {
      this.isDragging = false;
      this.orbitTarget.x = 0;
      this.orbitTarget.y = 0;
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

    this.smoothScroll += (this.scrollProgress - this.smoothScroll) * 0.075;
    this.smoothPointer.x += (this.pointer.x - this.smoothPointer.x) * 0.06;
    this.smoothPointer.y += (this.pointer.y - this.smoothPointer.y) * 0.06;
    this.orbitCurrent.x += (this.orbitTarget.x - this.orbitCurrent.x) * 0.08;
    this.orbitCurrent.y += (this.orbitTarget.y - this.orbitCurrent.y) * 0.08;

    const zPullBack = this.isMobile ? 1.8 : 0;
    const targetZ = 8.6 + zPullBack - this.smoothScroll * 84.4;
    const curveSway = Math.sin(this.smoothScroll * Math.PI * 3.2) * (this.isMobile ? 0.35 : 0.95);
    const autoMobileParallax = this.isMobile && !this.inspectMode ? Math.sin(t * 0.45) * 0.28 : 0;

    const targetX = curveSway + this.smoothPointer.x * 0.6 + autoMobileParallax + this.orbitCurrent.x;
    const targetY =
      0.38 + Math.cos(this.smoothScroll * Math.PI * 2.2) * 0.22 + this.smoothPointer.y * 0.32 + this.orbitCurrent.y;

    this.camera.position.set(targetX, targetY, targetZ);
    this.camera.lookAt(
      this.smoothPointer.x * 0.25 - this.orbitCurrent.x * 0.22,
      0.08 + this.smoothPointer.y * 0.16,
      targetZ - 9.2
    );
    this.camera.rotation.z += -curveSway * 0.014;

    if (this.journeyCurve && this.cometGroup) {
      const cometT = Math.min(0.995, Math.max(0.01, this.smoothScroll * 0.96 + 0.03));
      const pt = this.journeyCurve.getPointAt(cometT);
      this.cometGroup.position.copy(pt);
      this.cometGroup.scale.setScalar(1.0 + Math.sin(t * 5.2) * 0.18);
    }

    this.keyLight.position.set(targetX + 3.4, targetY + 4.0, targetZ - 2.6);
    this.rimLight.position.set(targetX - 5.0, targetY + 2.0, targetZ - 6.8);

    const twilightFactor = Math.exp(-Math.pow((this.smoothScroll - 0.42) / 0.12, 2));
    const fineArtsGlow = Math.exp(-Math.pow((this.smoothScroll - 0.66) / 0.14, 2));

    // Smoothly morph base 3D lighting & atmosphere to match selected Visitor Persona
    this.curKeyColor.lerp(new THREE.Color(this.targetTheme.key), 0.05);
    this.curRimBase.lerp(new THREE.Color(this.targetTheme.rim), 0.05);
    this.curFogBase.lerp(new THREE.Color(this.targetTheme.fog), 0.05);

    this.keyLight.color.copy(this.curKeyColor);
    const twilightRim = new THREE.Color(0x4b74b8);
    this.rimLight.color.copy(this.curRimBase).lerp(twilightRim, twilightFactor * 0.75);
    this.keyLight.intensity = 38 + fineArtsGlow * 16;

    const twilightFog = new THREE.Color(0x0c1222);
    this.scene.fog.color.copy(this.curFogBase).lerp(twilightFog, twilightFactor * 0.65);

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

    if (this.heroGroup) {
      const baseRotY = this.isMobile ? 0.08 : 0.34;
      this.heroGroup.rotation.y = baseRotY + Math.sin(t * 0.48) * 0.12 + this.smoothPointer.x * 0.14;
      this.heroHalos[0].rotation.z = t * 0.18;
      this.heroHalos[1].rotation.z = -t * 0.12;
      this.heroHalos[1].rotation.x = -0.42 + Math.sin(t * 0.35) * 0.12;
    }

    for (const obj of this.animatedObjects) {
      obj.mesh.position.y = obj.baseY + Math.sin(t * obj.speed) * obj.amp;
      if (obj.rotY) obj.mesh.rotation.y += obj.rotY * dt;
      if (obj.rotZ) obj.mesh.rotation.z += Math.sin(t * 0.8) * obj.rotZ * dt;
    }

    if (this.passionSculpture) {
      this.passionSculpture.icoWire.rotation.y = t * 0.25;
      this.passionSculpture.icoWire.rotation.x = t * 0.14;
      this.passionSculpture.innerGem.rotation.y = -t * 0.42;
      this.passionSculpture.orbitRing.rotation.z = t * 0.3;
    }

    for (const l of this.lanterns) {
      l.mesh.position.y += l.speedY * dt;
      l.mesh.position.x = l.baseX + Math.sin(t * 0.8 + l.phase) * 0.22;
      if (l.mesh.position.y > 4.2) l.mesh.position.y = -3.8;
    }

    if (this.bridgeSteps) {
      for (const s of this.bridgeSteps) {
        s.mesh.position.y = s.baseY + Math.sin(t * 1.4 + s.phase) * 0.09;
      }
      this.bridgeCompass.outer.rotation.z = t * 0.15;
      this.bridgeCompass.outer.rotation.y = Math.sin(t * 0.3) * 0.25;
      this.bridgeCompass.inner.rotation.z = -t * 0.22;
      this.bridgeCompass.inner.rotation.x = 0.45 + Math.cos(t * 0.35) * 0.2;
    }

    if (this.fineArtsSculpture) {
      this.fineArtsSculpture.sculpture.rotation.y = t * 0.28;
      this.fineArtsSculpture.sculpture.rotation.x = Math.sin(t * 0.35) * 0.15;
      this.fineArtsSculpture.goldCrown.rotation.x = 0.6 + Math.sin(t * 0.4) * 0.3;
      this.fineArtsSculpture.goldCrown.rotation.y = -t * 0.32;
    }

    for (let i = 0; i < this.candles.length; i++) {
      const c = this.candles[i];
      c.group.position.y = c.baseY + Math.sin(t * 1.1 + c.phase) * 0.14;

      const f = this.flames[i];
      const targetScale = this.candlesLit ? 0.92 + Math.sin(t * 9.5 + f.phase) * 0.14 : 0.001;
      f.group.scale.lerp(new THREE.Vector3(targetScale, targetScale, targetScale), 0.12);
      f.glow.material.opacity = THREE.MathUtils.lerp(
        f.glow.material.opacity,
        this.candlesLit ? 0.88 + Math.sin(t * 7 + f.phase) * 0.12 : 0,
        0.1
      );
    }

    if (this.finaleLight) {
      const targetIntensity = this.candlesLit ? 30 + Math.sin(t * 6) * 2.5 : 10;
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
      this.dustField.position.y = Math.sin(t * 0.18) * 0.25;
    }

    this.renderer.render(this.scene, this.camera);
  }
}
