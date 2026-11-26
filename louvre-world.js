/**
 * =========================================================================
 *  PHOTOREALISTIC PARIS & MUSÉE DU LOUVRE 3D STORY ENGINE (louvre-world.js)
 *  - Dynamic Time-of-Day Engine: Golden Sunset / Sunny Day / Starry Paris Night
 *    with real 3D Sun Disc, Drifting Clouds, Crescent Moon & PMREM Reflections!
 *  - Architectural Curved Parabolic Eiffel Tower (Lacy Iron Filigree Cutout,
 *    3 Observation Galleries, Twinkle Sparkles & Rotating Night Searchlight!)
 *  - Authentic U-Shaped Musée du Louvre Cour Napoléon (Richelieu, Sully, Denon
 *    Wings, Mansard Dormers, I.M. Pei Glass Pyramid, Mini-Pyramids & Pools)
 *  - Rue de Rivoli Haussmann Boulevards, Café Terraces, Botanical Plane Trees
 *    & 12 Articulated Parisian Pedestrians / Museum Art Visitors
 *  - Louvre Grande Galerie (Oiled Oak Parquet, Carrara Marble Columns, Velvet
 *    Stanchions, Museum Benches, Picture Lights, 4 Masterpieces + Parchments,
 *    Royal Firebase Family Treasure Box, Manifesto Stele & Grand Rotunda 3D Cake)
 *  - 100% Anatomically Verified 40-Bone Golden Persian Cat (Exact World-Space
 *    Rest Axes — Zero Bone Clipping, Zero Eye Pop-Out, Lifelike Trot & Groom!)
 *  - Designed & Developed by ENG / Mohamed Tarek • HEY Edition
 * =========================================================================
 */

import * as THREE from './vendor/three.module.min.js';
import { GLTFLoader } from './vendor/GLTFLoader.js';
import {
  createGlowTexture,
  createLightBeamTexture,
  createCloudTexture,
  createParisCobblestonePBR,
  createHaussmannFacadePBR,
  createLouvrePalacePBR,
  createMansardRoofPBR,
  createEiffelLatticeTexture,
  createTreeFoliageTexture,
  createGrandGalleryParquetPBR,
  createLouvreWallPanelPBR,
  createCarraraMarblePBR,
  createParchmentTexture,
  createLouvreSignTexture,
  createPawPrintTexture,
} from './louvre-assets.js?v=20';

export const STORY_WAYPOINTS = [
  {
    id: 'paris',
    labelAr: 'شارع باريس وبرج إيفل',
    x: 0,
    z: 56,
    catX: -0.65,
    catZ: 51.5,
    tipAr: 'مياو! أهلاً في باريس الساحرة 🇫🇷✨ شوف برج إيفل الشاهق على شمالك والمباني الباريسية، واتبعني ناحية ساحة متحف اللوفر!',
  },
  {
    id: 'pyramid',
    labelAr: 'ساحة وهرم اللوفر الزجاجي',
    x: 0,
    z: 18,
    catX: 0.2,
    catZ: 12.2,
    tipAr: 'وصلنا لساحة نابليون وهرم اللوفر الزجاجي المضيء وسط البرك العاكسة! 🏛️ كمّل المشي ورايا عشان ندخل القاعة الكبرى ونكتشف التحف!',
  },
  {
    id: 'artifact-1',
    labelAr: 'التحفة 01 • البدايات والطفولة',
    x: -1.4,
    z: -19,
    catX: -2.4,
    catZ: -20.0,
    interactId: 'childhood',
    tipAr: 'أول تحفة في متحف رحلة يمنى! 🎨 اضغط على اللوحة أو الورقة الذهبية الطايرة 📜 عشان تقرأ حكاية البدايات والطفولة!',
  },
  {
    id: 'artifact-2',
    labelAr: 'التحفة 02 • روح الأتيليه والشغف',
    x: 1.4,
    z: -33,
    catX: 2.4,
    catZ: -34.0,
    interactId: 'passion',
    tipAr: 'التحفة التانية — شغف الرسم والأتيليه! ✒️ اضغط عليها عشان تفتح التفاصيل وكمان تقدر تزور استوديو الرسم الـ 8×!',
  },
  {
    id: 'artifact-3',
    labelAr: 'التحفة 03 • تالتة ثانوي وبداية الطريق',
    x: -1.4,
    z: -47,
    catX: -2.4,
    catZ: -48.0,
    interactId: 'thanaweya',
    tipAr: 'الساعة الرملية الذهبية لتالتة ثانوي ⏳ اضغط على الورقة الذهبية 📜 عشان تشوف شريط الـ 90% ورسالة التشجيع المختومة!',
  },
  {
    id: 'artifact-4',
    labelAr: 'التحفة 04 • أفق كلية الفنون الجميلة',
    x: 1.4,
    z: -61,
    catX: 2.4,
    catZ: -62.0,
    interactId: 'fine-arts',
    tipAr: 'تمثال الرخام الكلاسيكي وبوابة حلم كلية الفنون الجميلة! 🏛️✨ اضغط على التحفة لفتح بطاقة الحلم الرسمية!',
  },
  {
    id: 'vault-manifesto',
    labelAr: 'صندوق العيلة والرسالة الأهم ★',
    x: 0,
    z: -74,
    catX: -1.8,
    catZ: -75.0,
    interactId: 'vault',
    tipAr: 'محطة القلب! على شمالك «صندوق رسائل العيلة السحابي ليمنى 💌» وعلى يمينك «الرسالة الأهم في ختام الرحلة ★» — اضغط على كل واحد فيهم!',
  },
  {
    id: 'cake',
    labelAr: 'القبة الملكية وتورتة الـ 19 🎂',
    x: 0,
    z: -87.2,
    catX: 2.2,
    catZ: -90.8,
    interactId: 'cake',
    tipAr: 'وصلنا لقبة اللوفر الذهبية وتورتة العام الـ 19 بشمعتي «1» و «9»! 🎂🎆 اضغط على التورتة للاحتفال وإطفاء الشمعتين!',
  },
];

const TIME_PRESETS = {
  sunset: {
    labelAr: '🌇 غروب باريس',
    skyTop: 0x162244,
    skyMid: 0x724058,
    skyHorizon: 0xf4a05c,
    sunGlow: 0xffe49e,
    sunColor: 0xffc67c,
    sunIntensity: 2.35,
    sunPos: new THREE.Vector3(-42, 24, -68),
    hemiSky: 0xffe2be,
    hemiGround: 0x2c2224,
    hemiIntensity: 1.25,
    fogColor: 0x2b2029,
    fogDensity: 0.0052,
    exposure: 1.12,
    starsOpacity: 0.42,
    cloudTint: 0xffd2a8,
    cloudOpacity: 0.56,
    windowEmissive: 0.85,
    lampOpacity: 0.78,
    showSun: true,
    showMoon: false,
    searchlightOpacity: 0.0,
  },
  day: {
    labelAr: '☀️ نهار باريس',
    skyTop: 0x2b6ec4,
    skyMid: 0x6ea8e5,
    skyHorizon: 0xd9ecfa,
    sunGlow: 0xfff8e2,
    sunColor: 0xfff4dd,
    sunIntensity: 2.9,
    sunPos: new THREE.Vector3(-34, 62, -45),
    hemiSky: 0xeaf4ff,
    hemiGround: 0x5c5348,
    hemiIntensity: 1.48,
    fogColor: 0xb7cde0,
    fogDensity: 0.0032,
    exposure: 1.06,
    starsOpacity: 0.0,
    cloudTint: 0xffffff,
    cloudOpacity: 0.78,
    windowEmissive: 0.12,
    lampOpacity: 0.16,
    showSun: true,
    showMoon: false,
    searchlightOpacity: 0.0,
  },
  night: {
    labelAr: '🌙 ليل باريس',
    skyTop: 0x050918,
    skyMid: 0x0f1a38,
    skyHorizon: 0x282745,
    sunGlow: 0xaac4ff,
    sunColor: 0x8eaef0,
    sunIntensity: 0.95,
    sunPos: new THREE.Vector3(36, 46, -65),
    hemiSky: 0x5571a8,
    hemiGround: 0x1b1614,
    hemiIntensity: 0.88,
    fogColor: 0x101426,
    fogDensity: 0.0056,
    exposure: 1.18,
    starsOpacity: 0.96,
    cloudTint: 0x4b5c82,
    cloudOpacity: 0.34,
    windowEmissive: 1.35,
    lampOpacity: 1.0,
    showSun: false,
    showMoon: true,
    searchlightOpacity: 0.42,
  },
};

export class LouvreParisWorld3D {
  constructor(canvas, config, callbacks = {}) {
    this.canvas = canvas;
    this.config = config;
    this.callbacks = callbacks;

    this.isMobile = window.innerWidth < 900;
    this.qualityMode = 'auto'; // 'auto' | 'ultra' | 'smooth'
    this.timeOfDay = 'sunset'; // 'sunset' | 'day' | 'night'
    this.disposed = false;
    this.isHidden = false;

    // Player 3D First-Person Walk Controller
    this.playerPos = new THREE.Vector3(0, 1.68, 63);
    this.playerYaw = 0;
    this.playerPitch = 0.02; // Slightly lifted to frame Eiffel spire + Louvre mansard gloriously!
    this.targetYaw = 0;
    this.targetPitch = 0.02;
    this.walkBobPhase = 0;
    this.moveInput = { forward: 0, strafe: 0 };
    this.keys = {};
    this.autoFollow = false;
    this.currentWaypointIdx = 0;
    this.enteredLouvreOnce = false;

    // Pointer Look / Raycast State
    this.isLooking = false;
    this.lookStart = { x: 0, y: 0 };
    this.dragMoved = 0;

    // Interactive Objects Registry
    this.interactables = [];
    this.nearestInteractable = null;

    // 40-Bone Golden Persian Cat Rig (EXACT World-Space Rest Axes!)
    this.catRoot = new THREE.Group();
    this.catPos = new THREE.Vector3(-0.65, 0, 57.5);
    this.catYaw = Math.PI;
    this.catMixer = null;
    this.catBoneInfo = {}; // name -> { bone, restQuat, axisRight, axisUp, axisFwd, isStatic }
    this.catLoaded = false;
    this.catStride = 0;
    this.catStepAccum = 0;
    this.catState = 'guide'; // 'guide' | 'groom' | 'play' | 'pet'
    this.catStateTimer = 0;
    this.catStateDur = 10;
    this.pawPrints = [];
    this.pawIdx = 0;

    // Cake & Fireworks State
    this.candlesLit = true;
    this.candleWind = 0;
    this.cakeFlames = [];
    this.smokePuffs = [];
    this.smokeTime = -1;
    this.fireworksTime = -1;

    // Animated World Collections
    this.crowdWalkers = [];
    this.floatingProps = [];
    this.parchments = [];
    this.lampHalos = [];
    this.cloudSprites = [];
    this.fallingLeaves = [];
    this.eiffelSparkles = [];
    this.fountainRings = [];
    this.emissiveBuildingMats = [];

    this.raycaster = new THREE.Raycaster();
    this._ndc = new THREE.Vector2();
    this._qDelta = new THREE.Quaternion();
    this._tmpV = new THREE.Vector3();

    this.clock = new THREE.Clock();
    this.init();
  }

