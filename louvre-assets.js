/**
 * =========================================================================
 *  PHOTOREALISTIC PARIS HAUSSMANN & LOUVRE PBR ASSETS (louvre-assets.js v28)
 *  - Warm Parisian Cream Limestone Haussmann Facades (#d8ccb8 / #c9baa0)
 *  - Beaux-Arts Galeries Lafayette / Grand Palais Glass-and-Limestone Facade
 *  - Multi-Layered Parisian Plane Tree Bark & Alpha-Mapped Leaf Cluster
 *  - Wet-Asphalt Specular Variation Roughness Map + Striped Café Awnings
 *  - Dark Eiffel Bronze Fine Ironwork Lattice + Anas Habib Jersey Texture
 *  - ZERO exclamation marks in any visible canvas text
 *  - Designed & Developed by ENG / Mohamed Tarek • HEY Edition
 * =========================================================================
 */

import * as THREE from './vendor/three.module.min.js';

function makeCanvas(w, h) {
  const c = document.createElement('canvas');
  c.width = w; c.height = h;
  return { c, ctx: c.getContext('2d') };
}

function finalizeTex(canvas, repX = 1, repY = 1, isColor = true, aniso = 6) {
  const tex = new THREE.CanvasTexture(canvas);
  tex.wrapS = THREE.RepeatWrapping;
  tex.wrapT = THREE.RepeatWrapping;
  tex.repeat.set(repX, repY);
  if (isColor) tex.colorSpace = THREE.SRGBColorSpace;
  tex.anisotropy = aniso;
  tex.needsUpdate = true;
  return tex;
}

export function createGlowTexture() {
  const { c, ctx } = makeCanvas(128, 128);
  const g = ctx.createRadialGradient(64, 64, 2, 64, 64, 64);
  g.addColorStop(0, 'rgba(255, 250, 232, 1)');
  g.addColorStop(0.26, 'rgba(255, 224, 152, 0.78)');
  g.addColorStop(0.62, 'rgba(244, 184, 82, 0.2)');
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
  g.addColorStop(0, 'rgba(255, 238, 194, 0.5)');
  g.addColorStop(0.55, 'rgba(255, 218, 142, 0.14)');
  g.addColorStop(1, 'rgba(255, 200, 100, 0)');
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, 128, 256);
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  return t;
}

/* ==================== WET BOULEVARD ASPHALT ROUGHNESS VARIATION MAP ==================== */
export function createWetAsphaltPatchMap(aniso = 6) {
  const { c, ctx } = makeCanvas(512, 512);
  // Base dry-damp roughness (~0.62 grey)
  ctx.fillStyle = '#9e9e9e';
  ctx.fillRect(0, 0, 512, 512);
  // Tire-track subtle specular polish streaks
  ctx.fillStyle = '#5e5e5e';
  ctx.fillRect(72, 0, 54, 512);
  ctx.fillRect(156, 0, 54, 512);
  ctx.fillRect(302, 0, 54, 512);
  ctx.fillRect(386, 0, 54, 512);
  // Organic damp rain-slick puddles (very dark = glossy HDRI reflection!)
  for (let i = 0; i < 24; i++) {
    const x = (i * 113 + 47) % 512;
    const y = (i * 179 + 29) % 512;
    const rx = 28 + (i % 5) * 16;
    const ry = 44 + (i % 4) * 24;
    const g = ctx.createRadialGradient(x, y, 4, x, y, ry);
    g.addColorStop(0, 'rgba(18, 18, 18, 0.92)');
    g.addColorStop(0.6, 'rgba(56, 56, 56, 0.55)');
    g.addColorStop(1, 'rgba(158, 158, 158, 0)');
    ctx.fillStyle = g;
    ctx.beginPath();
    ctx.ellipse(x, y, rx, ry, (i % 3) * 0.2, 0, Math.PI * 2);
    ctx.fill();
  }
  return finalizeTex(c, 1, 24, false, aniso);
}

