export interface IDomainTransationRepository<TTable> {
  publishEvents(
    domainEntity: TTable,
    handler: () => Promise<void>,
  ): Promise<void>;

  transaction<T>(handler: () => Promise<T>): Promise<T>;
}
