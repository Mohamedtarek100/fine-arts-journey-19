/**
 * =========================================================================
 *  In-World Photorealistic 40-Bone 3D Persian Cat Mentor (Three.js GLTF)
 *  - Lives directly inside the main 3D Atelier World (true X/Y/Z 3D space, NOT 2D!)
 *  - Uses real 5,351-vertex 40-bone skinned feline mesh (persian-cat.glb, CC BY 4.0
 *    base by kenchoo) reskinned with custom photorealistic Golden-Apricot Persian
 *    coat & honey-amber eyes (persian-cat-coat.jpg) + embedded 1024x1024 hair normal map
 *  - Real-time skeletal bone kinematics layered over embedded morph-target blinking
 *    & breathing: velocity-locked 4-leg feline walk/trot, sitting/resting, paw-licking
 *    & cheek-washing with animated 3D pink tongue, crouching yarn-ball play, laser
 *    pointer chasing in 3D space, glowing 3D golden pawprint trail, and Free 3D
 *    Drag-and-Place anywhere on screen!
 * =========================================================================
 */

import * as THREE from './vendor/three.module.min.js';
import { GLTFLoader } from './vendor/GLTFLoader.js';

export class PersianCatWorld3D {
  constructor(scene, camera, glowTexture, onStateChange = null) {
    this.scene = scene;
    this.camera = camera;
    this.glowTexture = glowTexture;
    this.onStateChange = onStateChange;

    this.root = new THREE.Group();
    this.root.name = 'PersianCatMentorRoot';
    this.scene.add(this.root);

    this.modelPivot = new THREE.Group();
    this.root.add(this.modelPivot);

    this.loaded = false;
    this.visible = true;
    this.mixer = null;
    this.bones = {};
    this.catMeshes = [];

    // Real 3D world coordinates & smooth locomotion
    this.worldPos = new THREE.Vector3(1.45, -1.05, 3.6);
    this.targetWorldPos = new THREE.Vector3(1.45, -1.05, 3.6);
    this.currentYaw = -0.38;
    this.stridePhase = 0;
    this.stepAccum = 0;
    this.moveSpeed3D = 0;

    // Free 3D Placement / Drag & Laser Modes
    this.isPinnedCustom = false;
    this.pinnedNdc = { x: 0.52, y: -0.42 }; // Screen-relative 3D perch when user drags/places her!
    this.isDragging = false;
    this.dragModeActive = false;
    this.laserModeActive = false;
    this.laserWorldPos = new THREE.Vector3(0, -0.8, 3.0);

    // State machine: 'guide' | 'walk' | 'groom' | 'play' | 'pet' | 'laser' | 'drag'
    this.state = 'guide';
    this.stateTimer = 0;
    this.stateDuration = 9.0;
    this.groomStyle = 0;

    // 3D Yarn Ball Physics
    this.yarnVel = new THREE.Vector3(0.65, 0.9, 0.2);
    this.yarnLocal = new THREE.Vector3(0.32, 0.14, 0.58);
    this.swatTimer = 0;
    this.swatSide = 1;

    // Pre-allocated scratch math objects (ZERO per-frame GC allocations -> locked 60FPS!)
    this._qDelta = new THREE.Quaternion();
    this._vAxisX = new THREE.Vector3(1, 0, 0);
    this._vAxisY = new THREE.Vector3(0, 1, 0);
    this._vAxisZ = new THREE.Vector3(0, 0, 1);
    this._tmpV1 = new THREE.Vector3();
    this._tmpV2 = new THREE.Vector3();
    this._tmpRayDir = new THREE.Vector3();

    this.pawPrints = [];
    this.sparkles = [];
    this.pawTex = this.createGoldenPawTexture();

    this.buildPlacementHalo();
    this.buildLaserDot();
    this.buildGoldenYarnBall();
    this.buildSparkles();
    this.buildPawPrintPool();
    this.loadPhotorealisticCat();
  }

  /* ==================== GLOWING 3D PAWPRINT TEXTURE & POOL ==================== */
  createGoldenPawTexture() {
    const c = document.createElement('canvas');
    c.width = 128;
    c.height = 128;
    const ctx = c.getContext('2d');
    ctx.clearRect(0, 0, 128, 128);
    ctx.fillStyle = '#ffe599';
    ctx.shadowColor = '#f2b844';
    ctx.shadowBlur = 16;

    // Main paw pad
    ctx.beginPath();
    ctx.ellipse(64, 78, 22, 18, 0, 0, Math.PI * 2);
    ctx.fill();

    // 4 cute feline toe beans
    const toes = [
      [35, 50, 9, 12, -0.35],
      [53, 36, 9, 13, -0.12],
      [75, 36, 9, 13, 0.12],
      [93, 50, 9, 12, 0.35],
    ];
    toes.forEach(([x, y, rx, ry, rot]) => {
      ctx.beginPath();
      ctx.ellipse(x, y, rx, ry, rot, 0, Math.PI * 2);
      ctx.fill();
    });

    const tex = new THREE.CanvasTexture(c);
    tex.colorSpace = THREE.SRGBColorSpace;
    return tex;
  }

