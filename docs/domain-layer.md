# Domain layer

The part that depends on nothing. Every class named here exists in `src/products/domain/`, `src/orders/domain/` or `src/shared/`.

## Value objects

The three shared ones live in `src/shared/valueobjects/`.

```ts
export class Name extends StringValueObject {
  static create(value: string): Name {
    const name = new Name(value);
    if (!name.isValid) {
      throw new BrokenRulesException('Name', name.brokenRules.getBrokenRules());
    }
    return name;
  }

  override addValidators(): void {
    super.addValidators();
    this.validatorRules.add(new NameLengthValidator(this));
  }
}
```

Two lines carry the weight.

**`if (!name.isValid)`** — validation *collects* broken rules and never throws, so the factory has to check. Skip it and `create()` returns a value object that failed its own rules. `isValid` is a **getter** since `ddd-lib` 3.0.0; writing `isValid()` is a compile error.

**`super.addValidators()`** — `StringValueObject` registers real validators there. An override that does not chain drops them, and invalid values pass with no error at all.

| Value object | Base | Rules |
|---|---|---|
| `Name` | `StringValueObject` | Not blank; 3–100 characters |
| `Description` | `StringValueObject` | Not blank; up to 500 characters |
| `Price` | `NumberValueObject` | Greater than zero; ≤ 9 999 999.99; at most 2 decimals |

Orders adds three of its own in `src/orders/domain/value-objects/`: `Money` (amount plus currency, with arithmetic that refuses to mix currencies), `CustomerInfo` and `ShippingAddress`.

> **The ordering trap.** `DddValueObject`'s constructor calls `addValidators()` **before** your subclass constructor body runs. A validator that reads a field you assign there sees `undefined` and throws on every construction. `NumberValueObject` in the library itself shipped broken this way for two releases. `npx ddd validate` has a rule for it.

## Aggregates

### Product

`src/products/domain/product-aggregate/product.ts`

```ts
export class Product extends DddAggregateRoot<Product, IProductProps> {
  private constructor(props: IProductProps, id?: IdValueObject) {
    super(props, { id });
    this.trackingState.markAsNew();
  }

  static create(name: Name, description: Description, price: Price): Product {
    const product = new Product({ name, description, price, status: ProductStatus.ACTIVE });
    if (!product.isValid) {
      throw new BrokenRulesException('Product', product.brokenRules.getBrokenRules());
    }
    return product;
  }
}
```

Note the base constructor's shape: **`(props, options?)`**, with the id in the options bag. Two type arguments, not one.

`load()` sits beside `create()` and does *not* validate — rehydrating something already known to be sound is a different operation from creating it.

Behaviour: `ChangeName`, `ChangeDescription`, `ChangePrice`, `ChangeStatus`, `canBeDeleted`, `markForDeletion`, `getStateSnapshot`.

### Order

`src/orders/domain/order-aggregate/order.ts`

Richer, because it has a lifecycle:

```
DRAFT ──→ CONFIRMED ──→ PROCESSING ──→ SHIPPED ──→ DELIVERED
  │            │             │
  └────────────┴─────────────┴──→ CANCELLED
```

`addItem`, `removeItem`, `changeItemQuantity`, `clearItems`, `confirm`, `startProcessing`, `ship`, `deliver`, `cancel`, plus the predicates `isDraft`, `isConfirmed`, `canModifyItems`, `canBeCancelled`.

An `Order` holds `OrderItem` **entities** (`src/orders/domain/entities/`) — they have identity within the aggregate and are reached only through it, never saved or loaded on their own.

> **A draft is a cart, and a cart starts empty.** `Order.create()` builds one with `items: []`. The "at least one item" and "minimum $10" rules therefore apply from `CONFIRMED` onward, not at creation — stated unconditionally they made every draft permanently invalid, and the aggregate rejected the object its own factory had just built.

## Validators

One class per concern, in `validators/` beside the aggregate.

```ts
export class ProductPriceValidator extends AbstractRuleValidator<Product> {
  public addRules(): void {
    if (this.subject.props.price.getValue() <= 0) {
      this.addBrokenRule('props.price', 'Price must be greater than 0');
    }
  }
}
```

**Each condition is TRUE when the rule is BROKEN** — the opposite of how an assertion reads. Getting it backwards produces a validator that passes exactly when it should fail.

| Aggregate | Validators |
|---|---|
| `Product` | `ProductNameValidator`, `ProductDescriptionValidator`, `ProductPriceValidator`, `ProductStatusValidator`, `ProductBusinessRulesValidator` |
| `Order` | `OrderItemsValidator`, `OrderAmountValidator`, `OrderCustomerValidator`, `OrderShippingValidator`, `OrderStatusValidator`, `OrderItemQuantityValidator`, `OrderItemPriceValidator`, `OrderItemProductValidator` |

`ProductBusinessRulesValidator` is the interesting one: it requires the description to be longer than the name. Both value objects are individually valid, so **only the aggregate can catch it** — which is exactly what an aggregate-level validator is for.

## Domain events

`ProductCreatedEvent`, `ProductNameChangedEvent`, `ProductDescriptionChangedEvent`, `ProductPriceChangedEvent`, `ProductStatusChangedEvent`.

`OrderCreatedEvent`, `OrderItemAddedEvent`, `OrderItemRemovedEvent`, `OrderItemQuantityChangedEvent`, `OrderConfirmedEvent`, `OrderShippedEvent`, `OrderDeliveredEvent`, `OrderCancelledEvent`, `OrderStatusChangedEvent`.

An aggregate `apply()`s them as it changes. **They are collected, not dispatched** — only `mergeObjectContext(...).commit()` in the command handler sends them. Without it the command succeeds and every handler is silently skipped.

## State tracking

Every aggregate carries a `trackingState`: `markAsNew`, `markAsDirty`, `markAsDeleted`. A repository reads it to decide between an insert, an update and a delete without being told.

## Next

- [Application layer](application-layer.md) — how these are driven
- [Architecture](architecture.md) — the shape of the whole
