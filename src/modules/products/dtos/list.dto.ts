import { IsArray, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class ListDto {
  @IsArray()
  ids: string[] = [];
}
