/**
 * Smart Enum representing the lifecycle states of an Order.
 * Implements a state machine with valid transitions.
 */
export enum OrderStatus {
  /** Order is being created but not yet confirmed */
  DRAFT = 'DRAFT',

  /** Order has been confirmed and is awaiting payment/processing */
  CONFIRMED = 'CONFIRMED',

  /** Order is being prepared for shipment */
  PROCESSING = 'PROCESSING',

  /** Order has been shipped to customer */
  SHIPPED = 'SHIPPED',

  /** Order has been delivered to customer */
  DELIVERED = 'DELIVERED',

  /** Order has been cancelled */
  CANCELLED = 'CANCELLED',
}

/**
 * Defines valid state transitions for the Order lifecycle.
 * Ensures business rules are enforced at compile-time.
 */
export const OrderStatusTransitions = new Map<OrderStatus, OrderStatus[]>([
  [OrderStatus.DRAFT, [OrderStatus.CONFIRMED, OrderStatus.CANCELLED]],
  [OrderStatus.CONFIRMED, [OrderStatus.PROCESSING, OrderStatus.CANCELLED]],
  [OrderStatus.PROCESSING, [OrderStatus.SHIPPED, OrderStatus.CANCELLED]],
  [OrderStatus.SHIPPED, [OrderStatus.DELIVERED]],
  [OrderStatus.DELIVERED, []], // Terminal state
  [OrderStatus.CANCELLED, []], // Terminal state
]);

/**
 * Helper function to check if a status transition is valid.
 *
 * @param currentStatus Current order status
 * @param newStatus Desired new status
 * @returns true if transition is allowed
 */
export function canTransitionTo(
  currentStatus: OrderStatus,
  newStatus: OrderStatus,
): boolean {
  const allowedTransitions = OrderStatusTransitions.get(currentStatus) || [];
  return allowedTransitions.includes(newStatus);
}

/**
 * Gets the display name for an order status.
 *
 * @param status Order status
 * @returns Human-readable status name
 */
export function getStatusDisplayName(status: OrderStatus): string {
  const displayNames: Record<OrderStatus, string> = {
    [OrderStatus.DRAFT]: 'Borrador',
    [OrderStatus.CONFIRMED]: 'Confirmado',
    [OrderStatus.PROCESSING]: 'En Preparación',
    [OrderStatus.SHIPPED]: 'Enviado',
    [OrderStatus.DELIVERED]: 'Entregado',
    [OrderStatus.CANCELLED]: 'Cancelado',
  };
  return displayNames[status];
}
