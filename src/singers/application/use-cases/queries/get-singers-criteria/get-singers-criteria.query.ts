import { PaginatedParams, PaginatedQueryBase } from '../../../../../shared';

export class GetSingersQuery extends PaginatedQueryBase {
  readonly name?: string;

  constructor(props: PaginatedParams<GetSingersQuery>) {
    super(props);

    this.name = props.name;
  }
}
