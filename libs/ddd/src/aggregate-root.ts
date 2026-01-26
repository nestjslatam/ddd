import { AggregateRoot } from '@nestjs/cqrs';
import { BrokenRulesManager } from './broken-rules.manager';
import { AbstractRuleValidator, TrackingProps } from './core';
import { TrackingStateManager } from './tracking-state-manager';
import { ValidatorRuleManager } from './validator-rule.manager';
import { IdValueObject } from './valueobjects';

export abstract class DddAggregateRoot<TEntity, TProps> extends AggregateRoot {
  private _props: TProps;
  private _version: number;
  private readonly _trackingStateManager: TrackingStateManager;
  private readonly _brokenRulesManager: BrokenRulesManager;
  private readonly _validatorRuleManager: ValidatorRuleManager<
    AbstractRuleValidator<TEntity>
  >;

  private _id!: IdValueObject;

  public get Id(): IdValueObject {
    return this._id;
  }

  public set Id(value: IdValueObject) {
    this._id = value;
  }

  public get Props(): TProps {
    return this._props;
  }

  public set Props(value: TProps) {
    this._props = value;
  }

  public get Version(): number {
    return this._version;
  }

  public set Version(value: number) {
    this._version = value;
  }

  public get BrokenRules(): BrokenRulesManager {
    return this._brokenRulesManager;
  }

  public get TrackingState(): TrackingStateManager {
    return this._trackingStateManager;
  }

  public get Validators(): ValidatorRuleManager<
    AbstractRuleValidator<TEntity>
  > {
    return this._validatorRuleManager;
  }

  public get PropsCopy(): Readonly<
    TProps & { id: IdValueObject; props: TProps; trackingState: TrackingProps }
  > {
    return Object.freeze({
      props: this._props,
      id: this.Id,
      trackingState: this.TrackingState.trackingProps,
    } as Readonly<
      TProps & {
        id: IdValueObject;
        props: TProps;
        trackingState: TrackingProps;
      }
    >);
  }

  public isValid(): boolean {
    return this._brokenRulesManager.getBrokenRules().length === 0;
  }

  constructor(props: TProps) {
    super();
    this._trackingStateManager = new TrackingStateManager();
    this._brokenRulesManager = new BrokenRulesManager();

    // Tipamos correctamente el manager con la clase abstracta de validadores
    this._validatorRuleManager = new ValidatorRuleManager<
      AbstractRuleValidator<TEntity>
    >();

    // Asignación inicial de identidad
    this.Id = IdValueObject.create();
    this._props = props;

    // Ejecutamos validaciones iniciales
    this.validate();

    // Marcamos como nuevo después de la creación
    this._trackingStateManager.markAsNew();
  }

  public validate(): void {
    // 1. Validaciones de integridad técnica (Guards)
    this.Guard();

    // 2. Registro de reglas de negocio
    this.AddValidators();

    // 3. Ejecución de validadores y actualización de estado
    const entityBrokenRules = this._validatorRuleManager.getBrokenRules();

    if (entityBrokenRules.length > 0) {
      this.BrokenRules.addRange(entityBrokenRules);
      this._trackingStateManager.markAsDirty();
    }

    const propBrokenRules = BrokenRulesManager.getPropertiesBrokenRules(
      this,
      Object.getOwnPropertyNames(Object.getPrototypeOf(this)) as (keyof this)[],
    );

    if (propBrokenRules.length > 0) {
      this.BrokenRules.addRange(propBrokenRules);
      this._trackingStateManager.markAsDirty();
    }
  }

  protected Guard(): void {
    // Implementar la lógica de guardia aquí
  }

  protected AddValidators(): void {
    // Implementar la lógica de agregación de validadores aquí
  }

