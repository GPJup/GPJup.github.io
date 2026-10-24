(() => {
  "use strict";
  const PASSWORD = "2525";
  const SUPABASE_URL = "https://iwgfzfpfdprzkqbhlrec.supabase.co";
  const SUPABASE_ANON_KEY = "sb_publishable_BFhnNjPLWLj9k_p3HHcnQw_NBjHJU-o";
  const labels = [
    ["click_steam","Steam"],["click_spotify","Spotify"],["click_discord","Discord"],
    ["click_tiktok","TikTok"],["click_telegram","Telegram"]
  ];
  const $ = id => document.getElementById(id);
  const modal = $("statsModal");
  const trigger = $("statsTrigger");
  const isEmbedded = Boolean(modal && trigger);
  const login = $("loginForm"), password = $("password");
  if (!login || !password) return;

  if (trigger && modal) {
    trigger.addEventListener("click", () => {
      modal.hidden = false;
      document.body.style.overflow = "hidden";
      password.focus();
    });
    modal.querySelectorAll("[data-stats-close]").forEach(el => el.addEventListener("click", closeModal));
    document.addEventListener("keydown", event => { if (event.key === "Escape" && !modal.hidden) closeModal(); });
  }
  function closeModal() {
    if (!modal) return;
    modal.hidden = true;
    document.body.style.overflow = "";
    $("loginError").textContent = "";
    password.value = "";
    if ($("dashboard")) $("dashboard").hidden = true;
    if ($("loginPanel")) $("loginPanel").hidden = false;
    trigger?.focus();
  }

  login.addEventListener("submit", async event => {
    event.preventDefault();
    if (password.value !== PASSWORD) {
      $("loginError").textContent = "Неверный пароль.";
      password.select();
      return;
    }
    $("loginError").textContent = "";
    $("loginPanel").hidden = true;
    $("dashboard").hidden = false;
    await loadStats();
  });
  $("refreshBtn")?.addEventListener("click", loadStats);
  $("logoutBtn")?.addEventListener("click", () => {
    $("dashboard").hidden = true; $("loginPanel").hidden = false;
    password.value = ""; password.focus();
  });

  function renderDailyChart(rows) {
    const container = $("dailyChart");
    if (!container) return;
    const counts = Object.fromEntries(rows
      .filter(row => typeof row.counter_key === "string" && row.counter_key.startsWith("daily_views_"))
      .map(row => [row.counter_key.slice("daily_views_".length), Number(row.value) || 0]));
    const days = [];
    const today = new Date();
    today.setHours(12, 0, 0, 0);
    for (let offset = 13; offset >= 0; offset--) {
      const date = new Date(today);
      date.setDate(today.getDate() - offset);
      const key = date.getFullYear() + "-" + String(date.getMonth() + 1).padStart(2, "0") + "-" + String(date.getDate()).padStart(2, "0");
      days.push({key, date, value:counts[key] || 0});
    }
    const width = 660, height = 205, left = 34, right = 14, top = 18, bottom = 34;
    const plotWidth = width - left - right, plotHeight = height - top - bottom;
    const maxValue = Math.max(1, ...days.map(day => day.value));
    const yMax = maxValue <= 4 ? maxValue : Math.ceil(maxValue / 4) * 4;
    const x = i => left + (plotWidth * i / (days.length - 1));
    const y = value => top + plotHeight - (value / yMax) * plotHeight;
    const ns = "http://www.w3.org/2000/svg";
    const svg = document.createElementNS(ns, "svg");
    svg.setAttribute("viewBox", `0 0 ${width} ${height}`);
    svg.setAttribute("role", "img");
    svg.setAttribute("aria-label", "Открытия сайта за последние 14 дней");
    const add = (tag, attrs, parent = svg, value = "") => {
      const node = document.createElementNS(ns, tag);
      Object.entries(attrs || {}).forEach(([key, val]) => node.setAttribute(key, String(val)));
      if (value) node.textContent = value;
      parent.appendChild(node);
      return node;
    };
    const defs = add("defs", {});
    const gradient = add("linearGradient", {id:"dailyChartFill", x1:"0", y1:"0", x2:"0", y2:"1"}, defs);
    add("stop", {offset:"0%", "stop-color":"#a78bfa", "stop-opacity":".28"}, gradient);
    add("stop", {offset:"100%", "stop-color":"#a78bfa", "stop-opacity":"0"}, gradient);
    [0, Math.ceil(yMax / 2), yMax].filter((v,i,a)=>a.indexOf(v)===i).forEach(value => {
      add("line", {x1:left, y1:y(value), x2:width-right, y2:y(value), class:"grid-line"});
      add("text", {x:left-9, y:y(value)+3, "text-anchor":"end", class:"axis-label"}, svg, String(value));
    });
    const points = days.map((day,i)=>`${x(i)},${y(day.value)}`).join(" ");
    const area = `${left},${top+plotHeight} ${points} ${width-right},${top+plotHeight}`;
    add("polygon", {points:area, class:"chart-area"});
    add("polyline", {points, class:"chart-line"});
    days.forEach((day,i) => {
      if (i % 2 === 0 || i === days.length - 1) {
        add("text", {x:x(i), y:height-12, "text-anchor":"middle", class:"axis-label"},
          svg, day.date.toLocaleDateString("ru-RU", {day:"2-digit", month:"2-digit"}));
      }
      const point = add("circle", {cx:x(i), cy:y(day.value), r:3.5, class:"chart-point", tabindex:"0"});
      add("title", {}, point, `${day.date.toLocaleDateString("ru-RU")}: ${day.value} ${day.value === 1 ? "открытие" : "открытий"}`);
    });
    container.replaceChildren(svg);
  }


  function renderMobileDailyStats(rows) {
    const container = $("mobileDailyStats");
    if (!container) return;
    const counts = Object.fromEntries(rows
      .filter(row => typeof row.counter_key === "string" && row.counter_key.startsWith("daily_views_"))
      .map(row => [row.counter_key.slice("daily_views_".length), Number(row.value) || 0]));
    const today = new Date();
    today.setHours(12, 0, 0, 0);
    const dateKey = date => date.getFullYear() + "-" + String(date.getMonth() + 1).padStart(2, "0") + "-" + String(date.getDate()).padStart(2, "0");
    const totalFor = period => {
      let total = 0;
      for (let offset = 0; offset < period; offset++) {
        const date = new Date(today);
        date.setDate(today.getDate() - offset);
        total += counts[dateKey(date)] || 0;
      }
      return total;
    };
    const periods = [["Сегодня", 1], ["Последние 3 дня", 3], ["Последние 7 дней", 7], ["Последние 14 дней", 14]];
    container.innerHTML = periods.map(([label, period]) =>
      '<div class="daily-stat-row"><span>' + label + '</span><strong>' +
      totalFor(period).toLocaleString("ru-RU") + '</strong></div>'
    ).join("");
  }

  async function loadStats() {
    const status = $("status");
    const refresh = $("refreshBtn");
    if (!status) return;
    if (SUPABASE_URL.startsWith("YOUR_") || SUPABASE_ANON_KEY.startsWith("YOUR_")) {
      status.textContent = "Статистика пока не подключена: нужно настроить базу Supabase.";
      return;
    }
    if (refresh) refresh.disabled = true;
    status.textContent = "Загружаю данные…";
    try {
      const response = await fetch(SUPABASE_URL + "/rest/v1/site_stats?select=counter_key,value", {
        headers: {"apikey":SUPABASE_ANON_KEY},
        cache:"no-store"
      });
      if (!response.ok) throw new Error("HTTP " + response.status);
      const rows = await response.json();
      const counts = Object.fromEntries(rows.map(row => [row.counter_key,Number(row.value)||0]));
      const sum = keys => keys.reduce((total,key)=>total+(counts[key]||0),0);
      $("viewsTotal").textContent=(counts.page_views||0).toLocaleString("ru-RU");
      $("linksTotal").textContent=sum(labels.slice(0,5).map(x=>x[0])).toLocaleString("ru-RU");
      renderDailyChart(rows);
      renderMobileDailyStats(rows);
      const max=Math.max(1,...labels.map(x=>counts[x[0]]||0));
      $("buttonStats").innerHTML=labels.map(([key,label])=>{
        const value=counts[key]||0, width=Math.min(100,value/max*100);
        return '<div class="stats-row"><span>'+label+'</span><div class="stats-track"><div class="stats-fill" style="width:'+width+'%"></div></div><strong class="stats-value">'+value.toLocaleString("ru-RU")+'</strong></div>';
      }).join("");
      status.textContent="Данные обновлены.";
    } catch(error) {
      console.error(error);
      status.textContent="Не удалось загрузить статистику. Проверьте настройки Supabase и SQL.";
    } finally { if (refresh) refresh.disabled=false; }
  }
})();
