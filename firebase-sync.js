/**
 * =========================================================================
 *  Real-Time Cloud Firestore Sync Module — Yomna's Private Family Vault
 *  Security Architecture:
 *  - Invisible Firebase Anonymous Auth (JWT-verified `request.auth.uid`)
 *  - Least-privilege individual doc() listeners on ONLY the 7 VIP IDs (no collection list)
 *  - Server-enforced timestamps, strict schema & immutable senderUid tamper protection
 * =========================================================================
 */

import { initializeApp } from 'https://www.gstatic.com/firebasejs/11.6.0/firebase-app.js';
import { getAuth, signInAnonymously } from 'https://www.gstatic.com/firebasejs/11.6.0/firebase-auth.js';
import {
  getFirestore,
  doc,
  getDoc,
  setDoc,
  updateDoc,
  increment,
  onSnapshot,
  serverTimestamp,
} from 'https://www.gstatic.com/firebasejs/11.6.0/firebase-firestore.js';

const FIREBASE_CONFIG = Object.freeze({
  projectId: 'yomna-journey-19-dec5',
  appId: '1:759256973326:web:a88d06a331386fc13e7c5f',
  storageBucket: 'yomna-journey-19-dec5.firebasestorage.app',
  apiKey: 'AIzaSyBSR0qlarMmhOV41aOeTwmaI7N7snF2ukM',
  authDomain: 'yomna-journey-19-dec5.firebaseapp.com',
  messagingSenderId: '759256973326',
});

const ALLOWED_VIP_IDS = new Set([
  'essam',
  'heba',
  'youssef',
  'islam',
  'salwa',
  'nada',
  'mohamed',
]);

function sanitizeMessage(raw) {
  if (typeof raw !== 'string') return '';
  return raw
    .replace(/[\u0000-\u001F\u007F<>`]/g, '')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, 220);
}

export class FamilyCloudVault {
  constructor() {
    this.ready = false;
    this.uid = null;
    this.unsubscribers = [];
    this.initPromise = this.init();
  }

  async init() {
    try {
      this.app = initializeApp(FIREBASE_CONFIG);
      this.auth = getAuth(this.app);
      this.db = getFirestore(this.app);

      const cred = await signInAnonymously(this.auth);
      this.uid = cred.user.uid;
      this.ready = true;
      return true;
    } catch (err) {
      console.warn('Cloud vault offline fallback:', err?.code || err?.message);
      this.ready = false;
      return false;
    }
  }

  async subscribeAll(onWishReceived, onConnectionChange) {
    const ok = await this.initPromise;
    if (onConnectionChange) onConnectionChange(ok);
    if (!ok || !this.db) return;

    this.dispose();

    for (const senderId of ALLOWED_VIP_IDS) {
      const ref = doc(this.db, 'familyWishes', senderId);
      const unsub = onSnapshot(
        ref,
        (snap) => {
          if (!snap.exists()) return;
          const data = snap.data();
          if (!data || data.senderId !== senderId) return;
          const clean = sanitizeMessage(data.message);
          if (clean.length < 3) return;
          const ts = data.updatedAt?.toMillis ? data.updatedAt.toMillis() : Date.now();
          onWishReceived({
            senderId,
            message: clean,
            timestamp: ts,
            isMine: data.senderUid === this.uid,
            version: Number(data.version) || 1,
          });
        },
        (err) => {
          console.warn(`Snapshot listener (${senderId}):`, err?.code || err?.message);
        }
      );
      this.unsubscribers.push(unsub);
    }
  }

  async publishWish(senderId, rawMessage) {
    if (!ALLOWED_VIP_IDS.has(senderId)) {
      return { ok: false, reason: 'invalid_sender' };
    }
    const clean = sanitizeMessage(rawMessage);
    if (clean.length < 3) {
      return { ok: false, reason: 'too_short' };
    }

    const ok = await this.initPromise;
    if (!ok || !this.db || !this.uid) {
      return { ok: false, reason: 'offline' };
    }

    try {
      const ref = doc(this.db, 'familyWishes', senderId);
      const snap = await getDoc(ref);

      if (!snap.exists()) {
        await setDoc(ref, {
          senderId,
          message: clean,
          updatedAt: serverTimestamp(),
          senderUid: this.uid,
          version: 1,
        });
        return { ok: true, mode: 'created' };
      }

      const existing = snap.data();
      if (existing.senderUid !== this.uid) {
        // Security rule protects already-sealed messages from overwrite by another device
        return { ok: false, reason: 'sealed_by_owner_device' };
      }

      const nextVer = (Number(existing.version) || 1) + 1;
      if (nextVer > 25) {
        return { ok: false, reason: 'rate_limit' };
      }

      await updateDoc(ref, {
        message: clean,
        updatedAt: serverTimestamp(),
        version: increment(1),
      });
      return { ok: true, mode: 'updated' };
    } catch (err) {
      console.warn('Cloud publish error:', err?.code || err?.message);
      return { ok: false, reason: err?.code || 'write_failed' };
    }
  }

  dispose() {
    while (this.unsubscribers.length) {
      try {
        this.unsubscribers.pop()();
      } catch {
        // Ignore cleanup errors
      }
    }
  }
}
