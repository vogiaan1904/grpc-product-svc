import { Type } from 'class-transformer';
import {
  IsArray,
  IsNotEmpty,
  IsNumber,
  IsString,
  ValidateNested,
} from 'class-validator';
import { ReserveInventoryRequest } from 'src/protos/product.pb';

export class ReserveStockDto implements ReserveInventoryRequest {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ReserveStockItemDto)
  items: ReserveStockItemDto[];
}

class ReserveStockItemDto {
  @IsString()
  @IsNotEmpty()
  productId: string;

  @IsNumber()
  @IsNotEmpty()
  quantity: number;
}
