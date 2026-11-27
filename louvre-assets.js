/**
 * =========================================================================
 *  HIGH-CRAFT 60FPS PARIS METROPOLIS & LOUVRE PBR ASSETS (louvre-assets.js v26)
 *  - Scanned 512px CC0 Poly Haven PBR Maps (cobble, parquet, marble, stone)
 *  - Procedural Parisian Boulevard Asphalt, Luxury Shopping Mall, Residential
 *    Apartments/Real-Estate Facades, Police Precinct, Metro Sign, Eiffel Lattice
 *  - Custom Anas Habib Striped Jersey Outfit Texture & 3D Floating Nameplates
 *  - ZERO exclamation marks in any visible canvas text
 *  - Designed & Developed by ENG / Mohamed Tarek • HEY Edition
 * =========================================================================
 */

import * as THREE from './vendor/three.module.min.js';

function makeCanvas(w, h) {
  const c = document.createElement('canvas');
  c.width = w;
  c.height = h;
  return { c, ctx: c.getContext('2d') };
}

function finalizeTex(canvas, repX = 1, repY = 1, isColor = true, aniso = 4) {
  const tex = new THREE.CanvasTexture(canvas);
  tex.wrapS = THREE.RepeatWrapping;
  tex.wrapT = THREE.RepeatWrapping;
  tex.repeat.set(repX, repY);
  if (isColor) tex.colorSpace = THREE.SRGBColorSpace;
  tex.anisotropy = aniso;
  tex.needsUpdate = true;
  return tex;
}

export function loadRealPBRSet(loader, diffPath, norPath, roughPath, repX, repY, aniso = 4) {
  const prep = (path, isColor) => {
    const tex = loader.load(path);
    tex.wrapS = THREE.RepeatWrapping;
    tex.wrapT = THREE.RepeatWrapping;
    tex.repeat.set(repX, repY);
    if (isColor) tex.colorSpace = THREE.SRGBColorSpace;
    tex.anisotropy = aniso;
    return tex;
  };
  return {
    map: prep(diffPath, true),
    normalMap: norPath ? prep(norPath, false) : null,
    roughnessMap: roughPath ? prep(roughPath, false) : null,
  };
}

export function createGlowTexture() {
  const { c, ctx } = makeCanvas(128, 128);
  const g = ctx.createRadialGradient(64, 64, 2, 64, 64, 64);
  g.addColorStop(0, 'rgba(255, 250, 232, 1)');
  g.addColorStop(0.28, 'rgba(255, 224, 152, 0.85)');
  g.addColorStop(0.65, 'rgba(244, 184, 82, 0.28)');
  g.addColorStop(1, 'rgba(0, 0, 0, 0)');
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, 128, 128);
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  return t;
}

export function createLightBeamTexture() {
  const { c, ctx } = makeCanvas(128, 256);
  const g = ctx.createLinearGradient(0, 0, 0, 256);
  g.addColorStop(0, 'rgba(255, 236, 184, 0.56)');
  g.addColorStop(0.55, 'rgba(255, 218, 138, 0.16)');
  g.addColorStop(1, 'rgba(255, 200, 100, 0)');
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, 128, 256);
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  return t;
}

export function createCloudTexture() {
  const { c, ctx } = makeCanvas(256, 128);
  const puffs = [[76, 70, 56], [126, 54, 64], [176, 68, 52], [116, 80, 48], [156, 80, 44]];
  puffs.forEach(([x, y, r]) => {
    const g = ctx.createRadialGradient(x, y, r * 0.12, x, y, r);
    g.addColorStop(0, 'rgba(255, 255, 255, 0.92)');
    g.addColorStop(0.55, 'rgba(255, 245, 235, 0.45)');
    g.addColorStop(1, 'rgba(255, 240, 225, 0)');
    ctx.fillStyle = g;
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2);
    ctx.fill();
  });
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  return t;
}

