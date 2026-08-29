import { Test } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import { DomainExceptionFilter } from './../src/shared/filters/domain-exception.filter';
import request from 'supertest';
import { AppModule } from './../src/app.module';
/**
 * These tests exist because every write endpoint in this sample returned 500,
 * and the suite that was supposed to catch that requested `GET /singers` -- an
 * endpoint this application does not have -- and accepted 200, 404 *or* 500.
 * A test that accepts every outcome asserts nothing.
 *
 * The pipe below is the important part of the setup: `whitelist: true` keeps
 * only properties carrying a validation decorator, so a DTO with none is
 * stripped to `{}` and the handler receives nothing. Reproducing that pipe
 * here is what makes these tests able to catch the regression.
 */
describe('Write endpoints (e2e)', () => {
  let app: INestApplication;
  let http: ReturnType<INestApplication['getHttpServer']>;

  const validProduct = {
    name: 'Wireless Keyboard',
    description: 'A compact wireless keyboard with a long battery life',
    price: 49.99,
  };

  const validCustomer = {
    customerName: 'Ada Lovelace',
    customerEmail: 'ada@example.com',
    customerPhone: '+51999888777',
    shippingStreet: '1 Main St',
    shippingCity: 'Lima',
    shippingState: 'Lima',
    shippingZipCode: '15001',
    shippingCountry: 'PE',
  };

  beforeAll(async () => {
    // The previous version of this file replaced ModulesContainer with an
    // empty one. That is what CQRS's explorer reads to discover @CommandHandler
    // and @QueryHandler, so every command failed with
    // CommandHandlerNotFoundException -- which is why the old test had to
    // accept 500 as a pass. The container stays real.
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleRef.createNestApplication();
    app.useGlobalPipes(
      new ValidationPipe({ transform: true, whitelist: true }),
    );

    app.useGlobalFilters(new DomainExceptionFilter());

    await app.init();
    http = app.getHttpServer();
  });

  afterAll(async () => {
    if (app) await app.close();
    await new Promise((resolve) => setTimeout(resolve, 100));
  });

  describe('products', () => {
    it('creates a product and returns its id', async () => {
      const res = await request(http).post('/products').send(validProduct);

      expect(res.status).toBe(201);
      expect(res.body.id).toEqual(expect.any(String));
    });

    it('reads back what it created', async () => {
      const created = await request(http).post('/products').send(validProduct);
      const res = await request(http).get(`/products/${created.body.id}`);

      expect(res.status).toBe(200);
    });

    it('rejects a body whose types are wrong, with 400 and a reason', async () => {
      const res = await request(http)
        .post('/products')
        .send({ ...validProduct, price: 'forty' });

      expect(res.status).toBe(400);
      expect(JSON.stringify(res.body)).toContain('price');
    });

    it('strips a property the DTO does not declare', async () => {
      // What `whitelist` is actually for. The request succeeds and the extra
      // key never reaches the handler.
      const res = await request(http)
        .post('/products')
        .send({ ...validProduct, isAdmin: true });

      expect(res.status).toBe(201);
    });

    it('answers a broken invariant with 422 and names the rule', async () => {
      // The distinction this filter exists for. The body is well-formed and
      // typed correctly, so the pipe lets it through; the DOMAIN refuses it.
      // That is the caller's mistake, not the server's, and it used to come
      // back as a bare `500 Internal server error` with no indication of
      // which rule failed.
      const res = await request(http)
        .post('/products')
        .send({ ...validProduct, price: 0 });

      expect(res.status).toBe(422);
      expect(res.body.brokenRules).toEqual(
        expect.arrayContaining([
          expect.objectContaining({ message: expect.stringContaining('zero') }),
        ]),
      );
    });

    it('keeps 400 for structure and 422 for meaning', async () => {
      // A wrong TYPE is caught by the pipe before the domain ever sees it; a
      // wrong VALUE reaches the aggregate and is refused there. Two different
      // mistakes deserve two different answers.
      const wrongType = await request(http)
        .post('/products')
        .send({ ...validProduct, price: 'forty' });
      const wrongValue = await request(http)
        .post('/products')
        .send({ ...validProduct, price: 0 });

      expect(wrongType.status).toBe(400);
      expect(wrongValue.status).toBe(422);
    });

    it('accepts a status the enumeration declares', async () => {
      // This rejected EVERY call, valid ones included, with the
      // self-contradicting "Expected: ACTIVE, INACTIVE or DELETED. Provided
      // value: 'INACTIVE'". ProductStatus is a DddEnum whose static members
      // are instances, and the handler compared them against a string with
      // Object.values(...).includes(...), which never matched. It also passed
      // the raw string on to ChangeStatus, which expects the instance.
      const created = await request(http).post('/products').send(validProduct);

      const res = await request(http)
        .patch(`/products/${created.body.id}/status`)
        .send({ status: 'INACTIVE' });

      expect(res.status).toBe(200);
    });

    it('rejects a status outside the enumeration', async () => {
      const res = await request(http)
        .patch('/products/00000000-0000-4000-8000-000000000000/status')
        .send({ status: 'BANANA' });

      expect(res.status).toBe(400);
    });
  });

  describe('orders', () => {
    it('opens an empty draft', async () => {
      // A draft is a cart, and a cart starts empty. Order.create() builds one
      // with `items: []`, so the item-count and minimum-amount rules apply
      // from CONFIRMED onward rather than at creation -- stated
      // unconditionally they made every draft permanently invalid and this
      // endpoint could never succeed.
      const res = await request(http).post('/orders').send(validCustomer);

      expect(res.status).toBe(201);
      expect(res.body.id).toEqual(expect.any(String));
    });

    it('rejects an address that is not an email', async () => {
      const res = await request(http)
        .post('/orders')
        .send({ ...validCustomer, customerEmail: 'not-an-email' });

      expect(res.status).toBe(400);
    });

    it('carries a draft through items to confirmation', async () => {
      const product = await request(http).post('/products').send(validProduct);
      const order = await request(http).post('/orders').send(validCustomer);

      const added = await request(http)
        .post(`/orders/${order.body.id}/items`)
        .send({
          productId: product.body.id,
          productName: validProduct.name,
          quantity: 2,
          unitPrice: validProduct.price,
        });
      expect(added.status).toBe(200);

      const changed = await request(http)
        .patch(`/orders/${order.body.id}/items/${product.body.id}`)
        .send({ newQuantity: 3 });
      expect(changed.status).toBe(200);

      const confirmed = await request(http)
        .post(`/orders/${order.body.id}/confirm`)
        .send({});
      expect(confirmed.status).toBe(200);
    });
  });

  describe('orders reject with the right code', () => {
    const draft = async () => {
      const res = await request(http).post('/orders').send(validCustomer);
      return res.body.id as string;
    };

    it('answers 422 when the domain refuses an item quantity', async () => {
      // The DTO says `@IsNumber()`, so 0 is structurally fine and reaches
      // OrderItem, which refuses it. Well-formed, refused by the domain.
      const product = await request(http).post('/products').send(validProduct);
      const id = await draft();

      const res = await request(http).post(`/orders/${id}/items`).send({
        productId: product.body.id,
        productName: validProduct.name,
        quantity: 0,
        unitPrice: validProduct.price,
      });

      expect(res.status).toBe(422);
      expect(res.body.brokenRules).toEqual(
        expect.arrayContaining([
          expect.objectContaining({ property: 'quantity' }),
        ]),
      );
    });

    it('answers 409 when the order is not in a state that allows it', async () => {
      // A draft with no items cannot be confirmed. Nothing is malformed and
      // no value is wrong -- the aggregate is simply in the wrong state, and
      // that is a conflict rather than an unprocessable entity.
      const id = await draft();

      const res = await request(http).post(`/orders/${id}/confirm`).send({});

      expect(res.status).toBe(409);
    });

    it('answers 404 for an item the order does not hold', async () => {
      const id = await draft();

      const res = await request(http)
        .patch(`/orders/${id}/items/00000000-0000-4000-8000-000000000000`)
        .send({ newQuantity: 2 });

      expect(res.status).toBe(404);
    });

    it('answers 400 when a required value is absent', async () => {
      // ArgumentNullException, raised by the value object rather than the
      // pipe: the field is present and is a string, it is just empty.
      const res = await request(http)
        .post('/orders')
        .send({ ...validCustomer, shippingStreet: '   ' });

      expect(res.status).toBe(400);
    });
  });

  describe('reads', () => {
    it('lists products', async () => {
      await expect(
        request(http)
          .get('/products')
          .then((r) => r.status),
      ).resolves.toBe(200);
    });

    it('lists orders', async () => {
      await expect(
        request(http)
          .get('/orders')
          .then((r) => r.status),
      ).resolves.toBe(200);
    });
  });
});
