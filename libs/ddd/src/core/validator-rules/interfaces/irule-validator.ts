import { BrokenRule } from '../../business-rules';
/**
 * Representa un constructor de clase para los descriptores.
 * Equivale a 'Type' en C#.
 */
export type ClassType<T = any> = new (...args: any[]) => T;

/**
 * Interfaz para validadores de reglas.
 */
export interface IRuleValidator {
  /**
   * Obtiene el descriptor (la clase) del validador asociado.
   * En TS devolvemos el constructor de la clase.
   */
  getValidatorDescriptor(): ClassType;

  /**
   * Obtiene el descriptor (la clase) del sujeto a validar.
   */
  getSubjectDescriptor(): ClassType;

  /**
   * Valida la regla contra el contexto especificado.
   * Devuelve un array de solo lectura (ReadonlyArray) de reglas rotas.
   */
  validate(): ReadonlyArray<BrokenRule>;
}
