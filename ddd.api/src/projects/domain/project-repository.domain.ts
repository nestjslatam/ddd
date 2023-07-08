/* eslint-disable @typescript-eslint/no-empty-interface */
import { IDomainWriteRepository } from '@nestjslatam/ddd';
import { Project } from './project.domain';

export interface IProjectRepository
  extends IDomainWriteRepository<string, Project> {}
