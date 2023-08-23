import { convertBytes } from './helpers';
import { GroupReport, Report } from './types';

const SZ = 'KB';

const head = `| Folder/File | Previous size | New size | Difference | \n|:---|---:|---:|---:| \n`;

const row = ({ name, newSize, oldSize, diff, percentage }: Report): string => {
  const newBytes = newSize ? `${convertBytes(newSize, SZ)}${SZ}` : '';
  const oldBytes = oldSize ? `${convertBytes(oldSize, SZ)}${SZ}` : '';
  return `| ${name} | ${oldBytes} | ${newBytes} | ${
    diff <= 0 ? '' : '+'
  }${convertBytes(diff, SZ)}${SZ} **(${percentage}%)** |`;
};

export const diffTable = {
  head,
  row,
  rows: (group: GroupReport): string => {
    const rows = Object.keys(group).reduce((acc, key) => {
      const r = row(group[key]);
      return `${acc}${r}\n`;
    }, '');
    return rows;
  },
  table: (rows: string): string => `${head}${rows}`,
};
