/**
 * =========================================================================
 *  Main Application Logic — VIP 8-Member Family 3D Fine Arts Exhibition
 *  - Exclusive 8-Person Family Portal (Yomna, Essam, Heba, Youssef, Islam, Salwa, Nada, Mohamed)
 *  - Real-Time 3D Atmosphere Morphing per Family Member
 *  - Yomna's Private 7-Envelope Family Vault + Encrypted Gift Link Delivery (?gift=)
 *  - Narrative Chapter Bridges + Official Family 19th-Year Certificate Generator
 *  - 100% Zero-innerHTML OWASP Security Architecture
 * =========================================================================
 */

import { SITE_CONFIG } from './config.js?v=8';
import { Atelier3DScene } from './scene3d.js?v=8';
import { FamilyCloudVault } from './firebase-sync.js?v=8';

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

/* ==================== ENCRYPTED-STYLE URL GIFT PAYLOAD ENCODER / DECODER ==================== */
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

/* ==================== SAFE FAMILY VAULT STORE (LOCAL PERSISTENCE) ==================== */
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
            clean[id] = {
              message: msg,
              timestamp: Number(entry.timestamp) || Date.now(),
              custom: true,
            };
          }
        }
      }
    } catch {
      // Ignore storage access errors in private browsing
    }
    return clean;
  }

  save(senderId, message) {
    if (!ALLOWED_SENDER_IDS.has(senderId)) return false;
    const cleanMsg = sanitizeText(message, 220);
    if (!cleanMsg) return false;
    this.messages[senderId] = {
      message: cleanMsg,
      timestamp: Date.now(),
      custom: true,
    };
    try {
      window.localStorage.setItem(VAULT_STORAGE_KEY, JSON.stringify(this.messages));
    } catch {
      // Fallback to in-memory vault
    }
    return true;
  }

  getEntry(role) {
    if (this.messages[role.id]) {
      return {
        message: this.messages[role.id].message,
        isCustom: true,
      };
    }
    return {
      message: role.defaultVaultMsg || '',
      isCustom: false,
    };
  }

  getCustomCount() {
    return Object.keys(this.messages).length;
  }
}

/* ==================== MOTION-GRAPHICS GOLDEN SPARKLE CURSOR TRAIL ==================== */
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
      if (now - lastSpawn < 24) return;
      lastSpawn = now;
      for (let i = 0; i < 2; i++) {
        particles.push({
          x: e.clientX + (Math.random() - 0.5) * 8,
          y: e.clientY + (Math.random() - 0.5) * 8,
          vx: (Math.random() - 0.5) * 0.65,
          vy: -0.35 - Math.random() * 0.7,
          size: 1.3 + Math.random() * 2.4,
          life: 1,
          decay: 0.025 + Math.random() * 0.02,
        });
      }
      if (particles.length > 65) particles.splice(0, particles.length - 65);
    },
    { passive: true }
  );

  function renderTrail() {
    requestAnimationFrame(renderTrail);
    if (!particles.length) {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      return;
    }
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
      ctx.save();
      ctx.globalAlpha = p.life * 0.72;
      ctx.fillStyle = '#f8e29e';
      ctx.shadowColor = '#e6bd5c';
      ctx.shadowBlur = 10;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.size * p.life, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }
  }
  renderTrail();
}

/* ==================== AMBIENT ATELIER AUDIO (WEB AUDIO API) ==================== */
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
      // Ignore if audio blocked
    }
  }

  playEnvelopeChime() {
    try {
      this.ensureContext();
      [392.0, 493.88, 587.33, 783.99].forEach((f, idx) => {
        setTimeout(() => this.playTone(f, 2.1, 0.24), idx * 80);
      });
    } catch {
      // Ignore if audio blocked
    }
  }
}

/* ==================== SAFE SVG CRESTS FOR ALL 8 VIP FAMILY MEMBERS ==================== */
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
    // nib (Architectural Drafting Pen & Star for Mohamed)
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
    svg.append(
      svgEl('rect', { x: 7, y: 3, width: 10, height: 18, rx: 5 }),
      svgEl('line', { x1: 12, y1: 7, x2: 12, y2: 11 })
    );
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

  card.append(
    num,
    iconBox,
    el('h3', '', step.titleAr),
    el('span', 'guide-en', step.titleEn),
    el('p', '', step.descAr)
  );
  return card;
}

