import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
} from '@nestjs/common';

import { SingerService } from './singer.service';
import { CreateSingerDto } from './dto/create-singer.dto';
import { UpdateFullNameSingerDto } from './dto/update-fullname-singer.dto';
import { Singer } from '../domain/singer';

@Controller('singers')
export class SingerController {
  constructor(private readonly singerService: SingerService) {}

  @Get()
  async GetAll(): Promise<Singer[]> {
    return await this.singerService.findAll();
  }

  @Get(':id')
  async FindOneById(@Param('id') id: string): Promise<Singer> {
    return await this.singerService.findOneById(id);
  }

  @Post()
  async Create(@Body() createSingerDto: CreateSingerDto): Promise<void> {
    return await this.singerService.create(createSingerDto);
  }

  @Patch(':id')
  async ChangeFullName(
    @Param('id') id: string,
    @Body() updateFullNameDto: UpdateFullNameSingerDto,
  ): Promise<void> {
    return this.singerService.changeFullName(id, updateFullNameDto.newFullName);
  }

  @Patch(':id')
  async UploadPicture(
    @Param('id') id: string,
    @Param('urlPicture') urlPicture: string,
  ): Promise<void> {
    return this.singerService.uploadPicture(id, urlPicture);
  }

  @Delete(':id')
  async Delete(@Param('id') id: string): Promise<void> {
    return this.singerService.delete(id);
  }
}
