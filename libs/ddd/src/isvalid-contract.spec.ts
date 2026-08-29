import { DddAggregateRoot } from './aggregate-root';
import { NumberValueObject } from './valueobjects/number.valueobject';
import { StringValueObject } from './valueobjects/string.valueobject';

/**
 * One shape for `isValid` across the library.
 *
 * The two bases used to disagree: DddValueObject declared a getter,
 * DddAggregateRoot a method. `if (!aggregate.isValid)` therefore tested a
 * Function -- always truthy -- so the guard never fired, TypeScript did not
 * flag it, and validation never throws, so nothing else caught it either.
 * Three such guards shipped in this repository's own sample.
 *
 * The direction was chosen for its failure mode. Unifying on a getter makes
 * old `isValid()` call sites fail loudly: TS6234 at compile time for
 * TypeScript consumers, a TypeError at runtime otherwise. Unifying on a
 * method would instead have turned every existing `if (!vo.isValid)` into a
 * silently dead guard -- the same defect, inflicted on value object users.
 */
describe('the isValid contract', () => {
  interface IProps {
    label: string;
  }

  class Thing extends DddAggregateRoot<Thing, IProps> {
    constructor(props: IProps) {
      super(props);
    }
  }

  it('is a boolean-valued getter on every base that exposes it', () => {
    expect(typeof new Thing({ label: 'x' }).isValid).toBe('boolean');
    expect(typeof StringValueObject.create('x').isValid).toBe('boolean');
    expect(typeof NumberValueObject.create(1).isValid).toBe('boolean');
    // AggregateValidationOrchestrator was unified too, but constructing it
    // means assembling four collaborators -- noise, for no coverage of the
    // contract that actually bites, which is the bases people subclass.
  });

  it('is never callable, so an old call site fails loudly', () => {
    const aggregate = new Thing({ label: 'x' }) as unknown as {
      isValid: () => boolean;
    };

    expect(() => aggregate.isValid()).toThrow(TypeError);
  });

  it('reports validity rather than a truthy function reference', () => {
    // The bug in one line: a method reference is always truthy, so a guard
    // written against it can never fire.
    expect(NumberValueObject.create(-1).isValid).toBe(false);
    expect(NumberValueObject.create(10).isValid).toBe(true);
  });
});
