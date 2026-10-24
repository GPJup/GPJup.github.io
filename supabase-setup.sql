create table if not exists public.site_stats (
  counter_key text primary key,
  value bigint not null default 0 check (value >= 0)
);
alter table public.site_stats enable row level security;
drop policy if exists "Public can read site counters" on public.site_stats;
create policy "Public can read site counters" on public.site_stats for select to anon using (true);
insert into public.site_stats(counter_key,value) values
('page_views',0),('click_steam',0),('click_spotify',0),('click_discord',0),
('click_tiktok',0),('click_telegram',0),('click_music',0),('click_next',0),
('click_sound',0),('click_settings',0)
on conflict(counter_key) do nothing;
create or replace function public.increment_site_counter(counter_key text)
returns void language plpgsql security definer set search_path = ''
as $$
begin
  if counter_key not in ('page_views','click_steam','click_spotify','click_discord',
    'click_tiktok','click_telegram','click_music','click_next','click_sound','click_settings') then
    raise exception 'Unknown counter';
  end if;
  insert into public.site_stats as s(counter_key,value) values(counter_key,1)
  on conflict(counter_key) do update set value = s.value + 1;
end;
$$;
revoke all on function public.increment_site_counter(text) from public;
grant execute on function public.increment_site_counter(text) to anon;
grant select on public.site_stats to anon;
