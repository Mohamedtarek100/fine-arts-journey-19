/**
 * =========================================================================
 *  LIGHTWEIGHT PHOTOREALISTIC PBR TEXTURE SUITE (louvre-assets.js v24)
 *  Uses compressed 512px CC0 Photogrammetry Scanned Normal/Roughness/Albedo
 *  maps + fast cached architectural canvases for silky 60FPS performance.
 *  Zero exclamation marks in all museum copy • HEY Edition
 *  Designed & Developed by ENG / Mohamed Tarek
 * =========================================================================
 */

import * as THREE from './vendor/three.module.min.js';

function makeCanvas(w, h) {
  const c = document.createElement('canvas');
  c.width = w;
  c.height = h;
  return [c, c.getContext('2d')];
}

function toTex(canvas, { repeatX = 1, repeatY = 1, srgb = true, aniso = 4 } = {}) {
  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = srgb ? THREE.SRGBColorSpace : THREE.NoColorSpace;
  tex.wrapS = THREE.RepeatWrapping;
  tex.wrapT = THREE.RepeatWrapping;
  tex.repeat.set(repeatX, repeatY);
  tex.anisotropy = aniso;
  return tex;
}

export function loadRealPBRSet(loader, diffPath, norPath, roughPath, repeatX, repeatY, aniso = 4) {
  const cfg = (tex, srgb) => {
    tex.colorSpace = srgb ? THREE.SRGBColorSpace : THREE.NoColorSpace;
    tex.wrapS = THREE.RepeatWrapping;
    tex.wrapT = THREE.RepeatWrapping;
    tex.repeat.set(repeatX, repeatY);
    tex.anisotropy = aniso;
    return tex;
  };
  return {
    map: cfg(loader.load(diffPath), true),
    normalMap: norPath ? cfg(loader.load(norPath), false) : null,
    roughnessMap: roughPath ? cfg(loader.load(roughPath), false) : null,
  };
}

export function createGlowTexture(inner = 'rgba(255,248,225,1)', mid = 'rgba(244,200,104,0.62)') {
  const [c, ctx] = makeCanvas(128, 128);
  const g = ctx.createRadialGradient(64, 64, 0, 64, 64, 64);
  g.addColorStop(0, inner);
  g.addColorStop(0.32, mid);
  g.addColorStop(0.7, 'rgba(232,175,85,0.12)');
  g.addColorStop(1, 'rgba(0,0,0,0)');
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, 128, 128);
  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

export function createLightBeamTexture() {
  const [c, ctx] = makeCanvas(96, 256);
  const g = ctx.createLinearGradient(0, 0, 0, 256);
  g.addColorStop(0, 'rgba(255, 236, 185, 0.34)');
  g.addColorStop(0.45, 'rgba(245, 200, 118, 0.12)');
  g.addColorStop(1, 'rgba(245, 200, 118, 0)');
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, 96, 256);
  ctx.globalCompositeOperation = 'destination-in';
  const hg = ctx.createLinearGradient(0, 0, 96, 0);
  hg.addColorStop(0, 'rgba(0,0,0,0)');
  hg.addColorStop(0.28, 'rgba(0,0,0,1)');
  hg.addColorStop(0.72, 'rgba(0,0,0,1)');
  hg.addColorStop(1, 'rgba(0,0,0,0)');
  ctx.fillStyle = hg;
  ctx.fillRect(0, 0, 96, 256);
  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

export function createCloudTexture() {
  const [c, ctx] = makeCanvas(256, 128);
  [[82, 74, 48], [122, 62, 56], [164, 72, 46], [105, 82, 42], [148, 80, 42], [62, 82, 32], [190, 82, 30]].forEach(([x, y, r]) => {
    const g = ctx.createRadialGradient(x, y - r * 0.18, r * 0.08, x, y, r);
    g.addColorStop(0, 'rgba(255, 246, 235, 0.72)');
    g.addColorStop(0.55, 'rgba(242, 210, 185, 0.32)');
    g.addColorStop(1, 'rgba(242, 210, 185, 0)');
    ctx.fillStyle = g;
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2);
    ctx.fill();
  });
  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

