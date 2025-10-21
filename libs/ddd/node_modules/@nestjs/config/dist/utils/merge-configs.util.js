"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.mergeConfigObject = mergeConfigObject;
const set_1 = __importDefault(require("lodash/set"));
/**
 * @publicApi
 */
function mergeConfigObject(host, partial, token) {
    if (token) {
        (0, set_1.default)(host, token, partial);
        return partial;
    }
    Object.assign(host, partial);
}