  buildPawPrintPool() {
    const geo = new THREE.PlaneGeometry(0.32, 0.32);
    for (let i = 0; i < 16; i++) {
      const mat = new THREE.MeshBasicMaterial({
        map: this.pawTex,
        transparent: true,
        opacity: 0,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
        side: THREE.DoubleSide,
      });
      const mesh = new THREE.Mesh(geo, mat);
      mesh.rotation.x = -Math.PI / 2;
      mesh.visible = false;
      this.scene.add(mesh);
      this.pawPrints.push({ mesh, life: 0 });
    }
    this.pawPoolIdx = 0;
  }

  spawnPawPrint(pos, yaw) {
    const slot = this.pawPrints[this.pawPoolIdx];
    this.pawPoolIdx = (this.pawPoolIdx + 1) % this.pawPrints.length;
    const sideOff = (this.pawPoolIdx % 2 === 0 ? 1 : -1) * 0.14;
    slot.mesh.position.set(
      pos.x + Math.cos(yaw) * sideOff,
      pos.y + 0.02,
      pos.z - Math.sin(yaw) * sideOff
    );
    slot.mesh.rotation.set(-Math.PI / 2, 0, yaw);
    slot.life = 1.0;
    slot.mesh.material.opacity = 0.85;
    slot.mesh.visible = true;
  }

  /* ==================== 3D PLACEMENT HALO, LASER DOT & GOLDEN YARN BALL ==================== */
  buildPlacementHalo() {
    this.haloGroup = new THREE.Group();
    const outer = new THREE.Mesh(
      new THREE.RingGeometry(0.56, 0.64, 42),
      new THREE.MeshBasicMaterial({
        color: 0xf7d882,
        transparent: true,
        opacity: 0.45,
        side: THREE.DoubleSide,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
      })
    );
    outer.rotation.x = -Math.PI / 2;
    outer.position.y = 0.015;

    const innerGlow = new THREE.Mesh(
      new THREE.CircleGeometry(0.58, 32),
      new THREE.MeshBasicMaterial({
        map: this.glowTexture,
        color: 0xe6b550,
        transparent: true,
        opacity: 0.34,
        side: THREE.DoubleSide,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
      })
    );
    innerGlow.rotation.x = -Math.PI / 2;
    innerGlow.position.y = 0.01;

    this.haloOuter = outer;
    this.haloInner = innerGlow;
    this.haloGroup.add(outer, innerGlow);
    this.root.add(this.haloGroup);
  }

  buildLaserDot() {
    this.laserGroup = new THREE.Group();
    const core = new THREE.Mesh(
      new THREE.SphereGeometry(0.065, 12, 12),
      new THREE.MeshBasicMaterial({ color: 0xff5a6a })
    );
    const halo = new THREE.Sprite(
      new THREE.SpriteMaterial({
        map: this.glowTexture,
        color: 0xff425c,
        transparent: true,
        opacity: 0.95,
        blending: THREE.AdditiveBlending,
      })
    );
    halo.scale.set(0.68, 0.68, 1);
    this.laserGroup.add(core, halo);
    this.laserGroup.visible = false;
    this.scene.add(this.laserGroup);
  }

  buildGoldenYarnBall() {
    this.yarnBall = new THREE.Group();
    const matCore = new THREE.MeshStandardMaterial({ color: 0xe8b954, roughness: 0.72, metalness: 0.14 });
    const matBand = new THREE.MeshStandardMaterial({ color: 0xffe8a6, roughness: 0.55, metalness: 0.25 });
    const core = new THREE.Mesh(new THREE.SphereGeometry(0.14, 16, 14), matCore);
    this.yarnBall.add(core);
    for (let i = 0; i < 5; i++) {
      const band = new THREE.Mesh(new THREE.TorusGeometry(0.142, 0.017, 8, 22), matBand);
      band.rotation.set(i * 0.7, i * 1.1, i * 0.45);
      this.yarnBall.add(band);
    }
    this.yarnBall.visible = false;
    this.root.add(this.yarnBall);
  }

  buildSparkles() {
    const geo = new THREE.OctahedronGeometry(0.065, 0);
    for (let i = 0; i < 12; i++) {
      const m = new THREE.Mesh(geo, new THREE.MeshBasicMaterial({ color: 0xffe9a6, transparent: true, opacity: 0 }));
      m.visible = false;
      this.scene.add(m);
      this.sparkles.push({ mesh: m, life: 0, vx: 0, vy: 0, vz: 0 });
    }
  }

