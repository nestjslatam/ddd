export interface IDomainTransationRepository<TDomainAggregate> {
  publishEvents(
    domainEntity: TDomainAggregate,
    handler: () => Promise<void>,
  ): Promise<void>;

  transaction<T>(handler: () => Promise<T>): Promise<T>;
}
