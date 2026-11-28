/**
 * =========================================================================
 *  PRODUCTION AAA ASSET MANAGER (src/assets/AssetManager.js)
 *  - GLTFLoader + self-hosted DRACOLoader (./vendor/draco/)
 *  - RGBELoader + PMREMGenerator for authentic HDRI IBL reflections
 *  - Scanned PBR TextureLoader with caching & progress reporting
 *  - Zero external CDN dependencies • Graceful fallback handling
 * =========================================================================
 */

import * as THREE from '../../vendor/three.module.min.js';
import { GLTFLoader } from '../../vendor/GLTFLoader.js';
import { DRACOLoader } from '../../vendor/DRACOLoader.js';
import { RGBELoader } from '../../vendor/RGBELoader.js';
import { ASSET_MANIFEST } from './assetManifest.js';

export class AssetManager {
  constructor(renderer, onProgress = null) {
    this.renderer = renderer;
    this.onProgress = onProgress;
    this.totalTracked = 0;
    this.loadedTracked = 0;

    this.texLoader = new THREE.TextureLoader();
    this.rgbeLoader = new RGBELoader();
    this.dracoLoader = new DRACOLoader();
    this.dracoLoader.setDecoderPath(ASSET_MANIFEST.dracoDecoderPath);
    this.dracoLoader.setDecoderConfig({ type: 'wasm' });

    this.gltfLoader = new GLTFLoader();
    this.gltfLoader.setDRACOLoader(this.dracoLoader);

    this.pmrem = new THREE.PMREMGenerator(renderer);
    this.pmrem.compileEquirectangularShader();

    this.gltfCache = new Map();
    this.hdriCache = new Map();
  }

  emitProgress(labelAr) {
    if (!this.onProgress) return;
    const pct = this.totalTracked > 0 ? Math.min(100, Math.round((this.loadedTracked / this.totalTracked) * 100)) : 100;
    this.onProgress(pct, labelAr);
  }

  loadPBRSet(setDef, repX, repY, aniso = 4) {
    const clampedAniso = Math.min(4, Math.max(1, aniso));
    const prep = (url, isColor) => {
      if (!url) return null;
      const tex = this.texLoader.load(url);
      tex.wrapS = THREE.RepeatWrapping;
      tex.wrapT = THREE.RepeatWrapping;
      tex.repeat.set(repX, repY);
      tex.generateMipmaps = true;
      tex.minFilter = THREE.LinearMipmapLinearFilter;
      if (isColor) tex.colorSpace = THREE.SRGBColorSpace;
      tex.anisotropy = clampedAniso;
      return tex;
    };
    return {
      map: prep(setDef.diff, true),
      normalMap: prep(setDef.nor, false),
      roughnessMap: prep(setDef.rough, false),
      aoMap: prep(setDef.ao, false),
    };
  }

  async loadGLB(url, labelAr = '') {
    if (this.gltfCache.has(url)) return this.gltfCache.get(url);
    this.totalTracked++;
    try {
      const gltf = await this.gltfLoader.loadAsync(url);
      this.gltfCache.set(url, gltf);
      this.loadedTracked++;
      this.emitProgress(labelAr);
      return gltf;
    } catch (err) {
      this.loadedTracked++;
      this.emitProgress(labelAr);
      return null;
    }
  }

  async loadHDRI(url, labelAr = 'تهيئة إضاءة السماء الواقعية HDRI') {
    if (this.hdriCache.has(url)) return this.hdriCache.get(url).envTex;
    this.totalTracked++;
    try {
      const hdrTex = await this.rgbeLoader.loadAsync(url);
      hdrTex.mapping = THREE.EquirectangularReflectionMapping;
      const rt = this.pmrem.fromEquirectangular(hdrTex);
      hdrTex.dispose();
      const envTex = rt.texture;
      this.hdriCache.set(url, { envTex, rt });
      this.loadedTracked++;
      this.emitProgress(labelAr);
      return envTex;
    } catch {
      this.loadedTracked++;
      this.emitProgress(labelAr);
      return null;
    }
  }

  dispose() {
    this.dracoLoader.dispose();
    this.pmrem.dispose();
    for (const entry of this.hdriCache.values()) {
      if (entry.rt) entry.rt.dispose();
    }
  }
}
