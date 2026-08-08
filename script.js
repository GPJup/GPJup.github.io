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
   MOUSE
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

        mouse.active = false;

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
   OGSCULE
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
   CORNER
   ========================================= */

function isCornerCollision() {

    const margin = 2;

    const left =
        ball.x <= margin;

    const right =
        ball.x +
        ball.size >=
        w - margin;

    const top =
        ball.y <= margin;

    const bottom =
        ball.y +
        ball.size >=
        h - margin;

    return (
        (left || right) &&
        (top || bottom)
    );
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

    /*
        Важный момент:
        финал запускается именно
        при физическом попадании
        в настоящий угол.
    */

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
   AUDIO
   ========================================= */

let audioContext = null;


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

        return audioContext;

    } catch {

        return null;
    }
}


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


    /*
        Дополнительный
        металлический слой.
    */

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
   SCREAM SOUND
   ========================================= */

function playScreamSound() {

    const audio =
        getAudioContext();

    if (!audio)
        return;

    const now =
        audio.currentTime;


    /*
        Генерируем резкий
        мультяшный крик.
    */

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
        0.07,
        now + 0.28
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


    /*
        Второй голос.
    */

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
   FINAL STATE
   ========================================= */

const finalSequence = {

    started: false,

    cornerX: 0,
    cornerY: 0,

    centerX: 0,
    centerY: 0,

    enlargedSize: 0,

    falling: false,

    fallX: 0,
    fallY: 0,

    fallVelocity: 0,

    groundY: 0
};


/* =========================================
   OGSCULE: CORNER -> CENTER
   ========================================= */

function animateOgsculeToCenter() {

    return new Promise(
        resolve => {

            /*
                Размер уже задан CSS.

                Старт:
                прямо в углу.

                Финиш:
                центр экрана.
            */

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


                /*
                    Плавное движение
                    к центру.
                */

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


                /*
                    Одновременно
                    сильно увеличиваем.
                */

                const scale =
                    0.15 +
                    0.85 *
                    eased;


                /*
                    Небольшое
                    вращение.
                */

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
   OGSCULE SPRING
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


                /*
                    Пружина:
                    маленькая
                    ->
                    большая
                    ->
                    маленькая
                    ->
                    нормальная.
                */

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
   OGSCULE FALLS UNDER SCREEN
   ========================================= */

function animateOgsculeFall() {

    return new Promise(
        resolve => {

            const startX =
                w / 2;

            const startY =
                h / 2;


            let y =
                startY;


            let velocity =
                0;


            const gravity =
                0.62;


            const duration =
                1000;


            const start =
                performance.now();


            /*
                Крик начинается
                в момент начала падения.
            */

            playScreamSound();


            function animate(time) {

                const elapsed =
                    time -
                    start;


                velocity +=
                    gravity;


                y +=
                    velocity;


                const progress =
                    Math.min(
                        elapsed /
                        duration,
                        1
                    );


                /*
                    Пока падает,
                    слегка наклоняется.
                */

                const rotation =
                    progress *
                    18;


                /*
                    Небольшое растяжение
                    по вертикали.
                */

                const scaleX =
                    1 -
                    progress * 0.08;

                const scaleY =
                    1 +
                    progress * 0.15;


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


                /*
                    После выхода
                    за экран полностью
                    исчезает.
                */

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


                /*
                    Если duration
                    прошёл, всё равно
                    продолжаем до
                    выхода за экран.
                */

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
   BURN CARDS
   ========================================= */

function burnCards() {

    cards.forEach(
        (card, index) => {

            setTimeout(
                () => {

                    card.classList.add(
                        "burning"
                    );

                },
                index * 100
            );
        }
    );
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


                const scale =
                    1 +
                    eased;


                poo.style.transform =
                    `
                    rotate(${ball.rotation}deg)
                    scale(
                        ${scale},
                        ${scale}
                    )
                    `;


                poo.style.left =
                    `${ball.x}px`;

                poo.style.top =
                    `${ball.y}px`;


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
   POO FALL
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
                h / 2 -
                enlargedSize / 2;


            finalSequence.groundY =
                h -
                enlargedSize -
                18;


            finalSequence.fallVelocity =
                0;


            const gravity =
                0.48;


            let finished =
                false;


            function animate() {

                if (finished)
                    return;


                finalSequence.fallVelocity +=
                    gravity;


                finalSequence.fallY +=
                    finalSequence.fallVelocity;


                const rotation =
                    Math.min(
                        finalSequence.fallVelocity *
                        1.8,
                        35
                    );


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


                    poo.style.transform =
                        `
                        rotate(${rotation}deg)
                        scale(2.28, 1.68)
                        `;


                    setTimeout(
                        () => {

                            poo.style.transform =
                                `
                                rotate(${rotation}deg)
                                scale(2, 2)
                                `;

                            finished = true;

                            resolve();

                        },
                        230
                    );


                    return;
                }


                poo.style.left =
                    `${finalSequence.fallX}px`;

                poo.style.top =
                    `${finalSequence.fallY}px`;

                poo.style.transform =
                    `
                    rotate(${rotation}deg)
                    scale(2, 2)
                    `;


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
        Определяем настоящий
        угол столкновения.
    */

    const hitLeft =
        ball.x <=
        ball.size * 0.5;

    const hitTop =
        ball.y <=
        ball.size * 0.5;


    /*
        Координаты угла.

        OGScule будет стартовать
        именно отсюда.
    */

    if (hitLeft) {

        finalSequence.cornerX =
            0;

    } else {

        finalSequence.cornerX =
            w;
    }


    if (hitTop) {

        finalSequence.cornerY =
            0;

    } else {

        finalSequence.cornerY =
            h;
    }


    /*
        Poo временно скрываем.
    */

    poo.style.opacity =
        "0";


    /*
        OGScule ставим
        непосредственно в угол.
    */

    ogscule.style.left =
        `${finalSequence.cornerX}px`;

    ogscule.style.top =
        `${finalSequence.cornerY}px`;

    ogscule.style.opacity =
        "0";

    ogscule.style.transform =
        `
        translate(-50%, -50%)
        scale(0.15)
        `;


    /*
        1.
        Из угла в центр
        с увеличением.
    */

    await animateOgsculeToCenter();


    /*
        2.
        Пружинная анимация
        в центре.
    */

    playSpringSound();

    await animateOgsculeSpring();


    /*
        3.
        Проваливание
        под экран + крик.
    */

    await animateOgsculeFall();


    /*
        4.
        Только после полного
        исчезновения OGScule
        сгорают плашки.
    */

    burnCards();


    /*
        Небольшая пауза,
        чтобы плашки успели
        начать сгорать.
    */

    await new Promise(
        resolve =>
            setTimeout(
                resolve,
                350
            )
    );


    /*
        5.
        Возвращаем poo
        в центр ×2.
    */

    poo.style.opacity =
        "1";


    await movePooToCenter();


    /*
        6.
        И он падает.
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
        document.querySelector(
            ".profile"
        ),
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
