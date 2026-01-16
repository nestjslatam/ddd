import { BrokenRule, IRuleValidator } from '../ddd-rules';

/**
 * Gestiona una colección de reglas de validación para asegurar la integridad del negocio.
 * Traducido de ValidatorRuleManager.cs
 */
export class ValidatorRuleManager<TValidator extends IRuleValidator> {
  private _businessRules: TValidator[] = [];

  /**
   * Añade una regla a la colección si no existe una del mismo tipo.
   */
  public add(rule: TValidator): void {
    if (!rule) {
      throw new Error('ArgumentNullException: rule cannot be null');
    }

    // Evitamos duplicar reglas del mismo tipo
    const exists = this._businessRules.some(
      (x) => x.constructor.name === rule.constructor.name,
    );

    if (!exists) {
      this._businessRules.push(rule);
    }
  }

  /**
   * Añade una colección de reglas.
   */
  public addRange(rules: Iterable<TValidator>): void {
    if (!rules) {
      throw new Error('ArgumentNullException: rules collection cannot be null');
    }

    for (const rule of rules) {
      this.add(rule);
    }
  }

  /**
   * Elimina una regla específica de la colección.
   */
  public remove(rule: TValidator): void {
    if (!rule) {
      throw new Error('ArgumentNullException: rule cannot be null');
    }

    const index = this._businessRules.indexOf(rule);
    if (index !== -1) {
      this._businessRules.splice(index, 1);
    }
  }

  /**
   * Limpia todas las reglas de validación.
   */
  public clear(): void {
    if (this._businessRules.length > 0) {
      this._businessRules = [];
    }
  }

  /**
   * Obtiene una colección inmutable de los validadores registrados.
   */
  public getValidators(): ReadonlyArray<TValidator> {
    return Object.freeze([...this._businessRules]);
  }

  /**
   * Ejecuta todas las reglas y consolida las reglas rotas sin duplicados.
   * @param context Contexto opcional para la validación.
   */
  public getBrokenRules(): ReadonlyArray<BrokenRule> {
    const result: BrokenRule[] = [];

    for (const rule of this._businessRules) {
      const brokenRules = rule.validate(null);

      if (brokenRules && brokenRules.length > 0) {
        for (const brokenRule of brokenRules) {
          // Normalizamos para comparar duplicados (Trim + UpperCase)
          const property = brokenRule.property.trim().toUpperCase();
          const message = brokenRule.message.trim().toUpperCase();

          const isDuplicate = result.some(
            (x) =>
              x.property.trim().toUpperCase() === property &&
              x.message.trim().toUpperCase() === message,
          );

          if (!isDuplicate) {
            result.push(brokenRule);
          }
        }
      }
    }

    return Object.freeze(result);
  }
}
