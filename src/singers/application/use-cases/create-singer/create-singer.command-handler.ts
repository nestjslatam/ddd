import {
  DomainEventPublisher,
  BrokenRulesException,
} from '@nestjslatam/ddd-lib';

import { CreateSingerCommand } from './create-singer-command';
import { SingerRepository } from '../../../infrastructure/db';
import { Singer, eSingerStatus } from '../../../domain/singer';
import { FullName, PicturePath } from '../../../domain';
import { RegisterDate } from '../../../../shared/domain';
import { SingerToSingerTableMapper } from '../../mappers';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';

@CommandHandler(CreateSingerCommand)
export class CreateSingerCommandHandler
  implements ICommandHandler<CreateSingerCommand>
{
  constructor(
    private readonly repository: SingerRepository,
    private readonly publisher: DomainEventPublisher,
  ) {}

  async execute(command: CreateSingerCommand): Promise<void> {
    const { fullName, picture } = command;

    const domain = this.publisher.mergeObjectContext(
      Singer.create({
        fullName: FullName.create(fullName),
        picture: PicturePath.create(picture),
        registerDate: RegisterDate.create(new Date()),
        isSubscribed: false,
        status: eSingerStatus.Registered,
      }),
    );

    if (!domain.getIsValid()) {
      const brokenRules = domain.getBrokenRulesAsString();

      throw new BrokenRulesException(brokenRules);
    }

    this.repository.insert(SingerToSingerTableMapper.map(domain));

    domain.commit();
  }
}