  /* ==================== INIT RENDERER, PMREM REFLECTIONS & WORLD ==================== */
  init() {
    this.renderer = new THREE.WebGLRenderer({
      canvas: this.canvas,
      antialias: !this.isMobile,
      powerPreference: 'high-performance',
    });
    this.applyQualitySettings();
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.12;
    this.renderer.outputColorSpace = THREE.SRGBColorSpace;

    this.scene = new THREE.Scene();
    this.scene.fog = new THREE.FogExp2(0x2b2029, 0.0052);

    const aspect = window.innerWidth / Math.max(1, window.innerHeight);
    this.camera = new THREE.PerspectiveCamera(aspect < 0.85 ? 64 : 53, aspect, 0.12, 460);

    this.pmremGenerator = new THREE.PMREMGenerator(this.renderer);
    this.pmremGenerator.compileEquirectangularShader();

    this.texLoader = new THREE.TextureLoader();
    const aniso = Math.min(this.renderer.capabilities.getMaxAnisotropy(), this.isMobile ? 2 : 6);

    // Hardware-cached PBR texture sets
    this.glowTex = createGlowTexture();
    this.beamTex = createLightBeamTexture();
    this.cloudTex = createCloudTexture();
    this.pawTex = createPawPrintTexture();
    this.cobblePBR = createParisCobblestonePBR(aniso);
    this.haussmannPBR = createHaussmannFacadePBR(aniso);
    this.louvrePBR = createLouvrePalacePBR(aniso);
    this.mansardPBR = createMansardRoofPBR(aniso);
    this.eiffelLatticeTex = createEiffelLatticeTexture(aniso);
    this.foliageTex = createTreeFoliageTexture();
    this.parquetPBR = createGrandGalleryParquetPBR(aniso);
    this.wallPanelPBR = createLouvreWallPanelPBR(aniso);
    this.marbleTex = createCarraraMarblePBR(aniso);

    // Shared High-Realism PBR Materials
    this.mats = {
      gold: new THREE.MeshStandardMaterial({ color: 0xefc86a, metalness: 0.88, roughness: 0.2 }),
      goldGlow: new THREE.MeshStandardMaterial({ color: 0xfff0be, emissive: 0xd99628, emissiveIntensity: 0.72, metalness: 0.68, roughness: 0.2 }),
      marble: new THREE.MeshStandardMaterial({ map: this.marbleTex, color: 0xfbf6ee, roughness: 0.22, metalness: 0.06 }),
      limestonePlain: new THREE.MeshStandardMaterial({ color: 0xd9c7aa, roughness: 0.76, metalness: 0.02 }),
      haussmann: new THREE.MeshStandardMaterial({
        map: this.haussmannPBR.map,
        bumpMap: this.haussmannPBR.bumpMap,
        bumpScale: 0.14,
        emissive: new THREE.Color(0xffc773),
        emissiveMap: this.haussmannPBR.emissiveMap,
        emissiveIntensity: 0.85,
        roughness: 0.74,
        metalness: 0.04,
      }),
      louvrePalace: new THREE.MeshStandardMaterial({
        map: this.louvrePBR.map,
        bumpMap: this.louvrePBR.bumpMap,
        bumpScale: 0.18,
        emissive: new THREE.Color(0xffc975),
        emissiveMap: this.louvrePBR.emissiveMap,
        emissiveIntensity: 0.82,
        roughness: 0.68,
        metalness: 0.05,
      }),
      mansard: new THREE.MeshStandardMaterial({
        map: this.mansardPBR.map,
        bumpMap: this.mansardPBR.bumpMap,
        bumpScale: 0.12,
        roughness: 0.46,
        metalness: 0.36,
      }),
      ironDark: new THREE.MeshStandardMaterial({ color: 0x26262a, metalness: 0.82, roughness: 0.32 }),
      eiffelSteel: new THREE.MeshStandardMaterial({ color: 0x5d483a, metalness: 0.74, roughness: 0.36 }),
      eiffelLattice: new THREE.MeshStandardMaterial({
        map: this.eiffelLatticeTex,
        alphaTest: 0.35,
        transparent: false,
        side: THREE.DoubleSide,
        metalness: 0.72,
        roughness: 0.38,
      }),
      velvetRed: new THREE.MeshStandardMaterial({ color: 0x6f1623, roughness: 0.88 }),
      woodDark: new THREE.MeshStandardMaterial({ color: 0x3b2314, roughness: 0.54 }),
      lampGlow: new THREE.MeshBasicMaterial({ color: 0xffeaaf }),
      // Realistic Reflective I.M. Pei Louvre Glass Pyramid!
      glassPyramid: new THREE.MeshPhysicalMaterial({
        color: 0xd6eef5,
        emissive: 0x8f6224,
        emissiveIntensity: 0.24,
        transparent: true,
        opacity: 0.42,
        roughness: 0.06,
        metalness: 0.18,
        reflectivity: 1.0,
        clearcoat: 1.0,
        clearcoatRoughness: 0.05,
        side: THREE.DoubleSide,
      }),
      // Cour Napoléon Mirror Reflection Pool Water!
      waterPool: new THREE.MeshPhysicalMaterial({
        color: 0x16283d,
        roughness: 0.05,
        metalness: 0.42,
        clearcoat: 1.0,
        clearcoatRoughness: 0.04,
        reflectivity: 0.96,
      }),
      // Realistic 2-Tier Patisserie Birthday Cake Materials
      cakeCream: new THREE.MeshStandardMaterial({ color: 0xfbf3e4, roughness: 0.52 }),
      cakeFrosting: new THREE.MeshStandardMaterial({ color: 0xfff8ed, roughness: 0.4 }),
      cakeGanache: new THREE.MeshStandardMaterial({ color: 0x351a0f, roughness: 0.18, metalness: 0.16 }),
      strawberry: new THREE.MeshStandardMaterial({ color: 0xc22b38, roughness: 0.28 }),
      macaronRose: new THREE.MeshStandardMaterial({ color: 0xe2988d, roughness: 0.38 }),
      macaronGold: new THREE.MeshStandardMaterial({ color: 0xe6be68, roughness: 0.32, metalness: 0.36 }),
      candleNumber: new THREE.MeshStandardMaterial({ color: 0xfff4d9, emissive: 0x5c370c, emissiveIntensity: 0.28, roughness: 0.28, metalness: 0.24 }),
    };
    this.emissiveBuildingMats.push(this.mats.haussmann, this.mats.louvrePalace);

    this.setupLighting();
    this.buildDynamicParisSkySunMoonClouds();
    this.buildParisRueDeRivoliAndCafes();
    this.buildArchitecturalEiffelTower();
    this.buildAuthenticLouvreCourNapoleonAndPyramids();
    this.buildLouvreGrandGalleryInterior();
    this.buildFourInteractiveArtifacts();
    this.buildRoyalFamilyVaultAndManifesto();
    this.buildGrandRotundaAndRealisticCake();
    this.buildArticulatedParisianCrowd();
    this.buildGoldenAutumnLeaves();
    this.buildPawPrintPool();
    this.loadAnatomicallyFixed40BonePersianCat();

    this.setTimeOfDay('sunset');
    this.bindEvents();
    this.animate();
  }

  applyQualitySettings() {
    const dpr = window.devicePixelRatio || 1;
    let targetDpr = Math.min(dpr, this.isMobile ? 1.25 : 1.65);
    if (this.qualityMode === 'smooth') targetDpr = Math.min(dpr, 1.0);
    else if (this.qualityMode === 'ultra') targetDpr = Math.min(dpr, 2.0);
    this.renderer.setPixelRatio(targetDpr);
  }

  setQualityMode(mode) {
    this.qualityMode = mode;
    this.applyQualitySettings();
    if (this.leafInst) this.leafInst.visible = mode !== 'smooth';
  }

  /* ==================== LIGHTING & LIVE PMREM SKY REFLECTIONS ==================== */
  setupLighting() {
    this.hemiLight = new THREE.HemisphereLight(0xffe2be, 0x2c2224, 1.25);
    this.scene.add(this.hemiLight);

    this.sunLight = new THREE.DirectionalLight(0xffc67c, 2.35);
    this.sunLight.position.set(-42, 24, -68);
    this.scene.add(this.sunLight);

    // Subtle cool sky bounce rim from opposite side so architecture has sculpted 3D depth!
    this.fillLight = new THREE.DirectionalLight(0x8ea8e6, 0.55);
    this.fillLight.position.set(35, 22, 48);
    this.scene.add(this.fillLight);

    // Warm moving gallery illumination light right around the player
    this.playerLantern = new THREE.PointLight(0xffdca0, 15, 28, 1.45);
    this.scene.add(this.playerLantern);
  }

  updateEnvironmentReflections(preset) {
    // Bake a fast tiny sky scene via PMREMGenerator so glass, water, marble, gold & wet cobblestones reflect real Paris skies!
    if (this.envRenderTarget) this.envRenderTarget.dispose();
    const envScene = new THREE.Scene();
    const envSky = new THREE.Mesh(
      new THREE.SphereGeometry(20, 16, 12),
      new THREE.ShaderMaterial({
        side: THREE.BackSide,
        uniforms: {
          uTop: { value: new THREE.Color(preset.skyTop) },
          uMid: { value: new THREE.Color(preset.skyMid) },
          uHorizon: { value: new THREE.Color(preset.skyHorizon) },
        },
        vertexShader: `varying vec3 vD; void main(){ vD = normalize(position); gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.0); }`,
        fragmentShader: `uniform vec3 uTop,uMid,uHorizon; varying vec3 vD; void main(){ float h=clamp(vD.y,0.0,1.0); vec3 c=mix(uHorizon,uMid,smoothstep(0.0,0.3,h)); c=mix(c,uTop,smoothstep(0.25,0.8,h)); gl_FragColor=vec4(c*1.25,1.0); }`,
      })
    );
    envScene.add(envSky);
    // Add bright sun/moon reflection spot inside PMREM sphere
    const orb = new THREE.Mesh(
      new THREE.SphereGeometry(2.2, 10, 8),
      new THREE.MeshBasicMaterial({ color: preset.sunGlow })
    );
    orb.position.copy(preset.sunPos).normalize().multiplyScalar(14);
    envScene.add(orb);

    this.envRenderTarget = this.pmremGenerator.fromScene(envScene, 0.04);
    this.scene.environment = this.envRenderTarget.texture;
    envSky.geometry.dispose();
    envSky.material.dispose();
    orb.geometry.dispose();
    orb.material.dispose();
  }

