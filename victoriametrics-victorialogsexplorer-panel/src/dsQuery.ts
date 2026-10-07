import { AppEvents, CoreApp, dateTime, type DataFrame, type DataQuery, type DataQueryRequest } from '@grafana/data';
import { getAppEvents, getDataSourceSrv } from '@grafana/runtime';
import { lastValueFrom } from 'rxjs';

export type DsQueryResult = {
  frames: DataFrame[];
  error?: string;
};

// 通过 Grafana runtime 的数据源 API 查询，不直接调用后端查询 HTTP 接口。
export const queryDatasource = async (
  dsUid: string,
  targets: Array<DataQuery & Record<string, unknown>>,
  fromMs: number,
  toMs: number,
  opts: { intervalMs?: number; maxDataPoints?: number; requestId?: string } = {}
): Promise<DsQueryResult> => {
  const ds = await getDataSourceSrv().get({ uid: dsUid });
  const from = dateTime(fromMs);
  const to = dateTime(toMs);
  const intervalMs = opts.intervalMs ?? 60000;
  const request = {
    app: CoreApp.Unknown,
    requestId: opts.requestId ?? `SQR${Math.random().toString(36).slice(2, 10)}`,
    timezone: 'browser',
    range: { from, to, raw: { from: String(fromMs), to: String(toMs) } },
    interval: `${Math.max(1, Math.round(intervalMs / 1000))}s`,
    intervalMs,
    maxDataPoints: opts.maxDataPoints,
    scopedVars: {},
    targets,
    startTime: Date.now(),
  } as DataQueryRequest<DataQuery>;
  const resp = await lastValueFrom(ds.query(request) as any) as { data?: DataFrame[]; error?: { message?: string }; errors?: Array<{ message?: string }> };
  const error = resp?.error?.message ?? resp?.errors?.[0]?.message;
  return { frames: Array.isArray(resp?.data) ? resp.data : [], error };
};

// 使用 Grafana 自带的告警提示代替浏览器原生 alert。
export const notifyError = (message: string) => {
  console.error(message);
  try {
    getAppEvents().publish({ type: AppEvents.alertError.name, payload: [message] });
  } catch {
    // 事件总线不可用时仅记录日志
  }
};