/* ==================== LUXURY KEEPSAKE CARD & FAMILY CERTIFICATE CANVAS RENDERERS ==================== */
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

  const beam = ctx.createLinearGradient(0, 0, W, H);
  beam.addColorStop(0, 'rgba(232, 194, 104, 0.14)');
  beam.addColorStop(0.5, 'rgba(232, 194, 104, 0.02)');
  beam.addColorStop(1, 'rgba(232, 194, 104, 0.1)');
  ctx.fillStyle = beam;
  ctx.fillRect(0, 0, W, H);

  ctx.strokeStyle = accent;
  ctx.lineWidth = 2.5;
  ctx.strokeRect(24, 24, W - 48, H - 48);

  ctx.strokeStyle = 'rgba(238, 210, 138, 0.32)';
  ctx.lineWidth = 1;
  ctx.strokeRect(36, 36, W - 72, H - 72);

  for (let i = 0; i < 28; i++) {
    const px = 55 + ((i * 173) % (W - 110));
    const py = 55 + ((i * 97) % (H - 110));
    ctx.fillStyle = i % 2 === 0 ? 'rgba(248, 224, 158, 0.45)' : 'rgba(255, 248, 232, 0.25)';
    ctx.beginPath();
    ctx.arc(px, py, (i % 3) + 1, 0, Math.PI * 2);
    ctx.fill();
  }

  ctx.textAlign = 'center';
  ctx.direction = 'ltr';
  ctx.fillStyle = accent;
  ctx.font = '600 15px Cinzel, Georgia, serif';
  ctx.fillText('5 DECEMBER  •  CHAPTER XIX  •  YOMNA PRIVATE FAMILY VAULT', W / 2, 78);

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
  ctx.fillText('تالتة ثانوي (السنة الفاصلة)  ←  خطوة واحدة نحو كلية الفنون الجميلة ✦', W / 2, H - 117);

  ctx.fillStyle = accent;
  ctx.font = '700 24px Amiri, Georgia, serif';
  ctx.fillText(`بكل فخر ودعاء — ${senderDisplay}`, W / 2, H - 62);
}

function downloadFamilyCertificatePng() {
  const c = document.createElement('canvas');
  c.width = 1200;
  c.height = 820;
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
  ctx.fillText('CERTIFICATE OF PRIDE & FUTURE ARTISTRY  •  5 DECEMBER  •  EDITION XIX', W / 2, 108);

  ctx.direction = 'rtl';
  ctx.fillStyle = '#fbf0cf';
  ctx.font = '700 52px Amiri, Georgia, serif';
  ctx.fillText('شهادة فخر ووسام العام التاسع عشر', W / 2, 192);

  ctx.fillStyle = '#e8c268';
  ctx.font = '700 62px Amiri, Georgia, serif';
  ctx.fillText(`الفنانة ${FROZEN_CONFIG.artistName}`, W / 2, 290);

  ctx.strokeStyle = 'rgba(232, 194, 104, 0.55)';
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.moveTo(W * 0.28, 326);
  ctx.lineTo(W * 0.72, 326);
  ctx.stroke();

  ctx.fillStyle = '#f8f1e4';
  ctx.font = '500 28px Cairo, sans-serif';
  ctx.fillText('تقديراً لموهبتها الفنية الراقية وإصرارها في سنة تالتة ثانوي الفاصلة', W / 2, 396);
  ctx.fillText('وبثقة كاملة في وصولها قريباً بإذن الله إلى بوابة كلية الفنون الجميلة', W / 2, 448);

  ctx.fillStyle = 'rgba(214, 171, 82, 0.14)';
  ctx.fillRect(W * 0.2, 505, W * 0.6, 56);
  ctx.strokeStyle = 'rgba(238, 210, 138, 0.5)';
  ctx.strokeRect(W * 0.2, 505, W * 0.6, 56);
  ctx.fillStyle = '#fbf0cf';
  ctx.font = '700 22px Cairo, sans-serif';
  ctx.fillText('✦ تالتة ثانوي الآن ← خطوة واحدة فقط نحو كلية الفنون الجميلة ✦', W / 2, 541);

  ctx.fillStyle = '#d6ab52';
  ctx.font = '600 20px Cairo, sans-serif';
  ctx.fillText('مُهداة وموقّعة بكل فخر ومحبة من عائلتكِ:', W / 2, 632);

  ctx.fillStyle = '#fbf0cf';
  ctx.font = '700 32px Amiri, Georgia, serif';
  ctx.fillText(FROZEN_CONFIG.familySignOffAr, W / 2, 688);

  ctx.direction = 'ltr';
  ctx.fillStyle = 'rgba(238, 210, 138, 0.55)';
  ctx.font = '500 14px Cinzel, Georgia, serif';
  ctx.fillText('OFFICIAL FAMILY KEEPSAKE  •  5 DECEMBER 2026  •  CHAPTER XIX', W / 2, 748);

  const link = document.createElement('a');
  link.download = `Yomna-19th-Year-Family-Certificate.png`;
  link.href = c.toDataURL('image/png');
  link.click();
}

