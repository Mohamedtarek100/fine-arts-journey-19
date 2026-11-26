/**
 * =========================================================================
 *  Main Application Logic — HEY Edition Ultra (v10 — 60FPS Silky 3D + Realistic Cake)
 *  - Continuous pixel-by-pixel 3D scroll motion (zero dead-zone plateau!)
 *  - Realistic 2-Tier 3D Birthday Cake with Sculpted "1" & "9" Candles + Pro Controls
 *  - Spotlight Final Manifesto Section + Daily Peace Capsule + Family Star Pledge
 *  - Pro Fine-Arts Studio: Calligraphy, 8-Way Symmetry, Charcoal, Watercolor + Perspective Grid
 *  - Real-Time Firebase Cloud Firestore Sync + 8 VIP Family Personas
 *  - Strict OWASP Zero-innerHTML Security Architecture
 *  - Designed & Developed by ENG / Mohamed Tarek
 * =========================================================================
 */

import { SITE_CONFIG } from './config.js?v=11';
import { Atelier3DScene } from './scene3d.js?v=11';
import { FamilyCloudVault } from './firebase-sync.js?v=11';

/* ==================== RUNTIME SECURITY GUARDS ==================== */
(function enforceFrameProtection() {
  try {
    if (window.top !== window.self) {
      document.documentElement.style.display = 'none';
      window.top.location.replace(window.self.location.href);
    }
  } catch {
    document.documentElement.style.display = 'none';
  }
})();

function deepFreeze(obj) {
  if (!obj || typeof obj !== 'object') return obj;
  Object.freeze(obj);
  for (const key of Object.keys(obj)) {
    const val = obj[key];
    if (val && typeof val === 'object' && !Object.isFrozen(val)) {
      deepFreeze(val);
    }
  }
  return obj;
}

const FROZEN_CONFIG = deepFreeze(SITE_CONFIG);
const VAULT_STORAGE_KEY = 'yomna_family_vault_xix_v1';
const ALLOWED_SENDER_IDS = new Set(
  FROZEN_CONFIG.reception.roles.filter((r) => !r.isHonoree).map((r) => r.id)
);

const STAGE_3D_LABELS = [
  '❖ مجسم 3D حي: لوحة الطفولة وأقلام الباستيل — اسحب للتدوير',
  '❖ مجسم 3D حي: جوهرة النسبة الذهبية وباليتة الأتيليه — اسحب للتدوير',
  '❖ مجسم 3D حي: الساعة الرملية الذهبية وقناديل تالتة ثانوي — اسحب للتدوير',
  '❖ مجسم 3D حي: بوابة كلية الفنون الجميلة والتمثال الرخامي — اسحب للتدوير',
];

const LIGHTING_MOODS = [
  { key: 'rembrandt', label: 'إضاءة: أتيليه الذهب' },
  { key: 'vangogh', label: 'إضاءة: ليلة فان جوخ' },
  { key: 'louvre', label: 'إضاءة: رخام اللوفر' },
  { key: 'terracotta', label: 'إضاءة: غروب فلورنسا' },
];

function safeAssetUrl(path, fallback = './assets/art/chapter4-fine-arts.jpg') {
  if (typeof path !== 'string') return fallback;
  const trimmed = path.trim();
  if (trimmed.includes('..')) return fallback;
  if (/^\.\/assets\/[a-zA-Z0-9._/-]+$/.test(trimmed)) return trimmed;
  return fallback;
}

