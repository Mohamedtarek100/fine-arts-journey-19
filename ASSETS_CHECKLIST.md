# AAA 3D Assets Checklist — Paris Metropolis & Musée du Louvre 3D (HEY Edition)

This project loads all 3D models, HDRI environment maps, and PBR textures cleanly through `src/assets/assetManifest.js` and `src/assets/AssetManager.js` (powered by Three.js `r170` `GLTFLoader` + self-hosted WebAssembly `DRACOLoader` + `RGBELoader`).

All active models and HDRIs listed below are **already downloaded, verified, and self-hosted locally** so GitHub Pages loads with zero broken external links. You can also swap any `.glb` below with higher-poly Sketchfab CC-BY or Mixamo upgrades using the exact same filename and `scripts/optimize-models.sh`.

---

## 1. HDRI Environment Maps (`assets/hdri/`)
| File | Status | Source & License | Role |
| :--- | :--- | :--- | :--- |
| `paris_sunset_1k.hdr` | Installed | Poly Haven (`venice_sunset_1k.hdr`, CC0 1.0) | Golden-hour IBL reflections on BMW clearcoat, Louvre glass pyramid & wet asphalt |
| `paris_night_1k.hdr` | Installed | Poly Haven (`blaubeuren_night_1k.hdr`, CC0 1.0) | Night European cobblestone square IBL reflections & warm streetlight bounce |

## 2. Photogrammetry Scanned PBR Textures (`assets/textures/`)
All textures are resized to `512×512` Q80 JPGs (~`35–75 KB` each) for instant mobile loading and 60FPS streaming.

| Surface | Files | Source & License |
| :--- | :--- | :--- |
| Parisian Boulevard Asphalt | `asphalt_diff.jpg`, `asphalt_nor.jpg`, `asphalt_rough.jpg`, `asphalt_ao.jpg` | Poly Haven (`asphalt_03`, CC0 1.0) |
| Champs-Élysées / Cour Napoléon Pavés | `cobble_diff.jpg`, `cobble_nor.jpg`, `cobble_rough.jpg` | Poly Haven (`cobblestone_floor_08`, CC0 1.0) |
| Louvre Grande Galerie Parquet | `parquet_diff.jpg`, `parquet_nor.jpg`, `parquet_rough.jpg` | Poly Haven (`herringbone_parquet`, CC0 1.0) |
| Grand Rotunda Carrara Marble | `marble_diff.jpg`, `marble_nor.jpg` | Poly Haven (`marble_01`, CC0 1.0) |
| Parisian Limestone Facades | `stone_diff.jpg`, `stone_nor.jpg` | Poly Haven (`sandstone_blocks_05`, CC0 1.0) |

## 3. Hero Drivable BMW & Traffic Vehicles (`assets/models/cars/`)
| File | Status | Budget | Expected Nodes / Materials | Recommended Source |
| :--- | :--- | :--- | :--- | :--- |
| `bmw_hero.glb` | Installed | `< 4.5 MB` (Draco `< 1.5 MB`) | Body paint mesh (`MeshPhysicalMaterial` clearcoat), glass windows, headlights, taillights, wheel meshes (`wheel` / `tire` / `rim` auto-detected for rotation & front steering) | Installed real BMW 3D GLB; optional swap with Sketchfab CC-BY BMW M4/M8 (`gltf-transform draco`) |
| `police.glb` | Installed | `< 250 KB` | `wheel-front-left`, `wheel-front-right`, `wheel-back-left`, `wheel-back-right`, `body` | Kenney Car Kit (CC0 1.0) |
| `taxi.glb`, `sedan.glb`, `sedan-sports.glb`, `suv.glb` | Installed | `< 250 KB` each | Separate 4 wheel nodes + chassis | Kenney Car Kit (CC0 1.0) |

## 4. Modular City Architecture & Foliage (`assets/models/city/`)
| File | Status | Budget | Role | Source & License |
| :--- | :--- | :--- | :--- | :--- |
| `building-type-a.glb` .. `building-type-f.glb` | Installed | `< 160 KB` each | Modular 3D architectural urban facades lining the 525m boulevard | Kenney City Kit (CC0 1.0) |
| `tree-large.glb`, `tree-small.glb`, `planter.glb` | Installed | `< 35 KB` each | Real 3D boulevard trees & planters | Kenney City Kit (CC0 1.0) |

## 5. Skeletal Rigged Characters (`assets/models/`)
| File | Status | Budget | Expected Rig / Clips | Source & License |
| :--- | :--- | :--- | :--- | :--- |
| `persian-cat.glb` + `persian-cat-coat.jpg` | Installed | `< 2.3 MB` | 40-bone feline skeleton (`Wolf_*` rest-axis solver for Walk, Groom/Lick Paw, Play, Explaining Nod) | Sketchfab Bicolor Cat (CC BY 4.0, reskinned into Bobs) |
| `visitor-rpm.glb` | Installed | `< 1.9 MB` | Humanoid skeleton (`Head`, `Wolf3D_Beard`, `Wolf3D_Outfit_Top/Bottom/Footwear`) powering pedestrians, Police Officer & Anas Habib custom guide | Three.js / Ready Player Me (MIT) |
| `anim-walk.glb`, `anim-idle.glb` | Installed | `< 130 KB` each | Skeletal `AnimationClip` index `0` (`Walking`, `Idle`) — compatible with Mixamo retargeted clips | Ready Player Me Animation Library (MIT) |

---

## Compressing Custom Drop-In GLBs
Before replacing any `.glb` with a high-poly Sketchfab/Mixamo asset, run:
```bash
bash scripts/optimize-models.sh assets/models/cars/bmw_hero.glb
```
Target budget per hero asset: **under 50,000 triangles and under 3 MB** after Draco + texture resize (`1024px`).
