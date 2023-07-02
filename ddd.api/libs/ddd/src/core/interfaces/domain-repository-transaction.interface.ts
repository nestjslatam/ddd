export interface IDomainTransationRepository<TDomainAggregate> {
  publishEvents(
    domainAggregate: TDomainAggregate,
    handler: () => Promise<void>,
  ): Promise<void>;
}
