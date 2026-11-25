/**
 * =========================================================================
 *  Main Application Logic — Hardened Cinema-Grade 3D Fine Arts Journey
 *  Security Architecture:
 *  - ZERO innerHTML sinks (100% safe DOM node creation + textContent)
 *  - Deep-frozen SITE_CONFIG against runtime tampering
 *  - Strict local asset path allowlist (prevents protocol/path injection)
 *  - Anti-Clickjacking frame guard (blocks unauthorized cross-origin framing)
 *  - Zero tracking, zero cookies, zero external JS dependencies
 * =========================================================================
 */

import { SITE_CONFIG } from './config.js?v=4';
import { Atelier3DScene } from './scene3d.js?v=4';

/* ==================== RUNTIME SECURITY GUARDS ==================== */
(function enforceFrameProtection() {
  try {
    if (window.top !== window.self) {
      // Block unauthorized cross-origin iframe embedding (Clickjacking defense)
      document.documentElement.style.display = 'none';
      window.top.location.replace(window.self.location.href);
    }
  } catch {
    // Cross-origin frame blocked top navigation: keep page hidden safely
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

/* ==================== SAFE SVG ICON BUILDER (ZERO innerHTML) ==================== */
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

/* ==================== SAFE CHAPTER SECTION BUILDER (ZERO innerHTML) ==================== */
function createChapterSection(ch, idx, cfg) {
  const isReverse = idx % 2 === 1;
  const section = el('section', `section chapter-section${isReverse ? ' reverse' : ''}`);
  section.id = ch.id;
  section.dataset.stage = ch.eraAr;

  const grid = el('div', 'chapter-grid');

  // Text Card
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

  // Chapter 3 Encouragement Envelope
  if (ch.id === 'thanaweya' && ch.encouragementBodyAr) {
    const envBox = el('div', 'envelope-box');
    envBox.id = 'encouragement-envelope';

    const envBtn = el('button', 'envelope-trigger');
    envBtn.type = 'button';
    envBtn.id = 'envelope-btn';
    envBtn.setAttribute('aria-expanded', 'false');
    envBtn.append(
      el('span', '', `✦ ${ch.encouragementTitleAr} (اضغطي لفتح الرسالة)`),
      el('span', 'wax-seal-mini', 'XIX')
    );

    const envLetter = el('div', 'envelope-letter');
    envLetter.appendChild(el('p', '', ch.encouragementBodyAr));

    envBox.append(envBtn, envLetter);
    card.appendChild(envBox);
  }

  // Art Column
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

  // Chapter 4 Holographic Fine Arts Dream Pass
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

  // Hero
  document.getElementById('hero-eyebrow-en').textContent = cfg.hero.eyebrowEn;
  document.getElementById('hero-badge-ar').textContent = cfg.hero.badgeAr;
  document.getElementById('hero-title-prefix').textContent = cfg.hero.titlePrefixAr;
  document.getElementById('hero-artist-name').textContent = cfg.artistName;
  document.getElementById('hero-subtitle-ar').textContent = cfg.hero.subtitleAr;
  document.getElementById('hero-cta-ar').textContent = cfg.hero.ctaAr;
  document.getElementById('hero-cta-en').textContent = cfg.hero.ctaEn;
  document.getElementById('hero-guide-btn-ar').textContent = cfg.hero.guideBtnAr;

  // Visitor Guide Strip + Modal Cards
  document.getElementById('guide-eyebrow-en').textContent = cfg.guide.eyebrowEn;
  document.getElementById('guide-title-ar').textContent = cfg.guide.titleAr;
  document.getElementById('guide-subtitle-ar').textContent = cfg.guide.subtitleAr;

  const stripGrid = document.getElementById('guide-cards-grid');
  const modalGrid = document.getElementById('guide-modal-grid');
  stripGrid.replaceChildren(...cfg.guide.steps.map(createGuideCard));
  modalGrid.replaceChildren(...cfg.guide.steps.map(createGuideCard));

  // Chapters 1..3 before Horizon Goal; Chapter 4 right after it
  const firstRoot = document.getElementById('chapters-first-container');
  const secondRoot = document.getElementById('chapters-second-container');
  firstRoot.replaceChildren();
  secondRoot.replaceChildren();

  cfg.chapters.forEach((ch, idx) => {
    const sec = createChapterSection(ch, idx, cfg);
    if (idx < 3) firstRoot.appendChild(sec);
    else secondRoot.appendChild(sec);
  });

  // Horizon Goal Section
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

  // Finale & Copyright Footer
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

/* ==================== INTERACTIVE 3D GALLERY & LIGHTBOX (ZERO innerHTML) ==================== */
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

  // Gentle artwork context-menu protection on displayed photos/frames
  document.addEventListener('contextmenu', (e) => {
    if (e.target instanceof HTMLImageElement) {
      e.preventDefault();
    }
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

    inner.append(img, el('span', 'gallery-zoom-hint', '✦ اضغطي لتكبير اللوحة'));
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
  const sections = Array.from(document.querySelectorAll('section[id]'));
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
