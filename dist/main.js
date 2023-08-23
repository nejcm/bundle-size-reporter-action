"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getBundleSizeDiff = exports.getFilesMap = exports.bundleSizeJson = exports.bundleSizeFile = exports.getFileSize = exports.buildGroupReport = exports.buildReport = void 0;
const promises_1 = __importDefault(require("fs/promises"));
const glob_1 = __importDefault(require("glob"));
const path_1 = __importDefault(require("path"));
const helpers_1 = require("./helpers");
const markdown_1 = require("./markdown");
const branchBasePath = 'br-base';
const workspace = process.env.GITHUB_WORKSPACE || '';
const basePaths = {
    main: path_1.default.join(workspace),
    branch: path_1.default.join(workspace, branchBasePath),
};
const buildReport = (name, newSize = 0, oldSize = 0) => {
    if (newSize === 0 && oldSize === 0)
        return undefined;
    const diff = newSize - oldSize;
    return {
        name,
        newSize,
        oldSize,
        diff,
        percentage: `${diff <= 0 ? '' : '+'}${(0, helpers_1.percentageDiff)(newSize, oldSize).toFixed(2)}`,
    };
};
exports.buildReport = buildReport;
const buildGroupReport = (newInfo, oldInfo, onlyDiff, filter) => {
    const keys = Object.keys(Object.assign(Object.assign({}, newInfo), oldInfo));
    return keys.reduce((acc, key) => {
        if (filter && !key.match(filter))
            return acc;
        const { bundled: oldSize = 0 } = (oldInfo || {})[key] || {};
        const { bundled: newSize = 0 } = (newInfo || {})[key] || {};
        if (onlyDiff && oldSize === newSize)
            return acc;
        const report = (0, exports.buildReport)(key, newSize, oldSize);
        if (!report)
            return acc;
        acc[key] = report;
        return acc;
    }, {});
};
exports.buildGroupReport = buildGroupReport;
const getFileSize = (file) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const stat = yield promises_1.default.stat(file);
        return stat.size;
    }
    catch (error) {
        return undefined;
    }
});
exports.getFileSize = getFileSize;
const bundleSizeFile = ({ path, branchPath, onlyDiff, filter, }) => __awaiter(void 0, void 0, void 0, function* () {
    const newSize = yield (0, exports.getFileSize)(path);
    const name = (0, helpers_1.trimPath)(path, basePaths.main);
    const newBundleInfo = newSize
        ? {
            [name]: {
                bundled: newSize,
            },
        }
        : undefined;
    const oldSize = yield (0, exports.getFileSize)(branchPath);
    const oldBundleInfo = newSize
        ? {
            [name]: {
                bundled: oldSize,
            },
        }
        : undefined;
    return (0, exports.buildGroupReport)(newBundleInfo, oldBundleInfo, onlyDiff, filter);
});
exports.bundleSizeFile = bundleSizeFile;
const bundleSizeJson = ({ path, branchPath, onlyDiff, filter, }) => __awaiter(void 0, void 0, void 0, function* () {
    const newContent = yield (0, helpers_1.readFile)(path);
    const newInfo = newContent ? (0, helpers_1.parseJSON)(newContent) : undefined;
    const oldContent = yield (0, helpers_1.readFile)(branchPath);
    const oldInfo = oldContent ? (0, helpers_1.parseJSON)(oldContent) : undefined;
    return (0, exports.buildGroupReport)(newInfo, oldInfo, onlyDiff, filter);
});
exports.bundleSizeJson = bundleSizeJson;
const getFilesMap = (path, options) => {
    const opts = Object.assign({ dot: true }, options);
    const p = path.trim();
    const fullPath = path_1.default.join(basePaths.main, p).replace(/\\/g, '/');
    const branchPath = path_1.default.join(basePaths.branch, p).replace(/\\/g, '/');
    const newFiles = glob_1.default.sync(fullPath, opts);
    const oldFiles = glob_1.default.sync(branchPath, opts);
    const map = (0, helpers_1.array2Map)([
        ...newFiles.map((val) => (0, helpers_1.trimPath)(val, basePaths.main)),
        ...oldFiles.map((val) => (0, helpers_1.trimPath)(val, basePaths.branch)),
    ]);
    return map;
};
exports.getFilesMap = getFilesMap;
const getBundleSizeDiff = (paths, onlyDiff = false, filter, options = {}) => __awaiter(void 0, void 0, void 0, function* () {
    const splited = paths.trim().split(',');
    const filterRegex = filter && filter.length > 0 ? new RegExp(filter, 'gi') : undefined;
    const result = yield splited.reduce((groupAcc, groupPath) => __awaiter(void 0, void 0, void 0, function* () {
        const fileMap = (0, exports.getFilesMap)(groupPath, options);
        let summary = '';
        const sums = {
            diff: 0,
        };
        const fileKeys = Object.keys(fileMap);
        const groupReports = yield fileKeys.reduce((acc, key) => __awaiter(void 0, void 0, void 0, function* () {
            const filePath = path_1.default.join(basePaths.main, key);
            const args = {
                path: filePath,
                branchPath: path_1.default.join(basePaths.branch, key),
                onlyDiff,
                filter: filterRegex,
            };
            const isJson = (0, helpers_1.isJsonFile)(key);
            const fn = isJson ? exports.bundleSizeJson : exports.bundleSizeFile;
            const report = yield fn(args);
            const rows = markdown_1.diffTable.rows(report);
            const reportVals = Object.values(report);
            for (let i = 0; i < reportVals.length; i++) {
                sums.diff += reportVals[i].diff;
            }
            if (rows.length > 2) {
                summary = `${summary}${isJson ? `| 📁 **${key}** | | | |\n` : ''}${rows}`;
            }
            const memo = yield acc;
            memo[key] = report;
            return memo;
        }), Promise.resolve({}));
        const groupMemo = yield groupAcc;
        if (summary.length > 2) {
            groupMemo.hasDifferences = true;
            groupMemo.summary = `${groupMemo.summary}${markdown_1.diffTable.table(summary)}| **TOTAL** | | | **${sums.diff <= 0 ? '' : '+'}${(0, helpers_1.convertBytes)(sums.diff, 'KB')}KB** |\n\n`;
        }
        groupMemo.reports[groupPath] = groupReports;
        return groupMemo;
    }), Promise.resolve({ reports: {}, summary: '', hasDifferences: false }));
    return result;
});
exports.getBundleSizeDiff = getBundleSizeDiff;
