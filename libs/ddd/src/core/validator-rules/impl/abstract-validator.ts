/**
 * Validador abstracto base para validaciones de dominio.
 */
export abstract class AbstractValidator {
  /**
   * Valida el objeto proporcionado.
   * @param obj El objeto a validar.
   * @returns true si es válido, false en caso contrario.
   */
  abstract validate(obj: unknown): boolean;
}