function sanitizeText(raw, maxLen = 220) {
  if (typeof raw !== 'string') return '';
  return raw
    .replace(/[\u0000-\u001F\u007F<>`]/g, '')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, maxLen);
}

function el(tag, className, text) {
  const node = document.createElement(tag);
  if (className) node.className = className;
  if (text !== undefined && text !== null) node.textContent = String(text);
  return node;
}

function svgEl(tag, attrs = {}) {
  const node = document.createElementNS('http://www.w3.org/2000/svg', tag);
  for (const [k, v] of Object.entries(attrs)) {
    node.setAttribute(k, String(v));
  }
  return node;
}

/* ==================== URL GIFT TOKEN ENCODER / DECODER ==================== */
function encodeGiftToken(senderId, message) {
  if (!ALLOWED_SENDER_IDS.has(senderId)) return '';
  const cleanMsg = sanitizeText(message, 220);
  if (!cleanMsg) return '';
  const json = JSON.stringify({ f: senderId, m: cleanMsg, t: Date.now() });
  const bytes = new TextEncoder().encode(json);
  let bin = '';
  for (let i = 0; i < bytes.length; i++) bin += String.fromCharCode(bytes[i]);
  return btoa(bin).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/g, '');
}

function decodeGiftToken(token) {
  try {
    if (typeof token !== 'string' || token.length < 8 || token.length > 1400) return null;
    if (!/^[A-Za-z0-9_-]+$/.test(token)) return null;
    let b64 = token.replace(/-/g, '+').replace(/_/g, '/');
    while (b64.length % 4) b64 += '=';
    const bin = atob(b64);
    const bytes = new Uint8Array(bin.length);
    for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
    const parsed = JSON.parse(new TextDecoder().decode(bytes));
    if (!parsed || typeof parsed !== 'object') return null;
    if (!ALLOWED_SENDER_IDS.has(parsed.f)) return null;
    const msg = sanitizeText(parsed.m, 220);
    if (!msg) return null;
    return { senderId: parsed.f, message: msg, timestamp: Number(parsed.t) || Date.now() };
  } catch {
    return null;
  }
}

/* ==================== FAMILY VAULT STORE ==================== */
class FamilyVaultStore {
  constructor() {
    this.messages = this.load();
  }

  load() {
    const clean = {};
    try {
      const raw = window.localStorage.getItem(VAULT_STORAGE_KEY);
      if (!raw) return clean;
      const parsed = JSON.parse(raw);
      if (!parsed || typeof parsed !== 'object') return clean;
      for (const id of ALLOWED_SENDER_IDS) {
        const entry = parsed[id];
        if (entry && typeof entry.message === 'string') {
          const msg = sanitizeText(entry.message, 220);
          if (msg) {
            clean[id] = { message: msg, timestamp: Number(entry.timestamp) || Date.now(), custom: true };
          }
        }
      }
    } catch {
      // Ignore storage errors
    }
    return clean;
  }

  save(senderId, message) {
    if (!ALLOWED_SENDER_IDS.has(senderId)) return false;
    const cleanMsg = sanitizeText(message, 220);
    if (!cleanMsg) return false;
    this.messages[senderId] = { message: cleanMsg, timestamp: Date.now(), custom: true };
    try {
      window.localStorage.setItem(VAULT_STORAGE_KEY, JSON.stringify(this.messages));
    } catch {
      // Ignore fallback
    }
    return true;
  }

  getEntry(role) {
    if (this.messages[role.id]) {
      return { message: this.messages[role.id].message, isCustom: true };
    }
    return { message: role.defaultVaultMsg || '', isCustom: false };
  }

  getCustomCount() {
    return Object.keys(this.messages).length;
  }
}

/* ==================== GOLDEN SPARKLE CURSOR TRAIL (LIGHTWEIGHT DESKTOP) ==================== */
function initSparkleCursorTrail() {
  const canvas = document.getElementById('sparkle-canvas');
  const isTouchOnly = window.matchMedia('(pointer: coarse)').matches;
  if (!canvas || isTouchOnly || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  const ctx = canvas.getContext('2d');
  const particles = [];

  const resize = () => {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
  };
  resize();
  window.addEventListener('resize', resize, { passive: true });

  let lastSpawn = 0;
  window.addEventListener(
    'pointermove',
    (e) => {
      const now = performance.now();
      if (now - lastSpawn < 32) return;
      lastSpawn = now;
      particles.push({
        x: e.clientX + (Math.random() - 0.5) * 6,
        y: e.clientY + (Math.random() - 0.5) * 6,
        vx: (Math.random() - 0.5) * 0.45,
        vy: -0.35 - Math.random() * 0.5,
        size: 1.4 + Math.random() * 2.0,
        life: 1,
        decay: 0.032 + Math.random() * 0.02,
      });
      if (particles.length > 36) particles.shift();
    },
    { passive: true }
  );

  function renderTrail() {
    requestAnimationFrame(renderTrail);
    if (!particles.length) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    for (let i = particles.length - 1; i >= 0; i--) {
      const p = particles[i];
      p.x += p.vx;
      p.y += p.vy;
      p.life -= p.decay;
      if (p.life <= 0) {
        particles.splice(i, 1);
        continue;
      }
      ctx.globalAlpha = p.life * 0.68;
      ctx.fillStyle = '#f8e29e';
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.size * p.life, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.globalAlpha = 1;
  }
  renderTrail();
}

/* ==================== AMBIENT ATELIER AUDIO ==================== */
class AtelierAudio {
  constructor() {
    this.ctx = null;
    this.playing = false;
    this.timer = null;
    this.masterGain = null;
    this.notes = [261.63, 329.63, 392.0, 493.88, 587.33, 493.88, 392.0, 329.63];
    this.step = 0;
  }

  ensureContext() {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      this.ctx = new AudioCtx();
      this.masterGain = this.ctx.createGain();
      this.masterGain.gain.value = 0.09;
      this.masterGain.connect(this.ctx.destination);
    }
    if (this.ctx.state === 'suspended') this.ctx.resume();
  }

  playTone(freq, duration = 2.4, vol = 0.28) {
    if (!this.ctx || !this.masterGain) return;
    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const osc2 = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sine';
    osc2.type = 'triangle';
    osc.frequency.setValueAtTime(freq, now);
    osc2.frequency.setValueAtTime(freq * 2, now);

    gain.gain.setValueAtTime(0.0001, now);
    gain.gain.exponentialRampToValueAtTime(vol, now + 0.08);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + duration);

    const overtoneGain = this.ctx.createGain();
    overtoneGain.gain.value = 0.14;

    osc.connect(gain);
    osc2.connect(overtoneGain);
    overtoneGain.connect(gain);
    gain.connect(this.masterGain);

    osc.start(now);
    osc2.start(now);
    osc.stop(now + duration + 0.05);
    osc2.stop(now + duration + 0.05);
  }

  toggle() {
    if (this.playing) {
      this.stop();
      return false;
    }
    this.start();
    return true;
  }

  start() {
    try {
      this.ensureContext();
      this.playing = true;
      const tick = () => {
        if (!this.playing) return;
        const base = this.notes[this.step % this.notes.length];
        this.playTone(base, 2.8, 0.26);
        if (this.step % 4 === 0) this.playTone(base / 2, 3.6, 0.22);
        this.step++;
      };
      tick();
      this.timer = window.setInterval(tick, 1450);
    } catch {
      this.playing = false;
    }
  }

  stop() {
    this.playing = false;
    if (this.timer) {
      clearInterval(this.timer);
      this.timer = null;
    }
  }

  playWishChime() {
    try {
      this.ensureContext();
      [523.25, 659.25, 783.99, 987.77, 1174.66].forEach((f, idx) => {
        setTimeout(() => this.playTone(f, 3.0, 0.3), idx * 105);
      });
    } catch {
      // Ignore if blocked
    }
  }

  playEnvelopeChime() {
    try {
      this.ensureContext();
      [392.0, 493.88, 587.33, 783.99].forEach((f, idx) => {
        setTimeout(() => this.playTone(f, 2.1, 0.24), idx * 80);
      });
    } catch {
      // Ignore if blocked
    }
  }
}

/* ==================== SAFE SVG CRESTS ==================== */
function createRoleCrestSvg(type) {
  const svg = svgEl('svg', {
    viewBox: '0 0 24 24',
    fill: 'none',
    stroke: 'currentColor',
    'stroke-width': '1.6',
    'stroke-linecap': 'round',
    'stroke-linejoin': 'round',
  });

  if (type === 'palette') {
    svg.append(
      svgEl('path', { d: 'M12 3a9 9 0 1 0 0 18h1.5a2.5 2.5 0 0 0 0-5H12a2 2 0 0 1 0-4h4.5A4.5 4.5 0 0 0 12 3Z' }),
      svgEl('circle', { cx: 7.5, cy: 10.5, r: 1 }),
      svgEl('circle', { cx: 10.5, cy: 7.5, r: 1 }),
      svgEl('circle', { cx: 15, cy: 8.5, r: 1 })
    );
  } else if (type === 'pillar') {
    svg.append(
      svgEl('path', { d: 'M4 20h16M6 20V9M18 20V9M10 20V9M14 20V9' }),
      svgEl('path', { d: 'M3 9l9-5 9 5H3Z' })
    );
  } else if (type === 'blossom') {
    svg.append(
      svgEl('path', { d: 'M12 20c-4.5-3.2-7-6.3-7-9.6A4.4 4.4 0 0 1 12 7a4.4 4.4 0 0 1 7 3.4c0 3.3-2.5 6.4-7 9.6Z' }),
      svgEl('path', { d: 'M12 3v2M5 5l1.5 1.5M19 5l-1.5 1.5' })
    );
  } else if (type === 'shield') {
    svg.append(
      svgEl('path', { d: 'M12 3l7 3v5.5c0 4.6-3 8.1-7 9.5-4-1.4-7-4.9-7-9.5V6l7-3Z' }),
      svgEl('path', { d: 'M12 8.5l1.1 2.4 2.6.3-2 1.8.5 2.5-2.2-1.3-2.2 1.3.5-2.5-2-1.8 2.6-.3L12 8.5Z' })
    );
  } else if (type === 'compass') {
    svg.append(
      svgEl('circle', { cx: 12, cy: 12, r: 8.5 }),
      svgEl('polygon', { points: '15.8 8.2 13.7 13.7 8.2 15.8 10.3 10.3 15.8 8.2' })
    );
  } else if (type === 'laurel') {
    svg.append(
      svgEl('path', { d: 'M7 19c-2.5-3-3-7.5-1-12 2.5 1 4.5 3.5 5 6.5' }),
      svgEl('path', { d: 'M17 19c2.5-3 3-7.5 1-12-2.5 1-4.5 3.5-5 6.5' }),
      svgEl('path', { d: 'M12 5v15' })
    );
  } else if (type === 'butterfly') {
    svg.append(
      svgEl('path', { d: 'M12 12c-2-4-6.5-6-7.5-3.2C3.7 11 6.5 13 9 13c-2.2.8-3.8 2.8-2.5 4.8 1.4 2 4.5.2 5.5-2.8Z' }),
      svgEl('path', { d: 'M12 12c2-4 6.5-6 7.5-3.2.8 2.2-2 4.2-4.5 4.2 2.2.8 3.8 2.8 2.5 4.8-1.4 2-4.5.2-5.5-2.8Z' }),
      svgEl('path', { d: 'M12 7v11' })
    );
  } else {
    svg.append(
      svgEl('path', { d: 'M12 3l6 8-6 10-6-10 6-8Z' }),
      svgEl('circle', { cx: 12, cy: 11.5, r: 1.5 }),
      svgEl('path', { d: 'M12 13v8' })
    );
  }
  return svg;
}

function createGuideIconSvg(type) {
  const svg = svgEl('svg', {
    viewBox: '0 0 24 24',
    fill: 'none',
    stroke: 'currentColor',
    'stroke-width': '1.6',
    'stroke-linecap': 'round',
    'stroke-linejoin': 'round',
  });

  if (type === 'scroll') {
    svg.append(svgEl('rect', { x: 7, y: 3, width: 10, height: 18, rx: 5 }), svgEl('line', { x1: 12, y1: 7, x2: 12, y2: 11 }));
  } else if (type === 'orbit') {
    svg.append(
      svgEl('circle', { cx: 12, cy: 12, r: 3 }),
      svgEl('ellipse', { cx: 12, cy: 12, rx: 9, ry: 4, transform: 'rotate(-28 12 12)' }),
      svgEl('ellipse', { cx: 12, cy: 12, rx: 9, ry: 4, transform: 'rotate(28 12 12)' })
    );
  } else if (type === 'touch') {
    svg.append(
      svgEl('path', { d: 'M4 7.5A2.5 2.5 0 0 1 6.5 5h11A2.5 2.5 0 0 1 20 7.5v9A2.5 2.5 0 0 1 17.5 19h-11A2.5 2.5 0 0 1 4 16.5v-9Z' }),
      svgEl('path', { d: 'M4.5 7.5 12 13l7.5-5.5' })
    );
  } else {
    svg.append(
      svgEl('path', { d: 'M12 3l1.6 4.4L18 9l-4.4 1.6L12 15l-1.6-4.4L6 9l4.4-1.6z' }),
      svgEl('path', { d: 'M19 15l.8 2.2L22 18l-2.2.8L19 21l-.8-2.2L16 18l2.2-.8z' })
    );
  }
  return svg;
}

function createGuideCard(step) {
  const card = el('article', 'guide-card');
  const num = el('span', 'guide-card-num', step.num);
  num.setAttribute('aria-hidden', 'true');
  const iconBox = el('div', 'guide-icon-box');
  iconBox.setAttribute('aria-hidden', 'true');
  iconBox.appendChild(createGuideIconSvg(step.icon));
  card.append(num, iconBox, el('h3', '', step.titleAr), el('span', 'guide-en', step.titleEn), el('p', '', step.descAr));
  return card;
}

/* ==================== KEEPSAKE CARD & FAMILY CERTIFICATE RENDERERS ==================== */
function wrapCanvasText(ctx, text, maxWidth, maxLines = 5) {
  const words = text.split(/\s+/).filter(Boolean);
  const lines = [];
  let line = '';
  for (const w of words) {
    const candidate = line ? `${line} ${w}` : w;
    if (ctx.measureText(candidate).width > maxWidth && line) {
      lines.push(line);
      line = w;
    } else {
      line = candidate;
    }
  }
  if (line) lines.push(line);
  return lines.slice(0, maxLines);
}

function drawGoldenSupportCard(canvas, { senderDisplay, accentHex, message }) {
  const ctx = canvas.getContext('2d');
  const W = canvas.width;
  const H = canvas.height;
  const accent = accentHex || '#e8c268';

  const bg = ctx.createRadialGradient(W * 0.5, H * 0.35, 40, W * 0.5, H * 0.5, W * 0.68);
  bg.addColorStop(0, '#271c13');
  bg.addColorStop(0.65, '#150f0b');
  bg.addColorStop(1, '#0d0907');
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, W, H);

  ctx.strokeStyle = accent;
  ctx.lineWidth = 2.5;
  ctx.strokeRect(24, 24, W - 48, H - 48);
  ctx.strokeStyle = 'rgba(238, 210, 138, 0.32)';
  ctx.lineWidth = 1;
  ctx.strokeRect(36, 36, W - 72, H - 72);

  ctx.textAlign = 'center';
  ctx.direction = 'ltr';
  ctx.fillStyle = accent;
  ctx.font = '600 15px Cinzel, Georgia, serif';
  ctx.fillText('HEY  •  5 DECEMBER  •  YOMNA 19TH EDITION  •  FAMILY VAULT', W / 2, 78);

  ctx.direction = 'rtl';
  ctx.fillStyle = '#fbf0cf';
  ctx.font = '700 34px Amiri, Georgia, serif';
  ctx.fillText(`رسالة تهنئة وتشجيع إلى الفنانة ${FROZEN_CONFIG.artistName}`, W / 2, 134);

  ctx.strokeStyle = 'rgba(232, 194, 104, 0.5)';
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(W * 0.26, 158);
  ctx.lineTo(W * 0.74, 158);
  ctx.stroke();

  const body = sanitizeText(message, 220) || 'كل سنة وأنتِ طيبة وبألف خير يا يمنى، وبالتوفيق نحو كلية الفنون الجميلة.';
  ctx.fillStyle = '#f8f1e4';
  ctx.font = '500 25px Cairo, sans-serif';
  const lines = wrapCanvasText(ctx, body, W - 170, 5);
  const startY = 222 + Math.max(0, (4 - lines.length) * 14);
  lines.forEach((ln, i) => ctx.fillText(ln, W / 2, startY + i * 44));

  ctx.fillStyle = 'rgba(214, 171, 82, 0.14)';
  ctx.fillRect(W * 0.16, H - 144, W * 0.68, 42);
  ctx.strokeStyle = 'rgba(232, 194, 104, 0.45)';
  ctx.strokeRect(W * 0.16, H - 144, W * 0.68, 42);

  ctx.fillStyle = '#eed28a';
  ctx.font = '600 17px Cairo, sans-serif';
  ctx.fillText('ثانوية عامة بداية الرحلة.. والهدف هو اللي بنشتغل عليه كل يوم بفرح ✦', W / 2, H - 117);

  ctx.fillStyle = accent;
  ctx.font = '700 24px Amiri, Georgia, serif';
  ctx.fillText(`بكل فخر ودعاء — ${senderDisplay}`, W / 2, H - 62);
}

function downloadFamilyCertificatePng() {
  const c = document.createElement('canvas');
  c.width = 1200;
  c.height = 840;
  const ctx = c.getContext('2d');
  const W = c.width;
  const H = c.height;

  const bg = ctx.createRadialGradient(W * 0.5, H * 0.35, 60, W * 0.5, H * 0.5, W * 0.65);
  bg.addColorStop(0, '#2a1e14');
  bg.addColorStop(0.65, '#150f0a');
  bg.addColorStop(1, '#0b0806');
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, W, H);

  ctx.strokeStyle = '#e8c268';
  ctx.lineWidth = 4;
  ctx.strokeRect(30, 30, W - 60, H - 60);
  ctx.strokeStyle = 'rgba(238, 210, 138, 0.38)';
  ctx.lineWidth = 1.5;
  ctx.strokeRect(48, 48, W - 96, H - 96);

  ctx.textAlign = 'center';
  ctx.direction = 'ltr';
  ctx.fillStyle = '#d6ab52';
  ctx.font = '600 18px Cinzel, Georgia, serif';
  ctx.fillText('HEY  •  CERTIFICATE OF PRIDE & FUTURE ARTISTRY  •  5 DECEMBER', W / 2, 108);

  ctx.direction = 'rtl';
  ctx.fillStyle = '#fbf0cf';
  ctx.font = '700 52px Amiri, Georgia, serif';
  ctx.fillText('شهادة فخر ووسام العام التاسع عشر', W / 2, 192);

  ctx.fillStyle = '#e8c268';
  ctx.font = '700 62px Amiri, Georgia, serif';
  ctx.fillText(`الفنانة ${FROZEN_CONFIG.artistName}`, W / 2, 290);

  ctx.fillStyle = '#f8f1e4';
  ctx.font = '500 27px Cairo, sans-serif';
  ctx.fillText('تقديراً لموهبتها الفنية الراقية وخطواتها الواثقة في عامها التاسع عشر', W / 2, 392);
  ctx.fillText('ثانوية عامة بداية الرحلة.. والهدف هو اللي بنشتغل عليه كل يوم وإحنا فرحانين', W / 2, 444);

  ctx.fillStyle = 'rgba(214, 171, 82, 0.14)';
  ctx.fillRect(W * 0.18, 500, W * 0.64, 56);
  ctx.strokeStyle = 'rgba(238, 210, 138, 0.5)';
  ctx.strokeRect(W * 0.18, 500, W * 0.64, 56);
  ctx.fillStyle = '#fbf0cf';
  ctx.font = '700 22px Cairo, sans-serif';
  ctx.fillText('✦ تالتة ثانوي بداية الرحلة ← نحو كلية الفنون الجميلة والنجاح المستمر ✦', W / 2, 536);

  ctx.fillStyle = '#d6ab52';
  ctx.font = '600 20px Cairo, sans-serif';
  ctx.fillText('مُهداة وموقّعة بكل فخر ومحبة من عائلتكِ:', W / 2, 622);

  ctx.fillStyle = '#fbf0cf';
  ctx.font = '700 32px Amiri, Georgia, serif';
  ctx.fillText(FROZEN_CONFIG.familySignOffAr, W / 2, 678);

  ctx.direction = 'ltr';
  ctx.fillStyle = 'rgba(238, 210, 138, 0.65)';
  ctx.font = '500 14px Cinzel, Georgia, serif';
  ctx.fillText('HEY EDITION  •  DESIGNED & DEVELOPED BY ENG / MOHAMED TAREK', W / 2, 756);

  const link = document.createElement('a');
  link.download = 'Yomna-19th-Year-Family-Certificate-HEY.png';
  link.href = c.toDataURL('image/png');
  link.click();
}

/* ==================== BUILD COHESIVE ACTS 01..04 WITH OPEN MOBILE 3D WINDOWS ==================== */
function createNarrativeBridge(text) {
  const wrap = el('div', 'chapter-bridge reveal');
  wrap.append(el('span', 'bridge-thread'), el('p', 'bridge-caption', `✦ ${text} ✦`), el('span', 'bridge-thread'));
  return wrap;
}

function createStoryActSection(ch, idx, cfg, openLightbox) {
  const isReverse = idx % 2 === 1;
  const zoneNum = idx + 1; // Zones 1, 2, 3, 4
  const section = el('section', `section chapter-section${isReverse ? ' reverse' : ''}`);
  section.id = ch.id;
  section.dataset.zone = String(zoneNum);
  section.dataset.stage = `الفصل ${ch.number} • ${ch.titleAr}`;

  const stageWin = el('div', 'stage-3d-window');
  stageWin.dataset.spinStage = 'true';
  const stagePill = el('div', 'stage-3d-pill');
  stagePill.appendChild(el('span', '', STAGE_3D_LABELS[idx] || STAGE_3D_LABELS[0]));
  stageWin.appendChild(stagePill);
  section.appendChild(stageWin);

  const grid = el('div', 'chapter-grid');

  const card = el('article', 'chapter-card reveal');
  const numBg = el('span', 'chapter-number-bg', ch.number);
  numBg.setAttribute('aria-hidden', 'true');

  const actNames = ['الفصل الأول', 'الفصل الثاني', 'الفصل الثالث', 'الفصل الرابع'];
  card.append(
    numBg,
    el('span', 'act-kicker', actNames[idx] || ch.eraAr),
    el('h2', 'chapter-title-ar', ch.titleAr),
    el('p', 'chapter-title-en', ch.titleEn),
    el('p', 'chapter-story', ch.storyAr),
    el('blockquote', 'chapter-quote', ch.quoteAr)
  );

  if (ch.id === 'thanaweya') {
    const hg = cfg.horizonGoal;
    const horizonBox = el('div', 'act-integrated-horizon');
    horizonBox.id = 'horizon-progress-shell';

    const head = el('div', 'act-horizon-head');
    head.append(
      el('span', 'hp-label', hg.stepsRemainingLabel),
      (() => {
        const pctWrap = el('span', 'hp-percent');
        const strong = el('strong', '', '0');
        strong.id = 'horizon-counter';
        strong.dataset.target = String(hg.progressPercent);
        pctWrap.append(strong, document.createTextNode('% '), el('small', '', 'من طريق الحلم'));
        return pctWrap;
      })()
    );

    const track = el('div', 'hp-track');
    const beam = el('div', 'hp-beam');
    beam.id = 'horizon-beam';
    beam.appendChild(el('span', 'hp-comet'));
    track.appendChild(beam);

    const nodes = el('div', 'hp-nodes');
    hg.timelineNodes.forEach((n) => {
      const icon = n.state === 'done' ? '✓' : n.state === 'current' ? '●' : '✦';
      const nd = el('div', `hp-node ${n.state}`);
      nd.append(el('span', '', icon), el('span', '', n.label));
      nodes.appendChild(nd);
    });

    horizonBox.append(head, track, nodes);
    card.appendChild(horizonBox);

    if (ch.encouragementBodyAr) {
      const envBox = el('div', 'envelope-box');
      envBox.id = 'encouragement-envelope';
      const envBtn = el('button', 'envelope-trigger');
      envBtn.type = 'button';
      envBtn.id = 'envelope-btn';
      envBtn.setAttribute('aria-expanded', 'false');
      envBtn.append(
        el('span', '', `✦ ${ch.encouragementTitleAr} (اضغط لفتح الرسالة)`),
        el('span', 'wax-seal-mini', cfg.brandLogo || 'HEY')
      );
      const envLetter = el('div', 'envelope-letter');
      envLetter.appendChild(el('p', '', ch.encouragementBodyAr));
      envBox.append(envBtn, envLetter);
      card.appendChild(envBox);
    }
  }

  if (ch.id === 'fine-arts') {
    const stepsWrap = el('div', 'goal-milestones');
    cfg.horizonGoal.goalStage.milestonesAr.forEach((m) => {
      const pill = el('div', 'goal-step-pill');
      pill.append(el('span', 'goal-step-code', m.code), el('span', '', m.label));
      stepsWrap.appendChild(pill);
    });
    card.appendChild(stepsWrap);
  }

  const artCol = el('div', 'art-column reveal');
  const safeImg = safeAssetUrl(ch.image);

  const figure = el('figure', 'museum-frame js-tilt-frame');
  const mat = el('div', 'museum-mat');
  const img = document.createElement('img');
  img.src = safeImg;
  img.alt = ch.captionAr;
  img.loading = 'lazy';
  img.draggable = false;
  img.referrerPolicy = 'no-referrer';
  mat.appendChild(img);

  const plaque = el('figcaption', 'frame-plaque');
  plaque.append(el('span', 'plaque-en', ch.captionEn), el('span', 'plaque-ar', ch.captionAr));
  figure.append(el('span', 'frame-year-pill', ch.yearTag), mat, plaque);
  figure.addEventListener('click', () => openLightbox(safeImg, ch.captionEn, ch.titleAr, ch.captionAr));
  artCol.appendChild(figure);

  if (ch.id === 'fine-arts') {
    const passWrap = el('div', 'dream-pass-wrap');
    const pass = el('div', 'dream-pass');
    pass.id = 'fine-arts-pass';

    const passTop = el('div', 'pass-top');
    const crest = el('div', 'pass-crest', '✦');
    crest.setAttribute('aria-hidden', 'true');
    const inst = el('div', 'pass-inst');
    inst.append(
      el('span', 'pass-inst-en', cfg.dreamPass.institutionEn),
      el('strong', 'pass-inst-ar', cfg.dreamPass.institutionAr)
    );
    passTop.append(crest, inst);

    const passBody = el('div', 'pass-body');
    const leftCol = el('div');
    leftCol.append(
      el('span', 'pass-field-label', cfg.dreamPass.subtitleAr),
      el('div', 'pass-name', cfg.artistName),
      el('span', 'pass-status', `● ${cfg.dreamPass.statusAr}`)
    );
    const serialCol = el('div', 'pass-serial');
    serialCol.append(el('div', '', cfg.dreamPass.batchAr), el('div', '', cfg.dreamPass.serialNo));
    passBody.append(leftCol, serialCol);

    pass.append(passTop, passBody);
    passWrap.appendChild(pass);
    artCol.appendChild(passWrap);
  }

  grid.append(card, artCol);
  section.appendChild(grid);

  if (ch.id === 'fine-arts' && cfg.gallery?.length) {
    const strip = el('div', 'integrated-gallery-strip reveal');
    const head = el('div', 'mini-gallery-head');
    head.append(
      el('h3', '', '🖼 أرشيف اللوحات الفنية الكامل'),
      el('span', '', 'اضغط على أي لوحة لتأملها بالحجم الكامل')
    );
    const thumbs = el('div', 'mini-gallery-thumbs');
    cfg.gallery.forEach((gItem) => {
      const gSrc = safeAssetUrl(gItem.image);
      const btn = el('button', 'mini-thumb-btn');
      btn.type = 'button';
      const tImg = document.createElement('img');
      tImg.src = gSrc;
      tImg.alt = gItem.titleAr;
      tImg.loading = 'lazy';
      tImg.draggable = false;
      btn.append(tImg, el('strong', '', gItem.titleAr), el('small', '', gItem.year));
      btn.addEventListener('click', () =>
        openLightbox(gSrc, `${gItem.titleEn} • ${gItem.year}`, gItem.titleAr, `${gItem.mediumAr} — ${gItem.descriptionAr}`)
      );
      thumbs.appendChild(btn);
    });
    strip.append(head, thumbs);
    section.appendChild(strip);
  }

  return section;
}

/* ==================== POPULATE ALL CONTENT + SPOTLIGHT FINAL MANIFESTO ==================== */
function renderContent(openLightbox) {
  const cfg = FROZEN_CONFIG;

  document.title = `رحلة ${cfg.artistName} | ${cfg.birthdayDateAr} — العام ${cfg.age} • ${cfg.brandLogo}`;
  document.getElementById('nav-date-en').textContent = cfg.birthdayDateEn;
  document.getElementById('nav-title-ar').textContent = `رحلة ${cfg.artistName}`;

  document.getElementById('hero-badge-ar').textContent = cfg.hero.badgeAr;
  document.getElementById('hero-title-prefix').textContent = cfg.hero.titlePrefixAr;
  document.getElementById('hero-artist-name').textContent = cfg.artistName;
  document.getElementById('hero-subtitle-ar').textContent = cfg.hero.subtitleAr;
  document.getElementById('hero-cta-en').textContent = cfg.hero.ctaEn;

  document.getElementById('guide-modal-sub').textContent = cfg.guide.subtitleAr;
  document.getElementById('guide-modal-grid').replaceChildren(...cfg.guide.steps.map(createGuideCard));

  const actsRoot = document.getElementById('story-acts-container');
  actsRoot.replaceChildren();

  const bridges = [
    cfg.chapterBridges.afterChildhood,
    cfg.chapterBridges.afterPassion,
    cfg.chapterBridges.afterThanaweya,
    cfg.chapterBridges.afterFineArts,
  ];

  cfg.chapters.forEach((ch, idx) => {
    actsRoot.appendChild(createStoryActSection(ch, idx, cfg, openLightbox));
    if (bridges[idx]) {
      actsRoot.appendChild(createNarrativeBridge(bridges[idx]));
    }
  });

  // Spotlight Important Final Message Section
  const fm = cfg.finalManifesto;
  if (fm) {
    const kickerEl = document.getElementById('manifesto-kicker');
    const eyebrowEl = document.getElementById('manifesto-eyebrow');
    const titleEl = document.getElementById('manifesto-title');
    const quoteEl = document.getElementById('manifesto-quote');
    const pillarsEl = document.getElementById('manifesto-pillars');

    if (kickerEl) kickerEl.textContent = fm.kickerAr;
    if (eyebrowEl) eyebrowEl.textContent = fm.eyebrowEn;
    if (titleEl) titleEl.textContent = fm.titleAr;
    if (quoteEl) quoteEl.textContent = fm.quoteAr;

    if (pillarsEl && fm.pillars) {
      pillarsEl.replaceChildren(
        ...fm.pillars.map((p) => {
          const item = el('article', 'manifesto-pillar');
          item.append(
            el('span', 'pillar-icon', p.icon),
            el('h3', '', p.titleAr),
            el('p', '', p.descAr)
          );
          return item;
        })
      );
    }
  }

  document.getElementById('finale-eyebrow-en').textContent = cfg.finale.eyebrowEn;
  document.getElementById('finale-age').textContent = String(cfg.age);
  document.getElementById('finale-title-ar').textContent = `${cfg.finale.titleAr} يا ${cfg.artistName}`;
  document.getElementById('finale-subtitle-ar').textContent = cfg.finale.subtitleAr;
  document.getElementById('finale-btn-ar').textContent = cfg.finale.buttonAr;
  document.getElementById('wish-heading-ar').textContent = cfg.finale.wishHeadingAr;
  document.getElementById('wish-message-ar').textContent = cfg.finale.wishMessageAr;
  document.getElementById('finale-family-names').textContent = cfg.familySignOffAr;
  document.getElementById('finale-sig-ar').textContent = cfg.signatureAr;
  document.getElementById('finale-sig-en').textContent = cfg.signatureEn;

  document.getElementById('footer-owner-ar').textContent = cfg.copyright.ownerAr;
  document.getElementById('footer-credit-ar').textContent = cfg.copyright.creditAr;
  document.getElementById('footer-rights-ar').textContent = cfg.copyright.rightsAr;
  document.getElementById('footer-rights-en').textContent = cfg.copyright.rightsEn;
}

/* ==================== SPOTLIGHT MANIFESTO: PEACE CAPSULE & STAR PLEDGE ==================== */
function initSpotlightManifesto(scene3d, audio) {
  const capsules = FROZEN_CONFIG.finalManifesto?.peaceCapsules || [];
  const textEl = document.getElementById('peace-capsule-text');
  const countEl = document.getElementById('peace-capsule-count');
  const nextBtn = document.getElementById('next-capsule-btn');
  const pledgeBtn = document.getElementById('pledge-star-btn');
  const pledgeFeedback = document.getElementById('pledge-feedback');

  let idx = 0;
  const renderCapsule = () => {
    if (!capsules.length || !textEl) return;
    textEl.classList.remove('capsule-pop');
    void textEl.offsetWidth;
    textEl.textContent = `«${capsules[idx]}»`;
    textEl.classList.add('capsule-pop');
    if (countEl) countEl.textContent = `${idx + 1} / ${capsules.length}`;
  };

  renderCapsule();

  if (nextBtn) {
    nextBtn.addEventListener('click', () => {
      idx = (idx + 1) % capsules.length;
      renderCapsule();
      audio.playEnvelopeChime();
    });
  }

  if (pledgeBtn) {
    let pledged = false;
    pledgeBtn.addEventListener('click', () => {
      pledged = !pledged;
      pledgeBtn.setAttribute('aria-pressed', String(pledged));
      pledgeBtn.classList.toggle('pledged', pledged);
      if (pledged) {
        audio.playWishChime();
        if (scene3d) scene3d.nudgeSpin(1.8);
        if (pledgeFeedback) {
          pledgeFeedback.textContent = '✦ شكراً لك! الدعم الهادئ والإيمان بالشغف هما أجمل هدية ليمنى في عامها التاسع عشر ✦';
        }
      } else if (pledgeFeedback) {
        pledgeFeedback.textContent = '';
      }
    });
  }
}

/* ==================== LIGHTBOX CONTROLLER ==================== */
function initLightboxController() {
  const lightbox = document.getElementById('lightbox');
  const lbImg = document.getElementById('lightbox-img');
  const lbMeta = document.getElementById('lightbox-meta');
  const lbTitle = document.getElementById('lightbox-title');
  const lbDesc = document.getElementById('lightbox-desc');
  const lbClose = document.getElementById('lightbox-close');

  const openLightbox = (src, meta, title, desc) => {
    lbImg.src = safeAssetUrl(src);
    lbImg.alt = title;
    lbMeta.textContent = meta;
    lbTitle.textContent = title;
    lbDesc.textContent = desc;
    lightbox.classList.add('open');
    lightbox.setAttribute('aria-hidden', 'false');
  };

  const closeLightbox = () => {
    lightbox.classList.remove('open');
    lightbox.setAttribute('aria-hidden', 'true');
  };

  lbClose.addEventListener('click', closeLightbox);
  lightbox.addEventListener('click', (e) => {
    if (e.target === lightbox) closeLightbox();
  });
  window.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && lightbox.classList.contains('open')) closeLightbox();
  });
  document.addEventListener('contextmenu', (e) => {
    if (e.target instanceof HTMLImageElement) e.preventDefault();
  });

  return openLightbox;
}

/* ==================== YOMNA'S PRIVATE VAULT + REAL-TIME CLOUD SYNC ==================== */
function initFamilyVaultExperience(vaultStore, cloudVault, audio) {
  const familyRoles = FROZEN_CONFIG.reception.roles.filter((r) => !r.isHonoree);
  const inboxPanel = document.getElementById('yomna-inbox-panel');
  const senderPanel = document.getElementById('family-sender-panel');
  const envelopesGrid = document.getElementById('yomna-envelopes-grid');
  const countPill = document.getElementById('vault-count-pill');

  const vaultEyebrow = document.getElementById('vault-eyebrow-en');
  const vaultTitle = document.getElementById('vault-title-ar');
  const vaultSubtitle = document.getElementById('vault-subtitle-ar');

  const canvas = document.getElementById('support-card-canvas');
  const presetsWrap = document.getElementById('support-presets');
  const textarea = document.getElementById('support-message-input');
  const senderLabel = document.getElementById('support-sender-label');
  const sendBtn = document.getElementById('vault-send-btn');
  const downloadBtn = document.getElementById('support-download-btn');
  const deliveryDrawer = document.getElementById('vault-delivery-drawer');
  const deliveryMsg = document.getElementById('delivery-success-msg');
  const waBtn = document.getElementById('vault-whatsapp-btn');
  const copyBtn = document.getElementById('vault-copy-link-btn');
  const copyFeedback = document.getElementById('copy-feedback');
  const trackerWrap = document.getElementById('family-vault-tracker');
  const cloudStatusEl = document.getElementById('cloud-sync-status');

  const readerModal = document.getElementById('envelope-reader-modal');
  const readerClose = document.getElementById('reader-close-btn');
  const readerCrest = document.getElementById('reader-crest-icon');
  const readerStatus = document.getElementById('reader-status-pill');
  const readerTitle = document.getElementById('reader-sender-title');
  const readerTagEn = document.getElementById('reader-tag-en');
  const readerBody = document.getElementById('reader-message-text');
  const readerSaveBtn = document.getElementById('reader-save-png-btn');

  let activeRole = FROZEN_CONFIG.reception.roles[0];
  let activeReaderRole = familyRoles[0];
  let latestGiftUrl = '';

  const openEnvelopeReader = (role) => {
    activeReaderRole = role;
    const entry = vaultStore.getEntry(role);
    audio.playEnvelopeChime();

    readerCrest.replaceChildren(createRoleCrestSvg(role.icon));
    readerStatus.textContent = entry.isCustom
      ? '✦ رسالة خاصة مرسلة حديثاً لصندوقكِ'
      : '✦ ظرف مختوم بالشمع الذهبي من العائلة';
    readerTitle.textContent = role.displayFullAr;
    readerTagEn.textContent = role.tagEn;
    readerBody.textContent = entry.message;

    readerModal.classList.add('open');
    readerModal.setAttribute('aria-hidden', 'false');
  };

  const closeEnvelopeReader = () => {
    readerModal.classList.remove('open');
    readerModal.setAttribute('aria-hidden', 'true');
  };

  readerClose.addEventListener('click', closeEnvelopeReader);
  readerModal.addEventListener('click', (e) => {
    if (e.target === readerModal) closeEnvelopeReader();
  });
  window.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && readerModal.classList.contains('open')) closeEnvelopeReader();
  });

  readerSaveBtn.addEventListener('click', () => {
    const entry = vaultStore.getEntry(activeReaderRole);
    const tmp = document.createElement('canvas');
    tmp.width = 900;
    tmp.height = 560;
    drawGoldenSupportCard(tmp, {
      senderDisplay: activeReaderRole.displayFullAr,
      accentHex: activeReaderRole.accentHex,
      message: entry.message,
    });
    const link = document.createElement('a');
    link.download = `Message-From-${activeReaderRole.id}-To-Yomna.png`;
    link.href = tmp.toDataURL('image/png');
    link.click();
  });

  const renderYomnaEnvelopes = () => {
    const customCount = vaultStore.getCustomCount();
    countPill.textContent =
      customCount > 0
        ? `✦ 7 أظرف عائلية في صندوقكِ (${customCount} مخصّصة وصلت حديثاً لكِ)`
        : '✦ 7 أظرف ذهبية مختومة من عائلتكِ بانتظاركِ يا يمنى';

    envelopesGrid.replaceChildren(
      ...familyRoles.map((role) => {
        const entry = vaultStore.getEntry(role);
        const card = el('button', `wax-envelope-card${entry.isCustom ? ' is-custom-delivered' : ''}`);
        card.type = 'button';
        card.style.setProperty('--env-accent', role.accentHex);

        const seal = el('div', 'env-wax-seal');
        seal.setAttribute('aria-hidden', 'true');
        seal.appendChild(createRoleCrestSvg(role.icon));

        const badge = el(
          'span',
          'env-status-badge',
          entry.isCustom ? '✦ رسالة خاصة وصلت لكِ — اضغطي للفتح' : '✦ ظرف مختوم — اضغطي لفتح الشمع'
        );

        card.append(
          seal,
          el('strong', 'env-sender-name', role.nameAr),
          el('span', 'env-sender-rel', `(${role.relationAr})`),
          el('p', 'env-preview-snippet', entry.message),
          badge
        );
        card.addEventListener('click', () => openEnvelopeReader(role));
        return card;
      })
    );
  };

  const renderFamilyTracker = () => {
    trackerWrap.replaceChildren(
      ...familyRoles.map((role) => {
        const isSent = Boolean(vaultStore.messages[role.id]);
        return el(
          'span',
          `tracker-chip${isSent ? ' sent' : ''}`,
          isSent ? `✓ ${role.nameAr} (وصلت لصندوق يمنى)` : `✦ ${role.nameAr}`
        );
      })
    );
  };

  const renderSenderPreview = () => {
    if (!canvas || activeRole.isHonoree) return;
    drawGoldenSupportCard(canvas, {
      senderDisplay: activeRole.displayFullAr,
      accentHex: activeRole.accentHex,
      message: textarea.value,
    });
  };

  textarea.addEventListener('input', () => {
    presetsWrap.querySelectorAll('.preset-btn').forEach((b) => b.classList.remove('active'));
    renderSenderPreview();
  });

  sendBtn.addEventListener('click', async () => {
    if (activeRole.isHonoree) return;
    const msg = sanitizeText(textarea.value, 220);
    if (msg.length < 3) return;

    sendBtn.disabled = true;
    vaultStore.save(activeRole.id, msg);
    renderYomnaEnvelopes();
    renderFamilyTracker();

    const cloudRes = cloudVault
      ? await cloudVault.publishWish(activeRole.id, msg)
      : { ok: false, reason: 'offline' };

    sendBtn.disabled = false;
    audio.playWishChime();

    if (deliveryMsg) {
      if (cloudRes.ok) {
        deliveryMsg.textContent =
          '✅ وصلت رسالتك سحابياً في نفس اللحظة إلى صندوق يمنى الخاص على موبايلها! (محمية بختم الشمع ضد التلاعب)';
      } else if (cloudRes.reason === 'sealed_by_owner_device') {
        deliveryMsg.textContent =
          '🔒 تم ختم رسالة هذا الفرد مسبقاً من جهازه لحمايتها من التلاعب — يمكنك مشاركة رسالتك عبر رابط الواتساب بالأسفل!';
      } else {
        deliveryMsg.textContent = '✅ تم ختم رسالتك وحفظها بنجاح! أرسل الظرف ليمنى على واتساب:';
      }
    }

    const token = encodeGiftToken(activeRole.id, msg);
    const baseUrl = `${window.location.origin}${window.location.pathname}`;
    latestGiftUrl = `${baseUrl}?gift=${encodeURIComponent(token)}`;

    const waText = `🎁 رسالة تهنئة وتشجيع خاصة إلى يمنى في عيد ميلادها الـ 19 من ${activeRole.displayFullAr}:\nافتحي الظرف المختوم مباشرة داخل صندوقكِ في المعرض الـ 3D:\n${latestGiftUrl}`;
    waBtn.href = `https://wa.me/?text=${encodeURIComponent(waText)}`;

    deliveryDrawer.classList.add('open');
    deliveryDrawer.setAttribute('aria-hidden', 'false');
    copyFeedback.textContent = '';
  });

  if (cloudVault) {
    cloudVault.subscribeAll(
      ({ senderId, message }) => {
        const prev = vaultStore.messages[senderId]?.message;
        vaultStore.save(senderId, message);
        renderYomnaEnvelopes();
        renderFamilyTracker();
        if (activeRole.id === senderId && !activeRole.isHonoree && !textarea.matches(':focus')) {
          textarea.value = message;
          renderSenderPreview();
        }
        if (prev && prev !== message && activeRole.isHonoree) audio.playEnvelopeChime();
      },
      (connected) => {
        if (!cloudStatusEl) return;
        cloudStatusEl.textContent = connected
          ? '🟢 متصل سحابياً الآن (Firebase Cloud Firestore) — أي رسالة تُرسل تظهر تلقائياً وفوراً في صندوق يمنى على موبايلها!'
          : '🔒 وضع الحفظ المحلي + رابط الظرف المشفّر لواتساب جاهز تماماً.';
      }
    );
  }

  copyBtn.addEventListener('click', async () => {
    if (!latestGiftUrl) return;
    try {
      await navigator.clipboard.writeText(latestGiftUrl);
      copyFeedback.textContent = '✓ تم نسخ رابط الظرف المشفّر!';
    } catch {
      copyFeedback.textContent = latestGiftUrl;
    }
  });

  downloadBtn.addEventListener('click', () => {
    if (activeRole.isHonoree) return;
    renderSenderPreview();
    const link = document.createElement('a');
    link.download = `Support-Card-${activeRole.id}-For-Yomna.png`;
    link.href = canvas.toDataURL('image/png');
    link.click();
  });

  const updateForPersona = (role) => {
    activeRole = role;
    deliveryDrawer.classList.remove('open');
    deliveryDrawer.setAttribute('aria-hidden', 'true');
    copyFeedback.textContent = '';

    if (role.isHonoree) {
      inboxPanel.classList.remove('panel-hidden');
      senderPanel.classList.add('panel-hidden');
      vaultEyebrow.textContent = "ACT VI • YOMNA'S PRIVATE FAMILY VAULT";
      vaultTitle.replaceChildren(
        document.createTextNode('صندوق رسائل '),
        el('span', 'gold-shimmer', 'عائلتكِ الخاص بكِ يا يمنى')
      );
      vaultSubtitle.textContent =
        'سبعة أظرف ذهبية مختومة من والدكِ ووالدتكِ وإخوتكِ وخالتكِ وأولاد خالتكِ — كلها محبة ودعاء وتشجيع لكِ في عامكِ التاسع عشر';
      renderYomnaEnvelopes();
    } else {
      inboxPanel.classList.add('panel-hidden');
      senderPanel.classList.remove('panel-hidden');
      vaultEyebrow.textContent = "ACT VI • SEND DIRECTLY TO YOMNA'S VAULT";
      vaultTitle.replaceChildren(
        document.createTextNode('أرسل تهنئتك إلى '),
        el('span', 'gold-shimmer', 'صندوق يمنى الخاص')
      );
      vaultSubtitle.textContent =
        'اكتب كلمة تهنئة وتشجيع ليمنى في عامها الـ 19، وبضغطة واحدة تُختم بالشمع الذهبي وتصل سحابياً في نفس اللحظة إلى صندوقها على موبايلها';

      senderLabel.textContent = role.displayFullAr;
      const existing = vaultStore.getEntry(role);
      const presets = role.cardPresets || [];

      presetsWrap.replaceChildren(
        ...presets.map((text, idx) => {
          const btn = el('button', `preset-btn${!existing.isCustom && idx === 0 ? ' active' : ''}`, text);
          btn.type = 'button';
          btn.addEventListener('click', () => {
            presetsWrap.querySelectorAll('.preset-btn').forEach((b) => b.classList.remove('active'));
            btn.classList.add('active');
            textarea.value = text;
            renderSenderPreview();
          });
          return btn;
        })
      );

      textarea.value = existing.isCustom ? existing.message : (presets[0] || role.defaultVaultMsg);
      renderSenderPreview();
      renderFamilyTracker();
    }
  };

  renderYomnaEnvelopes();
  renderFamilyTracker();
  return { updateForPersona, openEnvelopeReader };
}

