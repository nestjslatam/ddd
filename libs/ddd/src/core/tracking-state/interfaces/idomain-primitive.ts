/**
 * Tipos primitivos de dominio.
 */
export type Primitives = string | number | boolean | Date;

/**
 * Interfaz para representar un valor primitivo de dominio.
 */
export interface IDddPrimitive<T> {
  value: T;
}