/* ==================== LIVE 5 DECEMBER COUNTDOWN ==================== */
function initBirthdayCountdown() {
  const container = document.getElementById('portal-countdown-units');
  if (!container) return;
  const targetMs = Date.parse(FROZEN_CONFIG.birthdayTargetISO);

  const renderTick = () => {
    const diff = targetMs - Date.now();
    if (diff <= 0) {
      container.replaceChildren(
        el('span', 'cd-live-celebration', '✦ اليوم 5 ديسمبر — كل عامٍ ويمنى بألف خير! ✦')
      );
      return;
    }
    const days = Math.floor(diff / 86400000);
    const hours = Math.floor((diff % 86400000) / 3600000);
    const mins = Math.floor((diff % 3600000) / 60000);
    const secs = Math.floor((diff % 60000) / 1000);

    const units = [
      { v: String(days).padStart(2, '0'), l: 'يوم' },
      { v: String(hours).padStart(2, '0'), l: 'ساعة' },
      { v: String(mins).padStart(2, '0'), l: 'دقيقة' },
      { v: String(secs).padStart(2, '0'), l: 'ثانية' },
    ];

    container.replaceChildren(
      ...units.map((u) => {
        const box = el('div', 'cd-box');
        box.append(el('strong', '', u.v), el('small', '', u.l));
        return box;
      })
    );
  };

  renderTick();
  window.setInterval(renderTick, 1000);
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

  // Envelope Reader Modal elements
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
        const card = el(
          'button',
          `wax-envelope-card${entry.isCustom ? ' is-custom-delivered' : ''}`
        );
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
          '🔒 تم ختم رسالة هذا الفرد مسبقاً من جهازه لحمايتها من التلاعب — يمكنك إرسال رسالتك الجديدة ليمنى عبر رابط الواتساب بالأسفل!';
      } else {
        deliveryMsg.textContent =
          '✅ تم ختم رسالتك وحفظها بنجاح! أرسل الظرف ليمنى على واتساب لتصلها فوراً:';
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

  // Subscribe to Real-Time Cloud Firestore updates across all phones!
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
        if (prev && prev !== message && activeRole.isHonoree) {
          audio.playEnvelopeChime();
        }
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
      copyFeedback.textContent = '✓ تم نسخ رابط الظرف المشفّر! ابعته ليمنى وهيظهر فوراً جوه صندوقها.';
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
      vaultEyebrow.textContent = "YOMNA'S PRIVATE FAMILY VAULT • 7 WAX-SEALED WISHES";
      vaultTitle.replaceChildren(
        document.createTextNode('صندوق رسائل '),
        el('span', 'gold-shimmer', 'عائلتكِ الخاص بكِ يا يمنى')
      );
      vaultSubtitle.textContent =
        'سبعة أظرف ذهبية مختومة من والدكِ ووالدتكِ وإخوتكِ وخالتكِ وأولاد خالتكِ — كلها محبة ودعاء وتشجيع لكِ في تالتة ثانوي نحو كلية الفنون الجميلة';
      renderYomnaEnvelopes();
    } else {
      inboxPanel.classList.add('panel-hidden');
      senderPanel.classList.remove('panel-hidden');
      vaultEyebrow.textContent = "SEND DIRECTLY TO YOMNA'S PRIVATE VAULT";
      vaultTitle.replaceChildren(
        document.createTextNode('أرسل تهنئتك إلى '),
        el('span', 'gold-shimmer', 'صندوق يمنى الخاص')
      );
      vaultSubtitle.textContent =
        'اكتب كلمة تهنئة وتشجيع ليمنى في سنتها الفاصلة (تالتة ثانوي)، وبضغطة واحدة تُختم بالشمع الذهبي وتصل مباشرة إلى صندوقها الخاص مع إمكانية إرسال الظرف لها على واتساب';

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

  // Build 8 Exclusive VIP Family Cards with Exact (Parenthesized Relation) Styling
  const roleButtons = cfg.roles.map((role, idx) => {
    const btn = el(
      'button',
      `role-card${role.isHonoree ? ' is-honoree' : ''}${idx === 0 ? ' selected' : ''}`
    );
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

  const showPersonalizedLetter = () => {
    const crestWrap = document.getElementById('letter-crest-icon');
    crestWrap.replaceChildren(createRoleCrestSvg(selectedRole.icon));

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
  };

  continueBtn.addEventListener('click', showPersonalizedLetter);

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

    // If opened via an incoming gift link and Yomna entered, jump smoothly to her Vault & open the envelope!
    if (incomingGift && selectedRole.isHonoree) {
      const senderRole = cfg.roles.find((r) => r.id === incomingGift.senderId);
      const vaultSec = document.getElementById('yomna-vault');
      if (vaultSec) vaultSec.scrollIntoView({ behavior: 'smooth', block: 'start' });
      if (senderRole) {
        window.setTimeout(() => vaultExperience.openEnvelopeReader(senderRole), 650);
      }
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

/* ==================== NARRATIVE BRIDGE + SAFE CHAPTER BUILDER ==================== */
function createNarrativeBridge(text) {
  const wrap = el('div', 'chapter-bridge reveal');
  wrap.setAttribute('aria-hidden', 'false');
  wrap.append(el('span', 'bridge-thread'), el('p', 'bridge-caption', `✦ ${text} ✦`), el('span', 'bridge-thread'));
  return wrap;
}

function createChapterSection(ch, idx, cfg) {
  const isReverse = idx % 2 === 1;
  const section = el('section', `section chapter-section${isReverse ? ' reverse' : ''}`);
  section.id = ch.id;
  section.dataset.stage = ch.eraAr;

  const grid = el('div', 'chapter-grid');

  const card = el('article', 'chapter-card reveal');
  const numBg = el('span', 'chapter-number-bg', ch.number);
  numBg.setAttribute('aria-hidden', 'true');

  card.append(
    numBg,
    el('p', 'chapter-era', `✦ ${ch.eraAr}`),
    el('h2', 'chapter-title-ar', ch.titleAr),
    el('p', 'chapter-title-en', ch.titleEn),
    el('p', 'chapter-story', ch.storyAr),
    el('blockquote', 'chapter-quote', ch.quoteAr)
  );

  if (ch.id === 'thanaweya' && ch.encouragementBodyAr) {
    const envBox = el('div', 'envelope-box');
    envBox.id = 'encouragement-envelope';

    const envBtn = el('button', 'envelope-trigger');
    envBtn.type = 'button';
    envBtn.id = 'envelope-btn';
    envBtn.setAttribute('aria-expanded', 'false');
    envBtn.append(
      el('span', '', `✦ ${ch.encouragementTitleAr} (اضغط لفتح الرسالة)`),
      el('span', 'wax-seal-mini', 'XIX')
    );

    const envLetter = el('div', 'envelope-letter');
    envLetter.appendChild(el('p', '', ch.encouragementBodyAr));

    envBox.append(envBtn, envLetter);
    card.appendChild(envBox);
  }

  const artCol = el('div', 'art-column reveal');
  const safeImg = safeAssetUrl(ch.image);

  const figure = el('figure', 'museum-frame js-tilt-frame');
  figure.dataset.lightboxImg = safeImg;
  figure.dataset.lightboxTitle = ch.titleAr;
  figure.dataset.lightboxMeta = ch.captionEn;
  figure.dataset.lightboxDesc = ch.captionAr;

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
  return section;
}

/* ==================== POPULATE PAGE FROM FROZEN CONFIG ==================== */
function renderContent() {
  const cfg = FROZEN_CONFIG;

  document.title = `رحلة ${cfg.artistName} | ${cfg.birthdayDateAr} — العام ${cfg.age}`;
  document.getElementById('nav-date-en').textContent = cfg.birthdayDateEn;
  document.getElementById('nav-title-ar').textContent = `رحلة ${cfg.artistName}`;

  document.getElementById('hero-eyebrow-en').textContent = cfg.hero.eyebrowEn;
  document.getElementById('hero-badge-ar').textContent = cfg.hero.badgeAr;
  document.getElementById('hero-title-prefix').textContent = cfg.hero.titlePrefixAr;
  document.getElementById('hero-artist-name').textContent = cfg.artistName;
  document.getElementById('hero-subtitle-ar').textContent = cfg.hero.subtitleAr;
  document.getElementById('hero-cta-ar').textContent = cfg.hero.ctaAr;
  document.getElementById('hero-cta-en').textContent = cfg.hero.ctaEn;
  document.getElementById('hero-guide-btn-ar').textContent = cfg.hero.guideBtnAr;

  document.getElementById('guide-eyebrow-en').textContent = cfg.guide.eyebrowEn;
  document.getElementById('guide-title-ar').textContent = cfg.guide.titleAr;
  document.getElementById('guide-subtitle-ar').textContent = cfg.guide.subtitleAr;

  const stripGrid = document.getElementById('guide-cards-grid');
  const modalGrid = document.getElementById('guide-modal-grid');
  stripGrid.replaceChildren(...cfg.guide.steps.map(createGuideCard));
  modalGrid.replaceChildren(...cfg.guide.steps.map(createGuideCard));

  const firstRoot = document.getElementById('chapters-first-container');
  const secondRoot = document.getElementById('chapters-second-container');
  firstRoot.replaceChildren();
  secondRoot.replaceChildren();

  cfg.chapters.forEach((ch, idx) => {
    const sec = createChapterSection(ch, idx, cfg);
    if (idx < 3) {
      firstRoot.appendChild(sec);
      if (idx === 0) firstRoot.appendChild(createNarrativeBridge(cfg.chapterBridges.afterChildhood));
      if (idx === 1) firstRoot.appendChild(createNarrativeBridge(cfg.chapterBridges.afterPassion));
      if (idx === 2) firstRoot.appendChild(createNarrativeBridge(cfg.chapterBridges.afterThanaweya));
    } else {
      secondRoot.appendChild(sec);
      secondRoot.appendChild(createNarrativeBridge(cfg.chapterBridges.afterFineArts));
    }
  });

  const hg = cfg.horizonGoal;
  document.getElementById('horizon-eyebrow-en').textContent = hg.eyebrowEn;
  document.getElementById('horizon-title-ar').textContent = hg.titleAr;
  document.getElementById('horizon-subtitle-ar').textContent = hg.subtitleAr;
  document.getElementById('horizon-steps-label').textContent = hg.stepsRemainingLabel;
  document.getElementById('horizon-counter').dataset.target = String(hg.progressPercent);

  const nodesWrap = document.getElementById('horizon-nodes');
  nodesWrap.replaceChildren(
    ...hg.timelineNodes.map((n) => {
      const icon = n.state === 'done' ? '✓' : n.state === 'current' ? '●' : '✦';
      const node = el('div', `hp-node ${n.state}`);
      node.append(el('span', '', icon), el('span', '', n.label));
      return node;
    })
  );

  document.getElementById('now-badge-ar').textContent = hg.currentStage.badgeAr;
  document.getElementById('now-badge-en').textContent = hg.currentStage.badgeEn;
  document.getElementById('now-title-ar').textContent = hg.currentStage.titleAr;
  document.getElementById('now-age-tag').textContent = hg.currentStage.ageTagAr;
  document.getElementById('now-desc-ar').textContent = hg.currentStage.descAr;

  const nowHighlights = document.getElementById('now-highlights');
  nowHighlights.replaceChildren(...hg.currentStage.highlightsAr.map((item) => el('li', '', item)));

  document.getElementById('goal-badge-ar').textContent = hg.goalStage.badgeAr;
  document.getElementById('goal-badge-en').textContent = hg.goalStage.badgeEn;
  document.getElementById('goal-title-ar').textContent = hg.goalStage.titleAr;
  document.getElementById('goal-title-en').textContent = hg.goalStage.titleEn;
  document.getElementById('goal-desc-ar').textContent = hg.goalStage.descAr;

  const milestonesWrap = document.getElementById('goal-milestones');
  milestonesWrap.replaceChildren(
    ...hg.goalStage.milestonesAr.map((m) => {
      const pill = el('div', 'goal-step-pill');
      pill.append(el('span', 'goal-step-code', m.code), el('span', '', m.label));
      return pill;
    })
  );

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

/* ==================== VISITOR GUIDE MODAL ==================== */
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

/* ==================== HORIZON MOTION-GRAPHICS COUNTER & BEAM ==================== */
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
    const duration = 1500;
    const step = (now) => {
      const p = Math.min(1, (now - start) / duration);
      const eased = 1 - Math.pow(1 - p, 3);
      counterEl.textContent = String(Math.round(eased * targetVal));
      if (p < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  };

  const obs = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) triggerAnimation();
      });
    },
    { threshold: 0.01, rootMargin: '80px 0px 80px 0px' }
  );
  obs.observe(shell);

  window.addEventListener(
    'scroll',
    () => {
      if (!animated && shell.getBoundingClientRect().top <= window.innerHeight + 60) {
        triggerAnimation();
      }
    },
    { passive: true }
  );
}

