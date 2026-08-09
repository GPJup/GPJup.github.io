/* =========================================================
   GPJUP - FULL SCRIPT
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

const cards = [
    ...document.querySelectorAll(".card")
];

const profile = document.querySelector(".profile");

/* =========================================================
   PARTICLES
   ========================================================= */

function resizeCanvas() {
    w = window.innerWidth;
    h = window.innerHeight;

    dpr = Math.min(
        window.devicePixelRatio || 1,
        2
    );

    canvas.width = w * dpr;
    canvas.height = h * dpr;

    canvas.style.width = `${w}px`;
    canvas.style.height = `${h}px`;

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

function createParticles() {
    const amount = Math.min(
        240,
        Math.max(
            90,
            Math.floor((w * h) / 7000)
        )
    );

    particles = Array.from(
        { length: amount },
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

function hexToRgb(hex) {
    hex = hex.replace("#", "");

    if (hex.length === 3) {
        hex = hex
            .split("")
            .map(x => x + x)
            .join("");
    }

    const n = parseInt(hex, 16);

    return [
        (n >> 16) & 255,
        (n >> 8) & 255,
        n & 255
    ];
}

function mixColor(a, b, amount) {
    const A = hexToRgb(a);
    const B = hexToRgb(b);

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
            Math.sin(p.phase) * 0.025;

        p.y +=
            p.vy +
            Math.cos(p.phase) * 0.025;

        if (p.x < -20) p.x = w + 20;
        if (p.x > w + 20) p.x = -20;

        if (p.y < -20) p.y = h + 20;
        if (p.y > h + 20) p.y = -20;

        let color = p.color;
        let alpha = 0.2;

        const dx = p.x - mouse.x;
        const dy = p.y - mouse.y;

        const distance =
            Math.hypot(dx, dy);

        /*
            Маленькая белая подсветка
            вокруг курсора.
        */

        if (
            mouse.active &&
            distance < 120
        ) {
            const power =
                1 -
                distance / 120;

            color = mixColor(
                p.color,
                "#ffffff",
                power * 0.9
            );

            alpha =
                0.2 +
                power * 0.6;

            /*
                Отталкивание частиц.
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

        ctx.globalAlpha = alpha;
        ctx.fillStyle = color;

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
        mouse.x = event.clientX;
        mouse.y = event.clientY;
        mouse.active = true;
    },
    { passive: true }
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
poo.src = "assets/poo.png";
poo.alt = "";

document.body.appendChild(poo);

let pooSize =
    window.innerWidth <= 760
        ? 65
        : 85;

let pooX = 150;
let pooY = 150;

let pooVX = 2.2;
let pooVY = 1.8;

let pooSquash = 0;

let eventStarted = false;
let pooFinalAnimation = false;

/* =========================================================
   POO POSITION
   ========================================================= */

function resetPoo() {
    pooSize =
        window.innerWidth <= 760
            ? 65
            : 85;

    pooX =
        Math.random() *
        Math.max(
            1,
            w - pooSize
        );

    pooY =
        Math.random() *
        Math.max(
            1,
            h - pooSize
        );

    const angle =
        Math.random() *
        Math.PI *
        2;

    const speed = 2.2;

    pooVX =
        Math.cos(angle) *
        speed;

    pooVY =
        Math.sin(angle) *
        speed;
}

/* =========================================================
   POO VS RECTANGLE
   ========================================================= */

function bouncePooFromRect(rect) {
    if (eventStarted) {
        return;
    }

    const left = pooX;
    const right = pooX + pooSize;
    const top = pooY;
    const bottom = pooY + pooSize;

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

    if (horizontal < vertical) {
        pooVX *= -1;

        if (left < rect.left) {
            pooX =
                rect.left -
                pooSize -
                2;
        } else {
            pooX =
                rect.right + 2;
        }
    } else {
        pooVY *= -1;

        if (top < rect.top) {
            pooY =
                rect.top -
                pooSize -
                2;
        } else {
            pooY =
                rect.bottom + 2;
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
        Math.hypot(dx, dy);

    const collisionRadius =
        pooSize * 0.5 + 12;

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

        pooX += nx * 10;
        pooY += ny * 10;

        pooSquash = 1;
    }
}

/* =========================================================
   POO VISUAL
   ========================================================= */

function updatePooVisual() {
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
   POO SCREEN EDGE
   ========================================================= */

function checkPooEdges() {
    /*
        Верх
    */

    if (pooY <= 0) {
        pooY = 0;

        pooVY =
            Math.abs(pooVY);

        pooSquash = 1;
    }

    /*
        Левая стена
    */

    if (pooX <= 0) {
        pooX = 0;

        pooVX =
            Math.abs(pooVX);

        pooSquash = 1;
    }

    /*
        Правая стена
    */

    if (
        pooX + pooSize >= w
    ) {
        pooX =
            w - pooSize;

        pooVX =
            -Math.abs(pooVX);

        pooSquash = 1;
    }

    /*
        Низ
    */

    if (
        pooY + pooSize >= h
    ) {
        pooY =
            h - pooSize;

        pooVY =
            -Math.abs(pooVY);

        pooSquash = 1;
    }

    /*
        Угол.
        Запускаем событие только
        когда poo действительно
        оказался в углу.
    */

    const atLeft =
        pooX <= 1;

    const atRight =
        pooX + pooSize >=
        w - 1;

    const atTop =
        pooY <= 1;

    const atBottom =
        pooY + pooSize >=
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
   POO MAIN LOOP
   ========================================================= */

function pooLoop() {
    if (!eventStarted) {
        pooX += pooVX;
        pooY += pooVY;

        checkPooEdges();

        for (const card of cards) {
            bouncePooFromRect(
                card.getBoundingClientRect()
            );
        }

        if (profile) {
            bouncePooFromRect(
                profile.getBoundingClientRect()
            );
        }

        bouncePooFromCursor();
    }

    poo.style.left =
        `${pooX}px`;

    poo.style.top =
        `${pooY}px`;

    updatePooVisual();

    requestAnimationFrame(
        pooLoop
    );
}

/* =========================================================
   OGSCULE
   ========================================================= */

const ogscule =
    document.createElement("img");

ogscule.id = "ogscule";
ogscule.src =
    "assets/ogscule.png";
ogscule.alt = "";

document.body.appendChild(
    ogscule
);

/* =========================================================
   AUDIO
   ========================================================= */

function playSound(
    file,
    volume = 1
) {
    const audio =
        new Audio(
            `assets/${file}`
        );

    audio.volume = volume;

    audio.currentTime = 0;

    audio.play().catch(() => {});

    return audio;
}

/* =========================================================
   MAIN EVENT
   ========================================================= */

function startMainEvent(
    fromLeft,
    fromTop
) {
    if (eventStarted) {
        return;
    }

    eventStarted = true;

    /*
        Останавливаем обычное
        движение poo.
    */

    pooVX = 0;
    pooVY = 0;

    /*
        Запоминаем угол.
    */

    const cornerX =
        fromLeft
            ? 25
            : w - 25;

    const cornerY =
        fromTop
            ? 25
            : h - 25;

    /*
        OGSCULE появляется
        именно из этого угла.
    */

    ogscule.style.opacity = "1";

    ogscule.style.left =
        `${cornerX}px`;

    ogscule.style.top =
        `${cornerY}px`;

    /*
        Пружина.
    */

    playSound(
        "spring.mp3",
        0.85
    );

    const centerX =
        w / 2;

    const centerY =
        h / 2;

    const ogAnimation =
        ogscule.animate(
            [
                {
                    left:
                        `${cornerX}px`,
                    top:
                        `${cornerY}px`,
                    transform:
                        "translate(-50%, -50%) scale(0.15)"
                },

                {
                    left:
                        `${centerX}px`,
                    top:
                        `${centerY}px`,
                    transform:
                        "translate(-50%, -50%) scale(1.9)"
                },

                {
                    left:
                        `${centerX}px`,
                    top:
                        `${centerY}px`,
                    transform:
                        "translate(-50%, -50%) scale(2.15, 1.8)"
                },

                {
                    left:
                        `${centerX}px`,
                    top:
                        `${centerY}px`,
                    transform:
                        "translate(-50%, -50%) scale(1.85, 2.1)"
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
                    "cubic-bezier(.22, 1.25, .45, 1)",
                fill: "forwards"
            }
        );

    ogAnimation.onfinish =
        () => {
            /*
                Короткая дополнительная
                пружина.
            */

            playSound(
                "spring.mp3",
                0.7
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
                                "translate(-50%, -50%) scale(1.82, 2.15)"
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
                            "cubic-bezier(.2, 1.5, .4, 1)",
                        fill: "forwards"
                    }
                );

            spring.onfinish =
                () => {
                    /*
                        Крики.
                    */

                    playSound(
                        "scary.mp3",
                        0.9
                    );

                    /*
                        OGSCULE проваливается
                        под экран.
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
                                        `${centerY + 50}px`,
                                    opacity: 1,
                                    transform:
                                        "translate(-50%, -50%) scale(2.1, 1.9)"
                                },

                                {
                                    top:
                                        `${h + 350}px`,
                                    opacity: 0,
                                    transform:
                                        "translate(-50%, -50%) scale(1.7, 2.2)"
                                }
                            ],
                            {
                                duration: 1300,
                                easing:
                                    "cubic-bezier(.65, 0, 1, 1)",
                                fill: "forwards"
                            }
                        );

                    fall.onfinish =
                        () => {
                            movePooToCenter();
                        };
                };
        };
}

/* =========================================================
   POO -> CENTER -> FLOOR
   ========================================================= */

function movePooToCenter() {
    if (pooFinalAnimation) {
        return;
    }

    pooFinalAnimation = true;

    /*
        Центр экрана.
    */

    const targetX =
        w / 2 -
        pooSize;

    const targetY =
        h / 2 -
        pooSize;

    /*
        Poo увеличивается в 2 раза
        прямо во время полёта.
    */

    const startX = pooX;
    const startY = pooY;

    const startTime =
        performance.now();

    const flightDuration =
        1100;

    function flyToCenter(now) {
        const progress =
            Math.min(
                1,
                (now - startTime) /
                flightDuration
            );

        /*
            Плавное ускорение/замедление.
        */

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

        const scale =
            1 +
            eased;

        poo.style.transform =
            `scale(${scale})`;

        if (progress < 1) {
            requestAnimationFrame(
                flyToCenter
            );
        } else {
            dropPoo();
        }
    }

    requestAnimationFrame(
        flyToCenter
    );
}

/* =========================================================
   POO DROP
   ========================================================= */

function dropPoo() {
    const finalSize =
        pooSize * 2;

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

    const duration = 900;

    function fall(now) {
        const progress =
            Math.min(
                1,
                (now - startTime) /
                duration
            );

        /*
            Нормальное ускорение
            свободного падения.
        */

        const eased =
            progress * progress;

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
            poo слегка вытягивается,
            а перед полом сжимается.
        */

        let scaleX = 2;
        let scaleY = 2;

        if (progress > 0.82) {
            const impact =
                (progress - 0.82) /
                0.18;

            scaleX =
                2 +
                impact * 0.15;

            scaleY =
                2 -
                impact * 0.12;
        }

        poo.style.transform =
            `scale(${scaleX}, ${scaleY})`;

        if (progress < 1) {
            requestAnimationFrame(
                fall
            );
        } else {
            /*
                Удар о пол.
            */

            poo.style.top =
                `${floorY}px`;

            poo.style.transform =
                "scale(2.12, 1.82)";

            setTimeout(
                () => {
                    poo.style.transform =
                        "scale(2, 2)";

                    /*
                        Теперь начинаем
                        сжигание плашек.
                    */

                    setTimeout(
                        startBurning,
                        350
                    );
                },
                150
            );
        }
    }

    requestAnimationFrame(
        fall
    );
}

/* =========================================================
   FIRE GIF
   ========================================================= */

function createFire(
    rect
) {
    const fire =
        document.createElement("img");

    fire.src =
        "assets/fire.gif";

    fire.className =
        "generated-fire";

    fire.alt = "";

    fire.style.position =
        "fixed";

    fire.style.left =
        `${rect.left - 15}px`;

    fire.style.top =
        `${rect.top - 15}px`;

    fire.style.width =
        `${rect.width + 30}px`;

    fire.style.height =
        `${rect.height + 30}px`;

    fire.style.objectFit =
        "cover";

    fire.style.pointerEvents =
        "none";

    fire.style.zIndex = "100";

    fire.style.mixBlendMode =
        "screen";

    fire.style.filter =
        "drop-shadow(0 0 15px rgba(255,80,0,.8))";

    fire.style.opacity = "0";

    document.body.appendChild(
        fire
    );

    requestAnimationFrame(
        () => {
            fire.style.transition =
                "opacity .35s ease";

            fire.style.opacity = "1";
        }
    );

    return fire;
}

/* =========================================================
   BURNING
   ========================================================= */

function startBurning() {
    playSound(
        "fire.mp3",
        0.9
    );

    /*
        ВАЖНО:
        собираем профиль отдельно,
        чтобы он точно не потерялся.
    */

    const allElements = [
        profile,
        ...cards
    ].filter(Boolean);

    allElements.forEach(
        (element, index) => {
            setTimeout(
                () => {
                    const rect =
                        element.getBoundingClientRect();

                    /*
                        Пламя поверх элемента.
                    */

                    createFire(rect);

                    /*
                        Элемент не просто
                        исчезает мгновенно.
                        Сначала темнеет,
                        затем становится
                        прозрачным.
                    */

                    element.style.transition =
                        "filter 2.5s ease, opacity 2.5s ease, transform 2.5s ease";

                    element.style.filter =
                        "brightness(1.25) saturate(1.3)";

                    setTimeout(
                        () => {
                            element.style.filter =
                                "brightness(.35) saturate(.45)";
                        },
                        700
                    );

                    setTimeout(
                        () => {
                            element.style.filter =
                                "brightness(.05) saturate(0) blur(2px)";
                        },
                        1500
                    );

                    setTimeout(
                        () => {
                            element.style.opacity =
                                "0";

                            element.style.transform =
                                "scale(.96)";
                        },
                        2200
                    );
                },
                index * 180
            );
        }
    );
}

/* =========================================================
   RESIZE
   ========================================================= */

window.addEventListener(
    "resize",
    () => {
        resizeCanvas();

        if (!eventStarted) {
            pooSize =
                window.innerWidth <= 760
                    ? 65
                    : 85;
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
