```javascript
const canvas = document.getElementById("particles");
const ctx = canvas.getContext("2d");

let w;
let h;
let dpr;

let particles = [];

const mouse = {
    x: -999,
    y: -999,
    active: false,
    color: "#8b5cf6"
};

const cards = [...document.querySelectorAll(".card")];
const avatar = document.querySelector(".avatar");

/*
 * Цвета плашек берём непосредственно
 * из data-color в HTML.
 */
const cardColors = cards.map(card => card.dataset.color);

/*
 * Запасные цвета для частиц.
 */
const palette = [
    "#8b5cf6",
    "#a78bfa",
    "#6366f1"
];

/*
 * Анимация аватарки.
 */
let avatarColorIndex = 0;
let avatarTimer = null;

function setAvatarColor(color) {
    if (!avatar) return;

    avatar.style.setProperty("--avatar-color", color);

    /*
     * Меняем общий accent только тогда,
     * когда пользователь не взаимодействует
     * с конкретной плашкой.
     */
    if (!mouse.active) {
        document.documentElement.style.setProperty(
            "--accent",
            color
        );
    }
}

function startAvatarCycle() {
    if (avatarTimer || cardColors.length === 0) {
        return;
    }

    setAvatarColor(cardColors[avatarColorIndex]);

    avatarTimer = setInterval(() => {
        /*
         * Если курсор находится над плашкой,
         * аватарка не переключает цвет.
         */
        if (mouse.active) {
            return;
        }

        avatarColorIndex =
            (avatarColorIndex + 1) % cardColors.length;

        setAvatarColor(cardColors[avatarColorIndex]);
    }, 1400);
}

function stopAvatarCycle() {
    if (avatarTimer) {
        clearInterval(avatarTimer);
        avatarTimer = null;
    }
}


/* =========================================
   PARTICLES
   ========================================= */

function resize() {
    dpr = Math.min(window.devicePixelRatio || 1, 2);

    w = window.innerWidth;
    h = window.innerHeight;

    canvas.width = w * dpr;
    canvas.height = h * dpr;

    canvas.style.width = `${w}px`;
    canvas.style.height = `${h}px`;

    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    particles = Array.from(
        {
            length: Math.min(
                240,
                Math.max(
                    90,
                    Math.floor((w * h) / 7000)
                )
            )
        },
        () => ({
            x: Math.random() * w,
            y: Math.random() * h,
            vx: (Math.random() - 0.5) * 0.2,
            vy: (Math.random() - 0.5) * 0.2,
            r: 0.5 + Math.random() * 1.5,
            c: palette[
                Math.floor(Math.random() * palette.length)
            ],
            life: Math.random() * 6.28
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

    return `rgb(${A
        .map(
            (v, i) =>
                Math.round(
                    v + (B[i] - v) * t
                )
        )
        .join(",")})`;
}

function frame() {
    ctx.clearRect(0, 0, w, h);

    for (const p of particles) {
        p.life += 0.008;

        p.x +=
            p.vx +
            Math.sin(p.life) * 0.025;

        p.y +=
            p.vy +
            Math.cos(p.life) * 0.025;

        if (p.x < -20) p.x = w + 20;
        if (p.x > w + 20) p.x = -20;

        if (p.y < -20) p.y = h + 20;
        if (p.y > h + 20) p.y = -20;

        const dx = p.x - mouse.x;
        const dy = p.y - mouse.y;

        const dist = Math.hypot(dx, dy);

        let alpha = 0.2;
        let color = p.c;

        if (
            mouse.active &&
            dist < 155
        ) {
            const t = 1 - dist / 155;

            color = mix(
                p.c,
                mouse.color,
                t
            );

            alpha = 0.2 + 0.7 * t;

            if (dist > 0) {
                p.x +=
                    (dx / dist) *
                    t *
                    0.12;

                p.y +=
                    (dy / dist) *
                    t *
                    0.12;
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


/* =========================================
   МЫШЬ / DESKTOP
   ========================================= */

window.addEventListener("pointermove", event => {
    mouse.x = event.clientX;
    mouse.y = event.clientY;
    mouse.active = true;
});

window.addEventListener("pointerleave", () => {
    mouse.active = false;

    /*
     * Возвращаемся к циклической анимации
     * аватарки после ухода курсора.
     */
    startAvatarCycle();
});


cards.forEach(card => {
    const color = card.dataset.color;

    card.style.setProperty(
        "--link-color",
        color
    );

    card.addEventListener("pointerenter", () => {
        /*
         * Навели на плашку:
         * аватарка принимает её цвет.
         */
        mouse.color = color;

        if (!window.matchMedia("(max-width: 760px)").matches) {
            mouse.active = true;

            stopAvatarCycle();

            setAvatarColor(color);

            document.documentElement.style.setProperty(
                "--accent",
                color
            );
        }
    });

    card.addEventListener("pointermove", event => {
        const rect =
            card.getBoundingClientRect();

        card.style.setProperty(
            "--mx",
            `${event.clientX - rect.left}px`
        );
    });

    card.addEventListener("pointerleave", () => {
        /*
         * После ухода с карточки снова
         * запускаем переливание аватарки.
         */
        if (!window.matchMedia("(max-width: 760px)").matches) {
            mouse.active = false;
            startAvatarCycle();
        }
    });
});


/* =========================================
   МОБИЛЬНЫЙ РЕЖИМ
   ========================================= */

let mobileInterval = null;
let mobileIndex = 0;

function startMobileAnimation() {
    if (mobileInterval || cards.length === 0) {
        return;
    }

    /*
     * На телефоне частицы не должны считать
     * обычный pointer как hover.
     */
    mouse.active = false;

    function activateNextCard() {
        cards.forEach(card => {
            card.classList.remove("mobile-active");
        });

        const card = cards[mobileIndex];
        const color = card.dataset.color;

        card.classList.add("mobile-active");

        /*
         * Аватарка получает цвет текущей плашки.
         * Получается ощущение, что подсветка
         * начинается от логотипа и движется вниз.
         */
        setAvatarColor(color);

        document.documentElement.style.setProperty(
            "--accent",
            color
        );

        mobileIndex =
            (mobileIndex + 1) % cards.length;
    }

    activateNextCard();

    mobileInterval = setInterval(
        activateNextCard,
        1700
    );
}

function stopMobileAnimation() {
    if (mobileInterval) {
        clearInterval(mobileInterval);
        mobileInterval = null;
    }

    cards.forEach(card => {
        card.classList.remove("mobile-active");
    });
}


/* =========================================
   ИНИЦИАЛИЗАЦИЯ
   ========================================= */

function updateDeviceMode() {
    const isMobile =
        window.matchMedia(
            "(max-width: 760px)"
        ).matches;

    stopMobileAnimation();

    if (isMobile) {
        stopAvatarCycle();
        startMobileAnimation();
    } else {
        startAvatarCycle();
    }
}

resize();

window.addEventListener("resize", () => {
    resize();
    updateDeviceMode();
});

updateDeviceMode();

frame();
```
