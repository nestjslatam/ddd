import { v4 as uuidv4, validate as validateUuid } from 'uuid';
import { ValueObject } from '../ddd-valueobject';

/**
 * Representa un identificador único de dominio (UUID).
 * Compatible con DomainUid de versiones anteriores.
 */
export class DomainUid extends ValueObject<string> {
  /**
   * Constructor protegido.
   */
  protected constructor(value: string) {
    super(value);
  }

  /**
   * Crea una nueva instancia de DomainUid con un identificador específico.
   * @param value El valor UUID del identificador.
   */
  public static create(value: string): DomainUid {
    if (value === null || value === undefined) {
      throw new Error('ArgumentNullException: El valor no puede ser nulo.');
    }

    if (!validateUuid(value)) {
      throw new Error(
        'ArgumentException: La cadena proporcionada no es un UUID válido.',
      );
    }

    return new DomainUid(value);
  }

  /**
   * Crea una nueva instancia de DomainUid con un identificador generado aleatoriamente.
   */
  public static createNew(): DomainUid {
    return new DomainUid(uuidv4());
  }

  /**
   * Retorna los componentes utilizados para determinar la igualdad.
   */
  protected getEqualityComponents(): Iterable<any> {
    return [this.getValue()];
  }

  /**
   * Obtiene el valor del identificador (alias de getValue para compatibilidad).
   */
  public unpack(): string {
    return this.getValue();
  }
}
