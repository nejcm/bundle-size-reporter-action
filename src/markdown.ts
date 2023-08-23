import { Size, convertBFormatted } from './helpers';
import { GroupReport, Report, Sums } from './types';

const head = `| Folder/File | Previous size | New size | Difference | \n|:---|---:|---:|---:| \n`;
const getPrefix = (diff: number) => (diff <= 0 ? '' : '+');

const row = (
  { name, newSize, oldSize, diff, percentage }: Report,
  unit: Size,
): string => {
  const newBytes = newSize ? convertBFormatted(newSize, unit) : '';
  const oldBytes = oldSize ? convertBFormatted(oldSize, unit) : '';
  return `| ${name} | ${oldBytes} | ${newBytes} | ${getPrefix(
    diff,
  )}${convertBFormatted(diff, unit)} **(${percentage}%)** |`;
};

export const folderTitle = (title: string) => `📁 **\`${title}\`**`;

export const diffTable = {
  head,
  folderRow: (title: string) => `| ${folderTitle(title)} | | | |\n`,
  row,
  rows: (group: GroupReport, unit: Size): string => {
    const rows = Object.keys(group).reduce((acc, key) => {
      const r = row(group[key], unit);
      return `${acc}${r}\n`;
    }, '');
    return rows;
  },
  footer: (title = '', sums: Sums, onlyDiff: boolean, unit: Size): string => {
    return `| ${title} | ${
      onlyDiff ? '' : convertBFormatted(sums.oldSize, unit)
    } | ${
      onlyDiff ? '' : convertBFormatted(sums.newSize, unit)
    } | **${getPrefix(sums.diff)}${convertBFormatted(sums.diff, unit)}** |`;
  },
  table: (body: string): string => `${head}${body}`,
};
