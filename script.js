/* ===== CONFIG: edit these at launch ===== */
const CONFIG = {
  CA: 'TBA',
  X: 'https://x.com/catus_x',
  TG: '', // empty = shows "soon"
};
/* ======================================== */
(function () {
  'use strict';
  const SOL_CA = /^[1-9A-HJ-NP-Za-km-z]{32,44}$/;
  const SOL_MINT = 'So11111111111111111111111111111111111111112';
  const caValid = SOL_CA.test(CONFIG.CA);
  const caOut = caValid ? CONFIG.CA : 'TBA';
  const LINKS = {
    buy: 'https://swap.pump.fun/?input=' + SOL_MINT + '&output=' + caOut,
    chart: 'https://dexscreener.com/solana/' + caOut,
    x: CONFIG.X,
    tg: CONFIG.TG,
  };
  const root = document.documentElement;
  const body = document.body;
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const touch = window.matchMedia('(pointer: coarse)').matches || window.innerWidth < 760;
  if (reduced) body.classList.add('reduced');

  /* ---- links ---- */
  document.querySelectorAll('[data-link]').forEach((a) => {
    const k = a.dataset.link, url = LINKS[k];
    if (k === 'tg') {
      if (url) { a.href = url; a.target = '_blank'; a.rel = 'noopener'; a.removeAttribute('aria-disabled'); a.innerHTML = 'Telegram'; a.classList.remove('tg-btn'); }
      else a.addEventListener('click', (e) => { e.preventDefault(); toast('Telegram coming soon'); });
      return;
    }
    if (url) a.href = url;
  });

  /* ---- CA display ---- */
  const short = caValid ? CONFIG.CA.slice(0, 4) + '...' + CONFIG.CA.slice(-4) : 'TBA';
  document.querySelectorAll('[data-ca]').forEach((el) => (el.textContent = caValid ? CONFIG.CA : 'TBA (drops at launch)'));
  document.querySelectorAll('[data-ca-short]').forEach((el) => (el.textContent = caValid ? short : 'TBA'));

  /* ---- toast ---- */
  const toastEl = document.getElementById('toast');
  let tt;
  function toast(msg) {
    toastEl.textContent = msg;
    toastEl.classList.add('show');
    clearTimeout(tt);
    tt = setTimeout(() => toastEl.classList.remove('show'), 2200);
  }

  /* ---- copy ---- */
  function fallbackCopy(text) {
    const ta = document.createElement('textarea');
    ta.value = text; ta.setAttribute('readonly', ''); ta.style.position = 'fixed'; ta.style.opacity = '0';
    document.body.appendChild(ta); ta.select();
    let ok = false; try { ok = document.execCommand('copy'); } catch (e) {}
    ta.remove(); return ok;
  }
  async function copyText(text) {
    try { if (navigator.clipboard && window.isSecureContext) { await navigator.clipboard.writeText(text); return true; } } catch (e) {}
    return fallbackCopy(text);
  }
  document.querySelectorAll('[data-copy-ca]').forEach((btn) => {
    btn.addEventListener('click', async () => {
      if (!caValid) { toast('CA is TBA. Only trust this site and @Catus.'); return; }
      const ok = await copyText(CONFIG.CA);
      const old = btn.dataset.label || btn.innerHTML;
      btn.dataset.label = old;
      if (ok) {
        btn.classList.add('copied');
        if (!btn.classList.contains('mbar-ca')) btn.textContent = 'Copied!';
        toast('CA copied. Never trust DMs.');
        setTimeout(() => { btn.classList.remove('copied'); btn.innerHTML = old; }, 1600);
      } else toast('Copy failed, select the CA manually');
    });
  });

  /* ---- chart ---- */
  if (caValid) {
    const f = document.createElement('iframe');
    f.src = 'https://dexscreener.com/solana/' + CONFIG.CA + '?embed=1&theme=light&trades=0&info=0';
    f.title = '$Catus chart on DexScreener'; f.loading = 'lazy';
    document.getElementById('chartFrame').appendChild(f);
    document.querySelector('.chart-box').classList.add('has-chart');
  }

  /* ---- squish feedback for touch ---- */
  document.querySelectorAll('.btn').forEach((b) => {
    b.addEventListener('pointerdown', () => b.classList.add('squish'));
    ['pointerup', 'pointerleave', 'pointercancel'].forEach((ev) => b.addEventListener(ev, () => b.classList.remove('squish')));
  });

  /* ---- googly eyes follow pointer ---- */
  const eyes = [...document.querySelectorAll('.googly')];
  let px = window.innerWidth * 0.3, py = window.innerHeight * 0.3, eyeRaf = 0;
  function updateEyes() {
    eyeRaf = 0;
    eyes.forEach((e) => {
      const r = e.getBoundingClientRect();
      if (r.bottom < 0 || r.top > window.innerHeight) return;
      const cx = r.left + r.width / 2, cy = r.top + r.height / 2;
      const dx = px - cx, dy = py - cy, d = Math.hypot(dx, dy) || 1;
      const max = r.width * 0.2, k = Math.min(1, d / 200) * max;
      e.firstElementChild.style.transform = 'translate(' + (dx / d) * k + 'px,' + (dy / d) * k + 'px)';
    });
  }
  function onPoint(x, y) { px = x; py = y; if (!eyeRaf) eyeRaf = requestAnimationFrame(updateEyes); }
  window.addEventListener('pointermove', (e) => onPoint(e.clientX, e.clientY), { passive: true });
  window.addEventListener('touchstart', (e) => { const t = e.touches[0]; onPoint(t.clientX, t.clientY); }, { passive: true });
  window.addEventListener('scroll', () => onPoint(px, py), { passive: true });
  updateEyes();

  /* ---- custom cursor ---- */
  const cur = document.getElementById('cursor');
  if (window.matchMedia('(pointer: fine)').matches && !reduced) {
    body.classList.add('has-cursor');
    const label = cur.querySelector('.cursor-label');
    window.addEventListener('pointermove', (e) => { cur.style.transform = 'translate(' + e.clientX + 'px,' + e.clientY + 'px)'; }, { passive: true });
    document.querySelectorAll('[data-cursor]').forEach((el) => {
      el.addEventListener('pointerenter', () => { label.textContent = el.dataset.cursor; cur.classList.add('on'); });
      el.addEventListener('pointerleave', () => cur.classList.remove('on'));
    });
  }

  /* ---- nav hide on scroll down ---- */
  const nav = document.getElementById('nav');
  let lastY = 0;
  window.addEventListener('scroll', () => {
    const y = window.scrollY;
    nav.classList.toggle('hide', y > lastY && y > 300);
    lastY = y;
  }, { passive: true });

  /* ---- pause off-screen loops ---- */
  if ('IntersectionObserver' in window) {
    const io = new IntersectionObserver((ents) => ents.forEach((en) => en.target.classList.toggle('paused', !en.isIntersecting)), { rootMargin: '100px' });
    document.querySelectorAll('section, .ribbon, footer').forEach((s) => io.observe(s));
  }

  /* ---- split letters ---- */
  document.querySelectorAll('[data-split]').forEach((el) => {
    el.innerHTML = [...el.textContent].map((c) => '<span class="ch">' + c + '</span>').join('');
  });

  /* ---- preloader ---- */
  const numEl = document.getElementById('loadNum');
  function finishLoad(cb) {
    if (reduced) { body.classList.add('loaded'); body.classList.remove('is-loading'); cb(); return; }
    const t0 = performance.now(), dur = 1300;
    (function tick(t) {
      const p = Math.min(1, (t - t0) / dur);
      numEl.textContent = String(Math.round(p * 100)).padStart(3, '0');
      if (p < 1) requestAnimationFrame(tick);
      else setTimeout(() => { body.classList.add('loaded'); body.classList.remove('is-loading'); cb(); }, 150);
    })(t0);
  }

  /* ---- GSAP motion ---- */
  const hasGsap = typeof window.gsap !== 'undefined' && typeof window.ScrollTrigger !== 'undefined';
  if (!hasGsap) { body.classList.add('no-gsap'); finishLoad(() => {}); zoomStatic(); return; }
  gsap.registerPlugin(ScrollTrigger);

  let lenis = null;
  if (!touch && !reduced && typeof window.Lenis !== 'undefined') {
    lenis = new Lenis({ lerp: 0.11 });
    lenis.on('scroll', ScrollTrigger.update);
    gsap.ticker.add((t) => lenis.raf(t * 1000));
    gsap.ticker.lagSmoothing(0);
    document.querySelectorAll('a[href^="#"]').forEach((a) => a.addEventListener('click', (e) => {
      const id = a.getAttribute('href'); if (id.length < 2) return;
      const t = document.querySelector(id); if (!t) return; e.preventDefault(); lenis.scrollTo(t, { offset: -70 });
    }));
  }
  const damp = touch ? 0.5 : 1;

  // word splitting for headings
  document.querySelectorAll('.words').forEach((h) => {
    h.innerHTML = h.textContent.trim().split(/\s+/).map((w) => '<span class="w">' + w + '</span>').join(' ');
  });

  if (reduced) {
    finishLoad(() => {});
    zoomStatic();
    return;
  }

  gsap.set('.split .ch', { yPercent: 110, rotate: () => gsap.utils.random(-25, 25), opacity: 0 });
  gsap.set('.hero-copy > :not(.hero-title)', { y: 24, opacity: 0 });
  gsap.set('#heroCat', { scale: 0.6, opacity: 0, rotate: -8 });
  gsap.set('.note', { opacity: 0, scale: 0.7 });

  finishLoad(() => {
    const tl = gsap.timeline();
    tl.to('.split .ch', { yPercent: 0, rotate: 0, opacity: 1, duration: 0.7, ease: 'back.out(2.2)', stagger: 0.07 })
      .to('#heroCat', { scale: 1, opacity: 1, rotate: 0, duration: 0.8, ease: 'elastic.out(1,0.55)' }, 0.1)
      .to('.hero-copy > :not(.hero-title)', { y: 0, opacity: 1, duration: 0.5, stagger: 0.07, ease: 'power2.out' }, 0.3)
      .to('.note', { opacity: 1, scale: 1, duration: 0.4, stagger: 0.12, ease: 'back.out(3)' }, 0.7);
    // idle bounce (stepped, hand-drawn feel)
    gsap.to('#heroCat', { y: -10 * damp, duration: 0.9, yoyo: true, repeat: -1, ease: 'steps(4)', delay: 1.2 });
  });

  // hero parallax
  gsap.to('.hero-room img', { yPercent: -10 * damp, ease: 'none', scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: true } });
  gsap.to('.hero-stage', { y: 60 * damp, ease: 'none', scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: true } });

  // headings word reveal
  document.querySelectorAll('.words').forEach((h) => {
    gsap.from(h.querySelectorAll('.w'), { y: 40, rotate: () => gsap.utils.random(-12, 12), opacity: 0, duration: 0.55, stagger: 0.06, ease: 'back.out(2)',
      scrollTrigger: { trigger: h, start: 'top 85%' } });
  });
  document.querySelectorAll('.outline-word').forEach((w) => {
    gsap.fromTo(w, { xPercent: -42 }, { xPercent: -58, ease: 'none', scrollTrigger: { trigger: w.parentElement, start: 'top bottom', end: 'bottom top', scrub: true } });
  });
  // sticker reveal
  gsap.utils.toArray('.reveal').forEach((el) => {
    gsap.from(el, { y: 60, scale: 0.9, opacity: 0, duration: 0.6, ease: 'back.out(1.8)', scrollTrigger: { trigger: el, start: 'top 90%' } });
  });
  gsap.from('.break-out', { y: 80, rotate: 10, opacity: 0, duration: 0.8, ease: 'back.out(2)', scrollTrigger: { trigger: '.bento', start: 'top 70%' } });
  gsap.from('.join-cat', { y: 200, rotate: -20, duration: 1, ease: 'back.out(1.6)', scrollTrigger: { trigger: '.join', start: 'top 70%' } });

  /* ---- SIGNATURE: zoomies wreck the room ---- */
  const room = document.querySelector('.z-room');
  const run = document.querySelector('.z-run'), jump = document.querySelector('.z-jump'), flop = document.querySelector('.z-flop');
  const objs = gsap.utils.toArray('.obj');
  const caps = gsap.utils.toArray('.z-cap');
  const fill = document.getElementById('meterFill'), num = document.getElementById('meterNum');
  const falls = objs.map((o, i) => ({ el: o, x: parseFloat(o.dataset.x), dir: i % 2 ? -1 : 1 }));
  let capIdx = 0;

  ScrollTrigger.create({
    trigger: '#zoomies', start: 'top top', end: () => '+=' + window.innerHeight * (touch ? 2 : 2.6), pin: true, scrub: true, anticipatePin: 1,
    onUpdate: (st) => {
      const p = st.progress;
      const W = room.clientWidth, cw = run.offsetWidth;
      const runP = Math.min(1, p / 0.82);
      const x = -cw + runP * (W + cw * 1.2);
      const midJump = runP > 0.42 && runP < 0.62;
      const hop = Math.abs(Math.sin(runP * Math.PI * 9)) * 18 * damp;
      const jy = midJump ? Math.sin(((runP - 0.42) / 0.2) * Math.PI) * 120 * damp : 0;
      gsap.set(run, { x, y: -hop, opacity: midJump || p > 0.86 ? 0 : 1, rotate: -4 });
      gsap.set(jump, { x, y: -jy, opacity: midJump && p <= 0.86 ? 1 : 0, rotate: -10 });
      const catCenter = (x + cw * 0.75) / W;
      falls.forEach((f) => {
        const k = gsap.utils.clamp(0, 1, (catCenter - f.x) / 0.08);
        const fallY = f.el.classList.contains('o-frame') ? k * room.clientHeight * 0.35 : 0;
        gsap.set(f.el, { rotate: k * 82 * f.dir, y: fallY, x: k * 30 * f.dir });
      });
      const chaos = Math.round(Math.min(1, p / 0.85) * 100);
      fill.style.width = chaos + '%';
      num.textContent = chaos + '%';
      const ci = p < 0.12 ? 0 : p < 0.4 ? 1 : p < 0.82 ? 2 : 3;
      if (ci !== capIdx) { caps[capIdx].classList.remove('is-on'); caps[ci].classList.add('is-on'); capIdx = ci; }
      const fp = gsap.utils.clamp(0, 1, (p - 0.86) / 0.1);
      gsap.set(flop, { opacity: fp, y: (1 - fp) * -80, rotate: (1 - fp) * 30, xPercent: -50 });
    },
  });

  function zoomStatic() {
    document.querySelectorAll('.z-cap').forEach((c, i, a) => c.classList.toggle('is-on', i === a.length - 1));
    document.getElementById('meterFill').style.width = '100%';
    document.getElementById('meterNum').textContent = '100%';
    document.querySelector('.z-flop').style.opacity = 1;
  }

  window.addEventListener('load', () => ScrollTrigger.refresh());
})();
