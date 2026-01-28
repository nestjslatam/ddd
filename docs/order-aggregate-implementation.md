# Order Aggregate Implementation

Este documento describe la implementación completa del **Order Aggregate Root** que complementa la entidad Product en el proyecto DDD.

## 📋 Tabla de Contenidos

- [Visión General](#visión-general)
- [Estructura del Dominio](#estructura-del-dominio)
- [Componentes Principales](#componentes-principales)
- [Patrones DDD Implementados](#patrones-ddd-implementados)
- [Reglas de Negocio](#reglas-de-negocio)
- [Casos de Uso](#casos-de-uso)
- [Eventos de Dominio](#eventos-de-dominio)

## Visión General

El **Order Aggregate** es un agregado completo que demuestra el uso avanzado de la librería DDD, implementando:

- ✅ **Aggregate Root** con control total sobre entidades hijas
- ✅ **State Machine** para gestión de estados del pedido
- ✅ **Value Objects** con validación y operaciones inmutables
- ✅ **Domain Events** para comunicación desacoplada
- ✅ **Business Rules** con validaciones específicas del dominio
- ✅ **Entity References** respetando límites de agregados

## Estructura del Dominio

```
src/orders/domain/
├── order-aggregate/
│   └── order.ts                      # Aggregate Root
├── entities/
│   └── order-item.entity.ts          # Entidad hija
├── value-objects/
│   ├── customer-info.vo.ts           # Información del cliente
│   ├── shipping-address.vo.ts        # Dirección de envío
│   └── money.vo.ts                   # Valor monetario (Money Pattern)
├── enums/
│   └── order-status.enum.ts          # Estados del pedido
└── events/
    └── order.events.ts                # Eventos de dominio
```

## Componentes Principales

### 1. Order Aggregate Root

**Archivo**: `order-aggregate/order.ts`

El agregado raíz que controla el ciclo de vida completo de un pedido.

#### Propiedades Principales

```typescript
interface IOrderProps {
  status: OrderStatus; // Estado actual
  customerInfo: CustomerInfo; // Info del cliente
  shippingAddress: ShippingAddress; // Dirección de envío
  items: OrderItem[]; // Colección de items
  currency: string; // Moneda (USD, EUR, etc.)
  confirmedAt?: Date; // Timestamp de confirmación
  shippedAt?: Date; // Timestamp de envío
  deliveredAt?: Date; // Timestamp de entrega
  cancellationReason?: string; // Razón de cancelación
  trackingNumber?: string; // Número de seguimiento
}
```

#### Métodos Principales

##### Gestión de Items

- `addItem(productId, productName, quantity, unitPrice)` - Agrega item al pedido
- `removeItem(productId)` - Elimina item del pedido
- `changeItemQuantity(productId, newQuantity)` - Cambia cantidad de un item
- `clearItems()` - Limpia todos los items

##### Transiciones de Estado

- `confirm()` - Confirma el pedido (DRAFT → CONFIRMED)
- `startProcessing()` - Inicia procesamiento (CONFIRMED → PROCESSING)
- `ship(trackingNumber?)` - Marca como enviado (PROCESSING → SHIPPED)
- `deliver()` - Marca como entregado (SHIPPED → DELIVERED)
- `cancel(reason)` - Cancela el pedido (desde DRAFT/CONFIRMED/PROCESSING)

##### Consultas

- `totalAmount: Money` - Calcula el monto total
- `itemCount: number` - Número de items únicos
- `totalQuantity: number` - Cantidad total de productos
- `canModifyItems(): boolean` - Verifica si se pueden modificar items
- `canBeCancelled(): boolean` - Verifica si se puede cancelar

### 2. OrderItem Entity

**Archivo**: `entities/order-item.entity.ts`

Entidad que representa un producto dentro del pedido.

#### Características

```typescript
interface IOrderItemProps {
  productId: IdValueObject; // Referencia al Product aggregate
  productName: string; // Nombre del producto (registro histórico)
  quantity: number; // Cantidad pedida
  unitPrice: Money; // Precio unitario (histórico)
}
```

#### Métodos Clave

- `create(productId, productName, quantity, unitPrice)` - Factory method
- `changeQuantity(newQuantity)` - Cambia la cantidad
- `increaseQuantity(increment)` - Incrementa cantidad
- `decreaseQuantity(decrement)` - Decrementa cantidad
- `totalPrice: Money` - Calcula el precio total (quantity × unitPrice)
- `isForProduct(productId): boolean` - Verifica si es para un producto específico

#### Validaciones

- Cantidad debe ser entero positivo
- Cantidad mínima: 1
- Cantidad máxima: 10,000 por item
- Nombre de producto requerido (máx. 500 caracteres)

### 3. Money Value Object

**Archivo**: `value-objects/money.vo.ts`

Implementa el **Money Pattern** de Martin Fowler para operaciones monetarias precisas.

#### Características

- Almacenamiento interno en centavos (evita problemas de punto flotante)
- Operaciones inmutables
- Validación de moneda en operaciones
- Formateo internacionalizado

#### Métodos

```typescript
// Creación
Money.fromAmount(99.99, 'USD'); // Desde decimal
Money.fromCents(9999, 'USD'); // Desde centavos
Money.zero('USD'); // Valor cero

// Operaciones
money.add(other); // Suma
money.subtract(other); // Resta
money.multiply(factor); // Multiplicación
money.divide(divisor); // División

// Comparaciones
money.compareTo(other); // -1, 0, 1
money.isPositive(); // > 0
money.isZero(); // = 0
money.isNegative(); // < 0

// Formateo
money.format('en-US'); // "$99.99"
money.format('es-ES'); // "99,99 €"
```

### 4. CustomerInfo Value Object

**Archivo**: `value-objects/customer-info.vo.ts`

Encapsula la información del cliente.

```typescript
interface ICustomerInfoProps {
  name: string; // Nombre completo
  email: string; // Email
  phone: string; // Teléfono
}

// Uso
const customer = CustomerInfo.create(
  'Juan Pérez',
  'juan@example.com',
  '+54 11 1234-5678',
);
```

**Validaciones**:

- Todos los campos son requeridos
- Email debe ser válido
- Límites de longitud

### 5. ShippingAddress Value Object

**Archivo**: `value-objects/shipping-address.vo.ts`

Dirección de envío completa.

```typescript
interface IShippingAddressProps {
  street: string;       // Calle
  complement?: string;  // Complemento (opcional)
  city: string;         // Ciudad
  state: string;        // Estado/Provincia
  zipCode: string;      // Código postal
  country: string;      // País
}

// Método útil
address.getFullAddress(): string  // Formato completo
```

### 6. OrderStatus Enum (Smart Enum)

**Archivo**: `enums/order-status.enum.ts`

Enum con máquina de estados integrada.

#### Estados

```typescript
enum OrderStatus {
  DRAFT = 'DRAFT', // Borrador (editable)
  CONFIRMED = 'CONFIRMED', // Confirmado
  PROCESSING = 'PROCESSING', // En procesamiento
  SHIPPED = 'SHIPPED', // Enviado
  DELIVERED = 'DELIVERED', // Entregado
  CANCELLED = 'CANCELLED', // Cancelado
}
```

#### Transiciones Válidas

```
DRAFT       → CONFIRMED, CANCELLED
CONFIRMED   → PROCESSING, CANCELLED
PROCESSING  → SHIPPED, CANCELLED
SHIPPED     → DELIVERED
DELIVERED   → (estado final)
CANCELLED   → (estado final)
```

#### Helper Functions

```typescript
canTransitionTo(from: OrderStatus, to: OrderStatus): boolean
getStatusDisplayName(status: OrderStatus): string  // En español
```

### 7. Domain Events

**Archivo**: `events/order.events.ts`

Eventos publicados durante el ciclo de vida del pedido.

| Evento                          | Cuándo se Publica            |
| ------------------------------- | ---------------------------- |
| `OrderCreatedEvent`             | Al crear un nuevo pedido     |
| `OrderItemAddedEvent`           | Al agregar un item           |
| `OrderItemRemovedEvent`         | Al eliminar un item          |
| `OrderItemQuantityChangedEvent` | Al cambiar cantidad          |
| `OrderConfirmedEvent`           | Al confirmar el pedido       |
| `OrderStatusChangedEvent`       | En cada transición de estado |
| `OrderCancelledEvent`           | Al cancelar                  |
| `OrderShippedEvent`             | Al enviar                    |
| `OrderDeliveredEvent`           | Al entregar                  |

## Patrones DDD Implementados

### 1. Aggregate Pattern

- **Order** es el Aggregate Root
- **OrderItem** es una entidad hija accesible solo a través de Order
- No se puede acceder o modificar OrderItem directamente desde fuera del agregado

### 2. Value Objects

- `Money` - Operaciones monetarias inmutables
- `CustomerInfo` - Información del cliente
- `ShippingAddress` - Dirección completa

### 3. Entity References

- OrderItem referencia a Product solo por **ID** (`productId: IdValueObject`)
- No mantiene referencia directa al agregado Product (respeta límites)
- Almacena `productName` y `unitPrice` como **registro histórico**

### 4. State Machine Pattern

- Estados definidos en `OrderStatus` enum
- Transiciones válidas en `OrderStatusTransitions` Map
- Validación automática con `canTransitionTo()`

### 5. Domain Events

- Eventos publicados en cada acción importante
- Comunicación asíncrona entre agregados
- Base para CQRS y Event Sourcing

### 6. Factory Method

- Métodos `create()` para construcción controlada
- Métodos `fromPersistence()` para reconstitución

### 7. Money Pattern (Martin Fowler)

- Evita problemas de precisión de punto flotante
- Operaciones type-safe con validación de moneda
- Almacenamiento en centavos (enteros)

## Reglas de Negocio

### Validaciones del Pedido

1. **Monto Mínimo**: $10 USD mínimo para confirmar
2. **Items Requeridos**: Debe tener al menos 1 item para confirmar
3. **Máximo Items**: 50 items únicos por pedido
4. **Modificación**: Solo se pueden agregar/quitar items en estado DRAFT

### Validaciones de OrderItem

1. **Cantidad Mínima**: 1 unidad
2. **Cantidad Máxima**: 10,000 unidades por item
3. **Cantidad Entera**: Solo números enteros
4. **Producto Válido**: Debe tener nombre (máx. 500 caracteres)

### Transiciones de Estado

1. **Confirmación**: Solo desde DRAFT con validaciones
2. **Cancelación**: Posible desde DRAFT/CONFIRMED/PROCESSING
3. **Envío**: Requiere tracking number (opcional)
4. **Entrega**: Solo desde SHIPPED
5. **Estados Finales**: DELIVERED y CANCELLED no permiten transiciones

### Operaciones Monetarias

1. **Misma Moneda**: Operaciones solo entre mismo currency
2. **Precisión**: 2 decimales (centavos)
3. **No División por Cero**: Validación automática

## Casos de Uso

### Ejemplo 1: Crear Pedido Completo

```typescript
// 1. Crear información del cliente
const customer = CustomerInfo.create(
  'María González',
  'maria@example.com',
  '+54 11 4444-5555',
);

// 2. Crear dirección de envío
const address = ShippingAddress.create(
  'Av. Libertador 1234',
  'Piso 5, Depto B',
  'Buenos Aires',
  'CABA',
  'C1426',
  'Argentina',
);

// 3. Crear pedido
const order = Order.create(customer, address, 'USD');

// 4. Agregar items
order.addItem(
  productId1,
  'Laptop Dell XPS 13',
  1,
  Money.fromAmount(1299.99, 'USD'),
);

order.addItem(
  productId2,
  'Mouse Logitech MX Master',
  2,
  Money.fromAmount(79.99, 'USD'),
);

// 5. Ver totales
console.log(order.totalAmount.format()); // "$1,459.97"
console.log(order.itemCount); // 2
console.log(order.totalQuantity); // 3

// 6. Confirmar pedido
order.confirm();

// 7. Procesar y enviar
order.startProcessing();
order.ship('FEDEX-123456789');

// 8. Entregar
order.deliver();
```

### Ejemplo 2: Modificar Pedido en DRAFT

```typescript
const order = Order.create(customer, address);

// Agregar item
order.addItem(productId1, 'Item 1', 2, Money.fromAmount(50, 'USD'));

// Cambiar cantidad
order.changeItemQuantity(productId1, 5);

// Agregar otro item
order.addItem(productId2, 'Item 2', 1, Money.fromAmount(100, 'USD'));

// Remover un item
order.removeItem(productId1);

// Confirmar
order.confirm(); // Ahora ya no se pueden modificar items
```

### Ejemplo 3: Cancelación

```typescript
const order = Order.create(customer, address);
order.addItem(productId, 'Item', 1, Money.fromAmount(50, 'USD'));
order.confirm();

// Verificar si se puede cancelar
if (order.canBeCancelled()) {
  order.cancel('Cliente solicitó cancelación');
}
```

### Ejemplo 4: Manejo de Items Duplicados

```typescript
const order = Order.create(customer, address);

// Primera vez - crea el item
order.addItem(productId, 'Widget', 2, Money.fromAmount(49.99, 'USD'));

// Segunda vez - incrementa cantidad automáticamente
order.addItem(productId, 'Widget', 3, Money.fromAmount(49.99, 'USD'));

// Ahora tiene quantity = 5 para ese producto
```

## Eventos de Dominio

Los eventos se publican automáticamente y pueden ser manejados por event handlers:

```typescript
// En un Event Handler
@EventsHandler(OrderConfirmedEvent)
export class OrderConfirmedHandler {
  async handle(event: OrderConfirmedEvent) {
    // Enviar email de confirmación
    // Reservar stock
    // Notificar al sistema de inventario
    // Crear factura
  }
}

@EventsHandler(OrderShippedEvent)
export class OrderShippedHandler {
  async handle(event: OrderShippedEvent) {
    // Enviar email con tracking
    // Notificar al cliente
    // Actualizar sistema de logística
  }
}
```

## Ventajas de esta Implementación

### ✅ Separación de Responsabilidades

- Cada clase tiene una única responsabilidad clara
- Value Objects encapsulan validaciones
- Aggregate Root controla el acceso

### ✅ Inmutabilidad

- Value Objects son inmutables
- Operaciones retornan nuevas instancias
- Estado consistente garantizado

### ✅ Validación en Capas

- Factory methods validan creación
- Business methods validan operaciones
- Value Objects validan sus propios valores

### ✅ Type Safety

- TypeScript garantiza tipos correctos
- Money previene errores de moneda
- Estados controlados por enum

### ✅ Testabilidad

- Cada componente es testeable independientemente
- Validaciones claras y predecibles
- Sin dependencias externas en el dominio

### ✅ Extensibilidad

- Fácil agregar nuevos estados
- Nuevos eventos sin modificar código existente
- Value Objects reutilizables

## Próximos Pasos

Para completar la implementación del módulo Orders, se necesita:

1. **Application Layer**

   - Commands: CreateOrderCommand, ConfirmOrderCommand, etc.
   - Command Handlers
   - DTOs para requests/responses

2. **Infrastructure Layer**

   - OrderRepository
   - Mappers (Domain ↔ Persistence)
   - TypeORM entities

3. **Presentation Layer**

   - OrdersController
   - Validation pipes
   - Swagger documentation

4. **Testing**

   - Unit tests para cada componente
   - Integration tests
   - E2E tests

5. **Documentation**
   - API documentation
   - Architecture Decision Records (ADRs)
   - User guides

---

**Autor**: AI Assistant  
**Fecha**: 2024  
**Versión**: 1.0.0  
**Librería**: @nestjslatam/ddd-lib