/* ==================== 3D TILT INTERACTIONS (DESKTOP MOUSE ONLY) ==================== */
function initTiltEffects() {
  const frames = document.querySelectorAll('.js-tilt-frame, #fine-arts-pass');
  frames.forEach((elNode) => {
    elNode.addEventListener('pointermove', (e) => {
      if (e.pointerType !== 'mouse') return;
      const rect = elNode.getBoundingClientRect();
      const x = (e.clientX - rect.left) / rect.width;
      const y = (e.clientY - rect.top) / rect.height;
      const rotX = (0.5 - y) * 8;
      const rotY = (x - 0.5) * 10;
      elNode.style.transform = `perspective(1000px) rotateX(${rotX.toFixed(2)}deg) rotateY(${rotY.toFixed(2)}deg)`;
      elNode.style.setProperty('--mx', `${(x * 100).toFixed(1)}%`);
      elNode.style.setProperty('--my', `${(y * 100).toFixed(1)}%`);
    });

    elNode.addEventListener('pointerleave', () => {
      elNode.style.transform = 'perspective(1000px) rotateX(0deg) rotateY(0deg)';
    });
  });
}

/* ==================== ENCOURAGEMENT ENVELOPE ==================== */
function initEnvelope() {
  const box = document.getElementById('encouragement-envelope');
  const btn = document.getElementById('envelope-btn');
  if (!box || !btn) return;
  btn.addEventListener('click', () => {
    const isOpen = box.classList.toggle('open');
    btn.setAttribute('aria-expanded', String(isOpen));
  });
}

