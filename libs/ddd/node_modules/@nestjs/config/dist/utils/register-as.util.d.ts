import { ConfigModule } from '..';
import { ConfigFactory } from '../interfaces';
import { ConfigObject } from '../types';
/**
 * @publicApi
 */
export interface ConfigFactoryKeyHost<T = unknown> {
    KEY: string | symbol;
    asProvider(): {
        imports: [ReturnType<typeof ConfigModule.forFeature>];
        useFactory: (config: T) => T;
        inject: [string | symbol];
    };
}
/**
 * @publicApi
 *
 * Registers the configuration object behind a specified token.
 */
export declare function registerAs<TConfig extends ConfigObject, TFactory extends ConfigFactory = ConfigFactory<TConfig>>(token: string | symbol, configFactory: TFactory): TFactory & ConfigFactoryKeyHost<ReturnType<TFactory>>;
