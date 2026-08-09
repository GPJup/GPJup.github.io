const cards = [...document.querySelectorAll('.card')];
const root = document.documentElement;

let index = 0;

function setActive(i){
  cards.forEach((card, idx) => {
    card.classList.toggle('active', idx === i);
  });

  const color =
    cards[i].dataset.color || '#8b5cf6';

  root.style.setProperty('--accent', color);
}

setActive(0);

setInterval(() => {
  index = (index + 1) % cards.length;
  setActive(index);
}, 2200);