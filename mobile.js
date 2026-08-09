const cards = [...document.querySelectorAll('.card')];
const root = document.documentElement;

let index = 0;

function setActive(i){

  cards.forEach((card, idx) => {

    // Передаём каждой карточке её цвет
    card.style.setProperty(
      '--link-color',
      card.dataset.color
    );

    card.classList.toggle('active', idx === i);
  });

  // Цвет аватарки = цвет активной карточки
  const color =
    cards[i].dataset.color || '#8b5cf6';

  root.style.setProperty('--accent', color);
}

// Первая активная
setActive(0);

// Плавный переход
setInterval(() => {
  index = (index + 1) % cards.length;
  setActive(index);
}, 2400);

/* =========================================================
   STARS
========================================================= */

const canvas = document.getElementById('stars');
const ctx = canvas.getContext('2d');

let w, h, stars = [];

function resizeStars(){
  w = canvas.width = window.innerWidth;
  h = canvas.height = window.innerHeight;

  stars = Array.from({length: 120}, () => ({
    x: Math.random() * w,
    y: Math.random() * h,
    r: Math.random() * 1.4 + 0.3,
    a: Math.random(),
    s: Math.random() * 0.004 + 0.001
  }));
}

function drawStars(){

  ctx.clearRect(0,0,w,h);

  for(const s of stars){

    s.a += s.s;

    const alpha = 0.45 + Math.sin(s.a * 8) * 0.25;

    ctx.globalAlpha = alpha;

    ctx.fillStyle = '#ffffff';

    ctx.beginPath();
    ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
    ctx.fill();
  }

  ctx.globalAlpha = 1;

  requestAnimationFrame(drawStars);
}

resizeStars();
drawStars();

window.addEventListener('resize', resizeStars);
