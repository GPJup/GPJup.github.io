const cards = [...document.querySelectorAll('.card')];
const root = document.documentElement;

let index = 0;

function setActive(i){

  cards.forEach((card, idx) => {
    card.classList.toggle('active', idx === i);
  });

  const color =
    cards[i].dataset.color || '#8b5cf6';

  // Цвет аватарки
  root.style.setProperty('--accent', color);
}

// Первая активная
setActive(0);

// Плавный переход каждые 2.4 секунды
setInterval(() => {
  index = (index + 1) % cards.length;
  setActive(index);
}, 2400);