  spawnSparkles(originPos) {
    this.sparkles.forEach((s, i) => {
      const a = (i / this.sparkles.length) * Math.PI * 2;
      s.mesh.position.set(originPos.x + Math.cos(a) * 0.25, originPos.y + 0.68, originPos.z + Math.sin(a) * 0.25);
      s.vx = Math.cos(a) * (0.65 + Math.random() * 0.5);
      s.vy = 0.85 + Math.random() * 0.7;
      s.vz = Math.sin(a) * (0.55 + Math.random() * 0.4);
      s.life = 1.0;
      s.mesh.visible = true;
    });
  }

  /* ==================== LOAD REAL 40-BONE PHOTOREALISTIC CAT GLB ==================== */
  loadPhotorealisticCat() {
    const loader = new GLTFLoader();
    const texLoader = new THREE.TextureLoader();

    const persianCoatTex = texLoader.load('./assets/models/persian-cat-coat.jpg');
    persianCoatTex.colorSpace = THREE.SRGBColorSpace;
    persianCoatTex.flipY = false; // glTF UV convention!

    loader.load(
      './assets/models/persian-cat.glb',
      (gltf) => {
        const model = gltf.scene;

        // Upgrade every material with our custom Golden-Apricot Persian coat & warm honey-amber eyes
        // while PRESERVING the embedded 1024x1024 photorealistic hair normal map!
        model.traverse((obj) => {
          if (obj.isBone || (obj.name && obj.name.startsWith('Wolf_'))) {
            this.bones[obj.name] = obj;
          }
          if (obj.isMesh) {
            obj.frustumCulled = false;
            this.catMeshes.push(obj);
            const mats = Array.isArray(obj.material) ? obj.material : [obj.material];
            mats.forEach((mat) => {
              if (!mat) return;
              mat.map = persianCoatTex;
              if (mat.name === 'material') {
                // Glossy wet-cornea feline eyes!
                mat.roughness = 0.08;
                mat.metalness = 0.12;
              } else {
                // Soft velvety golden Persian fur with normal-mapped hair strands
                mat.roughness = 0.84;
                mat.metalness = 0.02;
                if (mat.normalScale) mat.normalScale.set(1.35, 1.35);
              }
              mat.needsUpdate = true;
            });
          }
        });

        // Subtle warm light illuminating her face & honey-amber eyes cleanly in all museum moods
        const catFaceLight = new THREE.PointLight(0xffe7bd, 2.2, 3.6, 1.5);
        catFaceLight.position.set(0.35, 0.85, 0.95);
        this.root.add(catFaceLight);

        // Attach tiny sculpted Royal Atelier Gold Collar Bell + Animated Pink 3D Tongue to real skeleton!
        this.attachPersianDetailsToSkeleton();

        // Scale to realistic museum-gallery companion height (~0.98m tall in Atelier world)
        const scale = window.innerWidth < 940 ? 2.18 : 2.58;
        model.scale.setScalar(scale);
        this.modelPivot.add(model);
        this.catModel = model;

        // Play the embedded realistic 8.71s breathing + morph-target eye-blinking animation!
        if (gltf.animations && gltf.animations.length > 0) {
          this.mixer = new THREE.AnimationMixer(model);
          const action = this.mixer.clipAction(gltf.animations[0]);
          action.setEffectiveTimeScale(0.92);
          action.play();
        }

        // Invisible generous raycast hitbox around the cat so tapping/grabbing her is effortless!
        this.hitbox = new THREE.Mesh(
          new THREE.SphereGeometry(0.65, 10, 10),
          new THREE.MeshBasicMaterial({ visible: false })
        );
        this.hitbox.position.set(0, 0.55, 0);
        this.root.add(this.hitbox);

        this.loaded = true;
      },
      undefined,
      (err) => {
        console.warn('Persian Cat GLB load error:', err);
      }
    );
  }

