/**
 * =========================================================================
 *  CENTRALIZED AAA 3D ASSET MANIFEST (src/assets/assetManifest.js v28)
 *  - ZERO low-poly cartoon/Kenney placeholders
 *  - Real Poly Haven 1K Photographic HDRI Skyboxes (Sunset, Day & Night)
 *  - Real Poly Haven Scanned PBR Surfaces + Draco-Compressed BMW Vision GLB
 *  - Designed & Developed by ENG / Mohamed Tarek • HEY Edition
 * =========================================================================
 */

export const ASSET_MANIFEST = {
  dracoDecoderPath: './vendor/draco/',

  hdris: {
    sunset: './assets/hdri/paris_sunset_1k.hdr',
    day: './assets/hdri/paris_day_1k.hdr',
    night: './assets/hdri/paris_night_1k.hdr',
  },

  pbrTextures: {
    asphalt: {
      diff: './assets/textures/asphalt_diff.jpg',
      nor: './assets/textures/asphalt_nor.jpg',
      rough: './assets/textures/asphalt_rough.jpg',
      ao: './assets/textures/asphalt_ao.jpg',
    },
    cobble: {
      diff: './assets/textures/cobble_diff.jpg',
      nor: './assets/textures/cobble_nor.jpg',
      rough: './assets/textures/cobble_rough.jpg',
    },
    parquet: {
      diff: './assets/textures/parquet_diff.jpg',
      nor: './assets/textures/parquet_nor.jpg',
      rough: './assets/textures/parquet_rough.jpg',
    },
    marble: {
      diff: './assets/textures/marble_diff.jpg',
      nor: './assets/textures/marble_nor.jpg',
    },
    stone: {
      diff: './assets/textures/stone_diff.jpg',
      nor: './assets/textures/stone_nor.jpg',
    },
  },

  models: {
    heroBmw: './assets/models/cars/bmw_hero.glb',
    characters: {
      bobsCat: './assets/models/persian-cat.glb',
      bobsCoat: './assets/models/persian-cat-coat.jpg',
      humanAvatar: './assets/models/visitor-rpm.glb',
      humanWalkAnim: './assets/models/anim-walk.glb',
      humanIdleAnim: './assets/models/anim-idle.glb',
    },
  },
};
