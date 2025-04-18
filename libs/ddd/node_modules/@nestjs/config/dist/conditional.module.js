"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ConditionalModule = void 0;
const common_1 = require("@nestjs/common");
const config_module_1 = require("./config.module");
/**
 * Same logic as in `@nestjs/core` package.
 * @param instance The instance which should get the name from
 * @returns The name of an instance or `undefined`
 */
const getInstanceName = (instance) => {
    if (instance?.forwardRef) {
        return instance.forwardRef()?.name;
    }
    if (instance.module) {
        return instance.module?.name;
    }
    return instance.name;
};
/**
 * @publicApi
 */
class ConditionalModule {
    /**
     * @publicApi
     */
    static async registerWhen(module, condition, options) {
        const { timeout = 5000, debug = true } = options ?? {};
        const moduleName = getInstanceName(module) || module.toString();
        const timer = setTimeout(() => {
            throw new Error(`Nest was not able to resolve the config variables within ${timeout} milliseconds. Bause of this, the ConditionalModule was not able to determine if ${moduleName} should be registered or not`);
        }, timeout);
        timer.unref();
        const returnModule = { module: ConditionalModule, imports: [], exports: [] };
        if (typeof condition === 'string') {
            const key = condition;
            condition = env => {
                return env[key]?.toLowerCase() !== 'false';
            };
        }
        await config_module_1.ConfigModule.envVariablesLoaded;
        clearTimeout(timer);
        const evaluation = condition(process.env);
        if (evaluation) {
            returnModule.imports.push(module);
            returnModule.exports.push(module);
        }
        else {
            if (debug) {
                common_1.Logger.debug(`${condition.toString()} evaluated to false. Skipping the registration of ${moduleName}`, ConditionalModule.name);
            }
        }
        return returnModule;
    }
}
exports.ConditionalModule = ConditionalModule;