  /**
   * Determina si la instancia actual es igual a otro objeto.
   */
  public equals(obj: unknown): boolean {
    if (obj === null || obj === undefined) {
      return false;
    }

    // Comprobamos si el objeto es una instancia de la clase base Entity
    // (Nota: En TS la comprobación de tipos genéricos en runtime es limitada,
    // por lo que usamos el prototipo).
    if (!(obj instanceof DddAggregateRoot)) {
      return false;
    }

    // ReferenceEquals(this, obj)
    if (this === obj) {
      return true;
    }

    // GetType() != obj.GetType()
    if (Object.getPrototypeOf(this) !== Object.getPrototypeOf(obj)) {
      return false;
    }

    return this.referenceEntityPropertiesEquals(obj);
  }

  /**
   * Comparación basada en la propiedad 'Id'.
   * Para soportar ValueObjects y primitivos dentro de la entidad,
   * la Entidad DEBE delegar su igualdad al ID. Los ValueObjects internos se validan
   * por separado en la lógica de negocio.
   */
  private referenceEntityPropertiesEquals(
    obj: DddAggregateRoot<TEntity, TProps>,
  ): boolean {
    const thisId = this.Id;
    const otherId = obj.Id;

    if (
      thisId === null ||
      thisId === undefined ||
      otherId === null ||
      otherId === undefined
    ) {
      return false;
    }

    // Si el ID es un ValueObject (como DomainUid), usamos su propio método equals.
    // Si es un primitivo (string/number), usamos comparación estricta.
    if (typeof thisId.equals === 'function') {
      return thisId.equals(otherId);
    }

    return thisId === otherId;
  }

  /**
   * En JS/TS no hay un GetHashCode() nativo del sistema como en .NET,
   * pero podemos generar uno basado en el ID para colecciones.
   */
  public getHashCode(): number {
    const idString = JSON.stringify(this.Id);
    let hash = 0;
    let i = 0;
    while (i < idString.length) {
      const codePoint = idString.codePointAt(i) ?? 0;
      hash = Math.trunc((hash << 5) - hash + codePoint);
      // Si es un surrogate pair, avanzamos 2 posiciones, sino 1
      i += codePoint > 0xffff ? 2 : 1;
    }
    return hash;
  }

  /**
   * Emulación de operadores == y != mediante métodos estáticos.
   */
  public static areEqual<T, P>(
    left: DddAggregateRoot<T, P> | null,
    right: DddAggregateRoot<T, P> | null,
  ): boolean {
    if (left === null || left === undefined) {
      return right === null || right === undefined;
    }
    return left.equals(right);
  }

  public static areNotEqual<T, P>(
    left: DddAggregateRoot<T, P> | null,
    right: DddAggregateRoot<T, P> | null,
  ): boolean {
    return !this.areEqual(left, right);
  }

  /**
   * Convierte la entidad a un objeto plano.
   * @returns Un objeto con las propiedades de la entidad.
   */
  public toObject(): Record<string, any> {
    return {
      id: this.Id,
      ...this._props,
      trackingState: this.TrackingState,
      brokenRules: this.BrokenRules,
      isValid: this.isValid,
    };
  }

  // Map es el equivalente directo a Dictionary en C#
  private readonly _validTransitions: Map<object, object[]> = new Map();

  /**
   * Define el mapa de transiciones permitidas.
   * @param transitions Diccionario de estado origen y sus posibles estados destino.
   */
  protected defineValidTransitions(transitions: Map<object, object[]>): void {
    if (!transitions) {
      throw new Error('ArgumentNullException: transitions cannot be null');
    }

    this._validTransitions.clear();

    // Copiamos las transiciones al mapa interno
    transitions.forEach((value, key) => {
      this._validTransitions.set(key, [...value]);
    });
  }

  /**
   * Verifica si es legal pasar del estado actual al nuevo estado.
   */
  protected canTransitionTo(currentState: object, newState: object): boolean {
    if (!this._validTransitions.has(currentState)) {
      const stateName = (currentState as any).constructor?.name || 'Unknown';
      throw new Error(
        `InvalidOperationException: No transitions defined for state ${stateName}.`,
      );
    }

    const possibleTransitions = this._validTransitions.get(currentState);

    // Verificamos si el nuevo estado está incluido en la lista de permitidos
    return possibleTransitions ? possibleTransitions.includes(newState) : false;
  }
}
