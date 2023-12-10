import { PaginatedParams, PaginatedQueryBase } from '@nestjslatam/ddd-lib';

export class GetSingersQuery extends PaginatedQueryBase {
  readonly name?: string;

  constructor(props: PaginatedParams<GetSingersQuery>) {
    super(props);

    this.name = props.name;
  }
}
