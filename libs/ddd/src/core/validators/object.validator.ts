import { DomainValueObject } from '@nestjslatam/ddd-lib';

export class ValueObjectGuard {
  static isInstanceOfValueObject(obj: any): boolean {
    if (obj === null || obj === undefined) return false;

    if (typeof obj === 'string' || typeof obj === 'boolean') return false;

    const canConvert = obj as DomainValueObject<unknown>;

    return !canConvert ? false : true;
  }
}
