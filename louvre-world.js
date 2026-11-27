/**
 * =========================================================================
 *  SILKY 60FPS PARIS & MUSÉE DU LOUVRE 3D ENGINE (louvre-world.js v24)
 *  - Ultra-Smooth Performance Architecture:
 *      * 15FPS low-power preview while Reception Portal is open -> instant 60FPS on entry
 *      * Zero-cost Static Baked Sun Shadows (shadowMap.autoUpdate = false)
 *      * Single-pass native ACES rendering default + Opt-in Ultra HDR Bloom
 *      * Distance-culled Mocap Human Visitors (5 Desktop / 3 Mobile) + 512px Scanned PBR
 *  - Live Interactive Museum Events:
 *      * 19 Glowing Birthday Sky Lanterns Rising Over Paris & Louvre
 *      * Paris Eiffel Tower Champagne Sparkle Show + Rotating Searchlight
 *      * 5 Hidden Collectible Golden Wax Seals Hunt Across Paris & Louvre
 *      * Cour Napoléon Wishing Coin Fountain + Open-Portal Automatic Glass Doors
 *  - Pro Tools Support: Live Mini-Map Telemetry, Telephoto Zoom (1x / 2x),
 *    4 Lighting Atmospheres, UV Secret Loupe, Live 3D Wall Art Easel & Drone Tour
 *  - Designed & Developed by ENG / Mohamed Tarek • HEY Edition
 * =========================================================================
 */

import * as THREE from './vendor/three.module.min.js';
import { GLTFLoader } from './vendor/GLTFLoader.js';
import * as SkeletonUtils from './vendor/SkeletonUtils.js';
import { EffectComposer } from './vendor/postprocessing/EffectComposer.js';
import { RenderPass } from './vendor/postprocessing/RenderPass.js';
import { UnrealBloomPass } from './vendor/postprocessing/UnrealBloomPass.js';
import { OutputPass } from './vendor/postprocessing/OutputPass.js';
import {
  loadRealPBRSet,
  createGlowTexture,
  createLightBeamTexture,
  createCloudTexture,
  createHaussmannFacadePBR,
  createLouvrePalacePBR,
  createMansardRoofPBR,
  createEiffelLatticeTexture,
  createTreeFoliageTexture,
  createLouvreWallPanelPBR,
  createParchmentTexture,
  createUVSecretOverlayTexture,
  createDefaultCustomLouvreCanvas,
  createLouvreSignTexture,
  createPawPrintTexture,
} from './louvre-assets.js?v=24';

export const STORY_WAYPOINTS = [
  {
    id: 'paris',
    labelAr: 'شارع باريس وبرج إيفل',
    x: 0, z: 56, catX: -0.65, catZ: 51.5,
    tipAr: 'أهلاً بك في شوارع باريس بجانب برج إيفل. اتبع خطوات القطة الذهبية نحو ساحة نابليون وهرم متحف اللوفر.',
  },
  {
    id: 'pyramid',
    labelAr: 'ساحة نابليون، النافورة وبوابة الهرم',
    x: 0, z: 16.5, catX: 0.0, catZ: 12.2, interactId: 'fountain',
    tipAr: 'هنا ساحة هرم اللوفر الزجاجي. يمكنك إلقاء عملة أمنية في النافورة على يمينك، والعبور عبر الأبواب الزجاجية الأوتوماتيكية إلى القاعة الكبرى.',
  },
  {
    id: 'artifact-1',
    labelAr: 'التحفة 01 • البدايات والطفولة',
    x: -1.4, z: -19, catX: -2.4, catZ: -20.0, interactId: 'childhood',
    tipAr: 'التحفة الأولى في معرض رحلة يمنى. اضغط على الورقة الذهبية لاستكشاف حكاية البدايات، أو جرّب عدسة الأسرار لقراءة الرسائل المخفية.',
  },
  {
    id: 'easel',
    labelAr: 'مرسم الزوار • علّق لوحتك باللوفر',
    x: 1.8, z: -26.8, catX: 2.2, catZ: -27.4, interactId: 'easel',
    tipAr: 'مرسم متحف اللوفر التفاعلي. اضغط على الحامل الذهبي لرسم لوحة أو توقيع تذكاري ليُعلّق مباشرة داخل الإطار الباروكي على جدار المتحف.',
  },
  {
    id: 'artifact-2',
    labelAr: 'التحفة 02 • روح الأتيليه والشغف',
    x: 1.4, z: -34, catX: 2.4, catZ: -35.0, interactId: 'passion',
    tipAr: 'التحفة الثانية وتوثّق نضج شغف الرسم والأتيليه. اضغط عليها لمطالعة تفاصيلها الفنية.',
  },
  {
    id: 'artifact-3',
    labelAr: 'التحفة 03 • تالتة ثانوي وبداية الطريق',
    x: -1.4, z: -48, catX: -2.4, catZ: -49.0, interactId: 'thanaweya',
    tipAr: 'الساعة الرملية الذهبية لمحطة تالتة ثانوي. افتح الورقة الذهبية لقراءة رسالة الطمأنينة المختومة.',
  },
  {
    id: 'artifact-4',
    labelAr: 'التحفة 04 • تمثال الرخام وحلم الفنون الجميلة',
    x: 1.4, z: -62, catX: 2.4, catZ: -63.0, interactId: 'fine-arts',
    tipAr: 'المنحوتة الكلاسيكية من رخام كارارا وبوابة حلم كلية الفنون الجميلة. اضغط لاستعراض بطاقة الحلم الرسمية.',
  },
  {
    id: 'vault-manifesto',
    labelAr: 'صندوق العيلة والرسالة الأهم ★',
    x: 0, z: -74, catX: -1.8, catZ: -75.0, interactId: 'vault',
    tipAr: 'على يسارك صندوق رسائل العائلة السحابي ليمنى، وعلى يمينك مسلّة الرسالة الأهم في ختام الرحلة.',
  },
  {
    id: 'cake',
    labelAr: 'القبة الملكية وتورتة الـ 19',
    x: 0, z: -87.2, catX: 2.2, catZ: -90.8, interactId: 'cake',
    tipAr: 'وصلنا إلى القبة الملكية وتورتة العام التاسع عشر بشمعتي 1 و 9. اضغط على التورتة للاحتفال وإطلاق الألعاب النارية.',
  },
];

export const HIDDEN_SEALS_DATA = [
  { id: 'seal-1', x: -5.4, z: 10.6, labelAr: 'ختم ساحة اللوفر', quoteAr: 'كل خطوة هادئة نحو الحلم تصنع أثراً يبقى مدى الحياة.' },
  { id: 'seal-2', x: -6.0, z: -15.5, labelAr: 'ختم ألوان البداية', quoteAr: 'الفن الحقيقي يبدأ بعينٍ تلاحظ الجمال حيث يغفل الآخرون.' },
  { id: 'seal-3', x: 5.8, z: -29.5, labelAr: 'ختم مرسم الأتيليه', quoteAr: 'الفرشاة الصادقة تحكي ما تعجز الكلمات عن وصفه.' },
  { id: 'seal-4', x: -6.0, z: -53.5, labelAr: 'ختم الطمأنينة والثبات', quoteAr: 'ثانوية عامة جسرٌ تعبرينه بهدوءٍ وثقة، وعائلتكِ سندكِ الدائم.' },
  { id: 'seal-5', x: 5.2, z: -90.5, labelAr: 'ختم القبة الملكية', quoteAr: 'عامكِ التاسع عشر بداية إشراقة جديدة نحو كلية الفنون الجميلة.' },
];

const TIME_PRESETS = {
  sunset: {
    labelAr: '🌇 غروب باريس',
    skyTop: 0x162244, skyMid: 0x724058, skyHorizon: 0xf4a05c, sunGlow: 0xffe49e,
    sunColor: 0xffc880, sunIntensity: 2.55, sunPos: new THREE.Vector3(-42, 26, -64),
    hemiSky: 0xffe2be, hemiGround: 0x2c2224, hemiIntensity: 1.18,
    fogColor: 0x2b2029, fogDensity: 0.0044, exposure: 1.08, bloomStrength: 0.34,
    starsOpacity: 0.4, cloudTint: 0xffd2a8, cloudOpacity: 0.56,
    windowEmissive: 0.85, lampOpacity: 0.82, showSun: true, showMoon: false, searchlightOpacity: 0.0,
  },
  day: {
    labelAr: '☀️ نهار باريس',
    skyTop: 0x286bc2, skyMid: 0x6ca6e4, skyHorizon: 0xd9ecfa, sunGlow: 0xfff8e2,
    sunColor: 0xfff4dd, sunIntensity: 3.05, sunPos: new THREE.Vector3(-34, 62, -40),
    hemiSky: 0xeaf4ff, hemiGround: 0x5c5348, hemiIntensity: 1.4,
    fogColor: 0xb7cde0, fogDensity: 0.0026, exposure: 1.02, bloomStrength: 0.2,
    starsOpacity: 0.0, cloudTint: 0xffffff, cloudOpacity: 0.78,
    windowEmissive: 0.1, lampOpacity: 0.14, showSun: true, showMoon: false, searchlightOpacity: 0.0,
  },
  night: {
    labelAr: '🌙 ليل باريس',
    skyTop: 0x050918, skyMid: 0x0f1a38, skyHorizon: 0x262542, sunGlow: 0xaac4ff,
    sunColor: 0x8eaef0, sunIntensity: 0.95, sunPos: new THREE.Vector3(36, 46, -65),
    hemiSky: 0x5571a8, hemiGround: 0x1b1614, hemiIntensity: 0.88,
    fogColor: 0x101426, fogDensity: 0.0048, exposure: 1.16, bloomStrength: 0.46,
    starsOpacity: 0.96, cloudTint: 0x4b5c82, cloudOpacity: 0.32,
    windowEmissive: 1.38, lampOpacity: 1.0, showSun: false, showMoon: true, searchlightOpacity: 0.46,
  },
  gallery: {
    labelAr: '🏛️ أتيليه دافئ',
    skyTop: 0x201512, skyMid: 0x4c2d22, skyHorizon: 0xc28149, sunGlow: 0xffdf99,
    sunColor: 0xffd28e, sunIntensity: 2.2, sunPos: new THREE.Vector3(-20, 42, -52),
    hemiSky: 0xffebd0, hemiGround: 0x332419, hemiIntensity: 1.32,
    fogColor: 0x231813, fogDensity: 0.0038, exposure: 1.12, bloomStrength: 0.3,
    starsOpacity: 0.25, cloudTint: 0xf4c28e, cloudOpacity: 0.44,
    windowEmissive: 1.05, lampOpacity: 0.92, showSun: true, showMoon: false, searchlightOpacity: 0.14,
  },
};

export class LouvreParisWorld3D {
  constructor(canvas, config, callbacks = {}) {
    this.canvas = canvas;
    this.config = config;
    this.callbacks = callbacks;

    this.isMobile = window.innerWidth < 900;
    this.qualityMode = 'smooth60'; // 'smooth60' (Default 1-pass 60FPS!) | 'ultra' (HDR Bloom) | 'eco'
    this.timeOfDay = 'sunset';
    this.uvMode = false;
    this.zoomed = false;
    this.portalPaused = true; // Throttles background render to 15FPS while portal is open for zero entry lag!
    this.portalTickAccum = 0;

    this.droneActive = false;
    this.droneTime = 0;
    this.sparkleShowTimer = 0;
    this.disposed = false;
    this.isHidden = false;

    this.playerPos = new THREE.Vector3(0, 1.68, 63);
    this.playerYaw = 0;
    this.playerPitch = 0.02;
    this.targetYaw = 0;
    this.targetPitch = 0.02;
    this.baseFov = window.innerWidth / Math.max(1, window.innerHeight) < 0.85 ? 64 : 53;
    this.walkBobPhase = 0;
    this.footstepAccum = 0;
    this.moveInput = { forward: 0, strafe: 0 };
    this.keys = {};
    this.autoFollow = false;
    this.currentWaypointIdx = 0;
    this.enteredLouvreOnce = false;

    this.circleColliders = [];
    this.boxColliders = [];
    this.pyramidDoors = [];
    this.flyingCoins = [];
    this.skyLanterns = [];
    this.hiddenSeals = [];
    this.uvSecretMeshes = [];

    this.isLooking = false;
    this.lookStart = { x: 0, y: 0 };
    this.dragMoved = 0;
    this.interactables = [];
    this.nearestInteractable = null;

    // 40-Bone Golden Persian Cat
    this.catRoot = new THREE.Group();
    this.catPos = new THREE.Vector3(-0.65, 0, 57.5);
    this.catYaw = Math.PI;
    this.catMixer = null;
    this.catBoneInfo = {};
    this.catLoaded = false;
    this.catStride = 0;
    this.catStepAccum = 0;
    this.catState = 'guide';
    this.catStateTimer = 0;
    this.catStateDur = 10;
    this.pawPrints = [];
    this.pawIdx = 0;

    this.humanVisitors = [];
    this.candlesLit = true;
    this.candleWind = 0;
    this.cakeFlames = [];
    this.smokePuffs = [];
    this.smokeTime = -1;
    this.fireworksTime = -1;

    this.floatingProps = [];
    this.parchments = [];
    this.lampHalos = [];
    this.cloudSprites = [];
    this.fallingLeaves = [];
    this.eiffelSparkles = [];
    this.fountainRings = [];
    this.emissiveBuildingMats = [];

    // Pre-allocated scratch math objects (ZERO per-frame GC stalls!)
    this.raycaster = new THREE.Raycaster();
    this._ndc = new THREE.Vector2();
    this._qDelta = new THREE.Quaternion();
    this._tmpLook = new THREE.Vector3();

    this.clock = new THREE.Clock();
    this.init();
  }