/* ==================== PARIS ASPHALT TWO-LANE BOULEVARD TEXTURE ==================== */
export function createParisAsphaltRoadTexture(aniso = 4) {
  const { c, ctx } = makeCanvas(512, 512);
  ctx.fillStyle = '#25262a';
  ctx.fillRect(0, 0, 512, 512);
  // Subtle aggregate road grain
  for (let i = 0; i < 4200; i++) {
    const v = 30 + ((i * 29) % 24);
    ctx.fillStyle = `rgb(${v},${v},${v + 3})`;
    ctx.fillRect((i * 73) % 512, (i * 131) % 512, 2, 2);
  }
  // Subtle tire wear tracks
  ctx.fillStyle = 'rgba(14, 15, 18, 0.34)';
  ctx.fillRect(82, 0, 52, 512);
  ctx.fillRect(166, 0, 52, 512);
  ctx.fillRect(294, 0, 52, 512);
  ctx.fillRect(378, 0, 52, 512);
  // Edge curb lines
  ctx.fillStyle = 'rgba(232, 224, 210, 0.72)';
  ctx.fillRect(14, 0, 7, 512);
  ctx.fillRect(491, 0, 7, 512);
  // Crisp dashed center divider
  ctx.fillStyle = 'rgba(248, 240, 218, 0.92)';
  for (let y = 16; y < 512; y += 96) {
    ctx.fillRect(251, y, 10, 54);
  }
  return finalizeTex(c, 1, 22, true, aniso);
}

/* ==================== HAUSSMANN PARIS RESIDENTIAL APARTMENTS FACADE ==================== */
export function createHaussmannFacadePBR(aniso = 4) {
  const { c, ctx } = makeCanvas(512, 512);
  const { c: emC, ctx: em } = makeCanvas(512, 512);
  ctx.fillStyle = '#d7cbb7';
  ctx.fillRect(0, 0, 512, 512);
  em.fillStyle = '#000000';
  em.fillRect(0, 0, 512, 512);

  ctx.strokeStyle = 'rgba(92, 78, 62, 0.25)';
  ctx.lineWidth = 1.5;
  for (let y = 0; y < 512; y += 22) {
    ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(512, y); ctx.stroke();
  }

  ctx.fillStyle = '#2d231c';
  ctx.fillRect(0, 396, 512, 116);
  ctx.fillStyle = '#c9a04c';
  ctx.fillRect(0, 390, 512, 8);
  for (let x = 22; x < 490; x += 122) {
    const sg = ctx.createLinearGradient(x, 408, x, 502);
    sg.addColorStop(0, '#ffe3a8');
    sg.addColorStop(1, '#9d6225');
    ctx.fillStyle = sg;
    ctx.fillRect(x, 408, 96, 94);
    ctx.strokeStyle = '#d8ae58';
    ctx.lineWidth = 3;
    ctx.strokeRect(x, 408, 96, 94);
    em.fillStyle = '#ffc56b';
    em.fillRect(x + 4, 412, 88, 86);
  }

  const floorY = [32, 152, 272];
  floorY.forEach((fy, fi) => {
    ctx.fillStyle = '#c0b097';
    ctx.fillRect(0, fy - 12, 512, 10);
    for (let col = 0; col < 4; col++) {
      const wx = 30 + col * 120;
      const lit = (col + fi) % 3 !== 1;
      ctx.fillStyle = '#efe5d4';
      ctx.fillRect(wx - 7, fy - 5, 78, 98);
      ctx.fillStyle = lit ? '#ffdc96' : '#313d4d';
      ctx.fillRect(wx, fy, 64, 88);
      if (lit) {
        em.fillStyle = (col + fi) % 2 === 0 ? '#ffc46a' : '#df9848';
        em.fillRect(wx + 2, fy + 2, 60, 84);
      }
      ctx.strokeStyle = '#f8f2e6';
      ctx.lineWidth = 2.2;
      ctx.strokeRect(wx, fy, 64, 88);
      ctx.beginPath(); ctx.moveTo(wx + 32, fy); ctx.lineTo(wx + 32, fy + 88); ctx.stroke();
      ctx.fillStyle = '#202227';
      ctx.fillRect(wx - 5, fy + 58, 74, 3);
      ctx.fillRect(wx - 5, fy + 85, 74, 4);
      for (let bx = wx; bx <= wx + 64; bx += 10) ctx.fillRect(bx, fy + 58, 2, 28);
    }
  });
  return {
    map: finalizeTex(c, 1, 1, true, aniso),
    emissiveMap: finalizeTex(emC, 1, 1, true, aniso),
  };
}

