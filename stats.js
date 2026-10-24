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
  $("loginForm").addEventListener("submit", async event => {
    event.preventDefault();
    if ($("password").value !== PASSWORD) {
      $("loginError").textContent = "Неверный пароль.";
      $("password").select();
      return;
    }
    $("loginError").textContent = "";
    $("loginPanel").hidden = true;
    $("dashboard").hidden = false;
    await loadStats();
  });
  $("logoutBtn").addEventListener("click", () => {
    $("dashboard").hidden = true;
    $("loginPanel").hidden = false;
    $("password").value = "";
    $("password").focus();
  });
  $("refreshBtn").addEventListener("click", loadStats);

  async function loadStats() {
    const status = $("status");
    const refresh = $("refreshBtn");
    if (SUPABASE_URL.startsWith("YOUR_") || SUPABASE_ANON_KEY.startsWith("YOUR_")) {
      status.textContent = "Нужно подключить Supabase: укажите URL и anon/public key в stats.js и analytics.js.";
      return;
    }
    refresh.disabled = true;
    status.textContent = "Загрузка…";
    try {
      const response = await fetch(SUPABASE_URL + "/rest/v1/site_stats?select=counter_key,value", {
        headers: {"apikey":SUPABASE_ANON_KEY,"Authorization":"Bearer " + SUPABASE_ANON_KEY},
        cache: "no-store"
      });
      if (!response.ok) throw new Error("HTTP " + response.status);
      const rows = await response.json();
      const counts = Object.fromEntries(rows.map(row => [row.counter_key, Number(row.value) || 0]));
      const sum = keys => keys.reduce((total,key) => total + (counts[key] || 0), 0);
      $("viewsTotal").textContent = (counts.page_views || 0).toLocaleString("ru-RU");
      $("linksTotal").textContent = sum(labels.slice(0,5).map(item => item[0])).toLocaleString("ru-RU");
      $("controlsTotal").textContent = sum(labels.slice(5).map(item => item[0])).toLocaleString("ru-RU");
      const max = Math.max(1,...labels.map(item => counts[item[0]] || 0));
      $("buttonStats").innerHTML = labels.map(([key,label]) => {
        const value = counts[key] || 0;
        const width = Math.min(100,value / max * 100);
        return '<div class="stat-row"><span class="stat-name">' + label +
          '</span><div class="track"><div class="fill" style="width:' + width + '%"></div></div><strong class="stat-value">' +
          value.toLocaleString("ru-RU") + '</strong></div>';
      }).join("");
      status.textContent = "Данные обновлены.";
    } catch (error) {
      console.error(error);
      status.textContent = "Не удалось загрузить статистику. Проверьте URL, ключ и SQL-настройки Supabase.";
    } finally {
      refresh.disabled = false;
    }
  }
})();
