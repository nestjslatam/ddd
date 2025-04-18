"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getRegistrationToken = getRegistrationToken;
const config_constants_1 = require("../config.constants");
/**
 * @publicApi
 */
function getRegistrationToken(config) {
    return config[config_constants_1.PARTIAL_CONFIGURATION_KEY];
}