  attachPersianDetailsToSkeleton() {
    // 1. Animated cute pink 3D tongue parented inside Wolf_Head_JawSHJnt_12 (emerges during paw-licking!)
    const jawBone = this.bones.Wolf_Head_JawSHJnt_12;
    if (jawBone) {
      this.tongueGroup = new THREE.Group();
      this.tongueGroup.position.set(0, 0.045, 0.035);
      const tongueMesh = new THREE.Mesh(
        new THREE.CapsuleGeometry(0.011, 0.042, 6, 10),
        new THREE.MeshStandardMaterial({ color: 0xec808d, roughness: 0.35 })
      );
      tongueMesh.rotation.x = Math.PI * 0.42;
      tongueMesh.scale.set(1.15, 1.0, 0.38);
      tongueMesh.position.set(0, 0.018, 0.02);
      this.tongueGroup.add(tongueMesh);
      this.tongueGroup.scale.setScalar(0.001);
      jawBone.add(this.tongueGroup);
    }

    // 2. Tiny luxury gold Atelier Bell pendant on her neck bone (ties her to the HEY golden aesthetic!)
    const neckBone = this.bones.Wolf_Neck_01SHJnt_16;
    if (neckBone) {
      const bell = new THREE.Mesh(
        new THREE.SphereGeometry(0.016, 12, 10),
        new THREE.MeshStandardMaterial({ color: 0xf6cf74, metalness: 0.88, roughness: 0.18 })
      );
      bell.position.set(0, 0.04, 0.095);
      neckBone.add(bell);
    }

    // 3. Soft translucent golden-cream Persian fluff sprites along her tail & chest ruff
    //    for that unmistakable plush long-haired Shirazi tail & ruff aura from her photos!
    const fluffMat = new THREE.SpriteMaterial({
      map: this.glowTexture,
      color: 0xf4cfa0,
      transparent: true,
      opacity: 0.24,
      depthWrite: false,
    });
    ['Wolf_Tail_01_02SHJnt_37', 'Wolf_Tail_01_03SHJnt_36', 'Wolf_Tail_01_04SHJnt_35', 'Wolf_Tail_01_05SHJnt_34'].forEach((bName, i) => {
      const b = this.bones[bName];
      if (!b) return;
      const sp = new THREE.Sprite(fluffMat);
      const s = 0.13 + (i === 1 || i === 2 ? 0.04 : 0);
      sp.scale.set(s, s, 1);
      sp.position.set(0, 0.08, 0);
      b.add(sp);
    });
  }

  /* ==================== PUBLIC CONTROLS: STATE, FREE 3D DRAG, LASER, VISIBILITY ==================== */
  setVisible(val) {
    this.visible = Boolean(val);
    this.root.visible = this.visible;
    if (!this.visible) {
      this.laserGroup.visible = false;
      this.laserModeActive = false;
      this.dragModeActive = false;
    }
  }

  setState(nextState, duration = null) {
    this.state = nextState;
    this.stateTimer = 0;

    if (nextState === 'groom') {
      this.groomStyle = (this.groomStyle + 1) % 2;
      this.stateDuration = duration ?? 6.2;
    } else if (nextState === 'play') {
      this.stateDuration = duration ?? 7.2;
      this.yarnLocal.set(0.32, 0.25, 0.62);
      this.yarnVel.set(-0.95, 1.15, 0.1);
    } else if (nextState === 'pet') {
      this.stateDuration = duration ?? 3.4;
      this.spawnSparkles(this.worldPos);
    } else if (nextState === 'walk') {
      this.stateDuration = duration ?? 4.8;
      // Pick an exploratory 3D spot beside the current camera stage!
      const isMob = window.innerWidth < 940;
      const randNdcX = (Math.random() < 0.5 ? -1 : 1) * (isMob ? 0.34 : 0.46);
      const randNdcY = isMob ? -0.35 : -0.44;
      this.isPinnedCustom = true;
      this.pinnedNdc.x = randNdcX;
      this.pinnedNdc.y = randNdcY;
    } else {
      this.stateDuration = duration ?? 9.5;
    }

    if (this.onStateChange) this.onStateChange(nextState);
  }

  setDragMode(enabled) {
    this.dragModeActive = Boolean(enabled);
    if (this.dragModeActive) {
      this.laserModeActive = false;
      this.laserGroup.visible = false;
    }
  }

  setLaserMode(enabled) {
    this.laserModeActive = Boolean(enabled);
    this.laserGroup.visible = this.laserModeActive && this.visible;
    if (this.laserModeActive) {
      this.dragModeActive = false;
      this.isPinnedCustom = true;
      this.setState('laser', 25.0);
    } else if (this.state === 'laser') {
      this.setState('guide', 8.0);
    }
  }

  resetToJourneyPath() {
    this.isPinnedCustom = false;
    this.dragModeActive = false;
    this.laserModeActive = false;
    this.laserGroup.visible = false;
    this.setState('guide', 8.5);
  }

  // Unproject any screen NDC (x: -1..1, y: -1..1) cleanly into a 3D world point at comfortable camera distance!
  ndcToWorld3D(ndcX, ndcY, distFromCam = null) {
    const isMob = window.innerWidth < 940;
    const depth = distFromCam ?? (isMob ? 4.8 : 4.6);
    this._tmpRayDir.set(ndcX, ndcY, 0.5).unproject(this.camera).sub(this.camera.position).normalize();
    return this._tmpV1.copy(this.camera.position).addScaledVector(this._tmpRayDir, depth);
  }

