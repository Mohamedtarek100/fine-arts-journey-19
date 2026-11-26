/**
 * =========================================================================
 *  PARIS & MUSÉE DU LOUVRE 3D STORY GAME CONTROLLER (louvre-app.js v20)
 *  - Museum Welcome Briefing Intro (Explains the Louvre Story Experience!)
 *  - Live Time-of-Day Switcher (Sunset / Sunny Day / Starry Paris Night)
 *  - Artifact Collector Progress Tracker (0 / 6 -> Louvre Explorer Medal!)
 *  - Optional Arabic Audio Museum Narrator + Ambient Parisian Synth + SFX
 *  - Zero-Lag Smart Performance Mode (Auto / Ultra / Smooth) + Cinema Photo Mode
 *  - Live Firebase Cloud Firestore Sync + Strict OWASP Zero-HTML-Injection
 *  - Designed & Developed by ENG / Mohamed Tarek • HEY Edition
 * =========================================================================
 */

import { SITE_CONFIG } from './config.js?v=16';
import { FamilyCloudVault } from './firebase-sync.js?v=16';
import { LouvreParisWorld3D, STORY_WAYPOINTS } from './louvre-world.js?v=21';

const VAULT_STORAGE_KEY = 'yomna_family_vault_xix_v1';
const ALLOWED_SENDERS = new Set(SITE_CONFIG.reception.roles.filter((r) => !r.isHonoree).map((r) => r.id));
const TRACKED_DISCOVERIES = ['childhood', 'passion', 'thanaweya', 'fine-arts', 'vault', 'manifesto'];

