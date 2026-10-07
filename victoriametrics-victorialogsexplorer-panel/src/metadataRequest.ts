import { getBackendSrv } from '@grafana/runtime';

type MetadataQuery = {
  query: string;
  limit: string;
  field?: string;
};

// 字段索引默认查询最近 2 天，避免随面板时间范围扩大而超过服务端限制。
export const postMetadataRequest = async (path: string, payload: MetadataQuery) => {
  const backend = getBackendSrv();
  try {
    return await backend.post(path, { ...payload, start: '2d', end: 'now' }, { showErrorAlert: false });
  } catch {
    // 失败后缩短为 1 天，只重试一次；仍失败则交给调用方处理。
    return backend.post(path, { ...payload, start: '1d', end: 'now' });
  }
};
