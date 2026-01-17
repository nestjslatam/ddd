import { BrokenRule } from './broken-rule';
import { IRuleValidator, RuleContext } from './Interfaces';

/**
 * Representa una colección de reglas de validación para un tipo específico.
 *
 */
export class ValidatorRuleManager<TValidator extends IRuleValidator> {
  // Inicializamos la lista de reglas de negocio
  private readonly _businessRules: TValidator[] = [];

  /**
   * Agrega una regla a la colección si no existe ya una del mismo tipo.
   */
  public add(rule: TValidator): void {
    if (!rule) {
      throw new Error('ArgumentNullException: rule cannot be null'); //
    }

    // Comprobamos si ya existe una regla del mismo tipo de clase
    const exists = this._businessRules.some(
      (x) => x.constructor === rule.constructor,
    );

    if (!exists) {
      this._businessRules.push(rule); //
    }
  }

  /**
   * Agrega una colección de reglas.
   */
  public addRange(rules: TValidator[]): void {
    if (!rules) {
      throw new Error('ArgumentNullException: rules cannot be null'); //
    }

    rules.forEach((rule) => this.add(rule)); //
  }

  /**
   * Elimina una regla específica de la colección.
   */
  public remove(rule: TValidator): void {
    if (!rule) {
      throw new Error('ArgumentNullException: rule cannot be null'); //
    }

    const index = this._businessRules.indexOf(rule); //
    if (index !== -1) {
      this._businessRules.splice(index, 1); //
    }
  }

  /**
   * Limpia todas las reglas de la colección.
   */
  public clear(): void {
    if (this._businessRules.length > 0) {
      this._businessRules.length = 0; //
    }
  }

  /**
   * Obtiene una colección de solo lectura de los validadores.
   */
  public getValidators(): ReadonlyArray<TValidator> {
    return Object.freeze([...this._businessRules]); //
  }

  /**
   * Ejecuta todos los validadores y consolida las reglas rotas sin duplicados.
   */
  public getBrokenRules(): ReadonlyArray<BrokenRule> {
    const result: BrokenRule[] = []; //

    for (const rule of this._businessRules) {
      // Ejecutamos la validación de la regla individual
      const brokenRules = rule.validate(); //

      if (brokenRules && brokenRules.length > 0) {
        for (const brokenRule of brokenRules) {
          // Normalización para comparación (Trim + UpperCase) como en C#
          const isDuplicate = result.some(
            (x) =>
              x.property.trim().toUpperCase() ===
                brokenRule.property.trim().toUpperCase() &&
              x.message.trim().toUpperCase() ===
                brokenRule.message.trim().toUpperCase(),
          );

          if (!isDuplicate) {
            result.push(brokenRule); //
          }
        }
      }
    }

    return Object.freeze(result); //
  }
}
