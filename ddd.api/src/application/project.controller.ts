import { Controller, Get } from '@nestjs/common';

@Controller('projects')
export class ProjectController {
  @Get()
  get(): string {
    return 'hi there';
  }
}
