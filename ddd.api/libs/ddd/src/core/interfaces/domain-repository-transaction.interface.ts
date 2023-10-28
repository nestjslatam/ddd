export interface IDomainTransationRepository<TDomainAggregate> {
  publishEvents(
    domainAggregate: TDomainAggregate,
    handler: () => Promise<void>,
  ): Promise<void>;

  //TODO: Pending review
  transaction<T>(handler: () => Promise<T>): Promise<T>;
}
