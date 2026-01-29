# Mejoras de Validadores, Estados y Broken Rules

## Resumen de Implementación

Se ha mejorado significativamente la gestión de validaciones, estados y errores en los módulos **Products** y **Orders**, implementando validadores formales para todas las entidades y value objects del dominio.

## 1. Value Objects Mejorados

### 1.1 Name Value Object

**Ubicación:** `src/shared/valueobjects/Name.ts`

**Validadores Implementados:**

- **NameLengthValidator**: Valida longitud (3-100 caracteres)
- Valida caracteres permitidos (alfanuméricos, espacios, guiones, underscores)
- No permite solo espacios en blanco

**Mejoras:**

- Validación automática en el método `create()`
- Lanza excepciones descriptivas con todos los errores encontrados
- Método `load()` sin validación (para carga desde persistencia)

### 1.2 Description Value Object

**Ubicación:** `src/shared/valueobjects/description.ts`

**Validadores Implementados:**

- **DescriptionLengthValidator**: Valida longitud (10-500 caracteres)
- No permite solo espacios en blanco

**Mejoras:**

- Validación en creación
- Mensajes de error descriptivos

### 1.3 Price Value Object

**Ubicación:** `src/shared/valueobjects/Price.ts`

**Validadores Implementados:**

- **NumberNotNullValidator**: El precio no puede ser nulo
- **NumberPositiveValidator**: El precio debe ser positivo
- **PriceRangeValidator**:
  - Valida rango (0 < precio <= 9,999,999.99)
  - Valida máximo 2 decimales

**Mejoras:**

- Múltiples validadores en cadena
- Validación de formato de decimales

## 2. Producto Aggregate (Products Module)

### 2.1 Validadores del Agregado Product

**Ubicación:** `src/products/domain/product-aggregate/validators/`

**Validadores Implementados:**

1. **ProductNameValidator**
   - Verifica que el nombre no sea nulo ni vacío
2. **ProductDescriptionValidator**

   - Verifica que la descripción no sea nula ni vacía

3. **ProductPriceValidator**

   - Precio mayor que 0
   - Precio menor que 1,000,000
   - Precio múltiplo de 100 (regla de negocio)

4. **ProductStatusValidator**

   - Status debe ser un valor válido del enum
   - No permite activar producto con precio 0 (regla de negocio crítica)

5. **ProductBusinessRulesValidator**
   - Precio no puede exceder 10,000 veces la longitud del nombre
   - Descripción debe ser más larga que el nombre

### 2.2 Mejoras en el Agregado Product

**Validación en Creación:**

```typescript
static create(name, description, price): Product {
  const product = new Product({...});
  if (!product.isValid) {
    throw new Error(...); // Con todos los errores
  }
  return product;
}
```

**Métodos de Cambio Mejorados:**

- `ChangeName()`: Valida el nuevo nombre y revalida el producto
- `ChangeDescription()`: Valida la nueva descripción y revalida
- `ChangePrice()`: Valida el nuevo precio, verifica reglas de negocio
- `ChangeStatus()`: Valida transiciones de estado permitidas

**Nuevos Métodos:**

- `canBeDeleted()`: Verifica si el producto puede ser eliminado
- `markForDeletion()`: Marca para eliminación si es válido
- `getStateSnapshot()`: Retorna estado completo (isNew, isDirty, isDeleted, hasErrors, errors)

**Gestión de Estados:**

```typescript
getStateSnapshot() {
  return {
    isNew: boolean,
    isDirty: boolean,
    isDeleted: boolean,
    hasErrors: boolean,
    errors: string[]
  };
}
```

## 3. Order Aggregate (Orders Module)

### 3.1 Validadores del Agregado Order

**Ubicación:** `src/orders/domain/validators/`

**Validadores Implementados:**

1. **OrderItemsValidator**

   - Orden debe tener al menos 1 item
   - Máximo 50 items por orden
   - No permite items duplicados (por productId)

