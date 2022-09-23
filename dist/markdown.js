"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.diffTable = void 0;
const helpers_1 = require("./helpers");
const SZ = 'KB';
const head = `| File | Previous size | New size | Difference | \n |:---|---:|---:|---:| \n`;
const diffCol = (updated = 0, old = 0) => {
    if (updated === 0 && old === 0)
        return '';
    const diff = updated - old;
    const sign = diff <= 0 ? '' : '+';
    return `${sign}${(0, helpers_1.convertBytes)(diff, SZ)}${SZ} **(${sign}${(0, helpers_1.percentageDiff)(updated, old).toFixed(2)}%)**`;
};
exports.diffTable = {
    head,
    rows: (updated, old) => {
        const keys = Object.keys(Object.assign(Object.assign({}, old), updated));
        const rows = keys.reduce((acc, key) => {
            const { bundled: bOld /* , minified: m2, gzipped: g2 */ } = (old === null || old === void 0 ? void 0 : old[key]) || {};
            const { bundled: bUpdated /* , minified: m1, gzipped: g1 */ } = (updated === null || updated === void 0 ? void 0 : updated[key]) || {};
            const oldBytes = bOld ? `${(0, helpers_1.convertBytes)(bOld, SZ)}${SZ}` : '';
            const updatedBytes = bUpdated ? `${(0, helpers_1.convertBytes)(bUpdated, SZ)}${SZ}` : '';
            const r = `| - ${key} | ${oldBytes} | ${updatedBytes} | ${diffCol(bUpdated, bOld)} |`;
            return `${acc} ${r}\n`;
        }, '');
        return rows;
    },
    table: (rows) => `${head}${rows}`,
};