/* ==================== MODERN PARIS LUXURY APARTMENT / REAL-ESTATE TOWER ==================== */
export function createModernApartmentTowerPBR(aniso = 4) {
  const { c, ctx } = makeCanvas(512, 512);
  const { c: emC, ctx: em } = makeCanvas(512, 512);
  ctx.fillStyle = '#cbc3b7';
  ctx.fillRect(0, 0, 512, 512);
  em.fillStyle = '#000000';
  em.fillRect(0, 0, 512, 512);

  // Horizontal modern concrete balcony slabs
  for (let row = 0; row < 5; row++) {
    const y = 20 + row * 94;
    ctx.fillStyle = '#e8e0d4';
    ctx.fillRect(0, y + 66, 512, 14);
    ctx.fillStyle = '#8b8378';
    ctx.fillRect(0, y + 80, 512, 6);
    for (let col = 0; col < 4; col++) {
      const x = 18 + col * 124;
      const lit = (row * 3 + col) % 3 !== 2;
      ctx.fillStyle = lit ? '#ffe4ad' : '#2a3a4f';
      ctx.fillRect(x, y, 102, 64);
      if (lit) {
        em.fillStyle = (row + col) % 2 === 0 ? '#ffd07c' : '#d89b4e';
        em.fillRect(x + 3, y + 3, 96, 58);
      }
      // Glass balcony balustrade
      ctx.fillStyle = 'rgba(138, 198, 224, 0.42)';
      ctx.fillRect(x - 4, y + 36, 110, 30);
      ctx.strokeStyle = '#31363d';
      ctx.lineWidth = 2;
      ctx.strokeRect(x, y, 102, 64);
    }
  }
  return {
    map: finalizeTex(c, 1, 1, true, aniso),
    emissiveMap: finalizeTex(emC, 1, 1, true, aniso),
  };
}

/* ==================== GALERIES PARIS LUXURY SHOPPING MALL FACADE ==================== */
export function createParisMallFacadePBR(aniso = 4) {
  const { c, ctx } = makeCanvas(512, 512);
  const { c: emC, ctx: em } = makeCanvas(512, 512);
  ctx.fillStyle = '#1f1c1a';
  ctx.fillRect(0, 0, 512, 512);
  em.fillStyle = '#000000';
  em.fillRect(0, 0, 512, 512);

  // Gold gilded mall architectural frame & giant glass atrium bays
  for (let row = 0; row < 3; row++) {
    const y = 34 + row * 150;
    for (let col = 0; col < 3; col++) {
      const x = 22 + col * 160;
      const g = ctx.createLinearGradient(x, y, x, y + 122);
      g.addColorStop(0, row === 2 ? '#ffe9b8' : '#7cb8db');
      g.addColorStop(0.55, row === 2 ? '#e3a54d' : '#2f5370');
      g.addColorStop(1, '#1d2733');
      ctx.fillStyle = g;
      ctx.fillRect(x, y, 142, 122);
      ctx.strokeStyle = '#e2ba62';
      ctx.lineWidth = 5;
      ctx.strokeRect(x, y, 142, 122);
      em.fillStyle = row === 2 ? '#ffd07a' : '#8ac6e8';
      em.fillRect(x + 6, y + 6, 130, 110);
    }
  }
  // Golden mall banner stripe
  ctx.fillStyle = '#14100d';
  ctx.fillRect(0, 0, 512, 32);
  ctx.fillStyle = '#eed082';
  ctx.fillRect(0, 28, 512, 4);
  return {
    map: finalizeTex(c, 1, 1, true, aniso),
    emissiveMap: finalizeTex(emC, 1, 1, true, aniso),
  };
}

export function createDistrictSignTexture(titleAr, subtitleEn, accentHex = '#e8c268', bgHex = '#14100d') {
  const { c, ctx } = makeCanvas(1024, 224);
  ctx.fillStyle = bgHex;
  ctx.fillRect(0, 0, 1024, 224);
  ctx.strokeStyle = accentHex;
  ctx.lineWidth = 7;
  ctx.strokeRect(12, 12, 1000, 200);
  ctx.textAlign = 'center';
  ctx.direction = 'rtl';
  ctx.fillStyle = '#fbf0cf';
  ctx.font = 'bold 56px Amiri, Georgia, serif';
  ctx.fillText(titleAr, 512, 102);
  ctx.direction = 'ltr';
  ctx.fillStyle = accentHex;
  ctx.font = '600 26px Cinzel, Georgia, serif';
  ctx.fillText(subtitleEn, 512, 166);
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  return t;
}

