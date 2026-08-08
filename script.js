const canvas = document.getElementById("particles");
const ctx = canvas.getContext("2d");

const cards = [...document.querySelectorAll(".card")];
const avatar = document.querySelector(".avatar");

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

/*
    Берём цвета непосредственно
    из карточек HTML.
*/
const cardColors = cards.map(
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
}


/*
    Циклическая смена цвета аватарки.
*/
let avatarIndex = 0;
let avatarInterval = null;

function startAvatarCycle() {

    if (avatarInterval) return;

    if (!cardColors.length) return;

    setAvatarColor(
        cardColors[avatarIndex]
    );

    avatarInterval = setInterval(() => {

        /*
            Если пользователь сейчас
            навёлся на кнопку, цикл
            временно не меняет цвет.
        */
        if (mouse.active) return;

        avatarIndex =
            (avatarIndex + 1) %
            cardColors.length;

        setAvatarColor(
            cardColors[avatarIndex]
        );

    }, 1300);
}

function stopAvatarCycle() {

    if (!avatarInterval) return;

    clearInterval(avatarInterval);

    avatarInterval = null;
}


/* =========================================
   PARTICLES
   ========================================= */

function resize() {

    dpr = Math.min(
        window.devicePixelRatio || 1,
        2
    );

    width = window.innerWidth;
    height = window.innerHeight;

    canvas.width = width * dpr;
    canvas.height = height * dpr;

    canvas.style.width = `${width}px`;
    canvas.style.height = `${height}px`;

    ctx.setTransform(
        dpr,
        0,
        0,
        dpr,
        0,
        0
    );

    particles = Array.from(
        {
            length: Math.min(
                240,
                Math.max(
                    90,
                    Math.floor(
                        width * height / 7000
                    )
                )
            )
        },
        () => ({
            x: Math.random() * width,
            y: Math.random() * height,

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

    const number =
        parseInt(hex, 16);

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
            particle.x = width + 20;

        if (particle.x > width + 20)
            particle.x = -20;

        if (particle.y < -20)
            particle.y = height + 20;

        if (particle.y > height + 20)
            particle.y = -20;


        const dx =
            particle.x - mouse.x;

        const dy =
            particle.y - mouse.y;

        const distance =
            Math.hypot(dx, dy);

        let alpha = 0.2;
        let color = particle.c;


        /*
            Цвет частиц меняется
            в зависимости от кнопки
            под курсором.
        */
        if (
            mouse.active &&
            distance < 155
        ) {

            const amount =
                1 - distance / 155;

            color = mix(
                particle.c,
                mouse.color,
                amount
            );

            alpha =
                0.2 +
                0.7 * amount;

            if (distance > 0) {

                particle.x +=
                    (dx / distance) *
                    amount *
                    0.12;

                particle.y +=
                    (dy / distance) *
                    amount *
                    0.12;
            }
        }


        ctx.globalAlpha = alpha;
        ctx.fillStyle = color;

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
   DESKTOP HOVER
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
        event => {

            /*
                На мобильных pointerenter
                не используем как hover.
            */
            if (
                window.matchMedia(
                    "(hover: none)"
                ).matches
            ) {
                return;
            }

            mouse.active = true;
            mouse.color = color;

            stopAvatarCycle();

            setAvatarColor(color);
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

            mouse.x =
                event.clientX;

            mouse.y =
                event.clientY;

            mouse.color =
                color;
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

            mouse.active = false;

            startAvatarCycle();
        }
    );
});


/*
    Когда курсор просто двигается
    по странице, частицы реагируют.
*/
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
    }
);


window.addEventListener(
    "pointerleave",
    () => {
        mouse.active = false;
        startAvatarCycle();
    }
);


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
        текущей кнопки.
    */
    setAvatarColor(color);


    /*
        Передаём цвет подсветке.
    */
    card.style.setProperty(
        "--link-color",
        color
    );


    mobileIndex =
        (mobileIndex + 1) %
        cards.length;
}


function startMobileAnimation() {

    if (mobileInterval) return;

    if (!cards.length) return;

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
