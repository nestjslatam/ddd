export type DomainPrimitiveType = string | number | boolean | symbol;

export interface IDomainPrimitive<T extends DomainPrimitiveType | Date> {
  value: T;
}

export type DomainValueObjectProps<TDomainPrimitive> = TDomainPrimitive extends
  | DomainPrimitiveType
  | Date
  ? IDomainPrimitive<TDomainPrimitive>
  : TDomainPrimitive;
