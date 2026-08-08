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


const mouse = {
    x: -999,
    y: -999,
    active: false,
    color: "#ffffff"
};


const cardColors =
    cards.map(
        card => card.dataset.color
    );


const palette = [
    "#8b5cf6",
    "#a78bfa",
    "#6366f1"
];


/* =========================================
   AVATAR
   ========================================= */

function setAvatarColor(color) {

    if (!avatar)
        return;


    avatar.style.setProperty(
        "--avatar-color",
        color
    );


    document.documentElement.style.setProperty(
        "--accent",
        color
    );
}


let avatarIndex = 0;
let avatarInterval = null;


function startAvatarCycle() {

    if (avatarInterval)
        return;


    if (!cardColors.length)
        return;


    setAvatarColor(
        cardColors[avatarIndex]
    );


    avatarInterval =
        setInterval(() => {

            if (mouse.active)
                return;


            avatarIndex =
                (avatarIndex + 1) %
                cardColors.length;


            setAvatarColor(
                cardColors[avatarIndex]
            );

        }, 1300);
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
   CANVAS
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


    for (const particle of particles) {

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
            Реакция частиц на курсор.
            Частицы остаются своих цветов.
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


            setAvatarColor(
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


            const x =
                event.clientX -
                rect.left;


            const y =
                event.clientY -
                rect.top;


            card.style.setProperty(
                "--mx",
                `${x}px`
            );


            card.style.setProperty(
                "--my",
                `${y}px`
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
   MOBILE AUTO HIGHLIGHT
   ========================================= */

let mobileInterval = null;
let mobileIndex = 0;


function activateMobileCard() {

    /*
        Сначала выключаем
        все карточки.
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
        ВАЖНО:

        Сначала задаём цвет карточки,
        потом включаем active.

        Благодаря этому Discord
        гарантированно получает #5865f2.
    */

    card.style.setProperty(
        "--link-color",
        color
    );


    card.classList.add(
        "mobile-active"
    );


    /*
        Аватарка получает
        тот же цвет.
    */

    setAvatarColor(
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
            1600
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