  /* ==================== INIT ULTRA-SMOOTH 60FPS RENDERER ==================== */
  init() {
    this.renderer = new THREE.WebGLRenderer({
      canvas: this.canvas,
      antialias: !this.isMobile,
      powerPreference: 'high-performance',
    });
    // Baked Static Shadows on Desktop (0.0ms per-frame cost!), contact shadows on Mobile!
    this.renderer.shadowMap.enabled = !this.isMobile;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    this.renderer.shadowMap.autoUpdate = false;
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.08;
    this.renderer.outputColorSpace = THREE.SRGBColorSpace;

    this.scene = new THREE.Scene();
    this.scene.fog = new THREE.FogExp2(0x2b2029, 0.0044);

    const aspect = window.innerWidth / Math.max(1, window.innerHeight);
    this.baseFov = aspect < 0.85 ? 64 : 53;
    this.camera = new THREE.PerspectiveCamera(this.baseFov, aspect, 0.12, 460);

    // Lazy-allocated HDR Bloom Composer (only instantiated if user picks Ultra Bloom!)
    this.composer = null;
    this.bloomPass = null;
    this.applyQualitySettings();

    this.pmremGenerator = new THREE.PMREMGenerator(this.renderer);
    this.pmremGenerator.compileEquirectangularShader();

    this.texLoader = new THREE.TextureLoader();
    this.gltfLoader = new GLTFLoader();
    const aniso = Math.min(this.renderer.capabilities.getMaxAnisotropy(), this.isMobile ? 2 : 6);

    // Compressed 512px CC0 Photogrammetry Scanned PBR Maps (397KB total!)
    this.cobbleScan = loadRealPBRSet(this.texLoader, './assets/textures/cobble_diff.jpg', './assets/textures/cobble_nor.jpg', './assets/textures/cobble_rough.jpg', 14, 34, aniso);
    this.parquetScan = loadRealPBRSet(this.texLoader, './assets/textures/parquet_diff.jpg', './assets/textures/parquet_nor.jpg', './assets/textures/parquet_rough.jpg', 6, 24, aniso);
    this.marbleScan = loadRealPBRSet(this.texLoader, './assets/textures/marble_diff.jpg', './assets/textures/marble_nor.jpg', null, 2, 2, aniso);
    this.stoneScan = loadRealPBRSet(this.texLoader, './assets/textures/stone_diff.jpg', './assets/textures/stone_nor.jpg', null, 4, 2, aniso);

    this.glowTex = createGlowTexture();
    this.beamTex = createLightBeamTexture();
    this.cloudTex = createCloudTexture();
    this.pawTex = createPawPrintTexture();
    this.haussmannPBR = createHaussmannFacadePBR(aniso);
    this.louvrePBR = createLouvrePalacePBR(aniso);
    this.mansardTex = createMansardRoofPBR(aniso);
    this.eiffelLatticeTex = createEiffelLatticeTexture(aniso);
    this.foliageTex = createTreeFoliageTexture();
    this.wallPanelTex = createLouvreWallPanelPBR(aniso);

    this.mats = {
      gold: new THREE.MeshStandardMaterial({ color: 0xefc86a, metalness: 0.9, roughness: 0.18 }),
      goldGlow: new THREE.MeshStandardMaterial({ color: 0xfff0be, emissive: 0xe6a02e, emissiveIntensity: 0.82, metalness: 0.7, roughness: 0.2 }),
      waxCrimson: new THREE.MeshStandardMaterial({ color: 0xa11e2b, emissive: 0x5c0e16, emissiveIntensity: 0.45, roughness: 0.3, metalness: 0.2 }),
      marble: new THREE.MeshStandardMaterial({ map: this.marbleScan.map, normalMap: this.marbleScan.normalMap, normalScale: new THREE.Vector2(0.35, 0.35), color: 0xfbf6ef, roughness: 0.18, metalness: 0.04 }),
      limestoneScanned: new THREE.MeshStandardMaterial({ map: this.stoneScan.map, normalMap: this.stoneScan.normalMap, normalScale: new THREE.Vector2(0.5, 0.5), color: 0xe4d4bc, roughness: 0.74, metalness: 0.02 }),
      haussmann: new THREE.MeshStandardMaterial({
        map: this.haussmannPBR.map, normalMap: this.stoneScan.normalMap, normalScale: new THREE.Vector2(0.25, 0.25),
        emissive: new THREE.Color(0xffc773), emissiveMap: this.haussmannPBR.emissiveMap, emissiveIntensity: 0.85, roughness: 0.72, metalness: 0.04,
      }),
      louvrePalace: new THREE.MeshStandardMaterial({
        map: this.louvrePBR.map, normalMap: this.stoneScan.normalMap, normalScale: new THREE.Vector2(0.3, 0.3),
        emissive: new THREE.Color(0xffc975), emissiveMap: this.louvrePBR.emissiveMap, emissiveIntensity: 0.82, roughness: 0.66, metalness: 0.05,
      }),
      mansard: new THREE.MeshStandardMaterial({ map: this.mansardTex, roughness: 0.44, metalness: 0.36 }),
      ironDark: new THREE.MeshStandardMaterial({ color: 0x232428, metalness: 0.84, roughness: 0.3 }),
      eiffelSteel: new THREE.MeshStandardMaterial({ color: 0x5d483a, metalness: 0.76, roughness: 0.34 }),
      eiffelLattice: new THREE.MeshStandardMaterial({ map: this.eiffelLatticeTex, alphaTest: 0.35, side: THREE.DoubleSide, metalness: 0.74, roughness: 0.36 }),
      velvetRed: new THREE.MeshStandardMaterial({ color: 0x6f1623, roughness: 0.88 }),
      woodDark: new THREE.MeshStandardMaterial({ color: 0x3b2314, roughness: 0.5 }),
      lampGlow: new THREE.MeshBasicMaterial({ color: 0xfff2c6 }),
      lanternPaper: new THREE.MeshStandardMaterial({ color: 0xffdca0, emissive: 0xffa638, emissiveIntensity: 1.25, roughness: 0.4, transparent: true, opacity: 0.92 }),
      glassPyramid: new THREE.MeshPhysicalMaterial({
        color: 0xdaf0f7, emissive: 0x7c551e, emissiveIntensity: 0.2, transparent: true, opacity: 0.44,
        roughness: 0.06, metalness: 0.16, reflectivity: 1.0, clearcoat: 1.0, side: THREE.DoubleSide,
      }),
      glassDoor: new THREE.MeshPhysicalMaterial({
        color: 0xe6f7fc, transparent: true, opacity: 0.52, roughness: 0.04, metalness: 0.2, clearcoat: 1.0, side: THREE.DoubleSide,
      }),
      waterPool: new THREE.MeshPhysicalMaterial({
        color: 0x13263a, normalMap: this.marbleScan.normalMap, normalScale: new THREE.Vector2(0.16, 0.16),
        roughness: 0.04, metalness: 0.45, clearcoat: 1.0, reflectivity: 0.98,
      }),
      cakeCream: new THREE.MeshStandardMaterial({ color: 0xfbf3e4, roughness: 0.5 }),
      cakeFrosting: new THREE.MeshStandardMaterial({ color: 0xfff8ed, roughness: 0.38 }),
      cakeGanache: new THREE.MeshStandardMaterial({ color: 0x351a0f, roughness: 0.16, metalness: 0.16 }),
      strawberry: new THREE.MeshStandardMaterial({ color: 0xc22b38, roughness: 0.26 }),
      macaronRose: new THREE.MeshStandardMaterial({ color: 0xe2988d, roughness: 0.38 }),
      macaronGold: new THREE.MeshStandardMaterial({ color: 0xe6be68, roughness: 0.3, metalness: 0.38 }),
      candleNumber: new THREE.MeshStandardMaterial({ color: 0xfff4d9, emissive: 0x5c370c, emissiveIntensity: 0.28, roughness: 0.26, metalness: 0.24 }),
    };
    this.emissiveBuildingMats.push(this.mats.haussmann, this.mats.louvrePalace);

    this.setupLighting();
    this.buildDynamicParisSkySunMoonClouds();
    this.buildParisRueDeRivoliAndCafes();
    this.buildArchitecturalEiffelTower();
    this.buildOpenPortalLouvrePyramidAndFountain();
    this.buildLouvreGrandGalleryInterior();
    this.buildFourInteractiveArtifactsAndSculpture();
    this.buildLiveLouvreWallPaintingEasel();
    this.buildFiveHiddenMuseumSeals();
    this.buildRoyalFamilyVaultAndManifesto();
    this.buildGrandRotundaAndRealisticCake();
    this.loadOptimizedMocapHumanVisitors();
    this.buildGoldenAutumnLeaves();
    this.buildPawPrintPool();
    this.loadAnatomicallyFixed40BonePersianCat();

    this.setTimeOfDay('sunset');
    this.bindEvents();
    if (this.callbacks.onReady) this.callbacks.onReady();
    this.animate();
  }

  ensureUltraComposer() {
    if (this.composer) return;
    this.composer = new EffectComposer(this.renderer);
    this.composer.addPass(new RenderPass(this.scene, this.camera));
    this.bloomPass = new UnrealBloomPass(new THREE.Vector2(window.innerWidth, window.innerHeight), 0.34, 0.55, 0.86);
    this.composer.addPass(this.bloomPass);
    this.composer.addPass(new OutputPass());
  }

  applyQualitySettings() {
    const dpr = window.devicePixelRatio || 1;
    let targetDpr = Math.min(dpr, this.isMobile ? 1.15 : 1.45);
    if (this.qualityMode === 'eco') targetDpr = Math.min(dpr, 1.0);
    else if (this.qualityMode === 'ultra') {
      targetDpr = Math.min(dpr, 1.75);
      this.ensureUltraComposer();
    }
    this.renderer.setPixelRatio(targetDpr);
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.renderer.shadowMap.enabled = !this.isMobile && this.qualityMode !== 'eco';
    this.renderer.shadowMap.needsUpdate = true;
    if (this.composer) {
      this.composer.setPixelRatio(targetDpr);
      this.composer.setSize(window.innerWidth, window.innerHeight);
    }
  }

  setQualityMode(mode) {
    this.qualityMode = mode;
    this.applyQualitySettings();
    if (this.leafInst) this.leafInst.visible = mode !== 'eco';
  }

  setPortalPaused(paused) {
    this.portalPaused = Boolean(paused);
    if (!paused) this.renderer.shadowMap.needsUpdate = true;
  }

  setZoom(enabled) {
    this.zoomed = Boolean(enabled);
    if (this.callbacks.onZoomChange) this.callbacks.onZoomChange(this.zoomed);
  }

  /* ==================== LIGHTING + ZERO-COST BAKED STATIC SHADOWS ==================== */
  setupLighting() {
    this.hemiLight = new THREE.HemisphereLight(0xffe2be, 0x2c2224, 1.18);
    this.scene.add(this.hemiLight);

    this.sunLight = new THREE.DirectionalLight(0xffc880, 2.55);
    this.sunLight.position.set(-42, 32, 24);
    this.sunLight.castShadow = !this.isMobile;
    this.sunLight.shadow.mapSize.set(1024, 1024);
    this.sunLight.shadow.camera.near = 4;
    this.sunLight.shadow.camera.far = 160;
    this.sunLight.shadow.camera.left = -42;
    this.sunLight.shadow.camera.right = 42;
    this.sunLight.shadow.camera.top = 66;
    this.sunLight.shadow.camera.bottom = -42;
    this.sunLight.shadow.bias = -0.0007;
    this.scene.add(this.sunLight);

    this.fillLight = new THREE.DirectionalLight(0x8ea8e6, 0.52);
    this.fillLight.position.set(35, 22, 48);
    this.scene.add(this.fillLight);

    this.playerLantern = new THREE.PointLight(0xffdca0, 15, 28, 1.45);
    this.scene.add(this.playerLantern);
  }

  updateEnvironmentReflections(preset) {
    if (this.envRenderTarget) this.envRenderTarget.dispose();
    const envScene = new THREE.Scene();
    const envSky = new THREE.Mesh(
      new THREE.SphereGeometry(20, 14, 10),
      new THREE.ShaderMaterial({
        side: THREE.BackSide,
        uniforms: { uTop: { value: new THREE.Color(preset.skyTop) }, uMid: { value: new THREE.Color(preset.skyMid) }, uHorizon: { value: new THREE.Color(preset.skyHorizon) } },
        vertexShader: `varying vec3 vD; void main(){ vD = normalize(position); gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.0); }`,
        fragmentShader: `uniform vec3 uTop,uMid,uHorizon; varying vec3 vD; void main(){ float h=clamp(vD.y,0.0,1.0); vec3 c=mix(uHorizon,uMid,smoothstep(0.0,0.3,h)); c=mix(c,uTop,smoothstep(0.25,0.8,h)); gl_FragColor=vec4(c*1.28,1.0); }`,
      })
    );
    envScene.add(envSky);
    const orb = new THREE.Mesh(new THREE.SphereGeometry(2.4, 10, 8), new THREE.MeshBasicMaterial({ color: preset.sunGlow }));
    orb.position.copy(preset.sunPos).normalize().multiplyScalar(14);
    envScene.add(orb);
    this.envRenderTarget = this.pmremGenerator.fromScene(envScene, 0.04);
    this.scene.environment = this.envRenderTarget.texture;
    envSky.geometry.dispose(); envSky.material.dispose(); orb.geometry.dispose(); orb.material.dispose();
  }

  buildDynamicParisSkySunMoonClouds() {
    this.skyGroup = new THREE.Group();
    this.skyUniforms = {
      uTop: { value: new THREE.Color(0x162244) },
      uMid: { value: new THREE.Color(0x724058) },
      uHorizon: { value: new THREE.Color(0xf4a05c) },
      uSunGlow: { value: new THREE.Color(0xffe49e) },
      uSunDir: { value: new THREE.Vector3(-0.46, 0.24, -0.85).normalize() },
    };
    const skyMat = new THREE.ShaderMaterial({
      side: THREE.BackSide, depthWrite: false, fog: false, uniforms: this.skyUniforms,
      vertexShader: `varying vec3 vDir; void main(){ vDir = normalize(position); gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }`,
      fragmentShader: `
        uniform vec3 uTop, uMid, uHorizon, uSunGlow, uSunDir;
        varying vec3 vDir;
        void main() {
          vec3 d = normalize(vDir);
          float h = clamp(d.y, 0.0, 1.0);
          vec3 col = mix(uHorizon, uMid, smoothstep(0.0, 0.26, h));
          col = mix(col, uTop, smoothstep(0.22, 0.72, h));
          float sunDot = max(dot(d, normalize(uSunDir)), 0.0);
          col += uSunGlow * pow(sunDot, 12.0) * 0.55;
          col += uSunGlow * pow(sunDot, 140.0) * 1.25;
          gl_FragColor = vec4(col, 1.0);
        }
      `,
    });
    this.skyGroup.add(new THREE.Mesh(new THREE.SphereGeometry(260, 28, 18), skyMat));

    this.sunGroup = new THREE.Group();
    const sunDisc = new THREE.Mesh(new THREE.SphereGeometry(7.2, 18, 14), new THREE.MeshBasicMaterial({ color: 0xfff9e6, fog: false }));
    const sunCorona = new THREE.Sprite(new THREE.SpriteMaterial({ map: this.glowTex, color: 0xffd282, transparent: true, opacity: 0.94, blending: THREE.AdditiveBlending, depthWrite: false, fog: false }));
    sunCorona.scale.set(58, 58, 1);
    this.sunGroup.add(sunDisc, sunCorona);
    this.skyGroup.add(this.sunGroup);

    this.moonGroup = new THREE.Group();
    const moonDisc = new THREE.Mesh(new THREE.SphereGeometry(5.2, 18, 14), new THREE.MeshBasicMaterial({ color: 0xf4f7ff, fog: false }));
    const moonHalo = new THREE.Sprite(new THREE.SpriteMaterial({ map: this.glowTex, color: 0x9ec0ff, transparent: true, opacity: 0.68, blending: THREE.AdditiveBlending, depthWrite: false, fog: false }));
    moonHalo.scale.set(36, 36, 1);
    this.moonGroup.add(moonDisc, moonHalo);
    this.moonGroup.position.set(58, 78, -175);
    this.skyGroup.add(this.moonGroup);

    const starCount = this.isMobile ? 180 : 320;
    const pos = new Float32Array(starCount * 3);
    for (let i = 0; i < starCount; i++) {
      const th = Math.random() * Math.PI * 2, ph = 0.18 + Math.random() * 1.15;
      pos[i * 3] = Math.cos(th) * Math.cos(ph) * 230;
      pos[i * 3 + 1] = Math.sin(ph) * 200 + 16;
      pos[i * 3 + 2] = Math.sin(th) * Math.cos(ph) * 230;
    }
    const sGeo = new THREE.BufferGeometry();
    sGeo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
    this.starsMat = new THREE.PointsMaterial({ size: 2.0, map: this.glowTex, color: 0xfff5dc, transparent: true, opacity: 0.4, blending: THREE.AdditiveBlending, depthWrite: false, fog: false });
    this.skyGroup.add(new THREE.Points(sGeo, this.starsMat));

    const cloudCount = this.isMobile ? 10 : 16;
    for (let i = 0; i < cloudCount; i++) {
      const sp = new THREE.Sprite(new THREE.SpriteMaterial({ map: this.cloudTex, color: 0xffd2a8, transparent: true, opacity: 0.56, depthWrite: false, fog: false }));
      const ang = (i / cloudCount) * Math.PI * 2 + Math.random() * 0.25;
      const dist = 125 + (i % 3) * 32, h = 36 + (i % 4) * 16, w = 52 + (i % 5) * 18;
      sp.position.set(Math.cos(ang) * dist, h, Math.sin(ang) * dist);
      sp.scale.set(w, w * 0.42, 1);
      this.skyGroup.add(sp);
      this.cloudSprites.push({ sprite: sp, ang, dist, h, speed: 0.004 + (i % 4) * 0.0015 });
    }
    this.scene.add(this.skyGroup);
  }

  setTimeOfDay(mode) {
    const p = TIME_PRESETS[mode] || TIME_PRESETS.sunset;
    this.timeOfDay = mode;
    this.skyUniforms.uTop.value.setHex(p.skyTop);
    this.skyUniforms.uMid.value.setHex(p.skyMid);
    this.skyUniforms.uHorizon.value.setHex(p.skyHorizon);
    this.skyUniforms.uSunGlow.value.setHex(p.sunGlow);
    this.skyUniforms.uSunDir.value.copy(p.sunPos).normalize();
    this.sunGroup.visible = p.showSun;
    this.sunGroup.position.copy(p.sunPos).normalize().multiplyScalar(225);
    this.moonGroup.visible = p.showMoon;
    this.starsMat.opacity = p.starsOpacity;
    this.cloudSprites.forEach((c) => { c.sprite.material.color.setHex(p.cloudTint); c.sprite.material.opacity = p.cloudOpacity; });

    this.sunLight.color.setHex(p.sunColor);
    this.sunLight.intensity = this.uvMode ? 0.4 : p.sunIntensity;
    this.hemiLight.color.setHex(p.hemiSky);
    this.hemiLight.groundColor.setHex(p.hemiGround);
    this.hemiLight.intensity = this.uvMode ? 0.35 : p.hemiIntensity;
    this.scene.fog.color.setHex(p.fogColor);
    this.scene.fog.density = p.fogDensity;
    this.renderer.toneMappingExposure = p.exposure;
    if (this.bloomPass) this.bloomPass.strength = this.uvMode ? 0.62 : p.bloomStrength;

    this.emissiveBuildingMats.forEach((m) => { m.emissiveIntensity = p.windowEmissive; });
    this.lampHalos.forEach((h) => { h.material.opacity = p.lampOpacity; });
    if (this.eiffelSearchlightMat) this.eiffelSearchlightMat.opacity = this.sparkleShowTimer > 0 ? 0.56 : p.searchlightOpacity;

    this.updateEnvironmentReflections(p);
    this.renderer.shadowMap.needsUpdate = true;
    if (this.callbacks.onTimeChange) this.callbacks.onTimeChange(mode, p.labelAr);
  }

  setUVMode(enabled) {
    this.uvMode = Boolean(enabled);
    this.uvSecretMeshes.forEach((m) => { m.visible = this.uvMode; });
    this.playerLantern.color.setHex(this.uvMode ? 0x6ce2ff : 0xffdca0);
    this.playerLantern.intensity = this.uvMode ? 22 : 15;
    this.setTimeOfDay(this.timeOfDay);
  }

  /* ==================== LIVE EVENTS: 19 BIRTHDAY SKY LANTERNS & EIFFEL SPARKLE SHOW ==================== */
  releaseBirthdayLanterns() {
    // Launch 19 warm glowing sky lanterns ascending around Cour Napoléon & Louvre Glass Pyramid!
    const geo = new THREE.CylinderGeometry(0.32, 0.24, 0.58, 10);
    for (let i = 0; i < 19; i++) {
      const grp = new THREE.Group();
      const body = new THREE.Mesh(geo, this.mats.lanternPaper);
      const halo = new THREE.Sprite(new THREE.SpriteMaterial({ map: this.glowTex, color: 0xffc660, transparent: true, opacity: 0.78, blending: THREE.AdditiveBlending, depthWrite: false }));
      halo.scale.set(2.2, 2.2, 1);
      grp.add(body, halo);

      const ang = (i / 19) * Math.PI * 2 + Math.random() * 0.2;
      const rad = 5.5 + Math.random() * 14;
      grp.position.set(Math.cos(ang) * rad, 1.5 + Math.random() * 3.5, 16 + Math.sin(ang) * rad);
      this.scene.add(grp);
      this.skyLanterns.push({
        mesh: grp,
        baseX: grp.position.x,
        vy: 1.05 + Math.random() * 0.85,
        phase: Math.random() * Math.PI * 2,
        life: 0,
        maxLife: 24 + Math.random() * 6,
      });
    }
  }