/* ==================== 3D EXCLUSIVE 8-MEMBER FAMILY RECEPTION PORTAL ==================== */
function initReceptionPortal(scene3d, audio, vaultExperience, incomingGift) {
  const cfg = FROZEN_CONFIG.reception;
  const portal = document.getElementById('reception-portal');
  const shell = portal?.querySelector('.portal-shell');
  const stepSelect = document.getElementById('portal-step-select');
  const stepLetter = document.getElementById('portal-step-letter');
  const rolesGrid = document.getElementById('portal-roles-grid');
  const continueBtn = document.getElementById('portal-continue-btn');
  const enterSiteBtn = document.getElementById('portal-enter-site-btn');
  const backBtn = document.getElementById('portal-back-btn');
  const switchBtn = document.getElementById('visitor-switch-btn');
  const visitorPillLabel = document.getElementById('visitor-pill-label');
  const heroPersonalNote = document.getElementById('hero-personal-note');
  const giftBanner = document.getElementById('incoming-gift-banner');
  const giftBannerText = document.getElementById('incoming-gift-text');

  if (!portal || !rolesGrid) return;

  document.getElementById('portal-eyebrow-en').textContent = cfg.eyebrowEn;
  document.getElementById('portal-title-ar').textContent = cfg.titleAr;
  document.getElementById('portal-subtitle-ar').textContent = cfg.subtitleAr;

  let selectedRole = cfg.roles[0];

  if (incomingGift) {
    const senderRole = cfg.roles.find((r) => r.id === incomingGift.senderId);
    if (senderRole && giftBanner && giftBannerText) {
      giftBannerText.textContent = `وصل ظرف تهنئة خاص جديد من ${senderRole.displayFullAr} — تم حفظه تلقائياً داخل صندوق يمنى الخاص!`;
      giftBanner.classList.add('visible');
      giftBanner.setAttribute('aria-hidden', 'false');
    }
  }

  const applyThemeColors = (role) => {
    document.documentElement.style.setProperty('--portal-accent', role.accentHex);
    if (shell) shell.style.setProperty('--portal-accent', role.accentHex);
    if (scene3d) scene3d.setVisitorTheme(role.themeKey);
  };

  const roleButtons = cfg.roles.map((role, idx) => {
    const btn = el('button', `role-card${role.isHonoree ? ' is-honoree' : ''}${idx === 0 ? ' selected' : ''}`);
    btn.type = 'button';
    btn.setAttribute('role', 'radio');
    btn.setAttribute('aria-checked', String(idx === 0));
    btn.style.setProperty('--role-accent', role.accentHex);

    const crest = el('div', 'role-icon-crest');
    crest.setAttribute('aria-hidden', 'true');
    crest.appendChild(createRoleCrestSvg(role.icon));

    const textCol = el('div', 'role-card-text');
    const nameLine = el('span', 'role-name-line');
    nameLine.append(
      el('span', 'role-label', role.nameAr),
      el('span', 'role-relation-paren', `(${role.relationAr})`)
    );

    textCol.append(nameLine, el('span', 'role-tag-en', role.tagEn));
    btn.append(crest, textCol);

    const selectThisRole = () => {
      selectedRole = role;
      roleButtons.forEach((b, i) => {
        const isSel = i === idx;
        b.classList.toggle('selected', isSel);
        b.setAttribute('aria-checked', String(isSel));
      });
      applyThemeColors(role);
    };

    btn.addEventListener('click', selectThisRole);
    btn.addEventListener('pointerenter', (e) => {
      if (e.pointerType === 'mouse') applyThemeColors(role);
    });
    return btn;
  });

  rolesGrid.replaceChildren(...roleButtons);
  applyThemeColors(selectedRole);

  const applyPersonaToMainSite = (role) => {
    if (visitorPillLabel) visitorPillLabel.textContent = role.badgeAr;
    if (heroPersonalNote) heroPersonalNote.textContent = role.heroNoteAr;
    applyThemeColors(role);
    vaultExperience.updateForPersona(role);
  };

  applyPersonaToMainSite(selectedRole);

  continueBtn.addEventListener('click', () => {
    document.getElementById('letter-crest-icon').replaceChildren(createRoleCrestSvg(selectedRole.icon));
    document.getElementById('letter-role-pill').textContent = selectedRole.badgeAr;
    document.getElementById('letter-tag-en').textContent = selectedRole.tagEn;
    document.getElementById('letter-title-ar').textContent = selectedRole.letterTitleAr;
    document.getElementById('letter-lead-ar').textContent = selectedRole.letterLeadAr;
    document.getElementById('letter-body-ar').textContent = selectedRole.letterBodyAr;
    document.getElementById('portal-enter-btn-ar').textContent = selectedRole.enterBtnAr;

    applyPersonaToMainSite(selectedRole);

    stepSelect.classList.remove('active');
    stepSelect.setAttribute('aria-hidden', 'true');
    stepLetter.classList.add('active');
    stepLetter.setAttribute('aria-hidden', 'false');
    portal.scrollTop = 0;
  });

  backBtn.addEventListener('click', () => {
    stepLetter.classList.remove('active');
    stepLetter.setAttribute('aria-hidden', 'true');
    stepSelect.classList.add('active');
    stepSelect.setAttribute('aria-hidden', 'false');
    portal.scrollTop = 0;
  });

  enterSiteBtn.addEventListener('click', () => {
    portal.classList.add('dismissed');
    portal.setAttribute('aria-hidden', 'true');
    document.body.classList.remove('portal-open');
    audio.playWishChime();

    if (incomingGift && selectedRole.isHonoree) {
      const senderRole = cfg.roles.find((r) => r.id === incomingGift.senderId);
      const vaultSec = document.getElementById('yomna-vault');
      if (vaultSec) vaultSec.scrollIntoView({ behavior: 'smooth', block: 'start' });
      if (senderRole) window.setTimeout(() => vaultExperience.openEnvelopeReader(senderRole), 650);
      incomingGift = null;
    } else {
      window.scrollTo({ top: 0, behavior: 'instant' });
    }
  });

  if (switchBtn) {
    switchBtn.addEventListener('click', () => {
      stepLetter.classList.remove('active');
      stepLetter.setAttribute('aria-hidden', 'true');
      stepSelect.classList.add('active');
      stepSelect.setAttribute('aria-hidden', 'false');
      portal.classList.remove('dismissed');
      portal.setAttribute('aria-hidden', 'false');
      document.body.classList.add('portal-open');
      portal.scrollTop = 0;
    });
  }
}

