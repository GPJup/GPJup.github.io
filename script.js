/* =========================================================
   GPJUP SITE
   Particles + cursor glow + cards + poo screensaver
   + ogscule event + fire system + generated sounds
========================================================= */

const canvas = document.getElementById("particles");
const ctx = canvas.getContext("2d");

let w = 0;
let h = 0;
let dpr = 1;

let particles = [];

const mouse = {
    x: -999,
    y: -999,
    active: false,
    color: "#ffffff"
};

const palette = [
    "#8b5cf6",
    "#a78bfa",
    "#6366f1"
];

const cards = [
    ...document.querySelectorAll(".card")
];

/* =========================================================
   AUDIO
========================================================= */

let audioContext = null;
let fireAudio = null;

function initAudio() {
    if (audioContext) return;

    try {
        audioContext =
            new (window.AudioContext ||
                window.webkitAudioContext)();

        if (audioContext.state === "suspended") {
            audioContext.resume();
        }
    } catch (error) {
        console.warn(
            "Web Audio недоступен:",
            error
        );
    }
}

function playSpringSound() {
    initAudio();

    if (!audioContext) return;

    const now = audioContext.currentTime;

    const oscillator =
        audioContext.createOscillator();

    const gain =
        audioContext.createGain();

    oscillator.type = "sine";

    oscillator.frequency.setValueAtTime(
        160,
        now
    );

    oscillator.frequency.exponentialRampToValueAtTime(
        720,
        now + 0.12
    );

    oscillator.frequency.exponentialRampToValueAtTime(
        110,
        now + 0.55
    );

    gain.gain.setValueAtTime(
        0.0001,
        now
    );

    gain.gain.exponentialRampToValueAtTime(
        0.2,
        now + 0.025
    );

    gain.gain.exponentialRampToValueAtTime(
        0.0001,
        now + 0.58
    );

    oscillator.connect(gain);
    gain.connect(audioContext.destination);

    oscillator.start(now);
    oscillator.stop(now + 0.6);
}

function playScreamSound() {
    initAudio();

    if (!audioContext) return;

    const now = audioContext.currentTime;

    const oscillator =
        audioContext.createOscillator();

    const gain =
        audioContext.createGain();

    oscillator.type = "sawtooth";

    oscillator.frequency.setValueAtTime(
        480,
        now
    );

    oscillator.frequency.exponentialRampToValueAtTime(
        105,
        now + 1.25
    );

    gain.gain.setValueAtTime(
        0.0001,
        now
    );

    gain.gain.exponentialRampToValueAtTime(
        0.16,
        now + 0.04
    );

    gain.gain.exponentialRampToValueAtTime(
        0.0001,
        now + 1.3
    );

    oscillator.connect(gain);
    gain.connect(audioContext.destination);

    oscillator.start(now);
    oscillator.stop(now + 1.35);
}

/*
    Генератор потрескивания.

    Здесь используется шумовой источник + фильтр.
    Каждый импульс немного отличается,
    поэтому звук не превращается в короткий
    зацикленный "тррр".
*/

function startFireSound() {
    initAudio();

    if (!audioContext) return;
    if (fireAudio) return;

    const master =
        audioContext.createGain();

    const filter =
        audioContext.createBiquadFilter();

    filter.type = "bandpass";
    filter.frequency.value = 900;
    filter.Q.value = 0.7;

    master.gain.value = 0.055;

    filter.connect(master);
    master.connect(
        audioContext.destination
    );

    const bufferSize =
        audioContext.sampleRate * 2;

    const buffer =
        audioContext.createBuffer(
            1,
            bufferSize,
            audioContext.sampleRate
        );

    const data =
        buffer.getChannelData(0);

    for (let i = 0; i < bufferSize; i++) {
        data[i] =
            Math.random() * 2 - 1;
    }

    const source =
        audioContext.createBufferSource();

    source.buffer = buffer;
    source.loop = true;

    source.connect(filter);
    source.start();

    fireAudio = {
        source,
        master,
        filter,
        crackleTimer: null
    };

    function crackle() {
        if (!fireAudio) return;

        const now =
            audioContext.currentTime;

        const osc =
            audioContext.createOscillator();

        const gain =
            audioContext.createGain();

        osc.type = "triangle";

        const frequency =
            700 +
            Math.random() * 1600;

        osc.frequency.setValueAtTime(
            frequency,
            now
        );

        osc.frequency.exponentialRampToValueAtTime(
            100,
            now + 0.045
        );

        gain.gain.setValueAtTime(
            0.0001,
            now
        );

        gain.gain.exponentialRampToValueAtTime(
            0.12 + Math.random() * 0.12,
            now + 0.003
        );

        gain.gain.exponentialRampToValueAtTime(
            0.0001,
            now + 0.055
        );

        osc.connect(gain);
        gain.connect(master);

        osc.start(now);
        osc.stop(now + 0.06);

        fireAudio.crackleTimer =
            setTimeout(
                crackle,
                50 + Math.random() * 280
            );
    }

    crackle();
}

