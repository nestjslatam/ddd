import { BrokenRule } from "./broken-rule";

interface IBrokenRulesManager {
  getBrokenRules(): ReadonlyArray<BrokenRule>;
}

/**
 * Representa una colección de reglas rotas.
 * Traducido de BrokenRulesManager.cs
 */
export class BrokenRulesManager implements IBrokenRulesManager {
  private _brokenRules: BrokenRule[] = [];

  /**
   * Agrega una regla rota a la colección si no existe una idéntica.
   * Realiza una comparación insensible a mayúsculas/minúsculas.
   */
  public add(brokenRule: BrokenRule): void {
    if (!brokenRule) {
      throw new Error("ArgumentNullException: brokenRule cannot be null");
    }

    // Lógica de existencia: compara Propiedad y Mensaje ignorando mayúsculas
    const exists = this._brokenRules.some(
      (x) =>
        x.property.toLowerCase() === brokenRule.property.toLowerCase() &&
        x.message.toLowerCase() === brokenRule.message.toLowerCase()
    );

    if (!exists) {
      this._brokenRules.push(brokenRule);
    }
  }

  /**
   * Agrega una colección de reglas rotas.
   */
  public addRange(brokenRules: ReadonlyArray<BrokenRule>): void {
    if (!brokenRules) {
      throw new Error("ArgumentNullException: brokenRules cannot be null");
    }

    brokenRules.forEach((rule) => this.add(rule));
  }

  /**
   * Elimina una regla rota de la colección.
   */
  public remove(brokenRule: BrokenRule): void {
    if (!brokenRule) {
      throw new Error("ArgumentNullException: brokenRule cannot be null");
    }

    const index = this._brokenRules.indexOf(brokenRule);
    if (index !== -1) {
      this._brokenRules.splice(index, 1);
    }
  }

  /**
   * Limpia todas las reglas rotas de la colección.
   */
  public clear(): void {
    this._brokenRules = [];
  }

  /**
   * Obtiene la colección de solo lectura de reglas rotas.
   */
  public getBrokenRules(): ReadonlyArray<BrokenRule> {
    return Object.freeze([...this._brokenRules]);
  }

  /**
   * Devuelve las reglas rotas formateadas como un string, simulando el StringBuilder.
   */
  public getBrokenRulesAsString(): string {
    if (this._brokenRules.length === 0) {
      return "";
    }
    // Usamos map y join para emular el comportamiento de StringBuilder.AppendLine
    return this._brokenRules
      .map((rule) => `Property: ${rule.property}, Message: ${rule.message}`)
      .join("\n");
  }

  private static readonly BrokenRulesPropertyName = "brokenRules";
  
  /**
   * Obtiene las reglas rotas de las propiedades de una instancia.
   * En TS, usamos un array de claves (keyof T) en lugar de PropertyInfo[].
   */
  public static getPropertiesBrokenRules<T extends object>(
    instance: T,
    properties: Array<keyof T>
  ): ReadonlyArray<BrokenRule> {
    
    if (instance === null || instance === undefined) {
      throw new Error("ArgumentNullException: la instancia no puede ser nula.");
    }

    if (!properties) {
      throw new Error("ArgumentNullException: las propiedades no pueden ser nulas.");
    }

    const result: BrokenRule[] = [];

    for (const key of properties) {
      const valueObject = instance[key];

      if (valueObject === null || valueObject === undefined) {
        continue;
      }

      // Intentamos acceder a 'brokenRules' dinámicamente.
      // Similar al GetProperty() de C#.
      const brokenRulesManager = (valueObject as any)[this.BrokenRulesPropertyName] as IBrokenRulesManager;

      // Verificamos si existe el manejador y si tiene el método de obtención.
      if (brokenRulesManager && typeof brokenRulesManager.getBrokenRules === 'function') {
        const brokenRules = brokenRulesManager.getBrokenRules();
        
        if (brokenRules.length > 0) {
          result.push(...brokenRules);
        }
      }
    }

    // Retornamos una versión inmutable para proteger el estado.
    return Object.freeze(result);
  }
  
}