/* ==================== INTERACTIVE 3D GALLERY & LIGHTBOX ==================== */
function initGalleryAndLightbox() {
  const items = FROZEN_CONFIG.gallery;
  const viewport = document.getElementById('gallery-viewport');
  const dotsWrap = document.getElementById('gallery-dots');
  const plaqueMeta = document.getElementById('plaque-meta');
  const plaqueTitle = document.getElementById('plaque-title');
  const plaqueDesc = document.getElementById('plaque-desc');

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

  document.querySelectorAll('.museum-frame').forEach((frame) => {
    frame.addEventListener('click', () => {
      openLightbox(
        frame.dataset.lightboxImg,
        frame.dataset.lightboxMeta,
        frame.dataset.lightboxTitle,
        frame.dataset.lightboxDesc
      );
    });
  });

  if (!items.length) return;
  let current = 0;

  viewport.replaceChildren();
  dotsWrap.replaceChildren();

  const slideEls = items.map((item, i) => {
    const safeImg = safeAssetUrl(item.image);
    const slide = el('div', 'gallery-slide');
    const inner = el('div', 'gallery-slide-inner');
    const img = document.createElement('img');
    img.src = safeImg;
    img.alt = item.titleAr;
    img.loading = 'lazy';
    img.draggable = false;
    img.referrerPolicy = 'no-referrer';

    inner.append(img, el('span', 'gallery-zoom-hint', '✦ اضغط لتكبير اللوحة'));
    slide.appendChild(inner);

    slide.addEventListener('click', () => {
      if (i === current) {
        openLightbox(
          safeImg,
          `${item.titleEn} • ${item.year}`,
          item.titleAr,
          `${item.mediumAr} — ${item.descriptionAr}`
        );
      } else {
        current = i;
        updateSlides();
      }
    });
    viewport.appendChild(slide);

    const dot = el('button', 'gallery-dot');
    dot.type = 'button';
    dot.setAttribute('aria-label', item.titleAr);
    dot.addEventListener('click', () => {
      current = i;
      updateSlides();
    });
    dotsWrap.appendChild(dot);

    return slide;
  });

  const dotEls = Array.from(dotsWrap.children);

  function updateSlides() {
    const total = items.length;
    const prevIdx = (current - 1 + total) % total;
    const nextIdx = (current + 1) % total;

    slideEls.forEach((slideNode, idx) => {
      slideNode.classList.remove('is-active', 'is-prev', 'is-next', 'is-hidden');
      if (idx === current) slideNode.classList.add('is-active');
      else if (idx === prevIdx) slideNode.classList.add('is-prev');
      else if (idx === nextIdx) slideNode.classList.add('is-next');
      else slideNode.classList.add('is-hidden');
    });

    dotEls.forEach((d, idx) => d.classList.toggle('active', idx === current));

    const item = items[current];
    plaqueMeta.textContent = `${item.titleEn.toUpperCase()}  •  ${item.year}  •  ${item.mediumAr}`;
    plaqueTitle.textContent = item.titleAr;
    plaqueDesc.textContent = item.descriptionAr;
  }

  const goPrev = () => {
    current = (current - 1 + items.length) % items.length;
    updateSlides();
  };
  const goNext = () => {
    current = (current + 1) % items.length;
    updateSlides();
  };

  document.getElementById('gallery-prev').addEventListener('click', goPrev);
  document.getElementById('gallery-next').addEventListener('click', goNext);

  viewport.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowRight') goPrev();
    if (e.key === 'ArrowLeft') goNext();
  });

  let startX = 0;
  viewport.addEventListener('touchstart', (e) => { startX = e.touches[0].clientX; }, { passive: true });
  viewport.addEventListener('touchend', (e) => {
    const dx = e.changedTouches[0].clientX - startX;
    if (Math.abs(dx) > 40) (dx > 0 ? goPrev() : goNext());
  });

  updateSlides();
}

