import { IDomainEvent } from '@nestjslatam/ddd';

import { ICommand } from '.';

export interface UnhandledExceptionInfo<
  Cause = IDomainEvent | ICommand,
  Exception = any,
> {
  exception: Exception;
  cause: Cause;
}
