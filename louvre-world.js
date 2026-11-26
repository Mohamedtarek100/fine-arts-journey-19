/**
 * =========================================================================
 *  LOUVRE & PARIS 3D INTERACTIVE STORY GAME WORLD (Three.js r170 — 60FPS)
 *  - Golden-Hour Paris Boulevard + Towering 48m 3D Eiffel Tower + Haussmann
 *    Buildings + Warm Streetlamps + Animated Strolling Parisian Crowd
 *  - Cour Napoléon Reflection Pools + Illuminated Glass Louvre Pyramid
 *  - Royal Louvre Grand Gallery (Herringbone Parquet, Limestone Colonnades,
 *    Vaulted Skylight Sunbeams, Velvet Stanchions)
 *  - 4 Interactive Museum Masterpiece Stations + Floating Golden Parchments
 *  - Royal 3D Family Treasure Box (Live Firebase Vault) + Golden Manifesto Monument
 *  - Grand Rotunda Realistic 2-Tier 3D Birthday Cake ("1" & "9" Candles + Fireworks)
 *  - Photorealistic 40-Bone Golden Persian Cat Guide leading you with glowing pawprints!
 *  - Designed & Developed by ENG / Mohamed Tarek • HEY Edition
 * =========================================================================
 */

import * as THREE from './vendor/three.module.min.js';
import { GLTFLoader } from './vendor/GLTFLoader.js';

export const STORY_WAYPOINTS = [
  {
    id: 'paris',
    labelAr: 'شارع باريس وبرج إيفل',
    x: 0,
    z: 56,
    catX: 0.4,
    catZ: 52,
    tipAr: 'مياو! أهلاً في باريس عند غروب الشمس 🇫🇷✨ شوف برج إيفل العالي على شمالك، واتبعني على طول الشارع ناحية متحف اللوفر!',
  },
  {
    id: 'pyramid',
    labelAr: 'ساحة وهرم اللوفر الزجاجي',
    x: 0,
    z: 18,
    catX: 0.2,
    catZ: 12,
    tipAr: 'وصلنا لساحة متحف اللوفر والهرم الزجاجي المضيء! 🏛️ كمّل المشي ورايا عشان ندخل القاعة الملكية ونستكشف التحف!',
  },
  {
    id: 'artifact-1',
    labelAr: 'التحفة 01 • البدايات والطفولة',
    x: -1.4,
    z: -19,
    catX: -2.6,
    catZ: -20.2,
    interactId: 'childhood',
    tipAr: 'دي أول تحفة في معرض يمنى! 🎨 اضغط على اللوحة أو الورقة الذهبية الطايرة 📜 عشان تقرأ حكاية أول الألوان والطفولة!',
  },
  {
    id: 'artifact-2',
    labelAr: 'التحفة 02 • روح الأتيليه والشغف',
    x: 1.4,
    z: -33,
    catX: 2.6,
    catZ: -34.2,
    interactId: 'passion',
    tipAr: 'التحفة التانية — شغف الرسم والأتيليه! ✒️ اضغط عليها عشان تشوف التفاصيل وكمان تقدر تفتح استوديو الرسم الـ 8×!',
  },
  {
    id: 'artifact-3',
    labelAr: 'التحفة 03 • تالتة ثانوي وبداية الطريق',
    x: -1.4,
    z: -47,
    catX: -2.6,
    catZ: -48.2,
    interactId: 'thanaweya',
    tipAr: 'الساعة الرملية الذهبية لتالتة ثانوي ⏳ اضغط على الورقة الذهبية 📜 عشان تشوف شريط الـ 90% وتفتح رسالة التشجيع المختومة!',
  },
  {
    id: 'artifact-4',
    labelAr: 'التحفة 04 • أفق كلية الفنون الجميلة',
    x: 1.4,
    z: -61,
    catX: 2.6,
    catZ: -62.2,
    interactId: 'fine-arts',
    tipAr: 'تمثال الرخام الكلاسيكي وبوابة حلم الفنون الجميلة! 🏛️✨ اضغط على التحفة عشان تشوف بطاقة الحلم الهولوجرام!',
  },
  {
    id: 'vault-manifesto',
    labelAr: 'صندوق العيلة والرسالة الأهم ★',
    x: 0,
    z: -74,
    catX: -1.8,
    catZ: -75.2,
    interactId: 'vault',
    tipAr: 'محطة مميزة جداً! على شمالك «صندوق رسائل العيلة ليمنى 💌» وعلى يمينك «الرسالة الأهم في ختام الرحلة ★» — اضغط على كل واحد فيهم!',
  },
  {
    id: 'cake',
    labelAr: 'القبة الملكية وتورتة الـ 19 🎂',
    x: 0,
    z: -87.5,
    catX: 2.1,
    catZ: -91.2,
    interactId: 'cake',
    tipAr: 'وصلنا لقبة اللوفر الذهبية وتورتة العام الـ 19 بشمعتي «1» و «9»! 🎂🎆 اضغط على التورتة للاحتفال وإطفاء الشمعتين!',
  },
];

export class LouvreParisWorld3D {
  constructor(canvas, config, callbacks = {}) {
    this.canvas = canvas;
    this.config = config;
    this.callbacks = callbacks;

    this.isMobile = window.innerWidth < 900;
    this.disposed = false;
    this.isHidden = false;

    // Player 3D First-Person Walk Controller
    this.playerPos = new THREE.Vector3(0, 1.68, 66);
    this.playerYaw = 0; // 0 looks straight down -Z (toward Louvre & Eiffel!)
    this.playerPitch = -0.02;
    this.targetYaw = 0;
    this.targetPitch = -0.02;
    this.walkBobPhase = 0;
    this.moveInput = { forward: 0, strafe: 0 };
    this.keys = {};
    this.autoFollow = false;
    this.currentWaypointIdx = 0;

    // Look-around drag state
    this.isLooking = false;
    this.lookStart = { x: 0, y: 0 };
    this.dragMoved = 0;

    // Interactive Objects Registry (for 3D Raycast click & proximity HUD!)
    this.interactables = []; // { id, titleAr, badgeAr, mesh, worldPos, radius }
    this.nearestInteractable = null;

    // Cat Guide 40-bone state
    this.catRoot = new THREE.Group();
    this.catPos = new THREE.Vector3(0.4, 0, 61.5);
    this.catYaw = Math.PI; // Facing -Z initially
    this.catMixer = null;
    this.catBones = {};
    this.catLoaded = false;
    this.catStride = 0;
    this.catStepAccum = 0;
    this.catState = 'guide'; // 'guide' | 'groom' | 'play' | 'pet'
    this.catStateTimer = 0;
    this.catStateDur = 8;
    this.pawPrints = [];
    this.pawIdx = 0;

    // Cake & Fireworks state
    this.candlesLit = true;
    this.candleWind = 0;
    this.cakeFlames = [];
    this.smokePuffs = [];
    this.smokeTime = -1;
    this.fireworksTime = -1;
    this.cakeSpin = true;

    // Animated world props & Parisian crowd
    this.crowdWalkers = [];
    this.floatingProps = [];
    this.parchments = [];
    this.lanterns = [];
    this.fallingLeaves = [];
    this.eiffelSparkles = [];

    this.raycaster = new THREE.Raycaster();
    this._ndc = new THREE.Vector2();
    this._qDelta = new THREE.Quaternion();
    this._vX = new THREE.Vector3(1, 0, 0);
    this._vY = new THREE.Vector3(0, 1, 0);
    this._vZ = new THREE.Vector3(0, 0, 1);
    this._tmpV = new THREE.Vector3();
    this._tmpScale = new THREE.Vector3();

    this.clock = new THREE.Clock();
    this.init();
  }