/* ==================== PRO TOOL #1: FINE-ARTS & SYMMETRY STUDIO ==================== */
function initProFineArtsStudio() {
  const canvas = document.getElementById('sketch-canvas');
  const guideCanvas = document.getElementById('guide-overlay-canvas');
  const hint = document.getElementById('canvas-hint');
  if (!canvas) return;

  const ctx = canvas.getContext('2d');
  let activeColor = '#e8c268';
  let brushSize = 6;
  let brushMode = 'calligraphy';
  let drawing = false;
  let lastPt = null;
  let lastTime = 0;
  const history = [];

  function drawCanvasBackground() {
    const grad = ctx.createRadialGradient(
      canvas.width * 0.5, canvas.height * 0.45, 30,
      canvas.width * 0.5, canvas.height * 0.5, canvas.width * 0.65
    );
    grad.addColorStop(0, '#251c15');
    grad.addColorStop(1, '#130e0a');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.strokeStyle = 'rgba(232, 194, 104, 0.2)';
    ctx.lineWidth = 1.5;
    ctx.strokeRect(20, 20, canvas.width - 40, canvas.height - 40);

    ctx.fillStyle = 'rgba(232, 194, 104, 0.3)';
    ctx.font = '14px Cinzel, serif';
    ctx.textAlign = 'center';
    ctx.fillText('HEY  •  5 DECEMBER  •  FINE ARTS ATELIER KEEPSAKE', canvas.width / 2, canvas.height - 30);
  }

  function renderPerspectiveOverlay() {
    if (!guideCanvas) return;
    const gctx = guideCanvas.getContext('2d');
    const W = guideCanvas.width;
    const H = guideCanvas.height;
    const cx = W / 2;
    const cy = H / 2;

    gctx.clearRect(0, 0, W, H);
    gctx.strokeStyle = 'rgba(232, 194, 104, 0.28)';
    gctx.lineWidth = 1;

    gctx.beginPath();
    gctx.moveTo(20, cy);
    gctx.lineTo(W - 20, cy);
    gctx.moveTo(cx, 20);
    gctx.lineTo(cx, H - 20);
    gctx.stroke();

    gctx.setLineDash([5, 6]);
    for (let a = 0; a < 12; a++) {
      const angle = (a / 12) * Math.PI * 2;
      gctx.beginPath();
      gctx.moveTo(cx, cy);
      gctx.lineTo(cx + Math.cos(angle) * W, cy + Math.sin(angle) * H);
      gctx.stroke();
    }

    [70, 145, 220].forEach((r) => {
      gctx.beginPath();
      gctx.arc(cx, cy, r, 0, Math.PI * 2);
      gctx.stroke();
    });
    gctx.setLineDash([]);
  }

  renderPerspectiveOverlay();

  function saveSnapshot() {
    if (history.length > 25) history.shift();
    history.push(ctx.getImageData(0, 0, canvas.width, canvas.height));
  }

  drawCanvasBackground();
  saveSnapshot();

  function getPos(e) {
    const rect = canvas.getBoundingClientRect();
    return {
      x: ((e.clientX - rect.left) * canvas.width) / rect.width,
      y: ((e.clientY - rect.top) * canvas.height) / rect.height,
    };
  }

  function strokeSegment(p1, p2, dynamicWidth) {
    ctx.save();
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    if (brushMode === 'charcoal') {
      ctx.strokeStyle = activeColor;
      ctx.globalAlpha = 0.36;
      ctx.lineWidth = Math.max(1.2, brushSize * 0.42);
      for (let s = 0; s < 5; s++) {
        const ox = (Math.random() - 0.5) * brushSize * 1.3;
        const oy = (Math.random() - 0.5) * brushSize * 1.3;
        ctx.beginPath();
        ctx.moveTo(p1.x + ox, p1.y + oy);
        ctx.lineTo(p2.x + ox, p2.y + oy);
        ctx.stroke();
      }
    } else if (brushMode === 'watercolor') {
      ctx.strokeStyle = activeColor;
      ctx.globalAlpha = 0.16;
      ctx.lineWidth = brushSize * 2.6;
      ctx.shadowColor = activeColor;
      ctx.shadowBlur = 14;
      ctx.beginPath();
      ctx.moveTo(p1.x, p1.y);
      ctx.lineTo(p2.x, p2.y);
      ctx.stroke();
    } else if (brushMode === 'symmetry') {
      const cx = canvas.width / 2;
      const cy = canvas.height / 2;
      const x1 = p1.x - cx;
      const y1 = p1.y - cy;
      const x2 = p2.x - cx;
      const y2 = p2.y - cy;

      ctx.strokeStyle = activeColor;
      ctx.lineWidth = Math.max(1.5, brushSize * 0.72);
      ctx.shadowColor = activeColor;
      ctx.shadowBlur = 8;

      const slices = 8;
      for (let i = 0; i < slices; i++) {
        const theta = (i / slices) * Math.PI * 2;
        ctx.save();
        ctx.translate(cx, cy);
        ctx.rotate(theta);
        ctx.beginPath();
        ctx.moveTo(x1, y1);
        ctx.lineTo(x2, y2);
        ctx.stroke();

        ctx.scale(1, -1);
        ctx.beginPath();
        ctx.moveTo(x1, y1);
        ctx.lineTo(x2, y2);
        ctx.stroke();
        ctx.restore();
      }
    } else {
      ctx.strokeStyle = activeColor;
      ctx.lineWidth = dynamicWidth;
      ctx.shadowColor = activeColor;
      ctx.shadowBlur = activeColor === '#e8c268' ? 10 : 4;
      ctx.beginPath();
      ctx.moveTo(p1.x, p1.y);
      ctx.lineTo(p2.x, p2.y);
      ctx.stroke();
    }
    ctx.restore();
  }

  canvas.addEventListener('pointerdown', (e) => {
    canvas.setPointerCapture(e.pointerId);
    drawing = true;
    hint.classList.add('hidden');
    lastPt = getPos(e);
    lastTime = performance.now();
    saveSnapshot();
  });

  canvas.addEventListener('pointermove', (e) => {
    if (!drawing || !lastPt) return;
    const pt = getPos(e);
    const now = performance.now();
    const dt = Math.max(8, now - lastTime);
    const dist = Math.hypot(pt.x - lastPt.x, pt.y - lastPt.y);
    const speed = dist / dt;
    const dynWidth = Math.max(brushSize * 0.4, brushSize * (1.35 - Math.min(0.85, speed * 0.32)));

    strokeSegment(lastPt, pt, dynWidth);
    lastPt = pt;
    lastTime = now;
  });

  const endDraw = () => {
    drawing = false;
    lastPt = null;
  };
  canvas.addEventListener('pointerup', endDraw);
  canvas.addEventListener('pointercancel', endDraw);

  document.querySelectorAll('.mode-pill').forEach((btn) => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.mode-pill').forEach((b) => b.classList.remove('active'));
      btn.classList.add('active');
      brushMode = btn.dataset.brush || 'calligraphy';
    });
  });

  const perspBtn = document.getElementById('toggle-perspective-btn');
  if (perspBtn && guideCanvas) {
    let showGrid = false;
    perspBtn.addEventListener('click', () => {
      showGrid = !showGrid;
      perspBtn.setAttribute('aria-pressed', String(showGrid));
      guideCanvas.classList.toggle('visible', showGrid);
    });
  }

  document.querySelectorAll('.swatch').forEach((btn) => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.swatch').forEach((s) => s.classList.remove('active'));
      btn.classList.add('active');
      if (/^#[0-9a-fA-F]{6}$/.test(btn.dataset.color || '')) activeColor = btn.dataset.color;
    });
  });

  document.getElementById('brush-size').addEventListener('input', (e) => {
    const val = Number(e.target.value);
    if (Number.isFinite(val) && val >= 2 && val <= 22) brushSize = val;
  });

  document.getElementById('canvas-gold-dust').addEventListener('click', () => {
    hint.classList.add('hidden');
    saveSnapshot();
    for (let i = 0; i < 28; i++) {
      const x = 40 + Math.random() * (canvas.width - 80);
      const y = 40 + Math.random() * (canvas.height - 90);
      const r = 1.2 + Math.random() * 3.5;
      ctx.save();
      ctx.fillStyle = i % 2 === 0 ? 'rgba(245, 217, 138, 0.85)' : 'rgba(255, 246, 220, 0.7)';
      ctx.shadowColor = '#f5d98a';
      ctx.shadowBlur = 12;
      ctx.beginPath();
      ctx.arc(x, y, r, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }
  });

  document.getElementById('canvas-undo').addEventListener('click', () => {
    if (history.length > 1) ctx.putImageData(history.pop(), 0, 0);
  });

  document.getElementById('canvas-clear').addEventListener('click', () => {
    saveSnapshot();
    drawCanvasBackground();
    hint.classList.remove('hidden');
  });

  document.getElementById('canvas-save').addEventListener('click', () => {
    const link = document.createElement('a');
    link.download = `Yomna-Fine-Arts-Studio-HEY-${Date.now()}.png`;
    link.href = canvas.toDataURL('image/png');
    link.click();
  });
}