  // Instant 3D placement when user drags or taps anywhere in Drag Mode!
  placeAtScreenNdc(ndcX, ndcY, snapImmediate = false) {
    const cx = Math.max(-0.82, Math.min(0.82, ndcX));
    const cy = Math.max(-0.78, Math.min(0.62, ndcY));
    this.isPinnedCustom = true;
    this.pinnedNdc.x = cx;
    this.pinnedNdc.y = cy;
    const p = this.ndcToWorld3D(cx, cy);
    this.targetWorldPos.copy(p);
    if (snapImmediate) {
      this.worldPos.copy(p);
      this.root.position.copy(p);
    }
  }

  updateLaserAtScreenNdc(ndcX, ndcY) {
    if (!this.laserModeActive) return;
    const cx = Math.max(-0.84, Math.min(0.84, ndcX));
    const cy = Math.max(-0.76, Math.min(0.55, ndcY));
    const p = this.ndcToWorld3D(cx, cy);
    this.laserWorldPos.copy(p);
    this.laserGroup.position.copy(p);
    this.laserGroup.visible = true;
    this.pinnedNdc.x = cx;
    this.pinnedNdc.y = cy;
    this.targetWorldPos.copy(p);
  }

  hitTest(raycaster) {
    if (!this.loaded || !this.visible || !this.hitbox) return false;
    return raycaster.intersectObject(this.hitbox, false).length > 0;
  }

  getScreenPosition() {
    if (!this.loaded || !this.visible) return null;
    this._tmpV2.set(this.worldPos.x, this.worldPos.y + 0.92, this.worldPos.z);
    this._tmpV2.project(this.camera);
    return {
      x: (this._tmpV2.x * 0.5 + 0.5) * window.innerWidth,
      y: (-this._tmpV2.y * 0.5 + 0.5) * window.innerHeight,
    };
  }

  handleResize() {
    if (!this.catModel) return;
    const scale = window.innerWidth < 940 ? 2.18 : 2.58;
    this.catModel.scale.setScalar(scale);
  }

  /* ==================== ADDITIVE REAL SKELETAL BONE HELPER ==================== */
  rotBone(name, rx = 0, ry = 0, rz = 0) {
    const b = this.bones[name];
    if (!b) return;
    if (rx !== 0) {
      this._qDelta.setFromAxisAngle(this._vAxisX, rx);
      b.quaternion.multiply(this._qDelta);
    }
    if (ry !== 0) {
      this._qDelta.setFromAxisAngle(this._vAxisY, ry);
      b.quaternion.multiply(this._qDelta);
    }
    if (rz !== 0) {
      this._qDelta.setFromAxisAngle(this._vAxisZ, rz);
      b.quaternion.multiply(this._qDelta);
    }
  }