/* ==================== INTERACTIVE ATELIER SKETCH CANVAS ==================== */
function initAtelierSketchCanvas() {
  const canvas = document.getElementById('sketch-canvas');
  const hint = document.getElementById('canvas-hint');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');

  let activeColor = '#e5c16c';
  let brushSize = 5;
  let drawing = false;
  let lastPt = null;
  const history = [];

  function drawCanvasBackground() {
    const grad = ctx.createRadialGradient(
      canvas.width * 0.5, canvas.height * 0.45, 30,
      canvas.width * 0.5, canvas.height * 0.5, canvas.width * 0.65
    );
    grad.addColorStop(0, '#261d16');
    grad.addColorStop(1, '#140f0b');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.strokeStyle = 'rgba(229, 193, 108, 0.16)';
    ctx.lineWidth = 1.5;
    ctx.strokeRect(20, 20, canvas.width - 40, canvas.height - 40);

    ctx.fillStyle = 'rgba(229, 193, 108, 0.28)';
    ctx.font = '14px Cinzel, serif';
    ctx.textAlign = 'center';
    ctx.fillText('5 DECEMBER  •  CHAPTER XIX  •  FINE ARTS DREAM KEEPSAKE', canvas.width / 2, canvas.height - 32);
  }

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

  canvas.addEventListener('pointerdown', (e) => {
    canvas.setPointerCapture(e.pointerId);
    drawing = true;
    hint.classList.add('hidden');
    lastPt = getPos(e);
    saveSnapshot();
  });

  canvas.addEventListener('pointermove', (e) => {
    if (!drawing || !lastPt) return;
    const pt = getPos(e);
    ctx.save();
    ctx.strokeStyle = activeColor;
    ctx.lineWidth = brushSize;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.shadowColor = activeColor;
    ctx.shadowBlur = activeColor === '#e5c16c' ? 10 : 4;
    ctx.beginPath();
    ctx.moveTo(lastPt.x, lastPt.y);
    ctx.lineTo(pt.x, pt.y);
    ctx.stroke();
    ctx.restore();
    lastPt = pt;
  });

  const endDraw = () => { drawing = false; lastPt = null; };
  canvas.addEventListener('pointerup', endDraw);
  canvas.addEventListener('pointercancel', endDraw);

  document.querySelectorAll('.swatch').forEach((btn) => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.swatch').forEach((s) => s.classList.remove('active'));
      btn.classList.add('active');
      if (/^#[0-9a-fA-F]{6}$/.test(btn.dataset.color || '')) activeColor = btn.dataset.color;
    });
  });

  document.getElementById('brush-size').addEventListener('input', (e) => {
    const val = Number(e.target.value);
    if (Number.isFinite(val) && val >= 2 && val <= 20) brushSize = val;
  });

  document.getElementById('canvas-gold-dust').addEventListener('click', () => {
    hint.classList.add('hidden');
    saveSnapshot();
    for (let i = 0; i < 24; i++) {
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
    link.download = `Atelier-19th-Year-${Date.now()}.png`;
    link.href = canvas.toDataURL('image/png');
    link.click();
  });
}

