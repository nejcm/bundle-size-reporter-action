"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const helpers_1 = require("../helpers");
describe('helpers', () => {
    test('array2Map', () => {
        const arr = [
            'files/a/.size.json',
            'files/b/.size.json',
            'files/a/test.txt',
        ];
        expect((0, helpers_1.array2Map)(arr)).toEqual({
            [arr[0]]: true,
            [arr[1]]: true,
            [arr[2]]: true,
        });
    });
});
