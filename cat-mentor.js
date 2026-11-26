/**
 * =========================================================================
 *  3D Fluffy Golden-Cream Persian/Shirazi Cat Mentor Engine (Three.js)
 *  - Faithfully modeled on Yomna's real fluffy golden-apricot Shirazi cat:
 *    plush round face, honey-amber sparkling eyes with real eyelids/blinking,
 *    rosy pink nose, animated pink tongue, cream mane/chest ruff, whiskers,
 *    pink toe-beans, and 5-segment articulated fluffy plume tail.
 *  - Full Procedural Animation State Machine:
 *    'guide' (attentive sitting + head tracking + ear twitch + blink)
 *    'run'   (4-leg feline trot/gallop across the screen following the journey!)
 *    'groom' (classic paw-licking + cheek-washing + flank-licking with animated pink tongue!)
 *    'play'  (crouching, hopping & batting a 3D bouncing golden yarn ball!)
 *    'pet'   (happy closed-eye purr wiggle + golden heart/star sparkles!)
 *  - Locked 60FPS, zero external assets, 100% CSP compliant.
 * =========================================================================
 */

import * as THREE from './vendor/three.module.min.js';

export class CatMentor3D {
  constructor(canvas, stageWrapper, onStateChange = null) {
    this.canvas = canvas;
    this.stageWrapper = stageWrapper;
    this.onStateChange = onStateChange;

    this.state = 'guide'; // 'guide' | 'run' | 'groom' | 'play' | 'pet'
    this.stateTimer = 0;
    this.stateDuration = 6;
    this.groomStyle = 0; // 0 = paw-lick & face-wash, 1 = flank-licking

    // Horizontal screen roaming coordinates (px offset from right edge, negative = left)
    this.roamX = 0;
    this.targetRoamX = 0;
    this.facingDir = 0; // 0 = face viewer, -1 = face left, +1 = face right
    this.smoothFacing = 0;

    // Natural micro-life timers
    this.blinkTimer = 2.4;
    this.blinkProgress = 0;
    this.earTwitchTimer = 3.5;
    this.autoBehaviorTimer = 9.0;
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

  /* ==================== PROCEDURAL FUR & EYE TEXTURES ==================== */
  createFurTexture(baseHex, streakHex, highlightHex) {
    const c = document.createElement('canvas');
    c.width = 256;
    c.height = 256;
    const ctx = c.getContext('2d');
    ctx.fillStyle = baseHex;
    ctx.fillRect(0, 0, 256, 256);

    // Layered directional soft fur strokes for plush Shirazi coat look
    for (let i = 0; i < 1400; i++) {
      const x = Math.random() * 256;
      const y = Math.random() * 256;
      const len = 8 + Math.random() * 18;
      ctx.strokeStyle = i % 3 === 0 ? highlightHex : streakHex;
      ctx.globalAlpha = 0.14 + Math.random() * 0.22;
      ctx.lineWidth = 1 + Math.random() * 1.4;
      ctx.beginPath();
      ctx.moveTo(x, y);
      ctx.lineTo(x + (Math.random() - 0.5) * 4, y + len);
      ctx.stroke();
    }
    ctx.globalAlpha = 1;
    const tex = new THREE.CanvasTexture(c);
    tex.colorSpace = THREE.SRGBColorSpace;
    tex.wrapS = THREE.RepeatWrapping;
    tex.wrapT = THREE.RepeatWrapping;
    return tex;
  }

  createEyeTexture() {
    // Exact 2:1 equirectangular canvas so the iris & pupil map onto the 3D eyeball with ZERO distortion!
    const c = document.createElement('canvas');
    c.width = 384;
    c.height = 192;
    const ctx = c.getContext('2d');
    const cx = 192;
    const cy = 96;

    // Warm golden-cream sclera backdrop so edges blend softly with fur
    ctx.fillStyle = '#3a2210';
    ctx.fillRect(0, 0, 384, 192);

    // Rich honey-amber iris matching her real expressive eyes
    const irisGrad = ctx.createRadialGradient(cx, cy, 12, cx, cy, 52);
    irisGrad.addColorStop(0, '#5a310e');
    irisGrad.addColorStop(0.58, '#a06322');
    irisGrad.addColorStop(0.86, '#754112');
    irisGrad.addColorStop(1, '#261204');
    ctx.fillStyle = irisGrad;
    ctx.beginPath();
    ctx.arc(cx, cy, 52, 0, Math.PI * 2);
    ctx.fill();

    // Fine golden iris fibers
    ctx.strokeStyle = 'rgba(248, 206, 118, 0.28)';
    ctx.lineWidth = 1.2;
    for (let i = 0; i < 32; i++) {
      const a = (i / 32) * Math.PI * 2;
      ctx.beginPath();
      ctx.moveTo(cx + Math.cos(a) * 20, cy + Math.sin(a) * 20);
      ctx.lineTo(cx + Math.cos(a) * 48, cy + Math.sin(a) * 48);
      ctx.stroke();
    }

    // Large soulful kitten pupil
    ctx.fillStyle = '#120803';
    ctx.beginPath();
    ctx.ellipse(cx, cy, 25, 31, 0, 0, Math.PI * 2);
    ctx.fill();

    // Crisp double Pixar specular catchlights
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.arc(cx - 14, cy - 15, 9.5, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = 'rgba(255, 252, 240, 0.9)';
    ctx.beginPath();
    ctx.arc(cx + 13, cy + 11, 4.5, 0, Math.PI * 2);
    ctx.fill();

    const tex = new THREE.CanvasTexture(c);
    tex.colorSpace = THREE.SRGBColorSpace;
    return tex;
  }

  /* ==================== INIT RENDERER & LIGHTS ==================== */
  init() {
    this.renderer = new THREE.WebGLRenderer({
      canvas: this.canvas,
      antialias: true,
      alpha: true,
      powerPreference: 'high-performance',
    });
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.6));
    this.renderer.outputColorSpace = THREE.SRGBColorSpace;
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.18;

    this.scene = new THREE.Scene();
    this.camera = new THREE.PerspectiveCamera(34, 1, 0.1, 40);
    this.camera.position.set(0, 1.02, 4.15);
    this.camera.lookAt(0, 0.62, 0);

    // Warm studio 3-point lighting tailored to showcase golden-cream fur
    const hemi = new THREE.HemisphereLight(0xfff6e5, 0x3b2616, 1.25);
    this.scene.add(hemi);

    const key = new THREE.DirectionalLight(0xffe9c7, 1.85);
    key.position.set(2.8, 4.5, 4.2);
    this.scene.add(key);

    const rim = new THREE.DirectionalLight(0xf6ca72, 1.15);
    rim.position.set(-3.0, 2.2, -2.5);
    this.scene.add(rim);

    // Rich Shirazi Fur & Detail Materials
    const mainFurTex = this.createFurTexture('#e5b071', '#c7833f', '#f7deb6');
    const creamFurTex = this.createFurTexture('#f6e1be', '#e2bc86', '#fff6e6');
    const darkFurTex = this.createFurTexture('#d5944e', '#b56f2e', '#ecc189');
    const eyeTex = this.createEyeTexture();

    this.mats = {
      furMain: new THREE.MeshStandardMaterial({ map: mainFurTex, roughness: 0.84, metalness: 0.02 }),
      furCream: new THREE.MeshStandardMaterial({ map: creamFurTex, roughness: 0.86, metalness: 0.02 }),
      furGinger: new THREE.MeshStandardMaterial({ map: darkFurTex, roughness: 0.84, metalness: 0.02 }),
      innerEar: new THREE.MeshStandardMaterial({ color: 0xe6a8a0, roughness: 0.72 }),
      nose: new THREE.MeshStandardMaterial({ color: 0xd97d6e, roughness: 0.42, metalness: 0.05 }),
      tongue: new THREE.MeshStandardMaterial({ color: 0xea7e8a, roughness: 0.36 }),
      toeBean: new THREE.MeshStandardMaterial({ color: 0xe597a0, roughness: 0.55 }),
      eye: new THREE.MeshStandardMaterial({ map: eyeTex, roughness: 0.14, metalness: 0.12 }),
      whisker: new THREE.MeshStandardMaterial({ color: 0xfff6e8, roughness: 0.5 }),
      collar: new THREE.MeshStandardMaterial({ color: 0x2b1b12, roughness: 0.55 }),
      gold: new THREE.MeshStandardMaterial({ color: 0xf4cd72, metalness: 0.85, roughness: 0.2 }),
      yarn: new THREE.MeshStandardMaterial({ color: 0xe8b956, roughness: 0.76, metalness: 0.12 }),
      yarnStripe: new THREE.MeshStandardMaterial({ color: 0xfbe5a2, roughness: 0.62, metalness: 0.22 }),
    };

    this.buildSoftShadowDisc();
    this.buildShiraziCat();
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
    const g = ctx.createRadialGradient(64, 64, 6, 64, 64, 60);
    g.addColorStop(0, 'rgba(0, 0, 0, 0.52)');
    g.addColorStop(0.65, 'rgba(0, 0, 0, 0.18)');
    g.addColorStop(1, 'rgba(0, 0, 0, 0)');
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, 128, 128);
    const tex = new THREE.CanvasTexture(c);
    this.shadowDisc = new THREE.Mesh(
      new THREE.PlaneGeometry(1.75, 1.3),
      new THREE.MeshBasicMaterial({ map: tex, transparent: true, depthWrite: false })
    );
    this.shadowDisc.rotation.x = -Math.PI / 2;
    this.shadowDisc.position.y = 0.01;
    this.scene.add(this.shadowDisc);
  }

  /* ==================== SCULPT FLUFFY GOLDEN PERSIAN CAT ==================== */
  buildShiraziCat() {
    this.catRoot = new THREE.Group();
    this.scene.add(this.catRoot);

    // Body rig (allows crouching, sitting upright, bouncing, and leaning!)
    this.bodyGroup = new THREE.Group();
    this.bodyGroup.position.set(0, 0.56, 0);
    this.catRoot.add(this.bodyGroup);

    // Plush Torso + Rounded Haunches
    const torso = new THREE.Mesh(new THREE.SphereGeometry(0.46, 22, 18), this.mats.furMain);
    torso.scale.set(0.95, 0.88, 1.24);
    this.bodyGroup.add(torso);

    const haunch = new THREE.Mesh(new THREE.SphereGeometry(0.42, 20, 16), this.mats.furGinger);
    haunch.scale.set(1.02, 0.9, 0.95);
    haunch.position.set(0, -0.04, -0.26);
    this.bodyGroup.add(haunch);

    // Soft Cream Belly & Iconic Fluffy Persian Lion-Mane Chest Ruff!
    const belly = new THREE.Mesh(new THREE.SphereGeometry(0.35, 16, 14), this.mats.furCream);
    belly.scale.set(0.86, 0.82, 1.02);
    belly.position.set(0, -0.1, 0.14);
    this.bodyGroup.add(belly);

    this.chestRuff = new THREE.Group();
    this.chestRuff.position.set(0, 0.14, 0.34);
    const ruffPuffGeo = new THREE.SphereGeometry(0.21, 14, 12);
    const ruffOffsets = [
      [0, -0.08, 0.14, 1.35],
      [-0.18, -0.02, 0.08, 1.08],
      [0.18, -0.02, 0.08, 1.08],
      [-0.25, 0.08, -0.02, 0.95],
      [0.25, 0.08, -0.02, 0.95],
      [0, -0.18, 0.1, 1.0],
    ];
    ruffOffsets.forEach(([x, y, z, s]) => {
      const tuft = new THREE.Mesh(ruffPuffGeo, this.mats.furCream);
      tuft.position.set(x, y, z);
      tuft.scale.set(s, s * 0.92, s * 0.86);
      this.chestRuff.add(tuft);
    });
    this.bodyGroup.add(this.chestRuff);

    // Tiny Royal Atelier Velvet & Gold Bell Collar
    const collar = new THREE.Mesh(new THREE.TorusGeometry(0.28, 0.028, 10, 28), this.mats.collar);
    collar.rotation.x = Math.PI / 2 + 0.32;
    collar.position.set(0, 0.24, 0.3);
    const bell = new THREE.Mesh(new THREE.SphereGeometry(0.058, 12, 10), this.mats.gold);
    bell.position.set(0, 0.12, 0.56);
    this.bodyGroup.add(collar, bell);

    // ==================== HEAD GROUP ====================
    this.headGroup = new THREE.Group();
    this.headGroup.position.set(0, 0.45, 0.42);
    this.bodyGroup.add(this.headGroup);

    // Round Plush Shirazi Skull
    const skull = new THREE.Mesh(new THREE.SphereGeometry(0.39, 24, 20), this.mats.furMain);
    skull.scale.set(1.08, 0.96, 0.98);
    this.headGroup.add(skull);

    // Fluffy Cheek Fur Puffs (classic chubby Shirazi silhouette from Photos #1 & #5!)
    const cheekGeo = new THREE.SphereGeometry(0.21, 14, 12);
    const cheekL = new THREE.Mesh(cheekGeo, this.mats.furCream);
    cheekL.scale.set(1.12, 0.86, 0.85);
    cheekL.position.set(-0.27, -0.08, 0.12);
    const cheekR = cheekL.clone();
    cheekR.position.x = 0.27;
    this.headGroup.add(cheekL, cheekR);

    // Forehead warm caramel fluff crown
    const crownTuft = new THREE.Mesh(new THREE.SphereGeometry(0.18, 14, 12), this.mats.furGinger);
    crownTuft.scale.set(1.25, 0.55, 0.92);
    crownTuft.position.set(0, 0.28, 0.02);
    this.headGroup.add(crownTuft);

    // Soft Cream Double Muzzle Whisker Pads + Chin
    const padGeo = new THREE.SphereGeometry(0.105, 14, 12);
    const padL = new THREE.Mesh(padGeo, this.mats.furCream);
    padL.scale.set(1.05, 0.88, 0.92);
    padL.position.set(-0.082, -0.085, 0.34);
    const padR = padL.clone();
    padR.position.x = 0.082;
    const chin = new THREE.Mesh(new THREE.SphereGeometry(0.085, 12, 10), this.mats.furCream);
    chin.position.set(0, -0.155, 0.31);
    this.headGroup.add(padL, padR, chin);

    // Tiny Rosy-Pink Shirazi Nose
    const nose = new THREE.Mesh(new THREE.ConeGeometry(0.048, 0.055, 3), this.mats.nose);
    nose.rotation.x = Math.PI * 0.52;
    nose.rotation.z = Math.PI;
    nose.position.set(0, -0.028, 0.405);
    this.headGroup.add(nose);

    // Animated Cute Pink 3D Tongue (pops out rhythmically during grooming/licking!)
    this.tongueGroup = new THREE.Group();
    this.tongueGroup.position.set(0, -0.115, 0.345);
    const tongueMesh = new THREE.Mesh(new THREE.CapsuleGeometry(0.036, 0.09, 6, 10), this.mats.tongue);
    tongueMesh.rotation.x = Math.PI * 0.36;
    tongueMesh.scale.set(1.12, 1.0, 0.48);
    tongueMesh.position.set(0, -0.035, 0.045);
    this.tongueGroup.add(tongueMesh);
    this.tongueGroup.scale.set(0.01, 0.01, 0.01);
    this.headGroup.add(this.tongueGroup);

    // Expressive Big Sparkling Honey-Amber Eyes + Real Animated Eyelids!
    const buildEye = (side) => {
      const eyeSocket = new THREE.Group();
      eyeSocket.position.set(side * 0.145, 0.048, 0.315);
      eyeSocket.rotation.y = side * 0.22;

      const eyeball = new THREE.Mesh(new THREE.SphereGeometry(0.092, 18, 16), this.mats.eye);
      eyeball.rotation.y = -Math.PI / 2;
      eyeSocket.add(eyeball);

      // Upper Eyelid Hood (rotates down smoothly for real blinks & happy squints!)
      const lid = new THREE.Mesh(
        new THREE.SphereGeometry(0.098, 16, 12, 0, Math.PI * 2, 0, Math.PI * 0.56),
        this.mats.furMain
      );
      lid.rotation.x = -0.78;
      eyeSocket.add(lid);

      // Lower Eyelid for happy purring squint!
      const lowerLid = new THREE.Mesh(
        new THREE.SphereGeometry(0.097, 14, 10, 0, Math.PI * 2, Math.PI * 0.55, Math.PI * 0.45),
        this.mats.furCream
      );
      lowerLid.rotation.x = 0.55;
      eyeSocket.add(lowerLid);

      this.headGroup.add(eyeSocket);
      return { eyeSocket, lid, lowerLid };
    };

    this.eyeL = buildEye(-1);
    this.eyeR = buildEye(1);

    // Articulated Plush Ears with Pale-Pink Insides & Cream Ear Tufts
    const buildEar = (side) => {
      const earPivot = new THREE.Group();
      earPivot.position.set(side * 0.23, 0.28, 0.02);
      earPivot.rotation.z = -side * 0.26;
      earPivot.rotation.y = side * 0.15;

      const outer = new THREE.Mesh(new THREE.ConeGeometry(0.135, 0.26, 4), this.mats.furGinger);
      outer.rotation.y = Math.PI / 4;
      outer.scale.set(1.0, 1.0, 0.65);
      outer.position.y = 0.1;

      const inner = new THREE.Mesh(new THREE.ConeGeometry(0.088, 0.19, 4), this.mats.innerEar);
      inner.rotation.y = Math.PI / 4;
      inner.scale.set(1.0, 1.0, 0.45);
      inner.position.set(0, 0.09, 0.032);

      const tuft = new THREE.Mesh(new THREE.SphereGeometry(0.052, 8, 8), this.mats.furCream);
      tuft.scale.set(1.1, 0.65, 0.65);
      tuft.position.set(-side * 0.03, 0.02, 0.05);

      earPivot.add(outer, inner, tuft);
      this.headGroup.add(earPivot);
      return earPivot;
    };

    this.earL = buildEar(-1);
    this.earR = buildEar(1);

    // Delicate Cream-White Whiskers
    const whiskerGeo = new THREE.CylinderGeometry(0.004, 0.0018, 0.34, 5);
    [-1, 1].forEach((side) => {
      [-0.14, 0.0, 0.14].forEach((pitch, idx) => {
        const w = new THREE.Mesh(whiskerGeo, this.mats.whisker);
        w.rotation.z = Math.PI / 2 - side * (0.14 + pitch);
        w.rotation.y = -side * (0.18 + idx * 0.05);
        w.position.set(side * 0.25, -0.085 - idx * 0.025, 0.33);
        this.headGroup.add(w);
      });
    });

    // ==================== 4 ARTICULATED FLUFFY LEGS + PINK TOE-BEANS ====================
    const buildLeg = (x, y, z, isFront) => {
      const hip = new THREE.Group();
      hip.position.set(x, y, z);

      const upper = new THREE.Mesh(
        new THREE.CapsuleGeometry(isFront ? 0.105 : 0.125, isFront ? 0.24 : 0.22, 6, 12),
        this.mats.furMain
      );
      upper.position.y = -0.14;
      hip.add(upper);

      const pawGroup = new THREE.Group();
      pawGroup.position.set(0, -0.32, 0.05);
      const paw = new THREE.Mesh(new THREE.SphereGeometry(0.105, 12, 10), this.mats.furCream);
      paw.scale.set(0.95, 0.68, 1.18);
      pawGroup.add(paw);

      // Cute Pink Toe-Beans underneath the paw (visible when she lifts paw to lick!)
      const padMain = new THREE.Mesh(new THREE.SphereGeometry(0.042, 8, 8), this.mats.toeBean);
      padMain.scale.set(1.1, 0.45, 1.0);
      padMain.position.set(0, -0.055, 0.02);
      pawGroup.add(padMain);
      [-0.045, 0, 0.045].forEach((bx) => {
        const toe = new THREE.Mesh(new THREE.SphereGeometry(0.022, 8, 8), this.mats.toeBean);
        toe.position.set(bx, -0.052, 0.075);
        pawGroup.add(toe);
      });

      hip.add(pawGroup);
      this.bodyGroup.add(hip);
      return { hip, pawGroup };
    };

    this.legFL = buildLeg(-0.21, -0.14, 0.34, true);
    this.legFR = buildLeg(0.21, -0.14, 0.34, true);
    this.legBL = buildLeg(-0.24, -0.14, -0.3, false);
    this.legBR = buildLeg(0.24, -0.14, -0.3, false);

    // ==================== 5-SEGMENT ARTICULATED FLUFFY PLUME TAIL ====================
    let parentSeg = this.bodyGroup;
    const tailSpecs = [
      { pos: [0, 0.04, -0.52], r: 0.125, len: 0.24, mat: this.mats.furGinger },
      { pos: [0, 0.19, -0.06], r: 0.145, len: 0.26, mat: this.mats.furMain },
      { pos: [0, 0.21, -0.04], r: 0.155, len: 0.26, mat: this.mats.furMain },
      { pos: [0, 0.2, -0.02], r: 0.14, len: 0.24, mat: this.mats.furCream },
      { pos: [0, 0.18, 0.0], r: 0.11, len: 0.18, mat: this.mats.furCream },
    ];
    tailSpecs.forEach((spec) => {
      const segPivot = new THREE.Group();
      segPivot.position.set(spec.pos[0], spec.pos[1], spec.pos[2]);
      const puff = new THREE.Mesh(new THREE.CapsuleGeometry(spec.r, spec.len, 6, 12), spec.mat);
      puff.position.y = spec.len * 0.45;
      segPivot.add(puff);
      parentSeg.add(segPivot);
      this.tailSegments.push(segPivot);
      parentSeg = segPivot;
    });
  }

  /* ==================== 3D BOUNCING GOLDEN YARN BALL (PLAY MODE!) ==================== */
  buildGoldenYarnBall() {
    this.yarnBall = new THREE.Group();
    const core = new THREE.Mesh(new THREE.SphereGeometry(0.18, 16, 14), this.mats.yarn);
    this.yarnBall.add(core);
    for (let i = 0; i < 4; i++) {
      const band = new THREE.Mesh(new THREE.TorusGeometry(0.182, 0.022, 8, 24), this.mats.yarnStripe);
      band.rotation.set(i * 0.85, i * 1.15, i * 0.5);
      this.yarnBall.add(band);
    }
    this.yarnBall.position.set(0.62, 0.2, 0.72);
    this.yarnBall.visible = false;
    this.scene.add(this.yarnBall);
  }

  /* ==================== PETTING / HAPPY SPARKLES ==================== */
  buildSparkleParticles() {
    const geo = new THREE.OctahedronGeometry(0.052, 0);
    const mat = new THREE.MeshBasicMaterial({ color: 0xffe69c, transparent: true, opacity: 0 });
    for (let i = 0; i < 8; i++) {
      const sp = new THREE.Mesh(geo, mat.clone());
      sp.visible = false;
      this.scene.add(sp);
      this.sparkles.push({ mesh: sp, life: 0, vx: 0, vy: 0, vz: 0 });
    }
  }

  spawnHappySparkles() {
    this.sparkles.forEach((s, i) => {
      const angle = (i / this.sparkles.length) * Math.PI * 2;
      s.mesh.position.set(Math.cos(angle) * 0.28, 1.15, Math.sin(angle) * 0.25 + 0.2);
      s.vx = Math.cos(angle) * (0.45 + Math.random() * 0.35);
      s.vy = 0.75 + Math.random() * 0.55;
      s.vz = Math.sin(angle) * 0.3;
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
      this.stateDuration = duration ?? 5.6;
      this.facingDir = 0;
    } else if (nextState === 'play') {
      this.stateDuration = duration ?? 6.2;
      this.facingDir = 0;
    } else if (nextState === 'pet') {
      this.stateDuration = duration ?? 3.2;
      this.facingDir = 0;
      this.spawnHappySparkles();
    } else if (nextState === 'run') {
      this.stateDuration = duration ?? 4.0;
      this.pickNewRoamTarget();
    } else {
      this.stateDuration = duration ?? 7.5;
      this.facingDir = 0;
    }

    if (this.onStateChange) this.onStateChange(nextState);
  }

  pickNewRoamTarget() {
    const maxRoam = Math.min(window.innerWidth * 0.52, window.innerWidth < 680 ? 150 : 460);
    // Roam freely between 0 (right home spot) and -maxRoam (left side of screen)
    const goLeft = Math.abs(this.roamX) < maxRoam * 0.42;
    this.targetRoamX = goLeft ? -(maxRoam * (0.55 + Math.random() * 0.45)) : -(Math.random() * maxRoam * 0.25);
    this.facingDir = this.targetRoamX < this.roamX ? -1 : 1;
  }

  onUserScroll(scrollDelta = 0) {
    if (this.paused) return;
    this.scrollBoostTimer = 1.15;
    if (this.state !== 'run' && Math.abs(scrollDelta) > 6) {
      this.state = 'run';
      this.stateTimer = 0;
      this.stateDuration = 2.4;
      const maxRoam = Math.min(window.innerWidth * 0.48, window.innerWidth < 680 ? 135 : 380);
      const step = Math.max(-75, Math.min(75, -scrollDelta * 0.35));
      this.targetRoamX = Math.max(-maxRoam, Math.min(0, this.roamX + step));
      this.facingDir = this.targetRoamX < this.roamX ? -1 : 1;
    }
  }

  setPaused(paused) {
    this.paused = Boolean(paused);
  }

  handleResize() {
    if (!this.canvas) return;
    const isMob = window.innerWidth < 680;
    const size = isMob ? 148 : 206;
    this.renderer.setSize(size, size, false);
    this.camera.aspect = 1;
    this.camera.updateProjectionMatrix();

    // Clamp roam position safely inside new viewport width
    const maxRoam = Math.min(window.innerWidth * 0.5, isMob ? 135 : 420);
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

  /* ==================== ANIMATION LOOP (60FPS SKELETAL STATE MACHINE) ==================== */
  animate() {
    if (this.disposed) return;
    requestAnimationFrame(() => this.animate());
    if (this.isHidden || this.paused) return;

    const dt = Math.min(this.clock.getDelta(), 0.05);
    const t = this.clock.getElapsedTime();
    const damp = 1 - Math.exp(-9.0 * dt);

    this.stateTimer += dt;
    if (this.scrollBoostTimer > 0) this.scrollBoostTimer = Math.max(0, this.scrollBoostTimer - dt);

    this.smoothPointer.x += (this.pointer.x - this.smoothPointer.x) * damp;
    this.smoothPointer.y += (this.pointer.y - this.smoothPointer.y) * damp;

    // Autonomous lively cat personality: cycles smoothly between guiding, grooming (licking), playing, and roaming!
    if (this.state !== 'guide' && this.stateTimer >= this.stateDuration && this.scrollBoostTimer <= 0) {
      this.setState('guide', 7.5 + Math.random() * 4.5);
    } else if (this.state === 'guide' && this.stateTimer >= this.stateDuration) {
      const roll = Math.random();
      if (roll < 0.42) this.setState('groom');
      else if (roll < 0.74) this.setState('play');
      else this.setState('run');
    }

    // Horizontal screen roaming translation (GPU translate3d -> zero layout reflow!)
    if (this.state === 'run') {
      const diff = this.targetRoamX - this.roamX;
      if (Math.abs(diff) > 3) {
        const speed = Math.min(Math.abs(diff) * 2.2, window.innerWidth < 680 ? 125 : 195);
        this.roamX += Math.sign(diff) * speed * dt;
        this.facingDir = diff < 0 ? -1 : 1;
      } else if (this.scrollBoostTimer <= 0) {
        this.facingDir = 0;
        if (this.stateTimer > 1.2) this.setState('guide');
      }
    } else {
      this.facingDir = 0;
    }

    if (this.stageWrapper) {
      this.stageWrapper.style.transform = `translate3d(${this.roamX.toFixed(1)}px, 0, 0)`;
    }

    // Smooth orientation toward movement direction or viewer
    const desiredRotY = this.facingDir === -1 ? -Math.PI * 0.46 : this.facingDir === 1 ? Math.PI * 0.46 : 0.14;
    this.catRoot.rotation.y += (desiredRotY - this.catRoot.rotation.y) * damp;

    // Reset default target poses
    let bodyY = 0.56 + Math.sin(t * 2.4) * 0.015;
    let bodyPitch = 0;
    let bodyRoll = 0;
    let headPitch = -this.smoothPointer.y * 0.18;
    let headYaw = this.smoothPointer.x * 0.34;
    let headRoll = 0;
    let tongueOut = 0;
    let happySquint = 0;

    let flX = 0, flZ = 0, frX = 0, frZ = 0, blX = 0, brX = 0;
    let frPawRotX = 0;
    let tailSpeed = 2.2;
    let tailAmp = 0.22;

    this.yarnBall.visible = false;

    // ==================== STATE POSE CHOREOGRAPHY ====================
    if (this.state === 'run') {
      // Energetic 4-leg feline trot / playful gallop!
      const stride = t * 14.5;
      bodyY = 0.58 + Math.abs(Math.sin(stride)) * 0.11;
      bodyPitch = Math.sin(stride) * 0.12;
      flX = Math.sin(stride) * 0.68;
      frX = Math.sin(stride + 0.55) * 0.68;
      blX = -Math.sin(stride) * 0.72;
      brX = -Math.sin(stride + 0.55) * 0.72;
      headPitch = -0.06 + Math.sin(stride) * 0.06;
      headYaw = 0;
      tailSpeed = 7.5;
      tailAmp = 0.32;
    } else if (this.state === 'groom') {
      // REALISTIC CAT GROOMING ("تلحس في نفسها" — Paw-Lick & Cheek-Wash OR Flank-Licking!)
      const cycle = t * 5.2;
      happySquint = 0.55;
      bodyY = 0.52 + Math.sin(t * 2.5) * 0.012;

      if (this.groomStyle === 0) {
        // Style 0: Lifts fluffy front-right paw to mouth, licks pink toe-beans & washes face!
        const washCycle = (this.stateTimer % 2.8) / 2.8;
        if (washCycle < 0.65) {
          // Rhythmic paw licking!
          frX = -1.25 + Math.sin(cycle) * 0.12;
          frZ = 0.34;
          frPawRotX = -0.85;
          headPitch = 0.44 + Math.sin(cycle) * 0.12;
          headYaw = 0.22;
          headRoll = -0.14;
          tongueOut = Math.max(0, Math.sin(cycle)) * 1.0;
        } else {
          // Sweeps licked paw gracefully over cheek & ear!
          const sweep = Math.sin(((washCycle - 0.65) / 0.35) * Math.PI);
          frX = -1.45 - sweep * 0.35;
          frZ = 0.26;
          frPawRotX = -0.6;
          headPitch = 0.22 - sweep * 0.15;
          headYaw = 0.15;
          headRoll = -0.26 * sweep;
          tongueOut = 0.08;
        }
      } else {
        // Style 1: Turns head around to groom & lick her own fluffy golden shoulder/flank!
        headYaw = -0.78 + Math.sin(cycle) * 0.12;
        headPitch = 0.5 + Math.sin(cycle) * 0.14;
        headRoll = 0.28;
        bodyRoll = 0.08;
        tongueOut = Math.max(0, Math.sin(cycle)) * 0.95;
      }
      tailSpeed = 1.6;
      tailAmp = 0.14;
    } else if (this.state === 'play') {
      // PLAYFUL YARN-BALL CHASE & DOUBLE-PAW BATTING!
      this.yarnBall.visible = true;
      const bounceT = t * 4.4;
      const ballX = Math.sin(t * 2.3) * 0.55;
      const ballY = 0.18 + Math.abs(Math.sin(bounceT)) * 0.38;
      this.yarnBall.position.set(ballX, ballY, 0.78 + Math.cos(t * 2.3) * 0.14);
      this.yarnBall.rotation.x += dt * 4.2;
      this.yarnBall.rotation.z -= dt * 3.1;

      // Playful hop & alternating paw bats toward the ball!
      bodyY = 0.53 + Math.abs(Math.sin(t * 5.2)) * 0.14;
      bodyPitch = 0.12 - Math.abs(Math.sin(t * 5.2)) * 0.16;
      flX = -0.55 - Math.max(0, Math.sin(t * 7.2)) * 0.85;
      frX = -0.55 - Math.max(0, -Math.sin(t * 7.2)) * 0.85;
      flZ = -0.18;
      frZ = 0.18;
      headYaw = Math.max(-0.5, Math.min(0.5, ballX * 0.95));
      headPitch = 0.24 - ballY * 0.38;
      headRoll = Math.sin(t * 4.2) * 0.14;
      tailSpeed = 8.2;
      tailAmp = 0.36;
    } else if (this.state === 'pet') {
      // AFFECTIONATE PURRING & HEAD RUBBING!
      happySquint = 0.95;
      bodyY = 0.55 + Math.sin(t * 8.0) * 0.018;
      headRoll = Math.sin(t * 5.5) * 0.22;
      headPitch = -0.14 + Math.sin(t * 4.0) * 0.08;
      headYaw = Math.sin(t * 3.5) * 0.18;
      tailSpeed = 5.4;
      tailAmp = 0.32;
    }

    // Apply smooth interpolated body & head transforms
    this.bodyGroup.position.y += (bodyY - this.bodyGroup.position.y) * damp;
    this.bodyGroup.rotation.x += (bodyPitch - this.bodyGroup.rotation.x) * damp;
    this.bodyGroup.rotation.z += (bodyRoll - this.bodyGroup.rotation.z) * damp;

    this.headGroup.rotation.x += (headPitch - this.headGroup.rotation.x) * damp;
    this.headGroup.rotation.y += (headYaw - this.headGroup.rotation.y) * damp;
    this.headGroup.rotation.z += (headRoll - this.headGroup.rotation.z) * damp;

    // Gentle chest breathing pulse
    const breath = 1 + Math.sin(t * 2.8) * 0.035;
    this.chestRuff.scale.set(breath, breath, breath);

    // Smooth limb articulation
    this.legFL.hip.rotation.x += (flX - this.legFL.hip.rotation.x) * damp;
    this.legFL.hip.rotation.z += (flZ - this.legFL.hip.rotation.z) * damp;
    this.legFR.hip.rotation.x += (frX - this.legFR.hip.rotation.x) * damp;
    this.legFR.hip.rotation.z += (frZ - this.legFR.hip.rotation.z) * damp;
    this.legFR.pawGroup.rotation.x += (frPawRotX - this.legFR.pawGroup.rotation.x) * damp;
    this.legBL.hip.rotation.x += (blX - this.legBL.hip.rotation.x) * damp;
    this.legBR.hip.rotation.x += (brX - this.legBR.hip.rotation.x) * damp;

    // Smooth Pink Tongue Extension
    const tScale = Math.max(0.01, tongueOut);
    this._tmpVec.set(tScale, tScale, tScale);
    this.tongueGroup.scale.lerp(this._tmpVec, 1 - Math.exp(-16 * dt));

    // Natural Eye Blinking + Happy Purr Squint
    this.blinkTimer -= dt;
    if (this.blinkTimer <= 0) {
      this.blinkProgress = 1.0;
      this.blinkTimer = 2.6 + Math.random() * 3.4;
    }
    if (this.blinkProgress > 0) {
      this.blinkProgress = Math.max(0, this.blinkProgress - dt * 6.5);
    }
    const blinkAmt = Math.sin(this.blinkProgress * Math.PI);
    const upperClose = Math.max(blinkAmt, happySquint * 0.72);
    const upperRot = -0.78 + upperClose * 0.86;
    const lowerRot = 0.55 - happySquint * 0.42;

    this.eyeL.lid.rotation.x = upperRot;
    this.eyeR.lid.rotation.x = upperRot;
    this.eyeL.lowerLid.rotation.x = lowerRot;
    this.eyeR.lowerLid.rotation.x = lowerRot;

    // Cute Independent Ear Twitches
    this.earTwitchTimer -= dt;
    let earTwitch = 0;
    if (this.earTwitchTimer <= 0) {
      this.earTwitchTimer = 2.8 + Math.random() * 4.0;
    } else if (this.earTwitchTimer < 0.25) {
      earTwitch = Math.sin((this.earTwitchTimer / 0.25) * Math.PI) * 0.22;
    }
    this.earL.rotation.z = 0.26 + earTwitch;
    this.earR.rotation.z = -0.26 - (this.state === 'play' ? Math.sin(t * 9) * 0.08 : 0);

    // Liquid-Smooth 5-Segment Fluffy Plume Tail Wave
    for (let i = 0; i < this.tailSegments.length; i++) {
      const seg = this.tailSegments[i];
      seg.rotation.z = Math.sin(t * tailSpeed - i * 0.62) * tailAmp;
      seg.rotation.x = (i === 0 ? -0.42 : 0.14) + Math.cos(t * tailSpeed * 0.7 - i * 0.5) * 0.08;
    }

    // Floating Golden Sparkles on Petting
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

    // Ground shadow follows vertical hop height
    const hopScale = Math.max(0.7, 1 - (this.bodyGroup.position.y - 0.55) * 1.4);
    this.shadowDisc.scale.set(hopScale, hopScale, 1);

    this.renderer.render(this.scene, this.camera);
  }
}