export function createHaussmannFacadePBR(aniso = 4) {
  const [c, ctx] = makeCanvas(512, 512);
  const [e, ectx] = makeCanvas(512, 512);
  ctx.scale(0.5, 0.5);
  ectx.scale(0.5, 0.5);

  const bg = ctx.createLinearGradient(0, 0, 0, 1024);
  bg.addColorStop(0, '#e6dac6');
  bg.addColorStop(0.65, '#d5c3a8');
  bg.addColorStop(1, '#b8a386');
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, 1024, 1024);
  ectx.fillStyle = '#000000';
  ectx.fillRect(0, 0, 1024, 1024);

  for (let y = 0; y < 740; y += 34) {
    ctx.strokeStyle = 'rgba(98, 78, 55, 0.24)';
    ctx.lineWidth = 2;
    ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(1024, y); ctx.stroke();
  }
  [44, 266, 494, 728].forEach((y) => {
    ctx.fillStyle = '#f2e8d7'; ctx.fillRect(0, y, 1024, 14);
    ctx.fillStyle = 'rgba(62, 46, 30, 0.45)'; ctx.fillRect(0, y + 14, 1024, 8);
  });

  const floorYs = [74, 300, 528];
  const colXs = [68, 302, 536, 770];
  floorYs.forEach((fy, fi) => {
    colXs.forEach((wx, ci) => {
      const ww = 166, wh = 186;
      const lit = (fi + ci) % 3 !== 1;
      ctx.fillStyle = '#efe4d2'; ctx.fillRect(wx - 12, fy - 14, ww + 24, wh + 20);
      ctx.strokeStyle = 'rgba(80, 60, 40, 0.5)'; ctx.lineWidth = 3; ctx.strokeRect(wx - 12, fy - 14, ww + 24, wh + 20);

      const wg = ctx.createLinearGradient(wx, fy, wx, fy + wh);
      if (lit) { wg.addColorStop(0, '#ffe1a4'); wg.addColorStop(0.55, '#e2a14c'); wg.addColorStop(1, '#7c481e'); }
      else { wg.addColorStop(0, '#465672'); wg.addColorStop(0.5, '#262d3e'); wg.addColorStop(1, '#161924'); }
      ctx.fillStyle = wg; ctx.fillRect(wx, fy, ww, wh);

      ctx.fillStyle = lit ? 'rgba(120, 64, 28, 0.34)' : 'rgba(14, 18, 28, 0.5)';
      ctx.fillRect(wx, fy, 26, wh); ctx.fillRect(wx + ww - 26, fy, 26, wh);

      if (lit) {
        const eg = ectx.createLinearGradient(wx, fy, wx, fy + wh);
        eg.addColorStop(0, '#ffcf76'); eg.addColorStop(0.7, '#b86c22'); eg.addColorStop(1, '#4a250a');
        ectx.fillStyle = eg; ectx.fillRect(wx + 6, fy + 6, ww - 12, wh - 12);
      }

      ctx.strokeStyle = '#f0e8dc'; ctx.lineWidth = 5;
      ctx.strokeRect(wx + 2, fy + 2, ww - 4, wh - 4);
      ctx.beginPath();
      ctx.moveTo(wx + ww / 2, fy); ctx.lineTo(wx + ww / 2, fy + wh);
      ctx.moveTo(wx, fy + wh * 0.38); ctx.lineTo(wx + ww, fy + wh * 0.38);
      ctx.moveTo(wx, fy + wh * 0.7); ctx.lineTo(wx + ww, fy + wh * 0.7);
      ctx.stroke();

      const railY = fy + wh * 0.64, railH = wh * 0.36;
      ctx.strokeStyle = '#191b20'; ctx.lineWidth = 4;
      ctx.strokeRect(wx - 6, railY, ww + 12, railH);
      for (let rx = wx + 4; rx <= wx + ww - 4; rx += 16) {
        ctx.beginPath(); ctx.moveTo(rx, railY); ctx.lineTo(rx, railY + railH); ctx.stroke();
      }
    });
  });

  ctx.fillStyle = '#211915'; ctx.fillRect(0, 748, 1024, 276);
  ctx.fillStyle = '#cfa656'; ctx.fillRect(0, 748, 1024, 8); ctx.fillRect(0, 792, 1024, 4);
  ctx.fillStyle = '#f4d68c'; ctx.textAlign = 'center'; ctx.direction = 'ltr';
  ctx.font = '600 26px Cinzel, Georgia, serif';
  ctx.fillText('CAFÉ DE RIVOLI  •  PATISSERIE PARISIENNE  •  ATELIER HEY', 512, 780);

  [54, 378, 702].forEach((sx) => {
    const sw = 268, sh = 198, sy = 812;
    const cg = ctx.createLinearGradient(sx, sy, sx, sy + sh);
    cg.addColorStop(0, '#ffe4aa'); cg.addColorStop(0.55, '#d88e3e'); cg.addColorStop(1, '#592e12');
    ctx.fillStyle = cg; ctx.fillRect(sx, sy, sw, sh);
    ectx.fillStyle = '#df9e46'; ectx.fillRect(sx + 8, sy + 8, sw - 16, sh - 16);
    ctx.strokeStyle = '#b88c3c'; ctx.lineWidth = 5; ctx.strokeRect(sx, sy, sw, sh);
  });

  return {
    map: toTex(c, { repeatX: 1, repeatY: 1, srgb: true, aniso }),
    emissiveMap: toTex(e, { repeatX: 1, repeatY: 1, srgb: true, aniso }),
  };
}

