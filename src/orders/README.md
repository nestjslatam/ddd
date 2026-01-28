# Orders API - CQRS Implementation

## Arquitectura Completa

Este módulo Orders está implementado siguiendo los patrones **DDD** (Domain-Driven Design) y **CQRS** (Command Query Responsibility Segregation) con soporte completo para:

- ✅ **Command Handlers** - Manejo de comandos con validación
- ✅ **Query Handlers** - Consultas optimizadas (CQRS Read Model)
- ✅ **Event Handlers** - Reacción a eventos de dominio
- ✅ **Sagas** - Orquestación de procesos complejos
- ✅ **Repository Pattern** - Persistencia en memoria (InMemory)
- ✅ **REST API** - Endpoints completos

## Estructura del Módulo

```
src/orders/
├── domain/                    # Capa de dominio
│   ├── order-aggregate/
│   │   ├── order.ts          # Agregado raíz
│   │   └── order-status.enum.ts
│   ├── entities/
│   │   └── order-item.entity.ts
│   ├── value-objects/
│   │   ├── customer-info.vo.ts
│   │   ├── shipping-address.vo.ts
│   │   └── money.vo.ts
│   └── events/
│       └── order.events.ts   # 9 eventos de dominio
│
├── application/              # Capa de aplicación (CQRS)
│   ├── use-cases/           # Commands
│   │   ├── create-order/
│   │   ├── add-item-to-order/
│   │   ├── remove-item-from-order/
│   │   ├── change-item-quantity/
│   │   ├── confirm-order/
│   │   ├── ship-order/
│   │   ├── deliver-order/
│   │   └── cancel-order/
│   ├── queries/             # Queries (Read Model)
│   │   ├── get-order/
│   │   └── get-orders/
│   ├── events/              # Event Handlers
│   │   ├── order-created.event-handler.ts
│   │   ├── order-confirmed.event-handler.ts
│   │   ├── order-item-added.event-handler.ts
│   │   ├── order-shipped.event-handler.ts
│   │   └── order-cancelled.event-handler.ts
│   └── sagas/               # Process Orchestration
│       └── order.saga.ts
│
├── infrastructure/          # Capa de infraestructura
│   └── repositories/
│       └── order.repository.ts  # In-Memory Repository
│
├── presentation/            # Capa de presentación
│   └── orders.controller.ts    # REST API
│
└── orders.module.ts         # NestJS Module
```

## API Endpoints

### 📝 Create Order

```http
POST /orders
Content-Type: application/json

{
  "customerName": "John Doe",
  "customerEmail": "john@example.com",
  "customerPhone": "+1234567890",
  "shippingStreet": "123 Main St",
  "shippingComplement": "Apt 4B",
  "shippingCity": "New York",
  "shippingState": "NY",
  "shippingZipCode": "10001",
  "shippingCountry": "USA",
  "currency": "USD"
}

Response: 201 Created
{
  "id": "uuid-v4"
}
```

### 📋 Get All Orders

```http
GET /orders?status=CONFIRMED&limit=10&offset=0

Response: 200 OK
[
  {
    "id": "uuid",
    "status": "CONFIRMED",
    "customerName": "John Doe",
    "customerEmail": "john@example.com",
    "items": [],
    "total": "0.00",
    "currency": "USD",
    "confirmedAt": "2026-01-28T...",
    "shippedAt": null,
    "deliveredAt": null
  }
]
```

### 🔍 Get Order by ID

```http
GET /orders/:id

Response: 200 OK
{
  "id": "uuid",
  "status": "DRAFT",
  "customerName": "John Doe",
  "customerEmail": "john@example.com",
  "items": [...],
  "total": "149.99",
  "currency": "USD"
}
```

### ➕ Add Item to Order

```http
POST /orders/:id/items
Content-Type: application/json

{
  "productId": "product-uuid",
  "productName": "Widget Pro",
  "quantity": 2,
  "unitPrice": 49.99
}

Response: 200 OK
```

### ➖ Remove Item from Order

```http
DELETE /orders/:id/items/:productId

Response: 204 No Content
```

### 🔄 Change Item Quantity

```http
PATCH /orders/:id/items/:productId
Content-Type: application/json

{
  "newQuantity": 5
}

Response: 200 OK
```

### ✅ Confirm Order

```http
POST /orders/:id/confirm

Response: 200 OK
```

### 📦 Ship Order

```http
POST /orders/:id/ship
Content-Type: application/json

{
  "trackingNumber": "TRACK123456" // opcional
}

Response: 200 OK
```

### 🚚 Deliver Order

```http
POST /orders/:id/deliver

Response: 200 OK
```

### ❌ Cancel Order

```http
POST /orders/:id/cancel
Content-Type: application/json

{
  "reason": "Customer requested cancellation"
}

Response: 200 OK
```

