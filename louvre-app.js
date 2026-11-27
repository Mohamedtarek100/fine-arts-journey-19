/**
 * =========================================================================
 *  600M PARIS METROPOLIS & MUSÉE DU LOUVRE STORY CONTROLLER (louvre-app.js v26)
 *  - True Pause-and-Explain Guided Tour Engine w/ Multi-Slide Storytelling
 *  - Dual Custom 3D Tour Guides:
 *      * القطة بوبس (default for all family guests)
 *      * أنس حبيب (exclusive custom 3D guide when يوسف is selected)
 *  - Live 525m Paris Mini-Map Radar + Compass + Distance-to-Louvre Meter
 *  - Live Paris Weather (Clear / Rain / Petals), Boulevard Express Cruise,
 *    Photo Studio Filters, 19 Sky Lanterns, Eiffel Sparkle Show & 5 Seals
 *  - Strict OWASP Zero-HTML-Injection • Zero Exclamation Marks in UI Copy
 *  - Designed & Developed by ENG / Mohamed Tarek • HEY Edition
 * =========================================================================
 */

import { SITE_CONFIG } from './config.js?v=24';
import { FamilyCloudVault } from './firebase-sync.js?v=24';
import { LouvreParisWorld3D, STORY_WAYPOINTS, HIDDEN_SEALS_DATA } from './louvre-world.js?v=26';

const VAULT_STORAGE_KEY = 'yomna_family_vault_xix_v1';
const WALL_PAINTING_KEY = 'yomna_louvre_wall_painting_v1';
const ALLOWED_SENDERS = new Set(SITE_CONFIG.reception.roles.filter((r) => !r.isHonoree).map((r) => r.id));
const TRACKED_DISCOVERIES = ['fountain', 'childhood', 'easel', 'passion', 'thanaweya', 'fine-arts', 'vault'];

const FOUNTAIN_WISHES = [
  '🪙 أمنية نافورة اللوفر 1: عامكِ الـ 19 بداية فرحة كبيرة وخطوة واثقة نحو كلية الفنون الجميلة. ✨',
  '🪙 أمنية نافورة اللوفر 2: ربنا يرزقكِ السكينة والهدوء في كل يوم من تالتة ثانوي ويفرح قلبكِ بالتفوق. 🕊️',
  '🪙 أمنية نافورة اللوفر 3: أن تظل موهبتكِ وفرحكِ بالرسم كل يوم هما بوصلتكِ الأجمل دائماً. 🎨',
  '🪙 أمنية نافورة اللوفر 4: أن تري لوحاتكِ الحقيقية معلّقة في أجمل المعارض كما تتألق اليوم في اللوفر. 🏛️',
];

const PHOTO_FILTERS = [
  { label: '🎞️ فلتر: طبيعي', css: 'none' },
  { label: '🌅 فلتر: فيلم باريس الذهبي', css: 'contrast(1.08) saturate(1.24) sepia(0.18)' },
  { label: '📜 فلتر: كلاسيكي دافئ', css: 'sepia(0.58) contrast(1.06) brightness(0.98)' },
  { label: '🎬 فلتر: نوار سينمائي', css: 'grayscale(0.92) contrast(1.25)' },
];

function el(tag, className, text) {
  const n = document.createElement(tag);
  if (className) n.className = className;
  if (text !== undefined && text !== null) n.textContent = String(text);
  return n;
}

function svgEl(tag, attrs = {}) {
  const node = document.createElementNS('http://www.w3.org/2000/svg', tag);
  for (const [k, v] of Object.entries(attrs)) node.setAttribute(k, String(v));
  return node;
}

