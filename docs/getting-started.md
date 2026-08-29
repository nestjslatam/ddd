# Getting started

Running this sample, and what to read once it is up. Every command here was executed against the repository.

## Requirements

Node `>=20.11`, and npm. **No database** — the repositories are in-memory by design, so there is nothing to install, start or migrate.

## Run it

```bash
npm install
npm run start:dev
```

The app listens on `http://localhost:3000`, with Swagger at **`/api`**.

```bash
npm test          # 36 suites, 1017 tests, ~10s
npm run test:e2e  # 16 tests over the real HTTP surface
```

> `npm install` used to leave you with `@nestjslatam/ddd-lib@2.1.0` — a version deprecated on npm for being unusable from CommonJS. The manifest declared `^2.0.0` while Jest mapped the import to local source, so the tests passed against one version and the running app used another. It tracks `^4.0.0` now.

## First request

```bash
curl -X POST http://localhost:3000/products \
  -H 'Content-Type: application/json' \
  -d '{"name":"Wireless Keyboard",
       "description":"A compact wireless keyboard with long battery life",
       "price":49.99}'
```
```json
{ "id": "65d57584-0e90-457e-b4e5-812be823eb4a" }
```

Now try the two ways it can be refused, because the difference is what this sample is for:

```bash
# structure — the pipe rejects it before the domain sees it
-d '{"name":"X","description":"Long enough to pass","price":"forty"}'   → 400

# meaning — the body is fine and the aggregate refuses it
-d '{"name":"X","description":"Long enough to pass","price":0}'         → 422
```

```json
{ "statusCode": 422,
  "error": "Unprocessable Entity",
  "message": "Price is invalid",
  "brokenRules": [
    { "property": "value", "message": "Price must be greater than zero", "severity": "Error" }
  ] }
```

A wrong *type* is structure. A wrong *value* is meaning, and only the aggregate can judge it.

## An order, end to end

An order is a `DRAFT` until you confirm it, and a draft starts empty:

```bash
# 1. open a draft
curl -X POST http://localhost:3000/orders -H 'Content-Type: application/json' \
  -d '{"customerName":"Ada Lovelace","customerEmail":"ada@example.com",
       "customerPhone":"+51999888777","shippingStreet":"1 Main St",
       "shippingCity":"Lima","shippingState":"Lima",
       "shippingZipCode":"15001","shippingCountry":"PE"}'

# 2. add an item, using the product id from before
curl -X POST http://localhost:3000/orders/<ORDER_ID>/items \
  -H 'Content-Type: application/json' \
  -d '{"productId":"<PRODUCT_ID>","productName":"Wireless Keyboard",
       "quantity":2,"unitPrice":49.99}'

# 3. confirm it
curl -X POST http://localhost:3000/orders/<ORDER_ID>/confirm \
  -H 'Content-Type: application/json' -d '{}'
```

Confirming an order with no items answers `409` — nothing is malformed and no value is wrong; the aggregate is simply not in a state that allows it.

## Where to look in the code

Read in this order and the design explains itself:

1. **`src/shared/valueobjects/Name.ts`** — the smallest complete example. A factory that checks `isValid`, and an `addValidators` that calls `super`.
2. **`src/products/domain/product-aggregate/product.ts`** — an aggregate, its validators, its events.
3. **`src/products/application/use-cases/create-product/`** — the four files every use case has: DTO, command, service, handler.
4. **`src/orders/domain/order-aggregate/order.ts`** — the same ideas with a lifecycle and child entities.

## Three mistakes this library makes easy

Worth knowing before you write your own aggregate. `npx ddd validate` catches all of them.

**A factory that does not check `isValid`.** Validation *collects* broken rules and never throws, so `create()` will happily return an object that failed its own invariants.

**An `addValidators` that does not call `super`.** The base registers real validators there. Drop the `super` call and they vanish — silently, with no error.

**Reading a subclass field inside `addValidators`.** The base constructor calls it *before* your constructor body runs, so the field is `undefined` and construction throws every time. `NumberValueObject` in the library itself shipped this way for two releases.

## Next

- [Architecture](architecture.md) — the shape of the whole
- [Domain layer](domain-layer.md) — aggregates, value objects, validators
- [Application layer](application-layer.md) — handlers and queries
- [API reference](api-reference.md) — every endpoint, with its status codes
- [The CLI's guide](https://github.com/nestjslatam/ddd-cli/blob/main/docs/GUIDE.md) — the clearest write-up of this library's idiom anywhere