## Order State Machine

```
DRAFT → CONFIRMED → PROCESSING → SHIPPED → DELIVERED
  ↓                                           ↑
  └────────────────→ CANCELLED ←─────────────┘
```

### Estados válidos:

- **DRAFT**: Orden recién creada, se pueden agregar/quitar items
- **CONFIRMED**: Orden confirmada, lista para procesamiento
- **PROCESSING**: En preparación
- **SHIPPED**: Enviada al cliente
- **DELIVERED**: Entregada exitosamente
- **CANCELLED**: Cancelada (puede ocurrir desde cualquier estado anterior a DELIVERED)

## Domain Events

El agregado Order publica los siguientes eventos de dominio:

1. **OrderCreatedEvent** - Cuando se crea una orden
2. **OrderItemAddedEvent** - Cuando se agrega un item
3. **OrderItemRemovedEvent** - Cuando se remueve un item
4. **OrderItemQuantityChangedEvent** - Cuando cambia cantidad
5. **OrderConfirmedEvent** - Cuando se confirma la orden
6. **OrderStatusChangedEvent** - Cambio de estado general
7. **OrderShippedEvent** - Cuando se envía
8. **OrderDeliveredEvent** - Cuando se entrega
9. **OrderCancelledEvent** - Cuando se cancela

## Event Handlers

Los Event Handlers reaccionan a estos eventos para:

- Logging y auditoría
- Notificaciones a clientes
- Actualización de proyecciones de lectura
- Integración con sistemas externos

## Sagas

Las Sagas orquestan procesos complejos:

1. **orderCreated** → Envía email de bienvenida
2. **orderConfirmed** → Inicia proceso de preparación
3. **orderShipped** → Notifica al cliente con tracking

## Repository Pattern

El `OrderRepository` implementa:

- `save(order)` - Guardar orden
- `findById(id)` - Buscar por ID
- `findAll()` - Listar todas
- `delete(id)` - Eliminar
- `exists(id)` - Verificar existencia

**Nota**: Actualmente usa almacenamiento en memoria. Para producción, implementar con base de datos (TypeORM, Prisma, etc.)

## Testing

Probar la API:

```bash
# Crear orden
curl -X POST http://localhost:3000/orders \
  -H "Content-Type: application/json" \
  -d '{
    "customerName": "Test User",
    "customerEmail": "test@example.com",
    "customerPhone": "+1234567890",
    "shippingStreet": "123 Test St",
    "shippingCity": "Test City",
    "shippingState": "TS",
    "shippingZipCode": "12345",
    "shippingCountry": "Test Country"
  }'

# Agregar item
curl -X POST http://localhost:3000/orders/{orderId}/items \
  -H "Content-Type: application/json" \
  -d '{
    "productId": "product-123",
    "productName": "Test Product",
    "quantity": 2,
    "unitPrice": 29.99
  }'

# Confirmar orden
curl -X POST http://localhost:3000/orders/{orderId}/confirm

# Obtener orden
curl http://localhost:3000/orders/{orderId}

# Listar todas las órdenes
curl http://localhost:3000/orders

# Enviar orden
curl -X POST http://localhost:3000/orders/{orderId}/ship \
  -H "Content-Type: application/json" \
  -d '{"trackingNumber": "TRACK123"}'
```

## Flujo Completo de Ejemplo

```typescript
// 1. Crear orden
POST /orders → { id: "order-123" }

// 2. Agregar items
POST /orders/order-123/items (Widget, 2x, $49.99)
POST /orders/order-123/items (Gadget, 1x, $99.99)

// 3. Confirmar orden
POST /orders/order-123/confirm

// 4. Enviar orden
POST /orders/order-123/ship {"trackingNumber": "TRACK123"}

// 5. Entregar orden
POST /orders/order-123/deliver

// Eventos publicados:
// → OrderCreatedEvent
// → OrderItemAddedEvent (x2)
// → OrderConfirmedEvent
// → OrderShippedEvent
// → OrderDeliveredEvent

// Sagas ejecutadas:
// → Email de bienvenida
// → Notificación de confirmación
// → Tracking enviado al cliente
```

## Próximos Pasos

Para completar la implementación:

1. **Persistencia**: Reemplazar InMemory repository con base de datos
2. **Validación**: Agregar DTOs con class-validator
3. **Autenticación**: Proteger endpoints con JWT
4. **Paginación**: Implementar paginación avanzada
5. **Filtros**: Agregar más filtros en queries
6. **Tests**: Unit tests y E2E tests
7. **Documentación**: Swagger/OpenAPI
8. **Rate Limiting**: Protección contra abuso
9. **Caching**: Redis para queries frecuentes
10. **Event Sourcing**: Opcional para auditoría completa

