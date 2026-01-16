import { v4 } from 'uuid';
import { TrackingStateManager } from './ddd-managers';
import {
  AbstractRuleValidator,
  BrokenRule,
  BrokenRulesManager,
} from './ddd-rules';
import { ValidatorRuleManager } from './ddd-rules/validator-rule.manager';
import { DomainUid } from './ddd-valueobjects';
import { TrackingProps } from './ddd-core';

export abstract class DomainEntity<TEntity, TProps> {
  private readonly _props: TProps;
  private readonly _trackingStateManager: TrackingStateManager;
  private readonly _brokenRulesManager: BrokenRulesManager;
  private readonly _validatorRuleManager: ValidatorRuleManager<
    AbstractRuleValidator<TEntity>
  >;
  private _id!: DomainUid; // Usamos ! porque se asigna vía setter en el constructor

  constructor(props: TProps) {
    this._trackingStateManager = new TrackingStateManager();
    this._brokenRulesManager = new BrokenRulesManager();
    // Tipamos correctamente el manager con la clase abstracta de validadores
    this._validatorRuleManager = new ValidatorRuleManager<
      AbstractRuleValidator<TEntity>
    >();

    // Asignación inicial de identidad
    this.Id = DomainUid.create(v4());
    this._props = props;

    // Ejecutamos validaciones iniciales
    this.validate();

    // Marcamos como nuevo después de la creación
    this._trackingStateManager.markAsNew();
  }

  // --- Getters & Setters ---

  public get brokenRules(): ReadonlyArray<BrokenRule> {
    return this._brokenRulesManager.getBrokenRules();
  }

  protected set brokenRules(value: ReadonlyArray<BrokenRule>) {
    this._brokenRulesManager.clear();
    this._brokenRulesManager.addRange(value);

    if (value.length > 0) {
      this._trackingStateManager.markAsDirty();
    }
  }

  public get Id(): DomainUid {
    return this._id;
  }

  public set Id(value: DomainUid) {
    this._id = value;
  }

  public get trackingState(): TrackingProps {
    return this._trackingStateManager.trackingProps;
  }

  /**
   * Retorna una copia inmutable de las propiedades para proteger el estado.
   * Útil para cuando necesitas enviar datos a la interfaz de usuario.
   */
  public get propsCopy(): Readonly<
    TProps & { id: DomainUid; props: TProps; trackingState: TrackingProps }
  > {
    return Object.freeze({
      props: this._props,
      id: this.Id,
      trackingState: this.trackingState,
    } as Readonly<
      TProps & { id: DomainUid; props: TProps; trackingState: TrackingProps }
    >);
  }

  public get isValid(): boolean {
    return this._brokenRulesManager.getBrokenRules().length === 0;
  }

  // --- Métodos de Orquestación ---

  public validate(): void {
    // 1. Validaciones de integridad técnica (Guards)
    this.Guard();

    // 2. Registro de reglas de negocio
    this.AddValidators();

    // 3. Ejecución de validadores y actualización de estado
    const entityRules = this._validatorRuleManager.getBrokenRules();

    if (entityRules.length > 0) {
      this.brokenRules.concat(entityRules);
      this._trackingStateManager.markAsDirty();
    }

    const propRules = BrokenRulesManager.getPropertiesBrokenRules(
      this,
      Object.getOwnPropertyNames(Object.getPrototypeOf(this)) as (keyof this)[],
    );

    if (propRules.length > 0) {
      this.brokenRules.concat(propRules);
      this._trackingStateManager.markAsDirty();
    }
    this.brokenRules = [];
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
    if (!(obj instanceof DomainEntity)) {
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
    obj: DomainEntity<TEntity, TProps>,
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
    left: DomainEntity<T, P> | null,
    right: DomainEntity<T, P> | null,
  ): boolean {
    if (left === null || left === undefined) {
      return right === null || right === undefined;
    }
    return left.equals(right);
  }

  public static areNotEqual<T, P>(
    left: DomainEntity<T, P> | null,
    right: DomainEntity<T, P> | null,
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
      trackingState: this.trackingState,
      brokenRules: this.brokenRules,
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

  // --- UI Testing Only - Getters para facilitar las pruebas ---
  // Estos getters exponen el estado interno solo para propósitos de testing

  /**
   * @internal
   * UI Testing Only: Expone las props internas para testing.
   */
  public get _uiTestingProps(): TProps {
    return this._props;
  }

  /**
   * @internal
   * UI Testing Only: Expone el TrackingStateManager completo para testing.
   */
  public get _uiTestingTrackingState(): TrackingStateManager {
    return this._trackingStateManager;
  }

  /**
   * @internal
   * UI Testing Only: Expone el BrokenRulesManager para testing.
   */
  public get _uiTestingBrokenRulesManager(): BrokenRulesManager {
    return this._brokenRulesManager;
  }

  /**
   * @internal
   * UI Testing Only: Expone el ValidatorRuleManager para testing.
   */
  public get _uiTestingValidatorRuleManager(): ValidatorRuleManager<
    AbstractRuleValidator<TEntity>
  > {
    return this._validatorRuleManager;
  }

  /**
   * @internal
   * UI Testing Only: Expone el estado completo de la entidad para testing.
   */
  public get _uiTestingFullState(): {
    id: DomainUid;
    props: TProps;
    trackingState: TrackingProps;
    brokenRules: ReadonlyArray<BrokenRule>;
    isValid: boolean;
  } {
    return {
      id: this.Id,
      props: this._props,
      trackingState: this.trackingState,
      brokenRules: this.brokenRules,
      isValid: this.isValid,
    };
  }
}
