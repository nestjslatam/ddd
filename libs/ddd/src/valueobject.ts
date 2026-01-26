import { BrokenRulesManager } from './broken-rules.manager';
import {
  AbstractNotifyPropertyChanged,
  AbstractRuleValidator,
  NotifyPropertyChangedContextArgs,
} from './core';
import { TrackingStateManager } from './tracking-state-manager';
import { ValidatorRuleManager } from './validator-rule.manager';

/**
 * Clase base para Objetos de Valor (Value Objects) en DDD.
 * Los objetos de valor se comparan por sus propiedades, no por un ID.
 */
export abstract class DddValueObject<
  TValue,
> extends AbstractNotifyPropertyChanged {
  // Members
  public readonly trackingState: TrackingStateManager;
  public readonly validatorRules: ValidatorRuleManager<
    AbstractRuleValidator<DddValueObject<TValue>>
  >;
  public readonly brokenRules: BrokenRulesManager;

  /**
   * Indica si el objeto de valor es válido (sin reglas rotas).
   */
  public get isValid(): boolean {
    return this.brokenRules.getBrokenRules().length === 0;
  }

  /**
   * Inicializa una nueva instancia de ValueObject.
   * @param value El valor interno del objeto.
   */
  protected constructor(value: TValue) {
    super();

    if (value === null || value === undefined) {
      throw new Error('ArgumentNullException: value cannot be null.');
    }

    // Inicialización de gestores (Equivalente al TODO de IoC en C#)
    this.brokenRules = new BrokenRulesManager();
    this.validatorRules = new ValidatorRuleManager<
      AbstractRuleValidator<DddValueObject<TValue>>
    >();
    this.trackingState = new TrackingStateManager();

    // Registro de la propiedad interna para observación de cambios
    // Mapeamos typeof a constructores para la validación de tipos
    const valueType = this.getTypeConstructor(typeof value, value);
    this.registerProperty(
      'internalValue',
      valueType,
      value,
      this.valuePropertyChanged.bind(this),
    );

    this.trackingState.markAsNew();

    this.addValidators();
    this.validate();
  }

  /**
   * Manejador que se dispara cuando el valor interno cambia.
   */
  private valuePropertyChanged(
    sender: AbstractNotifyPropertyChanged,
    e: NotifyPropertyChangedContextArgs,
  ): void {
    console.log('valuePropertyChanged', sender, e);
    this.trackingState.markAsDirty();
    this.validate();
  }

  /**
   * Cambia el valor del objeto y dispara la validación.
   */
  public setValue(value: TValue): void {
    if (value === null || value === undefined) {
      throw new Error('ArgumentNullException: value cannot be null.');
    }
    this.setValuePropertyChanged(value, 'internalValue');
  }

  /**
   * Obtiene el valor actual.
   */
  public getValue(): TValue {
    return this.getValuePropertyChanged('internalValue') as TValue;
  }

  // --- Business Rules ---

  /**
   * Permite a las clases derivadas añadir validadores específicos.
   */
  public addValidators(): void {
    // Implementar en clases hijas (ej: validación de formato de correo o resolución de video)
  }

  private validate(): void {
    // Limpia reglas previamente almacenadas
    this.brokenRules.clear();

    // Obtiene los validadores de reglas del objeto
    const validators = this.validatorRules.getValidators();

    // Ejecuta validaciones y agrega las reglas rotas a brokenRules
    if (validators && Array.isArray(validators)) {
      validators.forEach((validator) => {
        const brokenRule = validator.validate(this);
        if (brokenRule) {
          this.brokenRules.add(brokenRule);
        }
      });
    }
  }

  // --- Equality ---

  /**
   * Método abstracto que las clases hijas deben implementar para listar los componentes de igualdad.
   * Por ejemplo: return [this.street, this.city];
   */
  protected abstract getEqualityComponents(): Iterable<any>;

  /**
   * Mapea un tipo primitivo (string literal de typeof) a su constructor correspondiente.
   */
  private getTypeConstructor(typeString: string, value: any): any {
    const typeMap: Record<string, any> = {
      string: String,
      number: Number,
      boolean: Boolean,
      symbol: Symbol,
      bigint: BigInt,
    };

    // Si es un tipo primitivo conocido, retornamos su constructor
    if (typeString in typeMap) {
      return typeMap[typeString];
    }

    // Si el valor tiene un constructor, lo usamos
    if (value?.constructor) {
      return value.constructor;
    }

    // Por defecto, retornamos el tipo como está (puede ser una clase)
    return typeString;
  }

  /**
   * Compara este objeto con otro para determinar igualdad estructural.
   */
  public equals(obj: unknown): boolean {
    if (
      obj === null ||
      obj === undefined ||
      Object.getPrototypeOf(this) !== Object.getPrototypeOf(obj)
    ) {
      return false;
    }

    const other = obj as DddValueObject<TValue>;
    const thisComponents = Array.from(this.getEqualityComponents());
    const otherComponents = Array.from(other.getEqualityComponents());

    if (thisComponents.length !== otherComponents.length) return false;

    return thisComponents.every((val, index) => val === otherComponents[index]);
  }

  /**
   * Genera un HashCode basado en los componentes de igualdad.
   */
  public getHashCode(): number {
    const components = Array.from(this.getEqualityComponents());
    return components.reduce((hash, item) => {
      const itemHash = item ? JSON.stringify(item).length : 0; // Simplificación para TS
      return Math.trunc((hash << 5) - hash + itemHash);
    }, 0);
  }

  /**
   * Crea una copia superficial del objeto.
   */
  public getCopy(): DddValueObject<TValue> {
    return Object.assign(Object.create(Object.getPrototypeOf(this)), this);
  }

  public clone(): object {
    return this.getCopy();
  }
}
