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
exports.array2Map = exports.convertBytes = exports.formatBytes = exports.multiplier = exports.sizes = exports.percentageDiff = exports.parseJSON = exports.readFile = exports.isFile = exports.isJsonFile = exports.toBoolean = void 0;
const promises_1 = __importDefault(require("fs/promises"));
const toBoolean = (value) => value === 'true' || value === '1' || value === 'TRUE' || value === 1;
exports.toBoolean = toBoolean;
const isJsonFile = (filename) => filename.split('.').pop() === 'json';
exports.isJsonFile = isJsonFile;
const isFile = (path) => __awaiter(void 0, void 0, void 0, function* () {
    const stats = yield promises_1.default.stat(path);
    return stats.isFile();
});
exports.isFile = isFile;
const readFile = (path) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        return yield promises_1.default.readFile(path, 'utf8');
    }
    catch (err) {
        return undefined;
    }
});
exports.readFile = readFile;
const parseJSON = (str) => {
    try {
        return JSON.parse(str);
    }
    catch (_err) {
        return undefined;
    }
};
exports.parseJSON = parseJSON;
const percentageDiff = (updated, old) => {
    if (old === 0)
        return 100;
    const diff = updated - old;
    return (diff / old) * 100;
};
exports.percentageDiff = percentageDiff;
exports.sizes = [
    'B',
    'KB',
    'MB',
    'GB',
    'TB',
    'PB',
    'EB',
    'ZB',
    'YB',
];
exports.multiplier = 1024;
const formatBytes = (bytes, decimals = 2) => {
    if (bytes === 0)
        return '0 B';
    const dm = decimals < 0 ? 0 : decimals;
    const i = Math.floor(Math.log(bytes) / Math.log(exports.multiplier));
    return `${parseFloat((bytes / Math.pow(exports.multiplier, i)).toFixed(dm))} ${exports.sizes[i]}`;
};
exports.formatBytes = formatBytes;
const convertBytes = (bytes, from = 'B', to = 'MB', decimals = 2) => {
    if (!bytes || from === to)
        return bytes;
    const dm = decimals < 0 ? 0 : decimals;
    const toI = exports.sizes.indexOf(to);
    const fromI = exports.sizes.indexOf(from);
    if (toI < 0 || fromI < 0)
        return bytes;
    const i = toI - fromI;
    return parseFloat((bytes / Math.pow(exports.multiplier, i)).toFixed(dm));
};
exports.convertBytes = convertBytes;
const array2Map = (arr) => arr.reduce((acc, curr) => {
    acc[curr] = true;
    return acc;
}, {});
exports.array2Map = array2Map;