/* ==================== AUTHENTIC 6-STORY PARISIAN HAUSSMANN LIMESTONE FACADE ==================== */
export function createHaussmannFacadePBR(aniso = 6, variant = 0) {
  const { c, ctx } = makeCanvas(512, 512);
  const { c: emC, ctx: em } = makeCanvas(512, 512);
  const { c: rC, ctx: rCtx } = makeCanvas(512, 512);

  // Authentic warm Parisian cream limestone (#d8ccb8 / #c9baa0)
  const baseTone = variant === 0 ? '#d6c8b2' : variant === 1 ? '#cbbba1' : '#dcd0bc';
  ctx.fillStyle = baseTone;
  ctx.fillRect(0, 0, 512, 512);
  em.fillStyle = '#000000';
  em.fillRect(0, 0, 512, 512);
  rCtx.fillStyle = '#c8c8c8'; // Matte limestone roughness
  rCtx.fillRect(0, 0, 512, 512);

  // Subtle ashlar stone block joints & weathering patina
  for (let y = 0; y < 512; y += 20) {
    ctx.fillStyle = y % 40 === 0 ? 'rgba(90, 74, 54, 0.14)' : 'rgba(255, 248, 234, 0.08)';
    ctx.fillRect(0, y, 512, 2);
    for (let x = ((y / 20) % 2) * 28; x < 512; x += 56) {
      ctx.fillStyle = 'rgba(84, 68, 50, 0.1)';
      ctx.fillRect(x, y, 1.5, 20);
    }
  }
  // Subtle grime under stone ledges for real architectural depth
  for (let i = 0; i < 900; i++) {
    ctx.fillStyle = i % 2 === 0 ? 'rgba(72,60,46,0.06)' : 'rgba(255,248,236,0.06)';
    ctx.fillRect((i * 89) % 512, (i * 137) % 512, 3, 2);
  }

  // Ground-floor luxury Parisian storefront / brasserie fascia (dark stone & brass)
  ctx.fillStyle = variant === 1 ? '#1d242e' : '#261e19';
  ctx.fillRect(0, 396, 512, 116);
  ctx.fillStyle = '#b9934c';
  ctx.fillRect(0, 390, 512, 6);
  for (let col = 0; col < 4; col++) {
    const x = 18 + col * 124;
    // Recessed warm luxury boutique interior
    const sg = ctx.createLinearGradient(x, 408, x, 506);
    sg.addColorStop(0, '#ffdca0');
    sg.addColorStop(0.65, '#a86b2d');
    sg.addColorStop(1, '#3d2412');
    ctx.fillStyle = sg;
    ctx.fillRect(x, 408, 96, 98);
    ctx.strokeStyle = '#c8a256';
    ctx.lineWidth = 3;
    ctx.strokeRect(x, 408, 96, 98);
    // Mullion glass dividers
    ctx.strokeStyle = '#1b1815';
    ctx.lineWidth = 2;
    ctx.beginPath(); ctx.moveTo(x + 48, 408); ctx.lineTo(x + 48, 506); ctx.stroke();
    em.fillStyle = '#ffbe66';
    em.fillRect(x + 4, 412, 88, 90);
    rCtx.fillStyle = '#181818'; // Glossy storefront glass
    rCtx.fillRect(x, 408, 96, 98);
  }

  // 4 upper Haussmann stories (Floors 2, 3, 4, 5) with deep recessed French casement windows
  const floorY = [18, 112, 206, 300];
  floorY.forEach((fy, fi) => {
    // Carved stone cornice molding band + subtle cast shadow below it
    ctx.fillStyle = '#e7dcc8';
    ctx.fillRect(0, fy - 11, 512, 6);
    ctx.fillStyle = 'rgba(54, 42, 30, 0.34)';
    ctx.fillRect(0, fy - 5, 512, 5);

    for (let col = 0; col < 4; col++) {
      const wx = 26 + col * 124;
      const lit = ((col * 3 + fi + variant) % 3) === 0;
      // Molded stone architrave surround + keystones
      ctx.fillStyle = '#ebe1cf';
      ctx.fillRect(wx - 8, fy - 3, 82, 84);
      ctx.fillStyle = 'rgba(42, 34, 26, 0.42)';
      ctx.fillRect(wx - 4, fy, 74, 78);

      // Deep recessed glass window (reflects HDRI sky if unlit, warm interior room if lit!)
      if (lit) {
        const wg = ctx.createLinearGradient(wx, fy, wx, fy + 74);
        wg.addColorStop(0, '#f8d28c');
        wg.addColorStop(0.55, '#d69748');
        wg.addColorStop(1, '#754822');
        ctx.fillStyle = wg;
        em.fillStyle = (col + fi) % 2 === 0 ? '#ffc46a' : '#d69040';
        em.fillRect(wx + 3, fy + 4, 60, 68);
      } else {
        const ug = ctx.createLinearGradient(wx, fy, wx, fy + 74);
        ug.addColorStop(0, '#2a3748');
        ug.addColorStop(0.6, '#1a222e');
        ug.addColorStop(1, '#121720');
        ctx.fillStyle = ug;
      }
      ctx.fillRect(wx, fy + 2, 66, 74);
      rCtx.fillStyle = '#141414'; // Glossy HDRI-reflecting window glass!
      rCtx.fillRect(wx, fy + 2, 66, 74);

      // Crisp cream French casement wood frames (crossbars)
      ctx.strokeStyle = '#ece3d2';
      ctx.lineWidth = 2.2;
      ctx.strokeRect(wx + 1, fy + 3, 64, 72);
      ctx.beginPath();
      ctx.moveTo(wx + 33, fy + 3); ctx.lineTo(wx + 33, fy + 75);
      ctx.moveTo(wx + 1, fy + 28); ctx.lineTo(wx + 65, fy + 28);
      ctx.moveTo(wx + 1, fy + 52); ctx.lineTo(wx + 65, fy + 52);
      ctx.stroke();

      // Delicate black wrought-iron Parisian garde-corps window balustrade
      ctx.fillStyle = '#181a1e';
      ctx.fillRect(wx - 4, fy + 52, 74, 2.5);
      ctx.fillRect(wx - 4, fy + 73, 74, 3);
      for (let bx = wx; bx <= wx + 66; bx += 9) ctx.fillRect(bx, fy + 52, 1.8, 22);
    }
  });

  return {
    map: finalizeTex(c, 1, 1, true, aniso),
    emissiveMap: finalizeTex(emC, 1, 1, true, aniso),
    roughnessMap: finalizeTex(rC, 1, 1, false, aniso),
  };
}

