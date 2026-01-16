import { InstanceWrapper } from '@nestjs/core/injector/instance-wrapper';
import { Module } from '@nestjs/core/injector/module';

import { DomainEntity } from '../ddd-entity';
import { Type } from '../types';
import { IDomainPrimitive, Primitives } from '../ddd-core';
import { ValueObjectValidator } from '../ddd-validators';
import { IDomainEvent, IDomainEventHandler } from '../ddd-events';

/**
 * Domain Object Helper
 *
 * @export
 * @class DomainObjectHelper
 */
export class DomainObjectHelper {
  /**
   * Checks if the given object is a domain entity.
   *
   * @static
   * @param {*} obj The object to check.
   * @returns {obj is DomainEntity<unknown>} True if the object is a domain entity, false otherwise.
   * @memberof DomainObjectHelper
   */
  static isEntity(obj: unknown): obj is DomainEntity<any, any> {
    return obj instanceof DomainEntity;
  }

  /**
   * Checks if the given object is a domain value object.
   *
   * @static
   * @param {*} obj The object to check.
   * @returns {obj is DomainValueObject<unknown>} True if the object is a domain value object, false otherwise.
   * @memberof DomainObjectHelper
   */
  static convertToPlainObject(item: any): any {
    if (ValueObjectValidator.isValueObject(item)) {
      return item.getValue ? item.getValue() : (item as any).unpack?.() || item;
    }
    if (this.isEntity(item)) {
      return item.toObject();
    }
    return item;
  }

  static isDomainEntity(entity: unknown): entity is DomainEntity<any, any> {
    return entity instanceof DomainEntity;
  }

  static isDomainPrimitive<T>(
    obj: unknown,
  ): obj is IDomainPrimitive<T & (Primitives | Date)> {
    if (!obj) return false;

    return Object.prototype.hasOwnProperty.call(obj, 'value') ? true : false;
  }

  /**
   * Converts the given props to a plain object.
   *
   * @static
   * @param {*} props The props to convert.
   * @returns {*} The converted props.
   * @memberof DomainObjectHelper
   */
  static convertPropsToObject(props: any): any {
    if (!props) throw new Error('Props is required');

    const propsCopy = { ...props };

    for (const prop in propsCopy) {
      if (Array.isArray(propsCopy[prop])) {
        propsCopy[prop] = (propsCopy[prop] as Array<unknown>).map((item) => {
          return this.convertToPlainObject(item);
        });
      }

      if (propsCopy[prop]) {
        propsCopy[prop] = this.convertToPlainObject(propsCopy[prop]);
      }
    }

    return propsCopy;
  }

  /**
   * Checks if the given object is a domain value object.
   *
   * @static
   * @param {*} obj The object to check.
   * @returns {obj is DomainValueObject<unknown>} True if the object is a domain value object, false otherwise.
   * @memberof DomainObjectHelper
   */
  static flatMap<T>(options: {
    modules: Module[];
    callback: (instance: InstanceWrapper) => Type<any> | undefined;
  }): Type<T>[] {
    const { modules, callback } = options;
    const items = modules
      .map((module) => [...module.providers.values()].map(callback))
      .reduce((a, b) => a.concat(b), []);
    return items.filter((element) => !!element) as Type<T>[];
  }

  /**
   * Checks if the given object is a domain value object.
   *
   * @static
   * @param {*} obj The object to check.
   * @returns {obj is DomainValueObject<unknown>} True if the object is a domain value object, false otherwise.
   * @memberof DomainObjectHelper
   */
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

  /**
   * Checks if the given object is a domain value object.
   *
   * @static
   * @param {*} obj The object to check.
   * @returns {obj is DomainValueObject<unknown>} True if the object is a domain value object, false otherwise.
   * @memberof DomainObjectHelper
   */
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

  static getEventHandler<T extends IDomainEvent = IDomainEvent>(
    event: T,
  ): Type<IDomainEventHandler> | undefined {
    const handler = `on${this.getEventName(event)}`;
    return this[handler];
  }

  static getEventName(event: any): string {
    const { constructor } = Object.getPrototypeOf(event);
    return constructor.name as string;
  }
}