/* ==================== ANAS HABIB CUSTOM WHITE STRIPED JERSEY TEXTURE ==================== */
export function createAnasJerseyTexture() {
  const { c, ctx } = makeCanvas(512, 512);
  // Crisp clean white streetwear athletic tee
  ctx.fillStyle = '#f4f6f9';
  ctx.fillRect(0, 0, 512, 512);
  // Subtle woven cotton knit micro-shading
  ctx.fillStyle = 'rgba(205, 212, 222, 0.28)';
  for (let y = 0; y < 512; y += 6) ctx.fillRect(0, y, 512, 2);
  // Black crewneck collar & classic 3 black shoulder stripes (matching Photo 3!)
  ctx.fillStyle = '#181a1f';
  ctx.fillRect(0, 0, 512, 34);
  // Three signature stripes across sleeves/shoulder UV region
  for (let s = 0; s < 3; s++) {
    ctx.fillRect(0, 56 + s * 16, 512, 8);
  }
  // Subtle dark athletic piping near lower hem
  ctx.fillStyle = '#1d2026';
  ctx.fillRect(0, 488, 512, 24);
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  t.flipY = false;
  return t;
}

/* ==================== 3D FLOATING GUIDE NAMEPLATE BADGE ==================== */
export function createGuideBadgeTexture(nameAr, subAr, accentHex = '#e8c268') {
  const { c, ctx } = makeCanvas(512, 144);
  ctx.clearRect(0, 0, 512, 144);
  ctx.fillStyle = 'rgba(16, 12, 9, 0.9)';
  ctx.beginPath();
  ctx.roundRect(10, 10, 492, 124, 28);
  ctx.fill();
  ctx.strokeStyle = accentHex;
  ctx.lineWidth = 4;
  ctx.stroke();
  ctx.textAlign = 'center';
  ctx.direction = 'rtl';
  ctx.fillStyle = '#fbf0cf';
  ctx.font = 'bold 40px Amiri, Georgia, serif';
  ctx.fillText(nameAr, 256, 68);
  ctx.fillStyle = accentHex;
  ctx.font = '600 24px Cairo, sans-serif';
  ctx.fillText(subAr, 256, 112);
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  return t;
}

export function createLouvrePalacePBR(aniso = 4) {
  const { c, ctx } = makeCanvas(512, 512);
  const { c: emC, ctx: em } = makeCanvas(512, 512);
  ctx.fillStyle = '#dfd0b6';
  ctx.fillRect(0, 0, 512, 512);
  em.fillStyle = '#000000';
  em.fillRect(0, 0, 512, 512);

  ctx.strokeStyle = 'rgba(116, 98, 74, 0.24)';
  ctx.lineWidth = 1.5;
  for (let y = 0; y < 512; y += 26) {
    ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(512, y); ctx.stroke();
  }

  const rows = [44, 210, 366];
  rows.forEach((ry, ri) => {
    ctx.fillStyle = '#c4b192';
    ctx.fillRect(0, ry - 16, 512, 10);
    for (let col = 0; col < 4; col++) {
      const cx = 64 + col * 128;
      ctx.fillStyle = '#ede2cf';
      ctx.fillRect(cx - 56, ry - 6, 16, 122);
      ctx.fillRect(cx + 40, ry - 6, 16, 122);
      ctx.fillStyle = '#c69e4a';
      ctx.fillRect(cx - 58, ry - 10, 20, 7);
      ctx.fillRect(cx + 38, ry - 10, 20, 7);

      ctx.beginPath();
      ctx.arc(cx, ry + 26, 29, Math.PI, 0);
      ctx.lineTo(cx + 29, ry + 110);
      ctx.lineTo(cx - 29, ry + 110);
      ctx.closePath();
      ctx.fillStyle = ri === 2 ? '#ffe4a2' : '#f4cf84';
      ctx.fill();
      em.beginPath();
      em.arc(cx, ry + 26, 26, Math.PI, 0);
      em.lineTo(cx + 26, ry + 106);
      em.lineTo(cx - 26, ry + 106);
      em.closePath();
      em.fillStyle = ri === 2 ? '#ffcb6e' : '#cc9442';
      em.fill();

      ctx.strokeStyle = '#f5ead6';
      ctx.lineWidth = 3;
      ctx.stroke();
    }
  });
  return {
    map: finalizeTex(c, 2, 1, true, aniso),
    emissiveMap: finalizeTex(emC, 2, 1, true, aniso),
  };
}

