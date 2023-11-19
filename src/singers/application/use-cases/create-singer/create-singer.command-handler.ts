import {
  ICommandHandler,
  CommandHandler,
  DomainEventPublisher,
  BrokenRulesException,
} from '@nestjslatam/ddd-lib';

import { CreateSingerCommad } from './create-singer-command';
import { SingerRepository } from '../../../infrastructure/db';
import { Singer, eSingerStatus } from '../../../domain/singer';
import { FullName } from '../../../domain/fullname';
import { PicturePath } from '../../../domain/picture-path';
import { RegisterDate } from '../../../../shared/domain';
import { SingerToSingerTableMapper } from '../../mappers';

@CommandHandler(CreateSingerCommad)
export class CreateSingerCommandHandler
  implements ICommandHandler<CreateSingerCommad>
{
  constructor(
    private readonly repository: SingerRepository,
    private readonly publisher: DomainEventPublisher,
  ) {}

  async execute(command: CreateSingerCommad): Promise<void> {
    const { fullName, picture } = command;

    const domain = this.publisher.mergeObjectContext(
      Singer.create({
        fullName: FullName.create(fullName),
        picture: PicturePath.create(picture.repeat(5000)),
        registerDate: RegisterDate.create(new Date()),
        isSubscribed: false,
        status: eSingerStatus.REGISTERED,
      }),
    );

    if (!domain.getIsValid()) {
      const brokenRules = domain.getBrokenRulesAsString();

      throw new BrokenRulesException(brokenRules);
    }

    this.repository.add(SingerToSingerTableMapper.map(domain));

    domain.commit();
  }
}
