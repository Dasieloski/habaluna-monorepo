import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsString, MinLength } from 'class-validator';

export class StockNotifyDto {
  @ApiProperty({ example: 'usuario@ejemplo.com', description: 'Email para avisar cuando haya stock' })
  @IsEmail({}, { message: 'El email no es válido' })
  @IsString()
  email: string;
}