/* ==================== SCROLL REVEALS, RAIL, MOBILE DOCK, 3D INSPECT & FINALE ==================== */
function initScrollAndNavigation(scene3d, audio) {
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

  const checkRevealsAndActiveSection = () => {
    const vh = window.innerHeight || 800;
    for (const node of reveals) {
      if (!node.classList.contains('visible')) {
        const rect = node.getBoundingClientRect();
        if (rect.top <= vh + 120 && rect.bottom >= -120) node.classList.add('visible');
      }
    }

    const focalY = vh * 0.4;
    let currentId = sections[0]?.id || 'hero';
    for (const sec of sections) {
      const rect = sec.getBoundingClientRect();
      if (rect.top <= focalY) currentId = sec.id;
    }
    setActiveStage(currentId);
  };

  const onScroll = () => {
    const maxScroll = Math.max(1, document.documentElement.scrollHeight - window.innerHeight);
    const progress = window.scrollY / maxScroll;
    if (scene3d) scene3d.setScrollProgress(progress);
    if (progressBar) progressBar.style.width = `${(progress * 100).toFixed(2)}%`;
    topbar.classList.toggle('scrolled', window.scrollY > 40);
    checkRevealsAndActiveSection();
  };

  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('resize', checkRevealsAndActiveSection, { passive: true });

  const revealObs = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) entry.target.classList.add('visible');
      });
    },
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
    const nextSec = document.getElementById('guide-strip') || document.getElementById('childhood');
    if (nextSec) nextSec.scrollIntoView({ behavior: 'smooth' });
  });

  const audioBtn = document.getElementById('audio-toggle');
  audioBtn.addEventListener('click', () => {
    const isPlaying = audio.toggle();
    audioBtn.classList.toggle('playing', isPlaying);
    audioBtn.setAttribute('aria-pressed', String(isPlaying));
  });

  const wishBtn = document.getElementById('wish-btn');
  const wishBtnAr = document.getElementById('finale-btn-ar');
  const wishLetter = document.getElementById('wish-letter');
  const candlesStatus = document.getElementById('candles-status');
  const certBtn = document.getElementById('certificate-download-btn');
  let candlesBlown = false;

  const setCandlesStatusText = (msg, isBlown) => {
    candlesStatus.classList.toggle('blown', isBlown);
    candlesStatus.replaceChildren(el('span', 'flame-dot'), el('span', '', msg));
  };

  wishBtn.addEventListener('click', () => {
    candlesBlown = !candlesBlown;
    if (scene3d) scene3d.triggerWishCelebration(candlesBlown);

    if (candlesBlown) {
      audio.playWishChime();
      wishLetter.classList.add('revealed');
      wishLetter.setAttribute('aria-hidden', 'false');
      wishBtnAr.textContent = FROZEN_CONFIG.finale.buttonAfterAr;
      setCandlesStatusText('تحققت الأمنية بإذن الله — أُطلقت شرارات العام التاسع عشر ✦', true);
    } else {
      wishBtnAr.textContent = FROZEN_CONFIG.finale.buttonAr;
      setCandlesStatusText('19 شمعة ذهبية مضيئة في الخلفية ثلاثية الأبعاد', false);
    }
  });

  if (certBtn) {
    certBtn.addEventListener('click', downloadFamilyCertificatePng);
  }
}

/* ==================== BOOTSTRAP ==================== */
function bootstrap() {
  renderContent();

  const vaultStore = new FamilyVaultStore();
  let incomingGift = null;

  // Safely process incoming ?gift= envelope delivery link (strictly validated + cleaned from URL!)
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
    // Ignore malformed URL params safely
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

  initBirthdayCountdown();
  initReceptionPortal(scene3d, audio, vaultExperience, incomingGift);
  initSparkleCursorTrail();
  initGuideModal();
  initHorizonMotionGraphics();
  initTiltEffects();
  initEnvelope();
  initGalleryAndLightbox();
  initAtelierSketchCanvas();
  initScrollAndNavigation(scene3d, audio);

  window.setTimeout(() => {
    const preloader = document.getElementById('preloader');
    if (preloader) preloader.classList.add('hidden');
  }, 650);
}

bootstrap();
