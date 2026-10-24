-- Run this migration once in Supabase SQL Editor to enable daily visit chart data.
-- It does not delete existing lifetime counters.
create or replace function public.increment_site_counter(p_counter_key text)
returns void
language plpgsql
security definer
set search_path = ''
as $$
begin
  if p_counter_key not in (
    'page_views','click_steam','click_spotify','click_discord',
    'click_tiktok','click_telegram','click_music','click_next',
    'click_sound','click_settings'
  ) and p_counter_key !~ '^daily_views_[0-9]{4}-[0-9]{2}-[0-9]{2}$' then
    raise exception 'Unknown counter';
  end if;

  insert into public.site_stats as s(counter_key, value)
  values (p_counter_key, 1)
  on conflict (counter_key) do update set value = s.value + 1;
end;
$$;

revoke all on function public.increment_site_counter(text) from public;
grant execute on function public.increment_site_counter(text) to anon;
