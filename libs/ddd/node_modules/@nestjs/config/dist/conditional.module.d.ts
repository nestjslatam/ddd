import { DynamicModule, ModuleMetadata } from '@nestjs/common';
/**
 * @publicApi
 */
export declare class ConditionalModule {
    /**
     * @publicApi
     */
    static registerWhen(module: Required<ModuleMetadata>['imports'][number], condition: string | ((env: NodeJS.ProcessEnv) => boolean), options?: {
        timeout?: number;
        debug?: boolean;
    }): Promise<Required<Pick<DynamicModule, "module" | "imports" | "exports">>>;
}
