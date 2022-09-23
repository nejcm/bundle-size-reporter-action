import * as core from '@actions/core';
import fs from 'fs/promises';
import glob from 'glob';
import { isEqual } from 'lodash/fp';
import Path from 'path';
import {
  array2Map,
  isJsonFile,
  parseJSON,
  readFile,
  toBoolean,
} from './helpers';
import { diffTable } from './markdown';
import { Args, Report, Response, SingleResponse } from './types';

const branchBasePath = 'br-base';
const workspace = process.env.GITHUB_WORKSPACE || '';
const basePaths = {
  main: Path.join(workspace),
  branch: Path.join(workspace, branchBasePath),
};

export const trimPath = (path: string, trim: string): string =>
  path.startsWith(trim) ? path.slice(trim.length) : path;

export const buildReport = async (files: string[]): Promise<Report> => {
  const report: Report = {};
  for (let i = 0; i < files.length; i++) {
    const file = files[i];
    const stat = await fs.stat(file);
    report[file] = {
      bundled: stat ? stat.size : undefined,
    };
  }
  return report;
};

// TODO: WIP
export const bundleSizeFolder = async ({
  path,
  branchPath,
  onlyDiff,
}: Args): Promise<SingleResponse> => {
  const files = await fs.readdir(path);
  const newReport = await buildReport(files);
  const oldFiles = await fs.readdir(branchPath);
  const oldReport = await buildReport(oldFiles);
  const summary =
    !onlyDiff || !isEqual(newReport, oldReport)
      ? diffTable.rows(newReport, oldReport)
      : '';
  return {
    oldReport,
    newReport,
    summary,
  };
};

export const bundleSizeJson = async ({
  path,
  branchPath,
  onlyDiff,
}: Args): Promise<SingleResponse> => {
  const newContent = await readFile(path);
  const newReport = newContent ? parseJSON<Report>(newContent) : undefined;
  const oldContent = await readFile(branchPath);
  const oldReport = oldContent ? parseJSON<Report>(oldContent) : undefined;
  const hasReport = !!newReport || !!oldReport;

  const summary =
    hasReport && (!onlyDiff || !isEqual(newReport, oldReport))
      ? diffTable.rows(newReport, oldReport)
      : '';
  return {
    oldReport,
    newReport,
    summary,
  };
};

export const getFilesMap = (
  paths: string[],
  options?: glob.IOptions,
): Record<string, boolean> =>
  paths.reduce<Record<string, boolean>>((acc, path) => {
    const opts = { dot: true, ...options };
    const p = path.trim();
    const fullPath = Path.join(basePaths.main, p).replace(/\\/g, '/');
    const branchPath = Path.join(basePaths.branch, p).replace(/\\/g, '/');
    const newFiles = glob.sync(fullPath, opts);
    const oldFiles = glob.sync(branchPath, opts);
    const map = array2Map([
      ...newFiles.map((val) => trimPath(val, basePaths.main)),
      ...oldFiles.map((val) => trimPath(val, basePaths.branch)),
    ]);
    return { ...acc, ...map };
  }, {});

export const getBundleSizeDiff = async (
  paths: string,
  onlyDiff = false,
  options: glob.IOptions = {},
): Promise<Response> => {
  const splited = paths.trim().split(',');
  const fileMap = getFilesMap(splited, options);
  core.info(`Files: ${JSON.stringify(fileMap)}`);

  // TODO: run in paralel
  const result = await Object.keys(fileMap).reduce<Promise<Response>>(
    async (acc, path) => {
      const fullPath = Path.join(basePaths.main, path);
      const args = {
        path: fullPath,
        branchPath: Path.join(basePaths.branch, path),
        onlyDiff,
      };
      const fn = isJsonFile(path) ? bundleSizeJson : bundleSizeFolder;
      const report = await fn(args);
      const memo = await acc;
      memo.reports[fullPath] = report;
      memo.summary = report.summary
        ? `${memo.summary} | **${path}** | | | |\n ${report.summary}`
        : memo.summary;
      return memo;
    },
    Promise.resolve({ reports: {}, summary: '' }),
  );
  if (result.summary && result.summary.length > 0) {
    result.summary = diffTable.table(result.summary);
  }

  return result;
};

export const run = async (): Promise<void> => {
  core.info(`Starting bundle size diff action.`);
  const paths = core.getInput('paths');
  const onlyDiff = toBoolean(core.getInput('onlyDiff') || 'false');
  try {
    if (!paths || paths.length === 0) throw new Error('Missing paths input!');
    const { reports, summary = '' } = await getBundleSizeDiff(paths, onlyDiff);
    core.setOutput('reports', reports);
    core.setOutput('summary', summary);
    core.info(`Bundle size action completed.`);
  } catch (error: any) {
    core.setFailed(error.message);
    core.setOutput('summary', '');
  }
};
