/* =========================================================
   GPJUP - FULL SCRIPT
   ========================================================= */

/* =========================================================
   CANVAS / PARTICLES
========================================================= */

const canvas = document.getElementById("particles");
const ctx = canvas.getContext("2d");

let w = window.innerWidth;
let h = window.innerHeight;
let dpr = Math.min(window.devicePixelRatio || 1, 2);

const mouse = {
    x: -9999,
    y: -9999,
    active: false
};

const palette = [
    "#8b5cf6",
    "#a78bfa",
    "#6366f1"
];

let particles = [];


/* =========================================================
   ELEMENTS
========================================================= */

const cards = [
    ...document.querySelectorAll(".card")
];

const profile =
    document.querySelector(".profile");


/* =========================================================
   AUDIO
========================================================= */

const sounds = {
    spring: new Audio("assets/spring.mp3"),
    scary: new Audio("assets/scary.mp3"),
    fire: new Audio("assets/fire.mp3")
};
/* =========================================================
   MUSIC PLAYER
========================================================= */

const musicTracks = [ 
   'music/1.mp3', 
   'music/2.mp3', 
   'music/3.mp3', 
   'music/4.mp3' 
];

let musicEnabled = false;
let soundEnabled = false;

const music = new Audio();
music.preload = 'auto';
music.volume = 0.45;

let currentTrack = -1;

function playRandomTrack() {
  if (!musicEnabled || musicTracks.length === 0) return;

  let next;

  do {
    next = Math.floor(Math.random() * musicTracks.length);
  } while (musicTracks.length > 1 && next === currentTrack);

  currentTrack = next;
  music.src = musicTracks[next];
  music.play().catch(()=>{});
}

music.addEventListener('ended', playRandomTrack);

const musicBtn = document.getElementById('musicBtn');
const soundBtn = document.getElementById('soundBtn');
const skipBtn = document.getElementById('skipBtn');

musicBtn.addEventListener('click', () => {
  unlockAudio();

  musicEnabled = !musicEnabled;
  musicBtn.classList.toggle('active', musicEnabled);

  if (musicEnabled) {
    playRandomTrack();
  } else {
    music.pause();
  }
});

soundBtn.addEventListener('click', () => {
  unlockAudio();

  soundEnabled = !soundEnabled;
  soundBtn.classList.toggle('active', soundEnabled);
});

skipBtn.addEventListener('click', () => {
  if (!musicEnabled) return;
  playRandomTrack();
});
Object.values(sounds).forEach(audio => {
    audio.preload = "auto";
});

let audioUnlocked = false;


/*
    Браузеры иногда запрещают звук,
    пока пользователь хотя бы один раз
    не взаимодействовал со страницей.
*/

function unlockAudio() {
    if (audioUnlocked) {
        return;
    }

    audioUnlocked = true;

    Object.values(sounds).forEach(audio => {
        try {
            audio.volume = 0;
            audio.play()
                .then(() => {
                    audio.pause();
                    audio.currentTime = 0;
                    audio.volume = 1;
                })
                .catch(() => {
                    audio.volume = 1;
                });
        } catch (error) {
            audio.volume = 1;
        }
    });
}

window.addEventListener(
    "pointerdown",
    unlockAudio,
    {
        once: false,
        passive: true
    }
);

window.addEventListener(
    "touchstart",
    unlockAudio,
    {
        once: false,
        passive: true
    }
);


/*
    Проигрывание звука.
*/

function playSound(name, volume = 1) {
   if (!soundEnabled) return;
    
   const audio = sounds[name];

    if (!audio) {
        return;
    }

    try {
        audio.pause();
        audio.currentTime = 0;
        audio.volume = volume;

        const promise = audio.play();

        if (promise) {
            promise.catch(() => {
                /*
                    Если браузер всё ещё блокирует
                    звук, пробуем после следующего
                    взаимодействия.
                */
            });
        }
    } catch (error) {
        console.warn(
            "Не удалось проиграть звук:",
            name
        );
    }
}


/* =========================================================
   PARTICLES
========================================================= */

