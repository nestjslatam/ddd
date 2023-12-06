import { InstanceWrapper } from '@nestjs/core/injector/instance-wrapper';
import { Module } from '@nestjs/core/injector/module';

import { DomainEntity } from '../ddd-entity';
import { Type } from '../type.interface';
import { ValueObjectValidator } from '../ddd-validators';

export class DomainObjectHelper {
  static isEntity(obj: unknown): obj is DomainEntity<unknown> {
    return (
      Object.prototype.hasOwnProperty.call(obj, 'toObject') &&
      Object.prototype.hasOwnProperty.call(obj, 'id') &&
      Object.prototype.hasOwnProperty.call(obj, '_id') &&
      Object.prototype.hasOwnProperty.call(obj, '_trackingProps')
    );
  }

  static convertToPlainObject(item: any): any {
    if (!item) throw new Error('Item is required');

    if (ValueObjectValidator.isValueObject(item)) {
      return item.unpack();
    }
    if (this.isEntity(item)) {
      return item.toObject();
    }
    return item;
  }

  static convertPropsToObject(props: any): any {
    if (!props) throw new Error('Props is required');

    const propsCopy = { ...props };

    for (const prop in propsCopy) {
      if (Array.isArray(propsCopy[prop])) {
        propsCopy[prop] = (propsCopy[prop] as Array<unknown>).map((item) => {
          return this.convertToPlainObject(item);
        });
      }
      propsCopy[prop] = this.convertToPlainObject(propsCopy[prop]);
    }

    return propsCopy;
  }

  static flatMap<T>(
    modules: Module[],
    callback: (instance: InstanceWrapper) => Type<any> | undefined,
  ): Type<T>[] {
    const items = modules
      .map((module) => [...module.providers.values()].map(callback))
      .reduce((a, b) => a.concat(b), []);
    return items.filter((element) => !!element) as Type<T>[];
  }

  static filterProvider(
    wrapper: InstanceWrapper,
    metadataKey: string,
  ): Type<any> | undefined {
    const { instance } = wrapper;
    if (!instance) {
      return undefined;
    }
    return this.extractMetadata(instance, metadataKey);
  }

  static extractMetadata(
    instance: Record<string, any>,
    metadataKey: string,
  ): Type<any> {
    if (!instance.constructor) {
      return;
    }
    const metadata = Reflect.getMetadata(metadataKey, instance.constructor);
    return metadata ? (instance.constructor as Type<any>) : undefined;
  }
}
