import { Description, Name, Price } from '../../../shared/valueobjects';
import { Product } from '../../domain/product-aggregate/product';
import { ProductRepository } from './product.repository';

/**
 * The in-memory repository is deliberate — the sample is about the domain, not
 * about a database. That does not make it untestable, and these tests are what
 * a real implementation should also satisfy: the contract, not the storage.
 */
describe('ProductRepository', () => {
  let repository: ProductRepository;

  const product = (name = 'Wireless Keyboard') =>
    Product.create(
      Name.create(name),
      Description.create(
        'A compact wireless keyboard with a long battery life',
      ),
      Price.create(49.99),
    );

  beforeEach(() => {
    repository = new ProductRepository();
  });

  it('stores and returns an aggregate by its id', async () => {
    const item = product();
    await repository.save(item);

    const found = await repository.findById(item.id.getValue());

    expect(found).toBe(item);
  });

  it('answers null rather than throwing for an id it does not hold', async () => {
    // The handler turns this into a 404. A repository that threw would make
    // "not found" indistinguishable from "the store is broken".
    await expect(repository.findById('does-not-exist')).resolves.toBeNull();
  });

  it('reports existence without materialising the aggregate', async () => {
    const item = product();
    await repository.save(item);

    await expect(repository.exists(item.id.getValue())).resolves.toBe(true);
    await expect(repository.exists('does-not-exist')).resolves.toBe(false);
  });

  it('lists everything it holds', async () => {
    await repository.save(product('Wireless Keyboard'));
    await repository.save(product('Mechanical Keyboard'));

    await expect(repository.findAll()).resolves.toHaveLength(2);
  });

  it('starts empty', async () => {
    await expect(repository.findAll()).resolves.toHaveLength(0);
  });

  it('replaces rather than duplicates on a second save of the same id', async () => {
    // save() is one entry point for insert and update, which is what lets a
    // handler stay ignorant of which one it is doing.
    const item = product();
    await repository.save(item);
    await repository.save(item);

    await expect(repository.findAll()).resolves.toHaveLength(1);
  });

  it('deletes', async () => {
    const item = product();
    await repository.save(item);

    await repository.delete(item.id.getValue());

    await expect(repository.findById(item.id.getValue())).resolves.toBeNull();
    await expect(repository.exists(item.id.getValue())).resolves.toBe(false);
  });

  it('ignores a delete for an id it does not hold', async () => {
    await expect(repository.delete('does-not-exist')).resolves.toBeUndefined();
  });

  it('keeps two repositories independent', async () => {
    // The Map is per instance, not static. A shared one would leak state
    // between tests and between requests in a real application.
    await repository.save(product());

    await expect(new ProductRepository().findAll()).resolves.toHaveLength(0);
  });
});
