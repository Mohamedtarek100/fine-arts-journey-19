/**
 * =========================================================================
 *  PROCEDURAL PBR ARCHITECTURAL TEXTURE & MATERIAL FACTORY (louvre-assets.js)
 *  Generates hardware-cached Albedo, Bump, Roughness, Emissive & Alpha-Cutout
 *  maps for photorealistic Paris Haussmann facades, Musée du Louvre Cour
 *  Napoléon stone arcades, curved Eiffel Tower iron lattice, wet Parisian
 *  cobblestones, oiled oak chevron parquet, Carrara marble & botanical leaves.
 *  Zero external downloads • Ultra-fast startup • 60FPS mobile-friendly!
 *  Designed & Developed by ENG / Mohamed Tarek • HEY Edition
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

/* ==================== 1. SOFT RADIAL GLOW & VOLUMETRIC LIGHT BEAM ==================== */
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
  g.addColorStop(0, 'rgba(255, 236, 185, 0.36)');
  g.addColorStop(0.45, 'rgba(245, 200, 118, 0.14)');
  g.addColorStop(1, 'rgba(245, 200, 118, 0)');
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, 96, 256);
  // Soft horizontal feathering so beam edges never look rectangular
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

/* ==================== 2. SOFT FEATHERED CLOUD TEXTURE ==================== */
export function createCloudTexture() {
  const [c, ctx] = makeCanvas(256, 128);
  const puffs = [
    [82, 74, 48], [122, 62, 56], [164, 72, 46], [105, 82, 42], [148, 80, 42], [62, 82, 32], [190, 82, 30],
  ];
  puffs.forEach(([x, y, r]) => {
    const g = ctx.createRadialGradient(x, y - r * 0.18, r * 0.08, x, y, r);
    g.addColorStop(0, 'rgba(255, 246, 235, 0.72)');
    g.addColorStop(0.55, 'rgba(242, 210, 185, 0.34)');
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

/* ==================== 3. WET PARISIAN FAN-PATTERN COBBLESTONE PBR ==================== */
export function createParisCobblestonePBR(aniso = 4) {
  const [c, ctx] = makeCanvas(512, 512);
  const [b, bctx] = makeCanvas(512, 512);
  const [r, rctx] = makeCanvas(512, 512);

  // Dark damp mortar seams
  ctx.fillStyle = '#231f1d';
  ctx.fillRect(0, 0, 512, 512);
  bctx.fillStyle = '#181818';
  bctx.fillRect(0, 0, 512, 512);
  rctx.fillStyle = '#c8c8c8'; // mortar rougher
  rctx.fillRect(0, 0, 512, 512);

  const rows = 20;
  const cols = 12;
  const rh = 512 / rows;
  const cw = 512 / cols;

  for (let row = 0; row < rows; row++) {
    const off = (row % 2) * (cw * 0.5);
    const wave = Math.sin((row / rows) * Math.PI * 2) * 4;
    for (let col = -1; col <= cols; col++) {
      const seed = (row * 37 + col * 73) & 255;
      const base = 70 + (seed % 34);
      const warmR = 10 + ((seed >> 2) % 14);
      const warmB = -4 + ((seed >> 4) % 10);
      const x = col * cw + off + 2;
      const y = row * rh + wave + 2;
      const w = cw - 4.2;
      const h = rh - 4.2;

      // Stone granite gradient
      const sg = ctx.createLinearGradient(x, y, x, y + h);
      sg.addColorStop(0, `rgb(${base + warmR + 12}, ${base + 8}, ${base + warmB + 4})`);
      sg.addColorStop(1, `rgb(${base + warmR - 10}, ${base - 8}, ${base + warmB - 8})`);
      ctx.fillStyle = sg;
      ctx.beginPath();
      ctx.roundRect(x, y, w, h, 4);
      ctx.fill();

      // Bump height
      const bv = 170 + (seed % 65);
      bctx.fillStyle = `rgb(${bv},${bv},${bv})`;
      bctx.beginPath();
      bctx.roundRect(x + 1, y + 1, w - 2, h - 2, 3);
      bctx.fill();

      // Variable polished-stone / damp Parisian sheen roughness (darker = shinier!)
      const damp = Math.sin(col * 0.7 + row * 0.45) * 0.5 + 0.5;
      const rv = Math.floor(72 + damp * 115);
      rctx.fillStyle = `rgb(${rv},${rv},${rv})`;
      rctx.beginPath();
      rctx.roundRect(x, y, w, h, 4);
      rctx.fill();
    }
  }

  return {
    map: toTex(c, { repeatX: 11, repeatY: 32, srgb: true, aniso }),
    bumpMap: toTex(b, { repeatX: 11, repeatY: 32, srgb: false, aniso }),
    roughnessMap: toTex(r, { repeatX: 11, repeatY: 32, srgb: false, aniso }),
  };
}

/* ==================== 4. AUTHENTIC HAUSSMANN PARISIAN FACADE PBR (ALBEDO + BUMP + EMISSIVE) ==================== */
export function createHaussmannFacadePBR(aniso = 4) {
  const [c, ctx] = makeCanvas(1024, 1024);
  const [b, bctx] = makeCanvas(1024, 1024);
  const [e, ectx] = makeCanvas(1024, 1024);

  // Cream Parisian Pierre de Taille limestone base
  const bg = ctx.createLinearGradient(0, 0, 0, 1024);
  bg.addColorStop(0, '#e5d8c3');
  bg.addColorStop(0.65, '#d6c4aa');
  bg.addColorStop(1, '#baa68a');
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, 1024, 1024);

  bctx.fillStyle = '#909090';
  bctx.fillRect(0, 0, 1024, 1024);
  ectx.fillStyle = '#000000';
  ectx.fillRect(0, 0, 1024, 1024);

  // Dressed ashlar stone block joints
  for (let y = 0; y < 740; y += 34) {
    const shade = ((y * 13) % 10) - 5;
    ctx.strokeStyle = 'rgba(105, 86, 62, 0.24)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(1024, y);
    ctx.stroke();

    bctx.strokeStyle = '#555555';
    bctx.lineWidth = 2;
    bctx.beginPath();
    bctx.moveTo(0, y);
    bctx.lineTo(1024, y);
    bctx.stroke();

    const off = ((y / 34) % 2) * 56;
    for (let x = off; x < 1024; x += 112) {
      ctx.fillStyle = `rgba(${180 + shade}, ${160 + shade}, ${135 + shade}, 0.08)`;
      ctx.fillRect(x, y, 110, 32);
      ctx.beginPath();
      ctx.moveTo(x, y);
      ctx.lineTo(x, y + 34);
      ctx.stroke();
    }
  }

  // Sculpted Horizontal Haussmann Stringcourses / Cornice Ledges
  [44, 266, 494, 728].forEach((y) => {
    ctx.fillStyle = '#efe5d4';
    ctx.fillRect(0, y, 1024, 14);
    ctx.fillStyle = 'rgba(72, 54, 38, 0.45)';
    ctx.fillRect(0, y + 14, 1024, 8);
    bctx.fillStyle = '#ffffff';
    bctx.fillRect(0, y, 1024, 14);
    bctx.fillStyle = '#383838';
    bctx.fillRect(0, y + 14, 1024, 8);
  });

  // 3 Upper Residential Floors x 4 Tall Arched French Windows + Ornate Wrought-Iron Juliet Balconies
  const floorYs = [74, 300, 528];
  const colXs = [68, 302, 536, 770];

  floorYs.forEach((fy, fi) => {
    colXs.forEach((wx, ci) => {
      const ww = 166;
      const wh = 186;
      const lit = (fi + ci) % 3 !== 1; // Realistic mix of warm lit apartments & reflective dusk glass!

      // Molded stone window surround + pediment
      ctx.fillStyle = '#eee3d0';
      ctx.fillRect(wx - 12, fy - 14, ww + 24, wh + 20);
      ctx.strokeStyle = 'rgba(84, 66, 46, 0.5)';
      ctx.lineWidth = 3;
      ctx.strokeRect(wx - 12, fy - 14, ww + 24, wh + 20);
      bctx.fillStyle = '#dcdcdc';
      bctx.fillRect(wx - 12, fy - 14, ww + 24, wh + 20);

      // Recessed dark window reveal + warm glowing Parisian room interior
      bctx.fillStyle = '#202020';
      bctx.fillRect(wx, fy, ww, wh);

      const wg = ctx.createLinearGradient(wx, fy, wx, fy + wh);
      if (lit) {
        wg.addColorStop(0, '#ffdf9e');
        wg.addColorStop(0.55, '#e8a852');
        wg.addColorStop(1, '#8c5526');
      } else {
        wg.addColorStop(0, '#4d5c78');
        wg.addColorStop(0.5, '#2b3244');
        wg.addColorStop(1, '#1a1d28');
      }
      ctx.fillStyle = wg;
      ctx.fillRect(wx, fy, ww, wh);

      // Soft warm curtains inside window edges
      ctx.fillStyle = lit ? 'rgba(130, 72, 34, 0.34)' : 'rgba(16, 20, 30, 0.48)';
      ctx.fillRect(wx, fy, 26, wh);
      ctx.fillRect(wx + ww - 26, fy, 26, wh);

      // Emissive map for warm interior glow at sunset/night!
      if (lit) {
        const eg = ectx.createLinearGradient(wx, fy, wx, fy + wh);
        eg.addColorStop(0, '#ffcf76');
        eg.addColorStop(0.65, '#c97b2c');
        eg.addColorStop(1, '#5c3110');
        ectx.fillStyle = eg;
        ectx.fillRect(wx + 6, fy + 6, ww - 12, wh - 12);
      }

      // Classical French casement mullions (white/ivory painted wood bars)
      ctx.strokeStyle = '#efe7da';
      ctx.lineWidth = 5;
      ctx.strokeRect(wx + 2, fy + 2, ww - 4, wh - 4);
      ctx.beginPath();
      ctx.moveTo(wx + ww / 2, fy);
      ctx.lineTo(wx + ww / 2, fy + wh);
      ctx.moveTo(wx, fy + wh * 0.38);
      ctx.lineTo(wx + ww, fy + wh * 0.38);
      ctx.moveTo(wx, fy + wh * 0.7);
      ctx.lineTo(wx + ww, fy + wh * 0.7);
      ctx.stroke();

      // Ornate Black Wrought-Iron Haussmann Balcony Railing (garde-corps) across lower 35%
      const railY = fy + wh * 0.64;
      const railH = wh * 0.36;
      ctx.strokeStyle = '#1b1d22';
      ctx.lineWidth = 4;
      ctx.strokeRect(wx - 6, railY, ww + 12, railH);
      for (let rx = wx + 4; rx <= wx + ww - 4; rx += 16) {
        ctx.beginPath();
        ctx.moveTo(rx, railY);
        ctx.lineTo(rx, railY + railH);
        ctx.stroke();
      }
      // Decorative iron medallion circles
      ctx.lineWidth = 2.5;
      for (let cx = wx + 22; cx < wx + ww - 10; cx += 40) {
        ctx.beginPath();
        ctx.arc(cx, railY + railH * 0.5, 11, 0, Math.PI * 2);
        ctx.stroke();
      }
      ectx.fillStyle = '#000000';
      ectx.fillRect(wx - 6, railY, ww + 12, 6);
    });
  });

  // Ground Floor: Elegant Dark-Wood Parisian Café / Gallery Storefront (y = 748..1024)
  ctx.fillStyle = '#241c18';
  ctx.fillRect(0, 748, 1024, 276);
  ctx.fillStyle = '#c9a152';
  ctx.fillRect(0, 748, 1024, 8);
  ctx.fillRect(0, 792, 1024, 4);

  // Brass Parisian Café Signboard
  ctx.fillStyle = '#f2d388';
  ctx.textAlign = 'center';
  ctx.direction = 'ltr';
  ctx.font = '600 26px Cinzel, Georgia, serif';
  ctx.fillText('CAFÉ DE PARIS  •  GALERIE SAINT-HONORÉ  •  ATELIER', 512, 780);

  // 3 Wide Arched Warm-Lit Ground-Floor Café Windows & Brass Door
  [54, 378, 702].forEach((sx) => {
    const sw = 268;
    const sh = 198;
    const sy = 812;
    const cg = ctx.createLinearGradient(sx, sy, sx, sy + sh);
    cg.addColorStop(0, '#ffe3a8');
    cg.addColorStop(0.55, '#db9242');
    cg.addColorStop(1, '#633516');
    ctx.fillStyle = cg;
    ctx.fillRect(sx, sy, sw, sh);

    ectx.fillStyle = '#e5a44d';
    ectx.fillRect(sx + 8, sy + 8, sw - 16, sh - 16);

    // Subtle interior café chandelier silhouettes
    ctx.fillStyle = 'rgba(255, 248, 224, 0.72)';
    ctx.beginPath();
    ctx.arc(sx + sw * 0.35, sy + 44, 14, 0, Math.PI * 2);
    ctx.arc(sx + sw * 0.65, sy + 44, 14, 0, Math.PI * 2);
    ctx.fill();

    // Brass café mullions
    ctx.strokeStyle = '#b88c3c';
    ctx.lineWidth = 5;
    ctx.strokeRect(sx, sy, sw, sh);
    ctx.beginPath();
    ctx.moveTo(sx + sw / 2, sy);
    ctx.lineTo(sx + sw / 2, sy + sh);
    ctx.stroke();
  });

  return {
    map: toTex(c, { repeatX: 1, repeatY: 1, srgb: true, aniso }),
    bumpMap: toTex(b, { repeatX: 1, repeatY: 1, srgb: false, aniso }),
    emissiveMap: toTex(e, { repeatX: 1, repeatY: 1, srgb: true, aniso }),
  };
}

/* ==================== 5. AUTHENTIC MUSÉE DU LOUVRE PALACE FACADE PBR ==================== */
export function createLouvrePalacePBR(aniso = 4) {
  const [c, ctx] = makeCanvas(1024, 1024);
  const [b, bctx] = makeCanvas(1024, 1024);
  const [e, ectx] = makeCanvas(1024, 1024);

  // Warm Golden-Ochre French Renaissance Lutetian Limestone
  const lg = ctx.createLinearGradient(0, 0, 0, 1024);
  lg.addColorStop(0, '#e8dac0');
  lg.addColorStop(0.55, '#d6c19e');
  lg.addColorStop(1, '#b8a07c');
  ctx.fillStyle = lg;
  ctx.fillRect(0, 0, 1024, 1024);

  bctx.fillStyle = '#888888';
  bctx.fillRect(0, 0, 1024, 1024);
  ectx.fillStyle = '#000000';
  ectx.fillRect(0, 0, 1024, 1024);

  // Fine dressed Renaissance limestone blocks
  ctx.strokeStyle = 'rgba(104, 82, 54, 0.24)';
  ctx.lineWidth = 2;
  for (let y = 0; y < 1024; y += 32) {
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(1024, y);
    ctx.stroke();
  }

  // Ornate Entablatures & Balustrade Cornices between 3 Grand Palace Stories
  [28, 344, 670].forEach((y) => {
    ctx.fillStyle = '#f2e6cf';
    ctx.fillRect(0, y, 1024, 24);
    ctx.fillStyle = 'rgba(72, 52, 32, 0.5)';
    ctx.fillRect(0, y + 24, 1024, 12);
    bctx.fillStyle = '#ffffff';
    bctx.fillRect(0, y, 1024, 24);
    bctx.fillStyle = '#2e2e2e';
    bctx.fillRect(0, y + 24, 1024, 12);
  });

  // 4 Classical Architectural Bays per Panel (Paired Corinthian Pilasters + Arched Gallery Windows + Pediments!)
  const bays = [76, 316, 556, 796];
  bays.forEach((bx) => {
    // Paired sculpted Corinthian pilasters flanking each bay
    [bx - 42, bx - 18, bx + 168, bx + 192].forEach((px) => {
      const pg = ctx.createLinearGradient(px, 0, px + 18, 0);
      pg.addColorStop(0, '#c8b28e');
      pg.addColorStop(0.5, '#f4ead8');
      pg.addColorStop(1, '#9c8462');
      ctx.fillStyle = pg;
      ctx.fillRect(px, 64, 18, 940);
      bctx.fillStyle = '#e8e8e8';
      bctx.fillRect(px, 64, 18, 940);
    });

    // Upper Floor: Sculpted Stone Oeil-de-Boeuf / Rectangular Gallery Window with Triangular Pediment
    const drawArchWindow = (x, y, w, h, arched, glowing) => {
      // Stone surround
      ctx.fillStyle = '#efe4cf';
      ctx.fillRect(x - 10, y - 10, w + 20, h + 16);
      bctx.fillStyle = '#d4d4d4';
      bctx.fillRect(x - 10, y - 10, w + 20, h + 16);

      // Triangular Classical Pediment above window
      ctx.beginPath();
      ctx.moveTo(x - 18, y - 10);
      ctx.lineTo(x + w / 2, y - 48);
      ctx.lineTo(x + w + 18, y - 10);
      ctx.closePath();
      ctx.fillStyle = '#f2e8d4';
      ctx.fill();
      ctx.strokeStyle = 'rgba(84, 62, 38, 0.55)';
      ctx.lineWidth = 3;
      ctx.stroke();

      // Window opening (arched top for Louvre galleries!)
      ctx.save();
      ctx.beginPath();
      if (arched) {
        ctx.arc(x + w / 2, y + w / 2, w / 2, Math.PI, 0);
        ctx.lineTo(x + w, y + h);
        ctx.lineTo(x, y + h);
      } else {
        ctx.rect(x, y, w, h);
      }
      ctx.closePath();
      const wg = ctx.createLinearGradient(x, y, x, y + h);
      if (glowing) {
        wg.addColorStop(0, '#ffe3a3');
        wg.addColorStop(0.6, '#d99846');
        wg.addColorStop(1, '#5e3918');
      } else {
        wg.addColorStop(0, '#44526c');
        wg.addColorStop(1, '#1b202d');
      }
      ctx.fillStyle = wg;
      ctx.fill();

      // Bump recess
      bctx.fillStyle = '#1c1c1c';
      bctx.fillRect(x, y, w, h);

      // Warm museum interior gallery glow
      if (glowing) {
        ectx.fillStyle = '#d49642';
        ectx.fillRect(x + 8, y + (arched ? 34 : 8), w - 16, h - (arched ? 42 : 16));
      }

      // Fine French museum window lattice grid
      ctx.strokeStyle = '#efe5d2';
      ctx.lineWidth = 3.5;
      ctx.beginPath();
      ctx.moveTo(x + w / 2, y);
      ctx.lineTo(x + w / 2, y + h);
      for (let gy = y + 48; gy < y + h - 12; gy += 44) {
        ctx.moveTo(x, gy);
        ctx.lineTo(x + w, gy);
      }
      ctx.stroke();
      ctx.restore();
    };

    drawArchWindow(bx + 12, 118, 126, 206, false, true);  // 2nd Gallery Floor
    drawArchWindow(bx + 12, 424, 126, 224, true, true);   // Piano Nobile Arched Louvre Gallery
    drawArchWindow(bx + 8, 742, 134, 260, true, true);    // Ground Floor Grand Courtyard Arcade
  });

  return {
    map: toTex(c, { repeatX: 2, repeatY: 1, srgb: true, aniso }),
    bumpMap: toTex(b, { repeatX: 2, repeatY: 1, srgb: false, aniso }),
    emissiveMap: toTex(e, { repeatX: 2, repeatY: 1, srgb: true, aniso }),
  };
}

/* ==================== 6. PARIS SLATE MANSARD ROOF + ORNATE DORMER WINDOWS ==================== */
export function createMansardRoofPBR(aniso = 4) {
  const [c, ctx] = makeCanvas(512, 256);
  const [b, bctx] = makeCanvas(512, 256);

  const g = ctx.createLinearGradient(0, 0, 0, 256);
  g.addColorStop(0, '#364152');
  g.addColorStop(0.5, '#27303e');
  g.addColorStop(1, '#1d2430');
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, 512, 256);

  bctx.fillStyle = '#707070';
  bctx.fillRect(0, 0, 512, 256);

  // Overlapping zinc-slate tiles + vertical Paris standing seams
  for (let y = 0; y < 256; y += 20) {
    ctx.strokeStyle = 'rgba(15, 20, 28, 0.55)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(512, y);
    ctx.stroke();
  }
  for (let x = 0; x < 512; x += 32) {
    ctx.strokeStyle = 'rgba(140, 160, 185, 0.22)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x, 256);
    ctx.stroke();
    bctx.fillStyle = '#c8c8c8';
    bctx.fillRect(x, 0, 3, 256);
  }

  // Ornate Gilded Louvre Lucarne Dormer Windows
  [84, 256, 428].forEach((dx) => {
    ctx.fillStyle = '#d4b468';
    ctx.fillRect(dx - 24, 62, 48, 122);
    ctx.fillStyle = '#33281d';
    ctx.fillRect(dx - 17, 78, 34, 96);
    ctx.fillStyle = 'rgba(255, 212, 128, 0.55)';
    ctx.fillRect(dx - 14, 82, 28, 88);
    // Dormer stone cap
    ctx.beginPath();
    ctx.arc(dx, 62, 24, Math.PI, 0);
    ctx.fillStyle = '#e5c87e';
    ctx.fill();
  });

  // Top gilded roof cresting trim
  ctx.fillStyle = '#e2be68';
  ctx.fillRect(0, 0, 512, 10);

  return {
    map: toTex(c, { repeatX: 3, repeatY: 1, srgb: true, aniso }),
    bumpMap: toTex(b, { repeatX: 3, repeatY: 1, srgb: false, aniso }),
  };
}

/* ==================== 7. EIFFEL TOWER LACY IRON FILIGREE LATTICE (ALPHA-CUTOUT!) ==================== */
export function createEiffelLatticeTexture(aniso = 4) {
  const [c, ctx] = makeCanvas(512, 512);
  ctx.clearRect(0, 0, 512, 512);

  // Warm Gustave Eiffel "Eiffel Brown" riveted bronze-iron lattice
  ctx.strokeStyle = '#5e493b';
  ctx.lineWidth = 14;
  ctx.strokeRect(7, 7, 498, 498);

  const cells = 4;
  const step = 512 / cells;
  for (let row = 0; row < cells; row++) {
    const y0 = row * step;
    // Horizontal cross-beam
    ctx.fillStyle = '#6c5545';
    ctx.fillRect(0, y0 - 6, 512, 12);

    // X-bracing diagonal iron trusses + secondary sub-lattice
    for (let col = 0; col < 2; col++) {
      const x0 = col * 256;
      ctx.strokeStyle = '#5a4638';
      ctx.lineWidth = 10;
      ctx.beginPath();
      ctx.moveTo(x0, y0);
      ctx.lineTo(x0 + 256, y0 + step);
      ctx.moveTo(x0 + 256, y0);
      ctx.lineTo(x0, y0 + step);
      ctx.stroke();

      // Secondary delicate inner diagonals
      ctx.strokeStyle = '#735b49';
      ctx.lineWidth = 4.5;
      ctx.beginPath();
      ctx.moveTo(x0 + 128, y0);
      ctx.lineTo(x0 + 256, y0 + step * 0.5);
      ctx.lineTo(x0 + 128, y0 + step);
      ctx.lineTo(x0, y0 + step * 0.5);
      ctx.closePath();
      ctx.stroke();
    }
  }

  // Subtle warm golden sunset specular sheen on rivets
  ctx.fillStyle = '#9c7d5c';
  for (let y = 0; y <= 512; y += step) {
    for (let x = 0; x <= 512; x += 128) {
      ctx.beginPath();
      ctx.arc(x, y, 5, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  const tex = toTex(c, { repeatX: 1, repeatY: 2, srgb: true, aniso });
  return tex;
}

/* ==================== 8. REALISTIC BOTANICAL PARISIAN PLANE-TREE LEAF CLUSTER ==================== */
export function createTreeFoliageTexture() {
  const [c, ctx] = makeCanvas(256, 256);
  ctx.clearRect(0, 0, 256, 256);

  // Paint ~75 layered sunlit autumnal-olive Parisian plane leaves!
  const palette = ['#485831', '#5c6b39', '#6d783d', '#8a7a3e', '#a68440', '#3d4c2a'];
  for (let i = 0; i < 82; i++) {
    const a = (i * 2.39996) % (Math.PI * 2);
    const rad = Math.sqrt(i / 82) * 96;
    const x = 128 + Math.cos(a) * rad + Math.sin(i * 5.3) * 8;
    const y = 128 + Math.sin(a) * rad + Math.cos(i * 4.1) * 8;
    const size = 15 + ((i * 7) % 14);
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(a + (i % 5) * 0.4);
    ctx.fillStyle = palette[i % palette.length];
    ctx.beginPath();
    ctx.ellipse(0, 0, size, size * 0.58, 0, 0, Math.PI * 2);
    ctx.fill();
    // Sunlit leaf vein highlight
    ctx.strokeStyle = 'rgba(235, 210, 130, 0.25)';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(-size * 0.7, 0);
    ctx.lineTo(size * 0.7, 0);
    ctx.stroke();
    ctx.restore();
  }

  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

/* ==================== 9. LOUVRE GRAND GALLERY OILED OAK CHEVRON PARQUET PBR ==================== */
export function createGrandGalleryParquetPBR(aniso = 4) {
  const [c, ctx] = makeCanvas(512, 512);
  const [b, bctx] = makeCanvas(512, 512);
  const [r, rctx] = makeCanvas(512, 512);

  ctx.fillStyle = '#472c18';
  ctx.fillRect(0, 0, 512, 512);
  bctx.fillStyle = '#808080';
  bctx.fillRect(0, 0, 512, 512);
  rctx.fillStyle = '#606060';
  rctx.fillRect(0, 0, 512, 512);

  const step = 32;
  for (let y = -64; y < 576; y += step) {
    for (let x = -64; x < 576; x += step * 2) {
      const seed = Math.abs(x * 13 + y * 29) % 28;
      const drawPlank = (px, py, rot, shadeShift) => {
        ctx.save();
        ctx.translate(px, py);
        ctx.rotate(rot);
        const rr = 114 + shadeShift;
        const gg = 76 + Math.floor(shadeShift * 0.72);
        const bb = 44 + Math.floor(shadeShift * 0.45);
        ctx.fillStyle = `rgb(${rr},${gg},${bb})`;
        ctx.fillRect(0, 0, step * 1.42, step * 0.5);
        // Subtle wood grain fibers
        ctx.strokeStyle = 'rgba(42, 22, 10, 0.22)';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(0, step * 0.18);
        ctx.lineTo(step * 1.42, step * 0.18);
        ctx.moveTo(0, step * 0.34);
        ctx.lineTo(step * 1.42, step * 0.34);
        ctx.stroke();
        ctx.strokeStyle = 'rgba(20, 10, 4, 0.65)';
        ctx.lineWidth = 1.6;
        ctx.strokeRect(0, 0, step * 1.42, step * 0.5);
        ctx.restore();

        bctx.save();
        bctx.translate(px, py);
        bctx.rotate(rot);
        bctx.fillStyle = '#c8c8c8';
        bctx.fillRect(1, 1, step * 1.42 - 2, step * 0.5 - 2);
        bctx.strokeStyle = '#202020';
        bctx.lineWidth = 2;
        bctx.strokeRect(0, 0, step * 1.42, step * 0.5);
        bctx.restore();

        rctx.save();
        rctx.translate(px, py);
        rctx.rotate(rot);
        const rv = 55 + ((seed * 3) % 45); // Glossy waxed Louvre oak!
        rctx.fillStyle = `rgb(${rv},${rv},${rv})`;
        rctx.fillRect(0, 0, step * 1.42, step * 0.5);
        rctx.restore();
      };
      drawPlank(x, y, Math.PI / 4, seed - 14);
      drawPlank(x + step, y, -Math.PI / 4, 10 - seed);
    }
  }

  return {
    map: toTex(c, { repeatX: 5, repeatY: 22, srgb: true, aniso }),
    bumpMap: toTex(b, { repeatX: 5, repeatY: 22, srgb: false, aniso }),
    roughnessMap: toTex(r, { repeatX: 5, repeatY: 22, srgb: false, aniso }),
  };
}

/* ==================== 10. LOUVRE GRAND GALLERY MOLDED WALLS & CARRARA MARBLE ==================== */
export function createLouvreWallPanelPBR(aniso = 4) {
  const [c, ctx] = makeCanvas(512, 512);
  const [b, bctx] = makeCanvas(512, 512);

  // Warm museum gallery stucco upper wall + deep classical wainscoting
  const g = ctx.createLinearGradient(0, 0, 0, 512);
  g.addColorStop(0, '#e5d8c2');
  g.addColorStop(0.72, '#d8c7ab');
  g.addColorStop(0.74, '#a68854'); // gold chair rail
  g.addColorStop(0.76, '#574636'); // rich museum oak/stone wainscot
  g.addColorStop(1, '#3b2e23');
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, 512, 512);

  bctx.fillStyle = '#888888';
  bctx.fillRect(0, 0, 512, 512);

  // Recessed molded wall boiserie panels
  [36, 276].forEach((x) => {
    ctx.strokeStyle = 'rgba(130, 106, 72, 0.42)';
    ctx.lineWidth = 4;
    ctx.strokeRect(x, 48, 200, 300);
    ctx.strokeStyle = 'rgba(255, 248, 232, 0.55)';
    ctx.lineWidth = 2;
    ctx.strokeRect(x + 4, 52, 192, 292);
    bctx.strokeStyle = '#ffffff';
    bctx.lineWidth = 5;
    bctx.strokeRect(x, 48, 200, 300);

    // Lower wainscot carved panels
    ctx.strokeStyle = 'rgba(218, 182, 108, 0.34)';
    ctx.lineWidth = 3;
    ctx.strokeRect(x + 8, 404, 184, 86);
  });

  return {
    map: toTex(c, { repeatX: 12, repeatY: 1, srgb: true, aniso }),
    bumpMap: toTex(b, { repeatX: 12, repeatY: 1, srgb: false, aniso }),
  };
}

export function createCarraraMarblePBR(aniso = 4) {
  const [c, ctx] = makeCanvas(512, 512);
  ctx.fillStyle = '#f4eee4';
  ctx.fillRect(0, 0, 512, 512);

  // Delicate organic golden-grey Carrara marble veins
  for (let i = 0; i < 24; i++) {
    ctx.strokeStyle = i % 3 === 0 ? 'rgba(196, 168, 118, 0.24)' : 'rgba(148, 140, 132, 0.18)';
    ctx.lineWidth = 1.2 + (i % 4) * 1.1;
    ctx.beginPath();
    let x = (i * 53) % 512;
    let y = 0;
    ctx.moveTo(x, y);
    for (let s = 1; s <= 12; s++) {
      x += Math.sin(s * 0.9 + i) * 28;
      y = (s / 12) * 512;
      ctx.lineTo(x, y);
    }
    ctx.stroke();
  }
  return toTex(c, { repeatX: 2, repeatY: 2, srgb: true, aniso });
}

/* ==================== 11. FLOATING GOLDEN PARCHMENT, ENTRANCE PLAQUE & GLOWING PAWPRINT ==================== */
export function createParchmentTexture(titleText, subtitleText) {
  const [c, ctx] = makeCanvas(320, 420);
  const g = ctx.createLinearGradient(0, 0, 320, 420);
  g.addColorStop(0, '#fbf0d2');
  g.addColorStop(0.5, '#eed79f');
  g.addColorStop(1, '#d7b065');
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, 320, 420);

  ctx.strokeStyle = '#8b6220';
  ctx.lineWidth = 5;
  ctx.strokeRect(16, 16, 288, 388);
  ctx.lineWidth = 1.8;
  ctx.strokeRect(26, 26, 268, 368);

  ctx.textAlign = 'center';
  ctx.direction = 'ltr';
  ctx.fillStyle = '#6e4a12';
  ctx.font = 'bold 20px Cinzel, Georgia, serif';
  ctx.fillText('✦ HEY LOUVRE ✦', 160, 68);

  ctx.direction = 'rtl';
  ctx.fillStyle = '#241506';
  ctx.font = 'bold 30px Cairo, sans-serif';
  ctx.fillText(titleText, 160, 142);

  ctx.fillStyle = '#684414';
  ctx.font = '600 20px Cairo, sans-serif';
  ctx.fillText(subtitleText, 160, 188);

  ctx.strokeStyle = 'rgba(92, 60, 14, 0.42)';
  ctx.lineWidth = 2.2;
  for (let i = 0; i < 4; i++) {
    ctx.beginPath();
    ctx.moveTo(54, 236 + i * 28);
    ctx.lineTo(266, 236 + i * 28);
    ctx.stroke();
  }

  // Royal crimson wax seal stamped HEY
  ctx.fillStyle = '#992424';
  ctx.beginPath();
  ctx.arc(160, 366, 24, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = '#d4a64a';
  ctx.lineWidth = 2;
  ctx.stroke();
  ctx.direction = 'ltr';
  ctx.fillStyle = '#fbe3a4';
  ctx.font = 'bold 13px Cinzel, Georgia, serif';
  ctx.fillText('HEY', 160, 371);

  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

export function createLouvreSignTexture() {
  const [c, ctx] = makeCanvas(1024, 200);
  const g = ctx.createLinearGradient(0, 0, 1024, 200);
  g.addColorStop(0, '#16100a');
  g.addColorStop(0.5, '#241a10');
  g.addColorStop(1, '#16100a');
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, 1024, 200);

  ctx.strokeStyle = '#e8c268';
  ctx.lineWidth = 7;
  ctx.strokeRect(10, 10, 1004, 180);
  ctx.strokeStyle = 'rgba(232,194,104,0.45)';
  ctx.lineWidth = 2;
  ctx.strokeRect(20, 20, 984, 160);

  ctx.textAlign = 'center';
  ctx.direction = 'rtl';
  ctx.fillStyle = '#fbf0cf';
  ctx.font = 'bold 58px Amiri, Georgia, serif';
  ctx.fillText('متحف اللوفر  •  معرض رحلة يمنى', 512, 98);

  ctx.direction = 'ltr';
  ctx.fillStyle = '#e8c268';
  ctx.font = '600 26px Cinzel, Georgia, serif';
  ctx.fillText('MUSÉE DU LOUVRE PARIS  •  HEY EDITION  •  5 DECEMBER', 512, 156);

  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

export function createPawPrintTexture() {
  const [c, ctx] = makeCanvas(128, 128);
  ctx.fillStyle = '#ffe599';
  ctx.shadowColor = '#f4b942';
  ctx.shadowBlur = 14;
  ctx.beginPath();
  ctx.ellipse(64, 78, 22, 18, 0, 0, Math.PI * 2);
  ctx.fill();
  [[35, 50], [53, 36], [75, 36], [93, 50]].forEach(([x, y]) => {
    ctx.beginPath();
    ctx.arc(x, y, 10, 0, Math.PI * 2);
    ctx.fill();
  });
  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}