/* ==================== PRO TOOL #3: REAL MICROPHONE BLOW-OUT "1" & "9" CAKE CANDLES ==================== */
function initMicBlowDetector(scene3d, onBlowSuccess) {
  const micBtn = document.getElementById('mic-blow-btn');
  const micLabel = document.getElementById('mic-blow-label');
  const meterWrap = document.getElementById('mic-meter-wrap');
  const meterFill = document.getElementById('mic-meter-fill');
  const meterHint = document.getElementById('mic-meter-hint');
  if (!micBtn || !navigator.mediaDevices?.getUserMedia) {
    if (micBtn) micBtn.style.display = 'none';
    return { stopMic: () => {} };
  }

  let stream = null;
  let audioCtx = null;
  let rafId = 0;
  let active = false;
  let charge = 0;

  const stopMic = () => {
    active = false;
    charge = 0;
    if (rafId) cancelAnimationFrame(rafId);
    if (stream) {
      stream.getTracks().forEach((t) => t.stop());
      stream = null;
    }
    if (audioCtx) {
      audioCtx.close().catch(() => {});
      audioCtx = null;
    }
    if (scene3d) scene3d.setCandleWind(0);
    micBtn.setAttribute('aria-pressed', 'false');
    micLabel.textContent = 'أو انفخي في المايكروفون لإطفاء شمعتي التورتة واقعياً!';
    meterWrap.classList.remove('active');
    meterWrap.setAttribute('aria-hidden', 'true');
    if (meterFill) meterFill.style.width = '0%';
  };

  micBtn.addEventListener('click', async () => {
    if (active) {
      stopMic();
      return;
    }
    try {
      stream = await navigator.mediaDevices.getUserMedia({
        audio: { echoCancellation: false, noiseSuppression: false, autoGainControl: false },
      });
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      audioCtx = new AudioCtx();
      const source = audioCtx.createMediaStreamSource(stream);
      const analyser = audioCtx.createAnalyser();
      analyser.fftSize = 256;
      source.connect(analyser);

      const data = new Uint8Array(analyser.frequencyBinCount);
      active = true;
      charge = 0;
      micBtn.setAttribute('aria-pressed', 'true');
      micLabel.textContent = 'المايكروفون جاهز — انفخي الآن نحو التورتة 💨 (إلغاء)';
      meterWrap.classList.add('active');
      meterWrap.setAttribute('aria-hidden', 'false');

      const sampleLoop = () => {
        if (!active) return;
        analyser.getByteFrequencyData(data);
        let sum = 0;
        for (let i = 1; i <= 18; i++) sum += data[i];
        const avg = sum / 18;
        const level = Math.min(1, Math.max(0, (avg - 36) / 95));

        if (scene3d) scene3d.setCandleWind(level);

        if (level > 0.32) {
          charge = Math.min(100, charge + level * 5.2);
        } else {
          charge = Math.max(0, charge - 1.4);
        }

        if (meterFill) meterFill.style.width = `${charge.toFixed(0)}%`;

        if (charge >= 100) {
          stopMic();
          onBlowSuccess();
          return;
        }
        rafId = requestAnimationFrame(sampleLoop);
      };
      sampleLoop();
    } catch {
      stopMic();
      if (meterHint) {
        meterWrap.classList.add('active');
        meterHint.textContent = 'تعذّر الوصول للمايكروفون — يمكنكِ إطفاء شمعتي 1 و 9 بالزر الذهبي أعلاه ✨';
      }
    }
  });

  return { stopMic };
}

