# Security & Privacy Policy

## Defense-in-Depth Architecture
This static 3D web exhibition follows strict OWASP frontend hardening and privacy-by-design practices:

1. **Zero Third-Party JavaScript Execution (Supply-Chain Hardening)**
   - `Three.js` (`r170`) is self-hosted locally in `vendor/three.module.min.js` (SHA-256: `08FD7545D13D2C7FB65AB691530A802DAFEFD638596501854F267D0FB13C39E7`).
   - Zero external JS CDNs, zero inline `<script>` blocks, and zero dynamic `eval` / `Function` calls.

2. **Strict Content-Security-Policy (CSP)**
   - `default-src 'none'`
   - `script-src 'self'`
   - `connect-src 'self'` (blocks unauthorized client-side exfiltration)
   - `object-src 'none'`, `form-action 'none'`, `base-uri 'self'`, `upgrade-insecure-requests`

3. **Zero `innerHTML` Sinks & Runtime Tamper Resistance**
   - All DOM nodes are constructed via safe `document.createElement` / `document.createElementNS` and `textContent`.
   - `SITE_CONFIG` is recursively frozen with `Object.freeze`.
   - All asset URLs are strictly validated against `^\.\/assets\/[a-zA-Z0-9._/-]+$` without path traversal.
   - Anti-clickjacking frame guard prevents unauthorized cross-origin `<iframe>` embedding.

4. **Privacy & Anti-Leakage Controls**
   - Zero cookies, zero analytics, zero third-party telemetry, zero personal data storage.
   - `Referrer-Policy: no-referrer` prevents URL leakage to external origins.
   - `robots.txt` + `noindex, nofollow, noarchive, nosnippet, noimageindex` meta directives prevent search engine and image crawling.
   - Local `scripts/strip-exif.ps1` removes GPS coordinates, device info, and EXIF metadata from any photos before upload.

5. **Repository & Transport Hardening**
   - HTTPS strictly enforced on GitHub Pages (`https_enforced: true`).
   - Branch protection on `main` blocks force-pushes and accidental deletion.
   - Unused attack surfaces (`Issues`, `Wiki`, `Projects`) disabled on GitHub.
   - `.gitignore` blocks accidental commit of secrets, keys, or `.env` files.
