import 'reflect-metadata';

import { DDD_SAGA_METADATA } from './domain-constants';

export const DomainSaga = (): PropertyDecorator => {
  return (target: object, propertyKey: string | symbol) => {
    const properties =
      Reflect.getMetadata(DDD_SAGA_METADATA, target.constructor) || [];
    Reflect.defineMetadata(
      DDD_SAGA_METADATA,
      [...properties, propertyKey],
      target.constructor,
    );
  };
};