function createParticles() {
    const amount = Math.min(
        240,
        Math.max(
            90,
            Math.floor(
                (w * h) / 7000
            )
        )
    );

    particles = Array.from(
        {
            length: amount
        },
        () => ({
            x: Math.random() * w,
            y: Math.random() * h,

            vx:
                (Math.random() - 0.5) *
                0.2,

            vy:
                (Math.random() - 0.5) *
                0.2,

            r:
                0.5 +
                Math.random() * 1.5,

            color:
                palette[
                    Math.floor(
                        Math.random() *
                        palette.length
                    )
                ],

            phase:
                Math.random() *
                Math.PI *
                2
        })
    );
}


function resizeCanvas() {
    w = window.innerWidth;
    h = window.innerHeight;

    dpr = Math.min(
        window.devicePixelRatio || 1,
        2
    );

    canvas.width =
        w * dpr;

    canvas.height =
        h * dpr;

    canvas.style.width =
        `${w}px`;

    canvas.style.height =
        `${h}px`;

    ctx.setTransform(
        dpr,
        0,
        0,
        dpr,
        0,
        0
    );

    createParticles();
}


function hexToRgb(hex) {
    hex =
        hex.replace("#", "");

    if (hex.length === 3) {
        hex =
            hex
                .split("")
                .map(x => x + x)
                .join("");
    }

    const n =
        parseInt(hex, 16);

    return [
        (n >> 16) & 255,
        (n >> 8) & 255,
        n & 255
    ];
}


function mixColor(
    a,
    b,
    amount
) {
    const A =
        hexToRgb(a);

    const B =
        hexToRgb(b);

    return `rgb(${
        A.map(
            (value, index) =>
                Math.round(
                    value +
                    (B[index] - value) *
                    amount
                )
        ).join(",")
    })`;
}


function particleFrame() {
    ctx.clearRect(
        0,
        0,
        w,
        h
    );

    for (const p of particles) {

        p.phase += 0.008;

        p.x +=
            p.vx +
            Math.sin(
                p.phase
            ) * 0.025;

        p.y +=
            p.vy +
            Math.cos(
                p.phase
            ) * 0.025;


        if (p.x < -20) {
            p.x = w + 20;
        }

        if (p.x > w + 20) {
            p.x = -20;
        }

        if (p.y < -20) {
            p.y = h + 20;
        }

        if (p.y > h + 20) {
            p.y = -20;
        }


        let color =
            p.color;

        let alpha = 0.2;


        const dx =
            p.x - mouse.x;

        const dy =
            p.y - mouse.y;

        const distance =
            Math.hypot(
                dx,
                dy
            );


        /*
            Белая подсветка
            вокруг курсора.
        */

        if (
            mouse.active &&
            distance < 120
        ) {

            const power =
                1 -
                distance / 120;

            color =
                mixColor(
                    p.color,
                    "#ffffff",
                    power * 0.9
                );

            alpha =
                0.2 +
                power * 0.6;


            /*
                Разлёт частиц.
            */

            if (distance > 0) {

                const force =
                    power * 0.65;

                p.x +=
                    (dx / distance) *
                    force;

                p.y +=
                    (dy / distance) *
                    force;
            }
        }


        ctx.globalAlpha =
            alpha;

        ctx.fillStyle =
            color;

        ctx.beginPath();

        ctx.arc(
            p.x,
            p.y,
            p.r,
            0,
            Math.PI * 2
        );

        ctx.fill();
    }

    ctx.globalAlpha = 1;

    requestAnimationFrame(
        particleFrame
    );
}


/* =========================================================
   MOUSE
========================================================= */

window.addEventListener(
    "pointermove",
    event => {

        mouse.x =
            event.clientX;

        mouse.y =
            event.clientY;

        mouse.active = true;
    },
    {
        passive: true
    }
);


window.addEventListener(
    "pointerleave",
    () => {
        mouse.active = false;
    }
);


/* =========================================================
   CARD LIGHTING
========================================================= */