export function createMansardRoofPBR(aniso = 4) {
  const { c, ctx } = makeCanvas(256, 256);
  ctx.fillStyle = '#2d343e';
  ctx.fillRect(0, 0, 256, 256);
  for (let x = 0; x < 256; x += 24) {
    ctx.fillStyle = 'rgba(255,255,255,0.08)';
    ctx.fillRect(x, 0, 2, 256);
    ctx.fillStyle = 'rgba(0,0,0,0.22)';
    ctx.fillRect(x + 2, 0, 2, 256);
  }
  return finalizeTex(c, 5, 2, true, aniso);
}

export function createEiffelLatticeTexture(aniso = 4) {
  const { c, ctx } = makeCanvas(256, 512);
  ctx.clearRect(0, 0, 256, 512);
  ctx.strokeStyle = '#5e493a';
  ctx.lineWidth = 10;
  ctx.strokeRect(8, 8, 240, 496);
  ctx.lineWidth = 7;
  for (let y = 0; y < 512; y += 64) {
    ctx.beginPath();
    ctx.moveTo(8, y); ctx.lineTo(248, y + 64);
    ctx.moveTo(248, y); ctx.lineTo(8, y + 64);
    ctx.moveTo(8, y); ctx.lineTo(248, y);
    ctx.stroke();
  }
  return finalizeTex(c, 1, 2, true, aniso);
}

export function createTreeFoliageTexture() {
  const { c, ctx } = makeCanvas(256, 256);
  ctx.clearRect(0, 0, 256, 256);
  const colors = ['#2c4a26', '#3a5c2f', '#4b6e35', '#7e6f32', '#b9883a', '#233b1d'];
  for (let i = 0; i < 160; i++) {
    const a = (i * 2.39996) % (Math.PI * 2);
    const r = Math.sqrt(i / 160) * 102;
    ctx.fillStyle = colors[i % colors.length];
    ctx.beginPath();
    ctx.ellipse(128 + Math.cos(a) * r, 128 + Math.sin(a) * r, 12 + (i % 9), 7 + (i % 6), a, 0, Math.PI * 2);
    ctx.fill();
  }
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  return t;
}

export function createLouvreWallPanelPBR(aniso = 4) {
  const { c, ctx } = makeCanvas(512, 512);
  const g = ctx.createLinearGradient(0, 0, 0, 512);
  g.addColorStop(0, '#eee5d4');
  g.addColorStop(0.75, '#e2d6c0');
  g.addColorStop(1, '#cfc0a6');
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, 512, 512);

  ctx.strokeStyle = '#c89e46';
  ctx.lineWidth = 4;
  ctx.strokeRect(24, 34, 464, 320);
  ctx.strokeStyle = 'rgba(200, 158, 70, 0.5)';
  ctx.lineWidth = 2;
  ctx.strokeRect(36, 46, 440, 296);

  ctx.fillStyle = '#d3c4aa';
  ctx.fillRect(0, 384, 512, 128);
  ctx.fillStyle = '#c89e46';
  ctx.fillRect(0, 380, 512, 6);
  return finalizeTex(c, 9, 1, true, aniso);
}

export function createParchmentTexture(headerAr, titleAr) {
  const { c, ctx } = makeCanvas(512, 660);
  const g = ctx.createLinearGradient(0, 0, 0, 660);
  g.addColorStop(0, '#f8edd3');
  g.addColorStop(0.5, '#f0dec0');
  g.addColorStop(1, '#e1c89c');
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, 512, 660);
  ctx.strokeStyle = '#9a7128';
  ctx.lineWidth = 7;
  ctx.strokeRect(22, 22, 468, 616);
  ctx.strokeStyle = 'rgba(154, 113, 40, 0.45)';
  ctx.lineWidth = 2;
  ctx.strokeRect(36, 36, 440, 588);

  ctx.textAlign = 'center';
  ctx.direction = 'ltr';
  ctx.fillStyle = '#8b6420';
  ctx.font = '600 18px Cinzel, Georgia, serif';
  ctx.fillText('MUSÉE DU LOUVRE  •  HEY EDITION', 256, 86);

  ctx.direction = 'rtl';
  ctx.fillStyle = '#382411';
  ctx.font = '700 32px Amiri, Georgia, serif';
  ctx.fillText(headerAr, 256, 168);

  ctx.fillStyle = '#1b1107';
  ctx.font = '700 40px Amiri, Georgia, serif';
  ctx.fillText(titleAr, 256, 266);

  ctx.fillStyle = 'rgba(72, 49, 24, 0.25)';
  for (let i = 0; i < 6; i++) ctx.fillRect(92, 336 + i * 26, 328 - (i % 2) * 50, 5);

  ctx.fillStyle = '#9c232d';
  ctx.beginPath(); ctx.arc(256, 558, 34, 0, Math.PI * 2); ctx.fill();
  ctx.strokeStyle = '#e7c164'; ctx.lineWidth = 4; ctx.stroke();
  ctx.direction = 'ltr'; ctx.fillStyle = '#fbf0cf';
  ctx.font = '700 18px Cinzel, serif'; ctx.fillText('HEY', 256, 565);

  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  return t;
}

