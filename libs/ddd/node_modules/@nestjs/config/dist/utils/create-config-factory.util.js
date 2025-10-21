"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createConfigProvider = createConfigProvider;
const get_config_token_util_1 = require("./get-config-token.util");
const crypto_1 = require("crypto");
/**
 * @publicApi
 */
function createConfigProvider(factory) {
    return {
        provide: factory.KEY || (0, get_config_token_util_1.getConfigToken)((0, crypto_1.randomUUID)()),
        useFactory: factory,
        inject: [],
    };
}
