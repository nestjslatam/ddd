/**
 * Representa una regla de negocio o validación que no se ha cumplido.
 */
export class BrokenRule {
  /**
   * En TypeScript, al añadir el modificador 'public readonly', 
   * el compilador hace tres cosas automáticamente:
   * 1. Declara la propiedad en la clase.
   * 2. Recibe el valor en el constructor.
   * 3. Asigna el valor a la propiedad (this.property = property).
   */
  constructor(
    public readonly property: string,
    public readonly message: string,
    public readonly severity: 'Error' | 'Warning'
  ) {
    this.property = property;
    this.message = message;
    this.severity = severity;
  }
}