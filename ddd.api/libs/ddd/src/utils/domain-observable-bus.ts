import { Observable, Subject } from 'rxjs';

export class DomainObservableBus<T> extends Observable<T> {
  protected _subject$ = new Subject<T>();

  constructor() {
    super();

    // TODO: This is working but is predicated, find a better way to do this
    this.source = this._subject$;
  }

  public get subject$() {
    return this._subject$;
  }
}
