import { Injectable } from '@nestjs/common';
import { CreateProjectDto } from './dto';

@Injectable()
export class ProjectService {
  constructor() {}

  create(createProjectDto: CreateProjectDto): string {
    return '';
  }
}
