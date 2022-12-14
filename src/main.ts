import fs from 'fs/promises';
import glob from 'glob';
import Path from 'path';
import {
  array2Map,
  convertBytes,
  isJsonFile,
  parseJSON,
  percentageDiff,
  readFile,
  trimPath,
} from './helpers';
import { diffTable } from './markdown';
import { Args, BundleInfo, GroupReport, Report, Response } from './types';

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
): GroupReport => {
  const keys = Object.keys({ ...newInfo, ...oldInfo });
  return keys.reduce<GroupReport>((acc, key) => {
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
  return buildGroupReport(newBundleInfo, oldBundleInfo, onlyDiff);
};

export const bundleSizeJson = async ({
  path,
  branchPath,
  onlyDiff,
}: Args): Promise<GroupReport> => {
  const newContent = await readFile(path);
  const newInfo = newContent ? parseJSON<BundleInfo>(newContent) : undefined;
  const oldContent = await readFile(branchPath);
  const oldInfo = oldContent ? parseJSON<BundleInfo>(oldContent) : undefined;
  return buildGroupReport(newInfo, oldInfo, onlyDiff);
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
  options: glob.IOptions = {},
): Promise<Response> => {
  const splited = paths.trim().split(',');

  const result = await splited.reduce<Promise<Response>>(
    async (groupAcc, groupPath) => {
      const fileMap = getFilesMap(groupPath, options);
      let summary = '';
      let sum = 0;

      const fileKeys = Object.keys(fileMap);
      const groupReports = await fileKeys.reduce<
        Promise<Record<string, GroupReport>>
      >(async (acc, key) => {
        const args = {
          path: Path.join(basePaths.main, key),
          branchPath: Path.join(basePaths.branch, key),
          onlyDiff,
        };
        const isJson = isJsonFile(key);
        const fn = isJson ? bundleSizeJson : bundleSizeFile;
        const report = await fn(args);
        const rows = diffTable.rows(report);
        sum += Object.keys(report).reduce(
          (rAcc, rk) => rAcc + report[rk].diff,
          0,
        );
        if (rows.length > 2) {
          summary = `${summary}${
            isJson ? `| **${key}** | | | |\n` : ''
          }${rows}`;
        }
        const memo = await acc;
        memo[key] = report;
        return memo;
      }, Promise.resolve({}));
      const groupMemo: Response = await groupAcc;
      if (summary.length > 2) {
        groupMemo.hasDifferences = true;
        groupMemo.summary = `${groupMemo.summary}${diffTable.table(
          summary,
        )}| **TOTAL** | | | **${sum <= 0 ? '' : '+'}${convertBytes(
          sum,
          'KB',
        )}KB** |\n\n`;
      }
      groupMemo.reports[groupPath] = groupReports;
      return groupMemo;
    },
    Promise.resolve({ reports: {}, summary: '', hasDifferences: false }),
  );
  return result;
};