function el(tag, className, text) {
  const n = document.createElement(tag);
  if (className) n.className = className;
  if (text !== undefined && text !== null) n.textContent = String(text);
  return n;
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

/* ==================== AMBIENT PARISIAN AUDIO & ARABIC MUSEUM NARRATOR ==================== */
class LouvreAudio {
  constructor() {
    this.ctx = null;
    this.gain = null;
    this.playing = false;
    this.timer = null;
    this.step = 0;
    this.voiceEnabled = false;
    this.notes = [261.63, 329.63, 392.0, 493.88, 587.33, 493.88, 392.0, 329.63];
  }

  ensure() {
    if (!this.ctx) {
      const Ctx = window.AudioContext || window.webkitAudioContext;
      this.ctx = new Ctx();
      this.gain = this.ctx.createGain();
      this.gain.gain.value = 0.085;
      this.gain.connect(this.ctx.destination);
    }
    if (this.ctx.state === 'suspended') this.ctx.resume();
  }

  tone(freq, dur = 2.2, vol = 0.24) {
    if (!this.ctx || !this.gain) return;
    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const g = this.ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(freq, now);
    g.gain.setValueAtTime(0.0001, now);
    g.gain.exponentialRampToValueAtTime(vol, now + 0.06);
    g.gain.exponentialRampToValueAtTime(0.0001, now + dur);
    osc.connect(g);
    g.connect(this.gain);
    osc.start(now);
    osc.stop(now + dur + 0.04);
  }

  toggleMusic() {
    if (this.playing) {
      this.playing = false;
      clearInterval(this.timer);
      return false;
    }
    try {
      this.ensure();
      this.playing = true;
      const tick = () => {
        if (!this.playing) return;
        this.tone(this.notes[this.step % this.notes.length], 2.5, 0.22);
        this.step++;
      };
      tick();
      this.timer = window.setInterval(tick, 1450);
      return true;
    } catch { return false; }
  }

  speakAr(text) {
    if (!this.voiceEnabled || !('speechSynthesis' in window)) return;
    try {
      window.speechSynthesis.cancel();
      const u = new SpeechSynthesisUtterance(String(text).replace(/[^\u0600-\u06FF0-9a-zA-Z\s.,،!؟]/g, ' '));
      u.lang = 'ar-EG';
      u.rate = 0.96;
      window.speechSynthesis.speak(u);
    } catch { /* ignore */ }
  }

  chime() {
    try {
      this.ensure();
      [523.25, 659.25, 783.99, 1046.5].forEach((f, i) => setTimeout(() => this.tone(f, 2.0, 0.22), i * 85));
    } catch { /* ignore */ }
  }

  meow() {
    try {
      this.ensure();
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const g = this.ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(620, now);
      osc.frequency.exponentialRampToValueAtTime(910, now + 0.14);
      osc.frequency.exponentialRampToValueAtTime(520, now + 0.42);
      g.gain.setValueAtTime(0.0001, now);
      g.gain.exponentialRampToValueAtTime(0.14, now + 0.05);
      g.gain.exponentialRampToValueAtTime(0.0001, now + 0.44);
      osc.connect(g); g.connect(this.gain);
      osc.start(now); osc.stop(now + 0.46);
    } catch { /* ignore */ }
  }
}

/* ==================== SHARED LOCAL + CLOUD VAULT STORE ==================== */
class SharedFamilyVault {
  constructor() {
    this.messages = {};
    try {
      const raw = window.localStorage.getItem(VAULT_STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        for (const id of ALLOWED_SENDERS) {
          if (parsed?.[id]?.message) this.messages[id] = { message: sanitizeText(parsed[id].message, 220), custom: true };
        }
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
  const c = document.createElement('canvas');
  c.width = 1200; c.height = 840;
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
  a.download = 'Yomna-Louvre-19th-Certificate-HEY.png';
  a.href = c.toDataURL('image/png');
  a.click();
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
  const discovered = new Set();

  const questLabel = document.getElementById('quest-label');
  const discoveryCounter = document.getElementById('discovery-counter');
  const mapProgressSummary = document.getElementById('map-progress-summary');
  const catGuideText = document.getElementById('cat-guide-text');
  const catGuideCard = document.getElementById('cat-guide-card');
  const proximityBtn = document.getElementById('proximity-prompt');
  const proximityText = document.getElementById('proximity-text');
  const autoFollowBtn = document.getElementById('auto-follow-btn');
  const visitorBtn = document.getElementById('gt-visitor-btn');
  const timeBtn = document.getElementById('gt-time-btn');
  const toolsTray = document.getElementById('pro-tools-tray');
  const toastEl = document.getElementById('louvre-toast');

  let activeInteractId = null;
  let toastTimer = 0;

  const showToast = (msg, dur = 4800) => {
    toastEl.textContent = msg;
    toastEl.classList.add('show');
    toastEl.setAttribute('aria-hidden', 'false');
    clearTimeout(toastTimer);
    toastTimer = window.setTimeout(() => {
      toastEl.classList.remove('show');
      toastEl.setAttribute('aria-hidden', 'true');
    }, dur);
  };

  const markDiscovered = (id) => {
    if (!TRACKED_DISCOVERIES.includes(id) || discovered.has(id)) return;
    discovered.add(id);
    const n = discovered.size;
    discoveryCounter.textContent = n === 6 ? '🏆 وسام اللوفر 6/6' : `التحف: ${n} / 6`;
    mapProgressSummary.textContent = n === 6
      ? '🏆 مبروك! اكتشفت جميع تحف وكنوز متحف اللوفر الـ 6 بالكامل!'
      : `اكتشفت ${n} من 6 كنوز داخل متحف اللوفر — اضغط على أي محطة للتنقل الفوري!`;
    if (n === 6) {
      audio.chime();
      showToast('🏆 مبروك! حصلت على «وسام مستكشف متحف اللوفر» لاكتشاف كل التحف الـ 6! الآن اتجه لتورتة الـ 19 🎂', 6000);
    }
  };

  const openModal = (id) => {
    const m = document.getElementById(id);
    if (!m) return;
    toolsTray.classList.remove('open');
    toolsTray.setAttribute('aria-hidden', 'true');
    m.classList.add('open');
    m.setAttribute('aria-hidden', 'false');
    world.setAutoFollow(false);
  };
  const closeModal = (id) => {
    const m = document.getElementById(id);
    if (!m) return;
    m.classList.remove('open');
    m.setAttribute('aria-hidden', 'true');
  };
  const closeAllModals = () => {
    document.querySelectorAll('.museum-modal.open').forEach((m) => closeModal(m.id));
  };

  document.querySelectorAll('[data-close-modal]').forEach((b) => {
    b.addEventListener('click', () => closeModal(b.dataset.closeModal));
  });
  document.querySelectorAll('.museum-modal').forEach((m) => {
    m.addEventListener('click', (e) => { if (e.target === m) closeModal(m.id); });
  });
  window.addEventListener('keydown', (e) => { if (e.key === 'Escape') closeAllModals(); });

  // ==================== BUILD PHOTOREALISTIC 3D PARIS & LOUVRE WORLD ====================
  const world = new LouvreParisWorld3D(document.getElementById('louvre-canvas'), SITE_CONFIG, {
    onWaypointChange(idx, wp) {
      if (questLabel) questLabel.textContent = `🐾 اتبع القطة • ${idx + 1} / ${STORY_WAYPOINTS.length} — ${wp.labelAr}`;
      if (catGuideText) catGuideText.textContent = wp.tipAr;
      audio.speakAr(wp.tipAr);
      refreshMapActive(idx);
    },
    onProximityChange(item) {
      activeInteractId = item?.id || null;
      if (item) {
        proximityText.textContent = item.badgeAr;
        proximityBtn.classList.add('visible');
        proximityBtn.setAttribute('aria-hidden', 'false');
      } else {
        proximityBtn.classList.remove('visible');
        proximityBtn.setAttribute('aria-hidden', 'true');
      }
    },
    onAutoFollowChange(isAuto) {
      if (autoFollowBtn) {
        autoFollowBtn.setAttribute('aria-pressed', String(isAuto));
        autoFollowBtn.textContent = isAuto ? '⏸ إيقاف التتبّع التلقائي' : '🐾 اتبع القطة تلقائياً';
      }
    },
    onEnterLouvre() {
      audio.chime();
      showToast('🏛️ أهلاً بك داخل القاعة الكبرى لمتحف اللوفر! اضغط على التحف والأوراق الذهبية الطائرة لاستكشاف حكاية يمنى ✨', 6200);
      audio.speakAr('أهلاً بك داخل القاعة الكبرى لمتحف اللوفر! اتبع القطة الذهبية لاستكشاف التحف والأوراق الذهبية.');
    },
    onTimeChange(mode) {
      const shortMap = { sunset: '🌇 غروب', day: '☀️ نهار', night: '🌙 ليل' };
      timeBtn.textContent = shortMap[mode] || '🌇 غروب';
    },
    onCatPet() {
      audio.meow();
      catGuideCard.classList.remove('folded');
      const txt = 'برررر.. بحب الطبطبة أوي! 💛🐾 كمّل المشي ورايا جوه متحف اللوفر عشان نكتشف كل التحف ونوصل لتورتة الـ 19!';
      catGuideText.textContent = txt;
      audio.speakAr(txt);
    },
    onInteract(id) {
      handleInteract(id);
    },
  });

  // ==================== MUSEUM WELCOME INTRO BRIEFING ====================
  const wmTitle = document.getElementById('wm-title');
  const wmLead = document.getElementById('wm-personal-lead');
  const refreshWelcomeCopy = () => {
    wmTitle.textContent = activeRole.isHonoree
      ? 'أهلاً بكِ يا يمنى في معرضكِ الملكي بباريس ومتحف اللوفر ✨'
      : `أهلاً بك يا ${activeRole.nameAr} في جولة متحف اللوفر لعيد ميلاد يمنى الـ 19 ✨`;
    wmLead.textContent = activeRole.isHonoree
      ? 'هذه التجربة التفاعلية ثلاثية الأبعاد صُمّمت خصيصاً لكِ في عامكِ التاسع عشر: رحلة تبدأ من شوارع باريس بجانب برج إيفل وتدخلكِ إلى متحف اللوفر لتستكشفي محطات شغفكِ، وتقرئي رسائل عائلتكِ الواصلة لصندوقكِ، وتحتفلي تحت القبة الملكية!'
      : 'أنت الآن داخل جولة قصة ثلاثية الأبعاد أُهديت ليمنى في عامها الـ 19 وحلمها بكلية الفنون الجميلة! تجوّل في باريس واللوفر، اكتشف التحف، ولا تنسَ فتح «صندوق رسائل العيلة 💌» داخل المتحف لترك رسالتك لتصلها فوراً!';
  };
  document.getElementById('wm-start-auto-btn').addEventListener('click', () => {
    closeModal('welcome-museum-modal');
    world.setAutoFollow(true);
    audio.meow();
  });
  document.getElementById('wm-start-free-btn').addEventListener('click', () => {
    closeModal('welcome-museum-modal');
    audio.meow();
  });

  // ==================== INTERACTION ROUTER ====================
  function openArtifactModal(chapterId) {
    const ch = SITE_CONFIG.chapters.find((c) => c.id === chapterId);
    if (!ch) return;
    markDiscovered(chapterId);
    audio.chime();
    document.getElementById('art-kicker').textContent = `التحفة ${ch.number} • متحف اللوفر — ${ch.eraAr}`;
    document.getElementById('art-title-ar').textContent = ch.titleAr;
    document.getElementById('art-title-en').textContent = ch.titleEn;
    const img = document.getElementById('art-img');
    img.src = ch.image; img.alt = ch.captionAr;
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
      const link = el('a', 'btn-royal-ghost', '✒️ افتح استوديو الرسم الـ 8× في المعرض الكلاسيكي');
      link.href = './index.html#canvas-studio';
      extra.appendChild(link);
    }
    openModal('artifact-modal');
  }

  // Live Firebase Vault Modal
  const vmInbox = document.getElementById('vm-yomna-inbox');
  const vmSender = document.getElementById('vm-sender-box');
  const vmTitle = document.getElementById('vm-title');
  const vmSub = document.getElementById('vm-sub');
  const vmSenderName = document.getElementById('vm-sender-name');
  const vmPresets = document.getElementById('vm-presets');
  const vmTextarea = document.getElementById('vm-textarea');
  const vmSendBtn = document.getElementById('vm-send-btn');
  const vmDelivery = document.getElementById('vm-delivery');
  const vmDeliveryMsg = document.getElementById('vm-delivery-msg');
  const vmWaLink = document.getElementById('vm-wa-link');
  const vmCopyBtn = document.getElementById('vm-copy-btn');
  const vmPngBtn = document.getElementById('vm-png-btn');
  const vmCloudStatus = document.getElementById('vm-cloud-status');
  let latestGiftUrl = '';

  function renderVaultModal() {
    vmDelivery.classList.remove('open');
    if (activeRole.isHonoree) {
      vmInbox.classList.remove('panel-hidden');
      vmSender.classList.add('panel-hidden');
      vmTitle.textContent = 'صندوق رسائل عائلتكِ داخل متحف اللوفر 💌';
      vmSub.textContent = 'كل رسالة يرسلها أفراد عائلتكِ تصل فوراً سحابياً داخل هذا الصندوق الملكي!';
      vmInbox.replaceChildren(...familyRoles.map((r) => {
        const entry = vaultStore.getEntry(r);
        const card = el('article', 'vm-env-card');
        card.append(el('strong', '', `${r.displayFullAr}${entry.isCustom ? ' ✦ (رسالة جديدة وصلت لكِ)' : ''}`), el('p', '', entry.message));
        return card;
      }));
    } else {
      vmInbox.classList.add('panel-hidden');
      vmSender.classList.remove('panel-hidden');
      vmTitle.textContent = 'أرسل رسالتك لصندوق يمنى داخل متحف اللوفر 💌';
      vmSub.textContent = 'اكتب تهنئتك وتشجيعك ليمنى لتصل فوراً سحابياً إلى صندوقها الخاص في المتحف!';
      vmSenderName.textContent = activeRole.displayFullAr;
      vmTextarea.value = vaultStore.getEntry(activeRole).message;
      vmPresets.replaceChildren(...(activeRole.cardPresets || []).map((txt) => {
        const b = el('button', 'vm-preset-btn', txt);
        b.type = 'button';
        b.addEventListener('click', () => { vmTextarea.value = txt; });
        return b;
      }));
    }
  }

  vmSendBtn.addEventListener('click', async () => {
    if (activeRole.isHonoree) return;
    const msg = sanitizeText(vmTextarea.value, 220);
    if (msg.length < 3) return;
    vmSendBtn.disabled = true;
    vaultStore.save(activeRole.id, msg);
    const res = await cloudVault.publishWish(activeRole.id, msg);
    vmSendBtn.disabled = false;
    audio.chime();
    vmDeliveryMsg.textContent = res.ok
      ? '✅ وصلت رسالتك سحابياً في نفس اللحظة إلى صندوق يمنى داخل متحف اللوفر!'
      : '✅ تم حفظ رسالتك في الصندوق — يمكنك أيضاً مشاركتها على واتساب:';
    const token = encodeGiftToken(activeRole.id, msg);
    latestGiftUrl = `${window.location.origin}${window.location.pathname.replace('louvre.html', 'index.html')}?gift=${encodeURIComponent(token)}`;
    vmWaLink.href = `https://wa.me/?text=${encodeURIComponent(`🎁 رسالة تهنئة خاصة إلى يمنى داخل متحف اللوفر 3D من ${activeRole.displayFullAr}:\n${latestGiftUrl}`)}`;
    vmDelivery.classList.add('open');
    vmDelivery.setAttribute('aria-hidden', 'false');
  });

  vmCopyBtn.addEventListener('click', async () => {
    if (!latestGiftUrl) return;
    try { await navigator.clipboard.writeText(latestGiftUrl); vmCopyBtn.textContent = '✓ تم النسخ!'; } catch { /* ignore */ }
  });

  vmPngBtn.addEventListener('click', () => {
    const c = document.createElement('canvas'); c.width = 900; c.height = 520;
    const ctx = c.getContext('2d');
    ctx.fillStyle = '#150f0a'; ctx.fillRect(0, 0, 900, 520);
    ctx.strokeStyle = '#e8c268'; ctx.lineWidth = 3; ctx.strokeRect(22, 22, 856, 476);
    ctx.textAlign = 'center'; ctx.direction = 'rtl';
    ctx.fillStyle = '#fbf0cf'; ctx.font = '700 32px Amiri, serif';
    ctx.fillText(`رسالة من متحف اللوفر إلى الفنانة ${SITE_CONFIG.artistName}`, 450, 110);
    ctx.fillStyle = '#f8f1e4'; ctx.font = '500 24px Cairo, sans-serif';
    ctx.fillText(sanitizeText(vmTextarea.value, 110), 450, 260);
    ctx.fillStyle = '#e8c268'; ctx.font = '700 24px Amiri, serif';
    ctx.fillText(`بكل فخر ودعاء — ${activeRole.displayFullAr}`, 450, 420);
    const a = document.createElement('a');
    a.download = `Louvre-Wish-${activeRole.id}-Yomna.png`; a.href = c.toDataURL('image/png'); a.click();
  });

  cloudVault.subscribeAll(
    ({ senderId, message }) => { vaultStore.save(senderId, message); renderVaultModal(); },
    (connected) => {
      vmCloudStatus.textContent = connected
        ? '🟢 متصل سحابياً الآن (Firebase Cloud Firestore) — الرسائل تظهر لحظياً في صندوق يمنى!'
        : '🔒 وضع الحفظ المحلي + رابط واتساب جاهز.';
    }
  );

  // Manifesto Modal
  const fm = SITE_CONFIG.finalManifesto;
  document.getElementById('mm-man-title').textContent = fm.titleAr;
  document.getElementById('mm-man-quote').textContent = fm.quoteAr;
  document.getElementById('mm-man-pillars').replaceChildren(...fm.pillars.map((p) => {
    const card = el('article', 'mm-pillar');
    card.append(el('span', '', p.icon), el('h3', '', p.titleAr), el('p', '', p.descAr));
    return card;
  }));
  let capIdx = 0;
  const renderCap = () => {
    document.getElementById('mm-cap-text').textContent = `«${fm.peaceCapsules[capIdx]}»`;
    document.getElementById('mm-cap-count').textContent = `${capIdx + 1} / ${fm.peaceCapsules.length}`;
  };
  renderCap();
  document.getElementById('mm-cap-next').addEventListener('click', () => { capIdx = (capIdx + 1) % fm.peaceCapsules.length; renderCap(); audio.chime(); });
  document.getElementById('mm-pledge-btn').addEventListener('click', (e) => {
    const btn = e.currentTarget;
    const on = btn.getAttribute('aria-pressed') !== 'true';
    btn.setAttribute('aria-pressed', String(on));
    document.getElementById('mm-pledge-msg').textContent = on ? '✦ شكراً لك! الدعم الهادئ والإيمان بالشغف هما أجمل هدية ليمنى ✦' : '';
    if (on) audio.chime();
  });

  // Cake Celebration + Real Microphone Blow Detector
  let candlesBlown = false;
  const cmStatus = document.getElementById('cm-status');
  const cmBlowLabel = document.getElementById('cm-blow-label');
  const cmWishBox = document.getElementById('cm-wish-box');
  document.getElementById('cm-wish-title').textContent = SITE_CONFIG.finale.wishHeadingAr;
  document.getElementById('cm-wish-body').textContent = SITE_CONFIG.finale.wishMessageAr;
  document.getElementById('cm-family-sign').textContent = SITE_CONFIG.familySignOffAr;

  const setBlownState = (blown) => {
    candlesBlown = blown;
    world.triggerCakeCelebration(blown);
    if (blown) {
      audio.chime();
      cmStatus.textContent = SITE_CONFIG.finale.candlesBlownStatusAr;
      cmBlowLabel.textContent = SITE_CONFIG.finale.buttonAfterAr;
      cmWishBox.classList.add('open'); cmWishBox.setAttribute('aria-hidden', 'false');
    } else {
      cmStatus.textContent = SITE_CONFIG.finale.candlesLitStatusAr;
      cmBlowLabel.textContent = SITE_CONFIG.finale.buttonAr;
    }
  };
  document.getElementById('cm-blow-btn').addEventListener('click', () => setBlownState(!candlesBlown));
  document.getElementById('cm-fw-btn').addEventListener('click', () => { world.launchFireworks(); audio.chime(); });
  document.getElementById('cm-cert-btn').addEventListener('click', downloadCertificatePng);

  const micBtn = document.getElementById('cm-mic-btn');
  const micLbl = document.getElementById('cm-mic-label');
  let micStream = null, micCtx = null, micRaf = 0, micOn = false;
  const stopMic = () => {
    micOn = false;
    if (micRaf) cancelAnimationFrame(micRaf);
    if (micStream) { micStream.getTracks().forEach((t) => t.stop()); micStream = null; }
    if (micCtx) { micCtx.close().catch(() => {}); micCtx = null; }
    world.setCandleWind(0);
    micBtn.setAttribute('aria-pressed', 'false');
    micLbl.textContent = '🎙️ أو انفخي في المايكروفون لإطفاء الشمعتين!';
  };
  micBtn.addEventListener('click', async () => {
    if (micOn) { stopMic(); return; }
    try {
      micStream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const Ctx = window.AudioContext || window.webkitAudioContext;
      micCtx = new Ctx();
      const an = micCtx.createAnalyser(); an.fftSize = 256;
      micCtx.createMediaStreamSource(micStream).connect(an);
      const data = new Uint8Array(an.frequencyBinCount);
      micOn = true; let charge = 0;
      micBtn.setAttribute('aria-pressed', 'true');
      micLbl.textContent = '💨 انفخي الآن نحو المايكروفون! (إلغاء)';
      const loop = () => {
        if (!micOn) return;
        an.getByteFrequencyData(data);
        let sum = 0; for (let i = 1; i <= 18; i++) sum += data[i];
        const lvl = Math.min(1, Math.max(0, (sum / 18 - 36) / 95));
        world.setCandleWind(lvl);
        charge = lvl > 0.32 ? Math.min(100, charge + lvl * 5.2) : Math.max(0, charge - 1.4);
        if (charge >= 100) { stopMic(); setBlownState(true); return; }
        micRaf = requestAnimationFrame(loop);
      };
      loop();
    } catch { stopMic(); }
  });

  function handleInteract(id) {
    if (['childhood', 'passion', 'thanaweya', 'fine-arts'].includes(id)) openArtifactModal(id);
    else if (id === 'vault') { markDiscovered('vault'); renderVaultModal(); audio.chime(); openModal('vault-modal'); }
    else if (id === 'manifesto') { markDiscovered('manifesto'); audio.chime(); audio.speakAr(fm.quoteAr); openModal('manifesto-modal'); }
    else if (id === 'cake') { audio.chime(); openModal('cake-modal'); }
  }
  proximityBtn.addEventListener('click', () => { if (activeInteractId) handleInteract(activeInteractId); });

  // ==================== PRO MUSEUM TOOLS: TIME OF DAY, VOICE, QUALITY, CINEMA PHOTO ====================
  const timeModes = ['sunset', 'day', 'night'];
  let timeIdx = 0;
  timeBtn.addEventListener('click', () => {
    timeIdx = (timeIdx + 1) % timeModes.length;
    const mode = timeModes[timeIdx];
    world.setTimeOfDay(mode);
    audio.chime();
    const toastTxt = mode === 'night'
      ? '🌙 ليل باريس الساحر: شوف القمر والنجوم وكشّاف برج إيفل المضيء!'
      : mode === 'day'
        ? '☀️ نهار باريس المشمس: السماء الزرقاء والشمس تنير متحف اللوفر!'
        : '🌇 غروب باريس الذهبي: إضاءة الغروب الرومانسية الهادئة!';
    showToast(toastTxt, 3800);
  });

  document.getElementById('gt-tools-btn').addEventListener('click', (e) => {
    e.stopPropagation();
    const open = toolsTray.classList.toggle('open');
    toolsTray.setAttribute('aria-hidden', String(!open));
  });
  document.addEventListener('click', (e) => {
    if (!toolsTray.contains(e.target) && e.target.id !== 'gt-tools-btn') {
      toolsTray.classList.remove('open');
      toolsTray.setAttribute('aria-hidden', 'true');
    }
  });

  const voiceBtn = document.getElementById('gt-voice-btn');
  voiceBtn.addEventListener('click', () => {
    audio.voiceEnabled = !audio.voiceEnabled;
    voiceBtn.setAttribute('aria-pressed', String(audio.voiceEnabled));
    voiceBtn.textContent = audio.voiceEnabled ? '🗣️ الدليل الصوتي: شغّال' : '🗣️ الدليل الصوتي: متوقف';
    if (audio.voiceEnabled) audio.speakAr('تم تشغيل الدليل الصوتي لمتحف اللوفر.');
    else if ('speechSynthesis' in window) window.speechSynthesis.cancel();
  });

  const audioBtn = document.getElementById('gt-audio-btn');
  audioBtn.addEventListener('click', () => {
    const on = audio.toggleMusic();
    audioBtn.setAttribute('aria-pressed', String(on));
    audioBtn.textContent = on ? '🔊 موسيقى باريس: شغّالة' : '🔇 موسيقى باريس: متوقفة';
  });

  const qualityModes = [
    { id: 'auto', label: '⚡ الأداء: تلقائي 60FPS' },
    { id: 'smooth', label: '🚀 الأداء: خفيف بدون تهنيج' },
    { id: 'ultra', label: '💎 الأداء: فائق Ultra' },
  ];
  let qIdx = 0;
  const qualityBtn = document.getElementById('gt-quality-btn');
  qualityBtn.addEventListener('click', () => {
    qIdx = (qIdx + 1) % qualityModes.length;
    world.setQualityMode(qualityModes[qIdx].id);
    qualityBtn.textContent = qualityModes[qIdx].label;
    showToast(`تم تفعيل ${qualityModes[qIdx].label}`, 2600);
  });

  const setCinemaMode = (on) => {
    document.body.classList.toggle('cinema-mode', on);
    document.getElementById('cinema-exit-bar').setAttribute('aria-hidden', String(!on));
    toolsTray.classList.remove('open');
  };
  document.getElementById('gt-cinema-btn').addEventListener('click', () => setCinemaMode(true));
  document.getElementById('cinema-exit-btn').addEventListener('click', () => setCinemaMode(false));
  document.getElementById('cinema-snap-btn').addEventListener('click', () => { world.captureLouvrePostcard(); audio.chime(); });
  document.getElementById('gt-photo-btn').addEventListener('click', () => {
    world.captureLouvrePostcard(); audio.chime(); toolsTray.classList.remove('open');
    showToast('📸 تم حفظ بطاقة تذكارية فاخرة من باريس ومتحف اللوفر على جهازك!', 3600);
  });
  document.getElementById('gt-welcome-btn').addEventListener('click', () => { refreshWelcomeCopy(); openModal('welcome-museum-modal'); });

  // ==================== VIRTUAL WALKING JOYSTICK ====================
  const joyBase = document.querySelector('.joystick-base');
  const joyKnob = document.getElementById('joystick-knob');
  let joyActive = false;
  let joyOrigin = { x: 0, y: 0 };

  const updateJoystick = (cx, cy) => {
    const maxR = 32;
    let dx = cx - joyOrigin.x, dy = cy - joyOrigin.y;
    const dist = Math.hypot(dx, dy);
    if (dist > maxR) { dx = (dx / dist) * maxR; dy = (dy / dist) * maxR; }
    joyKnob.style.transform = `translate3d(${dx.toFixed(1)}px, ${dy.toFixed(1)}px, 0)`;
    world.setJoystickInput(-dy / maxR, dx / maxR);
  };
  joyBase.addEventListener('pointerdown', (e) => {
    e.stopPropagation(); joyBase.setPointerCapture(e.pointerId);
    const rect = joyBase.getBoundingClientRect();
    joyOrigin = { x: rect.left + rect.width / 2, y: rect.top + rect.height / 2 };
    joyActive = true; updateJoystick(e.clientX, e.clientY);
  });
  joyBase.addEventListener('pointermove', (e) => { if (!joyActive) return; e.stopPropagation(); updateJoystick(e.clientX, e.clientY); });
  const endJoy = () => {
    if (!joyActive) return; joyActive = false;
    joyKnob.style.transform = 'translate3d(0, 0, 0)'; world.setJoystickInput(0, 0);
  };
  joyBase.addEventListener('pointerup', endJoy);
  joyBase.addEventListener('pointercancel', endJoy);

  // ==================== CAT QUEST CARD & FAST-TRAVEL MAP ====================
  document.getElementById('cat-fold-btn').addEventListener('click', () => catGuideCard.classList.add('folded'));
  document.getElementById('cat-reopen-btn').addEventListener('click', () => catGuideCard.classList.remove('folded'));
  autoFollowBtn.addEventListener('click', () => {
    const next = !world.autoFollow; world.setAutoFollow(next); if (next) audio.meow();
  });
  document.getElementById('next-stop-btn').addEventListener('click', () => {
    world.teleportToWaypoint((world.currentWaypointIdx + 1) % STORY_WAYPOINTS.length); audio.meow();
  });
  document.getElementById('cat-lick-btn').addEventListener('click', () => {
    world.triggerCatAction('groom');
    catGuideText.textContent = 'ثواني ألحس كفّي بهدوء وأنضّف فروي الذهبي عشان أفضل شيك في متحف اللوفر! 👅🐾';
  });
  document.getElementById('cat-play-btn').addEventListener('click', () => {
    world.triggerCatAction('play'); audio.meow();
    catGuideText.textContent = 'كرة الخيط الذهبية الـ 3D نزلت قدامي! مياو 🧶✨';
  });

  const mapGrid = document.getElementById('map-stations-grid');
  const mapBtns = STORY_WAYPOINTS.map((wp, idx) => {
    const b = el('button', `map-wp-btn${idx === 0 ? ' active' : ''}`, `${idx + 1}. ${wp.labelAr}`);
    b.type = 'button';
    b.addEventListener('click', () => { world.teleportToWaypoint(idx); closeModal('map-modal'); audio.meow(); });
    return b;
  });
  mapGrid.replaceChildren(...mapBtns);
  function refreshMapActive(activeIdx) { mapBtns.forEach((b, i) => b.classList.toggle('active', i === activeIdx)); }
  document.getElementById('gt-map-btn').addEventListener('click', () => openModal('map-modal'));

  // ==================== 8-MEMBER VIP PORTAL -> TRIGGERS MUSEUM WELCOME INTRO! ====================
  const portal = document.getElementById('louvre-portal');
  const rolesGrid = document.getElementById('lp-roles-grid');
  const roleBtns = roles.map((r, idx) => {
    const b = el('button', `lp-role-btn${r.isHonoree ? ' honoree' : ''}${idx === 0 ? ' selected' : ''}`);
    b.type = 'button';
    b.append(el('strong', '', r.nameAr), el('span', '', `(${r.relationAr})`));
    b.addEventListener('click', () => {
      activeRole = r;
      roleBtns.forEach((btn, i) => btn.classList.toggle('selected', i === idx));
      visitorBtn.textContent = r.badgeAr;
      renderVaultModal();
      refreshWelcomeCopy();
    });
    return b;
  });
  rolesGrid.replaceChildren(...roleBtns);
  visitorBtn.textContent = activeRole.badgeAr;
  renderVaultModal();
  refreshWelcomeCopy();

  document.getElementById('lp-enter-btn').addEventListener('click', () => {
    portal.classList.add('hidden');
    document.body.classList.remove('portal-open');
    audio.chime();
    if (!shownWelcomeOnce) {
      shownWelcomeOnce = true;
      refreshWelcomeCopy();
      openModal('welcome-museum-modal');
    } else {
      window.setTimeout(() => audio.meow(), 400);
    }
  });

  visitorBtn.addEventListener('click', () => {
    portal.classList.remove('hidden');
    document.body.classList.add('portal-open');
    world.setAutoFollow(false);
  });
}

bootstrap();
