begin;

-- Drop dependent views so we can reshape the base table safely
drop view if exists public.daily_call_metrics;
drop view if exists public.call_summary_view;
drop view if exists public.hourly_call_metrics;

-- Bring legacy column names in line with the dashboard schema
do $$
begin
  if exists (
    select 1 from information_schema.columns
    where table_name = 'call_events' and column_name = 'call_started_at'
  ) then
    alter table public.call_events rename column call_started_at to created_time;
  end if;

  if exists (
    select 1 from information_schema.columns
    where table_name = 'call_events' and column_name = 'caller_phone'
  ) then
    alter table public.call_events rename column caller_phone to phone_number;
  end if;

  if exists (
    select 1 from information_schema.columns
    where table_name = 'call_events' and column_name = 'transcript_preview'
  ) then
    alter table public.call_events rename column transcript_preview to transcript;
  end if;

  if exists (
    select 1 from information_schema.columns
    where table_name = 'call_events' and column_name = 'callback_required'
  ) then
    alter table public.call_events rename column callback_required to callback_requested;
  end if;

  if exists (
    select 1 from information_schema.columns
    where table_name = 'call_events' and column_name = 'ai_could_handle'
  ) then
    alter table public.call_events rename column ai_could_handle to could_ai_answer;
  end if;

  if exists (
    select 1 from information_schema.columns
    where table_name = 'call_events' and column_name = 'recording_url'
  ) then
    alter table public.call_events rename column recording_url to call_recording;
  end if;
end
$$;

-- Ensure the call_events table accepts whatever text Make.com sends
alter table public.call_events
  drop column if exists caller_initials;

alter table public.call_events
  alter column call_number drop not null;

alter table public.call_events
  alter column created_time drop not null;

alter table public.call_events
  alter column callback_requested type text using callback_requested::text;

alter table public.call_events
  alter column could_ai_answer type text using could_ai_answer::text;

alter table public.call_events
  alter column call_summary type text using call_summary::text;

alter table public.call_events
  alter column transcript type text using transcript::text;

alter table public.call_events
  alter column phone_number type text using phone_number::text;

alter table public.call_events
  drop constraint if exists call_events_could_ai_answer_check;

-- Recreate the daily metrics view used by the chart/stat cards
create or replace view public.daily_call_metrics as
select
  date_trunc('day', created_time) as day_date,
  to_char(date_trunc('day', created_time), 'Mon DD') as day_label,
  count(*) as total_calls,
  count(*) filter (
    where lower(trim(coalesce(could_ai_answer, ''))) in ('yes', 'true', '1')
      or coalesce(could_ai_answer, '') ilike '%handled the call independently%'
  ) as ai_calls,
  count(*) filter (
    where lower(coalesce(callback_requested, '')) in ('yes', 'true', '1')
  ) as callbacks
from public.call_events
where created_time is not null
group by 1, 2
order by day_date;

-- Hourly metrics for the chart toggle (last 24 hours)
create or replace view public.hourly_call_metrics as
select
  date_trunc('hour', created_time) as hour_ts,
  to_char(date_trunc('hour', created_time), 'HH24:MI') as hour_label,
  count(*) as total_calls,
  count(*) filter (
    where lower(trim(coalesce(could_ai_answer, ''))) in ('yes', 'true', '1')
      or coalesce(could_ai_answer, '') ilike '%handled the call independently%'
  ) as ai_calls
from public.call_events
where created_time >= now() - interval '24 hours'
group by 1, 2
order by hour_ts;

-- Recreate the call records view used by the bottom table
create or replace view public.call_summary_view as
select
  call_number,
  to_char(created_time, 'Mon DD, YYYY HH12:MI AM') as created_time,
  coalesce(caller_name, 'Unknown Caller') as caller_name,
  sub.initials as caller_initials,
  coalesce(phone_number, 'N/A') as phone_number,
  coalesce(transcript, '') as transcript,
  coalesce(call_summary, '') as call_summary,
  coalesce(callback_requested, '') as callback_requested,
  case
    when lower(trim(coalesce(could_ai_answer, ''))) in ('yes', 'true', '1')
      or coalesce(could_ai_answer, '') ilike '%handled the call independently%'
    then 'Yes'
    else 'No'
  end as could_ai_answer,
  call_recording
from public.call_events
left join lateral (
  select
    case
      when coalesce(caller_name, '') = '' then 'JR'
      else upper(
        left(regexp_replace(caller_name, '\s+', ' ', 'g'), 1) ||
        coalesce(nullif(split_part(regexp_replace(caller_name, '\s+', ' ', 'g'), ' ', 2), ''), '')
      )
    end as initials
) sub on true
order by created_time desc;

commit;
