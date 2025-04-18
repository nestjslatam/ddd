"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getConfigToken = getConfigToken;
/**
 * @publicApi
 */
function getConfigToken(token) {
    return `CONFIGURATION(${token.toString()})`;
}
