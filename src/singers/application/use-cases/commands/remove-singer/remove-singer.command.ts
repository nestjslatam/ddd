import { ICommand } from '@nestjs/cqrs';

export class RemoveSingerCommand implements ICommand {
  constructor(readonly id: string) {}
}
