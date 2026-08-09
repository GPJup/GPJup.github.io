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