export function createLouvrePalacePBR(aniso = 4) {
  const [c, ctx] = makeCanvas(512, 512);
  const [e, ectx] = makeCanvas(512, 512);
  ctx.scale(0.5, 0.5);
  ectx.scale(0.5, 0.5);

  const lg = ctx.createLinearGradient(0, 0, 0, 1024);
  lg.addColorStop(0, '#eadcc3'); lg.addColorStop(0.55, '#d6c09d'); lg.addColorStop(1, '#b69d79');
  ctx.fillStyle = lg; ctx.fillRect(0, 0, 1024, 1024);
  ectx.fillStyle = '#000000'; ectx.fillRect(0, 0, 1024, 1024);

  ctx.strokeStyle = 'rgba(98, 76, 48, 0.25)'; ctx.lineWidth = 2;
  for (let y = 0; y < 1024; y += 32) { ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(1024, y); ctx.stroke(); }
  [28, 344, 670].forEach((y) => {
    ctx.fillStyle = '#f4e8d2'; ctx.fillRect(0, y, 1024, 24);
    ctx.fillStyle = 'rgba(68, 48, 28, 0.5)'; ctx.fillRect(0, y + 24, 1024, 12);
  });

  [76, 316, 556, 796].forEach((bx) => {
    [bx - 42, bx - 18, bx + 168, bx + 192].forEach((px) => {
      const pg = ctx.createLinearGradient(px, 0, px + 18, 0);
      pg.addColorStop(0, '#c6b08c'); pg.addColorStop(0.5, '#f6ecda'); pg.addColorStop(1, '#98805e');
      ctx.fillStyle = pg; ctx.fillRect(px, 64, 18, 940);
    });

    const drawWin = (x, y, w, h, arched) => {
      ctx.fillStyle = '#f0e5d0'; ctx.fillRect(x - 10, y - 10, w + 20, h + 16);
      ctx.beginPath();
      ctx.moveTo(x - 18, y - 10); ctx.lineTo(x + w / 2, y - 48); ctx.lineTo(x + w + 18, y - 10); ctx.closePath();
      ctx.fillStyle = '#f3e9d6'; ctx.fill();
      ctx.strokeStyle = 'rgba(80, 58, 34, 0.55)'; ctx.lineWidth = 3; ctx.stroke();

      ctx.save();
      ctx.beginPath();
      if (arched) { ctx.arc(x + w / 2, y + w / 2, w / 2, Math.PI, 0); ctx.lineTo(x + w, y + h); ctx.lineTo(x, y + h); }
      else ctx.rect(x, y, w, h);
      ctx.closePath();
      const wg = ctx.createLinearGradient(x, y, x, y + h);
      wg.addColorStop(0, '#ffe3a3'); wg.addColorStop(0.6, '#d69442'); wg.addColorStop(1, '#593515');
      ctx.fillStyle = wg; ctx.fill();
      ectx.fillStyle = '#cf903c';
      ectx.fillRect(x + 8, y + (arched ? 34 : 8), w - 16, h - (arched ? 42 : 16));

      ctx.strokeStyle = '#efe5d2'; ctx.lineWidth = 3.5;
      ctx.beginPath(); ctx.moveTo(x + w / 2, y); ctx.lineTo(x + w / 2, y + h);
      for (let gy = y + 48; gy < y + h - 12; gy += 44) { ctx.moveTo(x, gy); ctx.lineTo(x + w, gy); }
      ctx.stroke();
      ctx.restore();
    };
    drawWin(bx + 12, 118, 126, 206, false);
    drawWin(bx + 12, 424, 126, 224, true);
    drawWin(bx + 8, 742, 134, 260, true);
  });

  return {
    map: toTex(c, { repeatX: 2, repeatY: 1, srgb: true, aniso }),
    emissiveMap: toTex(e, { repeatX: 2, repeatY: 1, srgb: true, aniso }),
  };
}

