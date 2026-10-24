(() => {
  "use strict";
  const PASSWORD = "2525";
  const SUPABASE_URL = "YOUR_SUPABASE_PROJECT_URL";
  const SUPABASE_ANON_KEY = "YOUR_SUPABASE_ANON_PUBLIC_KEY";
  const labels = [
    ["click_steam","Steam"],["click_spotify","Spotify"],["click_discord","Discord"],
    ["click_tiktok","TikTok"],["click_telegram","Telegram"],["click_music","Музыка"],
    ["click_next","Следующий трек"],["click_sound","Звук"],["click_settings","Настройки"]
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
        headers: {"apikey":SUPABASE_ANON_KEY,"Authorization":"Bearer " + SUPABASE_ANON_KEY},
        cache:"no-store"
      });
      if (!response.ok) throw new Error("HTTP " + response.status);
      const rows = await response.json();
      const counts = Object.fromEntries(rows.map(row => [row.counter_key,Number(row.value)||0]));
      const sum = keys => keys.reduce((total,key)=>total+(counts[key]||0),0);
      $("viewsTotal").textContent=(counts.page_views||0).toLocaleString("ru-RU");
      $("linksTotal").textContent=sum(labels.slice(0,5).map(x=>x[0])).toLocaleString("ru-RU");
      $("controlsTotal").textContent=sum(labels.slice(5).map(x=>x[0])).toLocaleString("ru-RU");
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
