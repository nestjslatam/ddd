# API reference

Every endpoint below was called against the running application and the status codes are what it returned. An earlier version of this document described a `/singers` API that has never existed here.

Live Swagger UI: **`http://localhost:3000/api`**.

## Status codes

The same four appear throughout, and the distinction between the middle two is the point:

| | Meaning |
|---|---|
| `400` | **Structure.** A field is missing or of the wrong type. Caught by `ValidationPipe` before the domain sees it. |
| `422` | **Meaning.** The body is well-formed and the domain refused it. The response lists the broken rules. |
| `409` | **State.** The aggregate is not in a state that allows this. |
| `404` | No such aggregate. |

A `500` means an unexpected fault, not a rejected request.

---

## Products

### `POST /products` → `201`

```json
{ "name": "Wireless Keyboard",
  "description": "A compact wireless keyboard with long battery life",
  "price": 49.99 }
```
```json
{ "id": "65d57584-0e90-457e-b4e5-812be823eb4a" }
```

A property the DTO does not declare is stripped and ignored — that is what `whitelist: true` is for.

| | |
|---|---|
| `price: "forty"` | `400`, naming the field |
| `price: 0` | `422` — `PriceRangeValidator` refuses it |
| description shorter than the name | `422` — `ProductBusinessRulesValidator`, an invariant only the aggregate can judge |

### `GET /products` → `200`

Optional `status`, `limit`, `offset` query parameters.

### `GET /products/:id` → `200`, or `404`

### `PUT /products/:id` → `200`

Every field optional; send only what changed.

```json
{ "price": 59.99 }
```

### `PATCH /products/:id/status` → `200`

```json
{ "status": "INACTIVE" }
```

`ACTIVE`, `INACTIVE` or `DELETED`. Anything else is a `400` listing the accepted names.

> Until recently this endpoint rejected **every** call, including valid ones, with the self-contradicting `Expected: ACTIVE, INACTIVE or DELETED. Provided value: 'INACTIVE'`. `ProductStatus` is a `DddEnum` whose static members are *instances*, and the handler compared them against a string with `Object.values(...).includes(...)`, which never matched. It uses the enum's own lookup now.

### `DELETE /products/:id` → `204`

---

## Orders

An order has a lifecycle, and most of its endpoints are transitions:

```
DRAFT ──→ CONFIRMED ──→ PROCESSING ──→ SHIPPED ──→ DELIVERED
  │            │             │
  └────────────┴─────────────┴──→ CANCELLED
```

### `POST /orders` → `201`

```json
{ "customerName": "Ada Lovelace",
  "customerEmail": "ada@example.com",
  "customerPhone": "+51999888777",
  "shippingStreet": "1 Main St",
  "shippingCity": "Lima",
  "shippingState": "Lima",
  "shippingZipCode": "15001",
  "shippingCountry": "PE" }
```

Optional: `shippingComplement`, `currency`.

**Creates an empty `DRAFT`.** A cart starts empty, so the "at least one item" and "minimum $10" rules apply from `CONFIRMED` onward rather than at creation.

An address that is not an address is a `400` — `@IsEmail` earns its place at the transport layer.

### `POST /orders/:id/items` → `200`

```json
{ "productId": "65d57584-…", "productName": "Wireless Keyboard",
  "quantity": 2, "unitPrice": 49.99 }
```

`quantity: 0` is a `422` naming `quantity`: the DTO says it is a number, and `OrderItem` says it must be at least 1. Structure and meaning, answered separately.

Only while the order can still be modified — otherwise `409`.

### `PATCH /orders/:id/items/:productId` → `200`

```json
{ "newQuantity": 3 }
```

`404` if the order does not hold that item.

### `DELETE /orders/:id/items/:productId` → `204`

### `POST /orders/:id/confirm` → `200`

`DRAFT → CONFIRMED`. A draft with no items is a `409` — nothing is malformed and no value is wrong; the aggregate is simply not in a state that allows it.

### `POST /orders/:id/ship` → `200`

```json
{ "trackingNumber": "T1" }
```

> **Reachable only from `PROCESSING`, and no endpoint reaches `PROCESSING`.** Calling this on a `CONFIRMED` order returns `409`. `Order.startProcessing()` exists on the aggregate but nothing exposes it — adding that endpoint is a [listed first issue](../README.md#contributing).

### `POST /orders/:id/deliver` → `200`

`SHIPPED → DELIVERED`, so it inherits the gap above.

### `POST /orders/:id/cancel` → `200`

```json
{ "reason": "changed mind" }
```

Allowed from `DRAFT`, `CONFIRMED` or `PROCESSING`. A blank reason is a `400`.

### `GET /orders` → `200` &nbsp;·&nbsp; `GET /orders/:id` → `200`, or `404`

---

## A full round trip

Covered by [`test/app.e2e-spec.ts`](../test/app.e2e-spec.ts), which asserts every code on this page:

```bash
POST  /products                      201
POST  /orders                        201   an empty DRAFT
POST  /orders/:id/items              200
PATCH /orders/:id/items/:productId   200
POST  /orders/:id/confirm            200
```
