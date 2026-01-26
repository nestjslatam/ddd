import { InstanceWrapper } from '@nestjs/core/injector/instance-wrapper';
import { Module } from '@nestjs/core/injector/module';
import { DddEntity } from '../entity';
import { IDddPrimitive, Primitives, ValueObjectValidator } from '../core';
import { Type } from '../types';



/**
 * Domain Object Helper
 *
 * @export
 * @class DomainObjectHelper
 */
export class DddObjectHelper {
  /**
   * Checks if the given object is a domain entity.
   *
   * @static
   * @param {*} obj The object to check.
   * @returns {obj is DddEntity<unknown>} True if the object is a domain entity, false otherwise.
   * @memberof DomainObjectHelper
   */
  static isEntity(obj: unknown): obj is DddEntity<any, any> {
    return obj instanceof DddEntity;
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

  static isDomainEntity(entity: unknown): entity is DddEntity<any, any> {
    return entity instanceof DddEntity;
  }

  static isDomainPrimitive<T>(
    obj: unknown,
  ): obj is IDddPrimitive<T & (Primitives | Date)> {
    if (!obj || typeof obj !== 'object') return false;

    return Object.hasOwn(obj, 'value');
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
    const items = modules.flatMap((module) =>
      [...module.providers.values()].map(callback),
    );
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

  static getEventName(event: any): string {
    const { constructor } = Object.getPrototypeOf(event);
    return constructor.name as string;
  }
}
