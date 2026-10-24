/* GPJup Analytics: shared lifetime counters for desktop and mobile. */
(() => {
  "use strict";
  const SUPABASE_URL = "https://iwgfzfpfdprzkqbhlrec.supabase.co";
  const SUPABASE_ANON_KEY = "sb_publishable_BFhnNjPLWLj9k_p3HHcnQw_NBjHJU-o";
  console.info("[GPJup Analytics] script loaded", location.pathname);
  const allowed = new Set(["page_views","click_steam","click_spotify","click_discord","click_tiktok","click_telegram","click_music","click_next","click_sound","click_settings"]);
  async function increment(key) {
    if (!allowed.has(key)) return;
    if (SUPABASE_URL.startsWith("YOUR_") || SUPABASE_ANON_KEY.startsWith("YOUR_")) {
      console.warn("[GPJup Analytics] Configure Supabase URL and anon key in analytics.js."); return;
    }
    try {
      const response = await fetch(SUPABASE_URL + "/rest/v1/rpc/increment_site_counter", {
        method:"POST", headers:{"Content-Type":"application/json","apikey":SUPABASE_ANON_KEY},
        body:JSON.stringify({counter_key:key}), keepalive:true
      });
      if (!response.ok) {
        const detail = await response.text().catch(() => "");
        console.error("[GPJup Analytics] Counter request failed:", response.status, detail);
      } else {
        console.info("[GPJup Analytics] Counter updated:", key);
      }
    } catch(error) { console.warn("[GPJup Analytics] Could not send counter:",error); }
  }
  try {
    const now = Date.now(), previous = Number(sessionStorage.getItem("gpjup_view_counted_at") || 0);
    if (now - previous > 4000) { sessionStorage.setItem("gpjup_view_counted_at",String(now)); increment("page_views"); }
  } catch(_) { increment("page_views"); }
  const social = new Set(["steam","spotify","discord","tiktok","telegram"]);
  const controls = {musicBtn:"click_music",skipBtn:"click_next",soundBtn:"click_sound",settingsBtn:"click_settings"};
  document.addEventListener("click",event => {
    const target = event.target instanceof Element ? event.target : event.target?.parentElement;
    if (!target) return;
    const card = target.closest("a.card");
    if (card) {
      const name = card.querySelector("span")?.textContent?.trim().toLowerCase();
      if (social.has(name)) increment("click_" + name);
      return;
    }
    const button = target.closest("button[id]");
    if (button && controls[button.id]) increment(controls[button.id]);
  },true);
})();
