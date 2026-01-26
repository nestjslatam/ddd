import { BrokenRule } from '../../business-rules';
import { ClassType, IRuleValidator } from '../interfaces';

/**
 * Clase base abstracta para validadores de reglas.
 * TSubject es el tipo del objeto que vamos a auditar.
 */
export abstract class AbstractRuleValidator<TSubject>
  implements IRuleValidator
{
  // Lista privada interna (equivalente a List<BrokenRule> brokenRules)
  private brokenRules: BrokenRule[] = [];

  /**
   * En TypeScript, 'readonly' en el constructor crea la propiedad automáticamente.
   */
  constructor(public readonly subject: TSubject) {}

  /**
   * Método abstracto que las clases hijas deben implementar para definir su lógica.
   */
  public abstract addRules(): void;

  /**
   * Ejecuta la validación.
   * Retorna un ReadonlyArray para asegurar la inmutabilidad de los resultados.
   */
  public validate(): ReadonlyArray<BrokenRule> {
    // Reiniciamos las reglas rotas antes de validar para evitar acumulación
    this.brokenRules = [];

    if (this.subject !== null && this.subject !== undefined) {
      this.addRules();
    }

    // Object.freeze o simplemente retornar como ReadonlyArray
    return this.brokenRules;
  }

  /**
   * Agrega una regla rota a la colección interna.
   */
  public addBrokenRule(propertyName: string, message: string): void {
    this.brokenRules.push({
      property: propertyName,
      message: message,
      severity: 'Error', // Asumiendo el valor por defecto de nuestra interfaz anterior
    });
  }

  /**
   * Obtiene el tipo del validador actual.
   */
  public getValidatorDescriptor(): ClassType {
    return this.constructor as ClassType;
  }

  /**
   * Obtiene el tipo del sujeto que se está validando.
   */
  public getSubjectDescriptor(): ClassType {
    if (!this.subject) {
      throw new Error('Subject is null or undefined.');
    }
    return (this.subject as any).constructor as ClassType;
  }
}
