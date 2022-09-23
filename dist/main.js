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
exports.run = exports.getBundleSizeDiff = exports.getFilesMap = exports.bundleSizeJson = exports.bundleSizeFolder = exports.buildReport = exports.trimPath = void 0;
const core_1 = require("@actions/core");
const promises_1 = __importDefault(require("fs/promises"));
const glob_1 = __importDefault(require("glob"));
const fp_1 = require("lodash/fp");
const path_1 = __importDefault(require("path"));
const helpers_1 = require("./helpers");
const markdown_1 = require("./markdown");
const branchBasePath = 'br-base';
const workspace = process.env.GITHUB_WORKSPACE || '';
const basePaths = {
    main: path_1.default.join(workspace),
    branch: path_1.default.join(workspace, branchBasePath),
};
const trimPath = (path, trim) => path.startsWith(trim) ? path.slice(trim.length) : path;
exports.trimPath = trimPath;
const buildReport = (files) => __awaiter(void 0, void 0, void 0, function* () {
    const report = {};
    for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const stat = yield promises_1.default.stat(file);
        report[file] = {
            bundled: stat ? stat.size : undefined,
        };
    }
    return report;
});
exports.buildReport = buildReport;
// TODO: WIP
const bundleSizeFolder = ({ path, branchPath, onlyDiff, }) => __awaiter(void 0, void 0, void 0, function* () {
    const files = yield promises_1.default.readdir(path);
    const newReport = yield (0, exports.buildReport)(files);
    const oldFiles = yield promises_1.default.readdir(branchPath);
    const oldReport = yield (0, exports.buildReport)(oldFiles);
    const summary = !onlyDiff || !(0, fp_1.isEqual)(newReport, oldReport)
        ? markdown_1.diffTable.rows(newReport, oldReport)
        : '';
    return {
        oldReport,
        newReport,
        summary,
    };
});
exports.bundleSizeFolder = bundleSizeFolder;
const bundleSizeJson = ({ path, branchPath, onlyDiff, }) => __awaiter(void 0, void 0, void 0, function* () {
    const newContent = yield (0, helpers_1.readFile)(path);
    const newReport = newContent ? (0, helpers_1.parseJSON)(newContent) : undefined;
    const oldContent = yield (0, helpers_1.readFile)(branchPath);
    const oldReport = oldContent ? (0, helpers_1.parseJSON)(oldContent) : undefined;
    const hasReport = !!newReport || !!oldReport;
    const summary = hasReport && (!onlyDiff || !(0, fp_1.isEqual)(newReport, oldReport))
        ? markdown_1.diffTable.rows(newReport, oldReport)
        : '';
    return {
        oldReport,
        newReport,
        summary,
    };
});
exports.bundleSizeJson = bundleSizeJson;
const getFilesMap = (paths, options) => paths.reduce((acc, path) => {
    const opts = Object.assign({ dot: true }, options);
    const p = path.trim();
    const fullPath = path_1.default.join(basePaths.main, p).replace(/\\/g, '/');
    const branchPath = path_1.default.join(basePaths.branch, p).replace(/\\/g, '/');
    const newFiles = glob_1.default.sync(fullPath, opts);
    const oldFiles = glob_1.default.sync(branchPath, opts);
    const map = (0, helpers_1.array2Map)([
        ...newFiles.map((val) => (0, exports.trimPath)(val, basePaths.main)),
        ...oldFiles.map((val) => (0, exports.trimPath)(val, basePaths.branch)),
    ]);
    return Object.assign(Object.assign({}, acc), map);
}, {});
exports.getFilesMap = getFilesMap;
const getBundleSizeDiff = (paths, onlyDiff = false, options = {}) => __awaiter(void 0, void 0, void 0, function* () {
    const splited = paths.trim().split(',');
    const fileMap = (0, exports.getFilesMap)(splited, options);
    (0, core_1.info)(`Files: ${JSON.stringify(fileMap)}`);
    // TODO: run in paralel
    const result = yield Object.keys(fileMap).reduce((acc, path) => __awaiter(void 0, void 0, void 0, function* () {
        const fullPath = path_1.default.join(basePaths.main, path);
        const args = {
            path: fullPath,
            branchPath: path_1.default.join(basePaths.branch, path),
            onlyDiff,
        };
        const fn = (0, helpers_1.isJsonFile)(path) ? exports.bundleSizeJson : exports.bundleSizeFolder;
        const report = yield fn(args);
        const memo = yield acc;
        memo.reports[fullPath] = report;
        memo.summary = report.summary
            ? `${memo.summary} | **${path}** | | | |\n ${report.summary}`
            : memo.summary;
        return memo;
    }), Promise.resolve({ reports: {}, summary: '' }));
    if (result.summary && result.summary.length > 0) {
        result.summary = markdown_1.diffTable.table(result.summary);
    }
    return result;
});
exports.getBundleSizeDiff = getBundleSizeDiff;
const run = () => __awaiter(void 0, void 0, void 0, function* () {
    (0, core_1.info)(`Starting bundle size diff action.`);
    const paths = (0, core_1.getInput)('paths');
    const onlyDiff = (0, helpers_1.toBoolean)((0, core_1.getInput)('onlyDiff') || 'false');
    try {
        if (!paths || paths.length === 0)
            throw new Error('Missing paths input!');
        const { reports, summary = '' } = yield (0, exports.getBundleSizeDiff)(paths, onlyDiff);
        (0, core_1.setOutput)('reports', reports);
        (0, core_1.setOutput)('summary', summary);
        (0, core_1.info)(`Bundle size action completed.`);
    }
    catch (error) {
        (0, core_1.setFailed)(error.message);
        (0, core_1.setOutput)('summary', '');
    }
});
exports.run = run;
