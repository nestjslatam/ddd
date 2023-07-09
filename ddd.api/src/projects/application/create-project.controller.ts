import { HttpCode, Body, Controller, Post } from '@nestjs/common';

import { CreateProjectDto } from './create-project.dto';
import { CreateProjectService } from './create-project.service';
import { Result } from '../../shared/application';

@Controller('projects')
export class CreateProjectController {
  constructor(private readonly projectService: CreateProjectService) {}

  @Post()
  @HttpCode(201)
  async create(@Body() createProject: CreateProjectDto): Promise<Result> {
    const { name } = createProject;

    return this.projectService.create(name);
  }
}