cards.forEach(card => {

    const color =
        card.dataset.color ||
        "#8b5cf6";


    card.style.setProperty(
        "--link-color",
        color
    );


    card.addEventListener(
        "pointerenter",
        () => {

            document.documentElement.style.setProperty(
                "--accent",
                color
            );
        }
    );


    card.addEventListener(
        "pointermove",
        event => {

            const rect =
                card.getBoundingClientRect();


            card.style.setProperty(
                "--mx",
                `${event.clientX - rect.left}px`
            );


            card.style.setProperty(
                "--my",
                `${event.clientY - rect.top}px`
            );
        }
    );
});


/* =========================================================
   POO
========================================================= */

const poo =
    document.createElement("img");

poo.id = "poo";

poo.src =
    "assets/poo.png";

poo.alt = "";

poo.draggable = false;

poo.style.position =
    "fixed";

poo.style.zIndex =
    "50";

poo.style.pointerEvents =
    "none";

poo.style.userSelect =
    "none";

poo.style.display =
    "block";

poo.style.willChange =
    "left, top, transform";

document.body.appendChild(
    poo
);


let pooBaseSize =
    window.innerWidth <= 760
        ? 65
        : 85;

let pooSize =
    pooBaseSize;

let pooX = 150;
let pooY = 150;

let pooVX = 2.2;
let pooVY = 1.8;

let pooSquash = 0;

let eventStarted = false;

let pooFinalAnimation = false;


/* =========================================================
   POO INIT
========================================================= */

function resetPoo() {

    pooSize =
        window.innerWidth <= 760
            ? 58
            : 85;

    pooBaseSize = pooSize;

    const obstacles = [profile, ...cards].filter(Boolean);

    let attempts = 0;
    let valid = false;

    while (!valid && attempts < 200) {

        attempts++;

        pooX =
            Math.random() *
            Math.max(1, w - pooSize);

        pooY =
            Math.random() *
            Math.max(1, h - pooSize);

        const rect = {
            left: pooX,
            right: pooX + pooSize,
            top: pooY,
            bottom: pooY + pooSize
        };

        valid = obstacles.every(el => {

            const r = el.getBoundingClientRect();

            return (
                rect.right < r.left - 12 ||
                rect.left > r.right + 12 ||
                rect.bottom < r.top - 12 ||
                rect.top > r.bottom + 12
            );
        });
    }

    const angle =
        Math.random() *
        Math.PI * 2;

    const speed = 2.2;

    pooVX =
        Math.cos(angle) * speed;

    pooVY =
        Math.sin(angle) * speed;

    poo.style.width =
        `${pooSize}px`;

    poo.style.height =
        `${pooSize}px`;
}

/* =========================================================
   POO VS RECTANGLE
========================================================= */

function bouncePooFromRect(
    rect
) {

    if (eventStarted) {
        return;
    }


    const left =
        pooX;

    const right =
        pooX + pooSize;

    const top =
        pooY;

    const bottom =
        pooY + pooSize;


    if (
        right < rect.left ||
        left > rect.right ||
        bottom < rect.top ||
        top > rect.bottom
    ) {
        return;
    }


    const fromLeft =
        right - rect.left;

    const fromRight =
        rect.right - left;

    const fromTop =
        bottom - rect.top;

    const fromBottom =
        rect.bottom - top;


    const horizontal =
        Math.min(
            fromLeft,
            fromRight
        );

    const vertical =
        Math.min(
            fromTop,
            fromBottom
        );


    if (
        horizontal <
        vertical
    ) {

        pooVX *= -1;

        if (
            left <
            rect.left
        ) {

            pooX =
                rect.left -
                pooSize -
                2;

        } else {

            pooX =
                rect.right +
                2;
        }

    } else {

        pooVY *= -1;

        if (
            top <
            rect.top
        ) {

            pooY =
                rect.top -
                pooSize -
                2;

        } else {

            pooY =
                rect.bottom +
                2;
        }
    }


    pooSquash = 1;
}


/* =========================================================
   POO VS CURSOR
========================================================= */