function createRoleCrestSvg(type) {
  const svg = svgEl('svg', { viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', 'stroke-width': '1.6', 'stroke-linecap': 'round', 'stroke-linejoin': 'round' });
  if (type === 'palette') {
    svg.append(svgEl('path', { d: 'M12 3a9 9 0 1 0 0 18h1.5a2.5 2.5 0 0 0 0-5H12a2 2 0 0 1 0-4h4.5A4.5 4.5 0 0 0 12 3Z' }), svgEl('circle', { cx: 7.5, cy: 10.5, r: 1 }), svgEl('circle', { cx: 10.5, cy: 7.5, r: 1 }), svgEl('circle', { cx: 15, cy: 8.5, r: 1 }));
  } else if (type === 'pillar') {
    svg.append(svgEl('path', { d: 'M4 20h16M6 20V9M18 20V9M10 20V9M14 20V9' }), svgEl('path', { d: 'M3 9l9-5 9 5H3Z' }));
  } else if (type === 'blossom') {
    svg.append(svgEl('path', { d: 'M12 20c-4.5-3.2-7-6.3-7-9.6A4.4 4.4 0 0 1 12 7a4.4 4.4 0 0 1 7 3.4c0 3.3-2.5 6.4-7 9.6Z' }), svgEl('path', { d: 'M12 3v2M5 5l1.5 1.5M19 5l-1.5 1.5' }));
  } else if (type === 'shield') {
    svg.append(svgEl('path', { d: 'M12 3l7 3v5.5c0 4.6-3 8.1-7 9.5-4-1.4-7-4.9-7-9.5V6l7-3Z' }), svgEl('path', { d: 'M12 8.5l1.1 2.4 2.6.3-2 1.8.5 2.5-2.2-1.3-2.2 1.3.5-2.5-2-1.8 2.6-.3L12 8.5Z' }));
  } else if (type === 'compass') {
    svg.append(svgEl('circle', { cx: 12, cy: 12, r: 8.5 }), svgEl('polygon', { points: '15.8 8.2 13.7 13.7 8.2 15.8 10.3 10.3 15.8 8.2' }));
  } else if (type === 'laurel') {
    svg.append(svgEl('path', { d: 'M7 19c-2.5-3-3-7.5-1-12 2.5 1 4.5 3.5 5 6.5' }), svgEl('path', { d: 'M17 19c2.5-3 3-7.5 1-12-2.5 1-4.5 3.5-5 6.5' }), svgEl('path', { d: 'M12 5v15' }));
  } else if (type === 'butterfly') {
    svg.append(svgEl('path', { d: 'M12 12c-2-4-6.5-6-7.5-3.2C3.7 11 6.5 13 9 13c-2.2.8-3.8 2.8-2.5 4.8 1.4 2 4.5.2 5.5-2.8Z' }), svgEl('path', { d: 'M12 12c2-4 6.5-6 7.5-3.2.8 2.2-2 4.2-4.5 4.2 2.2.8 3.8 2.8 2.5 4.8-1.4 2-4.5.2-5.5-2.8Z' }), svgEl('path', { d: 'M12 7v11' }));
  } else {
    svg.append(svgEl('path', { d: 'M12 3l6 8-6 10-6-10 6-8Z' }), svgEl('circle', { cx: 12, cy: 11.5, r: 1.5 }), svgEl('path', { d: 'M12 13v8' }));
  }
  return svg;
}

function sanitizeText(raw, maxLen = 220) {
  if (typeof raw !== 'string') return '';
  return raw.replace(/[\u0000-\u001F\u007F<>`]/g, '').replace(/\s+/g, ' ').trim().slice(0, maxLen);
}

function encodeGiftToken(senderId, message) {
  if (!ALLOWED_SENDERS.has(senderId)) return '';
  const cleanMsg = sanitizeText(message, 220);
  if (!cleanMsg) return '';
  const bytes = new TextEncoder().encode(JSON.stringify({ f: senderId, m: cleanMsg, t: Date.now() }));
  let bin = '';
  for (let i = 0; i < bytes.length; i++) bin += String.fromCharCode(bytes[i]);
  return btoa(bin).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/g, '');
}

function decodeGiftToken(token) {
  try {
    if (typeof token !== 'string' || token.length < 8 || token.length > 1400 || !/^[A-Za-z0-9_-]+$/.test(token)) return null;
    let b64 = token.replace(/-/g, '+').replace(/_/g, '/');
    while (b64.length % 4) b64 += '=';
    const bin = atob(b64), bytes = new Uint8Array(bin.length);
    for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
    const parsed = JSON.parse(new TextDecoder().decode(bytes));
    if (!parsed || !ALLOWED_SENDERS.has(parsed.f)) return null;
    const msg = sanitizeText(parsed.m, 220);
    return msg ? { senderId: parsed.f, message: msg } : null;
  } catch { return null; }
}

/* ==================== AUDIO ENGINE ==================== */
class LouvreAudio {
  constructor() {
    this.ctx = null; this.gain = null; this.playing = false; this.timer = null; this.step = 0; this.voiceEnabled = false;
    this.notes = [261.63, 329.63, 392.0, 493.88, 587.33, 493.88, 392.0, 329.63];
  }
  ensure() {
    if (!this.ctx) {
      const Ctx = window.AudioContext || window.webkitAudioContext;
      this.ctx = new Ctx(); this.gain = this.ctx.createGain(); this.gain.gain.value = 0.085; this.gain.connect(this.ctx.destination);
    }
    if (this.ctx.state === 'suspended') this.ctx.resume();
  }
  tone(freq, dur = 2.2, vol = 0.24, type = 'sine') {
    if (!this.ctx || !this.gain) return;
    const now = this.ctx.currentTime, osc = this.ctx.createOscillator(), g = this.ctx.createGain();
    osc.type = type; osc.frequency.setValueAtTime(freq, now);
    g.gain.setValueAtTime(0.0001, now); g.gain.exponentialRampToValueAtTime(vol, now + 0.05); g.gain.exponentialRampToValueAtTime(0.0001, now + dur);
    osc.connect(g); g.connect(this.gain); osc.start(now); osc.stop(now + dur + 0.04);
  }
  footstep(surface = 'stone') {
    if (!this.ctx || this.ctx.state !== 'running') return;
    const now = this.ctx.currentTime, osc = this.ctx.createOscillator(), g = this.ctx.createGain();
    osc.type = 'triangle'; osc.frequency.setValueAtTime(surface === 'wood' ? 135 : 195, now);
    osc.frequency.exponentialRampToValueAtTime(52, now + 0.065);
    g.gain.setValueAtTime(0.0001, now); g.gain.exponentialRampToValueAtTime(0.065, now + 0.01); g.gain.exponentialRampToValueAtTime(0.0001, now + 0.075);
    osc.connect(g); g.connect(this.gain); osc.start(now); osc.stop(now + 0.08);
  }
  toggleMusic() {
    if (this.playing) { this.playing = false; clearInterval(this.timer); return false; }
    try {
      this.ensure(); this.playing = true;
      const tick = () => { if (!this.playing) return; this.tone(this.notes[this.step % this.notes.length], 2.6, 0.22); this.step++; };
      tick(); this.timer = window.setInterval(tick, 1450);
      return true;
    } catch { return false; }
  }
  speakAr(text) {
    if (!this.voiceEnabled || !('speechSynthesis' in window)) return;
    try {
      window.speechSynthesis.cancel();
      const u = new SpeechSynthesisUtterance(String(text).replace(/[^\u0600-\u06FF0-9a-zA-Z\s.,،؟]/g, ' '));
      u.lang = 'ar-EG'; u.rate = 0.96;
      window.speechSynthesis.speak(u);
    } catch { /* ignore */ }
  }
  chime() { try { this.ensure(); [523.25, 659.25, 783.99, 1046.5].forEach((f, i) => setTimeout(() => this.tone(f, 2.0, 0.22), i * 85)); } catch { /* ignore */ } }
  sparkleChime() { try { this.ensure(); [659.25, 783.99, 987.77, 1318.5, 1567.98].forEach((f, i) => setTimeout(() => this.tone(f, 1.8, 0.18, 'triangle'), i * 75)); } catch { /* ignore */ } }
  coinSplash() { try { this.ensure(); [987.77, 1318.5, 1567.98].forEach((f, i) => setTimeout(() => this.tone(f, 1.4, 0.2, 'triangle'), i * 70)); } catch { /* ignore */ } }
  meow() {
    try {
      this.ensure();
      const now = this.ctx.currentTime, osc = this.ctx.createOscillator(), g = this.ctx.createGain();
      osc.type = 'triangle'; osc.frequency.setValueAtTime(620, now); osc.frequency.exponentialRampToValueAtTime(910, now + 0.14); osc.frequency.exponentialRampToValueAtTime(520, now + 0.42);
      g.gain.setValueAtTime(0.0001, now); g.gain.exponentialRampToValueAtTime(0.14, now + 0.05); g.gain.exponentialRampToValueAtTime(0.0001, now + 0.44);
      osc.connect(g); g.connect(this.gain); osc.start(now); osc.stop(now + 0.46);
    } catch { /* ignore */ }
  }
}

class SharedFamilyVault {
  constructor() {
    this.messages = {};
    try {
      const raw = window.localStorage.getItem(VAULT_STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        for (const id of ALLOWED_SENDERS) if (parsed?.[id]?.message) this.messages[id] = { message: sanitizeText(parsed[id].message, 220), custom: true };
      }
    } catch { /* ignore */ }
  }
  save(id, msg) {
    if (!ALLOWED_SENDERS.has(id)) return;
    const clean = sanitizeText(msg, 220);
    if (!clean) return;
    this.messages[id] = { message: clean, timestamp: Date.now(), custom: true };
    try { window.localStorage.setItem(VAULT_STORAGE_KEY, JSON.stringify(this.messages)); } catch { /* ignore */ }
  }
  getEntry(role) {
    if (this.messages[role.id]) return { message: this.messages[role.id].message, isCustom: true };
    return { message: role.defaultVaultMsg || '', isCustom: false };
  }
}

function downloadCertificatePng() {
  const c = document.createElement('canvas'); c.width = 1200; c.height = 840;
  const ctx = c.getContext('2d');
  const g = ctx.createRadialGradient(600, 300, 60, 600, 420, 760);
  g.addColorStop(0, '#2a1e14'); g.addColorStop(0.65, '#150f0a'); g.addColorStop(1, '#0b0806');
  ctx.fillStyle = g; ctx.fillRect(0, 0, 1200, 840);
  ctx.strokeStyle = '#e8c268'; ctx.lineWidth = 4; ctx.strokeRect(30, 30, 1140, 780);
  ctx.textAlign = 'center';
  ctx.direction = 'ltr'; ctx.fillStyle = '#d6ab52'; ctx.font = '600 18px Cinzel, serif';
  ctx.fillText('HEY  •  MUSÉE DU LOUVRE PARIS EDITION  •  5 DECEMBER', 600, 108);
  ctx.direction = 'rtl'; ctx.fillStyle = '#fbf0cf'; ctx.font = '700 50px Amiri, serif';
  ctx.fillText('شهادة فخر ووسام العام التاسع عشر', 600, 192);
  ctx.fillStyle = '#e8c268'; ctx.font = '700 62px Amiri, serif';
  ctx.fillText(`الفنانة ${SITE_CONFIG.artistName}`, 600, 288);
  ctx.fillStyle = '#f8f1e4'; ctx.font = '500 26px Cairo, sans-serif';
  ctx.fillText('ثانوية عامة لم تكن نهاية الرحلة خالص، ولكن هي البداية', 600, 392);
  ctx.fillText('والهدف هو اللي بنشتغل عليه كل يوم وإحنا فرحانين', 600, 444);
  ctx.fillStyle = '#d6ab52'; ctx.font = '600 20px Cairo, sans-serif';
  ctx.fillText('مُهداة وموقّعة بكل فخر ومحبة من عائلتكِ:', 600, 616);
  ctx.fillStyle = '#fbf0cf'; ctx.font = '700 32px Amiri, serif';
  ctx.fillText(SITE_CONFIG.familySignOffAr, 600, 672);
  ctx.direction = 'ltr'; ctx.fillStyle = 'rgba(238,210,138,0.68)'; ctx.font = '500 14px Cinzel, serif';
  ctx.fillText('DESIGNED & DEVELOPED BY ENG / MOHAMED TAREK  •  HEY EDITION', 600, 756);
  const a = document.createElement('a');
  a.download = 'Yomna-Louvre-19th-Certificate-HEY.png'; a.href = c.toDataURL('image/png'); a.click();
}

/* ==================== MAIN BOOTSTRAP ==================== */
function bootstrap() {
  const audio = new LouvreAudio();
  const vaultStore = new SharedFamilyVault();
  const cloudVault = new FamilyCloudVault();
  const roles = SITE_CONFIG.reception.roles;
  const familyRoles = roles.filter((r) => !r.isHonoree);
  let activeRole = roles[0];
  let shownWelcomeOnce = false;
  let wishIdx = 0;
  let currentSlideIdx = 0;
  let filterIdx = 0;
  const discovered = new Set();
  const foundSeals = new Set();

  const preloader = document.getElementById('preloader');
  const dismissPreloader = () => { if (preloader) preloader.classList.add('done'); };
  window.setTimeout(dismissPreloader, 2800);

  // Check incoming ?gift= URL token
  try {
    const params = new URLSearchParams(window.location.search);
    const gift = decodeGiftToken(params.get('gift') || '');
    if (gift) {
      vaultStore.save(gift.senderId, gift.message);
      const senderRole = roles.find((r) => r.id === gift.senderId);
      const banner = document.getElementById('incoming-gift-banner');
      document.getElementById('incoming-gift-text').textContent = `وصلت رسالة تهنئة جديدة ليمنى من ${senderRole ? senderRole.displayFullAr : 'العائلة'} — محفوظة الآن داخل صندوق متحف اللوفر.`;
      banner.classList.add('visible'); banner.setAttribute('aria-hidden', 'false');
    }
  } catch { /* ignore */ }

  const canvasEl = document.getElementById('louvre-canvas');
  const questLabel = document.getElementById('quest-label');
  const discoveryCounter = document.getElementById('discovery-counter');
  const sealsCounter = document.getElementById('seals-counter');
  const mapProgressSummary = document.getElementById('map-progress-summary');
  const mapSealsStrip = document.getElementById('map-seals-strip');
  const catGuideCard = document.getElementById('cat-guide-card');
  const catReopenBtn = document.getElementById('cat-reopen-btn');
  const guideAvatarImg = document.getElementById('guide-avatar-img');
  const guideCardName = document.getElementById('guide-card-name');
  const guideStopBadge = document.getElementById('guide-stop-badge');
  const catGuideText = document.getElementById('cat-guide-text');
  const guideFunfact = document.getElementById('guide-funfact');
  const tourMainBtn = document.getElementById('tour-main-btn');
  const tourSlideBtn = document.getElementById('tour-slide-btn');
  const tourExploreBtn = document.getElementById('tour-explore-btn');
  const tourSpeedBtn = document.getElementById('tour-speed-btn');
  const proximityBtn = document.getElementById('proximity-prompt');
  const proximityText = document.getElementById('proximity-text');
  const visitorBtn = document.getElementById('gt-visitor-btn');
  const timeBtn = document.getElementById('gt-time-btn');
  const zoomTopBtn = document.getElementById('gt-zoom-btn');
  const zoomTrayBtn = document.getElementById('gt-zoom-tray-btn');
  const uvTopBtn = document.getElementById('gt-uv-btn');
  const uvTrayBtn = document.getElementById('gt-uv-tray-btn');
  const toolsTray = document.getElementById('pro-tools-tray');
  const toastEl = document.getElementById('louvre-toast');
  const minimapTelemetry = document.getElementById('minimap-telemetry');

  let activeInteractId = null, toastTimer = 0;
  const showToast = (msg, dur = 5000) => {
    toastEl.textContent = msg;
    toastEl.classList.add('show'); toastEl.setAttribute('aria-hidden', 'false');
    clearTimeout(toastTimer);
    toastTimer = window.setTimeout(() => { toastEl.classList.remove('show'); toastEl.setAttribute('aria-hidden', 'true'); }, dur);
  };

  const isAnasActive = () => activeRole.id === 'youssef';

  const getSlidesForWaypoint = (wp) => (isAnasActive() ? wp.anasSlides : wp.bobsSlides) || [];

  const renderTourStoryCard = (idx, phaseOverride) => {
    const wp = STORY_WAYPOINTS[idx] || STORY_WAYPOINTS[0];
    const phase = phaseOverride || world.guidePhase;
    const slides = getSlidesForWaypoint(wp);
    if (currentSlideIdx >= slides.length) currentSlideIdx = 0;

    const anas = isAnasActive();
    catGuideCard.classList.toggle('anas-mode', anas);
    catGuideCard.classList.toggle('explaining', phase === 'explaining');
    guideAvatarImg.src = anas ? './assets/guides/anas-habib.jpg' : './assets/guides/bobs-cat.jpg';
    guideAvatarImg.alt = anas ? 'أنس حبيب' : 'القطة بوبس';
    guideCardName.textContent = anas ? '🧭 أنس حبيب — المرشد السياحي' : '🐾 القطة بوبس — مرشدة الجولة';
    catReopenBtn.textContent = anas ? '🧭 أنس حبيب' : '🐾 القطة بوبس';

    document.querySelectorAll('.bobs-only').forEach((n) => n.classList.toggle('panel-hidden', anas));
    document.querySelectorAll('.anas-only').forEach((n) => n.classList.toggle('panel-hidden', !anas));

    const prefix = phase === 'walking' ? 'جاري المسير نحو' : phase === 'explaining' ? 'توقّف للشرح' : 'المحطة';
    guideStopBadge.textContent = `${prefix} ${idx + 1} / ${STORY_WAYPOINTS.length} • ${wp.zoneAr}`;
    questLabel.textContent = `${anas ? '🧭 جولة أنس حبيب' : '🐾 جولة بوبس'} • ${idx + 1} / ${STORY_WAYPOINTS.length} — ${wp.labelAr}`;

    if (phase === 'walking') {
      catGuideText.textContent = anas
        ? `تعالَ معي يا يوسف نحو «${wp.labelAr}»، وسأتوقف هناك لأشرح لك كل تفاصيل المكان.`
        : `تقدّم معي نحو «${wp.labelAr}»، وسأتوقف هناك أمامك لأشرح لك حكاية هذه المحطة.`;
      guideFunfact.textContent = '';
    } else {
      catGuideText.textContent = slides[currentSlideIdx] || '';
      guideFunfact.textContent = wp.funFactAr ? `✦ ${wp.funFactAr}` : '';
    }

    // Slide button visibility
    if (phase !== 'walking' && slides.length > 1) {
      tourSlideBtn.classList.remove('panel-hidden');
      const nextNum = ((currentSlideIdx + 1) % slides.length) + 1;
      tourSlideBtn.textContent = currentSlideIdx === 0 ? `📖 تكملة الشرح (${nextNum}/${slides.length})` : `📖 الشرح السابق (1/${slides.length})`;
    } else {
      tourSlideBtn.classList.add('panel-hidden');
    }

    // Primary Tour Button: Pause-and-Explain explicit state machine!
    tourMainBtn.classList.remove('ready-next');
    if (phase === 'walking') {
      tourMainBtn.textContent = '⏸ إيقاف مؤقت للتجول';
    } else if (phase === 'explaining') {
      if (idx < STORY_WAYPOINTS.length - 1) {
        tourMainBtn.textContent = '← أكمل الجولة للمحطة التالية';
        tourMainBtn.classList.add('ready-next');
      } else {
        tourMainBtn.textContent = '🔄 إعادة الجولة من الشانزليزيه';
      }
    } else {
      tourMainBtn.textContent = anas ? '🧭 ابدأ الجولة مع أنس حبيب' : '🐾 ابدأ الجولة مع بوبس';
    }

    // Contextual Exhibit Explore Button
    if (wp.interactId && phase !== 'walking') {
      tourExploreBtn.classList.remove('panel-hidden');
      const labels = {
        fountain: '🪙 ألقِ عملة في النافورة',
        childhood: '📜 افتح التحفة 01',
        easel: '🎨 افتح مرسم اللوفر',
        passion: '📜 افتح التحفة 02',
        thanaweya: '📜 افتح التحفة 03',
        'fine-arts': '📜 افتح التحفة 04',
        vault: '💌 افتح صندوق العائلة',
        cake: '🎂 احتفل بتورتة الـ 19',
      };
      tourExploreBtn.textContent = labels[wp.interactId] || '📜 استكشف المحطة';
      tourExploreBtn.dataset.interact = wp.interactId;
    } else {
      tourExploreBtn.classList.add('panel-hidden');
    }
  };

  const renderProgressSummaries = () => {
    const n = discovered.size, total = TRACKED_DISCOVERIES.length;
    const s = foundSeals.size, sTotal = HIDDEN_SEALS_DATA.length;
    discoveryCounter.textContent = n === total ? `🏆 الكنوز ${total}/${total}` : `الكنوز: ${n} / ${total}`;
    sealsCounter.textContent = s === sTotal ? `🏅 الأختام ${sTotal}/${sTotal}` : `الأختام: ${s} / ${sTotal}`;
    mapProgressSummary.textContent = (n === total && s === sTotal)
      ? '🏆 اكتملت رحلة باريس ومتحف اللوفر بالكامل — جميع الكنوز السبعة والأختام الذهبية الخمسة.'
      : `اكتشفت ${n} من ${total} كنوز و ${s} من ${sTotal} أختام ذهبية — اضغط على أي محطة للتنقل الفوري وبدء الشرح.`;
    if (mapSealsStrip) {
      mapSealsStrip.replaceChildren(...HIDDEN_SEALS_DATA.map((item) => {
        const isFound = foundSeals.has(item.id);
        return el('span', `seal-chip${isFound ? ' found' : ''}`, `${isFound ? '✓' : '○'} ${item.labelAr}`);
      }));
    }
  };
  renderProgressSummaries();

  const markDiscovered = (id) => {
    if (!TRACKED_DISCOVERIES.includes(id) || discovered.has(id)) return;
    discovered.add(id);
    renderProgressSummaries();
    if (discovered.size === TRACKED_DISCOVERIES.length) {
      audio.chime();
      showToast('🏆 مبروك. حصلت على «وسام مستكشف متحف اللوفر الملكي» لاكتشاف كل الكنوز السبعة. ✨', 6000);
    }
  };

  const openModal = (id) => {
    const m = document.getElementById(id);
    if (!m) return;
    toolsTray.classList.remove('open'); toolsTray.setAttribute('aria-hidden', 'true');
    m.classList.add('open'); m.setAttribute('aria-hidden', 'false');
    world.pauseGuidedTour();
    world.stopDroneTour();
    world.stopBoulevardCabRide();
  };
  const closeModal = (id) => {
    const m = document.getElementById(id);
    if (!m) return;
    m.classList.remove('open'); m.setAttribute('aria-hidden', 'true');
  };
  const closeAllModals = () => { document.querySelectorAll('.museum-modal.open').forEach((m) => closeModal(m.id)); };

  document.querySelectorAll('[data-close-modal]').forEach((b) => b.addEventListener('click', () => closeModal(b.dataset.closeModal)));
  document.querySelectorAll('.museum-modal').forEach((m) => m.addEventListener('click', (e) => { if (e.target === m) closeModal(m.id); }));
  window.addEventListener('keydown', (e) => { if (e.key === 'Escape') closeAllModals(); });

  // ==================== BUILD 600M PARIS & LOUVRE 3D WORLD ====================
  const world = new LouvreParisWorld3D(canvasEl, SITE_CONFIG, {
    onReady() { window.setTimeout(dismissPreloader, 260); },
    onWaypointChange(idx, wp) {
      currentSlideIdx = 0;
      renderTourStoryCard(idx);
      refreshMapActive(idx);
    },
    onGuidePhaseChange(phase, idx) {
      renderTourStoryCard(idx, phase);
    },
    onTourStopArrive(idx, wp) {
      currentSlideIdx = 0;
      catGuideCard.classList.remove('folded');
      renderTourStoryCard(idx, 'explaining');
      refreshMapActive(idx);
      audio.chime();
      const firstSlide = getSlidesForWaypoint(wp)[0] || '';
      audio.speakAr(firstSlide);
    },
    onProximityChange(item) {
      activeInteractId = item?.id || null;
      if (item) {
        proximityText.textContent = item.badgeAr;
        proximityBtn.classList.add('visible'); proximityBtn.setAttribute('aria-hidden', 'false');
      } else {
        proximityBtn.classList.remove('visible'); proximityBtn.setAttribute('aria-hidden', 'true');
      }
    },
    onDroneChange(active) {
      document.body.classList.toggle('cinema-mode', active);
      document.getElementById('cinema-exit-bar').setAttribute('aria-hidden', String(!active));
    },
    onCabRideChange(active) {
      if (active) showToast('🏎️ انطلقت جولة البوليفارد السريعة بطول 500 متر نحو ساحة اللوفر. يمكنك النظر حولك بحرية.', 4500);
    },
    onZoomChange(zoomed) {
      if (zoomTopBtn) { zoomTopBtn.setAttribute('aria-pressed', String(zoomed)); zoomTopBtn.textContent = zoomed ? '🔭 تقريب 2×' : '🔭 تقريب'; }
      if (zoomTrayBtn) { zoomTrayBtn.setAttribute('aria-pressed', String(zoomed)); zoomTrayBtn.textContent = zoomed ? '🔭 عدسة التقريب البصري: 2× مفعّلة' : '🔭 عدسة التقريب البصري: 1×'; }
    },
    onWeatherChange(mode) {
      const lbls = { clear: '☀️ طقس باريس: صحو (أوراق ذهبية)', rain: '🌧️ طقس باريس: مطر ولمعان الشوارع', petals: '🌸 طقس باريس: بتلات ربيع باريس' };
      const wb = document.getElementById('gt-weather-btn');
      if (wb) wb.textContent = lbls[mode] || lbls.clear;
    },
    onFootstep(surface) { audio.footstep(surface); },
    onEnterLouvre() {
      audio.chime();
      showToast('🏛️ أهلاً بك داخل القاعة الكبرى لمتحف اللوفر. جرّب المرسم الذهبي والأختام المخفية وعدسة الأسرار. ✨', 6000);
    },
    onTimeChange(mode) {
      const shortMap = { sunset: '🌇 غروب', day: '☀️ نهار', night: '🌙 ليل', gallery: '🏛️ أتيليه' };
      timeBtn.textContent = shortMap[mode] || '🌇 غروب';
    },
    onGuideTap(guideType) {
      catGuideCard.classList.remove('folded');
      if (guideType === 'anas') {
        audio.chime();
        catGuideText.textContent = 'أهلاً يا يوسف يا بطل. أنا أنس حبيب معك خطوة بخطوة، اضغط «أكمل الجولة» وقت ما تكون جاهز للمحطة اللي بعدها.';
        audio.speakAr(catGuideText.textContent);
      } else {
        audio.meow();
        catGuideText.textContent = 'أنا القطة بوبس، سعيدة جداً بمرافقتك. اضغط «أكمل الجولة» عندما تنتهي من استكشاف هذه المحطة.';
        audio.speakAr(catGuideText.textContent);
      }
    },
    onInteract(id) { handleInteract(id); },
  });

  // ==================== LIVE 525M PARIS & LOUVRE MINI-MAP RADAR + COMPASS ====================
  const miniCanvas = document.getElementById('louvre-minimap');
  const mctx = miniCanvas ? miniCanvas.getContext('2d') : null;
  const minimapWidget = document.getElementById('minimap-widget');
  if (minimapWidget) minimapWidget.addEventListener('click', () => openModal('map-modal'));

  const drawMiniMap = () => {
    if (!mctx || document.body.classList.contains('portal-open') || document.body.classList.contains('cinema-mode')) return;
    if (window.innerWidth <= 760) return;
    const W = miniCanvas.width, H = miniCanvas.height;
    // Map covers z: -105 (North Rotunda, top) to +445 (South Arc de Triomphe, bottom)
    const toMX = (wx) => W * 0.5 + (wx / 42) * (W * 0.44);
    const toMZ = (wz) => ((wz + 108) / 560) * (H - 14) + 7;

    mctx.clearRect(0, 0, W, H);
    mctx.fillStyle = '#120d09';
    mctx.fillRect(0, 0, W, H);

    // Asphalt Boulevards (z: +32..+445)
    mctx.fillStyle = 'rgba(130, 145, 165, 0.25)';
    mctx.fillRect(toMX(-24), toMZ(32), toMX(-8) - toMX(-24), toMZ(445) - toMZ(32));
    mctx.fillRect(toMX(8), toMZ(32), toMX(24) - toMX(8), toMZ(445) - toMZ(32));

    // Central Pedestrian Champs-Élysées Promenade
    mctx.fillStyle = 'rgba(232, 194, 104, 0.22)';
    mctx.fillRect(toMX(-8), toMZ(32), toMX(8) - toMX(-8), toMZ(445) - toMZ(32));

    // Mall (East z=290) & Police (West z=170) markers
    mctx.fillStyle = 'rgba(238, 210, 138, 0.55)';
    mctx.fillRect(toMX(26), toMZ(268), 11, 14);
    mctx.fillStyle = 'rgba(84, 168, 255, 0.65)';
    mctx.fillRect(toMX(-36), toMZ(158), 10, 10);

    // Louvre Pyramid diamond (z=7)
    const px0 = toMX(0), pz0 = toMZ(7);
    mctx.strokeStyle = 'rgba(154, 224, 248, 0.85)'; mctx.lineWidth = 1.3;
    mctx.beginPath(); mctx.moveTo(px0, pz0 - 5); mctx.lineTo(px0 + 6, pz0); mctx.lineTo(px0, pz0 + 5); mctx.lineTo(px0 - 6, pz0); mctx.closePath(); mctx.stroke();

    // Louvre Grande Galerie Hall & Rotunda
    mctx.fillStyle = 'rgba(138, 34, 48, 0.45)';
    mctx.fillRect(toMX(-9), toMZ(-80), toMX(9) - toMX(-9), toMZ(-6) - toMZ(-80));
    mctx.beginPath(); mctx.arc(toMX(0), toMZ(-93), 6, 0, Math.PI * 2); mctx.fillStyle = 'rgba(232, 194, 104, 0.4)'; mctx.fill();

    const tel = world.getMiniMapTelemetry();
    if (minimapTelemetry) {
      minimapTelemetry.textContent = tel.distToLouvre > 0
        ? `${tel.distToLouvre} م للوفر • ${tel.headingAr.split('•')[0].trim()}`
        : `داخل اللوفر • ${tel.headingAr.split('•')[0].trim()}`;
    }

    // Uncollected Seals
    for (const s of tel.seals) {
      if (s.collected) continue;
      mctx.beginPath(); mctx.arc(toMX(s.x), toMZ(s.z), 2.8, 0, Math.PI * 2);
      mctx.fillStyle = '#ff5e66'; mctx.fill();
    }

    // Active Guide dot (Gold for Bobs, Sky Blue for Anas Habib)
    mctx.beginPath(); mctx.arc(toMX(tel.gx), toMZ(tel.gz), 3.2, 0, Math.PI * 2);
    mctx.fillStyle = tel.guideType === 'anas' ? '#76d0ff' : '#ffd26b';
    mctx.fill();

    // Player Directional Arrow
    const ux = toMX(tel.px), uz = toMZ(tel.pz);
    mctx.save(); mctx.translate(ux, uz); mctx.rotate(-tel.yaw);
    mctx.fillStyle = '#ffffff';
    mctx.beginPath(); mctx.moveTo(0, -5); mctx.lineTo(3.8, 4); mctx.lineTo(0, 2); mctx.lineTo(-3.8, 4); mctx.closePath(); mctx.fill();
    mctx.restore();
  };
  window.setInterval(drawMiniMap, 120);

  // ==================== LIVE 3D PAINTING STUDIO ON LOUVRE WALL ====================
  const paintCanvas = document.getElementById('lw-paint-canvas');
  const pctx = paintCanvas.getContext('2d');
  const brushSizeInput = document.getElementById('lw-brush-size');
  let brushColor = '#f2cc6e', brushWidth = 4.2, symmetry8 = true, painting = false, lastPt = null;

  const resetPaintCanvas = () => {
    const g = pctx.createRadialGradient(320, 220, 30, 320, 240, 390);
    g.addColorStop(0, '#271b12'); g.addColorStop(1, '#110b07');
    pctx.fillStyle = g; pctx.fillRect(0, 0, 640, 480);
    pctx.strokeStyle = 'rgba(232, 194, 104, 0.55)'; pctx.lineWidth = 3; pctx.strokeRect(18, 18, 604, 444);
  };
  resetPaintCanvas();

  try {
    const savedUrl = window.localStorage.getItem(WALL_PAINTING_KEY);
    if (savedUrl && savedUrl.startsWith('data:image/png')) {
      const im = new Image();
      im.onload = () => { pctx.drawImage(im, 0, 0, 640, 480); world.updateCustomLouvreWallPainting(paintCanvas); };
      im.src = savedUrl;
    }
  } catch { /* ignore */ }

  if (brushSizeInput) brushSizeInput.addEventListener('input', () => { brushWidth = Math.max(2, Math.min(14, Number(brushSizeInput.value) || 4)); });

  const getCanvasPt = (e) => {
    const r = paintCanvas.getBoundingClientRect();
    return { x: ((e.clientX - r.left) / r.width) * 640, y: ((e.clientY - r.top) / r.height) * 480 };
  };
  const strokeSeg = (p0, p1) => {
    pctx.save(); pctx.strokeStyle = brushColor; pctx.lineWidth = brushWidth; pctx.lineCap = 'round'; pctx.shadowColor = brushColor; pctx.shadowBlur = 5;
    if (!symmetry8) { pctx.beginPath(); pctx.moveTo(p0.x, p0.y); pctx.lineTo(p1.x, p1.y); pctx.stroke(); }
    else {
      const cx = 320, cy = 240;
      for (let i = 0; i < 8; i++) { pctx.save(); pctx.translate(cx, cy); pctx.rotate((i * Math.PI) / 4); pctx.beginPath(); pctx.moveTo(p0.x - cx, p0.y - cy); pctx.lineTo(p1.x - cx, p1.y - cy); pctx.stroke(); pctx.restore(); }
    }
    pctx.restore();
  };

  paintCanvas.addEventListener('pointerdown', (e) => { paintCanvas.setPointerCapture(e.pointerId); painting = true; lastPt = getCanvasPt(e); strokeSeg(lastPt, lastPt); });
  paintCanvas.addEventListener('pointermove', (e) => { if (!painting) return; const pt = getCanvasPt(e); strokeSeg(lastPt, pt); lastPt = pt; });
  const stopPaint = () => { painting = false; lastPt = null; };
  paintCanvas.addEventListener('pointerup', stopPaint); paintCanvas.addEventListener('pointercancel', stopPaint);

  document.querySelectorAll('.lw-swatch').forEach((sw) => {
    sw.addEventListener('click', () => {
      brushColor = sw.dataset.color || '#f2cc6e';
      document.querySelectorAll('.lw-swatch').forEach((b) => b.classList.toggle('active', b === sw));
    });
  });
  const symBtn = document.getElementById('lw-sym-btn');
  symBtn.addEventListener('click', () => {
    symmetry8 = !symmetry8; symBtn.setAttribute('aria-pressed', String(symmetry8));
    symBtn.textContent = symmetry8 ? '❄️ تماثل زخرفي 8×: مفعّل' : '🖌️ رسم حر عادي';
  });
  document.getElementById('lw-stamp-btn').addEventListener('click', () => {
    pctx.save(); pctx.textAlign = 'center'; pctx.direction = 'rtl'; pctx.fillStyle = '#fbf0cf'; pctx.shadowColor = '#e8c268'; pctx.shadowBlur = 12;
    pctx.font = 'bold 36px Amiri, Georgia, serif'; pctx.fillText('كل عامٍ وأنتِ فنانة متألقة يا يمنى • 19 ✦', 320, 245);
    pctx.font = '600 20px Cairo, sans-serif'; pctx.fillStyle = '#e8c268'; pctx.fillText(`إهداء من ${activeRole.displayFullAr} • متحف اللوفر`, 320, 425);
    pctx.restore(); audio.chime();
  });
  document.getElementById('lw-clear-btn').addEventListener('click', resetPaintCanvas);
  document.getElementById('lw-hang-btn').addEventListener('click', () => {
    world.updateCustomLouvreWallPainting(paintCanvas);
    try { window.localStorage.setItem(WALL_PAINTING_KEY, paintCanvas.toDataURL('image/png')); } catch { /* ignore */ }
    markDiscovered('easel');
    closeModal('studio-wall-modal');
    world.teleportToWaypoint(6, false);
    audio.chime();
    showToast('🖼️ تم تعليق لوحتك مباشرة داخل الإطار الذهبي على جدار متحف اللوفر أمامك. ✨', 5600);
  });
  document.getElementById('lw-download-btn').addEventListener('click', () => {
    const a = document.createElement('a'); a.download = 'Yomna-Louvre-Masterpiece.png'; a.href = paintCanvas.toDataURL('image/png'); a.click();
  });

  // ==================== LIVE PARIS EVENTS & WEATHER ====================
  const triggerSkyLanternsEvent = () => {
    toolsTray.classList.remove('open'); toolsTray.setAttribute('aria-hidden', 'true');
    if (world.playerPos.z < 2) world.teleportToWaypoint(4, false);
    world.targetPitch = 0.24;
    world.releaseBirthdayLanterns();
    audio.sparkleChime();
    showToast('🏮 تم إطلاق 19 فانوس أمنيات مضيئاً في سماء باريس احتفاءً بعام يمنى الـ 19. ✨', 6000);
  };

  const triggerEiffelSparkleEvent = () => {
    toolsTray.classList.remove('open'); toolsTray.setAttribute('aria-hidden', 'true');
    if (world.playerPos.z < 12) world.teleportToWaypoint(3, false);
    world.targetYaw = 0.56; world.targetPitch = 0.2;
    world.triggerEiffelSparkleShow();
    audio.sparkleChime();
    showToast('✨ بدأ عرض أضواء برج إيفل المتلألئ مع الكشّاف الدوّار وفوانيس باريس الذهبية.', 6000);
  };

  const triggerCoinFountain = () => {
    world.tossWishingCoin(); audio.coinSplash(); markDiscovered('fountain');
    const msg = FOUNTAIN_WISHES[wishIdx % FOUNTAIN_WISHES.length]; wishIdx++;
    showToast(msg, 5600); audio.speakAr(msg);
  };

  const toggleUV = () => {
    const next = !world.uvMode; world.setUVMode(next);
    uvTopBtn.setAttribute('aria-pressed', String(next)); uvTrayBtn.setAttribute('aria-pressed', String(next));
    uvTrayBtn.textContent = next ? '🔍 عدسة أسرار اللوحات (UV): شغّالة ✨' : '🔍 عدسة أسرار اللوحات (UV): متوقفة';
    audio.chime();
    showToast(next ? '🔍 تم تشغيل عدسة الأسرار. انظر للوحات الأربع داخل القاعة لقراءة الرسائل الخفية.' : 'تم إغلاق عدسة الأسرار والعودة لإضاءة المتحف الطبيعية.', 4600);
  };
  uvTopBtn.addEventListener('click', toggleUV); uvTrayBtn.addEventListener('click', toggleUV);

  const toggleZoom = () => { world.setZoom(!world.zoomed); audio.chime(); };
  if (zoomTopBtn) zoomTopBtn.addEventListener('click', toggleZoom);
  if (zoomTrayBtn) zoomTrayBtn.addEventListener('click', toggleZoom);

  // ==================== MUSEUM CURATOR GUIDE MODAL ====================
  const wmTitle = document.getElementById('wm-title');
  const wmLead = document.getElementById('wm-personal-lead');
  const refreshWelcomeCopy = () => {
    const anas = isAnasActive();
    wmTitle.textContent = activeRole.isHonoree
      ? 'أهلاً بكِ يا يمنى في مدينة باريس ومتحف اللوفر التفاعلي 3D ✨'
      : `أهلاً بك يا ${activeRole.nameAr} في جولة باريس ومتحف اللوفر لعيد ميلاد يمنى الـ 19 ✨`;
    wmLead.textContent = activeRole.heroNoteAr;
    document.getElementById('wm-guide-icon').textContent = anas ? '🧭' : '🐾';
    document.getElementById('wm-guide-heading').textContent = anas
      ? 'مرشدك السياحي الخاص: أنس حبيب'
      : 'جولة شرح حقيقية مع القطة بوبس';
    document.getElementById('wm-guide-desc').textContent = anas
      ? 'خصصنا لك يا يوسف المرشد السياحي «أنس حبيب» ليرافقك خطوة بخطوة بطول 500 متر في باريس، ويتوقف أمام كل معلم ليشرحه لك وينتظرك حتى تضغط «أكمل الجولة».'
      : 'في كل محطة تتوقف القطة بوبس أمامك وتلتفت إليك لتشرح لك القصة والمعلومة وتنتظرك حتى تستكشف المكان وتضغط «أكمل الجولة للمحطة التالية».';
    document.getElementById('wm-start-auto-label').textContent = anas
      ? '🧭 ابدأ الجولة السياحية مع أنس حبيب الآن ✦'
      : '🐾 ابدأ الجولة السياحية مع القطة بوبس الآن ✦';
  };
  document.getElementById('wm-start-auto-btn').addEventListener('click', () => { closeModal('welcome-museum-modal'); world.startGuidedTour(); if (isAnasActive()) audio.chime(); else audio.meow(); });
  document.getElementById('wm-start-cab-btn').addEventListener('click', () => { closeModal('welcome-museum-modal'); world.startBoulevardCabRide(); audio.chime(); });
  document.getElementById('wm-start-free-btn').addEventListener('click', () => { closeModal('welcome-museum-modal'); renderTourStoryCard(world.currentWaypointIdx, 'explaining'); if (isAnasActive()) audio.chime(); else audio.meow(); });

  // ==================== INTERACTION ROUTER ====================
  function openArtifactModal(chapterId) {
    const ch = SITE_CONFIG.chapters.find((c) => c.id === chapterId);
    if (!ch) return;
    markDiscovered(chapterId); audio.chime();
    document.getElementById('art-kicker').textContent = `التحفة ${ch.number} • متحف اللوفر — ${ch.eraAr}`;
    document.getElementById('art-title-ar').textContent = ch.titleAr;
    document.getElementById('art-title-en').textContent = ch.titleEn;
    const img = document.getElementById('art-img'); img.src = ch.image; img.alt = ch.captionAr;
    document.getElementById('art-caption').textContent = ch.captionAr;
    document.getElementById('art-story').textContent = ch.storyAr;
    document.getElementById('art-quote').textContent = ch.quoteAr;
    audio.speakAr(`${ch.titleAr}. ${ch.storyAr}`);

    const extra = document.getElementById('art-extra-slot');
    extra.replaceChildren();
    if (ch.id === 'thanaweya' && ch.encouragementBodyAr) {
      const box = el('div', 'art-extra-card');
      box.append(el('strong', '', '💌 رسالة الطمأنينة لسنة تالتة ثانوي (90% من طريق الحلم): '), el('p', '', ch.encouragementBodyAr));
      extra.appendChild(box);
    } else if (ch.id === 'fine-arts') {
      const box = el('div', 'art-extra-card');
      box.append(el('strong', '', `✦ بطاقة الحلم القادم: ${SITE_CONFIG.dreamPass.institutionAr}`), el('p', '', `${SITE_CONFIG.artistName} — ${SITE_CONFIG.dreamPass.statusAr} (${SITE_CONFIG.dreamPass.serialNo})`));
      extra.appendChild(box);
    } else if (ch.id === 'passion') {
      const btn = el('button', 'btn-royal-gold compact', '🎨 ارسم وعلّق لوحتك على جدار اللوفر الآن');
      btn.type = 'button'; btn.addEventListener('click', () => { closeModal('artifact-modal'); openModal('studio-wall-modal'); });
      extra.appendChild(btn);
    }
    openModal('artifact-modal');
  }

  // Live Firebase Vault Modal
  const vmInbox = document.getElementById('vm-yomna-inbox'), vmSender = document.getElementById('vm-sender-box');
  const vmTitle = document.getElementById('vm-title'), vmSub = document.getElementById('vm-sub');
  const vmSenderName = document.getElementById('vm-sender-name'), vmPresets = document.getElementById('vm-presets');
  const vmTextarea = document.getElementById('vm-textarea'), vmSendBtn = document.getElementById('vm-send-btn');
  const vmDelivery = document.getElementById('vm-delivery'), vmDeliveryMsg = document.getElementById('vm-delivery-msg');
  const vmWaLink = document.getElementById('vm-wa-link'), vmCopyBtn = document.getElementById('vm-copy-btn');
  const vmPngBtn = document.getElementById('vm-png-btn'), vmCloudStatus = document.getElementById('vm-cloud-status');
  let latestGiftUrl = '';

  function renderVaultModal() {
    vmDelivery.classList.remove('open');
    if (activeRole.isHonoree) {
      vmInbox.classList.remove('panel-hidden'); vmSender.classList.add('panel-hidden');
      vmTitle.textContent = 'صندوق رسائل عائلتكِ داخل متحف اللوفر 💌';
      vmSub.textContent = 'كل رسالة يرسلها أفراد عائلتكِ تصل فوراً سحابياً داخل هذا الصندوق الملكي.';
      vmInbox.replaceChildren(...familyRoles.map((r) => {
        const entry = vaultStore.getEntry(r), card = el('article', 'vm-env-card');
        card.append(el('strong', '', `${r.displayFullAr}${entry.isCustom ? ' ✦ (رسالة جديدة وصلت لكِ)' : ''}`), el('p', '', entry.message));
        return card;
      }));
    } else {
      vmInbox.classList.add('panel-hidden'); vmSender.classList.remove('panel-hidden');
      vmTitle.textContent = 'أرسل رسالتك لصندوق يمنى داخل متحف اللوفر 💌';
      vmSub.textContent = 'اكتب تهنئتك وتشجيعك ليمنى لتصل فوراً سحابياً إلى صندوقها الخاص في المتحف.';
      vmSenderName.textContent = activeRole.displayFullAr;
      vmTextarea.value = vaultStore.getEntry(activeRole).message;
      vmPresets.replaceChildren(...(activeRole.cardPresets || []).map((txt) => {
        const b = el('button', 'vm-preset-btn', txt); b.type = 'button';
        b.addEventListener('click', () => { vmTextarea.value = txt; });
        return b;
      }));
    }
  }

  vmSendBtn.addEventListener('click', async () => {
    if (activeRole.isHonoree) return;
    const msg = sanitizeText(vmTextarea.value, 220);
    if (msg.length < 3) return;
    vmSendBtn.disabled = true; vaultStore.save(activeRole.id, msg);
    const res = await cloudVault.publishWish(activeRole.id, msg);
    vmSendBtn.disabled = false; audio.chime();
    vmDeliveryMsg.textContent = res.ok
      ? '✅ وصلت رسالتك سحابياً في نفس اللحظة إلى صندوق يمنى داخل متحف اللوفر.'
      : '✅ تم حفظ رسالتك في الصندوق — يمكنك أيضاً مشاركتها على واتساب:';
    const token = encodeGiftToken(activeRole.id, msg);
    latestGiftUrl = `${window.location.origin}${window.location.pathname}?gift=${encodeURIComponent(token)}`;
    vmWaLink.href = `https://wa.me/?text=${encodeURIComponent(`🎁 رسالة تهنئة خاصة إلى يمنى داخل متحف اللوفر 3D من ${activeRole.displayFullAr}:\n${latestGiftUrl}`)}`;
    vmDelivery.classList.add('open'); vmDelivery.setAttribute('aria-hidden', 'false');
  });

  vmCopyBtn.addEventListener('click', async () => {
    if (!latestGiftUrl) return;
    try { await navigator.clipboard.writeText(latestGiftUrl); vmCopyBtn.textContent = '✓ تم النسخ'; } catch { /* ignore */ }
  });

  vmPngBtn.addEventListener('click', () => {
    const c = document.createElement('canvas'); c.width = 900; c.height = 520;
    const ctx = c.getContext('2d'); ctx.fillStyle = '#150f0a'; ctx.fillRect(0, 0, 900, 520);
    ctx.strokeStyle = '#e8c268'; ctx.lineWidth = 3; ctx.strokeRect(22, 22, 856, 476);
    ctx.textAlign = 'center'; ctx.direction = 'rtl'; ctx.fillStyle = '#fbf0cf'; ctx.font = '700 32px Amiri, serif';
    ctx.fillText(`رسالة من متحف اللوفر إلى الفنانة ${SITE_CONFIG.artistName}`, 450, 110);
    ctx.fillStyle = '#f8f1e4'; ctx.font = '500 24px Cairo, sans-serif'; ctx.fillText(sanitizeText(vmTextarea.value, 110), 450, 260);
    ctx.fillStyle = '#e8c268'; ctx.font = '700 24px Amiri, serif'; ctx.fillText(`بكل فخر ودعاء — ${activeRole.displayFullAr}`, 450, 420);
    const a = document.createElement('a'); a.download = `Louvre-Wish-${activeRole.id}-Yomna.png`; a.href = c.toDataURL('image/png'); a.click();
  });

  cloudVault.subscribeAll(
    ({ senderId, message }) => { vaultStore.save(senderId, message); renderVaultModal(); },
    (connected) => {
      vmCloudStatus.textContent = connected
        ? '🟢 متصل سحابياً الآن (Firebase Cloud Firestore) — الرسائل تظهر لحظياً في صندوق يمنى.'
        : '🔒 وضع الحفظ المحلي + رابط واتساب جاهز.';
    }
  );

  // Manifesto Modal
  const fm = SITE_CONFIG.finalManifesto;
  document.getElementById('mm-man-title').textContent = fm.titleAr;
  document.getElementById('mm-man-quote').textContent = fm.quoteAr;
  document.getElementById('mm-man-pillars').replaceChildren(...fm.pillars.map((p) => {
    const card = el('article', 'mm-pillar'); card.append(el('span', '', p.icon), el('h3', '', p.titleAr), el('p', '', p.descAr)); return card;
  }));
  let capIdx = 0;
  const renderCap = () => { document.getElementById('mm-cap-text').textContent = `«${fm.peaceCapsules[capIdx]}»`; document.getElementById('mm-cap-count').textContent = `${capIdx + 1} / ${fm.peaceCapsules.length}`; };
  renderCap();
  document.getElementById('mm-cap-next').addEventListener('click', () => { capIdx = (capIdx + 1) % fm.peaceCapsules.length; renderCap(); audio.chime(); });
  document.getElementById('mm-pledge-btn').addEventListener('click', (e) => {
    const btn = e.currentTarget, on = btn.getAttribute('aria-pressed') !== 'true'; btn.setAttribute('aria-pressed', String(on));
    document.getElementById('mm-pledge-msg').textContent = on ? '✦ شكراً لك. الدعم الهادئ والإيمان بالشغف هما أجمل هدية ليمنى. ✦' : '';
    if (on) audio.chime();
  });

  // Cake Celebration + Real Microphone Blow Detector
  let candlesBlown = false;
  const cmStatus = document.getElementById('cm-status'), cmBlowLabel = document.getElementById('cm-blow-label'), cmWishBox = document.getElementById('cm-wish-box');
  document.getElementById('cm-wish-title').textContent = SITE_CONFIG.finale.wishHeadingAr;
  document.getElementById('cm-wish-body').textContent = SITE_CONFIG.finale.wishMessageAr;
  document.getElementById('cm-family-sign').textContent = SITE_CONFIG.familySignOffAr;

  const setBlownState = (blown) => {
    candlesBlown = blown; world.triggerCakeCelebration(blown);
    if (blown) { audio.chime(); cmStatus.textContent = SITE_CONFIG.finale.candlesBlownStatusAr; cmBlowLabel.textContent = SITE_CONFIG.finale.buttonAfterAr; cmWishBox.classList.add('open'); cmWishBox.setAttribute('aria-hidden', 'false'); }
    else { cmStatus.textContent = SITE_CONFIG.finale.candlesLitStatusAr; cmBlowLabel.textContent = SITE_CONFIG.finale.buttonAr; }
  };
  document.getElementById('cm-blow-btn').addEventListener('click', () => setBlownState(!candlesBlown));
  document.getElementById('cm-fw-btn').addEventListener('click', () => { world.launchFireworks(); audio.chime(); });
  document.getElementById('cm-cert-btn').addEventListener('click', downloadCertificatePng);

  const micBtn = document.getElementById('cm-mic-btn'), micLbl = document.getElementById('cm-mic-label');
  let micStream = null, micCtx = null, micRaf = 0, micOn = false;
  const stopMic = () => {
    micOn = false; if (micRaf) cancelAnimationFrame(micRaf);
    if (micStream) { micStream.getTracks().forEach((t) => t.stop()); micStream = null; }
    if (micCtx) { micCtx.close().catch(() => {}); micCtx = null; }
    world.setCandleWind(0); micBtn.setAttribute('aria-pressed', 'false'); micLbl.textContent = '🎙️ أو انفخي في المايكروفون لإطفاء الشمعتين';
  };
  micBtn.addEventListener('click', async () => {
    if (micOn) { stopMic(); return; }
    try {
      micStream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const Ctx = window.AudioContext || window.webkitAudioContext; micCtx = new Ctx();
      const an = micCtx.createAnalyser(); an.fftSize = 256; micCtx.createMediaStreamSource(micStream).connect(an);
      const data = new Uint8Array(an.frequencyBinCount); micOn = true; let charge = 0;
      micBtn.setAttribute('aria-pressed', 'true'); micLbl.textContent = '💨 انفخي الآن نحو المايكروفون (إلغاء)';
      const loop = () => {
        if (!micOn) return; an.getByteFrequencyData(data);
        let sum = 0; for (let i = 1; i <= 18; i++) sum += data[i];
        const lvl = Math.min(1, Math.max(0, (sum / 18 - 36) / 95)); world.setCandleWind(lvl);
        charge = lvl > 0.32 ? Math.min(100, charge + lvl * 5.2) : Math.max(0, charge - 1.4);
        if (charge >= 100) { stopMic(); setBlownState(true); return; }
        micRaf = requestAnimationFrame(loop);
      };
      loop();
    } catch { stopMic(); }
  });

  function handleInteract(id) {
    if (typeof id === 'string' && id.startsWith('seal-')) {
      const collected = world.collectHiddenSeal(id);
      if (collected) {
        foundSeals.add(collected.id); renderProgressSummaries(); audio.sparkleChime();
        if (foundSeals.size === HIDDEN_SEALS_DATA.length) {
          world.releaseBirthdayLanterns(); world.launchFireworks();
          showToast(`🏆 نلتِ «وسام أمينة متحف اللوفر الشرفي» بعد جمع الأختام الذهبية الخمسة بالكامل. «${collected.quoteAr}»`, 7000);
        } else {
          showToast(`🏅 تم جمع ${collected.labelAr} (${foundSeals.size} / ${HIDDEN_SEALS_DATA.length}): «${collected.quoteAr}»`, 6000);
        }
        audio.speakAr(collected.quoteAr);
      }
    } else if (['childhood', 'passion', 'thanaweya', 'fine-arts'].includes(id)) openArtifactModal(id);
    else if (id === 'fountain') triggerCoinFountain();
    else if (id === 'easel') { audio.chime(); openModal('studio-wall-modal'); }
    else if (id === 'vault') { markDiscovered('vault'); renderVaultModal(); audio.chime(); openModal('vault-modal'); }
    else if (id === 'manifesto') { audio.chime(); audio.speakAr(fm.quoteAr); openModal('manifesto-modal'); }
    else if (id === 'cake') { audio.chime(); openModal('cake-modal'); }
  }
  proximityBtn.addEventListener('click', () => { if (activeInteractId) handleInteract(activeInteractId); });

  // ==================== PRO LIVE EVENTS, WEATHER & TOOLS TRAY ====================
  const timeModes = ['sunset', 'day', 'night', 'gallery'];
  let timeIdx = 0;
  timeBtn.addEventListener('click', () => {
    timeIdx = (timeIdx + 1) % timeModes.length;
    const mode = timeModes[timeIdx]; world.setTimeOfDay(mode); audio.chime();
    const msgs = { sunset: '🌇 إضاءة غروب باريس الذهبي.', day: '☀️ إضاءة نهار باريس الصافي.', night: '🌙 ليل باريس الساحر مع القمر والنجوم وكشّاف برج إيفل.', gallery: '🏛️ أجواء الأتيليه الملكي الدافئة.' };
    showToast(msgs[mode] || msgs.sunset, 3400);
  });

  document.getElementById('gt-tools-btn').addEventListener('click', (e) => {
    e.stopPropagation();
    const open = toolsTray.classList.toggle('open'); toolsTray.setAttribute('aria-hidden', String(!open));
  });
  document.addEventListener('click', (e) => {
    if (!toolsTray.contains(e.target) && !e.target.closest('#gt-tools-btn')) {
      toolsTray.classList.remove('open'); toolsTray.setAttribute('aria-hidden', 'true');
    }
  });

  document.getElementById('gt-cab-btn').addEventListener('click', () => {
    toolsTray.classList.remove('open'); toolsTray.setAttribute('aria-hidden', 'true');
    world.startBoulevardCabRide(); audio.chime();
  });
  document.getElementById('gt-lanterns-btn').addEventListener('click', triggerSkyLanternsEvent);
  document.getElementById('gt-sparkle-btn').addEventListener('click', triggerEiffelSparkleEvent);
  document.getElementById('gt-paint-wall-btn').addEventListener('click', () => openModal('studio-wall-modal'));
  document.getElementById('gt-drone-btn').addEventListener('click', () => {
    toolsTray.classList.remove('open'); toolsTray.setAttribute('aria-hidden', 'true');
    world.startDroneTour(); audio.chime();
    showToast('🚁 جولة الدرون السينمائية فوق مدينة باريس ومتحف اللوفر.', 4500);
  });
  document.getElementById('gt-fountain-btn').addEventListener('click', () => {
    toolsTray.classList.remove('open'); toolsTray.setAttribute('aria-hidden', 'true');
    world.teleportToWaypoint(4, false); setTimeout(triggerCoinFountain, 320);
  });

  const weatherModes = ['clear', 'rain', 'petals'];
  let wIdx = 0;
  document.getElementById('gt-weather-btn').addEventListener('click', () => {
    wIdx = (wIdx + 1) % weatherModes.length;
    const mode = weatherModes[wIdx]; world.setWeather(mode); audio.chime();
    const msgs = { clear: '☀️ عادت أجواء باريس الصافية مع أوراق الخريف الذهبية.', rain: '🌧️ هطل مطر باريس الهادئ مع لمعان الأسفلت والشارع.', petals: '🌸 تتساقط بتلات ربيع باريس الوردية على الشانزليزيه.' };
    showToast(msgs[mode], 3800);
  });

  const voiceBtn = document.getElementById('gt-voice-btn');
  voiceBtn.addEventListener('click', () => {
    audio.voiceEnabled = !audio.voiceEnabled;
    voiceBtn.setAttribute('aria-pressed', String(audio.voiceEnabled));
    voiceBtn.textContent = audio.voiceEnabled ? '🗣️ الدليل الصوتي العربي: شغّال' : '🗣️ الدليل الصوتي العربي: متوقف';
    if (audio.voiceEnabled) audio.speakAr('تم تشغيل الدليل الصوتي لجولة باريس ومتحف اللوفر.');
    else if ('speechSynthesis' in window) window.speechSynthesis.cancel();
  });

  const audioBtn = document.getElementById('gt-audio-btn');
  audioBtn.addEventListener('click', () => {
    const on = audio.toggleMusic(); audioBtn.setAttribute('aria-pressed', String(on));
    audioBtn.textContent = on ? '🔊 موسيقى باريس: شغّالة' : '🔇 موسيقى باريس: متوقفة';
  });

  const qualityModes = [
    { id: 'smooth60', label: '⚡ الأداء: سلس 60FPS (افتراضي)' },
    { id: 'eco', label: '🚀 الأداء: خفيف جداً للأجهزة الاقتصادية' },
    { id: 'ultra', label: '💎 الأداء: فائق HDR Bloom' },
  ];
  let qIdx = 0;
  const qualityBtn = document.getElementById('gt-quality-btn');
  qualityBtn.addEventListener('click', () => {
    qIdx = (qIdx + 1) % qualityModes.length; world.setQualityMode(qualityModes[qIdx].id);
    qualityBtn.textContent = qualityModes[qIdx].label; showToast(`تم تفعيل ${qualityModes[qIdx].label}`, 2600);
  });

  const filterBtn = document.getElementById('cinema-filter-btn');
  filterBtn.addEventListener('click', () => {
    filterIdx = (filterIdx + 1) % PHOTO_FILTERS.length;
    filterBtn.textContent = PHOTO_FILTERS[filterIdx].label;
    canvasEl.style.filter = PHOTO_FILTERS[filterIdx].css;
  });

  document.getElementById('gt-cinema-btn').addEventListener('click', () => {
    toolsTray.classList.remove('open'); toolsTray.setAttribute('aria-hidden', 'true');
    document.body.classList.add('cinema-mode'); document.getElementById('cinema-exit-bar').setAttribute('aria-hidden', 'false');
  });
  document.getElementById('cinema-exit-btn').addEventListener('click', () => {
    world.stopDroneTour(); document.body.classList.remove('cinema-mode');
    document.getElementById('cinema-exit-bar').setAttribute('aria-hidden', 'true');
  });
  document.getElementById('cinema-snap-btn').addEventListener('click', () => { world.captureLouvrePostcard(PHOTO_FILTERS[filterIdx].css); audio.chime(); });
  document.getElementById('gt-welcome-btn').addEventListener('click', () => { refreshWelcomeCopy(); openModal('welcome-museum-modal'); });

  // ==================== JOYSTICK, TRUE PAUSE-AND-EXPLAIN TOUR CARD & 12-STATION MAP ====================
  const joyBase = document.querySelector('.joystick-base'), joyKnob = document.getElementById('joystick-knob');
  let joyActive = false, joyOrigin = { x: 0, y: 0 };
  const updateJoystick = (cx, cy) => {
    const maxR = 32; let dx = cx - joyOrigin.x, dy = cy - joyOrigin.y;
    const dist = Math.hypot(dx, dy); if (dist > maxR) { dx = (dx / dist) * maxR; dy = (dy / dist) * maxR; }
    joyKnob.style.transform = `translate3d(${dx.toFixed(1)}px, ${dy.toFixed(1)}px, 0)`;
    world.setJoystickInput(-dy / maxR, dx / maxR);
  };
  joyBase.addEventListener('pointerdown', (e) => {
    e.stopPropagation(); joyBase.setPointerCapture(e.pointerId); audio.ensure();
    const r = joyBase.getBoundingClientRect(); joyOrigin = { x: r.left + r.width / 2, y: r.top + r.height / 2 };
    joyActive = true; updateJoystick(e.clientX, e.clientY);
  });
  joyBase.addEventListener('pointermove', (e) => { if (!joyActive) return; e.stopPropagation(); updateJoystick(e.clientX, e.clientY); });
  const endJoy = () => { if (!joyActive) return; joyActive = false; joyKnob.style.transform = 'translate3d(0, 0, 0)'; world.setJoystickInput(0, 0); };
  joyBase.addEventListener('pointerup', endJoy); joyBase.addEventListener('pointercancel', endJoy);

  document.getElementById('cat-fold-btn').addEventListener('click', () => catGuideCard.classList.add('folded'));
  document.getElementById('cat-reopen-btn').addEventListener('click', () => catGuideCard.classList.remove('folded'));

  // Primary Tour Button: Pause-and-Explain State Machine
  tourMainBtn.addEventListener('click', () => {
    if (world.guidePhase === 'walking') {
      world.pauseGuidedTour();
    } else if (world.guidePhase === 'explaining') {
      if (world.currentWaypointIdx < STORY_WAYPOINTS.length - 1) {
        world.advanceGuidedTour();
        if (isAnasActive()) audio.chime(); else audio.meow();
      } else {
        world.teleportToWaypoint(0, true);
      }
    } else {
      world.startGuidedTour();
      if (isAnasActive()) audio.chime(); else audio.meow();
    }
  });

  tourSlideBtn.addEventListener('click', () => {
    const wp = STORY_WAYPOINTS[world.currentWaypointIdx];
    const slides = getSlidesForWaypoint(wp);
    if (slides.length > 1) {
      currentSlideIdx = (currentSlideIdx + 1) % slides.length;
      renderTourStoryCard(world.currentWaypointIdx);
      audio.speakAr(slides[currentSlideIdx]);
    }
  });

  tourExploreBtn.addEventListener('click', () => {
    const targetId = tourExploreBtn.dataset.interact;
    if (targetId) handleInteract(targetId);
  });

  tourSpeedBtn.addEventListener('click', () => {
    const next = !world.cruiseFast; world.setCruiseFast(next);
    tourSpeedBtn.setAttribute('aria-pressed', String(next));
    tourSpeedBtn.textContent = next ? '🚀 سريع مفعّل' : '⚡ سريع';
  });

  document.getElementById('cat-lick-btn').addEventListener('click', () => {
    world.triggerCatAction('groom');
    catGuideText.textContent = 'لحظة هادئة من بوبس للعناية بالفرو الذهبي قبل استكمال جولة باريس ومتحف اللوفر. 👅🐾';
  });
  document.getElementById('cat-play-btn').addEventListener('click', () => {
    world.triggerCatAction('play'); audio.meow();
    catGuideText.textContent = 'استراحة لطيفة من بوبس مع كرة الخيط الذهبية الـ 3D ثم نكمل جولتنا معاً. 🧶✨';
  });
  document.getElementById('anas-wave-btn').addEventListener('click', () => {
    audio.chime();
    catGuideText.textContent = 'منوّر باريس يا يوسف. خليك معايا لحد ما نوصل تورتة يمنى الـ 19 تحت قبة اللوفر. 👋🧭';
    audio.speakAr(catGuideText.textContent);
  });

  const mapGrid = document.getElementById('map-stations-grid');
  const mapBtns = STORY_WAYPOINTS.map((wp, idx) => {
    const b = el('button', `map-wp-btn${idx === 0 ? ' active' : ''}`, `${idx + 1}. ${wp.labelAr}`);
    b.type = 'button';
    b.addEventListener('click', () => { world.teleportToWaypoint(idx, true); closeModal('map-modal'); if (isAnasActive()) audio.chime(); else audio.meow(); });
    return b;
  });
  mapGrid.replaceChildren(...mapBtns);
  function refreshMapActive(activeIdx) { mapBtns.forEach((b, i) => b.classList.toggle('active', i === activeIdx)); }
  document.getElementById('gt-map-btn').addEventListener('click', () => openModal('map-modal'));

  // ==================== 2-STEP RECEPTION PORTAL + AUTOMATIC GUIDE SWAP FOR يوسف ====================
  const portal = document.getElementById('louvre-portal');
  const shell = document.getElementById('lp-shell');
  const stepSelect = document.getElementById('portal-step-select');
  const stepLetter = document.getElementById('portal-step-letter');
  document.getElementById('lp-title').textContent = SITE_CONFIG.reception.titleAr;
  document.getElementById('lp-subtitle-ar').textContent = SITE_CONFIG.reception.subtitleAr;

  const syncRoleAndGuide = (r) => {
    activeRole = r;
    shell.style.setProperty('--portal-accent', r.accentHex || '#e8c268');
    visitorBtn.textContent = r.badgeAr;
    // Automatically swap 3D guide: أنس حبيب exclusively for يوسف, القطة بوبس for everyone else!
    world.setActiveGuide(r.id === 'youssef' ? 'anas' : 'bobs');
    populatePersonalLetter(r);
    renderVaultModal();
    refreshWelcomeCopy();
    renderTourStoryCard(world.currentWaypointIdx);
  };

  const populatePersonalLetter = (r) => {
    const crestHost = document.getElementById('letter-crest-icon');
    crestHost.replaceChildren(createRoleCrestSvg(r.icon));
    document.getElementById('letter-role-pill').textContent = r.badgeAr;
    document.getElementById('letter-tag-en').textContent = r.tagEn;
    document.getElementById('letter-title-ar').textContent = r.letterTitleAr;
    document.getElementById('letter-lead-ar').textContent = r.letterLeadAr;
    document.getElementById('letter-body-ar').textContent = r.letterBodyAr;
    document.getElementById('lp-enter-btn-ar').textContent = r.enterBtnAr || 'افتح بوابة باريس ومتحف اللوفر 3D ←';
  };

  const rolesGrid = document.getElementById('lp-roles-grid');
  const roleBtns = roles.map((r, idx) => {
    const b = el('button', `lp-role-btn${r.isHonoree ? ' honoree' : ''}${idx === 0 ? ' selected' : ''}`);
    b.type = 'button'; b.style.setProperty('--role-accent', r.accentHex || '#e8c268');
    const crest = el('div', 'role-crest-circle'); crest.appendChild(createRoleCrestSvg(r.icon));
    const txtWrap = el('div', 'role-txt-wrap'); txtWrap.append(el('strong', '', r.nameAr), el('span', '', ` (${r.relationAr})`));
    b.append(crest, txtWrap, el('small', '', r.tagEn));
    b.addEventListener('click', () => {
      roleBtns.forEach((btn, i) => btn.classList.toggle('selected', i === idx));
      syncRoleAndGuide(r);
    });
    return b;
  });
  rolesGrid.replaceChildren(...roleBtns);
  syncRoleAndGuide(activeRole);

  document.getElementById('lp-continue-btn').addEventListener('click', () => {
    populatePersonalLetter(activeRole);
    stepSelect.classList.remove('active'); stepLetter.classList.add('active'); stepLetter.setAttribute('aria-hidden', 'false');
    audio.chime();
  });

  document.getElementById('lp-back-btn').addEventListener('click', () => {
    stepLetter.classList.remove('active'); stepLetter.setAttribute('aria-hidden', 'true'); stepSelect.classList.add('active');
  });

  document.getElementById('lp-enter-btn').addEventListener('click', () => {
    portal.classList.add('hidden');
    document.body.classList.remove('portal-open');
    world.setPortalPaused(false);
    audio.chime();
    if (!shownWelcomeOnce) {
      shownWelcomeOnce = true; refreshWelcomeCopy(); openModal('welcome-museum-modal');
    } else {
      renderTourStoryCard(world.currentWaypointIdx, 'explaining');
      if (isAnasActive()) showToast('🧭 مرشدك السياحي الخاص «أنس حبيب» جاهز لمرافقتك الآن يا يوسف.', 4800);
      else window.setTimeout(() => audio.meow(), 350);
    }
  });

  visitorBtn.addEventListener('click', () => {
    stepLetter.classList.remove('active'); stepSelect.classList.add('active');
    portal.classList.remove('hidden'); document.body.classList.add('portal-open');
    world.setPortalPaused(true); world.pauseGuidedTour(); world.stopDroneTour(); world.stopBoulevardCabRide();
  });
}

bootstrap();
