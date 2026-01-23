import { IsString, IsDateString, IsBoolean } from 'class-validator';

export class ScheduleThemeDto {
  @IsString()
  themeId: string;

  @IsDateString()
  startDate: string;

  @IsDateString()
  endDate?: string;

  @IsBoolean()
  isRecurring?: boolean;
}