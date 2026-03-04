const COLS = ['#ff6a00','#e8005a','#ffd700','#00e5cc','#bb44ff','#33bbff','#ccff33','#ff3fa4','#44ff88'];
const isMobile = /Mobi|Android|iPhone|iPad/i.test(navigator.userAgent) || innerWidth < 600;

/* ── Background powder dots (exact same as original) ── */
const DOT_COUNT = isMobile ? 18 : 30;
const bdEl = document.getElementById('bgDots');
for (let i = 0; i < DOT_COUNT; i++) {
  const d = document.createElement('div');
  d.className = 'dot';
  const size = Math.random() * 5 + 3;
  const dur  = Math.random() * 8 + 6;
  d.style.cssText = `
    left:${Math.random()*100}%;
    top:-${Math.random()*20}px;
    width:${size}px;height:${size}px;
    background:${COLS[Math.floor(Math.random()*COLS.length)]};
    opacity:${Math.random()*.55+.25};
    animation-duration:${dur}s;
    animation-delay:-${Math.random()*dur}s;
    --dx:${(Math.random()-.5)*60}px;
  `;
  bdEl.appendChild(d);
}

/* ── showCard (exact same logic as original) ── */
function showCard() {
  const name = document.getElementById('nameInput').value.trim() || 'Friend';
  document.getElementById('displayName').textContent = name;

  const cx = innerWidth / 2, cy = innerHeight / 2;
  const COUNT = isMobile ? 80 : 150;

  burst(cx, cy, COUNT);
  setTimeout(() => burst(cx * .3,  cy * .4, COUNT * .4), 250);
  setTimeout(() => burst(cx * 1.7, cy * .3, COUNT * .4), 450);
  if (!isMobile) setTimeout(() => burst(cx, cy * .8, COUNT * .5), 600);

  const scr = document.getElementById('inputScreen');
  scr.style.transition = 'opacity .6s';
  scr.style.opacity = '0';
  setTimeout(() => {
    scr.style.display = 'none';
    document.getElementById('card').style.display = 'block';
  }, 620);
}

document.getElementById('nameInput').addEventListener('keydown', e => {
  if (e.key === 'Enter') showCard();
});