export interface IDomainTransationRepository<TDomain> {
  publishEvents(
    domainEntity: TDomain,
    handler: () => Promise<void>,
  ): Promise<void>;

  transaction<T>(handler: () => Promise<T>): Promise<T>;
}
