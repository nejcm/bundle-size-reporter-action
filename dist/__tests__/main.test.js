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
Object.defineProperty(exports, "__esModule", { value: true });
const main_1 = require("../main");
describe('bundle diff', () => {
    test('getFilesMap return map of files', () => {
        const opts = { root: '' };
        expect((0, main_1.getFilesMap)('test/**/*.json', opts)).toEqual({});
        expect(Object.keys((0, main_1.getFilesMap)('reports/**/*.json', opts)).length).toBe(3);
    });
    test('getBundleSizeDiff return map of files', () => __awaiter(void 0, void 0, void 0, function* () {
        var _a;
        const opts = { root: '' };
        const report = yield (0, main_1.getBundleSizeDiff)('reports/**/*.json, reports/folder/*', false, undefined, 'KB', opts);
        expect(report).toBeDefined();
        expect(Object.keys(report.reports).length).toBeGreaterThan(0);
        expect((_a = report.summary) === null || _a === void 0 ? void 0 : _a.length).toBeGreaterThan(0);
        //console.log(report.summary);
    }));
    test('getBundleSizeDiff return map of filtered files', () => __awaiter(void 0, void 0, void 0, function* () {
        var _b, _c;
        const opts = { root: '' };
        const report = yield (0, main_1.getBundleSizeDiff)('reports/**/*.json, reports/**/*.js', false, `.*\\.esm\\.js`, 'KB', opts);
        expect(report).toBeDefined();
        expect(Object.keys(report.reports).length).toBeGreaterThan(0);
        expect((_b = report.summary) === null || _b === void 0 ? void 0 : _b.length).toBeGreaterThan(0);
        const report2 = yield (0, main_1.getBundleSizeDiff)('reports/**/*.json, reports/**/*.js', false, `.*\\._notFound_\\.js`, 'KB', opts);
        expect(report2).toBeDefined();
        expect((_c = report2.summary) === null || _c === void 0 ? void 0 : _c.length).toBe(0);
        expect(report2.hasDifferences).toBeFalsy();
    }));
    test('getBundleSizeDiff return map of files merged', () => __awaiter(void 0, void 0, void 0, function* () {
        var _d;
        const opts = { root: '' };
        const report = yield (0, main_1.getBundleSizeDiff)('~reports/folder/*', false, undefined, 'B', opts);
        expect(report).toBeDefined();
        const keys = Object.keys(report.reports);
        expect(keys.length).toBe(1);
        expect(Object.keys(report.reports[keys[0]]).length).toBeGreaterThan(0);
        expect((_d = report.summary) === null || _d === void 0 ? void 0 : _d.length).toBeGreaterThan(0);
    }));
});
