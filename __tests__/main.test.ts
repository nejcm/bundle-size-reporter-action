import { getBundleSizeDiff, getFilesMap } from '../src/main';

describe('bundle diff', () => {
  test('getFilesMap return map of files', () => {
    const opts = { root: '' };
    expect(getFilesMap(['test/**/*.json'], opts)).toEqual({});
    expect(Object.keys(getFilesMap(['reports/**/*.json'], opts)).length).toBe(
      3,
    );
  });

  test('getBundleSizeDiff return map of files', async () => {
    const opts = { root: '' };
    const report = await getBundleSizeDiff('reports/**/*.json', false, opts);
    expect(report).toBeDefined();
    expect(Object.keys(report.reports).length).toBeGreaterThan(0);
    expect(report.summary?.length).toBeGreaterThan(0);
  });
});
