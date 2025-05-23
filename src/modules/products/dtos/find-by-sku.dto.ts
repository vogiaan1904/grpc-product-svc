import { IsNotEmpty, IsString } from 'class-validator';

export class FindBySkuDto {
  @IsString()
  @IsNotEmpty()
  sku: string;
}
