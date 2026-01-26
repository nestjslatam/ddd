import { v4 as uuidv4, validate as validateUuid } from 'uuid';
import { DddValueObject } from '../valueobject';


/**
 * Objeto de valor que representa un identificador único basado en GUID/UUID.
 * Proporciona métodos estáticos para creación y carga segura.
 */
export class IdValueObject extends DddValueObject<string> {
  /**
   * Inicializa una nueva instancia con un valor de identificador específico.
   * El constructor es protegido para forzar el uso de métodos de factoría (Create/Load).
   * @param value El valor UUID del identificador.
   */
  protected constructor(value: string) {
    super(value);
  }

  /**
   * Crea una nueva instancia de IdValueObject con un identificador generado aleatoriamente.
   * Equivale a Guid.NewGuid() en C#.
   */
  public static create(): IdValueObject {
    return new IdValueObject(uuidv4());
  }

  /**
   * Crea una instancia a partir de una representación de cadena.
   * @param value Representación en cadena del identificador.
   * @exception Error Si el valor es nulo o no es un UUID válido.
   */
  public static loadFromString(value: string): IdValueObject {
    if (value === null || value === undefined) {
      throw new Error('ArgumentNullException: El valor no puede ser nulo.');
    }

    if (!validateUuid(value)) {
      throw new Error(
        'ArgumentException: La cadena proporcionada no es un UUID válido.',
      );
    }

    return new IdValueObject(value);
  }

  /**
   * Carga un valor existente. En TS, tanto string como GUID se manejan como string.
   */
  public static load(value: string): IdValueObject {
    if (!value) {
      throw new Error('ArgumentNullException: El valor no puede ser nulo.');
    }
    return new IdValueObject(value);
  }

  /**
   * Retorna los componentes utilizados para determinar la igualdad.
   * En este caso, el valor único del identificador.
   */
  protected getEqualityComponents(): Iterable<any> {
    return [this.getValue()];
  }

  /**
   * Obtiene el valor por defecto (UUID vacío/ceros).
   */
  public static get defaultValue(): IdValueObject {
    return new IdValueObject('00000000-0000-0000-0000-000000000000');
  }
}
