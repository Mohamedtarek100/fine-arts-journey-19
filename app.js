/**
 * =========================================================================
 *  Main Application Logic — Cinema-Grade 3D Fine Arts Birthday Journey
 *  Includes: Dynamic Config Binding, Visitor Guide Modal, One-Step Horizon
 *  Motion-Graphics Tracker, Sparkle Cursor Trail, 3D Gallery, Sketch Canvas,
 *  Ambient Web Audio Harp & 19 Candles Celebration
 * =========================================================================
 */

import { SITE_CONFIG } from './config.js?v=3';
import { Atelier3DScene } from './scene3d.js?v=2';

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

/* ==================== SVG ICONS FOR VISITOR GUIDE ==================== */
function getGuideIconSvg(type) {
  switch (type) {
    case 'scroll':
      return `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"><rect x="7" y="3" width="10" height="18" rx="5"/><line x1="12" y1="7" x2="12" y2="11"/></svg>`;
    case 'orbit':
      return `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"><circle cx="12" cy="12" r="3"/><ellipse cx="12" cy="12" rx="9" ry="4" transform="rotate(-28 12 12)"/><ellipse cx="12" cy="12" rx="9" ry="4" transform="rotate(28 12 12)"/></svg>`;
    case 'touch':
      return `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3v3M5.6 5.6l2.1 2.1M18.4 5.6l-2.1 2.1"/><path d="M9 12a3 3 0 0 1 6 0v5a4 4 0 0 1-4 4h-1a4 4 0 0 1-4-4v-2.5"/></svg>`;
    default:
      return `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"><path d="M12 3l1.6 4.4L18 9l-4.4 1.6L12 15l-1.6-4.4L6 9l4.4-1.6z"/><path d="M19 15l.8 2.2L22 18l-2.2.8L19 21l-.8-2.2L16 18l2.2-.8z"/></svg>`;
  }
}

/* ==================== BUILD CHAPTER SECTION ELEMENT ==================== */
function createChapterSection(ch, idx, cfg) {
  const isReverse = idx % 2 === 1;
  const section = document.createElement('section');
  section.id = ch.id;
  section.className = `section chapter-section${isReverse ? ' reverse' : ''}`;
  section.dataset.stage = `${ch.eraAr}`;

  const encouragementHtml =
    ch.id === 'thanaweya' && ch.encouragementBodyAr
      ? `
      <div class="envelope-box" id="encouragement-envelope">
        <button class="envelope-trigger" type="button" aria-expanded="false" id="envelope-btn">
          <span>✦ ${ch.encouragementTitleAr} (اضغطي لفتح الرسالة)</span>
          <span class="wax-seal-mini">XIX</span>
        </button>
        <div class="envelope-letter">
          <p>${ch.encouragementBodyAr}</p>
        </div>
      </div>`
      : '';

  const dreamPassHtml =
    ch.id === 'fine-arts'
      ? `
      <div class="dream-pass-wrap">
        <div class="dream-pass" id="fine-arts-pass">
          <div class="pass-top">
            <div class="pass-crest" aria-hidden="true">✦</div>
            <div class="pass-inst">
              <span class="pass-inst-en">${cfg.dreamPass.institutionEn}</span>
              <strong class="pass-inst-ar">${cfg.dreamPass.institutionAr}</strong>
            </div>
          </div>
          <div class="pass-body">
            <div>
              <span class="pass-field-label">${cfg.dreamPass.subtitleAr}</span>
              <div class="pass-name">${cfg.artistName}</div>
              <span class="pass-status">● ${cfg.dreamPass.statusAr}</span>
            </div>
            <div class="pass-serial">
              <div>${cfg.dreamPass.batchAr}</div>
              <div>${cfg.dreamPass.serialNo}</div>
            </div>
          </div>
        </div>
      </div>`
      : '';

  section.innerHTML = `
    <div class="chapter-grid">
      <article class="chapter-card reveal">
        <span class="chapter-number-bg" aria-hidden="true">${ch.number}</span>
        <p class="chapter-era">✦ ${ch.eraAr}</p>
        <h2 class="chapter-title-ar">${ch.titleAr}</h2>
        <p class="chapter-title-en">${ch.titleEn}</p>
        <p class="chapter-story">${ch.storyAr}</p>
        <blockquote class="chapter-quote">${ch.quoteAr}</blockquote>
        ${encouragementHtml}
      </article>

      <div class="art-column reveal">
        <figure class="museum-frame js-tilt-frame" data-lightbox-img="${ch.image}" data-lightbox-title="${ch.titleAr}" data-lightbox-meta="${ch.captionEn}" data-lightbox-desc="${ch.captionAr}">
          <span class="frame-year-pill">${ch.yearTag}</span>
          <div class="museum-mat">
            <img src="${ch.image}" alt="${ch.captionAr}" loading="lazy" />
          </div>
          <figcaption class="frame-plaque">
            <span class="plaque-en">${ch.captionEn}</span>
            <span class="plaque-ar">${ch.captionAr}</span>
          </figcaption>
        </figure>
        ${dreamPassHtml}
      </div>
    </div>
  `;

  return section;
}

