import fs from 'fs/promises';
import glob from 'glob';
import Path from 'path';
import {
  Size,
  array2Map,
  isJsonFile,
  parseJSON,
  percentageDiff,
  readFile,
  trimPath,
} from './helpers';
import { diffTable, folderTitle } from './markdown';
import { Args, BundleInfo, GroupReport, Report, Response, Sums } from './types';

const branchBasePath = 'br-base';
const workspace = process.env.GITHUB_WORKSPACE || '';
const basePaths = {
  main: Path.join(workspace),
  branch: Path.join(workspace, branchBasePath),
};

export const buildReport = (
  name: string,
  newSize = 0,
  oldSize = 0,
): Report | undefined => {
  if (newSize === 0 && oldSize === 0) return undefined;
  const diff = newSize - oldSize;
  return {
    name,
    newSize,
    oldSize,
    diff,
    percentage: `${diff <= 0 ? '' : '+'}${percentageDiff(
      newSize,
      oldSize,
    ).toFixed(2)}`,
  };
};

export const buildGroupReport = (
  newInfo?: BundleInfo,
  oldInfo?: BundleInfo,
  onlyDiff?: boolean,
  filter?: RegExp,
): GroupReport => {
  const keys = Object.keys({ ...newInfo, ...oldInfo });
  return keys.reduce<GroupReport>((acc, key) => {
    if (filter && !key.match(filter)) return acc;
    const { bundled: oldSize = 0 } = (oldInfo || {})[key] || {};
    const { bundled: newSize = 0 } = (newInfo || {})[key] || {};
    if (onlyDiff && oldSize === newSize) return acc;
    const report = buildReport(key, newSize, oldSize);
    if (!report) return acc;
    acc[key] = report;
    return acc;
  }, {});
};

export const getFileSize = async (
  file: string,
): Promise<number | undefined> => {
  try {
    const stat = await fs.stat(file);
    return stat.size;
  } catch (error) {
    return undefined;
  }
};

export const bundleSizeFile = async ({
  path,
  branchPath,
  onlyDiff,
  filter,
}: Args): Promise<GroupReport> => {
  const newSize = await getFileSize(path);
  const name = trimPath(path, basePaths.main);
  const newBundleInfo = newSize
    ? {
        [name]: {
          bundled: newSize,
        },
      }
    : undefined;
  const oldSize = await getFileSize(branchPath);
  const oldBundleInfo = newSize
    ? {
        [name]: {
          bundled: oldSize,
        },
      }
    : undefined;
  return buildGroupReport(newBundleInfo, oldBundleInfo, onlyDiff, filter);
};

export const bundleSizeJson = async ({
  path,
  branchPath,
  onlyDiff,
  filter,
}: Args): Promise<GroupReport> => {
  const newContent = await readFile(path);
  const newInfo = newContent ? parseJSON<BundleInfo>(newContent) : undefined;
  const oldContent = await readFile(branchPath);
  const oldInfo = oldContent ? parseJSON<BundleInfo>(oldContent) : undefined;
  return buildGroupReport(newInfo, oldInfo, onlyDiff, filter);
};

export const getFilesMap = (
  path: string,
  options?: glob.IOptions,
): Record<string, boolean> => {
  const opts = { dot: true, ...options };
  const p = path.trim();
  const fullPath = Path.join(basePaths.main, p).replace(/\\/g, '/');
  const branchPath = Path.join(basePaths.branch, p).replace(/\\/g, '/');
  const newFiles = glob.sync(fullPath, opts);
  const oldFiles = glob.sync(branchPath, opts);
  const map = array2Map([
    ...newFiles.map((val: string) => trimPath(val, basePaths.main)),
    ...oldFiles.map((val: string) => trimPath(val, basePaths.branch)),
  ]);
  return map;
};

export const getBundleSizeDiff = async (
  paths: string,
  onlyDiff = false,
  filter?: string,
  unit: Size = 'KB',
  options: glob.IOptions = {},
): Promise<Response> => {
  const splited = paths.split(',');
  const filterRegex =
    filter && filter.length > 0 ? new RegExp(filter, 'gi') : undefined;

  const result = await splited.reduce<Promise<Response>>(
    async (groupAcc, gp) => {
      // parse path
      const gpTrimmed = gp.trim();
      const shouldMerge = gpTrimmed.startsWith('~');
      const groupPath = shouldMerge ? gpTrimmed.slice(1) : gpTrimmed;

      // get files from path
      const fileMap = getFilesMap(groupPath, options);

      let summary = '';
      const sums: Sums = { oldSize: 0, newSize: 0, diff: 0 };
      let hasDiffs = false;
      const fileKeys = Object.keys(fileMap);

      // generate reports for each file
      const groupReports = await fileKeys.reduce<
        Promise<Record<string, GroupReport>>
      >(async (acc, key) => {
        const filePath = Path.join(basePaths.main, key);
        const args: Args = {
          path: filePath,
          branchPath: Path.join(basePaths.branch, key),
          onlyDiff,
          filter: filterRegex,
        };
        const isJson = isJsonFile(key);
        const fn = isJson ? bundleSizeJson : bundleSizeFile;
        const report = await fn(args);

        const reportVals = Object.values(report);
        if (reportVals.length > 0) {
          hasDiffs = true;
          // calc diff
          for (let i = 0; i < reportVals.length; i++) {
            sums.oldSize += reportVals[i].oldSize;
            sums.newSize += reportVals[i].newSize;
            sums.diff += reportVals[i].diff;
          }

          if (!shouldMerge) {
            const rows = diffTable.rows(report, unit);
            summary = `${summary}${
              isJson ? diffTable.folderRow(key) : ''
            }${rows}`;
          }
        }
        const memo = await acc;
        memo[key] = report;
        return memo;
      }, Promise.resolve({}));

      const groupMemo: Response = await groupAcc;
      if (hasDiffs) {
        groupMemo.hasDifferences = true;
        groupMemo.summary += diffTable.table(
          `${summary}${diffTable.footer(
            shouldMerge ? folderTitle(groupPath) : '**TOTAL**',
            sums,
            !shouldMerge,
            unit,
          )}\n\n`,
        );
      }

      groupMemo.reports[groupPath] = groupReports;
      return groupMemo;
    },
    Promise.resolve({ reports: {}, summary: '', hasDifferences: false }),
  );
  return result;
};