function bouncePooFromCursor() {

    if (
        !mouse.active ||
        eventStarted
    ) {
        return;
    }


    const centerX =
        pooX +
        pooSize / 2;

    const centerY =
        pooY +
        pooSize / 2;


    const dx =
        centerX -
        mouse.x;

    const dy =
        centerY -
        mouse.y;


    const distance =
        Math.hypot(
            dx,
            dy
        );


    const collisionRadius =
        pooSize * 0.5 +
        12;


    if (
        distance <
            collisionRadius &&
        distance > 0
    ) {

        const nx =
            dx / distance;

        const ny =
            dy / distance;


        const speed =
            Math.max(
                2.5,
                Math.hypot(
                    pooVX,
                    pooVY
                )
            );


        pooVX =
            nx * speed;

        pooVY =
            ny * speed;


        pooX +=
            nx * 10;

        pooY +=
            ny * 10;


        pooSquash = 1;
    }
}


/* =========================================================
   POO VISUAL
========================================================= */

function updatePooVisual() {

    if (
        pooFinalAnimation
    ) {
        return;
    }


    pooSquash *= 0.86;


    const squash =
        Math.min(
            pooSquash,
            1
        );


    const scaleX =
        1 -
        squash * 0.22;

    const scaleY =
        1 +
        squash * 0.16;


    poo.style.transform =
        `scale(
            ${scaleX},
            ${scaleY}
        )`;
}


/* =========================================================
   POO EDGES
========================================================= */

function checkPooEdges() {

    // На телефоне оставляем рамку вокруг контента
    const margin =
        window.innerWidth <= 760
            ? 14
            : 0;

    if (pooY <= margin) {

        pooY = margin;

        pooVY =
            Math.abs(pooVY);

        pooSquash = 1;
    }

    if (pooX <= margin) {

        pooX = margin;

        pooVX =
            Math.abs(pooVX);

        pooSquash = 1;
    }

    if (
        pooX + pooSize >=
        w - margin
    ) {

        pooX =
            w - margin - pooSize;

        pooVX =
            -Math.abs(pooVX);

        pooSquash = 1;
    }

    if (
        pooY + pooSize >=
        h - margin
    ) {

        pooY =
            h - margin - pooSize;

        pooVY =
            -Math.abs(pooVY);

        pooSquash = 1;
    }


    /*
        Проверяем угол.
    */

    const atLeft =
        pooX <= 1;

    const atRight =
        pooX +
        pooSize >=
        w - 1;

    const atTop =
        pooY <= 1;

    const atBottom =
        pooY +
        pooSize >=
        h - 1;


    if (
        (atLeft || atRight) &&
        (atTop || atBottom)
    ) {

        startMainEvent(
            atLeft,
            atTop
        );
    }
}


/* =========================================================
   POO LOOP
========================================================= */

function pooLoop() {

    /*
        После начала финальной сцены
        НИЧЕГО больше не меняем
        через обычную физику.
    */

    if (
        !eventStarted
    ) {

        pooX +=
            pooVX;

        pooY +=
            pooVY;


        checkPooEdges();


        cards.forEach(
            card => {

                bouncePooFromRect(
                    card.getBoundingClientRect()
                );
            }
        );


        if (profile) {

            bouncePooFromRect(
                profile.getBoundingClientRect()
            );
        }


        bouncePooFromCursor();


        poo.style.left =
            `${pooX}px`;

        poo.style.top =
            `${pooY}px`;


        updatePooVisual();
    }


    requestAnimationFrame(
        pooLoop
    );
}


/* =========================================================
   OGSCULE
========================================================= */

const ogscule =
    document.createElement("img");

ogscule.id =
    "ogscule";

ogscule.src =
    "assets/ogscule.png";

ogscule.alt = "";

ogscule.style.position =
    "fixed";

ogscule.style.zIndex =
    "200";

ogscule.style.pointerEvents =
    "none";

ogscule.style.display =
    "block";

ogscule.style.opacity =
    "0";

ogscule.style.width =
    "180px";

ogscule.style.height =
    "180px";

ogscule.style.objectFit =
    "contain";

ogscule.style.willChange =
    "left, top, transform, opacity";

