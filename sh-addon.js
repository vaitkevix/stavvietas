/* SH | kopējās funkcijas visiem servisiem (kā Aizvietošanā): ieeja ar PIN, izvēlne, pamācība soli pa solim.
 * Konfigurācija: window.SHX = { app, title, sub, api, tours:{kind:[{sel,title,text,tab?}]}, onUser(u), onOut(), tabsFor(kind) }
 * © VAITKEVIX, SIA */
(function () {
  const C = window.SHX || {};
  const K = 'shx_' + C.app + '_';
  const ls = { get: k => { try { return localStorage.getItem(K + k); } catch (e) { return null; } }, set: (k, v) => { try { localStorage.setItem(K + k, v); } catch (e) {} }, del: k => { try { localStorage.removeItem(K + k); } catch (e) {} } };
  const esc = s => String(s == null ? '' : s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const $ = id => document.getElementById(id);

  const css = `
  .shx-gate{position:fixed;inset:0;z-index:400;display:flex;align-items:center;justify-content:center;padding:20px;background:var(--bg,#f3f5f4)}
  .shx-gate.shx-gate-in{position:static;inset:auto;z-index:auto;padding:8px 0 24px;background:none}
  .shx-locked > :not(.shx-gate-in){display:none!important}
  .shx-card{width:min(380px,100%);background:var(--surface-solid,#fff);border:1px solid var(--line,rgba(0,0,0,.08));border-radius:16px;padding:26px 22px 20px;box-shadow:0 24px 60px -20px rgba(0,0,0,.35);text-align:center;animation:shxIn .35s ease-out}
  @keyframes shxIn{from{opacity:0;transform:translateY(12px) scale(.98)}to{opacity:1;transform:none}}
  .shx-card img{width:64px;height:64px;border-radius:14px;margin:0 auto 12px;display:block}
  .shx-card h2{margin:0 0 4px;font-size:20px;font-weight:800;letter-spacing:-.01em;color:var(--ink,#111)}
  .shx-card .sub{margin:0 0 18px;color:var(--ink-3,#6b7270);font-size:13.5px;font-weight:600}
  .shx-card #shxPin{width:100%;box-sizing:border-box;height:52px;border-radius:12px;border:1.5px solid var(--line-2,#d5dbd8);background:var(--surface-2,#f7f9f8);color:var(--ink,#111);
    font:inherit;font-size:22px;font-weight:800;letter-spacing:.3em;text-align:center;outline:none}
  .shx-card #shxPin:focus{border-color:var(--brand,#0f6b5c)}
  .shx-card label input{width:18px;height:18px;margin:0;accent-color:var(--brand,#0f6b5c)}
  .shx-card label{display:flex;align-items:center;justify-content:center;gap:8px;margin:12px 0 14px;font-size:13.5px;font-weight:600;color:var(--ink-2,#444)}
  .shx-card button{width:100%;height:50px;border:0;border-radius:12px;background:var(--brand,#0f6b5c);color:#fff;font:inherit;font-size:16px;font-weight:800;cursor:pointer}
  .shx-card button[disabled]{opacity:.6}
  .shx-card .hint{margin:12px 0 0;font-size:12.5px;color:var(--ink-3,#6b7270)}
  .shx-card .copy{margin:16px 0 0;font-size:11px;font-weight:700;color:var(--ink-3,#6b7270);opacity:.85}
  .shx-card.shake{animation:shxShake .4s}
  @keyframes shxShake{20%,60%{transform:translateX(-8px)}40%,80%{transform:translateX(8px)}}
  .shx-who{display:flex;align-items:center;justify-content:space-between;gap:10px;margin:0 0 14px;padding:12px 14px;border-radius:12px;background:var(--brand-soft,rgba(15,107,92,.08));font-weight:700}
  .shx-who small{display:block;font-weight:600;color:var(--ink-3,#6b7270);font-size:12px}
  .shx-menu{display:grid;gap:8px;margin:0 0 16px}
  .shx-menu button{display:flex;align-items:center;gap:10px;width:100%;min-height:46px;padding:10px 14px;border-radius:10px;border:1px solid var(--line,rgba(0,0,0,.1));
    background:var(--surface-solid,#fff);color:var(--ink,#111);font:inherit;font-size:14.5px;font-weight:700;cursor:pointer;text-align:left}
  .shx-menu button.red{color:#c02626}
  [data-theme="dark"] .shx-menu button.red{color:#ff8f8f}
  .shx-menu svg{flex:none}
  .shx-sheet{position:fixed;inset:0;z-index:300;display:flex;align-items:flex-end;justify-content:center;background:rgba(8,20,16,.45);animation:shxFade .2s}
  @media(min-width:640px){.shx-sheet{align-items:center}}
  @keyframes shxFade{from{opacity:0}}
  .shx-sheet .box{width:min(440px,100%);max-height:88vh;overflow:auto;background:var(--surface-solid,var(--surface,#fff));color:var(--ink,#111);border-radius:18px 18px 0 0;padding:18px 16px calc(18px + env(safe-area-inset-bottom));animation:shxUp .28s cubic-bezier(.2,.8,.2,1)}
  @media(min-width:640px){.shx-sheet .box{border-radius:18px}}
  @keyframes shxUp{from{transform:translateY(30px);opacity:0}}
  .shx-sheet .hd{display:flex;align-items:center;justify-content:space-between;margin:0 0 12px}
  .shx-sheet .hd h3{margin:0;font-size:18px;font-weight:800}
  .shx-sheet .copy{margin:4px 0 0;text-align:center;font-size:11px;font-weight:700;opacity:.6}
  .shx-x{width:40px;height:40px;border-radius:50%;border:0;background:rgba(127,127,127,.12);color:inherit;font-size:20px;line-height:1;cursor:pointer}
  .tour-ov{position:fixed;inset:0;z-index:500}
  .tour-hole{position:fixed;border-radius:10px;box-shadow:0 0 0 9999px rgba(8,20,16,.6);outline:2px solid rgba(255,255,255,.85);outline-offset:2px;transition:top .3s ease,left .3s ease,width .3s ease,height .3s ease;pointer-events:none}
  .tour-hole.none{width:0!important;height:0!important;top:50%!important;left:50%!important;outline:0}
  .tour-tip{position:fixed;z-index:501;width:min(340px,calc(100vw - 24px));padding:16px 16px 14px;border-radius:14px;background:#fff;color:#111;border:1px solid rgba(0,0,0,.08);
    box-shadow:0 20px 50px -12px rgba(0,0,0,.45);transition:top .3s ease,left .3s ease;animation:shxIn .25s ease-out}
  :root[data-theme="dark"] .tour-tip,.dark .tour-tip{background:#1b2321;color:#f1f4f2}
  .tour-tip h4{margin:0 0 6px;font-size:17px;font-weight:800;letter-spacing:-.01em}
  .tour-tip p{margin:0 0 14px;font-size:14.5px;line-height:1.45;opacity:.85}
  .tour-tip .tbtns{display:flex;align-items:center;gap:8px}
  .tour-tip .tbtns .skip{margin-right:auto;border:0;background:none;color:inherit;opacity:.6;font-weight:800;font-size:14px;cursor:pointer;padding:8px 4px}
  .tour-tip .tbtns button.b{min-height:42px;padding:9px 16px;border-radius:10px;border:1px solid rgba(0,0,0,.12);background:transparent;color:inherit;font:inherit;font-weight:800;cursor:pointer}
  .tour-tip .tbtns button.p{background:var(--brand,#0f6b5c);border-color:transparent;color:#fff}
  .tour-dots{display:flex;gap:4px;margin:0 0 12px}
  .tour-dots i{width:6px;height:6px;border-radius:3px;background:rgba(127,127,127,.35);transition:width .2s}
  .tour-dots i.on{width:18px;background:var(--brand,#0f6b5c)}
  .tour-tip .copy{margin:10px 0 0;font-size:10.5px;font-weight:700;opacity:.6}`;
  const st = document.createElement('style'); st.textContent = css; document.head.appendChild(st);

  const IC = {
    tour: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="9"/><path d="M9.5 9a2.5 2.5 0 1 1 3.5 2.3c-.6.3-1 .9-1 1.6V14M12 17.5h.01"/></svg>',
    home: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><rect x="6" y="2.5" width="12" height="19" rx="2.5"/><path d="M12 8v6M9 11h6"/></svg>',
    out: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 21H6a3 3 0 0 1-3-3V6a3 3 0 0 1 3-3h3"/><path d="M16 17l5-5-5-5M21 12H9"/></svg>'
  };

  /* ---------- Lietotājs ---------- */
  let U = null; try { U = JSON.parse(ls.get('user') || 'null'); } catch (e) {}
  const SHX = window.SHXR = { user: () => U, startTour: (k) => startTour(k), logout: () => logout(), showMenu: (c) => showMenu(c), maybeTour: () => maybeTour(), a2hs: () => C.a2hs && C.a2hs() };

  function gate() {
    if ($('shxGate')) return;
    const host = C.gateIn && document.querySelector(C.gateIn);
    const g = document.createElement('div'); g.className = host ? 'shx-gate shx-gate-in' : 'shx-gate'; g.id = 'shxGate';
    g.innerHTML = `<form class="shx-card" id="shxCard" autocomplete="on">
      <img src="${esc(C.icon || 'icon.png')}" alt="">
      <h2>${esc(C.title)}</h2><p class="sub">${esc(C.sub || 'Ievadiet savu PIN kodu')}</p>
      <input type="password" id="shxPin" name="password" autocomplete="current-password" autocapitalize="off" autocorrect="off" spellcheck="false" placeholder="PIN" required>
      <label><input type="checkbox" id="shxRem" checked> Atcerēties mani šajā ierīcē</label>
      <button type="submit" id="shxBtn">Ienākt</button>
      <p class="hint">${esc(C.hint || '')}</p>
      <p class="copy">© VAITKEVIX, SIA</p></form>`;
    if (host) { host.classList.add('shx-locked'); host.prepend(g); } else document.body.appendChild(g);
    if (!host) setTimeout(() => $('shxPin').focus(), 200);
    $('shxCard').onsubmit = async (e) => {
      e.preventDefault();
      const pin = $('shxPin').value.trim(); if (!pin) return;
      const b = $('shxBtn'); b.disabled = true; b.textContent = 'Pārbauda…';
      try {
        const r = await fetch(C.api + '/who', { method: 'POST', headers: { 'Content-Type': 'text/plain;charset=utf-8' }, body: JSON.stringify({ pin, app: C.app }) }).then(r => r.json());
        if (!r.ok) throw new Error(r.error || 'Nepareizs PIN');
        U = r.user; if (r.carrierPin) U.carrierPin = r.carrierPin;
        if ($('shxRem').checked) ls.set('user', JSON.stringify(U)); else try { sessionStorage.setItem(K + 'user', JSON.stringify(U)); } catch (e) {}
        if (C.gateIn && U.kind !== 'pieteicejs' && U.kind !== 'admin') { U = null; ls.del('user'); throw new Error('Šis PIN nav pieteicēja PIN'); }
      } catch (err) {
        b.disabled = false; b.textContent = 'Ienākt';
        const c = $('shxCard'); c.classList.remove('shake'); void c.offsetWidth; c.classList.add('shake');
        $('shxPin').value = ''; $('shxPin').focus();
        if (window.toast) toast(/fetch|network/i.test(err.message) ? 'Nav interneta' : err.message, 'err');
        return;
      }
      g.remove(); unlockHost(); apply(true);
    };
  }
  if (!U) { try { U = JSON.parse(sessionStorage.getItem(K + 'user') || 'null'); } catch (e) {} }

  function unlockHost() { const h = C.gateIn && document.querySelector(C.gateIn); if (h) h.classList.remove('shx-locked'); }
  function apply(fresh) {
    ownMenu();
    if (!U) return gate();
    unlockHost();
    try { C.onUser && C.onUser(U, fresh); } catch (e) { console.error(e); }
    if (C.tabsFor) { const allow = C.tabsFor(U); document.querySelectorAll(C.tabSel || '[data-tab]').forEach(t => { t.style.display = allow.indexOf(t.dataset.tab) === -1 ? 'none' : ''; }); }
    if (C.gateIn && !fresh) return;
    if (fresh || !ls.get('tour_' + U.kind)) setTimeout(() => { if (!ls.get('tour_' + U.kind)) startTour(); }, 1200);
  }
  function logout() {
    const was = U;
    ls.del('user'); try { sessionStorage.removeItem(K + 'user'); } catch (e) {}
    try { C.onOut && C.onOut(was); } catch (e) {}
    U = null; if (C.gateIn) { apply(false); return; } location.reload();
  }

  /* ---------- Izvēlne (pie „?”) ---------- */
  function showMenu(container) {
    if (!container) return;
    const old = container.querySelector('.shx-mbox'); if (old) old.remove();
    const box = document.createElement('div'); box.className = 'shx-mbox';
    box.innerHTML = `${U ? `<div class="shx-who"><div>${esc(U.name)}<small>${esc(U.kindLabel || '')}</small></div></div>` : ''}
      <div class="shx-menu"><button type="button" data-x="tour">${IC.tour} Pamācība — soli pa solim</button>
      ${C.a2hs ? `<button type="button" data-x="a2hs">${IC.home} Pievienot sākuma ekrānam</button>` : ''}
      ${U || (C.loggedIn && C.loggedIn()) ? `<button type="button" class="red" data-x="out">${IC.out} Iziet</button>` : ''}</div>`;
    container.prepend(box);
    box.addEventListener('click', (e) => {
      const x = e.target.closest('[data-x]'); if (!x) return;
      if (C.closeMenu) C.closeMenu();
      if (x.dataset.x === 'tour') setTimeout(startTour, 250);
      if (x.dataset.x === 'a2hs') C.a2hs();
      if (x.dataset.x === 'theme' && C.theme) C.theme();
      if (x.dataset.x === 'out') logout();
    });
  }

  /* Pašu izvēlne ar „?” pogu (servisiem, kuriem tādas nav) */
  function ownMenu() {
    const wrap = C.ownMenu && document.querySelector(C.ownMenu); if (!wrap || wrap.querySelector('.shx-help')) return;
    const b = document.createElement('button'); b.type = 'button'; b.className = (C.btnClass || 'icon-btn') + ' shx-help'; b.title = 'Izvēlne un pamācība'; b.setAttribute('aria-label', 'Izvēlne');
    b.innerHTML = '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M9.5 9a2.5 2.5 0 1 1 3.5 2.3c-.6.3-1 .9-1 1.6V14M12 17.5h.01"/></svg>';
    b.onclick = openSheet; wrap.prepend(b);
  }
  function openSheet() {
    closeSheet();
    const sh = document.createElement('div'); sh.className = 'shx-sheet'; sh.id = 'shxSheet';
    sh.innerHTML = '<div class="box" role="dialog" aria-modal="true"><div class="hd"><h3>Izvēlne</h3><button type="button" class="shx-x" aria-label="Aizvērt">×</button></div><div class="bd"></div><p class="copy">© VAITKEVIX, SIA</p></div>';
    sh.addEventListener('click', e => { if (e.target === sh || e.target.closest('.shx-x')) closeSheet(); });
    document.body.appendChild(sh); showMenu(sh.querySelector('.bd'));
  }
  function closeSheet() { const s = $('shxSheet'); if (s) s.remove(); }
  if (C.ownMenu && !C.closeMenu) C.closeMenu = closeSheet;
  SHX.openSheet = openSheet;

  /* Pievienot sākuma ekrānam (ja servisam nav sava) */
  let BIP = null; addEventListener('beforeinstallprompt', e => { e.preventDefault(); BIP = e; });
  function a2hsBuiltin() {
    const ios = /iphone|ipad|ipod/i.test(navigator.userAgent) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
    if (matchMedia('(display-mode: standalone)').matches || navigator.standalone) return window.toast ? toast('Lietotne jau ir sākuma ekrānā', 'ok') : 0;
    if (BIP) { BIP.prompt(); BIP = null; return; }
    closeSheet();
    const sh = document.createElement('div'); sh.className = 'shx-sheet'; sh.id = 'shxSheet';
    sh.innerHTML = '<div class="box"><div class="hd"><h3>Pievienot sākuma ekrānam</h3><button type="button" class="shx-x" aria-label="Aizvērt">×</button></div><ol style="margin:0 0 12px;padding-left:20px;line-height:1.6;font-weight:600">' +
      (ios ? '<li>Atveriet lapu <b>Safari</b>.</li><li>Spiediet <b>Kopīgot</b> (kvadrāts ar bultu).</li><li>Izvēlieties <b>Pievienot sākuma ekrānam</b> → <b>Pievienot</b>.</li>'
           : '<li>Atveriet pārlūka izvēlni <b>⋮</b>.</li><li>Izvēlieties <b>Pievienot sākuma ekrānam</b> vai <b>Instalēt lietotni</b>.</li>') + '</ol><p class="copy">© VAITKEVIX, SIA</p></div>';
    sh.addEventListener('click', e => { if (e.target === sh || e.target.closest('.shx-x')) closeSheet(); });
    document.body.appendChild(sh);
  }
  if (C.a2hs === true) C.a2hs = a2hsBuiltin;

  /* ---------- Pamācība soli pa solim ---------- */
  let TOUR = null;
  const cur = () => (C.getUser ? C.getUser() : U);
  async function who(pin) {
    const r = await fetch(C.api + '/who', { method: 'POST', headers: { 'Content-Type': 'text/plain;charset=utf-8' }, body: JSON.stringify({ pin, app: C.app }) }).then(r => r.json());
    if (!r.ok) throw new Error(r.error || 'Nepareiza parole'); if (r.carrierPin) r.user.carrierPin = r.carrierPin; return r.user;
  }
  SHX.who = who;
  SHX.tour = (kind) => startTour(kind);
  SHX.maybeTourKind = (kind) => { if (!ls.get('tour_' + kind)) setTimeout(() => { if (!ls.get('tour_' + kind)) startTour(kind); }, 900); };
  function maybeTour() { const u = cur(); if (u && !ls.get('tour_' + u.kind)) setTimeout(() => { if (!ls.get('tour_' + u.kind)) startTour(); }, 1200); }
  function startTour(kind) {
    const u = cur();
    kind = kind || (C.tourKind && C.tourKind(u)) || (u && u.kind);
    if (!kind || !C.tours || !C.tours[kind]) return;
    endTour(true);
    TOUR = { kind, steps: C.tours[kind], i: 0 };
    const ov = document.createElement('div'); ov.className = 'tour-ov'; ov.id = 'tourOv';
    ov.innerHTML = '<div class="tour-hole" id="tourHole"></div><div class="tour-tip" id="tourTip"></div>';
    document.body.appendChild(ov);
    ov.addEventListener('click', (e) => {
      if (e.target.closest('[data-tn]')) go(TOUR.i + 1);
      else if (e.target.closest('[data-tp]')) go(TOUR.i - 1, -1);
      else if (e.target.closest('[data-tx]')) endTour();
    });
    go(0);
  }
  function find(s) {
    if (!s.sel) return null;
    for (const q of s.sel.split(',')) { const el = document.querySelector(q.trim()); if (el && el.getClientRects().length && getComputedStyle(el).visibility !== 'hidden') return el; }
    return null;
  }
  async function go(i, dir = 1) {
    const T = TOUR; if (!T) return;
    if (i >= T.steps.length) return endTour();
    if (i < 0) i = 0;
    const s = T.steps[i];
    if (s.tab && C.switchTab) { C.switchTab(s.tab); await new Promise(r => setTimeout(r, 450)); }
    const el = find(s);
    if (s.sel && !el) return go(i + dir, dir);
    T.i = i;
    const hole = $('tourHole'), tip = $('tourTip'); if (!hole) return;
    if (el) { el.scrollIntoView({ block: 'center', behavior: 'smooth' }); await new Promise(r => setTimeout(r, 380)); }
    const n = T.steps.length, last = i === n - 1;
    tip.innerHTML = `<div class="tour-dots">${T.steps.map((_, k) => `<i class="${k === i ? 'on' : ''}"></i>`).join('')}</div>
      <h4>${esc(s.title)}</h4><p>${esc(s.text)}</p>
      <div class="tbtns">${last ? '' : '<button class="skip" data-tx>Izlaist</button>'}
        ${i > 0 ? '<button class="b" data-tp>Atpakaļ</button>' : ''}
        <button class="b p" data-tn style="${last ? 'margin-left:auto' : ''}">${last ? 'Sākt darbu' : 'Tālāk'}</button></div>
      ${last ? '<p class="copy">© VAITKEVIX, SIA</p>' : ''}`;
    const W = innerWidth, H = innerHeight, tw = tip.offsetWidth, th = tip.offsetHeight;
    if (!el) { hole.classList.add('none'); tip.style.left = (W - tw) / 2 + 'px'; tip.style.top = Math.max(12, (H - th) / 2) + 'px'; return; }
    hole.classList.remove('none');
    const r = el.getBoundingClientRect(), pad = 6;
    const top = Math.max(4, r.top - pad), h = Math.min(r.height + pad * 2, H - 8);
    Object.assign(hole.style, { top: top + 'px', left: Math.max(4, r.left - pad) + 'px', width: Math.min(r.width + pad * 2, W - 8) + 'px', height: h + 'px' });
    let ty = top + h + 12;
    if (ty + th > H - 12) ty = top - th - 12;
    if (ty < 12) ty = Math.max(12, H - th - 12);
    tip.style.top = ty + 'px';
    tip.style.left = Math.min(Math.max(12, r.left + r.width / 2 - tw / 2), W - tw - 12) + 'px';
  }
  function endTour(silent) {
    const ov = $('tourOv'); if (ov) ov.remove();
    if (!TOUR) return;
    ls.set('tour_' + TOUR.kind, '1');
    const back = C.homeTab && C.homeTab(TOUR.kind); TOUR = null;
    if (!silent && back && C.switchTab) C.switchTab(back);
  }
  addEventListener('resize', () => { if (TOUR) go(TOUR.i); });
  addEventListener('keydown', (e) => { if (!TOUR) return; if (e.key === 'Escape') endTour(); if (e.key === 'ArrowRight') go(TOUR.i + 1); if (e.key === 'ArrowLeft') go(TOUR.i - 1, -1); });

  if (!C.external) { if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', () => apply(false)); else apply(false); }
})();