/* ==================== VISITOR GUIDE, ENVELOPE, TILT & HORIZON ==================== */
function initGuideModal() {
  const modal = document.getElementById('guide-modal');
  const openBtns = [
    document.getElementById('guide-open-btn'),
    document.getElementById('hero-guide-btn'),
    document.getElementById('footer-guide-btn'),
  ].filter(Boolean);
  const closeBtn = document.getElementById('guide-modal-close');
  const startBtn = document.getElementById('guide-modal-start');

  const openModal = () => {
    modal.classList.add('open');
    modal.setAttribute('aria-hidden', 'false');
  };
  const closeModal = () => {
    modal.classList.remove('open');
    modal.setAttribute('aria-hidden', 'true');
  };

  openBtns.forEach((b) => b.addEventListener('click', openModal));
  closeBtn.addEventListener('click', closeModal);
  startBtn.addEventListener('click', closeModal);
  modal.addEventListener('click', (e) => {
    if (e.target === modal) closeModal();
  });
  window.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && modal.classList.contains('open')) closeModal();
  });
}

function initHorizonMotionGraphics() {
  const shell = document.getElementById('horizon-progress-shell');
  const beam = document.getElementById('horizon-beam');
  const counterEl = document.getElementById('horizon-counter');
  if (!shell || !beam || !counterEl) return;

  let animated = false;
  const targetVal = Number(counterEl.dataset.target || 90);

  const triggerAnimation = () => {
    if (animated) return;
    animated = true;
    beam.style.width = `${targetVal}%`;
    const start = performance.now();
    const duration = 1400;
    const step = (now) => {
      const p = Math.min(1, (now - start) / duration);
      const eased = 1 - Math.pow(1 - p, 3);
      counterEl.textContent = String(Math.round(eased * targetVal));
      if (p < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  };

  const obs = new IntersectionObserver(
    (entries) => entries.forEach((entry) => entry.isIntersecting && triggerAnimation()),
    { threshold: 0.01, rootMargin: '80px 0px 80px 0px' }
  );
  obs.observe(shell);

  window.addEventListener(
    'scroll',
    () => {
      if (!animated && shell.getBoundingClientRect().top <= window.innerHeight + 60) triggerAnimation();
    },
    { passive: true }
  );
}

function initTiltAndTouchSpinWindows(scene3d) {
  document.querySelectorAll('.js-tilt-frame, #fine-arts-pass').forEach((elNode) => {
    elNode.addEventListener('pointermove', (e) => {
      if (e.pointerType !== 'mouse') return;
      const rect = elNode.getBoundingClientRect();
      const x = (e.clientX - rect.left) / rect.width;
      const y = (e.clientY - rect.top) / rect.height;
      elNode.style.transform = `perspective(1000px) rotateX(${((0.5 - y) * 8).toFixed(2)}deg) rotateY(${((x - 0.5) * 10).toFixed(2)}deg)`;
      elNode.style.setProperty('--mx', `${(x * 100).toFixed(1)}%`);
      elNode.style.setProperty('--my', `${(y * 100).toFixed(1)}%`);
    });
    elNode.addEventListener('pointerleave', () => {
      elNode.style.transform = 'perspective(1000px) rotateX(0deg) rotateY(0deg)';
    });
  });

  // Smooth horizontal drag/swipe spin directly inside any Open 3D Stage Window!
  document.querySelectorAll('[data-spin-stage="true"]').forEach((win) => {
    let lastX = null;
    win.addEventListener('pointerdown', (e) => {
      lastX = e.clientX;
    });
    win.addEventListener(
      'pointermove',
      (e) => {
        if (lastX === null || !scene3d) return;
        const dx = e.clientX - lastX;
        lastX = e.clientX;
        scene3d.nudgeSpin(dx * 0.012);
      },
      { passive: true }
    );
    const clearSpin = () => {
      lastX = null;
    };
    win.addEventListener('pointerup', clearSpin);
    win.addEventListener('pointercancel', clearSpin);
  });
}

function initEnvelope() {
  const box = document.getElementById('encouragement-envelope');
  const btn = document.getElementById('envelope-btn');
  if (!box || !btn) return;
  btn.addEventListener('click', () => {
    const isOpen = box.classList.toggle('open');
    btn.setAttribute('aria-expanded', String(isOpen));
  });
}

/* ==================== CONTINUOUS 60FPS 3D SCROLL, CAKE CONTROLS & FINALE ==================== */
function initScrollNavigationAndFinale(scene3d, audio) {
  const topbar = document.getElementById('topbar');
  const progressBar = document.getElementById('scroll-progress-fill');
  const hudLabel = document.getElementById('hud-stage-label');
  const railDots = Array.from(document.querySelectorAll('.rail-dot'));
  const dockChips = Array.from(document.querySelectorAll('.dock-chip'));
  const sections = Array.from(document.querySelectorAll('section[id]:not(#reception-portal)'));
  const reveals = Array.from(document.querySelectorAll('.reveal'));

  let activeSectionId = 'hero';

  const setActiveStage = (id) => {
    if (id === activeSectionId) return;
    activeSectionId = id;
    railDots.forEach((dot) => dot.classList.toggle('active', dot.dataset.target === id));
    dockChips.forEach((chip) => {
      const isMatch = chip.dataset.target === id;
      chip.classList.toggle('active', isMatch);
      if (isMatch && window.innerWidth <= 980) {
        chip.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' });
      }
    });
    const sec = document.getElementById(id);
    if (hudLabel && sec?.dataset.stage) hudLabel.textContent = sec.dataset.stage;
  };

  // Continuous pixel-by-pixel 3D Zone Float [0..5] — ZERO plateau freeze!
  const updateSceneZoneAndReveals = (scrollNorm = 0) => {
    const vh = window.innerHeight || 800;
    for (const node of reveals) {
      if (!node.classList.contains('visible')) {
        const rect = node.getBoundingClientRect();
        if (rect.top <= vh + 120 && rect.bottom >= -120) node.classList.add('visible');
      }
    }

    const focalY = vh * 0.36;
    let activeSec = sections[0];
    let nextSec = null;

    for (let i = 0; i < sections.length; i++) {
      const rect = sections[i].getBoundingClientRect();
      if (rect.top <= focalY) {
        activeSec = sections[i];
        nextSec = sections[i + 1] || null;
      }
    }

    if (activeSec) {
      setActiveStage(activeSec.id);
      if (scene3d) {
        const zCur = Number(activeSec.dataset.zone || 0);
        let zoneFloat = zCur;
        if (nextSec) {
          const zNext = Number(nextSec.dataset.zone ?? zCur);
          const curRect = activeSec.getBoundingClientRect();
          const span = Math.max(1, curRect.height);
          const localFrac = Math.max(0, Math.min(1, (focalY - curRect.top) / span));
          // Linear continuous glide across EVERY pixel of scroll!
          zoneFloat = zCur + (zNext - zCur) * localFrac;
        }
        scene3d.setContinuousScroll(scrollNorm, zoneFloat);
      }
    }
  };

  let scrollTicking = false;
  const onScroll = () => {
    if (scrollTicking) return;
    scrollTicking = true;
    requestAnimationFrame(() => {
      scrollTicking = false;
      const maxScroll = Math.max(1, document.documentElement.scrollHeight - window.innerHeight);
      const progress = Math.max(0, Math.min(1, window.scrollY / maxScroll));
      if (progressBar) progressBar.style.width = `${(progress * 100).toFixed(2)}%`;
      topbar.classList.toggle('scrolled', window.scrollY > 40);
      updateSceneZoneAndReveals(progress);
    });
  };

  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('resize', () => onScroll(), { passive: true });

  const revealObs = new IntersectionObserver(
    (entries) => entries.forEach((entry) => entry.isIntersecting && entry.target.classList.add('visible')),
    { threshold: 0, rootMargin: '120px 0px 120px 0px' }
  );
  reveals.forEach((node) => revealObs.observe(node));

  onScroll();

  const scrollToTarget = (targetId) => {
    const target = document.getElementById(targetId);
    if (target) target.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  railDots.forEach((dot) => dot.addEventListener('click', () => scrollToTarget(dot.dataset.target)));
  dockChips.forEach((chip) => chip.addEventListener('click', () => scrollToTarget(chip.dataset.target)));

  // Live 3D Museum Lighting Mood Switcher
  const moodBtn = document.getElementById('mood-cycle-btn');
  const moodLabel = document.getElementById('mood-pill-label');
  let moodIdx = 0;
  if (moodBtn && scene3d) {
    moodBtn.addEventListener('click', () => {
      moodIdx = (moodIdx + 1) % LIGHTING_MOODS.length;
      const m = LIGHTING_MOODS[moodIdx];
      scene3d.setLightingMood(m.key);
      if (moodLabel) moodLabel.textContent = m.label;
    });
  }

  // Full-Screen 3D Inspect Mode
  const inspectBtn = document.getElementById('inspect-3d-btn');
  const exitInspectBtn = document.getElementById('exit-inspect-btn');
  const inspectBanner = document.getElementById('inspect-banner');
  let inspectActive = false;

  const setInspect = (val) => {
    inspectActive = Boolean(val);
    document.body.classList.toggle('inspect-3d-mode', inspectActive);
    if (inspectBtn) inspectBtn.setAttribute('aria-pressed', String(inspectActive));
    if (inspectBanner) inspectBanner.setAttribute('aria-hidden', String(!inspectActive));
    if (scene3d) scene3d.setInspectMode(inspectActive);
  };

  if (inspectBtn) inspectBtn.addEventListener('click', () => setInspect(!inspectActive));
  if (exitInspectBtn) exitInspectBtn.addEventListener('click', () => setInspect(false));
  window.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && inspectActive) setInspect(false);
  });

  document.getElementById('enter-exhibition-btn').addEventListener('click', () => {
    const firstAct = document.getElementById('childhood');
    if (firstAct) firstAct.scrollIntoView({ behavior: 'smooth' });
  });

  const audioBtn = document.getElementById('audio-toggle');
  audioBtn.addEventListener('click', () => {
    const isPlaying = audio.toggle();
    audioBtn.classList.toggle('playing', isPlaying);
    audioBtn.setAttribute('aria-pressed', String(isPlaying));
  });

  // Pro Realistic 3D Cake Interactive Controls (360° Turntable, Close-Up on 1 & 9, Fireworks)
  const cakeSpinBtn = document.getElementById('cake-spin-btn');
  const cakeZoomBtn = document.getElementById('cake-zoom-btn');
  const cakeFireworksBtn = document.getElementById('cake-fireworks-btn');

  if (cakeSpinBtn && scene3d) {
    cakeSpinBtn.addEventListener('click', () => {
      const spinning = scene3d.toggleCakeTurntable();
      cakeSpinBtn.classList.toggle('active', spinning);
      cakeSpinBtn.setAttribute('aria-pressed', String(spinning));
      cakeSpinBtn.replaceChildren(el('span', '', spinning ? '↻ حركة استعراض تلقائية' : '⏸ الاستعراض متوقف (اسحب للتدوير)'));
    });
  }

  if (cakeZoomBtn && scene3d) {
    cakeZoomBtn.addEventListener('click', () => {
      const zoomed = scene3d.toggleCakeZoom();
      cakeZoomBtn.classList.toggle('active', zoomed);
      cakeZoomBtn.setAttribute('aria-pressed', String(zoomed));
      cakeZoomBtn.replaceChildren(el('span', '', zoomed ? '🔭 عرض التورتة بالكامل' : '🔍 تقريب على شمعتي 1 و 9'));
    });
  }

  if (cakeFireworksBtn && scene3d) {
    cakeFireworksBtn.addEventListener('click', () => {
      scene3d.launchFireworks();
      audio.playWishChime();
    });
  }

  // Finale Realistic Cake "1" & "9" Candles + Real Microphone Blow Integration
  const wishBtn = document.getElementById('wish-btn');
  const wishBtnAr = document.getElementById('finale-btn-ar');
  const wishBtnEn = document.getElementById('finale-btn-en');
  const wishLetter = document.getElementById('wish-letter');
  const candlesStatus = document.getElementById('candles-status');
  const certBtn = document.getElementById('certificate-download-btn');
  let candlesBlown = false;

  const setCandlesStatusText = (msg, isBlown) => {
    candlesStatus.classList.toggle('blown', isBlown);
    candlesStatus.replaceChildren(el('span', 'flame-dot'), el('span', '', msg));
  };

  const extinguishCandles = () => {
    candlesBlown = true;
    if (scene3d) scene3d.triggerWishCelebration(true);
    audio.playWishChime();
    wishLetter.classList.add('revealed');
    wishLetter.setAttribute('aria-hidden', 'false');
    wishBtnAr.textContent = FROZEN_CONFIG.finale.buttonAfterAr;
    if (wishBtnEn) wishBtnEn.textContent = 'RELIGHT THE 1 & 9 CAKE CANDLES';
    setCandlesStatusText(FROZEN_CONFIG.finale.candlesBlownStatusAr, true);
  };

  const relightCandles = () => {
    candlesBlown = false;
    if (scene3d) scene3d.triggerWishCelebration(false);
    wishBtnAr.textContent = FROZEN_CONFIG.finale.buttonAr;
    if (wishBtnEn) wishBtnEn.textContent = 'BLOW OUT THE 1 & 9 CAKE CANDLES';
    setCandlesStatusText(FROZEN_CONFIG.finale.candlesLitStatusAr, false);
  };

  const micDetector = initMicBlowDetector(scene3d, extinguishCandles);

  wishBtn.addEventListener('click', () => {
    micDetector.stopMic();
    if (!candlesBlown) extinguishCandles();
    else relightCandles();
  });

  if (certBtn) certBtn.addEventListener('click', downloadFamilyCertificatePng);
}