  triggerEiffelSparkleShow() {
    this.sparkleShowTimer = 18.0;
    if (this.timeOfDay === 'day') this.setTimeOfDay('night');
    else if (this.eiffelSearchlightMat) this.eiffelSearchlightMat.opacity = 0.58;
    this.releaseBirthdayLanterns();
  }

  /* ==================== PARIS BOULEVARD & HAUSSMANN BUILDINGS ==================== */
  buildParisRueDeRivoliAndCafes() {
    const cobbleMat = new THREE.MeshStandardMaterial({
      map: this.cobbleScan.map, normalMap: this.cobbleScan.normalMap, normalScale: new THREE.Vector2(0.85, 0.85),
      roughnessMap: this.cobbleScan.roughnessMap, roughness: 0.78, metalness: 0.1,
    });
    const street = new THREE.Mesh(new THREE.PlaneGeometry(82, 112), cobbleMat);
    street.rotation.x = -Math.PI / 2; street.position.set(0, 0, 36); street.receiveShadow = true;
    this.scene.add(street);

    const runner = new THREE.Mesh(new THREE.PlaneGeometry(3.0, 74), new THREE.MeshStandardMaterial({ color: 0x3a2215, roughness: 0.68 }));
    runner.rotation.x = -Math.PI / 2; runner.position.set(0, 0.015, 34); runner.receiveShadow = true;
    this.scene.add(runner);
    [-1.56, 1.56].forEach((x) => {
      const trim = new THREE.Mesh(new THREE.PlaneGeometry(0.08, 74), this.mats.goldGlow);
      trim.rotation.x = -Math.PI / 2; trim.position.set(x, 0.02, 34);
      this.scene.add(trim);
    });

    [-10.8, 10.8].forEach((x) => {
      const curb = new THREE.Mesh(new THREE.BoxGeometry(7.8, 0.18, 56), this.mats.limestoneScanned);
      curb.position.set(x, 0.09, 48); curb.receiveShadow = true;
      this.scene.add(curb);
    });

    const buildHaussmannBuilding = (x, z, rotY) => {
      const b = new THREE.Group(); b.position.set(x, 0, z); b.rotation.y = rotY;
      const body = new THREE.Mesh(new THREE.BoxGeometry(15.2, 14.2, 8.2), this.mats.haussmann);
      body.position.y = 7.1; body.castShadow = true; body.receiveShadow = true;
      const corniceTop = new THREE.Mesh(new THREE.BoxGeometry(15.8, 0.45, 8.8), this.mats.limestoneScanned); corniceTop.position.y = 14.25;
      const balconyLedge = new THREE.Mesh(new THREE.BoxGeometry(15.6, 0.26, 8.6), this.mats.limestoneScanned); balconyLedge.position.y = 7.5;
      const roof = new THREE.Mesh(new THREE.BoxGeometry(15.0, 3.2, 7.2), this.mats.mansard); roof.position.y = 15.9;
      const roofCap = new THREE.Mesh(new THREE.BoxGeometry(15.2, 0.2, 7.4), this.mats.gold); roofCap.position.y = 17.55;
      [-7.2, -2.4, 2.4, 7.2].forEach((px) => {
        const pil = new THREE.Mesh(new THREE.BoxGeometry(0.42, 14.0, 0.35), this.mats.limestoneScanned);
        pil.position.set(px, 7.0, 4.18); b.add(pil);
      });
      const awning = new THREE.Mesh(new THREE.BoxGeometry(13.6, 0.18, 2.3), this.mats.velvetRed);
      awning.position.set(0, 3.65, 5.1); awning.rotation.x = 0.26;
      const awningFringe = new THREE.Mesh(new THREE.BoxGeometry(13.6, 0.22, 0.08), this.mats.gold); awningFringe.position.set(0, 3.25, 6.18);
      b.add(body, corniceTop, balconyLedge, roof, roofCap, awning, awningFringe);
      [-4.0, 0, 4.0].forEach((tx) => {
        const tableTop = new THREE.Mesh(new THREE.CylinderGeometry(0.46, 0.46, 0.06, 12), this.mats.marble); tableTop.position.set(tx, 0.96, 5.35);
        const tableLeg = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.18, 0.78, 8), this.mats.ironDark); tableLeg.position.set(tx, 0.56, 5.35);
        b.add(tableTop, tableLeg);
      });
      this.scene.add(b);
    };

    [66, 50, 34].forEach((z) => buildHaussmannBuilding(18.2, z, -Math.PI / 2));
    [66, 50].forEach((z) => buildHaussmannBuilding(-18.2, z, Math.PI / 2));

    const poleGeo = new THREE.CylinderGeometry(0.065, 0.13, 4.4, 10);
    const baseGeo = new THREE.CylinderGeometry(0.18, 0.28, 0.75, 10);
    const lanternGlassGeo = new THREE.CylinderGeometry(0.24, 0.16, 0.52, 8);
    const lanternCapGeo = new THREE.ConeGeometry(0.32, 0.28, 8);
    const leafCardMat = new THREE.MeshStandardMaterial({ map: this.foliageTex, alphaTest: 0.35, side: THREE.DoubleSide, roughness: 0.8 });
    const leafCardGeo = new THREE.PlaneGeometry(2.6, 2.6);

    const createBotanicalParisTree = (tx, tz) => {
      const tree = new THREE.Group(); tree.position.set(tx, 0, tz);
      const trunk = new THREE.Mesh(new THREE.CylinderGeometry(0.13, 0.22, 2.8, 8), this.mats.woodDark);
      trunk.position.y = 1.4; trunk.castShadow = true; tree.add(trunk);
      [[0, 3.85, 0, 0, 0], [0, 3.85, 0, 0, Math.PI / 2], [0, 3.9, 0, 0, Math.PI / 4], [0.65, 3.45, 0.45, 0.25, 0.6], [-0.65, 3.55, -0.4, -0.22, 1.9], [0.25, 4.45, -0.3, 0.35, 1.1]].forEach(([lx, ly, lz, rx, ry]) => {
        const card = new THREE.Mesh(leafCardGeo, leafCardMat);
        card.position.set(lx, ly, lz); card.rotation.set(rx, ry, 0); card.castShadow = true;
        tree.add(card);
      });
      this.circleColliders.push({ x: tx, z: tz, r: 0.65 });
      this.scene.add(tree);
    };

    let idx = 0;
    for (let z = 66; z >= 20; z -= 11) {
      [-7.2, 7.2].forEach((x) => {
        const lamp = new THREE.Group(); lamp.position.set(x, 0, z);
        const base = new THREE.Mesh(baseGeo, this.mats.ironDark); base.position.y = 0.38;
        const pole = new THREE.Mesh(poleGeo, this.mats.ironDark); pole.position.y = 2.25; pole.castShadow = true;
        const glass = new THREE.Mesh(lanternGlassGeo, this.mats.lampGlow); glass.position.y = 4.65;
        const cap = new THREE.Mesh(lanternCapGeo, this.mats.ironDark); cap.position.y = 5.02;
        const halo = new THREE.Sprite(new THREE.SpriteMaterial({ map: this.glowTex, color: 0xffd27a, transparent: true, opacity: 0.82, blending: THREE.AdditiveBlending, depthWrite: false }));
        halo.scale.set(2.9, 2.9, 1); halo.position.y = 4.65;
        this.lampHalos.push(halo);
        lamp.add(base, pole, glass, cap, halo);
        this.circleColliders.push({ x, z, r: 0.45 });
        this.scene.add(lamp);
        if (idx % 2 === 0 && z > 24 && !(x < 0 && z < 44)) createBotanicalParisTree(x + Math.sign(x) * 2.3, z - 5.2);
        idx++;
      });
    }
  }

  /* ==================== TOWERING ARCHITECTURAL EIFFEL TOWER ==================== */
  buildArchitecturalEiffelTower() {
    const tower = new THREE.Group();
    tower.position.set(-30, 0, -20);
    tower.scale.setScalar(1.32);

    const profile = [
      { y: 0.0, r: 6.8 }, { y: 5.5, r: 4.8 }, { y: 11.0, r: 3.55 },
      { y: 16.5, r: 2.55 }, { y: 21.5, r: 1.85 }, { y: 29.0, r: 1.18 }, { y: 38.0, r: 0.62 },
    ];
    const corners = [[-1, -1], [1, -1], [1, 1], [-1, 1]];
    const sideDirs = [{ ax: 0, az: 1, ry: 0 }, { ax: 0, az: -1, ry: Math.PI }, { ax: 1, az: 0, ry: Math.PI / 2 }, { ax: -1, az: 0, ry: -Math.PI / 2 }];

    for (let s = 0; s < profile.length - 1; s++) {
      const a = profile[s], b = profile[s + 1], dy = b.y - a.y, thick = Math.max(0.18, 0.52 - s * 0.06);
      corners.forEach(([sx, sz]) => {
        const p0 = new THREE.Vector3(sx * a.r, a.y, sz * a.r), p1 = new THREE.Vector3(sx * b.r, b.y, sz * b.r);
        const leg = new THREE.Mesh(new THREE.BoxGeometry(thick, p0.distanceTo(p1), thick), this.mats.eiffelSteel);
        leg.position.copy(p0).lerp(p1, 0.5);
        leg.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), p1.clone().sub(p0).normalize());
        tower.add(leg);
      });
      if (s >= 1) {
        const hwB = a.r, hwT = b.r, slopeLen = Math.hypot(dy, a.r - b.r), tilt = Math.atan2(a.r - b.r, dy), hh = slopeLen * 0.5;
        const trapGeo = new THREE.BufferGeometry();
        trapGeo.setAttribute('position', new THREE.Float32BufferAttribute([-hwB, -hh, 0, hwB, -hh, 0, hwT, hh, 0, -hwB, -hh, 0, hwT, hh, 0, -hwT, hh, 0], 3));
        trapGeo.setAttribute('uv', new THREE.Float32BufferAttribute([0, 0, 1, 0, 1, 1, 0, 0, 1, 1, 0, 1], 2));
        trapGeo.computeVertexNormals();
        sideDirs.forEach((sd) => {
          const panel = new THREE.Mesh(trapGeo, this.mats.eiffelLattice);
          const midR = (a.r + b.r) * 0.5;
          panel.position.set(sd.ax * midR, (a.y + b.y) * 0.5, sd.az * midR);
          panel.rotation.order = 'YXZ'; panel.rotation.y = sd.ry; panel.rotation.x = -tilt;
          tower.add(panel);
        });
      }
    }
    for (let i = 0; i < 4; i++) {
      const ang = (i * Math.PI) / 2;
      const arch = new THREE.Mesh(new THREE.TorusGeometry(4.4, 0.24, 8, 28, Math.PI), this.mats.eiffelSteel);
      arch.position.set(Math.sin(ang) * 5.4, 3.8, Math.cos(ang) * 5.4); arch.rotation.y = ang;
      tower.add(arch);
    }
    [{ y: 11.0, w: 7.9, h: 1.05 }, { y: 21.5, w: 4.3, h: 0.85 }, { y: 38.0, w: 1.75, h: 0.9 }].forEach((d) => {
      const deck = new THREE.Mesh(new THREE.BoxGeometry(d.w, d.h, d.w), this.mats.eiffelSteel); deck.position.y = d.y;
      const cornice = new THREE.Mesh(new THREE.BoxGeometry(d.w + 0.22, 0.16, d.w + 0.22), this.mats.goldGlow); cornice.position.y = d.y + d.h * 0.25;
      tower.add(deck, cornice);
    });

    const cupola = new THREE.Mesh(new THREE.CylinderGeometry(0.45, 0.72, 1.3, 12), this.mats.eiffelSteel); cupola.position.y = 39.1;
    const spire = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.18, 4.4, 10), this.mats.gold); spire.position.y = 41.9;
    const beacon = new THREE.Sprite(new THREE.SpriteMaterial({ map: this.glowTex, color: 0xffe69c, transparent: true, opacity: 0.96, blending: THREE.AdditiveBlending, depthWrite: false }));
    beacon.scale.set(6.4, 6.4, 1); beacon.position.y = 44.1;
    this.eiffelBeacon = beacon;

    this.eiffelSearchlightRig = new THREE.Group();
    this.eiffelSearchlightRig.position.y = 39.4;
    this.eiffelSearchlightMat = new THREE.MeshBasicMaterial({ map: this.beamTex, color: 0xfff0c4, transparent: true, opacity: 0.0, blending: THREE.AdditiveBlending, side: THREE.DoubleSide, depthWrite: false });
    [-1, 1].forEach((dir) => {
      const beam = new THREE.Mesh(new THREE.ConeGeometry(4.2, 42, 12, 1, true), this.eiffelSearchlightMat);
      beam.rotation.z = dir * (Math.PI * 0.44); beam.position.set(dir * 21, -2.5, 0);
      this.eiffelSearchlightRig.add(beam);
    });
    tower.add(cupola, spire, beacon, this.eiffelSearchlightRig);

    for (let i = 0; i < 36; i++) {
      const f = Math.random(), y = 5 + f * 33, r = THREE.MathUtils.lerp(4.8, 0.55, f), a = Math.random() * Math.PI * 2;
      const sp = new THREE.Sprite(new THREE.SpriteMaterial({ map: this.glowTex, color: 0xfff6d2, transparent: true, opacity: 0.85, blending: THREE.AdditiveBlending, depthWrite: false }));
      sp.position.set(Math.cos(a) * r, y, Math.sin(a) * r); sp.scale.set(1.2, 1.2, 1);
      tower.add(sp);
      this.eiffelSparkles.push({ sprite: sp, phase: Math.random() * Math.PI * 2, speed: 3.5 + Math.random() * 5.0 });
    }
    this.scene.add(tower);
  }

  /* ==================== OPEN-PORTAL LOUVRE PYRAMID + SLIDING DOORS + FOUNTAIN ==================== */
  buildOpenPortalLouvrePyramidAndFountain() {
    [-10.2, 10.2].forEach((x) => {
      const poolBorder = new THREE.Mesh(new THREE.BoxGeometry(7.8, 0.3, 14.2), this.mats.marble);
      poolBorder.position.set(x, 0.15, 7.5); poolBorder.receiveShadow = true;
      const water = new THREE.Mesh(new THREE.PlaneGeometry(7.1, 13.5), this.mats.waterPool);
      water.rotation.x = -Math.PI / 2; water.position.set(x, 0.3, 7.5);
      this.scene.add(poolBorder, water);
      this.boxColliders.push({ minX: x - 4.15, maxX: x + 4.15, minZ: 0.2, maxZ: 14.8 });

      [-3.4, 3.4].forEach((fz, fi) => {
        const ring = new THREE.Mesh(new THREE.RingGeometry(0.25, 0.42, 22), new THREE.MeshBasicMaterial({ color: 0xfff1cc, transparent: true, opacity: 0.5, side: THREE.DoubleSide }));
        ring.rotation.x = -Math.PI / 2; ring.position.set(x, 0.315, 7.5 + fz);
        this.scene.add(ring);
        this.fountainRings.push({ mesh: ring, phase: fi * 1.8 + (x > 0 ? 0.9 : 0) });
      });

      const miniPyr = new THREE.Group(); miniPyr.position.set(x, 0.31, 12.2);
      const mg = new THREE.Mesh(new THREE.ConeGeometry(1.75, 1.8, 4, 1, true), this.mats.glassPyramid); mg.rotation.y = Math.PI / 4; mg.position.y = 0.9;
      const mw = new THREE.Mesh(new THREE.ConeGeometry(1.78, 1.82, 4, 3, true), new THREE.MeshStandardMaterial({ color: 0xdcc07a, metalness: 0.88, roughness: 0.2, wireframe: true })); mw.rotation.y = Math.PI / 4; mw.position.y = 0.91;
      miniPyr.add(mg, mw); this.scene.add(miniPyr);
    });

    const wishUrn = new THREE.Group(); wishUrn.position.set(5.4, 0, 11.2);
    const urnPed = new THREE.Mesh(new THREE.CylinderGeometry(0.45, 0.55, 1.05, 16), this.mats.marble); urnPed.position.y = 0.525; urnPed.castShadow = true;
    const urnBowl = new THREE.Mesh(new THREE.CylinderGeometry(0.65, 0.32, 0.28, 18), this.mats.gold); urnBowl.position.y = 1.14;
    const floatingCoin = new THREE.Mesh(new THREE.CylinderGeometry(0.24, 0.24, 0.045, 22), this.mats.goldGlow); floatingCoin.rotation.x = Math.PI / 2; floatingCoin.position.y = 1.62;
    this.floatingProps.push({ mesh: floatingCoin, baseY: 1.62, speed: 2.2 });
    const fHit = new THREE.Mesh(new THREE.BoxGeometry(2.6, 2.8, 2.6), new THREE.MeshBasicMaterial({ visible: false }));
    fHit.position.y = 1.2; fHit.userData.interactId = 'fountain';
    wishUrn.add(urnPed, urnBowl, floatingCoin, fHit);
    this.scene.add(wishUrn);
    this.circleColliders.push({ x: 5.4, z: 11.2, r: 0.72 });
    this.interactables.push({
      id: 'fountain',
      titleAr: 'نافورة الأمنيات الذهبية بمتحف اللوفر',
      badgeAr: '🪙 اضغط لإلقاء عملة أمنية ذهبية ليمنى في نافورة اللوفر',
      mesh: fHit,
      worldPos: new THREE.Vector3(5.4, 1.4, 11.2),
      radius: 7.5,
    });

    const pyrGroup = new THREE.Group(); pyrGroup.position.set(0, 0, 7.0);
    const B = 5.2, H = 6.8, doorHW = 1.7, doorH = 3.2;

    [-1, 1].forEach((signX) => {
      const geo = new THREE.BufferGeometry();
      geo.setAttribute('position', new THREE.Float32BufferAttribute([signX * B, 0, B, signX * B, 0, -B, 0, H, 0], 3));
      geo.computeVertexNormals();
      pyrGroup.add(new THREE.Mesh(geo, this.mats.glassPyramid));
    });
    this.boxColliders.push({ minX: -5.4, maxX: -1.65, minZ: 1.7, maxZ: 12.3 }, { minX: 1.65, maxX: 5.4, minZ: 1.7, maxZ: 12.3 });

    [1, -1].forEach((signZ) => {
      const zB = signZ * B, frac = doorH / H, zTop = zB * (1 - frac), xSlopeAtDoorTop = B * (1 - frac);
      const geo = new THREE.BufferGeometry();
      geo.setAttribute('position', new THREE.Float32BufferAttribute([
        -B, 0, zB, -doorHW, 0, zB, -doorHW, doorH, zTop,
        -B, 0, zB, -doorHW, doorH, zTop, -xSlopeAtDoorTop, doorH, zTop,
        doorHW, 0, zB, B, 0, zB, xSlopeAtDoorTop, doorH, zTop,
        doorHW, 0, zB, xSlopeAtDoorTop, doorH, zTop, doorHW, doorH, zTop,
        -xSlopeAtDoorTop, doorH, zTop, xSlopeAtDoorTop, doorH, zTop, 0, H, 0,
      ], 3));
      geo.computeVertexNormals();
      pyrGroup.add(new THREE.Mesh(geo, this.mats.glassPyramid));

      const portalZ = signZ * (B - 0.15);
      const frameGrp = new THREE.Group(); frameGrp.position.set(0, 0, portalZ);
      [-doorHW, doorHW].forEach((px) => {
        const pillar = new THREE.Mesh(new THREE.BoxGeometry(0.16, doorH + 0.1, 0.24), this.mats.gold);
        pillar.position.set(px, doorH * 0.5, 0); frameGrp.add(pillar);
      });
      const lintel = new THREE.Mesh(new THREE.BoxGeometry(doorHW * 2 + 0.36, 0.2, 0.3), this.mats.goldGlow);
      lintel.position.set(0, doorH + 0.05, 0); frameGrp.add(lintel);

      const makeDoorLeaf = (side) => {
        const leaf = new THREE.Group();
        const pane = new THREE.Mesh(new THREE.BoxGeometry(doorHW - 0.06, doorH - 0.08, 0.05), this.mats.glassDoor); pane.position.y = doorH * 0.5;
        const border = new THREE.Mesh(new THREE.BoxGeometry(doorHW - 0.02, 0.1, 0.07), this.mats.gold); border.position.y = doorH - 0.08;
        const handle = new THREE.Mesh(new THREE.CylinderGeometry(0.02, 0.02, 0.55, 8), this.mats.goldGlow); handle.position.set(-side * (doorHW * 0.38), 1.35, 0.05);
        leaf.add(pane, border, handle); leaf.position.x = side * (doorHW * 0.5);
        return leaf;
      };
      const leftDoor = makeDoorLeaf(-1), rightDoor = makeDoorLeaf(1);
      frameGrp.add(leftDoor, rightDoor); pyrGroup.add(frameGrp);
      this.pyramidDoors.push({ leftDoor, rightDoor, closedLeftX: -doorHW * 0.5, closedRightX: doorHW * 0.5, worldZ: 7.0 + portalZ, openAmt: 0 });
    });

    [[-B, -B], [B, -B], [B, B], [-B, B]].forEach(([cx, cz]) => {
      const p0 = new THREE.Vector3(cx, 0, cz), p1 = new THREE.Vector3(0, H, 0);
      const beam = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.08, p0.distanceTo(p1), 8), this.mats.gold);
      beam.position.copy(p0).lerp(p1, 0.5); beam.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), p1.clone().sub(p0).normalize());
      beam.castShadow = true; pyrGroup.add(beam);
    });
    const apexHalo = new THREE.Sprite(new THREE.SpriteMaterial({ map: this.glowTex, color: 0xffd88a, transparent: true, opacity: 0.72, blending: THREE.AdditiveBlending, depthWrite: false }));
    apexHalo.scale.set(7.5, 7.5, 1); apexHalo.position.y = 4.2; pyrGroup.add(apexHalo);
    this.scene.add(pyrGroup);

    const facade = new THREE.Group(); facade.position.set(0, 0, -7);
    [-14.5, 14.5].forEach((x) => {
      const wing = new THREE.Mesh(new THREE.BoxGeometry(19, 13.8, 3.6), this.mats.louvrePalace);
      wing.position.set(x, 6.9, 0); wing.castShadow = true; wing.receiveShadow = true;
      const wingRoof = new THREE.Mesh(new THREE.BoxGeometry(19.2, 3.2, 3.1), this.mats.mansard); wingRoof.position.set(x, 15.4, -0.1);
      facade.add(wing, wingRoof);
      for (let cx = -7.5; cx <= 7.5; cx += 5.0) {
        const col = new THREE.Mesh(new THREE.CylinderGeometry(0.28, 0.32, 12.8, 12), this.mats.marble);
        col.position.set(x + cx, 6.6, 1.92); facade.add(col);
      }
    });
    const topEntablature = new THREE.Mesh(new THREE.BoxGeometry(11.4, 6.8, 4.0), this.mats.louvrePalace); topEntablature.position.set(0, 10.4, 0.15);
    const goldCornice = new THREE.Mesh(new THREE.BoxGeometry(49, 0.42, 4.2), this.mats.gold); goldCornice.position.set(0, 13.9, 0.15);
    const pedShape = new THREE.Shape(); pedShape.moveTo(-6.0, 0); pedShape.lineTo(0, 2.55); pedShape.lineTo(6.0, 0); pedShape.closePath();
    const pediment = new THREE.Mesh(new THREE.ExtrudeGeometry(pedShape, { depth: 0.65, bevelEnabled: true, bevelThickness: 0.08, bevelSize: 0.08, bevelSegments: 2 }), this.mats.marble); pediment.position.set(0, 13.95, 1.85);
    const pavDomeGeo = new THREE.CylinderGeometry(3.4, 5.4, 4.8, 4); pavDomeGeo.rotateY(Math.PI / 4);
    const pavDome = new THREE.Mesh(pavDomeGeo, this.mats.mansard); pavDome.scale.set(1.48, 1, 0.58); pavDome.position.set(0, 16.4, 0);
    const pavCrown = new THREE.Mesh(new THREE.BoxGeometry(7.2, 0.25, 2.2), this.mats.goldGlow); pavCrown.position.set(0, 18.88, 0);
    const archTrim = new THREE.Mesh(new THREE.TorusGeometry(4.75, 0.24, 12, 44, Math.PI), this.mats.goldGlow); archTrim.position.set(0, 3.2, 2.15);
    const signPlaque = new THREE.Mesh(new THREE.PlaneGeometry(8.8, 1.75), new THREE.MeshBasicMaterial({ map: createLouvreSignTexture() })); signPlaque.position.set(0, 9.7, 2.24);
    facade.add(topEntablature, goldCornice, pediment, pavDome, pavCrown, archTrim, signPlaque);

    [-22.5, 22.5].forEach((wx) => {
      const sideWing = new THREE.Mesh(new THREE.BoxGeometry(3.6, 13.6, 26), this.mats.louvrePalace);
      sideWing.position.set(wx, 6.8, 13); sideWing.castShadow = true; sideWing.receiveShadow = true;
      const sideRoof = new THREE.Mesh(new THREE.BoxGeometry(3.2, 3.0, 26), this.mats.mansard); sideRoof.position.set(wx, 15.1, 13);
      facade.add(sideWing, sideRoof);
    });
    this.scene.add(facade);
    this.boxColliders.push({ minX: -24, maxX: -3.4, minZ: -9.0, maxZ: -4.8 }, { minX: 3.4, maxX: 24, minZ: -9.0, maxZ: -4.8 });
  }

  tossWishingCoin() {
    const coin = new THREE.Mesh(new THREE.CylinderGeometry(0.18, 0.18, 0.035, 18), this.mats.goldGlow);
    coin.position.set(5.6, 1.65, 11.2);
    this.scene.add(coin);
    this.flyingCoins.push({ mesh: coin, t: 0, p0: new THREE.Vector3(5.6, 1.65, 11.2), p1: new THREE.Vector3(9.8, 0.32, 9.4) });
  }

  /* ==================== LOUVRE GRANDE GALERIE INTERIOR ==================== */
  buildLouvreGrandGalleryInterior() {
    const parquetMat = new THREE.MeshStandardMaterial({
      map: this.parquetScan.map, normalMap: this.parquetScan.normalMap, normalScale: new THREE.Vector2(0.55, 0.55),
      roughnessMap: this.parquetScan.roughnessMap, roughness: 0.42, metalness: 0.06,
    });
    const floor = new THREE.Mesh(new THREE.PlaneGeometry(18.0, 78), parquetMat);
    floor.rotation.x = -Math.PI / 2; floor.position.set(0, 0, -45); floor.receiveShadow = true;
    this.scene.add(floor);

    const carpet = new THREE.Mesh(new THREE.PlaneGeometry(3.2, 78), this.mats.velvetRed);
    carpet.rotation.x = -Math.PI / 2; carpet.position.set(0, 0.012, -45); carpet.receiveShadow = true;
    this.scene.add(carpet);
    [-1.66, 1.66].forEach((x) => {
      const b = new THREE.Mesh(new THREE.PlaneGeometry(0.08, 78), this.mats.gold);
      b.rotation.x = -Math.PI / 2; b.position.set(x, 0.016, -45); this.scene.add(b);
    });

    const galleryWallMat = new THREE.MeshStandardMaterial({ map: this.wallPanelTex, normalMap: this.stoneScan.normalMap, normalScale: new THREE.Vector2(0.22, 0.22), roughness: 0.65 });
    const wallGeo = new THREE.BoxGeometry(0.8, 9.8, 78);
    [-8.8, 8.8].forEach((x) => {
      const wall = new THREE.Mesh(wallGeo, galleryWallMat); wall.position.set(x, 4.9, -45);
      const cornice = new THREE.Mesh(new THREE.BoxGeometry(1.15, 0.4, 78), this.mats.gold); cornice.position.set(x, 9.45, -45);
      this.scene.add(wall, cornice);
    });

    [-6.0, 6.0].forEach((x) => {
      const ceilSide = new THREE.Mesh(new THREE.BoxGeometry(6.4, 0.45, 78), this.mats.marble); ceilSide.position.set(x, 9.7, -45); this.scene.add(ceilSide);
    });
    const skylight = new THREE.Mesh(new THREE.PlaneGeometry(5.6, 78), new THREE.MeshBasicMaterial({ color: 0xffe8b8, transparent: true, opacity: 0.5, side: THREE.DoubleSide }));
    skylight.rotation.x = Math.PI / 2; skylight.position.set(0, 9.85, -45); this.scene.add(skylight);

    const colPositions = [];
    for (let z = -12; z >= -78; z -= 9.5) colPositions.push([-7.5, z], [7.5, z]);
    const shaftMesh = new THREE.InstancedMesh(new THREE.CylinderGeometry(0.32, 0.38, 8.8, 14), this.mats.marble, colPositions.length);
    const capMesh = new THREE.InstancedMesh(new THREE.BoxGeometry(1.08, 0.46, 1.08), this.mats.gold, colPositions.length);
    const baseMesh = new THREE.InstancedMesh(new THREE.BoxGeometry(1.08, 0.46, 1.08), this.mats.marble, colPositions.length);
    const dummy = new THREE.Object3D();
    colPositions.forEach(([x, z], i) => {
      dummy.position.set(x, 4.6, z); dummy.updateMatrix(); shaftMesh.setMatrixAt(i, dummy.matrix);
      dummy.position.set(x, 9.15, z); dummy.updateMatrix(); capMesh.setMatrixAt(i, dummy.matrix);
      dummy.position.set(x, 0.23, z); dummy.updateMatrix(); baseMesh.setMatrixAt(i, dummy.matrix);
    });
    this.scene.add(shaftMesh, capMesh, baseMesh);

    [-41, -55, -68].forEach((z) => {
      const bench = new THREE.Group(); bench.position.set(0, 0, z);
      const seat = new THREE.Mesh(new THREE.BoxGeometry(2.3, 0.14, 0.78), this.mats.velvetRed); seat.position.y = 0.52;
      const trim = new THREE.Mesh(new THREE.BoxGeometry(2.36, 0.08, 0.84), this.mats.woodDark); trim.position.y = 0.44;
      [-0.9, 0.9].forEach((lx) => { const leg = new THREE.Mesh(new THREE.BoxGeometry(0.14, 0.42, 0.68), this.mats.woodDark); leg.position.set(lx, 0.21, 0); bench.add(leg); });
      bench.add(seat, trim);
      this.boxColliders.push({ minX: -1.35, maxX: 1.35, minZ: z - 0.65, maxZ: z + 0.65 });
      this.scene.add(bench);
    });

    [-19, -34, -48, -62, -75].forEach((z) => {
      const beam = new THREE.Mesh(new THREE.PlaneGeometry(4.6, 10.8), new THREE.MeshBasicMaterial({ map: this.beamTex, transparent: true, opacity: 0.26, blending: THREE.AdditiveBlending, side: THREE.DoubleSide, depthWrite: false }));
      beam.position.set(0, 5.0, z); beam.rotation.z = 0.14; this.scene.add(beam);
    });
  }

  /* ==================== 5 HIDDEN COLLECTIBLE GOLDEN WAX SEALS HUNT ==================== */
  buildFiveHiddenMuseumSeals() {
    const discGeo = new THREE.CylinderGeometry(0.28, 0.28, 0.08, 22);
    const rimGeo = new THREE.TorusGeometry(0.32, 0.035, 8, 28);
    HIDDEN_SEALS_DATA.forEach((s, i) => {
      const grp = new THREE.Group();
      grp.position.set(s.x, 1.35, s.z);
      const disc = new THREE.Mesh(discGeo, this.mats.waxCrimson); disc.rotation.x = Math.PI / 2;
      const rim = new THREE.Mesh(rimGeo, this.mats.goldGlow);
      const glow = new THREE.Sprite(new THREE.SpriteMaterial({ map: this.glowTex, color: 0xffe084, transparent: true, opacity: 0.72, blending: THREE.AdditiveBlending, depthWrite: false }));
      glow.scale.set(1.3, 1.3, 1);
      const hit = new THREE.Mesh(new THREE.SphereGeometry(0.85, 8, 8), new THREE.MeshBasicMaterial({ visible: false }));
      hit.userData.interactId = s.id;
      grp.add(disc, rim, glow, hit);
      this.scene.add(grp);

      const entry = { ...s, mesh: grp, hit, collected: false, phase: i * 1.3 };
      this.hiddenSeals.push(entry);
      this.interactables.push({
        id: s.id,
        titleAr: s.labelAr,
        badgeAr: `🏅 اضغط لجمع الختم الذهبي المخفي — ${s.labelAr}`,
        mesh: hit,
        worldPos: new THREE.Vector3(s.x, 1.35, s.z),
        radius: 4.5,
      });
    });
  }

  collectHiddenSeal(sealId) {
    const s = this.hiddenSeals.find((it) => it.id === sealId);
    if (!s || s.collected) return null;
    s.collected = true;
    s.mesh.visible = false;
    this.interactables = this.interactables.filter((it) => it.id !== sealId);
    if (this.nearestInteractable?.id === sealId) {
      this.nearestInteractable = null;
      if (this.callbacks.onProximityChange) this.callbacks.onProximityChange(null);
    }
    return s;
  }

  /* ==================== 4 ARTIFACTS, SCULPTED CARRARA MARBLE & LIVE EASEL ==================== */
  createFramedGalleryPainting(imagePath, secretAr, code, w = 3.7, h = 2.75) {
    const group = new THREE.Group();
    const border = 0.22;
    const outerFrame = new THREE.Mesh(new THREE.BoxGeometry(w + border * 2, h + border * 2, 0.18), this.mats.gold);
    const innerLip = new THREE.Mesh(new THREE.BoxGeometry(w + 0.12, h + 0.12, 0.22), this.mats.woodDark);
    const tex = this.texLoader.load(imagePath); tex.colorSpace = THREE.SRGBColorSpace;
    const art = new THREE.Mesh(new THREE.PlaneGeometry(w, h), new THREE.MeshStandardMaterial({ map: tex, roughness: 0.38 }));
    art.position.z = 0.115;

    if (secretAr) {
      const uvMesh = new THREE.Mesh(new THREE.PlaneGeometry(w * 0.96, h * 0.96), new THREE.MeshBasicMaterial({ map: createUVSecretOverlayTexture(secretAr, code), transparent: true, blending: THREE.AdditiveBlending, depthWrite: false }));
      uvMesh.position.z = 0.14; uvMesh.visible = false; group.add(uvMesh); this.uvSecretMeshes.push(uvMesh);
    }

    const lampArm = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.08, 0.65), this.mats.gold); lampArm.position.set(0, h * 0.5 + 0.34, 0.35);
    const lampHood = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.08, 1.35, 10), this.mats.gold); lampHood.rotation.z = Math.PI / 2; lampHood.position.set(0, h * 0.5 + 0.34, 0.66);
    const lampGlow = new THREE.Sprite(new THREE.SpriteMaterial({ map: this.glowTex, color: 0xffe4a0, transparent: true, opacity: 0.72, blending: THREE.AdditiveBlending, depthWrite: false }));
    lampGlow.scale.set(2.2, 1.2, 1); lampGlow.position.set(0, h * 0.5 + 0.15, 0.58);
    group.add(outerFrame, innerLip, art, lampArm, lampHood, lampGlow);
    return group;
  }

  buildFourInteractiveArtifactsAndSculpture() {
    const chapters = this.config.chapters || [];
    const uvSecrets = [
      '«موهبتكِ بدأت منذ أول لونٍ رسمتِه بطفولتكِ البريئة ✦»',
      '«كل خطٍ ترسمينه يحمل روح فنانةٍ حقيقية لا تتكرر ✦»',
      '«تالتة ثانوي مجرد جسرٍ قصير، وعائلتكِ كلها سندكِ ✦»',
      '«كلية الفنون الجميلة تنتظر اسمكِ المشرق بإذن الله ✦»',
    ];
    const stations = [
      { id: 'childhood', x: -4.5, z: -20, wallX: -8.24, rotY: Math.PI / 2, num: '01', shortAr: 'البدايات', ch: chapters[0] },
      { id: 'passion', x: 4.5, z: -34, wallX: 8.24, rotY: -Math.PI / 2, num: '02', shortAr: 'الشغف', ch: chapters[1] },
      { id: 'thanaweya', x: -4.5, z: -48, wallX: -8.24, rotY: Math.PI / 2, num: '03', shortAr: 'تالتة ثانوي', ch: chapters[2] },
      { id: 'fine-arts', x: 4.5, z: -62, wallX: 8.24, rotY: -Math.PI / 2, num: '04', shortAr: 'فنون جميلة', ch: chapters[3] },
    ];

    stations.forEach((st, idx) => {
      const grp = new THREE.Group(); grp.position.set(st.x, 0, st.z);
      const pedBase = new THREE.Mesh(new THREE.BoxGeometry(1.5, 0.18, 1.5), this.mats.gold); pedBase.position.y = 0.09;
      const pedCol = new THREE.Mesh(new THREE.BoxGeometry(1.16, 1.16, 1.16), this.mats.marble); pedCol.position.y = 0.74;
      const pedTop = new THREE.Mesh(new THREE.BoxGeometry(1.34, 0.12, 1.34), this.mats.gold); pedTop.position.y = 1.36;
      grp.add(pedBase, pedCol, pedTop);
      this.circleColliders.push({ x: st.x, z: st.z, r: 1.45 });

      [[-1.18, 1.18], [1.18, 1.18], [1.18, -1.18], [-1.18, -1.18]].forEach(([px, pz]) => {
        const post = new THREE.Mesh(new THREE.CylinderGeometry(0.032, 0.035, 0.88, 8), this.mats.gold); post.position.set(px, 0.44, pz);
        const knob = new THREE.Mesh(new THREE.SphereGeometry(0.055, 10, 8), this.mats.goldGlow); knob.position.set(px, 0.9, pz);
        grp.add(post, knob);
      });
      const frontRope = new THREE.Mesh(new THREE.CylinderGeometry(0.022, 0.022, 2.36, 8), this.mats.velvetRed);
      frontRope.rotation.z = Math.PI / 2; frontRope.position.set(0, 0.76, 1.18); grp.add(frontRope);

      const ring = new THREE.Mesh(new THREE.RingGeometry(1.32, 1.44, 32), new THREE.MeshBasicMaterial({ color: 0xf7d882, transparent: true, opacity: 0.56, side: THREE.DoubleSide, blending: THREE.AdditiveBlending, depthWrite: false }));
      ring.rotation.x = -Math.PI / 2; ring.position.y = 0.022; grp.add(ring);

      const artCenter = new THREE.Group(); artCenter.position.y = 2.08;
      if (idx === 0) {
        artCenter.add(new THREE.Mesh(new THREE.OctahedronGeometry(0.32, 0), this.mats.goldGlow));
        [0xf0c05a, 0xd97854, 0x6f98bd, 0x86ad7e, 0xe095a4].forEach((hex, pi) => {
          const pen = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.04, 0.86, 6), new THREE.MeshStandardMaterial({ color: hex, roughness: 0.38 }));
          const a = (pi / 5) * Math.PI * 2; pen.position.set(Math.cos(a) * 0.46, 0, Math.sin(a) * 0.46); pen.rotation.set(0.35, a, 0.3); artCenter.add(pen);
        });
      } else if (idx === 1) {
        artCenter.add(
          new THREE.Mesh(new THREE.IcosahedronGeometry(0.54, 0), new THREE.MeshStandardMaterial({ color: 0xf5d076, emissive: 0x9e6f1e, emissiveIntensity: 0.4, metalness: 0.85, roughness: 0.2, wireframe: true })),
          new THREE.Mesh(new THREE.OctahedronGeometry(0.28, 0), this.mats.marble)
        );
      } else if (idx === 2) {
        const glassMat = new THREE.MeshPhysicalMaterial({ color: 0xffe6a8, transparent: true, opacity: 0.5, roughness: 0.1, metalness: 0.2, clearcoat: 1 });
        const topC = new THREE.Mesh(new THREE.ConeGeometry(0.34, 0.48, 16), glassMat); topC.position.y = 0.26; topC.rotation.x = Math.PI;
        const botC = new THREE.Mesh(new THREE.ConeGeometry(0.34, 0.48, 16), glassMat); botC.position.y = -0.26;
        const cap1 = new THREE.Mesh(new THREE.CylinderGeometry(0.4, 0.4, 0.06, 18), this.mats.goldGlow); cap1.position.y = 0.52;
        const cap2 = cap1.clone(); cap2.position.y = -0.52; artCenter.add(topC, botC, cap1, cap2);
      } else {
        const pts = [
          new THREE.Vector2(0.0, -0.48), new THREE.Vector2(0.24, -0.48), new THREE.Vector2(0.20, -0.40),
          new THREE.Vector2(0.09, -0.32), new THREE.Vector2(0.14, -0.16), new THREE.Vector2(0.28, 0.04),
          new THREE.Vector2(0.24, 0.22), new THREE.Vector2(0.11, 0.31), new THREE.Vector2(0.15, 0.44),
          new THREE.Vector2(0.12, 0.54), new THREE.Vector2(0.0, 0.56),
        ];
        artCenter.add(new THREE.Mesh(new THREE.LatheGeometry(pts, 32), this.mats.marble), new THREE.Mesh(new THREE.TorusGeometry(0.58, 0.022, 10, 44), this.mats.goldGlow));
      }
      grp.add(artCenter);
      this.floatingProps.push({ mesh: artCenter, baseY: 2.08, speed: 1.2 + idx * 0.2 });

      const parchment = new THREE.Mesh(new THREE.PlaneGeometry(0.76, 1.0), new THREE.MeshBasicMaterial({ map: createParchmentTexture(`التحفة ${st.num}`, st.shortAr), side: THREE.DoubleSide }));
      parchment.position.set(st.x < 0 ? 0.96 : -0.96, 1.58, 0.56); parchment.rotation.y = st.x < 0 ? 0.42 : -0.42;
      grp.add(parchment); this.parchments.push({ mesh: parchment, baseY: 1.58, phase: idx * 1.4 });

      const wallArt = this.createFramedGalleryPainting(st.ch?.image || './assets/art/chapter1-childhood.jpg', uvSecrets[idx], `CH-0${idx + 1}`);
      wallArt.position.set(st.wallX, 3.7, st.z); wallArt.rotation.y = st.rotY; this.scene.add(wallArt);

      const hitbox = new THREE.Mesh(new THREE.BoxGeometry(2.9, 3.5, 2.7), new THREE.MeshBasicMaterial({ visible: false }));
      hitbox.position.y = 1.7; hitbox.userData.interactId = st.id; grp.add(hitbox);

      this.interactables.push({
        id: st.id, titleAr: st.ch?.titleAr || st.shortAr,
        badgeAr: `📜 اضغط لفتح التحفة ${st.num} — ${st.shortAr}`,
        mesh: hitbox, worldPos: new THREE.Vector3(st.x, 1.5, st.z), radius: 7.5,
      });
      this.scene.add(grp);
    });
  }

  buildLiveLouvreWallPaintingEasel() {
    this.customPaintingCanvas = createDefaultCustomLouvreCanvas();
    this.customPaintingTex = new THREE.CanvasTexture(this.customPaintingCanvas);
    this.customPaintingTex.colorSpace = THREE.SRGBColorSpace;

    const wallGrp = new THREE.Group(); wallGrp.position.set(8.24, 3.75, -27); wallGrp.rotation.y = -Math.PI / 2;
    const outer = new THREE.Mesh(new THREE.BoxGeometry(4.2, 3.15, 0.2), this.mats.goldGlow);
    const canvasPlane = new THREE.Mesh(new THREE.PlaneGeometry(3.75, 2.75), new THREE.MeshStandardMaterial({ map: this.customPaintingTex, roughness: 0.35 }));
    canvasPlane.position.z = 0.12; wallGrp.add(outer, canvasPlane); this.scene.add(wallGrp);

    const easel = new THREE.Group(); easel.position.set(4.2, 0, -27); easel.rotation.y = -0.55;
    [-0.38, 0.38].forEach((lx) => {
      const leg = new THREE.Mesh(new THREE.CylinderGeometry(0.035, 0.04, 2.35, 8), this.mats.woodDark);
      leg.position.set(lx, 1.12, 0); leg.rotation.z = -lx * 0.22; leg.rotation.x = -0.14; easel.add(leg);
    });
    const backLeg = new THREE.Mesh(new THREE.CylinderGeometry(0.035, 0.04, 2.3, 8), this.mats.woodDark); backLeg.position.set(0, 1.08, -0.45); backLeg.rotation.x = 0.32;
    const tray = new THREE.Mesh(new THREE.BoxGeometry(1.25, 0.08, 0.18), this.mats.gold); tray.position.set(0, 0.98, 0.14);
    const miniBoard = new THREE.Mesh(new THREE.BoxGeometry(1.18, 0.88, 0.05), this.mats.gold); miniBoard.position.set(0, 1.46, 0.04); miniBoard.rotation.x = -0.14;
    const miniArt = new THREE.Mesh(new THREE.PlaneGeometry(1.08, 0.78), new THREE.MeshBasicMaterial({ map: this.customPaintingTex })); miniArt.position.set(0, 1.46, 0.072); miniArt.rotation.x = -0.14;
    const eRing = new THREE.Mesh(new THREE.RingGeometry(1.05, 1.18, 30), new THREE.MeshBasicMaterial({ color: 0xffe28a, transparent: true, opacity: 0.65, side: THREE.DoubleSide, blending: THREE.AdditiveBlending, depthWrite: false }));
    eRing.rotation.x = -Math.PI / 2; eRing.position.y = 0.022;
    const eHit = new THREE.Mesh(new THREE.BoxGeometry(2.6, 2.8, 2.6), new THREE.MeshBasicMaterial({ visible: false })); eHit.position.y = 1.4; eHit.userData.interactId = 'easel';
    easel.add(backLeg, tray, miniBoard, miniArt, eRing, eHit);
    this.circleColliders.push({ x: 4.2, z: -27, r: 0.95 }); this.scene.add(easel);

    this.interactables.push({
      id: 'easel', titleAr: 'مرسم اللوفر التفاعلي',
      badgeAr: '🎨 اضغط لرسم لوحة وتعليقها على جدار متحف اللوفر',
      mesh: eHit, worldPos: new THREE.Vector3(4.2, 1.5, -27), radius: 7.5,
    });
  }

  updateCustomLouvreWallPainting(sourceCanvas) {
    const ctx = this.customPaintingCanvas.getContext('2d');
    ctx.drawImage(sourceCanvas, 0, 0, this.customPaintingCanvas.width, this.customPaintingCanvas.height);
    this.customPaintingTex.needsUpdate = true;
  }

  buildRoyalFamilyVaultAndManifesto() {
    const vaultGrp = new THREE.Group(); vaultGrp.position.set(-4.0, 0, -75);
    const ped = new THREE.Mesh(new THREE.BoxGeometry(1.85, 1.05, 1.42), this.mats.marble); ped.position.y = 0.525;
    const cloth = new THREE.Mesh(new THREE.BoxGeometry(1.92, 0.14, 1.48), this.mats.velvetRed); cloth.position.y = 1.06;
    const boxBody = new THREE.Mesh(new THREE.BoxGeometry(1.26, 0.62, 0.86), this.mats.woodDark); boxBody.position.y = 1.42;
    const boxRim = new THREE.Mesh(new THREE.BoxGeometry(1.32, 0.1, 0.92), this.mats.goldGlow); boxRim.position.y = 1.72;
    const boxLid = new THREE.Mesh(new THREE.CylinderGeometry(0.43, 0.43, 1.26, 14, 1, false, 0, Math.PI), this.mats.gold); boxLid.rotation.z = Math.PI / 2; boxLid.position.y = 1.74;

    const envOrbit = new THREE.Group(); envOrbit.position.y = 2.48;
    for (let i = 0; i < 4; i++) {
      const env = new THREE.Mesh(new THREE.BoxGeometry(0.35, 0.22, 0.04), this.mats.goldGlow);
      const a = (i / 4) * Math.PI * 2; env.position.set(Math.cos(a) * 0.64, Math.sin(i * 1.4) * 0.12, Math.sin(a) * 0.64); env.rotation.y = -a; envOrbit.add(env);
    }
    this.floatingProps.push({ mesh: envOrbit, baseY: 2.48, speed: 1.5 });

    const vRing = new THREE.Mesh(new THREE.RingGeometry(1.35, 1.48, 32), new THREE.MeshBasicMaterial({ color: 0xffd87a, transparent: true, opacity: 0.72, side: THREE.DoubleSide, blending: THREE.AdditiveBlending, depthWrite: false }));
    vRing.rotation.x = -Math.PI / 2; vRing.position.y = 0.022;
    const vHit = new THREE.Mesh(new THREE.BoxGeometry(2.7, 3.2, 2.5), new THREE.MeshBasicMaterial({ visible: false })); vHit.position.y = 1.6; vHit.userData.interactId = 'vault';
    vaultGrp.add(ped, cloth, boxBody, boxRim, boxLid, envOrbit, vRing, vHit);
    this.circleColliders.push({ x: -4.0, z: -75, r: 1.3 }); this.scene.add(vaultGrp);
    this.interactables.push({ id: 'vault', titleAr: 'صندوق رسائل العائلة ليمنى', badgeAr: '💌 اضغط لفتح صندوق رسائل العائلة السحابي', mesh: vHit, worldPos: new THREE.Vector3(-4.0, 1.6, -75), radius: 7.5 });

    const manGrp = new THREE.Group(); manGrp.position.set(4.0, 0, -75);
    const mPed = new THREE.Mesh(new THREE.BoxGeometry(1.9, 0.5, 1.12), this.mats.marble); mPed.position.y = 0.25;
    const stele = new THREE.Mesh(new THREE.BoxGeometry(1.56, 2.62, 0.28), this.mats.marble); stele.position.y = 1.8;
    const steleFrame = new THREE.Mesh(new THREE.BoxGeometry(1.7, 2.75, 0.2), this.mats.goldGlow); steleFrame.position.y = 1.8;
    const manTex = createParchmentTexture('الرسالة الأهم ★', 'ثانوية عامة البداية');
    const manFace = new THREE.Mesh(new THREE.PlaneGeometry(1.4, 2.28), new THREE.MeshBasicMaterial({ map: manTex })); manFace.position.set(0, 1.8, 0.155);
    const manFaceBack = manFace.clone(); manFaceBack.position.z = -0.155; manFaceBack.rotation.y = Math.PI;
    const mHit = new THREE.Mesh(new THREE.BoxGeometry(2.7, 3.4, 2.3), new THREE.MeshBasicMaterial({ visible: false })); mHit.position.y = 1.7; mHit.userData.interactId = 'manifesto';
    manGrp.add(mPed, steleFrame, stele, manFace, manFaceBack, vRing.clone(), mHit);
    this.circleColliders.push({ x: 4.0, z: -75, r: 1.3 }); this.scene.add(manGrp);
    this.interactables.push({ id: 'manifesto', titleAr: 'الرسالة الأهم في ختام الرحلة', badgeAr: '★ اضغط لقراءة الرسالة الأهم وكبسولة الطمأنينة', mesh: mHit, worldPos: new THREE.Vector3(4.0, 1.7, -75), radius: 7.5 });
  }

  /* ==================== GRAND ROTUNDA & REALISTIC 3D CAKE ("1" & "9") ==================== */
  createExtrudedDigit1() {
    const s = new THREE.Shape();
    s.moveTo(-0.22, 0); s.lineTo(0.24, 0); s.lineTo(0.24, 0.13); s.lineTo(0.09, 0.13); s.lineTo(0.09, 0.92); s.lineTo(-0.07, 0.92);
    s.lineTo(-0.26, 0.71); s.lineTo(-0.17, 0.61); s.lineTo(-0.06, 0.73); s.lineTo(-0.06, 0.13); s.lineTo(-0.22, 0.13); s.closePath();
    const geo = new THREE.ExtrudeGeometry(s, { depth: 0.11, bevelEnabled: true, bevelThickness: 0.024, bevelSize: 0.02, bevelSegments: 3 });
    geo.translate(0, 0, -0.055); return geo;
  }

  createExtrudedDigit9() {
    const s = new THREE.Shape();
    s.moveTo(-0.18, 0.02); s.quadraticCurveTo(0.18, 0.0, 0.28, 0.28); s.quadraticCurveTo(0.34, 0.56, 0.25, 0.76);
    s.quadraticCurveTo(0.14, 0.95, -0.04, 0.94); s.quadraticCurveTo(-0.28, 0.93, -0.31, 0.66); s.quadraticCurveTo(-0.33, 0.4, -0.06, 0.37);
    s.quadraticCurveTo(0.08, 0.36, 0.15, 0.44); s.quadraticCurveTo(0.13, 0.18, -0.14, 0.15); s.lineTo(-0.22, 0.15); s.closePath();
    const hole = new THREE.Path(); hole.absellipse(-0.02, 0.65, 0.125, 0.145, 0, Math.PI * 2, true, 0); s.holes.push(hole);
    const geo = new THREE.ExtrudeGeometry(s, { depth: 0.11, bevelEnabled: true, bevelThickness: 0.024, bevelSize: 0.02, bevelSegments: 3 });
    geo.translate(0, 0, -0.055); return geo;
  }

  createCandleFlame(x, y, z) {
    const holder = new THREE.Group(); holder.position.set(x, y, z);
    const wick = new THREE.Mesh(new THREE.CylinderGeometry(0.012, 0.014, 0.11, 8), this.mats.woodDark); wick.position.y = 0.04; holder.add(wick);
    const fGrp = new THREE.Group(); fGrp.position.y = 0.14;
    const outer = new THREE.Mesh(new THREE.ConeGeometry(0.065, 0.28, 12), new THREE.MeshBasicMaterial({ color: 0xffa834, transparent: true, opacity: 0.94 })); outer.position.y = 0.06;
    const inner = new THREE.Mesh(new THREE.ConeGeometry(0.034, 0.16, 10), new THREE.MeshBasicMaterial({ color: 0xfff8dc })); inner.position.y = 0.03;
    const glow = new THREE.Sprite(new THREE.SpriteMaterial({ map: this.glowTex, color: 0xffc858, transparent: true, opacity: 0.96, blending: THREE.AdditiveBlending, depthWrite: false }));
    glow.scale.set(1.2, 1.2, 1); glow.position.y = 0.08; fGrp.add(outer, inner, glow); holder.add(fGrp);
    const smoke = new THREE.Sprite(new THREE.SpriteMaterial({ map: this.glowTex, color: 0xcfc7be, transparent: true, opacity: 0, depthWrite: false }));
    smoke.scale.set(0.45, 0.45, 1); smoke.position.y = 0.16; holder.add(smoke);
    this.cakeFlames.push({ group: fGrp, glow, phase: x * 4 + 1.2 }); this.smokePuffs.push({ sprite: smoke, baseY: 0.16 });
    return holder;
  }

  buildGrandRotundaAndRealisticCake() {
    const rotunda = new THREE.Group(); rotunda.position.set(0, 0, -93);
    this.circleColliders.push({ x: 0, z: -93, r: 3.3 });

    const floor = new THREE.Mesh(new THREE.CircleGeometry(12.6, 44), this.mats.marble); floor.rotation.x = -Math.PI / 2; floor.position.y = 0.015;
    const goldInlay = new THREE.Mesh(new THREE.RingGeometry(4.2, 4.48, 44), this.mats.goldGlow); goldInlay.rotation.x = -Math.PI / 2; goldInlay.position.y = 0.022;
    const rotWall = new THREE.Mesh(new THREE.CylinderGeometry(12.5, 12.5, 10.6, 32, 1, true, Math.PI * 0.18, Math.PI * 1.64), new THREE.MeshStandardMaterial({ map: this.wallPanelTex, roughness: 0.65, side: THREE.BackSide })); rotWall.position.y = 5.3;
    const dome = new THREE.Mesh(new THREE.SphereGeometry(12.6, 24, 14, 0, Math.PI * 2, 0, Math.PI * 0.48), new THREE.MeshStandardMaterial({ color: 0xf4cf7c, metalness: 0.78, roughness: 0.22, wireframe: true, transparent: true, opacity: 0.48 })); dome.position.y = 9.6;
    rotunda.add(floor, goldInlay, rotWall, dome);

    for (let i = 0; i < 10; i++) {
      const a = (i / 10) * Math.PI * 2; if (Math.cos(a) > 0.72) continue;
      const col = new THREE.Mesh(new THREE.CylinderGeometry(0.36, 0.42, 9.6, 12), this.mats.marble); col.position.set(Math.sin(a) * 10.8, 4.8, Math.cos(a) * 10.8); rotunda.add(col);
    }

    const dais1 = new THREE.Mesh(new THREE.CylinderGeometry(3.2, 3.5, 0.24, 36), this.mats.marble); dais1.position.y = 0.12;
    const dais2 = new THREE.Mesh(new THREE.CylinderGeometry(2.3, 2.5, 0.85, 36), this.mats.marble); dais2.position.y = 0.65;
    const daisRim = new THREE.Mesh(new THREE.TorusGeometry(2.32, 0.045, 10, 42), this.mats.goldGlow); daisRim.rotation.x = Math.PI / 2; daisRim.position.y = 1.07;
    rotunda.add(dais1, dais2, daisRim);

    const cake = new THREE.Group(); cake.position.y = 2.48; cake.scale.setScalar(1.06);
    const foot = new THREE.Mesh(new THREE.CylinderGeometry(0.55, 0.85, 0.16, 24), this.mats.gold); foot.position.y = -1.28;
    const stem = new THREE.Mesh(new THREE.CylinderGeometry(0.18, 0.28, 0.48, 18), this.mats.marble); stem.position.y = -0.98;
    const platter = new THREE.Mesh(new THREE.CylinderGeometry(1.88, 1.72, 0.12, 34), this.mats.marble); platter.position.y = -0.7;
    const tier1 = new THREE.Mesh(new THREE.CylinderGeometry(1.48, 1.5, 0.88, 34), this.mats.cakeCream); tier1.position.y = -0.2;
    const tier1Glaze = new THREE.Mesh(new THREE.CylinderGeometry(1.5, 1.5, 0.07, 34), this.mats.cakeGanache); tier1Glaze.position.y = 0.23;
    const tier2 = new THREE.Mesh(new THREE.CylinderGeometry(0.96, 0.98, 0.74, 30), this.mats.cakeCream); tier2.position.y = 0.63;
    const tier2Glaze = new THREE.Mesh(new THREE.CylinderGeometry(0.975, 0.975, 0.06, 30), this.mats.cakeGanache); tier2Glaze.position.y = 1.0;
    cake.add(foot, stem, platter, tier1, tier1Glaze, tier2, tier2Glaze);

    const dripGeo = new THREE.CapsuleGeometry(0.055, 0.26, 6, 8), pearlGeo = new THREE.SphereGeometry(0.085, 8, 8);
    for (let i = 0; i < 16; i++) {
      const a = (i / 16) * Math.PI * 2, len = 0.72 + ((i * 7) % 5) * 0.2;
      const d = new THREE.Mesh(dripGeo, this.mats.cakeGanache); d.scale.set(1, len, 1); d.position.set(Math.cos(a) * 1.485, 0.15 - len * 0.13, Math.sin(a) * 1.485);
      const p = new THREE.Mesh(pearlGeo, this.mats.cakeFrosting); p.scale.set(1.15, 0.78, 1.15); p.position.set(Math.cos(a) * 1.54, -0.59, Math.sin(a) * 1.54);
      cake.add(d, p);
    }
    const berryGeo = new THREE.SphereGeometry(0.125, 10, 8), macGeo = new THREE.CylinderGeometry(0.15, 0.15, 0.11, 14);
    for (let i = 0; i < 8; i++) {
      const a = (i / 8) * Math.PI * 2 + 0.2;
      if (i % 2 === 0) { const fruit = new THREE.Mesh(berryGeo, this.mats.strawberry); fruit.scale.set(1, 1.25, 1); fruit.position.set(Math.cos(a) * 1.24, 0.36, Math.sin(a) * 1.24); cake.add(fruit); }
      else { const mac = new THREE.Mesh(macGeo, i % 4 === 1 ? this.mats.macaronRose : this.mats.macaronGold); mac.position.set(Math.cos(a) * 1.24, 0.34, Math.sin(a) * 1.24); cake.add(mac); }
    }

    const c1 = new THREE.Group(); c1.position.set(-0.34, 1.12, 0.02);
    const d1 = new THREE.Mesh(this.createExtrudedDigit1(), this.mats.candleNumber);
    const d1Trim = new THREE.Mesh(this.createExtrudedDigit1(), this.mats.gold); d1Trim.scale.set(1.06, 1.04, 0.72); d1Trim.position.z = -0.02;
    c1.add(d1, d1Trim, this.createCandleFlame(0.02, 0.94, 0));

    const c9 = new THREE.Group(); c9.position.set(0.34, 1.12, 0.02);
    const d9 = new THREE.Mesh(this.createExtrudedDigit9(), this.mats.candleNumber);
    const d9Trim = new THREE.Mesh(this.createExtrudedDigit9(), this.mats.gold); d9Trim.scale.set(1.06, 1.04, 0.72); d9Trim.position.z = -0.02;
    c9.add(d9, d9Trim, this.createCandleFlame(-0.02, 0.95, 0));
    cake.add(c1, c9);
    this.cakeGroup = cake; rotunda.add(cake);

    const fCount = this.isMobile ? 160 : 280, fPos = new Float32Array(fCount * 3), fCol = new Float32Array(fCount * 3);
    this.fireworkVels = [];
    const fPal = [new THREE.Color(0xffe89e), new THREE.Color(0xf2b94c), new THREE.Color(0xffffff), new THREE.Color(0xe07b58), new THREE.Color(0x98c494)];
    for (let i = 0; i < fCount; i++) {
      const c = fPal[i % fPal.length]; fCol[i * 3] = c.r; fCol[i * 3 + 1] = c.g; fCol[i * 3 + 2] = c.b;
      const th = Math.random() * Math.PI * 2, ph = Math.acos(2 * Math.random() - 1), spd = 2.8 + Math.random() * 5.8;
      this.fireworkVels.push({ x: Math.sin(ph) * Math.cos(th) * spd, y: Math.abs(Math.cos(ph)) * spd + 2.2, z: Math.sin(ph) * Math.sin(th) * spd });
    }
    const fGeo = new THREE.BufferGeometry(); fGeo.setAttribute('position', new THREE.BufferAttribute(fPos, 3)); fGeo.setAttribute('color', new THREE.BufferAttribute(fCol, 3));
    this.fireworksPoints = new THREE.Points(fGeo, new THREE.PointsMaterial({ size: 0.45, map: this.glowTex, vertexColors: true, transparent: true, opacity: 0, blending: THREE.AdditiveBlending, depthWrite: false }));
    this.fireworksPoints.position.set(0, 3.8, -93); this.scene.add(this.fireworksPoints);

    const cakeHit = new THREE.Mesh(new THREE.CylinderGeometry(2.7, 2.7, 4.6, 14), new THREE.MeshBasicMaterial({ visible: false }));
    cakeHit.position.y = 2.3; cakeHit.userData.interactId = 'cake'; rotunda.add(cakeHit);
    this.interactables.push({ id: 'cake', titleAr: 'تورتة العام التاسع عشر', badgeAr: '🎂 اضغط على التورتة للاحتفال وإطفاء شمعتي 1 و 9', mesh: cakeHit, worldPos: new THREE.Vector3(0, 2.2, -93), radius: 9.8 });
    this.scene.add(rotunda);
  }

  /* ==================== OPTIMIZED DISTANCE-CULLED MOCAP HUMAN VISITORS (5 DESKTOP / 3 MOBILE) ==================== */
  loadOptimizedMocapHumanVisitors() {
    Promise.all([
      this.gltfLoader.loadAsync('./assets/models/visitor-rpm.glb'),
      this.gltfLoader.loadAsync('./assets/models/anim-walk.glb'),
      this.gltfLoader.loadAsync('./assets/models/anim-idle.glb'),
    ]).then(([avatarGltf, walkGltf, idleGltf]) => {
      const walkClip = walkGltf.animations[0];
      const idleClip = idleGltf.animations[0];
      if (walkClip) {
        walkClip.tracks.forEach((tr) => {
          if (tr.name === 'Hips.position') {
            const vals = tr.values, x0 = vals[0], z0 = vals[2];
            for (let i = 0; i < vals.length; i += 3) { vals[i] = x0; vals[i + 2] = z0; }
          }
        });
      }

      const outfits = [
        { top: 0x222c3d, bot: 0x181a20, hat: true, beard: false },
        { top: 0x5c202a, bot: 0x1d1f26, hat: false, beard: false },
        { top: 0x9c7b56, bot: 0x24201c, hat: false, beard: true },
        { top: 0x2e4238, bot: 0x212328, hat: true, beard: true },
        { top: 0xd8cfc2, bot: 0x2a3140, hat: false, beard: false },
      ];

      const allSpecs = [
        { x: -8.5, z0: 60, z1: 22, speed: 1.22, walking: true, scale: 1.0 },
        { x: 5.2, z0: 18, z1: 52, speed: 1.15, walking: true, scale: 0.98 },
        { x: -4.8, z0: 15, z1: 2.5, speed: 1.05, walking: true, scale: 0.96 },
        { x: -6.1, z0: -19.5, z1: -19.5, rotY: -Math.PI * 0.48, walking: false, scale: 0.97 },
        { x: 6.1, z0: -61.5, z1: -61.5, rotY: Math.PI * 0.5, walking: false, scale: 0.96 },
      ];
      const specs = this.isMobile ? [allSpecs[0], allSpecs[1], allSpecs[3]] : allSpecs;
      const shadowMat = new THREE.MeshBasicMaterial({ color: 0x050302, transparent: true, opacity: 0.36, depthWrite: false });
      const shadowGeo = new THREE.CircleGeometry(0.4, 14);

      specs.forEach((sp, idx) => {
        const clone = SkeletonUtils.clone(avatarGltf.scene);
        const style = outfits[idx % outfits.length];
        clone.traverse((o) => {
          if (o.isMesh) {
            o.castShadow = false; // Uses zero-cost contact shadow disc for locked 60FPS!
            o.receiveShadow = false;
            o.frustumCulled = false;
            if (o.name === 'Wolf3D_Beard') o.visible = style.beard;
            if (o.name === 'Mesh' || o.material?.name === 'Wolf3D_Headwear') o.visible = style.hat;
            if (o.material?.name === 'Wolf3D_Outfit_Top') { o.material = o.material.clone(); o.material.color.setHex(style.top); }
            else if (o.material?.name === 'Wolf3D_Outfit_Bottom') { o.material = o.material.clone(); o.material.color.setHex(style.bot); }
          }
        });
        const disc = new THREE.Mesh(shadowGeo, shadowMat);
        disc.rotation.x = -Math.PI / 2; disc.position.y = 0.02;
        clone.add(disc);
        clone.scale.setScalar(sp.scale);
        clone.position.set(sp.x, 0, sp.z0);
        if (!sp.walking && sp.rotY !== undefined) clone.rotation.y = sp.rotY;

        const mixer = new THREE.AnimationMixer(clone);
        const clip = sp.walking ? walkClip : idleClip;
        if (clip) {
          const action = mixer.clipAction(clip);
          action.time = (idx * 0.47) % clip.duration;
          action.setEffectiveTimeScale(sp.walking ? sp.speed * 0.85 : 0.9);
          action.play();
        }
        this.scene.add(clone);
        this.humanVisitors.push({ root: clone, mixer, ...sp, progress: (idx * 0.31) % 1, dir: 1 });
      });
    }).catch(() => { /* ignore if offline */ });
  }

  buildGoldenAutumnLeaves() {
    const count = this.isMobile ? 28 : 54;
    this.leafInst = new THREE.InstancedMesh(new THREE.PlaneGeometry(0.14, 0.14), new THREE.MeshBasicMaterial({ color: 0xf6cf76, side: THREE.DoubleSide, transparent: true, opacity: 0.7 }), count);
    this.leafDummy = new THREE.Object3D();
    for (let i = 0; i < count; i++) {
      this.fallingLeaves.push({ x: (Math.random() - 0.5) * 26, y: 1 + Math.random() * 11, z: 68 - Math.random() * 160, spd: 0.35 + Math.random() * 0.6, ph: Math.random() * Math.PI * 2 });
    }
    this.scene.add(this.leafInst);
  }

  buildPawPrintPool() {
    const geo = new THREE.PlaneGeometry(0.34, 0.34);
    for (let i = 0; i < 16; i++) {
      const m = new THREE.Mesh(geo, new THREE.MeshBasicMaterial({ map: this.pawTex, transparent: true, opacity: 0, blending: THREE.AdditiveBlending, depthWrite: false, side: THREE.DoubleSide }));
      m.rotation.x = -Math.PI / 2; m.visible = false; this.scene.add(m);
      this.pawPrints.push({ mesh: m, life: 0 });
    }
  }

  spawnPawPrint(pos, yaw) {
    const slot = this.pawPrints[this.pawIdx];
    this.pawIdx = (this.pawIdx + 1) % this.pawPrints.length;
    const side = (this.pawIdx % 2 === 0 ? 1 : -1) * 0.13;
    slot.mesh.position.set(pos.x + Math.cos(yaw) * side, 0.03, pos.z - Math.sin(yaw) * side);
    slot.mesh.rotation.set(-Math.PI / 2, 0, yaw);
    slot.life = 1.0; slot.mesh.visible = true;
  }

  loadAnatomicallyFixed40BonePersianCat() {
    this.catRoot.position.copy(this.catPos); this.scene.add(this.catRoot);
    const catShadow = new THREE.Mesh(new THREE.CircleGeometry(0.46, 18), new THREE.MeshBasicMaterial({ color: 0x050302, transparent: true, opacity: 0.38, depthWrite: false }));
    catShadow.rotation.x = -Math.PI / 2; catShadow.position.y = 0.018;
    const beaconRing = new THREE.Mesh(new THREE.RingGeometry(0.52, 0.6, 32), new THREE.MeshBasicMaterial({ color: 0xffe08a, transparent: true, opacity: 0.65, side: THREE.DoubleSide, blending: THREE.AdditiveBlending, depthWrite: false }));
    beaconRing.rotation.x = -Math.PI / 2; beaconRing.position.y = 0.025;
    this.catBeaconRing = beaconRing; this.catRoot.add(catShadow, beaconRing);

    const catLight = new THREE.PointLight(0xffe9c2, 2.8, 5.4, 1.4); catLight.position.set(0, 1.25, 0.85); this.catRoot.add(catLight);

    this.catYarn = new THREE.Group();
    this.catYarn.add(new THREE.Mesh(new THREE.SphereGeometry(0.13, 12, 10), new THREE.MeshStandardMaterial({ color: 0xe8b954, roughness: 0.72 })));
    for (let i = 0; i < 4; i++) { const b = new THREE.Mesh(new THREE.TorusGeometry(0.132, 0.016, 8, 18), this.mats.goldGlow); b.rotation.set(i * 0.8, i * 1.1, i * 0.5); this.catYarn.add(b); }
    this.catYarn.position.set(0.28, 0.13, 0.62); this.catYarn.visible = false; this.catRoot.add(this.catYarn);

    const coatTex = this.texLoader.load('./assets/models/persian-cat-coat.jpg'); coatTex.colorSpace = THREE.SRGBColorSpace; coatTex.flipY = false;

    this.gltfLoader.load('./assets/models/persian-cat.glb', (gltf) => {
      const model = gltf.scene;
      const animatedBoneNames = new Set();
      if (gltf.animations?.[0]) gltf.animations[0].tracks.forEach((tr) => animatedBoneNames.add(tr.name.split('.')[0]));

      model.scale.setScalar(2.0); this.catRoot.add(model); this.catRoot.updateMatrixWorld(true);
      const rootWorldInv = this.catRoot.getWorldQuaternion(new THREE.Quaternion()).invert();
      const worldQ = new THREE.Quaternion(), invLocalQ = new THREE.Quaternion();

      model.traverse((obj) => {
        if (obj.isBone || (obj.name && obj.name.startsWith('Wolf_'))) {
          obj.getWorldQuaternion(worldQ);
          invLocalQ.copy(rootWorldInv).multiply(worldQ).invert();
          this.catBoneInfo[obj.name] = {
            bone: obj, restQuat: obj.quaternion.clone(),
            axisRight: new THREE.Vector3(1, 0, 0).applyQuaternion(invLocalQ).normalize(),
            axisUp: new THREE.Vector3(0, 1, 0).applyQuaternion(invLocalQ).normalize(),
            axisFwd: new THREE.Vector3(0, 0, 1).applyQuaternion(invLocalQ).normalize(),
            isStatic: !animatedBoneNames.has(obj.name),
          };
        }
        if (obj.isMesh) {
          obj.frustumCulled = false;
          const mats = Array.isArray(obj.material) ? obj.material : [obj.material];
          mats.forEach((m) => {
            if (!m) return;
            const isEye = m.name === 'material';
            m.map = coatTex; m.roughness = isEye ? 0.08 : 0.76; m.metalness = isEye ? 0.12 : 0.02;
            if (!isEye) { m.emissive = new THREE.Color(0x523418); m.emissiveIntensity = 0.2; }
            m.needsUpdate = true;
          });
        }
      });

      const jawInfo = this.catBoneInfo.Wolf_Head_JawSHJnt_12;
      if (jawInfo) {
        this.catTongue = new THREE.Mesh(new THREE.CapsuleGeometry(0.008, 0.028, 6, 8), new THREE.MeshStandardMaterial({ color: 0xec808d, roughness: 0.35 }));
        this.catTongue.position.set(0, 0.048, 0.042); this.catTongue.rotation.x = Math.PI * 0.42; this.catTongue.scale.setScalar(0.001); jawInfo.bone.add(this.catTongue);
      }
      const neckInfo = this.catBoneInfo.Wolf_Neck_01SHJnt_16;
      if (neckInfo) { const bell = new THREE.Mesh(new THREE.SphereGeometry(0.015, 10, 8), this.mats.goldGlow); bell.position.set(0, 0.036, 0.09); neckInfo.bone.add(bell); }

      if (gltf.animations?.length) {
        this.catMixer = new THREE.AnimationMixer(model);
        const act = this.catMixer.clipAction(gltf.animations[0]); act.setEffectiveTimeScale(0.88); act.play();
      }
      const cHit = new THREE.Mesh(new THREE.SphereGeometry(0.74, 10, 10), new THREE.MeshBasicMaterial({ visible: false }));
      cHit.position.y = 0.52; cHit.userData.interactId = 'cat'; this.catRoot.add(cHit); this.catHitMesh = cHit;
      this.catLoaded = true;
    });
  }

  applyWorldBoneRot(name, pitchRad = 0, yawRad = 0, rollRad = 0) {
    const info = this.catBoneInfo[name];
    if (!info) return;
    if (pitchRad) { this._qDelta.setFromAxisAngle(info.axisRight, pitchRad); info.bone.quaternion.multiply(this._qDelta); }
    if (yawRad) { this._qDelta.setFromAxisAngle(info.axisUp, yawRad); info.bone.quaternion.multiply(this._qDelta); }
    if (rollRad) { this._qDelta.setFromAxisAngle(info.axisFwd, rollRad); info.bone.quaternion.multiply(this._qDelta); }
  }

  resolveCollisions(pos) {
    const playerR = 0.55;
    const inRotunda = pos.z < -81, inLouvre = pos.z < -6 && !inRotunda;
    const maxW = inRotunda ? 9.6 : inLouvre ? 6.3 : 12.4;
    pos.x = Math.max(-maxW, Math.min(maxW, pos.x));
    pos.z = Math.max(-101, Math.min(72, pos.z));

    for (const b of this.boxColliders) {
      const cx = Math.max(b.minX, Math.min(pos.x, b.maxX)), cz = Math.max(b.minZ, Math.min(pos.z, b.maxZ));
      const dx = pos.x - cx, dz = pos.z - cz, d2 = dx * dx + dz * dz;
      if (d2 < playerR * playerR) {
        if (d2 > 0.00001) { const d = Math.sqrt(d2); pos.x = cx + (dx / d) * playerR; pos.z = cz + (dz / d) * playerR; }
        else { pos.x = Math.abs(pos.x - b.minX) < Math.abs(b.maxX - pos.x) ? b.minX - playerR : b.maxX + playerR; }
      }
    }
    for (const c of this.circleColliders) {
      const dx = pos.x - c.x, dz = pos.z - c.z, minDist = c.r + playerR, d = Math.hypot(dx, dz);
      if (d < minDist && d > 0.0001) { pos.x = c.x + (dx / d) * minDist; pos.z = c.z + (dz / d) * minDist; }
    }
  }

  startDroneTour() { this.droneActive = true; this.droneTime = 0; this.setAutoFollow(false); if (this.callbacks.onDroneChange) this.callbacks.onDroneChange(true); }
  stopDroneTour() { if (!this.droneActive) return; this.droneActive = false; if (this.callbacks.onDroneChange) this.callbacks.onDroneChange(false); }

  setJoystickInput(forward, strafe) {
    this.moveInput.forward = forward; this.moveInput.strafe = strafe;
    if (Math.abs(forward) > 0.1 || Math.abs(strafe) > 0.1) { this.setAutoFollow(false); this.stopDroneTour(); }
  }

  setAutoFollow(enabled) {
    this.autoFollow = Boolean(enabled);
    if (this.autoFollow) this.stopDroneTour();
    if (this.callbacks.onAutoFollowChange) this.callbacks.onAutoFollowChange(this.autoFollow);
  }

  teleportToWaypoint(idx) {
    this.stopDroneTour();
    const wp = STORY_WAYPOINTS[Math.max(0, Math.min(STORY_WAYPOINTS.length - 1, idx))];
    if (!wp) return;
    this.currentWaypointIdx = idx;
    const zOffset = idx === 0 ? 7.0 : idx === 1 ? 4.5 : idx === STORY_WAYPOINTS.length - 1 ? 4.2 : 3.2;
    this.playerPos.set(wp.x, 1.68, wp.z + zOffset);
    this.resolveCollisions(this.playerPos);
    this.catPos.set(wp.catX, 0, wp.catZ); this.catRoot.position.copy(this.catPos);
    const lookX = idx === 0 ? -1.8 : wp.catX * 1.25;
    const lookZ = wp.z - 3.2;
    this.targetYaw = Math.atan2(-(lookX - this.playerPos.x), -(lookZ - this.playerPos.z));
    this.playerYaw = this.targetYaw;
    this.targetPitch = idx === 0 ? 0.03 : -0.02; this.playerPitch = this.targetPitch;
    if (this.callbacks.onWaypointChange) this.callbacks.onWaypointChange(idx, wp);
  }

  triggerCatAction(action) { this.catState = action; this.catStateTimer = 0; this.catStateDur = action === 'groom' ? 5.5 : action === 'play' ? 6.2 : 3.4; }
  triggerCakeCelebration(blowOut = true) { this.candlesLit = !blowOut; this.candleWind = 0; if (blowOut) { this.smokeTime = 0; this.launchFireworks(); } else this.smokeTime = -1; }
  setCandleWind(lvl) { this.candleWind = Math.max(0, Math.min(1, Number(lvl) || 0)); }

  launchFireworks() {
    this.fireworksTime = 0;
    const pos = this.fireworksPoints.geometry.attributes.position.array;
    for (let i = 0; i < this.fireworkVels.length; i++) { pos[i * 3] = (Math.random() - 0.5) * 1.4; pos[i * 3 + 1] = (Math.random() - 0.5) * 0.6; pos[i * 3 + 2] = (Math.random() - 0.5) * 1.4; }
    this.fireworksPoints.geometry.attributes.position.needsUpdate = true; this.fireworksPoints.material.opacity = 1;
  }

  captureLouvrePostcard() {
    this.renderFrame();
    const out = document.createElement('canvas'); out.width = 1280; out.height = 760;
    const ctx = out.getContext('2d');
    ctx.fillStyle = '#0f0b08'; ctx.fillRect(0, 0, 1280, 760);
    ctx.drawImage(this.canvas, 34, 34, 1212, 620);
    ctx.strokeStyle = '#e8c268'; ctx.lineWidth = 4; ctx.strokeRect(20, 20, 1240, 720);
    ctx.fillStyle = 'rgba(13, 9, 6, 0.92)'; ctx.fillRect(24, 654, 1232, 84);
    ctx.textAlign = 'center';
    ctx.direction = 'rtl'; ctx.fillStyle = '#fbf0cf'; ctx.font = '700 28px Amiri, Georgia, serif';
    ctx.fillText('جولة باريس ومتحف اللوفر 3D — رحلة يمنى (العام التاسع عشر) ✦ HEY', 640, 695);
    ctx.direction = 'ltr'; ctx.fillStyle = '#d6ab52'; ctx.font = '600 13px Cinzel, Georgia, serif';
    ctx.fillText('MUSÉE DU LOUVRE PARIS 3D EDITION  •  DESIGNED & DEVELOPED BY ENG / MOHAMED TAREK', 640, 723);
    const a = document.createElement('a'); a.download = `Yomna-Paris-Louvre-3D-${Date.now()}.png`; a.href = out.toDataURL('image/png'); a.click();
  }

  getMiniMapTelemetry() {
    return {
      px: this.playerPos.x,
      pz: this.playerPos.z,
      yaw: this.playerYaw,
      cx: this.catPos.x,
      cz: this.catPos.z,
      seals: this.hiddenSeals,
    };
  }

  bindEvents() {
    window.addEventListener('resize', () => {
      this.isMobile = window.innerWidth < 900;
      const aspect = window.innerWidth / Math.max(1, window.innerHeight);
      this.camera.aspect = aspect;
      this.baseFov = aspect < 0.85 ? 64 : 53;
      this.camera.updateProjectionMatrix();
      this.applyQualitySettings();
    }, { passive: true });

    window.addEventListener('keydown', (e) => {
      if (e.target instanceof HTMLTextAreaElement || e.target instanceof HTMLInputElement) return;
      this.keys[e.code] = true;
      if (['KeyW', 'KeyS', 'KeyA', 'KeyD', 'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.code)) { this.setAutoFollow(false); this.stopDroneTour(); }
      if (e.code === 'KeyE' && this.nearestInteractable && this.callbacks.onInteract) this.callbacks.onInteract(this.nearestInteractable.id);
      if (e.code === 'KeyZ') this.setZoom(!this.zoomed);
    });
    window.addEventListener('keyup', (e) => { this.keys[e.code] = false; });

    this.canvas.addEventListener('pointerdown', (e) => { this.isLooking = true; this.dragMoved = 0; this.lookStart.x = e.clientX; this.lookStart.y = e.clientY; });
    window.addEventListener('pointermove', (e) => {
      if (!this.isLooking) return;
      const dx = e.clientX - this.lookStart.x, dy = e.clientY - this.lookStart.y;
      this.dragMoved += Math.hypot(dx, dy); this.lookStart.x = e.clientX; this.lookStart.y = e.clientY;
      this.targetYaw -= dx * 0.004; this.targetPitch = Math.max(-0.48, Math.min(0.62, this.targetPitch - dy * 0.003));
    }, { passive: true });

    const endLook = (e) => {
      if (!this.isLooking) return; this.isLooking = false;
      if (this.dragMoved < 10 && e && typeof e.clientX === 'number') {
        this._ndc.set((e.clientX / window.innerWidth) * 2 - 1, -(e.clientY / window.innerHeight) * 2 + 1);
        this.raycaster.setFromCamera(this._ndc, this.camera);
        const targets = this.interactables.map((it) => it.mesh);
        if (this.catHitMesh) targets.push(this.catHitMesh);
        const hits = this.raycaster.intersectObjects(targets, false);
        if (hits.length > 0 && hits[0].object.userData.interactId) {
          const id = hits[0].object.userData.interactId;
          if (id === 'cat') { this.triggerCatAction('pet'); if (this.callbacks.onCatPet) this.callbacks.onCatPet(); }
          else if (this.callbacks.onInteract) this.callbacks.onInteract(id);
        }
      }
    };
    window.addEventListener('pointerup', endLook);
    window.addEventListener('pointercancel', endLook);
    document.addEventListener('visibilitychange', () => { this.isHidden = document.hidden; });
  }

  renderFrame() {
    if (this.qualityMode === 'ultra' && this.composer) this.composer.render();
    else this.renderer.render(this.scene, this.camera);
  }

  /* ==================== SILKY 60FPS GAME SIMULATION LOOP ==================== */
  animate() {
    if (this.disposed) return;
    requestAnimationFrame(() => this.animate());
    if (this.isHidden) return;

    const dt = Math.min(this.clock.getDelta(), 0.05);
    // Low-power 15FPS throttle while Reception Portal is open so entry feels instant & lag-free!
    if (this.portalPaused) {
      this.portalTickAccum += dt;
      if (this.portalTickAccum < 0.066) return;
      this.portalTickAccum = 0;
    }

    const t = this.clock.getElapsedTime();
    const damp = 1 - Math.exp(-9.0 * dt);

    // Smooth Telephoto Zoom FOV interpolation (1x / 2x)
    const desiredFov = this.zoomed ? 24 : this.baseFov;
    if (Math.abs(this.camera.fov - desiredFov) > 0.08) {
      this.camera.fov += (desiredFov - this.camera.fov) * damp;
      this.camera.updateProjectionMatrix();
    }

    if (this.droneActive) {
      this.droneTime += dt;
      const p = Math.min(1, this.droneTime / 24.0);
      const z = THREE.MathUtils.lerp(66, -86, p);
      const y = z > 14 ? THREE.MathUtils.lerp(12.5, 2.3, (66 - z) / 52) : 2.15 + Math.sin(p * Math.PI * 4) * 0.2;
      const x = z > 14 ? Math.sin(p * Math.PI * 2) * 5.5 : Math.sin(p * Math.PI * 5) * 1.1;
      this.camera.position.set(x, y, z);
      this._tmpLook.set(z > 20 ? -8 : 0, z > 20 ? 6.0 : 2.2, z - 14);
      this.camera.lookAt(this._tmpLook);
      this.playerPos.set(0, 1.68, Math.max(-87, Math.min(64, z)));
      if (p >= 1) this.stopDroneTour();
    } else if (!this.portalPaused) {
      let fwd = this.moveInput.forward, str = this.moveInput.strafe;
      if (this.keys.KeyW || this.keys.ArrowUp) fwd += 1;
      if (this.keys.KeyS || this.keys.ArrowDown) fwd -= 1;
      if (this.keys.KeyD || this.keys.ArrowRight) str += 1;
      if (this.keys.KeyA || this.keys.ArrowLeft) str -= 1;

      let movedStep = 0;
      if (this.autoFollow) {
        const wp = STORY_WAYPOINTS[this.currentWaypointIdx];
        const dx = wp.x - this.playerPos.x, dz = wp.z - this.playerPos.z, dist = Math.hypot(dx, dz);
        if (!this.isLooking) {
          const desiredYaw = Math.atan2(-dx, -dz);
          let diff = desiredYaw - this.targetYaw;
          while (diff > Math.PI) diff -= Math.PI * 2;
          while (diff < -Math.PI) diff += Math.PI * 2;
          this.targetYaw += diff * (1 - Math.exp(-3.4 * dt));
          this.targetPitch += (-0.01 - this.targetPitch) * (1 - Math.exp(-3.0 * dt));
        }
        if (dist > 1.8) { movedStep = Math.min(dist, 5.4 * dt); this.playerPos.x += (dx / dist) * movedStep; this.playerPos.z += (dz / dist) * movedStep; }
        else if (this.currentWaypointIdx < STORY_WAYPOINTS.length - 1) {
          this.currentWaypointIdx++;
          if (this.callbacks.onWaypointChange) this.callbacks.onWaypointChange(this.currentWaypointIdx, STORY_WAYPOINTS[this.currentWaypointIdx]);
        } else this.setAutoFollow(false);
      } else {
        const mag = Math.hypot(fwd, str);
        if (mag > 0.05) {
          const normF = fwd / Math.max(1, mag), normS = str / Math.max(1, mag);
          movedStep = 6.2 * dt;
          const sinY = Math.sin(this.playerYaw), cosY = Math.cos(this.playerYaw);
          this.playerPos.x += (-sinY * normF + cosY * normS) * movedStep;
          this.playerPos.z += (-cosY * normF - sinY * normS) * movedStep;
        }
      }

      if (movedStep > 0) {
        this.walkBobPhase += movedStep * 2.2;
        this.footstepAccum += movedStep;
        if (this.footstepAccum > 2.1) {
          this.footstepAccum = 0;
          if (this.callbacks.onFootstep) this.callbacks.onFootstep(this.playerPos.z < -6 ? 'wood' : 'stone');
        }
      }
      this.resolveCollisions(this.playerPos);
      this.playerYaw += (this.targetYaw - this.playerYaw) * damp;
      this.playerPitch += (this.targetPitch - this.playerPitch) * damp;
      this.camera.position.set(this.playerPos.x, this.playerPos.y + Math.sin(this.walkBobPhase) * 0.026, this.playerPos.z);
      this.camera.rotation.order = 'YXZ'; this.camera.rotation.y = this.playerYaw; this.camera.rotation.x = this.playerPitch;
    } else {
      // Gentle cinematic idle camera framing while portal is open
      this.camera.position.set(this.playerPos.x, this.playerPos.y, this.playerPos.z);
      this.camera.rotation.order = 'YXZ'; this.camera.rotation.y = Math.sin(t * 0.25) * 0.04; this.camera.rotation.x = 0.02;
    }

    // Automatic Sliding Glass Doors of the Louvre Pyramid
    for (const d of this.pyramidDoors) {
      const near = (Math.abs(this.playerPos.z - d.worldZ) < 8.5 && Math.abs(this.playerPos.x) < 4.5) || Math.abs(this.catPos.z - d.worldZ) < 8.0 || (this.droneActive && Math.abs(this.camera.position.z - d.worldZ) < 12);
      d.openAmt += ((near ? 1 : 0) - d.openAmt) * (1 - Math.exp(-5.5 * dt));
      d.leftDoor.position.x = d.closedLeftX - d.openAmt * 1.55;
      d.rightDoor.position.x = d.closedRightX + d.openAmt * 1.55;
    }

    if (!this.enteredLouvreOnce && this.playerPos.z < -7.5) {
      this.enteredLouvreOnce = true;
      if (this.callbacks.onEnterLouvre) this.callbacks.onEnterLouvre();
    }

    this.playerLantern.position.set(this.camera.position.x, 3.2, this.camera.position.z - 2.4);
    if (this.skyGroup) this.skyGroup.position.set(this.camera.position.x, 0, this.camera.position.z);

    if (!this.autoFollow && !this.droneActive && !this.portalPaused) {
      let bestIdx = this.currentWaypointIdx, bestD = Infinity;
      for (let i = 0; i < STORY_WAYPOINTS.length; i++) {
        const d = Math.abs(this.playerPos.z - STORY_WAYPOINTS[i].z);
        if (d < bestD) { bestD = d; bestIdx = i; }
      }
      if (bestIdx !== this.currentWaypointIdx) {
        this.currentWaypointIdx = bestIdx;
        if (this.callbacks.onWaypointChange) this.callbacks.onWaypointChange(bestIdx, STORY_WAYPOINTS[bestIdx]);
      }
    }

    let closest = null, minD = Infinity;
    for (const it of this.interactables) {
      const d = Math.hypot(this.playerPos.x - it.worldPos.x, this.playerPos.z - it.worldPos.z);
      if (d < it.radius && d < minD) { minD = d; closest = it; }
    }
    if (closest?.id !== this.nearestInteractable?.id) {
      this.nearestInteractable = closest;
      if (this.callbacks.onProximityChange) this.callbacks.onProximityChange(closest);
    }

    // 40-Bone Golden Persian Cat Guide
    const wp = STORY_WAYPOINTS[this.currentWaypointIdx];
    const targetCatX = wp.catX, targetCatZ = Math.max(wp.catZ, this.playerPos.z - 7.5);
    const cdx = targetCatX - this.catPos.x, cdz = targetCatZ - this.catPos.z, cDist = Math.hypot(cdx, cdz);
    let catSpd = 0;
    if (cDist > 0.3 && !this.portalPaused) {
      const step = Math.min(cDist, Math.max(2.5, cDist * 1.4) * dt, 7.0 * dt);
      this.catPos.x += (cdx / cDist) * step; this.catPos.z += (cdz / cDist) * step;
      catSpd = step / Math.max(0.001, dt);
      this.catStride += step * 4.4; this.catStepAccum += step;
      if (this.catStepAccum > 0.56) { this.catStepAccum = 0; this.spawnPawPrint(this.catPos, this.catYaw); }
    }
    this.catRoot.position.copy(this.catPos);
    if (this.catBeaconRing) { this.catBeaconRing.rotation.z = t * 1.1; this.catBeaconRing.scale.setScalar(1 + Math.sin(t * 3.2) * 0.07); }

    const catMoving = catSpd > 0.22;
    const desiredCatYaw = catMoving ? Math.atan2(cdx, cdz) : Math.atan2(this.playerPos.x - this.catPos.x, this.playerPos.z - this.catPos.z) + 0.58;
    let cyDiff = desiredCatYaw - this.catYaw;
    while (cyDiff > Math.PI) cyDiff -= Math.PI * 2; while (cyDiff < -Math.PI) cyDiff += Math.PI * 2;
    this.catYaw += cyDiff * (1 - Math.exp(-6.2 * dt));
    this.catRoot.rotation.y = this.catYaw;

    this.catStateTimer += dt;
    if (!catMoving) {
      if (this.catState !== 'guide' && this.catStateTimer > this.catStateDur) { this.catState = 'guide'; this.catStateTimer = 0; this.catStateDur = 9 + Math.random() * 5; }
      else if (this.catState === 'guide' && this.catStateTimer > this.catStateDur) { this.catState = Math.random() < 0.5 ? 'groom' : 'play'; this.catStateTimer = 0; this.catStateDur = 5.4; }
    }
    this.catYarn.visible = this.catState === 'play' && !catMoving;
    if (this.catYarn.visible) { this.catYarn.position.x = Math.sin(t * 3.0) * 0.28; this.catYarn.position.y = 0.13 + Math.abs(Math.sin(t * 4.8)) * 0.18; this.catYarn.rotation.z += dt * 3.8; }

    if (this.catLoaded) {
      if (this.catMixer) this.catMixer.update(dt);
      for (const name in this.catBoneInfo) { const info = this.catBoneInfo[name]; if (info.isStatic) info.bone.quaternion.copy(info.restQuat); }
      const w = catMoving ? Math.min(1, catSpd / 2.2) : 0;
      if (w > 0.05) {
        const s = this.catStride, fl = Math.sin(s), fr = Math.sin(s + Math.PI), hl = Math.sin(s + Math.PI * 0.92), hr = Math.sin(s - Math.PI * 0.08);
        this.applyWorldBoneRot('Wolf_Spine_02SHJnt_20', Math.sin(s) * 0.04 * w, 0, 0);
        this.applyWorldBoneRot('Wolf_Spine_04SHJnt_18', -Math.sin(s) * 0.045 * w, 0, 0);
        this.applyWorldBoneRot('Wolf_l_FrontLeg_HipSHJnt_4', -fl * 0.28 * w, 0, 0);
        this.applyWorldBoneRot('Wolf_l_FrontLeg_KneeSHJnt_3', Math.max(0, Math.cos(s)) * 0.34 * w, 0, 0);
        this.applyWorldBoneRot('Wolf_r_FrontLeg_HipSHJnt_10', -fr * 0.28 * w, 0, 0);
        this.applyWorldBoneRot('Wolf_r_FrontLeg_KneeSHJnt_9', Math.max(0, Math.cos(s + Math.PI)) * 0.34 * w, 0, 0);
        this.applyWorldBoneRot('Wolf_l_HindLeg_HipSHJnt_27', -hl * 0.25 * w, 0, 0);
        this.applyWorldBoneRot('Wolf_l_HindLeg_Knee2SHJnt_25', -Math.max(0, Math.cos(s + Math.PI * 0.92)) * 0.32 * w, 0, 0);
        this.applyWorldBoneRot('Wolf_r_HindLeg_HipSHJnt_33', -hr * 0.25 * w, 0, 0);
        this.applyWorldBoneRot('Wolf_r_HindLeg_Knee2SHJnt_31', -Math.max(0, Math.cos(s - Math.PI * 0.08)) * 0.32 * w, 0, 0);
        if (this.catTongue) this.catTongue.scale.setScalar(0.001);
      } else if (this.catState === 'groom') {
        const smoothIn = Math.min(1, this.catStateTimer * 2.2), lk = Math.sin(t * 5.6);
        this.applyWorldBoneRot('Wolf_r_FrontLeg_HipSHJnt_10', -0.58 * smoothIn, 0.1 * smoothIn, 0);
        this.applyWorldBoneRot('Wolf_r_FrontLeg_KneeSHJnt_9', 0.48 * smoothIn, 0, 0);
        this.applyWorldBoneRot('Wolf_r_FrontLeg_AnkleSHJnt_8', 0.28 * smoothIn, 0, 0);
        this.applyWorldBoneRot('Wolf_Neck_01SHJnt_16', 0.16 * smoothIn, -0.1 * smoothIn, 0);
        this.applyWorldBoneRot('Wolf_Neck_02SHJnt_15', (0.14 + lk * 0.045) * smoothIn, -0.06 * smoothIn, 0);
        this.applyWorldBoneRot('Wolf_Head_JawSHJnt_12', (0.06 + Math.max(0, lk) * 0.06) * smoothIn, 0, 0);
        if (this.catTongue) this.catTongue.scale.setScalar(Math.max(0.001, Math.max(0, lk) * smoothIn));
      } else if (this.catState === 'play') {
        const bat = Math.max(0, Math.sin(t * 4.8));
        this.applyWorldBoneRot('Wolf_r_FrontLeg_HipSHJnt_10', -bat * 0.48, 0.08 * bat, 0);
        this.applyWorldBoneRot('Wolf_r_FrontLeg_KneeSHJnt_9', bat * 0.36, 0, 0);
        this.applyWorldBoneRot('Wolf_Neck_02SHJnt_15', 0.14, Math.sin(t * 3.0) * 0.18, 0);
        if (this.catTongue) this.catTongue.scale.setScalar(0.001);
      } else if (this.catState === 'pet') {
        this.applyWorldBoneRot('Wolf_Neck_02SHJnt_15', -0.1, Math.sin(t * 3.4) * 0.14, Math.sin(t * 3.4) * 0.08);
        if (this.catTongue) this.catTongue.scale.setScalar(0.001);
      } else {
        this.applyWorldBoneRot('Wolf_Neck_02SHJnt_15', -0.04, -0.28 + Math.sin(t * 1.2) * 0.06, 0);
        if (this.catTongue) this.catTongue.scale.setScalar(0.001);
      }
      ['Wolf_Tail_01_02SHJnt_37', 'Wolf_Tail_01_03SHJnt_36', 'Wolf_Tail_01_04SHJnt_35', 'Wolf_Tail_01_05SHJnt_34'].forEach((bn, i) => {
        this.applyWorldBoneRot(bn, i === 0 ? -0.1 : -0.04, Math.sin(t * (catMoving ? 4.8 : 2.1) - i * 0.55) * (catMoving ? 0.16 : 0.12), 0);
      });
    }

    for (const p of this.pawPrints) {
      if (p.life > 0) { p.life -= dt * 0.35; p.mesh.material.opacity = Math.max(0, p.life * 0.82); if (p.life <= 0) p.mesh.visible = false; }
    }

    // Distance-Culled Mocap Human Visitors (only skin/animate humans within 52m!)
    for (const v of this.humanVisitors) {
      const nearCam = Math.abs(this.camera.position.z - v.root.position.z) < 54;
      if (nearCam) v.mixer.update(dt);
      if (v.walking) {
        const span = Math.max(1, Math.abs(v.z1 - v.z0));
        v.progress += (v.speed * dt * v.dir) / span;
        if (v.progress >= 1) { v.progress = 1; v.dir = -1; }
        else if (v.progress <= 0) { v.progress = 0; v.dir = 1; }
        v.root.position.z = THREE.MathUtils.lerp(v.z0, v.z1, v.progress);
        const movingPlusZ = (v.z1 > v.z0 ? v.dir > 0 : v.dir < 0);
        v.root.rotation.y = movingPlusZ ? 0 : Math.PI;
      }
    }

    // Animate 5 Hidden Collectible Golden Seals
    for (const s of this.hiddenSeals) {
      if (!s.collected) {
        s.mesh.rotation.y += dt * 1.4;
        s.mesh.position.y = 1.35 + Math.sin(t * 2.2 + s.phase) * 0.12;
      }
    }

    // Animate 19 Birthday Sky Lanterns Rising Over Paris!
    for (let i = this.skyLanterns.length - 1; i >= 0; i--) {
      const ln = this.skyLanterns[i];
      ln.life += dt;
      ln.mesh.position.y += ln.vy * dt;
      ln.mesh.position.x = ln.baseX + Math.sin(t * 0.7 + ln.phase) * 1.2;
      ln.mesh.rotation.y += dt * 0.4;
      if (ln.life > ln.maxLife) { this.scene.remove(ln.mesh); this.skyLanterns.splice(i, 1); }
    }

    // Animate Wishing Coins
    for (let i = this.flyingCoins.length - 1; i >= 0; i--) {
      const fc = this.flyingCoins[i]; fc.t += dt * 1.15;
      const p = Math.min(1, fc.t);
      fc.mesh.position.lerpVectors(fc.p0, fc.p1, p);
      fc.mesh.position.y += Math.sin(p * Math.PI) * 2.4;
      fc.mesh.rotation.x += dt * 14; fc.mesh.rotation.y += dt * 9;
      if (fc.t >= 1) { this.scene.remove(fc.mesh); this.flyingCoins.splice(i, 1); }
    }

    // Eiffel Champagne Sparkle Show Event + Clouds + Props + 3D Cake
    if (this.sparkleShowTimer > 0) this.sparkleShowTimer = Math.max(0, this.sparkleShowTimer - dt);
    const sparkleBoost = this.sparkleShowTimer > 0;
    for (const cl of this.cloudSprites) { cl.ang += cl.speed * dt; cl.sprite.position.set(Math.cos(cl.ang) * cl.dist, cl.h, Math.sin(cl.ang) * cl.dist); }
    if (this.eiffelBeacon) this.eiffelBeacon.scale.setScalar((sparkleBoost ? 8.2 : 5.8) + Math.sin(t * (sparkleBoost ? 7 : 3.5)) * 1.4);
    if (this.eiffelSearchlightRig) this.eiffelSearchlightRig.rotation.y = t * (sparkleBoost ? 1.1 : 0.55);
    for (const sp of this.eiffelSparkles) {
      const spd = sparkleBoost ? sp.speed * 2.6 : sp.speed;
      const baseOp = sparkleBoost ? 0.35 : (this.timeOfDay === 'day' ? 0.08 : 0.25);
      sp.sprite.material.opacity = baseOp + Math.max(0, Math.sin(t * spd + sp.phase)) * (sparkleBoost ? 0.65 : 0.6);
      sp.sprite.scale.setScalar(sparkleBoost ? 1.85 : 1.15);
    }

    for (const fr of this.fountainRings) { const f = (t * 0.55 + fr.phase) % 1; fr.mesh.scale.setScalar(0.6 + f * 3.6); fr.mesh.material.opacity = (1 - f) * 0.48; }
    for (const fp of this.floatingProps) { fp.mesh.position.y = fp.baseY + Math.sin(t * fp.speed) * 0.09; fp.mesh.rotation.y += dt * 0.4; }
    for (const pc of this.parchments) pc.mesh.position.y = pc.baseY + Math.sin(t * 1.8 + pc.phase) * 0.07;

    if (this.leafInst && this.leafInst.visible) {
      for (let i = 0; i < this.fallingLeaves.length; i++) {
        const lf = this.fallingLeaves[i]; lf.y -= lf.spd * dt; if (lf.y < 0.2) lf.y = 11;
        this.leafDummy.position.set(lf.x + Math.sin(t + lf.ph) * 0.4, lf.y, lf.z);
        this.leafDummy.rotation.set(t + lf.ph, t * 0.7, lf.ph);
        this.leafDummy.updateMatrix(); this.leafInst.setMatrixAt(i, this.leafDummy.matrix);
      }
      this.leafInst.instanceMatrix.needsUpdate = true;
    }

    if (this.cakeGroup) this.cakeGroup.rotation.y = Math.sin(t * 0.52) * 0.24;
    for (const f of this.cakeFlames) {
      f.group.visible = this.candlesLit;
      if (this.candlesLit) {
        const fl = Math.sin(t * 13 + f.phase) * 0.1 + Math.sin(t * 21 + f.phase) * 0.06;
        f.group.scale.set(1 + fl * 0.45, Math.max(0.45, 1 + fl - this.candleWind * 0.35), 1 + fl * 0.45);
        f.group.rotation.z = Math.sin(t * 9 + f.phase) * 0.08 + this.candleWind * 0.55;
        f.glow.material.opacity = 0.85 + fl * 0.5;
      }
    }
    if (this.smokeTime >= 0) {
      this.smokeTime += dt;
      for (const sm of this.smokePuffs) { const p = Math.min(1, this.smokeTime / 3.0); sm.sprite.position.y = sm.baseY + p * 1.4; sm.sprite.scale.setScalar(0.35 + p * 1.1); sm.sprite.material.opacity = Math.sin(p * Math.PI) * 0.45; }
      if (this.smokeTime >= 3.0) this.smokeTime = -1;
    }
    if (this.fireworksTime >= 0) {
      this.fireworksTime += dt;
      const arr = this.fireworksPoints.geometry.attributes.position.array;
      for (let i = 0; i < this.fireworkVels.length; i++) { const v = this.fireworkVels[i]; arr[i * 3] += v.x * dt; arr[i * 3 + 1] += (v.y - 3.6 * this.fireworksTime) * dt; arr[i * 3 + 2] += v.z * dt; }
      this.fireworksPoints.geometry.attributes.position.needsUpdate = true;
      this.fireworksPoints.material.opacity = Math.max(0, 1 - this.fireworksTime / 3.6);
      if (this.fireworksTime > 3.6) this.fireworksTime = -1;
    }

    this.renderFrame();
  }
}
