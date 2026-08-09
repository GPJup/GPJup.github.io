/* =========================================================
   GPJUP FINAL EVENT VERSION
========================================================= */

const canvas = document.getElementById('particles');
const ctx = canvas.getContext('2d');

let w, h, dpr;
let particles = [];

const mouse = {
  x: -999,
  y: -999,
  active: false
};

const palette = ['#8b5cf6', '#a78bfa', '#6366f1'];

const cards = [...document.querySelectorAll('.card')];
const profile = document.querySelector('.profile');

/* =========================================================
   SOUNDS
========================================================= */

const springSound = new Audio('assets/spring.mp3');
const scarySound = new Audio('assets/scary.mp3');
const fireSound = new Audio('assets/fire.mp3');

fireSound.loop = true;
fireSound.volume = 0.55;

/* =========================================================
   PARTICLES
========================================================= */

function resize() {
  dpr = Math.min(devicePixelRatio || 1, 2);

  w = innerWidth;
  h = innerHeight;

  canvas.width = w * dpr;
  canvas.height = h * dpr;

  canvas.style.width = w + 'px';
  canvas.style.height = h + 'px';

  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

  particles = Array.from(
    { length: Math.min(240, Math.max(90, Math.floor(w * h / 7000))) },
    () => ({
      x: Math.random() * w,
      y: Math.random() * h,
      vx: (Math.random() - .5) * .2,
      vy: (Math.random() - .5) * .2,
      r: .5 + Math.random() * 1.5,
      c: palette[Math.floor(Math.random() * palette.length)],
      life: Math.random() * 6.28
    })
  );
}

function frame() {
  ctx.clearRect(0, 0, w, h);

  for (const p of particles) {
    p.life += .008;

    p.x += p.vx + Math.sin(p.life) * .025;
    p.y += p.vy + Math.cos(p.life) * .025;

    if (p.x < -20) p.x = w + 20;
    if (p.x > w + 20) p.x = -20;
    if (p.y < -20) p.y = h + 20;
    if (p.y > h + 20) p.y = -20;

    const dx = p.x - mouse.x;
    const dy = p.y - mouse.y;
    const dist = Math.hypot(dx, dy);

    let alpha = .2;

    if (mouse.active && dist < 115) {
      const t = 1 - dist / 115;
      alpha = .2 + .55 * t;

      if (dist > 0) {
        p.x += (dx / dist) * t * .5;
        p.y += (dy / dist) * t * .5;
      }
    }

    ctx.globalAlpha = alpha;
    ctx.fillStyle = p.c;
    ctx.beginPath();
    ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
    ctx.fill();
  }

  ctx.globalAlpha = 1;

  requestAnimationFrame(frame);
}

/* =========================================================
   MOUSE
========================================================= */

addEventListener('pointermove', e => {
  mouse.x = e.clientX;
  mouse.y = e.clientY;
  mouse.active = true;
});

addEventListener('pointerleave', () => {
  mouse.active = false;
});

/* =========================================================
   POO
========================================================= */

const poo = document.createElement('img');
poo.id = 'poo';
poo.src = 'assets/poo.png';
document.body.appendChild(poo);

let pooX = 200;
let pooY = 200;
let pooVX = 2.1;
let pooVY = 1.7;
let pooSize = innerWidth <= 760 ? 65 : 85;

let eventTriggered = false;

function resetPoo() {
  pooX = Math.random() * (w - pooSize);
  pooY = Math.random() * (h - pooSize);
}

function updatePoo() {
  poo.style.left = pooX + 'px';
  poo.style.top = pooY + 'px';
}

/* =========================================================
   COLLISIONS
========================================================= */

function bounceRect(rect) {
  const left = pooX;
  const right = pooX + pooSize;
  const top = pooY;
  const bottom = pooY + pooSize;

  if (
    right < rect.left ||
    left > rect.right ||
    bottom < rect.top ||
    top > rect.bottom
  ) return;

  const overlapX = Math.min(right - rect.left, rect.right - left);
  const overlapY = Math.min(bottom - rect.top, rect.bottom - top);

  if (overlapX < overlapY) {
    pooVX *= -1;
  } else {
    pooVY *= -1;
  }
}

/* =========================================================
   MAIN LOOP
========================================================= */

function pooLoop() {
  if (!eventTriggered) {
    pooX += pooVX;
    pooY += pooVY;

    if (pooX <= 0) { pooX = 0; pooVX = Math.abs(pooVX); }
    if (pooX + pooSize >= w) { pooX = w - pooSize; pooVX = -Math.abs(pooVX); }

    if (pooY <= 0) { pooY = 0; pooVY = Math.abs(pooVY); }
    if (pooY + pooSize >= h) { pooY = h - pooSize; pooVY = -Math.abs(pooVY); }

    cards.forEach(c => bounceRect(c.getBoundingClientRect()));
    if (profile) bounceRect(profile.getBoundingClientRect());

    const touchingLeft = pooX <= 2;
    const touchingRight = pooX + pooSize >= w - 2;
    const touchingTop = pooY <= 2;
    const touchingBottom = pooY + pooSize >= h - 2;

    if ((touchingLeft || touchingRight) && (touchingTop || touchingBottom)) {
      triggerEvent();
    }

    updatePoo();
  }

  requestAnimationFrame(pooLoop);
}

