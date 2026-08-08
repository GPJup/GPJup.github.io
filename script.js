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


function lerp(a, b, amount) {

    return a +
        (b - a) *
        amount;
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
        lerp(a.r, b.r, amount),
        lerp(a.g, b.g, amount),
        lerp(a.b, b.b, amount)
    );
}


/* =========================================
   SMOOTH COLOR ENGINE
   ========================================= */

let currentColor =
    cardColors[0] || "#8b5cf6";

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


    /*
        Чем дальше цвета друг от друга,
        тем плавнее идёт переход.
    */

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


    /*
        Все активные карточки получают
        текущий промежуточный цвет.

        Именно это создаёт настоящий
        плавный переход.
    */

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
   AVATAR CYCLE
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
                (avatarIndex + 1) %
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
                    (Math.random() - 0.5) *
                    0.2,

                vy:
                    (Math.random() - 0.5) *
                    0.2,

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
   PARTICLES
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


        /*
            Разлёт частиц от курсора.
        */

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
   DESKTOP CURSOR
   ========================================= */

window.addEventListener(
    "pointermove",
    event => {

        if (
            window.matchMedia(
                "(hover: none)"
            ).matches
        ) {
            return;
        }


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
   DESKTOP CARDS
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
   MOBILE
   ========================================= */

let mobileInterval = null;
let mobileIndex = 0;


function activateMobileCard() {

    /*
        Убираем старую активную карточку.
    */

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


    /*
        Включаем новую карточку.
    */

    card.classList.add(
        "mobile-active"
    );


    /*
        ВАЖНО:

        Не меняем --link-color
        напрямую на новый цвет.

        Вместо этого запускаем
        плавную интерполяцию.
    */

    setTargetColor(
        color
    );


    mobileIndex =
        (mobileIndex + 1) %
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

    if (mobileInterval) {

        clearInterval(
            mobileInterval
        );

        mobileInterval = null;
    }


    cards.forEach(card => {

        card.classList.remove(
            "mobile-active"
        );
    });
}


/* =========================================
   DEVICE MODE
   ========================================= */

function updateDeviceMode() {

    const mobile =
        window.matchMedia(
            "(max-width: 760px)"
        ).matches;


    stopMobileAnimation();


    if (mobile) {

        mouse.active = false;


        document.body.classList.remove(
            "cursor-active"
        );


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


window.addEventListener(
    "resize",
    () => {

        resize();

        updateDeviceMode();
    }
);
