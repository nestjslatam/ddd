# Application layer

Use cases, command and query handlers, event handlers and sagas. Everything named here exists under `src/products/application/` or `src/orders/application/`.

## One folder per use case

```
src/products/application/use-cases/create-product/
  create-product-dto.ts            the transport contract
  create-product.command.ts        the command
  create-product.command-handler.ts
  create-product.service.ts        what the controller calls
  index.ts
```

The same four files repeat for every use case, so a reader who understands one understands all of them.

| Products | Orders |
|---|---|
| `create-product` | `create-order`, `add-item-to-order` |
| `update-product` | `remove-item-from-order`, `change-item-quantity` |
| `change-product-status` | `confirm-order`, `ship-order` |
| `delete-product` | `deliver-order`, `cancel-order` |

## The four files

**The DTO** carries `class-validator` decorators. They are not decoration: `main.ts` installs `ValidationPipe({ whitelist: true })`, and `whitelist` keeps only properties that carry one — a DTO with none is stripped to `{}` and the handler receives nothing.

```ts
export class CreateProductDto {
  @IsString() name: string;
  @IsString() description: string;
  @IsNumber() price: number;
}
```

The decorators state **structure**: present, and of the right type. They deliberately do not restate the domain's invariants — `Name` still owns 3-to-100 characters in a validator the aggregate enforces whatever transport the data arrived on.

**The command** is a plain data carrier built from the DTO.

**The service** is what the controller injects. It exists so the controller depends on one thing per use case rather than on the bus:

```ts
@Injectable()
export class CreateProductService {
  constructor(private readonly commandBus: CommandBus) {}

  async execute(dto: CreateProductDto): Promise<string> {
    return this.commandBus.execute(new CreateProductCommand(dto));
  }
}
```

**The handler** is where the domain is driven:

```ts
@CommandHandler(CreateProductCommand)
export class CreateProductCommandHandler
  implements ICommandHandler<CreateProductCommand, string>
{
  constructor(
    private readonly publisher: EventPublisher,
    private readonly productRepository: ProductRepository,
  ) {}

  async execute(command: CreateProductCommand): Promise<string> {
    const { name, description, price } = command;

    const product = Product.create(
      Name.create(name),
      Description.create(description),
      Price.create(price),
    );

    if (!product.isValid) {
      throw new BrokenRulesException('Product', product.brokenRules.getBrokenRules());
    }

    await this.productRepository.save(product);

    this.publisher.mergeObjectContext(product).commit();

    return product.id.getValue();
  }
}
```

### Three things that are easy to get wrong here

**`if (!product.isValid)`** — the library collects broken rules and never throws. A handler that skips this saves an object that failed its own invariants.

**`BrokenRulesException`, not `new Error(...)`** — it carries the rules as structured data, so `DomainExceptionFilter` can answer `422` and name them. Flattening them into a message string makes them unrecoverable by the time they reach the transport, and the caller gets a bare `500`.

**`mergeObjectContext(...).commit()`** — an aggregate *collects* its domain events; only this dispatches them. Without it the command succeeds, returns cleanly, and every `@EventsHandler` is skipped in silence. Nothing fails. `npx ddd validate` has a rule for exactly this.

## Queries

Reads go through a separate path, with their own DTOs so the read shape is free to differ from the domain's.

| Query | Handler |
|---|---|
| `GetProductQuery` / `GetProductsQuery` | `products/application/queries/get-product`, `get-products` |
| `GetOrderQuery` / `GetOrdersQuery` | `orders/application/queries/get-order`, `get-orders` |

`ProductResponseDto` and `OrderResponseDto` under `queries/dtos/` are what the controller returns.

## Event handlers

Under `application/events/`. They react to what already happened.

| Event | Handler |
|---|---|
| `OrderCreatedEvent` | `order-created.event-handler.ts` |
| `OrderItemAddedEvent` | `order-item-added.event-handler.ts` |
| `OrderConfirmedEvent` | `order-confirmed.event-handler.ts` |
| `OrderShippedEvent` | `order-shipped.event-handler.ts` |
| `OrderCancelledEvent` | `order-cancelled.event-handler.ts` |
| `ProductPriceChangedEvent` | `product-price-changed.event-handler.ts` |

An event handler must not fail the command that produced the event. The write already happened; a projector's bug is not the caller's problem.

## Sagas

`src/orders/application/sagas/order.saga.ts` reacts to a stream of events and issues further commands — the place for a workflow that spans more than one aggregate, since an aggregate is a consistency boundary and a saga is what coordinates across several.

## Next

- [Domain layer](domain-layer.md) — what these handlers drive
- [Infrastructure layer](infrastructure-layer.md) — where `save()` goes
- [API reference](api-reference.md) — the endpoints on top
