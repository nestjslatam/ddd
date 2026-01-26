/**
 * Clase de utilidad que emula las extensiones de reflexión de C#.
 * Como experto en medios digitales, piensa en esto como el "escáner de metadatos"
 * que verifica si un formato de video es compatible con un codec específico.
 */
export class ReflectionTypeExtensions {
  /**
   * Determina si el tipo especificado es un "Value Type" (primitivo).
   * En JS: string, number, boolean, symbol, bigint.
   *
   */
  public static getIsValueType(type: any): boolean {
    if (!type) return false;

    // Si el tipo es una de las funciones constructoras nativas de primitivos
    const valueTypes = [String, Number, Boolean, Symbol, BigInt];

    return valueTypes.includes(type);
  }

  /**
   * Determina si el tipo especificado se puede asignar desde otro tipo.
   * Equivale a verificar si una clase hereda de otra o es la misma.
   *
   */
  public static getIsAssignableFrom(targetType: any, sourceType: any): boolean {
    if (!targetType || !sourceType) return false;

    // 1. Caso de igualdad directa (misma clase o mismo primitivo)
    if (targetType === sourceType) return true;

    // 2. Verificación de herencia (cadena de prototipos)
    // Equivale al IsAssignableFrom de C# para clases
    if (typeof sourceType === 'function' && typeof targetType === 'function') {
      return sourceType.prototype instanceof targetType;
    }

    return false;
  }
}