export function createUVSecretOverlayTexture(secretAr, code = 'HEY-19') {
  const { c, ctx } = makeCanvas(512, 384);
  ctx.clearRect(0, 0, 512, 384);
  ctx.strokeStyle = 'rgba(98, 224, 255, 0.85)';
  ctx.lineWidth = 5;
  ctx.setLineDash([14, 10]);
  ctx.strokeRect(18, 18, 476, 348);
  ctx.setLineDash([]);

  ctx.shadowColor = '#5ce1ff';
  ctx.shadowBlur = 14;
  ctx.textAlign = 'center';
  ctx.direction = 'ltr';
  ctx.fillStyle = '#9ef4ff';
  ctx.font = '600 18px Cinzel, serif';
  ctx.fillText(`UV CURATOR SECRET  •  ${code}`, 256, 68);

  ctx.direction = 'rtl';
  ctx.fillStyle = '#e4fdff';
  ctx.font = '700 32px Amiri, Georgia, serif';
  const words = secretAr.split(' ');
  let line = '', y = 172;
  for (const w of words) {
    if ((line + ' ' + w).length > 23) {
      ctx.fillText(line.trim(), 256, y);
      line = w + ' ';
      y += 48;
    } else line += w + ' ';
  }
  if (line.trim()) ctx.fillText(line.trim(), 256, y);

  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  return t;
}

export function createDefaultCustomLouvreCanvas() {
  const { c, ctx } = makeCanvas(640, 480);
  const g = ctx.createRadialGradient(320, 210, 20, 320, 240, 380);
  g.addColorStop(0, '#2a1d13');
  g.addColorStop(1, '#120c08');
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, 640, 480);
  ctx.strokeStyle = '#e6c064';
  ctx.lineWidth = 5;
  ctx.strokeRect(20, 20, 600, 440);
  ctx.textAlign = 'center';
  ctx.direction = 'rtl';
  ctx.fillStyle = '#fbf0cf';
  ctx.font = '700 40px Amiri, Georgia, serif';
  ctx.fillText('لوحتك التذكارية على جدار اللوفر', 320, 195);
  ctx.fillStyle = '#e8c268';
  ctx.font = '600 24px Cairo, sans-serif';
  ctx.fillText('اضغط على الحامل الذهبي للرسم والتوقيع ليمنى', 320, 265);
  ctx.direction = 'ltr';
  ctx.fillStyle = 'rgba(232,194,104,0.72)';
  ctx.font = '600 18px Cinzel, serif';
  ctx.fillText('HEY LIVE MUSEUM ATELIER • 5 DECEMBER', 320, 396);
  return c;
}

export function createLouvreSignTexture() {
  return createDistrictSignTexture('متحف اللوفر • معرض رحلة يمنى', 'MUSÉE DU LOUVRE PARIS  •  HEY EDITION  •  5 DECEMBER');
}

export function createPawPrintTexture() {
  const { c, ctx } = makeCanvas(128, 128);
  ctx.clearRect(0, 0, 128, 128);
  ctx.fillStyle = 'rgba(255, 224, 140, 0.92)';
  ctx.beginPath(); ctx.ellipse(64, 78, 22, 18, 0, 0, Math.PI * 2); ctx.fill();
  [[36, 48], [54, 34], [74, 34], [92, 48]].forEach(([x, y]) => {
    ctx.beginPath(); ctx.ellipse(x, y, 9, 12, 0, 0, Math.PI * 2); ctx.fill();
  });
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  return t;
}
