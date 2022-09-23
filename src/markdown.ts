import { convertBytes, percentageDiff } from './helpers';
import { Report } from './types';

const SZ = 'KB';

const head = `| File | Previous size | New size | Difference | \n |:---|---:|---:|---:| \n`;
const diffCol = (updated = 0, old = 0): string => {
  if (updated === 0 && old === 0) return '';
  const diff = updated - old;
  const sign = diff <= 0 ? '' : '+';
  return `${sign}${convertBytes(diff, SZ)}${SZ} **(${sign}${percentageDiff(
    updated,
    old,
  ).toFixed(2)}%)**`;
};

export const diffTable = {
  head,
  rows: (updated?: Report, old?: Report): string => {
    const keys = Object.keys({ ...old, ...updated });
    const rows = keys.reduce((acc, key) => {
      const { bundled: bOld /* , minified: m2, gzipped: g2 */ } =
        old?.[key] || {};
      const { bundled: bUpdated /* , minified: m1, gzipped: g1 */ } =
        updated?.[key] || {};
      const oldBytes = bOld ? `${convertBytes(bOld, SZ)}${SZ}` : '';
      const updatedBytes = bUpdated ? `${convertBytes(bUpdated, SZ)}${SZ}` : '';
      const r = `| - ${key} | ${oldBytes} | ${updatedBytes} | ${diffCol(
        bUpdated,
        bOld,
      )} |`;
      return `${acc} ${r}\n`;
    }, '');
    return rows;
  },
  table: (rows: string): string => `${head}${rows}`,
};
