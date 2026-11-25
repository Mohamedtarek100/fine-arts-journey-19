/**
 * =========================================================================
 *  Main Application Logic — Hardened Cinema-Grade 3D Fine Arts Journey
 *  Includes:
 *  - 3D Personal Welcome Reception Portal (5 Personas + Custom Name Input)
 *  - Real-Time 3D Lighting Theme Morphing per Visitor Persona
 *  - Live 5 December Kinetic Countdown
 *  - Interactive Family Encouragement Card Studio (Local PNG Generator)
 *  - Strict OWASP Zero-innerHTML DOM Security & Anti-Clickjacking
 * =========================================================================
 */

import { SITE_CONFIG } from './config.js?v=5';
import { Atelier3DScene } from './scene3d.js?v=5';

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

function safeAssetUrl(path, fallback = './assets/art/chapter4-fine-arts.jpg') {
  if (typeof path !== 'string') return fallback;
  const trimmed = path.trim();
  if (trimmed.includes('..')) return fallback;
  if (/^\.\/assets\/[a-zA-Z0-9._/-]+$/.test(trimmed)) return trimmed;
  return fallback;
}

function sanitizeGuestName(raw) {
  if (typeof raw !== 'string') return '';
  // Remove control chars, angle brackets, and collapse whitespace; limit to 32 chars
  return raw
    .replace(/[\u0000-\u001F\u007F<>`"'\\]/g, '')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, 32);
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
      const chord = [523.25, 659.25, 783.99, 987.77, 1174.66];
      chord.forEach((f, idx) => {
        setTimeout(() => this.playTone(f, 3.2, 0.32), idx * 110);
      });
    } catch {
      // Ignore if audio blocked
    }
  }
}

/* ==================== SAFE SVG CRESTS FOR VISITOR PERSONAS & GUIDE ==================== */
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
    // Yomna — Artist Palette Crest
    svg.append(
      svgEl('path', { d: 'M12 3a9 9 0 1 0 0 18h1.5a2.5 2.5 0 0 0 0-5H12a2 2 0 0 1 0-4h4.5A4.5 4.5 0 0 0 12 3Z' }),
      svgEl('circle', { cx: 7.5, cy: 10.5, r: 1 }),
      svgEl('circle', { cx: 10.5, cy: 7.5, r: 1 }),
      svgEl('circle', { cx: 15, cy: 8.5, r: 1 })
    );
  } else if (type === 'pillar') {
    // Father — Classical Architectural Pillar & Crown Crest
    svg.append(
      svgEl('path', { d: 'M4 20h16M6 20V9M18 20V9M10 20V9M14 20V9' }),
      svgEl('path', { d: 'M3 9l9-5 9 5H3Z' })
    );
  } else if (type === 'blossom') {
    // Mother — Botanical Jasmine Blossom & Warm Heart-Light Crest
    svg.append(
      svgEl('path', { d: 'M12 20c-4.5-3.2-7-6.3-7-9.6A4.4 4.4 0 0 1 12 7a4.4 4.4 0 0 1 7 3.4c0 3.3-2.5 6.4-7 9.6Z' }),
      svgEl('path', { d: 'M12 3v2M5 5l1.5 1.5M19 5l-1.5 1.5' })
    );
  } else if (type === 'shield') {
    // Brother — Geometric Star Shield Crest
    svg.append(
      svgEl('path', { d: 'M12 3l7 3v5.5c0 4.6-3 8.1-7 9.5-4-1.4-7-4.9-7-9.5V6l7-3Z' }),
      svgEl('path', { d: 'M12 8.5l1.1 2.4 2.6.3-2 1.8.5 2.5-2.2-1.3-2.2 1.3.5-2.5-2-1.8 2.6-.3L12 8.5Z' })
    );
  } else {
    // Special Guest — Museum Wax-Seal Star Crest
    svg.append(
      svgEl('circle', { cx: 12, cy: 12, r: 8.5 }),
      svgEl('path', { d: 'M12 6.5l1.5 3.8 4 1.2-4 1.2L12 16.5l-1.5-3.8-4-1.2 4-1.2L12 6.5Z' })
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
      svgEl('path', { d: 'M12 3v3M5.6 5.6l2.1 2.1M18.4 5.6l-2.1 2.1' }),
      svgEl('path', { d: 'M9 12a3 3 0 0 1 6 0v5a4 4 0 0 1-4 4h-1a4 4 0 0 1-4-4v-2.5' })
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

/* ==================== LIVE 5 DECEMBER COUNTDOWN ==================== */
function initBirthdayCountdown() {
  const container = document.getElementById('portal-countdown-units');
  if (!container) return;
  const targetMs = Date.parse(FROZEN_CONFIG.birthdayTargetISO);

  const renderTick = () => {
    const now = Date.now();
    const diff = targetMs - now;
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

/* ==================== FAMILY ENCOURAGEMENT CARD STUDIO (LOCAL PNG GENERATOR) ==================== */
function initSupportCardStudio() {
  const canvas = document.getElementById('support-card-canvas');
  const presetsWrap = document.getElementById('support-presets');
  const textarea = document.getElementById('support-message-input');
  const senderLabel = document.getElementById('support-sender-label');
  const downloadBtn = document.getElementById('support-download-btn');
  if (!canvas || !presetsWrap || !textarea) return { updatePersona: () => {} };

  const ctx = canvas.getContext('2d');
  let currentSender = 'يمنى';
  let currentAccent = '#e8c268';
  let currentMsg = FROZEN_CONFIG.reception.roles[0].cardPresets[0];

  function wrapArabicLines(text, maxWidth) {
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
    return lines.slice(0, 5);
  }

  function renderCard() {
    const W = canvas.width;
    const H = canvas.height;

    // Deep Warm Obsidian-Gold Background
    const bg = ctx.createRadialGradient(W * 0.5, H * 0.35, 40, W * 0.5, H * 0.5, W * 0.65);
    bg.addColorStop(0, '#271c13');
    bg.addColorStop(0.65, '#150f0b');
    bg.addColorStop(1, '#0d0907');
    ctx.fillStyle = bg;
    ctx.fillRect(0, 0, W, H);

    // Subtle Diagonal Sunbeam Glow
    const beam = ctx.createLinearGradient(0, 0, W, H);
    beam.addColorStop(0, 'rgba(232, 194, 104, 0.14)');
    beam.addColorStop(0.5, 'rgba(232, 194, 104, 0.02)');
    beam.addColorStop(1, 'rgba(232, 194, 104, 0.1)');
    ctx.fillStyle = beam;
    ctx.fillRect(0, 0, W, H);

    // Outer & Inner Ornate Antique Gold Museum Borders
    ctx.strokeStyle = currentAccent;
    ctx.lineWidth = 2.5;
    ctx.strokeRect(24, 24, W - 48, H - 48);

    ctx.strokeStyle = 'rgba(238, 210, 138, 0.32)';
    ctx.lineWidth = 1;
    ctx.strokeRect(36, 36, W - 72, H - 72);

    // Subtle Stardust Motes
    for (let i = 0; i < 28; i++) {
      const px = 55 + ((i * 173) % (W - 110));
      const py = 55 + ((i * 97) % (H - 110));
      ctx.fillStyle = i % 2 === 0 ? 'rgba(248, 224, 158, 0.45)' : 'rgba(255, 248, 232, 0.25)';
      ctx.beginPath();
      ctx.arc(px, py, (i % 3) + 1, 0, Math.PI * 2);
      ctx.fill();
    }

    // Header Museum Inscription
    ctx.textAlign = 'center';
    ctx.direction = 'ltr';
    ctx.fillStyle = currentAccent;
    ctx.font = '600 15px Cinzel, Georgia, serif';
    ctx.fillText('5 DECEMBER  •  CHAPTER XIX  •  FACULTY OF FINE ARTS DREAM', W / 2, 78);

    // Arabic Dedication Header
    ctx.direction = 'rtl';
    ctx.fillStyle = '#fbf0cf';
    ctx.font = '700 34px Amiri, Georgia, serif';
    ctx.fillText(`رسالة دعم وتشجيع إلى الفنانة ${FROZEN_CONFIG.artistName}`, W / 2, 136);

    // Delicate Gold Divider
    ctx.strokeStyle = 'rgba(232, 194, 104, 0.5)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(W * 0.28, 160);
    ctx.lineTo(W * 0.72, 160);
    ctx.stroke();

    // Main Encouragement Message
    const displayText = (currentMsg || '').trim() || 'كل التوفيق والنجاح في تالتة ثانوي نحو كلية الفنون الجميلة بإذن الله.';
    ctx.fillStyle = '#f8f1e4';
    ctx.font = '500 26px Cairo, sans-serif';
    const lines = wrapArabicLines(displayText, W - 180);
    const lineHeight = 46;
    const startY = 232 + Math.max(0, (4 - lines.length) * 16);
    lines.forEach((ln, i) => {
      ctx.fillText(ln, W / 2, startY + i * lineHeight);
    });

    // Bottom Mission Pill + Sender Signature
    ctx.fillStyle = 'rgba(214, 171, 82, 0.14)';
    ctx.fillRect(W * 0.18, H - 146, W * 0.64, 42);
    ctx.strokeStyle = 'rgba(232, 194, 104, 0.45)';
    ctx.strokeRect(W * 0.18, H - 146, W * 0.64, 42);

    ctx.fillStyle = '#eed28a';
    ctx.font = '600 17px Cairo, sans-serif';
    ctx.fillText('تالتة ثانوي (السنة الفاصلة)  ←  خطوة واحدة نحو كلية الفنون الجميلة ✦', W / 2, H - 119);

    ctx.fillStyle = currentAccent;
    ctx.font = '700 23px Amiri, Georgia, serif';
    ctx.fillText(`بكل فخر ودعم — ${currentSender}`, W / 2, H - 64);
  }

  textarea.addEventListener('input', () => {
    currentMsg = sanitizeGuestName(textarea.value) ? textarea.value.slice(0, 180) : '';
    document.querySelectorAll('.preset-btn').forEach((b) => b.classList.remove('active'));
    renderCard();
  });

  if (downloadBtn) {
    downloadBtn.addEventListener('click', () => {
      renderCard();
      const link = document.createElement('a');
      link.download = `Support-Card-For-Yomna-${Date.now()}.png`;
      link.href = canvas.toDataURL('image/png');
      link.click();
    });
  }

  const updatePersona = (role, customName) => {
    currentSender = role.requiresName && customName ? customName : role.labelAr;
    currentAccent = role.accentHex || '#e8c268';
    if (senderLabel) senderLabel.textContent = currentSender;

    const presets = role.cardPresets || [];
    presetsWrap.replaceChildren(
      ...presets.map((text, idx) => {
        const btn = el('button', `preset-btn${idx === 0 ? ' active' : ''}`, text);
        btn.type = 'button';
        btn.addEventListener('click', () => {
          presetsWrap.querySelectorAll('.preset-btn').forEach((b) => b.classList.remove('active'));
          btn.classList.add('active');
          textarea.value = text;
          currentMsg = text;
          renderCard();
        });
        return btn;
      })
    );

    if (presets[0]) {
      textarea.value = presets[0];
      currentMsg = presets[0];
    }
    renderCard();
  };

  renderCard();
  return { updatePersona };
}

/* ==================== 3D PERSONAL WELCOME RECEPTION PORTAL ==================== */
function initReceptionPortal(scene3d, audio, supportStudio) {
  const cfg = FROZEN_CONFIG.reception;
  const portal = document.getElementById('reception-portal');
  const shell = portal?.querySelector('.portal-shell');
  const stepSelect = document.getElementById('portal-step-select');
  const stepLetter = document.getElementById('portal-step-letter');
  const rolesGrid = document.getElementById('portal-roles-grid');
  const nameBox = document.getElementById('portal-name-box');
  const nameInput = document.getElementById('guest-name-input');
  const nameError = document.getElementById('portal-name-error');
  const continueBtn = document.getElementById('portal-continue-btn');
  const enterSiteBtn = document.getElementById('portal-enter-site-btn');
  const backBtn = document.getElementById('portal-back-btn');
  const switchBtn = document.getElementById('visitor-switch-btn');
  const visitorPillLabel = document.getElementById('visitor-pill-label');
  const heroPersonalNote = document.getElementById('hero-personal-note');

  if (!portal || !rolesGrid) return;

  document.getElementById('portal-eyebrow-en').textContent = cfg.eyebrowEn;
  document.getElementById('portal-title-ar').textContent = cfg.titleAr;
  document.getElementById('portal-subtitle-ar').textContent = cfg.subtitleAr;
  nameInput.placeholder = cfg.otherPlaceholderAr;

  let selectedRole = cfg.roles[0];
  let customGuestName = '';

  const applyThemeColors = (role) => {
    document.documentElement.style.setProperty('--portal-accent', role.accentHex);
    if (shell) shell.style.setProperty('--portal-accent', role.accentHex);
    if (scene3d) scene3d.setVisitorTheme(role.themeKey);
  };

  const formatPersonalText = (template, guestName) =>
    template.replaceAll('{NAME}', guestName || 'ضيفنا العزيز');

  // Build 5 Sculpted Role Persona Cards (ZERO innerHTML)
  const roleButtons = cfg.roles.map((role, idx) => {
    const btn = el('button', `role-card${role.requiresName ? ' is-other' : ''}${idx === 0 ? ' selected' : ''}`);
    btn.type = 'button';
    btn.setAttribute('role', 'radio');
    btn.setAttribute('aria-checked', String(idx === 0));
    btn.style.setProperty('--role-accent', role.accentHex);

    const crest = el('div', 'role-icon-crest');
    crest.setAttribute('aria-hidden', 'true');
    crest.appendChild(createRoleCrestSvg(role.icon));

    const textCol = el('div', 'role-card-text');
    textCol.append(
      el('span', 'role-label', role.labelAr),
      el('span', 'role-sublabel', role.sublabelAr),
      el('span', 'role-tag-en', role.tagEn)
    );

    btn.append(crest, textCol);

    const selectThisRole = () => {
      selectedRole = role;
      roleButtons.forEach((b, i) => {
        const isSel = i === idx;
        b.classList.toggle('selected', isSel);
        b.setAttribute('aria-checked', String(isSel));
      });
      applyThemeColors(role);

      const needsName = Boolean(role.requiresName);
      nameBox.classList.toggle('visible', needsName);
      nameBox.setAttribute('aria-hidden', String(!needsName));
      nameError.textContent = '';
      if (needsName) {
        window.setTimeout(() => nameInput.focus(), 120);
      }
    };

    btn.addEventListener('click', selectThisRole);
    btn.addEventListener('pointerenter', (e) => {
      if (e.pointerType === 'mouse') applyThemeColors(role);
    });

    return btn;
  });

  rolesGrid.replaceChildren(...roleButtons);
  applyThemeColors(selectedRole);

  // Sync default persona into Hero & Support Studio immediately
  const applyPersonaToMainSite = (role, guestName) => {
    const badgeText = role.requiresName && guestName ? `✨ ${guestName}` : role.badgeAr;
    if (visitorPillLabel) visitorPillLabel.textContent = badgeText;
    if (heroPersonalNote) {
      heroPersonalNote.textContent = formatPersonalText(role.heroNoteAr, guestName);
    }
    applyThemeColors(role);
    supportStudio.updatePersona(role, guestName);
  };

  applyPersonaToMainSite(selectedRole, '');

  const showPersonalizedLetter = () => {
    if (selectedRole.requiresName) {
      const cleaned = sanitizeGuestName(nameInput.value);
      if (!cleaned) {
        nameError.textContent = cfg.otherErrorAr;
        nameInput.focus();
        return;
      }
      customGuestName = cleaned;
      nameError.textContent = '';
    } else {
      customGuestName = '';
    }

    const crestWrap = document.getElementById('letter-crest-icon');
    crestWrap.replaceChildren(createRoleCrestSvg(selectedRole.icon));

    const pillText =
      selectedRole.requiresName && customGuestName
        ? `✨ ضيف الشرف • ${customGuestName}`
        : selectedRole.badgeAr;

    document.getElementById('letter-role-pill').textContent = pillText;
    document.getElementById('letter-tag-en').textContent = selectedRole.tagEn;
    document.getElementById('letter-title-ar').textContent = formatPersonalText(
      selectedRole.letterTitleAr,
      customGuestName
    );
    document.getElementById('letter-lead-ar').textContent = selectedRole.letterLeadAr;
    document.getElementById('letter-body-ar').textContent = formatPersonalText(
      selectedRole.letterBodyAr,
      customGuestName
    );
    document.getElementById('portal-enter-btn-ar').textContent = selectedRole.enterBtnAr;

    applyPersonaToMainSite(selectedRole, customGuestName);

    stepSelect.classList.remove('active');
    stepSelect.setAttribute('aria-hidden', 'true');
    stepLetter.classList.add('active');
    stepLetter.setAttribute('aria-hidden', 'false');
    portal.scrollTop = 0;
  };

  continueBtn.addEventListener('click', showPersonalizedLetter);
  nameInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      showPersonalizedLetter();
    }
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
    window.scrollTo({ top: 0, behavior: 'instant' });
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

/* ==================== SAFE CHAPTER SECTION BUILDER ==================== */
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
  plaque.append(
    el('span', 'plaque-en', ch.captionEn),
    el('span', 'plaque-ar', ch.captionAr)
  );

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
    serialCol.append(
      el('div', '', cfg.dreamPass.batchAr),
      el('div', '', cfg.dreamPass.serialNo)
    );

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
    if (idx < 3) firstRoot.appendChild(sec);
    else secondRoot.appendChild(sec);
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
      if (/^#[0-9a-fA-F]{6}$/.test(btn.dataset.color || '')) {
        activeColor = btn.dataset.color;
      }
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
    if (hudLabel && sec?.dataset.stage) {
      hudLabel.textContent = sec.dataset.stage;
    }
  };

  const checkRevealsAndActiveSection = () => {
    const vh = window.innerHeight || 800;
    for (const node of reveals) {
      if (!node.classList.contains('visible')) {
        const rect = node.getBoundingClientRect();
        if (rect.top <= vh + 120 && rect.bottom >= -120) {
          node.classList.add('visible');
        }
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

  // Full-Screen 3D Inspect Mode Toggle
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
}

/* ==================== BOOTSTRAP ==================== */
function bootstrap() {
  renderContent();

  let scene3d = null;
  try {
    const canvas = document.getElementById('atelier-canvas');
    scene3d = new Atelier3DScene(canvas, FROZEN_CONFIG);
  } catch (err) {
    console.warn('WebGL 3D scene fallback:', err);
  }

  const audio = new AtelierAudio();
  const supportStudio = initSupportCardStudio();

  initBirthdayCountdown();
  initReceptionPortal(scene3d, audio, supportStudio);
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
