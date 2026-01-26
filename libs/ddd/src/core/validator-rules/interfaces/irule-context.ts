/**
 * Define el contexto en el que se ejecuta la validación.
 */

export interface IRuleContext {
  target: any;
  metadata?: Record<string, any>;
}
