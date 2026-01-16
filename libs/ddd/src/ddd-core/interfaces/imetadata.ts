/**
 * Interfaz para la gestión de metadatos de eventos de dominio.
 * Proporciona trazabilidad sobre qué evento ocurrió y a qué agregado pertenece.
 */
export interface IMetadata {
  /**
   * Identificador único del evento (UUID/Guid).
   */
  readonly eventId: string;

  /**
   * Nombre técnico del evento (ej: "VideoUploadedEvent").
   */
  readonly eventName: string;

  /**
   * Identificador único del Agregado que disparó el evento.
   */
  readonly aggregateId: string;

  /**
   * Nombre del Agregado (ej: "MusicVideo").
   */
  readonly aggregateName: string;

  /**
   * Establece los metadatos para el evento y el agregado.
   * Generalmente invocado por el DomainEventsManager antes de persistir.
   */
  setMetadata(
    eventId: string,
    eventName: string,
    aggregateId: string,
    aggregateName: string,
  ): void;
}
