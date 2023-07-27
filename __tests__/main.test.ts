import { getBundleSizeDiff, getFilesMap } from '../src/main';

describe('bundle diff', () => {
  test('getFilesMap return map of files', () => {
    const opts = { root: '' };
    expect(getFilesMap('test/**/*.json', opts)).toEqual({});
    expect(Object.keys(getFilesMap('reports/**/*.json', opts)).length).toBe(3);
  });

  test('getBundleSizeDiff return map of files', async () => {
    const opts = { root: '' };
    const report = await getBundleSizeDiff(
      'reports/**/*.json, reports/**/*.js',
      false,
      undefined,
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
      opts,
    );
    expect(report).toBeDefined();
    expect(Object.keys(report.reports).length).toBeGreaterThan(0);
    expect(report.summary?.length).toBeGreaterThan(0);

    const report2 = await getBundleSizeDiff(
      'reports/**/*.json, reports/**/*.js',
      false,
      `.*\\._notFound_\\.js`,
      opts,
    );
    expect(report2).toBeDefined();
    expect(report2.summary?.length).toBe(0);
    expect(report2.hasDifferences).toBeFalsy();
  });
});
