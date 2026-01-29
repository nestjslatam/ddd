import { DddValueObject } from '../valueobject';
export declare class IdValueObject extends DddValueObject<string> {
  protected constructor(value: string);
  addValidators(): void;
  static create(): IdValueObject;
  static load(value: string): IdValueObject;
  static loadFromString(value: string): IdValueObject;
  protected getEqualityComponents(): Iterable<any>;
  static empty(): IdValueObject;
  static get defaultValue(): IdValueObject;
  isEmpty(): boolean;
  isDefault(): boolean;
  toString(): string;
  toJSON(): string;
}
//# sourceMappingURL=id.valueobject.d.ts.map
