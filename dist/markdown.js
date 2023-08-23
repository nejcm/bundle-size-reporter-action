"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.diffTable = exports.folderTitle = void 0;
const helpers_1 = require("./helpers");
const head = `| Folder/File | Previous size | New size | Difference | \n|:---|---:|---:|---:| \n`;
const getPrefix = (diff) => (diff <= 0 ? '' : '+');
const row = ({ name, newSize, oldSize, diff, percentage }, unit) => {
    const newBytes = newSize ? (0, helpers_1.convertBFormatted)(newSize, unit) : '';
    const oldBytes = oldSize ? (0, helpers_1.convertBFormatted)(oldSize, unit) : '';
    return `| ${name} | ${oldBytes} | ${newBytes} | ${getPrefix(diff)}${(0, helpers_1.convertBFormatted)(diff, unit)} **(${percentage}%)** |`;
};
const folderTitle = (title) => `📁 **\`${title}\`**`;
exports.folderTitle = folderTitle;
exports.diffTable = {
    head,
    folderRow: (title) => `| ${(0, exports.folderTitle)(title)} | | | |\n`,
    row,
    rows: (group, unit) => {
        const rows = Object.keys(group).reduce((acc, key) => {
            const r = row(group[key], unit);
            return `${acc}${r}\n`;
        }, '');
        return rows;
    },
    footer: (title = '', sums, onlyDiff, unit) => {
        return `| ${title} | ${onlyDiff ? '' : (0, helpers_1.convertBFormatted)(sums.oldSize, unit)} | ${onlyDiff ? '' : (0, helpers_1.convertBFormatted)(sums.newSize, unit)} | **${getPrefix(sums.diff)}${(0, helpers_1.convertBFormatted)(sums.diff, unit)}** |`;
    },
    table: (body) => `${head}${body}`,
};
