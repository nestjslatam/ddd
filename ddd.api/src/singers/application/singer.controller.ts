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
import { SingerInfoDto } from './dto';
import { UploadPictureDto } from './dto/upload-picture';

@Controller('singers')
export class SingerController {
  constructor(private readonly singerService: SingerService) {}

  @Get()
  async GetAll(): Promise<SingerInfoDto[]> {
    return await this.singerService.findAll();
  }

  @Get(':id')
  async FindOneById(@Param('id') id: string): Promise<SingerInfoDto> {
    return await this.singerService.findOneById(id);
  }

  @Post()
  async Create(@Body() createSingerDto: CreateSingerDto): Promise<void> {
    if (createSingerDto === null || createSingerDto === undefined) return;

    return await this.singerService.create(createSingerDto);
  }

  @Patch('changefullname/:id')
  async ChangeFullName(
    @Param('id') id: string,
    @Body() updateFullNameDto: UpdateFullNameSingerDto,
  ): Promise<void> {
    return this.singerService.changeFullName(id, updateFullNameDto.newFullName);
  }

  @Patch('uploadpicture/:id')
  async UploadPicture(
    @Param('id') id: string,
    @Body() uploadPictureDto: UploadPictureDto,
  ): Promise<void> {
    return this.singerService.uploadPicture(id, uploadPictureDto);
  }

  @Delete(':id')
  async Delete(@Param('id') id: string): Promise<void> {
    return this.singerService.delete(id);
  }
}