/* ==================== BOOTSTRAP ==================== */
function bootstrap() {
  const openLightbox = initLightboxController();
  renderContent(openLightbox);

  const vaultStore = new FamilyVaultStore();
  let incomingGift = null;

  try {
    const params = new URLSearchParams(window.location.search);
    const giftParam = params.get('gift');
    if (giftParam) {
      const decoded = decodeGiftToken(giftParam);
      if (decoded) {
        vaultStore.save(decoded.senderId, decoded.message);
        incomingGift = decoded;
      }
      params.delete('gift');
      const cleanUrl = `${window.location.pathname}${params.toString() ? `?${params.toString()}` : ''}${window.location.hash}`;
      window.history.replaceState({}, document.title, cleanUrl);
    }
  } catch {
    // Ignore malformed params
  }

  let scene3d = null;
  try {
    const canvas = document.getElementById('atelier-canvas');
    scene3d = new Atelier3DScene(canvas, FROZEN_CONFIG);
  } catch (err) {
    console.warn('WebGL 3D scene fallback:', err);
  }

  const audio = new AtelierAudio();
  const cloudVault = new FamilyCloudVault();
  const vaultExperience = initFamilyVaultExperience(vaultStore, cloudVault, audio);

  initReceptionPortal(scene3d, audio, vaultExperience, incomingGift);
  initSpotlightManifesto(scene3d, audio);
  initSparkleCursorTrail();
  initGuideModal();
  initHorizonMotionGraphics();
  initTiltAndTouchSpinWindows(scene3d);
  initEnvelope();
  initProFineArtsStudio();
  initScrollNavigationAndFinale(scene3d, audio);

  window.setTimeout(() => {
    const preloader = document.getElementById('preloader');
    if (preloader) preloader.classList.add('hidden');
  }, 550);
}

bootstrap();
