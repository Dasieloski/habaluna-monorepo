import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsString } from 'class-validator';

export class UnsubscribeDto {
  @ApiProperty({ description: 'Email to unsubscribe' })
  @IsEmail({}, { message: 'Email inválido' })
  e!: string;

  @ApiProperty({ description: 'Unsubscribe token' })
  @IsString()
  t!: string;
}