/* ==================== BEAUX-ARTS GALERIES LAFAYETTE / GRAND PALAIS FACADE ==================== */
export function createGrandPalaisFacadePBR(aniso = 6) {
  const { c, ctx } = makeCanvas(512, 512);
  const { c: emC, ctx: em } = makeCanvas(512, 512);
  const { c: rC, ctx: rCtx } = makeCanvas(512, 512);

  ctx.fillStyle = '#d9ccb6';
  ctx.fillRect(0, 0, 512, 512);
  em.fillStyle = '#000000';
  em.fillRect(0, 0, 512, 512);
  rCtx.fillStyle = '#bcbcbc';
  rCtx.fillRect(0, 0, 512, 512);

  // Monumental Beaux-Arts arched limestone bays & gilded Art Nouveau glass vitrines
  for (let row = 0; row < 2; row++) {
    const y = row === 0 ? 44 : 272;
    const h = row === 0 ? 196 : 216;
    ctx.fillStyle = '#c8b89b';
    ctx.fillRect(0, y - 16, 512, 12);
    ctx.fillStyle = '#c59c4a';
    ctx.fillRect(0, y - 4, 512, 4);

    for (let col = 0; col < 3; col++) {
      const cx = 86 + col * 170;
      // Fluted limestone piers
      ctx.fillStyle = '#e7dcc8';
      ctx.fillRect(cx - 78, y, 22, h);
      ctx.fillRect(cx + 56, y, 22, h);
      ctx.fillStyle = '#b9934c';
      ctx.fillRect(cx - 80, y - 4, 26, 8);
      ctx.fillRect(cx + 54, y - 4, 26, 8);

      // Grand arched warm-lit glass atrium window
      ctx.beginPath();
      ctx.arc(cx, y + 54, 54, Math.PI, 0);
      ctx.lineTo(cx + 54, y + h);
      ctx.lineTo(cx - 54, y + h);
      ctx.closePath();
      const g = ctx.createLinearGradient(cx, y, cx, y + h);
      g.addColorStop(0, row === 1 ? '#ffe4a8' : '#7ea2be');
      g.addColorStop(0.55, row === 1 ? '#d89a45' : '#31495e');
      g.addColorStop(1, '#241e18');
      ctx.fillStyle = g;
      ctx.fill();
      ctx.strokeStyle = '#d4ac58';
      ctx.lineWidth = 4;
      ctx.stroke();

      em.beginPath();
      em.arc(cx, y + 54, 50, Math.PI, 0);
      em.lineTo(cx + 50, y + h - 4);
      em.lineTo(cx - 50, y + h - 4);
      em.closePath();
      em.fillStyle = row === 1 ? '#ffca72' : '#9cc2dd';
      em.fill();

      rCtx.fillStyle = '#161616';
      rCtx.fillRect(cx - 54, y, 108, h);
    }
  }
  return {
    map: finalizeTex(c, 2, 1, true, aniso),
    emissiveMap: finalizeTex(emC, 2, 1, true, aniso),
    roughnessMap: finalizeTex(rC, 2, 1, false, aniso),
  };
}

