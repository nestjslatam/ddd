import { Type } from '@nestjs/common';
import { IDomainCommandHandler } from '../../ddd-commands';
import { IDomainEventHandler } from '../../ddd-events';
import { ISaga } from './isaga';

/**
 * Opciones de configuración para el módulo DDD.
 */
export interface IDddOptions {
  domainCommands: Type<IDomainCommandHandler>[];
  domainEvents: Type<IDomainEventHandler>[];
  sagas: Type<ISaga>[];
}
