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

    color: "#8b5cf6"
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
   AVATAR COLOR
   ========================================= */

function setAvatarColor(color) {

    if (!avatar) return;

    avatar.style.setProperty(
        "--avatar-color",
        color
    );

    document.documentElement.style.setProperty(
        "--accent",
        color
    );

    document.documentElement.style.setProperty(
        "--mouse-color",
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

            /*
                Если курсор находится
                на кнопке, цвет аватарки
                не переключаем.
            */

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
   COLOR HELPERS
   ========================================= */

function rgb(hex) {

    hex =
        hex.replace(
            "#",
            ""
        );


    if (hex.length === 3) {

        hex =
            hex
                .split("")
                .map(
                    x => x + x
                )
                .join("");
    }


    const number =
        parseInt(
            hex,
            16
        );


    return [
        (number >> 16) & 255,
        (number >> 8) & 255,
        number & 255
    ];
}


function mix(a, b, amount) {

    const A = rgb(a);
    const B = rgb(b);


    return `rgb(${A.map(
        (value, index) =>
            Math.round(
                value +
                (B[index] - value) *
                amount
            )
    ).join(",")})`;
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

        /*
            Обычное плавное движение.
        */

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


        /*
            Зацикливание по краям.
        */

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


        /*
            Расстояние до курсора.
        */

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
        let color = particle.c;


        /*
            Зона воздействия курсора.
        */

        if (
            mouse.active &&
            distance < 170
        ) {

            /*
                1 = частица очень близко.
                0 = частица на границе.
            */

            const force =
                1 -
                distance / 170;


            /*
                Постепенно окрашиваем
                частицу в цвет текущей
                кнопки / аватарки.
            */

            color =
                mix(
                    particle.c,
                    mouse.color,
                    force
                );


            /*
                Делаем ближайшие частицы
                ярче.
            */

            alpha =
                0.2 +
                0.7 * force;


            /*
                ОТТАЛКИВАНИЕ
            */

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
            color;


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

        /*
            На телефоне курсорная
            механика не используется.
        */

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


        /*
            Передаём координаты курсора
            CSS-фону.
        */

        document.documentElement.style.setProperty(
            "--mouse-x",
            `${mouse.x}px`
        );

        document.documentElement.style.setProperty(
            "--mouse-y",
            `${mouse.y}px`
        );


        document.documentElement.style.setProperty(
            "--mouse-color",
            mouse.color
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
   CARD HOVER
   ========================================= */

cards.forEach(card => {

    const color =
        card.dataset.color;


    card.style.setProperty(
        "--link-color",
        color
    );


    /*
        Курсор вошёл в карточку.
    */

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


            mouse.color =
                color;

            mouse.active =
                true;


            stopAvatarCycle();


            /*
                Аватарка получает
                цвет карточки.
            */

            setAvatarColor(
                color
            );


            document.documentElement.style.setProperty(
                "--mouse-color",
                color
            );
        }
    );


    /*
        Движение внутри карточки.
    */

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


            /*
                X и Y относительно
                самой карточки.
            */

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


            mouse.x =
                event.clientX;

            mouse.y =
                event.clientY;


            mouse.color =
                color;
        }
    );


    /*
        Курсор ушёл с карточки.
    */

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


            mouse.active =
                false;


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

    cards.forEach(card => {

        card.classList.remove(
            "mobile-active"
        );
    });


    const card =
        cards[mobileIndex];


    const color =
        card.dataset.color;


    card.classList.add(
        "mobile-active"
    );


    /*
        Аватарка принимает цвет
        текущей карточки.
    */

    setAvatarColor(
        color
    );


    card.style.setProperty(
        "--link-color",
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
