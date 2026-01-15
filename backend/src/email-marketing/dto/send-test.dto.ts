import { ApiProperty } from '@nestjs/swagger';
import { IsEmail } from 'class-validator';

export class SendTestDto {
  @ApiProperty()
  @IsEmail()
  to!: string;
}