/* =========================================================
   OGSCULE
========================================================= */

const og = document.createElement('img');
og.id = 'ogscule';
og.src = 'assets/ogscule.png';
document.body.appendChild(og);

function triggerEvent() {
  if (eventTriggered) return;
  eventTriggered = true;

  springSound.currentTime = 0;
  springSound.play();

  const startX = pooX < w / 2 ? 40 : w - 40;
  const startY = pooY < h / 2 ? 40 : h - 40;

  og.style.left = startX + 'px';
  og.style.top = startY + 'px';
  og.style.opacity = '1';

  og.animate(
    [
      {
        transform: 'translate(-50%, -50%) scale(0.1)'
      },
      {
        left: '50%',
        top: '50%',
        transform: 'translate(-50%, -50%) scale(1.3)'
      },
      {
        left: '50%',
        top: '50%',
        transform: 'translate(-50%, -50%) scale(1)'
      }
    ],
    {
      duration: 1600,
      easing: 'cubic-bezier(.22,1.3,.4,1)',
      fill: 'forwards'
    }
  ).onfinish = () => {

    springSound.currentTime = 0;
    springSound.play();

    og.animate(
      [
        { transform: 'translate(-50%, -50%) scale(1)' },
        { transform: 'translate(-50%, -50%) scale(1.18,.82)' },
        { transform: 'translate(-50%, -50%) scale(.88,1.12)' },
        { transform: 'translate(-50%, -50%) scale(1.06,.94)' },
        { transform: 'translate(-50%, -50%) scale(1)' }
      ],
      {
        duration: 700,
        easing: 'cubic-bezier(.2,1.5,.4,1)'
      }
    ).onfinish = () => {

      scarySound.currentTime = 0;
      scarySound.play();

      og.animate(
        [
          {
            transform: 'translate(-50%, -50%) scale(1)',
            opacity: 1
          },
          {
            transform: 'translate(-50%, 120vh) scale(.9)',
            opacity: 0
          }
        ],
        {
          duration: 1200,
          easing: 'cubic-bezier(.7,0,1,1)',
          fill: 'forwards'
        }
      );

      movePooToCenter();
    };
  };
}

/* =========================================================
   POO CENTER + FALL
========================================================= */

function movePooToCenter() {
  const centerX = w / 2 - pooSize;
  const centerY = h / 2 - pooSize;

  poo.animate(
    [
      {
        left: pooX + 'px',
        top: pooY + 'px',
        transform: 'scale(1)'
      },
      {
        left: centerX + 'px',
        top: centerY + 'px',
        transform: 'scale(2)'
      }
    ],
    {
      duration: 1200,
      easing: 'cubic-bezier(.2,.8,.2,1)',
      fill: 'forwards'
    }
  ).onfinish = () => {

    pooX = centerX;
    pooY = centerY;

    poo.style.left = centerX + 'px';
    poo.style.top = centerY + 'px';
    poo.style.transform = 'scale(2)';

    fallPoo();
  };
}

function fallPoo() {
  const floorY = h - pooSize * 2 - 10;

  poo.animate(
    [
      {
        top: pooY + 'px',
        transform: 'scale(2)'
      },
      {
        top: floorY + 'px',
        transform: 'scale(2)'
      }
    ],
    {
      duration: 1400,
      easing: 'cubic-bezier(.12,.75,.18,1)',
      fill: 'forwards'
    }
  ).onfinish = () => {

    pooY = floorY;

    poo.style.top = floorY + 'px';
    poo.style.transform = 'scale(2)';

    startBurning();
  };
}

/* =========================================================
   FIRE
========================================================= */

function addFire(el) {
  const r = el.getBoundingClientRect();

  const fire = document.createElement('img');
  fire.src = 'assets/fire.gif';
  fire.className = 'real-fire';

  Object.assign(fire.style, {
    position: 'fixed',
    left: (r.left - 20) + 'px',
    top: (r.top - 10) + 'px',
    width: (r.width + 40) + 'px',
    height: (r.height + 20) + 'px',
    objectFit: 'cover',
    pointerEvents: 'none',
    zIndex: 50,
    mixBlendMode: 'screen'
  });

  document.body.appendChild(fire);

  el.animate(
    [
      { filter: 'brightness(1)', opacity: 1 },
      { filter: 'brightness(1.4)', opacity: 1, offset: .3 },
      { filter: 'brightness(.5) saturate(.4)', opacity: .9, offset: .7 },
      { filter: 'brightness(0) saturate(0) blur(3px)', opacity: 0 }
    ],
    {
      duration: 3000,
      easing: 'ease',
      fill: 'forwards'
    }
  );

  setTimeout(() => fire.remove(), 3200);
}

function startBurning() {
  fireSound.currentTime = 0;
  fireSound.play();

  const all = [profile, ...cards];

  all.forEach((el, i) => {
    setTimeout(() => addFire(el), i * 180);
  });

  setTimeout(() => {
    fireSound.pause();
  }, 6500);
}

/* =========================================================
   START
========================================================= */

resize();
addEventListener('resize', resize);

resetPoo();
updatePoo();

pooLoop();
frame();