/* ==================== PARISIAN STRIPED BRASSERIE AWNING TEXTURE ==================== */
export function createAwningStripeTexture(primaryHex = '#681b25', creamHex = '#efe6d4') {
  const { c, ctx } = makeCanvas(256, 128);
  for (let x = 0; x < 256; x += 32) {
    ctx.fillStyle = (x / 32) % 2 === 0 ? primaryHex : creamHex;
    ctx.fillRect(x, 0, 32, 128);
  }
  ctx.fillStyle = 'rgba(0,0,0,0.22)';
  ctx.fillRect(0, 114, 256, 14);
  return finalizeTex(c, 2, 1, true, 4);
}

/* ==================== PARISIAN PLANE TREE BARK & REALISTIC LAYERED LEAF BRANCH CLUSTER ==================== */
export function createPlaneTreeBarkTexture() {
  const { c, ctx } = makeCanvas(256, 512);
  ctx.fillStyle = '#4a4339';
  ctx.fillRect(0, 0, 256, 512);
  // Characteristic mottled Parisian plane-tree bark plates (olive-grey, warm taupe & dark bark crevices)
  const tones = ['#5c5548', '#756d5c', '#3c362e', '#655e4f', '#2f2a24'];
  for (let i = 0; i < 120; i++) {
    ctx.fillStyle = tones[i % tones.length];
    ctx.beginPath();
    ctx.ellipse((i * 53) % 256, (i * 97) % 512, 14 + (i % 18), 32 + (i % 44), 0.1, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.strokeStyle = 'rgba(24, 20, 16, 0.45)';
  ctx.lineWidth = 2;
  for (let x = 8; x < 256; x += 18) {
    ctx.beginPath(); ctx.moveTo(x, 0); ctx.bezierCurveTo(x + 6, 170, x - 6, 340, x + 2, 512); ctx.stroke();
  }
  return finalizeTex(c, 1, 2, true, 4);
}

export function createRealisticPlaneLeafClusterTexture() {
  const { c, ctx } = makeCanvas(512, 512);
  ctx.clearRect(0, 0, 512, 512);

  // Organic woody sub-branches radiating from base center
  ctx.strokeStyle = '#3b2e22';
  ctx.lineCap = 'round';
  const twigs = [
    [256, 470, 256, 120, 7],
    [256, 390, 130, 210, 5],
    [256, 370, 382, 200, 5],
    [256, 290, 110, 140, 4],
    [256, 280, 405, 135, 4],
    [256, 210, 180, 75, 3],
    [256, 210, 336, 80, 3],
  ];
  twigs.forEach(([x0, y0, x1, y1, w]) => {
    ctx.lineWidth = w;
    ctx.beginPath(); ctx.moveTo(x0, y0); ctx.quadraticCurveTo((x0 + x1) * 0.5, y0 - 40, x1, y1); ctx.stroke();
  });

  // 280 realistic Parisian golden-hour plane-tree leaves (deep olive shadow -> sage green -> autumn gold tips)
  const leafPalette = ['#23361c', '#2d4524', '#38542a', '#486330', '#5e6b32', '#7a7536', '#9b7b38', '#1e2f18'];
  for (let i = 0; i < 280; i++) {
    const a = (i * 2.39996) % (Math.PI * 2);
    const rad = Math.sqrt(i / 280) * 208;
    const lx = 256 + Math.cos(a) * rad;
    const ly = 248 + Math.sin(a) * rad * 0.88;
    const sz = 14 + (i % 13);
    const rot = a + ((i % 7) - 3) * 0.25;

    ctx.save();
    ctx.translate(lx, ly);
    ctx.rotate(rot);
    ctx.fillStyle = leafPalette[i % leafPalette.length];
    // 3-lobed organic plane leaf silhouette (never circles!)
    ctx.beginPath();
    ctx.moveTo(0, sz * 0.65);
    ctx.quadraticCurveTo(-sz * 0.9, sz * 0.1, -sz * 0.72, -sz * 0.35);
    ctx.quadraticCurveTo(-sz * 0.3, -sz * 0.2, 0, -sz * 0.95);
    ctx.quadraticCurveTo(sz * 0.3, -sz * 0.2, sz * 0.72, -sz * 0.35);
    ctx.quadraticCurveTo(sz * 0.9, sz * 0.1, 0, sz * 0.65);
    ctx.closePath();
    ctx.fill();
    // Subtle sunlit leaf vein
    ctx.strokeStyle = 'rgba(218, 206, 148, 0.22)';
    ctx.lineWidth = 1;
    ctx.beginPath(); ctx.moveTo(0, sz * 0.5); ctx.lineTo(0, -sz * 0.7); ctx.stroke();
    ctx.restore();
  }
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  return t;
}

export function createDistrictSignTexture(titleAr, subtitleEn, accentHex = '#e8c268', bgHex = '#14100d') {
  const { c, ctx } = makeCanvas(1024, 224);
  ctx.fillStyle = bgHex; ctx.fillRect(0, 0, 1024, 224);
  ctx.strokeStyle = accentHex; ctx.lineWidth = 7; ctx.strokeRect(12, 12, 1000, 200);
  ctx.textAlign = 'center'; ctx.direction = 'rtl'; ctx.fillStyle = '#fbf0cf';
  ctx.font = 'bold 56px Amiri, Georgia, serif'; ctx.fillText(titleAr, 512, 102);
  ctx.direction = 'ltr'; ctx.fillStyle = accentHex;
  ctx.font = '600 26px Cinzel, Georgia, serif'; ctx.fillText(subtitleEn, 512, 166);
  const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; return t;
}

export function createAnasJerseyTexture() {
  const { c, ctx } = makeCanvas(512, 512);
  ctx.fillStyle = '#f4f6f9'; ctx.fillRect(0, 0, 512, 512);
  ctx.fillStyle = 'rgba(205, 212, 222, 0.28)';
  for (let y = 0; y < 512; y += 6) ctx.fillRect(0, y, 512, 2);
  ctx.fillStyle = '#181a1f'; ctx.fillRect(0, 0, 512, 34);
  for (let s = 0; s < 3; s++) ctx.fillRect(0, 56 + s * 16, 512, 8);
  ctx.fillStyle = '#1d2026'; ctx.fillRect(0, 488, 512, 24);
  const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; t.flipY = false; return t;
}

export function createGuideBadgeTexture(nameAr, subAr, accentHex = '#e8c268') {
  const { c, ctx } = makeCanvas(512, 144);
  ctx.clearRect(0, 0, 512, 144);
  ctx.fillStyle = 'rgba(16, 12, 9, 0.86)';
  ctx.beginPath(); ctx.roundRect(10, 10, 492, 124, 28); ctx.fill();
  ctx.strokeStyle = accentHex; ctx.lineWidth = 3.5; ctx.stroke();
  ctx.textAlign = 'center'; ctx.direction = 'rtl';
  ctx.fillStyle = '#fbf0cf'; ctx.font = 'bold 40px Amiri, Georgia, serif'; ctx.fillText(nameAr, 256, 68);
  ctx.fillStyle = accentHex; ctx.font = '600 24px Cairo, sans-serif'; ctx.fillText(subAr, 256, 112);
  const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; return t;
}

export function createLouvrePalacePBR(aniso = 6) {
  const { c, ctx } = makeCanvas(512, 512);
  const { c: emC, ctx: em } = makeCanvas(512, 512);
  ctx.fillStyle = '#d9cbb3'; ctx.fillRect(0, 0, 512, 512);
  em.fillStyle = '#000000'; em.fillRect(0, 0, 512, 512);

  ctx.strokeStyle = 'rgba(104, 88, 66, 0.22)'; ctx.lineWidth = 1.5;
  for (let y = 0; y < 512; y += 26) { ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(512, y); ctx.stroke(); }

  const rows = [44, 210, 366];
  rows.forEach((ry, ri) => {
    ctx.fillStyle = '#c0ad8d'; ctx.fillRect(0, ry - 16, 512, 10);
    for (let col = 0; col < 4; col++) {
      const cx = 64 + col * 128;
      ctx.fillStyle = '#eae0cc'; ctx.fillRect(cx - 56, ry - 6, 16, 122); ctx.fillRect(cx + 40, ry - 6, 16, 122);
      ctx.fillStyle = '#c49b48'; ctx.fillRect(cx - 58, ry - 10, 20, 7); ctx.fillRect(cx + 38, ry - 10, 20, 7);

      ctx.beginPath(); ctx.arc(cx, ry + 26, 29, Math.PI, 0); ctx.lineTo(cx + 29, ry + 110); ctx.lineTo(cx - 29, ry + 110); ctx.closePath();
      ctx.fillStyle = ri === 2 ? '#ffe4a2' : '#e6c178'; ctx.fill();
      em.beginPath(); em.arc(cx, ry + 26, 26, Math.PI, 0); em.lineTo(cx + 26, ry + 106); em.lineTo(cx - 26, ry + 106); em.closePath();
      em.fillStyle = ri === 2 ? '#ffcb6e' : '#c68e3d'; em.fill();
      ctx.strokeStyle = '#f5ead6'; ctx.lineWidth = 3; ctx.stroke();
    }
  });
  return { map: finalizeTex(c, 2, 1, true, aniso), emissiveMap: finalizeTex(emC, 2, 1, true, aniso) };
}

export function createMansardRoofPBR(aniso = 6) {
  const { c, ctx } = makeCanvas(256, 256);
  ctx.fillStyle = '#2c323b'; ctx.fillRect(0, 0, 256, 256);
  for (let x = 0; x < 256; x += 22) {
    ctx.fillStyle = 'rgba(255,255,255,0.09)'; ctx.fillRect(x, 0, 2, 256);
    ctx.fillStyle = 'rgba(0,0,0,0.26)'; ctx.fillRect(x + 2, 0, 2, 256);
  }
  for (let y = 0; y < 256; y += 44) {
    ctx.fillStyle = 'rgba(18, 22, 28, 0.28)'; ctx.fillRect(0, y, 256, 2);
  }
  return finalizeTex(c, 5, 2, true, aniso);
}

/* ==================== FINE DARK EIFFEL BRONZE OPEN-LATTICE IRONWORK ==================== */
export function createEiffelLatticeTexture(aniso = 6) {
  const { c, ctx } = makeCanvas(256, 512);
  ctx.clearRect(0, 0, 256, 512);
  ctx.strokeStyle = '#4a4138';
  ctx.lineWidth = 7;
  ctx.strokeRect(8, 8, 240, 496);
  ctx.lineWidth = 4.5;
  for (let y = 0; y < 512; y += 48) {
    ctx.beginPath();
    ctx.moveTo(8, y); ctx.lineTo(248, y + 48);
    ctx.moveTo(248, y); ctx.lineTo(8, y + 48);
    ctx.moveTo(8, y); ctx.lineTo(248, y);
    ctx.stroke();
  }
  ctx.lineWidth = 2.5;
  ctx.beginPath(); ctx.moveTo(128, 8); ctx.lineTo(128, 504); ctx.stroke();
  return finalizeTex(c, 1, 2, true, aniso);
}

export function createLouvreWallPanelPBR(aniso = 6) {
  const { c, ctx } = makeCanvas(512, 512);
  const g = ctx.createLinearGradient(0, 0, 0, 512);
  g.addColorStop(0, '#eee5d4'); g.addColorStop(0.75, '#e2d6c0'); g.addColorStop(1, '#cfc0a6');
  ctx.fillStyle = g; ctx.fillRect(0, 0, 512, 512);
  ctx.strokeStyle = '#c89e46'; ctx.lineWidth = 4; ctx.strokeRect(24, 34, 464, 320);
  ctx.strokeStyle = 'rgba(200, 158, 70, 0.5)'; ctx.lineWidth = 2; ctx.strokeRect(36, 46, 440, 296);
  ctx.fillStyle = '#d3c4aa'; ctx.fillRect(0, 384, 512, 128);
  ctx.fillStyle = '#c89e46'; ctx.fillRect(0, 380, 512, 6);
  return finalizeTex(c, 9, 1, true, aniso);
}

export function createParchmentTexture(headerAr, titleAr) {
  const { c, ctx } = makeCanvas(512, 660);
  const g = ctx.createLinearGradient(0, 0, 0, 660);
  g.addColorStop(0, '#f8edd3'); g.addColorStop(0.5, '#f0dec0'); g.addColorStop(1, '#e1c89c');
  ctx.fillStyle = g; ctx.fillRect(0, 0, 512, 660);
  ctx.strokeStyle = '#9a7128'; ctx.lineWidth = 7; ctx.strokeRect(22, 22, 468, 616);
  ctx.strokeStyle = 'rgba(154, 113, 40, 0.45)'; ctx.lineWidth = 2; ctx.strokeRect(36, 36, 440, 588);
  ctx.textAlign = 'center'; ctx.direction = 'ltr'; ctx.fillStyle = '#8b6420'; ctx.font = '600 18px Cinzel, Georgia, serif';
  ctx.fillText('MUSÉE DU LOUVRE  •  HEY EDITION', 256, 86);
  ctx.direction = 'rtl'; ctx.fillStyle = '#382411'; ctx.font = '700 32px Amiri, Georgia, serif'; ctx.fillText(headerAr, 256, 168);
  ctx.fillStyle = '#1b1107'; ctx.font = '700 40px Amiri, Georgia, serif'; ctx.fillText(titleAr, 256, 266);
  ctx.fillStyle = 'rgba(72, 49, 24, 0.25)';
  for (let i = 0; i < 6; i++) ctx.fillRect(92, 336 + i * 26, 328 - (i % 2) * 50, 5);
  ctx.fillStyle = '#9c232d'; ctx.beginPath(); ctx.arc(256, 558, 34, 0, Math.PI * 2); ctx.fill();
  ctx.strokeStyle = '#e7c164'; ctx.lineWidth = 4; ctx.stroke();
  ctx.direction = 'ltr'; ctx.fillStyle = '#fbf0cf'; ctx.font = '700 18px Cinzel, serif'; ctx.fillText('HEY', 256, 565);
  const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; return t;
}

export function createUVSecretOverlayTexture(secretAr, code = 'HEY-19') {
  const { c, ctx } = makeCanvas(512, 384);
  ctx.clearRect(0, 0, 512, 384);
  ctx.strokeStyle = 'rgba(98, 224, 255, 0.85)'; ctx.lineWidth = 5; ctx.setLineDash([14, 10]); ctx.strokeRect(18, 18, 476, 348); ctx.setLineDash([]);
  ctx.shadowColor = '#5ce1ff'; ctx.shadowBlur = 14; ctx.textAlign = 'center';
  ctx.direction = 'ltr'; ctx.fillStyle = '#9ef4ff'; ctx.font = '600 18px Cinzel, serif'; ctx.fillText(`UV CURATOR SECRET  •  ${code}`, 256, 68);
  ctx.direction = 'rtl'; ctx.fillStyle = '#e4fdff'; ctx.font = '700 32px Amiri, Georgia, serif';
  const words = secretAr.split(' '); let line = '', y = 172;
  for (const w of words) { if ((line + ' ' + w).length > 23) { ctx.fillText(line.trim(), 256, y); line = w + ' '; y += 48; } else line += w + ' '; }
  if (line.trim()) ctx.fillText(line.trim(), 256, y);
  const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; return t;
}

export function createDefaultCustomLouvreCanvas() {
  const { c, ctx } = makeCanvas(640, 480);
  const g = ctx.createRadialGradient(320, 210, 20, 320, 240, 380);
  g.addColorStop(0, '#2a1d13'); g.addColorStop(1, '#120c08');
  ctx.fillStyle = g; ctx.fillRect(0, 0, 640, 480);
  ctx.strokeStyle = '#e6c064'; ctx.lineWidth = 5; ctx.strokeRect(20, 20, 600, 440);
  ctx.textAlign = 'center'; ctx.direction = 'rtl'; ctx.fillStyle = '#fbf0cf';
  ctx.font = '700 40px Amiri, Georgia, serif'; ctx.fillText('لوحتك التذكارية على جدار اللوفر', 320, 195);
  ctx.fillStyle = '#e8c268'; ctx.font = '600 24px Cairo, sans-serif'; ctx.fillText('اضغط على الحامل الذهبي للرسم والتوقيع ليمنى', 320, 265);
  ctx.direction = 'ltr'; ctx.fillStyle = 'rgba(232,194,104,0.72)'; ctx.font = '600 18px Cinzel, serif'; ctx.fillText('HEY LIVE MUSEUM ATELIER • 5 DECEMBER', 320, 396);
  return c;
}

export function createLouvreSignTexture() {
  return createDistrictSignTexture('متحف اللوفر • معرض رحلة يمنى', 'MUSÉE DU LOUVRE PARIS  •  HEY EDITION  •  5 DECEMBER');
}

export function createPawPrintTexture() {
  const { c, ctx } = makeCanvas(128, 128);
  ctx.clearRect(0, 0, 128, 128);
  ctx.fillStyle = 'rgba(255, 224, 140, 0.72)';
  ctx.beginPath(); ctx.ellipse(64, 78, 22, 18, 0, 0, Math.PI * 2); ctx.fill();
  [[36, 48], [54, 34], [74, 34], [92, 48]].forEach(([x, y]) => { ctx.beginPath(); ctx.ellipse(x, y, 9, 12, 0, 0, Math.PI * 2); ctx.fill(); });
  const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; return t;
}