export function createMansardRoofPBR(aniso = 4) {
  const [c, ctx] = makeCanvas(512, 256);
  const g = ctx.createLinearGradient(0, 0, 0, 256);
  g.addColorStop(0, '#364152'); g.addColorStop(0.5, '#262f3d'); g.addColorStop(1, '#1b222d');
  ctx.fillStyle = g; ctx.fillRect(0, 0, 512, 256);
  for (let y = 0; y < 256; y += 20) {
    ctx.strokeStyle = 'rgba(12, 16, 24, 0.55)'; ctx.lineWidth = 2;
    ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(512, y); ctx.stroke();
  }
  for (let x = 0; x < 512; x += 32) {
    ctx.strokeStyle = 'rgba(145, 165, 190, 0.24)'; ctx.lineWidth = 2;
    ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, 256); ctx.stroke();
  }
  [84, 256, 428].forEach((dx) => {
    ctx.fillStyle = '#d6b66a'; ctx.fillRect(dx - 24, 62, 48, 122);
    ctx.fillStyle = '#2d2218'; ctx.fillRect(dx - 17, 78, 34, 96);
    ctx.fillStyle = 'rgba(255, 214, 132, 0.58)'; ctx.fillRect(dx - 14, 82, 28, 88);
    ctx.beginPath(); ctx.arc(dx, 62, 24, Math.PI, 0); ctx.fillStyle = '#e6c980'; ctx.fill();
  });
  ctx.fillStyle = '#e4c06a'; ctx.fillRect(0, 0, 512, 10);
  return toTex(c, { repeatX: 3, repeatY: 1, srgb: true, aniso });
}

export function createEiffelLatticeTexture(aniso = 4) {
  const [c, ctx] = makeCanvas(512, 512);
  ctx.clearRect(0, 0, 512, 512);
  ctx.strokeStyle = '#5e493b'; ctx.lineWidth = 14; ctx.strokeRect(7, 7, 498, 498);
  const step = 128;
  for (let row = 0; row < 4; row++) {
    const y0 = row * step;
    ctx.fillStyle = '#6c5545'; ctx.fillRect(0, y0 - 6, 512, 12);
    for (let col = 0; col < 2; col++) {
      const x0 = col * 256;
      ctx.strokeStyle = '#5a4638'; ctx.lineWidth = 10;
      ctx.beginPath(); ctx.moveTo(x0, y0); ctx.lineTo(x0 + 256, y0 + step); ctx.moveTo(x0 + 256, y0); ctx.lineTo(x0, y0 + step); ctx.stroke();
      ctx.strokeStyle = '#755d4a'; ctx.lineWidth = 4.5;
      ctx.beginPath(); ctx.moveTo(x0 + 128, y0); ctx.lineTo(x0 + 256, y0 + step * 0.5); ctx.lineTo(x0 + 128, y0 + step); ctx.lineTo(x0, y0 + step * 0.5); ctx.closePath(); ctx.stroke();
    }
  }
  return toTex(c, { repeatX: 1, repeatY: 2, srgb: true, aniso });
}

