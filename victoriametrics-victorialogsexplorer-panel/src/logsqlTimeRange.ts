import { dateTimeFormat, type DateTime, type TimeRange } from '@grafana/data';

export const formatLogsqlTimeRange = (timeRange: TimeRange, timeZone: string): string => {
  const formatTime = (value: DateTime, raw: DateTime | string): string => {
    // Keep relative ranges live; format absolute times in the dashboard's timezone.
    if (typeof raw === 'string' && /^now(?:$|[+\-/])/.test(raw)) {
      return raw;
    }
    return dateTimeFormat(value, { timeZone, format: 'YYYY-MM-DD[T]HH:mm:ss.SSSZ' });
  };

  const from = formatTime(timeRange.from, timeRange.raw.from);
  const to = formatTime(timeRange.to, timeRange.raw.to);
  return `_time:[${from}, ${to}]`;
};
