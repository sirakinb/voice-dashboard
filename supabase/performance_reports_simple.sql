-- Simple Performance Reports Schema
-- Generates reports on-demand from call_events data
-- No external services required

begin;

-- Drop existing functions if they exist
drop function if exists public.get_weekly_report(date, date);
drop function if exists public.get_available_report_weeks();

-- Function to get a complete weekly report for any date range
-- Call this from the frontend: select * from get_weekly_report('2025-10-13', '2025-10-19');
create or replace function public.get_weekly_report(
  p_start_date date,
  p_end_date date
)
returns jsonb
language plpgsql
stable
as $$
declare
  v_total_calls bigint;
  v_days integer;
  v_after_hours bigint;
  v_peak_date date;
  v_peak_calls bigint;
  v_categories jsonb;
  v_day_breakdown jsonb;
  v_daily_data jsonb;
begin
  -- Calculate total days in period
  v_days := p_end_date - p_start_date + 1;
  
  -- Get total calls
  select count(*) into v_total_calls
  from public.call_events
  where created_time::date between p_start_date and p_end_date;
  
  -- Get after hours calls (before 9am, after 5pm, or weekends)
  select count(*) into v_after_hours
  from public.call_events
  where created_time::date between p_start_date and p_end_date
    and (
      extract(hour from created_time) < 9 
      or extract(hour from created_time) >= 17 
      or extract(dow from created_time) in (0, 6)
    );
  
  -- Get peak day
  select 
    created_time::date,
    count(*)
  into v_peak_date, v_peak_calls
  from public.call_events
  where created_time::date between p_start_date and p_end_date
  group by created_time::date
  order by count(*) desc
  limit 1;
  
  -- Get category breakdown (fixed: no window function in aggregate)
  with categorized as (
    select
      case
        when lower(coalesce(call_summary, '')) like '%availability%' 
          or lower(coalesce(call_summary, '')) like '%property%available%'
          or lower(coalesce(call_summary, '')) like '%rental%' 
          or lower(coalesce(call_summary, '')) like '%rent%'
          or lower(coalesce(call_summary, '')) like '%listing%' then 'Property Availability'
        when lower(coalesce(call_summary, '')) like '%pet%' 
          or lower(coalesce(call_summary, '')) like '%dog%'
          or lower(coalesce(call_summary, '')) like '%cat%' then 'Pet Policy'
        when lower(coalesce(call_summary, '')) like '%application%' 
          or lower(coalesce(call_summary, '')) like '%apply%' then 'Application Status'
        when lower(coalesce(call_summary, '')) like '%showing%' 
          or lower(coalesce(call_summary, '')) like '%tour%'
          or lower(coalesce(call_summary, '')) like '%visit%' then 'Showing/Tour Requests'
        when lower(coalesce(call_summary, '')) like '%section 8%' 
          or lower(coalesce(call_summary, '')) like '%voucher%'
          or lower(coalesce(call_summary, '')) like '%housing choice%' then 'Section 8/Voucher'
        when lower(coalesce(call_summary, '')) like '%callback%' 
          or lower(coalesce(call_summary, '')) like '%call back%' then 'Callback Requests'
        when lower(coalesce(call_summary, '')) like '%maintenance%' 
          or lower(coalesce(call_summary, '')) like '%repair%' then 'Maintenance Requests'
        when lower(coalesce(call_summary, '')) like '%lease%' 
          or lower(coalesce(call_summary, '')) like '%term%' then 'Lease/Rental Terms'
        when coalesce(call_summary, '') = '' then 'Unknown'
        else 'Other'
      end as category
    from public.call_events
    where created_time::date between p_start_date and p_end_date
  ),
  category_counts as (
    select category, count(*) as cnt
    from categorized
    group by category
  ),
  category_total as (
    select sum(cnt) as total from category_counts
  )
  select jsonb_agg(
    jsonb_build_object(
      'category', cc.category,
      'count', cc.cnt,
      'percentage', round(cc.cnt::numeric / nullif(ct.total, 0) * 100, 1)
    ) order by cc.cnt desc
  ) into v_categories
  from category_counts cc, category_total ct;
  
  -- Get day of week breakdown
  with daily_counts as (
    select
      trim(to_char(created_time, 'Day')) as day_name,
      extract(dow from created_time)::integer as day_number,
      created_time::date as call_date,
      count(*) as daily_total
    from public.call_events
    where created_time::date between p_start_date and p_end_date
    group by 1, 2, 3
  ),
  day_aggregates as (
    select
      day_name,
      day_number,
      sum(daily_total) as total_calls,
      count(distinct call_date) as days_counted
    from daily_counts
    group by day_name, day_number
  )
  select jsonb_agg(
    jsonb_build_object(
      'day', day_name,
      'dayNumber', day_number,
      'total', total_calls,
      'daysInPeriod', days_counted,
      'avg', round(total_calls::numeric / nullif(days_counted, 0), 1)
    ) order by day_number
  ) into v_day_breakdown
  from day_aggregates;
  
  -- Get daily call data for chart
  with daily_data as (
    select
      created_time::date as call_date,
      count(*) as total_calls,
      count(*) filter (
        where lower(trim(coalesce(could_ai_answer, ''))) in ('yes', 'true', '1')
          or coalesce(could_ai_answer, '') ilike '%handled%'
      ) as ai_handled
    from public.call_events
    where created_time::date between p_start_date and p_end_date
    group by created_time::date
  )
  select jsonb_agg(
    jsonb_build_object(
      'date', call_date,
      'dayLabel', to_char(call_date, 'Mon DD'),
      'dayName', trim(to_char(call_date, 'Day')),
      'totalCalls', total_calls,
      'aiHandled', ai_handled
    ) order by call_date
  ) into v_daily_data
  from daily_data;
  
  -- Return complete report
  return jsonb_build_object(
    'periodStart', p_start_date,
    'periodEnd', p_end_date,
    'totalDays', v_days,
    'totalCalls', coalesce(v_total_calls, 0),
    'avgDailyCalls', round(coalesce(v_total_calls, 0)::numeric / nullif(v_days, 0), 1),
    'afterHoursCalls', coalesce(v_after_hours, 0),
    'afterHoursPercentage', round(coalesce(v_after_hours, 0)::numeric / nullif(v_total_calls, 0) * 100, 1),
    'peakDay', jsonb_build_object(
      'date', v_peak_date,
      'calls', coalesce(v_peak_calls, 0)
    ),
    'categoryBreakdown', coalesce(v_categories, '[]'::jsonb),
    'dayOfWeekBreakdown', coalesce(v_day_breakdown, '[]'::jsonb),
    'dailyData', coalesce(v_daily_data, '[]'::jsonb)
  );
end;
$$;

-- Function to get available weeks that have data
create or replace function public.get_available_report_weeks()
returns jsonb
language sql
stable
as $$
  with weeks as (
    select distinct
      date_trunc('week', created_time)::date as week_start,
      (date_trunc('week', created_time) + interval '6 days')::date as week_end
    from public.call_events
    where created_time is not null
    order by week_start desc
    limit 12
  )
  select coalesce(
    jsonb_agg(
      jsonb_build_object(
        'weekStart', week_start,
        'weekEnd', week_end,
        'label', 'Week of ' || to_char(week_start, 'Mon DD, YYYY')
      ) order by week_start desc
    ),
    '[]'::jsonb
  )
  from weeks;
$$;

commit;
