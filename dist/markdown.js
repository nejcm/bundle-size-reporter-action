"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.diffTable = void 0;
const helpers_1 = require("./helpers");
const SZ = 'KB';
const head = `| File | Previous size | New size | Difference | \n|:---|---:|---:|---:| \n`;
const row = ({ name, newSize, oldSize, diff, percentage }) => {
    const newBytes = newSize ? `${(0, helpers_1.convertBytes)(newSize, SZ)}${SZ}` : '';
    const oldBytes = oldSize ? `${(0, helpers_1.convertBytes)(oldSize, SZ)}${SZ}` : '';
    return `| ${name} | ${oldBytes} | ${newBytes} | ${diff <= 0 ? '' : '+'}${(0, helpers_1.convertBytes)(diff, SZ)}${SZ} **(${percentage}%)** |`;
};
exports.diffTable = {
    head,
    row,
    rows: (group) => {
        const rows = Object.keys(group).reduce((acc, key) => {
            const r = row(group[key]);
            return `${acc}${r}\n`;
        }, '');
        return rows;
    },
    table: (rows) => `${head}${rows}`,
};
