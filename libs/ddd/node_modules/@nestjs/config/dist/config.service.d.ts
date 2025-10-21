import { ConfigChangeEvent } from './interfaces/config-change-event.interface';
import { NoInferType, Path, PathValue } from './types';
/**
 * `ValidatedResult<WasValidated, T>
 *
 * If `WasValidated` is `true`, return `T`.
 * Otherwise, constructs the type `T` with `undefined`.
 */
type ValidatedResult<WasValidated extends boolean, T> = WasValidated extends true ? T : T | undefined;
/**
 * @publicApi
 */
export interface ConfigGetOptions {
    /**
     * If present, "get" method will try to automatically
     * infer a type of property based on the type argument
     * specified at the "ConfigService" class-level (example: ConfigService<Configuration>).
     */
    infer: true;
}
type KeyOf<T> = keyof T extends never ? string | symbol : keyof T;
/**
 * @publicApi
 */
export declare class ConfigService<K = Record<string | symbol, unknown>, WasValidated extends boolean = false> {
    private readonly internalConfig;
    private set isCacheEnabled(value);
    private get isCacheEnabled();
    private set skipProcessEnv(value);
    private get skipProcessEnv();
    private readonly cache;
    private readonly _changes$;
    private _skipProcessEnv;
    private _isCacheEnabled;
    private envFilePaths;
    constructor(internalConfig?: Record<string, any>);
    /**
     * Returns a stream of configuration changes.
     * Each event contains the attribute path, the old value and the new value.
     */
    get changes$(): import("rxjs").Observable<ConfigChangeEvent<any, any>>;
    /**
     * Get a configuration value (either custom configuration or process environment variable)
     * based on property path (you can use dot notation to traverse nested object, e.g. "database.host").
     * @param propertyPath
     */
    get<T = any>(propertyPath: KeyOf<K>): ValidatedResult<WasValidated, T>;
    /**
     * Get a configuration value (either custom configuration or process environment variable)
     * based on property path (you can use dot notation to traverse nested object, e.g. "database.host").
     * @param propertyPath
     * @param options
     */
    get<T = K, P extends Path<T> = any, R = PathValue<T, P>>(propertyPath: P, options: ConfigGetOptions): ValidatedResult<WasValidated, R>;
    /**
     * Get a configuration value (either custom configuration or process environment variable)
     * based on property path (you can use dot notation to traverse nested object, e.g. "database.host").
     * It returns a default value if the key does not exist.
     * @param propertyPath
     * @param defaultValue
     */
    get<T = any>(propertyPath: KeyOf<K>, defaultValue: NoInferType<T>): T;
    /**
     * Get a configuration value (either custom configuration or process environment variable)
     * based on property path (you can use dot notation to traverse nested object, e.g. "database.host").
     * It returns a default value if the key does not exist.
     * @param propertyPath
     * @param defaultValue
     * @param options
     */
    get<T = K, P extends Path<T> = any, R = PathValue<T, P>>(propertyPath: P, defaultValue: NoInferType<R>, options: ConfigGetOptions): Exclude<R, undefined>;
    /**
     * Get a configuration value (either custom configuration or process environment variable)
     * based on property path (you can use dot notation to traverse nested object, e.g. "database.host").
     * @param propertyPath
     */
    getOrThrow<T = any>(propertyPath: KeyOf<K>): Exclude<T, undefined>;
    /**
     * Get a configuration value (either custom configuration or process environment variable)
     * based on property path (you can use dot notation to traverse nested object, e.g. "database.host").
     * @param propertyPath
     * @param options
     */
    getOrThrow<T = K, P extends Path<T> = any, R = PathValue<T, P>>(propertyPath: P, options: ConfigGetOptions): Exclude<R, undefined>;
    /**
     * Get a configuration value (either custom configuration or process environment variable)
     * based on property path (you can use dot notation to traverse nested object, e.g. "database.host").
     * It returns a default value if the key does not exist.
     * If the default value is undefined an exception will be thrown.
     * @param propertyPath
     * @param defaultValue
     */
    getOrThrow<T = any>(propertyPath: KeyOf<K>, defaultValue: NoInferType<T>): Exclude<T, undefined>;
    /**
     * Get a configuration value (either custom configuration or process environment variable)
     * based on property path (you can use dot notation to traverse nested object, e.g. "database.host").
     * It returns a default value if the key does not exist.
     * If the default value is undefined an exception will be thrown.
     * @param propertyPath
     * @param defaultValue
     * @param options
     */
    getOrThrow<T = K, P extends Path<T> = any, R = PathValue<T, P>>(propertyPath: P, defaultValue: NoInferType<R>, options: ConfigGetOptions): Exclude<R, undefined>;
    /**
     * Sets a configuration value based on property path.
     * @param propertyPath
     * @param value
     */
    set<T = any>(propertyPath: KeyOf<K>, value: T): void;
    /**
     * Sets env file paths from `config.module.ts` to parse.
     * @param paths
     */
    setEnvFilePaths(paths: string[]): void;
    private getFromCache;
    private getFromValidatedEnv;
    private getFromProcessEnv;
    private getFromInternalConfig;
    private setInCacheIfDefined;
    private isGetOptionsObject;
    private updateInterpolatedEnv;
}
export {};
