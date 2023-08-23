import { getBundleSizeDiff, getFilesMap } from '../main';

describe('bundle diff', () => {
  test('getFilesMap return map of files', () => {
    const opts = { root: '' };
    expect(getFilesMap('test/**/*.json', opts)).toEqual({});
    expect(Object.keys(getFilesMap('reports/**/*.json', opts)).length).toBe(3);
  });

  test('getBundleSizeDiff return map of files', async () => {
    const opts = { root: '' };
    const report = await getBundleSizeDiff(
      'reports/**/*.json, reports/folder/*',
      false,
      undefined,
      'KB',
      opts,
    );
    expect(report).toBeDefined();
    expect(Object.keys(report.reports).length).toBeGreaterThan(0);
    expect(report.summary?.length).toBeGreaterThan(0);
    //console.log(report.summary);
  });

  test('getBundleSizeDiff return map of filtered files', async () => {
    const opts = { root: '' };
    const report = await getBundleSizeDiff(
      'reports/**/*.json, reports/**/*.js',
      false,
      `.*\\.esm\\.js`,
      'KB',
      opts,
    );
    expect(report).toBeDefined();
    expect(Object.keys(report.reports).length).toBeGreaterThan(0);
    expect(report.summary?.length).toBeGreaterThan(0);

    const report2 = await getBundleSizeDiff(
      'reports/**/*.json, reports/**/*.js',
      false,
      `.*\\._notFound_\\.js`,
      'KB',
      opts,
    );
    expect(report2).toBeDefined();
    expect(report2.summary?.length).toBe(0);
    expect(report2.hasDifferences).toBeFalsy();
  });

  test('getBundleSizeDiff return map of files merged', async () => {
    const opts = { root: '' };
    const report = await getBundleSizeDiff(
      '~reports/folder/*',
      false,
      undefined,
      'B',
      opts,
    );
    expect(report).toBeDefined();
    const keys = Object.keys(report.reports);
    expect(keys.length).toBe(1);
    expect(Object.keys(report.reports[keys[0]]).length).toBeGreaterThan(0);
    expect(report.summary?.length).toBeGreaterThan(0);
  });
});