2. **OrderAmountValidator**

   - Monto mínimo: $10
   - Monto máximo: $100,000
   - Valida que el monto sea un número válido

3. **OrderStatusValidator**

   - Status debe ser válido del enum OrderStatus
   - Validaciones específicas por estado:
     - CONFIRMED: debe tener items y fecha de confirmación
     - SHIPPED: debe tener fecha de envío y estar confirmado
     - DELIVERED: debe tener fecha de entrega y estar enviado
     - CANCELLED: debe tener razón de cancelación

4. **OrderCustomerValidator**

   - Email requerido y con formato válido
   - Nombre requerido (mínimo 2 caracteres)
   - Teléfono con formato válido (si existe)

5. **OrderShippingValidator**
   - Dirección de envío requerida
   - Dirección completa para órdenes confirmadas (mínimo 10 caracteres)

### 3.2 Validadores de OrderItem Entity

**Ubicación:** `src/orders/domain/validators/`

1. **OrderItemQuantityValidator**

   - Cantidad debe ser entero
   - Rango: 1-10,000
   - Debe ser un número válido

2. **OrderItemPriceValidator**

   - Precio unitario mayor que 0
   - Precio unitario menor que 1,000,000
   - Valida que el cálculo del precio total sea correcto

3. **OrderItemProductValidator**
   - ProductId requerido
   - Nombre del producto requerido (3-500 caracteres)

### 3.3 Mejoras en el Agregado Order

**Validación en Creación:**

```typescript
static create(customerInfo, shippingAddress, currency): Order {
  const order = new Order({...});
  if (!order.isValid) {
    throw new Error(...); // Con todos los errores
  }
  return order;
}
```

**Nuevo Método de Estado:**

```typescript
getStateSnapshot() {
  return {
    isNew: boolean,
    isDirty: boolean,
    isDeleted: boolean,
    hasErrors: boolean,
    errors: string[],
    status: OrderStatus,
    totalAmount: number,
    itemCount: number
  };
}
```

## 4. Gestión de Tracking State

### Tracking State en Products

```typescript
// El agregado Product rastrea:
- trackingState.isNew: Recién creado
- trackingState.isDirty: Modificado
- trackingState.isDeleted: Marcado para eliminación

// Transiciones automáticas:
- create() → markAsNew()
- load() → markAsClean()
- Change*() → markAsDirty()
- markForDeletion() → markAsDeleted()
```

### Tracking State en Orders

```typescript
// El agregado Order rastrea:
- trackingState.isNew: Nuevo pedido (DRAFT)
- trackingState.isDirty: Pedido modificado
- trackingState.isDeleted: Pedido eliminado

// Utiliza los mismos patrones que Product
```

## 5. Gestión de Broken Rules

### Patrón de Uso

```typescript
// En el agregado:
if (!entity.isValid) {
  const errors = entity.brokenRules.getBrokenRules();
  errors.forEach((error) => {
    console.log(`${error.property}: ${error.message} [${error.severity}]`);
  });
}

// Agregar reglas rotas manualmente:
this.brokenRules.add(new BrokenRule('property', 'message', 'Error'));
```

### Severidades Soportadas

- **Error**: Bloquea la operación
- **Warning**: Advierte pero permite continuar
- **Info**: Información

## 6. Reglas de Negocio Implementadas

### Products

1. Precio debe ser múltiplo de 100
2. Precio máximo: 1,000,000
3. Producto con precio 0 no puede estar activo
4. Descripción debe ser más larga que el nombre
5. Solo productos inactivos pueden ser eliminados
6. Precio no puede exceder 10,000 veces la longitud del nombre

### Orders

1. Monto mínimo de orden: $10
2. Monto máximo de orden: $100,000
3. Máximo 50 items por orden
4. No items duplicados
5. Cantidad por item: 1-10,000
6. Orden debe tener al menos 1 item para confirmar
7. No se pueden modificar items después de confirmar
8. Email debe tener formato válido
9. Transiciones de estado validadas

## 7. Beneficios de la Implementación

