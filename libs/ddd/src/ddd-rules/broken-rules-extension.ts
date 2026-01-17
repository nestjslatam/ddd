import { BrokenRule } from './broken-rule';

/**
 * Interface para representar el manejador de reglas rotas.
 * Equivale a BrokenRulesManager en C#.
 */
interface IBrokenRulesManager {
  getBrokenRules(): ReadonlyArray<BrokenRule>;
}

/**
 * Clase de utilidad para consolidar reglas rotas de múltiples propiedades.
 * Traducido de BrokenRulesExtension.cs
 */
export class BrokenRulesExtension {
  private static readonly BrokenRulesPropertyName = 'brokenRules';

  /**
   * Obtiene las reglas rotas de las propiedades de una instancia de entidad.
   * En TS, en lugar de PropertyInfo[], pasamos un array de keys del objeto.
   */
  public static getPropertiesBrokenRules<T extends object>(
    instance: T,
    properties: Array<keyof T>,
  ): ReadonlyArray<BrokenRule> {
    if (instance === null || instance === undefined) {
      throw new Error(
        'ArgumentNullException: instance cannot be null or undefined',
      );
    }

    if (!properties) {
      throw new Error('ArgumentNullException: properties cannot be null');
    }

    const result: BrokenRule[] = [];

    for (const key of properties) {
      const valueObject = instance[key];

      if (valueObject === null || valueObject === undefined) {
        continue;
      }

      // Intentamos obtener la propiedad 'brokenRules' del objeto (ValueObject)
      // Usamos 'any' para acceder dinámicamente, similar a GetProperty() en C#
      const brokenRulesManager = (valueObject as any)[
        this.BrokenRulesPropertyName
      ] as IBrokenRulesManager;

      // Verificamos si existe el manager y si tiene el método getBrokenRules
      if (
        brokenRulesManager &&
        typeof brokenRulesManager.getBrokenRules === 'function'
      ) {
        const brokenRules = brokenRulesManager.getBrokenRules();

        if (brokenRules.length > 0) {
          result.push(...brokenRules);
        }
      }
    }

    return Object.freeze(result);
  }
}
