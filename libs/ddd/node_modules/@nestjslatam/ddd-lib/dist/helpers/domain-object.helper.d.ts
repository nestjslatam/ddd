import { InstanceWrapper } from '@nestjs/core/injector/instance-wrapper';
import { Module } from '@nestjs/core/injector/module';
import { DddAggregateRoot } from '../aggregate-root';
import { IDddPrimitive, Primitives } from '../core';
import { Type } from '../types';
export declare class DddObjectHelper {
    static isEntity(obj: unknown): obj is DddAggregateRoot<any, any>;
    static convertToPlainObject(item: any): any;
    static isDomainEntity(entity: unknown): entity is DddAggregateRoot<any, any>;
    static isDomainPrimitive<T>(obj: unknown): obj is IDddPrimitive<T & (Primitives | Date)>;
    static convertPropsToObject(props: any): any;
    static flatMap<T>(options: {
        modules: Module[];
        callback: (instance: InstanceWrapper) => Type<any> | undefined;
    }): Type<T>[];
    static filterProvider(wrapper: InstanceWrapper, metadataKey: string): Type<any> | undefined;
    static extractMetadata(instance: Record<string, any>, metadataKey: string): Type<any>;
    static getEventName(event: any): string;
}
//# sourceMappingURL=domain-object.helper.d.ts.map