import { Observable, Subject } from 'rxjs';

/**
 * Represents an observable bus that allows sending and receiving events of type T.
 */
export class ObservableBus<T> extends Observable<T> {
  protected _subject$ = new Subject<T>();

  constructor() {
    super();
    this.source = this._subject$;
  }

  /**
   * Gets the subject of the observable bus.
   */
  public get subject$() {
    return this._subject$;
  }
}