document.body.appendChild(
    ogscule
);


/* =========================================================
   FIRE LAYER
========================================================= */

const fireLayer =
    document.createElement("div");

fireLayer.id =
    "fire-layer";

fireLayer.style.position =
    "fixed";

fireLayer.style.inset =
    "0";

fireLayer.style.zIndex =
    "150";

fireLayer.style.pointerEvents =
    "none";

fireLayer.style.overflow =
    "visible";

document.body.appendChild(
    fireLayer
);


/* =========================================================
   CREATE FIRE
========================================================= */

function createFire(rect) {

    const fire =
        document.createElement("img");


    fire.src =
        "assets/fire.gif";


    fire.alt = "";


    fire.style.position =
        "fixed";


    fire.style.left =
        `${rect.left - 20}px`;


    fire.style.top =
        `${rect.top - 20}px`;


    fire.style.width =
        `${rect.width + 40}px`;


    fire.style.height =
        `${rect.height + 40}px`;


    fire.style.objectFit =
        "fill";


    fire.style.pointerEvents =
        "none";


    fire.style.display =
        "block";


    fire.style.opacity =
        "0";


    fire.style.visibility =
        "visible";


    fire.style.mixBlendMode =
        "screen";


    fire.style.filter =
        "drop-shadow(0 0 18px rgba(255,80,0,.95))";


    fire.style.transition =
        "opacity .3s ease";


    fireLayer.appendChild(
        fire
    );


    /*
        Форсируем появление GIF.
    */

    requestAnimationFrame(
        () => {

            fire.style.opacity =
                "1";
        }
    );


    return fire;
}


/* =========================================================
   BURN ONE ELEMENT
========================================================= */

function burnElement(
    element,
    delay
) {

    setTimeout(
        () => {

            if (!element) {
                return;
            }


            const rect =
                element.getBoundingClientRect();


            /*
                Сначала ставим огонь.
            */

            createFire(rect);


            /*
                Затем сама плашка
                начинает темнеть.
            */

            element.style.transition =
                "filter 2.8s ease, opacity 2.8s ease, transform 2.8s ease";


            element.style.filter =
                "brightness(1.4) saturate(1.5)";


            setTimeout(
                () => {

                    element.style.filter =
                        "brightness(.45) saturate(.4)";
                },
                700
            );


            setTimeout(
                () => {

                    element.style.filter =
                        "brightness(.08) saturate(0) blur(2px)";
                },
                1500
            );


            setTimeout(
                () => {

                    element.style.opacity =
                        "0";

                    element.style.transform =
                        "scale(.94)";
                },
                2200
            );

        },
        delay
    );
}


/* =========================================================
   START BURNING
========================================================= */

function startBurning() {

    playSound(
        "fire",
        1
    );


    /*
        Одновременно сгорают
        ВСЕ плашки.

        Включая левую profile.
    */

    const elements = [
        profile,
        ...cards
    ].filter(Boolean);


    elements.forEach(
        (element, index) => {

            burnElement(
                element,
                index * 180
            );
        }
    );
}


/* =========================================================
   MAIN EVENT
========================================================= */

