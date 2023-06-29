import { DomainEntity } from '../domain-entity';
import { DomainGuard } from './domain-guard.helper';

const isEntity = (obj: unknown): obj is DomainEntity<unknown> => {
  return (
    Object.prototype.hasOwnProperty.call(obj, 'toObject') &&
    Object.prototype.hasOwnProperty.call(obj, 'id') &&
    Object.prototype.hasOwnProperty.call(obj, '_id') &&
    Object.prototype.hasOwnProperty.call(obj, '_trackingProps')
  );
};

const convertToPlainObject = (item: any): any => {
  if (!item) throw new Error('Item is required');

  if (DomainGuard.isValueObject(item)) {
    return item.unpack();
  }
  if (isEntity(item)) {
    return item.toObject();
  }
  return item;
};

export const convertPropsToObject = (props: any): any => {
  if (!props) throw new Error('Props is required');

  const propsCopy = { ...props };

  for (const prop in propsCopy) {
    if (Array.isArray(propsCopy[prop])) {
      propsCopy[prop] = (propsCopy[prop] as Array<unknown>).map((item) => {
        return convertToPlainObject(item);
      });
    }
    propsCopy[prop] = convertToPlainObject(propsCopy[prop]);
  }

  return propsCopy;
};
