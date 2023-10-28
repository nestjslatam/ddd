import { ApiProperty } from '@nestjs/swagger';

export class ResponseApiId {
  constructor(id: string) {
    this.responseId = id;
  }

  @ApiProperty()
  readonly responseId: string;
}
