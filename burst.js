/**
 * burst.js — Pre-pooled confetti burst
 *
 * Key optimization over the original:
 *   ORIGINAL: creates N new <div>s on every burst call, appends them,
 *             then removes them via setTimeout → causes layout thrashing on mobile.
 *
 *   THIS VERSION: creates the pool ONCE at page load (max possible elements).
 *             On burst, only sets CSS custom props + toggles one class.
 *             Zero createElement / removeChild during the animation.
 *             Pure CSS @keyframes runs on the GPU compositor thread.
 */

(function () {
  const COLS = ['#ff6a00','#e8005a','#ffd700','#00e5cc','#bb44ff','#33bbff','#ccff33','#ff3fa4','#44ff88'];
  const SHAPES = ['50%', '2px', '0'];
  const isMobile = /Mobi|Android|iPhone|iPad/i.test(navigator.userAgent) || innerWidth < 600;

  // Pool size = max particles we'll ever fire in one go
  // Original fired up to 150 + 60 + 60 + 75 = 345 on desktop, 80+32+32 = 144 on mobile
  // We pool the desktop max so the same file works everywhere
  const POOL = isMobile ? 144 : 345;

  const container = document.createElement('div');
  container.id = 'burst-pool';
  document.body.appendChild(container);

  const items = [];
  for (let i = 0; i < POOL; i++) {
    const el = document.createElement('div');
    el.className = 'cp';
    const sz = (Math.random() * (isMobile ? 8 : 12) + 4) | 0;
    el.style.setProperty('--sz',  sz + 'px');
    el.style.setProperty('--br',  SHAPES[Math.floor(Math.random() * SHAPES.length)]);
    el.style.setProperty('--col', COLS[i % COLS.length]);
    container.appendChild(el);
    items.push(el);
  }

  let poolIdx = 0; // round-robin index so waves reuse different slots

  /**
   * burst(cx, cy, count)
   * Fires `count` particles from position (cx, cy).
   * Identical call signature to the original burst() function.
   */
  window.burst = function (cx, cy, count) {
    count = Math.min(count | 0, POOL);

    for (let i = 0; i < count; i++) {
      const el = items[poolIdx % POOL];
      poolIdx++;

      // Remove class to reset — one reflow per element, batched by browser
      el.classList.remove('fire');

      // Trigger reflow (needed to restart CSS animation) — void read, cheap
      // We batch all removes first then force ONE reflow via getBoundingClientRect
      // on the container instead of per-element offsetWidth
      el._needsReflow = true;
      el._cx = cx; el._cy = cy;
    }

    // Single forced reflow for ALL elements in this burst
    void container.getBoundingClientRect();

    // Now set props and re-add class — no further reflows
    let processed = 0;
    for (let i = 0; i < POOL && processed < count; i++) {
      const el = items[(poolIdx - count + processed) % POOL];
      if (!el._needsReflow) { processed++; continue; }
      el._needsReflow = false;

      const angle = Math.random() * Math.PI * 2;
      const dist  = (Math.random() * .45 + .25) * Math.min(innerWidth, innerHeight);

      el.style.left = el._cx + 'px';
      el.style.top  = el._cy + 'px';
      el.style.setProperty('--tx',  (Math.cos(angle) * dist | 0) + 'px');
      el.style.setProperty('--ty',  (Math.sin(angle) * dist | 0) + 'px');
      el.style.setProperty('--rot', ((Math.random() * 720 - 360) | 0) + 'deg');
      el.style.setProperty('--dur', (.7 + Math.random() * .8).toFixed(2) + 's');
      el.style.setProperty('--del', '0ms'); // no per-element delay = all fire at once = snappier

      el.classList.add('fire');
      processed++;
    }
  };
})();