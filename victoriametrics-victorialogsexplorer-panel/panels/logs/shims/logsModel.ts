import { DataFrame, Field, FieldType } from '@grafana/data';

export const COMMON_LABELS = 'commonLabels';

export type SimpleLogRow = {
  id: string;
  timeMs: number;
  timeText: string;
  message: string;
  labels: Record<string, string>;
};

const timeFieldNames = ['_time', 'time', 'timestamp', 'ts'];
const messageFieldNames = ['_msg', 'message', 'msg', 'log', 'line'];

const findFieldByName = (frame: DataFrame, names: string[]) => {
  for (const name of names) {
    const field = frame.fields.find((item) => item.name === name);
    if (field) {
      return field;
    }
  }
  return undefined;
};

const getTimeField = (frame: DataFrame): Field | undefined =>
  findFieldByName(frame, timeFieldNames) ?? frame.fields.find((field) => field.type === FieldType.time);

const getMessageField = (frame: DataFrame): Field | undefined =>
  findFieldByName(frame, messageFieldNames) ??
  frame.fields.find(
    (field) => field.type === FieldType.string && field.name !== 'labels' && field.name !== 'detected_level'
  );

const toTimeMs = (value: unknown): number => {
  if (typeof value === 'number') {
    if (!Number.isFinite(value)) {
      return 0;
    }
    const abs = Math.abs(value);
    if (abs < 1e11) {
      return value * 1000;
    }
    if (abs > 1e14) {
      return Math.floor(value / 1e6);
    }
    return value;
  }
  const parsed = Date.parse(String(value));
  return Number.isFinite(parsed) ? parsed : 0;
};

const formatTimeValue = (value: unknown, timeMs: number): string => {
  if (timeMs > 0) {
    const date = new Date(timeMs);
    if (!Number.isNaN(date.getTime())) {
      const pad = (num: number, size = 2) => String(num).padStart(size, '0');
      const yyyy = date.getFullYear();
      const mm = pad(date.getMonth() + 1);
      const dd = pad(date.getDate());
      const hh = pad(date.getHours());
      const min = pad(date.getMinutes());
      const ss = pad(date.getSeconds());
      const ms = pad(date.getMilliseconds(), 3);
      return `${yyyy}-${mm}-${dd} ${hh}:${min}:${ss}.${ms}`;
    }
  }
  if (value == null) {
    return '';
  }
  return String(value);
};

const toLabelValue = (value: unknown): string | null => {
  if (value == null) {
    return null;
  }
  const text = typeof value === 'string' ? value.trim() : String(value);
  if (!text) {
    return null;
  }
  return text;
};

const addLabel = (labels: Record<string, string>, key: string, value: unknown) => {
  const text = toLabelValue(value);
  if (text == null) {
    return;
  }
  labels[key] = text;
};

const mergeLabels = (labels: Record<string, string>, rawValue: unknown) => {
  if (!rawValue) {
    return;
  }
  if (Array.isArray(rawValue)) {
    rawValue.forEach((item) => {
      if (typeof item !== 'string') {
        return;
      }
      const idx = item.indexOf(':');
      if (idx === -1) {
        addLabel(labels, item, '');
        return;
      }
      const key = item.slice(0, idx).trim();
      const value = item.slice(idx + 1).trim().replace(/^"|"$/g, '');
      if (key) {
        addLabel(labels, key, value);
      }
    });
    return;
  }
  if (typeof rawValue === 'object') {
    Object.entries(rawValue as Record<string, unknown>).forEach(([key, value]) => addLabel(labels, key, value));
  }
};

export function dataFrameToLogsModel(series: DataFrame[] = []) {
  const rows: SimpleLogRow[] = [];

  series.forEach((frame, frameIndex) => {
    const timeField = getTimeField(frame);
    const messageField = getMessageField(frame);
    if (!timeField || !messageField) {
      return;
    }
    const length = frame.length ?? timeField.values.length;

    for (let rowIndex = 0; rowIndex < length; rowIndex++) {
      const timeValue = timeField.values[rowIndex];
      const timeMs = toTimeMs(timeValue);
      const timeText = formatTimeValue(timeValue, timeMs);
      const messageValue = messageField.values[rowIndex];
      const message = messageValue == null ? '' : String(messageValue);

      const labels: Record<string, string> = {};
      frame.fields.forEach((field) => {
        if (field === timeField || field === messageField) {
          return;
        }
        const fieldValue = field.values[rowIndex];
        if (field.name === 'labels') {
          mergeLabels(labels, fieldValue);
          return;
        }
        addLabel(labels, field.name, fieldValue);
      });

      rows.push({
        id: `${frameIndex}-${rowIndex}`,
        timeMs,
        timeText,
        message,
        labels,
      });
    }
  });

  rows.sort((a, b) => b.timeMs - a.timeMs);

  const commonLabels: Record<string, string> = rows.length ? { ...rows[0].labels } : {};
  for (const row of rows.slice(1)) {
    for (const key of Object.keys(commonLabels)) {
      if (row.labels[key] !== commonLabels[key]) {
        delete commonLabels[key];
      }
    }
  }

  const meta = Object.keys(commonLabels).length > 0 ? [{ label: COMMON_LABELS, value: commonLabels }] : [];

  return {
    rows,
    meta,
  };
}

export function dedupLogRows<T>(rows: T[], _strategy?: unknown): T[] {
  return rows;
}