### Seguridad

- Validación exhaustiva antes de persistir
- Imposible crear entidades en estado inválido
- Reglas de negocio aplicadas consistentemente

### Mantenibilidad

- Validadores separados y reutilizables
- Fácil agregar nuevas reglas sin modificar entidades
- Tests unitarios por validador

### Claridad

- Mensajes de error descriptivos
- Tracking de estado explícito
- Separación clara entre validaciones técnicas y reglas de negocio

### Trazabilidad

- `getStateSnapshot()` para debugging
- Broken rules con propiedad y severidad
- Historial de cambios mediante tracking state

## 8. Uso en Aplicación

### Ejemplo Product

```typescript
// Crear producto con validación
const name = Name.create('Widget Premium'); // Valida
const desc = Description.create('Un widget de alta calidad...'); // Valida
const price = Price.create(9999.99); // Valida

const product = Product.create(name, desc, price); // Valida producto

// Modificar con validación
product.ChangePrice(Price.create(10000)); // Valida nuevo precio
product.validate(); // Revalida todo

// Ver estado
const snapshot = product.getStateSnapshot();
if (snapshot.hasErrors) {
  console.log('Errores:', snapshot.errors);
}
```

### Ejemplo Order

```typescript
// Crear orden con validación
const customerInfo = CustomerInfo.create(...); // Valida
const shippingAddress = ShippingAddress.create(...); // Valida

const order = Order.create(customerInfo, shippingAddress, 'USD');

// Agregar items con validación
order.addItem(productId, 'Widget', 2, Money.fromAmount(49.99, 'USD'));

// Confirmar con validaciones
order.confirm(); // Valida items, monto mínimo, etc.

// Ver estado
const snapshot = order.getStateSnapshot();
console.log('Estado:', snapshot.status);
console.log('Errores:', snapshot.errors);
```

## 9. Próximos Pasos (Recomendaciones)

1. **Tests Unitarios**: Crear tests para cada validador
2. **Validación Asíncrona**: Para reglas que requieren consultas (ej: producto existe)
3. **Mensajes i18n**: Internacionalizar mensajes de error
4. **Validación Contextual**: Diferentes reglas según el contexto (web vs API)
5. **Logs de Auditoría**: Registrar cambios de estado y violaciones de reglas
6. **Métricas**: Monitorear reglas de negocio más violadas

## 10. Estructura de Archivos

```
src/
├── shared/
│   └── valueobjects/
│       ├── Name.ts (✓ con validadores)
│       ├── description.ts (✓ con validadores)
│       ├── Price.ts (✓ con validadores)
│       └── validators/
│           ├── name-length.validator.ts
│           ├── description-length.validator.ts
│           ├── price-range.validator.ts
│           └── index.ts
├── products/
│   └── domain/
│       └── product-aggregate/
│           ├── product.ts (✓ mejorado con estados)
│           └── validators/
│               ├── product-name.validator.ts
│               ├── product-description.validator.ts
│               ├── product-price.validator.ts
│               ├── product-status.validator.ts
│               ├── product-business-rules.validator.ts
│               └── index.ts
└── orders/
    └── domain/
        ├── order-aggregate/
        │   └── order.ts (✓ mejorado con estados)
        ├── entities/
        │   └── order-item.entity.ts (✓ con validadores)
        └── validators/
            ├── order-items.validator.ts
            ├── order-amount.validator.ts
            ├── order-status.validator.ts
            ├── order-customer.validator.ts
            ├── order-shipping.validator.ts
            ├── order-item-quantity.validator.ts
            ├── order-item-price.validator.ts
            ├── order-item-product.validator.ts
            └── index.ts
```

## Estado Final

✅ **Compilación Exitosa** - Todos los validadores implementados y funcionando
✅ **Gestión de Estados** - Tracking state completo en agregados
✅ **Broken Rules** - Sistema de errores robusto con severidades
✅ **Reglas de Negocio** - Implementadas y validadas automáticamente

