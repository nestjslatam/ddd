import { DomainInvalidArgumentException } from '../exceptions';
import {
  DomainValueObjectProps,
  IDomainPrimitive,
  DomainPrimitiveType,
} from '../interfaces';
import { DomainGuard, convertPropsToObject } from '../helpers';

export abstract class DomainValueObject<T> {
  protected readonly props: DomainValueObjectProps<T>;

  protected abstract validate(props: DomainValueObjectProps<T>): void;

  constructor(props: DomainValueObjectProps<T>) {
    this.checkIfEmpty(props);
    this.validate(props);
    this.props = props;
  }

  public equals(object?: DomainValueObject<T>): boolean {
    if (object === null || object === undefined) return false;

    return JSON.stringify(this) === JSON.stringify(object);
  }

  public unpack(): T {
    if (this.isDomainPrimitive(this.props)) {
      return this.props.value;
    }

    const propsCopy = convertPropsToObject(this.props);

    return Object.freeze(propsCopy);
  }

  private checkIfEmpty(props: DomainValueObjectProps<T>): void {
    if (
      DomainGuard.isEmpty(props) ||
      (this.isDomainPrimitive(props) && DomainGuard.isEmpty(props.value))
    ) {
      throw new DomainInvalidArgumentException('Properties cannot be empty');
    }
  }

  private isDomainPrimitive(
    obj: unknown
  ): obj is IDomainPrimitive<T & (DomainPrimitiveType | Date)> {
    if (!obj) throw new DomainInvalidArgumentException('Object cannot be null');

    return Object.prototype.hasOwnProperty.call(obj, 'value') ? true : false;
  }
}
