import { getBackendSrv } from '@grafana/runtime';
import { postMetadataRequest } from './metadataRequest';

jest.mock('@grafana/runtime', () => ({
  getBackendSrv: jest.fn(),
}));

describe('postMetadataRequest', () => {
  const post = jest.fn();
  const path = '/api/datasources/uid/test/resources/select/logsql/stream_field_names';
  const payload = { query: '*', limit: '50' };
  const response = { values: [{ value: 'app', hits: 10 }] };
  const timeRangeError = {
    status: 500,
    data: {
      error: 'Internal Server Error',
      message: 'VictoriaLogs returned status 400: too big time range selected; it cannot exceed -search.maxQueryTimeRange',
    },
  };

  beforeEach(() => {
    post.mockReset();
    jest.mocked(getBackendSrv).mockReturnValue({ post } as unknown as ReturnType<typeof getBackendSrv>);
  });

  it('loads field names from the last 2 days without retrying on success', async () => {
    post.mockResolvedValue(response);

    await expect(postMetadataRequest(path, payload)).resolves.toEqual(response);

    expect(post).toHaveBeenCalledTimes(1);
    expect(post).toHaveBeenCalledWith(path, { ...payload, start: '2d', end: 'now' }, { showErrorAlert: false });
    expect(payload).toEqual({ query: '*', limit: '50' });
  });

  it('retries a Grafana-wrapped time range error with 1 day and returns the fields', async () => {
    post.mockRejectedValueOnce(timeRangeError).mockResolvedValueOnce(response);

    await expect(postMetadataRequest(path, payload)).resolves.toEqual(response);

    expect(post).toHaveBeenCalledTimes(2);
    expect(post).toHaveBeenNthCalledWith(1, path, { ...payload, start: '2d', end: 'now' }, { showErrorAlert: false });
    expect(post).toHaveBeenNthCalledWith(2, path, { ...payload, start: '1d', end: 'now' });
  });

  it('preserves field filters and propagates the fallback error without another retry', async () => {
    const valuesPath = '/api/datasources/uid/test/resources/select/logsql/stream_field_values';
    const valuesPayload = { field: 'app', query: 'env:="prod"', limit: '50' };
    const fallbackError = new Error('1 day request failed');
    post.mockRejectedValueOnce(timeRangeError).mockRejectedValueOnce(fallbackError);

    await expect(postMetadataRequest(valuesPath, valuesPayload)).rejects.toBe(fallbackError);

    expect(post).toHaveBeenCalledTimes(2);
    expect(post).toHaveBeenNthCalledWith(
      1,
      valuesPath,
      { ...valuesPayload, start: '2d', end: 'now' },
      { showErrorAlert: false }
    );
    expect(post).toHaveBeenNthCalledWith(2, valuesPath, { ...valuesPayload, start: '1d', end: 'now' });
  });
});