  /* ==================== PROCEDURAL PHOTOREALISTIC MUSEUM & PARIS TEXTURES ==================== */
  createGlowTex(innerCol = 'rgba(255,248,225,1)', midCol = 'rgba(244,200,104,0.65)') {
    const c = document.createElement('canvas');
    c.width = 96;
    c.height = 96;
    const ctx = c.getContext('2d');
    const g = ctx.createRadialGradient(48, 48, 0, 48, 48, 48);
    g.addColorStop(0, innerCol);
    g.addColorStop(0.38, midCol);
    g.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, 96, 96);
    const tex = new THREE.CanvasTexture(c);
    tex.colorSpace = THREE.SRGBColorSpace;
    return tex;
  }

  createCobblestoneTexture() {
    const c = document.createElement('canvas');
    c.width = 512;
    c.height = 512;
    const ctx = c.getContext('2d');
    ctx.fillStyle = '#241e1a';
    ctx.fillRect(0, 0, 512, 512);

    const rows = 16;
    const cols = 10;
    const rh = 512 / rows;
    const cw = 512 / cols;
    for (let r = 0; r < rows; r++) {
      const off = (r % 2) * (cw * 0.5);
      for (let col = -1; col <= cols; col++) {
        const shade = 52 + ((r * 19 + col * 31) % 26);
        const warm = 8 + ((r * 7 + col * 13) % 10);
        ctx.fillStyle = `rgb(${shade + warm}, ${shade + 2}, ${shade - 4})`;
        ctx.fillRect(col * cw + off + 2.5, r * rh + 2.5, cw - 5, rh - 5);
        // Warm sunset highlight edge
        ctx.fillStyle = 'rgba(245, 200, 140, 0.08)';
        ctx.fillRect(col * cw + off + 3, r * rh + 3, cw - 6, 3);
      }
    }
    const tex = new THREE.CanvasTexture(c);
    tex.colorSpace = THREE.SRGBColorSpace;
    tex.wrapS = THREE.RepeatWrapping;
    tex.wrapT = THREE.RepeatWrapping;
    tex.repeat.set(9, 26);
    return tex;
  }

  createHerringboneParquetTexture() {
    const c = document.createElement('canvas');
    c.width = 512;
    c.height = 512;
    const ctx = c.getContext('2d');
    ctx.fillStyle = '#3d2817';
    ctx.fillRect(0, 0, 512, 512);

    const step = 32;
    for (let y = -64; y < 576; y += step) {
      for (let x = -64; x < 576; x += step * 2) {
        const tone = ((Math.abs(x + y) * 13) % 24) - 12;
        ctx.fillStyle = `rgb(${94 + tone}, ${62 + Math.floor(tone * 0.7)}, ${36 + Math.floor(tone * 0.4)})`;
        ctx.save();
        ctx.translate(x, y);
        ctx.rotate(Math.PI / 4);
        ctx.fillRect(0, 0, step * 1.4, step * 0.52);
        ctx.strokeStyle = 'rgba(26, 15, 7, 0.55)';
        ctx.lineWidth = 1.5;
        ctx.strokeRect(0, 0, step * 1.4, step * 0.52);
        ctx.restore();

        ctx.save();
        ctx.translate(x + step, y);
        ctx.rotate(-Math.PI / 4);
        ctx.fillStyle = `rgb(${84 - tone}, ${55 - Math.floor(tone * 0.6)}, ${31 - Math.floor(tone * 0.4)})`;
        ctx.fillRect(0, 0, step * 1.4, step * 0.52);
        ctx.strokeStyle = 'rgba(26, 15, 7, 0.55)';
        ctx.strokeRect(0, 0, step * 1.4, step * 0.52);
        ctx.restore();
      }
    }
    const tex = new THREE.CanvasTexture(c);
    tex.colorSpace = THREE.SRGBColorSpace;
    tex.wrapS = THREE.RepeatWrapping;
    tex.wrapT = THREE.RepeatWrapping;
    tex.repeat.set(5, 24);
    return tex;
  }

  createLimestoneWallTexture() {
    const c = document.createElement('canvas');
    c.width = 512;
    c.height = 512;
    const ctx = c.getContext('2d');
    ctx.fillStyle = '#dfd0b8';
    ctx.fillRect(0, 0, 512, 512);
    for (let y = 0; y < 512; y += 64) {
      for (let x = 0; x < 512; x += 128) {
        const off = ((y / 64) % 2) * 64;
        const v = ((x * 7 + y * 11) % 14) - 7;
        ctx.fillStyle = `rgb(${216 + v}, ${198 + v}, ${172 + v})`;
        ctx.fillRect((x + off) % 512, y, 126, 62);
        ctx.strokeStyle = 'rgba(130, 108, 80, 0.28)';
        ctx.strokeRect((x + off) % 512, y, 126, 62);
      }
    }
    const tex = new THREE.CanvasTexture(c);
    tex.colorSpace = THREE.SRGBColorSpace;
    tex.wrapS = THREE.RepeatWrapping;
    tex.wrapT = THREE.RepeatWrapping;
    tex.repeat.set(6, 2);
    return tex;
  }

  createParchmentTexture(titleText, subtitleText) {
    const c = document.createElement('canvas');
    c.width = 256;
    c.height = 340;
    const ctx = c.getContext('2d');
    const g = ctx.createLinearGradient(0, 0, 256, 340);
    g.addColorStop(0, '#f8eccd');
    g.addColorStop(0.5, '#ecd59e');
    g.addColorStop(1, '#d8b46c');
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, 256, 340);

    ctx.strokeStyle = '#8b6220';
    ctx.lineWidth = 4;
    ctx.strokeRect(14, 14, 228, 312);
    ctx.lineWidth = 1.5;
    ctx.strokeRect(22, 22, 212, 296);

    ctx.fillStyle = '#5c3c0e';
    ctx.textAlign = 'center';
    ctx.direction = 'ltr';
    ctx.font = 'bold 18px Georgia, serif';
    ctx.fillText('✦ HEY LOUVRE ✦', 128, 56);

    ctx.direction = 'rtl';
    ctx.fillStyle = '#2d1c08';
    ctx.font = 'bold 24px Cairo, sans-serif';
    ctx.fillText(titleText, 128, 118);

    ctx.fillStyle = '#6b4715';
    ctx.font = '600 16px Cairo, sans-serif';
    ctx.fillText(subtitleText, 128, 158);

    // Decorative manuscript lines
    ctx.strokeStyle = 'rgba(92, 60, 14, 0.45)';
    ctx.lineWidth = 2;
    for (let i = 0; i < 4; i++) {
      ctx.beginPath();
      ctx.moveTo(46, 198 + i * 24);
      ctx.lineTo(210, 198 + i * 24);
      ctx.stroke();
    }

    // Wax seal at bottom
    ctx.fillStyle = '#9e2b2b';
    ctx.beginPath();
    ctx.arc(128, 294, 18, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#f8df9c';
    ctx.font = 'bold 11px Georgia, serif';
    ctx.fillText('HEY', 128, 298);

    const tex = new THREE.CanvasTexture(c);
    tex.colorSpace = THREE.SRGBColorSpace;
    return tex;
  }

  createPawPrintTexture() {
    const c = document.createElement('canvas');
    c.width = 128;
    c.height = 128;
    const ctx = c.getContext('2d');
    ctx.fillStyle = '#ffe599';
    ctx.shadowColor = '#f4b942';
    ctx.shadowBlur = 14;
    ctx.beginPath();
    ctx.ellipse(64, 78, 22, 18, 0, 0, Math.PI * 2);
    ctx.fill();
    [[35, 50], [53, 36], [75, 36], [93, 50]].forEach(([x, y]) => {
      ctx.beginPath();
      ctx.arc(x, y, 10, 0, Math.PI * 2);
      ctx.fill();
    });
    const tex = new THREE.CanvasTexture(c);
    tex.colorSpace = THREE.SRGBColorSpace;
    return tex;
  }

  /* ==================== INIT RENDERER, SKY DOME & LIGHTS ==================== */
  init() {
    this.renderer = new THREE.WebGLRenderer({
      canvas: this.canvas,
      antialias: !this.isMobile,
      powerPreference: 'high-performance',
    });
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, this.isMobile ? 1.45 : 1.75));
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.15;
    this.renderer.outputColorSpace = THREE.SRGBColorSpace;

    this.scene = new THREE.Scene();
    this.scene.fog = new THREE.FogExp2(0x1f1721, 0.0082);

    const aspect = window.innerWidth / Math.max(1, window.innerHeight);
    this.camera = new THREE.PerspectiveCamera(aspect < 0.85 ? 64 : 52, aspect, 0.12, 220);

    this.texLoader = new THREE.TextureLoader();
    this.glowTex = this.createGlowTex();
    this.beamTex = this.createLightBeamTex();
    this.pawTex = this.createPawPrintTexture();

    this.mats = {
      gold: new THREE.MeshStandardMaterial({ color: 0xf0c96e, metalness: 0.86, roughness: 0.22 }),
      goldGlow: new THREE.MeshStandardMaterial({ color: 0xfff0be, emissive: 0xdf9e32, emissiveIntensity: 0.78, metalness: 0.65, roughness: 0.2 }),
      marble: new THREE.MeshStandardMaterial({ color: 0xf6efe4, roughness: 0.28, metalness: 0.06 }),
      limestone: new THREE.MeshStandardMaterial({ map: this.createLimestoneWallTexture(), roughness: 0.72, metalness: 0.03 }),
      ironDark: new THREE.MeshStandardMaterial({ color: 0x3b322b, metalness: 0.72, roughness: 0.36 }),
      eiffelBronze: new THREE.MeshStandardMaterial({ color: 0x5c4738, metalness: 0.68, roughness: 0.38 }),
      velvetRed: new THREE.MeshStandardMaterial({ color: 0x6e1824, roughness: 0.86 }),
      woodDark: new THREE.MeshStandardMaterial({ color: 0x3b2415, roughness: 0.58 }),
      lampGlow: new THREE.MeshBasicMaterial({ color: 0xffe4a8 }),
      windowGlow: new THREE.MeshBasicMaterial({ color: 0xffd28a }),
      glassPyramid: new THREE.MeshStandardMaterial({
        color: 0xbfe2e8,
        emissive: 0x7d5824,
        emissiveIntensity: 0.25,
        transparent: true,
        opacity: 0.36,
        roughness: 0.1,
        metalness: 0.35,
        side: THREE.DoubleSide,
      }),
      waterPool: new THREE.MeshStandardMaterial({
        color: 0x162436,
        emissive: 0x261d14,
        emissiveIntensity: 0.25,
        roughness: 0.08,
        metalness: 0.75,
      }),
      // Patisserie 3D Cake materials
      cakeCream: new THREE.MeshStandardMaterial({ color: 0xfbf3e4, roughness: 0.56 }),
      cakeFrosting: new THREE.MeshStandardMaterial({ color: 0xfff8ed, roughness: 0.44 }),
      cakeGanache: new THREE.MeshStandardMaterial({ color: 0x381d12, roughness: 0.2, metalness: 0.16 }),
      strawberry: new THREE.MeshStandardMaterial({ color: 0xc22b38, roughness: 0.32 }),
      berryLeaf: new THREE.MeshStandardMaterial({ color: 0x4b7a44, roughness: 0.55 }),
      macaronRose: new THREE.MeshStandardMaterial({ color: 0xe2988d, roughness: 0.42 }),
      macaronGold: new THREE.MeshStandardMaterial({ color: 0xe6be68, roughness: 0.35, metalness: 0.35 }),
      candleNumber: new THREE.MeshStandardMaterial({ color: 0xfff4d9, emissive: 0x5c370c, emissiveIntensity: 0.28, roughness: 0.3, metalness: 0.22 }),
    };

    this.setupLighting();
    this.buildParisGoldenSunsetSky();
    this.buildParisBoulevardAndBuildings();
    this.buildToweringEiffelTower();
    this.buildLouvreExteriorAndGlassPyramid();
    this.buildLouvreGrandGalleryInterior();
    this.buildFourInteractiveArtifacts();
    this.buildRoyalFamilyVaultAndManifesto();
    this.buildGrandRotundaAndRealisticCake();
    this.buildAnimatedParisianCrowd();
    this.buildGoldenAutumnLeaves();
    this.buildPawPrintPool();
    this.load40BonePersianCatGuide();

    this.bindEvents();
    this.animate();
  }

  createLightBeamTex() {
    const c = document.createElement('canvas');
    c.width = 64;
    c.height = 256;
    const ctx = c.getContext('2d');
    const g = ctx.createLinearGradient(0, 0, 0, 256);
    g.addColorStop(0, 'rgba(255, 234, 175, 0.38)');
    g.addColorStop(0.55, 'rgba(240, 194, 102, 0.12)');
    g.addColorStop(1, 'rgba(240, 194, 102, 0)');
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, 64, 256);
    const tex = new THREE.CanvasTexture(c);
    tex.colorSpace = THREE.SRGBColorSpace;
    return tex;
  }

  setupLighting() {
    this.hemiLight = new THREE.HemisphereLight(0xffe7c4, 0x261d1e, 1.15);
    this.scene.add(this.hemiLight);

    this.sunLight = new THREE.DirectionalLight(0xffcb88, 1.9);
    this.sunLight.position.set(-28, 34, 42);
    this.scene.add(this.sunLight);

    // Dynamic warm gallery follow light illuminating artifacts & cake right around the player!
    this.playerLantern = new THREE.PointLight(0xffdca0, 16, 26, 1.45);
    this.scene.add(this.playerLantern);
  }

  /* ==================== PARIS GOLDEN-HOUR SUNSET SKY DOME ==================== */
  buildParisGoldenSunsetSky() {
    const skyGeo = new THREE.SphereGeometry(185, 32, 20);
    const skyMat = new THREE.ShaderMaterial({
      side: THREE.BackSide,
      depthWrite: false,
      uniforms: {
        uTop: { value: new THREE.Color(0x13162b) },
        uMid: { value: new THREE.Color(0x4a2f43) },
        uHorizon: { value: new THREE.Color(0xe6985e) },
        uSunGlow: { value: new THREE.Color(0xffe19c) },
      },
      vertexShader: /* glsl */ `
        varying vec3 vDir;
        void main() {
          vDir = normalize(position);
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `,
      fragmentShader: /* glsl */ `
        uniform vec3 uTop;
        uniform vec3 uMid;
        uniform vec3 uHorizon;
        uniform vec3 uSunGlow;
        varying vec3 vDir;
        void main() {
          float h = clamp(vDir.y, 0.0, 1.0);
          vec3 col = mix(uHorizon, uMid, smoothstep(0.0, 0.24, h));
          col = mix(col, uTop, smoothstep(0.20, 0.72, h));
          vec3 sunDir = normalize(vec3(-0.42, 0.16, -0.88));
          float sun = pow(max(dot(normalize(vDir), sunDir), 0.0), 18.0);
          col += uSunGlow * sun * 0.65;
          gl_FragColor = vec4(col, 1.0);
        }
      `,
    });
    this.scene.add(new THREE.Mesh(skyGeo, skyMat));

    // Twinkling twilight Paris stars above the Eiffel Tower!
    const starCount = 260;
    const pos = new Float32Array(starCount * 3);
    for (let i = 0; i < starCount; i++) {
      const th = Math.random() * Math.PI * 2;
      const ph = 0.2 + Math.random() * 1.1;
      pos[i * 3] = Math.cos(th) * Math.cos(ph) * 165;
      pos[i * 3 + 1] = Math.sin(ph) * 145 + 15;
      pos[i * 3 + 2] = Math.sin(th) * Math.cos(ph) * 165;
    }
    const sGeo = new THREE.BufferGeometry();
    sGeo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
    this.scene.add(
      new THREE.Points(
        sGeo,
        new THREE.PointsMaterial({ size: 1.5, map: this.glowTex, color: 0xfff2cc, transparent: true, opacity: 0.75, blending: THREE.AdditiveBlending, depthWrite: false })
      )
    );
  }

  /* ==================== PARISIAN BOULEVARD, HAUSSMANN FACADES & STREETLAMPS ==================== */
  buildParisBoulevardAndBuildings() {
    // Cobblestone Paris Avenue + Courtyard (z = +80 to z = -6)
    const cobbleMat = new THREE.MeshStandardMaterial({
      map: this.createCobblestoneTexture(),
      roughness: 0.55,
      metalness: 0.12,
    });
    const street = new THREE.Mesh(new THREE.PlaneGeometry(58, 92), cobbleMat);
    street.rotation.x = -Math.PI / 2;
    street.position.set(0, 0, 38);
    this.scene.add(street);

    // Subtle Golden Promenade Carpet Line leading from Paris Avenue straight into Louvre!
    const runner = new THREE.Mesh(
      new THREE.PlaneGeometry(3.2, 74),
      new THREE.MeshStandardMaterial({ color: 0x3b2a1c, emissive: 0x3d250a, emissiveIntensity: 0.35, roughness: 0.7 })
    );
    runner.rotation.x = -Math.PI / 2;
    runner.position.set(0, 0.012, 34);
    this.scene.add(runner);

    // Golden edge trim lines guiding the eye straight to the Louvre Pyramid!
    [-1.65, 1.65].forEach((x) => {
      const trim = new THREE.Mesh(new THREE.PlaneGeometry(0.08, 74), this.mats.goldGlow);
      trim.rotation.x = -Math.PI / 2;
      trim.position.set(x, 0.016, 34);
      this.scene.add(trim);
    });

    // Raised Parisian Sidewalk Curbs
    [-10.5, 10.5].forEach((x) => {
      const curb = new THREE.Mesh(new THREE.BoxGeometry(7.5, 0.16, 56), this.mats.limestone);
      curb.position.set(x, 0.08, 48);
      this.scene.add(curb);
    });

    // Haussmann Parisian Stone Buildings lining both sides of Rue de Rivoli (z = 26..74)
    const mansardMat = new THREE.MeshStandardMaterial({ color: 0x2b323d, roughness: 0.55, metalness: 0.35 });
    const buildFacade = (x, z, rotY) => {
      const b = new THREE.Group();
      b.position.set(x, 0, z);
      b.rotation.y = rotY;

      const body = new THREE.Mesh(new THREE.BoxGeometry(14, 13, 8), this.mats.limestone);
      body.position.y = 6.5;
      const roof = new THREE.Mesh(new THREE.CylinderGeometry(5.2, 7.6, 3.2, 4), mansardMat);
      roof.rotation.y = Math.PI / 4;
      roof.scale.set(1.42, 1, 0.85);
      roof.position.y = 14.5;
      b.add(body, roof);

      // Warm glowing Parisian Café & Apartment Windows (3 floors x 4 windows)
      const winGeo = new THREE.PlaneGeometry(1.4, 2.2);
      for (let fl = 0; fl < 3; fl++) {
        for (let col = -1.5; col <= 1.5; col++) {
          const w = new THREE.Mesh(winGeo, this.mats.windowGlow);
          w.position.set(col * 3.1, 2.6 + fl * 3.8, 4.04);
          b.add(w);
        }
      }

      // Parisian Cafe Awning on ground floor!
      const awning = new THREE.Mesh(new THREE.BoxGeometry(12.8, 0.25, 2.2), this.mats.velvetRed);
      awning.position.set(0, 3.6, 4.9);
      awning.rotation.x = 0.24;
      b.add(awning);

      this.scene.add(b);
    };

    // Right side Haussmann Boulevard (leave left side open past z=42 so the Eiffel Tower shines unobstructed!)
    [66, 50, 34].forEach((z) => buildFacade(17.5, z, -Math.PI / 2));
    [66, 51].forEach((z) => buildFacade(-17.5, z, Math.PI / 2));

    // Iconic Parisian Streetlamps + Golden Foliage Trees along the Avenue!
    const lampPositions = [];
    for (let z = 68; z >= 18; z -= 10) {
      lampPositions.push([-6.8, z], [6.8, z]);
    }
    const poleGeo = new THREE.CylinderGeometry(0.06, 0.11, 4.3, 8);
    const globeGeo = new THREE.SphereGeometry(0.24, 12, 10);
    const treeTrunkGeo = new THREE.CylinderGeometry(0.14, 0.2, 2.6, 8);
    const treeCrownMat = new THREE.MeshStandardMaterial({ color: 0x4e5932, roughness: 0.85 });
    const treeCrownGeo = new THREE.DodecahedronGeometry(1.55, 1);

    lampPositions.forEach(([x, z], idx) => {
      const lamp = new THREE.Group();
      lamp.position.set(x, 0, z);
      const pole = new THREE.Mesh(poleGeo, this.mats.ironDark);
      pole.position.y = 2.15;
      const globe = new THREE.Mesh(globeGeo, this.mats.lampGlow);
      globe.position.y = 4.42;
      const halo = new THREE.Sprite(
        new THREE.SpriteMaterial({ map: this.glowTex, color: 0xffd27a, transparent: true, opacity: 0.82, blending: THREE.AdditiveBlending })
      );
      halo.scale.set(2.4, 2.4, 1);
      halo.position.y = 4.42;
      lamp.add(pole, globe, halo);
      this.scene.add(lamp);

      // Pair every second lamp with a manicured Parisian Avenue Tree
      if (idx % 2 === 0 && z > 22) {
        const tree = new THREE.Group();
        tree.position.set(x + Math.sign(x) * 2.2, 0, z - 4.5);
        const trunk = new THREE.Mesh(treeTrunkGeo, this.mats.woodDark);
        trunk.position.y = 1.3;
        const crown = new THREE.Mesh(treeCrownGeo, treeCrownMat);
        crown.position.y = 3.5;
        crown.scale.set(1.05, 1.2, 1.05);
        tree.add(trunk, crown);
        this.scene.add(tree);
      }
    });
  }

  /* ==================== TOWERING 48m 3D EIFFEL TOWER (PARIS ICON!) ==================== */
  buildToweringEiffelTower() {
    const tower = new THREE.Group();
    // Placed majestically on the left Parisian skyline right beside the Louvre approach!
    tower.position.set(-24, 0, 16);

    // 4 Sweeping Curved Corner Steel Legs (built with 3 tapered segments per corner!)
    const tiers = [
      { y0: 0, y1: 11.5, r0: 6.2, r1: 3.4, thick: 0.62 },
      { y0: 11.5, y1: 23.0, r0: 3.4, r1: 1.65, thick: 0.42 },
      { y0: 23.0, y1: 42.5, r0: 1.65, r1: 0.32, thick: 0.24 },
    ];
    const corners = [[-1, -1], [1, -1], [1, 1], [-1, 1]];

    tiers.forEach((tr) => {
      const dy = tr.y1 - tr.y0;
      corners.forEach(([sx, sz]) => {
        const p0 = new THREE.Vector3(sx * tr.r0, tr.y0, sz * tr.r0);
        const p1 = new THREE.Vector3(sx * tr.r1, tr.y1, sz * tr.r1);
        const len = p0.distanceTo(p1);
        const leg = new THREE.Mesh(
          new THREE.BoxGeometry(tr.thick, len, tr.thick),
          this.mats.eiffelBronze
        );
        leg.position.copy(p0).lerp(p1, 0.5);
        leg.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), p1.clone().sub(p0).normalize());
        tower.add(leg);
      });

      // Horizontal steel cross-girders + X-bracing lattices at mid-tier
      for (let s = 0.25; s <= 0.8; s += 0.28) {
        const y = tr.y0 + dy * s;
        const r = THREE.MathUtils.lerp(tr.r0, tr.r1, s);
        const barLen = r * 2;
        const barH = tr.thick * 0.48;
        [[0, r, 0], [0, -r, 0], [r, 0, Math.PI / 2], [-r, 0, Math.PI / 2]].forEach(([bx, bz, ry]) => {
          const girder = new THREE.Mesh(new THREE.BoxGeometry(barLen, barH, barH), this.mats.eiffelBronze);
          girder.position.set(bx, y, bz);
          girder.rotation.y = ry;
          tower.add(girder);
        });
      }
    });

    // Iconic Lower Semi-Circular Parisian Iron Arches on all 4 sides!
    for (let i = 0; i < 4; i++) {
      const arch = new THREE.Mesh(new THREE.TorusGeometry(4.2, 0.22, 8, 28, Math.PI), this.mats.eiffelBronze);
      arch.position.y = 4.6;
      const a = (i * Math.PI) / 2;
      arch.rotation.y = a;
      arch.position.x = Math.sin(a) * 5.0;
      arch.position.z = Math.cos(a) * 5.0;
      tower.add(arch);
    }

    // 1st, 2nd & Top Observation Decks with Warm Parisian Golden Cornice Lighting!
    [
      { y: 11.6, w: 7.4, h: 1.05 },
      { y: 23.0, w: 3.9, h: 0.85 },
      { y: 42.4, w: 1.2, h: 0.7 },
    ].forEach((d) => {
      const deck = new THREE.Mesh(new THREE.BoxGeometry(d.w, d.h, d.w), this.mats.eiffelBronze);
      deck.position.y = d.y;
      const lightTrim = new THREE.Mesh(new THREE.BoxGeometry(d.w + 0.14, 0.16, d.w + 0.14), this.mats.goldGlow);
      lightTrim.position.y = d.y;
      tower.add(deck, lightTrim);
    });

    // Antenna Spire + Glowing Golden Rotating Beacon Light at Top (y = 48m!)
    const spire = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.22, 5.2, 10), this.mats.gold);
    spire.position.y = 45.2;
    const beacon = new THREE.Sprite(
      new THREE.SpriteMaterial({ map: this.glowTex, color: 0xffe494, transparent: true, opacity: 0.96, blending: THREE.AdditiveBlending })
    );
    beacon.scale.set(6.5, 6.5, 1);
    beacon.position.y = 47.9;
    this.eiffelBeacon = beacon;
    tower.add(spire, beacon);

    // Sparkling Eiffel Night Twinkle Diamonds!
    for (let i = 0; i < 18; i++) {
      const hFrac = Math.random();
      const y = 6 + hFrac * 35;
      const r = THREE.MathUtils.lerp(4.4, 0.5, hFrac);
      const ang = Math.random() * Math.PI * 2;
      const sp = new THREE.Sprite(
        new THREE.SpriteMaterial({ map: this.glowTex, color: 0xfff3c4, transparent: true, opacity: 0.8, blending: THREE.AdditiveBlending })
      );
      sp.position.set(Math.cos(ang) * r, y, Math.sin(ang) * r);
      sp.scale.set(1.1, 1.1, 1);
      tower.add(sp);
      this.eiffelSparkles.push({ sprite: sp, phase: Math.random() * Math.PI * 2, speed: 3 + Math.random() * 4 });
    }

    this.scene.add(tower);
  }

  /* ==================== COUR NAPOLÉON & ICONIC LOUVRE GLASS PYRAMID ==================== */
  buildLouvreExteriorAndGlassPyramid() {
    // Shimmering Triangular/Rectangular Reflection Pools flanking the Louvre Pyramid!
    [-9.2, 9.2].forEach((x) => {
      const poolBorder = new THREE.Mesh(new THREE.BoxGeometry(7.2, 0.28, 12.6), this.mats.marble);
      poolBorder.position.set(x, 0.14, 7);
      const water = new THREE.Mesh(new THREE.PlaneGeometry(6.5, 11.9), this.mats.waterPool);
      water.rotation.x = -Math.PI / 2;
      water.position.set(x, 0.29, 7);
      this.scene.add(poolBorder, water);
    });

    // Iconic Illuminated Louvre Glass Pyramid centered at (x=0, z=+7) — Walk Right Beside/Through It!
    const pyrGroup = new THREE.Group();
    pyrGroup.position.set(0, 0, 7);
    const pyrGeo = new THREE.ConeGeometry(5.6, 5.2, 4, 1, true);
    const pyrGlass = new THREE.Mesh(pyrGeo, this.mats.glassPyramid);
    pyrGlass.rotation.y = Math.PI / 4;
    pyrGlass.position.y = 2.6;
    const pyrWire = new THREE.Mesh(
      new THREE.ConeGeometry(5.64, 5.24, 4, 6, true),
      new THREE.MeshStandardMaterial({ color: 0xe6c16c, metalness: 0.86, roughness: 0.22, wireframe: true })
    );
    pyrWire.rotation.y = Math.PI / 4;
    pyrWire.position.y = 2.62;

    // Warm Golden Glow Inside the Louvre Glass Pyramid
    const pyrCoreGlow = new THREE.Sprite(
      new THREE.SpriteMaterial({ map: this.glowTex, color: 0xffd27a, transparent: true, opacity: 0.65, blending: THREE.AdditiveBlending })
    );
    pyrCoreGlow.scale.set(7.5, 7.5, 1);
    pyrCoreGlow.position.y = 2.0;

    pyrGroup.add(pyrGlass, pyrWire, pyrCoreGlow);
    this.scene.add(pyrGroup);

    // Monumental Classical Louvre Palace Entrance Facade at z = -6 (Wide open grand archway in center!)
    const facade = new THREE.Group();
    facade.position.set(0, 0, -6);

    // Left & Right Classical Palace Wings
    [-13.5, 13.5].forEach((x) => {
      const wing = new THREE.Mesh(new THREE.BoxGeometry(17, 13.5, 3.2), this.mats.limestone);
      wing.position.set(x, 6.75, 0);
      facade.add(wing);

      // Glowing Palace Gallery Windows
      for (let col = -1; col <= 1; col++) {
        const w = new THREE.Mesh(new THREE.PlaneGeometry(1.8, 3.2), this.mats.windowGlow);
        w.position.set(x + col * 4.2, 7.8, 1.64);
        facade.add(w);
      }
    });

    // Grand Entablature & Pediment over the Central Entrance Arch (Clear opening: x=-5..+5, y=0..7.2!)
    const topEntablature = new THREE.Mesh(new THREE.BoxGeometry(12, 6.4, 3.4), this.mats.limestone);
    topEntablature.position.set(0, 10.3, 0);
    const goldCornice = new THREE.Mesh(new THREE.BoxGeometry(44, 0.35, 3.7), this.mats.goldGlow);
    goldCornice.position.set(0, 13.4, 0);
    const archTrim = new THREE.Mesh(new THREE.TorusGeometry(4.6, 0.22, 10, 42, Math.PI), this.mats.goldGlow);
    archTrim.position.set(0, 3.4, 1.68);
    facade.add(topEntablature, goldCornice, archTrim);

    // Illuminated Royal Louvre Entrance Sign ("متحف اللوفر • معرض رحلة يمنى • HEY")
    const signCanvas = document.createElement('canvas');
    signCanvas.width = 768;
    signCanvas.height = 160;
    const sctx = signCanvas.getContext('2d');
    sctx.fillStyle = '#17110b';
    sctx.fillRect(0, 0, 768, 160);
    sctx.strokeStyle = '#e8c268';
    sctx.lineWidth = 6;
    sctx.strokeRect(8, 8, 752, 144);
    sctx.textAlign = 'center';
    sctx.direction = 'rtl';
    sctx.fillStyle = '#fbf0cf';
    sctx.font = 'bold 46px Amiri, Georgia, serif';
    sctx.fillText('متحف اللوفر  •  معرض رحلة يمنى', 384, 78);
    sctx.direction = 'ltr';
    sctx.fillStyle = '#e8c268';
    sctx.font = '600 22px Cinzel, Georgia, serif';
    sctx.fillText('MUSÉE DU LOUVRE  •  HEY EDITION  •  5 DECEMBER', 384, 128);
    const signTex = new THREE.CanvasTexture(signCanvas);
    signTex.colorSpace = THREE.SRGBColorSpace;
    const signPlaque = new THREE.Mesh(new THREE.PlaneGeometry(8.4, 1.75), new THREE.MeshBasicMaterial({ map: signTex }));
    signPlaque.position.set(0, 9.6, 1.75);
    facade.add(signPlaque);

    this.scene.add(facade);
  }

  /* ==================== INSIDE THE LOUVRE GRAND GALLERY (z = -6 .. -82) ==================== */
  buildLouvreGrandGalleryInterior() {
    const parquetMat = new THREE.MeshStandardMaterial({
      map: this.createHerringboneParquetTexture(),
      roughness: 0.32,
      metalness: 0.08,
    });

    // Main Grand Gallery Floor
    const floor = new THREE.Mesh(new THREE.PlaneGeometry(17.5, 78), parquetMat);
    floor.rotation.x = -Math.PI / 2;
    floor.position.set(0, 0, -45);
    this.scene.add(floor);

    // Royal Crimson & Gold Center Museum Carpet Runner
    const carpet = new THREE.Mesh(new THREE.PlaneGeometry(3.4, 78), this.mats.velvetRed);
    carpet.rotation.x = -Math.PI / 2;
    carpet.position.set(0, 0.012, -45);
    this.scene.add(carpet);
    [-1.74, 1.74].forEach((x) => {
      const b = new THREE.Mesh(new THREE.PlaneGeometry(0.08, 78), this.mats.gold);
      b.rotation.x = -Math.PI / 2;
      b.position.set(x, 0.016, -45);
      this.scene.add(b);
    });

    // Left & Right Classical Limestone Gallery Walls
    const wallGeo = new THREE.BoxGeometry(0.8, 9.6, 78);
    [-8.6, 8.6].forEach((x) => {
      const wall = new THREE.Mesh(wallGeo, this.mats.limestone);
      wall.position.set(x, 4.8, -45);
      const goldRail = new THREE.Mesh(new THREE.BoxGeometry(0.95, 0.16, 78), this.mats.gold);
      goldRail.position.set(x, 1.35, -45);
      const cornice = new THREE.Mesh(new THREE.BoxGeometry(1.1, 0.35, 78), this.mats.gold);
      cornice.position.set(x, 9.3, -45);
      this.scene.add(wall, goldRail, cornice);
    });

    // Vaulted Coffered Ceiling + Central Golden Glass Skylight Strip
    [-5.8, 5.8].forEach((x) => {
      const ceilSide = new THREE.Mesh(new THREE.BoxGeometry(6.2, 0.4, 78), this.mats.marble);
      ceilSide.position.set(x, 9.5, -45);
      this.scene.add(ceilSide);
    });
    const skylight = new THREE.Mesh(
      new THREE.PlaneGeometry(5.8, 78),
      new THREE.MeshBasicMaterial({ color: 0xffdf9e, transparent: true, opacity: 0.42, side: THREE.DoubleSide })
    );
    skylight.rotation.x = Math.PI / 2;
    skylight.position.set(0, 9.65, -45);
    this.scene.add(skylight);

    // Instanced Corinthian Marble Columns along BOTH sides of the Grand Gallery (ultra-fast 1 draw call!)
    const colPositions = [];
    for (let z = -12; z >= -78; z -= 9.5) {
      colPositions.push([-7.4, z], [7.4, z]);
    }
    const shaftMesh = new THREE.InstancedMesh(new THREE.CylinderGeometry(0.32, 0.38, 8.6, 14), this.mats.marble, colPositions.length);
    const capMesh = new THREE.InstancedMesh(new THREE.BoxGeometry(1.05, 0.45, 1.05), this.mats.gold, colPositions.length);
    const dummy = new THREE.Object3D();
    colPositions.forEach(([x, z], i) => {
      dummy.position.set(x, 4.5, z);
      dummy.updateMatrix();
      shaftMesh.setMatrixAt(i, dummy.matrix);
      dummy.position.set(x, 8.95, z);
      dummy.updateMatrix();
      capMesh.setMatrixAt(i, dummy.matrix);
    });
    this.scene.add(shaftMesh, capMesh);

    // Diagonal Volumetric Sunset Sunbeams pouring from the Louvre Skylight!
    [-19, -33, -47, -61, -75].forEach((z) => {
      const beam = new THREE.Mesh(
        new THREE.PlaneGeometry(4.4, 10.5),
        new THREE.MeshBasicMaterial({
          map: this.beamTex,
          transparent: true,
          opacity: 0.32,
          blending: THREE.AdditiveBlending,
          side: THREE.DoubleSide,
          depthWrite: false,
        })
      );
      beam.position.set(0, 4.9, z);
      beam.rotation.z = 0.14;
      this.scene.add(beam);
    });
  }

  /* ==================== 4 INTERACTIVE MUSEUM ARTIFACTS + FLOATING GOLDEN PARCHMENTS ==================== */
  createFramedGalleryPainting(imagePath, w = 3.2, h = 2.4) {
    const group = new THREE.Group();
    const border = 0.18;
    const frame = new THREE.Mesh(new THREE.BoxGeometry(w + border * 2, h + border * 2, 0.14), this.mats.gold);
    const tex = this.texLoader.load(imagePath);
    tex.colorSpace = THREE.SRGBColorSpace;
    const art = new THREE.Mesh(new THREE.PlaneGeometry(w, h), new THREE.MeshStandardMaterial({ map: tex, roughness: 0.45 }));
    art.position.z = 0.08;
    group.add(frame, art);
    return group;
  }

  buildFourInteractiveArtifacts() {
    const chapters = this.config.chapters || [];
    const stations = [
      { id: 'childhood', x: -4.4, z: -20, wallX: -8.08, rotY: Math.PI / 2, num: '01', shortAr: 'البدايات', ch: chapters[0] },
      { id: 'passion', x: 4.4, z: -34, wallX: 8.08, rotY: -Math.PI / 2, num: '02', shortAr: 'الشغف', ch: chapters[1] },
      { id: 'thanaweya', x: -4.4, z: -48, wallX: -8.08, rotY: Math.PI / 2, num: '03', shortAr: 'تالتة ثانوي', ch: chapters[2] },
      { id: 'fine-arts', x: 4.4, z: -62, wallX: 8.08, rotY: -Math.PI / 2, num: '04', shortAr: 'فنون جميلة', ch: chapters[3] },
    ];

    stations.forEach((st, idx) => {
      const grp = new THREE.Group();
      grp.position.set(st.x, 0, st.z);

      // 1. Marble Museum Pedestal with Gold Trim
      const pedBase = new THREE.Mesh(new THREE.BoxGeometry(1.45, 0.18, 1.45), this.mats.gold);
      pedBase.position.y = 0.09;
      const pedCol = new THREE.Mesh(new THREE.BoxGeometry(1.15, 1.15, 1.15), this.mats.marble);
      pedCol.position.y = 0.72;
      const pedTop = new THREE.Mesh(new THREE.BoxGeometry(1.32, 0.12, 1.32), this.mats.gold);
      pedTop.position.y = 1.34;
      grp.add(pedBase, pedCol, pedTop);

      // Glowing interactive floor discovery ring around each artifact!
      const ring = new THREE.Mesh(
        new THREE.RingGeometry(1.22, 1.34, 36),
        new THREE.MeshBasicMaterial({ color: 0xf7d882, transparent: true, opacity: 0.6, side: THREE.DoubleSide, blending: THREE.AdditiveBlending, depthWrite: false })
      );
      ring.rotation.x = -Math.PI / 2;
      ring.position.y = 0.02;
      grp.add(ring);

      // 2. Bespoke 3D Sculpted Centerpiece Artifact per Chapter!
      const artCenter = new THREE.Group();
      artCenter.position.y = 2.05;
      if (idx === 0) {
        // Childhood: Ring of Floating Pastel Pencils & Golden Star
        const star = new THREE.Mesh(new THREE.OctahedronGeometry(0.32, 0), this.mats.goldGlow);
        artCenter.add(star);
        [0xf0c05a, 0xd97854, 0x6f98bd, 0x86ad7e, 0xe095a4].forEach((hex, pi) => {
          const pen = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.04, 0.85, 6), new THREE.MeshStandardMaterial({ color: hex, roughness: 0.4 }));
          const a = (pi / 5) * Math.PI * 2;
          pen.position.set(Math.cos(a) * 0.45, 0, Math.sin(a) * 0.45);
          pen.rotation.set(0.35, a, 0.3);
          artCenter.add(pen);
        });
      } else if (idx === 1) {
        // Passion: Sacred Golden Ratio Icosahedron & Marble Gem
        const wire = new THREE.Mesh(
          new THREE.IcosahedronGeometry(0.54, 0),
          new THREE.MeshStandardMaterial({ color: 0xf5d076, emissive: 0x9e6f1e, emissiveIntensity: 0.4, metalness: 0.85, roughness: 0.2, wireframe: true })
        );
        const gem = new THREE.Mesh(new THREE.OctahedronGeometry(0.28, 0), this.mats.marble);
        artCenter.add(wire, gem);
      } else if (idx === 2) {
        // Thanaweya: Golden Glass Hourglass & Glowing Hope Orbs
        const glassMat = new THREE.MeshStandardMaterial({ color: 0xffe6a8, transparent: true, opacity: 0.45, roughness: 0.15, metalness: 0.3 });
        const topC = new THREE.Mesh(new THREE.ConeGeometry(0.34, 0.48, 18), glassMat);
        topC.position.y = 0.26; topC.rotation.x = Math.PI;
        const botC = new THREE.Mesh(new THREE.ConeGeometry(0.34, 0.48, 18), glassMat);
        botC.position.y = -0.26;
        const cap1 = new THREE.Mesh(new THREE.CylinderGeometry(0.4, 0.4, 0.06, 20), this.mats.goldGlow);
        cap1.position.y = 0.52;
        const cap2 = cap1.clone(); cap2.position.y = -0.52;
        artCenter.add(topC, botC, cap1, cap2);
      } else {
        // Fine Arts: Classical Sculpted Marble TorusKnot & Golden Laurel Ring
        const sculp = new THREE.Mesh(new THREE.TorusKnotGeometry(0.34, 0.1, 64, 12, 2, 3), this.mats.marble);
        const halo = new THREE.Mesh(new THREE.TorusGeometry(0.58, 0.02, 8, 48), this.mats.goldGlow);
        artCenter.add(sculp, halo);
      }
      grp.add(artCenter);
      this.floatingProps.push({ mesh: artCenter, baseY: 2.05, speed: 1.2 + idx * 0.2 });

      // 3. FLOATING INTERACTIVE GOLDEN PARCHMENT SCROLL ("ورقة التحفة") right beside the artifact!
      const parchTex = this.createParchmentTexture(`التحفة ${st.num}`, st.shortAr);
      const parchment = new THREE.Mesh(
        new THREE.PlaneGeometry(0.74, 0.98),
        new THREE.MeshBasicMaterial({ map: parchTex, side: THREE.DoubleSide })
      );
      parchment.position.set(st.x < 0 ? 0.92 : -0.92, 1.55, 0.55);
      parchment.rotation.y = st.x < 0 ? 0.42 : -0.42;
      grp.add(parchment);
      this.parchments.push({ mesh: parchment, baseY: 1.55, phase: idx * 1.4 });

      // 4. Grand Framed Museum Masterpiece Painting on the adjacent Louvre Wall!
      const wallArt = this.createFramedGalleryPainting(st.ch?.image || './assets/art/chapter1-childhood.jpg', 3.6, 2.7);
      wallArt.position.set(st.wallX, 3.65, st.z);
      wallArt.rotation.y = st.rotY;
      this.scene.add(wallArt);

      // Generous invisible Raycast Hitbox so clicking either the Pedestal, Artifact, or Parchment opens it!
      const hitbox = new THREE.Mesh(new THREE.BoxGeometry(2.8, 3.4, 2.6), new THREE.MeshBasicMaterial({ visible: false }));
      hitbox.position.y = 1.7;
      hitbox.userData.interactId = st.id;
      grp.add(hitbox);

      this.interactables.push({
        id: st.id,
        titleAr: st.ch?.titleAr || st.shortAr,
        badgeAr: `📜 اضغط لفتح التحفة ${st.num}: ${st.shortAr}`,
        mesh: hitbox,
        worldPos: new THREE.Vector3(st.x, 1.5, st.z),
        radius: 6.2,
      });

      this.scene.add(grp);
    });
  }

  /* ==================== ROYAL FAMILY TREASURE BOX & GOLDEN MANIFESTO MONUMENT ==================== */
  buildRoyalFamilyVaultAndManifesto() {
    // A. ROYAL 3D FAMILY TREASURE CHEST ("صندوق رسائل العائلة ليمنى 💌" — Live Firebase Cloud Sync!)
    const vaultGrp = new THREE.Group();
    vaultGrp.position.set(-3.9, 0, -75);

    const ped = new THREE.Mesh(new THREE.BoxGeometry(1.8, 1.05, 1.4), this.mats.marble);
    ped.position.y = 0.525;
    const cloth = new THREE.Mesh(new THREE.BoxGeometry(1.86, 0.14, 1.46), this.mats.velvetRed);
    cloth.position.y = 1.06;

    // Ornate Antique-Gold & Dark Velvet Treasure Box
    const boxBody = new THREE.Mesh(new THREE.BoxGeometry(1.24, 0.62, 0.84), this.mats.woodDark);
    boxBody.position.y = 1.42;
    const boxRim = new THREE.Mesh(new THREE.BoxGeometry(1.3, 0.1, 0.9), this.mats.goldGlow);
    boxRim.position.y = 1.72;
    const boxLid = new THREE.Mesh(new THREE.CylinderGeometry(0.42, 0.42, 1.24, 14, 1, false, 0, Math.PI), this.mats.gold);
    boxLid.rotation.z = Math.PI / 2;
    boxLid.position.y = 1.74;

    // Floating Golden Wax-Sealed Envelopes orbiting above Yomna's Treasure Box!
    const envOrbit = new THREE.Group();
    envOrbit.position.y = 2.45;
    for (let i = 0; i < 4; i++) {
      const env = new THREE.Mesh(new THREE.BoxGeometry(0.34, 0.22, 0.04), this.mats.goldGlow);
      const a = (i / 4) * Math.PI * 2;
      env.position.set(Math.cos(a) * 0.62, Math.sin(i * 1.4) * 0.12, Math.sin(a) * 0.62);
      env.rotation.y = -a;
      envOrbit.add(env);
    }
    this.floatingProps.push({ mesh: envOrbit, baseY: 2.45, speed: 1.5 });

    const vHit = new THREE.Mesh(new THREE.BoxGeometry(2.6, 3.2, 2.4), new THREE.MeshBasicMaterial({ visible: false }));
    vHit.position.y = 1.6;
    vHit.userData.interactId = 'vault';

    const vRing = new THREE.Mesh(
      new THREE.RingGeometry(1.32, 1.44, 36),
      new THREE.MeshBasicMaterial({ color: 0xffd87a, transparent: true, opacity: 0.72, side: THREE.DoubleSide, blending: THREE.AdditiveBlending, depthWrite: false })
    );
    vRing.rotation.x = -Math.PI / 2;
    vRing.position.y = 0.02;

    vaultGrp.add(ped, cloth, boxBody, boxRim, boxLid, envOrbit, vRing, vHit);
    this.scene.add(vaultGrp);

    this.interactables.push({
      id: 'vault',
      titleAr: 'صندوق رسائل العائلة ليمنى',
      badgeAr: '💌 اضغط لفتح صندوق رسائل العائلة السحابي',
      mesh: vHit,
      worldPos: new THREE.Vector3(-3.9, 1.6, -75),
      radius: 6.4,
    });

    // B. ILLUMINATED GOLDEN MANIFESTO STELE MONUMENT ("★ الرسالة الأهم في ختام الرحلة")
    const manGrp = new THREE.Group();
    manGrp.position.set(3.9, 0, -75);

    const mPed = new THREE.Mesh(new THREE.BoxGeometry(1.9, 0.5, 1.1), this.mats.marble);
    mPed.position.y = 0.25;
    const stele = new THREE.Mesh(new THREE.BoxGeometry(1.55, 2.6, 0.28), this.mats.marble);
    stele.position.y = 1.8;
    const steleFrame = new THREE.Mesh(new THREE.BoxGeometry(1.68, 2.72, 0.2), this.mats.goldGlow);
    steleFrame.position.y = 1.8;

    const manTex = this.createParchmentTexture('الرسالة الأهم ★', 'ثانوية عامة البداية');
    const manFace = new THREE.Mesh(new THREE.PlaneGeometry(1.38, 2.25), new THREE.MeshBasicMaterial({ map: manTex }));
    manFace.position.set(0, 1.8, 0.155);
    const manFaceBack = manFace.clone();
    manFaceBack.position.z = -0.155;
    manFaceBack.rotation.y = Math.PI;

    const mRing = vRing.clone();
    const mHit = new THREE.Mesh(new THREE.BoxGeometry(2.6, 3.4, 2.2), new THREE.MeshBasicMaterial({ visible: false }));
    mHit.position.y = 1.7;
    mHit.userData.interactId = 'manifesto';

    manGrp.add(mPed, steleFrame, stele, manFace, manFaceBack, mRing, mHit);
    this.scene.add(manGrp);

    this.interactables.push({
      id: 'manifesto',
      titleAr: 'الرسالة الأهم في ختام الرحلة',
      badgeAr: '★ اضغط لقراءة الرسالة الأهم وكبسولة الطمأنينة',
      mesh: mHit,
      worldPos: new THREE.Vector3(3.9, 1.7, -75),
      radius: 6.4,
    });
  }

  /* ==================== GRAND LOUVRE ROTUNDA & REALISTIC 3D BIRTHDAY CAKE ("1" & "9") ==================== */
  createExtrudedDigit1() {
    const s = new THREE.Shape();
    s.moveTo(-0.22, 0); s.lineTo(0.24, 0); s.lineTo(0.24, 0.13); s.lineTo(0.09, 0.13);
    s.lineTo(0.09, 0.92); s.lineTo(-0.07, 0.92); s.lineTo(-0.26, 0.71); s.lineTo(-0.17, 0.61);
    s.lineTo(-0.06, 0.73); s.lineTo(-0.06, 0.13); s.lineTo(-0.22, 0.13); s.closePath();
    const geo = new THREE.ExtrudeGeometry(s, { depth: 0.11, bevelEnabled: true, bevelThickness: 0.024, bevelSize: 0.02, bevelSegments: 3 });
    geo.translate(0, 0, -0.055);
    return geo;
  }

  createExtrudedDigit9() {
    const s = new THREE.Shape();
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
    const hole = new THREE.Path();
    hole.absellipse(-0.02, 0.65, 0.125, 0.145, 0, Math.PI * 2, true, 0);
    s.holes.push(hole);
    const geo = new THREE.ExtrudeGeometry(s, { depth: 0.11, bevelEnabled: true, bevelThickness: 0.024, bevelSize: 0.02, bevelSegments: 3 });
    geo.translate(0, 0, -0.055);
    return geo;
  }

  createCandleFlame(x, y, z) {
    const holder = new THREE.Group();
    holder.position.set(x, y, z);
    const wick = new THREE.Mesh(new THREE.CylinderGeometry(0.012, 0.014, 0.11, 8), this.mats.woodDark);
    wick.position.y = 0.04;
    holder.add(wick);

    const fGrp = new THREE.Group();
    fGrp.position.y = 0.14;
    const outer = new THREE.Mesh(new THREE.ConeGeometry(0.065, 0.28, 12), new THREE.MeshBasicMaterial({ color: 0xffa834, transparent: true, opacity: 0.92 }));
    outer.position.y = 0.06;
    const inner = new THREE.Mesh(new THREE.ConeGeometry(0.034, 0.16, 10), new THREE.MeshBasicMaterial({ color: 0xfff8dc }));
    inner.position.y = 0.03;
    const glow = new THREE.Sprite(new THREE.SpriteMaterial({ map: this.glowTex, color: 0xffc858, transparent: true, opacity: 0.96, blending: THREE.AdditiveBlending }));
    glow.scale.set(1.15, 1.15, 1);
    glow.position.y = 0.08;
    fGrp.add(outer, inner, glow);
    holder.add(fGrp);

    const smoke = new THREE.Sprite(new THREE.SpriteMaterial({ map: this.glowTex, color: 0xcfc7be, transparent: true, opacity: 0 }));
    smoke.scale.set(0.45, 0.45, 1);
    smoke.position.y = 0.16;
    holder.add(smoke);

    this.cakeFlames.push({ group: fGrp, glow, phase: x * 4 + 1.2 });
    this.smokePuffs.push({ sprite: smoke, baseY: 0.16 });
    return holder;
  }

  buildGrandRotundaAndRealisticCake() {
    const rotunda = new THREE.Group();
    rotunda.position.set(0, 0, -93);

    // Circular Marble & Gold Rotunda Floor (Radius 12m)
    const floor = new THREE.Mesh(new THREE.CircleGeometry(12.5, 48), this.mats.marble);
    floor.rotation.x = -Math.PI / 2;
    floor.position.y = 0.015;
    const goldInlay = new THREE.Mesh(new THREE.RingGeometry(4.2, 4.45, 48), this.mats.goldGlow);
    goldInlay.rotation.x = -Math.PI / 2;
    goldInlay.position.y = 0.022;
    rotunda.add(floor, goldInlay);

    // Grand Circular Wall + Glass Dome Ceiling
    const rotWall = new THREE.Mesh(
      new THREE.CylinderGeometry(12.4, 12.4, 10.5, 36, 1, true, Math.PI * 0.18, Math.PI * 1.64),
      new THREE.MeshStandardMaterial({ color: 0xd8c6aa, roughness: 0.68, side: THREE.BackSide })
    );
    rotWall.position.y = 5.25;
    rotunda.add(rotWall);

    const dome = new THREE.Mesh(
      new THREE.SphereGeometry(12.5, 28, 16, 0, Math.PI * 2, 0, Math.PI * 0.48),
      new THREE.MeshStandardMaterial({ color: 0xf4cf7c, metalness: 0.72, roughness: 0.25, wireframe: true, transparent: true, opacity: 0.45 })
    );
    dome.position.y = 9.5;
    rotunda.add(dome);

    // Ring of 10 Corinthian Rotunda Columns
    for (let i = 0; i < 10; i++) {
      const a = (i / 10) * Math.PI * 2;
      if (Math.cos(a) > 0.72) continue; // Keep entrance corridor wide open!
      const col = new THREE.Mesh(new THREE.CylinderGeometry(0.36, 0.42, 9.6, 14), this.mats.marble);
      col.position.set(Math.sin(a) * 10.8, 4.8, Math.cos(a) * 10.8);
      rotunda.add(col);
    }

    // Stepped Royal Dais Pedestal under the Realistic 3D Birthday Cake
    const dais1 = new THREE.Mesh(new THREE.CylinderGeometry(3.2, 3.5, 0.24, 42), this.mats.marble);
    dais1.position.y = 0.12;
    const dais2 = new THREE.Mesh(new THREE.CylinderGeometry(2.3, 2.5, 0.85, 42), this.mats.marble);
    dais2.position.y = 0.65;
    const daisRim = new THREE.Mesh(new THREE.TorusGeometry(2.32, 0.045, 10, 48), this.mats.goldGlow);
    daisRim.rotation.x = Math.PI / 2;
    daisRim.position.y = 1.07;
    rotunda.add(dais1, dais2, daisRim);

    // REALISTIC 2-TIER PATISSERIE 3D BIRTHDAY CAKE WITH SCULPTED "1" & "9" CANDLES!
    const cake = new THREE.Group();
    cake.position.y = 2.48;
    cake.scale.setScalar(1.06);

    const foot = new THREE.Mesh(new THREE.CylinderGeometry(0.55, 0.85, 0.16, 28), this.mats.gold);
    foot.position.y = -1.28;
    const stem = new THREE.Mesh(new THREE.CylinderGeometry(0.18, 0.28, 0.48, 22), this.mats.marble);
    stem.position.y = -0.98;
    const platter = new THREE.Mesh(new THREE.CylinderGeometry(1.88, 1.72, 0.12, 38), this.mats.marble);
    platter.position.y = -0.7;
    const tier1 = new THREE.Mesh(new THREE.CylinderGeometry(1.48, 1.5, 0.88, 38), this.mats.cakeCream);
    tier1.position.y = -0.2;
    const tier1Glaze = new THREE.Mesh(new THREE.CylinderGeometry(1.5, 1.5, 0.07, 38), this.mats.cakeGanache);
    tier1Glaze.position.y = 0.23;
    const tier2 = new THREE.Mesh(new THREE.CylinderGeometry(0.96, 0.98, 0.74, 34), this.mats.cakeCream);
    tier2.position.y = 0.63;
    const tier2Glaze = new THREE.Mesh(new THREE.CylinderGeometry(0.975, 0.975, 0.06, 34), this.mats.cakeGanache);
    tier2Glaze.position.y = 1.0;
    cake.add(foot, stem, platter, tier1, tier1Glaze, tier2, tier2Glaze);

    // Ganache drips, rosettes, plump strawberries & macarons
    const dripGeo = new THREE.CapsuleGeometry(0.055, 0.26, 6, 10);
    const pearlGeo = new THREE.SphereGeometry(0.085, 10, 8);
    for (let i = 0; i < 18; i++) {
      const a = (i / 18) * Math.PI * 2;
      const d = new THREE.Mesh(dripGeo, this.mats.cakeGanache);
      const len = 0.72 + ((i * 7) % 5) * 0.2;
      d.scale.set(1, len, 1);
      d.position.set(Math.cos(a) * 1.485, 0.15 - len * 0.13, Math.sin(a) * 1.485);
      cake.add(d);

      const p = new THREE.Mesh(pearlGeo, this.mats.cakeFrosting);
      p.scale.set(1.15, 0.78, 1.15);
      p.position.set(Math.cos(a) * 1.54, -0.59, Math.sin(a) * 1.54);
      cake.add(p);
    }
    for (let i = 0; i < 12; i++) {
      const a = (i / 12) * Math.PI * 2;
      const d2 = new THREE.Mesh(dripGeo, this.mats.cakeGanache);
      d2.scale.set(0.85, 0.75 + (i % 3) * 0.2, 0.85);
      d2.position.set(Math.cos(a) * 0.965, 0.92 - (0.75 + (i % 3) * 0.2) * 0.12, Math.sin(a) * 0.965);
      cake.add(d2);
    }

    const berryGeo = new THREE.SphereGeometry(0.125, 12, 10);
    const macGeo = new THREE.CylinderGeometry(0.15, 0.15, 0.11, 16);
    for (let i = 0; i < 8; i++) {
      const a = (i / 8) * Math.PI * 2 + 0.2;
      if (i % 2 === 0) {
        const fruit = new THREE.Mesh(berryGeo, this.mats.strawberry);
        fruit.scale.set(1, 1.25, 1);
        fruit.position.set(Math.cos(a) * 1.24, 0.36, Math.sin(a) * 1.24);
        cake.add(fruit);
      } else {
        const mac = new THREE.Mesh(macGeo, i % 4 === 1 ? this.mats.macaronRose : this.mats.macaronGold);
        mac.position.set(Math.cos(a) * 1.24, 0.34, Math.sin(a) * 1.24);
        cake.add(mac);
      }
    }

    // Sculpted 3D Number Candles "1" & "9"
    const c1 = new THREE.Group();
    c1.position.set(-0.34, 1.12, 0.02);
    const d1 = new THREE.Mesh(this.createExtrudedDigit1(), this.mats.candleNumber);
    const d1Trim = new THREE.Mesh(this.createExtrudedDigit1(), this.mats.gold);
    d1Trim.scale.set(1.06, 1.04, 0.72);
    d1Trim.position.z = -0.02;
    c1.add(d1, d1Trim, this.createCandleFlame(0.02, 0.94, 0));

    const c9 = new THREE.Group();
    c9.position.set(0.34, 1.12, 0.02);
    const d9 = new THREE.Mesh(this.createExtrudedDigit9(), this.mats.candleNumber);
    const d9Trim = new THREE.Mesh(this.createExtrudedDigit9(), this.mats.gold);
    d9Trim.scale.set(1.06, 1.04, 0.72);
    d9Trim.position.z = -0.02;
    c9.add(d9, d9Trim, this.createCandleFlame(-0.02, 0.95, 0));
    cake.add(c1, c9);

    this.cakeGroup = cake;
    rotunda.add(cake);

    // Rotunda Golden Fireworks Burst System under the Dome!
    const fCount = this.isMobile ? 220 : 340;
    const fPos = new Float32Array(fCount * 3);
    const fCol = new Float32Array(fCount * 3);
    this.fireworkVels = [];
    const fPal = [new THREE.Color(0xffe89e), new THREE.Color(0xf2b94c), new THREE.Color(0xffffff), new THREE.Color(0xe07b58), new THREE.Color(0x98c494)];
    for (let i = 0; i < fCount; i++) {
      const c = fPal[i % fPal.length];
      fCol[i * 3] = c.r; fCol[i * 3 + 1] = c.g; fCol[i * 3 + 2] = c.b;
      const th = Math.random() * Math.PI * 2;
      const ph = Math.acos(2 * Math.random() - 1);
      const spd = 2.8 + Math.random() * 5.8;
      this.fireworkVels.push({ x: Math.sin(ph) * Math.cos(th) * spd, y: Math.abs(Math.cos(ph)) * spd + 2.2, z: Math.sin(ph) * Math.sin(th) * spd });
    }
    const fGeo = new THREE.BufferGeometry();
    fGeo.setAttribute('position', new THREE.BufferAttribute(fPos, 3));
    fGeo.setAttribute('color', new THREE.BufferAttribute(fCol, 3));
    this.fireworksPoints = new THREE.Points(
      fGeo,
      new THREE.PointsMaterial({ size: 0.45, map: this.glowTex, vertexColors: true, transparent: true, opacity: 0, blending: THREE.AdditiveBlending, depthWrite: false })
    );
    this.fireworksPoints.position.set(0, 3.8, -93);
    this.scene.add(this.fireworksPoints);

    const cakeHit = new THREE.Mesh(new THREE.CylinderGeometry(2.6, 2.6, 4.6, 16), new THREE.MeshBasicMaterial({ visible: false }));
    cakeHit.position.y = 2.3;
    cakeHit.userData.interactId = 'cake';
    rotunda.add(cakeHit);

    this.interactables.push({
      id: 'cake',
      titleAr: 'تورتة العام التاسع عشر (1 & 9)',
      badgeAr: '🎂 اضغط على التورتة للاحتفال وإطفاء شمعتي 1 و 9',
      mesh: cakeHit,
      worldPos: new THREE.Vector3(0, 2.2, -93),
      radius: 8.5,
    });

    this.scene.add(rotunda);
  }

  /* ==================== ANIMATED STROLLING PARISIAN & MUSEUM CROWD ==================== */
  buildAnimatedParisianCrowd() {
    const coatColors = [0x262936, 0x4b3528, 0x3b222a, 0x2e3b34, 0x5c4632, 0x222632];
    const headMat = new THREE.MeshStandardMaterial({ color: 0xe6c1a2, roughness: 0.72 });
    const legMat = new THREE.MeshStandardMaterial({ color: 0x1a1a1f, roughness: 0.85 });

    const paths = [
      // Paris Boulevard Left & Right Sidewalk Strollers
      { x: -8.6, z0: 66, z1: 22, speed: 1.05, phase: 0.1 },
      { x: -9.8, z0: 25, z1: 68, speed: 0.92, phase: 1.7 },
      { x: 8.6, z0: 64, z1: 20, speed: 1.12, phase: 2.3 },
      { x: 9.7, z0: 24, z1: 66, speed: 0.88, phase: 0.9 },
      { x: -5.2, z0: 44, z1: 14, speed: 0.95, phase: 3.1 },
      { x: 5.2, z0: 15, z1: 48, speed: 1.0, phase: 4.2 },
      // Louvre Glass Pyramid Courtyard Admirers
      { x: -5.5, z0: 14, z1: -1, speed: 0.78, phase: 1.2 },
      { x: 5.5, z0: 0, z1: 15, speed: 0.82, phase: 2.8 },
      // Louvre Grand Gallery Art Visitors
      { x: -2.4, z0: -12, z1: -56, speed: 0.72, phase: 0.5 },
      { x: 2.4, z0: -60, z1: -14, speed: 0.68, phase: 3.5 },
    ];

    paths.forEach((p, idx) => {
      const person = new THREE.Group();
      const coatMat = new THREE.MeshStandardMaterial({ color: coatColors[idx % coatColors.length], roughness: 0.75 });

      const torso = new THREE.Mesh(new THREE.CylinderGeometry(0.16, 0.24, 0.72, 10), coatMat);
      torso.position.y = 1.12;
      const head = new THREE.Mesh(new THREE.SphereGeometry(0.14, 12, 10), headMat);
      head.position.y = 1.62;
      // Chic Parisian beret on half the crowd!
      if (idx % 2 === 0) {
        const beret = new THREE.Mesh(new THREE.CylinderGeometry(0.15, 0.12, 0.06, 12), idx % 4 === 0 ? this.mats.velvetRed : coatMat);
        beret.position.set(0.02, 1.74, 0);
        beret.rotation.z = 0.18;
        person.add(beret);
      }

      const legL = new THREE.Group();
      legL.position.set(-0.09, 0.76, 0);
      const legLM = new THREE.Mesh(new THREE.CapsuleGeometry(0.06, 0.64, 4, 8), legMat);
      legLM.position.y = -0.36;
      legL.add(legLM);

      const legR = new THREE.Group();
      legR.position.set(0.09, 0.76, 0);
      const legRM = legLM.clone();
      legR.add(legRM);

      const armL = new THREE.Group();
      armL.position.set(-0.22, 1.4, 0);
      const armLM = new THREE.Mesh(new THREE.CapsuleGeometry(0.045, 0.44, 4, 8), coatMat);
      armLM.position.y = -0.24;
      armL.add(armLM);

      const armR = new THREE.Group();
      armR.position.set(0.22, 1.4, 0);
      armR.add(armLM.clone());

      person.add(torso, head, legL, legR, armL, armR);
      person.position.set(p.x, 0, p.z0);
      this.scene.add(person);
      this.crowdWalkers.push({ group: person, legL, legR, armL, armR, ...p, progress: Math.random(), dir: 1 });
    });
  }

  buildGoldenAutumnLeaves() {
    const count = this.isMobile ? 45 : 85;
    const leafGeo = new THREE.PlaneGeometry(0.16, 0.16);
    const leafMat = new THREE.MeshBasicMaterial({ color: 0xf6cf76, side: THREE.DoubleSide, transparent: true, opacity: 0.75 });
    this.leafInst = new THREE.InstancedMesh(leafGeo, leafMat, count);
    this.leafDummy = new THREE.Object3D();
    for (let i = 0; i < count; i++) {
      this.fallingLeaves.push({
        x: (Math.random() - 0.5) * 28,
        y: 1 + Math.random() * 12,
        z: 70 - Math.random() * 165,
        spd: 0.4 + Math.random() * 0.7,
        ph: Math.random() * Math.PI * 2,
      });
    }
    this.scene.add(this.leafInst);
  }

  buildPawPrintPool() {
    const geo = new THREE.PlaneGeometry(0.36, 0.36);
    for (let i = 0; i < 18; i++) {
      const m = new THREE.Mesh(
        geo,
        new THREE.MeshBasicMaterial({ map: this.pawTex, transparent: true, opacity: 0, blending: THREE.AdditiveBlending, depthWrite: false, side: THREE.DoubleSide })
      );
      m.rotation.x = -Math.PI / 2;
      m.visible = false;
      this.scene.add(m);
      this.pawPrints.push({ mesh: m, life: 0 });
    }
  }

  spawnPawPrint(pos, yaw) {
    const slot = this.pawPrints[this.pawIdx];
    this.pawIdx = (this.pawIdx + 1) % this.pawPrints.length;
    const side = (this.pawIdx % 2 === 0 ? 1 : -1) * 0.14;
    slot.mesh.position.set(pos.x + Math.cos(yaw) * side, 0.03, pos.z - Math.sin(yaw) * side);
    slot.mesh.rotation.set(-Math.PI / 2, 0, yaw);
    slot.life = 1.0;
    slot.mesh.visible = true;
  }

  /* ==================== LOAD REAL 40-BONE GOLDEN PERSIAN CAT GUIDE ==================== */
  load40BonePersianCatGuide() {
    this.catRoot.position.copy(this.catPos);
    this.scene.add(this.catRoot);

    // Floating Quest Beacon Ring under the Cat ("🐾 اتبع القطة")
    const beaconRing = new THREE.Mesh(
      new THREE.RingGeometry(0.55, 0.65, 36),
      new THREE.MeshBasicMaterial({ color: 0xffe08a, transparent: true, opacity: 0.72, side: THREE.DoubleSide, blending: THREE.AdditiveBlending, depthWrite: false })
    );
    beaconRing.rotation.x = -Math.PI / 2;
    beaconRing.position.y = 0.03;
    this.catBeaconRing = beaconRing;
    this.catRoot.add(beaconRing);

    // Warm Spotlight Accent on Cat's Face & Fur
    const catLight = new THREE.PointLight(0xffe7ba, 3.2, 5.2, 1.4);
    catLight.position.set(0, 1.3, 0.8);
    this.catRoot.add(catLight);

    // 3D Yarn Ball for Cat Play Mode
    this.catYarn = new THREE.Group();
    const yCore = new THREE.Mesh(new THREE.SphereGeometry(0.14, 14, 12), new THREE.MeshStandardMaterial({ color: 0xe8b954, roughness: 0.72 }));
    this.catYarn.add(yCore);
    for (let i = 0; i < 4; i++) {
      const b = new THREE.Mesh(new THREE.TorusGeometry(0.142, 0.017, 8, 20), this.mats.goldGlow);
      b.rotation.set(i * 0.8, i * 1.1, i * 0.5);
      this.catYarn.add(b);
    }
    this.catYarn.position.set(0.3, 0.14, 0.65);
    this.catYarn.visible = false;
    this.catRoot.add(this.catYarn);

    const loader = new GLTFLoader();
    const coatTex = this.texLoader.load('./assets/models/persian-cat-coat.jpg');
    coatTex.colorSpace = THREE.SRGBColorSpace;
    coatTex.flipY = false;

    loader.load('./assets/models/persian-cat.glb', (gltf) => {
      const model = gltf.scene;
      model.traverse((obj) => {
        if (obj.isBone || (obj.name && obj.name.startsWith('Wolf_'))) this.catBones[obj.name] = obj;
        if (obj.isMesh) {
          obj.frustumCulled = false;
          const mats = Array.isArray(obj.material) ? obj.material : [obj.material];
          mats.forEach((m) => {
            if (!m) return;
            m.map = coatTex;
            m.roughness = m.name === 'material' ? 0.08 : 0.82;
            m.metalness = m.name === 'material' ? 0.12 : 0.02;
            m.needsUpdate = true;
          });
        }
      });

      // Cute animated 3D pink tongue on jaw bone + golden bell on neck bone
      const jaw = this.catBones.Wolf_Head_JawSHJnt_12;
      if (jaw) {
        this.catTongue = new THREE.Mesh(new THREE.CapsuleGeometry(0.011, 0.042, 6, 8), new THREE.MeshStandardMaterial({ color: 0xec808d, roughness: 0.35 }));
        this.catTongue.position.set(0, 0.055, 0.055);
        this.catTongue.rotation.x = Math.PI * 0.42;
        this.catTongue.scale.setScalar(0.001);
        jaw.add(this.catTongue);
      }
      const neck = this.catBones.Wolf_Neck_01SHJnt_16;
      if (neck) {
        const bell = new THREE.Mesh(new THREE.SphereGeometry(0.016, 10, 8), this.mats.goldGlow);
        bell.position.set(0, 0.04, 0.095);
        neck.add(bell);
      }

      model.scale.setScalar(2.05);
      this.catRoot.add(model);

      if (gltf.animations?.length) {
        this.catMixer = new THREE.AnimationMixer(model);
        const act = this.catMixer.clipAction(gltf.animations[0]);
        act.setEffectiveTimeScale(0.95);
        act.play();
      }

      // Click hitbox on the Cat Guide -> Petting & Advice!
      const cHit = new THREE.Mesh(new THREE.SphereGeometry(0.75, 10, 10), new THREE.MeshBasicMaterial({ visible: false }));
      cHit.position.y = 0.55;
      cHit.userData.interactId = 'cat';
      this.catRoot.add(cHit);
      this.catHitMesh = cHit;

      this.catLoaded = true;
    });
  }

  rotCatBone(name, rx = 0, ry = 0, rz = 0) {
    const b = this.catBones[name];
    if (!b) return;
    if (rx) { this._qDelta.setFromAxisAngle(this._vX, rx); b.quaternion.multiply(this._qDelta); }
    if (ry) { this._qDelta.setFromAxisAngle(this._vY, ry); b.quaternion.multiply(this._qDelta); }
    if (rz) { this._qDelta.setFromAxisAngle(this._vZ, rz); b.quaternion.multiply(this._qDelta); }
  }

  /* ==================== PUBLIC CONTROLS ==================== */
  setJoystickInput(forward, strafe) {
    this.moveInput.forward = forward;
    this.moveInput.strafe = strafe;
    if (Math.abs(forward) > 0.1 || Math.abs(strafe) > 0.1) this.setAutoFollow(false);
  }

  setAutoFollow(enabled) {
    this.autoFollow = Boolean(enabled);
    if (this.callbacks.onAutoFollowChange) this.callbacks.onAutoFollowChange(this.autoFollow);
  }

  teleportToWaypoint(idx) {
    const wp = STORY_WAYPOINTS[Math.max(0, Math.min(STORY_WAYPOINTS.length - 1, idx))];
    if (!wp) return;
    this.currentWaypointIdx = idx;
    this.playerPos.set(wp.x, 1.68, wp.z + 4.8);
    this.catPos.set(wp.catX, 0, wp.catZ);
    this.catRoot.position.copy(this.catPos);
    // Aim camera cleanly toward the landmark/artifact!
    const lookX = wp.catX * 0.55;
    const lookZ = wp.z - 4.0;
    this.targetYaw = Math.atan2(-(lookX - this.playerPos.x), -(lookZ - this.playerPos.z));
    this.playerYaw = this.targetYaw;
    this.targetPitch = -0.04;
    this.playerPitch = -0.04;
    if (this.callbacks.onWaypointChange) this.callbacks.onWaypointChange(idx, wp);
  }

  triggerCatAction(action) {
    this.catState = action;
    this.catStateTimer = 0;
    this.catStateDur = action === 'groom' ? 5.8 : action === 'play' ? 6.5 : 3.4;
  }

  triggerCakeCelebration(blowOut = true) {
    this.candlesLit = !blowOut;
    this.candleWind = 0;
    if (blowOut) {
      this.smokeTime = 0;
      this.launchFireworks();
    } else {
      this.smokeTime = -1;
    }
  }

  setCandleWind(lvl) {
    this.candleWind = Math.max(0, Math.min(1, Number(lvl) || 0));
  }

  launchFireworks() {
    this.fireworksTime = 0;
    const pos = this.fireworksPoints.geometry.attributes.position.array;
    for (let i = 0; i < this.fireworkVels.length; i++) {
      pos[i * 3] = (Math.random() - 0.5) * 1.4;
      pos[i * 3 + 1] = (Math.random() - 0.5) * 0.6;
      pos[i * 3 + 2] = (Math.random() - 0.5) * 1.4;
    }
    this.fireworksPoints.geometry.attributes.position.needsUpdate = true;
    this.fireworksPoints.material.opacity = 1;
  }

  captureLouvrePostcard() {
    this.renderer.render(this.scene, this.camera);
    const out = document.createElement('canvas');
    out.width = 1280;
    out.height = 760;
    const ctx = out.getContext('2d');
    ctx.fillStyle = '#0f0b08';
    ctx.fillRect(0, 0, 1280, 760);
    ctx.drawImage(this.canvas, 34, 34, 1212, 620);
    ctx.strokeStyle = '#e8c268';
    ctx.lineWidth = 4;
    ctx.strokeRect(20, 20, 1240, 720);
    ctx.fillStyle = 'rgba(13, 9, 6, 0.9)';
    ctx.fillRect(24, 654, 1232, 84);
    ctx.textAlign = 'center';
    ctx.direction = 'rtl';
    ctx.fillStyle = '#fbf0cf';
    ctx.font = '700 28px Amiri, Georgia, serif';
    ctx.fillText('جولة باريس ومتحف اللوفر 3D — رحلة يمنى (العام التاسع عشر) ✦ HEY', 640, 695);
    ctx.direction = 'ltr';
    ctx.fillStyle = '#d6ab52';
    ctx.font = '600 13px Cinzel, Georgia, serif';
    ctx.fillText('MUSÉE DU LOUVRE PARIS 3D STORY  •  DESIGNED & DEVELOPED BY ENG / MOHAMED TAREK', 640, 723);

    const a = document.createElement('a');
    a.download = `Yomna-Paris-Louvre-3D-${Date.now()}.png`;
    a.href = out.toDataURL('image/png');
    a.click();
  }

  /* ==================== EVENTS: WASD, MOUSE LOOK, RAYCAST CLICK ON ARTIFACTS & CAT ==================== */
  bindEvents() {
    window.addEventListener('resize', () => {
      this.isMobile = window.innerWidth < 900;
      const aspect = window.innerWidth / Math.max(1, window.innerHeight);
      this.camera.aspect = aspect;
      this.camera.fov = aspect < 0.85 ? 64 : 52;
      this.camera.updateProjectionMatrix();
      this.renderer.setSize(window.innerWidth, window.innerHeight);
    }, { passive: true });

    window.addEventListener('keydown', (e) => {
      if (e.target instanceof HTMLTextAreaElement || e.target instanceof HTMLInputElement) return;
      this.keys[e.code] = true;
      if (['KeyW', 'KeyS', 'KeyA', 'KeyD', 'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.code)) {
        this.setAutoFollow(false);
      }
      if (e.code === 'KeyE' && this.nearestInteractable && this.callbacks.onInteract) {
        this.callbacks.onInteract(this.nearestInteractable.id);
      }
    });

    window.addEventListener('keyup', (e) => {
      this.keys[e.code] = false;
    });

    // Drag to look around 360° smoothly + Clean tap/click to inspect any 3D Artifact, Parchment, Box, Cake, or Cat!
    this.canvas.addEventListener('pointerdown', (e) => {
      this.isLooking = true;
      this.dragMoved = 0;
      this.lookStart.x = e.clientX;
      this.lookStart.y = e.clientY;
    });

    window.addEventListener('pointermove', (e) => {
      if (!this.isLooking) return;
      const dx = e.clientX - this.lookStart.x;
      const dy = e.clientY - this.lookStart.y;
      this.dragMoved += Math.hypot(dx, dy);
      this.lookStart.x = e.clientX;
      this.lookStart.y = e.clientY;
      this.targetYaw -= dx * 0.0042;
      this.targetPitch = Math.max(-0.48, Math.min(0.58, this.targetPitch - dy * 0.0032));
    }, { passive: true });

    const endLook = (e) => {
      if (!this.isLooking) return;
      this.isLooking = false;
      // Clean click/tap (< 10px drag): Raycast against ALL 3D Artifacts, Parchments, Vault Box, Cake & Cat!
      if (this.dragMoved < 10 && e && typeof e.clientX === 'number') {
        this._ndc.set((e.clientX / window.innerWidth) * 2 - 1, -(e.clientY / window.innerHeight) * 2 + 1);
        this.raycaster.setFromCamera(this._ndc, this.camera);
        const targets = this.interactables.map((it) => it.mesh);
        if (this.catHitMesh) targets.push(this.catHitMesh);
        const hits = this.raycaster.intersectObjects(targets, false);
        if (hits.length > 0 && hits[0].object.userData.interactId) {
          const id = hits[0].object.userData.interactId;
          if (id === 'cat') {
            this.triggerCatAction('pet');
            if (this.callbacks.onCatPet) this.callbacks.onCatPet();
          } else if (this.callbacks.onInteract) {
            this.callbacks.onInteract(id);
          }
        }
      }
    };
    window.addEventListener('pointerup', endLook);
    window.addEventListener('pointercancel', endLook);

    document.addEventListener('visibilitychange', () => {
      this.isHidden = document.hidden;
    });
  }

  /* ==================== 60FPS GAME SIMULATION LOOP ==================== */
  animate() {
    if (this.disposed) return;
    requestAnimationFrame(() => this.animate());
    if (this.isHidden) return;

    const dt = Math.min(this.clock.getDelta(), 0.05);
    const t = this.clock.getElapsedTime();
    const damp = 1 - Math.exp(-8.5 * dt);

    // 1. Player Movement (WASD / Arrows / Mobile Joystick / 1-Tap Auto-Follow Cat!)
    let fwd = this.moveInput.forward;
    let str = this.moveInput.strafe;
    if (this.keys.KeyW || this.keys.ArrowUp) fwd += 1;
    if (this.keys.KeyS || this.keys.ArrowDown) fwd -= 1;
    if (this.keys.KeyD || this.keys.ArrowRight) str += 1;
    if (this.keys.KeyA || this.keys.ArrowLeft) str -= 1;

    if (this.autoFollow) {
      // Smoothly walk straight toward the current Story Waypoint right behind the 40-bone Golden Persian Cat!
      const wp = STORY_WAYPOINTS[this.currentWaypointIdx];
      const dx = wp.x - this.playerPos.x;
      const dz = wp.z - this.playerPos.z;
      const dist = Math.hypot(dx, dz);

      // Gently steer camera toward the cat/waypoint unless user is manually looking around
      if (!this.isLooking) {
        const desiredYaw = Math.atan2(-dx, -dz);
        let diff = desiredYaw - this.targetYaw;
        while (diff > Math.PI) diff -= Math.PI * 2;
        while (diff < -Math.PI) diff += Math.PI * 2;
        this.targetYaw += diff * (1 - Math.exp(-3.2 * dt));
        this.targetPitch += (-0.03 - this.targetPitch) * (1 - Math.exp(-3.0 * dt));
      }

      if (dist > 1.8) {
        const step = Math.min(dist, 5.2 * dt);
        this.playerPos.x += (dx / dist) * step;
        this.playerPos.z += (dz / dist) * step;
        this.walkBobPhase += step * 2.2;
      } else if (this.currentWaypointIdx < STORY_WAYPOINTS.length - 1) {
        this.currentWaypointIdx++;
        if (this.callbacks.onWaypointChange) {
          this.callbacks.onWaypointChange(this.currentWaypointIdx, STORY_WAYPOINTS[this.currentWaypointIdx]);
        }
      } else {
        this.setAutoFollow(false);
      }
    } else {
      const mag = Math.hypot(fwd, str);
      if (mag > 0.05) {
        const normF = fwd / Math.max(1, mag);
        const normS = str / Math.max(1, mag);
        const speed = 6.2 * dt;
        const sinY = Math.sin(this.playerYaw);
        const cosY = Math.cos(this.playerYaw);
        this.playerPos.x += (-sinY * normF + cosY * normS) * speed;
        this.playerPos.z += (-cosY * normF - sinY * normS) * speed;
        this.walkBobPhase += speed * 2.4;
      }
    }

    // Smooth World Boundary Collisions (Paris Avenue -> Courtyard -> Louvre Gallery -> Grand Rotunda!)
    const inRotunda = this.playerPos.z < -81;
    const inLouvre = this.playerPos.z < -5 && !inRotunda;
    const maxW = inRotunda ? 9.5 : inLouvre ? 6.2 : 12.2;
    this.playerPos.x = Math.max(-maxW, Math.min(maxW, this.playerPos.x));
    this.playerPos.z = Math.max(-101, Math.min(72, this.playerPos.z));

    // Smooth Camera Rotation & Gentle Natural Footstep Bob
    this.playerYaw += (this.targetYaw - this.playerYaw) * damp;
    this.playerPitch += (this.targetPitch - this.playerPitch) * damp;
    const bobY = Math.sin(this.walkBobPhase) * 0.032;

    this.camera.position.set(this.playerPos.x, this.playerPos.y + bobY, this.playerPos.z);
    this.camera.rotation.order = 'YXZ';
    this.camera.rotation.y = this.playerYaw;
    this.camera.rotation.x = this.playerPitch;

    this.playerLantern.position.set(this.playerPos.x, 3.2, this.playerPos.z - 2.5);

    // 2. Auto-detect Active Story Milestone as Player Walks Freely Through Paris & Louvre!
    if (!this.autoFollow) {
      let bestIdx = this.currentWaypointIdx;
      let bestD = Infinity;
      for (let i = 0; i < STORY_WAYPOINTS.length; i++) {
        const d = Math.abs(this.playerPos.z - STORY_WAYPOINTS[i].z);
        if (d < bestD) { bestD = d; bestIdx = i; }
      }
      if (bestIdx !== this.currentWaypointIdx) {
        this.currentWaypointIdx = bestIdx;
        if (this.callbacks.onWaypointChange) this.callbacks.onWaypointChange(bestIdx, STORY_WAYPOINTS[bestIdx]);
      }
    }

    // 3. Detect Nearest Interactive Museum Artifact / Parchment / Vault Box / Cake for Proximity Prompt!
    let closest = null;
    let minD = Infinity;
    for (const it of this.interactables) {
      const d = Math.hypot(this.playerPos.x - it.worldPos.x, this.playerPos.z - it.worldPos.z);
      if (d < it.radius && d < minD) {
        minD = d;
        closest = it;
      }
    }
    if (closest?.id !== this.nearestInteractable?.id) {
      this.nearestInteractable = closest;
      if (this.callbacks.onProximityChange) this.callbacks.onProximityChange(closest);
    }

    // 4. REAL 40-BONE GOLDEN PERSIAN CAT GUIDE LOCOMOTION & ANIMATIONS!
    // Cat stays 4–6m ahead of player along the active Story Waypoint, walking with real 40-bone gait & glowing pawprints!
    const wp = STORY_WAYPOINTS[this.currentWaypointIdx];
    const targetCatX = wp.catX;
    const targetCatZ = Math.max(wp.catZ, this.playerPos.z - 7.5);
    const cdx = targetCatX - this.catPos.x;
    const cdz = targetCatZ - this.catPos.z;
    const cDist = Math.hypot(cdx, cdz);
    let catSpd = 0;

    if (cDist > 0.32) {
      const step = Math.min(cDist, Math.max(2.6, cDist * 1.45) * dt, 7.2 * dt);
      this.catPos.x += (cdx / cDist) * step;
      this.catPos.z += (cdz / cDist) * step;
      catSpd = step / Math.max(0.001, dt);
      this.catStride += step * 4.5;
      this.catStepAccum += step;
      if (this.catStepAccum > 0.55) {
        this.catStepAccum = 0;
        this.spawnPawPrint(this.catPos, this.catYaw);
      }
    }
    this.catRoot.position.copy(this.catPos);
    if (this.catBeaconRing) {
      this.catBeaconRing.rotation.z = t * 1.2;
      this.catBeaconRing.scale.setScalar(1 + Math.sin(t * 3.5) * 0.08);
    }

    const catMoving = catSpd > 0.25;
    const desiredCatYaw = catMoving
      ? Math.atan2(cdx, cdz)
      : Math.atan2(this.playerPos.x - this.catPos.x, this.playerPos.z - this.catPos.z);
    let cyDiff = desiredCatYaw - this.catYaw;
    while (cyDiff > Math.PI) cyDiff -= Math.PI * 2;
    while (cyDiff < -Math.PI) cyDiff += Math.PI * 2;
    this.catYaw += cyDiff * (1 - Math.exp(-6.5 * dt));
    this.catRoot.rotation.y = this.catYaw;

    // Autonomous cat idle -> groom/play when waiting for player
    this.catStateTimer += dt;
    if (!catMoving) {
      if (this.catState !== 'guide' && this.catStateTimer > this.catStateDur) {
        this.catState = 'guide';
        this.catStateTimer = 0;
        this.catStateDur = 8 + Math.random() * 5;
      } else if (this.catState === 'guide' && this.catStateTimer > this.catStateDur) {
        this.catState = Math.random() < 0.55 ? 'groom' : 'play';
        this.catStateTimer = 0;
        this.catStateDur = 5.5;
      }
    }

    this.catYarn.visible = this.catState === 'play' && !catMoving;
    if (this.catYarn.visible) {
      this.catYarn.position.x = Math.sin(t * 3.2) * 0.32;
      this.catYarn.position.y = 0.14 + Math.abs(Math.sin(t * 5.0)) * 0.22;
      this.catYarn.rotation.z += dt * 4;
    }

    if (this.catLoaded) {
      if (this.catMixer) this.catMixer.update(dt);
      const w = catMoving ? Math.min(1, catSpd / 2.0) : 0;
      if (w > 0.05) {
        const s = this.catStride;
        this.rotCatBone('Wolf_Spine_02SHJnt_20', Math.sin(s) * 0.09 * w, 0, 0);
        this.rotCatBone('Wolf_Spine_04SHJnt_18', -Math.sin(s) * 0.11 * w, 0, 0);
        this.rotCatBone('Wolf_l_FrontLeg_HipSHJnt_4', Math.sin(s) * 0.56 * w, 0, 0);
        this.rotCatBone('Wolf_l_FrontLeg_KneeSHJnt_3', -Math.max(0, Math.cos(s)) * 0.62 * w, 0, 0);
        this.rotCatBone('Wolf_r_FrontLeg_HipSHJnt_10', Math.sin(s + Math.PI) * 0.56 * w, 0, 0);
        this.rotCatBone('Wolf_r_FrontLeg_KneeSHJnt_9', -Math.max(0, Math.cos(s + Math.PI)) * 0.62 * w, 0, 0);
        this.rotCatBone('Wolf_l_HindLeg_HipSHJnt_27', Math.sin(s + Math.PI * 0.85) * 0.52 * w, 0, 0);
        this.rotCatBone('Wolf_l_HindLeg_Knee2SHJnt_25', Math.max(0, Math.cos(s + Math.PI * 0.85)) * 0.8 * w, 0, 0);
        this.rotCatBone('Wolf_r_HindLeg_HipSHJnt_33', Math.sin(s - Math.PI * 0.15) * 0.52 * w, 0, 0);
        this.rotCatBone('Wolf_r_HindLeg_Knee2SHJnt_31', Math.max(0, Math.cos(s - Math.PI * 0.15)) * 0.8 * w, 0, 0);
      } else if (this.catState === 'groom') {
        const lk = Math.sin(t * 6.2);
        this.rotCatBone('Wolf_r_FrontLeg_HipSHJnt_10', -0.92, 0, 0.24);
        this.rotCatBone('Wolf_r_FrontLeg_KneeSHJnt_9', -0.82, 0, 0);
        this.rotCatBone('Wolf_Neck_01SHJnt_16', 0.3, 0, 0.12);
        this.rotCatBone('Wolf_Neck_TopSHJnt_14', 0.34 + lk * 0.08, 0.14, 0);
        this.rotCatBone('Wolf_Head_JawSHJnt_12', 0.18 + Math.max(0, lk) * 0.2, 0, 0);
        if (this.catTongue) this.catTongue.scale.setScalar(Math.max(0.001, Math.max(0, lk)));
      } else if (this.catState === 'play') {
        this.rotCatBone('Wolf_Spine_02SHJnt_20', 0.15, 0, Math.sin(t * 7) * 0.06);
        this.rotCatBone('Wolf_r_FrontLeg_HipSHJnt_10', -Math.max(0, Math.sin(t * 5.2)) * 0.85, 0, 0);
        if (this.catTongue) this.catTongue.scale.setScalar(0.001);
      } else if (this.catState === 'pet') {
        this.rotCatBone('Wolf_Neck_TopSHJnt_14', -0.18, Math.sin(t * 4.5) * 0.22, Math.sin(t * 5) * 0.2);
        if (this.catTongue) this.catTongue.scale.setScalar(0.001);
      } else if (this.catTongue) {
        this.catTongue.scale.setScalar(0.001);
      }

      // Expressive 4-segment tail swish
      ['Wolf_Tail_01_02SHJnt_37', 'Wolf_Tail_01_03SHJnt_36', 'Wolf_Tail_01_04SHJnt_35', 'Wolf_Tail_01_05SHJnt_34'].forEach((bn, i) => {
        this.rotCatBone(bn, Math.sin(t * (catMoving ? 6 : 2.4) - i * 0.65) * (catMoving ? 0.24 : 0.16), 0, i === 0 ? 0.16 : 0.05);
      });
    }

    // Fade 3D golden pawprints smoothly
    for (const p of this.pawPrints) {
      if (p.life > 0) {
        p.life -= dt * 0.35;
        p.mesh.material.opacity = Math.max(0, p.life * 0.85);
        if (p.life <= 0) p.mesh.visible = false;
      }
    }

    // 5. Animate Strolling Parisian Crowd
    for (const c of this.crowdWalkers) {
      const span = Math.max(1, Math.abs(c.z1 - c.z0));
      c.progress += (c.speed * dt * c.dir) / span;
      if (c.progress >= 1) { c.progress = 1; c.dir = -1; }
      else if (c.progress <= 0) { c.progress = 0; c.dir = 1; }
      const z = THREE.MathUtils.lerp(c.z0, c.z1, c.progress);
      c.group.position.z = z;
      c.group.rotation.y = (c.z1 > c.z0 ? (c.dir > 0 ? 0 : Math.PI) : (c.dir > 0 ? Math.PI : 0));
      const swing = Math.sin(t * 5.2 + c.phase) * 0.42;
      c.legL.rotation.x = swing;
      c.legR.rotation.x = -swing;
      c.armL.rotation.x = -swing * 0.65;
      c.armR.rotation.x = swing * 0.65;
    }

    // 6. Animate Eiffel Twinkles, Floating Artifacts, Parchments, Autumn Leaves & 3D Cake!
    if (this.eiffelBeacon) this.eiffelBeacon.scale.setScalar(6.0 + Math.sin(t * 3.5) * 1.4);
    for (const sp of this.eiffelSparkles) {
      sp.sprite.material.opacity = 0.2 + Math.max(0, Math.sin(t * sp.speed + sp.phase)) * 0.8;
    }
    for (const fp of this.floatingProps) {
      fp.mesh.position.y = fp.baseY + Math.sin(t * fp.speed) * 0.1;
      fp.mesh.rotation.y += dt * 0.42;
    }
    for (const pc of this.parchments) {
      pc.mesh.position.y = pc.baseY + Math.sin(t * 1.8 + pc.phase) * 0.08;
    }
    for (let i = 0; i < this.fallingLeaves.length; i++) {
      const lf = this.fallingLeaves[i];
      lf.y -= lf.spd * dt;
      if (lf.y < 0.2) lf.y = 11;
      this.leafDummy.position.set(lf.x + Math.sin(t + lf.ph) * 0.4, lf.y, lf.z);
      this.leafDummy.rotation.set(t + lf.ph, t * 0.7, lf.ph);
      this.leafDummy.updateMatrix();
      this.leafInst.setMatrixAt(i, this.leafDummy.matrix);
    }
    this.leafInst.instanceMatrix.needsUpdate = true;

    // 3D Birthday Cake Gentle Forward Showcase Sway ("19" ALWAYS forward & readable!) + Flames + Smoke + Fireworks!
    if (this.cakeGroup && this.cakeSpin) {
      this.cakeGroup.rotation.y = Math.sin(t * 0.55) * 0.36;
    }
    const dampFast = 1 - Math.exp(-10 * dt);
    for (let i = 0; i < this.cakeFlames.length; i++) {
      const f = this.cakeFlames[i];
      const sc = this.candlesLit ? Math.max(0.24, 0.98 - this.candleWind * 0.35 + Math.sin(t * 12 + f.phase) * (0.14 + this.candleWind * 0.35)) : 0.001;
      this._tmpScale.set(sc, sc * 1.06, sc);
      f.group.scale.lerp(this._tmpScale, dampFast);
      f.glow.material.opacity = THREE.MathUtils.lerp(f.glow.material.opacity, this.candlesLit ? 0.94 : 0, dampFast);
    }
    if (this.smokeTime >= 0) {
      this.smokeTime += dt;
      for (const sp of this.smokePuffs) {
        sp.sprite.position.y = sp.baseY + this.smokeTime * 0.65;
        const sc = 0.4 + this.smokeTime * 0.55;
        sp.sprite.scale.set(sc, sc, 1);
        sp.sprite.material.opacity = Math.max(0, 0.55 - this.smokeTime * 0.24);
      }
      if (this.smokeTime > 2.6) this.smokeTime = -1;
    }
    if (this.fireworksTime >= 0) {
      this.fireworksTime += dt;
      const pos = this.fireworksPoints.geometry.attributes.position.array;
      for (let i = 0; i < this.fireworkVels.length; i++) {
        const v = this.fireworkVels[i];
        pos[i * 3] += v.x * dt * 0.72;
        pos[i * 3 + 1] += (v.y - this.fireworksTime * 1.4) * dt * 0.72;
        pos[i * 3 + 2] += v.z * dt * 0.72;
      }
      this.fireworksPoints.geometry.attributes.position.needsUpdate = true;
      this.fireworksPoints.material.opacity = Math.max(0, 1 - this.fireworksTime / 4.8);
      if (this.fireworksTime > 4.9) this.fireworksTime = -1;
    }

    // Smooth atmospheric fog transition: warm Parisian twilight outdoors -> rich dark museum ambiance indoors!
    const insideFrac = Math.max(0, Math.min(1, (-this.playerPos.z - 2) / 14));
    this.scene.fog.density = THREE.MathUtils.lerp(0.0075, 0.0155, insideFrac);

    this.renderer.render(this.scene, this.camera);
  }
}