export function createTreeFoliageTexture() {
  const [c, ctx] = makeCanvas(256, 256);
  ctx.clearRect(0, 0, 256, 256);
  const palette = ['#485831', '#5c6b39', '#6d783d', '#8a7a3e', '#a68440', '#3d4c2a'];
  for (let i = 0; i < 86; i++) {
    const a = (i * 2.39996) % (Math.PI * 2);
    const rad = Math.sqrt(i / 86) * 98;
    const x = 128 + Math.cos(a) * rad + Math.sin(i * 5.3) * 8;
    const y = 128 + Math.sin(a) * rad + Math.cos(i * 4.1) * 8;
    const size = 15 + ((i * 7) % 14);
    ctx.save(); ctx.translate(x, y); ctx.rotate(a + (i % 5) * 0.4);
    ctx.fillStyle = palette[i % palette.length];
    ctx.beginPath(); ctx.ellipse(0, 0, size, size * 0.58, 0, 0, Math.PI * 2); ctx.fill();
    ctx.restore();
  }
  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

export function createLouvreWallPanelPBR(aniso = 4) {
  const [c, ctx] = makeCanvas(512, 512);
  const g = ctx.createLinearGradient(0, 0, 0, 512);
  g.addColorStop(0, '#e6dac4'); g.addColorStop(0.72, '#d8c7ab');
  g.addColorStop(0.74, '#ab8c56'); g.addColorStop(0.76, '#524030'); g.addColorStop(1, '#36291e');
  ctx.fillStyle = g; ctx.fillRect(0, 0, 512, 512);
  [36, 276].forEach((x) => {
    ctx.strokeStyle = 'rgba(125, 100, 68, 0.45)'; ctx.lineWidth = 4; ctx.strokeRect(x, 48, 200, 300);
    ctx.strokeStyle = 'rgba(218, 182, 108, 0.36)'; ctx.lineWidth = 3; ctx.strokeRect(x + 8, 404, 184, 86);
  });
  return toTex(c, { repeatX: 12, repeatY: 1, srgb: true, aniso });
}

export function createParchmentTexture(titleText, subtitleText) {
  const [c, ctx] = makeCanvas(320, 420);
  const g = ctx.createLinearGradient(0, 0, 320, 420);
  g.addColorStop(0, '#fbf0d2'); g.addColorStop(0.5, '#eed79f'); g.addColorStop(1, '#d7b065');
  ctx.fillStyle = g; ctx.fillRect(0, 0, 320, 420);
  ctx.strokeStyle = '#8b6220'; ctx.lineWidth = 5; ctx.strokeRect(16, 16, 288, 388);
  ctx.lineWidth = 1.8; ctx.strokeRect(26, 26, 268, 368);

  ctx.textAlign = 'center';
  ctx.direction = 'ltr'; ctx.fillStyle = '#6e4a12'; ctx.font = 'bold 20px Cinzel, Georgia, serif';
  ctx.fillText('✦ HEY LOUVRE ✦', 160, 68);
  ctx.direction = 'rtl'; ctx.fillStyle = '#241506'; ctx.font = 'bold 30px Cairo, sans-serif';
  ctx.fillText(titleText, 160, 142);
  ctx.fillStyle = '#684414'; ctx.font = '600 20px Cairo, sans-serif';
  ctx.fillText(subtitleText, 160, 188);

  ctx.strokeStyle = 'rgba(92, 60, 14, 0.42)'; ctx.lineWidth = 2.2;
  for (let i = 0; i < 4; i++) { ctx.beginPath(); ctx.moveTo(54, 236 + i * 28); ctx.lineTo(266, 236 + i * 28); ctx.stroke(); }

  ctx.fillStyle = '#992424'; ctx.beginPath(); ctx.arc(160, 366, 24, 0, Math.PI * 2); ctx.fill();
  ctx.direction = 'ltr'; ctx.fillStyle = '#fbe3a4'; ctx.font = 'bold 13px Cinzel, Georgia, serif';
  ctx.fillText('HEY', 160, 371);

  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

export function createUVSecretOverlayTexture(secretAr, constellationCode) {
  const [c, ctx] = makeCanvas(512, 384);
  ctx.clearRect(0, 0, 512, 384);
  ctx.strokeStyle = 'rgba(130, 235, 255, 0.85)';
  ctx.lineWidth = 2.5;
  ctx.strokeRect(18, 18, 476, 348);

  ctx.strokeStyle = 'rgba(255, 224, 120, 0.55)';
  ctx.beginPath();
  ctx.arc(256, 192, 130, 0, Math.PI * 2);
  ctx.moveTo(60, 60); ctx.lineTo(452, 324);
  ctx.moveTo(452, 60); ctx.lineTo(60, 324);
  ctx.stroke();

  ctx.textAlign = 'center';
  ctx.direction = 'ltr'; ctx.fillStyle = '#8ceeff'; ctx.font = '600 18px Cinzel, Georgia, serif';
  ctx.fillText(`✦ LOUVRE CURATOR UV ARCHIVE • ${constellationCode} ✦`, 256, 66);

  ctx.direction = 'rtl'; ctx.fillStyle = '#fff4c2'; ctx.shadowColor = '#ffd058'; ctx.shadowBlur = 14;
  ctx.font = 'bold 28px Amiri, Georgia, serif';
  ctx.fillText(secretAr, 256, 202);

  ctx.font = '600 18px Cairo, sans-serif'; ctx.fillStyle = '#b4f4ff';
  ctx.fillText('تم الكشف بعدسة القيّم الفني • HEY 19', 256, 326);

  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

export function createDefaultCustomLouvreCanvas() {
  const [c, ctx] = makeCanvas(640, 480);
  const g = ctx.createRadialGradient(320, 220, 30, 320, 240, 380);
  g.addColorStop(0, '#2a1e15'); g.addColorStop(1, '#120c08');
  ctx.fillStyle = g; ctx.fillRect(0, 0, 640, 480);
  ctx.strokeStyle = '#e8c268'; ctx.lineWidth = 3; ctx.strokeRect(20, 20, 600, 440);
  ctx.textAlign = 'center';
  ctx.direction = 'ltr'; ctx.fillStyle = '#d6ab52'; ctx.font = '600 16px Cinzel, serif';
  ctx.fillText('MUSÉE DU LOUVRE  •  LIVE VISITOR MASTERPIECE', 320, 84);
  ctx.direction = 'rtl'; ctx.fillStyle = '#fbf0cf'; ctx.font = '700 36px Amiri, serif';
  ctx.fillText('ارسم لوحتك وعلّقها هنا في متحف اللوفر', 320, 225);
  ctx.fillStyle = '#eed28a'; ctx.font = '600 21px Cairo, sans-serif';
  ctx.fillText('اضغط على الحامل الذهبي للرسم والتوقيع ليمنى ✦', 320, 286);
  return c;
}

export function createLouvreSignTexture() {
  const [c, ctx] = makeCanvas(1024, 200);
  const g = ctx.createLinearGradient(0, 0, 1024, 200);
  g.addColorStop(0, '#16100a'); g.addColorStop(0.5, '#241a10'); g.addColorStop(1, '#16100a');
  ctx.fillStyle = g; ctx.fillRect(0, 0, 1024, 200);
  ctx.strokeStyle = '#e8c268'; ctx.lineWidth = 7; ctx.strokeRect(10, 10, 1004, 180);
  ctx.textAlign = 'center';
  ctx.direction = 'rtl'; ctx.fillStyle = '#fbf0cf'; ctx.font = 'bold 58px Amiri, Georgia, serif';
  ctx.fillText('متحف اللوفر  •  معرض رحلة يمنى', 512, 98);
  ctx.direction = 'ltr'; ctx.fillStyle = '#e8c268'; ctx.font = '600 26px Cinzel, Georgia, serif';
  ctx.fillText('MUSÉE DU LOUVRE PARIS  •  HEY EDITION  •  5 DECEMBER', 512, 156);
  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

export function createPawPrintTexture() {
  const [c, ctx] = makeCanvas(128, 128);
  ctx.fillStyle = '#ffe599'; ctx.shadowColor = '#f4b942'; ctx.shadowBlur = 14;
  ctx.beginPath(); ctx.ellipse(64, 78, 22, 18, 0, 0, Math.PI * 2); ctx.fill();
  [[35, 50], [53, 36], [75, 36], [93, 50]].forEach(([x, y]) => { ctx.beginPath(); ctx.arc(x, y, 10, 0, Math.PI * 2); ctx.fill(); });
  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}
