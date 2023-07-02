import 'reflect-metadata';
import { DOMAIN_SAGA_METADATA } from './constants';

export const Saga = (): PropertyDecorator => {
  return (target: object, propertyKey: string | symbol) => {
    const properties =
      Reflect.getMetadata(DOMAIN_SAGA_METADATA, target.constructor) || [];
    Reflect.defineMetadata(
      DOMAIN_SAGA_METADATA,
      [...properties, propertyKey],
      target.constructor,
    );
  };
};
