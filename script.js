/* =========================================
   PARTICLES
   ========================================= */

const canvas =
    document.getElementById("particles");

const ctx =
    canvas.getContext("2d");

const cards =
    [...document.querySelectorAll(".card")];

const avatar =
    document.querySelector(".avatar");


let width;
let height;
let dpr;

let particles = [];


/* =========================================
   COLORS
   ========================================= */

const palette = [
    "#8b5cf6",
    "#a78bfa",
    "#6366f1"
];

const cardColors =
    cards.map(
        card => card.dataset.color
    );


/* =========================================
   MOUSE
   ========================================= */

const mouse = {
    x: -999,
    y: -999,

    active: false,

    color: "#ffffff"
};


/* =========================================
   COLOR HELPERS
   ========================================= */

function hexToRgb(hex) {

    hex =
        hex
            .replace("#", "")
            .trim();


    if (hex.length === 3) {

        hex =
            hex
                .split("")
                .map(char => char + char)
                .join("");
    }


    const number =
        parseInt(hex, 16);


    return {
        r: (number >> 16) & 255,
        g: (number >> 8) & 255,
        b: number & 255
    };
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


function interpolateColor(
    colorA,
    colorB,
    amount
) {

    const a =
        hexToRgb(colorA);

    const b =
        hexToRgb(colorB);


    return rgbToHex(
        a.r + (b.r - a.r) * amount,
        a.g + (b.g - a.g) * amount,
        a.b + (b.b - a.b) * amount
    );
}


/* =========================================
   SMOOTH COLOR ENGINE
   ========================================= */

let currentColor =
    cardColors[0] ||
    "#8b5cf6";

let targetColor =
    currentColor;

let colorAnimation = null;


function setTargetColor(color) {

    targetColor =
        color;


    if (colorAnimation)
        return;


    colorAnimation =
        requestAnimationFrame(
            animateColor
        );
}


function animateColor() {

    const current =
        hexToRgb(currentColor);

    const target =
        hexToRgb(targetColor);


    const distance =
        Math.max(
            Math.abs(
                current.r -
                target.r
            ),

            Math.abs(
                current.g -
                target.g
            ),

            Math.abs(
                current.b -
                target.b
            )
        );


    const speed =
        1 -
        Math.pow(
            0.001,
            1 / 55
        );


    currentColor =
        interpolateColor(
            currentColor,
            targetColor,
            speed
        );


    applyColor(
        currentColor
    );


    if (distance < 1) {

        currentColor =
            targetColor;

        applyColor(
            currentColor
        );

        colorAnimation = null;

        return;
    }


    colorAnimation =
        requestAnimationFrame(
            animateColor
        );
}


/* =========================================
   APPLY COLOR
   ========================================= */

function applyColor(color) {

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


    cards.forEach(card => {

        if (
            card.classList.contains(
                "mobile-active"
            )
        ) {

            card.style.setProperty(
                "--link-color",
                color
            );
        }
    });
}


/* =========================================
   AVATAR COLOR CYCLE
   ========================================= */

let avatarIndex = 0;
let avatarInterval = null;


function startAvatarCycle() {

    if (avatarInterval)
        return;


    if (!cardColors.length)
        return;


    setTargetColor(
        cardColors[avatarIndex]
    );


    avatarInterval =
        setInterval(() => {

            if (mouse.active)
                return;


            avatarIndex =
                (
                    avatarIndex + 1
                ) %
                cardColors.length;


            setTargetColor(
                cardColors[avatarIndex]
            );

        }, 1800);
}


function stopAvatarCycle() {

    if (!avatarInterval)
        return;


    clearInterval(
        avatarInterval
    );


    avatarInterval = null;
}


/* =========================================
   CANVAS RESIZE
   ========================================= */

function resize() {

    dpr =
        Math.min(
            window.devicePixelRatio || 1,
            2
        );


    width =
        window.innerWidth;

    height =
        window.innerHeight;


    canvas.width =
        width * dpr;

    canvas.height =
        height * dpr;


    canvas.style.width =
        `${width}px`;

    canvas.style.height =
        `${height}px`;


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
                                width *
                                height /
                                7000
                            )
                        )
                    )
            },

            () => ({

                x:
                    Math.random() *
                    width,

                y:
                    Math.random() *
                    height,

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
                    Math.random() *
                    1.5,

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
   PARTICLE ANIMATION
   ========================================= */

function drawParticles() {

    ctx.clearRect(
        0,
        0,
        width,
        height
    );


    for (
        const particle of particles
    ) {

        particle.life += 0.008;


        particle.x +=
            particle.vx +
            Math.sin(
                particle.life
            ) * 0.025;


        particle.y +=
            particle.vy +
            Math.cos(
                particle.life
            ) * 0.025;


        if (particle.x < -20)
            particle.x =
                width + 20;


        if (particle.x > width + 20)
            particle.x = -20;


        if (particle.y < -20)
            particle.y =
                height + 20;


        if (particle.y > height + 20)
            particle.y = -20;


        const dx =
            particle.x -
            mouse.x;

        const dy =
            particle.y -
            mouse.y;


        const distance =
            Math.hypot(
                dx,
                dy
            );


        let alpha = 0.2;


        if (
            mouse.active &&
            distance < 150
        ) {

            const force =
                1 -
                distance / 150;


            alpha =
                0.2 +
                0.45 * force;


            if (distance > 0) {

                const push =
                    force *
                    force *
                    1.8;


                particle.x +=
                    (dx / distance) *
                    push;


                particle.y +=
                    (dy / distance) *
                    push;
            }
        }


        ctx.globalAlpha =
            alpha;

        ctx.fillStyle =
            particle.c;


        ctx.beginPath();


        ctx.arc(
            particle.x,
            particle.y,
            particle.r,
            0,
            Math.PI * 2
        );


        ctx.fill();
    }


    ctx.globalAlpha = 1;


    requestAnimationFrame(
        drawParticles
    );
}


/* =========================================
   CURSOR
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


        startAvatarCycle();
    }
);


/* =========================================
   CARD MOUSE EFFECTS
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


            stopAvatarCycle();


            setTargetColor(
                color
            );
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


            startAvatarCycle();
        }
    );
});


/* =========================================
   MOBILE CARD ANIMATION
   ========================================= */

let mobileInterval = null;
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


    setTargetColor(
        color
    );


    mobileIndex =
        (
            mobileIndex + 1
        ) %
        cards.length;
}


function startMobileAnimation() {

    if (mobileInterval)
        return;


    if (!cards.length)
        return;


    stopAvatarCycle();


    mobileIndex = 0;


    activateMobileCard();


    mobileInterval =
        setInterval(
            activateMobileCard,
            2200
        );
}


function stopMobileAnimation() {

    if (!mobileInterval)
        return;


    clearInterval(
        mobileInterval
    );


    mobileInterval = null;


    cards.forEach(card => {

        card.classList.remove(
            "mobile-active"
        );
    });
}


/* =========================================
   FLYING POO
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

document.body.appendChild(
    poo
);


/* =========================================
   POO PHYSICS
   ========================================= */

const pooPhysics = {

    x: 0,
    y: 0,

    width: 72,
    height: 72,

    vx: 2.15,
    vy: 1.65,

    rotation: 0,

    rotationSpeed: 0.7,

    /*
        1 = нормальный размер.
        Меньше 1 = сжатие.
    */

    scaleX: 1,
    scaleY: 1,

    targetScaleX: 1,
    targetScaleY: 1,

    /*
        Не даём картинке
        сталкиваться с одной
        и той же стеной каждый кадр.
    */

    cooldown: 0
};


/* =========================================
   POO INITIAL POSITION
   ========================================= */

function initializePoo() {

    pooPhysics.width =
        window.innerWidth <= 760
            ? 58
            : 72;

    pooPhysics.height =
        pooPhysics.width;


    pooPhysics.x =
        window.innerWidth * 0.5 -
        pooPhysics.width * 0.5;


    pooPhysics.y =
        window.innerHeight * 0.25;


    /*
        Небольшое случайное
        направление.
    */

    pooPhysics.vx =
        (
            Math.random() > 0.5
                ? 1
                : -1
        ) *
        (1.8 + Math.random() * 1.2);


    pooPhysics.vy =
        (
            Math.random() > 0.5
                ? 1
                : -1
        ) *
        (1.5 + Math.random() * 1.2);
}


/* =========================================
   GET COLLISION RECTANGLES
   ========================================= */

function getCollisionRects() {

    const elements = [
        document.querySelector(".profile"),
        ...cards
    ];


    return elements
        .filter(Boolean)
        .map(element =>
            element.getBoundingClientRect()
        );
}


/* =========================================
   SQUASH
   ========================================= */

function squashHorizontal() {

    /*
        Удар слева/справа.

        Сжимаем по X,
        слегка растягиваем по Y.
    */

    pooPhysics.scaleX =
        0.58;

    pooPhysics.scaleY =
        1.15;


    pooPhysics.targetScaleX =
        1;

    pooPhysics.targetScaleY =
        1;
}


function squashVertical() {

    /*
        Удар сверху/снизу.

        Сжимаем по Y,
        слегка растягиваем по X.
    */

    pooPhysics.scaleX =
        1.15;

    pooPhysics.scaleY =
        0.58;


    pooPhysics.targetScaleX =
        1;

    pooPhysics.targetScaleY =
        1;
}


/* =========================================
   WALL COLLISION
   ========================================= */

function checkScreenCollision() {

    const halfW =
        pooPhysics.width / 2;

    const halfH =
        pooPhysics.height / 2;


    /*
        Левая стена
    */

    if (
        pooPhysics.x <= 0 &&
        pooPhysics.vx < 0
    ) {

        pooPhysics.x = 0;

        pooPhysics.vx =
            Math.abs(
                pooPhysics.vx
            );


        squashHorizontal();
    }


    /*
        Правая стена
    */

    if (
        pooPhysics.x +
        pooPhysics.width >=
        width &&

        pooPhysics.vx > 0
    ) {

        pooPhysics.x =
            width -
            pooPhysics.width;


        pooPhysics.vx =
            -Math.abs(
                pooPhysics.vx
            );


        squashHorizontal();
    }


    /*
        Верхняя стена
    */

    if (
        pooPhysics.y <= 0 &&
        pooPhysics.vy < 0
    ) {

        pooPhysics.y = 0;

        pooPhysics.vy =
            Math.abs(
                pooPhysics.vy
            );


        squashVertical();
    }


    /*
        Нижняя стена
    */

    if (
        pooPhysics.y +
        pooPhysics.height >=
        height &&

        pooPhysics.vy > 0
    ) {

        pooPhysics.y =
            height -
            pooPhysics.height;


        pooPhysics.vy =
            -Math.abs(
                pooPhysics.vy
            );


        squashVertical();
    }
}


/* =========================================
   RECTANGLE COLLISION
   ========================================= */

function checkRectCollision(rect) {

    const left =
        pooPhysics.x;

    const right =
        pooPhysics.x +
        pooPhysics.width;

    const top =
        pooPhysics.y;

    const bottom =
        pooPhysics.y +
        pooPhysics.height;


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


    /*
        Нет пересечения.
    */

    if (
        overlapX <= 0 ||
        overlapY <= 0
    ) {
        return;
    }


    /*
        Центры.
    */

    const pooCenterX =
        left +
        pooPhysics.width / 2;

    const pooCenterY =
        top +
        pooPhysics.height / 2;


    const rectCenterX =
        rect.left +
        rect.width / 2;

    const rectCenterY =
        rect.top +
        rect.height / 2;


    const dx =
        pooCenterX -
        rectCenterX;

    const dy =
        pooCenterY -
        rectCenterY;


    /*
        Определяем сторону
        столкновения по меньшему
        перекрытию.
    */

    if (overlapX < overlapY) {

        if (dx < 0) {

            pooPhysics.x =
                rect.left -
                pooPhysics.width;

            pooPhysics.vx =
                -Math.abs(
                    pooPhysics.vx
                );

        } else {

            pooPhysics.x =
                rect.right;

            pooPhysics.vx =
                Math.abs(
                    pooPhysics.vx
                );
        }


        squashHorizontal();

    } else {

        if (dy < 0) {

            pooPhysics.y =
                rect.top -
                pooPhysics.height;

            pooPhysics.vy =
                -Math.abs(
                    pooPhysics.vy
                );

        } else {

            pooPhysics.y =
                rect.bottom;

            pooPhysics.vy =
                Math.abs(
                    pooPhysics.vy
                );
        }


        squashVertical();
    }


    /*
        Чуть-чуть увеличиваем
        скорость после удара,
        но ставим потолок.
    */

    const speed =
        Math.hypot(
            pooPhysics.vx,
            pooPhysics.vy
        );


    if (speed < 2.2) {

        const multiplier =
            2.2 / speed;


        pooPhysics.vx *=
            multiplier;

        pooPhysics.vy *=
            multiplier;
    }


    const maxSpeed =
        4.8;


    const newSpeed =
        Math.hypot(
            pooPhysics.vx,
            pooPhysics.vy
        );


    if (
        newSpeed >
        maxSpeed
    ) {

        pooPhysics.vx *=
            maxSpeed /
            newSpeed;

        pooPhysics.vy *=
            maxSpeed /
            newSpeed;
    }
}


/* =========================================
   CURSOR COLLISION
   ========================================= */

function checkCursorCollision() {

    if (!mouse.active)
        return;


    const centerX =
        pooPhysics.x +
        pooPhysics.width / 2;

    const centerY =
        pooPhysics.y +
        pooPhysics.height / 2;


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
        Math.max(
            pooPhysics.width,
            pooPhysics.height
        ) *
        0.5 +
        20;


    if (
        distance >=
        collisionRadius
    ) {
        return;
    }


    if (distance === 0)
        return;


    /*
        Направление от курсора
        к картинке.
    */

    const nx =
        dx / distance;

    const ny =
        dy / distance;


    /*
        Выталкиваем картинку
        наружу от курсора.
    */

    const push =
        collisionRadius -
        distance;


    pooPhysics.x +=
        nx *
        push;

    pooPhysics.y +=
        ny *
        push;


    /*
        Отражаем скорость
        относительно нормали.
    */

    const velocityAlongNormal =
        pooPhysics.vx * nx +
        pooPhysics.vy * ny;


    if (
        velocityAlongNormal < 0
    ) {

        pooPhysics.vx -=
            2 *
            velocityAlongNormal *
            nx;

        pooPhysics.vy -=
            2 *
            velocityAlongNormal *
            ny;
    }


    /*
        Сила удара зависит
        от скорости.
    */

    if (
        Math.abs(nx) >
        Math.abs(ny)
    ) {

        squashHorizontal();

    } else {

        squashVertical();
    }


    /*
        Небольшой импульс,
        чтобы курсор ощущался
        как настоящий объект.
    */

    pooPhysics.vx +=
        nx * 0.35;

    pooPhysics.vy +=
        ny * 0.35;
}


/* =========================================
   POO ANIMATION
   ========================================= */

let lastPooTime =
    performance.now();


function animatePoo(time) {

    const delta =
        Math.min(
            (time - lastPooTime) /
            16.6667,
            2
        );


    lastPooTime =
        time;


    /*
        Двигаем.
    */

    pooPhysics.x +=
        pooPhysics.vx *
        delta;

    pooPhysics.y +=
        pooPhysics.vy *
        delta;


    /*
        Столкновения.
    */

    checkScreenCollision();


    const rects =
        getCollisionRects();


    for (
        const rect of rects
    ) {

        checkRectCollision(
            rect
        );
    }


    checkCursorCollision();


    /*
        Плавно возвращаем
        форму после удара.
    */

    pooPhysics.scaleX +=
        (
            pooPhysics.targetScaleX -
            pooPhysics.scaleX
        ) *
        0.055 *
        delta;


    pooPhysics.scaleY +=
        (
            pooPhysics.targetScaleY -
            pooPhysics.scaleY
        ) *
        0.055 *
        delta;


    /*
        Вращение.
    */

    pooPhysics.rotation +=
        pooPhysics.rotationSpeed *
        delta;


    /*
        Применяем трансформацию.
    */

    poo.style.left =
        `${pooPhysics.x}px`;

    poo.style.top =
        `${pooPhysics.y}px`;


    poo.style.transform =
        `
        rotate(${pooPhysics.rotation}deg)
        scale(
            ${pooPhysics.scaleX},
            ${pooPhysics.scaleY}
        )
        `;


    requestAnimationFrame(
        animatePoo
    );
}


/* =========================================
   DEVICE MODE
   ========================================= */

let mobileInterval = null;
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


    setTargetColor(
        color
    );


    mobileIndex =
        (
            mobileIndex + 1
        ) %
        cards.length;
}


function startMobileAnimation() {

    if (mobileInterval)
        return;


    if (!cards.length)
        return;


    stopAvatarCycle();


    mobileIndex = 0;


    activateMobileCard();


    mobileInterval =
        setInterval(
            activateMobileCard,
            2200
        );
}


function stopMobileAnimation() {

    if (!mobileInterval)
        return;


    clearInterval(
        mobileInterval
    );


    mobileInterval = null;


    cards.forEach(card => {

        card.classList.remove(
            "mobile-active"
        );
    });
}


function updateDeviceMode() {

    const mobile =
        window.matchMedia(
            "(max-width: 760px)"
        ).matches;


    stopMobileAnimation();


    if (mobile) {

        startMobileAnimation();

    } else {

        startAvatarCycle();
    }
}


/* =========================================
   START
   ========================================= */

resize();

updateDeviceMode();

drawParticles();

initializePoo();

requestAnimationFrame(
    animatePoo
);


window.addEventListener(
    "resize",
    () => {

        resize();

        pooPhysics.width =
            window.innerWidth <= 760
                ? 58
                : 72;

        pooPhysics.height =
            pooPhysics.width;

        updateDeviceMode();
    }
);
