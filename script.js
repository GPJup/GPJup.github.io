/* =========================================
   PARTICLES
   ========================================= */

const canvas =
    document.getElementById("particles");

const ctx =
    canvas.getContext("2d");

let w = 0;
let h = 0;
let dpr = 1;

let particles = [];

const palette = [
    "#8b5cf6",
    "#a78bfa",
    "#6366f1"
];


/* =========================================
   MOUSE
   ========================================= */

const mouse = {
    x: -9999,
    y: -9999,
    active: false,
    color: "#ffffff"
};


/* =========================================
   CARDS
   ========================================= */

const cards = [
    ...document.querySelectorAll(".card")
];

const profile =
    document.querySelector(".profile");

const avatar =
    document.querySelector(".avatar");


/* =========================================
   COLORS
   ========================================= */

const cardColors =
    cards.map(
        card => card.dataset.color
    );

let currentColor =
    "#8b5cf6";

let targetColor =
    "#8b5cf6";


function hexToRgb(hex) {

    hex =
        hex
            .replace("#", "")
            .trim();

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


function rgbToHex(r, g, b) {

    return (
        "#" +
        [r, g, b]
            .map(value =>
                Math
                    .round(value)
                    .toString(16)
                    .padStart(2, "0")
            )
            .join("")
    );
}


function mixColor(a, b, t) {

    const A =
        hexToRgb(a);

    const B =
        hexToRgb(b);

    return rgbToHex(
        A[0] + (B[0] - A[0]) * t,
        A[1] + (B[1] - A[1]) * t,
        A[2] + (B[2] - A[2]) * t
    );
}


function setColor(color) {

    targetColor = color;
}


function colorLoop() {

    currentColor =
        mixColor(
            currentColor,
            targetColor,
            0.035
        );

    document.documentElement.style.setProperty(
        "--accent",
        currentColor
    );

    if (avatar) {

        avatar.style.setProperty(
            "--avatar-color",
            currentColor
        );
    }

    requestAnimationFrame(
        colorLoop
    );
}


/* =========================================
   AVATAR COLOR CYCLE
   ========================================= */

let avatarColorIndex = 0;
let avatarColorTimer = null;


function startAvatarColorCycle() {

    if (avatarColorTimer)
        return;

    if (!cardColors.length)
        return;

    avatarColorTimer =
        setInterval(() => {

            if (
                mouse.active ||
                finalSequence.started
            ) {
                return;
            }

            avatarColorIndex =
                (
                    avatarColorIndex + 1
                ) %
                cardColors.length;

            setColor(
                cardColors[
                    avatarColorIndex
                ]
            );

        }, 1800);
}


function stopAvatarColorCycle() {

    if (!avatarColorTimer)
        return;

    clearInterval(
        avatarColorTimer
    );

    avatarColorTimer = null;
}


/* =========================================
   RESIZE
   ========================================= */

function resize() {

    dpr =
        Math.min(
            window.devicePixelRatio || 1,
            2
        );

    w =
        window.innerWidth;

    h =
        window.innerHeight;

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

    particles =
        Array.from(
            {
                length:
                    Math.min(
                        240,
                        Math.max(
                            90,
                            Math.floor(
                                w *
                                h /
                                7000
                            )
                        )
                    )
            },

            () => ({

                x:
                    Math.random() * w,

                y:
                    Math.random() * h,

                vx:
                    (
                        Math.random() -
                        0.5
                    ) * 0.2,

                vy:
                    (
                        Math.random() -
                        0.5
                    ) * 0.2,

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


/* =========================================
   PARTICLES
   ========================================= */

function frame() {

    ctx.clearRect(
        0,
        0,
        w,
        h
    );

    for (
        const p of particles
    ) {

        p.life += 0.008;

        p.x +=
            p.vx +
            Math.sin(
                p.life
            ) * 0.025;

        p.y +=
            p.vy +
            Math.cos(
                p.life
            ) * 0.025;

        if (p.x < -20)
            p.x = w + 20;

        if (p.x > w + 20)
            p.x = -20;

        if (p.y < -20)
            p.y = h + 20;

        if (p.y > h + 20)
            p.y = -20;

        const dx =
            p.x - mouse.x;

        const dy =
            p.y - mouse.y;

        const dist =
            Math.hypot(
                dx,
                dy
            );

        let alpha = 0.2;

        if (
            mouse.active &&
            dist < 155
        ) {

            const force =
                1 -
                dist / 155;

            alpha =
                0.2 +
                0.45 * force;

            if (dist > 0) {

                const push =
                    force *
                    force *
                    1.8;

                p.x +=
                    dx / dist *
                    push;

                p.y +=
                    dy / dist *
                    push;
            }
        }

        ctx.globalAlpha =
            alpha;

        ctx.fillStyle =
            p.c;

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
        frame
    );
}


/* =========================================
   AUDIO ENGINE
   ========================================= */

let audioContext = null;

let fireMasterGain = null;
let fireNoiseSource = null;
let fireNoiseGain = null;
let fireFilter = null;
let fireCrackleTimer = null;

let audioUnlocked = false;


function getAudioContext() {

    try {

        const AudioContext =
            window.AudioContext ||
            window.webkitAudioContext;

        if (!AudioContext)
            return null;

        if (!audioContext) {

            audioContext =
                new AudioContext();
        }

        if (
            audioContext.state ===
            "suspended"
        ) {

            audioContext.resume();
        }

        audioUnlocked = true;

        return audioContext;

    } catch {

        return null;
    }
}


/* =========================================
   UNLOCK AUDIO
   ========================================= */

function unlockAudio() {

    const audio =
        getAudioContext();

    if (!audio)
        return;

    if (
        audio.state ===
        "suspended"
    ) {

        audio.resume();
    }
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


/* =========================================
   SPRING SOUND
   ========================================= */

function playSpringSound() {

    const audio =
        getAudioContext();

    if (!audio)
        return;

    const now =
        audio.currentTime;


    const oscillator =
        audio.createOscillator();

    const gain =
        audio.createGain();


    oscillator.type =
        "sine";


    oscillator.frequency.setValueAtTime(
        700,
        now
    );

    oscillator.frequency.exponentialRampToValueAtTime(
        120,
        now + 0.45
    );


    gain.gain.setValueAtTime(
        0.0001,
        now
    );

    gain.gain.exponentialRampToValueAtTime(
        0.18,
        now + 0.015
    );

    gain.gain.exponentialRampToValueAtTime(
        0.0001,
        now + 0.5
    );


    oscillator.connect(
        gain
    );

    gain.connect(
        audio.destination
    );


    oscillator.start(now);

    oscillator.stop(
        now + 0.52
    );


    const spring =
        audio.createOscillator();

    const springGain =
        audio.createGain();


    spring.type =
        "triangle";


    spring.frequency.setValueAtTime(
        460,
        now
    );

    spring.frequency.exponentialRampToValueAtTime(
        70,
        now + 0.58
    );


    springGain.gain.setValueAtTime(
        0.0001,
        now
    );

    springGain.gain.exponentialRampToValueAtTime(
        0.1,
        now + 0.015
    );

    springGain.gain.exponentialRampToValueAtTime(
        0.0001,
        now + 0.58
    );


    spring.connect(
        springGain
    );

    springGain.connect(
        audio.destination
    );


    spring.start(now);

    spring.stop(
        now + 0.6
    );
}


/* =========================================
   SCREAM
   ========================================= */

function playScreamSound() {

    const audio =
        getAudioContext();

    if (!audio)
        return;

    const now =
        audio.currentTime;


    const scream =
        audio.createOscillator();

    const screamGain =
        audio.createGain();


    scream.type =
        "sawtooth";


    scream.frequency.setValueAtTime(
        760,
        now
    );

    scream.frequency.exponentialRampToValueAtTime(
        1550,
        now + 0.18
    );

    scream.frequency.exponentialRampToValueAtTime(
        360,
        now + 0.72
    );


    screamGain.gain.setValueAtTime(
        0.0001,
        now
    );

    screamGain.gain.exponentialRampToValueAtTime(
        0.11,
        now + 0.025
    );

    screamGain.gain.exponentialRampToValueAtTime(
        0.0001,
        now + 0.8
    );


    scream.connect(
        screamGain
    );

    screamGain.connect(
        audio.destination
    );


    scream.start(now);

    scream.stop(
        now + 0.82
    );


    const scream2 =
        audio.createOscillator();

    const gain2 =
        audio.createGain();


    scream2.type =
        "triangle";


    scream2.frequency.setValueAtTime(
        520,
        now
    );

    scream2.frequency.exponentialRampToValueAtTime(
        1100,
        now + 0.2
    );

    scream2.frequency.exponentialRampToValueAtTime(
        250,
        now + 0.72
    );


    gain2.gain.setValueAtTime(
        0.0001,
        now
    );

    gain2.gain.exponentialRampToValueAtTime(
        0.07,
        now + 0.025
    );

    gain2.gain.exponentialRampToValueAtTime(
        0.0001,
        now + 0.75
    );


    scream2.connect(
        gain2
    );

    gain2.connect(
        audio.destination
    );


    scream2.start(now);

    scream2.stop(
        now + 0.78
    );
}


/* =========================================
   FIRE SOUND
   ========================================= */

/*
    Создаём шумовой генератор.

    Он имитирует шипение огня.
*/

function createFireNoise() {

    const audio =
        getAudioContext();

    if (!audio)
        return null;


    const bufferSize =
        audio.sampleRate * 2;

    const buffer =
        audio.createBuffer(
            1,
            bufferSize,
            audio.sampleRate
        );

    const data =
        buffer.getChannelData(0);


    for (
        let i = 0;
        i < bufferSize;
        i++
    ) {

        /*
            Белый шум +
            небольшая модуляция.
        */

        data[i] =
            (
                Math.random() * 2 -
                1
            ) *
            0.8;
    }


    const source =
        audio.createBufferSource();

    source.buffer =
        buffer;

    source.loop =
        true;


    /*
        Фильтр делает шум
        похожим на шипение.
    */

    const filter =
        audio.createBiquadFilter();

    filter.type =
        "bandpass";

    filter.frequency.value =
        2400;

    filter.Q.value =
        0.8;


    const gain =
        audio.createGain();

    gain.gain.value =
        0.0001;


    source.connect(
        filter
    );

    filter.connect(
        gain
    );

    gain.connect(
        audio.destination
    );


    source.start();


    fireNoiseSource =
        source;

    fireFilter =
        filter;

    fireNoiseGain =
        gain;

    return {
        source,
        filter,
        gain
    };
}


/* =========================================
   FIRE CRACKLE
   ========================================= */

function fireCrackle() {

    const audio =
        getAudioContext();

    if (!audio)
        return;


    const now =
        audio.currentTime;


    /*
        Короткий случайный
        щелчок / треск.
    */

    const oscillator =
        audio.createOscillator();

    const gain =
        audio.createGain();


    oscillator.type =
        Math.random() > 0.5
            ? "square"
            : "triangle";


    const frequency =
        500 +
        Math.random() * 1800;


    oscillator.frequency.setValueAtTime(
        frequency,
        now
    );

    oscillator.frequency.exponentialRampToValueAtTime(
        80,
        now + 0.035
    );


    const volume =
        0.015 +
        Math.random() * 0.035;


    gain.gain.setValueAtTime(
        0.0001,
        now
    );

    gain.gain.exponentialRampToValueAtTime(
        volume,
        now + 0.003
    );

    gain.gain.exponentialRampToValueAtTime(
        0.0001,
        now + 0.04
    );


    oscillator.connect(
        gain
    );

    gain.connect(
        audio.destination
    );


    oscillator.start(now);

    oscillator.stop(
        now + 0.045
    );
}


/* =========================================
   START FIRE SOUND
   ========================================= */

function startFireSound() {

    const audio =
        getAudioContext();

    if (!audio)
        return;


    stopFireSound();


    const noise =
        createFireNoise();

    if (!noise)
        return;


    const now =
        audio.currentTime;


    fireMasterGain =
        audio.createGain();

    fireMasterGain.gain.setValueAtTime(
        0.0001,
        now
    );

    fireMasterGain.gain.exponentialRampToValueAtTime(
        0.16,
        now + 0.18
    );


    /*
        Перенаправляем основной
        шум через master gain.
    */

    noise.gain.disconnect();

    noise.gain.connect(
        fireMasterGain
    );

    fireMasterGain.connect(
        audio.destination
    );


    /*
        Частые потрескивания.
    */

    fireCrackleTimer =
        setInterval(
            () => {

                if (
                    !audioContext ||
                    audioContext.state !==
                    "running"
                ) {
                    return;
                }

                /*
                    Иногда два щелчка
                    подряд.
                */

                fireCrackle();

                if (
                    Math.random() >
                    0.65
                ) {
                    setTimeout(
                        fireCrackle,
                        30 +
                        Math.random() * 70
                    );
                }

            },
            90
        );
}


/* =========================================
   STOP FIRE SOUND
   ========================================= */

function stopFireSound() {

    if (
        fireCrackleTimer
    ) {

        clearInterval(
            fireCrackleTimer
        );

        fireCrackleTimer =
            null;
    }


    if (
        fireMasterGain &&
        audioContext
    ) {

        const now =
            audioContext.currentTime;

        fireMasterGain.gain.cancelScheduledValues(
            now
        );

        fireMasterGain.gain.setValueAtTime(
            Math.max(
                fireMasterGain.gain.value,
                0.0001
            ),
            now
        );

        fireMasterGain.gain.exponentialRampToValueAtTime(
            0.0001,
            now + 0.7
        );
    }


    if (
        fireNoiseSource
    ) {

        const source =
            fireNoiseSource;

        fireNoiseSource =
            null;

        setTimeout(
            () => {

                try {
                    source.stop();
                } catch {}
            },
            800
        );
    }


    fireMasterGain =
        null;

    fireNoiseGain =
        null;

    fireFilter =
        null;
}


/* =========================================
   MOBILE / POINTER
   ========================================= */

window.addEventListener(
    "pointermove",
    event => {

        mouse.x =
            event.clientX;

        mouse.y =
            event.clientY;

        mouse.active =
            true;

        document.body.classList.add(
            "cursor-active"
        );

        document.documentElement.style.setProperty(
            "--mouse-x",
            `${mouse.x}px`
        );

        document.documentElement.style.setProperty(
            "--mouse-y",
            `${mouse.y}px`
        );
    }
);


window.addEventListener(
    "pointerleave",
    () => {

        mouse.active =
            false;

        document.body.classList.remove(
            "cursor-active"
        );

        startAvatarColorCycle();
    }
);


/* =========================================
   CARDS
   ========================================= */

cards.forEach(card => {

    const color =
        card.dataset.color;

    card.style.setProperty(
        "--link-color",
        color
    );

    card.addEventListener(
        "pointerenter",
        () => {

            if (
                finalSequence.started
            ) {
                return;
            }

            if (
                window.matchMedia(
                    "(hover: none)"
                ).matches
            ) {
                return;
            }

            stopAvatarColorCycle();

            setColor(color);
        }
    );

    card.addEventListener(
        "pointermove",
        event => {

            if (
                window.matchMedia(
                    "(hover: none)"
                ).matches
            ) {
                return;
            }

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

    card.addEventListener(
        "pointerleave",
        () => {

            if (
                window.matchMedia(
                    "(hover: none)"
                ).matches
            ) {
                return;
            }

            startAvatarColorCycle();
        }
    );
});


/* =========================================
   MOBILE CARDS
   ========================================= */

let mobileTimer = null;
let mobileIndex = 0;


function activateMobileCard() {

    if (
        finalSequence.started
    ) {
        return;
    }

    cards.forEach(card => {

        card.classList.remove(
            "mobile-active"
        );
    });

    const card =
        cards[mobileIndex];

    if (!card)
        return;

    const color =
        card.dataset.color;

    card.classList.add(
        "mobile-active"
    );

    setColor(color);

    mobileIndex =
        (
            mobileIndex + 1
        ) %
        cards.length;
}


function startMobileCards() {

    if (
        window.innerWidth > 760
    ) {
        return;
    }

    if (mobileTimer)
        return;

    stopAvatarColorCycle();

    activateMobileCard();

    mobileTimer =
        setInterval(
            activateMobileCard,
            2200
        );
}


function stopMobileCards() {

    if (!mobileTimer)
        return;

    clearInterval(
        mobileTimer
    );

    mobileTimer = null;

    cards.forEach(card => {

        card.classList.remove(
            "mobile-active"
        );
    });
}


/* =========================================
   POO
   ========================================= */

const poo =
    document.createElement("img");

poo.id =
    "flying-poo";

poo.src =
    "assets/poo.png";

poo.alt = "";

poo.draggable = false;

poo.setAttribute(
    "aria-hidden",
    "true"
);

document.body.appendChild(
    poo
);


/* =========================================
   OGS CULE
   ========================================= */

const ogscule =
    document.createElement("img");

ogscule.id =
    "ogscule";

ogscule.src =
    "assets/ogscule.png";

ogscule.alt = "";

ogscule.draggable = false;

ogscule.setAttribute(
    "aria-hidden",
    "true"
);

document.body.appendChild(
    ogscule
);


/* =========================================
   POO PHYSICS
   ========================================= */

const ball = {

    x: 200,
    y: 200,

    size: 72,

    vx: 2.4,
    vy: 1.8,

    rotation: 0,

    rotationSpeed: 0.7,

    scaleX: 1,
    scaleY: 1,

    targetScaleX: 1,
    targetScaleY: 1
};


function resetPooPosition() {

    ball.size =
        window.innerWidth <= 760
            ? 58
            : 72;

    ball.x =
        w * 0.5 -
        ball.size / 2;

    ball.y =
        h * 0.25;

    ball.vx =
        (
            Math.random() > 0.5
                ? 1
                : -1
        ) * 2.2;

    ball.vy =
        (
            Math.random() > 0.5
                ? 1
                : -1
        ) * 1.7;
}


function squashX() {

    ball.scaleX = 0.58;
    ball.scaleY = 1.15;

    ball.targetScaleX = 1;
    ball.targetScaleY = 1;
}


function squashY() {

    ball.scaleX = 1.15;
    ball.scaleY = 0.58;

    ball.targetScaleX = 1;
    ball.targetScaleY = 1;
}


/* =========================================
   SCREEN COLLISION
   ========================================= */

function screenCollision() {

    let hitX = false;
    let hitY = false;

    if (
        ball.x <= 0 &&
        ball.vx < 0
    ) {

        ball.x = 0;

        ball.vx =
            Math.abs(
                ball.vx
            );

        hitX = true;
    }

    if (
        ball.x +
        ball.size >= w &&
        ball.vx > 0
    ) {

        ball.x =
            w -
            ball.size;

        ball.vx =
            -Math.abs(
                ball.vx
            );

        hitX = true;
    }

    if (
        ball.y <= 0 &&
        ball.vy < 0
    ) {

        ball.y = 0;

        ball.vy =
            Math.abs(
                ball.vy
            );

        hitY = true;
    }

    if (
        ball.y +
        ball.size >= h &&
        ball.vy > 0
    ) {

        ball.y =
            h -
            ball.size;

        ball.vy =
            -Math.abs(
                ball.vy
            );

        hitY = true;
    }

    if (
        hitX &&
        hitY
    ) {

        triggerFinalSequence();
    }

    if (hitX)
        squashX();

    if (hitY)
        squashY();
}


/* =========================================
   RECTANGLE COLLISION
   ========================================= */

function rectangleCollision(rect) {

    if (
        finalSequence.started
    ) {
        return;
    }

    const left =
        ball.x;

    const right =
        ball.x +
        ball.size;

    const top =
        ball.y;

    const bottom =
        ball.y +
        ball.size;

    const overlapX =
        Math.min(
            right,
            rect.right
        ) -
        Math.max(
            left,
            rect.left
        );

    const overlapY =
        Math.min(
            bottom,
            rect.bottom
        ) -
        Math.max(
            top,
            rect.top
        );

    if (
        overlapX <= 0 ||
        overlapY <= 0
    ) {
        return;
    }

    const centerX =
        ball.x +
        ball.size / 2;

    const centerY =
        ball.y +
        ball.size / 2;

    const rectCenterX =
        rect.left +
        rect.width / 2;

    const rectCenterY =
        rect.top +
        rect.height / 2;

    const dx =
        centerX -
        rectCenterX;

    const dy =
        centerY -
        rectCenterY;

    if (
        overlapX <
        overlapY
    ) {

        if (dx < 0) {

            ball.x =
                rect.left -
                ball.size;

            ball.vx =
                -Math.abs(
                    ball.vx
                );

        } else {

            ball.x =
                rect.right;

            ball.vx =
                Math.abs(
                    ball.vx
                );
        }

        squashX();

    } else {

        if (dy < 0) {

            ball.y =
                rect.top -
                ball.size;

            ball.vy =
                -Math.abs(
                    ball.vy
                );

        } else {

            ball.y =
                rect.bottom;

            ball.vy =
                Math.abs(
                    ball.vy
                );
        }

        squashY();
    }
}


/* =========================================
   CURSOR COLLISION
   ========================================= */

function cursorCollision() {

    if (
        finalSequence.started
    ) {
        return;
    }

    if (!mouse.active)
        return;

    const centerX =
        ball.x +
        ball.size / 2;

    const centerY =
        ball.y +
        ball.size / 2;

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

    const radius =
        ball.size * 0.5 +
        18;

    if (
        distance >= radius
    ) {
        return;
    }

    if (
        distance === 0
    ) {
        return;
    }

    const nx =
        dx / distance;

    const ny =
        dy / distance;

    const push =
        radius -
        distance;

    ball.x +=
        nx * push;

    ball.y +=
        ny * push;

    const dot =
        ball.vx * nx +
        ball.vy * ny;

    if (dot < 0) {

        ball.vx -=
            2 *
            dot *
            nx;

        ball.vy -=
            2 *
            dot *
            ny;
    }

    if (
        Math.abs(nx) >
        Math.abs(ny)
    ) {

        squashX();

    } else {

        squashY();
    }
}


/* =========================================
   FINAL STATE
   ========================================= */

const finalSequence = {

    started: false,

    cornerX: 0,
    cornerY: 0,

    cornerSideX: "left",
    cornerSideY: "top",

    falling: false,

    fallX: 0,
    fallY: 0,

    fallVelocity: 0,

    groundY: 0
};


/* =========================================
   OGS CULE -> CENTER
   ========================================= */

function animateOgsculeToCenter() {

    return new Promise(
        resolve => {

            const startX =
                finalSequence.cornerX;

            const startY =
                finalSequence.cornerY;

            const endX =
                w / 2;

            const endY =
                h / 2;

            const start =
                performance.now();

            const duration =
                1050;


            function animate(time) {

                const progress =
                    Math.min(
                        (
                            time -
                            start
                        ) /
                        duration,
                        1
                    );

                const eased =
                    1 -
                    Math.pow(
                        1 - progress,
                        3
                    );

                const x =
                    startX +
                    (
                        endX -
                        startX
                    ) *
                    eased;

                const y =
                    startY +
                    (
                        endY -
                        startY
                    ) *
                    eased;

                const scale =
                    0.15 +
                    0.85 *
                    eased;

                const rotation =
                    -12 +
                    12 *
                    eased;

                ogscule.style.left =
                    `${x}px`;

                ogscule.style.top =
                    `${y}px`;

                ogscule.style.opacity =
                    `${Math.min(
                        1,
                        progress * 5
                    )}`;

                ogscule.style.transform =
                    `
                    translate(-50%, -50%)
                    scale(${scale})
                    rotate(${rotation}deg)
                    `;

                if (
                    progress <
                    1
                ) {

                    requestAnimationFrame(
                        animate
                    );

                } else {

                    resolve();
                }
            }


            requestAnimationFrame(
                animate
            );
        }
    );
}


/* =========================================
   OGS CULE SPRING
   ========================================= */

function animateOgsculeSpring() {

    return new Promise(
        resolve => {

            const start =
                performance.now();

            const duration =
                900;


            function animate(time) {

                const progress =
                    Math.min(
                        (
                            time -
                            start
                        ) /
                        duration,
                        1
                    );

                const spring =
                    Math.exp(
                        -5 *
                        progress
                    ) *
                    Math.cos(
                        progress *
                        Math.PI *
                        6
                    );

                const scale =
                    1 -
                    spring *
                    0.42;

                const scaleX =
                    scale *
                    (
                        1 +
                        Math.sin(
                            progress *
                            Math.PI *
                            8
                        ) *
                        0.09
                    );

                const scaleY =
                    scale *
                    (
                        1 -
                        Math.sin(
                            progress *
                            Math.PI *
                            8
                        ) *
                        0.09
                    );

                ogscule.style.transform =
                    `
                    translate(-50%, -50%)
                    scale(
                        ${scaleX},
                        ${scaleY}
                    )
                    rotate(
                        ${Math.sin(
                            progress *
                            Math.PI *
                            4
                        ) * 5}deg
                    )
                    `;

                if (
                    progress <
                    1
                ) {

                    requestAnimationFrame(
                        animate
                    );

                } else {

                    ogscule.style.transform =
                        `
                        translate(-50%, -50%)
                        scale(1)
                        `;

                    resolve();
                }
            }


            requestAnimationFrame(
                animate
            );
        }
    );
}


/* =========================================
   OGS CULE FALL
   ========================================= */

function animateOgsculeFall() {

    return new Promise(
        resolve => {

            const startX =
                w / 2;

            let y =
                h / 2;

            let velocity =
                0;

            const gravity =
                0.62;


            playScreamSound();


            function animate() {

                velocity +=
                    gravity;

                y +=
                    velocity;

                const rotation =
                    Math.min(
                        velocity * 1.8,
                        35
                    );

                const scaleX =
                    1 -
                    Math.min(
                        velocity * 0.008,
                        0.12
                    );

                const scaleY =
                    1 +
                    Math.min(
                        velocity * 0.012,
                        0.18
                    );


                ogscule.style.left =
                    `${startX}px`;

                ogscule.style.top =
                    `${y}px`;

                ogscule.style.transform =
                    `
                    translate(-50%, -50%)
                    scale(
                        ${scaleX},
                        ${scaleY}
                    )
                    rotate(${rotation}deg)
                    `;


                if (
                    y >
                    h +
                    ogscule.offsetHeight
                ) {

                    ogscule.style.opacity =
                        "0";

                    resolve();

                    return;
                }


                requestAnimationFrame(
                    animate
                );
            }


            requestAnimationFrame(
                animate
            );
        }
    );
}


/* =========================================
   BURN ELEMENTS
   ========================================= */

function burnElement(
    element,
    delay
) {

    return new Promise(
        resolve => {

            setTimeout(
                () => {

                    element.classList.add(
                        "burning"
                    );

                    setTimeout(
                        resolve,
                        2400
                    );

                },
                delay
            );
        }
    );
}


/* =========================================
   BURN ALL
   ========================================= */

async function burnAllCards() {

    /*
        ВАЖНО:
        profile находится отдельно
        от .card, поэтому его тоже
        добавляем вручную.
    */

    const allElements = [
        profile,
        ...cards
    ];


    /*
        Запускаем звук сразу,
        когда начинается огонь.
    */

    startFireSound();


    /*
        Горение начинается
        слева направо.
    */

    allElements.forEach(
        (element, index) => {

            if (!element)
                return;

            setTimeout(
                () => {

                    element.classList.add(
                        "burning"
                    );

                },
                index * 180
            );
        }
    );


    /*
        Ждём пока последний
        элемент закончит гореть.
    */

    const totalTime =
        (
            allElements.length *
            180
        ) +
        2400;


    await new Promise(
        resolve =>
            setTimeout(
                resolve,
                totalTime
            )
    );


    /*
        Плавно выключаем
        звук огня.
    */

    stopFireSound();
}


/* =========================================
   MOVE POO TO CENTER
   ========================================= */

function movePooToCenter() {

    return new Promise(
        resolve => {

            const startX =
                ball.x;

            const startY =
                ball.y;

            const targetX =
                w / 2 -
                ball.size;

            const targetY =
                h / 2 -
                ball.size;

            const start =
                performance.now();

            const duration =
                650;


            function animate(time) {

                const progress =
                    Math.min(
                        (
                            time -
                            start
                        ) /
                        duration,
                        1
                    );

                const eased =
                    1 -
                    Math.pow(
                        1 - progress,
                        3
                    );

                ball.x =
                    startX +
                    (
                        targetX -
                        startX
                    ) *
                    eased;

                ball.y =
                    startY +
                    (
                        targetY -
                        startY
                    ) *
                    eased;

                poo.style.left =
                    `${ball.x}px`;

                poo.style.top =
                    `${ball.y}px`;

                poo.style.transform =
                    `
                    rotate(0deg)
                    scale(
                        ${1 + eased},
                        ${1 + eased}
                    )
                    `;


                if (
                    progress <
                    1
                ) {

                    requestAnimationFrame(
                        animate
                    );

                } else {

                    resolve();
                }
            }


            requestAnimationFrame(
                animate
            );
        }
    );
}


/* =========================================
   POO FINAL FALL
   ========================================= */

function fallPoo() {

    return new Promise(
        resolve => {

            finalSequence.falling =
                true;


            const enlargedSize =
                ball.size * 2;


            finalSequence.fallX =
                w / 2 -
                enlargedSize / 2;


            finalSequence.fallY =
                -enlargedSize;


            finalSequence.groundY =
                h -
                enlargedSize -
                18;


            finalSequence.fallVelocity =
                0;


            const gravity =
                0.48;


            function animate() {

                finalSequence.fallVelocity +=
                    gravity;

                finalSequence.fallY +=
                    finalSequence.fallVelocity;


                /*
                    Никакого вращения.
                    Падает строго вертикально.
                */

                poo.style.left =
                    `${finalSequence.fallX}px`;

                poo.style.top =
                    `${finalSequence.fallY}px`;

                poo.style.transform =
                    `
                    rotate(0deg)
                    scale(2, 2)
                    `;


                if (
                    finalSequence.fallY >=
                    finalSequence.groundY
                ) {

                    finalSequence.fallY =
                        finalSequence.groundY;


                    poo.style.left =
                        `${finalSequence.fallX}px`;

                    poo.style.top =
                        `${finalSequence.fallY}px`;


                    /*
                        Небольшое сжатие
                        при ударе о пол.
                    */

                    poo.style.transform =
                        `
                        rotate(0deg)
                        scale(
                            2.16,
                            1.82
                        )
                        `;


                    setTimeout(
                        () => {

                            /*
                                Возвращаем ровную
                                форму.
                            */

                            poo.style.transform =
                                `
                                rotate(0deg)
                                scale(2, 2)
                                `;


                            /*
                                Фиксируем позицию.
                            */

                            finalSequence.fallY =
                                finalSequence.groundY;


                            poo.style.top =
                                `${finalSequence.groundY}px`;


                            resolve();

                        },
                        180
                    );

                    return;
                }


                requestAnimationFrame(
                    animate
                );
            }


            requestAnimationFrame(
                animate
            );
        }
    );
}


/* =========================================
   FINAL SEQUENCE
   ========================================= */

async function triggerFinalSequence() {

    if (
        finalSequence.started
    ) {
        return;
    }


    finalSequence.started =
        true;


    stopAvatarColorCycle();
    stopMobileCards();


    /*
        Пытаемся разблокировать
        аудио перед началом.
    */

    getAudioContext();


    /*
        Определяем угол.
    */

    const hitLeft =
        ball.x <
        w / 2;

    const hitTop =
        ball.y <
        h / 2;


    finalSequence.cornerX =
        hitLeft
            ? 0
            : w;

    finalSequence.cornerY =
        hitTop
            ? 0
            : h;


    /*
        Poo исчезает на время
        появления OGScule.
    */

    poo.style.opacity =
        "0";


    ogscule.style.left =
        `${finalSequence.cornerX}px`;

    ogscule.style.top =
        `${finalSequence.cornerY}px`;

    ogscule.style.opacity =
        "0";


    /*
        Угол -> центр.
    */

    await animateOgsculeToCenter();


    /*
        Пружина.
    */

    playSpringSound();

    await animateOgsculeSpring();


    /*
        Падение + крик.
    */

    await animateOgsculeFall();


    /*
        ОГРОМНЫЙ момент:
        после ухода OGScule
        начинается настоящее
        горение.
    */

    await burnAllCards();


    /*
        Возвращаем poo.
    */

    poo.style.opacity =
        "1";


    /*
        Сначала ставим его
        в центр.
    */

    await movePooToCenter();


    /*
        Затем он падает
        вертикально вниз.
    */

    await fallPoo();
}


/* =========================================
   POO ANIMATION
   ========================================= */

let previousTime =
    performance.now();


function animatePoo(time) {

    if (
        finalSequence.started
    ) {

        requestAnimationFrame(
            animatePoo
        );

        return;
    }


    const delta =
        Math.min(
            (
                time -
                previousTime
            ) /
            16.6667,
            2
        );


    previousTime =
        time;


    ball.x +=
        ball.vx *
        delta;

    ball.y +=
        ball.vy *
        delta;


    screenCollision();


    const elements = [
        profile,
        ...cards
    ];


    elements
        .filter(Boolean)
        .forEach(element => {

            rectangleCollision(
                element.getBoundingClientRect()
            );
        });


    cursorCollision();


    ball.scaleX +=
        (
            ball.targetScaleX -
            ball.scaleX
        ) *
        0.06 *
        delta;


    ball.scaleY +=
        (
            ball.targetScaleY -
            ball.scaleY
        ) *
        0.06 *
        delta;


    ball.rotation +=
        ball.rotationSpeed *
        delta;


    poo.style.left =
        `${ball.x}px`;

    poo.style.top =
        `${ball.y}px`;

    poo.style.transform =
        `
        rotate(${ball.rotation}deg)
        scale(
            ${ball.scaleX},
            ${ball.scaleY}
        )
        `;


    requestAnimationFrame(
        animatePoo
    );
}


/* =========================================
   LOAD
   ========================================= */

poo.addEventListener(
    "load",
    () => {

        resetPooPosition();

        poo.style.display =
            "block";
    }
);


poo.addEventListener(
    "error",
    () => {

        console.error(
            "Не удалось загрузить assets/poo.png"
        );
    }
);


ogscule.addEventListener(
    "error",
    () => {

        console.error(
            "Не удалось загрузить assets/ogscule.png"
        );
    }
);


/* =========================================
   RESIZE
   ========================================= */

window.addEventListener(
    "resize",
    () => {

        if (
            finalSequence.started
        ) {
            return;
        }

        resize();

        resetPooPosition();


        if (
            window.innerWidth <= 760
        ) {

            startMobileCards();

        } else {

            stopMobileCards();

            startAvatarColorCycle();
        }
    }
);


/* =========================================
   START
   ========================================= */

resize();

frame();

colorLoop();

startAvatarColorCycle();

startMobileCards();

requestAnimationFrame(
    animatePoo
);
