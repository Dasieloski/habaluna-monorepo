import { IsBoolean } from 'class-validator';

export class ToggleThemeDto {
  @IsBoolean()
  enabled: boolean;
}