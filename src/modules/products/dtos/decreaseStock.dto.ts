import { IsNotEmpty, IsNumber, IsString } from 'class-validator';

export class DecreaseStockDto {
  @IsString()
  @IsNotEmpty()
  id: string;

  @IsNumber()
  @IsNotEmpty()
  quantity: number;
}
