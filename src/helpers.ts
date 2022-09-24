import fs from 'fs/promises';

export const toBoolean = (value: string | number | undefined): boolean =>
  value === 'true' || value === '1' || value === 'TRUE' || value === 1;

export const isJsonFile = (filename: string): boolean =>
  filename.split('.').pop() === 'json';

export const isFile = async (path: string): Promise<boolean> => {
  const stats = await fs.stat(path);
  return stats.isFile();
};

export const getFilename = (path: string): string =>
  path.replace(/^.*[\\/]/, '');

export const readFile = async (path: string): Promise<string | undefined> => {
  try {
    return await fs.readFile(path, 'utf8');
  } catch (err) {
    return undefined;
  }
};

export const parseJSON = <TData = JSON>(str: string): TData | undefined => {
  try {
    return JSON.parse(str);
  } catch (_err) {
    return undefined;
  }
};

export const percentageDiff = (updated: number, old: number): number => {
  if (old === 0) return 100;
  const diff = updated - old;
  return (diff / old) * 100;
};

export const sizes = [
  'B',
  'KB',
  'MB',
  'GB',
  'TB',
  'PB',
  'EB',
  'ZB',
  'YB',
] as const;
export type Sizes = typeof sizes[number];
export const multiplier = 1024;

export const formatBytes = (bytes: number, decimals = 2): string => {
  if (bytes === 0) return '0 B';
  const dm = decimals < 0 ? 0 : decimals;
  const i = Math.floor(Math.log(bytes) / Math.log(multiplier));
  return `${parseFloat((bytes / multiplier ** i).toFixed(dm))} ${sizes[i]}`;
};

export const convertBytes = (
  bytes: number,
  from: Sizes = 'B',
  to: Sizes = 'MB',
  decimals = 2,
): number => {
  if (!bytes || from === to) return bytes;
  const dm = decimals < 0 ? 0 : decimals;
  const toI = sizes.indexOf(to);
  const fromI = sizes.indexOf(from);
  if (toI < 0 || fromI < 0) return bytes;
  const i = toI - fromI;
  return parseFloat((bytes / multiplier ** i).toFixed(dm));
};

export const array2Map = (arr: (string | number)[]): Record<string, boolean> =>
  arr.reduce<Record<string, boolean>>((acc, curr) => {
    acc[curr] = true;
    return acc;
  }, {});

export const trimPath = (path: string, trim: string): string =>
  path.startsWith(trim) ? path.slice(trim.length) : path;
