/**
 * =========================================================================
 *  CENTRALIZED AAA 3D ASSET MANIFEST (src/assets/assetManifest.js)
 *  - Every path is strictly verified local inside ./assets/ & ./vendor/
 *  - Zero unverified external CDN links -> 100% CSP-safe & offline-resilient
 *  - Supports seamless drop-in Draco-compressed GLB upgrades (see ASSETS_CHECKLIST.md)
 *  - Designed & Developed by ENG / Mohamed Tarek • HEY Edition
 * =========================================================================
 */

export const ASSET_MANIFEST = {
  dracoDecoderPath: './vendor/draco/',

  hdris: {
    sunset: './assets/hdri/paris_sunset_1k.hdr',
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
    traffic: {
      police: './assets/models/cars/police.glb',
      taxi: './assets/models/cars/taxi.glb',
      sedan: './assets/models/cars/sedan.glb',
      sports: './assets/models/cars/sedan-sports.glb',
      suv: './assets/models/cars/suv.glb',
    },
    characters: {
      bobsCat: './assets/models/persian-cat.glb',
      bobsCoat: './assets/models/persian-cat-coat.jpg',
      humanAvatar: './assets/models/visitor-rpm.glb',
      humanWalkAnim: './assets/models/anim-walk.glb',
      humanIdleAnim: './assets/models/anim-idle.glb',
    },
    city: {
      buildingA: './assets/models/city/building-type-a.glb',
      buildingB: './assets/models/city/building-type-b.glb',
      buildingC: './assets/models/city/building-type-c.glb',
      buildingD: './assets/models/city/building-type-d.glb',
      buildingE: './assets/models/city/building-type-e.glb',
      buildingF: './assets/models/city/building-type-f.glb',
      treeLarge: './assets/models/city/tree-large.glb',
      treeSmall: './assets/models/city/tree-small.glb',
      planter: './assets/models/city/planter.glb',
    },
  },
};
