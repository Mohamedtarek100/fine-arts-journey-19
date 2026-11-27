# Photorealistic Paris & Musée du Louvre 3D — AAA Assets Checklist (v28)

All low-poly cartoon placeholders have been permanently removed. Every skybox, road surface, vehicle, and character is driven by real photographic HDRIs, scanned PBR maps, or skeletal/Draco `.glb` meshes loaded through `src/assets/assetManifest.js` and `src/assets/AssetManager.js`.

---

## 1. Real Photographic 1K HDRI Skyboxes & IBL (`assets/hdri/`)
| File | Status | Source & License | Usage |
| :--- | :--- | :--- | :--- |
| `paris_sunset_1k.hdr` | Installed | Poly Haven (`venice_sunset_1k.hdr`, CC0 1.0) | Direct `scene.background` + `scene.environment` golden-hour sky & clearcoat reflections |
| `paris_day_1k.hdr` | Installed | Poly Haven (`kloofendal_48d_partly_cloudy_puresky_1k.hdr`, CC0 1.0) | Photographic European daylight skybox & crisp IBL |
| `paris_night_1k.hdr` | Installed | Poly Haven (`blaubeuren_night_1k.hdr`, CC0 1.0) | Photographic European night square HDRI reflections |

## 2. Photogrammetry Scanned PBR Maps (`assets/textures/`)
| Surface | Files | Source & License |
| :--- | :--- | :--- |
| Wet Champs-Élysées Asphalt | `asphalt_diff.jpg`, `asphalt_nor.jpg`, `asphalt_rough.jpg`, `asphalt_ao.jpg` | Poly Haven (`asphalt_03`, CC0 1.0) |
| Parisian Pavés Cobblestone | `cobble_diff.jpg`, `cobble_nor.jpg`, `cobble_rough.jpg` | Poly Haven (`cobblestone_floor_08`, CC0 1.0) |
| Louvre Grande Galerie Parquet | `parquet_diff.jpg`, `parquet_nor.jpg`, `parquet_rough.jpg` | Poly Haven (`herringbone_parquet`, CC0 1.0) |
| Grand Rotunda Carrara Marble | `marble_diff.jpg`, `marble_nor.jpg` | Poly Haven (`marble_01`, CC0 1.0) |
| Haussmann Cream Limestone | `stone_diff.jpg`, `stone_nor.jpg` | Poly Haven (`sandstone_blocks_05`, CC0 1.0) |

## 3. Hero Drivable BMW & Realistic Boulevard Traffic (`assets/models/cars/`)
| File | Status | Budget | Details |
| :--- | :--- | :--- | :--- |
| `bmw_hero.glb` | Installed (`4.18 MB`, Draco) | `< 5 MB` | Real Draco-compressed BMW Vision sports roadster with `MeshPhysicalMaterial` automotive clearcoat, glowing headlights & red LED taillights, parked right at Station 1 and cloned with realistic metallic finishes (Graphite, Silver, Navy, Obsidian, Police Interceptor) for zero-cartoon boulevard traffic |

## 4. Skeletal Rigged Characters (`assets/models/`)
| File | Status | Budget | Details |
| :--- | :--- | :--- | :--- |
| `persian-cat.glb` + `persian-cat-coat.jpg` | Installed | `< 2.3 MB` | 40-bone golden Persian cat (**القطة بوبس**) with walk, groom, play, explaining nod, and BMW passenger ride animations |
| `visitor-rpm.glb`, `anim-walk.glb`, `anim-idle.glb` | Installed | `< 2.0 MB` | MIT rigged humanoid skeleton powering Parisian pedestrians, Police Officer, and **أنس حبيب** (custom curly-hair & striped-jersey guide for يوسف) |

## 5. Optional Custom Drop-In Upgrades
Drop any Sketchfab CC-BY or Mixamo `.glb` compressed via `scripts/optimize-models.sh` (`< 5 MB`, Draco + WebP `1024px`) into `assets/models/` and update its entry in `src/assets/assetManifest.js`.
