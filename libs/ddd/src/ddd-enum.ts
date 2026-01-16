/**
 * Clase base para Enumeraciones de Dominio.
 * Proporciona una alternativa robusta a los 'enums' tradicionales, permitiendo
 * añadir comportamiento y lógica de negocio.
 */
export abstract class DomainEnum {
  /**
   * Inicializa una nueva instancia de DomainEnumeration.
   * @param id Identificador numérico de la opción.
   * @param name Nombre descriptivo de la opción.
   */
  protected constructor(
    public readonly id: number,
    public readonly name: string,
  ) {}

  /**
   * Retorna el nombre de la enumeración.
   */
  public toString(): string {
    return this.name;
  }

  /**
   * Obtiene todos los valores definidos como propiedades estáticas en la clase hija.
   * Equivale al GetAll<T>() con Reflexión de C#.
   */
  public static getAll<T extends DomainEnum>(this: any): T[] {
    return Object.getOwnPropertyNames(this)
      .map((name) => this[name])
      .filter((value) => value instanceof this);
  }

  /**
   * Determina si la instancia actual es igual a otra.
   */
  public equals(other: unknown): boolean {
    if (!(other instanceof DomainEnum)) {
      return false;
    }

    const typeMatches =
      Object.getPrototypeOf(this) === Object.getPrototypeOf(other);
    const valueMatches = this.id === other.id;

    return typeMatches && valueMatches;
  }

  /**
   * Calcula la diferencia absoluta entre dos valores de enumeración.
   */
  public static absoluteDifference(
    firstValue: DomainEnum,
    secondValue: DomainEnum,
  ): number {
    if (!firstValue || !secondValue) {
      throw new Error('ArgumentNullException: values cannot be null.');
    }
    return Math.abs(firstValue.id - secondValue.id);
  }

  /**
   * Recupera el valor de enumeración a partir de su ID.
   */
  public static fromValue<T extends DomainEnum>(
    this: any,
    value: number,
  ): T | undefined {
    const allItems = this.getAll() as T[];
    return allItems.find((item) => item.id === value);
  }

  /**
   * Recupera el valor de enumeración a partir de su nombre.
   */
  public static fromDisplayName<T extends DomainEnum>(
    this: any,
    displayName: string,
  ): T | undefined {
    const allItems = this.getAll() as T[];
    return allItems.find((item) => item.name === displayName);
  }

  /**
   * Comparación para ordenamiento (IComparable).
   */
  public compareTo(other: DomainEnum): number {
    return this.id - other.id;
  }

  // Ayudantes de comparación similares a los operadores sobrecargados de C#
  public static areEqual(
    left: DomainEnum | null,
    right: DomainEnum | null,
  ): boolean {
    if (left === null || left === undefined)
      return right === null || right === undefined;
    return left.equals(right);
  }
}