/* ==================== POPULATE PAGE FROM CONFIG.JS ==================== */
function renderContent() {
  const cfg = SITE_CONFIG;

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

  const guideHtml = cfg.guide.steps
    .map(
      (s) => `
      <article class="guide-card">
        <span class="guide-card-num" aria-hidden="true">${s.num}</span>
        <div class="guide-icon-box" aria-hidden="true">${getGuideIconSvg(s.icon)}</div>
        <h3>${s.titleAr}</h3>
        <span class="guide-en">${s.titleEn}</span>
        <p>${s.descAr}</p>
      </article>`
    )
    .join('');

  document.getElementById('guide-cards-grid').innerHTML = guideHtml;
  document.getElementById('guide-modal-grid').innerHTML = guideHtml;

  // Chapters 1..3 go before the Horizon Goal Section; Chapter 4 (Fine Arts) goes right after it!
  const firstRoot = document.getElementById('chapters-first-container');
  const secondRoot = document.getElementById('chapters-second-container');
  firstRoot.innerHTML = '';
  secondRoot.innerHTML = '';

  cfg.chapters.forEach((ch, idx) => {
    const sec = createChapterSection(ch, idx, cfg);
    if (idx < 3) firstRoot.appendChild(sec);
    else secondRoot.appendChild(sec);
  });

  // Horizon Goal Section (Current Stage -> One Step -> Fine Arts)
  const hg = cfg.horizonGoal;
  document.getElementById('horizon-eyebrow-en').textContent = hg.eyebrowEn;
  document.getElementById('horizon-title-ar').textContent = hg.titleAr;
  document.getElementById('horizon-subtitle-ar').textContent = hg.subtitleAr;
  document.getElementById('horizon-steps-label').textContent = hg.stepsRemainingLabel;
  document.getElementById('horizon-counter').dataset.target = String(hg.progressPercent);

  document.getElementById('horizon-nodes').innerHTML = hg.timelineNodes
    .map((n) => {
      const icon = n.state === 'done' ? '✓' : n.state === 'current' ? '●' : '✦';
      return `<div class="hp-node ${n.state}"><span>${icon}</span><span>${n.label}</span></div>`;
    })
    .join('');

  document.getElementById('now-badge-ar').textContent = hg.currentStage.badgeAr;
  document.getElementById('now-badge-en').textContent = hg.currentStage.badgeEn;
  document.getElementById('now-title-ar').textContent = hg.currentStage.titleAr;
  document.getElementById('now-age-tag').textContent = hg.currentStage.ageTagAr;
  document.getElementById('now-desc-ar').textContent = hg.currentStage.descAr;
  document.getElementById('now-highlights').innerHTML = hg.currentStage.highlightsAr
    .map((item) => `<li>${item}</li>`)
    .join('');

  document.getElementById('goal-badge-ar').textContent = hg.goalStage.badgeAr;
  document.getElementById('goal-badge-en').textContent = hg.goalStage.badgeEn;
  document.getElementById('goal-title-ar').textContent = hg.goalStage.titleAr;
  document.getElementById('goal-title-en').textContent = hg.goalStage.titleEn;
  document.getElementById('goal-desc-ar').textContent = hg.goalStage.descAr;
  document.getElementById('goal-milestones').innerHTML = hg.goalStage.milestonesAr
    .map(
      (m) => `
      <div class="goal-step-pill">
        <span class="goal-step-code">${m.code}</span>
        <span>${m.label}</span>
      </div>`
    )
    .join('');

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
  frames.forEach((el) => {
    el.addEventListener('pointermove', (e) => {
      if (e.pointerType !== 'mouse') return;
      const rect = el.getBoundingClientRect();
      const x = (e.clientX - rect.left) / rect.width;
      const y = (e.clientY - rect.top) / rect.height;
      const rotX = (0.5 - y) * 8;
      const rotY = (x - 0.5) * 10;
      el.style.transform = `perspective(1000px) rotateX(${rotX.toFixed(2)}deg) rotateY(${rotY.toFixed(2)}deg)`;
      el.style.setProperty('--mx', `${(x * 100).toFixed(1)}%`);
      el.style.setProperty('--my', `${(y * 100).toFixed(1)}%`);
    });

    el.addEventListener('pointerleave', () => {
      el.style.transform = 'perspective(1000px) rotateX(0deg) rotateY(0deg)';
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
  const items = SITE_CONFIG.gallery;
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
    lbImg.src = src;
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

  viewport.innerHTML = '';
  dotsWrap.innerHTML = '';

  const slideEls = items.map((item, i) => {
    const el = document.createElement('div');
    el.className = 'gallery-slide';
    el.innerHTML = `
      <div class="gallery-slide-inner">
        <img src="${item.image}" alt="${item.titleAr}" loading="lazy" />
        <span class="gallery-zoom-hint">✦ اضغطي لتكبير اللوحة</span>
      </div>
    `;
    el.addEventListener('click', () => {
      if (i === current) {
        openLightbox(
          item.image,
          `${item.titleEn} • ${item.year}`,
          item.titleAr,
          `${item.mediumAr} — ${item.descriptionAr}`
        );
      } else {
        current = i;
        updateSlides();
      }
    });
    viewport.appendChild(el);

    const dot = document.createElement('button');
    dot.className = 'gallery-dot';
    dot.type = 'button';
    dot.setAttribute('aria-label', item.titleAr);
    dot.addEventListener('click', () => {
      current = i;
      updateSlides();
    });
    dotsWrap.appendChild(dot);

    return el;
  });

  const dotEls = Array.from(dotsWrap.children);

  function updateSlides() {
    const total = items.length;
    const prevIdx = (current - 1 + total) % total;
    const nextIdx = (current + 1) % total;

    slideEls.forEach((el, idx) => {
      el.classList.remove('is-active', 'is-prev', 'is-next', 'is-hidden');
      if (idx === current) el.classList.add('is-active');
      else if (idx === prevIdx) el.classList.add('is-prev');
      else if (idx === nextIdx) el.classList.add('is-next');
      else el.classList.add('is-hidden');
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
      activeColor = btn.dataset.color;
    });
  });

  document.getElementById('brush-size').addEventListener('input', (e) => {
    brushSize = Number(e.target.value);
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

  // Bulletproof reveal check (guarantees NOTHING stays hidden on tall mobile screens!)
  const checkRevealsAndActiveSection = () => {
    const vh = window.innerHeight || 800;
    for (const el of reveals) {
      if (!el.classList.contains('visible')) {
        const rect = el.getBoundingClientRect();
        if (rect.top <= vh + 120 && rect.bottom >= -120) {
          el.classList.add('visible');
        }
      }
    }

    // Determine active section by viewport focal line (works reliably on ANY height!)
    const focalY = vh * 0.4;
    let currentId = sections[0]?.id || 'hero';
    for (const sec of sections) {
      const rect = sec.getBoundingClientRect();
      if (rect.top <= focalY) {
        currentId = sec.id;
      }
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

  // IntersectionObserver with threshold: 0 for instant mobile & desktop triggering
  const revealObs = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) entry.target.classList.add('visible');
      });
    },
    { threshold: 0, rootMargin: '120px 0px 120px 0px' }
  );
  reveals.forEach((el) => revealObs.observe(el));

  onScroll();

  const scrollToTarget = (targetId) => {
    const target = document.getElementById(targetId);
    if (target) target.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  railDots.forEach((dot) => dot.addEventListener('click', () => scrollToTarget(dot.dataset.target)));
  dockChips.forEach((chip) => chip.addEventListener('click', () => scrollToTarget(chip.dataset.target)));

  // Full-Screen 3D Inspect Mode Toggle (awesome on mobile & PC!)
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

  wishBtn.addEventListener('click', () => {
    candlesBlown = !candlesBlown;
    if (scene3d) scene3d.triggerWishCelebration(candlesBlown);

    if (candlesBlown) {
      audio.playWishChime();
      wishLetter.classList.add('revealed');
      wishLetter.setAttribute('aria-hidden', 'false');
      wishBtnAr.textContent = SITE_CONFIG.finale.buttonAfterAr;
      candlesStatus.classList.add('blown');
      candlesStatus.innerHTML =
        '<span class="flame-dot"></span><span>تحققت الأمنية بإذن الله — أُطلقت شرارات العام التاسع عشر ✦</span>';
    } else {
      wishBtnAr.textContent = SITE_CONFIG.finale.buttonAr;
      candlesStatus.classList.remove('blown');
      candlesStatus.innerHTML =
        '<span class="flame-dot"></span><span>19 شمعة ذهبية مضيئة في الخلفية ثلاثية الأبعاد</span>';
    }
  });
}

/* ==================== BOOTSTRAP ==================== */
function bootstrap() {
  renderContent();

  let scene3d = null;
  try {
    const canvas = document.getElementById('atelier-canvas');
    scene3d = new Atelier3DScene(canvas, SITE_CONFIG);
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
