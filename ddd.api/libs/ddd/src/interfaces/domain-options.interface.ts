import { Type } from '@nestjs/common';

export interface IDomainOptions {
  domainSagas?: Type<any>[];
}
