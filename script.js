/* =========================================
   PARTICLES
   ========================================= */

const canvas = document.getElementById("particles");
const ctx = canvas.getContext("2d");

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
   COLOR
   ========================================= */

let currentColor =
    "#8b5cf6";

let targetColor =
    "#8b5cf6";


function hexToRgb(hex) {

    hex = hex.replace("#", "");

    if (hex.length === 3) {
        hex = hex
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
            .map(v =>
                Math.round(v)
                    .toString(16)
                    .padStart(2, "0")
            )
            .join("")
    );
}


function mixColor(a, b, t) {

    const A = hexToRgb(a);
    const B = hexToRgb(b);

    return rgbToHex(
        A[0] + (B[0] - A[0]) * t,
        A[1] + (B[1] - A[1]) * t,
        A[2] + (B[2] - A[2]) * t
    );
}


function applyAccent(color) {

    document.documentElement.style.setProperty(
        "--accent",
        color
    );

    if (avatar) {

        avatar.style.setProperty(
            "--avatar-color",
            color
        );
    }
}


function updateColor() {

    currentColor =
        mixColor(
            currentColor,
            targetColor,
            0.035
        );

    applyAccent(currentColor);

    requestAnimationFrame(
        updateColor
    );
}


function setColor(color) {

    targetColor = color;
}


/* =========================================
   AVATAR COLOR CYCLE
   ========================================= */

const cardColors =
    cards.map(
        card => card.dataset.color
    );

let avatarColorIndex = 0;

let avatarColorTimer = null;


function startAvatarColorCycle() {

    if (avatarColorTimer)
        return;

    if (!cardColors.length)
        return;


    avatarColorTimer =
        setInterval(() => {

            if (mouse.active)
                return;

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
                                w * h / 7000
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
   PARTICLES ANIMATION
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


        let dx =
            p.x - mouse.x;

        let dy =
            p.y - mouse.y;


        let dist =
            Math.hypot(
                dx,
                dy
            );


        let alpha = 0.2;


        if (
            mouse.active &&
            dist < 155
        ) {

            let force =
                1 -
                dist / 155;


            /*
                Частицы разлетаются
                от курсора.
            */

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


            /*
                Лёгкая белая
                подсветка.
            */

            alpha =
                0.2 +
                0.45 * force;
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
   MOUSE MOVEMENT
   ========================================= */

window.addEventListener(
    "pointermove",
    event => {

        mouse.x =
            event.clientX;

        mouse.y =
            event.clientY;

        mouse.active = true;


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
   CARD EFFECTS
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
   POO ELEMENT
   ========================================= */

const poo =
    document.createElement("img");


poo.id =
    "flying-poo";


poo.src =
    "assets/poo.png";


poo.alt =
    "";


poo.draggable =
    false;


poo.setAttribute(
    "aria-hidden",
    "true"
);


document.body.appendChild(
    poo
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


/* =========================================
   INITIAL POSITION
   ========================================= */

function resetPooPosition() {

    ball.size =
        window.innerWidth <= 760
            ? 58
            : 72;


    ball.x =
        w * 0.5 -
        ball.size * 0.5;


    ball.y =
        h * 0.25;


    ball.vx =
        (
            Math.random() > 0.5
                ? 1
                : -1
        ) *
        2.2;


    ball.vy =
        (
            Math.random() > 0.5
                ? 1
                : -1
        ) *
        1.7;
}


/* =========================================
   SQUASH
   ========================================= */

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

    if (
        ball.x <= 0 &&
        ball.vx < 0
    ) {

        ball.x = 0;

        ball.vx =
            Math.abs(
                ball.vx
            );

        squashX();
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

        squashX();
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

        squashY();
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

        squashY();
    }
}


/* =========================================
   RECTANGLE COLLISION
   ========================================= */

function rectangleCollision(rect) {

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


    /*
        Отражаем движение
        от курсора.
    */

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
   POO ANIMATION
   ========================================= */

let previousTime =
    performance.now();


function animatePoo(time) {

    const delta =
        Math.min(
            (
                time -
                previousTime
            ) / 16.6667,
            2
        );


    previousTime =
        time;


    /*
        Движение.
    */

    ball.x +=
        ball.vx *
        delta;

    ball.y +=
        ball.vy *
        delta;


    /*
        Столкновение
        с экраном.
    */

    screenCollision();


    /*
        Столкновение
        с плашками.
    */

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


    /*
        Столкновение
        с курсором.
    */

    cursorCollision();


    /*
        Плавное восстановление
        формы после удара.
    */

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


    /*
        Вращение.
    */

    ball.rotation +=
        ball.rotationSpeed *
        delta;


    /*
        Позиция.
    */

    poo.style.left =
        `${ball.x}px`;

    poo.style.top =
        `${ball.y}px`;


    /*
        Форма + вращение.
    */

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
   POO IMAGE LOADED
   ========================================= */

poo.addEventListener(
    "load",
    () => {

        /*
            Только после загрузки
            запускаем позиционирование.
        */

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


/* =========================================
   WINDOW RESIZE
   ========================================= */

window.addEventListener(
    "resize",
    () => {

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
   START EVERYTHING
   ========================================= */

resize();

frame();

updateColor();

startAvatarColorCycle();

startMobileCards();

requestAnimationFrame(
    animatePoo
);