  /* ==================== DYNAMIC SKY DOME, SUN DISC, MOON, STARS & DRIFTING CLOUDS ==================== */
  buildDynamicParisSkySunMoonClouds() {
    this.skyGroup = new THREE.Group();

    const skyGeo = new THREE.SphereGeometry(260, 32, 22);
    this.skyUniforms = {
      uTop: { value: new THREE.Color(0x162244) },
      uMid: { value: new THREE.Color(0x724058) },
      uHorizon: { value: new THREE.Color(0xf4a05c) },
      uSunGlow: { value: new THREE.Color(0xffe49e) },
      uSunDir: { value: new THREE.Vector3(-0.46, 0.24, -0.85).normalize() },
    };
    const skyMat = new THREE.ShaderMaterial({
      side: THREE.BackSide,
      depthWrite: false,
      fog: false,
      uniforms: this.skyUniforms,
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
        uniform vec3 uSunDir;
        varying vec3 vDir;
        void main() {
          vec3 d = normalize(vDir);
          float h = clamp(d.y, 0.0, 1.0);
          vec3 col = mix(uHorizon, uMid, smoothstep(0.0, 0.26, h));
          col = mix(col, uTop, smoothstep(0.22, 0.72, h));
          // Atmospheric Mie solar scattering halo + horizon warmth
          float sunDot = max(dot(d, normalize(uSunDir)), 0.0);
          col += uSunGlow * pow(sunDot, 12.0) * 0.55;
          col += uSunGlow * pow(sunDot, 120.0) * 1.15;
          gl_FragColor = vec4(col, 1.0);
        }
      `,
    });
    this.skyGroup.add(new THREE.Mesh(skyGeo, skyMat));

    // Real Visible Glowing 3D Sun Disc + Solar Corona!
    this.sunGroup = new THREE.Group();
    const sunDisc = new THREE.Mesh(
      new THREE.SphereGeometry(7.2, 20, 16),
      new THREE.MeshBasicMaterial({ color: 0xfff8de, fog: false })
    );
    const sunCorona = new THREE.Sprite(
      new THREE.SpriteMaterial({ map: this.glowTex, color: 0xffd282, transparent: true, opacity: 0.92, blending: THREE.AdditiveBlending, depthWrite: false, fog: false })
    );
    sunCorona.scale.set(58, 58, 1);
    this.sunGroup.add(sunDisc, sunCorona);
    this.skyGroup.add(this.sunGroup);

    // Real Glowing Paris Night Moon + Soft Lunar Halo!
    this.moonGroup = new THREE.Group();
    const moonDisc = new THREE.Mesh(
      new THREE.SphereGeometry(5.2, 20, 16),
      new THREE.MeshBasicMaterial({ color: 0xf4f7ff, fog: false })
    );
    const moonHalo = new THREE.Sprite(
      new THREE.SpriteMaterial({ map: this.glowTex, color: 0x9ec0ff, transparent: true, opacity: 0.65, blending: THREE.AdditiveBlending, depthWrite: false, fog: false })
    );
    moonHalo.scale.set(36, 36, 1);
    this.moonGroup.add(moonDisc, moonHalo);
    this.moonGroup.position.set(78, 92, -165);
    this.skyGroup.add(this.moonGroup);

    // Crisp Starry Paris Night Sky
    const starCount = this.isMobile ? 220 : 380;
    const pos = new Float32Array(starCount * 3);
    for (let i = 0; i < starCount; i++) {
      const th = Math.random() * Math.PI * 2;
      const ph = 0.18 + Math.random() * 1.15;
      pos[i * 3] = Math.cos(th) * Math.cos(ph) * 230;
      pos[i * 3 + 1] = Math.sin(ph) * 200 + 16;
      pos[i * 3 + 2] = Math.sin(th) * Math.cos(ph) * 230;
    }
    const sGeo = new THREE.BufferGeometry();
    sGeo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
    this.starsMat = new THREE.PointsMaterial({
      size: 2.0,
      map: this.glowTex,
      color: 0xfff5dc,
      transparent: true,
      opacity: 0.42,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
      fog: false,
    });
    this.skyGroup.add(new THREE.Points(sGeo, this.starsMat));

    // Soft Layered Drifting Parisian Clouds Overhead!
    const cloudCount = this.isMobile ? 12 : 20;
    for (let i = 0; i < cloudCount; i++) {
      const mat = new THREE.SpriteMaterial({
        map: this.cloudTex,
        color: 0xffd2a8,
        transparent: true,
        opacity: 0.56,
        depthWrite: false,
        fog: false,
      });
      const sp = new THREE.Sprite(mat);
      const ang = (i / cloudCount) * Math.PI * 2 + Math.random() * 0.25;
      const dist = 125 + (i % 3) * 32;
      const h = 36 + (i % 4) * 16;
      sp.position.set(Math.cos(ang) * dist, h, Math.sin(ang) * dist);
      const w = 52 + (i % 5) * 18;
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

    this.cloudSprites.forEach((c) => {
      c.sprite.material.color.setHex(p.cloudTint);
      c.sprite.material.opacity = p.cloudOpacity;
    });

    this.sunLight.color.setHex(p.sunColor);
    this.sunLight.intensity = p.sunIntensity;
    this.sunLight.position.copy(p.sunPos);
    this.hemiLight.color.setHex(p.hemiSky);
    this.hemiLight.groundColor.setHex(p.hemiGround);
    this.hemiLight.intensity = p.hemiIntensity;
    this.scene.fog.color.setHex(p.fogColor);
    this.scene.fog.density = p.fogDensity;
    this.renderer.toneMappingExposure = p.exposure;

    this.emissiveBuildingMats.forEach((m) => { m.emissiveIntensity = p.windowEmissive; });
    this.lampHalos.forEach((h) => { h.material.opacity = p.lampOpacity; });
    if (this.eiffelSearchlightMat) this.eiffelSearchlightMat.opacity = p.searchlightOpacity;

    this.updateEnvironmentReflections(p);
    if (this.callbacks.onTimeChange) this.callbacks.onTimeChange(mode, p.labelAr);
  }

  /* ==================== RUE DE RIVOLI BOULEVARD, HAUSSMANN BUILDINGS, CAFÉS & BOTANICAL TREES ==================== */
  buildParisRueDeRivoliAndCafes() {
    // Wet Reflective Parisian Cobblestone Avenue & Courtyard
    const cobbleMat = new THREE.MeshStandardMaterial({
      map: this.cobblePBR.map,
      bumpMap: this.cobblePBR.bumpMap,
      bumpScale: 0.08,
      roughnessMap: this.cobblePBR.roughnessMap,
      roughness: 0.85,
      metalness: 0.14,
    });
    const street = new THREE.Mesh(new THREE.PlaneGeometry(78, 108), cobbleMat);
    street.rotation.x = -Math.PI / 2;
    street.position.set(0, 0, 36);
    this.scene.add(street);

    // Subtle Royal Golden Promenade Wayfinding Carpet Line leading straight to the Louvre Pyramid
    const runner = new THREE.Mesh(
      new THREE.PlaneGeometry(3.0, 74),
      new THREE.MeshStandardMaterial({ color: 0x3b2416, roughness: 0.65, metalness: 0.08 })
    );
    runner.rotation.x = -Math.PI / 2;
    runner.position.set(0, 0.014, 34);
    this.scene.add(runner);
    [-1.56, 1.56].forEach((x) => {
      const trim = new THREE.Mesh(new THREE.PlaneGeometry(0.08, 74), this.mats.goldGlow);
      trim.rotation.x = -Math.PI / 2;
      trim.position.set(x, 0.018, 34);
      this.scene.add(trim);
    });

    // Raised Parisian Limestone Sidewalk Curbs + Granite Edge Stones
    [-10.8, 10.8].forEach((x) => {
      const curb = new THREE.Mesh(new THREE.BoxGeometry(7.8, 0.18, 56), this.mats.limestonePlain);
      curb.position.set(x, 0.09, 48);
      this.scene.add(curb);
    });

    // Authentic Multi-Story Haussmann Parisian Buildings with 3D Cornices, Balconies, Mansard Roofs & Café Terraces!
    const buildHaussmannBuilding = (x, z, rotY, hasCafe = true) => {
      const b = new THREE.Group();
      b.position.set(x, 0, z);
      b.rotation.y = rotY;

      const body = new THREE.Mesh(new THREE.BoxGeometry(15.2, 14.2, 8.2), this.mats.haussmann);
      body.position.y = 7.1;
      // 3D Protruding Limestone Cornice & Balcony Ledges for authentic shadow & relief!
      const corniceTop = new THREE.Mesh(new THREE.BoxGeometry(15.8, 0.45, 8.8), this.mats.limestonePlain);
      corniceTop.position.y = 14.25;
      const balconyLedge = new THREE.Mesh(new THREE.BoxGeometry(15.5, 0.24, 8.6), this.mats.limestonePlain);
      balconyLedge.position.y = 7.5;
      // Authentic Parisian Mansard Zinc Roof with Gilded Dormers!
      const roof = new THREE.Mesh(new THREE.BoxGeometry(15.0, 3.2, 7.2), this.mats.mansard);
      roof.position.y = 15.9;
      const roofCap = new THREE.Mesh(new THREE.BoxGeometry(15.2, 0.2, 7.4), this.mats.gold);
      roofCap.position.y = 17.55;
      b.add(body, corniceTop, balconyLedge, roof, roofCap);

      // Ground-Floor Parisian Café Awning + Outdoor Round Bistro Tables!
      if (hasCafe) {
        const awning = new THREE.Mesh(new THREE.BoxGeometry(13.6, 0.18, 2.3), this.mats.velvetRed);
        awning.position.set(0, 3.65, 5.1);
        awning.rotation.x = 0.26;
        const awningFringe = new THREE.Mesh(new THREE.BoxGeometry(13.6, 0.22, 0.08), this.mats.gold);
        awningFringe.position.set(0, 3.25, 6.18);
        b.add(awning, awningFringe);

        // 3 Parisian Sidewalk Bistro Tables with Marble Tops & Brass Pedestals
        [-4.0, 0, 4.0].forEach((tx) => {
          const tableTop = new THREE.Mesh(new THREE.CylinderGeometry(0.46, 0.46, 0.06, 14), this.mats.marble);
          tableTop.position.set(tx, 0.96, 5.35);
          const tableLeg = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.18, 0.78, 10), this.mats.ironDark);
          tableLeg.position.set(tx, 0.56, 5.35);
          b.add(tableTop, tableLeg);
        });
      }
      this.scene.add(b);
    };

    // Right side boulevard buildings + Left foreground building (keep left vista wide open for the Eiffel Tower!)
    [66, 50, 34].forEach((z) => buildHaussmannBuilding(18.2, z, -Math.PI / 2, true));
    [66, 50].forEach((z) => buildHaussmannBuilding(-18.2, z, Math.PI / 2, true));

    // Classic Cast-Iron Parisian Streetlamps + Realistic Multi-Branch Botanical Plane Trees!
    const poleGeo = new THREE.CylinderGeometry(0.065, 0.13, 4.4, 10);
    const baseGeo = new THREE.CylinderGeometry(0.18, 0.28, 0.75, 10);
    const lanternGlassGeo = new THREE.CylinderGeometry(0.24, 0.16, 0.52, 8);
    const lanternCapGeo = new THREE.ConeGeometry(0.32, 0.28, 8);

    const leafCardMat = new THREE.MeshStandardMaterial({
      map: this.foliageTex,
      alphaTest: 0.35,
      side: THREE.DoubleSide,
      roughness: 0.82,
    });
    const leafCardGeo = new THREE.PlaneGeometry(2.55, 2.55);

    const createBotanicalParisTree = (tx, tz) => {
      const tree = new THREE.Group();
      tree.position.set(tx, 0, tz);
      // Tapered gnarled bark trunk + 3 natural upward boughs
      const trunk = new THREE.Mesh(new THREE.CylinderGeometry(0.13, 0.22, 2.8, 8), this.mats.woodDark);
      trunk.position.y = 1.4;
      tree.add(trunk);
      [[0.38, 0.45], [-0.42, 0.3], [0.1, -0.45]].forEach(([bx, bz]) => {
        const bough = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.1, 1.65, 6), this.mats.woodDark);
        bough.position.set(bx * 0.65, 3.0, bz * 0.65);
        bough.rotation.set(bz * 0.85, 0, -bx * 0.85);
        tree.add(bough);
      });
      // Layered intersecting botanical leaf-cluster cards (photorealistic organic canopy silhouette!)
      const offsets = [
        [0, 3.85, 0, 0, 0],
        [0, 3.85, 0, 0, Math.PI / 2],
        [0, 3.9, 0, 0, Math.PI / 4],
        [0.65, 3.45, 0.45, 0.25, 0.6],
        [-0.65, 3.55, -0.4, -0.22, 1.9],
        [0.25, 4.45, -0.3, 0.35, 1.1],
      ];
      offsets.forEach(([lx, ly, lz, rx, ry]) => {
        const card = new THREE.Mesh(leafCardGeo, leafCardMat);
        card.position.set(lx, ly, lz);
        card.rotation.set(rx, ry, 0);
        tree.add(card);
      });
      this.scene.add(tree);
    };

    let idx = 0;
    for (let z = 66; z >= 20; z -= 11) {
      [-7.2, 7.2].forEach((x) => {
        const lamp = new THREE.Group();
        lamp.position.set(x, 0, z);
        const base = new THREE.Mesh(baseGeo, this.mats.ironDark);
        base.position.y = 0.38;
        const pole = new THREE.Mesh(poleGeo, this.mats.ironDark);
        pole.position.y = 2.25;
        const glass = new THREE.Mesh(lanternGlassGeo, this.mats.lampGlow);
        glass.position.y = 4.65;
        const cap = new THREE.Mesh(lanternCapGeo, this.mats.ironDark);
        cap.position.y = 5.02;
        const halo = new THREE.Sprite(
          new THREE.SpriteMaterial({ map: this.glowTex, color: 0xffd27a, transparent: true, opacity: 0.78, blending: THREE.AdditiveBlending, depthWrite: false })
        );
        halo.scale.set(2.9, 2.9, 1);
        halo.position.y = 4.65;
        this.lampHalos.push(halo);
        lamp.add(base, pole, glass, cap, halo);
        this.scene.add(lamp);

        // Place realistic leafy plane trees along the avenue (leave left Eiffel view crystal clear past z=40!)
        if (idx % 2 === 0 && z > 24 && !(x < 0 && z < 44)) {
          createBotanicalParisTree(x + Math.sign(x) * 2.3, z - 5.2);
        }
        idx++;
      });
    }
  }

  /* ==================== ARCHITECTURAL CURVED PARABOLIC EIFFEL TOWER (FILIGREE LATTICE + NIGHT SEARCHLIGHT!) ==================== */
  buildArchitecturalEiffelTower() {
    const tower = new THREE.Group();
    // Framed majestically on the left Parisian skyline — FULL tower from lower arches to top golden beacon visible cleanly beside Richelieu wing!
    tower.position.set(-37, 0, -14);
    tower.scale.setScalar(0.84);

    // Exact mathematical Eiffel Tower parabolic curve: r(y) sweeps gracefully from 6.8m base to 0.45m top gallery!
    const profile = [
      { y: 0.0, r: 6.8 },
      { y: 5.5, r: 4.8 },
      { y: 11.0, r: 3.55 }, // 1st Observation Floor
      { y: 16.5, r: 2.55 },
      { y: 21.5, r: 1.85 }, // 2nd Observation Floor
      { y: 29.0, r: 1.18 },
      { y: 38.0, r: 0.62 }, // 3rd Top Observation Deck
    ];

    const corners = [[-1, -1], [1, -1], [1, 1], [-1, 1]];
    const sideDirs = [
      { ax: 0, az: 1, ry: 0 },
      { ax: 0, az: -1, ry: Math.PI },
      { ax: 1, az: 0, ry: Math.PI / 2 },
      { ax: -1, az: 0, ry: -Math.PI / 2 },
    ];

    for (let s = 0; s < profile.length - 1; s++) {
      const a = profile[s];
      const b = profile[s + 1];
      const dy = b.y - a.y;
      const thick = Math.max(0.18, 0.52 - s * 0.06);

      // 4 Curved Structural Corner Legs
      corners.forEach(([sx, sz]) => {
        const p0 = new THREE.Vector3(sx * a.r, a.y, sz * a.r);
        const p1 = new THREE.Vector3(sx * b.r, b.y, sz * b.r);
        const leg = new THREE.Mesh(new THREE.BoxGeometry(thick, p0.distanceTo(p1), thick), this.mats.eiffelSteel);
        leg.position.copy(p0).lerp(p1, 0.5);
        leg.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), p1.clone().sub(p0).normalize());
        tower.add(leg);
      });

      // 4 Transparent Alpha-Cutout Iron Filigree Lattice Panels (sky, clouds & sunset shine RIGHT through!)
      if (s >= 1) {
        const wBot = a.r * 2;
        const wTop = b.r * 2;
        const slopeLen = Math.hypot(dy, a.r - b.r);
        const tilt = Math.atan2(a.r - b.r, dy);
        // Trapezoidal BufferGeometry per face so lacy ironwork tapers seamlessly along Eiffel's curve!
        const trapGeo = new THREE.BufferGeometry();
        const hwB = wBot * 0.5;
        const hwT = wTop * 0.5;
        const hh = slopeLen * 0.5;
        trapGeo.setAttribute('position', new THREE.Float32BufferAttribute([
          -hwB, -hh, 0,  hwB, -hh, 0,  hwT, hh, 0,
          -hwB, -hh, 0,  hwT, hh, 0,  -hwT, hh, 0,
        ], 3));
        trapGeo.setAttribute('uv', new THREE.Float32BufferAttribute([
          0, 0,  1, 0,  1, 1,
          0, 0,  1, 1,  0, 1,
        ], 2));
        trapGeo.computeVertexNormals();

        sideDirs.forEach((sd) => {
          const panel = new THREE.Mesh(trapGeo, this.mats.eiffelLattice);
          const midR = (a.r + b.r) * 0.5;
          panel.position.set(sd.ax * midR, (a.y + b.y) * 0.5, sd.az * midR);
          panel.rotation.order = 'YXZ';
          panel.rotation.y = sd.ry;
          panel.rotation.x = -tilt;
          tower.add(panel);
        });
      }
    }

    // Iconic Ornate Semicircular Iron Arches at the Base (All 4 Sides!)
    for (let i = 0; i < 4; i++) {
      const ang = (i * Math.PI) / 2;
      const arch = new THREE.Mesh(new THREE.TorusGeometry(4.4, 0.24, 8, 28, Math.PI), this.mats.eiffelSteel);
      arch.position.set(Math.sin(ang) * 5.4, 3.8, Math.cos(ang) * 5.4);
      arch.rotation.y = ang;
      const archRim = new THREE.Mesh(new THREE.TorusGeometry(4.12, 0.08, 6, 24, Math.PI), this.mats.gold);
      archRim.position.copy(arch.position);
      archRim.rotation.y = ang;
      tower.add(arch, archRim);
    }

    // 1st, 2nd & 3rd Observation Decks with Golden Balustrade Lighting!
    [
      { y: 11.0, w: 7.9, h: 1.05 },
      { y: 21.5, w: 4.3, h: 0.85 },
      { y: 38.0, w: 1.75, h: 0.9 },
    ].forEach((d) => {
      const deck = new THREE.Mesh(new THREE.BoxGeometry(d.w, d.h, d.w), this.mats.eiffelSteel);
      deck.position.y = d.y;
      const cornice = new THREE.Mesh(new THREE.BoxGeometry(d.w + 0.22, 0.16, d.w + 0.22), this.mats.goldGlow);
      cornice.position.y = d.y + d.h * 0.25;
      tower.add(deck, cornice);
    });

    // Top Cupola, Antenna Spire & Rotating Parisian Lighthouse Searchlight Beam!
    const cupola = new THREE.Mesh(new THREE.CylinderGeometry(0.45, 0.72, 1.3, 12), this.mats.eiffelSteel);
    cupola.position.y = 39.1;
    const spire = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.18, 4.4, 10), this.mats.gold);
    spire.position.y = 41.9;
    const beacon = new THREE.Sprite(
      new THREE.SpriteMaterial({ map: this.glowTex, color: 0xffe69c, transparent: true, opacity: 0.96, blending: THREE.AdditiveBlending, depthWrite: false })
    );
    beacon.scale.set(6.2, 6.2, 1);
    beacon.position.y = 44.1;
    this.eiffelBeacon = beacon;

    // Dual Rotating Paris Night Volumetric Searchlight Beams!
    this.eiffelSearchlightRig = new THREE.Group();
    this.eiffelSearchlightRig.position.y = 39.4;
    this.eiffelSearchlightMat = new THREE.MeshBasicMaterial({
      map: this.beamTex,
      color: 0xfff0c4,
      transparent: true,
      opacity: 0.0,
      blending: THREE.AdditiveBlending,
      side: THREE.DoubleSide,
      depthWrite: false,
    });
    [-1, 1].forEach((dir) => {
      const beam = new THREE.Mesh(new THREE.ConeGeometry(4.2, 42, 14, 1, true), this.eiffelSearchlightMat);
      beam.rotation.z = dir * (Math.PI * 0.44);
      beam.position.set(dir * 21, -2.5, 0);
      this.eiffelSearchlightRig.add(beam);
    });

    tower.add(cupola, spire, beacon, this.eiffelSearchlightRig);

    // Eiffel Tower Signature Sparkling Champagne Diamonds!
    for (let i = 0; i < 24; i++) {
      const f = Math.random();
      const y = 5 + f * 33;
      const r = THREE.MathUtils.lerp(4.8, 0.55, f);
      const a = Math.random() * Math.PI * 2;
      const sp = new THREE.Sprite(
        new THREE.SpriteMaterial({ map: this.glowTex, color: 0xfff6d2, transparent: true, opacity: 0.85, blending: THREE.AdditiveBlending, depthWrite: false })
      );
      sp.position.set(Math.cos(a) * r, y, Math.sin(a) * r);
      sp.scale.set(1.15, 1.15, 1);
      tower.add(sp);
      this.eiffelSparkles.push({ sprite: sp, phase: Math.random() * Math.PI * 2, speed: 3.5 + Math.random() * 4.5 });
    }

    this.scene.add(tower);
  }

  /* ==================== AUTHENTIC U-SHAPED MUSÉE DU LOUVRE COUR NAPOLÉON & I.M. PEI PYRAMIDS ==================== */
  buildAuthenticLouvreCourNapoleonAndPyramids() {
    // A. Shimmering Cour Napoléon Triangular/Rectangular Mirror Reflection Pools + Animated Fountain Rings!
    [-10.2, 10.2].forEach((x) => {
      const poolBorder = new THREE.Mesh(new THREE.BoxGeometry(7.8, 0.28, 14.2), this.mats.marble);
      poolBorder.position.set(x, 0.14, 7.5);
      const water = new THREE.Mesh(new THREE.PlaneGeometry(7.1, 13.5), this.mats.waterPool);
      water.rotation.x = -Math.PI / 2;
      water.position.set(x, 0.29, 7.5);
      this.scene.add(poolBorder, water);

      // Animated golden water-ripple fountain jets in each pool!
      [-3.4, 3.4].forEach((fz, fi) => {
        const ring = new THREE.Mesh(
          new THREE.RingGeometry(0.25, 0.42, 24),
          new THREE.MeshBasicMaterial({ color: 0xfff1cc, transparent: true, opacity: 0.48, side: THREE.DoubleSide })
        );
        ring.rotation.x = -Math.PI / 2;
        ring.position.set(x, 0.305, 7.5 + fz);
        this.scene.add(ring);
        this.fountainRings.push({ mesh: ring, phase: fi * 1.8 + (x > 0 ? 0.9 : 0) });
      });

      // Flanking Iconic Small Glass Mini-Pyramids (just like the real Cour Napoléon!)
      const miniPyr = new THREE.Group();
      miniPyr.position.set(x, 0.3, 12.2);
      const mg = new THREE.Mesh(new THREE.ConeGeometry(1.75, 1.8, 4, 1, true), this.mats.glassPyramid);
      mg.rotation.y = Math.PI / 4;
      mg.position.y = 0.9;
      const mw = new THREE.Mesh(
        new THREE.ConeGeometry(1.78, 1.82, 4, 3, true),
        new THREE.MeshStandardMaterial({ color: 0xdcc07a, metalness: 0.85, roughness: 0.22, wireframe: true })
      );
      mw.rotation.y = Math.PI / 4;
      mw.position.y = 0.91;
      miniPyr.add(mg, mw);
      this.scene.add(miniPyr);
    });

    // B. ICONIC I.M. PEI ILLUMINATED GLASS LOUVRE PYRAMID (Centerpiece at z = +7!)
    const pyrGroup = new THREE.Group();
    pyrGroup.position.set(0, 0, 7);
    const pyrGlass = new THREE.Mesh(new THREE.ConeGeometry(6.3, 6.4, 4, 1, true), this.mats.glassPyramid);
    pyrGlass.rotation.y = Math.PI / 4;
    pyrGlass.position.y = 3.2;
    // Crisp stainless-steel diamond lattice structure
    const pyrFrame = new THREE.Mesh(
      new THREE.ConeGeometry(6.35, 6.45, 4, 9, true),
      new THREE.MeshStandardMaterial({ color: 0xe6cb82, metalness: 0.9, roughness: 0.18, wireframe: true })
    );
    pyrFrame.rotation.y = Math.PI / 4;
    pyrFrame.position.y = 3.22;
    // Marble plinth border around pyramid base (open walkway front & back!)
    const pyrGlow = new THREE.Sprite(
      new THREE.SpriteMaterial({ map: this.glowTex, color: 0xffd584, transparent: true, opacity: 0.72, blending: THREE.AdditiveBlending, depthWrite: false })
    );
    pyrGlow.scale.set(9.4, 9.4, 1);
    pyrGlow.position.y = 2.6;
    pyrGroup.add(pyrGlass, pyrFrame, pyrGlow);
    this.scene.add(pyrGroup);

    // C. AUTHENTIC U-SHAPED MUSÉE DU LOUVRE PALACE (Pavillon Sully Center + Richelieu Left + Denon Right Wings!)
    const facade = new THREE.Group();
    facade.position.set(0, 0, -7);

    // Left & Right Grand Renaissance Palace Wings of Pavillon Sully
    [-14.5, 14.5].forEach((x) => {
      const wing = new THREE.Mesh(new THREE.BoxGeometry(19, 13.8, 3.6), this.mats.louvrePalace);
      wing.position.set(x, 6.9, 0);
      const wingRoof = new THREE.Mesh(new THREE.BoxGeometry(19.2, 3.2, 3.1), this.mats.mansard);
      wingRoof.position.set(x, 15.4, -0.1);
      facade.add(wing, wingRoof);

      // 3D Sculpted Paired Limestone Corinthian Columns along the Louvre Palace Facade!
      for (let cx = -7.5; cx <= 7.5; cx += 5.0) {
        const col = new THREE.Mesh(new THREE.CylinderGeometry(0.28, 0.32, 12.8, 12), this.mats.marble);
        col.position.set(x + cx, 6.6, 1.9);
        facade.add(col);
      }
    });

    // Central Pavillon Sully (Wide Open Grand Entrance Archway x=-5..+5 + Sculpted Triangular Classical Pediment + Iconic Pavilion Dome!)
    const topEntablature = new THREE.Mesh(new THREE.BoxGeometry(11.4, 6.8, 4.0), this.mats.louvrePalace);
    topEntablature.position.set(0, 10.4, 0.15);
    const goldCornice = new THREE.Mesh(new THREE.BoxGeometry(49, 0.42, 4.2), this.mats.gold);
    goldCornice.position.set(0, 13.9, 0.15);

    // Authentic Renaissance Triangular Pediment over the Central Arch!
    const pedShape = new THREE.Shape();
    pedShape.moveTo(-6.0, 0); pedShape.lineTo(0, 2.55); pedShape.lineTo(6.0, 0); pedShape.closePath();
    const pedGeo = new THREE.ExtrudeGeometry(pedShape, { depth: 0.65, bevelEnabled: true, bevelThickness: 0.08, bevelSize: 0.08, bevelSegments: 2 });
    const pediment = new THREE.Mesh(pedGeo, this.mats.marble);
    pediment.position.set(0, 13.95, 1.85);

    // Grand Symmetrical Mansard Central Pavilion Dome (Pavillon de l'Horloge!) — rotate geometry BEFORE scaling so zero shear!
    const pavDomeGeo = new THREE.CylinderGeometry(3.4, 5.4, 4.8, 4);
    pavDomeGeo.rotateY(Math.PI / 4);
    const pavDome = new THREE.Mesh(pavDomeGeo, this.mats.mansard);
    pavDome.scale.set(1.48, 1, 0.58);
    pavDome.position.set(0, 16.4, 0);
    const pavCrown = new THREE.Mesh(new THREE.BoxGeometry(7.2, 0.25, 2.2), this.mats.goldGlow);
    pavCrown.position.set(0, 18.88, 0);

    // Gilded Entrance Archway Trim + Illuminated Bronze Museum Plaque
    const archTrim = new THREE.Mesh(new THREE.TorusGeometry(4.75, 0.24, 12, 44, Math.PI), this.mats.goldGlow);
    archTrim.position.set(0, 3.2, 2.15);
    const signPlaque = new THREE.Mesh(
      new THREE.PlaneGeometry(8.8, 1.75),
      new THREE.MeshBasicMaterial({ map: createLouvreSignTexture() })
    );
    signPlaque.position.set(0, 9.7, 2.24);

    facade.add(topEntablature, goldCornice, pediment, pavDome, pavCrown, archTrim, signPlaque);

    // Courtyard Embracing Side Wings (Richelieu Left at x=-23 & Denon Right at x=+23 forming true Cour Napoléon U-shape!)
    [-22.5, 22.5].forEach((wx) => {
      const sideWing = new THREE.Mesh(new THREE.BoxGeometry(3.6, 13.6, 26), this.mats.louvrePalace);
      sideWing.position.set(wx, 6.8, 13);
      const sideRoof = new THREE.Mesh(new THREE.BoxGeometry(3.2, 3.0, 26), this.mats.mansard);
      sideRoof.position.set(wx, 15.1, 13);
      facade.add(sideWing, sideRoof);
    });

    this.scene.add(facade);
  }

  /* ==================== INSIDE THE LOUVRE GRANDE GALERIE (z = -7 .. -83) ==================== */
  buildLouvreGrandGalleryInterior() {
    // Rich Glossy Oiled Oak Chevron Parquet reflecting skylight & paintings!
    const parquetMat = new THREE.MeshStandardMaterial({
      map: this.parquetPBR.map,
      bumpMap: this.parquetPBR.bumpMap,
      bumpScale: 0.04,
      roughnessMap: this.parquetPBR.roughnessMap,
      roughness: 0.58,
      metalness: 0.08,
    });
    const floor = new THREE.Mesh(new THREE.PlaneGeometry(18.0, 78), parquetMat);
    floor.rotation.x = -Math.PI / 2;
    floor.position.set(0, 0, -45);
    this.scene.add(floor);

    // Royal Crimson Museum Carpet Runner with Gold Borders
    const carpet = new THREE.Mesh(new THREE.PlaneGeometry(3.2, 78), this.mats.velvetRed);
    carpet.rotation.x = -Math.PI / 2;
    carpet.position.set(0, 0.012, -45);
    this.scene.add(carpet);
    [-1.66, 1.66].forEach((x) => {
      const b = new THREE.Mesh(new THREE.PlaneGeometry(0.08, 78), this.mats.gold);
      b.rotation.x = -Math.PI / 2;
      b.position.set(x, 0.016, -45);
      this.scene.add(b);
    });

    // Molded Boiserie Classical Louvre Gallery Walls
    const galleryWallMat = new THREE.MeshStandardMaterial({
      map: this.wallPanelPBR.map,
      bumpMap: this.wallPanelPBR.bumpMap,
      bumpScale: 0.09,
      roughness: 0.66,
      metalness: 0.04,
    });
    const wallGeo = new THREE.BoxGeometry(0.8, 9.8, 78);
    [-8.8, 8.8].forEach((x) => {
      const wall = new THREE.Mesh(wallGeo, galleryWallMat);
      wall.position.set(x, 4.9, -45);
      const cornice = new THREE.Mesh(new THREE.BoxGeometry(1.15, 0.4, 78), this.mats.gold);
      cornice.position.set(x, 9.45, -45);
      this.scene.add(wall, cornice);
    });

    // Vaulted Coffered Ceiling + Central Iron-and-Glass Skylight Strip (Iconic Louvre Grande Galerie Ceiling!)
    [-6.0, 6.0].forEach((x) => {
      const ceilSide = new THREE.Mesh(new THREE.BoxGeometry(6.4, 0.45, 78), this.mats.marble);
      ceilSide.position.set(x, 9.7, -45);
      this.scene.add(ceilSide);
    });
    const skylight = new THREE.Mesh(
      new THREE.PlaneGeometry(5.6, 78),
      new THREE.MeshBasicMaterial({ color: 0xffe6b3, transparent: true, opacity: 0.46, side: THREE.DoubleSide })
    );
    skylight.rotation.x = Math.PI / 2;
    skylight.position.set(0, 9.85, -45);
    this.scene.add(skylight);

    // Instanced Carrara Marble Corinthian Columns + Gold Capitals (1 ultra-fast GPU draw call!)
    const colPositions = [];
    for (let z = -12; z >= -78; z -= 9.5) colPositions.push([-7.5, z], [7.5, z]);
    const shaftMesh = new THREE.InstancedMesh(new THREE.CylinderGeometry(0.32, 0.38, 8.8, 16), this.mats.marble, colPositions.length);
    const capMesh = new THREE.InstancedMesh(new THREE.BoxGeometry(1.08, 0.46, 1.08), this.mats.gold, colPositions.length);
    const baseMesh = new THREE.InstancedMesh(new THREE.BoxGeometry(1.08, 0.46, 1.08), this.mats.marble, colPositions.length);
    const dummy = new THREE.Object3D();
    colPositions.forEach(([x, z], i) => {
      dummy.position.set(x, 4.6, z); dummy.updateMatrix(); shaftMesh.setMatrixAt(i, dummy.matrix);
      dummy.position.set(x, 9.15, z); dummy.updateMatrix(); capMesh.setMatrixAt(i, dummy.matrix);
      dummy.position.set(x, 0.23, z); dummy.updateMatrix(); baseMesh.setMatrixAt(i, dummy.matrix);
    });
    this.scene.add(shaftMesh, capMesh, baseMesh);

    // Authentic Louvre Oak & Leather Gallery Benches down the Centerline (between Artifact Stations!)
    [-27, -41, -55, -68].forEach((z) => {
      const bench = new THREE.Group();
      bench.position.set(0, 0, z);
      const seat = new THREE.Mesh(new THREE.BoxGeometry(2.4, 0.14, 0.78), this.mats.velvetRed);
      seat.position.y = 0.52;
      const trim = new THREE.Mesh(new THREE.BoxGeometry(2.46, 0.08, 0.84), this.mats.woodDark);
      trim.position.y = 0.44;
      [-0.95, 0.95].forEach((lx) => {
        const leg = new THREE.Mesh(new THREE.BoxGeometry(0.14, 0.42, 0.68), this.mats.woodDark);
        leg.position.set(lx, 0.21, 0);
        bench.add(leg);
      });
      bench.add(seat, trim);
      this.scene.add(bench);
    });

    // Diagonal Volumetric Sunset Sunbeams pouring from the Louvre Skylight!
    [-19, -33, -47, -61, -75].forEach((z) => {
      const beam = new THREE.Mesh(
        new THREE.PlaneGeometry(4.6, 10.8),
        new THREE.MeshBasicMaterial({ map: this.beamTex, transparent: true, opacity: 0.28, blending: THREE.AdditiveBlending, side: THREE.DoubleSide, depthWrite: false })
      );
      beam.position.set(0, 5.0, z);
      beam.rotation.z = 0.14;
      this.scene.add(beam);
    });
  }

  /* ==================== 4 INTERACTIVE MASTERPIECES, BAROQUE FRAMES, VELVET STANCHIONS & PARCHMENTS ==================== */
  createFramedGalleryPainting(imagePath, w = 3.7, h = 2.75) {
    const group = new THREE.Group();
    const border = 0.22;
    const outerFrame = new THREE.Mesh(new THREE.BoxGeometry(w + border * 2, h + border * 2, 0.18), this.mats.gold);
    const innerLip = new THREE.Mesh(new THREE.BoxGeometry(w + 0.12, h + 0.12, 0.22), this.mats.woodDark);
    const tex = this.texLoader.load(imagePath);
    tex.colorSpace = THREE.SRGBColorSpace;
    const art = new THREE.Mesh(new THREE.PlaneGeometry(w, h), new THREE.MeshStandardMaterial({ map: tex, roughness: 0.42 }));
    art.position.z = 0.115;

    // Dedicated Brass Museum Picture Lamp above each Masterpiece!
    const lampArm = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.08, 0.65), this.mats.gold);
    lampArm.position.set(0, h * 0.5 + 0.34, 0.35);
    const lampHood = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.08, 1.35, 10), this.mats.gold);
    lampHood.rotation.z = Math.PI / 2;
    lampHood.position.set(0, h * 0.5 + 0.34, 0.66);
    const lampGlow = new THREE.Sprite(
      new THREE.SpriteMaterial({ map: this.glowTex, color: 0xffe4a0, transparent: true, opacity: 0.65, blending: THREE.AdditiveBlending, depthWrite: false })
    );
    lampGlow.scale.set(2.2, 1.2, 1);
    lampGlow.position.set(0, h * 0.5 + 0.15, 0.58);

    group.add(outerFrame, innerLip, art, lampArm, lampHood, lampGlow);
    return group;
  }

  buildFourInteractiveArtifacts() {
    const chapters = this.config.chapters || [];
    const stations = [
      { id: 'childhood', x: -4.5, z: -20, wallX: -8.24, rotY: Math.PI / 2, num: '01', shortAr: 'البدايات', ch: chapters[0] },
      { id: 'passion', x: 4.5, z: -34, wallX: 8.24, rotY: -Math.PI / 2, num: '02', shortAr: 'الشغف', ch: chapters[1] },
      { id: 'thanaweya', x: -4.5, z: -48, wallX: -8.24, rotY: Math.PI / 2, num: '03', shortAr: 'تالتة ثانوي', ch: chapters[2] },
      { id: 'fine-arts', x: 4.5, z: -62, wallX: 8.24, rotY: -Math.PI / 2, num: '04', shortAr: 'فنون جميلة', ch: chapters[3] },
    ];

    stations.forEach((st, idx) => {
      const grp = new THREE.Group();
      grp.position.set(st.x, 0, st.z);

      // Carrara Marble Museum Pedestal + Brass Guard Stanchions & Velvet Ropes!
      const pedBase = new THREE.Mesh(new THREE.BoxGeometry(1.5, 0.18, 1.5), this.mats.gold);
      pedBase.position.y = 0.09;
      const pedCol = new THREE.Mesh(new THREE.BoxGeometry(1.16, 1.16, 1.16), this.mats.marble);
      pedCol.position.y = 0.74;
      const pedTop = new THREE.Mesh(new THREE.BoxGeometry(1.34, 0.12, 1.34), this.mats.gold);
      pedTop.position.y = 1.36;
      grp.add(pedBase, pedCol, pedTop);

      // Authentic Louvre Brass Stanchions (Potelets) & Draped Burgundy Velvet Rope around Pedestal!
      const postCorners = [[-1.18, 1.18], [1.18, 1.18], [1.18, -1.18], [-1.18, -1.18]];
      postCorners.forEach(([px, pz]) => {
        const post = new THREE.Mesh(new THREE.CylinderGeometry(0.032, 0.035, 0.88, 8), this.mats.gold);
        post.position.set(px, 0.44, pz);
        const knob = new THREE.Mesh(new THREE.SphereGeometry(0.055, 10, 8), this.mats.goldGlow);
        knob.position.set(px, 0.9, pz);
        grp.add(post, knob);
      });
      const frontRope = new THREE.Mesh(new THREE.CylinderGeometry(0.022, 0.022, 2.36, 8), this.mats.velvetRed);
      frontRope.rotation.z = Math.PI / 2;
      frontRope.position.set(0, 0.76, 1.18);
      grp.add(frontRope);

      // Glowing Floor Discovery Halo
      const ring = new THREE.Mesh(
        new THREE.RingGeometry(1.32, 1.44, 36),
        new THREE.MeshBasicMaterial({ color: 0xf7d882, transparent: true, opacity: 0.56, side: THREE.DoubleSide, blending: THREE.AdditiveBlending, depthWrite: false })
      );
      ring.rotation.x = -Math.PI / 2;
      ring.position.y = 0.022;
      grp.add(ring);

      // Bespoke 3D Sculpted Centerpiece Artifact
      const artCenter = new THREE.Group();
      artCenter.position.y = 2.08;
      if (idx === 0) {
        artCenter.add(new THREE.Mesh(new THREE.OctahedronGeometry(0.32, 0), this.mats.goldGlow));
        [0xf0c05a, 0xd97854, 0x6f98bd, 0x86ad7e, 0xe095a4].forEach((hex, pi) => {
          const pen = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.04, 0.86, 6), new THREE.MeshStandardMaterial({ color: hex, roughness: 0.38 }));
          const a = (pi / 5) * Math.PI * 2;
          pen.position.set(Math.cos(a) * 0.46, 0, Math.sin(a) * 0.46);
          pen.rotation.set(0.35, a, 0.3);
          artCenter.add(pen);
        });
      } else if (idx === 1) {
        artCenter.add(
          new THREE.Mesh(new THREE.IcosahedronGeometry(0.54, 0), new THREE.MeshStandardMaterial({ color: 0xf5d076, emissive: 0x9e6f1e, emissiveIntensity: 0.4, metalness: 0.85, roughness: 0.2, wireframe: true })),
          new THREE.Mesh(new THREE.OctahedronGeometry(0.28, 0), this.mats.marble)
        );
      } else if (idx === 2) {
        const glassMat = new THREE.MeshPhysicalMaterial({ color: 0xffe6a8, transparent: true, opacity: 0.5, roughness: 0.1, metalness: 0.2, clearcoat: 1 });
        const topC = new THREE.Mesh(new THREE.ConeGeometry(0.34, 0.48, 18), glassMat); topC.position.y = 0.26; topC.rotation.x = Math.PI;
        const botC = new THREE.Mesh(new THREE.ConeGeometry(0.34, 0.48, 18), glassMat); botC.position.y = -0.26;
        const cap1 = new THREE.Mesh(new THREE.CylinderGeometry(0.4, 0.4, 0.06, 20), this.mats.goldGlow); cap1.position.y = 0.52;
        const cap2 = cap1.clone(); cap2.position.y = -0.52;
        artCenter.add(topC, botC, cap1, cap2);
      } else {
        artCenter.add(
          new THREE.Mesh(new THREE.TorusKnotGeometry(0.34, 0.1, 64, 12, 2, 3), this.mats.marble),
          new THREE.Mesh(new THREE.TorusGeometry(0.58, 0.02, 8, 48), this.mats.goldGlow)
        );
      }
      grp.add(artCenter);
      this.floatingProps.push({ mesh: artCenter, baseY: 2.08, speed: 1.2 + idx * 0.2 });

      // Floating Wax-Sealed Golden Parchment ("ورقة التحفة")
      const parchment = new THREE.Mesh(
        new THREE.PlaneGeometry(0.76, 1.0),
        new THREE.MeshBasicMaterial({ map: createParchmentTexture(`التحفة ${st.num}`, st.shortAr), side: THREE.DoubleSide })
      );
      parchment.position.set(st.x < 0 ? 0.96 : -0.96, 1.58, 0.56);
      parchment.rotation.y = st.x < 0 ? 0.42 : -0.42;
      grp.add(parchment);
      this.parchments.push({ mesh: parchment, baseY: 1.58, phase: idx * 1.4 });

      // Grand Framed Louvre Wall Masterpiece + Picture Light
      const wallArt = this.createFramedGalleryPainting(st.ch?.image || './assets/art/chapter1-childhood.jpg');
      wallArt.position.set(st.wallX, 3.7, st.z);
      wallArt.rotation.y = st.rotY;
      this.scene.add(wallArt);

      // Raycast Hitbox
      const hitbox = new THREE.Mesh(new THREE.BoxGeometry(2.9, 3.5, 2.7), new THREE.MeshBasicMaterial({ visible: false }));
      hitbox.position.y = 1.7;
      hitbox.userData.interactId = st.id;
      grp.add(hitbox);

      this.interactables.push({
        id: st.id,
        titleAr: st.ch?.titleAr || st.shortAr,
        badgeAr: `📜 اضغط لفتح التحفة ${st.num}: ${st.shortAr}`,
        mesh: hitbox,
        worldPos: new THREE.Vector3(st.x, 1.5, st.z),
        radius: 7.5,
      });

      this.scene.add(grp);
    });
  }

  /* ==================== ROYAL FAMILY TREASURE BOX & GOLDEN MANIFESTO STELE ==================== */
  buildRoyalFamilyVaultAndManifesto() {
    // A. Royal 3D Family Treasure Box (Live Firebase Cloud Vault)
    const vaultGrp = new THREE.Group();
    vaultGrp.position.set(-4.0, 0, -75);

    const ped = new THREE.Mesh(new THREE.BoxGeometry(1.85, 1.05, 1.42), this.mats.marble); ped.position.y = 0.525;
    const cloth = new THREE.Mesh(new THREE.BoxGeometry(1.92, 0.14, 1.48), this.mats.velvetRed); cloth.position.y = 1.06;
    const boxBody = new THREE.Mesh(new THREE.BoxGeometry(1.26, 0.62, 0.86), this.mats.woodDark); boxBody.position.y = 1.42;
    const boxRim = new THREE.Mesh(new THREE.BoxGeometry(1.32, 0.1, 0.92), this.mats.goldGlow); boxRim.position.y = 1.72;
    const boxLid = new THREE.Mesh(new THREE.CylinderGeometry(0.43, 0.43, 1.26, 16, 1, false, 0, Math.PI), this.mats.gold);
    boxLid.rotation.z = Math.PI / 2; boxLid.position.y = 1.74;

    const envOrbit = new THREE.Group();
    envOrbit.position.y = 2.48;
    for (let i = 0; i < 4; i++) {
      const env = new THREE.Mesh(new THREE.BoxGeometry(0.35, 0.22, 0.04), this.mats.goldGlow);
      const a = (i / 4) * Math.PI * 2;
      env.position.set(Math.cos(a) * 0.64, Math.sin(i * 1.4) * 0.12, Math.sin(a) * 0.64);
      env.rotation.y = -a;
      envOrbit.add(env);
    }
    this.floatingProps.push({ mesh: envOrbit, baseY: 2.48, speed: 1.5 });

    const vRing = new THREE.Mesh(
      new THREE.RingGeometry(1.35, 1.48, 36),
      new THREE.MeshBasicMaterial({ color: 0xffd87a, transparent: true, opacity: 0.72, side: THREE.DoubleSide, blending: THREE.AdditiveBlending, depthWrite: false })
    );
    vRing.rotation.x = -Math.PI / 2; vRing.position.y = 0.022;
    const vHit = new THREE.Mesh(new THREE.BoxGeometry(2.7, 3.2, 2.5), new THREE.MeshBasicMaterial({ visible: false }));
    vHit.position.y = 1.6; vHit.userData.interactId = 'vault';

    vaultGrp.add(ped, cloth, boxBody, boxRim, boxLid, envOrbit, vRing, vHit);
    this.scene.add(vaultGrp);

    this.interactables.push({
      id: 'vault',
      titleAr: 'صندوق رسائل العائلة ليمنى',
      badgeAr: '💌 اضغط لفتح صندوق رسائل العائلة السحابي',
      mesh: vHit,
      worldPos: new THREE.Vector3(-4.0, 1.6, -75),
      radius: 7.5,
    });

    // B. Golden Manifesto Monument ("★ الرسالة الأهم")
    const manGrp = new THREE.Group();
    manGrp.position.set(4.0, 0, -75);
    const mPed = new THREE.Mesh(new THREE.BoxGeometry(1.9, 0.5, 1.12), this.mats.marble); mPed.position.y = 0.25;
    const stele = new THREE.Mesh(new THREE.BoxGeometry(1.56, 2.62, 0.28), this.mats.marble); stele.position.y = 1.8;
    const steleFrame = new THREE.Mesh(new THREE.BoxGeometry(1.7, 2.75, 0.2), this.mats.goldGlow); steleFrame.position.y = 1.8;
    const manTex = createParchmentTexture('الرسالة الأهم ★', 'ثانوية عامة البداية');
    const manFace = new THREE.Mesh(new THREE.PlaneGeometry(1.4, 2.28), new THREE.MeshBasicMaterial({ map: manTex }));
    manFace.position.set(0, 1.8, 0.155);
    const manFaceBack = manFace.clone(); manFaceBack.position.z = -0.155; manFaceBack.rotation.y = Math.PI;
    const mHit = new THREE.Mesh(new THREE.BoxGeometry(2.7, 3.4, 2.3), new THREE.MeshBasicMaterial({ visible: false }));
    mHit.position.y = 1.7; mHit.userData.interactId = 'manifesto';

    manGrp.add(mPed, steleFrame, stele, manFace, manFaceBack, vRing.clone(), mHit);
    this.scene.add(manGrp);

    this.interactables.push({
      id: 'manifesto',
      titleAr: 'الرسالة الأهم في ختام الرحلة',
      badgeAr: '★ اضغط لقراءة الرسالة الأهم وكبسولة الطمأنينة',
      mesh: mHit,
      worldPos: new THREE.Vector3(4.0, 1.7, -75),
      radius: 7.5,
    });
  }

  /* ==================== GRAND LOUVRE ROTUNDA & REALISTIC 2-TIER 3D CAKE ("1" & "9") ==================== */
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
    s.lineTo(-0.22, 0.15); s.closePath();
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
    wick.position.y = 0.04; holder.add(wick);

    const fGrp = new THREE.Group(); fGrp.position.y = 0.14;
    const outer = new THREE.Mesh(new THREE.ConeGeometry(0.065, 0.28, 12), new THREE.MeshBasicMaterial({ color: 0xffa834, transparent: true, opacity: 0.92 }));
    outer.position.y = 0.06;
    const inner = new THREE.Mesh(new THREE.ConeGeometry(0.034, 0.16, 10), new THREE.MeshBasicMaterial({ color: 0xfff8dc }));
    inner.position.y = 0.03;
    const glow = new THREE.Sprite(new THREE.SpriteMaterial({ map: this.glowTex, color: 0xffc858, transparent: true, opacity: 0.96, blending: THREE.AdditiveBlending, depthWrite: false }));
    glow.scale.set(1.18, 1.18, 1); glow.position.y = 0.08;
    fGrp.add(outer, inner, glow); holder.add(fGrp);

    const smoke = new THREE.Sprite(new THREE.SpriteMaterial({ map: this.glowTex, color: 0xcfc7be, transparent: true, opacity: 0, depthWrite: false }));
    smoke.scale.set(0.45, 0.45, 1); smoke.position.y = 0.16; holder.add(smoke);

    this.cakeFlames.push({ group: fGrp, glow, phase: x * 4 + 1.2 });
    this.smokePuffs.push({ sprite: smoke, baseY: 0.16 });
    return holder;
  }

  buildGrandRotundaAndRealisticCake() {
    const rotunda = new THREE.Group();
    rotunda.position.set(0, 0, -93);

    const floor = new THREE.Mesh(new THREE.CircleGeometry(12.6, 48), this.mats.marble);
    floor.rotation.x = -Math.PI / 2; floor.position.y = 0.015;
    const goldInlay = new THREE.Mesh(new THREE.RingGeometry(4.2, 4.48, 48), this.mats.goldGlow);
    goldInlay.rotation.x = -Math.PI / 2; goldInlay.position.y = 0.022;
    rotunda.add(floor, goldInlay);

    const rotWall = new THREE.Mesh(
      new THREE.CylinderGeometry(12.5, 12.5, 10.6, 36, 1, true, Math.PI * 0.18, Math.PI * 1.64),
      new THREE.MeshStandardMaterial({ map: this.wallPanelPBR.map, roughness: 0.65, side: THREE.BackSide })
    );
    rotWall.position.y = 5.3; rotunda.add(rotWall);

    const dome = new THREE.Mesh(
      new THREE.SphereGeometry(12.6, 28, 16, 0, Math.PI * 2, 0, Math.PI * 0.48),
      new THREE.MeshStandardMaterial({ color: 0xf4cf7c, metalness: 0.78, roughness: 0.22, wireframe: true, transparent: true, opacity: 0.48 })
    );
    dome.position.y = 9.6; rotunda.add(dome);

    for (let i = 0; i < 10; i++) {
      const a = (i / 10) * Math.PI * 2;
      if (Math.cos(a) > 0.72) continue;
      const col = new THREE.Mesh(new THREE.CylinderGeometry(0.36, 0.42, 9.6, 14), this.mats.marble);
      col.position.set(Math.sin(a) * 10.8, 4.8, Math.cos(a) * 10.8);
      rotunda.add(col);
    }

    const dais1 = new THREE.Mesh(new THREE.CylinderGeometry(3.2, 3.5, 0.24, 42), this.mats.marble); dais1.position.y = 0.12;
    const dais2 = new THREE.Mesh(new THREE.CylinderGeometry(2.3, 2.5, 0.85, 42), this.mats.marble); dais2.position.y = 0.65;
    const daisRim = new THREE.Mesh(new THREE.TorusGeometry(2.32, 0.045, 10, 48), this.mats.goldGlow);
    daisRim.rotation.x = Math.PI / 2; daisRim.position.y = 1.07;
    rotunda.add(dais1, dais2, daisRim);

    const cake = new THREE.Group();
    cake.position.y = 2.48; cake.scale.setScalar(1.06);

    const foot = new THREE.Mesh(new THREE.CylinderGeometry(0.55, 0.85, 0.16, 28), this.mats.gold); foot.position.y = -1.28;
    const stem = new THREE.Mesh(new THREE.CylinderGeometry(0.18, 0.28, 0.48, 22), this.mats.marble); stem.position.y = -0.98;
    const platter = new THREE.Mesh(new THREE.CylinderGeometry(1.88, 1.72, 0.12, 38), this.mats.marble); platter.position.y = -0.7;
    const tier1 = new THREE.Mesh(new THREE.CylinderGeometry(1.48, 1.5, 0.88, 38), this.mats.cakeCream); tier1.position.y = -0.2;
    const tier1Glaze = new THREE.Mesh(new THREE.CylinderGeometry(1.5, 1.5, 0.07, 38), this.mats.cakeGanache); tier1Glaze.position.y = 0.23;
    const tier2 = new THREE.Mesh(new THREE.CylinderGeometry(0.96, 0.98, 0.74, 34), this.mats.cakeCream); tier2.position.y = 0.63;
    const tier2Glaze = new THREE.Mesh(new THREE.CylinderGeometry(0.975, 0.975, 0.06, 34), this.mats.cakeGanache); tier2Glaze.position.y = 1.0;
    cake.add(foot, stem, platter, tier1, tier1Glaze, tier2, tier2Glaze);

    const dripGeo = new THREE.CapsuleGeometry(0.055, 0.26, 6, 10);
    const pearlGeo = new THREE.SphereGeometry(0.085, 10, 8);
    for (let i = 0; i < 18; i++) {
      const a = (i / 18) * Math.PI * 2;
      const d = new THREE.Mesh(dripGeo, this.mats.cakeGanache);
      const len = 0.72 + ((i * 7) % 5) * 0.2;
      d.scale.set(1, len, 1); d.position.set(Math.cos(a) * 1.485, 0.15 - len * 0.13, Math.sin(a) * 1.485);
      cake.add(d);
      const p = new THREE.Mesh(pearlGeo, this.mats.cakeFrosting);
      p.scale.set(1.15, 0.78, 1.15); p.position.set(Math.cos(a) * 1.54, -0.59, Math.sin(a) * 1.54);
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
        fruit.scale.set(1, 1.25, 1); fruit.position.set(Math.cos(a) * 1.24, 0.36, Math.sin(a) * 1.24);
        cake.add(fruit);
      } else {
        const mac = new THREE.Mesh(macGeo, i % 4 === 1 ? this.mats.macaronRose : this.mats.macaronGold);
        mac.position.set(Math.cos(a) * 1.24, 0.34, Math.sin(a) * 1.24);
        cake.add(mac);
      }
    }

    const c1 = new THREE.Group(); c1.position.set(-0.34, 1.12, 0.02);
    const d1 = new THREE.Mesh(this.createExtrudedDigit1(), this.mats.candleNumber);
    const d1Trim = new THREE.Mesh(this.createExtrudedDigit1(), this.mats.gold);
    d1Trim.scale.set(1.06, 1.04, 0.72); d1Trim.position.z = -0.02;
    c1.add(d1, d1Trim, this.createCandleFlame(0.02, 0.94, 0));

    const c9 = new THREE.Group(); c9.position.set(0.34, 1.12, 0.02);
    const d9 = new THREE.Mesh(this.createExtrudedDigit9(), this.mats.candleNumber);
    const d9Trim = new THREE.Mesh(this.createExtrudedDigit9(), this.mats.gold);
    d9Trim.scale.set(1.06, 1.04, 0.72); d9Trim.position.z = -0.02;
    c9.add(d9, d9Trim, this.createCandleFlame(-0.02, 0.95, 0));
    cake.add(c1, c9);

    this.cakeGroup = cake;
    rotunda.add(cake);

    const fCount = this.isMobile ? 200 : 320;
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

    const cakeHit = new THREE.Mesh(new THREE.CylinderGeometry(2.7, 2.7, 4.6, 16), new THREE.MeshBasicMaterial({ visible: false }));
    cakeHit.position.y = 2.3; cakeHit.userData.interactId = 'cake'; rotunda.add(cakeHit);

    this.interactables.push({
      id: 'cake',
      titleAr: 'تورتة العام التاسع عشر (1 & 9)',
      badgeAr: '🎂 اضغط على التورتة للاحتفال وإطفاء شمعتي 1 و 9',
      mesh: cakeHit,
      worldPos: new THREE.Vector3(0, 2.2, -93),
      radius: 9.8,
    });

    this.scene.add(rotunda);
  }

  /* ==================== LIFELIKE MULTI-SEGMENT ARTICULATED PARISIAN & MUSEUM VISITORS ==================== */
  buildArticulatedParisianCrowd() {
    const coatPalette = [0x2b2f3c, 0x8b6e52, 0x4b242c, 0x2f4139, 0x3f3229, 0x6f5a44, 0x222733];
    const scarfPalette = [0xb33b3b, 0xd9b36c, 0xd9d2c7, 0x45637a, 0x7c4a58];
    const hairPalette = [0x241913, 0x4a3121, 0x7a5638, 0x181514];
    const skinMat = new THREE.MeshStandardMaterial({ color: 0xe3baa0, roughness: 0.68 });
    const trouserMat = new THREE.MeshStandardMaterial({ color: 0x1b1d24, roughness: 0.86 });
    const shoeMat = new THREE.MeshStandardMaterial({ color: 0x161210, roughness: 0.55 });

    const paths = [
      // Paris Rue de Rivoli Sidewalk Strollers
      { x: -8.8, z0: 66, z1: 22, speed: 1.05, phase: 0.1, scale: 1.02 },
      { x: -10.0, z0: 24, z1: 68, speed: 0.92, phase: 1.7, scale: 0.94 },
      { x: 8.8, z0: 64, z1: 20, speed: 1.12, phase: 2.3, scale: 1.04 },
      { x: 10.0, z0: 24, z1: 66, speed: 0.88, phase: 0.9, scale: 0.95 },
      { x: -5.4, z0: 45, z1: 14, speed: 0.96, phase: 3.1, scale: 1.0 },
      { x: 5.4, z0: 15, z1: 48, speed: 1.02, phase: 4.2, scale: 0.97 },
      // Cour Napoléon Louvre Pyramid Visitors
      { x: -5.6, z0: 14, z1: -1, speed: 0.78, phase: 1.2, scale: 1.0 },
      { x: 5.6, z0: 0, z1: 15, speed: 0.82, phase: 2.8, scale: 0.96 },
      // Inside Louvre Grande Galerie Art Admirers
      { x: -2.4, z0: -12, z1: -56, speed: 0.68, phase: 0.5, scale: 1.0 },
      { x: 2.4, z0: -60, z1: -14, speed: 0.64, phase: 3.5, scale: 0.95 },
      { x: -2.6, z0: -38, z1: -18, speed: 0.6, phase: 2.1, scale: 0.98 },
      { x: 2.6, z0: -22, z1: -52, speed: 0.62, phase: 4.8, scale: 1.02 },
    ];

    paths.forEach((p, idx) => {
      const person = new THREE.Group();
      const coatMat = new THREE.MeshStandardMaterial({ color: coatPalette[idx % coatPalette.length], roughness: 0.78 });
      const scarfMat = new THREE.MeshStandardMaterial({ color: scarfPalette[idx % scarfPalette.length], roughness: 0.85 });
      const hairMat = new THREE.MeshStandardMaterial({ color: hairPalette[idx % hairPalette.length], roughness: 0.72 });

      // Tailored Parisian Trenchcoat Torso + Sculpted Shoulders + Waist Belt + Cozy Scarf!
      const shoulders = new THREE.Mesh(new THREE.CapsuleGeometry(0.13, 0.24, 6, 10), coatMat);
      shoulders.rotation.z = Math.PI / 2;
      shoulders.position.y = 1.4;
      const coatUpper = new THREE.Mesh(new THREE.CylinderGeometry(0.17, 0.16, 0.44, 12), coatMat);
      coatUpper.position.y = 1.22;
      const coatSkirt = new THREE.Mesh(new THREE.CylinderGeometry(0.16, 0.25, 0.48, 12), coatMat);
      coatSkirt.position.y = 0.82;
      const scarf = new THREE.Mesh(new THREE.TorusGeometry(0.115, 0.045, 8, 16), scarfMat);
      scarf.rotation.x = Math.PI / 2;
      scarf.position.y = 1.48;

      // Natural Neck, Sculpted Head, Hair Crown & Chic Parisian Beret/Hat
      const neck = new THREE.Mesh(new THREE.CylinderGeometry(0.055, 0.065, 0.12, 8), skinMat);
      neck.position.y = 1.54;
      const head = new THREE.Mesh(new THREE.SphereGeometry(0.115, 14, 12), skinMat);
      head.scale.set(0.92, 1.08, 0.98);
      head.position.y = 1.66;
      const hair = new THREE.Mesh(new THREE.SphereGeometry(0.122, 12, 10, 0, Math.PI * 2, 0, Math.PI * 0.62), hairMat);
      hair.position.set(0, 1.67, -0.015);
      person.add(shoulders, coatUpper, coatSkirt, scarf, neck, head, hair);

      if (idx % 2 === 0) {
        const beret = new THREE.Mesh(new THREE.CylinderGeometry(0.145, 0.11, 0.048, 14), idx % 4 === 0 ? this.mats.velvetRed : coatMat);
        beret.position.set(0.025, 1.77, -0.01);
        beret.rotation.z = 0.22;
        person.add(beret);
      }

      // Articulated Hip + Knee Legs & Boots (realistic walking stride!)
      const makeLeg = (sx) => {
        const hip = new THREE.Group();
        hip.position.set(sx * 0.088, 0.78, 0);
        const thigh = new THREE.Mesh(new THREE.CapsuleGeometry(0.062, 0.3, 4, 8), trouserMat);
        thigh.position.y = -0.18;
        const knee = new THREE.Group();
        knee.position.y = -0.37;
        const shin = new THREE.Mesh(new THREE.CapsuleGeometry(0.05, 0.3, 4, 8), trouserMat);
        shin.position.y = -0.17;
        const boot = new THREE.Mesh(new THREE.BoxGeometry(0.095, 0.08, 0.2), shoeMat);
        boot.position.set(0, -0.36, 0.04);
        knee.add(shin, boot);
        hip.add(thigh, knee);
        return { hip, knee };
      };
      const legL = makeLeg(-1);
      const legR = makeLeg(1);

      const makeArm = (sx) => {
        const sh = new THREE.Group();
        sh.position.set(sx * 0.225, 1.38, 0);
        const sleeve = new THREE.Mesh(new THREE.CapsuleGeometry(0.046, 0.44, 4, 8), coatMat);
        sleeve.position.y = -0.24;
        const hand = new THREE.Mesh(new THREE.SphereGeometry(0.038, 8, 6), skinMat);
        hand.position.y = -0.5;
        sh.add(sleeve, hand);
        return sh;
      };
      const armL = makeArm(-1);
      const armR = makeArm(1);

      // Shoulder leather tote bag on every 3rd visitor
      if (idx % 3 === 0) {
        const bag = new THREE.Mesh(new THREE.BoxGeometry(0.09, 0.26, 0.24), this.mats.woodDark);
        bag.position.set(0.24, 0.92, -0.02);
        person.add(bag);
      }

      // Soft Contact Shadow Disc under every person (grounds them realistically onto the cobblestones & parquet!)
      const shadowDisc = new THREE.Mesh(
        new THREE.CircleGeometry(0.36, 14),
        new THREE.MeshBasicMaterial({ color: 0x050302, transparent: true, opacity: 0.34, depthWrite: false })
      );
      shadowDisc.rotation.x = -Math.PI / 2;
      shadowDisc.position.y = 0.02;
      person.add(legL.hip, legR.hip, armL, armR, shadowDisc);

      person.scale.setScalar(p.scale);
      person.position.set(p.x, 0, p.z0);
      this.scene.add(person);
      this.crowdWalkers.push({ group: person, legL, legR, armL, armR, ...p, progress: Math.random(), dir: 1 });
    });
  }

  buildGoldenAutumnLeaves() {
    const count = this.isMobile ? 35 : 70;
    const leafGeo = new THREE.PlaneGeometry(0.14, 0.14);
    const leafMat = new THREE.MeshBasicMaterial({ color: 0xf6cf76, side: THREE.DoubleSide, transparent: true, opacity: 0.72 });
    this.leafInst = new THREE.InstancedMesh(leafGeo, leafMat, count);
    this.leafDummy = new THREE.Object3D();
    for (let i = 0; i < count; i++) {
      this.fallingLeaves.push({
        x: (Math.random() - 0.5) * 26,
        y: 1 + Math.random() * 11,
        z: 68 - Math.random() * 160,
        spd: 0.35 + Math.random() * 0.6,
        ph: Math.random() * Math.PI * 2,
      });
    }
    this.scene.add(this.leafInst);
  }

  buildPawPrintPool() {
    const geo = new THREE.PlaneGeometry(0.34, 0.34);
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
    const side = (this.pawIdx % 2 === 0 ? 1 : -1) * 0.13;
    slot.mesh.position.set(pos.x + Math.cos(yaw) * side, 0.03, pos.z - Math.sin(yaw) * side);
    slot.mesh.rotation.set(-Math.PI / 2, 0, yaw);
    slot.life = 1.0;
    slot.mesh.visible = true;
  }

  /* ==================== 100% ANATOMICALLY FIXED 40-BONE GOLDEN PERSIAN CAT ==================== */
  loadAnatomicallyFixed40BonePersianCat() {
    this.catRoot.position.copy(this.catPos);
    this.scene.add(this.catRoot);

    // Subtle Contact Shadow + Golden Quest Ring under the Cat
    const catShadow = new THREE.Mesh(
      new THREE.CircleGeometry(0.46, 20),
      new THREE.MeshBasicMaterial({ color: 0x050302, transparent: true, opacity: 0.38, depthWrite: false })
    );
    catShadow.rotation.x = -Math.PI / 2; catShadow.position.y = 0.018;
    const beaconRing = new THREE.Mesh(
      new THREE.RingGeometry(0.52, 0.6, 36),
      new THREE.MeshBasicMaterial({ color: 0xffe08a, transparent: true, opacity: 0.65, side: THREE.DoubleSide, blending: THREE.AdditiveBlending, depthWrite: false })
    );
    beaconRing.rotation.x = -Math.PI / 2; beaconRing.position.y = 0.025;
    this.catBeaconRing = beaconRing;
    this.catRoot.add(catShadow, beaconRing);

    const catLight = new THREE.PointLight(0xffe9c2, 3.0, 5.4, 1.4);
    catLight.position.set(0, 1.25, 0.85);
    this.catRoot.add(catLight);

    // 3D Yarn Ball for Play Mode
    this.catYarn = new THREE.Group();
    this.catYarn.add(new THREE.Mesh(new THREE.SphereGeometry(0.13, 14, 12), new THREE.MeshStandardMaterial({ color: 0xe8b954, roughness: 0.72 })));
    for (let i = 0; i < 4; i++) {
      const b = new THREE.Mesh(new THREE.TorusGeometry(0.132, 0.016, 8, 20), this.mats.goldGlow);
      b.rotation.set(i * 0.8, i * 1.1, i * 0.5);
      this.catYarn.add(b);
    }
    this.catYarn.position.set(0.28, 0.13, 0.62);
    this.catYarn.visible = false;
    this.catRoot.add(this.catYarn);

    const loader = new GLTFLoader();
    const coatTex = this.texLoader.load('./assets/models/persian-cat-coat.jpg');
    coatTex.colorSpace = THREE.SRGBColorSpace;
    coatTex.flipY = false;

    loader.load('./assets/models/persian-cat.glb', (gltf) => {
      const model = gltf.scene;
      // Set of bone names animated by embedded Animation[0] (all others MUST be reset to restQuat every frame!)
      const animatedBoneNames = new Set();
      if (gltf.animations?.[0]) {
        gltf.animations[0].tracks.forEach((tr) => {
          const boneName = tr.name.split('.')[0];
          animatedBoneNames.add(boneName);
        });
      }

      model.scale.setScalar(2.0);
      this.catRoot.add(model);

      // Compute EXACT world-space rest orientation for every single bone BEFORE animation starts!
      this.catRoot.updateMatrixWorld(true);
      const rootWorldInv = this.catRoot.getWorldQuaternion(new THREE.Quaternion()).invert();
      const worldQ = new THREE.Quaternion();
      const invLocalQ = new THREE.Quaternion();

      model.traverse((obj) => {
        if (obj.isBone || (obj.name && obj.name.startsWith('Wolf_'))) {
          obj.getWorldQuaternion(worldQ);
          // Bone's rotation relative to catRoot (where +Z = nose forward, +Y = up, +X = cat's left/right horizontal!)
          invLocalQ.copy(rootWorldInv).multiply(worldQ).invert();

          this.catBoneInfo[obj.name] = {
            bone: obj,
            restQuat: obj.quaternion.clone(),
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
            m.map = coatTex;
            m.roughness = isEye ? 0.08 : 0.76;
            m.metalness = isEye ? 0.12 : 0.02;
            if (!isEye) {
              m.emissive = new THREE.Color(0x523418);
              m.emissiveIntensity = 0.2;
            }
            m.needsUpdate = true;
          });
        }
      });

      // Cute golden collar bell on neck + subtle pink tongue on jaw (NEVER distorts head/eyes!)
      const jawInfo = this.catBoneInfo.Wolf_Head_JawSHJnt_12;
      if (jawInfo) {
        this.catTongue = new THREE.Mesh(
          new THREE.CapsuleGeometry(0.008, 0.028, 6, 8),
          new THREE.MeshStandardMaterial({ color: 0xec808d, roughness: 0.35 })
        );
        this.catTongue.position.set(0, 0.048, 0.042);
        this.catTongue.rotation.x = Math.PI * 0.42;
        this.catTongue.scale.setScalar(0.001);
        jawInfo.bone.add(this.catTongue);
      }
      const neckInfo = this.catBoneInfo.Wolf_Neck_01SHJnt_16;
      if (neckInfo) {
        const bell = new THREE.Mesh(new THREE.SphereGeometry(0.015, 10, 8), this.mats.goldGlow);
        bell.position.set(0, 0.036, 0.09);
        neckInfo.bone.add(bell);
      }

      if (gltf.animations?.length) {
        this.catMixer = new THREE.AnimationMixer(model);
        const act = this.catMixer.clipAction(gltf.animations[0]);
        act.setEffectiveTimeScale(0.88);
        act.play();
      }

      const cHit = new THREE.Mesh(new THREE.SphereGeometry(0.74, 10, 10), new THREE.MeshBasicMaterial({ visible: false }));
      cHit.position.y = 0.52;
      cHit.userData.interactId = 'cat';
      this.catRoot.add(cHit);
      this.catHitMesh = cHit;
      this.catLoaded = true;
    });
  }

  // Rotates any bone strictly along true anatomical World Right (pitch), Up (yaw), and Forward (roll) axes!
  // Zero twisting, zero leg collision, zero eye popping — EVER!
  applyWorldBoneRot(name, pitchRad = 0, yawRad = 0, rollRad = 0) {
    const info = this.catBoneInfo[name];
    if (!info) return;
    if (pitchRad) {
      this._qDelta.setFromAxisAngle(info.axisRight, pitchRad);
      info.bone.quaternion.multiply(this._qDelta);
    }
    if (yawRad) {
      this._qDelta.setFromAxisAngle(info.axisUp, yawRad);
      info.bone.quaternion.multiply(this._qDelta);
    }
    if (rollRad) {
      this._qDelta.setFromAxisAngle(info.axisFwd, rollRad);
      info.bone.quaternion.multiply(this._qDelta);
    }
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
    const zOffset = idx === 0 ? 7.0 : idx === 1 ? 5.2 : idx === STORY_WAYPOINTS.length - 1 ? 4.2 : 3.2;
    this.playerPos.set(wp.x, 1.68, wp.z + zOffset);
    this.catPos.set(wp.catX, 0, wp.catZ);
    this.catRoot.position.copy(this.catPos);
    const lookX = idx === 0 ? -1.5 : wp.catX * 0.55;
    const lookZ = wp.z - 4.0;
    this.targetYaw = Math.atan2(-(lookX - this.playerPos.x), -(lookZ - this.playerPos.z));
    this.playerYaw = this.targetYaw;
    this.targetPitch = idx === 0 ? 0.03 : -0.02;
    this.playerPitch = this.targetPitch;
    if (this.callbacks.onWaypointChange) this.callbacks.onWaypointChange(idx, wp);
  }

  triggerCatAction(action) {
    this.catState = action;
    this.catStateTimer = 0;
    this.catStateDur = action === 'groom' ? 5.5 : action === 'play' ? 6.2 : 3.4;
  }

  triggerCakeCelebration(blowOut = true) {
    this.candlesLit = !blowOut;
    this.candleWind = 0;
    if (blowOut) { this.smokeTime = 0; this.launchFireworks(); }
    else this.smokeTime = -1;
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
    out.width = 1280; out.height = 760;
    const ctx = out.getContext('2d');
    ctx.fillStyle = '#0f0b08'; ctx.fillRect(0, 0, 1280, 760);
    ctx.drawImage(this.canvas, 34, 34, 1212, 620);
    ctx.strokeStyle = '#e8c268'; ctx.lineWidth = 4; ctx.strokeRect(20, 20, 1240, 720);
    ctx.fillStyle = 'rgba(13, 9, 6, 0.92)'; ctx.fillRect(24, 654, 1232, 84);
    ctx.textAlign = 'center';
    ctx.direction = 'rtl'; ctx.fillStyle = '#fbf0cf'; ctx.font = '700 28px Amiri, Georgia, serif';
    ctx.fillText('جولة باريس ومتحف اللوفر 3D — رحلة يمنى (العام التاسع عشر) ✦ HEY', 640, 695);
    ctx.direction = 'ltr'; ctx.fillStyle = '#d6ab52'; ctx.font = '600 13px Cinzel, Georgia, serif';
    ctx.fillText('MUSÉE DU LOUVRE PARIS 3D STORY  •  DESIGNED & DEVELOPED BY ENG / MOHAMED TAREK', 640, 723);

    const a = document.createElement('a');
    a.download = `Yomna-Paris-Louvre-3D-${Date.now()}.png`;
    a.href = out.toDataURL('image/png');
    a.click();
  }

  /* ==================== EVENTS ==================== */
  bindEvents() {
    window.addEventListener('resize', () => {
      this.isMobile = window.innerWidth < 900;
      this.applyQualitySettings();
      const aspect = window.innerWidth / Math.max(1, window.innerHeight);
      this.camera.aspect = aspect;
      this.camera.fov = aspect < 0.85 ? 64 : 53;
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
    window.addEventListener('keyup', (e) => { this.keys[e.code] = false; });

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
      this.targetYaw -= dx * 0.004;
      this.targetPitch = Math.max(-0.48, Math.min(0.62, this.targetPitch - dy * 0.003));
    }, { passive: true });

    const endLook = (e) => {
      if (!this.isLooking) return;
      this.isLooking = false;
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
    document.addEventListener('visibilitychange', () => { this.isHidden = document.hidden; });
  }

  /* ==================== 60FPS GAME SIMULATION LOOP ==================== */
  animate() {
    if (this.disposed) return;
    requestAnimationFrame(() => this.animate());
    if (this.isHidden) return;

    const dt = Math.min(this.clock.getDelta(), 0.05);
    const t = this.clock.getElapsedTime();
    const damp = 1 - Math.exp(-8.5 * dt);

    // 1. Player Movement (WASD / Arrows / Virtual Joystick / Auto-Follow Cat)
    let fwd = this.moveInput.forward;
    let str = this.moveInput.strafe;
    if (this.keys.KeyW || this.keys.ArrowUp) fwd += 1;
    if (this.keys.KeyS || this.keys.ArrowDown) fwd -= 1;
    if (this.keys.KeyD || this.keys.ArrowRight) str += 1;
    if (this.keys.KeyA || this.keys.ArrowLeft) str -= 1;

    if (this.autoFollow) {
      const wp = STORY_WAYPOINTS[this.currentWaypointIdx];
      const dx = wp.x - this.playerPos.x;
      const dz = wp.z - this.playerPos.z;
      const dist = Math.hypot(dx, dz);
      if (!this.isLooking) {
        const desiredYaw = Math.atan2(-dx, -dz);
        let diff = desiredYaw - this.targetYaw;
        while (diff > Math.PI) diff -= Math.PI * 2;
        while (diff < -Math.PI) diff += Math.PI * 2;
        this.targetYaw += diff * (1 - Math.exp(-3.2 * dt));
        this.targetPitch += (-0.01 - this.targetPitch) * (1 - Math.exp(-3.0 * dt));
      }
      if (dist > 1.8) {
        const step = Math.min(dist, 5.2 * dt);
        this.playerPos.x += (dx / dist) * step;
        this.playerPos.z += (dz / dist) * step;
        this.walkBobPhase += step * 2.1;
      } else if (this.currentWaypointIdx < STORY_WAYPOINTS.length - 1) {
        this.currentWaypointIdx++;
        if (this.callbacks.onWaypointChange) this.callbacks.onWaypointChange(this.currentWaypointIdx, STORY_WAYPOINTS[this.currentWaypointIdx]);
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
        this.walkBobPhase += speed * 2.3;
      }
    }

    // Smooth World Collisions
    const inRotunda = this.playerPos.z < -81;
    const inLouvre = this.playerPos.z < -6 && !inRotunda;
    const maxW = inRotunda ? 9.5 : inLouvre ? 6.2 : 12.2;
    this.playerPos.x = Math.max(-maxW, Math.min(maxW, this.playerPos.x));
    this.playerPos.z = Math.max(-101, Math.min(72, this.playerPos.z));

    // Fire one-time Louvre Palace Entrance Welcome Notification when walking through the arch!
    if (!this.enteredLouvreOnce && this.playerPos.z < -7.5) {
      this.enteredLouvreOnce = true;
      if (this.callbacks.onEnterLouvre) this.callbacks.onEnterLouvre();
    }

    this.playerYaw += (this.targetYaw - this.playerYaw) * damp;
    this.playerPitch += (this.targetPitch - this.playerPitch) * damp;
    this.camera.position.set(this.playerPos.x, this.playerPos.y + Math.sin(this.walkBobPhase) * 0.028, this.playerPos.z);
    this.camera.rotation.order = 'YXZ';
    this.camera.rotation.y = this.playerYaw;
    this.camera.rotation.x = this.playerPitch;

    this.playerLantern.position.set(this.playerPos.x, 3.2, this.playerPos.z - 2.4);
    if (this.skyGroup) this.skyGroup.position.set(this.playerPos.x, 0, this.playerPos.z);

    // 2. Auto-detect Active Story Milestone during Free Exploration
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

    // 3. Nearest Interactive Artifact / Parchment / Vault Box / Manifesto / Cake
    let closest = null;
    let minD = Infinity;
    for (const it of this.interactables) {
      const d = Math.hypot(this.playerPos.x - it.worldPos.x, this.playerPos.z - it.worldPos.z);
      if (d < it.radius && d < minD) { minD = d; closest = it; }
    }
    if (closest?.id !== this.nearestInteractable?.id) {
      this.nearestInteractable = closest;
      if (this.callbacks.onProximityChange) this.callbacks.onProximityChange(closest);
    }

    // 4. ANATOMICALLY FIXED 40-BONE PERSIAN CAT GUIDE LOCOMOTION & GROOMING!
    const wp = STORY_WAYPOINTS[this.currentWaypointIdx];
    const targetCatX = wp.catX;
    const targetCatZ = Math.max(wp.catZ, this.playerPos.z - 7.5);
    const cdx = targetCatX - this.catPos.x;
    const cdz = targetCatZ - this.catPos.z;
    const cDist = Math.hypot(cdx, cdz);
    let catSpd = 0;

    if (cDist > 0.3) {
      const step = Math.min(cDist, Math.max(2.5, cDist * 1.4) * dt, 7.0 * dt);
      this.catPos.x += (cdx / cDist) * step;
      this.catPos.z += (cdz / cDist) * step;
      catSpd = step / Math.max(0.001, dt);
      this.catStride += step * 4.4;
      this.catStepAccum += step;
      if (this.catStepAccum > 0.56) {
        this.catStepAccum = 0;
        this.spawnPawPrint(this.catPos, this.catYaw);
      }
    }
    this.catRoot.position.copy(this.catPos);
    if (this.catBeaconRing) {
      this.catBeaconRing.rotation.z = t * 1.1;
      this.catBeaconRing.scale.setScalar(1 + Math.sin(t * 3.2) * 0.07);
    }

    const catMoving = catSpd > 0.22;
    const desiredCatYaw = catMoving
      ? Math.atan2(cdx, cdz)
      : Math.atan2(this.playerPos.x - this.catPos.x, this.playerPos.z - this.catPos.z) + 0.58;
    let cyDiff = desiredCatYaw - this.catYaw;
    while (cyDiff > Math.PI) cyDiff -= Math.PI * 2;
    while (cyDiff < -Math.PI) cyDiff += Math.PI * 2;
    this.catYaw += cyDiff * (1 - Math.exp(-6.2 * dt));
    this.catRoot.rotation.y = this.catYaw;

    this.catStateTimer += dt;
    if (!catMoving) {
      if (this.catState !== 'guide' && this.catStateTimer > this.catStateDur) {
        this.catState = 'guide'; this.catStateTimer = 0; this.catStateDur = 9 + Math.random() * 5;
      } else if (this.catState === 'guide' && this.catStateTimer > this.catStateDur) {
        this.catState = Math.random() < 0.5 ? 'groom' : 'play'; this.catStateTimer = 0; this.catStateDur = 5.4;
      }
    }

    this.catYarn.visible = this.catState === 'play' && !catMoving;
    if (this.catYarn.visible) {
      this.catYarn.position.x = Math.sin(t * 3.0) * 0.28;
      this.catYarn.position.y = 0.13 + Math.abs(Math.sin(t * 4.8)) * 0.18;
      this.catYarn.rotation.z += dt * 3.8;
    }

    if (this.catLoaded) {
      // Step A: Update embedded breathing + morph blinking animation cleanly
      if (this.catMixer) this.catMixer.update(dt);

      // Step B: CRITICAL FIX — Reset EVERY static bone (Jaw, Tail tip, etc.) back to exact restQuat every frame!
      for (const name in this.catBoneInfo) {
        const info = this.catBoneInfo[name];
        if (info.isStatic) info.bone.quaternion.copy(info.restQuat);
      }

      // Step C: Apply anatomically verified World-Space-Aligned offsets (ZERO bone crossing, ZERO eye pop-out!)
      const w = catMoving ? Math.min(1, catSpd / 2.2) : 0;
      if (w > 0.05) {
        const s = this.catStride;
        const fl = Math.sin(s);
        const fr = Math.sin(s + Math.PI);
        const hl = Math.sin(s + Math.PI * 0.92);
        const hr = Math.sin(s - Math.PI * 0.08);

        // Subtle fluid feline spine undulation
        this.applyWorldBoneRot('Wolf_Spine_02SHJnt_20', Math.sin(s) * 0.04 * w, 0, 0);
        this.applyWorldBoneRot('Wolf_Spine_04SHJnt_18', -Math.sin(s) * 0.045 * w, 0, 0);

        // Front Left & Right Legs (pure sagittal forward/backward swing + clean backward knee flex!)
        this.applyWorldBoneRot('Wolf_l_FrontLeg_HipSHJnt_4', -fl * 0.28 * w, 0, 0);
        this.applyWorldBoneRot('Wolf_l_FrontLeg_KneeSHJnt_3', Math.max(0, Math.cos(s)) * 0.34 * w, 0, 0);
        this.applyWorldBoneRot('Wolf_r_FrontLeg_HipSHJnt_10', -fr * 0.28 * w, 0, 0);
        this.applyWorldBoneRot('Wolf_r_FrontLeg_KneeSHJnt_9', Math.max(0, Math.cos(s + Math.PI)) * 0.34 * w, 0, 0);

        // Hind Left & Right Legs (pure sagittal forward/backward stride — NEVER swinging sideways!)
        this.applyWorldBoneRot('Wolf_l_HindLeg_HipSHJnt_27', -hl * 0.25 * w, 0, 0);
        this.applyWorldBoneRot('Wolf_l_HindLeg_Knee2SHJnt_25', -Math.max(0, Math.cos(s + Math.PI * 0.92)) * 0.32 * w, 0, 0);
        this.applyWorldBoneRot('Wolf_r_HindLeg_HipSHJnt_33', -hr * 0.25 * w, 0, 0);
        this.applyWorldBoneRot('Wolf_r_HindLeg_Knee2SHJnt_31', -Math.max(0, Math.cos(s - Math.PI * 0.08)) * 0.32 * w, 0, 0);
        if (this.catTongue) this.catTongue.scale.setScalar(0.001);
      } else if (this.catState === 'groom') {
        // Lifelike gentle paw-lift & natural neck bow (eyes stay 100% locked inside sockets!)
        const smoothIn = Math.min(1, this.catStateTimer * 2.2);
        const lk = Math.sin(t * 5.6);
        // Lift right front paw smoothly forward & bend wrist neatly toward face
        this.applyWorldBoneRot('Wolf_r_FrontLeg_HipSHJnt_10', -0.58 * smoothIn, 0.1 * smoothIn, 0);
        this.applyWorldBoneRot('Wolf_r_FrontLeg_KneeSHJnt_9', 0.48 * smoothIn, 0, 0);
        this.applyWorldBoneRot('Wolf_r_FrontLeg_AnkleSHJnt_8', 0.28 * smoothIn, 0, 0);
        // Gentle, natural downward neck bow with tiny licking bob (zero twisting!)
        this.applyWorldBoneRot('Wolf_Neck_01SHJnt_16', 0.16 * smoothIn, -0.1 * smoothIn, 0);
        this.applyWorldBoneRot('Wolf_Neck_02SHJnt_15', (0.14 + lk * 0.045) * smoothIn, -0.06 * smoothIn, 0);
        // Tiny anatomical jaw open + gentle pink tongue lick (reset cleanly from restQuat every frame!)
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
        // Inviting 3/4 companion glance gently toward player
        this.applyWorldBoneRot('Wolf_Neck_02SHJnt_15', -0.04, -0.28 + Math.sin(t * 1.2) * 0.06, 0);
        if (this.catTongue) this.catTongue.scale.setScalar(0.001);
      }

      // Expressive Smooth 4-Segment Persian Plume Tail Wave (World Up/Right axes — never tangles!)
      ['Wolf_Tail_01_02SHJnt_37', 'Wolf_Tail_01_03SHJnt_36', 'Wolf_Tail_01_04SHJnt_35', 'Wolf_Tail_01_05SHJnt_34'].forEach((bn, i) => {
        const wave = Math.sin(t * (catMoving ? 4.8 : 2.1) - i * 0.55) * (catMoving ? 0.16 : 0.12);
        this.applyWorldBoneRot(bn, i === 0 ? -0.1 : -0.04, wave, 0);
      });
    }

    // Fade 3D golden pawprints
    for (const p of this.pawPrints) {
      if (p.life > 0) {
        p.life -= dt * 0.35;
        p.mesh.material.opacity = Math.max(0, p.life * 0.82);
        if (p.life <= 0) p.mesh.visible = false;
      }
    }

    // 5. Animate Articulated Parisian Crowd (with realistic knee flexion!)
    for (const c of this.crowdWalkers) {
      const span = Math.max(1, Math.abs(c.z1 - c.z0));
      c.progress += (c.speed * dt * c.dir) / span;
      if (c.progress >= 1) { c.progress = 1; c.dir = -1; }
      else if (c.progress <= 0) { c.progress = 0; c.dir = 1; }
      c.group.position.z = THREE.MathUtils.lerp(c.z0, c.z1, c.progress);
      c.group.rotation.y = (c.z1 > c.z0 ? (c.dir > 0 ? 0 : Math.PI) : (c.dir > 0 ? Math.PI : 0));
      const ph = t * 4.8 + c.phase;
      const swing = Math.sin(ph) * 0.38;
      c.legL.hip.rotation.x = swing;
      c.legL.knee.rotation.x = Math.max(0, -Math.cos(ph)) * 0.52;
      c.legR.hip.rotation.x = -swing;
      c.legR.knee.rotation.x = Math.max(0, Math.cos(ph)) * 0.52;
      c.armL.rotation.x = -swing * 0.55;
      c.armR.rotation.x = swing * 0.55;
      c.group.position.y = Math.abs(Math.sin(ph)) * 0.032;
    }

    // 6. Animate Drifting Clouds, Eiffel Searchlight & Sparkles, Fountain Ripples, Artifacts & 3D Cake!
    for (const cl of this.cloudSprites) {
      cl.ang += cl.speed * dt;
      cl.sprite.position.set(Math.cos(cl.ang) * cl.dist, cl.h, Math.sin(cl.ang) * cl.dist);
    }
    if (this.eiffelBeacon) this.eiffelBeacon.scale.setScalar(5.8 + Math.sin(t * 3.5) * 1.2);
    if (this.eiffelSearchlightRig) this.eiffelSearchlightRig.rotation.y = t * 0.55;
    for (const sp of this.eiffelSparkles) {
      sp.sprite.material.opacity = (this.timeOfDay === 'day' ? 0.08 : 0.25) + Math.max(0, Math.sin(t * sp.speed + sp.phase)) * (this.timeOfDay === 'night' ? 0.75 : 0.45);
    }
    for (const fr of this.fountainRings) {
      const f = (t * 0.55 + fr.phase) % 1;
      fr.mesh.scale.setScalar(0.6 + f * 3.6);
      fr.mesh.material.opacity = (1 - f) * 0.45;
    }
    for (const fp of this.floatingProps) {
      fp.mesh.position.y = fp.baseY + Math.sin(t * fp.speed) * 0.09;
      fp.mesh.rotation.y += dt * 0.4;
    }
    for (const pc of this.parchments) {
      pc.mesh.position.y = pc.baseY + Math.sin(t * 1.8 + pc.phase) * 0.07;
    }
    if (this.leafInst && this.leafInst.visible) {
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
    }

    // 3D Birthday Cake Showcase Sway + Candle Flames + Smoke + Fireworks!
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
      for (const sm of this.smokePuffs) {
        const p = Math.min(1, this.smokeTime / 3.0);
        sm.sprite.position.y = sm.baseY + p * 1.4;
        sm.sprite.scale.setScalar(0.35 + p * 1.1);
        sm.sprite.material.opacity = Math.sin(p * Math.PI) * 0.45;
      }
      if (this.smokeTime >= 3.0) this.smokeTime = -1;
    }
    if (this.fireworksTime >= 0) {
      this.fireworksTime += dt;
      const arr = this.fireworksPoints.geometry.attributes.position.array;
      for (let i = 0; i < this.fireworkVels.length; i++) {
        const v = this.fireworkVels[i];
        arr[i * 3] += v.x * dt;
        arr[i * 3 + 1] += (v.y - 3.6 * this.fireworksTime) * dt;
        arr[i * 3 + 2] += v.z * dt;
      }
      this.fireworksPoints.geometry.attributes.position.needsUpdate = true;
      this.fireworksPoints.material.opacity = Math.max(0, 1 - this.fireworksTime / 3.6);
      if (this.fireworksTime > 3.6) this.fireworksTime = -1;
    }

    this.renderer.render(this.scene, this.camera);
  }
}
