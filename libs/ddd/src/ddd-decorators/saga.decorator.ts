import 'reflect-metadata';
import { DOMAIN_SAGA_METADATA } from './constants';

/**
 * Decorator used to mark a method as a Saga.
 * Sagas are long-running processes that coordinate and react to domain events.
 * This decorator adds the decorated method to the list of sagas for the target class.
 */
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