function stopFireSound() {
    if (!fireAudio) return;

    clearTimeout(
        fireAudio.crackleTimer
    );

    try {
        fireAudio.source.stop();
    } catch {}

    try {
        fireAudio.source.disconnect();
        fireAudio.master.disconnect();
        fireAudio.filter.disconnect();
    } catch {}

    fireAudio = null;
}

/* =========================================================
   PARTICLES
========================================================= */

function resize() {
    dpr = Math.min(
        window.devicePixelRatio || 1,
        2
    );

    w = window.innerWidth;
    h = window.innerHeight;

    canvas.width = w * dpr;
    canvas.height = h * dpr;

    canvas.style.width = w + "px";
    canvas.style.height = h + "px";

    ctx.setTransform(
        dpr,
        0,
        0,
        dpr,
        0,
        0
    );

    const amount =
        Math.min(
            240,
            Math.max(
                90,
                Math.floor(
                    (w * h) / 7000
                )
            )
        );

    particles =
        Array.from(
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

                c:
                    palette[
                        Math.floor(
                            Math.random() *
                            palette.length
                        )
                    ],

                life:
                    Math.random() *
                    Math.PI *
                    2
            })
        );
}

function rgb(hex) {
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

function mix(a, b, t) {
    const A = rgb(a);
    const B = rgb(b);

    return (
        "rgb(" +
        A
            .map(
                (v, i) =>
                    Math.round(
                        v +
                        (B[i] - v) * t
                    )
            )
            .join(",") +
        ")"
    );
}

/* =========================================================
   PARTICLE FRAME
========================================================= */

function frame() {
    ctx.clearRect(
        0,
        0,
        w,
        h
    );

    for (const p of particles) {
        p.life += 0.008;

        p.x +=
            p.vx +
            Math.sin(p.life) * 0.025;

        p.y +=
            p.vy +
            Math.cos(p.life) * 0.025;

        if (p.x < -20)
            p.x = w + 20;

        if (p.x > w + 20)
            p.x = -20;

        if (p.y < -20)
            p.y = h + 20;

        if (p.y > h + 20)
            p.y = -20;

        let dx =
            p.x - mouse.x;

        let dy =
            p.y - mouse.y;

        let dist =
            Math.hypot(dx, dy);

        let alpha = 0.2;
        let color = p.c;

        /*
            Небольшая белая подсветка вокруг курсора.
        */

        if (
            mouse.active &&
            dist < 115
        ) {
            const t =
                1 - dist / 115;

            color = mix(
                p.c,
                "#ffffff",
                t * 0.85
            );

            alpha =
                0.2 +
                0.55 * t;

            /*
                Частицы мягко отталкиваются.
            */

            if (dist > 0) {
                const force =
                    t * 0.5;

                p.x +=
                    (dx / dist) *
                    force;

                p.y +=
                    (dy / dist) *
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

    requestAnimationFrame(frame);
}

/* =========================================================
   MOUSE
========================================================= */

window.addEventListener(
    "pointermove",
    e => {
        mouse.x = e.clientX;
        mouse.y = e.clientY;
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
   CARDS
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
            mouse.color = color;

            document.documentElement.style.setProperty(
                "--accent",
                color
            );
        }
    );

    card.addEventListener(
        "pointermove",
        e => {
            const rect =
                card.getBoundingClientRect();

            card.style.setProperty(
                "--mx",
                `${e.clientX - rect.left}px`
            );

            card.style.setProperty(
                "--my",
                `${e.clientY - rect.top}px`
            );
        }
    );
});

/* =========================================================
   CREATE POO
========================================================= */

const poo =
    document.createElement("img");

poo.id = "poo";
poo.src = "assets/poo.png";
poo.alt = "";

document.body.appendChild(poo);

/* =========================================================
   POO PHYSICS
========================================================= */

let pooX = 200;
let pooY = 200;

let pooVX =
    2.1;

let pooVY =
    1.7;

let pooWidth = 85;
let pooHeight = 85;

let pooScale = 1;

let pooSquash = 0;

let gameStarted = false;
let eventTriggered = false;

function resetPooPosition() {
    pooWidth =
        window.innerWidth <= 760
            ? 65
            : 85;

    pooHeight = pooWidth;

    pooX =
        Math.random() *
        Math.max(
            1,
            w - pooWidth
        );

    pooY =
        Math.random() *
        Math.max(
            1,
            h - pooHeight
        );

    const angle =
        Math.random() *
        Math.PI *
        2;

    const speed = 2.1;

    pooVX =
        Math.cos(angle) *
        speed;

    pooVY =
        Math.sin(angle) *
        speed;
}

/* =========================================================
   CARD COLLISION
========================================================= */

function getRect(el) {
    return el.getBoundingClientRect();
}

function intersects(a, b) {
    return !(
        a.right < b.left ||
        a.left > b.right ||
        a.bottom < b.top ||
        a.top > b.bottom
    );
}

function bounceFromRect(rect) {
    const pooRect = {
        left: pooX,
        right: pooX + pooWidth,
        top: pooY,
        bottom: pooY + pooHeight
    };

    if (!intersects(pooRect, rect)) {
        return false;
    }

    const overlapLeft =
        pooRect.right - rect.left;

    const overlapRight =
        rect.right - pooRect.left;

    const overlapTop =
        pooRect.bottom - rect.top;

    const overlapBottom =
        rect.bottom - pooRect.top;

    const minX =
        Math.min(
            overlapLeft,
            overlapRight
        );

    const minY =
        Math.min(
            overlapTop,
            overlapBottom
        );

    if (minX < minY) {
        pooVX *= -1;

        if (pooX < rect.left) {
            pooX =
                rect.left -
                pooWidth -
                2;
        } else {
            pooX =
                rect.right + 2;
        }

        pooSquash = 1;
    } else {
        pooVY *= -1;

        if (pooY < rect.top) {
            pooY =
                rect.top -
                pooHeight -
                2;
        } else {
            pooY =
                rect.bottom + 2;
        }

        pooSquash = 1;
    }

    return true;
}

/* =========================================================
   POO COLLISION WITH CURSOR
========================================================= */

function checkCursorCollision() {
    if (!mouse.active) return;

    const centerX =
        pooX + pooWidth / 2;

    const centerY =
        pooY + pooHeight / 2;

    const dx =
        centerX - mouse.x;

    const dy =
        centerY - mouse.y;

    const distance =
        Math.hypot(dx, dy);

    const radius =
        pooWidth * 0.5;

    if (
        distance < radius + 12 &&
        distance > 0
    ) {
        const nx =
            dx / distance;

        const ny =
            dy / distance;

        const speed =
            Math.hypot(
                pooVX,
                pooVY
            );

        pooVX =
            nx *
            Math.max(
                speed,
                2.2
            );

        pooVY =
            ny *
            Math.max(
                speed,
                2.2
            );

        pooX += nx * 6;
        pooY += ny * 6;

        pooSquash = 1;
    }
}

/* =========================================================
   POO SQUASH
========================================================= */

function updatePooVisual() {
    pooSquash *= 0.88;

    const squash =
        Math.min(
            pooSquash,
            1
        );

    const sx =
        1 -
        squash * 0.28;

    const sy =
        1 +
        squash * 0.18;

    poo.style.transform =
        `scale(${sx * pooScale}, ${sy * pooScale})`;
}

/* =========================================================
   POO LOOP
========================================================= */

function pooLoop() {
    if (
        !eventTriggered
    ) {
        pooX += pooVX;
        pooY += pooVY;

        /*
            Столкновение с краями.
        */

        if (pooX <= 0) {
            pooX = 0;
            pooVX = Math.abs(pooVX);
            pooSquash = 1;
        }

        if (
            pooX + pooWidth >= w
        ) {
            pooX =
                w - pooWidth;

            pooVX =
                -Math.abs(pooVX);

            pooSquash = 1;
        }

        if (pooY <= 0) {
            pooY = 0;
            pooVY = Math.abs(pooVY);
            pooSquash = 1;
        }

        /*
            ВАЖНО:
            именно угол запускает событие.
        */

        const touchingLeft =
            pooX <= 2;

        const touchingRight =
            pooX + pooWidth >=
            w - 2;

        const touchingTop =
            pooY <= 2;

        const touchingBottom =
            pooY + pooHeight >=
            h - 2;

        const corner =
            (
                touchingLeft ||
                touchingRight
            ) &&
            (
                touchingTop ||
                touchingBottom
            );

        if (corner) {
            triggerOgsculeEvent();
        }

        /*
            Нижняя граница.
        */

        if (
            pooY + pooHeight >= h
        ) {
            pooY =
                h - pooHeight;

            pooVY =
                -Math.abs(pooVY);

            pooSquash = 1;
        }

        /*
            Карточки.
        */

        if (!eventTriggered) {
            for (const card of cards) {
                bounceFromRect(
                    getRect(card)
                );
            }

            const profile =
                document.querySelector(
                    ".profile"
                );

            if (profile) {
                bounceFromRect(
                    getRect(profile)
                );
            }

            checkCursorCollision();
        }

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

let ogscule =
    document.createElement("img");

ogscule.id = "ogscule";

ogscule.src =
    "assets/ogscule.png";

ogscule.alt = "";

document.body.appendChild(
    ogscule
);

function triggerOgsculeEvent() {
    if (eventTriggered) return;

    eventTriggered = true;

    playSpringSound();

    /*
        Фиксируем угол,
        из которого появляется ogscule.
    */

    const fromRight =
        pooX >
        w / 2;

    const fromBottom =
        pooY >
        h / 2;

    const startX =
        fromRight
            ? w - 40
            : 40;

    const startY =
        fromBottom
            ? h - 40
            : 40;

    ogscule.style.left =
        `${startX}px`;

    ogscule.style.top =
        `${startY}px`;

    ogscule.style.opacity = "1";

    /*
        Появление из угла,
        движение к центру,
        увеличение.
    */

    const animation =
        ogscule.animate(
            [
                {
                    transform:
                        "translate(-50%, -50%) scale(0.15)"
                },

                {
                    transform:
                        "translate(-50%, -50%) scale(0.65)",
                    offset: 0.55
                },

                {
                    transform:
                        "translate(-50%, -50%) scale(1.12)",
                    offset: 0.78
                },

                {
                    transform:
                        "translate(-50%, -50%) scale(0.92)",
                    offset: 0.88
                },

                {
                    transform:
                        "translate(-50%, -50%) scale(1)"
                }
            ],
            {
                duration: 1600,
                easing:
                    "cubic-bezier(.22,1.35,.45,1)",
                fill: "forwards"
            }
        );

    animation.onfinish =
        () => {
            playSpringSound();

            /*
                Короткая пружина в центре.
            */

            const spring =
                ogscule.animate(
                    [
                        {
                            transform:
                                "translate(-50%, -50%) scale(1)"
                        },

                        {
                            transform:
                                "translate(-50%, -50%) scale(1.18, .82)"
                        },

                        {
                            transform:
                                "translate(-50%, -50%) scale(.88, 1.12)"
                        },

                        {
                            transform:
                                "translate(-50%, -50%) scale(1.06, .94)"
                        },

                        {
                            transform:
                                "translate(-50%, -50%) scale(1)"
                        }
                    ],
                    {
                        duration: 800,
                        easing:
                            "cubic-bezier(.2,1.5,.4,1)"
                    }
                );

            spring.onfinish =
                () => {
                    playScreamSound();

                    /*
                        После пружины
                        картинка проваливается вниз.
                    */

                    const fall =
                        ogscule.animate(
                            [
                                {
                                    transform:
                                        "translate(-50%, -50%) scale(1)",
                                    opacity: 1
                                },

                                {
                                    transform:
                                        "translate(-50%, -20%) scale(1.05)",
                                    opacity: 1,
                                    offset: 0.15
                                },

                                {
                                    transform:
                                        "translate(-50%, 120vh) scale(0.9)",
                                    opacity: 0
                                }
                            ],
                            {
                                duration: 1200,
                                easing:
                                    "cubic-bezier(.65,0,1,1)",
                                fill: "forwards"
                            }
                        );

                    fall.onfinish =
                        () => {
                            startBurning();
                        };
                };
        };
}

/* =========================================================
   FIRE
========================================================= */

function createFireAt(
    x,
    y,
    width,
    height
) {
    const layer =
        document.createElement(
            "div"
        );

    layer.className =
        "fire-layer";

    layer.style.left =
        `${x}px`;

    layer.style.top =
        `${y}px`;

    layer.style.width =
        `${width}px`;

    layer.style.height =
        `${height}px`;

    document.body.appendChild(
        layer
    );

    /*
        Много разных языков пламени.
    */

    const fireCount =
        Math.max(
            8,
            Math.floor(
                width / 16
            )
        );

    for (
        let i = 0;
        i < fireCount;
        i++
    ) {
        const flame =
            document.createElement(
                "div"
            );

        flame.className =
            "fire";

        const size =
            13 +
            Math.random() * 24;

        flame.style.width =
            `${size}px`;

        flame.style.height =
            `${30 + Math.random() * 45}px`;

        flame.style.left =
            `${Math.random() * width}px`;

        flame.style.bottom =
            `${Math.random() * 5}px`;

        flame.style.setProperty(
            "--duration",
            `${0.28 + Math.random() * 0.45}s`
        );

        flame.style.setProperty(
            "--rotation",
            `${-15 + Math.random() * 30}deg`
        );

        flame.style.setProperty(
            "--scale",
            `${0.75 + Math.random() * 0.5}`
        );

        layer.appendChild(
            flame
        );
    }

    /*
        Дым.
    */

    const smokeInterval =
        setInterval(() => {
            if (
                !document.body.contains(
                    layer
                )
            ) {
                clearInterval(
                    smokeInterval
                );
                return;
            }

            const smoke =
                document.createElement(
                    "div"
                );

            smoke.className =
                "smoke";

            smoke.style.left =
                `${Math.random() * width}px`;

            smoke.style.bottom =
                `${height * 0.5}px`;

            smoke.style.setProperty(
                "--sx",
                `${-30 + Math.random() * 60}px`
            );

            layer.appendChild(
                smoke
            );

            setTimeout(
                () =>
                    smoke.remove(),
                2600
            );
        },
        240
        );

    /*
        Искры.
    */

    const emberInterval =
        setInterval(() => {
            if (
                !document.body.contains(
                    layer
                )
            ) {
                clearInterval(
                    emberInterval
                );
                return;
            }

            const ember =
                document.createElement(
                    "div"
                );

            ember.className =
                "ember";

            ember.style.left =
                `${Math.random() * width}px`;

            ember.style.bottom =
                `${Math.random() * height * 0.7}px`;

            ember.style.setProperty(
                "--ex",
                `${-35 + Math.random() * 70}px`
            );

            ember.style.setProperty(
                "--ey",
                `${-30 - Math.random() * 80}px`
            );

            layer.appendChild(
                ember
            );

            setTimeout(
                () =>
                    ember.remove(),
                900
            );
        },
        110
        );

    return {
        layer,
        smokeInterval,
        emberInterval
    };
}

/* =========================================================
   BURN ALL
========================================================= */

function startBurning() {
    startFireSound();

    /*
        Все плашки + левая.
    */

    const elements = [
        ...cards,
        document.querySelector(
            ".profile"
        )
    ].filter(Boolean);

    /*
        Горение начинается
        с небольшой разницей по времени,
        чтобы всё не исчезало одновременно.
    */

    elements.forEach(
        (element, index) => {
            const rect =
                element.getBoundingClientRect();

            setTimeout(
                () => {
                    element.classList.add(
                        "burning"
                    );

                    const fire =
                        createFireAt(
                            rect.left - 15,
                            rect.top +
                                rect.height * 0.25,
                            rect.width + 30,
                            rect.height * 0.8
                        );

                    /*
                        Пламя держится чуть дольше
                        самой карточки.
                    */

                    setTimeout(
                        () => {
                            clearInterval(
                                fire.smokeInterval
                            );

                            clearInterval(
                                fire.emberInterval
                            );

                            fire.layer.animate(
                                [
                                    {
                                        opacity: 1
                                    },
                                    {
                                        opacity: 0
                                    }
                                ],
                                {
                                    duration: 1200,
                                    fill: "forwards"
                                }
                            );

                            setTimeout(
                                () =>
                                    fire.layer.remove(),
                                1300
                            );
                        },
                        3000
                    );
                },
                index * 170
            );
        }
    );

    /*
        Через несколько секунд
        постепенно прекращаем звук.
    */

    setTimeout(
        () => {
            stopFireSound();
        },
        6500
    );
}

/* =========================================================
   START
========================================================= */

window.addEventListener(
    "resize",
    resize
);

window.addEventListener(
    "pointerdown",
    initAudio,
    { once: true }
);

resize();

resetPooPosition();

poo.style.left =
    `${pooX}px`;

poo.style.top =
    `${pooY}px`;

pooLoop();

frame();