function startMainEvent(
    fromLeft,
    fromTop
) {

    if (
        eventStarted
    ) {
        return;
    }


    eventStarted = true;


    pooVX = 0;
    pooVY = 0;


    /*
        Убираем poo с обычной физики.
    */

    poo.style.zIndex =
        "50";


    /*
        Координата угла.
    */

    const cornerX =
        fromLeft
            ? 20
            : w - 20;

    const cornerY =
        fromTop
            ? 20
            : h - 20;


    /*
        Центр экрана.
    */

    const centerX =
        w / 2;

    const centerY =
        h / 2;


    /*
        OGSCULE.
    */

    ogscule.style.opacity =
        "1";

    ogscule.style.left =
        `${cornerX}px`;

    ogscule.style.top =
        `${cornerY}px`;


    /*
        Пружина.
    */

    playSound(
        "spring",
        1
    );


    const animation =
        ogscule.animate(
            [
                {
                    left:
                        `${cornerX}px`,
                    top:
                        `${cornerY}px`,
                    transform:
                        "translate(-50%, -50%) scale(.15)"
                },

                {
                    left:
                        `${centerX}px`,
                    top:
                        `${centerY}px`,
                    transform:
                        "translate(-50%, -50%) scale(1.7)"
                },

                {
                    left:
                        `${centerX}px`,
                    top:
                        `${centerY}px`,
                    transform:
                        "translate(-50%, -50%) scale(2.15, 1.75)"
                },

                {
                    left:
                        `${centerX}px`,
                    top:
                        `${centerY}px`,
                    transform:
                        "translate(-50%, -50%) scale(1.82, 2.15)"
                },

                {
                    left:
                        `${centerX}px`,
                    top:
                        `${centerY}px`,
                    transform:
                        "translate(-50%, -50%) scale(2)"
                }
            ],
            {
                duration: 1900,
                easing:
                    "cubic-bezier(.22,1.25,.45,1)",
                fill:
                    "forwards"
            }
        );


    animation.onfinish =
        () => {

            playSound(
                "spring",
                0.8
            );


            const spring =
                ogscule.animate(
                    [
                        {
                            transform:
                                "translate(-50%, -50%) scale(2)"
                        },

                        {
                            transform:
                                "translate(-50%, -50%) scale(2.25, 1.75)"
                        },

                        {
                            transform:
                                "translate(-50%, -50%) scale(1.8, 2.18)"
                        },

                        {
                            transform:
                                "translate(-50%, -50%) scale(2.08, 1.92)"
                        },

                        {
                            transform:
                                "translate(-50%, -50%) scale(2)"
                        }
                    ],
                    {
                        duration: 750,
                        easing:
                            "cubic-bezier(.2,1.5,.4,1)",
                        fill:
                            "forwards"
                    }
                );


            spring.onfinish =
                () => {

                    /*
                        Крики.
                    */

                    playSound(
                        "scary",
                        1
                    );


                    /*
                        OGSCULE падает вниз.
                    */

                    const fall =
                        ogscule.animate(
                            [
                                {
                                    top:
                                        `${centerY}px`,
                                    opacity: 1,
                                    transform:
                                        "translate(-50%, -50%) scale(2)"
                                },

                                {
                                    top:
                                        `${centerY + 70}px`,
                                    opacity: 1,
                                    transform:
                                        "translate(-50%, -50%) scale(2.1,1.9)"
                                },

                                {
                                    top:
                                        `${h + 300}px`,
                                    opacity: 0,
                                    transform:
                                        "translate(-50%, -50%) scale(1.75,2.2)"
                                }
                            ],
                            {
                                duration: 1300,
                                easing:
                                    "cubic-bezier(.65,0,1,1)",
                                fill:
                                    "forwards"
                            }
                        );


                    fall.onfinish =
                        () => {

                            ogscule.style.display =
                                "none";


                            movePooToCenter();
                        };
                };
        };
}


/* =========================================================
   POO -> CENTER
========================================================= */

function movePooToCenter() {

    pooFinalAnimation =
        true;


    /*
        Фиксируем размер.
        Теперь это именно 2x.
    */

    const finalSize =
        pooBaseSize * 2;


    poo.style.width =
        `${finalSize}px`;

    poo.style.height =
        `${finalSize}px`;


    const targetX =
        w / 2 -
        finalSize / 2;


    const targetY =
        h / 2 -
        finalSize / 2;


    const startX =
        pooX;


    const startY =
        pooY;


    const startTime =
        performance.now();


    const duration =
        1100;


    function fly(now) {

        const progress =
            Math.min(
                1,
                (now - startTime) /
                duration
            );


        const eased =
            1 -
            Math.pow(
                1 - progress,
                3
            );


        pooX =
            startX +
            (targetX - startX) *
            eased;


        pooY =
            startY +
            (targetY - startY) *
            eased;


        poo.style.left =
            `${pooX}px`;


        poo.style.top =
            `${pooY}px`;


        /*
            Именно здесь
            poo увеличивается в 2 раза.
        */

        const scale =
            1 +
            eased;


        poo.style.transform =
            `scale(${scale})`;


        if (
            progress < 1
        ) {

            requestAnimationFrame(
                fly
            );

        } else {

            dropPoo(
                finalSize
            );
        }
    }


    requestAnimationFrame(
        fly
    );
}


