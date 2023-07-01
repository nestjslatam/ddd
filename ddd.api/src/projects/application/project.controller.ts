import { HttpCode, Body, Controller, Post } from '@nestjs/common';

import { CreateProjectDto } from './dto';
import { ProjectService } from './project.service';

@Controller('projects')
export class ProjectController {
  constructor(private readonly projectService: ProjectService) {}

  @Post()
  @HttpCode(201)
  async create(@Body() createProject: CreateProjectDto): Promise<string> {
    return this.projectService.create(createProject);
  }
}
