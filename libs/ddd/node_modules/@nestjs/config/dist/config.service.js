"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ConfigService = void 0;
const common_1 = require("@nestjs/common");
const shared_utils_1 = require("@nestjs/common/utils/shared.utils");
const dotenv = __importStar(require("dotenv"));
const fs_1 = __importDefault(require("fs"));
const get_1 = __importDefault(require("lodash/get"));
const has_1 = __importDefault(require("lodash/has"));
const set_1 = __importDefault(require("lodash/set"));
const rxjs_1 = require("rxjs");
const config_constants_1 = require("./config.constants");
/**
 * @publicApi
 */
let ConfigService = class ConfigService {
    set isCacheEnabled(value) {
        this._isCacheEnabled = value;
    }
    get isCacheEnabled() {
        return this._isCacheEnabled;
    }
    set skipProcessEnv(value) {
        this._skipProcessEnv = value;
    }
    get skipProcessEnv() {
        return this._skipProcessEnv;
    }
    constructor(internalConfig = {}) {
        this.internalConfig = internalConfig;
        this.cache = {};
        this._changes$ = new rxjs_1.Subject();
        this._skipProcessEnv = false;
        this._isCacheEnabled = false;
        this.envFilePaths = [];
    }
    /**
     * Returns a stream of configuration changes.
     * Each event contains the attribute path, the old value and the new value.
     */
    get changes$() {
        return this._changes$.asObservable();
    }
    /**
     * Get a configuration value (either custom configuration or process environment variable)
     * based on property path (you can use dot notation to traverse nested object, e.g. "database.host").
     * It returns a default value if the key does not exist.
     * @param propertyPath
     * @param defaultValueOrOptions
     */
    get(propertyPath, defaultValueOrOptions, options) {
        const internalValue = this.getFromInternalConfig(propertyPath);
        if (!(0, shared_utils_1.isUndefined)(internalValue)) {
            return internalValue;
        }
        const validatedEnvValue = this.getFromValidatedEnv(propertyPath);
        if (!(0, shared_utils_1.isUndefined)(validatedEnvValue)) {
            return validatedEnvValue;
        }
        const defaultValue = this.isGetOptionsObject(defaultValueOrOptions) &&
            !options
            ? undefined
            : defaultValueOrOptions;
        if (!this._skipProcessEnv) {
            const processEnvValue = this.getFromProcessEnv(propertyPath, defaultValue);
            if (!(0, shared_utils_1.isUndefined)(processEnvValue)) {
                return processEnvValue;
            }
        }
        return defaultValue;
    }
    /**
     * Get a configuration value (either custom configuration or process environment variable)
     * based on property path (you can use dot notation to traverse nested object, e.g. "database.host").
     * It returns a default value if the key does not exist.
     * If the default value is undefined an exception will be thrown.
     * @param propertyPath
     * @param defaultValueOrOptions
     */
    getOrThrow(propertyPath, defaultValueOrOptions, options) {
        // @ts-expect-error Bypass method overloads
        const value = this.get(propertyPath, defaultValueOrOptions, options);
        if ((0, shared_utils_1.isUndefined)(value)) {
            throw new TypeError(`Configuration key "${propertyPath.toString()}" does not exist`);
        }
        return value;
    }
    /**
     * Sets a configuration value based on property path.
     * @param propertyPath
     * @param value
     */
    set(propertyPath, value) {
        const oldValue = this.get(propertyPath);
        (0, set_1.default)(this.internalConfig, propertyPath, value);
        if (typeof propertyPath === 'string') {
            process.env[propertyPath] = String(value);
            this.updateInterpolatedEnv(propertyPath, String(value));
        }
        if (this.isCacheEnabled) {
            this.setInCacheIfDefined(propertyPath, value);
        }
        this._changes$.next({
            path: propertyPath,
            oldValue,
            newValue: value,
        });
    }
    /**
     * Sets env file paths from `config.module.ts` to parse.
     * @param paths
     */
    setEnvFilePaths(paths) {
        this.envFilePaths = paths;
    }
    getFromCache(propertyPath, defaultValue) {
        const cachedValue = (0, get_1.default)(this.cache, propertyPath);
        return (0, shared_utils_1.isUndefined)(cachedValue)
            ? defaultValue
            : cachedValue;
    }
    getFromValidatedEnv(propertyPath) {
        const validatedEnvValue = (0, get_1.default)(this.internalConfig[config_constants_1.VALIDATED_ENV_PROPNAME], propertyPath);
        return validatedEnvValue;
    }
    getFromProcessEnv(propertyPath, defaultValue) {
        if (this.isCacheEnabled &&
            (0, has_1.default)(this.cache, propertyPath)) {
            const cachedValue = this.getFromCache(propertyPath, defaultValue);
            return !(0, shared_utils_1.isUndefined)(cachedValue) ? cachedValue : defaultValue;
        }
        const processValue = (0, get_1.default)(process.env, propertyPath);
        this.setInCacheIfDefined(propertyPath, processValue);
        return processValue;
    }
    getFromInternalConfig(propertyPath) {
        const internalValue = (0, get_1.default)(this.internalConfig, propertyPath);
        return internalValue;
    }
    setInCacheIfDefined(propertyPath, value) {
        if (typeof value === 'undefined') {
            return;
        }
        (0, set_1.default)(this.cache, propertyPath, value);
    }
    isGetOptionsObject(options) {
        return options && options?.infer && Object.keys(options).length === 1;
    }
    updateInterpolatedEnv(propertyPath, value) {
        let config = {};
        for (const envFilePath of this.envFilePaths) {
            if (fs_1.default.existsSync(envFilePath)) {
                config = Object.assign(dotenv.parse(fs_1.default.readFileSync(envFilePath)), config);
            }
        }
        const regex = new RegExp(`\\$\\{?${propertyPath}\\}?`, 'g');
        for (const [k, v] of Object.entries(config)) {
            if (regex.test(v)) {
                process.env[k] = v.replace(regex, value);
            }
        }
    }
};
exports.ConfigService = ConfigService;
exports.ConfigService = ConfigService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, common_1.Optional)()),
    __param(0, (0, common_1.Inject)(config_constants_1.CONFIGURATION_TOKEN)),
    __metadata("design:paramtypes", [Object])
], ConfigService);