/* =========================================================
   POO DROP
========================================================= */

function dropPoo(
    finalSize
) {

    const finalX =
        w / 2 -
        finalSize / 2;


    const startY =
        h / 2 -
        finalSize / 2;


    const floorY =
        h -
        finalSize;


    const startTime =
        performance.now();


    const duration =
        900;


    function fall(now) {

        const progress =
            Math.min(
                1,
                (now - startTime) /
                duration
            );


        const eased =
            progress *
            progress;


        const y =
            startY +
            (floorY - startY) *
            eased;


        poo.style.left =
            `${finalX}px`;


        poo.style.top =
            `${y}px`;


        /*
            Во время падения
            немного вытягиваем.
        */

        let scaleX = 2;
        let scaleY = 2;


        if (
            progress > 0.82
        ) {

            const impact =
                (progress - 0.82) /
                0.18;


            scaleX =
                2 +
                impact * 0.15;


            scaleY =
                2 -
                impact * 0.18;
        }


        poo.style.transform =
            `scale(${scaleX},${scaleY})`;


        if (
            progress < 1
        ) {

            requestAnimationFrame(
                fall
            );

        } else {

            /*
                Фиксируем poo на полу.
            */

            poo.style.left =
                `${finalX}px`;

            poo.style.top =
                `${floorY}px`;

            poo.style.transform =
                "scale(2,2)";


            /*
                Теперь poo больше
                НИКОГДА не будет
                возвращён к обычному
                размеру.
            */

            setTimeout(
                () => {

                    poo.style.transform =
                        "scale(2.08,1.88)";


                    setTimeout(
                        () => {

                            poo.style.transform =
                                "scale(2,2)";


                            startBurning();

                        },
                        180
                    );

                },
                120
            );
        }
    }


    requestAnimationFrame(
        fall
    );
}
/* =========================================================
   BURNING
========================================================= */

function startBurning() {

    playSound('fire', 1);

    const elements = [
        profile,
        ...cards
    ].filter(Boolean);

    elements.forEach((element, index) => {

        setTimeout(() => {

            const rect = element.getBoundingClientRect();

            const fire = createFire(rect);

            element.style.transition =
                'filter 2.8s ease, opacity 2.8s ease, transform 2.8s ease';

            element.style.filter =
                'brightness(1.4) saturate(1.5)';

            setTimeout(() => {
                element.style.filter =
                    'brightness(.45) saturate(.4)';
            }, 700);

            setTimeout(() => {
                element.style.filter =
                    'brightness(.08) saturate(0) blur(2px)';
            }, 1500);

            // Плашка начинает исчезать
            setTimeout(() => {
                element.style.opacity = '0';
                element.style.transform = 'scale(.94)';
            }, 2200);

            // Огонь затухает вместе с плашкой
            setTimeout(() => {
                fire.style.transition = 'opacity .8s ease';
                fire.style.opacity = '0';
            }, 2200);

           // Огонь удаляется 
           setTimeout(() => { fire.remove(); }, 3100); 
           // Сама плашка полностью удаляется из DOM 
           setTimeout(() => { element.remove(); }, 3200);
        }, index * 180);

    });
}

/* =========================================================
   RESIZE
========================================================= */

window.addEventListener(
    "resize",
    () => {

        resizeCanvas();


        if (
            !eventStarted
        ) {

            pooBaseSize =
                window.innerWidth <= 760
                    ? 65
                    : 85;

            pooSize =
                pooBaseSize;
        }
    }
);


/* =========================================================
   START
========================================================= */

resizeCanvas();

resetPoo();

poo.style.left =
    `${pooX}px`;

poo.style.top =
    `${pooY}px`;

particleFrame();

pooLoop();