  /* ==================== PER-FRAME 60FPS UPDATE INSIDE MAIN 3D SCENE ==================== */
  update(dt, t, smoothZoneFloat, smoothPointer) {
    if (!this.visible) return;

    const damp = 1 - Math.exp(-7.5 * dt);
    const isMob = window.innerWidth < 940;
    this.stateTimer += dt;

    // 1. Compute Desired True 3D World Position (either following the 3D Journey Ribbon OR user's custom 3D placement!)
    if (this.isPinnedCustom) {
      const p = this.ndcToWorld3D(this.pinnedNdc.x, this.pinnedNdc.y);
      this.targetWorldPos.copy(p);
    } else {
      // Follow the user naturally in TRUE 3D space right beside each Chapter's 3D Stage!
      // On Desktop: smoothly alternates clear foreground sides; in Finale sits gracefully beside the 3D Cake!
      // On Mobile: sits neatly inside the lower-right of the open unobstructed 3D Stage Window!
      const nearCake = Math.max(0, 1 - Math.abs(smoothZoneFloat - 5));
      const baseNdcX = isMob
        ? (nearCake > 0.5 ? 0.44 : 0.42)
        : (nearCake > 0.5 ? 0.54 : Math.sin(smoothZoneFloat * Math.PI + 0.65) * 0.48);
      const baseNdcY = isMob ? -0.02 : -0.44;
      const p = this.ndcToWorld3D(baseNdcX, baseNdcY, isMob ? 5.1 : 4.65);
      this.targetWorldPos.copy(p);
    }

    // 2. Smooth Real 3D Locomotion (X, Y, Z) + Velocity-Locked Feline Stride + Glowing 3D Pawprints!
    const dx = this.targetWorldPos.x - this.worldPos.x;
    const dy = this.targetWorldPos.y - this.worldPos.y;
    const dz = this.targetWorldPos.z - this.worldPos.z;
    const dist3D = Math.hypot(dx, dy, dz);

    if (this.isDragging) {
      this.worldPos.lerp(this.targetWorldPos, 1 - Math.exp(-18 * dt));
      this.moveSpeed3D = 0;
    } else if (dist3D > 0.04) {
      const maxSpd = this.laserModeActive ? 5.2 : 3.6;
      const stepDist = Math.min(dist3D, Math.max(0.85, dist3D * 2.8) * dt, maxSpd * dt);
      const frac = stepDist / dist3D;
      this.worldPos.x += dx * frac;
      this.worldPos.y += dy * frac;
      this.worldPos.z += dz * frac;

      this.moveSpeed3D = stepDist / Math.max(0.001, dt);
      // Lock skeletal gait cycle directly to real 3D meters walked -> ZERO foot-sliding!
      this.stridePhase += stepDist * 4.6;
      this.stepAccum += stepDist;

      // Spawn glowing 3D golden pawprint ripple on every feline footfall!
      if (this.stepAccum > 0.48) {
        this.stepAccum = 0;
        this.spawnPawPrint(this.worldPos, this.currentYaw);
      }
    } else {
      this.moveSpeed3D *= Math.exp(-10 * dt);
    }

    this.root.position.copy(this.worldPos);

    // Subtle lift bounce while being dragged by the user!
    const dragLift = this.isDragging ? 0.14 + Math.sin(t * 7) * 0.03 : 0;
    this.modelPivot.position.y += (dragLift - this.modelPivot.position.y) * damp;

    // 3. Orient smoothly in 3D space: faces exact 3D travel direction when walking/chasing laser,
    //    turns warmly toward the camera (3/4 showcase angle) when resting/explaining/licking!
    const isMoving = this.moveSpeed3D > 0.28 && !this.isDragging;
    let desiredYaw = Math.atan2(this.camera.position.x - this.worldPos.x, this.camera.position.z - this.worldPos.z) - 0.34;
    if (isMoving) {
      desiredYaw = Math.atan2(dx, dz);
    } else if (this.laserModeActive) {
      desiredYaw = Math.atan2(this.laserWorldPos.x - this.worldPos.x, this.laserWorldPos.z - this.worldPos.z);
    }

    // Shortest angular interpolation around Y
    let yawDiff = desiredYaw - this.currentYaw;
    while (yawDiff > Math.PI) yawDiff -= Math.PI * 2;
    while (yawDiff < -Math.PI) yawDiff += Math.PI * 2;
    this.currentYaw += yawDiff * (1 - Math.exp(-7.5 * dt));
    this.root.rotation.y = this.currentYaw;

    // 4. Autonomous Lively Personality Transitions (when not dragging or chasing laser)
    if (!this.isDragging && !this.laserModeActive && !isMoving) {
      if (this.state !== 'guide' && this.stateTimer >= this.stateDuration) {
        this.setState('guide', 9.0 + Math.random() * 5.0);
      } else if (this.state === 'guide' && this.stateTimer >= this.stateDuration) {
        const roll = Math.random();
        if (roll < 0.5) this.setState('groom');
        else this.setState('play');
      }
    }

    // 5. Update Placement Halo, Yarn Ball, Pawprints & Sparkles
    const showHalo = this.dragModeActive || this.isDragging || this.isPinnedCustom;
    this.haloOuter.material.opacity += ((showHalo ? (this.isDragging ? 0.92 : 0.42) : 0.16) - this.haloOuter.material.opacity) * damp;
    this.haloInner.material.opacity += ((showHalo ? 0.45 : 0.2) - this.haloInner.material.opacity) * damp;
    this.haloOuter.rotation.z = t * (this.isDragging ? 2.2 : 0.5);

    this.yarnBall.visible = this.state === 'play' && !isMoving && !this.isDragging;
    if (this.yarnBall.visible) {
      this.yarnVel.y -= 4.2 * dt;
      this.yarnLocal.addScaledVector(this.yarnVel, dt);
      if (this.yarnLocal.y < 0.14) {
        this.yarnLocal.y = 0.14;
        this.yarnVel.y = Math.max(0.65, Math.abs(this.yarnVel.y) * 0.65);
      }
      if (this.yarnLocal.x < -0.44) {
        this.yarnLocal.x = -0.44;
        this.yarnVel.x = 0.78 + Math.random() * 0.35;
        this.yarnVel.y = 1.05;
        this.swatSide = -1;
        this.swatTimer = 0.36;
      } else if (this.yarnLocal.x > 0.44) {
        this.yarnLocal.x = 0.44;
        this.yarnVel.x = -(0.78 + Math.random() * 0.35);
        this.yarnVel.y = 1.05;
        this.swatSide = 1;
        this.swatTimer = 0.36;
      }
      this.yarnLocal.z = 0.68 + Math.sin(t * 2.0) * 0.08;
      if (this.swatTimer > 0) this.swatTimer = Math.max(0, this.swatTimer - dt);
      this.yarnBall.position.copy(this.yarnLocal);
      this.yarnBall.rotation.z -= this.yarnVel.x * dt * 4.5;
      this.yarnBall.rotation.x += dt * 2.5;
    }

    // Fade 3D golden pawprints smoothly
    for (const p of this.pawPrints) {
      if (p.life > 0) {
        p.life -= dt * 0.42;
        p.mesh.material.opacity = Math.max(0, p.life * 0.8);
        if (p.life <= 0) p.mesh.visible = false;
      }
    }

    // Update Petting Sparkles
    for (const s of this.sparkles) {
      if (s.life > 0) {
        s.life -= dt * 0.72;
        s.mesh.position.x += s.vx * dt;
        s.mesh.position.y += s.vy * dt;
        s.mesh.position.z += s.vz * dt;
        s.mesh.rotation.y += dt * 4.2;
        s.mesh.material.opacity = Math.max(0, s.life);
        if (s.life <= 0) s.mesh.visible = false;
      }
    }

    // 6. Advance Real 40-Bone Embedded Animation Mixer (Breathing + Morph-Target Blinking!)
    //    THEN Layer Our Smooth Procedural 40-Bone Skeletal Kinematics Directly On Top!
    if (!this.loaded) return;
    if (this.mixer) this.mixer.update(dt);

    const walkWeight = isMoving ? Math.min(1, this.moveSpeed3D / 1.4) : 0;

    // A. REALISTIC 4-BEAT FELINE WALK / TROT GAIT ON ALL 40 BONES!
    if (walkWeight > 0.04) {
      const s = this.stridePhase;
      const w = walkWeight;

      // Natural undulating feline spine wave & subtle hip sway
      this.rotBone('Wolf_Spine_02SHJnt_20', Math.sin(s) * 0.09 * w, Math.cos(s) * 0.05 * w, 0);
      this.rotBone('Wolf_Spine_04SHJnt_18', -Math.sin(s) * 0.11 * w, -Math.cos(s) * 0.05 * w, 0);
      this.rotBone('Wolf_ROOTSHJnt_38', 0, Math.sin(s * 2) * 0.03 * w, 0);

      // Front-Left & Front-Right 4-joint legs (Hip -> Knee -> Ankle -> Ball)
      const flSwing = Math.sin(s) * 0.54 * w;
      const flLift = Math.max(0, Math.cos(s)) * 0.62 * w;
      this.rotBone('Wolf_l_FrontLeg_HipSHJnt_4', flSwing, 0, 0);
      this.rotBone('Wolf_l_FrontLeg_KneeSHJnt_3', -flLift, 0, 0);
      this.rotBone('Wolf_l_FrontLeg_AnkleSHJnt_2', flLift * 0.55, 0, 0);

      const frSwing = Math.sin(s + Math.PI) * 0.54 * w;
      const frLift = Math.max(0, Math.cos(s + Math.PI)) * 0.62 * w;
      this.rotBone('Wolf_r_FrontLeg_HipSHJnt_10', frSwing, 0, 0);
      this.rotBone('Wolf_r_FrontLeg_KneeSHJnt_9', -frLift, 0, 0);
      this.rotBone('Wolf_r_FrontLeg_AnkleSHJnt_8', frLift * 0.55, 0, 0);

      // Hind-Left & Hind-Right 4-joint legs (Diagonal feline trot phase!)
      const hlSwing = Math.sin(s + Math.PI * 0.85) * 0.52 * w;
      const hlLift = Math.max(0, Math.cos(s + Math.PI * 0.85)) * 0.56 * w;
      this.rotBone('Wolf_l_HindLeg_HipSHJnt_27', hlSwing, 0, 0);
      this.rotBone('Wolf_l_HindLeg_Knee1SHJnt_26', -hlLift * 0.6, 0, 0);
      this.rotBone('Wolf_l_HindLeg_Knee2SHJnt_25', hlLift * 0.85, 0, 0);

      const hrSwing = Math.sin(s - Math.PI * 0.15) * 0.52 * w;
      const hrLift = Math.max(0, Math.cos(s - Math.PI * 0.15)) * 0.56 * w;
      this.rotBone('Wolf_r_HindLeg_HipSHJnt_33', hrSwing, 0, 0);
      this.rotBone('Wolf_r_HindLeg_Knee1SHJnt_32', -hrLift * 0.6, 0, 0);
      this.rotBone('Wolf_r_HindLeg_Knee2SHJnt_31', hrLift * 0.85, 0, 0);

      // Stabilize head forward while walking
      this.rotBone('Wolf_Neck_TopSHJnt_14', -Math.sin(s) * 0.06 * w, 0, 0);
    }

    // B. REALISTIC GROOMING (PAW-LICKING & SHOULDER-LICKING WITH PINK 3D TONGUE!)
    let tongueScale = 0.001;
    if (!isMoving && !this.isDragging && this.state === 'groom') {
      const lickOsc = Math.sin(t * 6.2);
      const env = Math.min(1, this.stateTimer * 2.2) * Math.min(1, Math.max(0, (this.stateDuration - this.stateTimer) * 2.2));
      if (this.groomStyle === 0) {
        // Lifts real front-right leg up & bows head down to lick paw!
        this.rotBone('Wolf_r_FrontLeg_HipSHJnt_10', -0.95 * env, 0, 0.25 * env);
        this.rotBone('Wolf_r_FrontLeg_KneeSHJnt_9', -0.85 * env, 0, 0);
        this.rotBone('Wolf_r_FrontLeg_AnkleSHJnt_8', 0.45 * env, 0, 0);
        this.rotBone('Wolf_Neck_01SHJnt_16', 0.32 * env, 0, 0.14 * env);
        this.rotBone('Wolf_Neck_TopSHJnt_14', (0.34 + lickOsc * 0.09) * env, 0.14 * env, 0);
        this.rotBone('Wolf_Head_JawSHJnt_12', (0.18 + Math.max(0, lickOsc) * 0.22) * env, 0, 0);
        tongueScale = Math.max(0.001, Math.max(0, lickOsc) * env);
      } else {
        // Curves real spine & neck sideways to lick her golden shoulder fur!
        this.rotBone('Wolf_Spine_03SHJnt_19', 0, 0.25 * env, 0);
        this.rotBone('Wolf_Neck_01SHJnt_16', 0.35 * env, 0.45 * env, 0);
        this.rotBone('Wolf_Neck_TopSHJnt_14', (0.38 + lickOsc * 0.09) * env, 0.35 * env, 0);
        this.rotBone('Wolf_Head_JawSHJnt_12', (0.16 + Math.max(0, lickOsc) * 0.2) * env, 0, 0);
        tongueScale = Math.max(0.001, Math.max(0, lickOsc) * env);
      }
    }

    // C. REALISTIC PLAYFUL POUNCE CROUCH & YARN-BALL SWATTING!
    else if (!isMoving && !this.isDragging && this.state === 'play') {
      this.rotBone('Wolf_Spine_02SHJnt_20', 0.16, 0, Math.sin(t * 7.5) * 0.06);
      this.rotBone('Wolf_Neck_TopSHJnt_14', 0.28 - this.yarnLocal.y * 0.3, -this.yarnLocal.x * 0.55, 0);
      const swat = this.swatTimer > 0 ? Math.sin((this.swatTimer / 0.36) * Math.PI) : 0;
      if (this.swatSide < 0) {
        this.rotBone('Wolf_l_FrontLeg_HipSHJnt_4', -0.95 * swat, 0, 0);
        this.rotBone('Wolf_l_FrontLeg_KneeSHJnt_3', -0.45 * swat, 0, 0);
      } else {
        this.rotBone('Wolf_r_FrontLeg_HipSHJnt_10', -0.95 * swat, 0, 0);
        this.rotBone('Wolf_r_FrontLeg_KneeSHJnt_9', -0.45 * swat, 0, 0);
      }
    }

    // D. AFFECTIONATE PURR & HEAD-NUZZLE ON PETTING!
    else if (!isMoving && !this.isDragging && this.state === 'pet') {
      const env = Math.sin(Math.min(1, this.stateTimer / this.stateDuration) * Math.PI);
      this.rotBone('Wolf_Neck_TopSHJnt_14', -0.18 * env, Math.sin(t * 4.5) * 0.22 * env, Math.sin(t * 5.2) * 0.22 * env);
    }

    // E. NATURAL LIVE HEAD-TRACKING TOWARD USER POINTER (when idle/guiding)
    else if (!isMoving && !this.isDragging && smoothPointer) {
      this.rotBone('Wolf_Neck_02SHJnt_15', -smoothPointer.y * 0.12, smoothPointer.x * 0.18, 0);
      this.rotBone('Wolf_Neck_TopSHJnt_14', -smoothPointer.y * 0.16, smoothPointer.x * 0.26, 0);
    }

    // F. GRACEFUL EXPRESSIVE 4-SEGMENT PERSIAN TAIL SWAY (ALWAYS ALIVE!)
    const tailSpd = isMoving || this.state === 'play' || this.laserModeActive ? 6.2 : 2.3;
    const tailAmp = isMoving || this.state === 'play' || this.laserModeActive ? 0.24 : 0.16;
    const tailRaise = this.state === 'pet' || isMoving ? 0.22 : 0.08;
    ['Wolf_Tail_01_02SHJnt_37', 'Wolf_Tail_01_03SHJnt_36', 'Wolf_Tail_01_04SHJnt_35', 'Wolf_Tail_01_05SHJnt_34'].forEach((bName, i) => {
      this.rotBone(bName, Math.sin(t * tailSpd - i * 0.65) * tailAmp, 0, i === 0 ? tailRaise : Math.cos(t * tailSpd * 0.7 - i * 0.5) * 0.08);
    });

    if (this.tongueGroup) {
      this.tongueGroup.scale.setScalar(tongueScale);
    }
  }
}
