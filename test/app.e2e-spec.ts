import { Test } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
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
